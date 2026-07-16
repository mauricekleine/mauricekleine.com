# Examples And Patterns

Use these as style references, not as text to copy. They distill patterns from Maurice's post archive. Product names in examples are placeholders; swap in the current project's facts and terminology (from its `copywriting-<project>` overlay).

## Concrete timeline openers

Maurice often starts with a specific moment:

- "Yesterday evening I installed..."
- "By midnight..."
- "I spent months..."
- "Last week..."

Why it works: the post feels observed, not manufactured.

## Specific tool stack

Mention the actual tools when relevant (Claude Code, Bun, Firecracker, Hetzner, OpenRouter, whatever was really used). Named tools make the post credible. Never name tools that weren't actually in the stack.

## Three-example pain list

Use three concrete examples instead of one generic complaint:

```
The problem was not "agent setup is hard."

It was:

- where do I paste the API key?
- why does this need a browser session?
- what happens to the files after the run?
```

## Outcome before category

Lead with the reader's concrete problem, then name the category or product.

Good:

```
Your agent needs somewhere to live.

Not metaphorically. Literally: files, packages, a browser session, secrets, and state it can come back to.
```

Weak:

```
<Product> is a platform that revolutionizes <category>.
```

## Distinction without defensiveness

When positioning against alternatives, acknowledge what they solve before drawing the line:

```
<Alternative> solves part of this.

But once <specific condition>, you need <the thing the product does>.
```

## Jargon in plain English first

Explain the outcome before naming the internal term:

```
You should be able to try tool A today and tool B tomorrow without rebuilding the whole setup around either one.

We call that <term>.
```

## Example LinkedIn draft shape

```
The model API is the easy part.

That sounds wrong until you watch an agent do real work.

Suddenly it needs:

- files that survive the run
- packages it can install
- browser sessions
- secrets
- a place to put artifacts

At that point you are not just choosing a model.
You are choosing where the agent lives.

That is the part we're building around.
```

## Example X thread shape

```
1/ the model api is the easy part

2/ real agents need somewhere to live:
files
packages
browser state
secrets

3/ once those things matter, "just run it in a sandbox" gets too vague

4/ that's the layer we're building
```

## Example blog lead shape

```
Most agent projects start with a model call.

Then the workload grows. The agent needs to read files, install packages, open a browser, and hold onto state.

That is where the real question starts.
```

## Red Flags

Rewrite if the draft:

- Reads like a company page instead of Maurice.
- Sounds like generic AI thought leadership.
- Starts with "In today's fast-paced..."
- Claims proof the product has not earned.
- Uses "seamless," "robust," "revolutionary," "leverage," or "enterprise-grade."
- Uses an em dash.
- Relies on "X isn't just Y. It's Z."
- Ends with "Agree?" or a hashtag stack.
