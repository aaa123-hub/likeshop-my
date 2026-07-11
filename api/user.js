import request from '../utils/request'
import { client } from '@/utils/tools'
import area from '@/utils/area'
import Cache from '@/utils/cache'
import { TOKEN, USER_INFO } from '@/config/cachekey'
import { resolveImage } from '@/utils/image-placeholder'
import { cleanBackendText, isEmptyBackendText } from '@/utils/backend-text'

function firstDefined(...values) {
    return values.find((value) => !isEmptyBackendText(value))
}

function pickAfterSaleId(source = {}) {
    const value = firstDefined(
        source.afterSaleId,
        source.after_sale_id,
        source.afterSaleNo,
        source.after_sale_no,
        source.refundNo,
        source.refund_no,
        source.refundId,
        source.refund_id,
        source.id
    )
    return value && !isBackendStatusOnlyId(source, value) ? value : ''
}

function pickAfterSaleStatus(source = {}) {
    return firstDefined(
        source.statusText,
        source.status_text,
        source.refundStatusText,
        source.refund_status_text,
        source.afterSaleStatusText,
        source.after_sale_status_text,
        source.desc,
        source.refundStatus,
        source.refund_status,
        source.afterSaleStatus,
        source.after_sale_status,
        source.after_status,
        source.status
    )
}

function pickOrderItemId(source = {}) {
    return firstDefined(
        source.orderItemId,
        source.order_item_id,
        source.itemId,
        source.item_id,
        source.orderGoodsId,
        source.order_goods_id,
        source.id,
        source.skuId,
        source.sku_id
    )
}

function collectAfterSaleRecords(data = {}) {
    const sources = [
        data.afterSales,
        data.after_sales,
        data.afterSaleList,
        data.after_sale_list,
        data.refundList,
        data.refund_list,
        data.refunds,
        data.refundInfo,
        data.refund_info,
        data.afterSale,
        data.after_sale
    ]
    return sources.reduce((list, source) => {
        if (!source) return list
        if (Array.isArray(source)) return list.concat(source)
        if (Array.isArray(source.list)) return list.concat(source.list)
        if (Array.isArray(source.records)) return list.concat(source.records)
        if (Array.isArray(source.items)) return list.concat(source.items)
        return list.concat(source)
    }, [])
}

function isBackendStatusOnlyId(source = {}, value) {
    const text = String(value || '').toUpperCase()
    if (!text) return false
    const statusLike = ['APPLIED', 'APPLY', 'PENDING', 'PENDING_REVIEW', 'WAIT_AUDIT', 'WAIT_SELLER', 'WAIT_MERCHANT', 'PROCESSING', 'REFUNDING', 'IN_PROGRESS', 'APPROVED', 'PASS', 'PASSED', 'MERCHANT_APPROVED', 'RETURNING', 'WAIT_RETURN', 'WAIT_BUYER_RETURN', 'REJECTED', 'REJECT', 'CANCELLED', 'CANCELED', 'CLOSED', 'REFUNDED', 'REFUND_SUCCESS', 'SUCCESS', 'FAILED']
    return source.id === value && statusLike.includes(text) && !source.afterSaleId && !source.after_sale_id && !source.refundNo && !source.refund_no && !source.refundId && !source.refund_id
}

function matchAfterSaleRecord(item = {}, records = []) {
    const itemIds = [
        item.orderItemId,
        item.order_item_id,
        item.itemId,
        item.item_id,
        item.id,
        item.skuId,
        item.sku_id
    ].filter((value) => value !== undefined && value !== null && value !== '').map(String)
    return records.find((record = {}) => {
        const goods = record.orderGoods || record.orderItem || record.item || record.goods || record.goodsInfo || {}
        const recordItemIds = [
            record.orderItemId,
            record.order_item_id,
            record.itemId,
            record.item_id,
            record.orderGoodsId,
            record.order_goods_id,
            record.goodsItemId,
            record.goods_item_id,
            record.item?.id,
            record.item?.orderItemId,
            record.orderItem?.id,
            record.orderItem?.orderItemId,
            record.goods?.id,
            record.goods?.orderItemId,
            pickOrderItemId(goods)
        ].filter((value) => value !== undefined && value !== null && value !== '').map(String)
        return recordItemIds.length && itemIds.some((id) => recordItemIds.includes(id))
    }) || {}
}

function hasAfterSaleSignal(source = {}) {
    return Boolean(pickAfterSaleId(source) || pickAfterSaleStatus(source))
}

