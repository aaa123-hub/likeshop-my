import request from '@/utils/request'
import { client } from '@/utils/tools'
import { getMessages } from '@/api/user'
import { resolveImage } from '@/utils/image-placeholder'

function valueOr(value, fallback) {
    return value !== undefined && value !== null ? value : fallback
}

function parseSpecJson(specJson) {
    if (!specJson) return []
    if (Array.isArray(specJson)) return specJson
    if (typeof specJson === 'object') {
        return Object.keys(specJson).map(function(name) {
            return { name: name, value: specJson[name] }
        })
    }
    try {
        var parsed = JSON.parse(specJson)
        if (Array.isArray(parsed)) return parsed
        if (parsed && typeof parsed === 'object') {
            return Object.keys(parsed).map(function(name) {
                return { name: name, value: parsed[name] }
            })
        }
    } catch (e) {}
    return []
}

function parseImageList(value) {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)
    if (typeof value === 'string') {
        try {
            var parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed.filter(Boolean)
        } catch (e) {}
        return value.split(',').map(function(item) { return item.trim() }).filter(Boolean)
    }
    return []
}

function normalizeTimeValue(value) {
    var text = String(value || '').trim()
    if (!text) return ''
    var match = text.match(/(\d{1,2})[:：](\d{2})/)
    if (!match) return ''
    var hour = Math.max(0, Math.min(23, Number(match[1]) || 0))
    var minute = Math.max(0, Math.min(59, Number(match[2]) || 0))
    return hour * 60 + minute
}

function inferOpenStatusFromHours(hours, fallbackStatus) {
    var status = String(fallbackStatus || '').trim().toUpperCase()
    var text = String(hours || '').trim()
    if (!text) return status
    if (/24\s*小时|全天|00[:：]00\s*[-~至到]\s*24[:：]00/i.test(text)) return 'OPEN'
    var match = text.match(/(\d{1,2}[:：]\d{2})\s*(?:-|~|至|到)\s*(\d{1,2}[:：]\d{2})/)
    if (!match) return status
    var start = normalizeTimeValue(match[1])
    var end = normalizeTimeValue(match[2])
    if (start === '' || end === '') return status
    var now = new Date()
    var current = now.getHours() * 60 + now.getMinutes()
    if (start === end) return 'OPEN'
    if (start < end) return current >= start && current < end ? 'OPEN' : 'CLOSED'
    return current >= start || current < end ? 'OPEN' : 'CLOSED'
}

function normalizeTimeValueClean(value) {
    var text = String(value || '').trim()
    var match = text.match(/(\d{1,2})[:：](\d{2})/)
    if (!match) return ''
    var hour = Math.max(0, Math.min(23, Number(match[1]) || 0))
    var minute = Math.max(0, Math.min(59, Number(match[2]) || 0))
    return hour * 60 + minute
}

function inferOpenStatusFromHoursClean(hours, fallbackStatus) {
    var status = String(fallbackStatus || '').trim().toUpperCase()
    var text = String(hours || '').trim()
    if (!text) return status
    if (/24\s*小时|全天|00[:：]00\s*[-~至到]\s*24[:：]00/i.test(text)) return 'OPEN'
    var match = text.match(/(\d{1,2}[:：]\d{2})\s*(?:-|~|至|到)\s*(\d{1,2}[:：]\d{2})/)
    if (!match) return status
    var start = normalizeTimeValueClean(match[1])
    var end = normalizeTimeValueClean(match[2])
    if (start === '' || end === '') return status
    var now = new Date()
    var current = now.getHours() * 60 + now.getMinutes()
    if (start === end) return 'OPEN'
    if (start < end) return current >= start && current < end ? 'OPEN' : 'CLOSED'
    return current >= start || current < end ? 'OPEN' : 'CLOSED'
}

function parseTextList(value) {
    if (!value) return []
    if (Array.isArray(value)) {
        return value.map(function(item) {
            if (!item) return ''
            if (typeof item === 'string') return item.trim()
            return item.name || item.title || item.label || item.text || item.value || ''
        }).filter(Boolean)
    }
    if (typeof value === 'string') {
        try {
            var parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parseTextList(parsed)
        } catch (e) {}
        return value.split(/[,，]/).map(function(item) { return item.trim() }).filter(Boolean)
    }
    if (typeof value === 'object') {
        return Object.keys(value).map(function(key) { return value[key] || key }).filter(Boolean)
    }
    return []
}

function decodeHtmlEntities(value) {
    if (!value || typeof value !== 'string') return value || ''
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
}

function normalizeRichHtml(value) {
    var html = decodeHtmlEntities(value || '').trim()
    if (!html) return ''
    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    html = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    html = html.replace(/<img([^>]*?)src=["']?([^"'\s>]+)["']?([^>]*)>/gi, function(match, before, src, after) {
        var imageUrl = resolveImage(src, 'goods')
        return '<img' + before + ' src="' + imageUrl + '"' + after + ' style="max-width:100%;height:auto;display:block;" />'
    })
    return html
}

function parseDetailContent(value) {
    if (!value) return ''
    if (typeof value === 'string') {
        try {
            var parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return normalizeRichHtml(parsed.map(function(item) { return item.html || item.text || item.content || item.value || '' }).filter(Boolean).join('<br/>'))
            if (parsed && typeof parsed === 'object') return normalizeRichHtml(parsed.html || parsed.content || parsed.text || value)
        } catch (e) {}
        return normalizeRichHtml(value)
    }
    if (Array.isArray(value)) return normalizeRichHtml(value.map(function(item) { return item.html || item.text || item.content || item.value || '' }).filter(Boolean).join('<br/>'))
    if (typeof value === 'object') return normalizeRichHtml(value.html || value.content || value.text || '')
    return ''
}

function imagesToDetailContent(images = []) {
    return images.map(function(image) {
        return '<img style="max-width:100%;display:block;" src="' + resolveImage(image, 'goods') + '" />'
    }).join('')
}

function firstDefined() {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== '') return arguments[i]
    }
    return undefined
}

function boolValue(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback
    if (value === true || value === 1 || value === '1') return true
    if (value === false || value === 0 || value === '0') return false
    var text = String(value).toUpperCase()
    if (['TRUE', 'YES', 'Y'].includes(text)) return true
    if (['FALSE', 'NO', 'N'].includes(text)) return false
    return Boolean(value)
}

