import request from '../utils/request'
import { client } from '@/utils/tools'
import area from '@/utils/area'
import Cache from '@/utils/cache'
import { USER_INFO } from '@/config/cachekey'
import { resolveImage } from '@/utils/image-placeholder'

function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null && value !== '')
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
    const sourceList = Array.isArray(data) ? data : (data.list || data.records || data.items || data.rows || data.content || [])
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

function refundStatusText(status) {
    if (status === 0 || status === '0') return '待商家处理'
    if (status === 1 || status === '1') return '处理中'
    if (status === 2 || status === '2' || status === 3 || status === '3') return '商家已同意'
    if (status === 4 || status === '4') return '商家已拒绝'
    if (status === 5 || status === '5') return '退款成功'
    if (status === 6 || status === '6') return '已撤销'
    const map = {
        APPLIED: '待商家处理',
        APPLY: '待商家处理',
        PENDING: '待商家处理',
        PENDING_REVIEW: '待商家处理',
        WAIT_AUDIT: '待商家处理',
        WAIT_SELLER: '待商家处理',
        WAIT_MERCHANT: '待商家处理',
        PROCESSING: '处理中',
        REFUNDING: '退款中',
        IN_PROGRESS: '处理中',
        APPROVED: '商家已同意',
        PASS: '商家已同意',
        PASSED: '商家已同意',
        MERCHANT_APPROVED: '商家已同意',
        RETURNING: '待买家退货',
        WAIT_RETURN: '待买家退货',
        WAIT_BUYER_RETURN: '待买家退货',
        REJECTED: '商家已拒绝',
        REJECT: '商家已拒绝',
        CANCELLED: '已撤销',
        CANCELED: '已撤销',
        CLOSED: '已关闭',
        REFUNDED: '退款成功',
        REFUND_SUCCESS: '退款成功',
        SUCCESS: '退款成功',
        FAILED: '退款失败'
    }
    return map[String(status || '').toUpperCase()] || status || '处理中'
}

function refundStatusCode(status) {
    if (status !== undefined && status !== null && status !== '' && !Number.isNaN(Number(status))) return Number(status)
    const map = {
        APPLIED: 0,
        APPLY: 0,
        PENDING: 0,
        PENDING_REVIEW: 0,
        WAIT_AUDIT: 0,
        WAIT_SELLER: 0,
        WAIT_MERCHANT: 0,
        PROCESSING: 1,
        REFUNDING: 1,
        IN_PROGRESS: 1,
        APPROVED: 2,
        PASS: 2,
        PASSED: 2,
        MERCHANT_APPROVED: 2,
        RETURNING: 2,
        WAIT_RETURN: 2,
        WAIT_BUYER_RETURN: 2,
        REJECTED: 4,
        REJECT: 4,
        CANCELLED: 6,
        CANCELED: 6,
        CLOSED: 6,
        REFUNDED: 5,
        REFUND_SUCCESS: 5,
        SUCCESS: 5,
        FAILED: 4
    }
    return map[String(status || '').toUpperCase()] ?? 0
}

const defaultRefundReasons = ['商品质量问题', '拍错/多拍/不想要', '未按约定时间发货', '其他']

function normalizeRefundReasonText(reason) {
    if (!reason) return ''
    const reasonMap = {
        QUALITY_PROBLEM: '商品质量问题',
        WRONG_GOODS: '商品错发/漏发',
        NOT_RECEIVED: '未收到货',
        NO_REASON: '七天无理由',
        DO_NOT_WANT: '拍错/多拍/不想要',
        NOT_AS_DESCRIBED: '商品与描述不符',
        DELAY_SHIPMENT: '未按约定时间发货',
        OTHER: '其他'
    }
    if (typeof reason === 'string') return reason
        .split(/[,，、]/)
        .map((item) => reasonMap[String(item || '').toUpperCase()] || item)
        .join('、')
    if (typeof reason === 'object') return reason.name || reason.reason || reason.label || reason.title || reason.text || reason.value || ''
    return String(reason)
}

function refundTypeText(type) {
    if (type === 0 || type === '0') return '仅退款'
    if (type === 1 || type === '1') return '退货退款'
    const text = String(type || '').toUpperCase()
    const map = {
        ONLY_REFUND: '仅退款',
        REFUND_ONLY: '仅退款',
        REFUND: '仅退款',
        RETURN_REFUND: '退货退款',
        RETURN_AND_REFUND: '退货退款',
        REFUND_RETURN: '退货退款',
        RETURN: '退货退款'
    }
    return map[text] || (text.includes('RETURN') ? '退货退款' : '仅退款')
}

function normalizeRefundReasons(reasons) {
    const source = Array.isArray(reasons)
        ? reasons
        : (reasons?.list || reasons?.items || reasons?.records || reasons?.rows || reasons?.content || reasons)
    if (Array.isArray(source)) {
        const list = source.map(normalizeRefundReasonText).filter(Boolean)
        return list.length ? list : defaultRefundReasons
    }
    if (typeof source === 'string') {
        const list = source.split(/[,，、]/).map((item) => item.trim()).filter(Boolean)
        return list.length ? list : defaultRefundReasons
    }
    if (source && typeof source === 'object') {
        const list = Object.values(source).map(normalizeRefundReasonText).filter(Boolean)
        return list.length ? list : defaultRefundReasons
    }
    return defaultRefundReasons
}

function normalizeAfterSaleGoods(goods = {}) {
    return {
        ...goods,
        item_id: goods.item_id || goods.orderItemId || goods.itemId || goods.id || goods.skuId,
        goods_id: goods.goods_id || goods.spuId || goods.goodsId,
        goods_name: goods.goods_name || goods.spuName || goods.productName || goods.goodsName || goods.skuName || '',
        image: resolveImage(goods.image || goods.imageUrl || goods.goodsImageUrl || goods.mainImageUrl || goods.cover, 'goods'),
        goods_price: goods.goods_price || goods.salePrice || goods.unitPrice || goods.price || 0,
        goods_num: goods.goods_num || goods.quantity || goods.num || 1,
        spec_value: goods.spec_value || goods.specValue || goods.skuName || '',
        spec_value_str: goods.spec_value_str || goods.specValue || goods.skuName || ''
    }
}

