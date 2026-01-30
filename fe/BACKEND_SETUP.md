# Frontend Backend Configuration

## Overview

The OSINT.SCAN frontend needs to connect to a backend API server. This guide explains how to configure the connection for different environments.

## Configuration Methods

### 1. Local Development

For local development with both frontend and backend running on your machine:

```bash
# Terminal 1: Backend
cd be
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
# Backend runs on http://localhost:8000

# Terminal 2: Frontend
cd fe
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

The frontend will automatically use `http://localhost:8000` for API calls in development mode.

### 2. Environment Variables

Create a `.env` file in the `fe/` directory:

```bash
# For local development (this is the default)
VITE_API_URL=http://localhost:8000

# For production with remote backend
VITE_API_URL=https://api.your-domain.com
```

Then restart the dev server:

```bash
npm run dev
```

### 3. Production Deployment

When deploying to production, you have several options:

#### Option A: Backend on Same Domain
If your backend is deployed at `https://your-domain.com/api/`:

```bash
# .env
VITE_API_URL=https://your-domain.com/api
```

#### Option B: Backend on Different Domain
If your backend is deployed at a different domain:

```bash
# .env
VITE_API_URL=https://backend.your-domain.com
```

The backend must have CORS enabled (which it does by default).

#### Option C: Using Relative Path (Same Domain)
If deploying frontend and backend to the same domain:

```bash
# .env
VITE_API_URL=/api
```

Then configure your reverse proxy (nginx/Apache) to:
- Route `/api/*` requests to your backend server
- Route other requests to the frontend

## Error Messages

### "Backend server not reachable"
- Check that the backend is running
- Verify the API URL in `.env` is correct
- Check browser console for CORS errors
- Ensure your firewall allows connections to the backend

### "Failed to fetch"
- Network connection issue
- Backend server is down
- API URL is incorrect
- CORS issue (if backend on different domain)

## Fly.io Deployment Example

If deploying to Fly.io:

1. **Deploy Backend First:**
```bash
cd be
fly deploy
# Note the backend URL: https://your-app-backend.fly.dev
```

2. **Configure Frontend .env:**
```bash
# fe/.env
VITE_API_URL=https://your-app-backend.fly.dev
```

3. **Deploy Frontend:**
```bash
cd fe
fly deploy
```

## Docker Deployment

If using Docker, ensure both services can communicate:

```yaml
# docker-compose.yml
version: '3'
services:
  backend:
    build: ./be
    ports:
      - "8000:8000"
    environment:
      - NYCKEL_API_KEY=your_key_here

  frontend:
    build: ./fe
    ports:
      - "3000:5173"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend
```

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console, the backend needs to have CORS enabled. The backend already has this configured:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Port Already in Use
If port 8000 is already in use:

```bash
# Use a different port
python app.py --port 8001

# Then update frontend:
# VITE_API_URL=http://localhost:8001
```

### Environment Variable Not Being Read
Make sure:
1. The `.env` file is in the `fe/` directory (not the root)
2. Variable names start with `VITE_` (required by Vite)
3. You restart the dev server after changing `.env`
4. You're using the correct syntax: `VITE_API_URL=...`

## Testing the Connection

Open your browser console (F12) and run:

```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

If it returns health status, the backend is running and reachable.

## Quick Reference

| Environment | API URL | Setup |
|------------|---------|-------|
| Local Dev | http://localhost:8000 | Default, no config needed |
| Remote Backend | https://api.example.com | Set VITE_API_URL in .env |
| Same Domain | /api | Set VITE_API_URL=/api |
| Fly.io | https://app.fly.dev | Set VITE_API_URL to backend URL |