function couponTypeText(item) {
    var type = String(item.coupon_type || item.couponType || item.typeText || item.type || '').toUpperCase()
    var map = {
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

function normalizeCouponItem(item = {}) {
    var threshold = firstDefined(item.thresholdAmount, item.threshold_amount, item.minAmount, item.min_amount, item.useThreshold, item.use_threshold)
    var ownerType = item.ownerType || item.owner_type || (item.subsidyEligible || item.subsidy_eligible ? 'PLATFORM' : (item.merchantId || item.merchant_id ? 'MERCHANT' : ''))
    var subsidyEligible = Boolean(item.subsidyEligible || item.subsidy_eligible || ownerType === 'PLATFORM')
    var couponTemplate = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {}
    var coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {}
    var amount = firstDefined(item.money, item.amount, item.discountAmount, item.discount_amount, item.discountValue, item.discount_value, item.couponAmount, item.coupon_amount, item.reduceAmount, item.reduce_amount, item.deductAmount, item.deduct_amount, item.faceValue, item.face_value, item.value, coupon.money, coupon.amount, coupon.discountAmount, coupon.discount_amount, 0)
    var couponId = item.couponId || item.coupon_id || item.templateId || item.template_id || item.couponTemplateId || item.coupon_template_id || item.couponTplId || item.coupon_tpl_id || item.couponTemplateNo || item.coupon_template_no || couponTemplate.couponId || couponTemplate.coupon_id || couponTemplate.templateId || couponTemplate.template_id || couponTemplate.couponTemplateId || couponTemplate.coupon_template_id || couponTemplate.couponTplId || couponTemplate.coupon_tpl_id || couponTemplate.id || coupon.couponId || coupon.coupon_id || coupon.templateId || coupon.template_id || coupon.couponTemplateId || coupon.coupon_template_id || coupon.couponTplId || coupon.coupon_tpl_id || coupon.id || item.id
    var receiveStatus = String(firstDefined(item.receiveStatus, item.receive_status, item.status, '')).toUpperCase()
    var isReceived = boolValue(item.is_get, false) || boolValue(item.isGet, false) || boolValue(item.received, false) || boolValue(item.hasReceived, false) || boolValue(item.has_received, false) || item.userCouponId || item.user_coupon_id || receiveStatus === 'RECEIVED' || receiveStatus === 'CLAIMED'
    var canReceive = firstDefined(item.canReceive, item.can_receive, item.receivable, item.can_get, item.canGet, '')
    return Object.assign({}, item, {
        id: item.id || couponId || item.userCouponId,
        coupon_id: couponId || item.userCouponId,
        couponId: couponId,
        couponTemplateId: item.couponTemplateId || item.coupon_template_id || couponTemplate.id || couponTemplate.templateId || couponTemplate.couponTemplateId || couponId,
        name: item.name || item.couponName || item.coupon_name || item.title || '优惠券',
        use_condition: item.use_condition || item.useCondition || item.conditionText || (threshold ? '满' + threshold + '可用' : (amount ? amount + '元优惠券' : '优惠券')),
        money: amount || item.money || 0,
        coupon_type: couponTypeText(item),
        use_time_tips: item.use_time_tips || item.useTimeTips || item.validTimeText || item.valid_time_text || '',
        ownerType: ownerType,
        owner_type: ownerType,
        subsidyEligible: subsidyEligible,
        subsidy_eligible: subsidyEligible,
        receiveStatus: receiveStatus,
        receive_status: receiveStatus,
        is_get: isReceived ? 1 : 0,
        isGet: Boolean(isReceived),
        canReceive: boolValue(canReceive, !isReceived),
        can_receive: boolValue(canReceive, !isReceived)
    })
}

function normalizeArrayPayload(value) {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (Array.isArray(value.list)) return value.list
    if (Array.isArray(value.items)) return value.items
    if (Array.isArray(value.records)) return value.records
    if (Array.isArray(value.rows)) return value.rows
    return []
}

function normalizeCommentScore(value, fallback = '') {
    var number = Number(value)
    if (Number.isNaN(number) || number <= 0) return fallback
    return Math.max(1, Math.min(5, Math.round(number)))
}

function normalizeCommentSpecText(value) {
    var text = String(value || '').trim()
    if (!text) return ''
    if (/^\d+$/.test(text)) return ''
    if (/^[A-Z0-9_-]{8,}$/i.test(text) && !/[\u4e00-\u9fa5，。！？、；：“”‘’（）]/.test(text)) return ''
    return text
}
function buildSpecValueId(spec, groupName, valueName, fallback) {
    return spec.id || spec.valueId || spec.value_id || groupName + '-' + (valueName || fallback)
}

function normalizeCategory(item = {}) {
    return Object.assign({}, item, {
        id: item.id || item.categoryId,
        pid: valueOr(item.pid, valueOr(item.parentId, 0)),
        name: item.name || item.categoryName || '',
        image: resolveImage(item.image || item.icon || item.iconUrl || item.imageUrl || item.picUrl),
        icon: resolveImage(item.icon || item.iconUrl || item.image || item.imageUrl || item.picUrl),
        level: item.level || item.categoryLevel || 1,
        sort: valueOr(item.sort, valueOr(item.sortNo, 0)),
        status: item.status || item.categoryStatus || '',
        children: (item.children || []).map(normalizeCategory)
    })
}

function normalizeGoodsListItem(item = {}) {
    return Object.assign({}, item, {
        id: item.id || item.spuId || item.productId || item.goods_id,
        goods_id: item.goods_id || item.spuId || item.productId || item.id,
        spu_id: item.spu_id || item.spuId || item.productId || item.id,
        name: item.name || item.spuName || item.productName || item.title || item.goods_name,
        goods_name: item.goods_name || item.spuName || item.productName || item.title || item.name,
        image: resolveImage(item.image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl || (item.images && item.images[0]) || (item.goods_image && item.goods_image[0] && item.goods_image[0].uri), 'goods'),
        goods_image: resolveImage(item.goods_image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl || item.image, 'goods'),
        price: firstDefined(item.price, item.salePrice, item.minPrice, item.payAmount, item.amount, item.min_price),
        market_price: firstDefined(item.market_price, item.marketPrice, item.originPrice, item.maxPrice, item.max_price),
        origin_price: firstDefined(item.origin_price, item.originPrice, item.market_price),
        shop_id: item.shop_id || item.shopId || item.merchantShopId || item.merchant_shop_id || '',
        shopId: item.shopId || item.shop_id || item.merchantShopId || item.merchant_shop_id || '',
        shop_name: item.shop_name || item.shopName || item.storeName || (item.shopInfo && item.shopInfo.shopName) || '',
        shopName: item.shopName || item.shop_name || item.storeName || (item.shopInfo && item.shopInfo.shopName) || '',
        sales_sum: firstDefined(item.sales_sum, item.salesCount, item.sales_count, item.saleCount, item.virtualSales),
        comment_count: firstDefined(item.comment_count, item.commentCount, item.reviewCount),
        score: item.score || item.star || item.goodsScore || item.productScore || item.shopScore || item.shop_score || item.commentScore || item.rating || '',
        unit: item.unit || item.unitName || '',
        category_name: item.category_name || item.categoryName || item.cateName || '',
        subtitle: item.subtitle || item.subTitle || item.sellingPoint || item.shortDesc || item.description || '',
        tags: item.tags || item.labels || item.tagList || [],
        stock: valueOr(item.stock, valueOr(item.stockQty, valueOr(item.stockQuantity, '')))
    })
}

function normalizeSkuItem(item = {}, index = 0) {
    var specs = parseSpecJson(item.specJson || item.spec_json || item.spec)
    var specValueStr = specs.map(function(spec) { return spec.valueName || spec.value || spec.name }).filter(Boolean).join(' / ') || item.skuName || ''
    var skuName = item.sku_name || item.skuName || item.name || item.title || ''
    var displaySkuName = skuName && skuName !== specValueStr ? skuName : specValueStr
    var specValueIds = specs.map(function(spec, specIndex) {
        var groupName = spec.name || spec.specName || '规格' + (specIndex + 1)
        var valueName = spec.valueName || spec.value || spec.name
        return buildSpecValueId(spec, groupName, valueName, index + '-' + specIndex)
    }).join(',')
    var image = resolveImage(item.image || item.imageUrl || (item.imageUrls && item.imageUrls[0]), 'goods')

    return Object.assign({}, item, {
        id: item.id || item.skuId,
        item_id: item.item_id || item.skuId || item.id,
        sku_id: item.sku_id || item.skuId || item.id,
        skuName: skuName || specValueStr,
        sku_name: skuName || specValueStr,
        sku_code: item.sku_code || item.skuCode || '',
        name: displaySkuName,
        price: firstDefined(item.price, item.salePrice),
        team_price: firstDefined(item.team_price, item.teamPrice, item.groupPrice, item.salePrice, item.price),
        market_price: firstDefined(item.market_price, item.marketPrice, item.originPrice, item.origin_price, item.originalPrice, item.original_price, item.linePrice, item.line_price),
        stock: firstDefined(item.stock, item.stockQty, item.stockQuantity),
        image,
        spec_value_str: displaySkuName || item.spec_value_str || specValueStr,
        spec_value: displaySkuName || item.spec_value || specValueStr,
        spec_value_ids: item.spec_value_ids || specValueIds || String(item.skuId || item.id || index),
        spec_value_ids_arr: (item.spec_value_ids || specValueIds || String(item.skuId || item.id || index)).split(',')
    })
}

function normalizeSpecList(skuList = []) {
    var groups = []
    skuList.forEach(function(sku, skuIndex) {
        parseSpecJson(sku.specJson || sku.spec_json || sku.spec).forEach(function(spec, specIndex) {
        var groupName = spec.name || spec.specName || '规格' + (specIndex + 1)
            var group = groups.find(function(item) { return item.name === groupName })
            if (!group) {
                group = {
                    id: spec.specId || specIndex + 1,
                    name: groupName,
                    spec_value: []
                }
                groups.push(group)
            }
            var valueName = spec.valueName || spec.value || spec.name
            var valueId = buildSpecValueId(spec, groupName, valueName, skuIndex + '-' + specIndex)
            if (valueName && !group.spec_value.some(function(value) { return String(value.id) === String(valueId) || value.value === valueName })) {
                group.spec_value.push({
                    id: valueId,
                    value: valueName,
                    name: valueName
                })
            }
        })
    })
    return groups
}

function normalizeGoodsDetail(payload = {}, spuId) {
    var detail = payload.detail || payload.product || payload.productInfo || payload.product_info || payload.goods || payload.goodsInfo || payload.goods_info || payload.spu || payload.info || payload
    detail = Object.assign({}, payload, detail)
    var images = parseImageList(detail.images || detail.imageUrls || detail.image_urls || detail.albumUrls || detail.album_urls || detail.goods_image || detail.mainImages || detail.main_images)
    if (!images.length && (detail.mainImageUrl || detail.cover || detail.image)) {
        images.push(detail.mainImageUrl || detail.cover || detail.image)
    }
    var goodsItem = (detail.skuList || detail.goods_item || []).map(normalizeSkuItem)
    if (!images.length) {
        goodsItem.forEach(function(item) {
            if (item.image) images.push(item.image)
        })
    }
    if (!goodsItem.length) {
        goodsItem.push(normalizeSkuItem({
            id: detail.defaultSkuId || detail.skuId || detail.id || spuId,
            skuId: detail.defaultSkuId || detail.skuId || detail.id || spuId,
            skuName: '',
            salePrice: firstDefined(detail.minPrice, detail.price),
            marketPrice: firstDefined(detail.marketPrice, detail.originPrice, detail.maxPrice),
            stockQty: firstDefined(detail.stockQty, detail.stock),
            imageUrl: detail.mainImageUrl || detail.cover || detail.image || images[0]
        }))
    }
    var shopInfo = detail.shopInfo || detail.shop || detail.shop_info || {}
    var commentSummary = normalizeCommentSummary(detail.commentSummary || detail.comment || {})
    var coupons = normalizeArrayPayload(detail.couponList || detail.coupon_list || detail.coupons || detail.availableCoupons || detail.available_coupons || detail.couponInfo || detail.coupon_info || detail.coupon).map(normalizeCouponItem)
    var pointsInfo = detail.pointsInfo || detail.points_info || detail.integralInfo || detail.integral_info || {}
    var rawMarketingConfig = Object.assign({}, detail.marketingConfig || detail.marketing_config || detail.pointsMarketing || detail.pointsConfig || {}, pointsInfo)
    var pointsDeductAmount = valueOr(rawMarketingConfig.pointsDeductAmount, rawMarketingConfig.points_deduct_amount)
    pointsDeductAmount = valueOr(pointsDeductAmount, valueOr(detail.pointsDeductAmount, valueOr(detail.points_deduct_amount, valueOr(detail.integralDeductAmount, detail.integral_deduct_amount))))
    var pointsAmount = valueOr(rawMarketingConfig.pointsAmount, rawMarketingConfig.points_amount)
    pointsAmount = valueOr(pointsAmount, valueOr(detail.pointsAmount, valueOr(detail.points_amount, valueOr(detail.integralNum, detail.integral_num))))
    var giveIntegral = valueOr(detail.order_give_integral, valueOr(detail.giveIntegral, valueOr(detail.give_integral, valueOr(detail.rewardPoints, detail.reward_points))))
    var pointsEnabled = valueOr(rawMarketingConfig.pointsEnabled, valueOr(rawMarketingConfig.points_enabled, valueOr(detail.pointsEnabled, valueOr(detail.points_enabled, valueOr(detail.integralSwitch, detail.integral_switch)))))
    var normalizedPointsEnabled = pointsEnabled === true || pointsEnabled === 1 || pointsEnabled === '1'
    var marketingConfig = Object.assign({}, rawMarketingConfig, {
        pointsEnabled: normalizedPointsEnabled,
        points_enabled: normalizedPointsEnabled,
        pointsDeductAmount,
        points_deduct_amount: pointsDeductAmount,
        pointsAmount,
        points_amount: pointsAmount,
        giveIntegral,
        give_integral: giveIntegral
    })
    var activities = (detail.activityList || detail.activity_list || detail.activities || []).map(function(item) {
        var ownerType = item.ownerType || item.owner_type || (item.subsidyEligible || item.subsidy_eligible ? 'PLATFORM' : (item.merchantId || item.merchant_id ? 'MERCHANT' : ''))
        var subsidyEligible = Boolean(item.subsidyEligible || item.subsidy_eligible || ownerType === 'PLATFORM')
        return Object.assign({}, item, {
            ownerType: ownerType,
            owner_type: ownerType,
            subsidyEligible: subsidyEligible,
            subsidy_eligible: subsidyEligible
        })
    })
    var detailImages = parseImageList(detail.detailImages || detail.detail_images || detail.descImages || detail.desc_images || detail.descriptionImages || detail.description_images)
    var content = parseDetailContent(detail.content || detail.goods_detail || detail.detail || detail.detailJson || detail.detail_json || detail.richText || detail.rich_text || detail.description) || imagesToDetailContent(detailImages)
    var freightTemplate = detail.freight_template || detail.freightTemplate || detail.shippingTemplate || detail.shipping_template || {}
    var freightAmount = valueOr(detail.freight_amount, detail.freightAmount)
    freightAmount = valueOr(freightAmount, detail.shippingFee)
    freightAmount = valueOr(freightAmount, detail.shipping_fee)
    freightAmount = valueOr(freightAmount, detail.postage)
    freightAmount = valueOr(freightAmount, freightTemplate.freightAmount)
    freightAmount = valueOr(freightAmount, freightTemplate.freight_amount)
    var freeShipping = valueOr(detail.freeShipping, detail.free_shipping)
    freeShipping = valueOr(freeShipping, detail.isFreeShipping)
    freeShipping = valueOr(freeShipping, detail.is_free_shipping)
    freeShipping = valueOr(freeShipping, detail.postageFree)
    freeShipping = valueOr(freeShipping, detail.postage_free)
    var categoryType = valueOr(detail.categoryType, detail.category_type)
    categoryType = valueOr(categoryType, valueOr(detail.goodsCategoryType, valueOr(detail.goods_category_type, valueOr(detail.productCategoryType, valueOr(detail.product_category_type, 'ONLINE')))))

    return Object.assign({}, detail, {
        id: detail.id || detail.spuId || detail.productId || spuId,
        goods_id: detail.goods_id || detail.spuId || detail.productId || detail.id || spuId,
        spuId: detail.spuId || detail.id || detail.productId || spuId,
        categoryId: detail.categoryId || detail.category_id || '',
        category_id: detail.category_id || detail.categoryId || '',
        categoryType,
        category_type: categoryType,
        shop_id: detail.shop_id || detail.shopId || detail.merchantShopId || detail.merchant_shop_id || shopInfo.shopId || shopInfo.id || '',
        shopId: detail.shopId || detail.shop_id || detail.merchantShopId || detail.merchant_shop_id || shopInfo.shopId || shopInfo.id || '',
        shop_name: detail.shop_name || detail.shopName || detail.storeName || shopInfo.shopName || shopInfo.name || '',
        shopName: detail.shopName || detail.shop_name || detail.storeName || shopInfo.shopName || shopInfo.name || '',
        name: detail.name || detail.spuName || detail.productName || detail.title || '',
        goods_name: detail.goods_name || detail.spuName || detail.productName || detail.title || detail.name || '',
        image: resolveImage(detail.image || detail.mainImageUrl || detail.cover || images[0], 'goods'),
        video: detail.video || '',
        price: firstDefined(detail.price, detail.minPrice, detail.salePrice),
        min_price: firstDefined(detail.min_price, detail.minPrice, detail.salePrice),
        max_price: firstDefined(detail.max_price, detail.maxPrice, detail.salePrice, detail.minPrice),
        market_price: firstDefined(detail.market_price, detail.marketPrice, detail.originPrice, detail.origin_price, detail.originalPrice, detail.original_price, detail.linePrice, detail.maxPrice),
        sales_sum: firstDefined(detail.sales_sum, detail.salesCount, detail.sales_count, detail.virtualSales),
        stock: firstDefined(detail.stock, detail.stockQty, goodsItem.some(function(item) { return item.stock !== undefined && item.stock !== null && item.stock !== '' }) ? goodsItem.reduce(function(sum, item) { return sum + Number(item.stock || 0) }, 0) : ''),
        is_collect: valueOr(detail.is_collect, valueOr(detail.isCollect, valueOr(detail.collected, 0))),
        goods_image: images.length ? images.map(function(image) { return resolveImage(image, 'goods') }) : [resolveImage('', 'goods')],
        coupon_list: coupons,
        couponList: coupons,
        marketingConfig: marketingConfig,
        marketing_config: marketingConfig,
        pointsMarketing: marketingConfig,
        pointsConfig: marketingConfig,
        activityList: activities,
        activity_list: activities,
        order_give_integral: firstDefined(giveIntegral, detail.order_give_integral),
        giveIntegral: firstDefined(giveIntegral, detail.giveIntegral),
        give_integral: firstDefined(giveIntegral, detail.give_integral),
        marketingSourceText: detail.marketingSourceText || detail.marketing_source_text || '',
        marketing_source_text: detail.marketingSourceText || detail.marketing_source_text || '',
        comment: commentSummary,
        commentSummary,
        shop: shopInfo,
        shop_info: shopInfo,
        goods_item: goodsItem,
        sku_list: detail.skuList || detail.sku_list || goodsItem,
        goods_spec: detail.goods_spec || normalizeSpecList(detail.skuList || detail.goods_item || []),
        like: detail.recommendedProducts || detail.like || [],
        activity: detail.groupBuyActivity || detail.activity || {},
        distribution: detail.distribution || {},
        goods_detail: content,
        content,
        highlight: detail.highlight || '',
        after_sale: detail.after_sale || detail.afterSale || '',
        usage_hint: detail.usage_hint || detail.usageHint || '',
        service_tags: detail.service_tags || detail.serviceTags || detail.serviceLabels || detail.service_labels || detail.serviceList || detail.service_list || detail.afterSaleServices || detail.after_sale_services || detail.tags || detail.labels || '',
        freight_type: detail.freight_type || detail.freightType || detail.shippingType || detail.shipping_type || freightTemplate.freightType || freightTemplate.freight_type || (freeShipping ? 'FREE' : ''),
        freight_amount: freightAmount,
        freight_template_id: detail.freight_template_id || detail.freightTemplateId || freightTemplate.templateId || freightTemplate.template_id || freightTemplate.id || '',
        freight_template: freightTemplate,
        delivery_type: detail.delivery_type || detail.deliveryType || detail.shippingMethod || detail.shipping_method || freightTemplate.deliveryType || freightTemplate.delivery_type || '',
        pickup_address: detail.pickup_address || detail.pickupAddress || freightTemplate.pickupAddress || freightTemplate.pickup_address || '',
        freight_desc: detail.freight_desc || detail.freightDesc || detail.shippingDesc || detail.shipping_desc || detail.deliveryDesc || detail.delivery_desc || ''
    })
}

function normalizeCartItem(item = {}) {
    var normalized = normalizeGoodsListItem(item)
    var image = resolveImage(item.img || item.image || item.imageUrl || item.mainImageUrl || item.cover || normalized.image, 'goods')
    var quantity = valueOr(item.goods_num, valueOr(item.quantity, valueOr(item.num, 1)))
    var cartId = item.cart_id || item.cartItemId || item.id
    return Object.assign({}, item, {
        cart_id: cartId,
        cartItemId: item.cartItemId || cartId,
        item_id: item.item_id || item.skuId || item.itemSkuId || item.sku_id,
        sku_id: item.sku_id || item.skuId || item.itemSkuId || item.item_id,
        goods_id: item.goods_id || item.spuId || item.productId || normalized.goods_id,
        name: item.name || item.spuName || item.productName || item.title || normalized.name,
        subtitle: item.subtitle || item.subTitle || item.sellingPoint || item.shortDesc || normalized.subtitle || '',
        img: image,
        image,
        price: firstDefined(item.price, item.salePrice, item.unitPrice, normalized.price),
        market_price: firstDefined(item.market_price, item.marketPrice, item.originPrice, normalized.market_price),
        goods_num: quantity,
        quantity,
        spec_value_str: item.spec_value_str || item.skuName || item.specValue || '',
        item_stock: firstDefined(item.item_stock, item.stockQty, item.stock),
        unit: item.unit || item.unitName || normalized.unit || '',
        weight: item.weight || item.goodsWeight || item.netWeight || '',
        sales_sum: firstDefined(item.sales_sum, item.salesCount, item.sales_count, normalized.sales_sum),
        service_tags: item.service_tags || item.serviceTags || item.tags || normalized.tags || [],
        status_text: item.status_text || item.statusText || item.cartStatusText || '',
        selected: valueOr(item.selected, valueOr(item.checked, 1)),
        cart_status: valueOr(item.cart_status, valueOr(item.cartStatus, 0)),
        shop_id: item.shop_id || item.shopId || normalized.shop_id,
        shop_name: item.shop_name || item.shopName || normalized.shop_name || ''
    })
}

function normalizeCommentItem(item = {}) {
    var user = item.user || item.member || item.customer || item.buyer || {}
    var sku = item.sku || item.goodsSku || item.goods_sku || {}
    var images = parseImageList(item.image || item.images || item.imageUrls || item.image_urls || item.pictures || item.pics || item.commentImages || item.comment_images)
    var appendImages = parseImageList(item.appendImage || item.append_image || item.appendImages || item.append_images || item.additionalImages || item.additional_images)
    var videos = parseImageList(item.video || item.videos || item.videoUrl || item.video_url || item.videoUrls || item.video_urls || item.commentVideo || item.comment_video || item.commentVideos || item.comment_videos)
    var appendVideos = parseImageList(item.appendVideo || item.append_video || item.appendVideos || item.append_videos || item.additionalVideo || item.additional_video || item.additionalVideos || item.additional_videos)
    var tags = parseTextList(item.tags || item.labels || item.commentTags || item.comment_tags || item.impressions || item.keyword || item.keywords)
    var score = normalizeCommentScore(firstDefined(item.goods_comment, item.goodsComment, item.goods_rate, item.goodsRate, item.score, item.star, item.rating, item.productScore, item.product_score, item.description_comment, item.descriptionComment, ''))
    var serviceScore = item.service_comment || item.serviceComment || item.serviceScore || item.service_score || item.serverRate || item.server_rate ? normalizeCommentScore(firstDefined(item.service_comment, item.serviceComment, item.serviceScore, item.service_score, item.serverRate, item.server_rate)) : ''
    var expressScore = item.express_comment || item.expressComment || item.deliveryScore || item.delivery_score || item.logisticsScore || item.logistics_score ? normalizeCommentScore(firstDefined(item.express_comment, item.expressComment, item.deliveryScore, item.delivery_score, item.logisticsScore, item.logistics_score)) : ''
    var descScore = item.description_comment || item.descriptionComment || item.descScore || item.desc_score || item.descriptionScore || item.description_score ? normalizeCommentScore(firstDefined(item.description_comment, item.descriptionComment, item.descScore, item.desc_score, item.descriptionScore, item.description_score)) : ''
    var reply = item.reply || item.merchantReply || item.merchant_reply || item.replyContent || item.reply_content || item.shopReply || item.shop_reply || ''
    var appendComment = item.append_comment || item.appendComment || item.additionalComment || item.additional_comment || item.followComment || item.follow_comment || ''
    var anonymous = firstDefined(item.is_anonymous, item.isAnonymous, item.anonymous, item.anonymousFlag, item.anonymous_flag, 0)
    var isAnonymous = anonymous === true || anonymous === 1 || anonymous === '1' || String(anonymous).toLowerCase() === 'true' || String(anonymous).toUpperCase() === 'Y'
    var nickname = item.nickname || item.userName || item.user_name || item.memberName || item.member_name || user.nickname || user.name || user.userName || ''
    var specText = normalizeCommentSpecText(item.spec_value_str || item.specValueStr || item.skuName || item.sku_name || item.specValue || item.spec_value || sku.skuName || sku.name || '')
    var merchant = item.merchant || item.shop || item.store || {}
    return Object.assign({}, item, {
        id: item.id || item.commentId || item.comment_id || item.reviewId || item.review_id,
        avatar: isAnonymous ? resolveImage('', 'avatar') : resolveImage(item.avatar || item.userAvatar || item.user_avatar || item.headimgurl || user.avatar || user.avatarUrl || user.headimgurl, 'avatar'),
        nickname: isAnonymous ? '匿名用户' : nickname,
        raw_nickname: nickname,
        goods_comment: score,
        goods_rate: score,
        score: score,
        service_comment: serviceScore,
        express_comment: expressScore,
        description_comment: descScore,
        create_time: item.create_time || item.createdAt || item.createTime || item.commentTime || item.comment_time || item.evaluateTime || item.evaluate_time || '',
        spec_value_str: specText,
        goods_name: item.goods_name || item.goodsName || item.productName || item.product_name || '',
        goods_image: resolveImage(item.goods_image || item.goodsImage || item.productImage || item.product_image || item.spuImage || item.spu_image || item.cover || sku.image || sku.imageUrl, 'goods'),
        sku_code: item.sku_code || item.skuCode || sku.skuCode || sku.code || '',
        comment: item.comment || item.content || item.reviewContent || item.review_content || item.evaluateContent || item.evaluate_content || '',
        image: images.map(function(image) { return resolveImage(image, 'goods') }),
        video: videos.map(function(video) { return resolveImage(video, 'common') }),
        tags: tags,
        append_comment: appendComment,
        append_time: item.append_time || item.appendTime || item.additionalTime || item.additional_time || '',
        append_image: appendImages.map(function(image) { return resolveImage(image, 'goods') }),
        append_video: appendVideos.map(function(video) { return resolveImage(video, 'common') }),
        reply: reply,
        reply_time: item.reply_time || item.replyTime || item.merchantReplyTime || item.merchant_reply_time || '',
        reply_user: item.reply_user || item.replyUser || item.replyName || item.reply_name || merchant.name || merchant.shopName || merchant.shop_name || '',
        merchant_name: item.merchant_name || item.merchantName || item.shop_name || item.shopName || item.storeName || merchant.name || merchant.shopName || merchant.shop_name || '',
        like_count: firstDefined(item.like_count, item.likeCount, item.praiseCount, item.praise_count, item.likes, ''),
        browse_count: firstDefined(item.browse_count, item.browseCount, item.viewCount, item.view_count, item.readCount, item.read_count, ''),
        comment_type: item.comment_type || item.commentType || item.type || '',
        type_name: item.type_name || item.typeName || item.commentTypeName || item.comment_type_name || '',
        is_anonymous: isAnonymous ? 1 : 0
    })
}

function normalizeCommentSummary(summary = {}) {
    var first = summary.latestComment || summary.firstComment || (typeof summary.comment === 'object' ? summary.comment : {}) || (summary.list && summary.list[0]) || (summary.items && summary.items[0]) || (summary.rows && summary.rows[0]) || {}
    var normalizedFirst = normalizeCommentItem(first)
    return Object.assign({}, summary, {
        total: summary.total || summary.totalCount || summary.commentCount || summary.count || 0,
        percent: summary.percent || summary.goodRate || summary.good_rate || summary.goodsRate || summary.goods_rate || summary.favorableRate || summary.favorable_rate || '',
        goods_rate: normalizedFirst.goods_rate,
        score: normalizedFirst.score,
        avatar: normalizedFirst.avatar,
        nickname: normalizedFirst.nickname,
        create_time: normalizedFirst.create_time,
        spec_value_str: normalizedFirst.spec_value_str,
        comment: normalizedFirst.comment || (typeof summary.comment === 'string' ? summary.comment : ''),
        image: normalizedFirst.image,
        service_comment: normalizedFirst.service_comment,
        express_comment: normalizedFirst.express_comment,
        description_comment: normalizedFirst.description_comment,
        reply: normalizedFirst.reply,
        reply_time: normalizedFirst.reply_time,
        append_comment: normalizedFirst.append_comment,
        append_time: normalizedFirst.append_time,
        append_image: normalizedFirst.append_image,
        like_count: normalizedFirst.like_count,
        is_anonymous: normalizedFirst.is_anonymous
    })
}

function normalizeCommentPage(data = {}) {
    var list = (data.list || data.records || data.items || data.rows || data.content || []).map(normalizeCommentItem)
    var summary = data.summary || data.commentSummary || data.comment_summary || {}
    var categories = data.comment || data.category || data.categories || data.commentTypes || data.comment_types || []
    var total = firstDefined(data.total, data.totalCount, summary.total, summary.totalCount, list.length, 0)
    if (!Array.isArray(categories)) categories = []
    return Object.assign({}, data, {
        list,
        lists: list,
        more: valueOr(data.hasNext, valueOr(data.more, false)),
        page_no: data.pageNo || data.page_no || 1,
        page_size: data.pageSize || data.page_size || list.length || 10,
        total: total,
        comment: Array.isArray(categories) ? categories : [],
        percent: data.percent || data.goodRate || data.good_rate || summary.percent || summary.goodRate || summary.good_rate || summary.goodsRate || summary.goods_rate || ''
    })
}

function normalizeHomeActivity(item = {}) {
    return Object.assign({}, item, {
        id: item.id || item.activityId || item.activity_id || item.targetId || item.target_id || '',
        title: item.title || item.name || item.activityName || item.activity_name || '',
        name: item.name || item.title || item.activityName || item.activity_name || '',
        desc: item.desc || item.subTitle || item.subtitle || item.summary || item.description || item.activityDesc || item.activity_desc || '',
        cover: resolveImage(item.cover || item.image || item.imageUrl || item.image_url || item.pic || item.picUrl || item.banner, 'goods'),
        image: resolveImage(item.image || item.cover || item.imageUrl || item.image_url || item.pic || item.picUrl || item.banner, 'goods'),
        targetId: item.targetId || item.target_id || item.activityId || item.activity_id || item.id || '',
        url: item.url || item.link || item.jumpUrl || item.jump_url || ''
    })
}

function normalizeHomeData(data = {}) {
    var recommendedProducts = data.recommendedProducts || data.recommendProducts || data.goodsList || data.products || data.productList || data.recommendGoods || data.recommendedGoods || data.goods || []
    var recommendedShops = data.recommendedShops || data.recommendShops || data.shopList || data.shops || data.merchantShops || []
    var hotActivities = data.hotActivities || data.activities || data.activityList || []
    return Object.assign({}, data, {
        navigation_menu: data.navigation_menu || data.quickEntries || [],
        quickEntries: data.quickEntries || data.navigation_menu || [],
        banners: data.banners || [],
        recommendedProducts: (Array.isArray(recommendedProducts) ? recommendedProducts : []).map(normalizeGoodsListItem),
        recommendedShops: (Array.isArray(recommendedShops) ? recommendedShops : []).map(normalizeStreetShop),
        recentVisits: data.recentVisits || [],
        hotActivities: (Array.isArray(hotActivities) ? hotActivities : []).map(normalizeHomeActivity),
        walletCard: data.walletCard || {
            balance: data.balance || 0,
            currency: 'CNY'
        }
    })
}

function normalizeStreetCategory(item = {}) {
    return Object.assign({}, item, {
        id: item.id || item.categoryId || item.recommendId || '',
        categoryId: item.categoryId || item.id || item.recommendId || '',
        name: item.name || item.categoryName || item.title || '',
        image: resolveImage(item.image || item.icon || item.iconUrl || item.cover)
    })
}

function normalizeStreetShop(item = {}) {
    var businessHours = item.businessHours || item.openHours || item.business_hours || item.serviceTime || item.service_time || ''
    var openStatus = inferOpenStatusFromHoursClean(businessHours, item.open_status || item.openStatus || item.status || '')
    return Object.assign({}, item, {
        shopId: item.shopId || item.shop_id || item.merchantShopId || item.merchant_shop_id || item.id || '',
        shopName: item.shopName || item.shop_name || item.storeName || item.name || '',
        shopLogo: resolveImage(item.shop_logo || item.shopLogo || item.logo || item.logoUrl || item.image || item.cover),
        shopScore: valueOr(item.shop_score, valueOr(item.shopScore, valueOr(item.score, valueOr(item.star, '')))),
        detailAddress: item.detail_address || item.detailAddress || item.address || '',
        businessHours,
        business_hours: businessHours,
        openStatus,
        open_status: openStatus
    })
}

function normalizeStreetIndex(data = {}) {
    var categories = (data.recommendedCategories || []).map(normalizeStreetCategory)
    var categoryPages = Array.isArray(data.categoryPages)
        ? data.categoryPages.map(function(page) { return (Array.isArray(page) ? page : []).map(normalizeStreetCategory) })
        : []
    return Object.assign({}, data, {
        searchBox: {
            keyword: (data.searchBox && data.searchBox.keyword) || '',
            placeholder: (data.searchBox && data.searchBox.placeholder) || '搜索商品/店铺'
        },
        recommendedCategories: categories,
        categoryPages: categoryPages.length ? categoryPages : chunkList(categories, Number(data.categoryPageSize || 8)),
        categoryPageSize: Number(data.categoryPageSize || 8),
        recommendedShops: (data.recommendedShops || []).map(normalizeStreetShop)
    })
}

function chunkList(list, pageSize) {
    var size = pageSize > 0 ? pageSize : 8
    var pages = []
    for (var index = 0; index < list.length; index += size) {
        pages.push(list.slice(index, index + size))
    }
    return pages
}

function normalizeShopMediaItem(item = {}) {
    var raw = typeof item === 'string' ? { url: item } : item
    return Object.assign({}, raw, {
        id: raw.id || raw.albumId || raw.videoId || '',
        title: raw.title || raw.name || '',
        url: resolveImage(raw.url || raw.imageUrl || raw.videoUrl || raw.cover || raw.thumbnail || raw.image),
        cover: resolveImage(raw.cover || raw.thumbnail || raw.imageUrl || raw.image || raw.url)
    })
}

function normalizeShopCommentItem(item = {}) {
    var user = item.user || item.member || item.customer || {}
    var score = firstDefined(item.score, item.star, item.rating, item.shopScore, item.serviceScore, '')
    return Object.assign({}, item, {
        id: item.id || item.commentId || item.reviewId || '',
        name: item.name || item.nickname || item.userName || item.memberName || user.nickname || user.name || user.userName || '',
        date: item.date || item.create_time || item.createdAt || item.createTime || item.commentTime || item.evaluateTime || '',
        content: item.content || item.comment || item.reviewContent || item.remark || item.evaluateContent || item.commentContent || '',
        avatar: resolveImage(item.avatar || item.userAvatar || item.headimgurl || user.avatar || user.avatarUrl || user.headimgurl, 'avatar'),
        score: score === null || score === undefined ? '' : score
    })
}

function normalizeShopGroupItem(item = {}) {
    var normalized = normalizeGoodsListItem(item)
    var activity = item.activity || item.groupBuyActivity || item.groupActivity || {}
    var product = item.product || item.spu || item.goods || item.goodsInfo || item.productInfo || item.spuInfo || activity.product || activity.spu || activity.goods || {}
    var goodsId = item.goods_id || item.goodsId || item.spuId || item.productId || item.id || activity.goodsId || activity.spuId
    var price = valueOr(item.groupPrice, valueOr(item.group_price, valueOr(item.groupMinPrice, valueOr(item.group_min_price, valueOr(item.teamPrice, valueOr(item.team_price, valueOr(item.teamMinPrice, valueOr(item.team_min_price, valueOr(item.activityPrice, valueOr(item.activity_price, valueOr(item.salePrice, valueOr(item.sale_price, valueOr(item.minPrice, valueOr(item.min_price, valueOr(item.price, normalized.price)))))))))))))))
    var realName = product.goodsName || product.goods_name || product.spuName || product.spu_name || product.productName || product.product_name || product.name || product.title || item.goodsName || item.goods_name || item.spuName || item.spu_name || item.productName || item.product_name
    var fallbackName = item.name || item.title || item.activityName || item.activity_name || normalized.name || ''
    if (!realName) realName = fallbackName
    return Object.assign({}, normalized, item, {
        id: goodsId || normalized.id,
        goods_id: goodsId || normalized.goods_id,
        spuId: item.spuId || item.productId || goodsId || normalized.spu_id,
        name: realName,
        goods_name: realName,
        image: resolveImage(product.image || product.cover || product.mainImageUrl || product.main_image_url || product.imageUrl || product.image_url || item.image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl || item.thumbnail || normalized.image, 'goods'),
        price,
        groupPrice: price,
        priceText: item.priceText || item.price_text || item.groupPriceText || item.group_price_text || item.groupMinPriceText || item.group_min_price_text || item.teamPriceText || item.team_price_text || item.teamMinPriceText || item.team_min_price_text || item.activityPriceText || item.activity_price_text || item.salePriceText || item.sale_price_text || '',
        marketPrice: item.marketPrice || item.market_price || item.originPrice || item.origin_price || item.originalPrice || item.original_price || normalized.market_price || '',
        marketPriceText: item.marketPriceText || item.market_price_text || item.originPriceText || item.origin_price_text || item.originalPriceText || item.original_price_text || '',
        meta: item.meta || item.subTitle || item.subtitle || item.summary || item.desc || item.description || item.goods_desc || item.goodsDesc || item.activityDesc || item.activity_desc || '',
        tagText: item.tagText || item.tag_text || item.activityTag || item.activity_tag || item.label || item.labelText || '',
        people: item.people || item.peopleNum || item.people_num || item.groupNum || item.group_num || activity.peopleNum || activity.people_num || '',
        joined: firstDefined(item.joined, item.joinedCount, item.join_num, item.joinNum, item.sales_sum, item.salesCount, activity.joinedCount),
        sales_sum: firstDefined(item.sales_sum, item.salesCount, item.sales_count, item.joinedCount, item.joinNum),
        stock: valueOr(item.stock, valueOr(item.stockQty, valueOr(item.stock_quantity, ''))),
        score: item.score || item.shopScore || item.commentScore || item.rating || ''
    })
}

function normalizeShopDetail(data = {}) {
    var detail = data.detail || data.shopDetail || data.storeDetail || data.merchantShop || data.merchantShopDetail || data.shop || data
    var base = detail.shopBase || detail.shop || detail.shopInfo || detail.shop_info || detail.baseInfo || detail.merchantShop || detail
    var groupPayload = detail.groupBuyProducts || detail.groupProducts || detail.group_buy_products || detail.activityProducts || detail.products || detail.productList || detail.goodsList || detail.groupBuyProductList || detail.groupBuyList || detail.groupList || detail.groups || []
    var commentPayload = detail.comments || detail.commentList || detail.reviews || detail.shopComments || detail.evaluations || (detail.commentPage && detail.commentPage.list) || (detail.commentPage && detail.commentPage.records) || (detail.commentPage && detail.commentPage.items) || (detail.commentSummary && detail.commentSummary.list) || []
    var albumPayload = detail.albums || detail.albumList || detail.shopAlbums || detail.images || detail.imageUrls || detail.albumUrls || detail.photos || detail.shopImages || detail.envImages || []
    var videoPayload = detail.videos || detail.videoList || detail.shopVideos || detail.videoUrls || []
    var groupProducts = Array.isArray(groupPayload) ? groupPayload : (groupPayload.list || groupPayload.records || groupPayload.items || groupPayload.rows || [])
    var comments = Array.isArray(commentPayload) ? commentPayload : (commentPayload.list || commentPayload.records || commentPayload.items || commentPayload.rows || [])
    var albums = Array.isArray(albumPayload) ? albumPayload : parseImageList(albumPayload)
    var videos = Array.isArray(videoPayload) ? videoPayload : parseImageList(videoPayload)
    var logo = base.shopLogo || base.shop_logo || base.logo || base.logoUrl || base.avatarUrl || base.image || base.cover || base.mainImageUrl || base.headImage || base.head_image
    var businessHours = base.businessHours || base.openHours || base.business_hours || base.serviceTime || base.service_time || ''
    var openStatus = inferOpenStatusFromHoursClean(businessHours, base.openStatus || base.open_status || base.status || '')
    return Object.assign({}, data, detail, {
        cover: detail.cover || detail.shopCover || detail.shop_cover || detail.bannerImage || detail.banner_image || detail.mainImageUrl || detail.headImage ? resolveImage(detail.cover || detail.shopCover || detail.shop_cover || detail.bannerImage || detail.banner_image || detail.mainImageUrl || detail.headImage, 'goods') : '',
        image: detail.image || detail.cover || detail.mainImageUrl || detail.shopImage ? resolveImage(detail.image || detail.cover || detail.mainImageUrl || detail.shopImage, 'goods') : '',
        detailImage: detail.detailImage || detail.detail_image || detail.detailCover || detail.introduceImage || detail.introImage ? resolveImage(detail.detailImage || detail.detail_image || detail.detailCover || detail.introduceImage || detail.introImage, 'goods') : '',
        shopBase: Object.assign({}, base, {
            shopId: base.shopId || base.id || base.shop_id || detail.shopId || detail.id || detail.shop_id || detail.merchantShopId || detail.merchant_shop_id || '',
            merchantId: base.merchantId || base.merchant_id || detail.merchantId || detail.merchant_id || '',
            ownerUserId: base.ownerUserId || base.owner_user_id || base.userId || base.user_id || detail.ownerUserId || detail.owner_user_id || detail.userId || detail.user_id || detail.promoterUserId || detail.promoter_user_id || '',
            inviteCode: base.inviteCode || base.invite_code || base.promoterCode || base.promoter_code || base.promotionCode || base.promotion_code || detail.inviteCode || detail.invite_code || detail.promoterCode || detail.promoter_code || detail.promotionCode || detail.promotion_code || '',
            shopName: base.shopName || base.shop_name || base.storeName || base.store_name || base.name || detail.shopName || detail.storeName || '',
            shopLogo: resolveImage(logo),
            shopScore: valueOr(base.shopScore, valueOr(base.shop_score, valueOr(base.score, valueOr(base.star, '')))),
            businessHours,
            business_hours: businessHours,
            detailAddress: base.detailAddress || base.address || base.detail_address || base.fullAddress || base.full_address || '',
            latitude: base.latitude || base.lat || base.shopLatitude || base.shop_latitude || '',
            longitude: base.longitude || base.lng || base.shopLongitude || base.shop_longitude || '',
            openStatus,
            open_status: openStatus,
            avatarUrl: resolveImage(base.avatarUrl || logo, 'avatar'),
            contactPhone: base.contactPhone || base.phone || base.mobile || '',
            provinceName: base.provinceName || '',
            cityName: base.cityName || '',
            districtName: base.districtName || ''
        }),
        albums: albums.map(normalizeShopMediaItem).filter(function(item) { return item.url }),
        videos: videos.map(normalizeShopMediaItem).filter(function(item) { return item.url || item.cover }),
        coupons: data.coupons || [],
        groupBuyProducts: groupProducts.filter(Boolean).map(normalizeShopGroupItem),
        comments: comments.map(normalizeShopCommentItem),
        commentTotal: data.commentTotal || data.commentCount || (data.commentSummary && data.commentSummary.total) || comments.length,
        qrcodeInfo: data.qrcodeInfo || data.qrCodeInfo || data.qrcode_info || data.qr_code_info || detail.qrcodeInfo || detail.qrCodeInfo || detail.qrcode_info || detail.qr_code_info || {
            image: detail.qrCode || detail.qr_code || detail.qrcode || detail.qrcodeUrl || detail.qrcode_url || detail.qrCodeUrl || detail.qr_code_url || '',
            url: detail.shareUrl || detail.share_url || detail.pageUrl || detail.page_url || ''
        }
    })
}

function normalizeGoodsList(data = {}) {
    var sourcePayload = Array.isArray(data)
        ? data
        : (data.list || data.items || data.rows || data.records || data.content || data.products || data.productList || [])
    var source = Array.isArray(sourcePayload) ? sourcePayload : []
    var list = source.map(normalizeGoodsListItem)
    return Object.assign({}, !Array.isArray(data) ? data : {}, {
        list,
        more: data.hasNext !== undefined ? data.hasNext : valueOr(data.more, Number(data.total || 0) > Number(data.pageNo || data.page_no || 1) * Number(data.pageSize || data.page_size || list.length || 10)),
        page_no: data.pageNo || data.page_no || 1,
        page_size: data.pageSize || data.page_size || list.length,
        total: data.total || list.length
    })
}

export function getHome(data = {}) {
    var lat = valueOr(data.lat, data.latitude)
    var lng = valueOr(data.lng, data.longitude)
    var params = Object.assign({}, data)
    if (lat !== undefined && lat !== null && lat !== '') params.lat = lat
    else {
        delete params.lat
        delete params.latitude
    }
    if (lng !== undefined && lng !== null && lng !== '') params.lng = lng
    else {
        delete params.lng
        delete params.longitude
    }
    return request.get('miniapp/home/index', {
        params
    }).then(function(res) {
        if (res.code == 1) {
            return Object.assign({}, res, { data: normalizeHomeData(res.data || {}) })
        }
        return res
    }).catch(function() {
        return { code: 1, data: normalizeHomeData({}) }
    })
}

export function getStreetIndex(data = {}) {
    return request.get('miniapp/street/index', { params: { keyword: data.keyword || '' } })
        .then(function(res) { return res.code == 1 ? Object.assign({}, res, { data: normalizeStreetIndex(res.data || {}) }) : res })
        .catch(function() { return { code: 1, data: normalizeStreetIndex({}) } })
}

export function getStreetGoods(data = {}) {
    var params = {
        keyword: data.keyword || '',
        categoryId: data.categoryId || data.category_id,
        categoryName: data.categoryName || data.category_name,
        shopId: data.shopId || data.shop_id,
        sortType: data.sortType || data.sort_type,
        pageNo: data.pageNo || data.page_no || 1,
        pageSize: data.pageSize || data.page_size || 20
    }
    var normalizePayload = function(res) {
        if (res.code != 1) return res
        var payload = res.data || {}
        var list = Array.isArray(payload) ? payload : (payload.list || payload.items || payload.rows || payload.records || payload.products || payload.shops || [])
        return Object.assign({}, res, {
            data: Object.assign({}, !Array.isArray(payload) ? payload : {}, {
                list: list.map(function(item) {
                    var hasGoodsId = item.goods_id || item.goodsId || item.spuId || item.productId
                    if (!hasGoodsId && (item.storeName || item.shopId || item.shop_id) && !item.price && !item.salePrice && !item.minPrice) {
                        return normalizeStreetShop(item)
                    }
                    return normalizeGoodsListItem(item)
                })
            })
        })
    }
    return request.get('miniapp/search/products', { params: params }).then(normalizePayload).catch(function() {
        return request.get('miniapp/street/products', { params: params }).then(normalizePayload).catch(function() {
            return { code: 1, data: { list: [], total: 0, pageNo: params.pageNo, pageSize: params.pageSize, hasNext: false } }
        })
    })
}

export function getShopDetail(data = {}) {
    var shopId = data.shopId || data.shop_id || ''
    if (!shopId) return Promise.resolve({ code: 0, msg: '缺少必要参数：店铺', data: null })
    var params = Object.assign({}, data, { shopId: shopId, shop_id: shopId })
    var endpoints = ['miniapp/shop/' + shopId, 'miniapp/shop/detail', 'miniapp/street/shop/detail', 'miniapp/merchant-shop/detail']
    var requestDetail = function(index) {
        return request.get(endpoints[index], { params: params }).then(function(res) {
            if (res.code == 1) return Object.assign({}, res, { data: normalizeShopDetail(res.data || {}) })
            if (index < endpoints.length - 1) return requestDetail(index + 1)
            return res
        }).catch(function(error) {
            if (index < endpoints.length - 1) return requestDetail(index + 1)
            throw error
        })
    }
    return requestDetail(0)
}

export function getShopGroupBuy(data = {}) {
    var shopId = data.shopId || data.shop_id || ''
    if (!shopId) return Promise.resolve({ code: 0, msg: '缺少必要参数：店铺', data: { list: [] } })
    return request.get('miniapp/shop/' + shopId + '/group-buy', {
        params: { pageNo: data.pageNo || data.page_no || data.page || 1, pageSize: data.pageSize || data.page_size || 10 }
    }).then(function(res) {
        if (res.code != 1) return res
        var payload = res.data || {}
        var list = payload.list || payload.items || payload.records || []
        return Object.assign({}, res, { data: Object.assign({}, payload, { list: list.map(normalizeShopGroupItem), hasNext: payload.hasNext ?? payload.more ?? false, pageNo: payload.pageNo || payload.page_no || 1, pageSize: payload.pageSize || payload.page_size || 10 }) })
    })
}

export function getMenu(data) {
    return getHome().then(function(res) {
        if (res.code != 1) return res
        var list = res.data.navigation_menu || res.data.quickEntries || []
        return Object.assign({}, res, { data: list.filter(function() { return true }) })
    })
}

export function getAdList(data) {
    return getHome(data).then(function(res) {
        if (res.code != 1) return res
        return Object.assign({}, res, { data: res.data.banners || [] })
    })
}

export function getCartList() {
    return request.get('miniapp/cart/items').then(function(res) {
        if (res.code == 1) {
            var payload = res.data || {}
            var list = Array.isArray(payload) ? payload : (payload.list || payload.items || payload.rows || [])
            var lists = list.map(normalizeCartItem)
            return Object.assign({}, res, { data: Object.assign({}, !Array.isArray(payload) ? payload : {}, { list: lists, lists, total_amount: valueOr(payload.total_amount, valueOr(payload.totalAmount, valueOr(payload.payAmount, lists.reduce(function(sum, item) { return sum + Number(item.price || 0) * Number(item.goods_num || 0) }, 0)))), cartCount: valueOr(payload.cartCount, valueOr(payload.count, lists.reduce(function(sum, item) { return sum + Number(item.goods_num || 0) }, 0))) }) })
        }
        if (res.rawCode === 'A0108' || /No static resource|miniapp\/cart\/items/i.test(String(res.msg || res.message || ''))) {
            return { code: 1, data: { list: [], lists: [], total_amount: 0, cartCount: 0 }, show: false }
        }
        return res
    }).catch(function() { return { code: 1, data: { list: [], lists: [], total_amount: 0, cartCount: 0 } } })
}

export function getBestList(data) {
    return getHome(data).then(function(res) { return res.code == 1 ? Object.assign({}, res, { data: res.data.recommendedProducts || [] }) : res })
}

export function getCatrgory() {
    return request.get('miniapp/category/tree').then(function(res) { return res.code == 1 ? Object.assign({}, res, { data: (Array.isArray(res.data) ? res.data : ((res.data && res.data.list) || [])).map(normalizeCategory) }) : res })
        .catch(function() { return { code: 1, data: [] } })
}

export function getGoodsDetail(data) {
    var spuId = data.id || data.spuId
    if (!spuId) return Promise.resolve({ code: 0, msg: '缺少必要参数：商品', data: null })
    return request.get('miniapp/product/' + spuId).then(function(res) { return res.code == 1 && res.data ? Object.assign({}, res, { data: normalizeGoodsDetail(res.data, spuId) }) : res })
        .catch(function() { return { code: 0, msg: '商品详情加载失败', data: null } })
}

export function getGoodsSearch(data = {}) {
    var categoryId = data.category_id || data.categoryId || data.thirdCategoryId || data.third_category_id || data.secondCategoryId || data.second_category_id
    var sortType = data.sortType || data.sort_type
    if (!sortType && data.price) sortType = data.price === 'asc' ? 'PRICE_ASC' : (data.price === 'desc' ? 'PRICE_DESC' : data.price)
    if (!sortType && data.sales_sum) sortType = data.sales_sum === 'asc' ? 'SALES_ASC' : (data.sales_sum === 'desc' ? 'SALES_DESC' : data.sales_sum)
    return request.get('miniapp/search/products', {
        params: {
            keyword: data.keyword,
            categoryId,
            category_id: categoryId,
            thirdCategoryId: data.thirdCategoryId || data.third_category_id || categoryId,
            third_category_id: data.third_category_id || data.thirdCategoryId || categoryId,
            shopId: data.shop_id || data.shopId,
            sortType,
            sort_type: sortType,
            minPrice: data.minPrice || data.min_price,
            min_price: data.min_price || data.minPrice,
            maxPrice: data.maxPrice || data.max_price,
            max_price: data.max_price || data.maxPrice,
            pageNo: data.page_no || data.pageNo,
            page_no: data.page_no || data.pageNo,
            pageSize: data.page_size || data.pageSize
        }
    }).then(function(res) { return res.code == 1 ? Object.assign({}, res, { data: normalizeGoodsList(res.data || {}) }) : res })
        .catch(function() { return { code: 1, data: normalizeGoodsList({ list: [], total: 0, hasNext: false }) } })
}

export function getSearchpage(data) {
    return request.get('miniapp/search/page', { params: data || {} }).then(function(res) {
        if (res.code != 1) return { code: 1, data: { hot_lists: [], history_lists: [] }, show: false }
        var payload = res.data || {}
        return Object.assign({}, res, {
            data: Object.assign({}, payload, {
                hot_lists: payload.hot_lists || payload.hotList || payload.hot || payload.hotKeywords || payload.hot_keywords || [],
                history_lists: payload.history_lists || payload.historyList || payload.history || payload.historyKeywords || payload.history_keywords || []
            })
        })
    }).catch(function() {
        return { code: 1, data: { hot_lists: [], history_lists: [] } }
    })
}

export function clearSearch() {
    return request.delete('miniapp/search/history').then(function(res) {
        return res.code == 1 ? res : request.post('miniapp/search/history/clear', {})
    }).then(function(res) {
        return res.code == 1 ? res : { code: 1, data: [], show: false }
    }).catch(function() {
        return { code: 1, data: [], show: false }
    })
}

export function getCommentList(data) {
    var spuId = data.goods_id || data.spuId || data.productId
    return request.get('miniapp/product/' + spuId + '/comments', { params: { commentType: data.id || data.commentType || data.type, pageNo: data.pageNo || data.page_no || data.page || 1, pageSize: data.pageSize || data.page_size || 10 } })
        .then(function(res) { return res.code == 1 ? Object.assign({}, res, { data: normalizeCommentPage(res.data || {}) }) : res })
        .catch(function() { return { code: 1, data: normalizeCommentPage({ list: [], total: 0 }) } })
}

export function getOrderCommentList(data) {
    return request.get('miniapp/orders', { params: data })
}

export function changeGoodsCount(data) {
    var cartItemId = data.cartItemId || data.cart_id
    if (cartItemId) {
        var payload = { quantity: data.goods_num || data.quantity || data.value }
        if (data.checked !== undefined && data.checked !== null) payload.checked = data.checked
        return request.put('miniapp/cart/items/' + cartItemId, payload)
    }
    return request.post('miniapp/cart/items', { skuId: data.skuId || data.item_id || data.sku_id, quantity: data.goods_num || data.quantity || data.value })
}

export function selectedOpt(data) {
    var cartItemId = data.cartItemId || data.cart_id || data.id
    if (cartItemId) {
        if (Array.isArray(cartItemId)) {
            return Promise.all(cartItemId.map(function(id) { return selectedOpt(Object.assign({}, data, { cart_id: id, cartItemId: id })) })).then(function(results) {
                var failed = results.find(function(item) { return item.code != 1 })
                return failed || { code: 1, data: results }
            })
        }
        var payload = {}
        var quantity = data.goods_num || data.quantity
        var checked = valueOr(data.checked, data.selected)
        if (quantity !== undefined && quantity !== null) payload.quantity = quantity
        if (checked !== undefined && checked !== null) payload.checked = checked
        return request.put('miniapp/cart/items/' + cartItemId, payload)
    }
    return request.post('miniapp/cart/items', data)
}

export function deleteGoods(data) {
    var cartItemId = data.cartItemId || data.cart_id || data.id
    return request.delete('miniapp/cart/items/' + cartItemId)
}

export function changeCartSelect(data) {
    return selectedOpt(data)
}

export function getCommentCategory(id) {
    return request.get('miniapp/product/' + id + '/comments', { params: { pageNo: 1, pageSize: 1 } })
        .then(function(res) { return res.code == 1 ? Object.assign({}, res, { data: normalizeCommentPage(res.data || {}) }) : res })
}

export function addCart(data) {
    return request.post('miniapp/cart/items', { skuId: data.skuId || data.item_id || data.id, quantity: data.quantity || data.goods_num || data.num || 1, checked: data.checked !== undefined ? data.checked : true })
}

export function getCartNum(params) {
    return request.get('miniapp/cart/items', { params }).then(function(res) {
        if (res.code == 1) {
            var payload = res.data || {}
            var list = Array.isArray(payload) ? payload : (payload.list || payload.items || payload.rows || [])
            var count = valueOr(payload.cartCount, valueOr(payload.count, valueOr(payload.num, valueOr(payload.total, list.reduce(function(sum, item) { return sum + Number(item.quantity || item.goods_num || item.num || 0) }, 0)))))
            return Object.assign({}, res, { data: Object.assign({}, !Array.isArray(payload) ? payload : {}, { cartCount: count, count }) })
        }
        if (res.rawCode === 'A0108' || /No static resource|miniapp\/cart\/items/i.test(String(res.msg || res.message || ''))) {
            return { code: 1, data: { cartCount: 0, count: 0 }, show: false }
        }
        return res
    }).catch(function() { return { code: 1, data: { cartCount: 0, count: 0 }, show: false } })
}

export function getHotGoods(data) {
    return getGoodsSearch(data)
}

export function getSeckillTime() {
    return request.get('miniapp/activity/list')
}

export function getSeckillGoods(params) {
    return request.get('miniapp/activity/list', { params })
}
export function getMessageLists() {
    return getMessages({ pageNo: 1, pageSize: 3 }).then(function(res) {
        if (res.code != 1) return res
        var list = res.data.list || []
        return Object.assign({}, res, {
            data: list
        })
    })
}

export function getNoticeLists(params) {
    return getMessages(params)
}

export function getPoster(data) {
    return request.get('miniapp/product/' + (data.id || data.spuId), {
        params: data
    })
}

export function getStoreList(data = {}) {
    var params = Object.assign({}, data, {
        pageNo: data.pageNo || data.page_no || data.page || 1,
        pageSize: data.pageSize || data.page_size || 10,
        keyword: data.keyword || data.name || ''
    })
    var endpoints = [
        'miniapp/selffetch-shops',
        'miniapp/self-fetch/shops',
        'miniapp/pickup/shops',
        'miniapp/shop/list',
        'miniapp/shops'
    ]
    var normalizeStore = function(item) {
        var id = item.id || item.shop_id || item.shopId || item.selffetch_shop_id || item.selffetchShopId || item.storeId || item.store_id
        return Object.assign({}, item, {
            id: id,
            shop_id: item.shop_id || id,
            shopId: item.shopId || id,
            selffetch_shop_id: item.selffetch_shop_id || id,
            selffetchShopId: item.selffetchShopId || id,
            name: item.name || item.shop_name || item.shopName || item.storeName || '',
            shop_address: item.shop_address || item.address || item.detailAddress || item.detail_address || item.poiAddress || item.poiaddress || '',
            business_status: item.business_status ?? item.businessStatus ?? item.openStatus ?? item.status ?? 1,
            business_start_time: item.business_start_time || item.businessStartTime || item.openTime || '',
            business_end_time: item.business_end_time || item.businessEndTime || item.closeTime || '',
            mobile: item.mobile || item.phone || item.telephone || '',
            latitude: item.latitude ?? item.lat ?? '',
            longitude: item.longitude ?? item.lng ?? '',
            distance: item.distance || item.distanceText || item.distance_text || ''
        })
    }
    var normalizeRes = function(res) {
        if (res.code != 1) return res
        var payload = res.data || {}
        var source = Array.isArray(payload) ? payload : (payload.list || payload.lists || payload.records || payload.rows || payload.items || payload.shops || payload.shopList || [])
        var list = Array.isArray(source) ? source.map(normalizeStore) : []
        var pageNo = payload.pageNo || payload.page_no || params.pageNo || 1
        var pageSize = payload.pageSize || payload.page_size || params.pageSize || 10
        var total = payload.total || list.length
        var more = payload.hasNext ?? payload.more ?? (Number(total) > Number(pageNo) * Number(pageSize))
        return Object.assign({}, res, {
            data: Object.assign({}, !Array.isArray(payload) ? payload : {}, {
                list: list,
                lists: list,
                pageNo: pageNo,
                page_no: pageNo,
                pageSize: pageSize,
                page_size: pageSize,
                total: total,
                more: more,
                hasNext: more
            })
        })
    }
    var requestList = function(index) {
        return request.get(endpoints[index], { params: params }).then(function(res) {
            if (res.code == 1) return normalizeRes(res)
            if (index < endpoints.length - 1) return requestList(index + 1)
            return normalizeRes(res)
        }).catch(function(error) {
            if (index < endpoints.length - 1) return requestList(index + 1)
            throw error
        })
    }
    return requestList(0)
}

export function getLiveRoom(data) {
    return getHome().then(function(res) {
        if (res.code != 1) return res
        return Object.assign({}, res, {
            data: res.data.liveRooms || []
        })
    })
}
