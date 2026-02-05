# Test Plan: XP & Level-Up System

## Test Environment Setup

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Clear Browser Storage** (optional, for fresh start)
   - Open DevTools → Application → Storage → Clear site data

## Test Suite 1: Character Creation

### Test 1.1: Create New Campaign with Character
- [ ] Click "New Campaign"
- [ ] Fill in campaign details (e.g., "Test Adventure", D&D 5e, Fantasy, Dramatic)
- [ ] Click "Start Campaign"
- [ ] **Expected:** Character creation modal appears
- [ ] **Verify:**
  - Suggested character name is theme-appropriate
  - All 6 D&D attributes shown (STR, DEX, CON, INT, WIS, CHA)
  - Default values are 10
  - Modifiers show (+0) for value 10

### Test 1.2: Customize Character Attributes
- [ ] Click "Randomize" button
- [ ] **Expected:** Name and all attributes change to random values
- [ ] Click "-" button on STR
- [ ] **Expected:** STR decreases by 1, modifier updates
- [ ] Click "+" button on STR until max (20)
- [ ] **Expected:** "+" button becomes disabled at 20
- [ ] Click "-" button on STR until min (3)
- [ ] **Expected:** "-" button becomes disabled at 3
- [ ] Set attributes to: STR 14, DEX 12, CON 13, INT 16, WIS 10, CHA 8
- [ ] Click "Create Character"
- [ ] **Expected:** Character creation modal closes, campaign starts

---

## Test Suite 2: Character Panel Display

### Test 2.1: Verify Character Panel
- [ ] Look at sidebar - should default to "Character" tab
- [ ] **Verify:**
  - Character name displayed
  - Level 1 shown
  - XP: 0 / 600
  - XP progress bar is empty (0%)
  - All attributes displayed with correct values
  - Modifiers calculated correctly (e.g., STR 14 = +2, CHA 8 = -1)

### Test 2.2: Tab Navigation
- [ ] Click "Recap" tab
- [ ] **Expected:** Character panel hidden, Recap panel shown
- [ ] Click "Entities" tab
- [ ] **Expected:** Entities panel shown
- [ ] Click "Character" tab
- [ ] **Expected:** Character panel shown again

---

## Test Suite 3: XP Awards from Dice Rolls

### Test 3.1: Easy Success (DC 10)
- [ ] Wait for AI to suggest an action or type a message
- [ ] AI will eventually suggest a roll (e.g., "Roll to climb. (DC: 10)")
- [ ] Type: `1d20+2` (or use suggested action if available)
- [ ] **If roll total ≥ 10:**
  - **Expected:** System message: "✨ +10 XP - Easy success (DC 10)"
  - **Expected:** XP bar updates to 10/600 (~1.7%)
  - **Expected:** Character panel shows 10 XP

### Test 3.2: Medium Success (DC 15)
- [ ] Continue playing until AI suggests another roll with DC 15
- [ ] Roll dice (e.g., `1d20+3`)
- [ ] **If roll total ≥ 15:**
  - **Expected:** "✨ +25 XP - Medium success (DC 15)"
  - **Expected:** Total XP increases by 25
  - **Expected:** XP bar updates

### Test 3.3: Hard Success (DC 20)
- [ ] Continue until DC 20 roll suggested
- [ ] Roll dice (e.g., `1d20+4`)
- [ ] **If roll total ≥ 20:**
  - **Expected:** "✨ +50 XP - Hard success (DC 20)"
  - **Expected:** Total XP increases by 50
  - **Expected:** XP bar updates

### Test 3.4: Critical Success (Natural 20)
- [ ] Keep rolling until you get a natural 20 on a d20 roll
- [ ] **Expected:** Base XP + 25 bonus
  - DC 10 crit: +35 XP (10 + 25)
  - DC 15 crit: +50 XP (25 + 25)
  - DC 20 crit: +75 XP (50 + 25)
- [ ] **Expected:** Message shows "Critical!" in the reason

### Test 3.5: Failed Roll (No XP)
- [ ] Roll dice and fail a DC check (roll total < DC)
- [ ] **Expected:** NO XP message
- [ ] **Expected:** XP total unchanged