function selectAfterSalePayload(...sources) {
    return sources.find((source) => hasAfterSaleSignal(source || {})) || {}
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
    if (isEmptyBackendText(status)) return ''
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
    return cleanBackendText(map[String(status || '').toUpperCase()] || status, '') || '处理中'
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
    if (isEmptyBackendText(reason)) return ''
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
    if (typeof reason === 'string') return cleanBackendText(reason
        .split(/[,，、]/)
        .map((item) => reasonMap[String(item || '').toUpperCase()] || item)
        .join('、'), '')
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
    const orderNo = item.orderNo || item.order_no || item.bizOrderNo || item.biz_order_no || item.order_id || item.order_sn
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
        order_id: orderNo,
        order_no: orderNo,
        orderNo,
        order_sn: orderNo,
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

function normalizeRegionName(value, code) {
    const text = String(value || '')
    if (text && !/^\d+$/.test(text)) return text
    return findRegionNameByCode(area, code || value) || text
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
        province: normalizeRegionName(item.provinceName || item.province, provinceCode),
        city: normalizeRegionName(item.cityName || item.city, cityCode),
        district: normalizeRegionName(item.districtName || item.district, districtCode),
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

function hasLoginIdentity(data = {}) {
    return Boolean(Cache.get(TOKEN))
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
    const amount = firstDefined(
        item.changeAmount,
        item.change_amount,
        item.pointsChange,
        item.points_change,
        item.pointChange,
        item.point_change,
        item.points,
        item.point,
        item.pointAmount,
        item.point_amount,
        item.integral,
        item.integralAmount,
        item.integral_amount,
        item.score,
        item.scoreAmount,
        item.score_amount,
        item.rewardPoints,
        item.reward_points,
        item.commissionPoints,
        item.commission_points,
        item.amount,
        item.money,
        0
    )
    const balance = firstDefined(item.balanceAfter, item.balance_after, item.pointsAfter, item.points_after, item.pointAfter, item.point_after, item.availablePoints, item.available_points, item.remainingPoints, item.remaining_points, item.balance, item.left_amount, item.left_money, 0)
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
        const message = String(res.msg || res.message || '')
        if (res.rawCode === 'A0108' || /No static resource|miniapp\/user\/profile/i.test(message)) {
            const cached = Cache.get(USER_INFO) || {}
            return {
                ...res,
                code: 1,
                data: normalizeUserProfile(cached),
                show: false
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
        if (normalized.code != 1 || !type) return normalized
        const statusGroups = {
            normal: [],
            apply: [0, 1, 2],
            finish: [4, 5, 6]
        }
        const allowed = statusGroups[type]
        if (!allowed) return normalized
        const list = type === 'normal'
            ? (normalized.data.list || []).filter((item) => Number(item.after_sale?.able_apply ?? item.able_apply ?? 0) === 1 && !item.after_sale?.after_sale_id)
            : (normalized.data.list || []).filter((item) => allowed.includes(Number(item.status)))
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
    const refundAmount = data.refundCashAmount ?? data.refund_cash_amount ?? data.refundableCashAmount ?? data.refundable_cash_amount ?? data.refundAmount ?? data.refund_price ?? data.amount
    return request.post(`miniapp/orders/${orderNo}/refunds`, {
        orderItemId: data.orderItemId || data.item_id,
        refundType: data.refundType || data.refund_type,
        refundReason: data.refundReason || data.reason,
        refundRemark: data.refundRemark || data.remark,
        refundAmount,
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
        const matchedAfterSale = matchAfterSaleRecord(goods, collectAfterSaleRecords(data))
        const afterSale = selectAfterSalePayload(goods.afterSale, goods.after_sale, goods.refundInfo, goods.refund_info, matchedAfterSale)
        const afterSaleStatus = firstDefined(
            pickAfterSaleStatus(afterSale),
            goods.refundStatus,
            goods.refund_status,
            goods.afterSaleStatus,
            goods.after_sale_status,
            goods.after_status,
            goods.after_status_desc,
            goods.refundStatusText,
            goods.refund_status_text
        )
        const afterSaleId = firstDefined(
            pickAfterSaleId(afterSale),
            goods.afterSaleId,
            goods.after_sale_id,
            goods.refundNo,
            goods.refund_no,
            goods.refundId,
            goods.refund_id
        )
        const statusText = afterSaleId ? (refundStatusText(afterSale.statusText || afterSale.status_text || afterSaleStatus) || '售后处理中') : (afterSaleStatus !== undefined ? refundStatusText(afterSale.statusText || afterSale.status_text || afterSaleStatus) : '')
        const amountInfo = data.amountInfo || data.amount_info || {}
        const pointsInfo = data.pointsInfo || data.points_info || {}
        const cashAmount = amountInfo.payAmount ?? amountInfo.pay_amount ?? data.payAmount ?? data.pay_amount ?? data.actualPayAmount ?? data.actual_pay_amount ?? data.paidAmount ?? data.paid_amount ?? goods.payAmount ?? goods.pay_amount ?? goods.realAmount ?? goods.real_amount ?? 0
        const pointsAmount = amountInfo.pointsDeductAmount ?? amountInfo.points_deduct_amount ?? pointsInfo.pointsDeductAmount ?? pointsInfo.points_deduct_amount ?? data.pointsDeductAmount ?? data.points_deduct_amount ?? data.integralAmount ?? data.integral_amount ?? 0
        const freightAmount = data.amountInfo?.freightAmount ?? data.amountInfo?.freight_amount ?? amountInfo.freightAmount ?? amountInfo.freight_amount ?? data.freightAmount ?? data.freight_amount ?? 0
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
                    refund_cash_amount: cashAmount,
                    refundableCashAmount: cashAmount,
                    refund_points_amount: pointsAmount,
                    refundablePointsAmount: pointsAmount,
                    pointsDeductAmount: pointsAmount,
                    refund_express_money: freightAmount,
                    after_sale_id: afterSaleId || '',
                    after_status_desc: statusText || '',
                    refund_info: afterSale,
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

export function deleteAfterSale(data) {
    const orderNo = data.orderNo || data.order_no || data.order_id || data.order_sn || data.bizOrderNo || data.biz_order_no
    const afterSaleId = data.afterSaleId || data.after_sale_id || data.refundNo || data.refund_no || data.id
    if (afterSaleId) {
        return request.delete(`miniapp/after-sales/${afterSaleId}`).then((res) => {
            if (res.code == 1 || !orderNo) return res
            return request.delete(`miniapp/orders/${orderNo}`)
        }).catch((error) => {
            if (orderNo) return request.delete(`miniapp/orders/${orderNo}`)
            return Promise.reject(error)
        })
    }
    if (!orderNo) {
        return Promise.resolve({ code: 0, msg: '售后/订单信息缺失' })
    }
    return request.delete(`miniapp/orders/${orderNo}`)
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

function isMissingPromotionEndpoint(res = {}) {
    const code = String(res.rawCode || res.code || '').toUpperCase()
    const message = String(res.msg || res.message || '')
    return code === 'A0108' || /No static resource|miniapp\/promotion/i.test(message)
}

function shouldFallbackInviteBind(res = {}) {
    if (isMissingPromotionEndpoint(res)) return true
    const message = String(res.msg || res.message || '')
    return /invite|邀请码|推广码|联盟码|二维码|merchant|商家|fan|粉丝|参数|不能为空|缺少|不存在|无法解析/i.test(message)
}

function bindInviteByAllianceCard(data = {}) {
    return request.get('miniapp/alliance/card', {
        params: {
            inviteCode: data.invite_code || data.inviteCode || data.code,
            promoterUserId: data.promoterUserId || data.promoter_user_id || data.uid || data.userId,
            ownerUserId: data.ownerUserId || data.owner_user_id || data.inviterUserId || data.inviter_user_id || data.promoterUserId || data.promoter_user_id || data.uid || '',
            roleCode: data.roleCode || data.role_code || data.role,
            fanType: data.fanType || data.fan_type || data.type,
            merchantId: data.merchantId || data.merchant_id || '',
            ownerMerchantId: data.ownerMerchantId || data.owner_merchant_id || data.inviterMerchantId || data.inviter_merchant_id || '',
            fanUserId: data.fanUserId || data.fan_user_id || data.userId || data.user_id || '',
            fanRoleCode: data.fanRoleCode || data.fan_role_code || '',
            fanScene: data.fanScene || data.fan_scene || data.sceneType || data.scene_type || '',
            rawScene: data.rawScene || data.raw_scene || '',
            scene: data.scene || ''
        }
    }).then((res) => res.code == 1 ? { ...res, msg: res.msg || '绑定成功' } : res)
}

export function inputInviteCode(data = {}) {
    const inviteCode = data.invite_code || data.inviteCode || data.code
    const roleCode = normalizeRoleCode(data.roleCode || data.role_code || data.role)
    const promoterUserId = data.promoterUserId || data.promoter_user_id || data.uid || data.promoterId || data.promoter_id
    const userId = currentUserId(data)
    const fanUserId = data.fanUserId || data.fan_user_id || userId
    const ownerUserId = data.ownerUserId || data.owner_user_id || data.inviterUserId || data.inviter_user_id || promoterUserId || ''
    const payload = {
        userId,
        user_id: userId,
        fanUserId,
        fan_user_id: fanUserId,
        inviteCode,
        invite_code: inviteCode,
        promoterUserId,
        promoter_user_id: promoterUserId,
        ownerUserId,
        owner_user_id: ownerUserId,
        roleCode,
        role_code: roleCode,
        scene: data.scene || data.fanScene || data.fan_scene || 'PROMOTION_QR',
        rawScene: data.rawScene || data.raw_scene || '',
        fanType: data.fanType || data.fan_type || data.type || 'CONSUMER',
        fanRoleCode: data.fanRoleCode || data.fan_role_code || '',
        fanScene: data.fanScene || data.fan_scene || data.sceneType || data.scene_type || 'PROMOTION_QR'
    }
    if (data.merchantId || data.merchant_id) payload.merchantId = data.merchantId || data.merchant_id
    if (data.ownerMerchantId || data.owner_merchant_id || data.inviterMerchantId || data.inviter_merchant_id) {
        payload.ownerMerchantId = data.ownerMerchantId || data.owner_merchant_id || data.inviterMerchantId || data.inviter_merchant_id
    }
    return request.post('miniapp/promotion/invite-bind', payload).then((res) => {
        if (res.code == 1) return { ...res, msg: res.msg || '绑定成功' }
        if (shouldFallbackInviteBind(res)) return bindInviteByAllianceCard({ ...data, ...payload }).then((fallbackRes) => fallbackRes.code == 1 ? fallbackRes : res)
        return res
    })
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
    const params = {
        userId: currentUserId(data),
        roleCode: normalizeRoleCode(data?.roleCode || data?.role_code || data?.role || 'PROMOTER'),
        fanType: data?.fanType || data?.fan_type || data?.type,
        keyword: data?.keyword,
        fans: data?.fans,
        money: data?.money,
        order: data?.order,
        pageNo: data?.pageNo || data?.page_no || 1,
        pageSize: data?.pageSize || data?.page_size || 20
    }
    return request.get('miniapp/promotion/fans', { params }).then((res) => {
        if (res.code == 1) return normalizePageResponse(res, normalizeFanItem)
        if (!isMissingPromotionEndpoint(res)) return res
        return request.get('miniapp/alliance/orders', {
            params: {
                pageNo: params.pageNo,
                pageSize: params.pageSize
            }
        }).then((fallbackRes) => fallbackRes.code == 1 ? normalizePageResponse(fallbackRes, normalizeFanItem) : fallbackRes)
    })
}

function normalizeFanItem(item = {}) {
    const user = item.user || item.userInfo || item.fan || {}
    const fansTeam = item.fans_team ?? item.teamCount ?? item.team_count ?? item.subFansCount ?? item.sub_fans_count ?? item.teamSize ?? 0
    const fansOrder = item.fans_order ?? item.orderCount ?? item.order_count ?? item.orders ?? 0
    const fansMoney = item.fans_money ?? item.totalProfit ?? item.total_profit ?? item.commissionAmount ?? item.commission_amount ?? item.amount ?? 0
    return {
        ...item,
        id: item.id || item.fanId || item.fan_id || item.userId || item.user_id || user.userId || user.id,
        nickname: item.nickname || item.nickName || item.fanName || item.fan_name || item.userName || user.nickname || user.nickName || '粉丝用户',
        avatar: resolveImage(item.avatar || item.avatarUrl || item.headimgurl || user.avatar || user.avatarUrl, 'avatar'),
        mobile: item.mobile || item.phone || user.mobile || user.phone || '',
        create_time: item.create_time || item.createTime || item.bindTime || item.bind_time || item.createdAt || '',
        fans_team: fansTeam,
        fans_order: fansOrder,
        fans_money: fansMoney,
        roleCode: normalizeRoleCode(item.roleCode || item.role_code || item.role || ''),
        bindTime: item.bindTime || item.bind_time || item.createTime || item.create_time || ''
    }
}

function getAllianceOrders(data = {}) {
    return request.get('miniapp/alliance/orders', {
        params: {
            pageNo: data?.pageNo || data?.page_no || 1,
            pageSize: data?.pageSize || data?.page_size || 20
        }
    }).then((res) => res.code == 1 ? normalizePageResponse(res, normalizeFanItem) : res)
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
    if (Array.isArray(payload.roleApplications)) return payload.roleApplications
    if (Array.isArray(payload.role_applications)) return payload.role_applications
    if (Array.isArray(payload.applyRecords)) return payload.applyRecords
    if (Array.isArray(payload.apply_records)) return payload.apply_records
    if (Array.isArray(payload.rows)) return payload.rows
    if (Array.isArray(payload.content)) return payload.content
    if (payload.data && typeof payload.data === 'object') return extractList(payload.data)
    if (payload.page && typeof payload.page === 'object') return extractList(payload.page)
    if (payload.application && typeof payload.application === 'object') return [payload.application]
    if (payload.currentApplication && typeof payload.currentApplication === 'object') return [payload.currentApplication]
    if (payload.current_application && typeof payload.current_application === 'object') return [payload.current_application]
    if (payload.roleApplication && typeof payload.roleApplication === 'object') return [payload.roleApplication]
    if (payload.role_application && typeof payload.role_application === 'object') return [payload.role_application]
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
    const code = data.qrCode || data.qr_code || data.code || data.payOrderNo || data.pay_order_no || data.paymentNo || data.payment_no || data.orderNo || data.order_no || data.bizOrderNo || data.biz_order_no
    return request.post('miniapp/offline-payments/scan', {
        shopId: data.shopId || data.shop_id,
        qrCode: code,
        qr_code: code,
        payOrderNo: data.payOrderNo || data.pay_order_no || code,
        pay_order_no: data.pay_order_no || data.payOrderNo || code,
        paymentNo: data.paymentNo || data.payment_no || code,
        payment_no: data.payment_no || data.paymentNo || code,
        orderNo: data.orderNo || data.order_no || code,
        order_no: data.order_no || data.orderNo || code,
        bizOrderNo: data.bizOrderNo || data.biz_order_no || code,
        biz_order_no: data.biz_order_no || data.bizOrderNo || code,
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
        enabled: data.enabled ?? data.autoReceiveFlag ?? data.auto_receive_flag ?? data.value ?? true,
        value: data.value ?? data.autoReceiveFlag ?? data.auto_receive_flag ?? true,
        onlinePay: data.onlinePay ?? data.online_pay,
        online_pay: data.onlinePay ?? data.online_pay,
        onlineAfterPay: data.onlineAfterPay ?? data.online_after_pay ?? data.onlinePay ?? data.online_pay,
        online_after_pay: data.onlineAfterPay ?? data.online_after_pay ?? data.onlinePay ?? data.online_pay,
        onlineReceive: data.onlineReceive ?? data.online_receive,
        online_receive: data.onlineReceive ?? data.online_receive,
        onlineAfterReceive: data.onlineAfterReceive ?? data.online_after_receive ?? data.onlineReceive ?? data.online_receive,
        online_after_receive: data.onlineAfterReceive ?? data.online_after_receive ?? data.onlineReceive ?? data.online_receive,
        offlinePay: data.offlinePay ?? data.offline_pay,
        offline_pay: data.offlinePay ?? data.offline_pay,
        offlineAfterPay: data.offlineAfterPay ?? data.offline_after_pay ?? data.offlinePay ?? data.offline_pay,
        offline_after_pay: data.offlineAfterPay ?? data.offline_after_pay ?? data.offlinePay ?? data.offline_pay
    })
}

export function getAutoReceivePoints() {
    return request.get('miniapp/points/settings/auto-receive')
}

function normalizeKycStatus(status, data = {}) {
    const normalized = String(status || '').toUpperCase()
    const approved = ['APPROVED', 'PASS', 'PASSED', 'SUCCESS', 'CERTIFIED', 'VERIFIED', 'AUTHENTICATED', 'REALNAME_VERIFIED']
    const pending = ['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING', 'PENDING_REVIEW', 'WAIT_REVIEW', 'REVIEWING', 'PENDING']
    const rejected = ['REJECTED', 'REJECT', 'REFUSED', 'FAILED', 'FAIL']
    const empty = ['NOT_SUBMITTED', 'UNSUBMITTED', 'NONE', 'NO_AUTH', 'UNAUTHENTICATED', 'UNVERIFIED', 'NOT_AUTHENTICATED', 'NOT_VERIFIED']
    if (approved.includes(normalized)) return 'APPROVED'
    if (pending.includes(normalized)) return 'PENDING_AUDIT'
    if (rejected.includes(normalized)) return 'REJECTED'
    if (empty.includes(normalized)) return 'NOT_SUBMITTED'
    return 'NOT_SUBMITTED'
}

function normalizeKycPayload(data = {}) {
    const detail = data.kycInfo || data.kyc_info || data.realnameInfo || data.realname_info || data.realNameInfo || data.real_name_info || data.certificationInfo || data.certification_info || data.authInfo || data.auth_info || data.verifyInfo || data.verify_info || {}
    const source = { ...data, ...detail }
    const rawStatus = firstDefined(source.kycStatus, source.kyc_status, source.auditStatus, source.audit_status, source.realnameStatus, source.realname_status, source.realNameStatus, source.real_name_status, source.certificationStatus, source.certification_status, source.authStatus, source.auth_status, source.status)
    const nextAction = firstDefined(source.nextAction, source.next_action, '')
    const status = normalizeKycStatus(rawStatus, data)
    const realName = firstDefined(source.realName, source.real_name, source.trueName, source.true_name, source.realNameMask, source.real_name_mask, source.name, source.applicantName, source.applicant_name, '')
    const certNo = firstDefined(source.certNo, source.cert_no, source.certNoMask, source.cert_no_mask, source.idCardNo, source.id_card_no, source.idNo, source.id_no, source.identityNo, source.identity_no, source.idNumber, source.id_number, source.cardNo, source.card_no, '')
    const certType = firstDefined(source.certType, source.cert_type, source.idType, source.id_type, source.cardType, source.card_type, 'ID_CARD')
    const certFrontUrl = firstDefined(source.certFrontUrl, source.cert_front_url, source.frontUrl, source.front_url, source.idCardFrontUrl, source.id_card_front_url, source.idcardFrontUrl, source.idcard_front_url, source.frontImage, source.front_image, source.certFrontImage, source.cert_front_image, '')
    const certBackUrl = firstDefined(source.certBackUrl, source.cert_back_url, source.backUrl, source.back_url, source.idCardBackUrl, source.id_card_back_url, source.idcardBackUrl, source.idcard_back_url, source.backImage, source.back_image, source.certBackImage, source.cert_back_image, '')
    const auditMessage = firstDefined(source.auditMessage, source.audit_message, source.message, '')
    const rejectReasonCode = firstDefined(source.rejectReasonCode, source.reject_reason_code, '')
    const rejectReasonMessage = firstDefined(source.rejectReasonMessage, source.reject_reason_message, source.rejectReason, source.reject_reason, '')
    const lastSubmitTime = firstDefined(source.lastSubmitTime, source.last_submit_time, source.submitTime, source.submit_time, source.createTime, source.create_time, source.createdAt, source.created_at, '')
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
    const knownCodes = ['NOT_SUBMITTED', 'UNSUBMITTED', 'NO_AUTH', 'UNAUTHENTICATED', 'UNVERIFIED', 'NOT_AUTHENTICATED', 'NOT_VERIFIED', 'KYC_NOT_SUBMITTED', 'KYC_NOT_FOUND', 'A0108', 'A0420', 'A0404']
    return knownCodes.includes(code)
        || /No static resource|miniapp\/kyc\/status|未实名|未认证|未提交|无实名|暂无实名|not[_\s-]?(submitted|verified|authenticated)|kyc[_\s-]?(not[_\s-]?found|not[_\s-]?submitted)/i.test(message)
}

function isMissingMiniappResourceResponse(res = {}, path = '') {
    const code = String(firstDefined(res.rawCode, res.code, '')).toUpperCase()
    const message = String(res.msg || res.message || '')
    return code === 'A0108' && /No static resource/i.test(message) && (!path || message.includes(path))
}

export function submitKyc(data) {
    return request.post('miniapp/kyc/submit', {
        userId: data.userId || data.user_id,
        realName: data.realName || data.real_name,
        certType: data.certType || data.cert_type || 'ID_CARD',
        certNo: data.certNo || data.cert_no,
        certFrontUrl: data.certFrontUrl || data.cert_front_url || data.front,
        certBackUrl: data.certBackUrl || data.cert_back_url || data.back,
        requestNo: data.requestNo || data.request_no || `kyc-${Date.now()}`
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const normalized = normalizeKycPayload(data)
        const nextAction = String(data.nextAction || data.next_action || '').toUpperCase()
        if (nextAction === 'WAIT_MANUAL_REVIEW') {
            normalized.kycStatus = 'PENDING_AUDIT'
            normalized.kyc_status = 'PENDING_AUDIT'
            normalized.auditStatus = 'PENDING_AUDIT'
            normalized.audit_status = 'PENDING_AUDIT'
        }
        return { ...res, data: normalized }
    })
}

export function getKycStatus(params = {}) {
    if (!hasLoginIdentity(params)) {
        return Promise.resolve({
            code: 1,
            data: normalizeKycPayload({ kycStatus: 'NOT_SUBMITTED' }),
            show: false
        })
    }
    const userId = currentUserId(params)
    if (!userId) {
        return Promise.resolve({
            code: 1,
            data: normalizeKycPayload({ kycStatus: 'NOT_SUBMITTED' }),
            show: false
        })
    }
    return request.get('miniapp/kyc/status', {
        show: params.show,
        params: {
            userId
        }
    }).then((res) => {
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

function normalizeBackendAccount(data = {}) {
    const account = data.backendAccount || data.backend_account || data.account || data.adminAccount || data.admin_account || {}
    return {
        ...account,
        adminUserId: firstDefined(account.adminUserId, account.admin_user_id, account.id, data.adminUserId, data.admin_user_id),
        platformUserId: firstDefined(account.platformUserId, account.platform_user_id, data.platformUserId, data.platform_user_id),
        userId: firstDefined(account.userId, account.user_id, data.userId, data.user_id),
        accountNo: firstDefined(account.accountNo, account.account_no, data.accountNo, data.account_no),
        username: firstDefined(account.username, account.loginName, account.login_name, data.backendUsername, data.backend_username, data.username, data.loginName, data.login_name),
        roleCode: firstDefined(account.roleCode, account.role_code, account.role, data.roleCode, data.role_code, data.role),
        accountStatus: firstDefined(account.accountStatus, account.account_status, account.status, data.accountStatus, data.account_status),
        displayName: firstDefined(account.displayName, account.display_name, account.name, data.displayName, data.display_name)
    }
}

function normalizeOnboardingContext(data = {}) {
    const uiHints = data.uiHints || data.ui_hints || {}
    const backendAccount = normalizeBackendAccount(data)
    const reusableProfile = data.reusableProfile || data.reusable_profile || data.kycProfile || data.kyc_profile || {}
    const kycProfile = normalizeKycPayload({
        ...data,
        ...reusableProfile,
        realName: firstDefined(reusableProfile.realName, reusableProfile.real_name, reusableProfile.applicantName, reusableProfile.applicant_name, data.realName, data.real_name),
        certNo: firstDefined(reusableProfile.certNo, reusableProfile.cert_no, reusableProfile.certNoMask, reusableProfile.cert_no_mask, data.certNo, data.cert_no, data.certNoMask, data.cert_no_mask),
        certFrontUrl: firstDefined(reusableProfile.certFrontUrl, reusableProfile.cert_front_url, data.certFrontUrl, data.cert_front_url),
        certBackUrl: firstDefined(reusableProfile.certBackUrl, reusableProfile.cert_back_url, data.certBackUrl, data.cert_back_url),
        kycStatus: firstDefined(data.kycStatus, data.kyc_status, data.auditStatus, data.audit_status)
    })
    const hasBackendAccount = Boolean(
        data.hasBackendAccount
        || data.has_backend_account
        || backendAccount.adminUserId
        || backendAccount.platformUserId
        || backendAccount.username
    )
    const normalizedHints = {
        ...uiHints,
        showBackendAccountFields: uiHints.showBackendAccountFields ?? uiHints.show_backend_account_fields ?? !hasBackendAccount,
        requireBackendUsername: uiHints.requireBackendUsername ?? uiHints.require_backend_username ?? !hasBackendAccount,
        requireBackendPassword: uiHints.requireBackendPassword ?? uiHints.require_backend_password ?? !hasBackendAccount,
        canReuseKycProfile: uiHints.canReuseKycProfile ?? uiHints.can_reuse_kyc_profile ?? false,
        hideRepeatedKycFields: uiHints.hideRepeatedKycFields ?? uiHints.hide_repeated_kyc_fields ?? false
    }
    return {
        ...data,
        hasBackendAccount,
        has_backend_account: hasBackendAccount,
        backendAccount,
        backend_account: backendAccount,
        backendUsername: firstDefined(data.backendUsername, data.backend_username, backendAccount.username),
        backend_username: firstDefined(data.backend_username, data.backendUsername, backendAccount.username),
        kycStatus: kycProfile.kycStatus,
        kyc_status: kycProfile.kyc_status,
        auditStatus: firstDefined(data.auditStatus, data.audit_status, kycProfile.kycStatus),
        audit_status: firstDefined(data.audit_status, data.auditStatus, kycProfile.kyc_status),
        realName: kycProfile.realName,
        real_name: kycProfile.real_name,
        certType: kycProfile.certType,
        cert_type: kycProfile.cert_type,
        certNoMask: firstDefined(data.certNoMask, data.cert_no_mask, reusableProfile.certNoMask, reusableProfile.cert_no_mask, kycProfile.certNo),
        cert_no_mask: firstDefined(data.cert_no_mask, data.certNoMask, reusableProfile.cert_no_mask, reusableProfile.certNoMask, kycProfile.cert_no),
        certFrontUrl: kycProfile.certFrontUrl,
        cert_front_url: kycProfile.cert_front_url,
        certBackUrl: kycProfile.certBackUrl,
        cert_back_url: kycProfile.cert_back_url,
        reusableProfile: {
            ...reusableProfile,
            applicantName: firstDefined(reusableProfile.applicantName, reusableProfile.applicant_name, kycProfile.realName),
            applicant_name: firstDefined(reusableProfile.applicant_name, reusableProfile.applicantName, kycProfile.realName),
            realName: kycProfile.realName,
            real_name: kycProfile.real_name,
            mobile: firstDefined(reusableProfile.mobile, data.mobile, data.contactMobile, data.contact_mobile),
            certType: kycProfile.certType,
            cert_type: kycProfile.cert_type,
            certNo: kycProfile.certNo,
            cert_no: kycProfile.cert_no,
            certNoMask: firstDefined(reusableProfile.certNoMask, reusableProfile.cert_no_mask, data.certNoMask, data.cert_no_mask, kycProfile.certNo),
            cert_no_mask: firstDefined(reusableProfile.cert_no_mask, reusableProfile.certNoMask, data.cert_no_mask, data.certNoMask, kycProfile.cert_no),
            certFrontUrl: kycProfile.certFrontUrl,
            cert_front_url: kycProfile.cert_front_url,
            certBackUrl: kycProfile.certBackUrl,
            cert_back_url: kycProfile.cert_back_url
        },
        uiHints: normalizedHints,
        ui_hints: normalizedHints
    }
}

export function getOnboardingContext(params = {}) {
    const userId = currentUserId(params)
    if (!hasLoginIdentity(params) || !userId) {
        return Promise.resolve({
            code: 1,
            data: normalizeOnboardingContext({}),
            show: false
        })
    }
    return request.get('miniapp/user/onboarding-context', {
        show: params.show,
        params: { userId }
    }).then((res) => {
        if (res.code != 1 || !res.data) return res
        return {
            ...res,
            data: normalizeOnboardingContext(res.data || {})
        }
    })
}

function normalizeMerchantIndustry(item = {}) {
    if (typeof item === 'string') return { id: item, value: item, name: item, label: item }
    const id = firstDefined(item.id, item.industryId, item.industry_id, item.code, item.industryCode, item.industry_code, item.value)
    const name = firstDefined(item.name, item.industryName, item.industry_name, item.label, item.title)
    return {
        ...item,
        id,
        value: id,
        industryId: id,
        industry_id: id,
        industryCode: firstDefined(item.industryCode, item.industry_code, item.code, id),
        industry_code: firstDefined(item.industry_code, item.industryCode, item.code, id),
        name,
        label: name
    }
}

function normalizeMerchantIndustryList(data = {}) {
    const source = Array.isArray(data)
        ? data
        : data.list || data.records || data.items || data.industries || data.industryList || data.industry_list || []
    return (Array.isArray(source) ? source : []).map(normalizeMerchantIndustry).filter(item => item.value !== undefined && item.value !== null && item.value !== '' && item.label)
}

export function getMerchantIndustries(params = {}) {
    return request.get('miniapp/merchant-industries', {
        show: params.show
    }).then((res) => {
        if (res.code == 1) {
            return {
                ...res,
                data: {
                    ...(!Array.isArray(res.data) ? (res.data || {}) : {}),
                    list: normalizeMerchantIndustryList(res.data || {})
                }
            }
        }
        if (isMissingMiniappResourceResponse(res, 'miniapp/merchant-industries')) {
            return request.get('miniapp/merchant-applications/industries', {
                show: params.show
            }).then((fallbackRes) => fallbackRes.code == 1
                ? {
                    ...fallbackRes,
                    data: {
                        ...(!Array.isArray(fallbackRes.data) ? (fallbackRes.data || {}) : {}),
                        list: normalizeMerchantIndustryList(fallbackRes.data || {})
                    }
                }
                : fallbackRes)
        }
        return res
    })
}

function normalizeRegionOption(item = {}) {
    if (typeof item === 'string') return { label: item, value: item, children: [] }
    const label = item.label || item.name || item.regionName || item.region_name || item.areaName || item.area_name || item.provinceName || item.province_name || item.cityName || item.city_name || item.districtName || item.district_name || ''
    const value = item.value || item.code || item.regionCode || item.region_code || item.areaCode || item.area_code || item.provinceCode || item.province_code || item.cityCode || item.city_code || item.districtCode || item.district_code || item.id || label
    const children = item.children || item.childList || item.child_list || item.list || item.cities || item.cityList || item.city_list || item.districts || item.districtList || item.district_list || []
    return {
        ...item,
        label,
        value,
        children: normalizeRegionOptions(children)
    }
}

function normalizeRegionOptions(source = []) {
    const list = Array.isArray(source)
        ? source
        : source.tree || source.list || source.records || source.items || source.regions || source.regionList || source.region_list || source.children || []
    const normalized = (Array.isArray(list) ? list : []).map(normalizeRegionOption).filter(item => item.label && item.value)
    if (normalized.length === 1 && String(normalized[0].value).toUpperCase() === 'CN' && normalized[0].children && normalized[0].children.length) {
        return normalized[0].children
    }
    return normalized
}

export function getMiniappRegions(params = {}) {
    return request.get('miniapp/regions', {
        show: params.show,
        params: {
            parentRegionCode: params.parentRegionCode || params.parent_region_code || '',
            tree: params.tree !== false
        }
    }).then((res) => {
        if (res.code != 1) return res
        const data = res.data || {}
        const tree = normalizeRegionOptions(data.tree || data.list || data)
        return {
            ...res,
            data: {
                ...(!Array.isArray(data) ? data : {}),
                tree,
                list: normalizeRegionOptions(data.list || data.tree || data),
                areaOptions: tree,
                area_options: tree,
                regionOptions: tree,
                region_options: tree
            }
        }
    })
}

function normalizeMerchantQualification(data = {}) {
    const source = data.application || data.merchantApplication || data.merchant_application || data.registration || data || {}
    const normalizeUrlList = (value) => {
        if (!value) return []
        let list = value
        if (typeof list === 'string') {
            const text = list.trim()
            if (!text) return []
            try {
                const parsed = JSON.parse(text)
                list = Array.isArray(parsed) ? parsed : [parsed]
            } catch (error) {
                list = text.split(/[,，]/)
            }
        }
        if (!Array.isArray(list)) list = [list]
        return list.map((item) => {
            if (!item) return ''
            if (typeof item === 'string') return item.trim()
            return firstDefined(item.url, item.fileUrl, item.file_url, item.imageUrl, item.image_url, item.videoUrl, item.video_url, item.path, item.uri, '')
        }).filter(Boolean)
    }
    const qualificationUrls = normalizeUrlList(source.qualificationUrls || source.qualification_urls || source.qualificationUrlList || source.qualification_url_list || source.qualificationUrl || source.qualification_url || [])
    const shopImageUrls = normalizeUrlList(source.shopImageUrls || source.shop_image_urls || source.shopImages || source.shop_images || source.storeImages || source.store_images || source.albumUrls || source.album_urls || [])
    const shopVideoUrls = normalizeUrlList(source.shopVideoUrls || source.shop_video_urls || source.shopVideos || source.shop_videos || source.storeVideos || source.store_videos || [])
    let shopMedia = source.shopMedia || source.shop_media || source.mediaList || source.media_list || []
    if (typeof shopMedia === 'string') {
        try {
            const parsed = JSON.parse(shopMedia)
            shopMedia = Array.isArray(parsed) ? parsed : []
        } catch (error) {
            shopMedia = []
        }
    }
    if (!Array.isArray(shopMedia)) shopMedia = []
    const applyStatus = source.applyStatus || source.apply_status || source.auditStatus || source.audit_status || source.status || ''
    return {
        ...data,
        ...source,
        applicationNo: source.applicationNo || source.application_no || source.applyNo || source.apply_no || '',
        application_no: source.application_no || source.applicationNo || source.applyNo || source.apply_no || '',
        merchantId: source.merchantId || source.merchant_id || '',
        merchant_id: source.merchantId || source.merchant_id || '',
        merchant_no: source.merchantNo || source.merchant_no,
        merchantName: source.merchantName || source.merchant_name || '',
        merchant_name: source.merchantName || source.merchant_name || '',
        merchantType: source.merchantType || source.merchant_type || 'COMPANY',
        merchant_type: source.merchantType || source.merchant_type || 'COMPANY',
        username: source.username || source.loginName || source.login_name || '',
        shopName: source.shopName || source.shop_name || source.storeName || source.store_name || source.merchantName || source.merchant_name || '',
        shop_name: source.shopName || source.shop_name || source.storeName || source.store_name || source.merchantName || source.merchant_name || '',
        shopLogoUrl: firstDefined(source.shopLogoUrl, source.shop_logo_url, source.shopLogo, source.shop_logo, source.logoUrl, source.logo_url, ''),
        shop_logo_url: firstDefined(source.shop_logo_url, source.shopLogoUrl, source.shop_logo, source.shopLogo, source.logo_url, source.logoUrl, ''),
        shopImageUrls,
        shop_image_urls: shopImageUrls,
        shopVideoUrls,
        shop_video_urls: shopVideoUrls,
        shopMedia,
        shop_media: shopMedia,
        businessHours: firstDefined(source.businessHours, source.business_hours, ''),
        business_hours: firstDefined(source.business_hours, source.businessHours, ''),
        industryId: source.industryId || source.industry_id || '',
        industry_id: source.industryId || source.industry_id || '',
        industryCode: source.industryCode || source.industry_code || '',
        industry_code: source.industryCode || source.industry_code || '',
        industryName: source.industryName || source.industry_name || '',
        industry_name: source.industryName || source.industry_name || '',
        contactName: source.contactName || source.contact_name || source.legalPerson || source.legal_person || '',
        contact_name: source.contactName || source.contact_name || source.legalPerson || source.legal_person || '',
        contactMobile: source.contactMobile || source.contact_mobile || source.mobile || source.phone || '',
        contact_mobile: source.contactMobile || source.contact_mobile || source.mobile || source.phone || '',
        legalPerson: source.legalPerson || source.legal_person || source.contactName || source.contact_name || '',
        legal_person: source.legalPerson || source.legal_person || source.contactName || source.contact_name || '',
        licenseNo: source.licenseNo || source.license_no || source.qualificationNo || source.qualification_no || '',
        license_no: source.licenseNo || source.license_no || source.qualificationNo || source.qualification_no || '',
        licenseUrl: source.licenseUrl || source.license_url || '',
        license_url: source.licenseUrl || source.license_url || '',
        licenseImageUrl: source.licenseImageUrl || source.license_image_url || source.qualificationUrl || source.qualification_url || '',
        license_image_url: source.licenseImageUrl || source.license_image_url || source.qualificationUrl || source.qualification_url || '',
        legalIdFrontUrl: source.legalIdFrontUrl || source.legal_id_front_url || '',
        legal_id_front_url: source.legalIdFrontUrl || source.legal_id_front_url || '',
        legalIdBackUrl: source.legalIdBackUrl || source.legal_id_back_url || '',
        legal_id_back_url: source.legalIdBackUrl || source.legal_id_back_url || '',
        qualificationUrls,
        qualification_urls: qualificationUrls,
        wechatMerchantNo: firstDefined(source.wechatMerchantNo, source.wechat_merchant_no, source.subMchId, source.sub_mch_id, source.settlementAccountNo, source.settlement_account_no, ''),
        wechat_merchant_no: firstDefined(source.wechat_merchant_no, source.wechatMerchantNo, source.sub_mch_id, source.subMchId, source.settlement_account_no, source.settlementAccountNo, ''),
        settlementAccountNo: firstDefined(source.settlementAccountNo, source.settlement_account_no, source.wechatMerchantNo, source.wechat_merchant_no, source.subMchId, source.sub_mch_id, ''),
        settlement_account_no: firstDefined(source.settlement_account_no, source.settlementAccountNo, source.wechat_merchant_no, source.wechatMerchantNo, source.sub_mch_id, source.subMchId, ''),
        provinceCode: firstDefined(source.provinceCode, source.province_code, ''),
        province_code: firstDefined(source.province_code, source.provinceCode, ''),
        provinceName: firstDefined(source.provinceName, source.province_name, source.province, ''),
        province_name: firstDefined(source.province_name, source.provinceName, source.province, ''),
        cityCode: firstDefined(source.cityCode, source.city_code, ''),
        city_code: firstDefined(source.city_code, source.cityCode, ''),
        cityName: firstDefined(source.cityName, source.city_name, source.city, ''),
        city_name: firstDefined(source.city_name, source.cityName, source.city, ''),
        districtCode: firstDefined(source.districtCode, source.district_code, source.areaCode, source.area_code, ''),
        district_code: firstDefined(source.district_code, source.districtCode, source.area_code, source.areaCode, ''),
        districtName: firstDefined(source.districtName, source.district_name, source.district, source.areaName, source.area_name, ''),
        district_name: firstDefined(source.district_name, source.districtName, source.district, source.area_name, source.areaName, ''),
        detailAddress: source.detailAddress || source.detail_address || source.address || '',
        detail_address: source.detailAddress || source.detail_address || source.address || '',
        longitude: firstDefined(source.longitude, source.lng, ''),
        lng: firstDefined(source.lng, source.longitude, ''),
        latitude: firstDefined(source.latitude, source.lat, ''),
        lat: firstDefined(source.lat, source.latitude, ''),
        shopDescription: firstDefined(source.shopDescription, source.shop_description, source.storeDescription, source.store_description, source.description, source.remark, ''),
        shop_description: firstDefined(source.shop_description, source.shopDescription, source.store_description, source.storeDescription, source.description, source.remark, ''),
        remark: source.remark || source.description || source.shopDescription || source.shop_description || source.storeDescription || source.store_description || source.onlineShopDescription || source.online_shop_description || '',
        applyStatus,
        apply_status: applyStatus,
        auditStatus: source.auditStatus || source.audit_status || applyStatus,
        audit_status: source.auditStatus || source.audit_status || applyStatus,
        hasBackendAccount: source.hasBackendAccount || source.has_backend_account || false,
        has_backend_account: source.hasBackendAccount || source.has_backend_account || false,
        backendAccount: normalizeBackendAccount(source),
        backend_account: normalizeBackendAccount(source),
        backendUsername: firstDefined(source.backendUsername, source.backend_username, source.username, source.loginName, source.login_name),
        backend_username: firstDefined(source.backend_username, source.backendUsername, source.username, source.loginName, source.login_name),
        roles: source.roles || source.roleList || source.role_list || [],
        roleCode: source.roleCode || source.role_code || source.role || '',
        role_code: source.roleCode || source.role_code || source.role || '',
        uiHints: source.uiHints || source.ui_hints || {},
        ui_hints: source.uiHints || source.ui_hints || {},
        auditRemark: source.auditRemark || source.audit_remark || source.remark || '',
        audit_remark: source.auditRemark || source.audit_remark || source.remark || '',
        updatedAt: source.updatedAt || source.updated_at || source.updateTime || source.createTime || source.createdAt || '',
        updated_at: source.updatedAt || source.updated_at || source.updateTime || source.createTime || source.createdAt || ''
    }
}

function merchantApplicationPayload(data = {}) {
    const qualificationUrls = data.qualificationUrls || data.qualification_urls || []
    const shopImageUrls = data.shopImageUrls || data.shop_image_urls || []
    const shopVideoUrls = data.shopVideoUrls || data.shop_video_urls || []
    const toJsonList = (value) => typeof value === 'string'
        ? value
        : JSON.stringify(Array.isArray(value) ? value.filter(Boolean) : [])
    const payload = {
        userId: data.userId || data.user_id,
        username: data.username || data.loginName || data.login_name || '',
        password: data.password || '',
        merchantName: data.merchantName || data.merchant_name || '',
        merchantType: data.merchantType || data.merchant_type || 'COMPANY',
        contactName: data.contactName || data.contact_name || '',
        contactMobile: data.contactMobile || data.contact_mobile || data.mobile || '',
        legalPerson: data.legalPerson || data.legal_person || '',
        licenseNo: data.licenseNo || data.license_no || data.qualificationNo || data.qualification_no || '',
        licenseUrl: data.licenseUrl || data.license_url || '',
        licenseImageUrl: data.licenseImageUrl || data.license_image_url || data.qualificationUrl || data.qualification_url || '',
        legalIdFrontUrl: data.legalIdFrontUrl || data.legal_id_front_url || '',
        legalIdBackUrl: data.legalIdBackUrl || data.legal_id_back_url || '',
        qualificationUrls: toJsonList(qualificationUrls),
        shopName: data.shopName || data.shop_name || data.merchantName || data.merchant_name || '',
        shopLogoUrl: data.shopLogoUrl || data.shop_logo_url || data.shopLogo || data.shop_logo || '',
        shopImageUrls: toJsonList(shopImageUrls),
        shopVideoUrls: toJsonList(shopVideoUrls),
        shopDescription: data.shopDescription || data.shop_description || data.storeDescription || data.store_description || data.remark || '',
        businessHours: data.businessHours || data.business_hours || '',
        industryId: data.industryId || data.industry_id || '',
        wechatMerchantNo: data.wechatMerchantNo || data.wechat_merchant_no || data.subMchId || data.sub_mch_id || data.settlementAccountNo || data.settlement_account_no || '',
        wechat_merchant_no: data.wechat_merchant_no || data.wechatMerchantNo || data.sub_mch_id || data.subMchId || data.settlement_account_no || data.settlementAccountNo || '',
        subMchId: data.subMchId || data.sub_mch_id || data.wechatMerchantNo || data.wechat_merchant_no || data.settlementAccountNo || data.settlement_account_no || '',
        sub_mch_id: data.sub_mch_id || data.subMchId || data.wechat_merchant_no || data.wechatMerchantNo || data.settlement_account_no || data.settlementAccountNo || '',
        settlementAccountNo: data.settlementAccountNo || data.settlement_account_no || data.wechatMerchantNo || data.wechat_merchant_no || data.subMchId || data.sub_mch_id || '',
        provinceCode: data.provinceCode || data.province_code || '',
        provinceName: data.provinceName || data.province_name || '',
        cityCode: data.cityCode || data.city_code || '',
        cityName: data.cityName || data.city_name || '',
        districtCode: data.districtCode || data.district_code || data.areaCode || data.area_code || '',
        districtName: data.districtName || data.district_name || data.areaName || data.area_name || '',
        detailAddress: data.detailAddress || data.detail_address || '',
        longitude: data.longitude || data.lng || '',
        latitude: data.latitude || data.lat || ''
    }
    if (!payload.username) delete payload.username
    if (!payload.password) delete payload.password
    return payload
}

export function applyMerchantQualification(data = {}) {
    return submitMerchantApplication(data)
}

export function submitMerchantApplication(data = {}) {
    return request.post('miniapp/merchant-applications', merchantApplicationPayload(data)).then((res) => {
        if (res.code != 1 || !res.data) return res
        return {
            ...res,
            data: normalizeMerchantQualification(res.data)
        }
    })
}

export function getMerchantQualificationStatus(params = {}) {
    return getMerchantApplicationStatus(params)
}

export function getMerchantApplicationStatus(params = {}) {
    return request.get('miniapp/merchant-applications', {
        params: {
            userId: params.userId || params.user_id
        }
    }).then((res) => {
        if (res.code != 1 || !res.data) {
            const message = String(res.msg || res.message || '')
            if (res.code === 'A0108' || /No static resource|merchant-applications|merchant-qualification\/status/i.test(message)) {
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

export function resubmitMerchantApplication(data = {}) {
    const payload = {
        applicationNo: data.applicationNo || data.application_no || '',
        contactMobile: data.contactMobile || data.contact_mobile || data.mobile || '',
        ...merchantApplicationPayload(data)
    }
    return request.post('miniapp/merchant-applications/resubmit', payload).then((res) => {
        if (res.code != 1 || !res.data) return res
        return {
            ...res,
            data: normalizeMerchantQualification(res.data)
        }
    })
}

function normalizeMerchantAuditItem(item = {}) {
    return normalizeMerchantQualification(item)
}

export function getPlatformMerchantAudits(params = {}) {
    return request.get('miniapp/platform-admin/merchant-audits', {
        params: {
            auditStatus: params.auditStatus || params.audit_status || 'PENDING',
            pageNo: params.pageNo || params.page_no || 1,
            pageSize: params.pageSize || params.page_size || 100
        }
    }).then((res) => normalizePageResponse(res, normalizeMerchantAuditItem))
}

export function auditPlatformMerchantApplication(applicationNo, data = {}) {
    return request.post(`miniapp/platform-admin/merchant-audits/${applicationNo}`, {
        result: data.result || data.auditResult || data.audit_result || 'APPROVED',
        remark: data.remark || data.auditRemark || data.audit_remark || ''
    })
}

export function auditPlatformMerchantByMerchantId(merchantId, data = {}) {
    return request.post(`miniapp/platform-admin/merchants/${merchantId}/audit`, {
        auditResult: data.auditResult || data.audit_result || data.result || 'APPROVED',
        auditRemark: data.auditRemark || data.audit_remark || data.remark || ''
    })
}

function normalizeRoleApplication(data = {}) {
    const applicationInfo = data.application || data.roleApplication || data.role_application || data.applyInfo || data.apply_info || {}
    const depositInfo = data.depositOrder || data.deposit_order || data.depositInfo || data.deposit_info || data.bondOrder || data.bond_order || data.marginOrder || data.margin_order || {}
    const source = { ...depositInfo, ...data, ...applicationInfo }
    const statusCandidates = [
        source.applicationStatus,
        source.application_status,
        source.auditStatus,
        source.audit_status,
        source.reviewStatus,
        source.review_status,
        source.applyStatus,
        source.apply_status,
        source.status
    ].map((value) => String(value || '').toUpperCase()).filter(Boolean)
    const explicitApplicationStatus = statusCandidates[0] || ''
    const rawStatus = explicitApplicationStatus
    const auditRemark = source.auditRemark || source.audit_remark || source.auditMessage || source.audit_message || source.rejectReason || source.reject_reason || source.reason || ''
    const payStatus = String(source.payStatus || source.pay_status || source.paymentStatus || source.payment_status || source.depositStatus || source.deposit_status || source.bondStatus || source.bond_status || source.marginStatus || source.margin_status || '').toUpperCase()
    const paidStatuses = ['PAID', 'SUCCESS', 'SUCCEEDED', 'FINISHED', 'COMPLETED', 'WAIVED', 'FREE']
    const unpaidStatuses = ['UNPAID', 'WAIT_PAY', 'PENDING_PAY', 'NOT_PAID', 'PAYING']
    const approvedStatuses = ['APPROVED', 'PASS', 'PASSED']
    const rejectedStatuses = ['REJECTED', 'REJECT', 'REFUSED', 'REFUSE', 'FAIL', 'FAILED', 'AUDIT_REJECTED', 'REVIEW_REJECTED', 'NOT_PASS', 'NOT_PASSED']
    const pendingAuditStatuses = ['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING', 'PENDING_REVIEW', 'WAIT_REVIEW', 'REVIEWING']
    const pendingDepositStatuses = ['PENDING_DEPOSIT', 'WAIT_DEPOSIT', 'PENDING_PAY', 'WAIT_PAY']
    const depositNo = source.depositNo || source.deposit_no || source.bondNo || source.bond_no || source.marginNo || source.margin_no || ''
    const depositAmount = source.depositAmount ?? source.deposit_amount ?? source.bondAmount ?? source.bond_amount ?? source.marginAmount ?? source.margin_amount ?? ''
    let status = rawStatus
    if (statusCandidates.some((item) => rejectedStatuses.includes(item))) {
        status = 'REJECTED'
    } else if (approvedStatuses.includes(rawStatus)) {
        status = 'APPROVED'
    } else if (!explicitApplicationStatus && paidStatuses.includes(rawStatus)) {
        status = 'PENDING_AUDIT'
    } else if (pendingAuditStatuses.includes(rawStatus)) {
        status = 'PENDING_AUDIT'
    } else if (paidStatuses.includes(payStatus) && (!rawStatus || pendingDepositStatuses.includes(rawStatus))) {
        status = 'PENDING_AUDIT'
    } else if (pendingDepositStatuses.includes(rawStatus) || (depositNo && (payStatus === '' || unpaidStatuses.includes(payStatus)))) {
        status = 'PENDING_DEPOSIT'
    }
    return {
        ...data,
        applicationNo: source.applicationNo || source.application_no || source.applyNo || source.apply_no || source.applicationId || source.application_id || source.id || '',
        depositNo: depositNo || source.depositPayOrderNo || source.deposit_pay_order_no || source.depositBizOrderNo || source.deposit_biz_order_no || '',
        roleCode: normalizeRoleCode(source.roleCode || source.role_code || source.role || ''),
        rawApplicationStatus: rawStatus,
        raw_application_status: rawStatus,
        applicationStatus: status,
        auditStatus: status,
        auditRemark,
        applicantName: source.applicantName || source.applicant_name || source.realName || source.real_name || source.name || '',
        mobile: source.mobile || source.phone || source.contactMobile || source.contact_mobile || '',
        username: source.username || source.loginName || source.login_name || source.account || source.accountName || source.account_name || '',
        certType: source.certType || source.cert_type || '',
        certNo: source.certNo || source.cert_no || '',
        certFrontUrl: source.certFrontUrl || source.cert_front_url || '',
        certBackUrl: source.certBackUrl || source.cert_back_url || '',
        businessLicenseUrl: source.businessLicenseUrl || source.business_license_url || '',
        provinceCode: source.provinceCode || source.province_code || '',
        provinceName: source.provinceName || source.province_name || source.province || '',
        cityCode: source.cityCode || source.city_code || '',
        cityName: source.cityName || source.city_name || source.city || '',
        districtCode: source.districtCode || source.district_code || '',
        districtName: source.districtName || source.district_name || source.district || '',
        detailAddress: source.detailAddress || source.detail_address || source.address || '',
        detail_address: source.detailAddress || source.detail_address || source.address || '',
        longitude: firstDefined(source.longitude, source.lng, ''),
        lng: firstDefined(source.lng, source.longitude, ''),
        latitude: firstDefined(source.latitude, source.lat, ''),
        lat: firstDefined(source.lat, source.latitude, ''),
        inviteCode: source.inviteCode || source.invite_code || source.promoterCode || source.promoter_code || source.promotionCode || source.promotion_code || source.distributionCode || source.distribution_code || '',
        promoterCode: source.promoterCode || source.promoter_code || source.promotionCode || source.promotion_code || source.inviteCode || source.invite_code || source.distributionCode || source.distribution_code || '',
        backendUrl: source.backendUrl || source.backend_url || source.entryUrl || source.entry_url || source.url || '',
        materialUrls: source.materialUrls || source.material_urls || [],
        depositPayOrderNo: source.depositPayOrderNo || source.deposit_pay_order_no || source.payOrderNo || source.pay_order_no || '',
        depositBizOrderNo: source.depositBizOrderNo || source.deposit_biz_order_no || source.bizOrderNo || source.biz_order_no || depositNo || '',
        depositAmount,
        payStatus,
        depositStatus: payStatus,
        refundStatus: source.refundStatus || source.refund_status || '',
        financeAuditStatus: source.financeAuditStatus || source.finance_audit_status || '',
        paidAt: source.paidAt || source.paid_at || '',
        appliedAt: source.appliedAt || source.applied_at || source.createTime || source.create_time || source.createdAt || source.created_at || '',
        auditTime: source.auditTime || source.audit_time || source.approvedAt || source.approved_at || source.reviewTime || source.review_time || source.updatedAt || source.updated_at || '',
        remark: source.remark || source.applyRemark || source.apply_remark || source.applyDescription || source.apply_description || source.description || ''
    }
}

function normalizeRoleCode(roleCode) {
    const code = String(roleCode || '').toUpperCase()
    const map = {
        HEADQUARTERS: 'HQ',
        OPERATION_CENTER: 'AGENT',
        AREA_AGENT: 'AGENT',
        COUNTY_AGENT: 'AGENT',
        BRANCH: 'SUBSIDIARY',
        COMPANY_BRANCH: 'SUBSIDIARY'
    }
    return map[code] || code
}

function normalizeRoleItem(data = {}) {
    const areaOptions = data.areaOptions || data.area_options || data.areas || data.areaList || data.area_list
        || data.regions || data.regionOptions || data.region_options || data.regionList || data.region_list
        || data.availableAreas || data.available_areas || data.applyAreas || data.apply_areas
        || data.availableRegions || data.available_regions || []
    return {
        ...data,
        roleCode: normalizeRoleCode(data.roleCode || data.role_code || data.role || data.code),
        roleName: data.roleName || data.role_name || data.name || data.title || '',
        label: data.label || data.roleName || data.role_name || data.name || data.title || '',
        value: normalizeRoleCode(data.roleCode || data.role_code || data.role || data.code || data.value),
        areaOptions,
        area_options: areaOptions,
        areaName: data.areaName || data.area_name || data.cityName || data.city_name || data.districtName || data.district_name || '',
        inviteCode: data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.distributionCode || data.distribution_code || data.code || '',
        promoterCode: data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.inviteCode || data.invite_code || data.distributionCode || data.distribution_code || data.code || '',
        backendUrl: data.backendUrl || data.backend_url || data.entryUrl || data.entry_url || data.url || '',
        depositAmount: data.depositAmount ?? data.deposit_amount ?? data.bondAmount ?? data.bond_amount ?? data.marginAmount ?? data.margin_amount ?? ''
    }
}

export function getRoles(params = {}) {
    return request.get('miniapp/roles', {
        show: params.show,
        params: {
            userId: currentUserId(params)
        }
    }).then((res) => {
        if (res.code != 1) {
            return res
        }
        const data = res.data || {}
        const list = extractList(data).map(normalizeRoleItem)
        const rawApplyRoles = data.applyRoles || data.apply_roles || data.roleOptions || data.role_options || data.availableRoles || data.available_roles || data.configs || data.roleConfigs || data.role_configs || []
        const applyRoles = (Array.isArray(rawApplyRoles) ? rawApplyRoles : []).map(normalizeRoleItem)
        const areaOptions = data.areaOptions || data.area_options || data.areas || data.areaList || data.area_list
            || data.regions || data.regionOptions || data.region_options || data.regionList || data.region_list
            || data.availableAreas || data.available_areas || data.applyAreas || data.apply_areas
            || data.availableRegions || data.available_regions || []
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
                areaOptions,
                area_options: areaOptions,
                roleDepositConfig
            }
        }
    })
}

export function getRoleApplications(params = {}) {
    return request.get('miniapp/role-applications', {
        show: params.show,
        params: {
            userId: currentUserId(params)
        }
    }).then((res) => {
        if (res.code != 1) {
            if (isMissingMiniappResourceResponse(res, 'miniapp/role-applications')) {
                return {
                    ...res,
                    code: 1,
                    data: {
                        applications: [],
                        depositOrders: [],
                        list: []
                    },
                    show: false,
                    unsupported: true
                }
            }
            return res
        }
        const data = res.data || {}
        const list = extractList(data).map(normalizeRoleApplication)
        const depositOrders = (data.depositOrders || data.deposit_orders || []).map(normalizeRoleApplication)
        const depositsByApplicationNo = depositOrders.reduce((map, item) => {
            if (item.applicationNo) map[item.applicationNo] = item
            return map
        }, {})
        const applications = list.map((item) => {
            const deposit = depositsByApplicationNo[item.applicationNo]
            return deposit ? normalizeRoleApplication({ ...item, ...deposit, applicationStatus: item.applicationStatus, auditStatus: item.auditStatus }) : item
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
    const payload = {
        userId: currentUserId(data),
        applicationNo: data.applicationNo || data.application_no || data.applyNo || data.apply_no || '',
        application_no: data.application_no || data.applicationNo || data.applyNo || data.apply_no || '',
        applicationId: data.applicationId || data.application_id || data.id || '',
        application_id: data.application_id || data.applicationId || data.id || '',
        roleCode: normalizeRoleCode(data.roleCode || data.role_code || 'PROMOTER'),
        provinceCode: data.provinceCode || data.province_code || '',
        provinceName: data.provinceName || data.province_name || '',
        cityCode: data.cityCode || data.city_code || '',
        cityName: data.cityName || data.city_name || '',
        districtCode: data.districtCode || data.district_code || '',
        districtName: data.districtName || data.district_name || '',
        detailAddress: data.detailAddress || data.detail_address || data.address || '',
        detail_address: data.detailAddress || data.detail_address || data.address || '',
        longitude: data.longitude || data.lng || '',
        lng: data.lng || data.longitude || '',
        latitude: data.latitude || data.lat || '',
        lat: data.lat || data.latitude || '',
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
    }
    if (!payload.username) delete payload.username
    if (!payload.password) delete payload.password
    return request.post('miniapp/role-applications', payload).then((res) => res.code == 1 && res.data ? { ...res, data: normalizeRoleApplication(res.data) } : res)
}

function normalizeWorkbenchData(data = {}, params = {}) {
    const metrics = data.metrics || data.statistics || data.stats || data.summary || {}
    const points = data.points || data.pointsInfo || data.points_info || data.integralInfo || data.integral_info || {}
    const invite = data.inviteInfo || data.invite_info || data.promotionInfo || data.promotion_info || data.shareInfo || data.share_info || {}
    const role = data.roleInfo || data.role_info || data.currentRole || data.current_role || {}
    const merchant = data.merchantInfo || data.merchant_info || data.shopInfo || data.shop_info || {}
    const source = { ...metrics, ...points, ...invite, ...role, ...merchant, ...data }
    const roleCode = normalizeRoleCode(source.roleCode || source.role_code || source.role || params.roleCode || params.role_code || params.role || 'PROMOTER')
    const availablePoints = firstDefined(source.availablePoints, source.available_points, source.pointsAvailable, source.points_available, source.points, source.integral, 0)
    const frozenPoints = firstDefined(source.frozenPoints, source.frozen_points, source.pointsFrozen, source.points_frozen, source.freezePoints, source.freeze_points, 0)
    const todayProfit = firstDefined(source.todayProfit, source.today_profit, source.todayEstimatedProfit, source.today_estimated_profit, source.todayIncome, source.today_income, source.todayCommission, source.today_commission, 0)
    const monthProfit = firstDefined(source.monthProfit, source.month_profit, source.monthIncome, source.month_income, source.monthCommission, source.month_commission, 0)
    const totalProfit = firstDefined(source.totalProfit, source.total_profit, source.totalIncome, source.total_income, source.totalCommission, source.total_commission, source.incomeAmount, source.income_amount, 0)
    const fansCount = firstDefined(source.fansCount, source.fans_count, source.fanCount, source.fan_count, source.boundFansCount, source.bound_fans_count, source.consumerCount, source.consumer_count, 0)
    const todayFans = firstDefined(source.todayFans, source.today_fans, source.todayFanCount, source.today_fan_count, source.newFansCount, source.new_fans_count, 0)
    const merchantCount = firstDefined(source.merchantCount, source.merchant_count, source.boundMerchantCount, source.bound_merchant_count, source.shopCount, source.shop_count, source.storeCount, source.store_count, 0)
    const orderCount = firstDefined(source.orderCount, source.order_count, source.orders, source.orderNum, source.order_num, 0)
    const todayOrderCount = firstDefined(source.todayOrderCount, source.today_order_count, source.todayOrders, source.today_orders, 0)
    const inviteCode = firstDefined(source.inviteCode, source.invite_code, source.promoterCode, source.promoter_code, source.promotionCode, source.promotion_code, source.distributionCode, source.distribution_code, source.code, '')
    const qrcodeUrl = firstDefined(source.qrcodeUrl, source.qrcode_url, source.qrCode, source.qr_code, source.qrcode, source.qr_code_url, source.image, source.imageUrl, '')
    const posterUrl = firstDefined(source.posterUrl, source.poster_url, source.poster, source.posterImage, source.poster_image, source.sharePoster, source.share_poster, '')
    return {
        ...data,
        roleCode,
        role_code: roleCode,
        roleName: source.roleName || source.role_name || '',
        roleStatus: source.roleStatus || source.role_status || source.status || '',
        applicationStatus: source.applicationStatus || source.application_status || source.auditStatus || source.audit_status || '',
        availablePoints,
        available_points: availablePoints,
        frozenPoints,
        frozen_points: frozenPoints,
        todayProfit,
        today_profit: todayProfit,
        monthProfit,
        month_profit: monthProfit,
        totalProfit,
        total_profit: totalProfit,
        fansCount,
        fans_count: fansCount,
        todayFans,
        today_fans: todayFans,
        merchantCount,
        merchant_count: merchantCount,
        orderCount,
        order_count: orderCount,
        todayOrderCount,
        today_order_count: todayOrderCount,
        inviteCode,
        invite_code: inviteCode,
        promoterCode: firstDefined(source.promoterCode, source.promoter_code, inviteCode, ''),
        promoter_code: firstDefined(source.promoterCode, source.promoter_code, inviteCode, ''),
        posterUrl,
        poster_url: posterUrl,
        qrcodeUrl,
        qrcode_url: qrcodeUrl,
        shareTitle: source.shareTitle || source.share_title || source.title || '',
        shareDesc: source.shareDesc || source.share_desc || source.desc || '',
        merchantId: source.merchantId || source.merchant_id || source.shopId || source.shop_id || '',
        merchantName: source.merchantName || source.merchant_name || source.shopName || source.shop_name || ''
    }
}

function normalizeInviteCodeData(data = {}, params = {}) {
    return normalizeWorkbenchData({
        ...data,
        inviteCode: firstDefined(data.inviteCode, data.invite_code, data.promoterCode, data.promoter_code, data.code, data.promotionCode, data.promotion_code, ''),
        qrcodeUrl: firstDefined(data.qrcodeUrl, data.qrcode_url, data.qrCode, data.qr_code, data.qrcode, data.image, data.imageUrl, ''),
        posterUrl: firstDefined(data.posterUrl, data.poster_url, data.poster, data.posterImage, data.poster_image, '')
    }, params)
}

export function getPromotionInviteCode(params = {}) {
    return request.get('miniapp/promotion/invite-code', {
        params: {
            userId: currentUserId(params),
            roleCode: normalizeRoleCode(params.roleCode || params.role_code || params.role || 'PROMOTER')
        }
    }).then((res) => res.code == 1 ? { ...res, data: normalizeInviteCodeData(res.data || {}, params) } : res)
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
            data: normalizeWorkbenchData(data, params)
        }
    })
}

export function getRolePointsLedger(params = {}) {
    const query = {
        userId: currentUserId(params),
        roleCode: normalizeRoleCode(params.roleCode || params.role_code || params.role),
        timeRange: params.timeRange || params.time_range || '',
        bizType: params.bizType || params.biz_type || params.type || '',
        pageNo: params.pageNo || params.page_no || 1,
        pageSize: params.pageSize || params.page_size || 20
    }
    return request.get('miniapp/promotion/profit-ledgers', { params: query }).then((res) => {
        if (res.code == 1) return normalizePageResponse(res, normalizeLedgerItem)
        if (!isMissingPromotionEndpoint(res)) return res
        return request.get('miniapp/points/ledger', { params: query }).then((fallbackRes) => fallbackRes.code == 1 ? normalizePageResponse(fallbackRes, normalizeLedgerItem) : fallbackRes)
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

