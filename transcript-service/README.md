# YouTube Transcript Service

A reliable Python microservice for fetching YouTube video transcripts using the official `youtube-transcript-api` package.

## Why This Service?

The Node.js `youtube-transcript` package (v1.2.1) hasn't been updated in 2+ years and frequently fails. This Python service uses the actively maintained `youtube-transcript-api` package for reliable transcript fetching.

## Features

- ✅ Fetches transcripts from YouTube videos
- ✅ Supports multiple languages (English priority, fallback to others)
- ✅ Handles auto-generated and manual captions
- ✅ Formats transcripts into 2-minute sections
- ✅ Graceful error handling with detailed error messages
- ✅ CORS enabled for Next.js API calls
- ✅ Health check endpoint

## Installation

### Local Development

```bash
# Navigate to service directory
cd transcript-service

# Install dependencies
pip install -r requirements.txt

# Run service
python app.py
```

Service will run on `http://localhost:5001`

### Using Docker

```bash
# Build image
docker build -t youtube-transcript-service .

# Run container
docker run -p 5001:5001 youtube-transcript-service
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "youtube-transcript-service"
}
```

### Fetch Transcript
```
POST /transcript
Content-Type: application/json
```

Request body:
```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

Success response (200):
```json
{
  "success": true,
  "transcript": {
    "segments": [
      {
        "text": "Welcome to the video",
        "offset": 0,
        "duration": 2500
      }
    ],
    "fullText": "Welcome to the video...",
    "sections": [
      {
        "startTime": 0,
        "endTime": 120000,
        "title": "Section 1",
        "content": "Welcome to the video...",
        "timestamp": "0:00"
      }
    ],
    "totalDuration": 300000
  }
}
```

Error responses:
- `400` - Invalid URL or missing parameters
- `403` - Transcripts disabled by video owner
- `404` - Video unavailable or no transcripts found
- `429` - Rate limit exceeded
- `502` - YouTube request failed
- `500` - Internal server error

## Integration with Next.js

Update your Next.js API route at `src/app/api/transcript/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const { url } = await request.json();

  // Call Python microservice
  const response = await fetch('http://localhost:5001/transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

## Environment Variables

No environment variables required! The service works out of the box.

## Production Deployment

### Option 1: Vercel + Railway/Render

1. Deploy Python service to Railway or Render
2. Update Next.js API route to call production URL
3. Deploy Next.js app to Vercel as usual

### Option 2: Docker Compose

See `docker-compose.yml` in the root directory.

## Troubleshooting

**Service won't start:**
- Check Python version: `python --version` (need 3.9+)
- Check port 5001 is available: `lsof -i :5001`

**Transcripts not found:**
- Video may not have captions enabled
- Video may be private or age-restricted
- Check service logs for detailed error messages

**Rate limiting:**
- YouTube may temporarily block requests
- Wait a few minutes and try again
- Consider implementing request caching

## License

MIT
