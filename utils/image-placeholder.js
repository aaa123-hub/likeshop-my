export const imagePlaceholders = {
    common: '/static/images/goods_null.png',
    goods: '/static/images/goods_null.png',
    avatar: '/static/lanhu/assets/my/my_avatar_default@2x.png',
    address: '/static/images/address_null.png',
    cart: '/static/images/cart_null.png',
    order: '/static/images/order_null.png',
    news: '/static/images/news_null.png',
    coupon: '/static/images/coupon_null.png'
}

export function getPlaceholderImage(type = 'common') {
    return imagePlaceholders[type] || imagePlaceholders.common
}

export function resolveImage(src, type = 'common') {
    if (Array.isArray(src)) {
        const image = src.find(Boolean)
        return image || getPlaceholderImage(type)
    }
    return src || getPlaceholderImage(type)
}

export function isPlaceholderImage(src) {
    return !src || String(src).includes('/static/images/goods_null.png')
}
