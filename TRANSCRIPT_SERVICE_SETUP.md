# Transcript Service Setup Guide

## Problem Solved

The original `youtube-transcript` npm package (v1.2.1) hasn't been updated in 2+ years and frequently fails to fetch transcripts. This Python microservice provides a reliable alternative using the actively maintained `youtube-transcript-api` package.

## Architecture

```
User → Next.js App → Python Transcript Service → YouTube
                ↓
          AI Analysis
```

The Next.js API route at `/api/transcript` now calls the Python service instead of using the outdated npm package.

---

## Local Development Setup

### Step 1: Install Python Dependencies

```bash
# Navigate to transcript service directory
cd transcript-service

# Install Python dependencies
pip install -r requirements.txt
```

**Requirements:**
- Python 3.9 or higher
- pip (Python package manager)

### Step 2: Start the Transcript Service

```bash
# Run the service
python app.py
```

The service will start on `http://localhost:5001`

You should see:
```
 * Running on http://0.0.0.0:5001
 * Debug mode: on
```

### Step 3: Verify Service is Running

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "youtube-transcript-service"
}
```

### Step 4: Start Next.js Development Server

In the main project directory:

```bash
npm run dev
```

The Next.js app will run on `http://localhost:3005` and automatically connect to the transcript service.

---

## Docker Setup (Recommended for Production)

### Option 1: Docker Compose (Easiest)

Run just the transcript service:

```bash
# From project root
docker-compose up transcript-service
```

Or run both services together (uncomment nextjs-app in docker-compose.yml first):

```bash
docker-compose up
```

### Option 2: Manual Docker Build

```bash
# Build the image
cd transcript-service
docker build -t youtube-transcript-service .

# Run the container
docker run -p 5001:5001 youtube-transcript-service
```

---

## Production Deployment

### Option 1: Vercel + Railway (Recommended)

**Deploy Python Service to Railway:**

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `transcript-service`
5. Railway will auto-detect Python and deploy
6. Copy the provided URL (e.g., `https://your-service.railway.app`)

**Update Next.js Environment Variables:**

In Vercel dashboard, add:
```
TRANSCRIPT_SERVICE_URL=https://your-service.railway.app
```

**Deploy Next.js to Vercel:**
- Follow normal Vercel deployment (see HANDOVER.md)

### Option 2: Render

1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Root directory: `transcript-service`
5. Build command: `pip install -r requirements.txt`
6. Start command: `gunicorn --bind 0.0.0.0:$PORT --workers 4 app:app`
7. Deploy and copy URL

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Navigate to service
cd transcript-service

# Create fly.toml (interactive)
fly launch

# Deploy
fly deploy
```

---

## Environment Variables

### For Next.js (.env.local)

Add this variable:

```env
# Transcript Service URL
# Local development: http://localhost:5001
# Production: Your deployed service URL
TRANSCRIPT_SERVICE_URL=http://localhost:5001
```

### For Python Service

No environment variables needed! The service works out of the box.

---

## Testing the Integration

### Test 1: Health Check

```bash
curl http://localhost:5001/health
```

Expected:
```json
{"status": "healthy", "service": "youtube-transcript-service"}
```

### Test 2: Fetch Transcript

```bash
curl -X POST http://localhost:5001/transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Expected: JSON response with transcript data

### Test 3: Full Integration

1. Start Python service: `python transcript-service/app.py`
2. Start Next.js: `npm run dev`
3. Open `http://localhost:3005`
4. Paste a YouTube URL
5. Click "Analyze"
6. Check that transcript is fetched successfully

---

## Troubleshooting

### Service won't start

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
pip install -r requirements.txt
```

**Error:** `Address already in use (port 5001)`

**Solution:**
```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or change port in app.py
```

### Next.js can't connect to service

**Error:** `ECONNREFUSED` in Next.js logs

**Solution:**
1. Check Python service is running: `curl http://localhost:5001/health`
2. Check firewall isn't blocking port 5001
3. Check TRANSCRIPT_SERVICE_URL in .env.local

