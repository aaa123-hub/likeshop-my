const disabledFeatures = {
    activityCenter: '活动中心后端兑换/营销流程暂未闭环',
    activityExchange: '活动兑换后端暂未闭环',
    bargain: '砍价活动后端暂未提供完整接口',
    passwordReset: '短信与找回密码后端暂未闭环'
}

const disabledRouteRules = [
    { feature: 'activityCenter', pattern: '/business/pages/business_pages/activity_center' },
    { feature: 'activityExchange', pattern: '/business/pages/business_pages/activity_exchange' },
    { feature: 'bargain', pattern: '/activity/pages/bargain/bargain' },
    { feature: 'bargain', pattern: '/activity/pages/bargain_code/bargain_code' },
    { feature: 'bargain', pattern: '/activity/pages/bargain_process/bargain_process' },
    { feature: 'passwordReset', pattern: '/bundle/pages/forget_pwd/forget_pwd' }
]

export function isFeatureEnabled(feature) {
    return !disabledFeatures[feature]
}

export function getFeatureDisabledMessage(feature) {
    return disabledFeatures[feature] || '该功能暂未开放'
}

export function getDisabledRouteFeature(url = '') {
    const target = String(url).split('?')[0]
    const rule = disabledRouteRules.find((item) => target.startsWith(item.pattern))
    return rule ? rule.feature : ''
}

export function isRouteEnabled(url = '') {
    return !getDisabledRouteFeature(url)
}

export function showFeatureDisabledToast(feature) {
    uni.showToast({
        title: getFeatureDisabledMessage(feature),
        icon: 'none'
    })
}

export function guardRoute(url = '') {
    const feature = getDisabledRouteFeature(url)
    if (!feature) return true
    showFeatureDisabledToast(feature)
    return false
}

export function filterEnabledRoutes(routes = []) {
    return routes.filter((route) => !route || !route.url || isRouteEnabled(route.url))
}
