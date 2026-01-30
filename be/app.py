# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import aiohttp
# import asyncio
# import subprocess
# import json
# import requests
# from typing import Optional, Dict, Any
# import re

# app = FastAPI(title="OSINT Scanner API")

# # Enable CORS for frontend communication
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class OSINTRequest(BaseModel):
#     email: Optional[str] = None
#     username: Optional[str] = None

# class OSINTResponse(BaseModel):
#     breach_data: Dict[str, Any]
#     maigret_results: Dict[str, Any]
#     holehe_results: Dict[str, Any]
#     summary: Dict[str, Any]

# # ============= HIBP API Functions =============
# async def check_hibp_breaches(email: str) -> Dict[str, Any]:
#     """
#     Check Have I Been Pwned for email breaches
#     Note: Using public API (no key required but rate limited)
#     """
#     try:
#         headers = {
#             'User-Agent': 'OSINT-Scanner'
#         }
#         url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
        
#         async with aiohttp.ClientSession() as session:
#             async with session.get(url, headers=headers) as response:
#                 if response.status == 200:
#                     breaches = await response.json()
#                     return {
#                         "status": "breached",
#                         "count": len(breaches),
#                         "breaches": [
#                             {
#                                 "name": b.get("Name"),
#                                 "domain": b.get("Domain"),
#                                 "date": b.get("BreachDate"),
#                                 "data_classes": b.get("DataClasses", [])
#                             }
#                             for b in breaches
#                         ]
#                     }
#                 elif response.status == 404:
#                     return {"status": "clean", "count": 0, "breaches": []}
#                 else:
#                     return {"status": "error", "message": f"API returned {response.status}"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# # ============= Maigret Functions =============
# def run_maigret(username: str) -> Dict[str, Any]:
#     """
#     Run Maigret to search for username across social media
#     Make sure Maigret is installed: pip install maigret
#     """
#     try:
#         # Run maigret command and capture output
#         result = subprocess.run(
#             ["maigret", username, "-f", "json"],
#             capture_output=True,
#             text=True,
#             timeout=60
#         )
        
#         if result.returncode == 0:
#             # Parse JSON output
#             lines = result.stdout.strip().split('\n')
#             output_data = {}
            
#             for line in lines:
#                 try:
#                     data = json.loads(line)
#                     for site, site_data in data.items():
#                         if site_data.get("found"):
#                             output_data[site] = {
#                                 "found": True,
#                                 "url": site_data.get("url_user"),
#                                 "username": username
#                             }
#                         else:
#                             output_data[site] = {
#                                 "found": False,
#                                 "errors": site_data.get("errors", [])
#                             }
#                 except json.JSONDecodeError:
#                     continue
            
#             return output_data if output_data else {"status": "no_results"}
#         else:
#             return {"status": "error", "message": result.stderr}
    
#     except subprocess.TimeoutExpired:
#         return {"status": "timeout", "message": "Maigret scan timed out"}
#     except FileNotFoundError:
#         return {"status": "not_installed", "message": "Maigret not found. Install with: pip install maigret"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# # ============= Holehe Functions =============
# def run_holehe(email: str) -> Dict[str, Any]:
#     """
#     Run Holehe to check email across social platforms
#     Make sure Holehe is installed: pip install holehe
#     """
#     try:
#         # Run holehe command
#         result = subprocess.run(
#             ["holehe", email],
#             capture_output=True,
#             text=True,
#             timeout=60
#         )
        
#         output_data = {}
        
#         if result.returncode == 0:
#             # Parse holehe output (it's not JSON by default, so parse text)
#             lines = result.stdout.strip().split('\n')
            
#             for line in lines:
#                 # Look for lines with platform names and status
#                 if "found" in line.lower() or "registered" in line.lower() or "✓" in line:
#                     # Extract platform name and status
#                     parts = line.split(':')
#                     if len(parts) >= 2:
#                         platform = parts[0].strip()
#                         status = "found" in line.lower() or "registered" in line.lower()
#                         output_data[platform] = status
            
#             return output_data if output_data else {"status": "no_results"}
#         else:
#             return {"status": "error", "message": result.stderr}
    
