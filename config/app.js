const SWITCH_DEVELOPMENT = false

// #ifdef H5
const IS_H5 = true
// #endif

// #ifndef H5
const IS_H5 = false
// #endif

// Backend API origin. Change this one value when switching domains.
const API_ORIGIN = 'https://shengyuan.store'

const baseURLMap = {
    development: API_ORIGIN,
    production: API_ORIGIN
}

const runtimeEnv = process.env.NODE_ENV || 'production'
const baseURL = SWITCH_DEVELOPMENT ? baseURLMap.development : (baseURLMap[runtimeEnv] || API_ORIGIN)

module.exports = {
    version: '3.0.3',
    baseURL,
    basePath: '/mobile'
}
