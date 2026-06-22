import { getStaticAssetUrl } from '@/utils/design-assets'

export const imagePlaceholders = {
    common: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/goods_null.png'),
    goods: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/goods_null.png'),
    avatar: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp/23fbcc3e9fa1450bb088262b36bace08/user-avatar-default.png'),
    address: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/address_null.png'),
    cart: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/cart_null.png'),
    order: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/order_null.png'),
    news: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/news_null.png'),
    coupon: getStaticAssetUrl('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/coupon_null.png')
}

export function getPlaceholderImage(type = 'common') {
    return imagePlaceholders[type] || imagePlaceholders.common
}

export function resolveImage(src, type = 'common') {
    if (Array.isArray(src)) {
        const image = src.find(Boolean)
        return image ? getStaticAssetUrl(image) : getPlaceholderImage(type)
    }
    return src ? getStaticAssetUrl(src) : getPlaceholderImage(type)
}

export function isPlaceholderImage(src) {
    if (!src) return true
    const value = String(src)
    return Object.keys(imagePlaceholders).some(type => value === imagePlaceholders[type])
        || value.includes('/static/images/goods_null.png')
        || value.includes('/static/images/address_null.png')
        || value.includes('/static/images/cart_null.png')
        || value.includes('/static/images/order_null.png')
        || value.includes('/static/images/news_null.png')
        || value.includes('/static/images/coupon_null.png')
}