---

## Test Suite 4: Level-Up System

### Test 4.1: Reach Level 2 (600 XP)
- [ ] Continue playing and rolling dice until XP reaches 600
- [ ] **Expected when XP ≥ 600:**
  - "🎉 LEVEL UP! You are now Level 2!"
  - Level-up modal appears
  - Modal shows "You are now Level 2"
  - "Allocate 1 attribute point" message
  - All attributes show current value
  - "Points remaining: 1"

### Test 4.2: Allocate Attribute Points
- [ ] Click "+" on STR
- [ ] **Expected:**
  - STR shows: "14 → 15"
  - "+1" indicator appears
  - Points remaining: 0
  - Confirm button becomes enabled
- [ ] Click "-" on STR
- [ ] **Expected:**
  - STR reverts to "14"
  - "+0" indicator
  - Points remaining: 1
  - Confirm button disabled
- [ ] Click "+" on STR again
- [ ] Click "Confirm Level Up"
- [ ] **Expected:**
  - Modal closes
  - Character panel updates: STR now 15 (modifier +2)
  - Level shows 2

### Test 4.3: Verify Character Persists
- [ ] Refresh the page (F5)
- [ ] **Expected:**
  - Character still Level 2
  - XP progress maintained (e.g., 625/1800 if you had 625 XP)
  - STR still 15
  - All changes persisted

---

## Test Suite 5: AI Integration with Character

### Test 5.1: AI Receives Character Stats
- [ ] Send a message to the AI (e.g., "I want to lift a heavy boulder")
- [ ] **Expected:** AI response considers your STR stat
  - Higher STR → AI might set lower DC or mention character's strength
  - Lower STR → AI might set higher DC or mention difficulty

### Test 5.2: Suggested Actions with Attributes
- [ ] Continue playing until AI suggests actions
- [ ] **Expected:** Action buttons show attribute modifiers
  - Example: "Attack (STR)" with roll "1d20+STR"
  - Roll notation might show "1d20+2" if STR modifier is +2

### Test 5.3: AI Awards Story XP
- [ ] Complete a significant story milestone (e.g., defeat a boss, solve a puzzle, complete a quest)
- [ ] AI might include `<xp_award>50</xp_award>` in response
- [ ] **Expected:**
  - "✨ +50 XP - Story progression" message
  - XP total increases
  - This is rare and AI-determined, not guaranteed

---

## Test Suite 6: Multiple Level-Ups

### Test 6.1: Rapid Level Progression
- [ ] Continue playing until you have 1800 XP (Level 3)
- [ ] **Expected:** Level-up modal for Level 3
- [ ] Allocate point, confirm
- [ ] Continue to 4200 XP (Level 4)
- [ ] **Expected:** Another level-up modal

### Test 6.2: Multiple Points Allocation
- [ ] If system awards multiple points per level (depends on system template)
- [ ] **Expected:**
  - Points remaining shows correct count
  - Can allocate to different attributes
  - Must allocate all points before confirming

---

## Test Suite 7: Different RPG Systems

### Test 7.1: Call of Cthulhu Character
- [ ] Create new campaign with "Call of Cthulhu" system
- [ ] **Expected in Character Creation:**
  - 8 attributes: STR, CON, SIZ, DEX, APP, INT, POW, EDU
  - Default values around 50
  - Range 15-99
  - NO modifiers shown (percentage-based system)
- [ ] Complete character creation
- [ ] **Expected in Character Panel:**
  - All 8 attributes displayed
  - Values shown without modifiers

### Test 7.2: Generic/Freeform System
- [ ] Create campaign with "Generic/Freeform" or "Other" system
- [ ] **Expected:**
  - 4 basic attributes: Strength, Agility, Mind, Presence
  - Default value 10
  - Range 1-20
  - Modifiers calculated same as D&D

---

## Test Suite 8: Edge Cases

### Test 8.1: Max Level Character
- [ ] Use browser console to manually set XP to 64000+
  ```javascript
  // Open DevTools Console and run:
  const db = await window.indexedDB.open('solorpg', 2);
  // (This is advanced - skip if uncomfortable with console)
  ```
