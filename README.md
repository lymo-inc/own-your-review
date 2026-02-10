# own-your-review

> Stop merging things you don't understand.

Most AI code review tools review code *for* you. This one makes sure *you* reviewed the code.

**own-your-review** generates comprehension questions from your PR diff that can only be answered if you actually read and understood the changes. Think of it as [Gate 1 from ownyourcode](https://github.com/DanielPodolsky/ownyourcode) — applied to every pull request.

## The Problem

AI code generation has created a new failure mode: **vibe merging**. CI passes, the diff looks reasonable, the reviewer hits "Approve" — without genuinely understanding what changed.

Existing AI PR tools make this *worse*. They review code *for* you, further removing the human from the loop.



## Quick Start

### Option A: Claude Code Plugin (interactive quiz)

Install the plugin in Claude Code:

```text
/plugin marketplace add lymo-inc/own-your-review
/plugin install own-your-review@own-your-review
```

Then run on any branch with changes:

```text
/own-your-review:quiz-me
```

This starts an interactive Socratic quiz — questions one at a time, with feedback on your answers and a comprehension score at the end. You can also target specific files or commits:

```text
/own-your-review:quiz-me src/auth.ts
/own-your-review:quiz-me abc123..def456
/own-your-review:quiz-me --staged
```

### Option B: GitHub Action (automated on PRs)

Set up with the CLI:

```bash
npx @lymo-inc/own-your-review init
```

Or with Bun:

```bash
bunx @lymo-inc/own-your-review init
```

### Option C: Manual setup

1. Create `.github/workflows/own-your-review.yml`:

```yaml
name: Own Your Review

on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
  pull_request_review:
    types: [submitted]

concurrency:
  group: own-your-review-${{ github.event.pull_request.number || github.event.issue.number }}
  cancel-in-progress: false

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: lymo-inc/own-your-review@v0.2
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Configuration

Optionally create `.github/own-your-review-config.yml`:

```yaml
questions:
  max: 5                    # Max questions per PR (1-7)
  min: 2                    # Min questions
  reviewer_level: mid       # junior | mid | senior

ignore:
  paths:
    - "*.lock"
    - "*.generated.*"
    - "migrations/"
  authors:
    - "dependabot[bot]"

on_unanswered:
  learning_note: true       # Post learning note if approved without engaging
```

### PR Labels

- `review:skip` — Skip comprehension check for this PR
- `review:quick` — Reduce to minimum questions

## Question Categories

| Category | What it tests | When it's used |
|----------|--------------|----------------|
| **Intent** | Why this change exists | Every PR |
| **Mechanism** | How the code works | New logic, algorithms |
| **Blast Radius** | What else is affected | Type/API/shared code changes |
| **Edge Cases** | Boundary thinking | New conditionals, error paths |
| **Trade-offs** | Design decisions | Architecture choices |
| **Security** | Trust boundaries | Auth, user input, data exposure |

## License

MIT

## Credits

- [ownyourcode](https://github.com/DanielPodolsky/ownyourcode) — the philosophy
- [claude-code-action](https://github.com/anthropics/claude-code-action) — the runtime
- Built by [Lymo](https://lymo.jp)
