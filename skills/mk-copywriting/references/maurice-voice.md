# Maurice Voice

Source basis: Maurice's os repo (`brand/voice.md`, `brand/platform-voices.md`) and his LinkedIn/X post archive. The principles below come from William Zinsser's _On Writing Well_ and from the principles of ASD-STE100 Simplified Technical English (the STE dictionary and specification are deliberately not copied here).

## Core Voice Statement

Tone: casual, direct, internet-native. Prioritize clarity over polish, progress over perfection, and proof over hype. Write like a builder talking to other builders.

Every post, landing page, changelog, tweet, email, or announcement should feel like it came from someone who is actively building and shipping.

Voice is not lowercase plus fragments. It comes from Maurice's actual observations, preferences, jokes, annoyances and contradictions. Source material outranks mimicry.

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

## Principles Beneath the Voice

The pillars describe how Maurice sounds. These describe what makes any of it good writing. When the pillars and the principles pull against each other, the pillars set the register and the principles set the floor: a post can be lowercase, fragmented, and full of slang, and still has to be clear.

### Clarity

The meaning lands on one read. Clear writing is the result of clear thinking, so a sentence that will not straighten out is usually a thought that is not finished yet. Before writing anything longer than a post, three things have to be clear: **purpose** (why the reader is here), **audience** (who it is for), and **scope** (what it covers and what it does not). A piece whose reader reaches the end and says "so what?" was not worth writing, however clean the sentences.

### Simplicity

Use the short, direct word. Complexity does not signal depth, it isolates the reader and hides thin thinking. Strip the jargon, the internal vocabulary, and the long phrase standing in for a plain one. The job is to make the idea small enough to hold, not to prove it was hard to build. This is the same instinct as the banned-words list, one level up.

### Brevity

A draft is only as long as it needs to be. Treat every sentence as guilty until it proves it is essential and cut every word that does no work. **Brevity never outranks clarity:** when cutting a line would leave the reader guessing, keep the line and cut somewhere else. This is also why the numbers usually carry the point on their own, and the sentence explaining them can go.

### Humanity

Two sides. The reader's side binds: what do they need to hear, and how will they understand it. The writer's side is voice, writing as a person rather than a machine, which is what the rest of this file is for.

## The Reader's-Side Test

Never let the machine, the roadmap, or the internal vocabulary leak into copy someone else reads. The test is not truth, it is use:

> A builder who has never seen this project reads the sentence. Do they understand it, and does it change what they would do?

If either answer is no, cut it or rewrite it in human terms. True-but-unusable lines are the hardest ones to catch, because nobody can call them wrong. The accuracy still belongs somewhere, just on a surface whose reader acts on it: commits, ADRs, internal docs, support replies.

- Before: "Deploys now run through the queue consumer instead of the scheduled worker, so the reported timestamp reflects enqueue time."
- After: "Deploys are faster and the timestamp is finally the one you expect."

- Before: "The extraction pipeline currently reads whatever your machines reported installing."
- After: "What you installed, as far as we can tell from your machines."

The pattern in both: the before is accurate, the after is useful.

## Writing Rules

Adapted from ASD-STE100 Simplified Technical English. They govern instructional copy (landing pages, changelogs, docs, onboarding, error and empty states) and act as a check on expressive copy.

1. **Active voice.** Name who acts. "The gate rejected the push", not "the push was rejected".
2. **Present tense.** "The CLI stores the token", not "the CLI will store the token".
3. **One instruction per sentence.** A reader mid-error follows one step at a time. This binds instructions, not posts.
4. **Short sentences, one idea each.** If a sentence needs a second comma, try splitting it first. Fragments still count as one idea and stay allowed.
5. **One term per concept, no synonyms.** Pick the word for a thing and use it everywhere, in the copy and in the product. Varying it for rhythm reads as elegance to the writer and as two different things to the reader. The project's `copywriting-<project>` overlay owns the word when it names one; when it does not, pick one, use it in every surface of the same launch, and say which one you picked.
6. **English, whatever language the input arrived in.** A brief, a voice note, or a Slack thread in Dutch still produces English copy unless Maurice says otherwise.

