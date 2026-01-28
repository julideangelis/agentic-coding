# Questy MCP API (HTTP)

## Endpoint

- Base URL: `https://questy-mcp.vercel.app`
- MCP endpoint: `https://questy-mcp.vercel.app/mcp`

## Headers

Always send:

```
Content-Type: application/json
Accept: application/json
```

## JSON‑RPC initialize (optional but safe)

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"clawdbot","version":"1.0"}}}
```

## List tools

```json
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

## Call tools

### get_pending_quests_by_phone

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_pending_quests_by_phone","arguments":{"phone":"2664332334"}}}
```

### create_quest_for_phone

```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"create_quest_for_phone","arguments":{"phone":"2664332334","quest":{"title":"Cortar el pasto (adelante y patio)","description":"Cortar el pasto al frente y en el patio","difficulty_rank":"D","recurrence_kind":"none"}}}}
```

### complete_quest_for_phone

```json
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"complete_quest_for_phone","arguments":{"phone":"2664332334","questId":45}}}
```

## Recurrence fields

- `recurrence_kind`: `none` | `every_day` | `specific_days`
- `weekdays`: array of lowercase English weekday names (e.g. `"monday"`, `"tuesday"`)

## Notes

- The endpoint requires `Accept: application/json` or it returns “Not Acceptable”.
- Responses return `result` with `quests`, `count`, or `message` + `rewards` depending on the tool.
