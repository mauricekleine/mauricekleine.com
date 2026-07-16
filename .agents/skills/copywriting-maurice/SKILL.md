---
name: copywriting-maurice
description: Maurice Kleine's personal founder voice for any user-facing writing - LinkedIn posts, X posts and threads, landing pages, changelogs, blog drafts, launch copy, DMs, and outreach. Product-neutral; pairs with a per-project copywriting-<project> overlay for product claims, terminology, and registers. Use whenever drafting or editing text Maurice will publish or send as himself.
---

# Copywriting Maurice

Maurice's personal voice: casual, direct, builder-first, internet-native, concrete. Write like a builder talking to other builders.

**This skill is product-neutral.** It owns Maurice's voice, not any product's claims. When the copy is about a specific product, ALSO load that project's `copywriting-<project>` overlay skill (e.g. `copywriting-rubriq`, `copywriting-spinup`), which owns the product's terminology, safe claims, guardrails, and any locked registers (like outreach). Voice comes from here; facts and claim discipline come from the overlay.

## Source priority

When sources disagree, resolve in this order:

1. The user's current brief and facts.
2. The project's `copywriting-<project>` overlay and current repo/brand docs.
3. This skill's voice references.
4. Older examples or archives.

Never invent traction, customer counts, revenue, pricing, benchmarks, security guarantees, or launch maturity. When facts are missing, make a conservative assumption and label it as a placeholder instead of fabricating proof.

## Workflow

1. Identify the channel: LinkedIn, X, blog, landing page, changelog, DM, or repurposed variants.
2. Load the relevant reference:
   - `references/maurice-voice.md` for pillars, vocabulary, and signature patterns.
   - `references/platform-formats.md` for LinkedIn vs X divergence, blog and changelog structure.
   - `references/examples-and-patterns.md` for concrete good/bad examples and red flags.
3. Extract the factual payload before writing: what shipped, what changed, what was learned, what proof exists, what the reader should do next.
4. Draft in Maurice's voice first, then tighten against the product overlay's rules (if one is loaded).
5. Run the final checks below before returning content.

## Core voice

- Clarity over polish.
- Progress over perfection.
- Proof over hype.
- Specifics over positioning.
- Work-in-progress honesty over polished announcements.

## Pillars (detail in references/maurice-voice.md)

**Builder-first.** Write from inside the process: "we shipped", "I tried", "this broke", "the numbers made it obvious". Never "we are excited to announce", "proud to introduce", "a major milestone".

**Proof over hype.** Good proof: a concrete number, a specific constraint, a named tool, a before/after, a weird bug, three concrete examples of pain. Bad proof: "people love it", "the future is here", vague traction. Add context in parentheses for data points (e.g., "(vs X at Y%)").

**Understated confidence.** State facts calmly and let the absurdity speak for itself ("running this on a €7/month server"). Do not brag, do not perform humility. "The math did not work" beats "we are humbled and thrilled".

**Curious tinkerer.** Show experiments, broken assumptions, fast learning. Admit when things break: "this broke in production, fixed it, learned something new".

**Casual, internet-native.** Write like you belong on X, Discord, and GitHub. Lowercase acceptable on X, short lines, natural spacing, occasional memes where the platform allows.

## Vocabulary

Preferred verbs: ship, build, fix, break, test, launch, tweak, experiment, hack, iterate, pivot.

Banned words: leverage, ecosystem, synergy, robust, solution, enterprise-grade, scalable, platform, next-generation, transformative, revolutionary, seamless, all-in-one, shifted.

## Hard style rules

- Short lines. One idea per paragraph. Visible whitespace. Lists for concrete examples.
- Sentence fragments when they improve rhythm ("At half the cost. While being 4x faster."). Full sentences in DMs and outreach.
- First person for founder posts. Contractions everywhere.
- **No em dashes. Ever.** No `—`, no `--`. Use commas, colons, periods, parentheses, or line breaks.
- **No "X isn't just Y. It's Z."** structure, nor the "not about A, it's about B" cousin. It screams AI-generated.
  - Bad: "What's interesting isn't just the numbers. It's who noticed."
  - Good: "The numbers are one thing. Who noticed is another."
- No hashtag stacks, no corporate closers, no "Agree?" engagement bait.
- Emojis sparingly (🧢 😅 🚀 👀 🔥 😉), never multiple per sentence, never corporate emoji spam.

## Platform defaults (detail in references/platform-formats.md)

X is the group chat. LinkedIn is the conference hallway. Don't let one bleed into the other.

- **X:** raw, lowercase acceptable, memes fine, single post or 3-5 post thread, no hashtags.
- **LinkedIn:** 700-1,200 characters, lightly edited, hook → story → insight, dry wit over shitposts, end with an insight or genuine question, not a CTA.
- **Changelog/announcement:** direct, transparent, honest ("this was buggy yesterday. it's not anymore.").
- **Landing page:** simple, outcome-focused, no fluff ("Create realistic chat mockups in seconds.").
- **DM/outreach:** short, human, full sentences; defer to the project overlay's outreach register if it has one.
- **Blog:** outline first when broad; lead with the problem, teach through examples; Maurice's directness with less slang.

## Final checks (North Star Test)

- Does it sound like a builder talking to builders, not a brand broadcasting?
- Are the first two lines concrete and not corporate?
- Zero em dashes, zero "X isn't just Y" structures, zero banned words?
- Is every claim something Maurice can back up today (or sourced from the overlay)?
- Is the point concrete enough to disagree with?
- Would Maurice say this out loud on Discord?
- Does it feel native to the platform?

If yes, ship it.
