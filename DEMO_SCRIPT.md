# Intent2Commit - Demo Video Script
**Duration: 3-5 minutes**

---

## OPENING (0:00-0:30)

### Visual: Title Card
**"Intent2Commit"**
"Code tells you what it does. Intent tells you why."

### Narration:
"Every developer has experienced this: You're looking at code written 3 months ago, trying to figure out WHY a decision was made. The commit message says 'fix bug' or 'update logic'—completely useless."

### Visual: Show cryptic Git log
```
a8f3c2 - fix bug
7b2d19 - update logic  
3c4e1f - changes
```

---

## PROBLEM (0:30-1:00)

### Narration:
"Traditional version control captures WHAT changed, but loses WHY decisions were made. Intent disappears. Context vanishes. Technical debt accumulates."

### Visual: Split screen comparison

**Left: Traditional Flow**
```
CODE → COMMIT → ???
```

**Right: What We Need**
```
INTENT → CODE → HISTORY
```

### Narration:
"Intent2Commit solves this with a paradigm shift: **Intent as a first-class Git primitive**."

---

## SOLUTION - LIVE DEMO (1:00-3:30)

### Scene 1: Capture Intent (1:00-1:20)

### Visual: Terminal
```bash
$ intent "reduce login latency by removing redundant database calls"
```

### Output:
```
✓ Intent captured
  "reduce login latency by removing redundant database calls"

→ Make your code changes, then run:
  intent commit
```

### Narration:
"Before writing ANY code, you capture your intent. This forces intentional development."

---

### Scene 2: Write Code (1:20-1:40)

### Visual: Code editor
Show side-by-side diff removing a redundant database query

### Narration:
"Now I make my changes—removing an extra database call from the login endpoint."

---

### Scene 3: Alignment Check (1:40-2:20)

### Visual: Terminal
```bash
$ git add .
$ intent commit
```

### Output:
```
→ Analyzing staged changes...
✓ Found 1 file(s) with changes

→ Checking intent-change alignment...

  Score: 95/100 (excellent)
  ✓ No alignment issues detected
```

### Narration:
"Here's the innovation: **Watch what happens when the intent and the code disagree.** Intent2Commit validates whether my code changes match my stated intent. It's like having a code reviewer that catches scope creep automatically."

---

### Scene 4: Generated Commit (2:20-2:50)

### Visual: Show generated commit message

```
perf(auth): reduce login latency by removing redundant database calls

Intent:
- Improve login performance for end users

Changes:
- Modified: src/auth/login.js (+5/-8)

Impact:
- Changes align with stated intent

Alignment Score: 95/100
```

### Narration:
"The commit isn't just 'what changed'—it's a decision record. Intent, changes, impact. Everything a developer needs to understand WHY this code exists."

---

### Scene 5: The "Aha Moment" (2:50-3:20)

### Visual: Time travel effect → "3 months later"

### Terminal:
```bash
$ intent explain a8f3c2
```

### Output:
```
Commit Intent Explanation

Intent:
  "reduce login latency by removing redundant database calls"

💡 This is what the developer was thinking when writing this code.
```

### Narration:
"Three months later, any developer can understand the original reasoning. This is **repository archaeology**—human intent, preserved forever."

---

## CLOSE (3:20-3:45)

### Visual: Feature highlights appear

✓ Intent-first workflow  
✓ Alignment validation  
✓ Decision-aware commits  
✓ Repository archaeology  

### Narration:
"In the AI era, code becomes abundant, but human intent becomes scarce. Intent2Commit preserves what matters most: WHY humans decided to write code this way."

### Visual: GitHub link + CTA
```
github.com/[username]/intent2commit
Open Source • MIT License
Built for Vibeathon 2026
```

### Narration:
"This is not better commits. This is human reasoning, preserved. Try Intent2Commit—link in the description."

---

## PRODUCTION NOTES

### B-Roll Footage Needed:
- Frustrated developer reading old code
- Git history with cryptic messages
- Clean terminal with colorful output
- Code editor with syntax highlighting

### Color Scheme:
- Use chalk colors from the tool (green, yellow, cyan, gray)
- Modern, developer-focused aesthetic

### Music:
- Upbeat but professional
- Background track, not overpowering

### Text Overlays:
- Key phrases: "Intent as a primitive", "Repository archaeology"
- GitHub stars counter (if applicable)

### Platform:
- Upload to YouTube
- Share on Twitter, LinkedIn
- Post in developer communities (Reddit r/programming, Hacker News)

---

## POST-DEMO STRATEGY

### For Vibeathon Submission:
1. Upload video to YouTube (unlisted or public)
2. Include video link in GitHub README
3. Submit GitHub repo + video link by Jan 14
4. Share on social media with hashtag #vibeathon

### Engagement Hooks:
- "Ever wondered WHY legacy code exists?"
- "Git history that actually makes sense"
- "AI can write code. We preserve human intent."
