import request from '@/utils/request'
import { client } from '@/utils/tools'
import { getMessages } from '@/api/user'
import { resolveImage } from '@/utils/image-placeholder'

function parseSpecJson(specJson) {
    if (!specJson) return []
    if (Array.isArray(specJson)) return specJson
    if (typeof specJson === 'object') return Object.entries(specJson).map(([name, value]) => ({ name, value }))
    try {
        const parsed = JSON.parse(specJson)
        if (Array.isArray(parsed)) return parsed
        if (parsed && typeof parsed === 'object') {
            return Object.entries(parsed).map(([name, value]) => ({ name, value }))
        }
    } catch (e) {}
    return []
}

function parseImageList(value) {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed.filter(Boolean)
        } catch (e) {}
        return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return []
}

function parseDetailContent(value) {
    if (!value) return ''
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed.map((item) => item.text || item.content || item.value || '').filter(Boolean).join('<br/>')
            if (parsed && typeof parsed === 'object') return parsed.html || parsed.content || parsed.text || value
        } catch (e) {}
        return value
    }
    if (Array.isArray(value)) return value.map((item) => item.text || item.content || item.value || '').filter(Boolean).join('<br/>')
    if (typeof value === 'object') return value.html || value.content || value.text || ''
    return ''
}

function normalizeCouponItem(item = {}) {
    const threshold = item.thresholdAmount || item.minAmount || item.useThreshold
    const amount = item.amount || item.discountAmount || item.couponAmount || item.value
    return {
        ...item,
        id: item.id || item.couponId,
        name: item.name || item.couponName || item.title || '优惠券',
        use_condition: item.use_condition || item.useCondition || item.conditionText || (threshold ? `满${threshold}可用` : (amount ? `${amount}元优惠券` : '优惠券')),
        money: amount || item.money || 0
    }
}

function buildSpecValueId(spec, groupName, valueName, fallback) {
    return spec.id || spec.valueId || spec.value_id || `${groupName}-${valueName || fallback}`
}

function normalizeCategory(item = {}) {
    return {
        ...item,
        id: item.id || item.categoryId,
        pid: item.pid ?? item.parentId ?? 0,
        name: item.name || item.categoryName || '',
        image: resolveImage(item.image || item.icon || item.iconUrl || item.imageUrl || item.picUrl),
        icon: resolveImage(item.icon || item.iconUrl || item.image || item.imageUrl || item.picUrl),
        level: item.level || item.categoryLevel || 1,
        sort: item.sort ?? item.sortNo ?? 0,
        status: item.status || item.categoryStatus || '',
        children: (item.children || []).map(normalizeCategory)
    }
}

function normalizeGoodsListItem(item = {}) {
    return {
        ...item,
        id: item.id || item.spuId || item.productId || item.goods_id,
        goods_id: item.goods_id || item.spuId || item.productId || item.id,
        spu_id: item.spu_id || item.spuId || item.productId || item.id,
        name: item.name || item.spuName || item.productName || item.title || item.goods_name,
        goods_name: item.goods_name || item.spuName || item.productName || item.title || item.name,
        image: resolveImage(item.image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl || (item.images && item.images[0]) || (item.goods_image && item.goods_image[0]?.uri), 'goods'),
        goods_image: resolveImage(item.goods_image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl || item.image, 'goods'),
        price: item.price || item.salePrice || item.minPrice || item.payAmount || item.amount || item.market_price || item.min_price || 0,
        market_price: item.market_price || item.marketPrice || item.originPrice || item.maxPrice || item.max_price || item.price || 0,
        origin_price: item.origin_price || item.originPrice || item.market_price || 0,
        shop_id: item.shop_id || item.shopId || item.merchantShopId || '',
        shopId: item.shopId || item.shop_id || item.merchantShopId || '',
        shop_name: item.shop_name || item.shopName || item.storeName || item.shopInfo?.shopName || '',
        shopName: item.shopName || item.shop_name || item.storeName || item.shopInfo?.shopName || '',
        sales_sum: item.sales_sum || item.salesCount || item.sales_count || 0,
        tags: item.tags || []
    }
}

