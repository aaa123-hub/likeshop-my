import request from '../utils/request'
import { client } from '@/utils/tools'
import area from '@/utils/area'
import Cache from '@/utils/cache'
import { USER_INFO } from '@/config/cachekey'

const miniappTestLoginPayload = {
    loginCode: 'demo-openid-0001',
    channelCode: 'wechat-miniapp',
    deviceId: 'dev-001'
}

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
        nickname: '开发测试用户',
        sn: 'demo-openid-0001',
        mobile: '13800000000',
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
        distribution_code: 'demo-openid-0001',
        next_level_tips: '立即开通'
    }
}

function normalizeUserProfile(data = {}) {
    return {
        ...fakeUserInfo(),
        ...data,
        id: data.id || data.userId,
        user_id: data.user_id || data.userId || data.id,
        avatar: data.avatar || data.avatarUrl || data.headimgurl || '',
        nickname: data.nickname || data.nickName || data.userName || fakeUserInfo().nickname,
        sn: data.sn || data.userNo || data.inviteCode || data.openId || fakeUserInfo().sn,
        mobile: data.mobile || data.phone || '',
        sex: data.sex ?? data.gender ?? 0,
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

function normalizeAddress(item = {}) {
    return {
        ...item,
        id: item.id || item.addressId,
        contact: item.contact || item.receiverName || item.receiver_name || '',
        telephone: item.telephone || item.mobile || '',
        province: item.province || item.provinceName || '',
        city: item.city || item.cityName || '',
        district: item.district || item.districtName || '',
        address: item.address || item.detailAddress || item.detail_address || '',
        is_default: item.is_default ?? item.isDefault ?? 0,
        province_id: item.province_id || item.provinceCode || '',
        city_id: item.city_id || item.cityCode || '',
        district_id: item.district_id || item.districtCode || ''
    }
}

function normalizeCoupon(item = {}) {
    return {
        ...item,
        id: item.id || item.couponId,
        money: item.money || item.amount || item.discountAmount || 0,
        use_condition: item.use_condition || item.useCondition || item.condition || '',
        is_get: item.is_get || item.received || false
    }
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
        image: target.image || target.mainImageUrl || target.cover || target.imageUrl || item.targetImage || '',
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
        return {
            ...res,
            data: fakeUserInfo()
        }
    })
}

export function getCoupon(id) {
    return request.post(`miniapp/coupons/${id}/receive`, {
        receiveScene: 'APP'
    })
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
    return request.put(`miniapp/addresses/${id}`, {
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        provinceCode: data.province_id || data.provinceCode,
        cityCode: data.city_id || data.cityCode,
        districtCode: data.district_id || data.districtCode,
        detailAddress: data.address || data.detailAddress,
        isDefault: data.is_default ? 1 : 0
    })
}

export function addAddress(data) {
    return request.post('miniapp/addresses', {
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        provinceCode: data.province_id || data.provinceCode,
        cityCode: data.city_id || data.cityCode,
        districtCode: data.district_id || data.districtCode,
        detailAddress: data.address || data.detailAddress,
        isDefault: data.is_default ? 1 : 0
    })
}

export function delAddress(id) {
    return request.delete(`miniapp/addresses/${id}`)
}

export function getOneAddress(id) {
    return request.get(`miniapp/addresses/${id}`).then((res) => {
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

export function setDefaultAddress(id) {
    return request.put(`miniapp/addresses/${id}`, {
        isDefault: 1
    })
}

export function hasRegionCode(data) {
    const result = findRegionCode(area, data.province, data.city, data.district)
    return Promise.resolve({
        code: 1,
        data: result
    })
}

export function getMyCoupon(data) {
    return request.get('miniapp/home/index', {
        params: data
    }).then((res) => {
        if (res.code == 1) {
            const list = (res.data?.coupons || res.data?.couponList || []).map(normalizeCoupon)
            return {
                ...res,
                data: list
            }
        }
        return res
    })
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
        reason: '用户取消'
    })
}

export function orderTraces(id) {
    return request.get(`miniapp/orders/${id}`)
}

export function confirmOrder(id) {
    return request.post(`miniapp/orders/${id}/confirm-receipt`)
}

export function rechargeTemplate() {
    return Promise.resolve({
        code: 1,
        data: [
            { id: 1, money: 100, tips: '推荐充值' },
            { id: 2, money: 200, tips: '推荐充值' }
        ]
    })
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
                    image: goods.image || goods.imageUrl || goods.mainImageUrl || goods.cover || '',
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
    return Promise.resolve({ code: 1, msg: '提交成功', data })
}

export function cancelApply(data) {
    return Promise.resolve({ code: 1, msg: '撤销成功', data })
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
        cardNo: data.cardNo || data.id || '',
        cardSecret: data.cardSecret || '',
        idempotentKey: data.idempotentKey || `recharge-${Date.now()}`
    })
}

