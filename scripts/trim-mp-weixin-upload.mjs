import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const root = path.resolve('unpackage/dist/dev/mp-weixin')
const subpackageRoot = 'main-subpkg'
const maxMainPackageBytes = 2 * 1024 * 1024
const require = createRequire(import.meta.url)
const hbuilderxTerserPath = '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/terser'

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

function cleanProjectConfig(file) {
    if (!fs.existsSync(file)) return
    let json
    try { json = readJson(file) } catch { return }
    const ignores = Array.isArray(json.packOptions?.ignore) ? json.packOptions.ignore : []
    const miniprogramRoot = typeof json.miniprogramRoot === 'string' ? json.miniprogramRoot.replace(/\\/g, '/') : ''
    const ignoredValues = new Set(['static/images', 'static/images/tabbar'])
    if (miniprogramRoot.startsWith('unpackage/')) ignoredValues.add('unpackage')
    const filtered = ignores.filter(item => !ignoredValues.has(item?.value))
    if (filtered.length !== ignores.length) {
        json.packOptions = json.packOptions || {}
        json.packOptions.ignore = filtered
        writeJson(file, json)
    }
    json.setting = json.setting || {}
    if (json.setting.ignoreUploadUnusedFiles !== false) {
        json.setting.ignoreUploadUnusedFiles = false
        writeJson(file, json)
    }
}

function cleanGeneratedProjectConfig() {
    cleanProjectConfig(path.join(root, 'project.config.json'))
    cleanProjectConfig(path.resolve('project.config.json'))
}

function loadTerser() {
    for (const candidate of ['terser', hbuilderxTerserPath]) {
        try {
            return require(candidate)
        } catch {}
    }
    return null
}