function normalizeAfterSaleItem(item = {}) {
    const refundNo = item.refundNo || item.afterSaleId || item.after_sale_id || item.id
    const status = item.refundStatus || item.afterSaleStatus || item.status
    const images = item.evidenceImages || item.proofImages || item.images || item.refund_image || item.refundImage || []
    const goods = item.orderGoods || item.orderItem || item.item || item.goodsList || item.goods_lists || item.order_goods || item.goods || item.goodsInfo || {}
    const normalizedGoods = Array.isArray(goods) ? goods.map(normalizeAfterSaleGoods) : [normalizeAfterSaleGoods(goods)]
    const refundType = item.refundType || item.refund_type || item.type
    const typeText = item.refundTypeText || item.refund_type_text || item.typeText || item.type_text || refundTypeText(refundType)
    const isReturnRefund = typeText === '退货退款'
    const statusCode = refundStatusCode(status)
    const rawStatusText = item.refundStatusText || item.afterSaleStatusText || item.statusText || item.status_text || status
    const statusText = refundStatusText(rawStatusText)
    return {
        ...item,
        id: refundNo,
        after_sale_id: refundNo,
        refundNo,
        sn: refundNo,
        order_id: item.orderNo || item.order_id,
        order_sn: item.orderNo || item.order_sn,
        sub_order_no: item.subOrderNo || item.sub_order_no,
        time: item.applyTime || item.create_time || item.createdAt || '',
        create_time: item.applyTime || item.create_time || item.createdAt || '',
        status: statusCode,
        status_text: statusText,
        refund_type: isReturnRefund ? 1 : 0,
        refund_reason: normalizeRefundReasonText(item.refundReasonMessage || item.refundReasonText || item.refund_reason || item.refundReason || item.reason),
        refund_remark: item.applyDescription || item.apply_description || item.description || item.refundRemark || item.refundRemarkMessage || item.refund_remark || item.remark || '',
        refund_price: item.refundAmount ?? item.refund_price ?? 0,
        refund_image: Array.isArray(images) ? images[0] || '' : images || '',
        order_goods: normalizedGoods,
        goods_lists: normalizedGoods,
        after_sale: {
            after_sale_id: refundNo,
            type_text: typeText,
            refund_price: item.refundAmount ?? item.refund_price ?? 0,
            status: statusCode,
            desc: statusText,
            able_apply: 0
        },
        shop: item.shop || {
            address: item.returnAddress || '',
            contact: item.returnContact || '',
            mobile: item.returnMobile || ''
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
        wait_points: 0,
        after_sale: 0,
        roles: [],
        role_applications: [],
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
        create_time: data.create_time || data.createTime || data.createdAt || data.registerTime || '暂未记录',
        sex: normalizeGenderForView(genderValue),
        user_money: data.user_money ?? data.balance ?? data.walletBalance ?? data.wallet?.balance ?? 0,
        user_integral: data.user_integral ?? data.userIntegral ?? data.availablePoints ?? data.available_points ?? data.points ?? data.pointsAccount?.availablePoints ?? 0,
        coupon: data.coupon ?? data.couponCount ?? data.availableCouponCount ?? data.available_coupon_count ?? data.couponSummary?.availableCount ?? 0,
        gift_card_count: data.gift_card_count ?? data.giftCardCount ?? data.cardCount ?? data.giftCardSummary?.availableCount ?? 0,
        wait_pay: data.wait_pay ?? data.waitPay ?? 0,
        wait_delivery: data.wait_delivery ?? data.waitDelivery ?? 0,
        wait_take: data.wait_take ?? data.waitTake ?? data.waitReceive ?? 0,
        wait_comment: data.wait_comment ?? data.waitComment ?? 0,
        wait_points: data.wait_points ?? data.waitPoints ?? data.pending_points ?? data.pendingPoints ?? data.wait_receive_points ?? data.waitReceivePoints ?? 0,
        after_sale: data.after_sale ?? data.afterSale ?? 0,
        roles: data.roles || data.roleList || data.userRoles || [],
        role_applications: data.role_applications || data.roleApplications || data.applications || [],
        distribution_code: data.distribution_code || data.distributionCode || data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.inviteCode || fakeUserInfo().distribution_code,
        promoter_code: data.promoter_code || data.promoterCode || data.promotionCode || data.promotion_code || data.distribution_code || data.distributionCode || data.inviteCode || fakeUserInfo().distribution_code,
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
    if (value === '先生') return 'MALE'
    if (value === '女士') return 'FEMALE'
    if (value === 0 || value === '0' || value === 'UNKNOWN' || value === 'unknown') return 'UNKNOWN'
    return value
}

function normalizeAddressGenderPayload(value) {
    const isFemale = value === 2 || value === '2' || value === 'FEMALE' || value === 'female' || value === '女' || value === '女士'
    const code = isFemale ? 2 : 1
    const text = isFemale ? '女士' : '先生'
    const apiText = isFemale ? 'FEMALE' : 'MALE'
    return { code, text, apiText }
}

function normalizeAddressGenderText(value) {
    return normalizeAddressGenderPayload(value).text
}

function assignIfPresent(target, keys, value) {
    if (value === undefined || value === null || value === '') return
    keys.forEach((key) => {
        target[key] = value
    })
}

function findRegionNameByCode(list, code) {
    if (!code) return ''
    for (const item of list || []) {
        if (String(item.value) === String(code)) return item.label || ''
        const name = findRegionNameByCode(item.children || [], code)
        if (name) return name
    }
    return ''
}

function normalizeAddress(item = {}) {
    const gender = item.sex ?? item.contactGender ?? item.receiverGender ?? item.contact_gender ?? item.receiver_gender ?? item.genderText ?? item.genderName ?? item.gender ?? ''
    const provinceCode = item.province_id || item.provinceCode || ''
    const cityCode = item.city_id || item.cityCode || ''
    const districtCode = item.district_id || item.districtCode || ''
    return {
        ...item,
        id: item.id || item.addressId,
        addressId: item.addressId || item.id,
        contact: item.contact || item.receiverName || item.receiver_name || '',
        telephone: item.telephone || item.mobile || item.phone || item.tel || '',
        province: String(item.province || item.provinceName || findRegionNameByCode(area, provinceCode) || ''),
        city: String(item.city || item.cityName || findRegionNameByCode(area, cityCode) || ''),
        district: String(item.district || item.districtName || findRegionNameByCode(area, districtCode) || ''),
        address: String(item.address || item.detailAddress || item.detail_address || ''),
        is_default: item.is_default ?? item.isDefault ?? 0,
        gender: normalizeAddressGenderText(gender),
        province_id: provinceCode,
        city_id: cityCode,
        district_id: districtCode
    }
}

function normalizeCouponTypeText(item = {}) {
    const type = String(item.coupon_type || item.couponType || item.typeText || item.type || '').toUpperCase()
    const map = {
        DISCOUNT: '折扣券',
        REDUCE: '满减券',
        FULL_REDUCTION: '满减券',
        FULL_DISCOUNT: '满减券',
        CASH: '现金券',
        VOUCHER: '代金券',
        FREIGHT: '运费券',
        FREE_SHIPPING: '包邮券',
        PLATFORM: '平台券',
        MERCHANT: '商家券'
    }
    return map[type] || item.coupon_type || item.couponType || item.typeText || '优惠券'
}

function normalizeCoupon(item = {}) {
    const threshold = item.thresholdAmount ?? item.threshold_amount ?? item.minAmount ?? item.min_amount ?? item.useThreshold ?? item.use_threshold ?? 0
    const couponTemplate = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {}
    const coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {}
    const couponId = item.couponId || item.coupon_id || item.templateId || item.template_id || item.couponTemplateId || item.coupon_template_id || item.couponTplId || item.coupon_tpl_id || item.couponTemplateNo || item.coupon_template_no || couponTemplate.couponId || couponTemplate.coupon_id || couponTemplate.templateId || couponTemplate.template_id || couponTemplate.couponTemplateId || couponTemplate.coupon_template_id || couponTemplate.couponTplId || couponTemplate.coupon_tpl_id || couponTemplate.id || coupon.couponId || coupon.coupon_id || coupon.templateId || coupon.template_id || coupon.couponTemplateId || coupon.coupon_template_id || coupon.couponTplId || coupon.coupon_tpl_id || coupon.id || item.id
    const amount = item.money ?? item.amount ?? item.discountAmount ?? item.discount_amount ?? item.discountValue ?? item.discount_value ?? item.couponAmount ?? item.coupon_amount ?? item.reduceAmount ?? item.reduce_amount ?? item.deductAmount ?? item.deduct_amount ?? item.faceValue ?? item.face_value ?? item.value ?? coupon.money ?? coupon.amount ?? coupon.discountAmount ?? coupon.discount_amount ?? 0
    return {
        ...item,
        id: item.id || couponId,
        coupon_id: couponId,
        couponId,
        couponTemplateId: item.couponTemplateId || item.coupon_template_id || couponTemplate.id || couponTemplate.templateId || couponTemplate.couponTemplateId || couponId,
        name: item.name || item.couponName || item.coupon_name || '',
        money: amount,
        use_condition: item.use_condition || item.useCondition || item.condition || (Number(threshold) > 0 ? `满${threshold}可用` : '无门槛'),
        use_time_tips: item.use_time_tips || [item.startTime, item.endTime].filter(Boolean).join(' 至 '),
        coupon_type: normalizeCouponTypeText(item),
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
    const cachedUserInfo = Cache.get(USER_INFO) || {}
    const balance = data.balance ?? data.user_money ?? cachedUserInfo.user_money ?? cachedUserInfo.balance ?? 0
    const withdrawableAmount = data.withdrawableAmount ?? data.withdrawable_amount ?? data.able_withdraw ?? balance
    const withdrawTypes = Array.isArray(data.type) && data.type.length
        ? data.type
        : [
            { name: '账户余额', value: 1 },
            { name: '微信零钱', value: 2 },
            { name: '微信收款码', value: 3 },
            { name: '支付宝', value: 4 },
            { name: '银行卡', value: 5 }
        ]
    return {
        ...res,
        data: {
            ...data,
            balance,
            frozenAmount: data.frozenAmount || data.frozen_amount || 0,
            withdrawableAmount,
            currency: data.currency || 'CNY',
            user_money: balance,
            frozen_amount: data.frozenAmount || data.frozen_amount || 0,
            withdrawable_amount: withdrawableAmount,
            able_withdraw: withdrawableAmount,
            poundage_percent: data.poundagePercent ?? data.poundage_percent ?? 0,
            open_racharge: data.open_racharge ?? 1,
            open_withdraw: data.open_withdraw ?? data.openWithdraw ?? 1,
            type: withdrawTypes
        }
    }
}

function normalizeWithdrawAccountType(type) {
    const typeMap = {
        1: 'BALANCE',
        2: 'WECHAT_BALANCE',
        3: 'WECHAT_QR',
        4: 'ALIPAY_QR',
        5: 'BANK_CARD'
    }
    return typeMap[type] || type
}

function normalizeLedgerItem(item = {}) {
    const amount = item.changeAmount ?? item.change_amount ?? item.pointsChange ?? item.points_change ?? item.pointAmount ?? item.point_amount ?? item.integral ?? item.amount ?? item.money ?? 0
    const balance = item.balanceAfter ?? item.balance_after ?? item.pointsAfter ?? item.points_after ?? item.availablePoints ?? item.available_points ?? item.balance ?? item.left_amount ?? item.left_money ?? 0
    return {
        ...item,
        id: item.id || item.ledgerId || item.flowId,
        source_type: item.source_type || item.bizType || item.biz_type || item.type,
        type_desc: item.type_desc || item.bizTypeName || item.bizType || item.biz_type || item.title || item.desc,
        change_amount: amount,
        change_type: item.change_type || (Number(amount) >= 0 ? 1 : 2),
        left_amount: balance,
        left_money: balance,
        create_time: item.create_time || item.createTime || item.txnTime || item.txn_time || item.time,
        change_time: item.change_time || item.createTime || item.txnTime || item.txn_time || item.time,
        order_no: item.order_no || item.orderNo || item.bizNo || item.biz_no || item.bizOrderNo || item.biz_order_no,
        status_text: item.status_text || item.statusText || item.statusName || item.status_name || item.status,
        remark: item.remark || item.memo || item.content || item.description || item.reason || ''
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

function normalizeLotteryRecord(item = {}) {
    return {
        ...normalizeMessageItem(item),
        ...item,
        id: item.id || item.recordId || item.prizeId,
        title: item.title || item.prizeName || item.prize_name || item.name || '中奖记录',
                    prize_name: item.prize_name || item.prizeName || item.name || '奖品',
        prize_image: resolveImage(item.prize_image || item.prizeImage || item.image || item.cover, 'goods'),
        image: resolveImage(item.image || item.prizeImage || item.prize_image || item.cover, 'goods'),
        create_time: item.create_time || item.createTime || item.time || item.sendTime || '',
        send_tips: item.send_tips || item.sendTips || item.statusText || item.content || '',
        need_tips: item.need_tips || item.needTips || ''
    }
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

export function getCoupon(id, options = {}) {
    const receiveId = options.couponTemplateId || options.coupon_template_id || options.templateId || options.template_id || options.couponTplId || options.coupon_tpl_id || options.couponId || options.coupon_id || id || 0
    const payload = {
        couponId: options.couponId || options.coupon_id || id,
        coupon_id: options.couponId || options.coupon_id || id,
        couponTemplateId: options.couponTemplateId || options.coupon_template_id || options.templateId || options.template_id || receiveId,
        coupon_template_id: options.couponTemplateId || options.coupon_template_id || options.templateId || options.template_id || receiveId,
        couponTplId: options.couponTplId || options.coupon_tpl_id || options.couponTemplateId || options.coupon_template_id || receiveId,
        coupon_tpl_id: options.couponTplId || options.coupon_tpl_id || options.couponTemplateId || options.coupon_template_id || receiveId,
        templateId: options.templateId || options.template_id || options.couponTemplateId || options.coupon_template_id || receiveId,
        template_id: options.templateId || options.template_id || options.couponTemplateId || options.coupon_template_id || receiveId,
        receiveScene: options.receiveScene || options.scene || 'APP',
        receive_scene: options.receiveScene || options.scene || 'APP',
        spuId: options.spuId || options.spu_id || options.productId || options.product_id,
        spu_id: options.spuId || options.spu_id || options.productId || options.product_id,
        productId: options.productId || options.product_id || options.spuId || options.spu_id
    }
    return request.post(`miniapp/coupons/${receiveId}/receive`, payload).then((res) => {
        if (res.code == 1) return res
        return request.get(`miniapp/coupons/${receiveId}/receive`, { params: payload }).catch(() => res)
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
    const gender = normalizeAddressGenderPayload(data.gender || data.sex || data.contactGender || data.receiverGender)
    const payload = {
        addressId: id,
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        phone: data.telephone || data.mobile,
        telephone: data.telephone || data.mobile,
        gender: gender.text,
        sex: gender.code,
        genderCode: gender.code,
        genderText: gender.text,
        genderName: gender.text,
        contactGender: gender.text,
        receiverGender: gender.text,
        contact_gender: gender.text,
        receiver_gender: gender.text,
        genderEnum: gender.apiText,
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
    const gender = normalizeAddressGenderPayload(data.gender || data.sex || data.contactGender || data.receiverGender)
    return request.post('miniapp/addresses', {
        receiverName: data.contact || data.receiverName,
        mobile: data.telephone || data.mobile,
        phone: data.telephone || data.mobile,
        telephone: data.telephone || data.mobile,
        gender: gender.text,
        sex: gender.code,
        genderCode: gender.code,
        genderText: gender.text,
        genderName: gender.text,
        contactGender: gender.text,
        receiverGender: gender.text,
        contact_gender: gender.text,
        receiver_gender: gender.text,
        genderEnum: gender.apiText,
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
    return request.get('miniapp/addresses').then((res) => {
        if (res.code != 1) return res
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || res.data?.items || res.data?.rows || [])
        const item = list.find((it) => String(it.id || it.addressId) === String(id)) || null
        return { ...res, data: item }
    }).then((res) => {
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
            const item = list.find((it) => it.isDefault || it.is_default) || list[0]
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
    return request.put(`miniapp/addresses/${id}`, payload)
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
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => {
        if (res.code != 1) return res
        return normalizePageResponse(res, normalizeCoupon)
    }).catch(() => normalizePageResponse({ code: 1, data: { list: [], pageNo: 1, pageSize: data?.pageSize || data?.page_size || 20, total: 0, hasNext: false } }, normalizeCoupon))
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
    return request.get('miniapp/recharge/templates').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return { ...res, data: data.list || data.records || data.items || [] }
    })
}

export function getAfterSaleList(params) {
    return request.get('miniapp/after-sales', {
        params: {
            ...params,
            pageNo: params?.pageNo || params?.page_no || 1,
            pageSize: params?.pageSize || params?.page_size || 10
        }
    }).then((res) => {
        const normalized = normalizePageResponse(res, normalizeAfterSaleItem)
        const type = params?.type
        if (normalized.code != 1 || !type || type === 'normal') return normalized
        const statusGroups = {
            apply: [0, 1, 2],
            finish: [4, 5, 6]
        }
        const allowed = statusGroups[type]
        if (!allowed) return normalized
        const list = (normalized.data.list || []).filter((item) => allowed.includes(Number(item.status)))
        return {
            ...normalized,
            data: {
                ...normalized.data,
                list,
                lists: list,
                total: list.length,
                hasNext: false,
                more: false
            }
        }
    })
}

function paymentStatusText(status) {
    const map = {
        CREATED: '待支付',
        PENDING: '待支付',
        PROCESSING: '支付中',
        SUCCESS: '已支付',
        FAILED: '支付失败',
        CLOSED: '已关闭',
        REFUNDED: '已退款'
    }
    return map[String(status || '').toUpperCase()] || status || ''
}

function paymentMethodText(method) {
    const map = {
        WECHAT: '微信支付',
        WECHAT_JSAPI: '微信支付',
        BALANCE: '余额支付',
        ALIPAY: '支付宝',
        FIAT: '人民币'
    }
    return map[String(method || '').toUpperCase()] || method || '付款记录'
}

function normalizePaymentRecord(item = {}) {
    const amount = item.amount ?? item.payAmount ?? item.paidAmount ?? item.change_amount ?? 0
    const status = item.payStatus || item.status || item.pay_status
    const method = item.payMethod || item.pay_method || item.channelCode || item.channel_code
    const time = item.successTime || item.paidTime || item.create_time || item.createdAt || item.time || item.change_time || ''
    return {
        ...item,
        id: item.id || item.payOrderNo || item.paymentNo,
        pay_order_no: item.pay_order_no || item.payOrderNo || item.paymentNo,
        order_no: item.order_no || item.orderNo || item.bizOrderNo || item.biz_order_no,
        source_type: paymentMethodText(method),
        type_desc: item.type_desc || `${paymentMethodText(method)}${status ? ' - ' + paymentStatusText(status) : ''}`,
        change_amount: amount,
        change_type: 2,
        create_time: time,
        change_time: time,
        status_text: item.status_text || paymentStatusText(status),
        pay_status_text: paymentStatusText(status)
    }
}


export function applyAfterSale(data) {
    const orderNo = data.orderNo || data.order_id || data.id
    return request.post(`miniapp/orders/${orderNo}/refunds`, {
        orderItemId: data.orderItemId || data.item_id,
        refundType: data.refundType || data.refund_type,
        refundReason: data.refundReason || data.reason,
        refundRemark: data.refundRemark || data.remark,
        refundAmount: data.refundAmount || data.refund_price || data.amount,
        proofImages: data.proofImages || (data.img ? [data.img] : []),
        idempotentKey: data.idempotentKey || `refund-${orderNo}-${Date.now()}`
    }).then((res) => {
        if (res.code != 1) {
            const message = String(res.message || res.msg || '')
            if (res.code === 'A0004' || /refund already applied|already.*refund|already.*after.?sale|重复|已申请|售后中|退款中/i.test(message)) {
                return getAfterSaleList({ orderNo, order_no: orderNo, pageNo: 1, pageSize: 1 }).then((listRes) => {
                    const source = listRes.data || {}
                    const existing = (Array.isArray(source) ? source : source.list || [])[0]
                    return existing
                        ? { code: 1, msg: '该订单正在退款/售后处理中，请勿重复申请', data: existing, existingAfterSale: true }
                        : { ...res, msg: '该订单正在退款/售后处理中，请勿重复申请', existingAfterSale: true }
                })
            }
            return res
        }
        return {
            ...res,
            msg: res.msg || '申请成功',
            data: normalizeAfterSaleItem(res.data || {})
        }
    })
}
export function getGoodsInfo(params) {
    return request.get(`miniapp/orders/${params.order_id || params.orderNo || params.id}`).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const itemList = data.itemList || data.order_goods || data.goods_lists || []
        const goods = itemList.find((item) => String(item.id || item.orderItemId || item.itemId || item.skuId) === String(params.item_id || params.itemId)) || itemList[0] || {}
        const afterSale = goods.afterSale || goods.after_sale || goods.refundInfo || goods.refund_info || data.refundInfo || data.refund_info || {}
        const afterSaleStatus = afterSale.refundStatus || afterSale.afterSaleStatus || afterSale.status || goods.refundStatus || goods.afterSaleStatus || goods.after_status
        const afterSaleId = afterSale.afterSaleId || afterSale.after_sale_id || afterSale.refundNo || afterSale.id || goods.afterSaleId || goods.after_sale_id || goods.refundNo
        const statusText = afterSaleId || afterSaleStatus !== undefined ? refundStatusText(afterSale.statusText || afterSale.status_text || afterSaleStatus) : ''
        const price = goods.realAmount || goods.totalAmount || goods.payAmount || goods.goods_price || goods.salePrice || 0
        const reasons = data.refundReasons || data.refund_reasons || data.afterSaleReasons || data.after_sale_reasons || data.reason
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
                    refund_express_money: data.amountInfo?.freightAmount || 0,
                    after_sale_id: afterSaleId || '',
                    after_status_desc: statusText || '',
                    refund_btn: !(afterSaleId || statusText)
                },
                reason: normalizeRefundReasons(reasons),
                existingAfterSale: Boolean(afterSaleId || statusText),
                afterSaleId: afterSaleId || '',
                afterStatusText: statusText || ''
            }
        }
    })
}

export function inputExpressInfo(data) {
    return request.post('miniapp/after-sales/express', {
        afterSaleId: data.afterSaleId || data.after_sale_id || data.id,
        orderNo: data.orderNo || data.order_id || data.order_sn,
        expressCompany: data.express || data.expressCompany || data.express_name || data.company,
        expressNo: data.number || data.expressNo || data.express_no || data.invoice_no,
        remark: data.remark || data.express_remark || '',
        proofImages: data.proofImages || (data.express_image ? [data.express_image] : [])
    })
}

export function cancelApply(data) {
    return request.post('miniapp/after-sales/cancel', {
        afterSaleId: data.afterSaleId || data.after_sale_id || data.id,
        orderNo: data.orderNo || data.order_id || data.order_sn
    })
}

export function afterSaleDetail(params) {
    return request.get('miniapp/after-sales/' + (params.refundNo || params.afterSaleId || params.after_sale_id || params.id), {
        params
    }).then((res) => res.code == 1 ? { ...res, data: normalizeAfterSaleItem(res.data || {}) } : res)
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
            status: params?.status,
            payStatus: params?.payStatus || params?.status,
            startTime: params?.startTime,
            endTime: params?.endTime,
            pageNo: params?.pageNo || params?.page_no || 1,
            pageSize: params?.pageSize || params?.page_size || 10
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeLedgerItem) : res)
}

export function getPaymentRecords(params = {}) {
    return request.get('miniapp/payments/records', {
        params: {
            payStatus: params.payStatus || params.status || '',
            pageNo: params.pageNo || params.page_no || 1,
            pageSize: params.pageSize || params.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizePaymentRecord) : res)
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

export function createWechatRecharge(data = {}) {
    const amount = data.amount || data.money
    return request.post('miniapp/wallet/recharge', {
        amount,
        payMethod: data.payMethod || data.pay_method || 'WECHAT_JSAPI',
        payScene: data.payScene || 'MINIAPP',
        idempotentKey: data.idempotentKey || `wechat-recharge-${Date.now()}`
    }).then((res) => {
        if (res.code != 1) return res
        const result = res.data || {}
        return {
            ...res,
            data: {
                ...result,
                order_id: result.orderNo || result.rechargeNo || result.bizOrderNo || result.id,
                orderNo: result.orderNo || result.rechargeNo || result.bizOrderNo || result.id,
                amount: result.amount || result.rechargeAmount || amount
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
            inviteCode: data.invite_code || data.inviteCode || data.code,
            promoterUserId: data.promoterUserId || data.promoter_user_id || data.uid || data.userId,
            roleCode: data.roleCode || data.role_code || data.role,
            scene: data.scene || ''
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
        const cachedUserInfo = Cache.get(USER_INFO) || {}
        const user = data.user || data.userInfo || {}
        return {
            ...res,
            data: {
                ...data,
                nickname: data.nickname || data.nickName || data.userName || data.name || user.nickname || user.nickName || user.userName || cachedUserInfo.nickname,
                avatar: data.avatar || data.avatarUrl || data.headimgurl || user.avatar || user.avatarUrl || user.headimgurl || cachedUserInfo.avatar,
                userNo: data.userNo || data.user_no || data.sn || user.userNo || user.user_no || user.sn || cachedUserInfo.sn,
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
    const phoneCode = data.phoneCode || data.phone_code || data.wechatPhoneCode || data.wechat_phone_code
    const smsCode = data.smsCode || data.sms_code || data.verifyCode || data.verify_code || (!phoneCode ? data.code : '')
    const loginCode = data.jsCode || data.loginCode || data.login_code || data.wxCode || data.wx_code
    const oldMobile = data.oldMobile || data.old_mobile || data.mobile || data.phone || ''
    const newMobile = data.newMobile || data.new_mobile || data.newPhone || data.new_phone || data.mobile || data.phone || ''
    const payload = {
        mobile: newMobile,
        smsCode,
        code: phoneCode || smsCode,
        phoneCode,
        phone_code: phoneCode,
        jsCode: loginCode,
        loginCode,
        wxCode: loginCode,
        encryptedData: data.encryptedData || data.encrypted_data,
        encrypted_data: data.encrypted_data || data.encryptedData,
        iv: data.iv,
        scene: data.scene || data.key || data.type || (oldMobile ? 'BGSJHM' : 'BDSJHM'),
        action: data.action || (oldMobile ? 'change' : 'bind'),
        oldMobile,
        newMobile,
        new_mobile: newMobile,
        old_mobile: oldMobile
    }
    return request.post('miniapp/auth/bind-mobile', payload).then((res) => res.code == 1 ? { ...res, data: normalizeUserProfile(res.data || { mobile: newMobile }) } : res)
}

export function getLevelList() {
    return request.get('miniapp/points/sign/rules').then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            data: [
                {
                    id: 1,
                    name: '\u666e\u901a\u4f1a\u5458',
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
    const accountType = data.accountType || data.type
    return request.post('miniapp/wallet/withdraw/apply', {
        amount: data.amount || data.money,
        accountType: normalizeWithdrawAccountType(accountType),
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

function extractList(payload = {}) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.list)) return payload.list
    if (Array.isArray(payload.records)) return payload.records
    if (Array.isArray(payload.items)) return payload.items
    if (Array.isArray(payload.applications)) return payload.applications
    if (Array.isArray(payload.rows)) return payload.rows
    if (Array.isArray(payload.content)) return payload.content
    if (payload.page && typeof payload.page === 'object') return extractList(payload.page)
    return []
}

export function getInviteBanner(data) {
    return request.get('miniapp/eco-applications').then((res) => {
        if (res.code != 1) return res
        return { ...res, data: extractList(res.data || {}) }
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
        payMethod: 'WECHAT_JSAPI',
        idempotentKey: data.idempotentKey || `offline-pay-${Date.now()}`
    })
}

export function getPointsAccount() {
    return request.get('miniapp/points/sign/rules').then((res) => {
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
        autoReceiveFlag: data.autoReceiveFlag ?? data.auto_receive_flag ?? data.value ?? true,
        auto_receive_flag: data.autoReceiveFlag ?? data.auto_receive_flag ?? data.value ?? true,
        onlinePay: data.onlinePay ?? data.online_pay,
        online_pay: data.onlinePay ?? data.online_pay,
        onlineReceive: data.onlineReceive ?? data.online_receive,
        online_receive: data.onlineReceive ?? data.online_receive,
        offlinePay: data.offlinePay ?? data.offline_pay,
        offline_pay: data.offlinePay ?? data.offline_pay
    })
}

export function getAutoReceivePoints() {
    return request.get('miniapp/points/settings/auto-receive')
}

function normalizeKycStatus(status, data = {}) {
    const normalized = String(status || '').toUpperCase()
    const approved = ['APPROVED']
    const pending = ['PENDING_AUDIT']
    const rejected = ['REJECTED']
    const empty = ['NOT_SUBMITTED', 'UNSUBMITTED', 'NONE', 'NO_AUTH', 'UNAUTHENTICATED', 'UNVERIFIED', 'NOT_AUTHENTICATED', 'NOT_VERIFIED']
    if (approved.includes(normalized)) return 'APPROVED'
    if (pending.includes(normalized)) return 'PENDING_AUDIT'
    if (rejected.includes(normalized)) return 'REJECTED'
    if (empty.includes(normalized)) return 'NOT_SUBMITTED'
    return 'NOT_SUBMITTED'
}

function normalizeKycPayload(data = {}) {
    const rawStatus = firstDefined(data.kycStatus, data.kyc_status)
    const nextAction = firstDefined(data.nextAction, data.next_action, '')
    const status = normalizeKycStatus(rawStatus, data)
    const realName = firstDefined(data.realName, data.real_name, data.realNameMask, data.real_name_mask, '')
    const certNo = firstDefined(data.certNo, data.cert_no, data.certNoMask, data.cert_no_mask, '')
    const certType = firstDefined(data.certType, data.cert_type, 'ID_CARD')
    const certFrontUrl = firstDefined(data.certFrontUrl, data.cert_front_url, '')
    const certBackUrl = firstDefined(data.certBackUrl, data.cert_back_url, '')
    const auditMessage = firstDefined(data.auditMessage, data.audit_message, data.message, '')
    const rejectReasonCode = firstDefined(data.rejectReasonCode, data.reject_reason_code, '')
    const rejectReasonMessage = firstDefined(data.rejectReasonMessage, data.reject_reason_message, data.rejectReason, data.reject_reason, '')
    const lastSubmitTime = firstDefined(data.lastSubmitTime, data.last_submit_time, data.submitTime, data.submit_time, data.createTime, data.create_time, '')
    return {
        ...data,
        rawKycStatus: rawStatus || '',
        raw_kyc_status: rawStatus || '',
        kycStatus: status,
        kyc_status: status,
        realName,
        real_name: realName,
        certNo,
        cert_no: certNo,
        certType,
        cert_type: certType,
        certFrontUrl,
        cert_front_url: certFrontUrl,
        certBackUrl,
        cert_back_url: certBackUrl,
        auditMessage,
        audit_message: auditMessage,
        rejectReasonCode,
        reject_reason_code: rejectReasonCode,
        rejectReasonMessage,
        reject_reason_message: rejectReasonMessage,
        lastSubmitTime,
        last_submit_time: lastSubmitTime,
        nextAction,
        next_action: nextAction
    }
}

function isKycNotSubmittedResponse(res = {}) {
    const code = String(firstDefined(res.rawCode, res.code, '')).toUpperCase()
    const message = String(res.msg || res.message || '').toLowerCase()
    const knownCodes = ['NOT_SUBMITTED', 'UNSUBMITTED', 'NO_AUTH', 'UNAUTHENTICATED', 'UNVERIFIED', 'NOT_AUTHENTICATED', 'NOT_VERIFIED', 'KYC_NOT_SUBMITTED', 'KYC_NOT_FOUND', 'A0420', 'A0404']
    return knownCodes.includes(code)
        || /未实名|未认证|未提交|无实名|暂无实名|not[_\s-]?(submitted|verified|authenticated)|kyc[_\s-]?(not[_\s-]?found|not[_\s-]?submitted)/i.test(message)
}

export function submitKyc(data) {
    return request.post('miniapp/kyc/submit', {
        realName: data.realName || data.real_name,
        certType: data.certType || data.cert_type || 'ID_CARD',
        certNo: data.certNo || data.cert_no,
        certFrontUrl: data.certFrontUrl || data.cert_front_url || data.front,
        certBackUrl: data.certBackUrl || data.cert_back_url || data.back,
        requestNo: data.requestNo || data.request_no || `kyc-${Date.now()}`
    }).then((res) => res.code == 1 ? { ...res, data: normalizeKycPayload(res.data || {}) } : res)
}

export function getKycStatus() {
    return request.get('miniapp/kyc/status').then((res) => {
        if (res.code != 1) {
            if (isKycNotSubmittedResponse(res)) {
                return {
                    ...res,
                    code: 1,
                    data: normalizeKycPayload({ kycStatus: 'NOT_SUBMITTED' }),
                    show: false
                }
            }
            return res
        }
        return {
            ...res,
            data: normalizeKycPayload(res.data || {})
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
        if (res.code != 1 || !res.data) {
            const message = String(res.msg || res.message || '')
            if (res.code === 'A0108' || /No static resource|merchant-qualification\/status/i.test(message)) {
                return {
                    ...res,
                    code: 1,
                    data: normalizeMerchantQualification({ auditStatus: 'NOT_SUBMITTED' }),
                    show: false
                }
            }
            return res
        }
        return {
            ...res,
            data: normalizeMerchantQualification(res.data)
        }
    })
}

function normalizeRoleApplication(data = {}) {
    const status = String(data.applicationStatus || data.application_status || data.auditStatus || data.audit_status || data.status || '').toUpperCase()
    const auditRemark = data.auditRemark || data.audit_remark || data.auditMessage || data.audit_message || data.rejectReason || data.reject_reason || data.reason || ''
    const payStatus = String(data.payStatus || data.pay_status || data.depositStatus || data.deposit_status || data.bondStatus || data.bond_status || data.marginStatus || data.margin_status || '').toUpperCase()
    return {
        ...data,
        applicationNo: data.applicationNo || data.application_no || data.applyNo || data.apply_no || data.id || '',
        depositNo: data.depositNo || data.deposit_no || data.bondNo || data.bond_no || data.marginNo || data.margin_no || '',
        roleCode: normalizeRoleCode(data.roleCode || data.role_code || data.role || ''),
        applicationStatus: status,
        auditStatus: status,
        auditRemark,
        applicantName: data.applicantName || data.applicant_name || data.realName || data.real_name || data.name || '',
        mobile: data.mobile || data.phone || data.contactMobile || data.contact_mobile || '',
        username: data.username || data.loginName || data.login_name || data.account || data.accountName || data.account_name || '',
        certType: data.certType || data.cert_type || '',
        certNo: data.certNo || data.cert_no || '',
        certFrontUrl: data.certFrontUrl || data.cert_front_url || '',
        certBackUrl: data.certBackUrl || data.cert_back_url || '',
        businessLicenseUrl: data.businessLicenseUrl || data.business_license_url || '',
        provinceCode: data.provinceCode || data.province_code || '',
        provinceName: data.provinceName || data.province_name || data.province || '',
        cityCode: data.cityCode || data.city_code || '',
        cityName: data.cityName || data.city_name || data.city || '',
        districtCode: data.districtCode || data.district_code || '',
        districtName: data.districtName || data.district_name || data.district || '',
        inviteCode: data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.distributionCode || data.distribution_code || '',
        promoterCode: data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.inviteCode || data.invite_code || data.distributionCode || data.distribution_code || '',
        backendUrl: data.backendUrl || data.backend_url || data.entryUrl || data.entry_url || data.url || '',
        materialUrls: data.materialUrls || data.material_urls || [],
        depositAmount: data.depositAmount ?? data.deposit_amount ?? data.bondAmount ?? data.bond_amount ?? data.marginAmount ?? data.margin_amount ?? '',
        payStatus,
        depositStatus: payStatus,
        refundStatus: data.refundStatus || data.refund_status || '',
        financeAuditStatus: data.financeAuditStatus || data.finance_audit_status || '',
        paidAt: data.paidAt || data.paid_at || '',
        appliedAt: data.appliedAt || data.applied_at || data.createTime || data.create_time || data.createdAt || data.created_at || '',
        auditTime: data.auditTime || data.audit_time || data.approvedAt || data.approved_at || data.reviewTime || data.review_time || data.updatedAt || data.updated_at || '',
        remark: data.remark || data.applyRemark || data.apply_remark || data.applyDescription || data.apply_description || data.description || ''
    }
}

function normalizeRoleCode(roleCode) {
    const code = String(roleCode || '').toUpperCase()
    const map = {
        HEADQUARTERS: 'HQ',
        OPERATION_CENTER: 'AGENT',
        AREA_AGENT: 'AGENT',
        COUNTY_AGENT: 'AGENT'
    }
    return map[code] || code
}

function normalizeRoleItem(data = {}) {
    return {
        ...data,
        roleCode: normalizeRoleCode(data.roleCode || data.role_code || data.role || data.code),
        roleName: data.roleName || data.role_name || data.name || data.title || '',
        label: data.label || data.roleName || data.role_name || data.name || data.title || '',
        value: normalizeRoleCode(data.roleCode || data.role_code || data.role || data.code || data.value),
        areaName: data.areaName || data.area_name || data.cityName || data.city_name || data.districtName || data.district_name || '',
        inviteCode: data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.distributionCode || data.distribution_code || data.code || '',
        promoterCode: data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.inviteCode || data.invite_code || data.distributionCode || data.distribution_code || data.code || '',
        backendUrl: data.backendUrl || data.backend_url || data.entryUrl || data.entry_url || data.url || '',
        depositAmount: data.depositAmount ?? data.deposit_amount ?? data.bondAmount ?? data.bond_amount ?? data.marginAmount ?? data.margin_amount ?? ''
    }
}

export function getRoles(params = {}) {
    return request.get('miniapp/roles', {
        params: {
            userId: currentUserId(params)
        }
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const list = extractList(data).map(normalizeRoleItem)
        const rawApplyRoles = data.applyRoles || data.apply_roles || data.roleOptions || data.role_options || data.availableRoles || data.available_roles || data.configs || data.roleConfigs || data.role_configs || []
        const applyRoles = (Array.isArray(rawApplyRoles) ? rawApplyRoles : []).map(normalizeRoleItem)
        const roleDepositConfig = {
            ...(data.roleDepositConfig || data.role_deposit_config || data.depositConfig || data.deposit_config || {})
        }
        applyRoles.forEach((item) => {
            if (item.roleCode && item.depositAmount !== '') roleDepositConfig[item.roleCode] = item.depositAmount
        })
        return {
            ...res,
            data: {
                ...(!Array.isArray(data) ? data : {}),
                roles: list,
                list,
                applyRoles,
                roleOptions: applyRoles,
                roleDepositConfig
            }
        }
    })
}

export function getRoleApplications(params = {}) {
    return request.get('miniapp/role-applications', {
        params: {
            userId: currentUserId(params)
        }
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const list = extractList(data).map(normalizeRoleApplication)
        const depositOrders = (data.depositOrders || data.deposit_orders || []).map(normalizeRoleApplication)
        const depositsByApplicationNo = depositOrders.reduce((map, item) => {
            if (item.applicationNo) map[item.applicationNo] = item
            return map
        }, {})
        const applications = list.map((item) => {
            const deposit = depositsByApplicationNo[item.applicationNo]
            return deposit ? { ...item, ...deposit, applicationStatus: item.applicationStatus, auditStatus: item.auditStatus } : item
        })
        return {
            ...res,
            data: {
                ...(!Array.isArray(data) ? data : {}),
                applications,
                depositOrders,
                list: applications
            }
        }
    })
}

export function applyRoleApplication(data = {}) {
    return request.post('miniapp/role-applications', {
        userId: currentUserId(data),
        roleCode: normalizeRoleCode(data.roleCode || data.role_code || 'PROMOTER'),
        provinceCode: data.provinceCode || data.province_code || '',
        provinceName: data.provinceName || data.province_name || '',
        cityCode: data.cityCode || data.city_code || '',
        cityName: data.cityName || data.city_name || '',
        districtCode: data.districtCode || data.district_code || '',
        districtName: data.districtName || data.district_name || '',
        applicantName: data.applicantName || data.realName || data.name || '',
        mobile: data.mobile || '',
        username: data.username || data.loginName || data.login_name || '',
        password: data.password || '',
        certType: data.certType || data.cert_type || 'ID_CARD',
        certNo: data.certNo || data.cert_no || '',
        certFrontUrl: data.certFrontUrl || data.cert_front_url || '',
        certBackUrl: data.certBackUrl || data.cert_back_url || '',
        businessLicenseUrl: data.businessLicenseUrl || data.business_license_url || '',
        depositPayOrderNo: data.depositPayOrderNo || data.deposit_pay_order_no || data.depositNo || data.deposit_no || '',
        depositBizOrderNo: data.depositBizOrderNo || data.deposit_biz_order_no || '',
        depositAmount: data.depositAmount ?? data.deposit_amount ?? '',
        remark: data.remark || '',
        materialUrls: data.materialUrls || data.material_urls || [],
        material_urls: data.materialUrls || data.material_urls || [],
        realnameVerified: data.realnameVerified ?? data.realname_verified ?? data.realNameVerified ?? data.real_name_verified,
        realname_verified: data.realnameVerified ?? data.realname_verified ?? data.realNameVerified ?? data.real_name_verified,
        agreementAccepted: data.agreementAccepted ?? data.agreement_accepted ?? data.agreement ?? true,
        agreement_accepted: data.agreementAccepted ?? data.agreement_accepted ?? data.agreement ?? true
    }).then((res) => res.code == 1 && res.data ? { ...res, data: normalizeRoleApplication(res.data) } : res)
}

export function getRoleWorkbench(params = {}) {
    return request.get('miniapp/roles/workbench', {
        params: {
            userId: currentUserId(params),
            roleCode: normalizeRoleCode(params.roleCode || params.role_code || params.role)
        }
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                availablePoints: data.availablePoints ?? data.available_points ?? data.pointsAvailable ?? data.points_available ?? 0,
                available_points: data.availablePoints ?? data.available_points ?? data.pointsAvailable ?? data.points_available ?? 0,
                frozenPoints: data.frozenPoints ?? data.frozen_points ?? data.pointsFrozen ?? data.points_frozen ?? 0,
                frozen_points: data.frozenPoints ?? data.frozen_points ?? data.pointsFrozen ?? data.points_frozen ?? 0,
                todayProfit: data.todayProfit ?? data.today_profit ?? data.todayEstimatedProfit ?? data.today_estimated_profit ?? data.todayIncome ?? data.today_income ?? 0,
                today_profit: data.todayProfit ?? data.today_profit ?? data.todayEstimatedProfit ?? data.today_estimated_profit ?? data.todayIncome ?? data.today_income ?? 0,
                inviteCode: data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.distributionCode || data.distribution_code || '',
                posterUrl: data.posterUrl || data.poster_url || data.poster || data.posterImage || data.poster_image || '',
                qrcodeUrl: data.qrcodeUrl || data.qrcode_url || data.qrCode || data.qr_code || data.qrcode || data.qr_code_url || data.image || ''
            }
        }
    })
}

export function getRolePointsLedger(params = {}) {
    return request.get('miniapp/points/ledger', {
        params: {
            userId: currentUserId(params),
            roleCode: normalizeRoleCode(params.roleCode || params.role_code || params.role),
            timeRange: params.timeRange || params.time_range || '',
            bizType: params.bizType || params.biz_type || params.type || '',
            pageNo: params.pageNo || params.page_no || 1,
            pageSize: params.pageSize || params.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeLedgerItem) : res)
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
    return request.get('miniapp/points/sign/rules').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const userInfo = Cache.get(USER_INFO) || {}
        const signList = data.sign_list || data.signList || data.rules || []
        return {
            ...res,
            data: {
                ...data,
                sign_list: Array.isArray(signList) ? signList.map((item, index) => ({
                    days: item.days || item.day || index + 1,
                    integral: item.integral || item.points || item.rewardPoints || data.dailySignPoints || 0,
                    status: item.status || item.signed || 0
                })) : [],
                user: {
                    ...(data.user || {}),
                    user_integral: data.availablePoints ?? data.available_points ?? data.points ?? userInfo.user_integral ?? 0,
                    avatar: data.avatar || userInfo.avatar || '',
                    today_sign: data.todaySigned ?? data.today_sign ?? data.signedToday ?? 0,
                    days: data.signDays ?? data.continuousDays ?? data.days ?? 0
                },
                make_inegral: data.make_inegral || data.makeIntegral || []
            }
        }
    })
}

export function userSign() {
    return request.post('miniapp/points/sign').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                days: data.days || data.signDays || data.continuousDays || 1,
                growth: data.growth || data.growthValue || 0,
                integral: data.integral || data.points || data.rewardPoints || data.addPoints || 0,
                totalPoints: data.totalPoints || data.availablePoints || data.available_points
            }
        }
    })
}

export function getSignRule() {
    return request.get('miniapp/points/sign/rules')
}

export function userLogout(data) {
    Cache.remove(USER_INFO)
    return Promise.resolve({ code: 1, msg: '已退出登录', data })
}

export function getPrize(data) {
    return request.get('miniapp/lottery', { params: data }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const list = data.list || data.prizes || data.prizeList || []
        return {
            ...res,
            data: {
                ...data,
                config: data.config || {
                    status: data.status ?? 1,
                    limit: data.limit || data.dailyLimit || 0,
                    rule: data.rule || data.rules || '',
                    show_win: data.show_win ?? data.showWinningList ?? true
                },
                list: list.map((item, index) => ({
                    ...item,
                    id: item.id || item.prizeId || index,
                    prize_id: item.prize_id || item.prizeId || item.id,
                    name: item.name || item.prizeName || item.prize_name || '奖品',
                    prize_name: item.prize_name || item.prizeName || item.name || '奖品',
                    image: resolveImage(item.image || item.prizeImage || item.prize_image, 'goods'),
                    prize_image: resolveImage(item.prize_image || item.prizeImage || item.image, 'goods'),
                    url: resolveImage(item.url || item.image || item.prizeImage || item.prize_image, 'goods')
                })),
                record: (data.record || data.records || data.noticeList || []).map((item) => ({
                    ...item,
                    text: item.text || item.content || item.title || item.prizeName || item.prize_name || ''
                })),
                surplus: data.surplus ?? data.remainingTimes ?? data.remainTimes ?? 0,
                user_integral: data.user_integral ?? data.userIntegral ?? data.points ?? 0
            }
        }
    })
}

export function getUserRecord(data) {
    return request.get('miniapp/lottery/records', {
        params: {
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeLotteryRecord) : res)
}

export function userLottery(data) {
    return request.post('miniapp/lottery/draw', {
        prizeId: data?.prizeId || data?.prize_id || data?.id,
        activityId: data?.activityId || data?.activity_id
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                id: data.id || data.prizeId || data.prize_id,
                prize_name: data.prize_name || data.prizeName || data.name,
                prize_image: resolveImage(data.prize_image || data.prizeImage || data.image, 'goods'),
                text: data.text || data.prize_name || data.prizeName || data.name || '恭喜中奖'
            }
        }
    })
}

export function luckyDrawWinningList(data) {
    return request.get('miniapp/messages', {
        params: {
            bizType: data?.bizType || 'LOTTERY',
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeLotteryRecord) : res)
}

export function setWechatInfo(data) {
    return setUserInfo(data)
}

export function setPassword(data) {
    return request.post('miniapp/wallet/pay-password/set', {
        payPassword: data.payPassword || data.pay_password || data.password,
        pay_password: data.pay_password || data.payPassword || data.password
    })
}

export function changePayPassword(data) {
    return request.post('miniapp/wallet/pay-password/change', {
        oldPayPassword: data.oldPayPassword || data.origin_pay_password || data.old_pay_password,
        newPayPassword: data.newPayPassword || data.new_pay_password || data.pay_password,
        origin_pay_password: data.origin_pay_password || data.oldPayPassword || data.old_pay_password,
        new_pay_password: data.new_pay_password || data.newPayPassword || data.pay_password
    })
}

export function hasPayPassword() {
    return request.get('miniapp/wallet/pay-password/status').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const hasPayPwd = data.hasPayPassword ?? data.has_pay_password ?? data.exists ?? data.enabled ?? false
        return {
            ...res,
            code: hasPayPwd ? 1 : 0,
            data: {
                ...data,
                hasPayPassword: hasPayPwd,
                has_pay_password: hasPayPwd
            }
        }
    })
}

export function transfer(data) {
    return request.post('miniapp/wallet/transfer', {
        transferTo: data.transferTo || data.transfer_to || data.userSn || data.mobile,
        amount: data.amount || data.money,
        money: data.money || data.amount,
        payPassword: data.payPassword || data.pay_password,
        pay_password: data.pay_password || data.payPassword,
        remark: data.remark || ''
    })
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
    return request.post('miniapp/sms/send', {
        mobile: data.mobile || data.phone,
        scene: data.scene || data.type || 'PAY_PASSWORD'
    })
}

export function retrievePayPassword(data) {
    return request.post('miniapp/wallet/pay-password/retrieve', {
        mobile: data.mobile,
        code: data.code,
        newPayPassword: data.newPayPassword || data.new_pay_password || data.pay_password,
        new_pay_password: data.new_pay_password || data.newPayPassword || data.pay_password
    })
}

export function transferToInfo(params) {
    return request.get('miniapp/wallet/transfer/receiver', {
        params: {
            transferTo: params?.transferTo || params?.transfer_to || params?.userSn || params?.mobile
        }
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                sn: data.sn || data.userNo || data.userSn || data.mobile,
                nickname: data.nickname || data.nickName || data.userName || '转账用户',
                avatar: resolveImage(data.avatar || data.avatarUrl || data.headimgurl, 'avatar')
            }
        }
    })
}

export function apiDistributionPoster() {
    return request.get('miniapp/alliance/poster').then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        return {
            ...res,
            data: {
                ...data,
                poster: data.poster || data.posterUrl || data.imageUrl || ''
            }
        }
    })
}

export function getCopyright() {
    return request.get('miniapp/content-pages/copyright')
}

export function bindOawechat(data) {
    return request.post('miniapp/wechat/official-account/bind', {
        code: data.code,
        state: data.state || ''
    })
}