### Transcripts still not found

**Possible causes:**
- Video doesn't have captions (expected behavior)
- Video is age-restricted or private
- Rate limiting from YouTube (wait a few minutes)

**Debug:**
```bash
# Check Python service logs for detailed error messages
# They will show the exact reason why transcript failed
```

### Production deployment issues

**Error:** Service times out in production

**Solution:**
- Increase timeout in Next.js route (currently 55 seconds)
- Check service logs for slow responses
- Consider caching frequently requested transcripts

---

## API Reference

### Endpoints

#### GET /health

Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "youtube-transcript-service"
}
```

#### POST /transcript

Fetch transcript for a YouTube video

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "transcript": {
    "segments": [...],
    "fullText": "...",
    "sections": [...],
    "totalDuration": 300000
  }
}
```

**Error Responses:**
- `400` - Invalid URL
- `403` - Transcripts disabled
- `404` - Video unavailable or no transcripts
- `429` - Rate limit exceeded
- `500` - Server error

---

## Performance Considerations

### Response Times

- Average: 2-5 seconds per video
- Long videos (>1 hour): 5-10 seconds
- Cached (future): <1 second

### Scaling

For high traffic:
1. Deploy multiple instances (Railway/Render auto-scale)
2. Add Redis caching layer
3. Use CDN for common videos
4. Implement request queue

### Costs

**Railway Free Tier:**
- $5 free credits/month
- Enough for ~500-1000 transcript fetches

**Railway Pro:**
- Pay per use
- ~$0.000463 per hour
- ~$3-5/month for moderate use

---

## Monitoring

### Check Service Status

```bash
# Local
curl http://localhost:5001/health

# Production (Railway example)
curl https://your-service.railway.app/health
```

### View Logs

**Railway:** Dashboard → Deployments → Logs
**Render:** Dashboard → Logs
**Docker:** `docker logs <container-id>`

### Common Log Messages

✅ Good:
- `Fetching transcript for video: VIDEO_ID`
- `Found English transcript with X segments`
- `Successfully processed transcript`

⚠️ Warning:
- `No transcripts available for VIDEO_ID`
- `Transcripts disabled for video`

❌ Error:
- `Too many requests to YouTube` (rate limited)
- `YouTube request failed` (service issue)

---

## Maintenance

### Update Dependencies

```bash
cd transcript-service
pip install --upgrade youtube-transcript-api flask flask-cors
pip freeze > requirements.txt
```

### Backup Considerations

No database or state - service is stateless.
Nothing to backup!

### Security Updates

Check for updates monthly:
```bash
pip list --outdated
```

---

## Migration Checklist

- [x] Python service created
- [x] Next.js API route updated
- [x] Docker configuration added
- [ ] Test locally with real videos
- [ ] Deploy to Railway/Render
- [ ] Update TRANSCRIPT_SERVICE_URL in Vercel
- [ ] Test production deployment
- [ ] Monitor for errors
- [ ] Remove old `youtube-transcript` npm package (optional)

---

## Rollback Plan

If the Python service doesn't work, you can rollback:

1. Restore original `/src/app/api/transcript/route.ts` from git:
   ```bash
   git checkout HEAD -- src/app/api/transcript/route.ts
   ```

2. Reinstall old package:
   ```bash
   npm install youtube-transcript@1.2.1
   ```

3. Restart Next.js dev server

---

## Support

**Service Issues:**
- Check service logs first
- Verify health endpoint responds
- Check YouTube video has captions

**Integration Issues:**
- Check TRANSCRIPT_SERVICE_URL is correct
- Verify service is accessible from Next.js
- Check for CORS errors in browser console

**Questions:**
- Review this guide
- Check HANDOVER.md for project context
- Check transcript-service/README.md for service details

---

**Last Updated:** November 28, 2024
**Prepared By:** Claude Code
