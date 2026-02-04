# SoloRPG

A narrative-focused solo RPG game with AI narration. Play solo adventures powered by Claude AI with minimal friction and maximum fun.

## Features (MVP)

### Phase 1: Foundation & Campaign Management ✅ COMPLETE
- Campaign creation with theme and tone
- Campaign list with CRUD operations
- Local persistence using IndexedDB
- Retro 8-bit aesthetic
- TypeScript + React + Vite stack

### Phase 2: Chat Interface ✅ COMPLETE
- Chat container with message display
- User input with validation
- Message persistence to IndexedDB
- Mock AI responses with streaming effect
- Sidebar with panels (recap, entities, rolls)
- Session continuity (resume from last message)

### Phase 3: Dice Rolling System ✅ COMPLETE
- Dice notation parser (d20, 2d6+3, etc.)
- Dice roller with breakdown display
- Roll persistence to IndexedDB
- Integration with chat flow
- AI can request rolls from players
- Visual roll results in chat

### Phase 4: Claude AI Integration ✅ COMPLETE
- Real Claude API integration (Sonnet 4.5)
- CERTA prompt system (Context, Expectation, Rules, Tone, Actions)
- Streaming AI responses
- Context assembly with message history
- Game engine orchestration
- AI requests rolls dynamically
- AI responds to roll results

### Phase 5-6: Coming Soon
- Memory system (recap, entities, facts extraction)
- Polish and production

## Getting Started

**📖 For detailed setup instructions, see [SETUP.md](SETUP.md)**

### Quick Start

1. Install dependencies: `npm install`
2. Configure API key: Copy `.env.example` to `.env` and add your Anthropic API key
3. Start dev server: `npm run dev`

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm test:ui
```

## Project Structure

```
src/
├── components/       # React components
│   ├── campaign/    # Campaign management
│   ├── chat/        # Chat interface (Phase 2)
│   ├── sidebar/     # Sidebar panels (Phase 2)
│   └── common/      # Reusable UI components
├── services/        # Business logic
│   ├── storage/     # IndexedDB repositories
│   ├── ai/          # Claude AI integration (Phase 4)
│   ├── dice/        # Dice rolling (Phase 3)
│   └── game/        # Game engine (Phase 4)
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # CSS styling
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Storage**: IndexedDB (via idb)
- **AI**: Anthropic Claude API
- **Testing**: Vitest + React Testing Library
- **Styling**: Custom retro CSS (8-bit aesthetic)

## Development Phases

### ✅ Phase 1: Foundation (Complete)
- Project setup
- IndexedDB schema
- Storage repositories
- Zustand stores
- Basic UI components
- Campaign CRUD

### ✅ Phase 2: Chat Interface (Complete)
- Chat container with auto-scroll
- Message display (user/AI/system styling)
- Message persistence to IndexedDB
- Mock AI responses with character-by-character streaming
- Chat input with Enter/Shift+Enter support
- Sidebar with 3 panels (recap, entities, rolls)

### ✅ Phase 3: Dice Rolling (Complete)
- Dice notation parser (supports d20, 2d6+3, etc.)
- Dice roller service with breakdown
- DiceRoll display component in chat
- Roll persistence to IndexedDB
- useDiceRoll and useRolls hooks
- AI requests rolls from player
- 24 unit tests passing

### ✅ Phase 4: Claude AI Integration (Complete)
- Claude API client with streaming support
- CERTA prompt system (Context, Expectation, Rules, Tone, Actions)
- Context assembly (last 20 messages)
- Game engine orchestration
- AI dynamically requests rolls
- AI responds to roll results
- useAI hook for real-time responses

### 📋 Phase 5: Memory System
- Memory extraction
- Entity management
- Fact tracking
- Recap generation

### 📋 Phase 6: Polish & Production
- Retro styling refinement
- Performance optimization
- Testing
- Production deployment

## Environment Variables

```bash
VITE_ANTHROPIC_API_KEY=your_api_key_here
VITE_CLAUDE_MODEL=claude-sonnet-4-5-20250929
VITE_MAX_TOKENS=2000
VITE_TEMPERATURE=0.8
```

## Design Philosophy

### CERTA Model (AI Prompting)
- **Context**: Campaign theme, tone, current situation
- **Expectation**: Vivid narration, player-driven story
- **Rules**: Dice rolling, consistency, consequences
- **Tone**: Match campaign mood
- **Actions**: Structured output format

### Memory System
- Recap: ≤600 characters
- Entities: Max 10 active per campaign
- Facts: Max 20 per campaign, must reference source message
- Anti-hallucination: All memory extracted from explicit text only

### Performance Targets
- Time to Interactive: < 2 seconds
- First campaign creation: < 30 seconds
- Session resume: < 10 seconds
- AI response start: < 2 seconds (first token)

## Contributing

This is a solo project implementation following a detailed PRD. Future contributions welcome after MVP completion.

## License

Private project - License TBD

---

**Current Status**: Phase 4 Complete ✅
**Next Step**: Phase 5 - Memory System (Optional Enhancement)
