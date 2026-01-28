---
name: questy-mcp
description: Use when interacting with the Questy MCP server to list, create, or complete quests by phone (get_pending_quests_by_phone, create_quest_for_phone, complete_quest_for_phone), including daily reminders and auto-selecting difficulty when the user does not specify it.
---

# Questy MCP

## Purpose

Use the Questy MCP HTTP endpoint to manage user quests by phone number: list pending quests, create new quests, and complete quests. Filter daily quests vs non‑daily, and auto‑choose difficulty when the user doesn’t specify it.

## Quick workflow

1) Use the MCP endpoint and JSON‑RPC format (see `references/api_reference.md`).
2) Call `get_pending_quests_by_phone` to fetch current pending quests.
3) Filter for daily quests:
   - Daily = `recurrence_kind === "every_day"` OR `recurrence_kind === "specific_days"` AND today’s weekday is in `weekdays`.
4) Pick one non‑daily quest to motivate (any `recurrence_kind === "none"`).
5) If asked to create a quest, choose difficulty if the user doesn’t specify it (heuristics below) and call `create_quest_for_phone`.
6) If asked to complete a quest, call `complete_quest_for_phone` with `questId`.

## Difficulty auto‑selection

Use this heuristic when the user doesn’t specify difficulty:
- **E**: tiny tasks (≤5–10 min, trivial effort)
- **D**: short tasks (~10–30 min, simple)
- **C**: medium tasks (30–90 min, some effort)
- **B**: long tasks (1.5–3h, substantial)
- **A**: very long/complex (multi‑hour, high effort)
- **S**: exceptional/major milestones

Examples:
- “Cortar el pasto adelante y en el patio” → **D** or **C** (default to **D** unless user says it’s a big yard)
- “Leer 10 páginas” → **D**
- “Lanzar una beta” → **A** or **S**

## Phone handling

Send only digits (no `+`, spaces, or punctuation). If the user gives a formatted number, strip to digits before calling.

## Safety / confirmation

Completing or creating quests is a data‑write operation. Confirm the target quest (or summarize the new quest) before executing if the user’s intent is ambiguous.
