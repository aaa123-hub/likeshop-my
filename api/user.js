import request from '../utils/request'
import { client } from '@/utils/tools'
import area from '@/utils/area'
import Cache from '@/utils/cache'
import { USER_INFO } from '@/config/cachekey'
import { resolveImage } from '@/utils/image-placeholder'

function normalizeListResponse(res = {}) {
    const data = res.data || {}
    const list = data.list || data.items || data.rows || data || []
    return {
        ...res,
        data: Array.isArray(list)
            ? list
            : data,
    }
}

function normalizePageResponse(res = {}, itemNormalizer) {
    const data = res.data || {}
    const sourceList = Array.isArray(data) ? data : (data.list || data.items || data.rows || [])
    const list = itemNormalizer ? sourceList.map(itemNormalizer) : sourceList
    const pageNo = data.pageNo || data.page_no || 1
    const pageSize = data.pageSize || data.page_size || list.length || 10
    const total = data.total || list.length
    const hasNext = data.hasNext ?? data.more ?? (Number(total) > Number(pageNo) * Number(pageSize))
    return {
        ...res,
        data: {
            ...(!Array.isArray(data) ? data : {}),
            list,
            lists: list,
            pageNo,
            page_no: pageNo,
            pageSize,
            page_size: pageSize,
            total,
            hasNext,
            more: hasNext
        }
    }
}

function fakeUserInfo() {
    return {
        avatar: '',
        nickname: '',
        sn: '',
        mobile: '',
        sex: 0,
        create_time: '',
        user_money: 0,
        user_integral: 0,
        coupon: 0,
        wait_pay: 0,
        wait_delivery: 0,
        wait_take: 0,
        wait_comment: 0,
        after_sale: 0,
        distribution_code: '',
        next_level_tips: ''
    }
}

function normalizeUserProfile(data = {}) {
    const genderValue = data.sex ?? data.gender ?? 0
    return {
        ...fakeUserInfo(),
        ...data,
        id: data.id || data.userId,
        user_id: data.user_id || data.userId || data.id,
        avatar: resolveImage(data.avatar || data.avatarUrl || data.headimgurl, 'avatar'),
        nickname: data.nickname || data.nickName || data.userName || fakeUserInfo().nickname,
        sn: data.sn || data.userNo || data.inviteCode || data.openId || fakeUserInfo().sn,
        mobile: data.mobile || data.phone || '',
        sex: normalizeGenderForView(genderValue),
        user_money: data.user_money ?? data.balance ?? data.walletBalance ?? 0,
        user_integral: data.user_integral ?? data.availablePoints ?? data.points ?? 0,
        coupon: data.coupon ?? data.couponCount ?? 0,
        wait_pay: data.wait_pay ?? data.waitPay ?? 0,
        wait_delivery: data.wait_delivery ?? data.waitDelivery ?? 0,
        wait_take: data.wait_take ?? data.waitTake ?? data.waitReceive ?? 0,
        wait_comment: data.wait_comment ?? data.waitComment ?? 0,
        after_sale: data.after_sale ?? data.afterSale ?? 0,
        distribution_code: data.distribution_code || data.distributionCode || data.inviteCode || fakeUserInfo().distribution_code,
        next_level_tips: data.next_level_tips || data.nextLevelTips || '立即开通'
    }
}

function normalizeGenderForView(value) {
    if (value === 1 || value === '1' || value === 'MALE' || value === 'male' || value === '男') return 1
    if (value === 2 || value === '2' || value === 'FEMALE' || value === 'female' || value === '女') return 2
    return 0
}

function normalizeGenderForApi(value) {
    if (value === 1 || value === '1' || value === 'MALE' || value === 'male' || value === '男') return 'MALE'
    if (value === 2 || value === '2' || value === 'FEMALE' || value === 'female' || value === '女') return 'FEMALE'
    if (value === 0 || value === '0' || value === 'UNKNOWN' || value === 'unknown') return 'UNKNOWN'
    return value
}

function assignIfPresent(target, keys, value) {
    if (value === undefined || value === null || value === '') return
    keys.forEach((key) => {
        target[key] = value
    })
}

