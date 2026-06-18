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

export function getGoodsCoupon(data) {
    return request.get(`miniapp/coupons/${data.id || data.couponId || 0}/receive`, {
        params: data
    })
}

export function getCouponList(data) {
    return Promise.resolve({ code: 1, data: [] })
}

export function getActivityGoodsLists(data) {
    return request.get('miniapp/activity/list', { params: data }).then((res) => {
        if (res.code == 1) {
            return { ...res, data: res.data || emptyPage() }
        }
        return res
    })
}

export function getSeckillTime() {
    return request.get('miniapp/activity/list')
}

export function getSeckillGoods(params) {
    return request.get('miniapp/activity/list', { params })
}

export function getGroupList(params) {
    return request.get('miniapp/activity/list', { params })
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
