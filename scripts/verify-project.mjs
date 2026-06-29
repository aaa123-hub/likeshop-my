import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const pagesJsonPath = path.join(rootDir, 'pages.json')
const ignoreDirs = new Set(['.git', 'node_modules', 'unpackage'])
const errors = []

verifyPagesJson()
verifyCoreJsSyntax()
verifyRouteReferences()
verifyConflictMarkers()
verifyApiRequestPaths()

if (errors.length) {
    console.error(errors.map((item) => `- ${item}`).join('\n'))
    process.exit(1)
}

console.log('Project verification passed')

function verifyPagesJson() {
    const pagesConfig = readPagesJson()
    const registeredRoutes = getRegisteredRoutes(pagesConfig)

    for (const route of registeredRoutes) {
        const filePath = path.join(rootDir, `${route.slice(1)}.vue`)
        if (!fs.existsSync(filePath)) {
            errors.push(`Missing page file registered in pages.json: ${route}`)
        }
    }

    const tabBarPages = pagesConfig.tabBar?.list || []
    for (const item of tabBarPages) {
        if (!registeredRoutes.has(`/${item.pagePath}`)) {
            errors.push(`Missing registered page for tabBar item: ${item.pagePath}`)
        }
        for (const iconKey of ['iconPath', 'selectedIconPath']) {
            const iconPath = item[iconKey]
            if (iconPath && !fs.existsSync(path.join(rootDir, iconPath))) {
                errors.push(`Missing tabBar ${iconKey}: ${iconPath}`)
            }
        }
    }
}

function verifyCoreJsSyntax() {
    const dirs = ['api', 'utils', 'store']
    const files = dirs.flatMap((dir) => walk(path.join(rootDir, dir)).filter((file) => file.endsWith('.js')))

    for (const file of files) {
        const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
        if (result.status !== 0) {
            errors.push(`JS syntax error in ${relative(file)}: ${result.stderr.trim() || result.stdout.trim()}`)
        }
    }
}

function verifyRouteReferences() {
    const pagesConfig = readPagesJson()
    const registeredRoutes = getRegisteredRoutes(pagesConfig)
    const routePattern = /['"](\/(?:pages|bundle|bundle_user|bundle_misc|bundle_finance|business|activity|bundle_poster|bundle_shared_components)\/[^'"?#]+)(?:\?[^'"]*)?['"]/g

    for (const file of walk(rootDir).filter((item) => /\.(vue|js)$/.test(item))) {
        const content = fs.readFileSync(file, 'utf8')
        let match
        while ((match = routePattern.exec(content))) {
            const route = match[1].replace(/\.vue$/, '')
            const existsAsRegistered = registeredRoutes.has(route)
            const existsAsFile = fs.existsSync(path.join(rootDir, `${route.slice(1)}.vue`))
            if (!existsAsRegistered && !existsAsFile) {
                errors.push(`Missing route target in ${relative(file)}: ${route}`)
            }
        }
    }
}

function verifyConflictMarkers() {
    const markerPattern = /^(<<<<<<<|=======|>>>>>>>)/m
    for (const file of walk(rootDir).filter((item) => /\.(vue|js|json|scss|css|md)$/.test(item))) {
        const content = fs.readFileSync(file, 'utf8')
        if (markerPattern.test(content)) {
            errors.push(`Conflict marker found in ${relative(file)}`)
        }
    }
}

function verifyApiRequestPaths() {
    const requestPattern = /request\.(get|post|put|delete)\(\s*(['"`])([^'"`]+)\2/g
    for (const file of walk(path.join(rootDir, 'api')).filter((item) => item.endsWith('.js'))) {
        const content = fs.readFileSync(file, 'utf8')
        let match
        while ((match = requestPattern.exec(content))) {
            const requestPath = match[3]
            if (!requestPath.startsWith('miniapp/')) {
                errors.push(`API request path must use miniapp gateway prefix in ${relative(file)}: ${requestPath}`)
            }
        }
    }
}

function readPagesJson() {
    try {
        return JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'))
    } catch (error) {
        errors.push(`Invalid pages.json: ${error.message}`)
        return {}
    }
}

function getRegisteredRoutes(pagesConfig) {
    const routes = new Set()
    for (const page of pagesConfig.pages || []) {
        addRoute(routes, `/${page.path}`)
    }
    for (const subPackage of pagesConfig.subPackages || []) {
        for (const page of subPackage.pages || []) {
            addRoute(routes, `/${subPackage.root}/${page.path}`)
        }
    }
    return routes
}

function addRoute(routes, route) {
    if (routes.has(route)) {
        errors.push(`Duplicate page route registered in pages.json: ${route}`)
    }
    routes.add(route)
}

function walk(dir, files = []) {
    if (!fs.existsSync(dir)) return files
    for (const name of fs.readdirSync(dir)) {
        if (ignoreDirs.has(name)) continue
        const fullPath = path.join(dir, name)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) walk(fullPath, files)
        else files.push(fullPath)
    }
    return files
}

function relative(file) {
    return path.relative(rootDir, file)
}
