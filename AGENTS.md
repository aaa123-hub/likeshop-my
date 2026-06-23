# Project AGENTS

This repository is a uni-app project based on the open-source Likeshop codebase.
The product direction is fixed:

- Business logic may reuse Likeshop.
- UI and layout must follow Lanhu design as the source of truth.
- Old Likeshop page layouts, spacing, and visual structure should be discarded when a Lanhu version exists.

## 1. Lanhu sync workflow

When Lanhu UI changes, update the corresponding page in this repo immediately.

Lanhu project link:

- [Lanhu project stage](https://lanhuapp.com/web/#/item/project/stage?tid=f16a74ff-934a-475f-a9ba-9bca1be3077c&pid=ccd8783f-09fe-4467-98c5-60bfe75a3f40)

Local Lanhu MCP endpoint:

- `http://127.0.0.1:8765/mcp`

Lanhu MCP start notes:

1. Confirm the MCP service is running on `127.0.0.1:8765`.
2. Check the local Codex MCP config at `C:\Users\迅影\.codex\config.toml`.
3. The Lanhu project assets and page screenshots live in `static/lanhu/`.
4. The mapping between Lanhu screens and code pages is tracked in `static/lanhu/LANHU_PAGE_MAP.md`.
5. The existing Lanhu wrapper pages are under `bundle/pages/lanhu_pages/` and `bundle/pages/lanhu_scene/`.

Recommended sync rule:

- First inspect the Lanhu screenshot/design.
- Then update the matching page code.
- Keep logic if it is useful, but replace the page shell, spacing, section structure, and visual style to match Lanhu.

## 2. UI and component reuse rules

Reuse existing code whenever possible, but do not reuse old layout patterns just because they already exist.

Preferred UI sources:

- Existing project components in `components/`
- Uni-app built-in components
- Existing uView components already installed in the project

Reuse rules:

- Prefer existing components before creating new ones.
- Prefer uni-app native UI pieces when they cover the need cleanly.
- Prefer already established project helpers for routing, login, tabbar, cache, and API handling.
- Do not introduce a new UI library unless the current codebase already depends on it or the change clearly requires it.

Hard UI rule:

- If a page has a Lanhu design, the page must visually follow Lanhu, not the old Likeshop layout.
- The old homepage, tab content blocks, card composition, and section order should be considered legacy unless the new design explicitly keeps them.

## 3. Likeshop baseline rule

The project baseline comes from Likeshop open source code.

Keep:

- API wiring
- state management
- business workflows
- login and permission flow
- cart/order/user data logic
- utility functions that still fit the new UI

Discard or replace when needed:

- old page composition
- old spacing system
- old homepage hero layout
- old category page structure
- old tab content layout
- any style that conflicts with Lanhu screenshots

The implementation goal is:

- Likeshop powers the logic.
- Lanhu defines the UI.

## 4. Code organization and editing rules

- Keep edits scoped to the pages or components that actually need the UI update.
- Reuse existing page routes if possible.
- Add new pages to `pages.json` when needed.
- Keep Lanhu-related pages grouped in the existing `pages/lanhu_*` and `bundle/pages/lanhu_*` structure.
- If a screen already has a Lanhu wrapper page, update that page instead of creating a parallel duplicate.

## 5. Tabbar and navigation rules

- The bottom tabbar is part of the product UI and should match the Lanhu direction.
- Do not hide the tabbar unless the specific page design requires it.
- Keep tab pages registered in `pages.json`.
- If a tab page is moved, update every route reference and the tabbar config together.
- Reuse `setTabbar()` only when it helps keep the current tabbar state consistent.

## 6. Data and logic reuse rules

- Keep existing business APIs when they still support the screen.
- Preserve user state, cart count, login state, share info, and invite flow unless the new design changes the behavior.
- Do not rewrite stable logic just to make a visual change.
- If data is unavailable, use reasonable fallback data so the Lanhu screen still renders cleanly.

## 7. Visual implementation rules

- Match Lanhu screenshots as closely as practical.
- Use the screenshot image as the visual reference, not the old page structure.
- Use existing image assets in `static/lanhu/designs/` when they already correspond to the page.
- Avoid carrying over the old page hierarchy when a new Lanhu composition exists.
- Keep text, icon, and card sizes consistent with the screenshot.
- Prefer native layout primitives and simple CSS over over-engineered wrappers.

## 8. Verification checklist

Before finishing a Lanhu update:

- Confirm the page route is registered.
- Confirm the page loads without runtime errors.
- Confirm the key UI blocks match the Lanhu screenshot.
- Confirm tabbar routes still work.
- Confirm reused logic still behaves correctly.
- Confirm no old layout fragments are left visible on the new screen.

## 9. Useful files

- `App.vue`
- `pages.json`
- `static/lanhu/LANHU_PAGE_MAP.md`
- `bundle/pages/lanhu_index/design-map.js`
- `bundle/pages/lanhu_scene/scene-shell.vue`
- `bundle/pages/lanhu_scene/lanhu-wrapper-page.vue`
- `utils/tools.js`

## 10. Working principle

If there is a conflict between the old Likeshop appearance and the Lanhu design:

1. Keep the logic.
2. Replace the UI.
3. Prefer the Lanhu screenshot.
4. Remove the legacy layout if it no longer matches the design.

## 11. Lanhu image upload skill

Local reusable skill:

- `.codex/skills/lanhu-upload-and-replace/SKILL.md`

Use this skill when a page icon, background, illustration, or other Lanhu image needs to be moved to the project server and then wired back into code.

Recommended usage:

1. First check whether the same local asset path already exists in `utils/lanhu-assets.js` or `static/lanhu/uploaded-assets.txt`.
2. If it already exists, reuse the recorded URL instead of uploading again.
3. If it does not exist, upload the Lanhu image to the project server, normalize the returned URL to `https://cy8bhf.mynatapp.cc`, and write the result back into the asset map.
4. Replace the corresponding page code reference with the normalized URL.
5. Keep the note in `static/lanhu/uploaded-assets.txt` clear enough to know which page and which image it belongs to.

Typical trigger:

- "用 `lanhu-upload-and-replace` 处理这个蓝湖图片"
- "把蓝湖图上传到服务器并回填到页面"
- "如果已经上传过就直接复用，不要重复上传"
