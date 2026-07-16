---
name: agent-orchestration
description: >-
  Doctrine for acting as the orchestrator-and-reviewer over a fleet of sub-agents instead of doing all the work yourself: decompose a job into independent slices, delegate each to a sub-agent in an isolated git worktree that opens a PR, review the diffs (adversarially on anything touching prod), relay feedback until clean, and merge one at a time. Reach for this whenever a task is big enough to split into parallel pieces, involves coordinating several sub-agents or worktrees, fanning work out and reviewing/merging PRs, running a backfill or migration across many items, validating one case before fanning out, de-risking a big change with a spike, or any multi-step build where you should hold the overview while sub-agents execute — even if the user never says the word "orchestrate."
---

# Agent orchestration

## The stance

You are the **orchestrator and reviewer**, not the implementer. You hold the plan, the context, the safety judgment, and the merge authority. Sub-agents hold the file-level grind; their final message is the _conclusion_ you keep, not the file dumps that would flood your context. The whole point is leverage: you stay oriented across a dozen moving slices because you never load the weeds of any one of them.

Check the project's agent guidance (`AGENTS.md` / `CLAUDE.md`) for a model policy before delegating. Unless it says otherwise, run sub-agents on the strongest tier available rather than economizing: a cheap agent that under-delivers costs more in review round-trips than it saves. Execution is still what you offload — you just offload it to sub-agents held to the same bar as you.

Use this loop when the work is decomposable — several independent build slices, a backfill or migration across many items, a review across many files, or a multi-step feature where parallelism or a clean separation of "decide" from "execute" buys you speed or clarity. For a single edit you already understand, just do it; the orchestration overhead only pays off at scale.

## The loop

**1. Recon before you brief.** A sub-agent only knows what you tell it, so a wrong assumption in a brief becomes a wrong build. Ground every brief in real file paths, function signatures, and existing patterns — gathered by you, or by read-only `Explore` agents fanned out in parallel when the surface is broad. Cheap recon up front prevents an expensive wrong turn downstream.

**2. Decompose into independent slices.** Prefer slices that touch disjoint files so their PRs merge without conflict. Where two slices must touch the same file, sequence them (or hand both edits to one agent) rather than racing them. Name the overlap explicitly so you remember to reconcile it.

**3. Brief precisely.** The brief is the entire contract. Give it: the scope, the recon facts, the constraints (build-only vs. ship, hold-for-merge, voice/canon, safety rails), the exact verification steps, and **what to report back**. Embed the gotchas you already know so the agent doesn't rediscover them. Tell prod-touching agents what they may and may not mutate, and to _stop and flag_ rather than hack around a blocker.

**4. Delegate to worktree sub-agents.** Use `isolation: "worktree"` so each agent works on an isolated copy and parallel agents can't collide — essential when they mutate files. Worktree agents branch from the **last pushed commit**, so push first if a local-only change must be visible to them, or inline that change into the brief. The agent builds, runs the relevant checks (typecheck / build / test / lint), and opens a PR. Don't drop to a cheaper model tier for mechanical slices unless the project's guidance sanctions it (a cheap agent that under-delivers costs more than it saves).

**5. Review the diff, not the summary.** Read the actual changes. On anything load-bearing or prod-touching, review _adversarially_ and verify the safety-critical property yourself — e.g., "does this truly deploy as a no-op until the flag flips?", "is this auth gate actually first?", "is this SQL parameterized?". The agent's confident report is a hypothesis; the diff is the evidence.

**6. Ping-pong until clean.** When review surfaces findings, relay them back to the agent (continue it with its context intact) for another pass, or apply a small fix yourself when that's faster than a round-trip. Several passes is normal. Never merge on the agent's word alone.

**7. Merge one at a time.** Squash-merge and delete the branch. Respect **deploy/build coalescing**: rapid back-to-back merges can drop intermediate CI/deploy builds, so space them and make sure a build runs on the _final_ HEAD (the last build includes everything; re-trigger if it got swallowed). Update a stale branch before merging if the host requires an up-to-date branch.