function cleanStaticBloat() {
    ;[
        'static/lanhu/designs',
        'static/lanhu/slices',
        'static/lanhu/assets',
        'static/lanhu/uploaded-assets.txt',
        'static/lanhu/LANHU_PAGE_MAP.md',
        'static/lanhu/LANHU_FUNCTION_DIFF_AUDIT.md',
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

function localizeSubpackageComponents(app) {
    const subRoots = new Set([subpackageRoot])
    for (const item of app.subpackages || app.subPackages || []) {
        if (item.root) subRoots.add(item.root)
    }

    const localComponentRoots = ['components/lime-painter']
    for (const subRoot of subRoots) {
        if (!fs.existsSync(path.join(root, subRoot, 'components'))) continue
        const jsonFiles = walk(path.join(root, subRoot), file => file.endsWith('.json'))
        for (const file of jsonFiles) {
            let json
            try { json = readJson(file) } catch { continue }
            let changed = false
            for (const [name, value] of Object.entries(json.usingComponents || {})) {
                if (value.startsWith('/components/')) {
                    const component = value.slice(1)
                    const shouldLocalize = localComponentRoots.some(prefix => component === prefix || component.startsWith(`${prefix}/`))
                    if ((shouldLocalize && exists(`${subRoot}/${component}.json`)) || exists(`${subRoot}/${component}.json`)) {
                        json.usingComponents[name] = `/${subRoot}/${component}`
                        changed = true
                    }
                }
            }
            if (changed) writeJson(file, json)
        }
    }
}

function removeMainPackagePosterComponents(app) {
    const posterRoot = 'bundle_poster/'
    const subRoots = new Set((app.subpackages || app.subPackages || [])
        .map(item => item.root)
        .filter(Boolean))
    const jsonFiles = walk(root, file => file.endsWith('.json'))

    for (const file of jsonFiles) {
        const relative = path.relative(root, file).replace(/\\/g, '/')
        const packageRoot = relative.split('/')[0]
        if (subRoots.has(packageRoot)) continue

        let json
        try { json = readJson(file) } catch { continue }
        let changed = false
        for (const [name, value] of Object.entries(json.usingComponents || {})) {
            const component = resolveComponent(relative, value)
            if (component.startsWith(posterRoot)) {
                delete json.usingComponents[name]
                changed = true
            }
        }
        if (changed) writeJson(file, json)
    }
}

function removeUnusedPosterPainterComponent() {
    const posterPageJson = path.join(root, 'bundle_poster/pages/invite_fans/invite_fans.json')
    if (!fs.existsSync(posterPageJson)) return
    let json
    try { json = readJson(posterPageJson) } catch { return }
    const usesInvitePoster = Object.values(json.usingComponents || {}).some((value) => resolveComponent('bundle_poster/pages/invite_fans/invite_fans.json', value) === 'bundle_poster/components/invite-poster/invite-poster')
    if (!usesInvitePoster) remove('bundle_poster/components/invite-poster')
}

function removeBrokenPosterPainterReferences() {
    const jsonFiles = walk(root, file => file.endsWith('.json'))
    for (const file of jsonFiles) {
        let json
        try { json = readJson(file) } catch { continue }
        let changed = false
        for (const [name, value] of Object.entries(json.usingComponents || {})) {
            const component = resolveComponent(path.relative(root, file).replace(/\\/g, '/'), value)
            if (component.startsWith('bundle_poster/components/lime-painter/')) {
                delete json.usingComponents[name]
                changed = true
            }
        }
        if (changed) writeJson(file, json)
    }
    remove('bundle_poster/components/lime-painter')
    remove('business/components/lime-painter')
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
    const mainRoots = ['app.js', 'app.json', 'app.wxss', 'common', 'components', 'pages']
    const files = mainRoots.flatMap(item => {
        const full = path.join(root, item)
        if (!fs.existsSync(full)) return []
        if (fs.statSync(full).isDirectory()) return walk(full, file => /\.(json|js|wxml|wxss)$/.test(file))
        return /\.(json|js|wxml|wxss)$/.test(full) ? [full] : []
    })
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

function ensureRootPainterFallbacks() {
    const source = path.resolve('components/lime-painter')
    const target = path.join(root, 'components/lime-painter')
    if (fs.existsSync(source)) {
        fs.cpSync(source, target, { recursive: true })
    }
    for (const file of walk(target, item => item.endsWith('.js'))) {
        const base = file.replace(/\.js$/, '')
        for (const [ext, content] of Object.entries({ json: '{"component":true,"usingComponents":{}}\n', wxml: '', wxss: '' })) {
            const companion = `${base}.${ext}`
            if (!fs.existsSync(companion)) fs.writeFileSync(companion, content)
        }
    }
    ;[
        'components/lime-painter/components/l-painter/l-painter',
        'components/lime-painter/components/l-painter-image/l-painter-image',
        'components/lime-painter/components/l-painter-text/l-painter-text',
        'components/lime-painter/components/l-painter-view/l-painter-view',
        'components/lime-painter/components/l-painter-qrcode/l-painter-qrcode',
        'components/lime-painter/components/lime-painter/index'
    ].forEach(ensureComponent)
}

function ensureVueQueryModuleStubs() {
    const jsFiles = walk(root, file => file.endsWith('.js'))
    const patterns = [
        /([A-Za-z0-9_./-]+\.vue\?vue&type=(?:template|script|style)[^"'*!\\\s]*?&)/g,
        /([A-Za-z0-9_./-]+\.vue\?vue&type=(?:template|script|style)[^"'*!\\\s]*?)(?=[\s"'*!\\]|$)/g
    ]
    const ensureStub = (file) => {
        fs.mkdirSync(path.dirname(file), { recursive: true })
        if (!fs.existsSync(file)) fs.writeFileSync(file, '\n')
    }
    const ensureQueryStubs = (fileBase) => {
        for (const ext of ['.js', '.wxss', '.wxml', '.json']) ensureStub(`${fileBase}${ext}`)
    }
    for (const file of jsFiles) {
        const text = fs.readFileSync(file, 'utf8')
        const currentDir = path.dirname(file)
        const escapedBase = base => base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        for (const pattern of patterns) {
            let match
            while ((match = pattern.exec(text))) {
                const request = match[1]
                const normalized = request.startsWith('./') || request.startsWith('../')
                    ? path.normalize(path.join(currentDir, request))
                    : path.join(root, request.replace(/^\//, ''))
                if (!normalized.startsWith(root) || !normalized.includes('.vue?vue&type=')) continue
                ensureQueryStubs(normalized)
            }
        }
        const base = path.basename(file, '.js')
        const baseAliases = new Set([base, base.replace(/-/g, '_')])
        for (const alias of baseAliases) {
            const queryPattern = new RegExp(`${escapedBase(alias)}\\.vue\\?vue&type=(?:template|script|style)[^"'*!\\\\\\s]*?&`, 'g')
            let queryMatch
            while ((queryMatch = queryPattern.exec(text))) {
                ensureQueryStubs(path.join(currentDir, queryMatch[0].replace(`${alias}.vue?`, `${base}.vue?`)))
            }
            const templatePattern = new RegExp(`${alias}_vue_vue_type_template_id_([A-Za-z0-9]+)(_scoped_true)?_`, 'g')
            let templateMatch
            while ((templateMatch = templatePattern.exec(text))) {
                const scoped = templateMatch[2] ? '&scoped=true' : ''
                ensureQueryStubs(path.join(currentDir, `${base}.vue?vue&type=template&id=${templateMatch[1]}${scoped}&`))
            }
            const scriptPattern = new RegExp(`${alias}_vue_vue_type_script_lang_([A-Za-z0-9]+)_`, 'g')
            let scriptMatch
            while ((scriptMatch = scriptPattern.exec(text))) {
                ensureQueryStubs(path.join(currentDir, `${base}.vue?vue&type=script&lang=${scriptMatch[1]}&`))
            }
            const stylePattern = new RegExp(`${alias}_vue_vue_type_style_index_([0-9]+)(?:_id_([A-Za-z0-9]+))?((?:_scoped_true)?_lang_([A-Za-z0-9]+)|_lang_([A-Za-z0-9]+)(?:_scoped_true)?)_`, 'g')
            let styleMatch
            while ((styleMatch = stylePattern.exec(text))) {
                const id = styleMatch[2] ? `&id=${styleMatch[2]}` : ''
                const scoped = text.slice(styleMatch.index, stylePattern.lastIndex).includes('_scoped_true') ? '&scoped=true' : ''
                const lang = styleMatch[4] || styleMatch[5]
                ensureQueryStubs(path.join(currentDir, `${base}.vue?vue&type=style&index=${styleMatch[1]}${id}${scoped}&lang=${lang}&`))
                ensureQueryStubs(path.join(currentDir, `${base}.vue?vue&type=style&index=${styleMatch[1]}${id}&lang=${lang}${scoped}&`))
            }
        }
    }
}

function ensureDevtoolsComponentCompanions() {
    const jsFiles = walk(path.join(root, 'components'), file => file.endsWith('.js'))
    for (const file of jsFiles) {
        const jsCompanion = `${file}.js`
        if (!fs.existsSync(jsCompanion)) fs.writeFileSync(jsCompanion, `require('./${path.basename(file)}')\n`)
        for (const [suffix, content] of Object.entries({
            '.wxml': '<slot></slot>\n',
            '.wxss': '',
            '.json': '{"component":true,"usingComponents":{}}\n'
        })) {
            const companion = `${file}${suffix}`
            if (!fs.existsSync(companion)) fs.writeFileSync(companion, content)
        }
    }

    const files = ['app.js', 'app.json', 'app.wxss', 'common', 'components', 'pages'].flatMap(item => {
        const full = path.join(root, item)
        if (!fs.existsSync(full)) return []
        if (fs.statSync(full).isDirectory()) return walk(full, file => /\.(json|js|wxml|wxss|wxs)$/.test(file))
        return /\.(json|js|wxml|wxss|wxs)$/.test(full) ? [full] : []
    })
    const componentPattern = /components\/[A-Za-z0-9_./-]+\/[A-Za-z0-9_-]+(?=(?:\.(?:vue|js|json|wxml|wxss))?[\s"'`),;]|$)/g
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf8')
        let match
        while ((match = componentPattern.exec(text))) {
            const component = match[0].replace(/^\//, '').replace(/\.(vue|js|json|wxml|wxss)$/, '')
            if (component.includes('node_modules')) continue
            if (!exists(`${component}.json`)) ensureComponent(component)
        }
    }
}

function ensureKnownRootComponentFallbacks() {
    ensureComponent('components/tki-qrcode/qrcode')
    const tkiSource = path.resolve('components/tki-qrcode')
    const tkiTarget = path.join(root, 'components/tki-qrcode')
    if (fs.existsSync(tkiSource)) fs.cpSync(tkiSource, tkiTarget, { recursive: true })
    ensureComponent('components/tki-qrcode/qrcode')
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

function referencedMainComponents() {
    const referenced = new Set()
    const queue = []
    const jsonFiles = walk(root, file => file.endsWith('.json'))

    for (const file of jsonFiles) {
        let json
        try { json = readJson(file) } catch { continue }
        const relative = path.relative(root, file).replace(/\\/g, '/')
        for (const value of Object.values(json.usingComponents || {})) {
            const component = resolveComponent(relative, value)
            if (component?.startsWith('components/') && exists(`${component}.json`) && !referenced.has(component)) {
                referenced.add(component)
                queue.push(component)
            }
        }
    }

    while (queue.length) {
        const current = queue.shift()
        const jsonFile = path.join(root, `${current}.json`)
        if (!fs.existsSync(jsonFile)) continue
        let json
        try { json = readJson(jsonFile) } catch { continue }
        for (const value of Object.values(json.usingComponents || {})) {
            const component = resolveComponent(`${current}.json`, value)
            if (component?.startsWith('components/') && exists(`${component}.json`) && !referenced.has(component)) {
                referenced.add(component)
                queue.push(component)
            }
        }
    }

    return referenced
}

function pruneMainComponents(app) {
    const reachable = new Set([...reachableMainComponents(app), ...referencedMainComponents()])
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

async function minifyMainPackage() {
    let savedBytes = 0
    const terser = loadTerser()
    const minCss = value => value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1')
    for (const item of ['common', 'components', 'pages']) {
        const files = walk(path.join(root, item), file => file.endsWith('.wxss'))
        for (const file of files) {
            const before = fs.readFileSync(file, 'utf8')
            const after = minCss(before)
            if (after.length < before.length) {
                fs.writeFileSync(file, after)
                savedBytes += Buffer.byteLength(before) - Buffer.byteLength(after)
            }
        }
    }
    if (!terser?.minify) return savedBytes

    const options = {
        compress: false,
        mangle: false,
        output: { comments: false }
    }
    const files = ['app.js', 'common', 'components', 'pages'].flatMap(item => {
        const full = path.join(root, item)
        if (!fs.existsSync(full)) return []
        if (fs.statSync(full).isDirectory()) return walk(full, file => file.endsWith('.js'))
        return full.endsWith('.js') ? [full] : []
    })
    for (const file of files) {
        const before = fs.readFileSync(file, 'utf8')
        let result
        try {
            result = terser.minify(before, options)
            if (result?.then) result = await result
        } catch {
            continue
        }
        if (result?.code && !result.error && result.code.length < before.length) {
            fs.writeFileSync(file, `${result.code}\n`)
            savedBytes += Buffer.byteLength(before) - Buffer.byteLength(result.code)
        }
    }
    return savedBytes
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
cleanGeneratedProjectConfig()
const app = readJson(path.join(root, 'app.json'))
splitMainPages(app)
writeJson(path.join(root, 'app.json'), app)
localizeSubpackageComponents(app)
removeMainPackagePosterComponents(app)
removeUnusedPosterPainterComponent()
removeBrokenPosterPainterReferences()
ensureReferencedComponents()
removeBrokenPosterPainterReferences()
pruneMainComponents(app)
ensureReferencedMainChunks()
removeBrokenPosterPainterReferences()
removeUnusedPosterPainterComponent()
removeBrokenPosterPainterReferences()
pruneMainComponents(app)
pruneUnusedMainStatic()
ensureRootPainterFallbacks()
const minifiedBytes = await minifyMainPackage()
ensureVueQueryModuleStubs()
ensureDevtoolsComponentCompanions()
ensureKnownRootComponentFallbacks()
const finalApp = readJson(path.join(root, 'app.json'))
const missing = validateComponents()
const sizes = packageSizes(finalApp)
console.log(JSON.stringify({ missingComponents: missing.length, minifiedBytes, ...sizes }, null, 2))
if (missing.length) process.exit(1)
if (sizes.mainBytes > maxMainPackageBytes) process.exit(2)