function normalizeSkuItem(item = {}, index = 0) {
    const specs = parseSpecJson(item.specJson || item.spec_json || item.spec)
    const specValueStr = specs.map((spec) => spec.valueName || spec.value || spec.name).filter(Boolean).join(' / ') || item.skuName || '默认'
    const specValueIds = specs.map((spec, specIndex) => {
        const groupName = spec.name || spec.specName || `规格${specIndex + 1}`
        const valueName = spec.valueName || spec.value || spec.name
        return buildSpecValueId(spec, groupName, valueName, `${index}-${specIndex}`)
    }).join(',')
    const image = resolveImage(item.image || item.imageUrl || item.imageUrls?.[0], 'goods')

    return {
        ...item,
        id: item.id || item.skuId,
        item_id: item.item_id || item.skuId || item.id,
        sku_id: item.sku_id || item.skuId || item.id,
        sku_code: item.sku_code || item.skuCode || '',
        name: item.name || item.skuName || specValueStr,
        price: item.price || item.salePrice || 0,
        team_price: item.team_price || item.teamPrice || item.groupPrice || item.salePrice || item.price || 0,
        market_price: item.market_price || item.marketPrice || item.salePrice || 0,
        stock: item.stock ?? item.stockQty ?? item.stockQuantity ?? 0,
        image,
        spec_value_str: item.spec_value_str || specValueStr,
        spec_value: item.spec_value || specValueStr,
        spec_value_ids: item.spec_value_ids || specValueIds || String(item.skuId || item.id || index),
        spec_value_ids_arr: (item.spec_value_ids || specValueIds || String(item.skuId || item.id || index)).split(',')
    }
}