- [ ] Alternative: Keep playing until Level 10 (64000 XP)
- [ ] **Expected:**
  - Next level XP shows "MAX" or infinity
  - XP bar shows 100%
  - Can still gain XP but won't level up

### Test 8.2: Attribute at Maximum
- [ ] In level-up modal, try to increase attribute already at max (20 for D&D)
- [ ] **Expected:** "+" button disabled
- [ ] **Expected:** Cannot allocate points to maxed attribute

### Test 8.3: Campaign Without Character (Old Campaigns)
- [ ] If you have old campaigns from before character system
- [ ] Load an old campaign
- [ ] **Expected:**
  - Default character created automatically
  - Level 1, 0 XP, default attributes
  - Campaign continues normally

---

## Test Suite 9: Data Persistence

### Test 9.1: IndexedDB Storage
- [ ] Open DevTools → Application → IndexedDB → solorpg
- [ ] Expand "characters" store
- [ ] **Verify:**
  - Character entry exists with correct campaignId
  - Attributes stored as object
  - Level and experience fields correct

### Test 9.2: Cross-Session Persistence
- [ ] Play for a while, gain some XP (e.g., 250 XP)
- [ ] Close browser tab completely
- [ ] Reopen app, select same campaign
- [ ] **Expected:**
  - Character loads with same XP (250)
  - Same level
  - Same attribute values
  - XP progress bar correct

---

## Test Suite 10: UI/UX Validation

### Test 10.1: XP Progress Bar Animation
- [ ] Gain XP from a roll
- [ ] **Expected:** XP bar animates smoothly to new percentage
- [ ] Color is retro green (#9cd84e)

### Test 10.2: Level-Up Modal Styling
- [ ] Trigger level-up
- [ ] **Expected:**
  - Modal has retro 8-bit styling
  - "Press Start 2P" font used
  - Green color scheme
  - +/- buttons styled consistently
  - Modal centered on screen
  - Scrollable if needed on small screens

### Test 10.3: Chat Messages
- [ ] Check XP gain messages in chat
- [ ] **Expected:**
  - Uses sparkles emoji (✨)
  - System role (gray text)
  - Clear reason shown (e.g., "Medium success (DC 15)")
- [ ] Check level-up messages
- [ ] **Expected:**
  - Uses party popper emoji (🎉)
  - "LEVEL UP!" in caps
  - Level number shown

---

## Success Criteria

✅ **All tests pass** = XP system is working correctly

❌ **Any test fails** = Bug found, needs fixing

### Common Issues to Watch For:
- XP not being awarded after successful rolls
- Level-up modal not appearing at correct XP thresholds
- Attributes not updating after level-up confirmation
- Character stats not persisting after refresh
- AI not receiving character context
- XP bar not updating visually
- Multiple level-ups skipping levels

---

## Automated Test Script (Optional)

For developers who want to quickly test XP progression:

```javascript
// Open DevTools Console and paste:
(async function testXPSystem() {
  const store = window.__ZUSTAND_STORES__?.character; // If exposed

  // Award 100 XP
  console.log('Awarding 100 XP...');
  // (This would require exposing character store methods)

  console.log('Test complete. Check character panel for updates.');
})();
```

---

## Reporting Issues

If you find bugs, report with:
1. Test number (e.g., "Test 4.1")
2. Expected behavior
3. Actual behavior
4. Screenshots if UI-related
5. Browser console errors (F12 → Console)
6. Browser/OS version

---

## Next Steps After Testing

Once all tests pass:
- [ ] Test with real gameplay scenarios
- [ ] Try different RPG systems
- [ ] Play through a full session and verify progression feels balanced
- [ ] Get user feedback on XP/level pacing
- [ ] Consider adding Phase 6: Dice Roll Integration (attribute modifiers in rolls)
- [ ] Consider adding Phase 7: Enhanced AI context (character-aware narration)

**Note:** Moderate progression setting means ~12-20 successful medium rolls (DC 15) to reach Level 2. Adjust experience table in `sheet-presets.ts` (APP_XP_TABLE) if pacing feels too slow/fast.
