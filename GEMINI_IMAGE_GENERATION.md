# Gemini Image Generation — Field Guide

How to generate photorealistic site images using Google Gemini via the CLI starter project.

---

## Setup

**Starter project location:**
```
/Users/ivan/Downloads/Клод сайти/google-image-gen-api-starter-main копія/
```

**API key** is already set in `.env` (not committed — see `.env.example` in the starter project):
```
GOOGLE_AI_API_KEY=your_key_here
```

**Model:** `gemini-3-pro-image-preview`

No additional install needed — `uv sync` was already run.

---

## Basic Command

```bash
cd "/Users/ivan/Downloads/Клод сайти/google-image-gen-api-starter-main копія"

uv run python main.py "/absolute/path/to/output.jpg" "your prompt here" --aspect 3:4
```

**Aspect ratios:**

| Ratio  | Use for                        |
|--------|--------------------------------|
| `1:1`  | Square / Instagram             |
| `3:4`  | Portrait / gallery cards       |
| `4:3`  | Standard landscape             |
| `9:16` | Mobile / stories               |
| `16:9` | Hero banners, wide backgrounds |
| `21:9` | Ultra-wide cinematic           |

Always use an absolute path for the output file.

---

## Advanced Flags

```bash
# Edit an existing image
uv run python main.py output.jpg "Make the background white" --edit input.jpg

# Use a reference image to match a style
uv run python main.py output.jpg "Same composition but with a cat" --ref style.jpg

# Multiple reference images (up to 14)
uv run python main.py output.jpg "Same style" --ref ref1.jpg --ref ref2.jpg

# Use a style template (.md file with a Prompt Template section)
uv run python main.py output.jpg "a gear icon" --style styles/my_style.md
```

---

## Prompting Strategy

Gemini renders **specific detail** — it can produce readable text on objects, real place names, named people, exact dog breeds with exact cuts, and materials like marble or brass. This is what separates it from generic tools like Pollinations/Flux.

### The anatomy of a good prompt

```
[Subject] + [specific visual details] + [setting/context] + [lighting] + [camera style] + [quality suffix]
```

**Quality suffix to append to every prompt:**
```
ultra-realistic, professional photography, 4K, no text, no watermark
```

**Lighting terms that work:**
- `warm soft natural light from a window on the left`
- `soft overhead diffused light, no harsh shadows`
- `warm ambient light, golden hour`
- `editorial studio lighting on seamless beige backdrop`

**Key rules:**
- Name the **location** when it matters: "Châtillon, France", "Paris 13ème", "Sofia with Alexander Nevsky Cathedral visible"
- Name the **person** if they appear: "Olena, early 30s, friendly smile"
- Name **exact breeds** and **exact cuts**: "white toy poodle with perfect round fluffy Continental cut"
- Name **materials** specifically: "Carrara marble", "aged brass", "natural linen"
- Describe the **camera angle**: "flat lay top-down", "three-quarter view", "close-up portrait"

### What NOT to do
- Don't use vague adjectives alone: ~~"beautiful dog"~~ → "white Bichon Frise with cloud cut, sitting upright"
- Don't write ~~"luxury aesthetic"~~ without grounding it: → "warm pendant lamp over Carrara marble table, brass fittings"
- Don't omit the lighting: it determines whether the image looks editorial or stock

---

## Prompts Used for CaniCo (Real Examples)

These all produced high-quality, site-ready images.

### Hero (16:9) — Salon interior
```
Interior of a luxury pet grooming salon in Châtillon, France. 
Elegant cream and ivory decor. Professional stainless steel grooming table in center. 
Warm brass pendant lamp above. White cabinetry with neatly arranged grooming tools. 
Large round mirror, potted Monstera plant in corner. 
Polished marble floor. Nobody present. Wide angle view. 
Ultra-realistic professional architectural photography, warm soft light, 4K, no text
```

### About (3:4) — Groomer portrait
```
Portrait of a professional female dog groomer named Olena, early 30s, 
warm friendly smile, wearing a clean beige linen apron, 
gently holding a small fluffy white Bichon Frise. 
Softly blurred modern grooming salon in background. 
Warm natural light from window on left. Confident, professional pose. 
Ultra-realistic editorial photography, shallow depth of field, 4K
```

### Gallery cards (3:4) — Dog portraits
**Toy poodle:**
```
White toy poodle freshly groomed with perfect round fluffy Continental cut. 
Sitting on professional grooming table, three-quarter view facing camera. 
Cream studio backdrop, warm soft overhead light. 
Ultra-realistic studio portrait photography, no distractions, 4K
```

**Golden retriever:**
```
Golden retriever after full professional groom — coat perfectly brushed, 
gleaming and silky, no tangles. Happy expression, slightly open mouth. 
Seated on elevated grooming table, warm salon in background. 
Editorial pet photography, warm natural light, shallow depth of field, 4K
```

**Yorkshire terrier:**
```
Yorkshire terrier with full traditional show cut — long silky tan and steel-blue coat 
falling to the floor, small white satin bow tied on top of head. 
Sitting on stainless steel grooming table, professional grooming salon in background. 
Ultra-realistic pet photography, studio lighting, sharp focus on coat texture, 4K
```

**Bichon Frise:**
```
Bichon Frise with perfect round cloud cut — pure white, ultra-fluffy, 
immaculate scissor finish. Sitting upright on white surface. 
Adorable expression, dark round eyes. Soft diffused studio light. 
Editorial pet photography, cream background, 4K, no shadows
```

**Miniature Schnauzer:**
```
Miniature Schnauzer with classic breed-standard cut — neat salt-and-pepper body, 
thick bushy eyebrows, long beard trimmed squarely, skirt legs. 
Proud posture. Light neutral background. 
Professional pet studio photography, editorial lighting, 4K
```

**Shih Tzu:**
```
Shih Tzu groomed with elegant puppy cut — silky caramel and white coat, 
small red satin bow on head, bright alert eyes. 
Sitting on grooming table with clean white towel underneath. 
Warm salon lighting, shallow depth of field. 
Ultra-realistic pet portrait photography, 4K
```

### CTA banner (16:9) — Tools flatlay
```
Flat lay top-down view on cream Carrara marble surface: 
professional Japanese grooming scissors with golden rings, fine-tooth stainless comb, 
natural bristle brush, small white fresh flowers (baby's breath), 
folded soft linen towel in beige. Elegant minimalist composition. 
Luxury beauty editorial photography, warm soft light, ultra-realistic, 4K
```

---

## Typical Workflow for a New Website Project

1. Identify every image slot in the design: hero, about, gallery cards, CTA, etc.
2. Note the aspect ratio needed for each slot.
3. Write prompts with the **specific context** of this client: their name, city, style, product/service.
4. Run all images via the CLI one by one (no batch script needed — just copy-paste).
5. Read each generated image with the Read tool immediately to verify quality.
6. If an image is wrong: fix the prompt (be more specific) and regenerate.

---

## Comparison vs Alternatives

| Tool             | Quality      | Text rendering | Specific details | Cost  |
|------------------|--------------|---------------|-----------------|-------|
| Gemini (paid)    | Photorealistic | Yes          | Excellent        | Paid  |
| Pollinations/Flux | Generic stock | No           | Poor             | Free  |
| DALL-E 3         | Good          | Yes           | Good             | Paid  |

Gemini's key advantage: it follows long, highly detailed prompts and renders readable text (signs, labels, apron text) without hallucinating unrelated elements.
