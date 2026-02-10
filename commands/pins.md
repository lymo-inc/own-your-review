---
name: pins
description: View, manage, and act on insights pinned during code review quizzes. Lists unresolved pins, lets you resolve, export, or clear them.
argument-hint: "[resolve <id> | export [github|linear] | clear-resolved]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - AskUserQuestion
  - mcp__plugin_linear_linear__create_issue
  - mcp__plugin_linear_linear__list_teams
---

You manage review pins — insights that users captured during Own Your Review quiz sessions. Pins are stored in a markdown file and can be exported to GitHub Issues or Linear.

## Setup

1. Read `.github/own-your-review-config.yml` if it exists. Extract:
   - `pins.destination` (default: `markdown`)
   - `pins.file` (default: `.github/review-pins.md`)
   - `pins.github.labels` (default: `["review-insight", "own-your-review"]`)
   - `pins.linear.team` (default: none)
   - `pins.linear.labels` (default: `["review-insight"]`)

2. Read the pins file. If it doesn't exist, report "No pins yet." and stop.

## Subcommands

Parse the user's argument to determine the action:

### No argument — List pins

Show all open pins in a readable table:

```
## Review Pins

### Open ([N])

| # | Date | Category | File | Note |
|---|------|----------|------|------|
| 1 | Feb 10 | Trade-offs | `src/auth.ts:42` | Should use DI |
| 2 | Feb 10 | Security | `lib/api.ts:15` | Token handling |

### Resolved ([M])

| # | Date | Category | Note | Resolved |
|---|------|----------|------|----------|
| 3 | Feb 9 | Intent | Config migration | Feb 10 |
```

If there are no open pins, say "All pins resolved!" and show the resolved table if any exist.

### `resolve <id>` — Resolve a pin

1. Find the pin with the matching number in the pins file under `## Open`.
2. Move it to the `## Resolved` section with a `- **Resolved**: [today's date]` line added.
3. Confirm: `Pin #[id] resolved.`

If the id doesn't match an open pin, show available open pin numbers.

### `export [github|linear]` — Create issues from open pins

If no destination specified, use the configured `pins.destination`. If destination is `markdown`, ask the user which issue tracker to export to.

#### GitHub export

For each open pin, run:
```bash
gh issue create \
  --title "Review insight: [note first 60 chars]" \
  --body "## Review Pin\n\n- **Category**: [category]\n- **File**: \`[file:lines]\`\n- **Quiz question**: [question]\n- **Insight**: [note]\n- **Source**: [quiz scope]\n- **Pinned**: [date]\n\n---\n*Created by [Own Your Review](https://github.com/lymo-inc/own-your-review)*" \
  --label "[configured labels, comma-separated]"
```

Show each created issue URL. After all issues are created, ask if the user wants to mark the exported pins as resolved.

#### Linear export

For each open pin, use the Linear MCP `create_issue` tool:
- **title**: `"Review insight: [note first 60 chars]"`
- **description**: Full context markdown (category, file, question, insight, source, date)
- **team**: Configured `pins.linear.team` (if not configured, use `list_teams` to show available teams and ask the user to pick one)
- **labels**: Configured `pins.linear.labels`

Show each created issue identifier. After all issues are created, ask if the user wants to mark the exported pins as resolved.

### `clear-resolved` — Remove resolved pins

1. Remove all entries under `## Resolved` from the pins file.
2. Keep the `## Resolved` heading (empty section).
3. Report how many resolved pins were cleared.

## Important

- Always preserve the file structure (header, `## Open`, `## Resolved` sections).
- When modifying the file, read it fresh first to avoid stale data.
- Pin numbers are permanent — don't renumber when resolving or clearing.
- If the pins file doesn't exist for any write operation, create it with the standard header first.
