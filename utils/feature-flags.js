const disabledFeatures = {
    activityCenter: '活动中心暂未开放',
    activityExchange: '活动兑换暂未开放',
    bargain: '砍价活动暂未开放',
    passwordReset: '找回密码暂未开放'
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
    const message = encodeURIComponent(getFeatureDisabledMessage(feature) || '该功能暂未开放')
    uni.navigateTo({
        url: `/business/pages/business_pages/developing?message=${message}`,
        fail: () => {
            uni.showToast({
                title: getFeatureDisabledMessage(feature),
                icon: 'none'
            })
        }
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
