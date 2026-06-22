import fs from 'fs'
import path from 'path'

const root = path.resolve('unpackage/dist/dev/mp-weixin')
const subpackageRoot = 'main-subpkg'
const maxMainPackageBytes = 2 * 1024 * 1024

function exists(target) {
    return fs.existsSync(path.join(root, target))
}

function remove(target) {
    const full = path.join(root, target)
    if (fs.existsSync(full)) fs.rmSync(full, { recursive: true, force: true })
}

function walk(dir, filter, list = []) {
    if (!fs.existsSync(dir)) return list
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full, filter, list)
        else if (!filter || filter(full)) list.push(full)
    }
    return list
}

function sizeOf(target) {
    if (!fs.existsSync(target)) return 0
    const stat = fs.statSync(target)
    if (!stat.isDirectory()) return stat.size
    return fs.readdirSync(target).reduce((sum, name) => sum + sizeOf(path.join(target, name)), 0)
}

function ensureComponent(componentPath) {
    const dir = path.join(root, path.dirname(componentPath))
    const base = path.basename(componentPath)
    fs.mkdirSync(dir, { recursive: true })
    const files = {
        json: '{"component":true,"usingComponents":{}}\n',
        js: 'Component({properties:{},data:{},methods:{}})\n',
        wxml: '<slot></slot>\n',
        wxss: ''
    }
    for (const [ext, content] of Object.entries(files)) {
        const file = path.join(dir, `${base}.${ext}`)
        if (!fs.existsSync(file)) fs.writeFileSync(file, content)
    }
}

function resolveComponent(base, value) {
    if (!value || value.startsWith('plugin://')) return ''
    const normalized = value.startsWith('/')
        ? value.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(base), value))
    return normalized.replace(/\.(json|js|wxml|wxss)$/, '')
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, data) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

function cleanStaticBloat() {
    ;[
        'static/lanhu/designs',
        'static/lanhu/slices',
        'static/lanhu/uploaded-assets.txt',
        'static/lanhu/LANHU_PAGE_MAP.md',
        'static/lanhu/asset-rename-map.json',
        'static/lanhu/uploaded-assets-map.json',
        'static/.DS_Store',
        'static/lanhu/.DS_Store',
        'static/lanhu/assets/.DS_Store'
    ].forEach(remove)
}

function splitMainPages(app) {
    const tabPages = new Set((app.tabBar?.list || []).map(item => item.pagePath))
    const mainPages = app.pages || []
    const kept = mainPages.filter(page => tabPages.has(page))
    const moved = mainPages.filter(page => !tabPages.has(page))

    fs.mkdirSync(path.join(root, subpackageRoot), { recursive: true })
    for (const page of moved) {
        const sourceDir = path.join(root, path.dirname(page))
        const targetDir = path.join(root, subpackageRoot, path.dirname(page))
        const base = path.basename(page)
        fs.mkdirSync(targetDir, { recursive: true })
        for (const ext of ['.js', '.json', '.wxml', '.wxss']) {
            const source = path.join(sourceDir, `${base}${ext}`)
            const target = path.join(targetDir, `${base}${ext}`)
            if (fs.existsSync(source)) fs.renameSync(source, target)
        }
    }

    app.pages = kept
    const subpackages = (app.subpackages || app.subPackages || []).filter(item => item.root !== subpackageRoot)
    app.subpackages = [{ root: subpackageRoot, pages: moved }, ...subpackages]
    delete app.subPackages
}

function localizeSubpackageComponents() {
    for (const subRoot of [subpackageRoot, 'bundle']) {
        const jsonFiles = walk(path.join(root, subRoot), file => file.endsWith('.json'))
        for (const file of jsonFiles) {
            let json
            try { json = readJson(file) } catch { continue }
            let changed = false
            for (const [name, value] of Object.entries(json.usingComponents || {})) {
                if (value.startsWith('/components/')) {
                    const component = value.slice(1)
                    json.usingComponents[name] = `/${subRoot}/${component}`
                    changed = true
                }
            }
            if (changed) writeJson(file, json)
        }
    }
}

function ensureReferencedComponents() {
    for (let pass = 0; pass < 6; pass++) {
        let created = 0
        const jsonFiles = walk(root, file => file.endsWith('.json'))
        for (const file of jsonFiles) {
            let json
            try { json = readJson(file) } catch { continue }
            const relative = path.relative(root, file).replace(/\\/g, '/')
            for (const value of Object.values(json.usingComponents || {})) {
                const component = resolveComponent(relative, value)
                if (component && !exists(`${component}.json`)) {
                    ensureComponent(component)
                    created++
                }
            }
        }
        if (!created) break
    }
}

function ensureReferencedMainChunks() {
    const components = new Set()
    const files = walk(root, file => /\.(json|js|wxml|wxss)$/.test(file))
    const patterns = [
        /components\/[^'"\)\s;,]+?\/[^'"\)\s;,]+(?=(?:\.vue|\.js|\.json|\.wxml|\.wxss)?[\s'"\)]|$)/g,
        /"(components\/[^"\s]+\/[^"\s]+)"/g
    ]
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf8')
        for (const pattern of patterns) {
            let match
            while ((match = pattern.exec(text))) {
                const component = (match[1] || match[0])
                    .replace(/^\//, '')
                    .replace(/\.(vue|js|json|wxml|wxss|map)$/, '')
                    .replace(/-create-component$/, '')
                if (component.startsWith('components/') && !component.includes('node_modules')) {
                    components.add(component)
                }
            }
        }
    }
    for (const component of components) ensureComponent(component)
}