function normalizeSpecList(skuList = []) {
    const groups = []
    skuList.forEach((sku, skuIndex) => {
        parseSpecJson(sku.specJson || sku.spec_json || sku.spec).forEach((spec, specIndex) => {
            const groupName = spec.name || spec.specName || `规格${specIndex + 1}`
            let group = groups.find((item) => item.name === groupName)
            if (!group) {
                group = {
                    id: spec.specId || specIndex + 1,
                    name: groupName,
                    spec_value: []
                }
                groups.push(group)
            }
            const valueName = spec.valueName || spec.value || spec.name
            const valueId = buildSpecValueId(spec, groupName, valueName, `${skuIndex}-${specIndex}`)
            if (valueName && !group.spec_value.some((value) => String(value.id) === String(valueId) || value.value === valueName)) {
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

function normalizeGoodsDetail(detail = {}, spuId) {
    const images = parseImageList(detail.images || detail.imageUrls || detail.albumUrls || detail.goods_image)
    if (!images.length && (detail.mainImageUrl || detail.cover || detail.image)) {
        images.push(detail.mainImageUrl || detail.cover || detail.image)
    }
    const goodsItem = (detail.skuList || detail.goods_item || []).map(normalizeSkuItem)
    if (!goodsItem.length) {
        goodsItem.push(normalizeSkuItem({
            id: detail.defaultSkuId || detail.skuId || detail.id || spuId,
            skuId: detail.defaultSkuId || detail.skuId || detail.id || spuId,
            skuName: '默认',
            salePrice: detail.minPrice || detail.price || 0,
            marketPrice: detail.marketPrice || detail.originPrice || detail.maxPrice || detail.price || 0,
            stockQty: detail.stockQty ?? detail.stock ?? 999,
            imageUrl: detail.mainImageUrl || detail.cover || detail.image || images[0]
        }))
    }
    const shopInfo = detail.shopInfo || detail.shop || detail.shop_info || {}
    const commentSummary = normalizeCommentSummary(detail.commentSummary || detail.comment || {})
    const coupons = (detail.couponList || detail.coupon_list || detail.coupons || []).map(normalizeCouponItem)
    const content = parseDetailContent(detail.content || detail.goods_detail || detail.detail || detail.detailJson || detail.description)

    return {
        ...detail,
        id: detail.id || detail.spuId || detail.productId || spuId,
        goods_id: detail.goods_id || detail.spuId || detail.productId || detail.id || spuId,
        spuId: detail.spuId || detail.id || detail.productId || spuId,
        shop_id: detail.shop_id || detail.shopId || detail.merchantShopId || shopInfo.shopId || shopInfo.id || '',
        shopId: detail.shopId || detail.shop_id || detail.merchantShopId || shopInfo.shopId || shopInfo.id || '',
        shop_name: detail.shop_name || detail.shopName || detail.storeName || shopInfo.shopName || shopInfo.name || '',
        shopName: detail.shopName || detail.shop_name || detail.storeName || shopInfo.shopName || shopInfo.name || '',
        name: detail.name || detail.spuName || detail.productName || detail.title || '',
        goods_name: detail.goods_name || detail.spuName || detail.productName || detail.title || detail.name || '',
        image: resolveImage(detail.image || detail.mainImageUrl || detail.cover || images[0], 'goods'),
        video: detail.video || '',
        price: detail.price || detail.minPrice || detail.salePrice || 0,
        min_price: detail.min_price || detail.minPrice || detail.salePrice || 0,
        max_price: detail.max_price || detail.maxPrice || detail.salePrice || detail.minPrice || 0,
        market_price: detail.market_price || detail.originPrice || detail.maxPrice || 0,
        sales_sum: detail.sales_sum || detail.salesCount || detail.sales_count || detail.virtualSales || 0,
        stock: detail.stock ?? detail.stockQty ?? goodsItem.reduce((sum, item) => sum + Number(item.stock || 0), 0),
        is_collect: detail.is_collect ?? detail.isCollect ?? detail.collected ?? 0,
        goods_image: images.length ? images : [resolveImage('', 'goods')],
        coupon_list: coupons,
        couponList: coupons,
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
        service_tags: detail.service_tags || detail.serviceTags || '',
        freight_type: detail.freight_type || detail.freightType || '',
        freight_amount: detail.freight_amount ?? detail.freightAmount ?? 0,
        freight_template_id: detail.freight_template_id || detail.freightTemplateId || ''
    }
}

function normalizeCartItem(item = {}) {
    const normalized = normalizeGoodsListItem(item)
    const image = resolveImage(item.img || item.image || item.imageUrl || item.mainImageUrl || item.cover || normalized.image, 'goods')
    const quantity = item.goods_num ?? item.quantity ?? item.num ?? 1
    const cartId = item.cart_id || item.cartItemId || item.id
    return {
        ...item,
        cart_id: cartId,
        cartItemId: item.cartItemId || cartId,
        item_id: item.item_id || item.skuId || item.itemSkuId || item.sku_id,
        sku_id: item.sku_id || item.skuId || item.itemSkuId || item.item_id,
        goods_id: item.goods_id || item.spuId || item.productId || normalized.goods_id,
        name: item.name || item.spuName || item.productName || item.title || normalized.name,
        img: image,
        image,
        price: item.price || item.salePrice || item.unitPrice || normalized.price,
        goods_num: quantity,
        quantity,
        spec_value_str: item.spec_value_str || item.skuName || item.specValue || '',
        item_stock: item.item_stock || item.stockQty || item.stock || 0,
        selected: item.selected ?? item.checked ?? 1,
        cart_status: item.cart_status ?? item.cartStatus ?? 0,
        shop_id: item.shop_id || item.shopId || normalized.shop_id,
        shop_name: item.shop_name || item.shopName || normalized.shop_name || '商城自营'
    }
}

function normalizeCommentItem(item = {}) {
    const images = parseImageList(item.image || item.images || item.imageUrls)
    return {
        ...item,
        id: item.id || item.commentId,
        avatar: resolveImage(item.avatar || item.userAvatar || item.headimgurl, 'avatar'),
        nickname: item.nickname || item.userName || item.memberName || '匿名用户',
        goods_comment: item.goods_comment || item.score || item.star || item.rating || 5,
        goods_rate: item.goods_rate || item.score || item.star || item.rating || 5,
        create_time: item.create_time || item.createdAt || item.createTime || '',
        spec_value_str: item.spec_value_str || item.skuName || item.specValue || '',
        comment: item.comment || item.content || '',
        image: images.length ? images : [resolveImage('', 'goods')],
        reply: item.reply || item.merchantReply || item.replyContent || ''
    }
}

function normalizeCommentSummary(summary = {}) {
    const first = summary.latestComment || summary.firstComment || (typeof summary.comment === 'object' ? summary.comment : {}) || summary.list?.[0] || summary.items?.[0] || summary.rows?.[0] || {}
    const normalizedFirst = normalizeCommentItem(first)
    return {
        ...summary,
        total: summary.total || summary.totalCount || summary.commentCount || summary.count || 0,
        goods_rate: normalizedFirst.goods_rate,
        avatar: normalizedFirst.avatar,
        nickname: normalizedFirst.nickname,
        create_time: normalizedFirst.create_time,
        comment: normalizedFirst.comment || (typeof summary.comment === 'string' ? summary.comment : '')
    }
}

function normalizeCommentPage(data = {}) {
    const list = (data.list || data.items || data.rows || []).map(normalizeCommentItem)
    const summary = data.summary || data.commentSummary || {}
    return {
        ...data,
        list,
        lists: list,
        more: data.hasNext ?? data.more ?? false,
        page_no: data.pageNo || data.page_no || 1,
        page_size: data.pageSize || data.page_size || list.length || 10,
        total: data.total || list.length,
        comment: data.comment || [],
        percent: data.percent || summary.goodRate || summary.goodsRate || '100%'
    }
}

function normalizeHomeData(data = {}) {
    return {
        ...data,
        navigation_menu: data.navigation_menu || data.quickEntries || [],
        quickEntries: data.quickEntries || data.navigation_menu || [],
        banners: data.banners || [],
        recommendedProducts: (data.recommendedProducts || []).map(normalizeGoodsListItem),
        recommendedShops: data.recommendedShops || [],
        recentVisits: data.recentVisits || [],
        hotActivities: data.hotActivities || [],
        walletCard: data.walletCard || {
            balance: data.balance || 0,
            currency: 'CNY'
        }
    }
}

function normalizeStreetCategory(item = {}) {
    return {
        ...item,
        id: item.id || item.categoryId || item.recommendId || '',
        categoryId: item.categoryId || item.id || item.recommendId || '',
        name: item.name || item.categoryName || item.title || '',
        image: resolveImage(item.image || item.icon || item.iconUrl || item.cover)
    }
}

function normalizeStreetShop(item = {}) {
    return {
        ...item,
        shopId: item.shopId || item.id || item.shop_id || '',
        shopName: item.shopName || item.shop_name || item.storeName || item.name || '',
        shopLogo: resolveImage(item.shopLogo || item.logo || item.image || item.cover),
        shopScore: item.shopScore ?? item.score ?? item.star ?? '',
        detailAddress: item.detailAddress || item.address || item.detail_address || '',
        openStatus: item.openStatus || item.status || ''
    }
}

function normalizeStreetIndex(data = {}) {
    return {
        ...data,
        searchBox: {
            keyword: data.searchBox?.keyword || '',
            placeholder: data.searchBox?.placeholder || '输入关键词'
        },
        recommendedCategories: (data.recommendedCategories || []).map(normalizeStreetCategory),
        recommendedShops: (data.recommendedShops || []).map(normalizeStreetShop)
    }
}

function normalizeShopMediaItem(item = {}) {
    return {
        ...item,
        id: item.id || item.albumId || item.videoId || '',
        url: resolveImage(item.url || item.imageUrl || item.videoUrl || item.cover || item.thumbnail || item.image),
        cover: resolveImage(item.cover || item.thumbnail || item.imageUrl || item.image || item.url)
    }
}

function normalizeShopCommentItem(item = {}) {
    const user = item.user || item.member || item.customer || {}
    return {
        ...item,
        id: item.id || item.commentId || item.reviewId || '',
        name: item.name || item.nickname || item.userName || item.memberName || user.nickname || user.name || user.userName || '匿名用户',
        date: item.date || item.create_time || item.createdAt || item.createTime || item.commentTime || item.evaluateTime || '',
        content: item.content || item.comment || item.reviewContent || item.remark || item.evaluateContent || item.commentContent || '暂无评价内容',
        avatar: resolveImage(item.avatar || item.userAvatar || item.headimgurl || user.avatar || user.avatarUrl || user.headimgurl, 'avatar'),
        score: item.score || item.star || item.rating || item.shopScore || item.serviceScore || 5
    }
}

function normalizeShopGroupItem(item = {}) {
    const normalized = normalizeGoodsListItem(item)
    const activity = item.activity || item.groupBuyActivity || item.groupActivity || {}
    const goodsId = item.goods_id || item.goodsId || item.spuId || item.productId || item.id || activity.goodsId || activity.spuId
    const price = item.groupPrice || item.group_price || item.teamPrice || item.team_price || item.activityPrice || item.salePrice || item.minPrice || item.price || normalized.price
    return {
        ...normalized,
        ...item,
        id: goodsId || normalized.id,
        goods_id: goodsId || normalized.goods_id,
        spuId: item.spuId || item.productId || goodsId || normalized.spu_id,
        name: item.name || item.goodsName || item.goods_name || item.spuName || item.productName || item.title || normalized.name,
        goods_name: item.goods_name || item.goodsName || item.spuName || item.productName || item.title || normalized.goods_name,
        image: resolveImage(item.image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl || item.thumbnail || normalized.image, 'goods'),
        price,
        groupPrice: price,
        people: item.people || item.peopleNum || item.people_num || item.groupNum || item.group_num || activity.peopleNum || activity.people_num || '',
        joined: item.joined || item.joinedCount || item.join_num || item.joinNum || item.sales_sum || item.salesCount || activity.joinedCount || 0,
        sales_sum: item.sales_sum || item.salesCount || item.sales_count || item.joinedCount || item.joinNum || 0,
        score: item.score || item.shopScore || item.commentScore || item.rating || 5
    }
}

function normalizeShopDetail(data = {}) {
    const base = data.shopBase || data.shop || data.shopInfo || data.shop_info || data.baseInfo || {}
    const groupPayload = data.groupBuyProducts || data.groupProducts || data.group_buy_products || data.activityProducts || data.products || data.groupBuyProductList || data.groupBuyList || data.groupList || data.groups || []
    const commentPayload = data.comments || data.commentList || data.reviews || data.shopComments || data.evaluations || data.commentPage?.list || data.commentPage?.records || data.commentPage?.items || data.commentSummary?.list || []
    const groupProducts = Array.isArray(groupPayload) ? groupPayload : (groupPayload.list || groupPayload.records || groupPayload.items || groupPayload.rows || [])
    const comments = Array.isArray(commentPayload) ? commentPayload : (commentPayload.list || commentPayload.records || commentPayload.items || commentPayload.rows || [])
    return {
        ...data,
        shopBase: {
            ...base,
            shopId: base.shopId || base.id || base.shop_id || '',
            shopName: base.shopName || base.shop_name || base.storeName || base.name || '',
            shopLogo: resolveImage(base.shopLogo || base.logo || base.avatarUrl || base.image),
            shopScore: base.shopScore ?? base.score ?? base.star ?? '',
            businessHours: base.businessHours || base.openHours || base.business_hours || '',
            detailAddress: base.detailAddress || base.address || base.detail_address || '',
            openStatus: base.openStatus || base.status || '',
            avatarUrl: resolveImage(base.avatarUrl || base.shopLogo || base.logo || base.image, 'avatar'),
            contactPhone: base.contactPhone || base.phone || base.mobile || '',
            provinceName: base.provinceName || '',
            cityName: base.cityName || '',
            districtName: base.districtName || ''
        },
        albums: (data.albums || data.albumList || data.shopAlbums || []).map(normalizeShopMediaItem),
        videos: (data.videos || data.videoList || data.shopVideos || []).map(normalizeShopMediaItem),
        coupons: data.coupons || [],
        groupBuyProducts: groupProducts.map(normalizeShopGroupItem),
        comments: comments.map(normalizeShopCommentItem),
        commentTotal: data.commentTotal || data.commentCount || data.commentSummary?.total || comments.length,
        qrcodeInfo: data.qrcodeInfo || {}
    }
}

function normalizeGoodsList(data = {}) {
    const list = (data.list || data.items || data.rows || []).map(normalizeGoodsListItem)
    return {
        ...data,
        list,
        more: data.hasNext !== undefined ? data.hasNext : data.more,
        page_no: data.pageNo || data.page_no || 1,
        page_size: data.pageSize || data.page_size || list.length,
        total: data.total || list.length
    }
}

// 首页聚合
export function getHome(data = {}) {
    const lat = data.lat ?? data.latitude
    const lng = data.lng ?? data.longitude
    return request.get('miniapp/home/index', {
        params: {
            ...data,
            lat: lat !== undefined && lat !== null && lat !== '' ? lat : 23.1291,
            lng: lng !== undefined && lng !== null && lng !== '' ? lng : 113.2644
        }
    }).then((res) => {
        if (res.code == 1) {
            return {
                ...res,
                data: normalizeHomeData(res.data || {})
            }
        }
        return res
    })
}

// 商街首页聚合
export function getStreetIndex(data = {}) {
    return request.get('miniapp/street/index', {
        params: {
            keyword: data.keyword || ''
        }
    }).then((res) => {
        if (res.code == 1) {
            return {
                ...res,
                data: normalizeStreetIndex(res.data || {})
            }
        }
        return res
    })
}

// 店铺详情
export function getShopDetail(data = {}) {
    const shopId = data.shopId || data.shop_id || ''
    if (!shopId) {
        return Promise.resolve({
            code: 0,
            msg: 'shopId is required',
            data: null
        })
    }
    return request.get(`miniapp/shop/${shopId}`, {
        params: data
    }).then((res) => {
        if (res.code == 1) {
            return {
                ...res,
                data: normalizeShopDetail(res.data || {})
            }
        }
        return res
    })
}

// 菜单
export function getMenu(data) {
    return getHome().then((res) => {
        if (res.code != 1) return res
        const list = res.data.navigation_menu || res.data.quickEntries || []
        const filtered = list.filter((item) => {
            if (data?.type === 1) return true
            if (data?.type === 2) return true
            return true
        })
        return {
            ...res,
            data: filtered
        }
    })
}

// 广告位
export function getAdList(data) {
    return getHome().then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            data: res.data.banners || []
        }
    })
}

// 购物车列表
export function getCartList() {
    return request.get('miniapp/cart/items').then((res) => {
        if (res.code == 1) {
            const payload = res.data || {}
            const list = Array.isArray(payload) ? payload : (payload.list || payload.items || payload.rows || [])
            const lists = list.map(normalizeCartItem)
            return {
                ...res,
                data: {
                    ...(!Array.isArray(payload) ? payload : {}),
                    list: lists,
                    lists,
                    total_amount: payload.total_amount ?? payload.totalAmount ?? payload.payAmount ?? lists.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.goods_num || 0), 0),
                    cartCount: payload.cartCount ?? payload.count ?? lists.reduce((sum, item) => sum + Number(item.goods_num || 0), 0)
                }
            }
        }
        return res
    })
}

// 推荐商品
export function getBestList(data) {
    return getHome().then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            data: res.data.recommendedProducts || []
        }
    })
}