## Sentence Structure

Prefer: short sentences, punchy fragments for dramatic effect ("At half the cost. While being 4x faster."), line breaks, lists, scannable blocks.

In long-form work, vary the cadence. Use a short line when it earns emphasis, normal sentences for explanation, and a longer paragraph when the thought needs room. A 3,000-word article should not read like 150 tweets glued together.

Avoid: formal grammar policing, overly complex constructions, em dashes (use commas, periods, or line breaks instead), overexplaining the obvious after numbers already make the point, suspiciously symmetrical sections, repeated compulsory triads, and formulaic one-line endings.

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

Treat these as red flags when they do vague marketing work, not a ban on the clearest literal technical term. The user's present wording and meaning always win.

## Banned Sentence Structure: "X isn't just Y. It's Z"

This structure screams AI-generated content. Also banned: the "it's not about A, it's about B" cousin.

- Bad: "What's interesting isn't just the numbers. It's who noticed."
- Good: "The numbers are one thing. Who noticed is another."

## Human Texture

Preserve the evidence of a person having lived the story:

- Specific scenes: walking back to the office because the laptop lid was closed.
- Slightly embarrassing behaviour: anxiously checking account limits or waking every session with "keep going please".
- Opinions with teeth: "coding is solved", "boil the ocean", "stop wanting to keep control".
- Natural vocabulary: chuffed, gunning it, right off rip, buttload, life is good at the prompt factory, what the hell is that doing there.
- Real tensions: more productive and working harder; loving the dopamine and wondering what it does long term; trusting the fleet while still noticing things worth fixing.

Do not sand these into a clean founder narrative. A contradiction is not automatically a problem to resolve. It can be the most believable part of the piece.

Maurice's swagger comes from proof: exact numbers, named tools, screenshots, strange failures, and a claim someone can disagree with. Do not inflate it with superlatives. Do not weaken a deliberate strong claim with reflexive caveats either.

## Common AI Giveaways

Rewrite generic connective tissue that announces a thought instead of delivering it:

- "what I didn't expect was..."
- "here's where it gets interesting"
- "the point is..."
- "this matters because..."
- "the honest version is..."
- "I keep coming back to..."
- "this is the whole game"

Watch for manufactured discovery arcs, crowned superlatives, McKinsey-style summaries, ornamental metaphors about where ideas "live" or what "shapes" them, and a neat inspirational sentence attached to every section.

These are pattern warnings, not forbidden strings. Maurice can use any phrase on purpose. The test is whether the line came from the source and sounds like him, or whether it is generic filler an LLM inserted between two real ideas. When live web access is appropriate, `claudisms.ai` is a useful current supplementary banlist. Maurice's brief and corpus still outrank it.

## Source-Led Voice Sheet

For a substantial piece, make a working voice sheet from the material supplied for that piece. Capture:

- phrases Maurice used without prompting;
- sentence shapes and cadence from comparable published work;
- lived scenes and exact quotes;
- convictions he wants stated without an asterisk;
- unresolved tensions worth keeping;
- words or frames that are technically accurate but foreign to him;
- platform-specific permission, such as how much "bro theatre" suits the audience.

Do not publish the voice sheet. Use it to keep the draft attached to the person rather than to a generic founder persona.

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

- Is every sentence useful to the reader, not merely true?
- Does the meaning land on one read?
- Would cutting anything else cost clarity?
- One term per concept, or did a synonym sneak in for rhythm?
- Does this sound like a builder talking to builders?
- Is this concrete? Is the point concrete enough to disagree with?
- Is there proof, context, or a real example?
- Would Maurice say this out loud on Discord?
- Could this paragraph run under another founder's name without changing a word?
- Did the edit preserve the rough edge, joke, scene, or contradiction that made the source human?
- Does it feel honest?
- Would this feel native on the platform?

If yes, ship it.
