# Local MCP Commands

These are the commands that worked on this machine on `2026-05-24`.

## 1. Check proxy variables

The shell environment may have:

- `http_proxy=http://127.0.0.1:7890`
- `https_proxy=http://127.0.0.1:7890`
- `all_proxy=socks5://127.0.0.1:7890`

Because of that, always use a no-proxy request for local Lanhu MCP checks:

```powershell
curl.exe --noproxy "*" -i -s http://127.0.0.1:8765/health
```

## 2. Start Lanhu MCP

Known working root:

```text
C:\Users\迅影\Documents\Codex\2026-05-08\https-lanhuapp-com-web-item-project\tools\lanhu-mcp
```

Background start command:

```powershell
Start-Process `
  -FilePath 'C:\Users\迅影\Documents\Codex\2026-05-08\https-lanhuapp-com-web-item-project\tools\lanhu-mcp\.venv\Scripts\python.exe' `
  -ArgumentList 'lanhu_mcp_server.py' `
  -WorkingDirectory 'C:\Users\迅影\Documents\Codex\2026-05-08\https-lanhuapp-com-web-item-project\tools\lanhu-mcp' `
  -WindowStyle Hidden `
  -RedirectStandardOutput 'lanhu-start.out.log' `
  -RedirectStandardError 'lanhu-start.err.log'
```

Verify:

```powershell
Get-NetTCPConnection -LocalPort 8765
curl.exe --noproxy "*" -i -s http://127.0.0.1:8765/health
```

## 3. Initialize MCP session

```powershell
curl.exe --noproxy "*" -i -s -X POST http://127.0.0.1:8765/mcp `
  -H "Accept: application/json, text/event-stream" `
  -H "Content-Type: application/json" `
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2025-03-26\",\"capabilities\":{},\"clientInfo\":{\"name\":\"codex-local\",\"version\":\"1.0.0\"}}}"
```

Read the `mcp-session-id` header from the response and reuse it below.

## 4. Send initialized notification

```powershell
curl.exe --noproxy "*" -s -X POST http://127.0.0.1:8765/mcp `
  -H "Accept: application/json, text/event-stream" `
  -H "Content-Type: application/json" `
  -H "mcp-session-id: <session-id>" `
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\",\"params\":{}}"
```

## 5. List or fetch designs

Project URL:

```text
https://lanhuapp.com/web/#/item/project/stage?tid=f16a74ff-934a-475f-a9ba-9bca1be3077c&pid=ccd8783f-09fe-4467-98c5-60bfe75a3f40
```

List project designs:

```powershell
curl.exe --noproxy "*" -s -X POST http://127.0.0.1:8765/mcp `
  -H "Accept: application/json, text/event-stream" `
  -H "Content-Type: application/json" `
  -H "mcp-session-id: <session-id>" `
  -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"lanhu_get_designs\",\"arguments\":{\"url\":\"https://lanhuapp.com/web/#/item/project/stage?tid=f16a74ff-934a-475f-a9ba-9bca1be3077c&pid=ccd8783f-09fe-4467-98c5-60bfe75a3f40\"}}}"
```

Get AI analysis for `商街`:

```powershell
curl.exe --noproxy "*" -s -X POST http://127.0.0.1:8765/mcp `
  -H "Accept: application/json, text/event-stream" `
  -H "Content-Type: application/json" `
  -H "mcp-session-id: <session-id>" `
  -d "{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"tools/call\",\"params\":{\"name\":\"lanhu_get_ai_analyze_design_result\",\"arguments\":{\"url\":\"https://lanhuapp.com/web/#/item/project/stage?tid=f16a74ff-934a-475f-a9ba-9bca1be3077c&pid=ccd8783f-09fe-4467-98c5-60bfe75a3f40\",\"design_names\":[\"商街\"]}}}"
```

## 6. Known good result

On `2026-05-24`, `lanhu_get_designs` returned:

- project name: `商城小程序`
- total designs: `36`
- design index `1`: `商街`
- design id: `d680f6ee-f198-4ed9-8fb9-750981d1a2c0`
- update time: `2026-05-24T19:19:21.366609Z`
