from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiohttp
import asyncio
import subprocess
import json
import time
from typing import Optional, Dict, Any, List
from PIL import Image
import io
import base64
import os
import tempfile

# Try to import Whisper for audio transcription
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("Warning: Whisper not installed. Install with: pip install openai-whisper")

# Try to import GeoCLIP, if not available, handle gracefully
try:
    from geoclip import GeoCLIP
    GEOCLIP_AVAILABLE = True
except ImportError:
    GEOCLIP_AVAILABLE = False
    print("Warning: GeoCLIP not installed. Install with: pip install geoclip")

app = FastAPI(title="OSINT Scanner API with Geolocation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GeoCLIP model globally (if available)
geoclip_model = None
if GEOCLIP_AVAILABLE:
    try:
        geoclip_model = GeoCLIP()
    except Exception as e:
        print(f"Warning: Could not initialize GeoCLIP model: {e}")

class OSINTRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None

class GeolocationResponse(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place: Optional[str] = None
    confidence: Optional[float] = None
    status: str

class OSINTResponse(BaseModel):
    breach_data: Dict[str, Any]
    maigret_results: Dict[str, Any]
    holehe_results: Dict[str, Any]
    summary: Dict[str, Any]
    geolocation: Optional[Dict[str, Any]] = None

# ============= GeoCLIP Geolocation Function =============
async def process_image_geolocation(file_content: bytes) -> Dict[str, Any]:
    """
    Process image and extract geolocation data using GeoCLIP
    Returns: {latitude, longitude, place, confidence, status}
    """
    try:
        if not GEOCLIP_AVAILABLE or geoclip_model is None:
            return {
                "status": "error",
                "message": "GeoCLIP not available. Install with: pip install geoclip"
            }
        
        # Debug: check what we received
        print(f"DEBUG: file_content type = {type(file_content)}")
        print(f"DEBUG: file_content is Image? {isinstance(file_content, Image.Image)}")
        
        # If it's already a PIL Image, don't open it again
        if isinstance(file_content, Image.Image):
            image = file_content
        elif isinstance(file_content, bytes):
            # Open image from bytes
            image = Image.open(io.BytesIO(file_content))
        else:
            return {
                "status": "error",
                "message": f"Invalid input type: {type(file_content)}"
            }
        
        # Convert to RGB if necessary (remove alpha channel for compatibility)
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Run GeoCLIP prediction with top_k parameter
        prediction = geoclip_model.predict(image, top_k=1)
        
        # Extract results - GeoCLIP returns a list of predictions
        if prediction and len(prediction) > 0:
            # Get the top result
            top_result = prediction[0] if isinstance(prediction, list) else prediction
            
            # GeoCLIP returns: {location: str, latitude: float, longitude: float, confidence: float}
            latitude = top_result.get('latitude') if isinstance(top_result, dict) else None
            longitude = top_result.get('longitude') if isinstance(top_result, dict) else None
            place = top_result.get('location') if isinstance(top_result, dict) else top_result.get('place')
            confidence = top_result.get('confidence') if isinstance(top_result, dict) else 0.0
            
            return {
                "status": "success",
                "latitude": float(latitude) if latitude else None,
                "longitude": float(longitude) if longitude else None,
                "place": str(place) if place else "Unknown",
                "confidence": float(confidence) if confidence else 0.0
            }
        else:
            return {
                "status": "error",
                "message": "Could not extract geolocation from image"
            }
            
    except Exception as e:
        import traceback
        print(f"DEBUG: Error in geolocation: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": f"Image processing error: {str(e)}"
        }

# ============= XposedOrNot API with Rate Limit Protection =============
async def check_breach_data(email: str) -> Dict[str, Any]:
    """
    Check XposedOrNot for email breaches with built-in delay
    """
    await asyncio.sleep(1)
    url = f"https://api.xposedornot.com/v1/check-email/{email}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    breach_list = data.get("breaches", [[]])[0]
                    return {
                        "status": "breached",
                        "count": len(breach_list),
                        "breaches": [{"name": b, "source": "XposedOrNot"} for b in breach_list]
                    }
                elif response.status == 404:
                    return {"status": "clean", "count": 0, "breaches": []}
                elif response.status == 429:
                    return {"status": "error", "message": "Rate limit hit. Please wait a moment."}
                else:
                    return {"status": "error", "message": f"API Error: {response.status}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ============= Local OSINT Tools =============
def run_maigret(username: str) -> Dict[str, Any]:
    try:
        result = subprocess.run(
            ["maigret", username, "-f", "json"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            output_data = {}
            for line in lines:
                try:
                    data = json.loads(line)
                    for site, site_data in data.items():
                        if site_data.get("found"):
                            output_data[site] = {"found": True, "url": site_data.get("url_user")}
                except:
                    continue
            return output_data if output_data else {"status": "no_results"}
        return {"status": "error", "message": result.stderr}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_holehe(email: str) -> Dict[str, Any]:
    try:
        result = subprocess.run(
            ["holehe", email],
            capture_output=True,
            text=True,
            timeout=60
        )
        output_data = {}
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if any(x in line.lower() for x in ["found", "registered", "✓"]):
                    parts = line.split(':')
                    if len(parts) >= 2:
                        output_data[parts[0].strip()] = True
            return output_data if output_data else {"status": "no_results"}
        return {"status": "error", "message": result.stderr}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ============= Main Endpoints =============
@app.post("/osint/scan", response_model=OSINTResponse)
async def osint_scan(request: OSINTRequest):
    """
    Perform OSINT scan using Maigret, Holehe, and XposedOrNot
    """
    if not request.email and not request.username:
        raise HTTPException(status_code=400, detail="Email or username required")
    
    # Run scans
    maigret_results = run_maigret(request.username) if request.username else {}
    holehe_results = run_holehe(request.email) if request.email else {}
    breach_data = await check_breach_data(request.email) if request.email else {}
    
    summary = {
        "email": request.email,
        "username": request.username,
        "hibp_breaches": breach_data.get("count", 0) if isinstance(breach_data, dict) else 0,
        "maigret_platforms_found": len([k for k, v in maigret_results.items() if isinstance(v, dict) and v.get("found")]),
        "holehe_platforms_registered": len([k for k, v in holehe_results.items() if v is True]),
        "scan_status": "completed"
    }
    
    return OSINTResponse(
        breach_data=breach_data,
        maigret_results=maigret_results,
        holehe_results=holehe_results,
        summary=summary,
        geolocation=None
    )

@app.post("/geolocation/analyze")
async def analyze_geolocation(file: UploadFile = File(...)):
    """
    Upload image and extract geolocation data using GeoCLIP
    Returns: {latitude, longitude, place, confidence, status}
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Validate file is an image
        if not file.content_type or "image" not in file.content_type:
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Process geolocation
        geo_result = await process_image_geolocation(file_content)
        
        return {
            "filename": file.filename,
            "file_size": len(file_content),
            "geolocation": geo_result
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/osint/scan-with-image")
async def osint_scan_with_image(
    email: Optional[str] = Form(None),
    username: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Combined endpoint: OSINT scan + Image geolocation
    """
    if not email and not username:
        raise HTTPException(status_code=400, detail="Email or username required")
    
    # Run OSINT scans
    maigret_results = run_maigret(username) if username else {}
    holehe_results = run_holehe(email) if email else {}
    breach_data = await check_breach_data(email) if email else {}
    
    # Process image if provided
    geolocation = None
    if image and image.filename:
        file_content = await image.read()
        # Verify it's an image by checking content type
        if image.content_type and "image" in image.content_type:
            geolocation = await process_image_geolocation(file_content)
        else:
            geolocation = {
                "status": "error",
                "message": "File must be an image (image/jpeg, image/png, etc.)"
            }
    
    summary = {
        "email": email,
        "username": username,
        "hibp_breaches": breach_data.get("count", 0) if isinstance(breach_data, dict) else 0,
        "maigret_platforms_found": len([k for k, v in maigret_results.items() if isinstance(v, dict) and v.get("found")]),
        "holehe_platforms_registered": len([k for k, v in holehe_results.items() if v is True]),
        "scan_status": "completed",
        "image_processed": geolocation is not None
    }
    
    return OSINTResponse(
        breach_data=breach_data,
        maigret_results=maigret_results,
        holehe_results=holehe_results,
        summary=summary,
        geolocation=geolocation
    )

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "OSINT Scanner API with Geolocation is running",
        "tools": {
            "xposedornot": "Email Breach Detection",
            "maigret": "Username OSINT",
            "holehe": "Email Registration Check",
            "geoclip": "Image Geolocation" if GEOCLIP_AVAILABLE else "Not Available"
        }
    }

@app.get("/")
def root():
    return {
        "message": "OSINT Scanner API with Geolocation",
        "endpoints": {
            "post /osint/scan": "Perform OSINT scan (email/username)",
            "post /geolocation/analyze": "Analyze image for geolocation",
            "post /osint/scan-with-image": "Combined OSINT + Geolocation scan",
            "get /health": "Health check"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