function normalizeAddress(item = {}) {
    const gender = item.gender || item.sex || item.contactGender || item.receiverGender || ''
    return {
        ...item,
        id: item.id || item.addressId,
        addressId: item.addressId || item.id,
        contact: item.contact || item.receiverName || item.receiver_name || '',
        telephone: item.telephone || item.mobile || item.phone || item.tel || '',
        province: item.province || item.provinceName || '',
        city: item.city || item.cityName || '',
        district: item.district || item.districtName || '',
        address: item.address || item.detailAddress || item.detail_address || '',
        is_default: item.is_default ?? item.isDefault ?? 0,
        gender: gender === 'FEMALE' || gender === '女士' || gender === 2 || gender === '2' ? '女士' : '先生',
        province_id: item.province_id || item.provinceCode || '',
        city_id: item.city_id || item.cityCode || '',
        district_id: item.district_id || item.districtCode || ''
    }
}

function normalizeCoupon(item = {}) {
    const threshold = item.thresholdAmount ?? item.threshold_amount ?? 0
    return {
        ...item,
        id: item.id || item.couponId,
        name: item.name || item.couponName || item.coupon_name || '',
        money: item.money || item.amount || item.discountAmount || item.discountValue || 0,
        use_condition: item.use_condition || item.useCondition || item.condition || (Number(threshold) > 0 ? `满${threshold}可用` : '无门槛'),
        use_time_tips: item.use_time_tips || [item.startTime, item.endTime].filter(Boolean).join(' 至 '),
        coupon_type: item.coupon_type || item.couponType || '',
        is_get: item.is_get || item.received || false
    }
}

function unsupported(message) {
    return Promise.resolve({ code: 0, msg: message, data: null })
}

function currentUserId(data = {}) {
    const userInfo = Cache.get(USER_INFO) || {}
    return data.userId || data.user_id || userInfo.userId || userInfo.user_id || userInfo.id
}

function normalizeFavoriteProduct(item = {}) {
    const target = item.target || item.product || item.spu || item
    return {
        ...item,
        ...target,
        id: target.id || target.spuId || target.productId || item.targetId,
        goods_id: target.goods_id || target.spuId || target.productId || target.id || item.targetId,
        name: target.name || target.spuName || target.productName || target.title || item.targetName || '',
        goods_name: target.goods_name || target.spuName || target.productName || target.title || item.targetName || '',
        image: resolveImage(target.image || target.mainImageUrl || target.cover || target.imageUrl || item.targetImage, 'goods'),
        price: target.price || target.salePrice || target.minPrice || item.price || 0,
        market_price: target.market_price || target.marketPrice || target.originPrice || target.price || 0
    }
}

function normalizeWallet(res = {}) {
    const data = res.data || {}
    return {
        ...res,
        data: {
            balance: data.balance || data.user_money || 0,
            frozenAmount: data.frozenAmount || 0,
            withdrawableAmount: data.withdrawableAmount || data.balance || 0,
            currency: data.currency || 'CNY',
            user_money: data.balance || data.user_money || 0,
            frozen_amount: data.frozenAmount || data.frozen_amount || 0,
            withdrawable_amount: data.withdrawableAmount || data.withdrawable_amount || data.balance || 0,
            open_racharge: data.open_racharge ?? 1,
            ...data
        }
    }
}

function normalizeLedgerItem(item = {}) {
    const amount = item.changeAmount ?? item.change_amount ?? item.amount ?? item.money ?? 0
    const balance = item.balanceAfter ?? item.balance ?? item.left_amount ?? item.left_money ?? 0
    return {
        ...item,
        id: item.id || item.ledgerId || item.flowId,
        source_type: item.source_type || item.bizType || item.biz_type || item.type,
        type_desc: item.type_desc || item.bizTypeName || item.bizType || item.title || item.desc,
        change_amount: amount,
        change_type: item.change_type || (Number(amount) >= 0 ? 1 : 2),
        left_amount: balance,
        left_money: balance,
        create_time: item.create_time || item.createTime || item.txnTime || item.time,
        change_time: item.change_time || item.createTime || item.txnTime || item.time
    }
}

function normalizeMessageItem(item = {}) {
    return {
        ...item,
        id: item.id || item.messageId,
        type: item.type || item.bizType || item.channelType,
        title: item.title || '',
        content: item.content || '',
        create_time: item.create_time || item.sendTime || '',
        read_flag: item.read_flag ?? item.readFlag ?? false,
        send_status: item.send_status || item.sendStatus || ''
    }
}