export function getRechargeRecord(params) {
    return getAccountLog(params)
}

export function inputInviteCode(data) {
    return Promise.resolve({ code: 1, msg: '绑定成功', data })
}

export function applyVip(data) {
    return Promise.resolve({ code: 1, msg: '申请成功', data })
}

export function veryfiyDistribute() {
    return Promise.resolve({ code: 1, data: {} })
}

export function applyVipDetail() {
    return Promise.resolve({ code: 1, data: {} })
}

export function getInviteInfo() {
    return Promise.resolve({ code: 1, data: {} })
}

export function getCommentInfo(data) {
    return request.get('miniapp/product/' + (data.goods_id || data.id), { params: data })
}

export function getPromoteHome() {
    return request.get('miniapp/home/index')
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

export function setUserInfo(data) {
    return request.put('miniapp/user/profile', {
        nickname: data.nickname || data.nickName || data.name,
        avatar: data.avatar || data.avatarUrl,
        sex: data.sex ?? data.gender,
        mobile: data.mobile,
        realName: data.realName || data.real_name
    }).then((res) => res.code == 1 ? { ...res, data: normalizeUserProfile(res.data || data), msg: res.msg || '保存成功' } : res)
}

export function changeUserMobile(data) {
    return request.post('miniapp/auth/bind-mobile', data)
}

export function getLevelList() {
    return Promise.resolve({ code: 1, data: [] })
}

export function getUserFans(data) {
    return Promise.resolve({ code: 1, data: [] })
}

export function applyWithdraw(data) {
    return request.post('miniapp/wallet/withdraw/apply', {
        amount: data.amount,
        accountType: data.accountType,
        accountNo: data.accountNo,
        accountName: data.accountName,
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
    return request.get('miniapp/home/index', { params: data })
}

export function getWallet() {
    return request.get('miniapp/wallet/balance').then(normalizeWallet)
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
    return Promise.resolve({ code: 1, data: [] })
}

export function userSign() {
    return Promise.resolve({ code: 1, msg: '签到成功', data: {} })
}

export function getSignRule() {
    return Promise.resolve({ code: 1, data: {} })
}

export function userLogout(data) {
    return Promise.resolve({ code: 1, msg: '退出成功', data })
}

export function getPrize(data) {
    return Promise.resolve({ code: 1, data: data || {} })
}

export function getUserRecord(data) {
    return Promise.resolve({ code: 1, data: [] })
}

export function userLottery(data) {
    return Promise.resolve({ code: 1, data: data || {} })
}

export function luckyDrawWinningList(data) {
    return Promise.resolve({ code: 1, data: [] })
}

export function setWechatInfo(data) {
    return Promise.resolve({ code: 1, msg: '保存成功', data })
}

export function setPassword(data) {
    return Promise.resolve({ code: 1, msg: '设置成功', data })
}

export function changePayPassword(data) {
    return Promise.resolve({ code: 1, msg: '修改成功', data })
}

export function hasPayPassword() {
    return normalizePayPasswordResponse()
}

export function transfer(data) {
    return Promise.resolve({ code: 1, msg: '转账成功', data })
}

export function getTransferRecent() {
    return Promise.resolve({ code: 1, data: [] })
}

export function transferRecord(params) {
    return Promise.resolve({ code: 1, data: [] })
}

export function send(data) {
    return Promise.resolve({ code: 1, data })
}

export function retrievePayPassword(data) {
    return Promise.resolve({ code: 1, msg: '操作成功', data })
}

export function transferToInfo(params) {
    return Promise.resolve({
        code: 1,
        data: {
            avatar: '',
            nickname: params.transferTo || '',
            sn: params.transferTo || ''
        }
    })
}

export function apiDistributionPoster() {
    return Promise.resolve({ code: 1, data: {} })
}

export function getCopyright() {
    return Promise.resolve({ code: 1, data: {} })
}

export function bindOawechat(data) {
    return Promise.resolve({ code: 1, data })
}
