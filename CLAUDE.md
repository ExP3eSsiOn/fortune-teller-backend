# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Node.js/Express backend API for a fortune-telling feature that uses OpenAI's GPT-4o-mini to analyze phone numbers and predict lucky lottery numbers. The API is designed to be consumed by a frontend landing page and integrates with Facebook Conversions API for lead tracking.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload via nodemon)
npm run dev

# Run in production mode
npm start
```

## Environment Configuration

The application requires environment variables to be set. Copy `.env` and configure:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3000
ALLOWED_ORIGINS=*
NODE_ENV=production
```

**Critical**: The OpenAI library expects the environment variable to be named exactly `OPENAI_API_KEY` (case-sensitive). On deployment platforms like Railway, verify this exact name is used.

## Architecture

### Single-File Architecture

The entire backend is contained in `server.js` (~170 lines). This is intentional for simplicity and ease of deployment.

### Key Components

1. **OpenAI Integration** (lines 11-14, 85-121)
   - Uses `gpt-4o-mini` model for cost efficiency (~$0.000075 per request)
   - Configured with `temperature: 0.8` for creative fortune-telling responses
   - Uses `response_format: { type: "json_object" }` to ensure structured JSON output
   - System prompt (lines 90-111) instructs the AI to analyze phone numbers and return fortune predictions with lucky lottery numbers

2. **Security Middleware** (lines 16-42)
   - **Helmet**: Currently disabled for local development (lines 17-21). Re-enable for production with CORS-compatible settings
   - **CORS**: Set to allow all origins (`*`) for development. Update `ALLOWED_ORIGINS` env var for production
   - **Rate Limiting**: 5 requests per minute per IP address to prevent abuse and control OpenAI costs
   - **Input Validation**: Thai phone number regex `/^0\d{9}$/` (10 digits starting with 0)

3. **API Endpoints**
   - `GET /` - Root endpoint with API information
   - `GET /health` - Health check endpoint
   - `OPTIONS /api/fortune` - CORS preflight handler
   - `POST /api/fortune` - Main fortune-telling endpoint

### Request/Response Flow

1. Frontend sends POST to `/api/fortune` with `{ phoneNumber: "0812345678" }`
2. Server validates phone number format
3. Server calls OpenAI API with Thai language system prompt
4. OpenAI returns JSON with fortune reading and lucky numbers
5. Server parses JSON and returns structured response:
   ```json
   {
     "success": true,
     "phoneNumber": "0812345678",
     "fortune": "เบอร์โทรของคุณมีพลังงานที่ดีมาก...",
     "luckyNumbers": {
       "twoDigit": "23",
       "threeDigit": "789",
       "threeDigitTop": "456"
     }
   }
   ```

## Deployment Considerations

### Environment Variable Issues

If deployment crashes with "OPENAI API KEY environment variable is missing or empty":

1. Verify the environment variable is named exactly `OPENAI_API_KEY` (not `OPENAI_KEY` or `OPENAI_API_KEY_SECRET`)
2. Check the value is not empty or contains only whitespace
3. On Railway/Render: Check the variable is set in the service's environment (not global)
4. Redeploy after verifying/updating the variable

### CORS Configuration

For production deployment:
- Set `ALLOWED_ORIGINS` to specific frontend domain(s)
- Example: `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- The current `*` configuration is only suitable for development

### Helmet Configuration

The Helmet middleware is currently disabled (lines 17-21). For production:

```javascript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
```

## Cost Management

The application uses GPT-4o-mini to minimize costs:
- ~$0.000075 per request (~0.0027 บาท)
- Rate limiting (5 req/min) provides basic cost protection
- Monitor usage at https://platform.openai.com/usage
- Set spending limits in OpenAI dashboard

## Common Issues

### Local Development CORS Errors

If testing frontend locally with `file://` protocol:
- Use a local HTTP server: `python3 -m http.server 8080`
- Or use VS Code Live Server extension
- Never serve HTML from `file://` when testing API calls

### OpenAI API Errors

- **401 Unauthorized**: Check API key validity and credits
- **429 Rate Limited**: OpenAI has tier-based rate limits; wait or upgrade plan
- **500 Internal Server Error**: Check logs for OpenAI API errors or malformed responses

## Testing

Test the deployed API:

```bash
# Health check
curl https://your-domain.com/health

# Fortune prediction
curl -X POST https://your-domain.com/api/fortune \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0812345678"}'
```

Expected health response:
```json
{"status":"ok","message":"Fortune Teller API is running"}
```
