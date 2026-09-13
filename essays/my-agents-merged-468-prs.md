# My agents merged 468 PRs in 23 days. I didn't read a single one of them.

2026-08-25 · first posted on [x](https://x.com/mauricekleine/status/2092245356872429910) and [linkedin](https://www.linkedin.com/pulse/my-agents-merged-468-prs-23-days-i-didnt-read-single-one-kleine-76lge/)

![](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/01.jpg)

I didn't skim them. I didn't open the files to check whether the agents had done something stupid.

Most days I only saw PR titles, maybe a description, and comments if an AI reviewer found something worth fixing.

They also completed 537 successful tickets and burned through 36.2 billion tokens.

![Hyperspeed usage dashboard after 23 days, showing 36,246,791,518 tokens used since August 2 at an average of 65,215 tokens per second. The record is 181,878 tokens per second.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/02.jpg)

## I was already using agents wrong

A month ago I regularly had 4 to 10 Claude and Codex sessions open across two or three projects in Superset.

I brainstormed in one tab while another agent implemented. A third reviewed PRs. Finished agents sat in whichever tabs I had forgotten to check, waiting for the next instruction.

I had stopped reading most of the code, but I was still the message bus.

I switched tabs. Repeated the same instructions. Checked whether agents were still moving.

I watched my account usage because when the primary subscription drained, every active session stopped with red text. Then I logged out, logged into another account, visited every tab and typed "keep going please".

If I forgot to run caffeinate, the machine slept. If I closed the lid, the factory closed too.

At one point I put my open MacBook on the passenger seat before a 45-minute drive to a client because apparently that was my idea of autonomous coding.

![An open MacBook running several coding-agent sessions on the passenger seat of my car, plugged into a power cable before a 45-minute drive to a client.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/03.jpg)

## Coding is solved

A few days ago, Anthropic's @bcherny said:

![X post by Anthropic engineer Boris Cherny reading: “Coding is solved, bugs are not yet solved. Fix incoming.” Posted August 21, 2026, with 1.8 million views.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/04.jpg)

I think he's right.

The models can search a codebase, make the change, write tests, run checks, open a PR, review each other's work and fix the findings.

I was still managing the tabs, account limits, wake-ups, reviews and merges around the coding.

I was walking back to my office one day feeling stressed because my MacBook lid was closed. Nothing was running. All those capable agents were sitting there doing fuck all until I got back.

That was the stupid bit.

I had hired a fleet and given myself the job of continuously walking past everyone's desk to ask whether they were still working.

Always-on supervisor agents could handle the tab switching, account routing, follow-ups, reviews and merges. I call them chiefs. I could spend my context window on decisions that needed me.

So I built Hyperspeed.

## My job is planning now

I used to be extremely anal about code.

I loved linters and formatters. I sorted imports, exports and properties alphabetically. I read the code meticulously.

Functions eventually became black boxes. Something goes in, something comes out, the contract holds.

Now entire features are black boxes. I define the boundaries, decisions, validations and rollout, then let the agents handle the implementation.

I brainstorm for hours. I run multiple sessions using @mattpocockuk grill-me skill. My agents research with @firecrawl. We make diagrams, small HTML pages and generated images because they are easier to skim than another 4,000-word markdown document.

A serious planning session can take four hours. It covers the problem, outcome, architecture, exclusions, migration, acceptance criteria, dependencies, rollout and exact validation commands.

Hyperspeed splits that plan into tickets and executes them overnight.

The next morning I run the dev command and inspect the product, not the code.

## How Hyperspeed works

Hyperspeed is my always-on AI coding workstation. It runs on a dedicated Hetzner server called Soliton.

I turn plans into small tickets. Each ticket names the scope, acceptance criteria and commands that prove the work is done.

An always-on chief watches the queue, finds the next ticket whose dependencies are done, chooses an account and model, then starts a coding agent in an isolated checkout. That agent opens a PR. Green CI triggers a focused AI review. A clean review merges, and most of my repositories deploy from main.

Discovered work returns to the inbox for my approval instead of quietly expanding the current PR into a monster.

When the fleet needs a real decision, I get a Telegram message.

![Diagram of Hyperspeed. Plans enter a git-backed queue from T3 Code. Chiefs route tickets by account and model to isolated Claude, Codex and local workers. Pull requests pass through CI, focused AI review, merge and deployment. Telegram handles decisions, while a dashboard tracks outcomes.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/05.jpg)

The chiefs wake up every few minutes and keep the queue moving.

## Five PRs before midnight

One of those runs built a new owner dashboard for Waimakers OS, the internal AI operating system where I work.

The plan covered the backend contracts, shared shell, signed-in home, a six-lane commitments board and the detail panel.

The plan was committed at 16:26. Five dependent tickets entered the queue at 16:47.

Hyperspeed routed the backend work to Codex and the interface work to Claude. The fleet opened five PRs. Every one passed its first review cycle. I answered zero questions.

The final PR merged at 23:33. About seven hours from committed plan to a complete owner dashboard while I did other work.

![Wide Hyperspeed queue showing many tickets moving in parallel through Inbox, Ready, Claimed, Review, Approved, Blocked and Done. Tickets belong to several projects, including Hyperspeed, Waimakers OS, Soliton, Pact and Fluncle.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/06.jpg)

The plan had already made the decisions. Dependencies were explicit. Each ticket had commands for checking the result.

Shitty planning produces shitty autonomous work. Shitty validation does too.

## The validation stack is the actual boss

An agent cannot know whether its implementation works if your repository cannot tell it.

Linters. Formatters. Unit tests. Integration tests. Smoke tests. Browser tests. Preview environments. Visual regression tests. Post-deploy checks.

Every useful check removes something the agent would otherwise have to guess.

Weak tests do not rule out autonomous coding. Codex is great at writing tests. Spend an afternoon improving the coverage and remove the excuse.

My rule here comes from @garrytan's [gstack ethos](https://github.com/garrytan/gstack/blob/main/ETHOS.md#1-boil-the-ocean), which expands on his [Boil the Ocean](https://garryslist.org/posts/boil-the-ocean) essay:

> AI-assisted coding makes the marginal cost of completeness near-zero.

Fix the real problem. Add the tests and docs. Tie off the dangling threads. Stop proposing a workaround when the permanent solve is within reach.

Boil the ocean.

## Account limits stopped being my problem

I currently run six paid accounts on Soliton:

- 4 Claude Max 20x accounts
- 2 Codex Pro 20x accounts

Four accounts route to individual projects. One Claude and one Codex account provide fallback capacity.

![Hyperspeed account-routing dashboard showing primary accounts assigned to individual projects and two reserve accounts. Usage bars show session, weekly and model-specific capacity, including temporarily drained accounts alongside available fallbacks.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/07.jpg)

Each ticket names its repository. Hyperspeed uses that to select the project's primary account. If the account is temporarily drained, it falls back to a compatible account with availability.

No rushed claude login five minutes before a session limit runs out. No stopped fleet. No visiting every active session to type "keep going please".

This is the fun (amateur) maximalist version. You do not need six accounts.

I would start with two. Two accounts from one provider give you fallback. One Claude and one Codex account give you cross-provider routing. Either gives you the useful part without immediately setting your wallet on fire.

## Route the work, not your loyalty

Running Claude and Codex side by side also gives me data I could never get from somebody else's benchmark.

I see which models finish, which PRs merge cleanly, where reviews pile up and what outcomes cost.

![First-pass merge rates by model and reasoning effort. Luna xhigh scores 96 percent across 26 runs, Sol high 91 percent across 23, and Opus high 88 percent across 25. Several smaller samples score 100 percent.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/08.jpg)

The usage view below is a 24-hour slice, not lifetime usage.

![Hyperspeed token usage by model over the previous 24 hours. GPT-5.6 Sol High leads with 1.2 billion tokens and 51 percent of usage, followed by Claude Opus 5 High with 538.8 million and GPT-5.6 Terra High with 264.7 million.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/09.jpg)

Planning and difficult architecture go to expensive Claude models like Opus or Fable. Straightforward, well-specified execution can go to cheaper Codex models like Terra and Luna.

Throughput stayed high. Spend dropped.

Fable-high is one of my worst performers on clean merges. It does too many extra things and keeps tripping reviewers. Those numbers come from my repositories, prompts and review rules. Somebody else's leaderboard cannot tell me that.

I tweak the routing from there.

## Soliton, the box under my desk that isn't under my desk

Soliton came from a Hetzner server auction. Older hardware is often plenty for this.

Parallel agents, tests, browsers and builds want CPU, RAM and fast storage. The machine matters more than its release year. A GPU only matters if you plan serious local inference.

The box:

|          | Soliton                       |
| -------- | ----------------------------- |
| CPU      | AMD Ryzen 7 7700              |
| Cores    | 8 cores / 16 threads          |
| RAM      | 64 GB                         |
| Storage  | 2 x 1 TB Samsung NVMe, RAID 1 |
| Cost     | About €100/month              |

The MacBook can sleep. The lid can close. I can leave the house. Soliton keeps working.

On this box I can run Qwen at 5 to 7 tokens per second for cheap jobs that do not need speed. Claude and Codex use the paid accounts already logged in on Soliton.

## T3 finally made the server feel good from a phone

SSH from a MacBook was fine. SSH from an iPhone through Termius was fucking tedious.

Scrolling broke. Copying responses also copied terminal newlines. Connections dropped even with mosh, and tmux left stranded sessions.

Two days ago I moved to T3 Code by @theo. It gives the coding agents on Soliton a chat interface.

Chats sync across devices. Copy works. Scrolling works. I can move from Mac to phone without playing terminal archaeology.

I have only used it for a few days, so time will tell. Right now I am chuffed with it.

## Telegram is where the factory taps me on the shoulder

I only want the exceptions.

Hyperspeed sends critical notifications to Telegram when a ticket is blocked, a check fails or the fleet needs a decision. Draft tickets also arrive here for one-tap approval.

![Telegram notification for a Hyperspeed ticket titled “Restore the nightly auditor by moving it off subscription auth onto an Anthropic API key.” The ticket is ready, with buttons to approve or cancel it.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/10.jpg)

If work is blocked, I can answer from my phone, confirm the proposed answer, and the chief continues.

I can also ramble into a voice note while walking. An agent turns it into an unapproved work draft that waits in the inbox until I am ready to plan or approve it.

Ideas no longer wait in Notion until I am back at my desk. Blocked work no longer sits there because I went outside.

## AI reviewers will happily review you to death

My first review setup nearly froze the whole fleet.

Tickets ping-ponged between Ready and Review. Accounts burned through their limits arguing about findings. Work that was basically finished stopped moving.

If you ask AI to find something wrong with a PR, it will.

Machine checks go first. Review prompts ask for material defects, not a list of clever improvements. Cycles are capped at two. If the second AI review still finds a material problem, the ticket blocks and comes to me.

Without a stopping rule, your agents will spend the entire night polishing each other's belt buckles.

## The backlog can come from anywhere

Hyperspeed starts with tickets I planned, but work can be found elsewhere.

One project wakes an agent every night to audit UI, security or copy. Waimakers OS reads colleague feedback, fixes it and hands the PR to another agent. A clean review merges and deploys.

The backlog could be Sentry, PostHog, Cloudflare logs, customer feedback or a security audit.

In Hyperspeed, those signals would create unapproved drafts in my inbox. I decide which become tickets. Cron can remember to inspect Sentry; I still decide what enters the queue.

## Give the fleet recoverable power

The agents can create worktrees, modify code, install dependencies, use the secrets assigned to their projects, open PRs, review, merge and deploy. Most of my repositories deploy from main.

Anything recoverable is fair game.

Bad commits can be reverted. CI can be fixed. Staging can be rolled back. Business-critical data is backed up on a schedule. Where I have post-deploy checks, a broken release can be reverted or handed to another agent to fix.

I worry about harder-to-recover failures: leaked secrets, runaway spend and access that reaches beyond one project.

Every paid API key I give the fleet has a provider-side spending limit. I would be extremely anxious giving it an uncapped key. The agents currently share one 1Password service account. I want accounts per project so each chief only sees the secrets it needs.

Provider-side caps control spend. Backups make data recoverable. Credentials with broader control stay outside the fleet.

## The bottlenecks moved

I am the most productive I have ever been. I am also working harder than ever.

Any idea feels within reach now. Something that used to feel like six months of work feels like one serious planning day and 48 hours of execution while I work on something else.

The accomplishments create a ridiculous dopamine loop. My creative brain loves it. I am not convinced my body does.

My own context window is becoming the bottleneck. Thoughts arrive faster than I can type or speak them.

Merges are sequential. CI is slow. UI still needs visual judgment. When several people point their fleets at one repository, PRs arrive faster than CI and review can process them.

I work mostly on greenfield projects, where this works incredibly well. Legacy code with hidden rules and years of accidental behaviour needs its own planning, validation and approval rules.

Good. Build the planning, tests and approval rules that codebase needs.

## I am not giving you my workstation

People keep asking me to open source Hyperspeed.

The repository is wired into Soliton, my accounts, my projects and the way I work. Stripping that out would be a buttload of work. You would still need to rebuild half of it for your own setup.

Hyperspeed is my desk. It is my workstation. It is how I earn a pay cheque now.

Nobody ever asked for a clone of somebody else's MacBook. We stole the good ideas and configured our own.

Do that here.

What I can give you is the useful bit:

- an always-on machine you can reach from anywhere
- a durable queue with small tickets and explicit dependencies
- supervisor agents that route tickets and keep the queue moving
- coding agents isolated per ticket, with enough authority to finish
- tests and checks that can judge the result
- focused review with a hard cycle limit
- fallback accounts and rules for choosing models
- numbers from your own outcomes, not generic benchmarks
- notifications for decisions that need you
- spending limits, backups and recoverable deployment

Start with one repository, two accounts and a modest server. Put Claude, Codex and OpenCode on it. Create a queue and wake a supervisor agent every ten minutes. Let coding agents open PRs and review green CI. Merge automatically when there are no material findings.

![GitHub contributions chart from May through August. Activity becomes almost continuously dark green during the final four weeks, with a slightly calmer last week.](https://www.mauricekleine.com/essays/my-agents-merged-468-prs/11.png)

## Give this article to your coding agent

You do not need my code to start. Copy this into the planning model you trust most:

```plaintext
I want to build an always-on autonomous coding-agent workstation for my own projects.

Interview me before proposing the system. Understand:
- the repositories and project types I work on
- how I plan, execute, review, merge and deploy
- which coding-agent providers and subscriptions I use
- what can be automated and what requires my approval
- my CI, tests, previews and production checks
- where secrets live and which credentials have spend limits
- how I want to access the system across devices
- where blocked work and critical alerts should reach me
- my server and model budget

Then design my version:
- a durable ticket inbox and queue
- a planning workflow for small tickets with acceptance criteria and validation steps
- always-on supervisor agents that resolve dependencies and route work
- one isolated coding-agent worker per ticket
- account fallback when a subscription is temporarily drained
- model routing based on difficulty, cost and outcomes
- machine-first validation, focused AI review and a hard review-cycle limit
- merge rules that require green CI and focused review
- post-deploy checks, rollback behaviour and explicit human approval gates
- discovered-work intake that requires my approval
- telemetry for tokens, cost, findings and outcomes
- cross-device access and exception notifications
- backups, spend caps, secret boundaries and recovery paths

Do not clone somebody else's architecture blindly. Challenge my assumptions, identify the weakest validation points and propose the smallest end-to-end version I can run first.

End with:
1. an architecture diagram
2. the minimum server specification
3. the first five implementation tickets in dependency order
4. acceptance criteria and validation commands for every ticket
5. the decisions that still require my input

Do not implement anything until I approve the design. After approval, build the smallest end-to-end version, run its validation commands and stop at every approval gate we agreed.
```

You will make a few mistakes. That is how you learn which knobs matter for your work.

Start with one repository. Let the system merge one PR you did not read.

Then 2.

Then 10.

Coding is solved.

Boil the ocean.