// 商品分类
export function getCatrgory() {
    return request.get('miniapp/category/tree').then((res) => {
        if (res.code == 1) {
            return {
                ...res,
                data: (Array.isArray(res.data) ? res.data : (res.data?.list || [])).map(normalizeCategory)
            }
        }
        return res
    })
}

// 商品详情
export function getGoodsDetail(data) {
    const spuId = data.id || data.spuId
    return request.get(`miniapp/product/${spuId}`).then((res) => {
        if (res.code == 1 && res.data) {
            return {
                ...res,
                data: normalizeGoodsDetail(res.data, spuId)
            }
        }
        return res
    })
}

// 商品搜索
export function getGoodsSearch(data = {}) {
    return request.get('miniapp/search/products', {
        params: {
            keyword: data.keyword,
            categoryId: data.category_id || data.categoryId,
            shopId: data.shop_id || data.shopId,
            sortType: data.sortType || data.price || data.sales_sum,
            minPrice: data.minPrice || data.min_price,
            maxPrice: data.maxPrice || data.max_price,
            pageNo: data.page_no || data.pageNo,
            pageSize: data.page_size || data.pageSize
        }
    }).then((res) => res.code == 1 ? { ...res, data: normalizeGoodsList(res.data || {}) } : res)
}

// 搜索页,热门搜索列表,和历史搜索列表
export function getSearchpage(data) {
    return getGoodsSearch(data)
}