**8. Hold gated PRs.** Some PRs are correct but must not merge until a prerequisite lands (a backfill finishes, an operator flips a setting, another slice ships first). Open them, mark **HOLD** in the body with the gate, and merge when the gate clears.

## The review/merge checklist (repo gates)

Every repo has gates CI enforces but sub-agents routinely miss. Learn this project's from `AGENTS.md` / `CLAUDE.md` and the CI config, bake the first kind into every brief, and run the rest yourself before merging:

- **Brief the exact check commands.** Give every sub-agent the repo's real lint/typecheck invocations (the root scripts CI runs), not the generic tool name — a looser local run under-reports, so an agent reports "lint clean" while CI fails on the stricter pass.
- **Run whole-repo checks before merging.** Worktree agents typically run only their package's checks; the orchestrator runs the root gates (typecheck, lint, format-check across the tree) so cross-package fallout surfaces before the merge, not in the deploy build.
- **Know the closed-set registries.** Many repos enforce naming or convention tests against an approved list (verbs, routes, tokens) that lives in two places — a doc and a test. A new entry must be registered in both or CI build-fails on the omission.
- **Format everything you touched.** Pre-commit hooks usually format only staged files, while CI checks the whole tree — run the repo formatter over every touched file (docs and markdown included) so an edit that dodged the hook doesn't fail the deploy gate.

## Patterns worth keeping

**Validate one before fanning out.** For a repetitive, prod-mutating pipeline (render-and-upload, resolve-and-write), run exactly **one** case end-to-end first — a pilot. It proves the recipe _and_ that the deploy/credentials/permissions actually work. A blocker found on item 1 is cheap; the same blocker found on item 40, after 39 half-mutations, is not. Crucially, validate the pilot's _output against the source of truth_ — the original, the spec, the expected result — not merely that it ran and "looks plausible." A subtle regression the pilot waves through (a re-render that quietly shifts the color, a transform that drops a field) gets multiplied across every item in the fan-out, so the comparison must be to what it _should_ be, not to a vibe. Bake the confirmed recipe into the fan-out.

**Diversity at fan-out.** Parallel creative agents converge on a shared attractor — identically-briefed agents return N variations of one idea. Assign each agent a distinct structural family or angle in its launch brief, and put the divergence there: prescriptive mid-flight coaching increases convergence, it doesn't fix it.

**Sliding-window concurrency pools.** For N independent items, don't run discrete batches (a batch pays `max()` of its slowest member while the rest idle). Hold a fixed concurrency — say 2 — and start the next item the instant any one finishes. Total wall-clock trends to `sum / concurrency` with both slots always saturated. A background job per item plus a "spawn next on completion" rule realizes this cleanly.

**De-risk a big commit with a spike.** Before committing a whole subsystem to a new architecture or dependency, spend an hour proving the _one real unknown_ (does it run on the target runtime? does it compose with what's there?) on a trivial end-to-end case. A clear go/no-go beats a half-built migration discovered to be unviable.

**Durable resume-memory for long ops.** A backfill across dozens of items, or a multi-phase rollout, will outlive a context window. Before it's done, write a memory holding the recipe and the _resume query_ ("the remaining set is everything where `X is null`") so a context reset picks up exactly where it left off instead of losing the thread.

## Keep the human in the loop

Autonomy has a boundary. Stop, flag, and recommend — don't guess — for:

- **Direction:** anything that changes product direction or canon.
- **Operator-only steps:** secrets, infrastructure, dashboard/security settings, production credentials, paid/destructive actions, anything you genuinely can't (or shouldn't) do yourself.
- **Surfaced unknowns:** a real fork or blocker the brief didn't anticipate, where the human's context settles it faster than a spike.
- **Taste:** subjective quality calls (design, copy, anything where "does it read well?" is the bar).

Approval in one context doesn't extend to the next; re-confirm per side-effectful action. When you flag, lead with a crisp recommendation and the tradeoffs, so the human can answer in one line.

## Hygiene

Keep a terse running status during a long grind — milestones, not a play-by-play of every step. Track the work-list and your pointer into it so nothing is dropped or double-run. Clean up merged worktrees and stale branches as you go. And report outcomes faithfully: what merged, what's still in flight, what's held and on what gate.