function normalizePayPasswordResponse() {
    return Promise.resolve({ code: 0 })
}

function findRegionCode(list, province, city, district) {
    for (const p of list || []) {
        if (p.label === province) {
            const cityNode = (p.children || []).find((c) => c.label === city)
            if (!cityNode) return {}
            const districtNode = (cityNode.children || []).find((d) => d.label === district)
            return {
                province: p.value,
                city: cityNode.value,
                district: districtNode ? districtNode.value : ''
            }
        }
        const result = findRegionCode(p.children || [], province, city, district)
        if (result.province) return result
    }
    return {}
}

export function getUser() {
    return request.get('miniapp/user/profile').then((res) => {
        if (res.code == 1) {
            return {
                ...res,
                data: normalizeUserProfile(res.data || {})
            }
        }
        return res
    })
}

export function getCoupon(id) {
    return request.post(`miniapp/coupons/${id}/receive`, {
        receiveScene: 'APP'
    })
}

function normalizeMyCouponStatus(type) {
    if (type === 1 || type === '1') return ['USED', 'USED_UP', 1]
    if (type === 2 || type === '2') return ['EXPIRED', 'INVALID', 2]
    return ['AVAILABLE', 'UNUSED', 0]
}

export function getAddressLists() {
    return request.get('miniapp/addresses').then((res) => {
        if (res.code == 1) {
            const list = Array.isArray(res.data) ? res.data : (res.data?.list || [])
            return {
                ...res,
                data: list.map(normalizeAddress)
            }
        }
        return res
    })
}

export function editAddress(data) {
    const id = data.id || data.addressId
    const payload = {
        addressId: id,
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        phone: data.telephone || data.mobile,
        telephone: data.telephone || data.mobile,
        gender: data.gender === '女士' ? 'FEMALE' : 'MALE',
        provinceCode: data.province_id || data.provinceCode,
        cityCode: data.city_id || data.cityCode,
        districtCode: data.district_id || data.districtCode,
        detailAddress: data.address || data.detailAddress,
        isDefault: data.is_default ? 1 : 0,
        is_default: data.is_default ? 1 : 0,
        defaultFlag: data.is_default ? true : false
    }
    return request.put(`miniapp/addresses/${id}`, payload).catch(() => request.post(`miniapp/addresses/${id}`, payload))
}

export function addAddress(data) {
    return request.post('miniapp/addresses', {
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        phone: data.telephone || data.mobile,
        telephone: data.telephone || data.mobile,
        gender: data.gender === '女士' ? 'FEMALE' : 'MALE',
        provinceCode: data.province_id || data.provinceCode,
        cityCode: data.city_id || data.cityCode,
        districtCode: data.district_id || data.districtCode,
        detailAddress: data.address || data.detailAddress,
        isDefault: data.is_default ? 1 : 0,
        is_default: data.is_default ? 1 : 0,
        defaultFlag: data.is_default ? true : false
    })
}

export function delAddress(id) {
    return request.delete(`miniapp/addresses/${id}`)
}

export function getOneAddress(id) {
    return request.get(`miniapp/addresses/${id}`).catch(() => request.get('miniapp/addresses').then((res) => {
        if (res.code != 1) return res
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || res.data?.items || res.data?.rows || [])
        const item = list.find((it) => String(it.id || it.addressId) === String(id)) || null
        return { ...res, data: item }
    })).then((res) => {
        if (res.code == 1 && res.data) {
            return {
                ...res,
                data: normalizeAddress(res.data)
            }
        }
        return res
    })
}

export function getDefaultAddress() {
    return request.get('miniapp/addresses').then((res) => {
        if (res.code == 1) {
            const list = Array.isArray(res.data) ? res.data : (res.data?.list || [])
            const item = list.find((it) => it.isDefault || it.is_default)
            return {
                ...res,
                data: item ? normalizeAddress(item) : {}
            }
        }
        return res
    })
}

