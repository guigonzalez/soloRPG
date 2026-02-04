# SoloRPG 🎲

A narrative-focused solo RPG game powered by AI. Play immersive tabletop RPG adventures with an AI narrator that adapts to your choices.

## ✨ Features

- 🤖 **AI Narrator** - Claude or Gemini AI provides dynamic storytelling
- 🎲 **Dice Rolling** - Full dice notation support (d20, 2d6+3, etc.)
- 🎬 **Interactive Actions** - AI suggests contextual actions with automatic roll integration
- 💾 **Local Storage** - All data saved in browser (IndexedDB)
- 🧠 **Memory System** - AI remembers entities, facts, and story recap
- 🌍 **Multi-language** - Support for 10 languages (EN, PT, ES, FR, DE, IT, JA, KO, ZH, RU)
- 🎨 **Retro 8-bit Style** - Classic terminal aesthetic

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/SoloRPG.git
cd SoloRPG
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:5173

### First Time Setup

1. Get an API key:
   - **Claude**: https://console.anthropic.com/
   - **Gemini**: https://aistudio.google.com/apikey

2. Enter your API key in the app settings (⚙️ button)

3. Create your first campaign and start playing!

## 🌐 Deploy to GitHub Pages

### Automatic Deployment

This project includes GitHub Actions workflow for automatic deployment.

#### Setup Steps:

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SoloRPG.git
git push -u origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: **GitHub Actions**

3. **Deploy**:
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - Your app will be live at: `https://YOUR_USERNAME.github.io/SoloRPG/`

### For Custom Repository Name

If your repository is not called "SoloRPG", update the base path:

```bash
# In vite.config.ts, the base is set to:
base: process.env.VITE_BASE_PATH || '/'

# Deploy with custom base:
VITE_BASE_PATH=/your-repo-name npm run build
```

## 🎮 How to Play

1. **Create Campaign**:
   - Choose RPG system (D&D 5e, Call of Cthulhu, etc.)
   - Set theme and tone
   - Use AI to generate suggestions

2. **Play**:
   - AI narrates the story
   - Type your actions or click suggested action buttons
   - Roll dice when needed (automatic for suggested actions)
   - AI responds based on your choices and rolls

3. **Memory System**:
   - AI tracks characters, places, and important facts
   - View recap and entities in the sidebar
   - Memory persists between sessions

## 🔒 Privacy & Security

- **All data stored locally** in your browser (IndexedDB)
- **API keys stored locally** (localStorage, never sent to servers)
- **No backend required** - pure client-side application
- Your campaigns and API keys stay on your device

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Zustand** - State management
- **IndexedDB** - Local database
- **Claude/Gemini AI** - Narration
- **Vitest** - Testing

## 📦 Build

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 💡 Tips

- **Performance**: The app works offline once loaded
- **Data**: Export your campaigns periodically (browser data can be cleared)
- **API Costs**: Monitor your AI provider usage dashboard
- **Language**: Change in settings - AI will narrate in selected language

## 🐛 Troubleshooting

### API Key Issues
- Ensure key starts with `sk-ant-` (Claude) or is valid Gemini key
- Check API key has sufficient credits
- Try reloading the page

### Data Not Saving
- Check browser allows IndexedDB
- Try in incognito mode to rule out extensions
- Check browser console for errors

### Deployment Issues
- Verify GitHub Pages is enabled
- Check GitHub Actions workflow succeeded
- Wait a few minutes after push for deployment

---

**Enjoy your solo RPG adventures!** 🎲✨
