# OSINT Scanner Backend - Setup Instructions

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation

### 1. Create and activate virtual environment

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup environment variables

Create a `.env` file in the backend directory with:

```
NYCKEL_API_KEY=om45og5bjqi8yl7244d58736wm7cbo3tbr3w1cn4qh6f4lfhecittbwhjy928tzu
```

### 4. Install system dependencies (for GeoCLIP and Maigret)

#### For Maigret and Holehe:
These are Python packages that are installed via pip, but they may require additional system dependencies:

- **Maigret**: Requires requests library (included in requirements.txt)
- **Holehe**: Requires requests library (included in requirements.txt)

#### For GeoCLIP:
GeoCLIP requires torch and other deep learning dependencies. If you encounter issues:

```bash
# Install torch separately (if having issues with auto-install)
pip install torch torchvision torchaudio

# Then install geoclip
pip install geoclip
```

#### For Whisper (Audio Transcription):
Whisper requires ffmpeg:

- **Windows**: Install via [ffmpeg.org](https://ffmpeg.org/download.html) or `choco install ffmpeg`
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

### 5. Run the server

```bash
python app.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Basic OSINT Scan
**POST** `/osint/scan`

Request body:
```json
{
  "email": "target@example.com",
  "username": "targetusername"
}
```

Returns:
- Breach data from XposedOrNot
- Results from Maigret (username OSINT)
- Results from Holehe (email registration check)
- Summary statistics

### 2. OSINT Scan with Media
**POST** `/osint/scan-with-media`

Form data:
- `email` (optional): Target email address
- `username` (optional): Target username
- `image` (optional): Image file for geolocation analysis
- `audio` (optional): Audio file for transcription and PII detection

Returns:
- All OSINT results (Maigret, Holehe, XposedOrNot)
- Geolocation data from GeoCLIP (if image provided)
- Audio transcription and PII score (if audio provided)

### 3. Image Geolocation
**POST** `/geolocation/analyze`

Form data:
- `file`: Image file

Returns:
```json
{
  "latitude": float,
  "longitude": float,
  "place": string,
  "confidence": float (0-1),
  "status": "success" | "error"
}
```

### 4. Health Check
**GET** `/health`

Returns status of all available tools and services.

## Tools Integrated

1. **Maigret** - Username reconnaissance across multiple platforms
2. **Holehe** - Email address registration verification
3. **XposedOrNot** - Data breach lookup API
4. **GeoCLIP** - Image geolocation analysis
5. **Whisper** - Audio transcription
6. **Nyckel** - PII detection in text

## Troubleshooting

### GeoCLIP Model Download
The first time GeoCLIP runs, it will download a large model (~500MB). Be patient on first run.

### Whisper Model Download
The first time Whisper runs, it will download the base model (~140MB). Be patient on first run.

### Rate Limiting
- XposedOrNot API has rate limits. The code includes a 1-second delay between requests.
- If you hit rate limits, wait a few seconds before retrying.

### Missing Dependencies
If you get import errors, try reinstalling requirements:

```bash
pip install --upgrade --force-reinstall -r requirements.txt
```

## Frontend Integration

The frontend expects the backend to run on `http://localhost:8000`. Make sure:

1. Backend is running on port 8000
2. CORS is properly configured (it is in the code)
3. All environment variables are set

## Notes

- All tools are designed for educational and authorized security research only
- Respect rate limits and API terms of service
- Ensure you have authorization before scanning any targets