export function setDefaultAddress(id, data = {}) {
    const payload = {
        addressId: id,
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        phone: data.telephone || data.mobile,
        telephone: data.telephone || data.mobile,
        provinceCode: data.province_id || data.provinceCode,
        cityCode: data.city_id || data.cityCode,
        districtCode: data.district_id || data.districtCode,
        detailAddress: data.address || data.detailAddress,
        gender: data.gender === '女士' ? 'FEMALE' : 'MALE',
        isDefault: 1,
        is_default: 1,
        defaultFlag: true
    }
    return request.post(`miniapp/addresses/${id}/default`, payload).then((res) => {
        if (res.code == 1) return res
        return request.put(`miniapp/addresses/${id}`, payload)
    }).catch(() => request.put(`miniapp/addresses/${id}`, payload))
}

export function hasRegionCode(data) {
    const result = findRegionCode(area, data.province, data.city, data.district)
    return Promise.resolve({
        code: 1,
        data: result
    })
}

export function getMyCoupon(data = {}) {
    const statuses = normalizeMyCouponStatus(data.status ?? data.type)
    return request.get('miniapp/coupons', {
        params: {
            status: data.statusText || data.couponStatus || statuses[0],
            couponStatus: data.statusText || data.couponStatus || statuses[0],
            receiveStatus: data?.receiveStatus || statuses[1],
            useStatus: statuses[2],
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 50
        }
    }).then((res) => {
        if (res.code != 1) return res
        const payload = res.data || {}
        const list = Array.isArray(payload) ? payload : (payload.list || payload.items || payload.rows || payload.records || [])
        return {
            ...res,
            data: list.map(normalizeCoupon)
        }
    }).catch(() => ({ code: 1, data: [] }))
}

export function getCollectGoods(data) {
    return request.get('miniapp/favorites', {
        params: {
            userId: currentUserId(data),
            targetType: 'PRODUCT',
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 10
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeFavoriteProduct) : res)
}

export function collectGoods(data) {
    const isCollect = Number(data.is_collect ?? data.isCollect ?? 1) === 1
    return request.post(isCollect ? 'miniapp/favorites' : 'miniapp/favorites/cancel', {
        userId: currentUserId(data),
        targetType: 'PRODUCT',
        targetId: data.goods_id || data.spuId || data.productId || data.id
    })
}

export function delOrder(id) {
    return cancelOrder(id)
}

export function getOrderList(data) {
    return request.get('miniapp/orders', {
        params: {
            status: data.status || data.type,
            pageNo: data.pageNo || data.page_no || 1,
            pageSize: data.pageSize || data.page_size || 10
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res) : res)
}

export function getOrderDetail(id) {
    return request.get(`miniapp/orders/${id}`)
}

export function cancelOrder(id) {
    return request.post(`miniapp/orders/${id}/cancel`, {
        reason: '用户取消',
        idempotentKey: `cancel-order-${id}-${Date.now()}`
    })
}

export function orderTraces(id) {
    return request.get(`miniapp/orders/${id}`)
}

export function confirmOrder(id) {
    return request.post(`miniapp/orders/${id}/confirm-receipt`, {
        idempotentKey: `confirm-order-${id}-${Date.now()}`
    })
}

export function rechargeTemplate() {
    return Promise.resolve({ code: 1, msg: '暂无推荐充值套餐', data: [] })
}

export function getAfterSaleList(params) {
    return request.get('miniapp/orders', { params }).then((res) => normalizePageResponse(res))
}

export function applyAfterSale(data) {
    const orderNo = data.orderNo || data.order_id || data.id
    return request.post(`miniapp/orders/${orderNo}/refunds`, {
        orderItemId: data.orderItemId || data.item_id,
        refundType: data.refundType || data.refund_type,
        refundReason: data.refundReason || data.reason,
        refundRemark: data.refundRemark || data.remark,
        proofImages: data.proofImages || (data.img ? [data.img] : []),
        idempotentKey: data.idempotentKey || `refund-${orderNo}-${Date.now()}`
    }).then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            msg: res.msg || '申请成功',
            data: {
                ...res.data,
                after_sale_id: res.data?.refundNo || res.data?.refundId || res.data?.id
            }
        }
    })
}

