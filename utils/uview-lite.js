import { translateBackendMessage } from '@/utils/message'

const zIndex = {
    toast: 10090,
    noNetwork: 10080,
    popup: 10075,
    mask: 10070,
    navbar: 980,
    topTips: 975,
    sticky: 970,
    indexListSticky: 965
}

const addUnit = (value = 'auto', unit = 'rpx') => {
    if (value === 'auto') return value
    const valueText = String(value)
    return /(%|px|rpx|upx|vw|vh|auto)$/.test(valueText) ? valueText : `${valueText}${unit}`
}

const guid = (len = 32) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    const uuid = []
    for (let i = 0; i < len; i += 1) {
        uuid[i] = chars[Math.floor(Math.random() * chars.length)]
    }
    return uuid.join('')
}

const parent = function parent(name) {
    let component = this.$parent
    while (component) {
        if (component.$options && component.$options.name === name) return component
        component = component.$parent
    }
    return false
}

const sys = () => uni.getSystemInfoSync()

const getRect = (selector, all = false) => new Promise((resolve) => {
    const query = uni.createSelectorQuery()
    const target = all ? query.selectAll(selector) : query.select(selector)
    target.boundingClientRect((rect) => resolve(rect))
    query.exec()
})

const timeFormat = (value, format = 'yyyy-mm-dd hh:MM:ss') => {
    if (!value) return ''
    const numeric = Number(value)
    const normalized = typeof value === 'string' ? value.replace(/(\.\d{3})\d+/, '$1') : value
    const date = Number.isNaN(numeric) ? new Date(normalized) : new Date(numeric > 10000000000 ? numeric : numeric * 1000)
    if (Number.isNaN(date.getTime())) return String(value)
    const pad = (num) => String(num).padStart(2, '0')
    const map = {
        yyyy: date.getFullYear(),
        mm: pad(date.getMonth() + 1),
        dd: pad(date.getDate()),
        hh: pad(date.getHours()),
        MM: pad(date.getMinutes()),
        ss: pad(date.getSeconds())
    }
    return Object.keys(map).reduce((text, key) => text.replace(key, map[key]), format)
}

const liteUView = {
    addUnit,
    guid,
    zIndex,
    type: ['primary', 'success', 'error', 'warning', 'info'],
    color: {
        primary: '#a0610d',
        success: '#19be6b',
        error: '#d65f2e',
        warning: '#ff9900',
        info: '#909399'
    },
    config: { v: 'lite', version: 'lite', type: ['primary', 'success', 'error', 'warning', 'info'] },
    $parent: parent,
    sys,
    getRect,
    toast: (title) => uni.showToast({ title: translateBackendMessage(title, String(title)), icon: 'none' }),
    trim: (value) => String(value).trim(),
    randomArray: (array = []) => array.slice().sort(() => Math.random() - 0.5),
    throttle(fn, delay = 500) {
        let timer = 0
        return function throttled(...args) {
            const now = Date.now()
            if (now - timer > delay) {
                timer = now
                return fn.apply(this, args)
            }
        }
    }
}

export default {
    install(Vue) {
        uni.$u = liteUView
        Vue.prototype.$u = liteUView
        Vue.filter('timeFormat', (value, format) => timeFormat(value, format))
        Vue.filter('date', (value, format) => timeFormat(value, format))
        Vue.filter('timeFrom', (value) => value)
    }
}
