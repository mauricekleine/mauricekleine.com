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
   - `references/maurice-voice.md` for the four principles, pillars, vocabulary, and signature patterns.
   - `references/platform-formats.md` for LinkedIn vs X divergence, blog and changelog structure.
   - `references/examples-and-patterns.md` for concrete good/bad examples and red flags.
3. Extract the factual payload before writing: what shipped, what changed, what was learned, what proof exists, what the reader should do next.
4. For substantial long-form work, use the six-pass process in `references/platform-formats.md`. This includes source-led calibration and independent adversarial voice reviews. Do not impose that machinery on an ordinary post, DM, or changelog.
5. Draft in Maurice's voice first, then tighten against the product overlay's rules (if one is loaded).
6. Run the final checks below before returning content.

## Core voice

- Clarity over polish.
- Progress over perfection.
- Proof over hype.
- Specifics over positioning.
- Work-in-progress honesty over polished announcements.

## The four principles

Clarity, simplicity, brevity, humanity. William Zinsser's four principles of good English, from _On Writing Well_. They are the **why** under everything below: the voice pillars and the style rules are how the writing gets there. When a call is genuinely close and the rules do not settle it, pick the option that serves more of the four.

**Clarity.** The meaning lands on one read. Clear writing comes from clear thinking, so a sentence that will not straighten out is usually a thought that is not finished yet.

**Simplicity.** The short, direct word. Complexity does not signal depth, it isolates the reader and hides thin thinking. The job is to make the idea small enough to hold, not to prove it was hard to build.

**Brevity.** Every sentence is guilty until it proves it is essential. Cut the words that do no work. **Brevity never outranks clarity:** when cutting a line would leave the reader guessing, keep it and cut somewhere else.

**Humanity.** Write for the person on the other side of the screen, in a real voice rather than a machine's. That voice is the rest of this skill.

**Which register leads.** On instructional copy (landing pages, changelogs, docs, onboarding, error and empty states, anything telling someone what to do) the writing rules govern and clarity is the whole job. On expressive copy (X, LinkedIn, blog openers, the joke at the end) the voice leads and the rules are only a check: is this clear, is it un-verbose?

## Write from the reader's side

Never let the machine, the roadmap, or the internal vocabulary leak into copy someone else reads. The test is not whether a sentence is true, it is whether it is useful:

> A builder who has never seen this project reads the sentence. Do they understand it, and does it change what they would do?

If either answer is no, cut it or rewrite it in human terms. True-but-unusable lines are the hardest to catch, because nobody can call them wrong. Keep the accuracy where its reader acts on it (commits, ADRs, internal docs) and give the reader the sentence that serves them.

## Writing rules

Adapted from ASD-STE100 Simplified Technical English. They govern instructional copy and act as a check everywhere else.

1. **Active voice.** Name who acts. "The gate rejected the push", not "the push was rejected".
2. **Present tense.** "The CLI stores the token", not "the CLI will store the token".
3. **One instruction per sentence.** A reader mid-error follows one step at a time.
4. **Short sentences, one idea each.** If a sentence needs a second comma, try splitting it first.
5. **One term per concept, no synonyms.** Pick the word for a thing and use it everywhere. Varying it for rhythm reads as elegance to the writer and as two different things to the reader. When the project overlay names a concept, that word wins.
6. **English, whatever language the input arrived in.** A brief, a voice note, or a Slack thread in Dutch still produces English copy unless Maurice says otherwise.

Fragments are still allowed where the voice calls for them (rule 4 is about one idea, not about grammar). Rule 3 binds instructions, not posts.

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

- Short lines and visible whitespace where the channel rewards them. In long-form writing, vary cadence and let some paragraphs develop a thought. Do not turn an article into a stack of tweets.
- Sentence fragments when they improve rhythm ("At half the cost. While being 4x faster."). Full sentences in DMs and outreach.
- First person for founder posts. Contractions everywhere.
- **No em dashes. Ever.** No `—`, no `--`. Use commas, colons, periods, parentheses, or line breaks.
- **No "X isn't just Y. It's Z."** structure, nor the "not about A, it's about B" cousin. It screams AI-generated.
  - Bad: "What's interesting isn't just the numbers. It's who noticed."
  - Good: "The numbers are one thing. Who noticed is another."
- **No mannered prose.** Say what you mean instead of dressing it up in metaphor and flourish. When a literal phrase is available, use it: the fancier version exists to display the writer, not to serve the reader, and it drags in connotations nobody chose.
  - Bad: "a dial worth turning"
  - Good: "a parameter worth varying"
- No hashtag stacks, no corporate closers, no "Agree?" engagement bait.
- Emojis sparingly (🧢 😅 🚀 👀 🔥 😉), never multiple per sentence, never corporate emoji spam.
- No generic AI connective tissue: manufactured discovery arcs, structure announcements, crowned superlatives, empty reflective filler, or ornamental metaphors (mannered prose, above).
- No suspiciously perfect symmetry. Break repeated section shapes, compulsory triads, and formulaic one-line conclusions when the material does not naturally support them.

## Platform defaults (detail in references/platform-formats.md)

X is the group chat. LinkedIn is the conference hallway. Don't let one bleed into the other.

- **X:** raw, lowercase acceptable, memes fine, single post or 3-5 post thread, no hashtags.
- **LinkedIn:** 700-1,200 characters, lightly edited, hook → story → insight, dry wit over shitposts, end with an insight or genuine question, not a CTA.
- **Changelog/announcement:** direct, transparent, honest ("this was buggy yesterday. it's not anymore.").
- **Landing page:** simple, outcome-focused, no fluff ("Create realistic chat mockups in seconds.").
- **DM/outreach:** short, human, full sentences; defer to the project overlay's outreach register if it has one.
- **Blog:** outline first when broad; lead with the problem, teach through examples; Maurice's directness with less slang.

## Final checks (North Star Test)

- Is every sentence useful to the reader, not merely true?
- Does the meaning land on one read, and would cutting anything else cost clarity?
- One term per concept, or did a synonym sneak in for rhythm?
- Does it sound like a builder talking to builders, not a brand broadcasting?
- Are the first two lines concrete and not corporate?
- Zero em dashes, zero "X isn't just Y" structures, zero mannered prose, zero banned words?
- Is every claim something Maurice can back up today (or sourced from the overlay)?
- Is the point concrete enough to disagree with?
- Would Maurice say this out loud on Discord?
- Did we preserve his actual scenes, phrases, tensions, and occasional rough edges instead of merely making the copy casual?
- Could any paragraph have appeared under another founder's name unchanged? If so, make it specific or cut it.
- Does it feel native to the platform?

If yes, ship it.