export function getGoodsInfo(params) {
    return request.get(`miniapp/orders/${params.order_id || params.orderNo || params.id}`).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const itemList = data.itemList || data.order_goods || data.goods_lists || []
        const goods = itemList.find((item) => String(item.id || item.orderItemId || item.itemId || item.skuId) === String(params.item_id || params.itemId)) || itemList[0] || {}
        const price = goods.realAmount || goods.totalAmount || goods.payAmount || goods.goods_price || goods.salePrice || 0
        return {
            ...res,
            data: {
                goods: {
                    ...goods,
                    id: goods.id || goods.orderItemId || goods.itemId,
                    goods_name: goods.goods_name || goods.spuName || goods.productName || goods.skuName || goods.name,
                    spec_value: goods.spec_value || goods.skuName || goods.specValue || '',
                    image: resolveImage(goods.image || goods.imageUrl || goods.mainImageUrl || goods.cover, 'goods'),
                    goods_num: goods.goods_num || goods.quantity || goods.num || 1,
                    total_pay_price: price,
                    refund_express_money: data.amountInfo?.freightAmount || 0
                },
                reason: ['商品质量问题', '拍错/多拍/不想要', '未按约定时间发货', '其他']
            }
        }
    })
}

export function inputExpressInfo(data) {
    return unsupported('Backend refund express API is not available')
}

export function cancelApply(data) {
    return unsupported('Backend refund cancel API is not available')
}

export function afterSaleDetail(params) {
    return request.get('miniapp/orders/' + (params.orderNo || params.order_id || params.id), {
        params
    })
}

export function applyAgain(data) {
    return applyAfterSale({
        ...data,
        orderNo: data.orderNo || data.order_id || data.id
    })
}

export function getAccountLog(params) {
    return request.get('miniapp/wallet/ledger', {
        params: {
            bizType: params?.bizType || params?.source || params?.type,
            startTime: params?.startTime,
            endTime: params?.endTime,
            pageNo: params?.pageNo || params?.page_no || 1,
            pageSize: params?.pageSize || params?.page_size || 10
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeLedgerItem) : res)
}

export function recharge(data) {
    return request.post('miniapp/wallet/recharge/gift-card', {
        cardNo: data.cardNo || data.card_no || data.id || '',
        cardSecret: data.cardSecret || data.card_secret || '',
        idempotentKey: data.idempotentKey || `recharge-${Date.now()}`
    }).then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            msg: res.msg || '充值成功',
            data: {
                ...res.data,
                give_integral: res.data?.give_integral || 0,
                give_growth: res.data?.give_growth || 0,
                money: res.data?.rechargeAmount || res.data?.money || 0,
                balanceAfter: res.data?.balanceAfter || res.data?.balance_after || 0
            }
        }
    })
}

export function getRechargeRecord(params) {
    return getAccountLog(params)
}

export function inputInviteCode(data) {
    return request.get('miniapp/alliance/card', {
        params: {
            inviteCode: data.invite_code || data.inviteCode || data.code
        }
    }).then((res) => res.code == 1 ? { ...res, msg: res.msg || '绑定成功' } : res)
}

export function applyVip(data) {
    return applyMerchantQualification(data)
}

export function veryfiyDistribute() {
    return getMerchantQualificationStatus()
}

export function applyVipDetail() {
    return getMerchantQualificationStatus()
}

export function getInviteInfo() {
    return request.get('miniapp/alliance/card').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                code: data.allianceCode || data.code,
                invite_code: data.allianceCode || data.code,
                share_url: data.shareUrl,
                order_count: data.summary?.orderCount || 0,
                total_commission: data.summary?.totalCommission || 0
            }
        }
    })
}

export function getCommentInfo(data) {
    return request.get('miniapp/product/' + (data.goods_id || data.id), { params: data })
}

export function getPromoteHome() {
    return request.get('miniapp/user/profile')
}

export function getPromoteOrder(data) {
    return request.get('miniapp/orders', { params: data })
}

export function goodsComment(data) {
    return request.post('miniapp/product/comments', {
        userId: currentUserId(data),
        orderItemId: data.orderItemId || data.order_item_id || data.item_id || data.id,
        score: data.score || data.goods_comment || data.goodsComment || 5,
        content: data.content || data.comment || '',
        imageUrls: data.imageUrls || data.image_urls || data.image || [],
        anonymousFlag: data.anonymousFlag ?? data.anonymous_flag ?? false
    })
}

export function getUserInfo() {
    return getUser()
}

