# own-your-review

> Stop vibe-merging. Start understanding.

Most AI code review tools review code *for* you. This one makes sure *you* reviewed the code.

**own-your-review** generates comprehension questions from your PR diff that can only be answered if you actually read and understood the changes. Think of it as [Gate 1 from ownyourcode](https://github.com/DanielPodolsky/ownyourcode) — applied to every pull request.

## The Problem

AI code generation has created a new failure mode: **vibe merging**. CI passes, the diff looks reasonable, the reviewer hits "Approve" — without genuinely understanding what changed.

Existing AI PR tools make this *worse*. They review code *for* you, further removing the human from the loop.

## How It Works

```
PR opened → Analyze diff → Generate comprehension questions → Post as PR comment
                                                                       │
PR approved → Check if questions were engaged with → Learning note if not
```

When a PR is opened, own-your-review posts questions like:

> ### 🔍 Own Your Review
>
> Before approving, make sure you can answer these:
>
> **Intent**
>
> - [ ] What problem does the new `RetryQueue` class solve that the existing error handling didn't address?
>
> **Mechanism**
>
> - [ ] Trace what happens when a job fails for the 3rd time with `maxRetries: 3` — what state transitions occur?
>
> **Edge Cases**
>
> - [ ] What happens if the Redis connection drops mid-retry? Is there a risk of duplicate execution?

If the reviewer approves without checking any boxes, a short learning note is posted summarizing the key concepts they should understand.

**It never blocks merges.** It creates awareness and builds comprehension habits.

## Quick Start

### Option A: CLI (fastest)

```bash
npx @lymo-inc/own-your-review init
# or
bunx @lymo-inc/own-your-review init
```

### Option B: Manual setup

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

      - uses: lymo-inc/own-your-review@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

1. Add your API key as a repository secret:

```bash
gh secret set ANTHROPIC_API_KEY
```

1. Open a PR. That's it.

### Auth Options

| Method | Secret name | Best for |
|--------|------------|----------|
| **API key** (recommended) | `ANTHROPIC_API_KEY` | Teams, reliable billing |
| **OAuth token** | `CLAUDE_CODE_OAUTH_TOKEN` | Claude Max subscribers (tokens expire ~24h) |
| **AWS Bedrock** | Set `use_bedrock: "true"` | AWS-native teams |
| **GCP Vertex** | Set `use_vertex: "true"` | GCP-native teams |

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
