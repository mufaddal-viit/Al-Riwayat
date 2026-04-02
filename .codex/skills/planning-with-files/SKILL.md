---
name: planning-with-files
description: Implements file-based planning for complex work. Use when asked to plan, break down, organize, or track a multi-step project, research task, debugging effort, or any task likely to require more than a handful of tool calls. Creates and maintains task_plan.md, findings.md, and progress.md in the project root so work can survive long sessions and context resets.
---

# Planning With Files

Use markdown files in the project root as persistent working memory for complex tasks.

## Purpose

This skill is for work where important context will drift or be lost unless it is written to disk.

Use these files in the project root:

- `task_plan.md` for phases, decisions, and status
- `findings.md` for discoveries, research, and external information
- `progress.md` for a chronological work log, test results, and error history

Templates live in this skill folder under `templates/`. The working copies belong in the project root, not in the skill folder.

## Required Workflow

Follow these steps in order.

### 1. Restore Context First

Before doing anything substantial:

1. Check whether `task_plan.md`, `findings.md`, or `progress.md` already exist in the project root.
2. If they exist, read them before making decisions or taking more actions.
3. If they do not exist and the task is complex, create them from the templates in this skill.

If there are existing planning files and the worktree has changed since the last session, reconcile the files with the current repo state before continuing.

## 2. Create the Three Files for Complex Tasks

For any non-trivial task, create these files in the project root:

- `task_plan.md`
- `findings.md`
- `progress.md`

Use the templates in `templates/` as the starting structure.

## 3. Keep the Plan Current

Before major decisions, re-read `task_plan.md`.

After each phase:

- update the current phase
- mark status changes
- record important decisions
- record errors and how they were resolved

## 4. Capture Discoveries Early

After every two browse, search, or view-style actions, write the important takeaways into `findings.md`.

This is especially important for:

- screenshots
- browser output
- large docs
- visual inspection
- one-off command output that may matter later

Do not rely on volatile context for this information.

## 5. Maintain a Work Log

Use `progress.md` as the running log of what happened.

Add:

- phases started or completed
- files changed
- tests run
- failures encountered
- follow-up work added after initial completion

## 6. Error Handling Rules

Log all meaningful errors.

Never repeat the same failed action without changing the approach. Use this pattern:

1. Diagnose and apply the direct fix.
2. If it fails again, try a materially different approach.
3. After repeated failures, step back, update the plan, and escalate if needed.

## File Boundaries

- Put project planning files in the repository root.
- Keep large external or untrusted content in `findings.md`, not `task_plan.md`.
- Keep `task_plan.md` concise and decision-oriented.

## When To Use

Use this skill for:

- multi-step implementation tasks
- repo-wide refactors
- research-heavy tasks
- debugging tasks with multiple branches of investigation
- any task where session recovery matters

Skip this skill for:

- simple one-shot questions
- tiny edits
- short answers that do not need phase tracking

## Templates

Use these template files when creating the working copies:

- `templates/task_plan.md`
- `templates/findings.md`
- `templates/progress.md`

## References

Read `reference.md` for the reasoning behind the workflow and `examples.md` for examples.
