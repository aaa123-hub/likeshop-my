---
name: lanhu-upload-and-replace
description: Fetch Lanhu design images, reuse existing uploaded URLs when available, upload missing assets to the project server, replace the local IP in returned URLs, and update the corresponding project code references.
---

# Lanhu Upload And Replace

Use this skill when a project needs Lanhu design images or icons moved to the project server and then wired into code.

## Workflow

1. Find the target Lanhu page or design slice.
2. Check the local upload record first.
3. If the same local asset path already has a mapped URL, reuse it.
4. If not, upload the image to the project server.
5. Normalize returned URLs by replacing the local host with the project public host.
6. Update the code reference at the matching page/component.
7. Save or refresh the backup record for later reuse.

## Rules

- Always prefer the existing local asset record over a new upload.
- Never keep `http://127.0.0.1:18081` in code or backup output.
- Use the project server base URL configured by the repository or task context.
- Keep notes for each asset so the page and image role are clear.

## Implementation notes

- Use the repo's upload script when available.
- Read the generated local asset map before uploading.
- If the same Lanhu image is already recorded, use the recorded URL directly.
- After upload, update the code to point to the normalized URL.

## Good trigger phrases

- "从蓝湖取图并上传到服务器"
- "把蓝湖图片替换成云端地址"
- "复用已上传的蓝湖图片"
- "更新页面里的蓝湖 icon"