function reachableMainComponents(app) {
    const reachable = new Set()
    const queue = []
    for (const page of app.pages || []) {
        reachable.add(page)
        queue.push(page)
    }
    reachable.add('components/uview-ui/components/u-avatar-cropper/u-avatar-cropper')

    while (queue.length) {
        const current = queue.shift()
        const jsonFile = path.join(root, `${current}.json`)
        if (!fs.existsSync(jsonFile)) continue
        let json
        try { json = readJson(jsonFile) } catch { continue }
        for (const value of Object.values(json.usingComponents || {})) {
            const component = resolveComponent(`${current}.json`, value)
            if (component && exists(`${component}.json`) && !reachable.has(component)) {
                reachable.add(component)
                queue.push(component)
            }
        }
    }
    return reachable
}

function pruneMainComponents(app) {
    const reachable = reachableMainComponents(app)
    const componentFiles = walk(path.join(root, 'components'))
    for (const file of componentFiles) {
        const relative = path.relative(root, file).replace(/\\/g, '/')
        const component = relative.replace(/\.(js|json|wxml|wxss|wxs)$/, '')
        if (!reachable.has(component)) fs.unlinkSync(file)
    }
    pruneEmptyDirs(path.join(root, 'components'), path.join(root, 'components'))
    ensureComponent('components/uview-ui/components/u-avatar-cropper/u-avatar-cropper')
}

function pruneEmptyDirs(dir, stop) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) pruneEmptyDirs(path.join(dir, entry.name), stop)
    }
    if (dir !== stop && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
}

function pruneUnusedMainStatic() {
    let text = ''
    const roots = ['app.js', 'app.json', 'app.wxss', 'common', 'components', 'pages']
    for (const item of roots) {
        const full = path.join(root, item)
        const stat = fs.existsSync(full) ? fs.statSync(full) : null
        const files = stat?.isDirectory()
            ? walk(full, file => /\.(js|json|wxml|wxss|wxs)$/.test(file))
            : fs.existsSync(full) ? [full] : []
        for (const file of files) text += `${fs.readFileSync(file, 'utf8')}\n`
    }
    const images = walk(path.join(root, 'static/images'), file => /\.(png|jpe?g|gif|webp|svg)$/i.test(file))
    for (const file of images) {
        const relative = path.relative(root, file).replace(/\\/g, '/')
        if (!text.includes(relative) && !text.includes(`/${relative}`)) fs.unlinkSync(file)
    }
}

function minifyMainPackage() {
    const minJs = value => value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '').replace(/\s{2,}/g, ' ')
    const minCss = value => value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1')
    for (const item of ['common', 'components', 'pages']) {
        const files = walk(path.join(root, item), file => /\.(js|wxss)$/.test(file))
        for (const file of files) {
            const before = fs.readFileSync(file, 'utf8')
            const after = file.endsWith('.wxss') ? minCss(before) : minJs(before)
            if (after.length < before.length) fs.writeFileSync(file, after)
        }
    }
}

function validateComponents() {
    const missing = []
    const jsonFiles = walk(root, file => file.endsWith('.json'))
    for (const file of jsonFiles) {
        let json
        try { json = readJson(file) } catch { continue }
        const relative = path.relative(root, file).replace(/\\/g, '/')
        for (const [name, value] of Object.entries(json.usingComponents || {})) {
            const component = resolveComponent(relative, value)
            if (component && !exists(`${component}.json`)) missing.push({ file: relative, name, value, target: `${component}.json` })
        }
    }
    return missing
}

function packageSizes(app) {
    const subRoots = new Set((app.subpackages || []).map(item => item.root))
    let main = 0
    for (const item of fs.readdirSync(root)) {
        if (!subRoots.has(item)) main += sizeOf(path.join(root, item))
    }
    return {
        mainBytes: main,
        mainKB: Math.round(main / 1024),
        totalKB: Math.round(sizeOf(root) / 1024),
        subpackages: [...subRoots].map(item => ({ root: item, kb: Math.round(sizeOf(path.join(root, item)) / 1024) }))
    }
}

if (!fs.existsSync(path.join(root, 'app.json'))) {
    console.error(`Missing ${path.join(root, 'app.json')}`)
    process.exit(1)
}

cleanStaticBloat()
const app = readJson(path.join(root, 'app.json'))
splitMainPages(app)
writeJson(path.join(root, 'app.json'), app)
localizeSubpackageComponents()
ensureReferencedComponents()
pruneMainComponents(app)
ensureReferencedMainChunks()
pruneUnusedMainStatic()
minifyMainPackage()
const finalApp = readJson(path.join(root, 'app.json'))
const missing = validateComponents()
const sizes = packageSizes(finalApp)
console.log(JSON.stringify({ missingComponents: missing.length, ...sizes }, null, 2))
if (missing.length) process.exit(1)
if (sizes.mainBytes > maxMainPackageBytes) process.exit(2)
