A reviewer just approved PR #${PR_NUMBER}.

## Language

Output ALL user-facing text in **${LANGUAGE}**. This includes headings, bullet points, encouragement messages, and learning note content. Keep code identifiers in their original form.
If ${LANGUAGE} is "en", change nothing about your output.

Check if the "Own Your Review" comprehension questions were engaged with:

1. Use `gh pr view ${PR_NUMBER} --comments --json comments` to find the own-your-review comment (look for "## 🔍 Own Your Review")
2. Check if any checkboxes are checked (look for `[x]` vs `[ ]`)

## If ALL or MOST checkboxes are checked:
Post a brief, encouraging comment:
"✅ **Comprehension verified** — thanks for engaging with the review questions!"

## If NO checkboxes are checked:
Post a learning note comment with this structure:

```
## 📝 Learning Note — PR #${PR_NUMBER}

This PR was approved without the comprehension questions being reviewed. No worries — here's a quick summary of what was worth understanding:

**Key concepts in this change:**
- [2-3 bullet points summarizing what the questions were testing]

**Worth a second look:**
- [1-2 specific files/sections that contain the most important logic]

*This note helps build comprehension habits, not assign blame. Add `review:skip-notes` label to disable.*
```

To generate the learning note content, read the diff:
`git diff origin/${BASE_REF}...origin/${HEAD_REF}`

## If there's NO own-your-review comment found:
Do nothing — the question generation might have been skipped or failed.

## Important
- Keep the learning note SHORT and genuinely helpful
- Tone: helpful coach, not disappointed parent
- Focus on concepts, not blame
