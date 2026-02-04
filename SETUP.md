# SoloRPG Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**Where to get your API key:**
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Create a new key and copy it

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Configuration Options

All configuration is in the `.env` file:

```env
# Required: Your Anthropic API key
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Optional: Claude model to use (default: claude-sonnet-4-5-20250929)
VITE_CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Optional: Max tokens per response (default: 2000)
VITE_MAX_TOKENS=2000

# Optional: Temperature for AI responses (default: 0.8)
# Lower = more focused, Higher = more creative
VITE_TEMPERATURE=0.8
```

## Testing Without API Key

The app will run without an API key, but:
- ✅ You can create campaigns
- ✅ You can view the interface
- ✅ You can test dice rolling
- ❌ AI narration won't work (will show clear error)

A warning banner will appear explaining how to configure the API key.

## Build for Production

```bash
npm run build
```

The built files will be in `dist/` directory.

## Common Issues

### "API Key Not Configured" Error

**Solution:** Make sure your `.env` file exists and has the correct format:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Important:** Variable names must start with `VITE_` to be available in the browser.

### "Invalid API Key" Error

**Solution:**
1. Check that you copied the entire key (starts with `sk-ant-api03-`)
2. Verify the key is active in [console.anthropic.com](https://console.anthropic.com/)
3. Restart the dev server after changing `.env`

### Interface Loads Empty

**Solution:**
1. Clear browser cache (Cmd/Ctrl + Shift + R)
2. Check browser console for errors (F12)
3. Restart dev server: `npm run dev`

### Streaming Not Working

**Solution:**
1. Check your internet connection
2. Verify API key has sufficient credits
3. Check Anthropic API status at [status.anthropic.com](https://status.anthropic.com)

## Privacy & Security

⚠️ **Important:** The app uses `dangerouslyAllowBrowser: true` in the Anthropic client. This is **only for development**.

**For production**, you should:
1. Create a backend API proxy
2. Keep API keys server-side
3. Never expose API keys in client code

Example backend proxy structure:
```
Client → Your Backend API → Anthropic API
```

This way, API keys stay secure on your server.

## Next Steps

1. Create your first campaign
2. Start playing with AI narration
3. Try dice rolling mechanics
4. Explore different campaign themes and tones

For more details, see the main [README.md](README.md).
