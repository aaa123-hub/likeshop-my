import request from '@/utils/request'
import { orderBuy } from '@/api/order'
import { resolveImage } from '@/utils/image-placeholder'

function normalizePage(data = {}, itemNormalizer) {
    const rawList = Array.isArray(data) ? data : (data.list || data.records || data.items || data.rows || data.content || [])
    const list = itemNormalizer ? rawList.map(itemNormalizer) : rawList
    const pageNo = data.pageNo || data.page_no || 1
    const pageSize = data.pageSize || data.page_size || list.length || 10
    const total = data.total || list.length
    const more = data.hasNext ?? data.more ?? (Number(total) > Number(pageNo) * Number(pageSize))
    return {
        ...(!Array.isArray(data) ? data : {}),
        list,
        lists: list,
        pageNo,
        page_no: pageNo,
        pageSize,
        page_size: pageSize,
        total,
        hasNext: more,
        more
    }
}

function normalizeCoupon(item = {}) {
    const threshold = item.thresholdAmount ?? item.threshold_amount ?? 0
    const couponId = item.couponId || item.coupon_id || item.templateId || item.template_id || item.couponTemplateId || item.coupon_template_id || item.id
    return {
        ...item,
        id: item.id || couponId,
        coupon_id: couponId,
        couponId,
        name: item.name || item.couponName || '',
        money: item.money || item.discountValue || item.discount_value || 0,
        use_condition: item.use_condition || (Number(threshold) > 0 ? `满${threshold}可用` : '无门槛'),
        use_time_tips: item.use_time_tips || [item.startTime, item.endTime].filter(Boolean).join(' 至 '),
        coupon_type: item.coupon_type || item.couponType || '',
        is_get: item.is_get || item.received || false,
        tips: item.tips || ''
    }
}

function parseRuleJson(value) {
    if (!value) return {}
    if (typeof value === 'object') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        return {
            ruleDesc: String(value)
        }
    }
}

function normalizeActivityProduct(item = {}) {
    return {
        ...item,
        id: item.id || item.spuId || item.productId,
        goods_id: item.goods_id || item.spuId || item.productId || item.id,
        name: item.name || item.spuName || item.productName || item.title || '',
        goods_name: item.goods_name || item.spuName || item.productName || item.title || item.name || '',
        shopName: item.shopName || item.shop_name || '',
        image: resolveImage(item.image || item.mainImageUrl || item.cover || item.imageUrl, 'goods'),
        price: item.price || item.activityPrice || item.salePrice || item.minSalePrice || 0,
        enabled: item.enabled !== false
    }
}

function normalizeActivity(item = {}) {
    const rule = parseRuleJson(item.ruleJson || item.rule_json || item.rule || {})
    const products = Array.isArray(rule.products) ? rule.products.map(normalizeActivityProduct) : []
    return {
        ...item,
        id: item.id || item.activityId,
        name: item.name || item.title || item.activityName || '',
        title: item.title || item.name || item.activityName || '',
        image: resolveImage(item.image || item.coverUrl || item.cover_url || products[0]?.image, 'goods'),
        create_time: item.create_time || item.startTime || '',
        start_time: item.start_time || item.startTime,
        end_time: item.end_time || item.endTime,
        status_text: item.status_text || item.activityStatus || '',
        activity_type: item.activity_type || item.activityType,
        rule,
        ruleDesc: rule.ruleDesc || item.ruleDesc || '',
        rewardRule: rule.rewardRule || item.rewardRule || '',
        materialDesc: rule.materialDesc || item.materialDesc || '',
        products
    }
}

function activityType(params = {}, fallback) {
    return params.activityType || params.activity_type || params.type || fallback
}

function getActivityPage(params = {}, fallbackType) {
    return request.get('miniapp/activity/list', {
        params: {
            activityType: activityType(params, fallbackType),
            pageNo: params.pageNo || params.page_no || 1,
            pageSize: params.pageSize || params.page_size || 10
        }
    }).then((res) => res.code == 1 ? { ...res, data: normalizePage(res.data || {}, normalizeActivity) } : res)
}

function unsupportedPage(message = '后端暂未提供该活动接口') {
    return Promise.resolve({
        code: 0,
        msg: message,
        data: normalizePage({ list: [] })
    })
}

export function getGoodsCoupon(data) {
    return request.post(`miniapp/coupons/${data.id || data.couponId || 0}/receive`, {
        receiveScene: data.receiveScene || data.receive_scene || 'APP'
    })
}

export function getCouponList(data = {}) {
    return request.get('miniapp/coupons', {
        params: {
            pageNo: data.pageNo || data.page_no || 1,
            pageSize: data.pageSize || data.page_size || 20
        }
    }).then((res) => res.code == 1 ? { ...res, data: normalizePage(res.data || {}, normalizeCoupon) } : res)
}

export function getActivityGoodsLists(data) {
    return getActivityPage(data)
}

export function getSeckillTime() {
    return getActivityPage({ pageNo: 1, pageSize: 20 }, 'SECKILL')
}

export function getSeckillGoods(params) {
    return getActivityPage(params, 'SECKILL')
}

export function getGroupList(params) {
    return getActivityPage(params, 'GROUP_BUY')
}

export function getUserGroup(params) {
    return getActivityPage(params, 'GROUP_BUY')
}

export function getTeamInfo(params) {
    return request.get('miniapp/product/' + (params.id || params.team_id || 0), { params })
}

export function teamCheck(data) {
    return unsupportedPage('拼团队伍校验接口暂未开放')
}

export function teamBuy(data) {
    return orderBuy(data)
}

export function getBargainList(data) {
    return getActivityPage(data, 'BARGAIN')
}

export function getBargainDetail(data) {
    return getActivityPage({ ...data, pageNo: 1, pageSize: 1 }, 'BARGAIN').then((res) => {
        if (res.code != 1) return res
        return { ...res, data: res.data.list[0] || {} }
    })
}

export function getBargainNumber() {
    return getActivityPage({ pageNo: 1, pageSize: 1 }, 'BARGAIN').then((res) => {
        if (res.code != 1) return res
        return { ...res, data: res.data.total || 0 }
    })
}

export function launchBargain() {
    return unsupportedPage('后端暂未提供发起砍价接口')
}

export function getBargainActivityList(data) {
    return getActivityPage(data, 'BARGAIN')
}

export function getBargainActivityDetail(data) {
    return getBargainDetail(data)
}

export function getBargainPost(data) {
    return getBargainDetail(data)
}

export function helpBargain() {
    return unsupportedPage('后端暂未提供帮砍接口')
}

export function closeBargainOrder() {
    return unsupportedPage('后端暂未提供关闭砍价订单接口')
}
