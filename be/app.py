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
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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

# Initialize Whisper model globally (if available)
whisper_model = None
if WHISPER_AVAILABLE:
    try:
        whisper_model = whisper.load_model("base")
    except Exception as e:
        print(f"Warning: Could not initialize Whisper model: {e}")

class OSINTRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None

class GeolocationResponse(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place: Optional[str] = None
    confidence: Optional[float] = None
    status: str

class AudioAnalysisResponse(BaseModel):
    transcription: Optional[str] = None
    pii_score: Optional[float] = None
    detected_entities: Optional[List[str]] = None
    status: str

class OSINTResponse(BaseModel):
    breach_data: Dict[str, Any]
    maigret_results: Dict[str, Any]
    holehe_results: Dict[str, Any]
    summary: Dict[str, Any]
    risk_score: float
    risk_label: str
    geolocation: Optional[Dict[str, Any]] = None
    audio_analysis: Optional[Dict[str, Any]] = None

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

# ============= Audio Processing with Whisper & Nyckel PII Detection =============
async def process_audio_for_pii(file_content: bytes) -> Dict[str, Any]:
    """
    Process audio file: transcribe with Whisper, analyze PII with Nyckel
    Returns: {transcription, pii_score, detected_entities, status}
    """
    try:
        if not WHISPER_AVAILABLE or whisper_model is None:
            return {
                "status": "error",
                "message": "Whisper not available. Install with: pip install openai-whisper"
            }

        # Save audio to temporary file for Whisper
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name

        try:
            # Transcribe audio with Whisper
            result = whisper_model.transcribe(tmp_path)
            transcription = result.get('text', '')

            if not transcription:
                return {
                    "status": "error",
                    "message": "Could not transcribe audio"
                }

            # Analyze PII using Nyckel API
            pii_score = 0.0
            detected_entities = []

            try:
                pii_result = await analyze_pii_with_nyckel(transcription)
                pii_score = pii_result.get('score', 0.0)
                detected_entities = pii_result.get('entities', [])
            except Exception as e:
                print(f"Warning: Nyckel PII analysis failed: {str(e)}")
                # Continue without PII analysis rather than failing completely
                pii_result = await analyze_pii_simple(transcription)
                pii_score = pii_result.get('score', 0.0)
                detected_entities = pii_result.get('entities', [])

            return {
                "status": "success",
                "transcription": transcription,
                "pii_score": pii_score,
                "detected_entities": detected_entities
            }
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except Exception as e:
        import traceback
        print(f"DEBUG: Error in audio processing: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": f"Audio processing error: {str(e)}"
        }

async def analyze_pii_with_nyckel(text: str) -> Dict[str, Any]:
    """
    Analyze text for PII using Nyckel API
    Requires NYCKEL_API_KEY environment variable
    """
    api_key = os.getenv('NYCKEL_API_KEY')
    if not api_key:
        raise Exception("NYCKEL_API_KEY not set")

    try:
        # Nyckel API endpoint for PII detection
        url = "https://api.nyckel.com/v1/functions/pl0ygn66-pii-detection/invoke"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "data": text
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()

                    # Extract PII score from Nyckel response
                    # Nyckel returns a confidence score for PII detection
                    pii_score = data.get('confidence', 0.0)

                    # Parse detected PII entities if available
                    detected_entities = []
                    if 'data' in data and isinstance(data['data'], dict):
                        for entity_type, entities in data['data'].items():
                            if entities:
                                detected_entities.append(f"{entity_type}")

                    return {
                        "score": pii_score,
                        "entities": detected_entities
                    }
                else:
                    error_msg = await response.text()
                    raise Exception(f"Nyckel API error: {response.status} - {error_msg}")
    except Exception as e:
        print(f"Nyckel API error: {str(e)}")
        raise

async def analyze_pii_simple(text: str) -> Dict[str, Any]:
    """
    Simple PII detection fallback when Nyckel is unavailable
    Uses pattern matching for common PII
    """
    import re

    pii_patterns = {
        'emails': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phones': r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b',
        'credit_cards': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'dates': r'\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12][0-9]|3[01])[/-](?:\d{4}|\d{2})\b'
    }

    detected_entities = []
    entity_count = 0

    for entity_type, pattern in pii_patterns.items():
        matches = re.findall(pattern, text)
        if matches:
            detected_entities.append(entity_type)
            entity_count += len(matches) if isinstance(matches[0], str) and not isinstance(matches[0], tuple) else len(matches)

    # Calculate simple PII score (0-1) based on detected entities
    max_entities = 10
    pii_score = min(entity_count / max_entities, 1.0)

    return {
        "score": pii_score,
        "entities": detected_entities
    }

# ============= Risk Score Calculation =============
def calculate_risk_score(
    breach_count: int,
    username_platforms: int,
    pii_score: float = 0.0,
    geolocation_confidence: float = 0.0
) -> tuple[float, str]:
    """
    Calculate risk score (0-100) based on various factors:
    - Email breaches: 1-10: +10, 11-30: +15, 30+: +50
    - Username reuse: 1-10: +5, 11-20: +15, 20+: +40
    - PII score: normalized (0-10 points)
    - Geolocation confidence: normalized (0-10 points)

    Returns: (risk_score, risk_label)
    """
    total_score = 0.0

    # Breach risk scoring (max 50 points)
    if breach_count >= 30:
        total_score += 50
    elif breach_count >= 11:
        total_score += 15
    elif breach_count >= 1:
        total_score += 10

    # Username reuse risk scoring (max 40 points)
    if username_platforms >= 20:
        total_score += 40
    elif username_platforms >= 11:
        total_score += 15
    elif username_platforms >= 1:
        total_score += 5

    # PII detection risk (max 10 points)
    pii_points = min(pii_score * 10, 10.0)
    total_score += pii_points

    # Geolocation confidence bonus (max 10 points) - higher confidence = more risk (more data exposed)
    geo_points = min(geolocation_confidence * 10, 10.0)
    total_score += geo_points

    # Ensure score is between 0-100
    total_score = min(max(total_score, 0.0), 100.0)

    # Determine risk label
    if total_score >= 80:
        risk_label = "CRITICAL"
    elif total_score >= 60:
        risk_label = "HIGH"
    elif total_score >= 40:
        risk_label = "MEDIUM"
    elif total_score >= 20:
        risk_label = "LOW"
    else:
        risk_label = "MINIMAL"

    return total_score, risk_label

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

    # Extract metrics
    breach_count = breach_data.get("count", 0) if isinstance(breach_data, dict) else 0
    maigret_platforms = len([k for k, v in maigret_results.items() if isinstance(v, dict) and v.get("found")])

    # Calculate risk score
    risk_score, risk_label = calculate_risk_score(
        breach_count=breach_count,
        username_platforms=maigret_platforms,
        pii_score=0.0,
        geolocation_confidence=0.0
    )

    summary = {
        "email": request.email,
        "username": request.username,
        "hibp_breaches": breach_count,
        "maigret_platforms_found": maigret_platforms,
        "holehe_platforms_registered": len([k for k, v in holehe_results.items() if v is True]),
        "scan_status": "completed"
    }

    return OSINTResponse(
        breach_data=breach_data,
        maigret_results=maigret_results,
        holehe_results=holehe_results,
        summary=summary,
        risk_score=risk_score,
        risk_label=risk_label,
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

@app.post("/osint/scan-with-media")
async def osint_scan_with_media(
    email: Optional[str] = Form(None),
    username: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    """
    Combined endpoint: OSINT scan + Image geolocation + Audio transcription & PII analysis
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

    # Process audio if provided
    audio_analysis = None
    if audio and audio.filename:
        file_content = await audio.read()
        # Verify it's an audio file by checking content type
        if audio.content_type and "audio" in audio.content_type:
            audio_analysis = await process_audio_for_pii(file_content)
        else:
            audio_analysis = {
                "status": "error",
                "message": "File must be an audio file (audio/mp3, audio/wav, etc.)"
            }

    summary = {
        "email": email,
        "username": username,
        "hibp_breaches": breach_data.get("count", 0) if isinstance(breach_data, dict) else 0,
        "maigret_platforms_found": len([k for k, v in maigret_results.items() if isinstance(v, dict) and v.get("found")]),
        "holehe_platforms_registered": len([k for k, v in holehe_results.items() if v is True]),
        "scan_status": "completed",
        "image_processed": geolocation is not None,
        "audio_processed": audio_analysis is not None
    }

    return OSINTResponse(
        breach_data=breach_data,
        maigret_results=maigret_results,
        holehe_results=holehe_results,
        summary=summary,
        geolocation=geolocation,
        audio_analysis=audio_analysis
    )

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "OSINT Scanner API with Geolocation & Audio Processing",
        "tools": {
            "xposedornot": "Email Breach Detection",
            "maigret": "Username OSINT",
            "holehe": "Email Registration Check",
            "geoclip": "Image Geolocation" if GEOCLIP_AVAILABLE else "Not Available",
            "whisper": "Audio Transcription" if WHISPER_AVAILABLE else "Not Available",
            "nyckel": "PII Detection"
        }
    }

@app.get("/")
def root():
    return {
        "message": "OSINT Scanner API with Geolocation & Audio Processing",
        "endpoints": {
            "post /osint/scan": "Perform OSINT scan (email/username)",
            "post /geolocation/analyze": "Analyze image for geolocation",
            "post /osint/scan-with-media": "Combined OSINT + Geolocation + Audio scan",
            "get /health": "Health check"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