// 清空历史搜索
export function clearSearch() {
    return Promise.resolve({ code: 1, data: [] })
}

// 评价列表
export function getCommentList(data) {
    const spuId = data.goods_id || data.spuId || data.productId
    return request.get(`miniapp/product/${spuId}/comments`, {
        params: {
            commentType: data.id || data.commentType || data.type,
            pageNo: data.pageNo || data.page_no || data.page || 1,
            pageSize: data.pageSize || data.page_size || 10
        }
    }).then((res) => res.code == 1 ? { ...res, data: normalizeCommentPage(res.data || {}) } : res)
}

// 获取评价列表
export function getOrderCommentList(data) {
    return request.get('miniapp/orders', { params: data })
}

// 购物车数量更改
export function changeGoodsCount(data) {
    const cartItemId = data.cartItemId || data.cart_id
    if (cartItemId) {
        return request.put(`miniapp/cart/items/${cartItemId}`, {
            quantity: data.goods_num || data.quantity || data.value,
            checked: data.checked
        })
    }
    return request.post('miniapp/cart/items', {
        skuId: data.skuId || data.item_id || data.sku_id,
        quantity: data.goods_num || data.quantity || data.value
    })
}

// 单选/全选/店铺选择
export function selectedOpt(data) {
    const cartItemId = data.cartItemId || data.cart_id || data.id
    if (cartItemId) {
        return request.put(`miniapp/cart/items/${cartItemId}`, {
            quantity: data.goods_num || data.quantity,
            checked: data.checked ?? data.selected
        })
    }
    return request.post('miniapp/cart/items', data)
}