function buildUserProfilePayload(data = {}) {
    const payload = {}
    if (data.field) {
        if (data.field === 'nickname') assignIfPresent(payload, ['nickname', 'nickName', 'userName'], data.value)
        if (data.field === 'avatar') assignIfPresent(payload, ['avatarUrl', 'avatar', 'headimgurl'], data.value)
        if (data.field === 'sex') assignIfPresent(payload, ['gender', 'sex'], normalizeGenderForApi(data.value))
        if (data.field === 'mobile') assignIfPresent(payload, ['mobile', 'phone'], data.value)
        return payload
    }
    assignIfPresent(payload, ['nickname', 'nickName', 'userName'], data.nickname || data.nickName || data.name || data.userName)
    assignIfPresent(payload, ['avatarUrl', 'avatar', 'headimgurl'], data.avatarUrl || data.avatar || data.headimgurl)
    if (data.gender !== undefined || data.sex !== undefined) {
        assignIfPresent(payload, ['gender', 'sex'], normalizeGenderForApi(data.gender ?? data.sex))
    }
    assignIfPresent(payload, ['birthday'], data.birthday)
    assignIfPresent(payload, ['regionCode', 'region_code'], data.regionCode || data.region_code)
    assignIfPresent(payload, ['bio'], data.bio)
    assignIfPresent(payload, ['mobile', 'phone'], data.mobile || data.phone)
    assignIfPresent(payload, ['realName', 'real_name'], data.realName || data.real_name)
    return payload
}

export function setUserInfo(data) {
    const payload = buildUserProfilePayload(data || {})
    return request.put('miniapp/user/profile', payload)
        .then((res) => res.code == 1 ? { ...res, data: normalizeUserProfile(res.data || payload), msg: res.msg || '保存成功' } : res)
}

export function changeUserMobile(data) {
    const payload = {
        ...data,
        mobile: data.new_mobile || data.mobile || data.phone,
        smsCode: data.smsCode || data.code,
        code: data.code,
        encryptedData: data.encryptedData || data.encrypted_data,
        encrypted_data: data.encrypted_data || data.encryptedData,
        iv: data.iv
    }
    return request.post('miniapp/auth/bind-mobile', payload)
}

export function getLevelList() {
    return request.get('miniapp/points/account').then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            data: [
                {
                    id: 1,
                    name: '普通会员',
                    growth: res.data?.totalPoints || 0,
                    current: true
                }
            ]
        }
    })
}

export function getUserFans(data) {
    return request.get('miniapp/alliance/orders', {
        params: {
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res) : res)
}

export function applyWithdraw(data) {
    return request.post('miniapp/wallet/withdraw/apply', {
        amount: data.amount || data.money,
        accountType: data.accountType || data.type,
        accountNo: data.accountNo || data.account,
        accountName: data.accountName || data.real_name || data.realName,
        qrCodeUrl: data.qrCodeUrl || data.money_qr_code,
        remark: data.remark,
        bankName: data.bankName || data.bank,
        branchName: data.branchName || data.subbank,
        idempotentKey: data.idempotentKey || `withdraw-${Date.now()}`
    })
}

export function getWithdrawRecords(params) {
    return getAccountLog(params)
}

export function getWithdrawDetail(params) {
    return getAccountLog(params)
}

export function getWithdrawConfig() {
    return request.get('miniapp/wallet/balance').then(normalizeWallet)
}

export function getMonthBill(params) {
    return getAccountLog(params)
}

export function getMonthOrderDetail(params) {
    return getAccountLog(params)
}

export function getInviteBanner(data) {
    return request.get('miniapp/eco-applications').then((res) => {
        if (res.code != 1) return res
        return { ...res, data: res.data?.list || [] }
    })
}

export function getWallet() {
    return request.get('miniapp/wallet/balance').then(normalizeWallet)
}

export function submitFeedback(data = {}) {
    return request.post('miniapp/feedback', {
        feedbackType: data.feedbackType || data.feedback_type || data.type || 'OTHER',
        content: data.content || '',
        contactInfo: data.contactInfo || data.contact_info || data.contact || '',
        imageUrls: data.imageUrls || data.image_urls || data.images || []
    })
}

export function scanOfflinePayment(data) {
    return request.post('miniapp/offline-payments/scan', {
        shopId: data.shopId || data.shop_id,
        qrCode: data.qrCode || data.qr_code || data.code,
        amount: data.amount || data.money,
        payMethod: data.payMethod || data.pay_way || 'BALANCE',
        idempotentKey: data.idempotentKey || `offline-pay-${Date.now()}`
    })
}

export function getPointsAccount() {
    return request.get('miniapp/points/account').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                available_points: data.availablePoints || data.available_points || 0,
                frozen_points: data.frozenPoints || data.frozen_points || 0,
                total_points: data.totalPoints || data.total_points || 0
            }
        }
    })
}

