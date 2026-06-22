import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { tabbarIconMap } from './tabbar-icon-map.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const pagesJsonPath = path.resolve(__dirname, '../pages.json')

let content = fs.readFileSync(pagesJsonPath, 'utf8')

for (const [pagePath, icons] of Object.entries(tabbarIconMap)) {
    validateIconPath(pagePath, icons.iconPath)
    validateIconPath(pagePath, icons.selectedIconPath)

    const itemPattern = new RegExp(
        `(\"pagePath\"\\s*:\\s*\"${escapeRegExp(pagePath)}\"[\\s\\S]*?\"iconPath\"\\s*:\\s*)\"[^\"]+\"([\\s\\S]*?\"selectedIconPath\"\\s*:\\s*)\"[^\"]+\"`,
        'm'
    )

    if (!itemPattern.test(content)) {
        throw new Error(`Missing tabBar item for ${pagePath}`)
    }

    content = content.replace(itemPattern, `$1"${icons.iconPath}"$2"${icons.selectedIconPath}"`)
}

fs.writeFileSync(pagesJsonPath, content)

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function validateIconPath(pagePath, iconPath) {
    if (/^https?:\/\//i.test(iconPath) || iconPath.startsWith('/')) {
        throw new Error(`Invalid tabBar icon path for ${pagePath}: ${iconPath}`)
    }

    if (!fs.existsSync(path.resolve(rootDir, iconPath))) {
        throw new Error(`Missing tabBar icon file for ${pagePath}: ${iconPath}`)
    }
}
