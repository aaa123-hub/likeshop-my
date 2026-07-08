import { request as httpsRequest, get as httpsGet } from 'node:https'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const serverBaseUrl = process.env.LANHU_UPLOAD_SERVER || 'https://cy8bhf.mynatapp.cc'
const publicBaseUrl = process.env.LANHU_PUBLIC_SERVER || serverBaseUrl
const uploadPath = process.env.LANHU_UPLOAD_PATH || '/api/miniapp/files/upload'
const uploadUrl = new URL(uploadPath, serverBaseUrl)
const uploadField = process.env.LANHU_UPLOAD_FIELD || 'file'
const mapPath = resolve(projectRoot, 'static/lanhu/uploaded-assets-map.json')
const backupPath = resolve(projectRoot, 'static/lanhu/uploaded-assets.txt')

const assets = [
    ['kyc_back_icon', '用户KYC - 返回图标', 'https://lanhu-oss-proxy.lanhuapp.com/097ab946dbaa04397e2e5764e5ce75da'],
    ['kyc_line_1', '用户KYC - 分割线1', 'https://lanhu-oss-proxy.lanhuapp.com/73a3a71052c4f23b4e7b446a6a600c80'],
    ['kyc_line_2', '用户KYC - 分割线2', 'https://lanhu-oss-proxy.lanhuapp.com/34db1a6092cd233ad20d0d9b92b5dda0'],
    ['kyc_line_3', '用户KYC - 分割线3', 'https://lanhu-oss-proxy.lanhuapp.com/80e3ce4e12515ddfce0e84556ddb4f90'],
    ['kyc_upload_icon', '用户KYC - 上传占位图标', 'https://lanhu-oss-proxy.lanhuapp.com/55f17afc942884185b55bbcecd87de64'],
    ['kyc_plus_icon', '用户KYC - 加号图标', 'https://lanhu-oss-proxy.lanhuapp.com/ac126f69b68c9ba9c828f7e0d04cc427'],
    ['kyc_hero_illustration', '用户KYC - 顶部插画', 'https://lanhu-oss-proxy.lanhuapp.com/447f889fdd7aba2d9c33e93eeb15e50b'],
    ['kyc_page_bg', '用户KYC - 页面背景', 'https://lanhu-oss-proxy.lanhuapp.com/b9e7de2c995ec4fb96c591809908a10d'],
    ['kyc_header_bg', '用户KYC - 顶部背景', 'https://lanhu-oss-proxy.lanhuapp.com/033bdca85e38f41ccfbda94133198053'],
    ['kyc_photo_front_bg', '用户KYC - 证件正面背景', 'https://lanhu-oss-proxy.lanhuapp.com/7cfc48b4017c60cab0cd1f4dfe85fa05'],
    ['kyc_photo_back_bg', '用户KYC - 证件反面背景', 'https://lanhu-oss-proxy.lanhuapp.com/e46b78fd9e4096a3a4374942a753e7e5']
]

function readMap() {
    if (!existsSync(mapPath)) return {}
    try {
        return JSON.parse(readFileSync(mapPath, 'utf8'))
    } catch {
        return {}
    }
}

function findUrl(value) {
    if (!value || typeof value !== 'object') return ''
    for (const key of ['url', 'path', 'src', 'fullUrl', 'fileUrl', 'file_url']) {
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

function download(url) {
    return new Promise((resolvePromise, reject) => {
        httpsGet(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                download(new URL(res.headers.location, url).toString()).then(resolvePromise).catch(reject)
                return
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error(`Download HTTP ${res.statusCode}: ${url}`))
                return
            }
            const chunks = []
            res.on('data', (chunk) => chunks.push(chunk))
            res.on('end', () => resolvePromise({
                buffer: Buffer.concat(chunks),
                contentType: res.headers['content-type'] || 'image/png'
            }))
        }).on('error', reject)
    })
}

function upload({ key, url, buffer, contentType }) {
    const boundary = `----CodexBoundary${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
    const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png'
    const fileName = `${key}-${basename(new URL(url).pathname || key)}.${ext}`
    const body = Buffer.concat([
        Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${uploadField}"; filename="${fileName}"\r\n` +
            `Content-Type: ${contentType}\r\n\r\n`
        ),
        buffer,
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
                        reject(new Error(`Upload HTTP ${res.statusCode}: ${text}`))
                        return
                    }
                    let parsed = text
                    try {
                        parsed = JSON.parse(text)
                    } catch {}
                    const uploadedUrl = findUrl(parsed) || (typeof parsed === 'string' ? parsed : '')
                    if (!uploadedUrl) {
                        reject(new Error(`Upload did not return a URL: ${text}`))
                        return
                    }
                    resolvePromise({ url: normalizePublicUrl(uploadedUrl), responseBody: normalizeResponseText(text) })
                })
            }
        )
        req.on('error', reject)
        req.write(body)
        req.end()
    })
}

const assetMap = readMap()
const entries = []

for (const [key, note, localUrl] of assets) {
    try {
        if (assetMap[localUrl]) {
            entries.push({ status: 'cached', key, note, localUrl, url: assetMap[localUrl] })
            continue
        }
        const downloaded = await download(localUrl)
        const uploaded = await upload({ key, url: localUrl, ...downloaded })
        assetMap[localUrl] = uploaded.url
        entries.push({ status: 'success', key, note, localUrl, url: uploaded.url, responseBody: uploaded.responseBody })
    } catch (error) {
        entries.push({ status: 'failed', key, note, localUrl, error: error.message })
    }
}

mkdirSync(dirname(mapPath), { recursive: true })
writeFileSync(mapPath, `${JSON.stringify(assetMap, null, 2)}\n`)

const backupLines = existsSync(backupPath) ? readFileSync(backupPath, 'utf8').replace(/\s*$/, '').split('\n') : []
backupLines.push('', `# 用户KYC蓝湖图片上传 - ${new Date().toISOString()}`)
for (const entry of entries) {
    backupLines.push(`[${entry.status}] ${entry.note}`)
    backupLines.push(`key: ${entry.key}`)
    backupLines.push(`local: ${entry.localUrl}`)
    backupLines.push(`request: POST ${uploadPath}`)
    if (entry.url) backupLines.push(`url: ${entry.url}`)
    if (entry.responseBody) backupLines.push(`response: ${entry.responseBody}`)
    if (entry.error) backupLines.push(`error: ${entry.error}`)
    backupLines.push('')
}
writeFileSync(backupPath, `${backupLines.join('\n')}\n`)

console.log(JSON.stringify(entries, null, 2))
if (entries.some((entry) => entry.status === 'failed')) process.exitCode = 1
