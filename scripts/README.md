# Scripts

## Tabbar icons

Tabbar icon paths in `pages.json` must be local relative paths for WeChat Mini Program.

Update `tabbar-icon-map.mjs`, then run:

```bash
npm run sync:tabbar-icons
```

The sync script validates that mapped icon files exist and rejects network URLs or root-relative paths.