// 删除商品
export function deleteGoods(data) {
    const cartItemId = data.cartItemId || data.cart_id || data.id
    return request.delete(`miniapp/cart/items/${cartItemId}`)
}

// 购物车选中状态
export function changeCartSelect(data) {
    return selectedOpt(data)
}

// 评价分类
export function getCommentCategory(id) {
    return request.get(`miniapp/product/${id}/comments`, {
        params: {
            pageNo: 1,
            pageSize: 1
        }
    }).then((res) => res.code == 1 ? { ...res, data: normalizeCommentPage(res.data || {}) } : res)
}

// 加入购物车
export function addCart(data) {
    return request.post('miniapp/cart/items', {
        skuId: data.skuId || data.item_id || data.id,
        quantity: data.quantity || data.goods_num || data.num || 1,
        checked: data.checked !== undefined ? data.checked : true
    })
}

// 购物车数量
export function getCartNum(params) {
    return request.get('miniapp/cart/items', { params })
}

// 获取商品热搜榜单
export function getHotGoods(data) {
    return getGoodsSearch(data)
}

// 获取秒杀时间段
export function getSeckillTime() {
    return request.get('miniapp/activity/list')
}

// 获取秒杀商品
export function getSeckillGoods(params) {
    return request.get('miniapp/activity/list', {
        params
    })
}

// 消息中心首页
export function getMessageLists() {
    return getMessages({ pageNo: 1, pageSize: 3 }).then((res) => {
        if (res.code != 1) return res
        const list = res.data.list || []
        return {
            ...res,
            data: list
        }
    })
}

// 消息通知
export function getNoticeLists(params) {
    return getMessages(params)
}

// 商品海报
export function getPoster(data) {
    return request.get('miniapp/product/' + (data.id || data.spuId), {
        params: data
    })
}

// 门店自提列表
export function getStoreList(data) {
    return request.get('miniapp/shop/' + (data.shop_id || data.shopId || ''), {
        params: data
    })
}

// 直播列表
export function getLiveRoom(data) {
    return getHome().then((res) => {
        if (res.code != 1) return res
        return {
            ...res,
            data: res.data.liveRooms || []
        }
    })
}
