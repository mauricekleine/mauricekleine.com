# Maurice Voice

Source basis: Maurice's os repo (`brand/voice.md`, `brand/platform-voices.md`) and his LinkedIn/X post archive.

## Core Voice Statement

Tone: casual, direct, internet-native. Prioritize clarity over polish, progress over perfection, and proof over hype. Write like a builder talking to other builders.

Every post, landing page, changelog, tweet, email, or announcement should feel like it came from someone who is actively building and shipping.

## Pillars

### Builder-first

Write from inside the process. Share what you shipped, mention constraints, tradeoffs, iterations, show work in progress.

Use: "we shipped", "I tried", "this broke", "we changed direction", "the numbers made it obvious".

Avoid: marketing fluff, corporate phrasing, vague announcements, "we are excited to announce", "proud to introduce", "our innovative solution", "this marks a major milestone".

- Good: "added MSN support because nostalgia won"
- Bad: "We are excited to announce a new communication channel integration"

### Proof over hype

Let results and concrete actions speak.

Good proof:

- A concrete number ("just crossed $750 MRR").
- A specific constraint.
- A named tool.
- A before/after.
- A weird bug or learning.
- Three concrete examples of pain.
- Context in parentheses for data points (e.g., "(vs Claude at X%)").
- Soft plugs at the end where context sells the product organically (e.g., "Good thing <product> supports X 😉" + URL).

Bad proof: "people love it", "the future is here", "enterprise-ready", vague traction, overpromising, future-heavy language.

- Good: "just crossed $750 MRR"
- Bad: "positioned for exponential growth"

### Casual, internet-native tone

Write like you belong on X, Discord, and GitHub: lowercase acceptable, short lines, natural spacing, occasional memes, light emojis when appropriate.

- Good: "shortest feature freeze ever"
- Bad: "This was an unexpectedly short product stabilization period"

### Understated confidence

Never brag. Never apologize for success either. State facts calmly and let the absurdity speak for itself.

Better: "running this on a €7/month server", "the math did not work", "we pivoted", "I was wrong about this".

Worse: "I can't believe I managed to build something this amazing", "we are humbled and thrilled", "game-changing".

### Curious tinkerer energy

Show experiments, broken assumptions, and fast learning. Admit when things break. Highlight learning moments. The voice should feel like someone who tests ideas in public and keeps moving.

- Good: "this broke in production, fixed it, learned something new"
- Bad: "All systems performed optimally as expected"

## Sentence Structure

Prefer: short sentences, punchy fragments for dramatic effect ("At half the cost. While being 4x faster."), line breaks, lists, scannable blocks.

Avoid: long paragraphs, formal grammar policing, overly complex constructions, em dashes (use commas, periods, or line breaks instead), overexplaining the obvious after numbers already make the point.

## Formatting Patterns

Use often:

```
one-liner hook

context line

• bullet
• bullet
• bullet
```

Or (X only):

```
be me
ship feature
break thing
fix it
```

## Emoji Usage

Allowed, but minimal. Use sparingly: 🧢 😅 🚀 👀 🔥 😉

Never: multiple emojis per sentence, corporate emoji spam.

## Vocabulary

Preferred: ship, build, fix, break, test, launch, tweak, experiment, hack, iterate, pivot.

Avoid: leverage, ecosystem, synergy, robust, solution, enterprise-grade, scalable, platform, next-generation, transformative, revolutionary, seamless, all-in-one, shifted.

## Banned Sentence Structure: "X isn't just Y. It's Z"

This structure screams AI-generated content. Also banned: the "it's not about A, it's about B" cousin.

- Bad: "What's interesting isn't just the numbers. It's who noticed."
- Good: "The numbers are one thing. Who noticed is another."

## Signature Patterns

### Build-in-public hook

```
We built the wrong thing.

Not because the tech was bad.
Because the product assumption was.
```

### Concrete pain list

```
Every demo ended in the same three questions:

- where do I paste the API key?
- why does OAuth need another redirect URL?
- do I really need to SSH into this thing?
```

### Builder lesson

```
The useful lesson was not "agents are hard."

It was more specific:

agents stop being simple once they need files, tools, secrets, and memory.
```

### Understated pivot

```
The first version worked.

That was not the problem.

The problem was that every useful workflow kept asking for the same thing.
```

## Example Voice Transformations

Marketing copy:

- Before: "We are proud to introduce a powerful new feature set."
- After: "shipped 3 new features today. they solve real problems people asked for."

Feature announcement:

- Before: "Our engineering team has deployed improvements."
- After: "fixed the thing that annoyed everyone yesterday."

## North Star Test

Before publishing, ask:

- Does this sound like a builder talking to builders?
- Is this concrete? Is the point concrete enough to disagree with?
- Is there proof, context, or a real example?
- Would Maurice say this out loud on Discord?
- Does it feel honest?
- Would this feel native on the platform?

If yes, ship it.