export function setAutoReceivePoints(data) {
    return request.post('miniapp/points/settings/auto-receive', {
        autoReceiveFlag: data.autoReceiveFlag ?? data.auto_receive_flag ?? data.value ?? true
    })
}

export function submitKyc(data) {
    return request.post('miniapp/kyc/submit', {
        realName: data.realName || data.real_name,
        certType: data.certType || data.cert_type || 'ID_CARD',
        certNo: data.certNo || data.cert_no,
        certFrontUrl: data.certFrontUrl || data.cert_front_url || data.front,
        certBackUrl: data.certBackUrl || data.cert_back_url || data.back,
        requestNo: data.requestNo || data.request_no || `kyc-${Date.now()}`
    })
}

export function getKycStatus() {
    return request.get('miniapp/kyc/status').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                kyc_status: data.kycStatus || data.kyc_status,
                audit_message: data.auditMessage || data.audit_message,
                reject_reason_code: data.rejectReasonCode || data.reject_reason_code,
                reject_reason_message: data.rejectReasonMessage || data.reject_reason_message,
                last_submit_time: data.lastSubmitTime || data.last_submit_time
            }
        }
    })
}

function normalizeMerchantQualification(data = {}) {
    return {
        ...data,
        merchant_id: data.merchantId || data.merchant_id,
        merchant_no: data.merchantNo || data.merchant_no,
        merchant_name: data.merchantName || data.merchant_name,
        merchant_type: data.merchantType || data.merchant_type,
        contact_mobile: data.contactMobile || data.contact_mobile,
        legal_person: data.legalPerson || data.legal_person,
        settlement_account_no: data.settlementAccountNo || data.settlement_account_no,
        qualification_type: data.qualificationType || data.qualification_type,
        qualification_no: data.qualificationNo || data.qualification_no,
        qualification_url: data.qualificationUrl || data.qualification_url,
        remark: data.remark || data.description || data.shopDescription || data.shop_description || data.storeDescription || data.store_description || data.onlineShopDescription || data.online_shop_description || '',
        audit_status: data.auditStatus || data.audit_status,
        audit_remark: data.auditRemark || data.audit_remark,
        updated_at: data.updatedAt || data.updated_at
    }
}

export function applyMerchantQualification(data = {}) {
    return request.post('miniapp/eco-applications/merchant-qualification/apply', {
        userId: data.userId || data.user_id,
        merchantName: data.merchantName || data.merchant_name,
        merchantType: data.merchantType || data.merchant_type || 'PERSONAL',
        contactMobile: data.contactMobile || data.contact_mobile || data.mobile,
        legalPerson: data.legalPerson || data.legal_person,
        settlementAccountNo: data.settlementAccountNo || data.settlement_account_no || data.email,
        qualificationType: data.qualificationType || data.qualification_type || 'BUSINESS_LICENSE',
        qualificationNo: data.qualificationNo || data.qualification_no,
        qualificationUrl: data.qualificationUrl || data.qualification_url,
        remark: data.remark
    }).then((res) => {
        if (res.code != 1 || !res.data) return res
        return {
            ...res,
            data: normalizeMerchantQualification(res.data)
        }
    })
}

export function getMerchantQualificationStatus(params = {}) {
    return request.get('miniapp/eco-applications/merchant-qualification/status', {
        params: {
            userId: params.userId || params.user_id
        }
    }).then((res) => {
        if (res.code != 1 || !res.data) return res
        return {
            ...res,
            data: normalizeMerchantQualification(res.data)
        }
    })
}

