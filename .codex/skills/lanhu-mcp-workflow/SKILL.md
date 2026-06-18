---
name: lanhu-mcp-workflow
description: Start, verify, and use the local Lanhu MCP service for this repo. Use when the user asks to fetch Lanhu designs, verify a Lanhu page update against blueprints, troubleshoot local Lanhu MCP startup, or fix `127.0.0.1:8765` errors before syncing UI code.
---

# Lanhu MCP Workflow

Use this skill to turn the local Lanhu MCP service into a repeatable part of the page-sync workflow.

## Quick route

1. Check whether `http://127.0.0.1:8765/health` is reachable with a no-proxy client.
2. If it is not reachable, inspect the local Codex MCP config and start the existing Lanhu MCP project.
3. Verify the port is listening.
4. Initialize an MCP session, send `notifications/initialized`, then call the required Lanhu tool.
5. Use the returned design names, screenshots, slices, or AI analysis to update the matching uni-app page.

Read [references/local-mcp-commands.md](references/local-mcp-commands.md) when you need the exact working commands for this machine.

## Local rules

- Treat proxy-based `502 Bad Gateway` results as suspicious first. This machine exposes `http_proxy`, `https_proxy`, and `all_proxy`, so Lanhu checks must use `curl.exe --noproxy "*"` or an equivalent no-proxy request path.
- Check `C:\Users\迅影\.codex\config.toml` before assuming Codex can auto-launch Lanhu MCP. As of `2026-05-24`, this repo has no Lanhu MCP server entry there.
- Prefer the existing local Lanhu MCP install instead of cloning another copy.
- Keep Lanhu as the UI source of truth and keep Likeshop logic unless the design changes behavior.

## Startup workflow

### 1. Verify the service

Use the health endpoint first:

- `curl.exe --noproxy "*"` against `http://127.0.0.1:8765/health`
- If it returns `200` with `{"status":"ok"}`, continue to MCP requests.

If health fails, also check whether port `8765` is listening. If the health check fails and the port is closed, start the local service.

### 2. Start the local service

The known working local project lives at:

- `C:\Users\迅影\Documents\Codex\2026-05-08\https-lanhuapp-com-web-item-project\tools\lanhu-mcp`

Use that project’s virtualenv Python and run `lanhu_mcp_server.py` from the project root. On Windows, start it in the background with hidden window style and capture logs.

Before starting, confirm:

- `.env` exists
- `LANHU_COOKIE` is already filled with a real cookie

### 3. Verify after start

After starting, confirm both of these:

- `Get-NetTCPConnection -LocalPort 8765` shows a listening process on `127.0.0.1:8765`
- `curl.exe --noproxy "*"` to `/health` returns `200 OK`

## MCP request workflow

### 1. Initialize

Send an `initialize` request to `http://127.0.0.1:8765/mcp` with:

- `Accept: application/json, text/event-stream`
- `Content-Type: application/json`

Capture the `mcp-session-id` response header.

### 2. Mark initialized

Send `notifications/initialized` with the same `mcp-session-id`.

### 3. Call tools

Then call one of:

- `lanhu_get_designs` to list project designs
- `lanhu_get_ai_analyze_design_result` to get design analysis and HTML/CSS-style output
- `lanhu_get_design_slices` to fetch cut assets
- `lanhu_get_pages` or other Lanhu tools as needed

## Repo-specific usage

- Lanhu project URL:
  `https://lanhuapp.com/web/#/item/project/stage?tid=f16a74ff-934a-475f-a9ba-9bca1be3077c&pid=ccd8783f-09fe-4467-98c5-60bfe75a3f40`
- Lanhu screenshots and assets belong under `static/lanhu/`
- Lanhu-to-page mapping lives in `static/lanhu/LANHU_PAGE_MAP.md`
- Existing Lanhu wrappers live under `bundle/pages/lanhu_pages/` and `bundle/pages/lanhu_scene/`

For the `商街` page, first pull the latest design metadata from Lanhu, then update the existing street wrapper/page instead of rebuilding page routing from scratch.

## Practical notes

- A successful `lanhu_get_designs` call on `2026-05-24` showed project `商城小程序` with `36` designs, and design index `1` was `商街`.
- If MCP is healthy but a tool call still fails, inspect the Lanhu MCP stdout/stderr logs in the local Lanhu MCP project folder.
- Keep this skill focused on startup and fetch flow. Use `lanhu-upload-and-replace` when the job is specifically about uploading Lanhu images to the project server and backfilling code URLs.
