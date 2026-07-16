# Platform Formats

The voice (see `maurice-voice.md`) is the foundation. This doc defines how it adapts per platform.

X and LinkedIn are separate channels with separate audiences. Overlap exists, but don't let one bleed into the other. When in doubt: X is the group chat. LinkedIn is the conference hallway.

## X / Twitter

Audience: builders, indie hackers, devs, internet people. They get memes. They scroll fast.

Tone:

- Casual to the point of irreverent.
- Lowercase default.
- Memes, shitposts, and real talk coexist.
- Stream of consciousness is fine.
- Replies and threads are part of the game.

What works:

- Ship updates ("just shipped X").
- Hot takes on tools, frameworks, building.
- Behind-the-scenes chaos ("broke prod again").
- Memes and internet humor.
- Short punchy threads (3-5 tweets max, each post has one job).
- Engagement bait that's actually interesting.

What doesn't work: professional tone, long-form thought leadership, corporate announcements, anything that reads like a press release, hashtags.

Format: one-liners, short threads, screenshots of terminals/code/dashboards, greentext-style stories.

Example:

```
shipped AI agents that talk to each other

one of them roasted my code

i'm keeping it
```

## LinkedIn

Audience: entrepreneurs, founders, tech professionals, potential clients. They respect substance but expect a certain polish.

Tone:

- Still personal, still builder-first.
- Slightly more structured than X.
- First person, conversational.
- Confident but not bragging.
- Storytelling over statements.
- Dry wit or self-deprecation is fine.

What works:

- Lessons from building (with specific examples).
- Founder journey stories.
- Contrarian takes on business/tech (backed by experience).
- Behind-the-scenes with a takeaway.
- Vulnerability that leads somewhere useful.
- Numbers and proof points.

What doesn't work: X-style shitposts, pure memes without substance, too casual (no greentext, no "be me"), corporate buzzword soup, "Agree?" engagement farming, hashtag spam.

Format:

- Hook line (standalone, compelling).
- Short paragraphs (1-3 sentences each), white space between blocks.
- Optional bullet points.
- End with insight, not a call to action.
- Default length: 700-1,200 characters unless the user asks otherwise.

Example:

```
I mass-unfollowed 230 people on LinkedIn last year.

Not because they posted bad content.
Because my feed became noise.

When you follow everyone, you hear no one.

Curate ruthlessly. Your feed is your input.
Your input shapes your output.
```

## The Differences

| Dimension | X | LinkedIn |
|-----------|---|----------|
| Polish level | Raw | Lightly edited |
| Humor | Memes, shitposts | Dry wit, self-deprecation |
| Structure | Freeform | Hook → story → insight |
| Audience assumption | They get it | They might need context |
| Vulnerability | Casual ("lol broke prod") | Intentional (lesson attached) |
| Length | Short (1-5 tweets) | Medium (500-1200 chars) |
| Hashtags | Never | Sparingly if at all |
| Emojis | Minimal, ironic | Minimal, functional |

Both share the fundamentals: builder-first, proof over hype, short scannable sentences, no em dashes, no "X isn't just Y. It's Z", understated confidence, real > polished.

## Product Changelogs / Announcements

- Direct, transparent, honest.
- Good: "this was buggy yesterday. it's not anymore."

## Landing Pages

- Simple, outcome-focused, no fluff.
- Good: "Create realistic chat mockups in seconds."
- Bad: "Empowering creators through next-gen visualization tools"

## Blog Posts

Audience: technical readers who need clarity, not hype.

Tone: Maurice's directness with less slang. Outcome-first. Calm and explanatory.

Default structure:

```markdown
# Clear title

## Introduction
Name the real problem before naming the category or product.

## Why this problem exists
Use concrete examples.

## What the term/approach means
Define the concept in plain English.

## Where the product fits
Only if a product overlay is loaded; use its terminology and safe claims.

## Practical takeaway
End with a concrete next step or decision rule.
```

Vocabulary bridge for cold audiences: do not open with internal or category jargon. State the plain-language outcome first, then name the term.

SEO requirements (only when the user asks for a search-targeted piece):

- Target one primary keyword; include 3-8 related terms naturally.
- Primary keyword in the H1, opening, at least one H2, conclusion, title, meta description, and slug.
- Suggest at least three internal links when natural.
- No keyword stuffing.

## Repurposing Rules

When turning one idea into multiple channels:

- Keep the same factual payload.
- Change density, rhythm, and implied audience.
- Do not paste LinkedIn copy into X unchanged.
- Do not let X slang leak into a technical blog.
- Preserve claim discipline across every variant.

## Useful Endings

LinkedIn: "That's the part I'm paying attention to." / "Curious where other teams are drawing this boundary." / "Full write-up in the comments."

X: "building toward this now" / a soft plug with a wink ("Good thing <product> supports X 😉").

Blog: a decision rule the reader can apply today.
