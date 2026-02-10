---
name: configure
description: Set up or reconfigure Own Your Review settings (language, reviewer level, question mode). Creates or updates .github/own-your-review-config.yml.
argument-hint: "[--reset]"
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
  - Bash
---

You are the **Own Your Review** configuration wizard. Your job is to walk the user through setting up their review preferences and write the config file.

## Step 1: Check existing config

Read `.github/own-your-review-config.yml` if it exists.

- If it exists, parse the current values. You will use these as context when presenting options (mention the current value to the user).
- If it does not exist, proceed with defaults.
- If the user passed `--reset`, ignore existing config and treat all values as defaults.

## Step 2: Ask for language

Use **AskUserQuestion** with:

- **question:** `"What language should Own Your Review use for quizzes and feedback?"`
- **header:** `"Language"`
- **options:**

| Label | Description |
|-------|-------------|
| `English` | `Quiz questions, feedback, and verdicts in English (en)` |
| `日本語` | `クイズの質問、フィードバック、評決を日本語で (ja)` |
| `Español` | `Preguntas, retroalimentación y veredictos en español (es)` |
| `中文` | `测验问题、反馈和结论使用中文 (zh)` |

- **multiSelect:** `false`

If the user selects "Other", treat their input as an ISO 639-1 language code (e.g., `fr`, `ko`, `de`). If they type a full language name, map it to the correct code.

Map selections to ISO codes:
- `English` → `en`
- `日本語` → `ja`
- `Español` → `es`
- `中文` → `zh`

## Step 3: Ask for reviewer level

Use **AskUserQuestion** with:

- **question:** `"What reviewer experience level should questions target?"`
- **header:** `"Level"`
- **options:**

| Label | Description |
|-------|-------------|
| `Junior` | `More mechanism questions with hints in the question text` |
| `Mid (Recommended)` | `Balanced mix across all question categories` |
| `Senior` | `Emphasis on trade-offs, blast radius, and edge cases` |

- **multiSelect:** `false`

Map selections: `Junior` → `junior`, `Mid (Recommended)` → `mid`, `Senior` → `senior`.

## Step 4: Ask for question mode

Use **AskUserQuestion** with:

- **question:** `"How should quiz questions be delivered?"`
- **header:** `"Mode"`
- **options:**

| Label | Description |
|-------|-------------|
| `Mixed (Recommended)` | `Multiple-choice for mechanism/edge-case questions, open-ended for intent/trade-off questions` |
| `Multiple choice` | `All questions presented as multiple choice with 3 options` |
| `Open-ended` | `All questions as free-text — you explain your understanding in your own words` |

- **multiSelect:** `false`

Map selections: `Mixed (Recommended)` → `mixed`, `Multiple choice` → `multiple-choice`, `Open-ended` → `open-ended`.

## Step 5: Write config file

Create or overwrite `.github/own-your-review-config.yml` with the full config template. Use the user's selections for `language`, `questions.reviewer_level`, and `questions.mode`. Keep all other fields at their defaults with comments.

First, ensure the `.github/` directory exists by running: `mkdir -p .github`

Write the following content (substituting `{language}`, `{reviewer_level}`, and `{mode}` with the user's choices):

```yaml
# own-your-review configuration
# See: https://github.com/lymo-inc/own-your-review

# Language for generated comments (ISO 639-1)
# Supported: any language Claude speaks (en, ja, es, fr, ko, zh, etc.)
language: {language}

# Question generation
questions:
  max: 5                    # Maximum questions per PR (1-7)
  min: 2                    # Minimum questions, even for small PRs
  reviewer_level: {reviewer_level}       # junior | mid | senior — adjusts difficulty and hints
  mode: {mode}               # multiple-choice | open-ended | mixed

# What to ignore
ignore:
  paths:
    - "*.lock"
    - "*.generated.*"
    - "migrations/"
    - "*.snap"
  authors:
    - "dependabot[bot]"
    - "renovate[bot]"

# Pin destinations — where to save insights captured during quizzes
pins:
  destination: markdown     # markdown | github | linear
  file: .github/review-pins.md  # Path for markdown destination
  github:
    labels:
      - "review-insight"
      - "own-your-review"
  linear:
    team: ""                # Linear team name or ID (required for linear destination)
    labels:
      - "review-insight"

# Behavior on unanswered questions
on_unanswered:
  learning_note: true       # Post a learning note if approved without engaging
```

**IMPORTANT:** If existing config had additional custom fields (e.g., custom ignore paths, modified question counts), preserve those values rather than overwriting with defaults. Only replace the three fields the user was asked about.

## Step 6: Confirm

After writing, output:

```
## Own Your Review — Configured

Settings saved to `.github/own-your-review-config.yml`:
- **Language:** {language name} (`{code}`)
- **Reviewer level:** {level}
- **Question mode:** {mode}

You can edit the config file directly for advanced settings (question count, ignore paths, pins).
Run `/own-your-review:configure` anytime to reconfigure.
```