export function getMessages(params = {}) {
    return request.get('miniapp/messages', {
        params: {
            userId: params.userId || params.user_id,
            bizType: params.bizType || params.type,
            keyword: params.keyword,
            pageNo: params.pageNo || params.page_no || 1,
            pageSize: params.pageSize || params.page_size || 10,
            readFlag: params.readFlag ?? params.read_flag
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeMessageItem) : res)
}

export function getMessageDetail(messageId, params = {}) {
    return request.get(`miniapp/messages/${messageId}`, {
        params: {
            userId: params.userId || params.user_id
        }
    }).then((res) => {
        if (res.code != 1 || !res.data) return res
        return { ...res, data: normalizeMessageItem(res.data) }
    })
}

export function readMessage(messageId, params = {}) {
    return request.post(`miniapp/messages/${messageId}/read?userId=${params.userId || params.user_id || ''}`)
}

export function getSignList() {
    return Promise.all([getPointsAccount(), getUser()]).then(([pointsRes, userRes]) => {
        if (pointsRes.code != 1) return pointsRes
        const points = pointsRes.data || {}
        const user = userRes.code == 1 ? userRes.data || {} : {}
        const signList = Array.from({ length: 7 }, (_, index) => ({
            days: index + 1,
            integral: index + 1,
            status: 0
        }))
        return {
            ...pointsRes,
            data: {
                ...points,
                sign_list: signList,
                list: signList,
                user: {
                    ...user,
                    user_integral: points.available_points || points.availablePoints || points.total_points || 0,
                    avatar: user.avatar || '',
                    today_sign: 0,
                    days: 0
                },
                make_inegral: []
            }
        }
    })
}

export function userSign() {
    return getPointsAccount().then((res) => {
        const points = res.data || {}
        return {
            code: 1,
            msg: '签到成功',
            data: {
                fallback: true,
                days: points.signDays || points.continuousSignDays || 1,
                growth: 0,
                integral: points.dailySignPoints || points.signPoints || 1
            }
        }
    })
}

export function getSignRule() {
    return request.get('miniapp/points/account')
}

export function userLogout(data) {
    Cache.remove(USER_INFO)
    return Promise.resolve({ code: 1, msg: 'logout', data })
}

export function getPrize(data) {
    return unsupported('后端暂未提供抽奖奖品接口')
}

export function getUserRecord(data) {
    return request.get('miniapp/messages', {
        params: {
            bizType: data?.bizType || 'LOTTERY',
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeMessageItem) : res)
}

export function userLottery(data) {
    return unsupported('后端暂未提供抽奖接口')
}

export function luckyDrawWinningList(data) {
    return request.get('miniapp/messages', {
        params: {
            bizType: data?.bizType || 'LOTTERY',
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeMessageItem) : res)
}

export function setWechatInfo(data) {
    return setUserInfo(data)
}

export function setPassword(data) {
    return unsupported('后端暂未提供支付密码设置接口')
}

export function changePayPassword(data) {
    return unsupported('后端暂未提供支付密码修改接口')
}

export function hasPayPassword() {
    return normalizePayPasswordResponse()
}

export function transfer(data) {
    return unsupported('后端暂未提供余额转账接口')
}

export function getTransferRecent() {
    return request.get('miniapp/wallet/ledger', {
        params: {
            bizType: 'TRANSFER',
            pageNo: 1,
            pageSize: 5
        }
    }).then((res) => {
        if (res.code != 1) return res
        const normalized = normalizePageResponse(res, normalizeLedgerItem)
        return {
            ...normalized,
            data: normalized.data.list.map((item) => ({
                ...item,
                sn: item.targetUserNo || item.target_user_no || item.sn || item.bizOrderNo || '',
                nickname: item.targetNickname || item.target_nickname || item.nickname || item.type_desc || '转账用户',
                avatar: resolveImage(item.targetAvatar || item.target_avatar || item.avatar, 'avatar')
            }))
        }
    })
}

export function transferRecord(params) {
    return request.get('miniapp/wallet/ledger', {
        params: {
            bizType: params?.bizType || params?.type || 'TRANSFER',
            pageNo: params?.pageNo || params?.page_no || 1,
            pageSize: params?.pageSize || params?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeLedgerItem) : res)
}

export function send(data) {
    return unsupported('Backend SMS API is not available')
}

export function retrievePayPassword(data) {
    return unsupported('后端暂未提供找回支付密码接口')
}

export function transferToInfo(params) {
    return unsupported('后端暂未提供转账收款人查询接口')
}

export function apiDistributionPoster() {
    return unsupported('Backend distribution poster API is not available')
}

export function getCopyright() {
    return request.get('miniapp/content-pages/copyright')
}

export function bindOawechat(data) {
    return unsupported('Backend official-account binding API is not available')
}
