import request from '@/utils/request'
import { orderBuy } from '@/api/order'

function emptyPage() {
    return {
        list: [],
        pageNo: 1,
        pageSize: 10,
        total: 0,
        hasNext: false
    }
}

function normalizeActivityPage(res = {}) {
    if (res.code != 1) return res
    const data = res.data || {}
    const list = Array.isArray(data) ? data : (data.list || data.items || data.rows || [])
    return {
        ...res,
        data: {
            ...(!Array.isArray(data) ? data : {}),
            list,
            lists: list,
            pageNo: data.pageNo || data.page_no || 1,
            page_no: data.pageNo || data.page_no || 1,
            pageSize: data.pageSize || data.page_size || list.length || 10,
            total: data.total || list.length,
            hasNext: data.hasNext ?? data.more ?? false,
            more: data.hasNext ?? data.more ?? false
        }
    }
}

export function getGoodsCoupon(data) {
    return request.post(`miniapp/coupons/${data.id || data.couponId || 0}/receive`, {
        receiveScene: data.receiveScene || data.receive_scene || 'APP'
    })
}

export function getCouponList(data) {
    return Promise.resolve({ code: 1, data: [] })
}

export function getActivityGoodsLists(data) {
    return request.get('miniapp/activity/list', {
        params: {
            activityType: data.activityType || data.type,
            pageNo: data.pageNo || data.page_no || data.page || 1,
            pageSize: data.pageSize || data.page_size || 10
        }
    }).then(normalizeActivityPage)
}

export function getSeckillTime() {
    return request.get('miniapp/activity/list', {
        params: { activityType: 'SECKILL', pageNo: 1, pageSize: 10 }
    }).then(normalizeActivityPage)
}

export function getSeckillGoods(params) {
    return request.get('miniapp/activity/list', {
        params: {
            activityType: params?.activityType || 'SECKILL',
            pageNo: params?.pageNo || params?.page_no || params?.page || 1,
            pageSize: params?.pageSize || params?.page_size || 10
        }
    }).then(normalizeActivityPage)
}

export function getGroupList(params) {
    return request.get('miniapp/activity/list', {
        params: {
            activityType: params?.activityType || 'GROUP_BUY',
            pageNo: params?.pageNo || params?.page_no || params?.page || 1,
            pageSize: params?.pageSize || params?.page_size || 10
        }
    }).then(normalizeActivityPage)
}

export function getUserGroup(params) {
    return Promise.resolve({ code: 1, data: emptyPage() })
}

export function getTeamInfo(params) {
    return request.get('miniapp/product/' + (params.id || params.team_id || 0), { params })
}

export function teamCheck(data) {
    return Promise.resolve({ code: 1, data })
}

export function teamBuy(data) {
    return orderBuy(data)
}

export function getBargainList(data) {
    return Promise.resolve({ code: 1, data: emptyPage() })
}

export function getBargainDetail(data) {
    return Promise.resolve({ code: 1, data: {} })
}

export function getBargainNumber() {
    return Promise.resolve({ code: 1, data: 0 })
}

export function launchBargain(data) {
    return Promise.resolve({ code: 1, data })
}

export function getBargainActivityList(data) {
    return Promise.resolve({ code: 1, data: emptyPage() })
}

export function getBargainActivityDetail(data) {
    return Promise.resolve({ code: 1, data: {} })
}

export function getBargainPost(data) {
    return Promise.resolve({ code: 1, data: {} })
}

export function helpBargain(data) {
    return Promise.resolve({ code: 1, data })
}

export function closeBargainOrder(data) {
    return Promise.resolve({ code: 1, data })
}
