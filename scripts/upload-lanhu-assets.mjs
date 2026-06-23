import { request as httpsRequest } from 'node:https'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, relative, resolve, sep } from 'node:path'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const serverBaseUrl = process.env.LANHU_UPLOAD_SERVER || 'https://cy8bhf.mynatapp.cc'
const publicBaseUrl = process.env.LANHU_PUBLIC_SERVER || serverBaseUrl
const uploadPath = process.env.LANHU_UPLOAD_PATH || '/api/miniapp/files/upload'
const uploadUrl = new URL(uploadPath, serverBaseUrl)
const uploadField = process.env.LANHU_UPLOAD_FIELD || 'file'
const outputTxt = resolve(projectRoot, 'static/lanhu/uploaded-assets.txt')
const assetMapPath = resolve(projectRoot, 'utils/lanhu-assets.js')
const assetDirs = [
    resolve(projectRoot, 'static/lanhu/assets'),
    resolve(projectRoot, 'static/lanhu/designs')
]
const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function toPosixPath(filePath) {
    return filePath.split(sep).join('/')
}

function localPublicPath(filePath) {
    return `/${toPosixPath(relative(projectRoot, filePath))}`
}

function keyFromPath(filePath) {
    const rel = toPosixPath(relative(resolve(projectRoot, 'static/lanhu'), filePath))
    return rel
        .replace(/\.[^.]+$/, '')
        .replace(/@/g, '_')
        .replace(/[^A-Za-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/^(\d)/, '_$1')
}

function noteFromPath(filePath) {
    const publicPath = localPublicPath(filePath)
    const name = basename(filePath)
    if (publicPath.includes('/assets/home/')) {
        const map = {
            'home2_balance_bill@2x.png': '首页2 - 我的余额卡片图标',
            'home2_bg@2x.png': '首页2 - 页面背景图',
            'home2_buyer_illustration@2x.png': '首页2 - 购物身份插画',
            'home2_ecology_icon@2x.png': '首页2 - 生态应用图标',
            'home2_hero_figure@2x.png': '首页2 - 顶部人物/主视觉图',
            'home2_notice_icon@2x.png': '首页2 - 消息通知图标',
            'home2_seller_illustration@2x.png': '首页2 - 卖货身份插画',
            'home2_shortcut_primary@2x.png': '首页2 - 快捷入口图标 1',
            'home2_shortcut_secondary@2x.png': '首页2 - 快捷入口图标 2',
            'home2_shortcut_tertiary@2x.png': '首页2 - 快捷入口图标 3',
            'home2_icon_more@2x.png': '首页2 - 查看更多图标'
        }
        return map[name] || `蓝湖切图 - ${name}`
    }
    if (publicPath.includes('/designs/')) return `蓝湖页面截图 - ${name}`
    return `蓝湖图片 - ${name}`
}

function walkImages(dir) {
    if (!existsSync(dir)) return []
    const result = []
    for (const item of readdirSync(dir, { withFileTypes: true })) {
        const filePath = resolve(dir, item.name)
        if (item.isDirectory()) {
            result.push(...walkImages(filePath))
            continue
        }
        if (item.isFile() && imageExts.has(extname(item.name).toLowerCase())) {
            result.push(filePath)
        }
    }
    return result
}

function collectAssets() {
    const seen = new Set()
    return assetDirs
        .flatMap(walkImages)
        .filter((filePath) => {
            const publicPath = localPublicPath(filePath)
            if (seen.has(publicPath)) return false
            seen.add(publicPath)
            return true
        })
        .sort((a, b) => localPublicPath(a).localeCompare(localPublicPath(b), 'en'))
        .map((filePath) => ({
            key: keyFromPath(filePath),
            note: noteFromPath(filePath),
            filePath,
            localPath: localPublicPath(filePath),
            size: statSync(filePath).size
        }))
}

function findUrl(value) {
    if (!value || typeof value !== 'object') return ''
    const directKeys = ['url', 'path', 'src', 'fullUrl', 'fileUrl', 'file_url', 'image', 'imageUrl']
    for (const key of directKeys) {
        if (typeof value[key] === 'string' && /^https?:\/\//.test(value[key])) return value[key]
    }
    for (const nested of Object.values(value)) {
        const found = findUrl(nested)
        if (found) return found
    }
    return ''
}

function normalizePublicUrl(url) {
    return url.replace(/^http:\/\/127\.0\.0\.1:18081/i, publicBaseUrl)
}

function normalizeResponseText(text) {
    return text.replace(/http:\/\/127\.0\.0\.1:18081/g, publicBaseUrl)
}

function readExistingAssetUrls() {
    if (!existsSync(assetMapPath)) return new Map()
    const text = readFileSync(assetMapPath, 'utf8')
    const urls = new Map()
    const pattern = /['"](?<local>\/static\/lanhu\/[^'"]+)['"]:\s*['"](?<url>https?:\/\/[^'"]+)['"]/g
    for (const match of text.matchAll(pattern)) {
        urls.set(match.groups.local, match.groups.url)
    }
    return urls
}

function uploadAsset(asset) {
    const ext = extname(asset.filePath).toLowerCase()
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    const boundary = `----CodexBoundary${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
    const fileName = basename(asset.filePath).replace(/@/g, '_')
    const fileBuffer = readFileSync(asset.filePath)
    const body = Buffer.concat([
        Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${uploadField}"; filename="${fileName}"\r\n` +
            `Content-Type: ${contentType}\r\n\r\n`
        ),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`)
    ])

    return new Promise((resolvePromise, reject) => {
        const req = httpsRequest(
            {
                method: 'POST',
                hostname: uploadUrl.hostname,
                port: uploadUrl.port || 443,
                path: `${uploadUrl.pathname}${uploadUrl.search}`,
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': body.length
                }
            },
            (res) => {
                const chunks = []
                res.on('data', (chunk) => chunks.push(chunk))
                res.on('end', () => {
                    const text = Buffer.concat(chunks).toString('utf8')
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        reject(new Error(`HTTP ${res.statusCode}: ${text}`))
                        return
                    }
                    let parsed = text
                    try {
                        parsed = JSON.parse(text)
                    } catch {}
                    const serverUrl = findUrl(parsed) || (typeof parsed === 'string' ? parsed : '')
                    if (!serverUrl) {
                        reject(new Error(`Upload did not return a URL: ${text}`))
                        return
                    }
                    resolvePromise({
                        body: normalizeResponseText(text),
                        url: normalizePublicUrl(serverUrl)
                    })
                })
            }
        )
        req.on('error', reject)
        req.write(body)
        req.end()
    })
}

function writeAssetMap(assets, resolved) {
    const localBlock = assets.map((item) => `    ${item.key}: '${item.localPath}'`).join(',\n')
    const cloudBlock = resolved.map((item) => `    ${item.key}: '${item.url}'`).join(',\n')
    const lookupBlock = resolved.map((item) => `    '${item.localPath}': '${item.url}'`).join(',\n')

    const content = `const localLanhuAssets = {
${localBlock}
}

const cloudLanhuAssets = {
${cloudBlock || '    // The upload script fills this object with server URLs after a successful upload.'}
}

export const lanhuAssetUrls = {
${lookupBlock || '    // Local path to uploaded URL lookup.'}
}

export function getLanhuAsset(localPath) {
    return lanhuAssetUrls[localPath] || localPath
}

export const lanhuAssets = {
    ...localLanhuAssets,
    ...cloudLanhuAssets,
    homeBalanceBill: getLanhuAsset('/static/lanhu/assets/home/home2_balance_bill@2x.png'),
    homeBuyerIllustration: getLanhuAsset('/static/lanhu/assets/home/home2_buyer_illustration@2x.png'),
    homeEcologyIcon: getLanhuAsset('/static/lanhu/assets/home/home2_ecology_icon@2x.png'),
    homeHeroBg: getLanhuAsset('/static/lanhu/assets/home/home2_bg@2x.png'),
    homeHeroFigure: getLanhuAsset('/static/lanhu/assets/home/home2_hero_figure@2x.png'),
    homeNoticeIcon: getLanhuAsset('/static/lanhu/assets/home/home2_notice_icon@2x.png'),
    homeSellerIllustration: getLanhuAsset('/static/lanhu/assets/home/home2_seller_illustration@2x.png'),
    homeShortcutPrimary: getLanhuAsset('/static/lanhu/assets/home/home2_shortcut_primary@2x.png'),
    homeShortcutSecondary: getLanhuAsset('/static/lanhu/assets/home/home2_shortcut_secondary@2x.png'),
    homeShortcutTertiary: getLanhuAsset('/static/lanhu/assets/home/home2_shortcut_tertiary@2x.png'),
    homeMoreIcon: getLanhuAsset('/static/lanhu/assets/home/home2_icon_more@2x.png')
}

export const lanhuAssetList = {
    homeShortcuts: [
        lanhuAssets.homeShortcutPrimary,
        lanhuAssets.homeShortcutSecondary,
        lanhuAssets.homeShortcutTertiary
    ],
    categoryFallbacks: [
        getLanhuAsset('/static/lanhu/designs/35-category.png'),
        getLanhuAsset('/static/lanhu/designs/17-activity-exchange.png'),
        getLanhuAsset('/static/lanhu/designs/23-street-goods.png')
    ],
    sceneAlbum: [
        getLanhuAsset('/static/lanhu/designs/10-store-album.png'),
        getLanhuAsset('/static/lanhu/designs/21-recent-visits.png'),
        getLanhuAsset('/static/lanhu/designs/23-street-goods.png'),
        getLanhuAsset('/static/lanhu/designs/27-search-list.png')
    ]
}
`

    writeFileSync(assetMapPath, content)
}

function writeBackup(entries) {
    const now = new Date().toISOString()
    const lines = [
        '# Lanhu asset upload backup',
        `# Generated at: ${now}`,
        `# Server: ${uploadUrl.toString()}`,
        `# Public URL base: ${publicBaseUrl}`,
        `# Request field: ${uploadField}`,
        '# Request type: multipart/form-data without charset',
        `# Total: ${entries.length}`,
        ''
    ]

    for (const entry of entries) {
        lines.push(`[${entry.status}] ${entry.note}`)
        lines.push(`key: ${entry.key}`)
        lines.push(`local: ${entry.localPath}`)
        lines.push(`request: POST ${uploadPath}`)
        if (entry.url) lines.push(`url: ${entry.url}`)
        if (entry.responseBody) lines.push(`response: ${entry.responseBody}`)
        if (entry.error) lines.push(`error: ${entry.error}`)
        lines.push('')
    }

    mkdirSync(dirname(outputTxt), { recursive: true })
    writeFileSync(outputTxt, `${lines.join('\n')}\n`)
}

const assets = collectAssets()
const entries = []
const existingAssetUrls = readExistingAssetUrls()

for (const asset of assets) {
    try {
        const existingUrl = existingAssetUrls.get(asset.localPath)
        if (existingUrl) {
            entries.push({
                ...asset,
                status: 'cached',
                url: existingUrl,
                responseBody: JSON.stringify({
                    cached: true,
                    fileUrl: existingUrl,
                    localPath: asset.localPath
                })
            })
            continue
        }
        const result = await uploadAsset(asset)
        entries.push({ ...asset, status: 'success', url: result.url, responseBody: result.body })
    } catch (error) {
        entries.push({ ...asset, status: 'failed', error: error.message })
    }
}

const resolved = entries.filter((entry) => entry.status === 'success' || entry.status === 'cached')
writeAssetMap(assets, resolved)
writeBackup(entries)

const failed = entries.filter((entry) => entry.status === 'failed')
if (failed.length) {
    console.error(readFileSync(outputTxt, 'utf8'))
    process.exitCode = 1
} else {
    console.log(readFileSync(outputTxt, 'utf8'))
}