#     except subprocess.TimeoutExpired:
#         return {"status": "timeout", "message": "Holehe scan timed out"}
#     except FileNotFoundError:
#         return {"status": "not_installed", "message": "Holehe not found. Install with: pip install holehe"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# # ============= Main Endpoint =============
# @app.post("/osint/scan", response_model=OSINTResponse)
# async def osint_scan(request: OSINTRequest):
#     """
#     Perform OSINT scan using Maigret, Holehe, and HIBP
#     """
    
#     if not request.email and not request.username:
#         raise HTTPException(status_code=400, detail="Email or username required")
    
#     breach_data = {}
#     maigret_results = {}
#     holehe_results = {}
#     summary = {
#         "email": request.email,
#         "username": request.username,
#         "scan_status": "completed"
#     }
    
#     # Check HIBP for email breaches
#     if request.email:
#         breach_data = await check_hibp_breaches(request.email)
#         summary["hibp_breaches"] = breach_data.get("count", 0)
    
#     # Run Maigret for username
#     if request.username:
#         maigret_results = run_maigret(request.username)
#         found_platforms = sum(1 for v in maigret_results.values() if isinstance(v, dict) and v.get("found"))
#         summary["maigret_platforms_found"] = found_platforms
    
#     # Run Holehe for email
#     if request.email:
#         holehe_results = run_holehe(request.email)
#         registered_platforms = sum(1 for v in holehe_results.values() if v is True)
#         summary["holehe_platforms_registered"] = registered_platforms
    
#     return OSINTResponse(
#         breach_data=breach_data,
#         maigret_results=maigret_results,
#         holehe_results=holehe_results,
#         summary=summary
#     )

# # Health check endpoint
# @app.get("/health")
# def health_check():
#     return {
#         "status": "healthy",
#         "message": "OSINT Scanner API is running",
#         "tools": {
#             "hibp": "Have I Been Pwned",
#             "maigret": "Username OSINT",
#             "holehe": "Email OSINT"
#         }
#     }

# @app.get("/")
# def root():
#     return {
#         "message": "OSINT Scanner API",
#         "endpoints": {
#             "post": "/osint/scan - Perform OSINT scan",
#             "get": "/health - Health check"
#         }
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)






from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiohttp
import asyncio
import subprocess
import json
import time
from typing import Optional, Dict, Any

app = FastAPI(title="OSINT Scanner API - Stable Build")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OSINTRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None

class OSINTResponse(BaseModel):
    breach_data: Dict[str, Any]
    maigret_results: Dict[str, Any]
    holehe_results: Dict[str, Any]
    summary: Dict[str, Any]

# ============= XposedOrNot API with Rate Limit Protection =============
async def check_breach_data(email: str) -> Dict[str, Any]:
    """
    Check XposedOrNot for email breaches with built-in delay 
    to respect the 2 requests per second limit.
    """
    # Small 1-second delay to ensure we don't spam the API
    await asyncio.sleep(1) 
    
    url = f"https://api.xposedornot.com/v1/check-email/{email}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # Extract the list of breach names
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
        result = subprocess.run(["maigret", username, "-f", "json"], capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            output_data = {}
            for line in lines:
                try:
                    data = json.loads(line)
                    for site, site_data in data.items():
                        if site_data.get("found"):
                            output_data[site] = {"found": True, "url": site_data.get("url_user")}
                except: continue
            return output_data if output_data else {"status": "no_results"}
        return {"status": "error", "message": result.stderr}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_holehe(email: str) -> Dict[str, Any]:
    try:
        # Running local tool
        result = subprocess.run(["holehe", email], capture_output=True, text=True, timeout=60)
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

# ============= Main Endpoint =============
@app.post("/osint/scan", response_model=OSINTResponse)
async def osint_scan(request: OSINTRequest):
    if not request.email and not request.username:
        raise HTTPException(status_code=400, detail="Email or username required")
    
    # 1. Start Maigret (Username search usually takes the longest)
    maigret_results = run_maigret(request.username) if request.username else {}
    
    # 2. Start Holehe (Email registration check)
    holehe_results = run_holehe(request.email) if request.email else {}
    
    # 3. Finally check Breach Data (XposedOrNot) with its internal delay
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
        summary=summary
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)