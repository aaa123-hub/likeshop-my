<template>
    <view class="home-page">
        <view class="home-hero">
            <image class="home-hero__logo" :src="designAssets.homeHeroFigure" mode="aspectFit"></image>
            <navigator class="home-search" hover-class="none" url="/bundle/pages/goods_search/goods_search">
                <text class="home-search__placeholder">搜索商品、品牌、商家</text>
                <view class="home-search__icon">
                    <view class="home-search__icon-circle"></view>
                    <view class="home-search__icon-line"></view>
                </view>
            </navigator>

            <view class="banner-wrap" v-if="bannerList.length">
                <swiper class="banner-swiper" autoplay circular :interval="3000" :duration="300" indicator-dots indicator-color="rgba(255,255,255,.45)" indicator-active-color="#ffffff">
                    <swiper-item v-for="(item, index) in bannerList" :key="index">
                        <image class="banner-image" :src="item.image" mode="aspectFill" @tap="handleBannerTap(item)"></image>
                    </swiper-item>
                </swiper>
            </view>
            <view v-else class="banner-wrap banner-wrap--fallback">
                <image class="banner-image" :src="designAssets.homeHeroBg" mode="aspectFill"></image>
            </view>

            <view class="quick-strip">
                <view v-for="(item, index) in shortcutList" :key="index" class="quick-item" @tap="openShortcut(item)">
                    <image class="quick-image" :src="item.image" mode="aspectFit"></image>
                    <view class="quick-name line1">{{ item.name }}</view>
                </view>
                <view class="quick-item quick-more" @tap="switchTab('/pages/sort/sort')">
                    <image class="quick-image quick-more__icon" :src="designAssets.homeMoreIcon" mode="aspectFit"></image>
                    <view class="quick-name line1">全部</view>
                </view>
            </view>
        </view>

        <view class="home-content">
            <view class="feature-grid">
                <view class="feature-card" @tap="openScan">
                    <view class="feature-card__body">
                        <view class="feature-title">扫一扫</view>
                        <view class="feature-desc">扫商家码或推广码</view>
                    </view>
                    <image class="feature-icon" :src="designAssets.homeNoticeIcon" mode="aspectFit"></image>
                </view>
                <view class="feature-card" @tap="openBusinessPage(businessRoutes.pages.ecoApp)">
                    <view class="feature-card__body">
                        <view class="feature-title">生态应用</view>
                        <view class="feature-desc">更多便民服务</view>
                    </view>
                    <image class="feature-icon" :src="designAssets.homeEcologyIcon" mode="aspectFit"></image>
                </view>
            </view>

            <view class="promoter-card" @tap="goPage('/business/pages/business_pages/promoter_apply')">
                <view class="promoter-card__body">
                    <view class="promoter-card__title">角色申请</view>
                    <view class="promoter-card__desc">完成实名后，可申请推广者、代理等角色</view>
                </view>
                <view class="promoter-card__action">申请角色</view>
            </view>

            <view class="home-panel home-shop-panel">
                <view class="panel-head">
                    <view class="panel-title">精选商家</view>
                    <view class="panel-more" @tap="switchTab('/pages/street/street')">
                        <text>更多</text>
                        <view class="panel-more__arrow"></view>
                    </view>
                </view>
                <view v-if="featuredShopList.length" class="featured-shop-row">
                    <view v-for="(item, index) in featuredShopList" :key="index" class="featured-shop-card" @tap="handleShopTap(item)">
                        <view v-if="isEmptyImage(getShopImage(item))" class="featured-shop-image image-placeholder">无</view>
                        <image v-else class="featured-shop-image" :src="displayImage(getShopImage(item))" mode="aspectFill"></image>
                        <view class="featured-shop-name line1">{{ item.shopName || item.name || '' }}</view>
                        <view class="featured-shop-meta">
                            <text v-if="item.shopScore || item.score">{{ item.shopScore || item.score }}分</text>
                            <text v-if="(item.shopScore || item.score) && (item.categoryName || item.category_name)" class="featured-shop-divider"></text>
                            <text v-if="item.categoryName || item.category_name">{{ item.categoryName || item.category_name }}</text>
                            <text v-if="item.distanceText || item.distance">{{ item.distanceText || item.distance }}</text>
                        </view>
                    </view>
                </view>
                <view v-else class="featured-shop-empty">暂无推荐商家</view>
            </view>

            <view v-if="recentVisitList.length" class="recent-visit-panel">
                <view class="recent-visit-head">
                    <view class="recent-visit-title">最近访问</view>
                    <view class="recent-visit-more" @tap="goPage('/business/pages/business_pages/recent_visits')">
                        <text>查看全部</text>
                        <view class="recent-visit-more__icon"></view>
                    </view>
                </view>
                <scroll-view scroll-x="true" show-scrollbar="false" class="recent-shop-scroll">
                    <view class="recent-shop-list">
                        <view v-for="(item, index) in recentVisitList" :key="index" class="recent-shop-card" @tap="handleVisitTap(item)">
                            <view v-if="isEmptyImage(item.image || item.cover)" class="recent-shop-card__image image-placeholder">无</view>
                            <image v-else class="recent-shop-card__image" :src="displayImage(item.image || item.cover)" mode="aspectFill"></image>
                            <view class="recent-shop-card__name line1">{{ formatRecentVisitName(item) }}</view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <view class="home-panel home-recommend-panel" v-if="homeRecommendDisplayList.length">
                <view class="panel-head">
                    <view class="panel-title">为你推荐</view>
                    <view class="panel-more" @tap="switchTab('/pages/sort/sort')">
                        <text>更多</text>
                        <view class="panel-more__arrow"></view>
                    </view>
                </view>
                <view class="recommend-grid">
                    <navigator v-for="(item, index) in homeRecommendDisplayList" :key="index" class="recommend-card" hover-class="none" :url="homeRecommendUrl(item)">
                        <view v-if="isEmptyImage(item.image || item.goods_image)" class="recommend-image image-placeholder">无</view>
                        <image v-else class="recommend-image" :src="displayImage(item.image || item.goods_image, 'goods')" mode="aspectFill"></image>
                        <view class="recommend-name line1">{{ item.name || item.goods_name || '' }}</view>
                        <view v-if="hasPrice(item.price)" class="recommend-price">¥{{ formatPrice(item.price) }}</view>
                    </navigator>
                </view>
            </view>

            <view class="section-title" v-if="hotActivityList.length">热门活动</view>
            <view v-if="hotActivityList.length" class="activity-list">
                <view v-for="(item, index) in hotActivityList" :key="index" class="activity-card" @tap="handleActivityTap(item)">
                    <view class="activity-card__title line1">{{ item.title || item.name || '' }}</view>
                    <view v-if="item.desc || item.subTitle" class="activity-card__desc line2">{{ item.desc || item.subTitle }}</view>
                    <view v-if="isEmptyImage(item.cover)" class="activity-card__image image-placeholder">无</view>
                    <image v-else class="activity-card__image" :src="displayImage(item.cover)" mode="aspectFill"></image>
                </view>
            </view>

            <view class="section-title" v-if="recommendedProductList.length > 6">更多推荐</view>
            <view v-if="recommendedProductList.length > 6" class="goods-grid">
                <navigator v-for="(item, index) in recommendedProductList.slice(6)" :key="index" class="goods-card" hover-class="none" :url="homeRecommendUrl(item)">
                    <view v-if="isEmptyImage(item.image || item.goods_image)" class="goods-card__image image-placeholder">无</view>
                    <image v-else class="goods-card__image" :src="displayImage(item.image || item.goods_image, 'goods')" mode="aspectFill"></image>
                    <view class="goods-card__name line2">{{ item.name || item.goods_name || '' }}</view>
                    <view v-if="item.subtitle || item.category_name" class="goods-card__desc line1">{{ item.subtitle || item.category_name }}</view>
                    <view v-if="formatGoodsTags(item).length" class="goods-card__tags">
                        <text v-for="tag in formatGoodsTags(item)" :key="tag" class="goods-card__tag line1">{{ tag }}</text>
                    </view>
                    <view class="goods-card__bottom">
                        <view v-if="hasPrice(item.price)" class="goods-card__price">￥{{ formatPrice(item.price) }}</view>
                        <view v-if="shouldShowMarketPrice(item)" class="goods-card__market">￥{{ formatPrice(item.market_price) }}</view>
                    </view>
                    <view class="goods-card__meta">
                        <text v-if="item.sales_sum">已售{{ item.sales_sum }}</text>
                        <text v-if="item.score">{{ item.score }}分</text>
                    </view>
                    <view v-if="item.shopName || item.shop_name" class="goods-card__shop line1">{{ item.shopName || item.shop_name }}</view>
                </navigator>
            </view>

            <view class="section-title" v-if="recommendedShopList.length">推荐门店</view>
            <view v-if="recommendedShopList.length" class="shop-list">
                <view v-for="(item, index) in recommendedShopList" :key="index" class="shop-card" @tap="handleShopTap(item)">
                    <view v-if="isEmptyImage(getShopImage(item))" class="shop-card__logo image-placeholder">无</view>
                    <image v-else class="shop-card__logo" :src="displayImage(getShopImage(item))" mode="aspectFill"></image>
                    <view class="shop-card__body">
                        <view class="shop-card__name line1">{{ item.shopName || item.name || '' }}</view>
                        <view v-if="item.detailAddress || item.address" class="shop-card__address line2">{{ item.detailAddress || item.address }}</view>
                    </view>
                    <view class="shop-card__meta">
                        <view class="shop-card__status">{{ shopOpenStatusText(item) }}</view>
                        <view v-if="item.shopScore" class="shop-card__score">{{ item.shopScore }}分</view>
                    </view>
                </view>
            </view>

            <view class="identity-title">请选择您的身份</view>
            <view class="identity-card identity-card--seller" @tap="goPage('/bundle_user/pages/license/license')">
                <view>
                    <view class="identity-card__title">卖货</view>
                    <view class="identity-card__desc">我是来卖货的</view>
                </view>
                <image class="identity-illustration" :src="designAssets.homeSellerIllustration" mode="aspectFit"></image>
            </view>
            <view class="identity-card identity-card--buyer" @tap="switchTab('/pages/sort/sort')">
                <view>
                    <view class="identity-card__title">购物</view>
                    <view class="identity-card__desc">我是来购买商品的</view>
                </view>
                <image class="identity-illustration" :src="designAssets.homeBuyerIllustration" mode="aspectFit"></image>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { getHome } from '@/api/store'
import { getRecentVisitShops } from '@/api/app'
import { businessRoutes, openBusinessRoute } from '@/utils/business-routes'
import { designAssets } from '@/utils/design-assets'
import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder'
import { guardRoute } from '@/utils/feature-flags'
import { inputInviteCode } from '@/api/user'

const homeShortcutFallbackImages = {
    CATEGORY: 'https://shengyuan.store/api/miniapp/files/miniapp/7f63a1c5a2ee4078b3148915403d074f/home-shortcut-category.png',
    ORDER: 'https://shengyuan.store/api/miniapp/files/miniapp/3cd070ca256d411fb824001454a5eb97/home-shortcut-order.png',
    MESSAGE: 'https://shengyuan.store/api/miniapp/files/miniapp/a90fd6a6345f48dd9d6a0771c5ff6127/home-shortcut-message.png',
    ACTIVITY: 'https://shengyuan.store/api/miniapp/files/miniapp/be7a73d9cccc41f29bede6d23e1c5a36/home-shortcut-activity.png',
    WALLET: 'https://shengyuan.store/api/miniapp/files/miniapp/33f3be5718014c6b957a62c7f0c91f14/home-shortcut-wallet.png'
}

const homeShortcutRoutes = {
    CATEGORY: { name: '分类', url: '/pages/sort/sort', type: 'switchTab' },
    ORDER: { name: '订单', url: '/bundle_order/pages/user_order/user_order' },
    MESSAGE: { name: '消息', url: '/bundle_misc/pages/notice/notice' },
    ACTIVITY: { name: '活动', url: '/business/pages/business_pages/activity_center' },
    WALLET: { name: '钱包', url: '/bundle_finance/pages/user_wallet/user_wallet' }
}

const homeShortcutAliases = {
    分类: 'CATEGORY',
    订单: 'ORDER',
    消息: 'MESSAGE',
    活动: 'ACTIVITY',
    钱包: 'WALLET'
}

export default {
    data() {
        return {
            homeData: {},
            designAssets,
            businessRoutes,
            recentVisitFallback: [],
            homeRecentVisitList: [],
            homeLoading: false,
            didShowOnce: false,
            homeLoaded: false
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        userName() {
            return this.userInfo.nickname || this.userInfo.user_name || this.userInfo.mobile || '朋友'
        },
        quickEntryList() {
            const source = this.homeData.quickEntries || []
            const list = source.map((item) => this.normalizeQuickEntry(item)).filter(Boolean)
            return list.length ? list : this.homeShortcutFallback
        },
        bannerList() {
            return (this.homeData.banners || []).map((item, index) => ({
                ...item,
                image: resolveImage(item.image || item.imageUrl || item.cover || item.pic || item.banner),
                url: item.url || item.link || item.jumpUrl || '',
                type: item.type || item.linkType || item.jumpType || '',
                title: item.title || item.name || `banner-${index}`,
                hasImage: !!(item.image || item.imageUrl || item.cover || item.pic || item.banner)
            })).filter(item => item.hasImage)
        },
        shortcutList() {
            return this.quickEntryList.slice(0, 5)
        },
        featuredShopList() {
            const shops = this.recommendedShopList.length ? this.recommendedShopList : this.recentVisitList
            return shops.slice(0, 3)
        },
        recentVisitList() {
            const normalizeList = list => (Array.isArray(list) ? list : []).filter(item => {
                const name = item && (item.name || item.shopName || item.shop_name || item.storeName)
                const id = item && (item.shopId || item.shop_id || item.merchantShopId || item.merchant_shop_id || item.id)
                return name || id
            })
            const apiList = normalizeList(this.homeRecentVisitList)
            if (apiList.length) return apiList
            const homeRecentVisits = this.homeData.recentVisits || []
            const homeList = normalizeList(homeRecentVisits)
            return homeList.length ? homeList : this.recentVisitFallback
        },
        hotActivityList() {
            return this.homeData.hotActivities || this.homeData.activities || this.homeData.activityList || []
        },
        recommendedProductList() {
            return this.homeData.recommendedProducts || []
        },
        homeRecommendDisplayList() {
            return this.recommendedProductList.slice(0, 6)
        },
        recommendedShopList() {
            return this.homeData.recommendedShops || []
        },
        homeShortcutFallback() {
            return [
                { ...homeShortcutRoutes.CATEGORY, image: homeShortcutFallbackImages.CATEGORY },
                { ...homeShortcutRoutes.ORDER, image: homeShortcutFallbackImages.ORDER },
                { ...homeShortcutRoutes.MESSAGE, image: homeShortcutFallbackImages.MESSAGE },
                { ...homeShortcutRoutes.ACTIVITY, image: homeShortcutFallbackImages.ACTIVITY },
                { ...homeShortcutRoutes.WALLET, image: homeShortcutFallbackImages.WALLET }
            ]
        }
    },
    onLoad(options = {}) {
        this.handleLaunchScanOptions(options)
        this.getHomeFun()
    },
    onShow() {
        if (!this.didShowOnce) {
            this.didShowOnce = true
            return
        }
        if (this.homeLoaded) {
            this.getHomeFun()
        }
    },
    onPullDownRefresh() {
        this.getHomeFun().finally(() => uni.stopPullDownRefresh())
    },
    methods: {
        shopOpenStatusText(item = {}) {
            const status = String(item.openStatus || item.open_status || '').toUpperCase()
            if (status === 'OPEN') return '营业中'
            if (status === 'REST') return '休息中'
            return '未营业'
        },
        handleLaunchScanOptions(options = {}) {
            const raw = options.q || options.scene || ''
            if (!raw) return
            const decoded = decodeURIComponent(String(raw))
            const route = this.resolveMerchantScanRoute(decoded)
            if (route) {
                setTimeout(() => this.goPage(route), 80)
            }
        },
        async getHomeFun() {
            if (this.homeLoading) return Promise.resolve()
            this.homeLoading = true
            try {
                const [res, recentVisitRes] = await Promise.all([
                    getHome(this.buildHomeParams()),
                    getRecentVisitShops({ pageNo: 1, pageSize: 12 })
                ])
                if (res.code == 1) {
                    this.homeData = res.data || {}
                    this.homeLoaded = true
                }
                if (recentVisitRes.code == 1) {
                    this.homeRecentVisitList = recentVisitRes.data || []
                }
            } catch (error) {}
            finally {
                this.homeLoading = false
            }
        },
        resolveImage,
        isEmptyImage(src) { return isPlaceholderImage(src) },
        displayImage(src, type = 'common') { return resolveImage(src, type) },
        formatPrice(value) {
            const price = Number(value || 0)
            return price.toFixed(price % 1 === 0 ? 0 : 2)
        },
        hasPrice(value) {
            return value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value))
        },
        shouldShowMarketPrice(item = {}) {
            return this.hasPrice(item.price) && this.hasPrice(item.market_price) && Number(item.market_price) > Number(item.price)
        },
        homeRecommendUrl(item = {}) {
            const goodsId = item.id || item.goods_id
            return goodsId ? `/bundle/pages/goods_details/goods_details?id=${goodsId}` : '/pages/sort/sort'
        },
        formatGoodsTags(item = {}) {
            const tags = Array.isArray(item.tags) ? item.tags : []
            return tags.map(tag => typeof tag === 'string' ? tag : (tag.name || tag.title || tag.label || '')).filter(Boolean).slice(0, 2)
        },
        formatRecentVisitName(item = {}) {
            const name = String(item.name || item.shopName || '')
            const chars = Array.from(name)
            return chars.length > 4 ? `${chars.slice(0, 4).join('')}...` : name
        },
        getShopImage(item = {}) {
            return item.shopLogo || item.logo || item.logoUrl || item.image || item.cover || item.avatarUrl || item.shopImage || item.shopPic || ''
        },
        buildHomeParams() {
            const lat = this.userInfo.lat ?? this.userInfo.latitude
            const lng = this.userInfo.lng ?? this.userInfo.longitude
            const params = {
                pageScene: 'HOME',
                userRole: this.userInfo.userRole || this.userInfo.user_role || this.userInfo.role || 'USER'
            }
            if (lat !== undefined && lat !== null && lat !== '') params.lat = lat
            if (lng !== undefined && lng !== null && lng !== '') params.lng = lng
            return params
        },
        openScan() {
            uni.scanCode({
                onlyFromCamera: false,
                success: async (res) => {
                    const result = res.result || res.path || ''
                    const route = this.resolveMerchantScanRoute(result)
                    if (route) {
                        this.goPage(route)
                        return
                    }
                    const promotionPayload = this.resolvePromotionScanPayload(result)
                    if (promotionPayload.inviteCode || promotionPayload.ownerUserId || promotionPayload.promoterUserId) {
                        const bindRes = await inputInviteCode(promotionPayload).catch(() => null)
                        uni.showToast({
                            title: bindRes && bindRes.code == 1 ? (bindRes.msg || '吸粉成功') : ((bindRes && (bindRes.msg || bindRes.message)) || '吸粉失败'),
                            icon: bindRes && bindRes.code == 1 ? 'success' : 'none'
                        })
                        return
                    }
                    uni.showToast({ title: result ? '未识别到商家码或推广码' : '未识别到内容', icon: 'none' })
                },
                fail: () => uni.showToast({ title: '扫一扫未完成', icon: 'none' })
            })
        },
        resolveMerchantScanRoute(raw = '') {
            const text = String(raw || '').trim()
            if (!text) return ''
            if (/^\/business\/pages\/business_pages\/store_detail/i.test(text)) return text
            if (/^business\/pages\/business_pages\/store_detail/i.test(text)) return `/${text}`
            const params = this.scanParamsFromText(text)
            const shopId = this.firstScanValue(params, ['shopId', 'shop_id', 'merchantShopId', 'merchant_shop_id', 'storeId', 'store_id', 'merchantId', 'merchant_id'])
            if (shopId) return `/business/pages/business_pages/store_detail?shopId=${encodeURIComponent(shopId)}`
            const scene = this.firstScanValue(params, ['scene', 'qrScene', 'qr_scene'])
            if (scene) {
                const sceneParams = this.scanParamsFromText(decodeURIComponent(scene))
                const sceneShopId = this.firstScanValue(sceneParams, ['shopId', 'shop_id', 'merchantShopId', 'merchant_shop_id', 'storeId', 'store_id', 'merchantId', 'merchant_id'])
                if (sceneShopId) return `/business/pages/business_pages/store_detail?shopId=${encodeURIComponent(sceneShopId)}`
            }
            if (/^\d+$/.test(text)) return `/business/pages/business_pages/store_detail?shopId=${encodeURIComponent(text)}`
            return ''
        },
        resolvePromotionScanPayload(raw = '') {
            const text = String(raw || '').trim()
            if (!text) return {}
            const jsonPayload = this.tryParsePromotionJson(text)
            if (jsonPayload) return this.buildPromotionBindPayload(jsonPayload, text)
            const params = this.scanParamsFromText(text)
            const scene = this.firstScanValue(params, ['scene', 'qrScene', 'qr_scene'])
            const sceneParams = scene ? this.scanParamsFromText(decodeURIComponent(scene)) : {}
            const shortScene = this.parseShortPromotionScene(scene ? decodeURIComponent(scene) : text)
            const inviteCode = this.firstScanValue(params, ['inviteCode', 'invite_code', 'promoterCode', 'promoter_code', 'promotionCode', 'promotion_code', 'code']) ||
                this.firstScanValue(sceneParams, ['inviteCode', 'invite_code', 'promoterCode', 'promoter_code', 'promotionCode', 'promotion_code', 'code']) ||
                shortScene.inviteCode
            const ownerUserId = this.firstScanValue(params, ['ownerUserId', 'owner_user_id', 'promoterUserId', 'promoter_user_id', 'inviterUserId', 'inviter_user_id', 'uid']) ||
                this.firstScanValue(sceneParams, ['ownerUserId', 'owner_user_id', 'promoterUserId', 'promoter_user_id', 'inviterUserId', 'inviter_user_id', 'uid']) ||
                shortScene.ownerUserId
            const roleCode = this.firstScanValue(params, ['roleCode', 'role_code', 'role', 'roleType', 'role_type']) ||
                this.firstScanValue(sceneParams, ['roleCode', 'role_code', 'role', 'roleType', 'role_type']) ||
                shortScene.roleCode
            if (!inviteCode && !ownerUserId) return {}
            return this.buildPromotionBindPayload({
                inviteCode,
                ownerUserId,
                promoterUserId: ownerUserId,
                roleCode: roleCode || 'PROMOTER',
                scene: 'PROMOTION_QR'
            }, text)
        },
        tryParsePromotionJson(text = '') {
            try {
                const data = JSON.parse(text)
                const scene = String(data.type || data.scene || data.fanScene || data.fan_scene || '').toUpperCase()
                if (!scene.includes('PROMOTION')) return null
                return data
            } catch (error) {
                return null
            }
        },
        buildPromotionBindPayload(source = {}, rawScene = '') {
            const inviteCode = source.inviteCode || source.invite_code || source.promoterCode || source.promoter_code || source.promotionCode || source.promotion_code || source.code || ''
            const ownerUserId = source.ownerUserId || source.owner_user_id || source.promoterUserId || source.promoter_user_id || source.inviterUserId || source.inviter_user_id || source.uid || ''
            const userId = this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
            return {
                userId,
                fanUserId: userId,
                inviteCode,
                invite_code: inviteCode,
                promoterUserId: ownerUserId,
                promoter_user_id: ownerUserId,
                ownerUserId,
                owner_user_id: ownerUserId,
                roleCode: source.roleCode || source.role_code || 'PROMOTER',
                scene: source.scene || 'PROMOTION_QR',
                rawScene,
                fanScene: 'PROMOTION_QR'
            }
        },
        parseShortPromotionScene(scene = '') {
            const match = String(scene || '').match(/^u([^_]+)_r([^_]+)_i(.+)$/)
            if (!match) return {}
            const roleMap = { M: 'MERCHANT', P: 'PROMOTER', A: 'AGENT', S: 'SUBSIDIARY', H: 'HQ' }
            const shortRole = String(match[2] || '').toUpperCase()
            return {
                ownerUserId: match[1],
                roleCode: roleMap[shortRole] || match[2] || '',
                inviteCode: match[3] || ''
            }
        },
        scanParamsFromText(text = '') {
            const params = {}
            const appendParams = (query = '') => {
                String(query || '').split(/[&;]/).forEach((pair) => {
                    if (!pair) return
                    const index = pair.indexOf('=')
                    if (index === -1) {
                        params[pair] = params[pair] || ''
                        return
                    }
                    const key = pair.slice(0, index)
                    const value = pair.slice(index + 1)
                    if (key) params[key] = value
                })
            }
            const normalized = String(text || '').trim()
            const queryIndex = normalized.indexOf('?')
            if (queryIndex !== -1) appendParams(normalized.slice(queryIndex + 1))
            else appendParams(normalized)
            try {
                const url = new URL(normalized)
                appendParams(url.search ? url.search.slice(1) : '')
                const pathMatch = url.pathname.match(/(?:shop|store|merchant)[/_-]?(\d+)/i)
                if (pathMatch && !params.shopId) params.shopId = pathMatch[1]
            } catch (error) {}
            const compactMatch = normalized.match(/(?:shopId|shop_id|merchantShopId|merchant_shop_id|storeId|store_id|merchantId|merchant_id)[:=]([^&?#;/]+)/i)
            if (compactMatch && !params.shopId) params.shopId = compactMatch[1]
            return params
        },
        firstScanValue(source = {}, keys = []) {
            for (const key of keys) {
                const value = source[key]
                if (value !== undefined && value !== null && value !== '') return decodeURIComponent(String(value))
            }
            return ''
        },
        normalizeQuickEntry(item = {}) {
            const code = String(item.code || '').toUpperCase()
            const title = item.title || item.name || ''
            const shortcutKey = homeShortcutRoutes[code] ? code : homeShortcutAliases[title]
            const entryUrl = item.entryUrl || item.pagePath || item.url || item.linkUrl || ''
            if (shortcutKey) {
                return {
                    ...homeShortcutRoutes[shortcutKey],
                    name: title || homeShortcutRoutes[shortcutKey].name,
                    image: resolveImage(item.iconUrl || item.icon || item.image || homeShortcutFallbackImages[shortcutKey] || ''),
                    url: entryUrl || homeShortcutRoutes[shortcutKey].url,
                    type: item.openType || item.open_type || item.type || homeShortcutRoutes[shortcutKey].type
                }
            }
            return {
                name: item.title || item.code || '入口',
                image: resolveImage(item.iconUrl || item.icon || item.image || ''),
                url: entryUrl,
                type: item.openType || item.open_type || item.type || ''
            }
        },
        goPage(url) {
            if (!guardRoute(url)) return
            uni.navigateTo({ url, fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' }) })
        },
        switchTab(url) { uni.switchTab({ url }) },
        openBusinessPage(item) { openBusinessRoute(item) },
        handleBannerTap(item) {
            if (item.url) {
                const openType = item.openType || item.open_type || item.type
                if (openType === 'switchTab') this.switchTab(item.url)
                else this.goPage(item.url)
                return
            }
            if (item.scene && businessRoutes.pages[item.scene]) openBusinessRoute(businessRoutes.pages[item.scene])
        },
        handleVisitTap(item) {
            const shopId = item.shopId || item.shop_id || item.targetId || item.target_id || ''
            if (shopId && ((item.visitType || item.targetType || '').toUpperCase() === 'SHOP' || item.shopId || item.shop_id)) {
                this.goPage(`/business/pages/business_pages/store_detail?shopId=${shopId}`)
                return
            }
            if (item.targetId) this.goPage(`/bundle/pages/goods_details/goods_details?id=${item.targetId}`)
        },
        handleActivityTap(item) {
            if (item.targetId) {
                this.goPage(`/activity/pages/activity_detail/activity_detail?id=${item.targetId}`)
                return
            }
            this.openBusinessPage(businessRoutes.pages.activityCenter)
        },
        handleShopTap(item) {
            const shopId = item.shopId || item.shop_id || item.merchantShopId || item.merchant_shop_id || item.id || ''
            this.goPage(shopId ? `/business/pages/business_pages/store_detail?shopId=${shopId}` : '/business/pages/business_pages/store_detail')
        },
        openShortcut(item) {
            const code = String(item.code || '').toUpperCase()
            const shortcutKey = homeShortcutRoutes[code] ? code : homeShortcutAliases[item.name]
            const defaultTarget = shortcutKey ? homeShortcutRoutes[shortcutKey] : {}
            const target = {
                ...defaultTarget,
                ...item,
                type: item.type || item.openType || item.open_type || defaultTarget.type
            }
            if (!target.url) return
            if (/^https?:\/\//i.test(target.url)) {
                uni.setClipboardData({ data: target.url })
                uni.showToast({ title: '链接已复制', icon: 'none' })
                return
            }
            if (target.type === 'switchTab') this.switchTab(target.url)
            else this.goPage(target.url)
        }
    }
}
</script>

<style lang="scss">
.home-page { --page-safe-top: var(--status-bar-height, 44rpx); min-height: 100vh; padding-bottom: calc(40rpx + var(--window-bottom)); background: #f8ede1; }
.home-hero { position: relative; height: auto; padding: calc(var(--page-safe-top) + 26rpx) 0 16rpx; overflow: visible; background: #f8ede1 url('https://shengyuan.store/api/miniapp/files/miniapp/7629728e6e9841cb8ea1c55d8d191cb0/home-bg.png') no-repeat center top; background-size: 100% auto; box-sizing: border-box; }
.home-hero__logo { position: absolute; left: 19rpx; top: calc(var(--page-safe-top) + 26rpx); z-index: 1; display: block; width: 116rpx; height: 116rpx; }
.home-search { display: flex; align-items: center; justify-content: space-between; width: calc(100vw - 36rpx); max-width: 714rpx; height: 65rpx; margin: 127rpx auto 0; padding: 0 23rpx 0 42rpx; border: 1rpx solid #a0610d; border-radius: 33rpx; background: #f3e7db; box-sizing: border-box; }
.home-search__placeholder { color: #7e5f4b; font-size: 22rpx; line-height: 22rpx; }
.home-search__icon { position: relative; width: 42rpx; height: 42rpx; color: #a0610d; }
.home-search__icon-circle { position: absolute; left: 7rpx; top: 6rpx; width: 24rpx; height: 24rpx; border: 4rpx solid currentColor; border-radius: 50%; box-sizing: border-box; }
.home-search__icon-line { position: absolute; right: 4rpx; bottom: 7rpx; width: 17rpx; height: 4rpx; background: currentColor; border-radius: 4rpx; transform: rotate(45deg); transform-origin: right center; }
.banner-wrap { width: calc(100vw - 47rpx); max-width: 703rpx; height: 283rpx; margin: 36rpx auto 0; border-radius: 0; overflow: hidden; background: #f4dfc9; }
.banner-swiper, .banner-image { width: 100%; height: 283rpx; }
.banner-wrap--fallback { background: #f4dfc9; }
.quick-strip { display: flex; align-items: flex-start; justify-content: space-between; gap: 8rpx; width: calc(100vw - 47rpx); max-width: 703rpx; height: 128rpx; margin: 42rpx auto 0; }
.quick-item { flex: 1 1 0; min-width: 0; text-align: center; }
.quick-image { display: block; width: 78rpx; height: 78rpx; margin: 0 auto; border-radius: 50%; }
.quick-more__icon { background: #fff9f0; }
.quick-name { width: 100%; margin-top: 13rpx; color: #222222; font-size: 23rpx; font-weight: 500; line-height: 28rpx; text-align: center; }
.home-content { position: relative; z-index: 2; padding: 24rpx 24rpx 0; background: #f8ede1; }
.feature-grid { display: flex; gap: 16rpx; width: calc(100vw - 47rpx); max-width: 703rpx; margin: 0 auto; }
.feature-card { display: flex; align-items: center; justify-content: space-between; flex: 1 1 0; min-width: 0; min-height: 176rpx; padding: 26rpx 18rpx 24rpx 22rpx; border: 1rpx solid rgba(160, 97, 13, .14); border-radius: 15rpx; background: rgba(255, 249, 240, .92); box-shadow: 0 10rpx 24rpx rgba(118, 66, 19, .06); box-sizing: border-box; }
.feature-card__body { flex: 1; min-width: 0; }
.feature-title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 40rpx; white-space: nowrap; }
.feature-desc { margin-top: 10rpx; color: #8b7663; font-size: 22rpx; line-height: 30rpx; white-space: normal; }
.feature-icon { flex: none; width: 62rpx; height: 62rpx; margin-left: 8rpx; }
.promoter-card { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; width: calc(100vw - 47rpx); max-width: 703rpx; min-height: 120rpx; margin: 20rpx auto 0; padding: 22rpx 24rpx; border: 1rpx solid rgba(160, 97, 13, .16); border-radius: 15rpx; background: linear-gradient(135deg, #fff9f0 0%, #f8ede1 100%); box-shadow: 0 10rpx 24rpx rgba(118, 66, 19, .05); box-sizing: border-box; }
.promoter-card__body { flex: 1; min-width: 0; }
.promoter-card__title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; }
.promoter-card__desc { margin-top: 6rpx; color: #8b7663; font-size: 23rpx; line-height: 34rpx; }
.promoter-card__action { flex: none; min-width: 128rpx; height: 56rpx; padding: 0 20rpx; color: #ffffff; font-size: 24rpx; line-height: 56rpx; text-align: center; border-radius: 28rpx; background: linear-gradient(90deg, #b26c10 0%, #764213 100%); box-sizing: border-box; }
.home-panel { width: calc(100vw - 47rpx); max-width: 703rpx; margin: 0 auto; border-radius: 15rpx; background: #f8ede1; box-sizing: border-box; }
.home-shop-panel { min-height: 341rpx; margin-top: 24rpx; padding: 27rpx 14rpx 26rpx; background: #f8ede1; }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 0 7rpx; }
.panel-title { color: #a0610d; font-size: 32rpx; font-family: SimSun, serif; font-weight: 700; line-height: 32rpx; }
.panel-more { display: flex; align-items: center; color: #a0610d; font-size: 26rpx; line-height: 26rpx; }
.panel-more__arrow { width: 11rpx; height: 18rpx; margin-left: 8rpx; border-top: 2rpx solid #a0610d; border-right: 2rpx solid #a0610d; transform: rotate(45deg); box-sizing: border-box; }
.featured-shop-row { display: flex; gap: 20rpx; margin-top: 23rpx; }
.featured-shop-empty { display: flex; align-items: center; justify-content: center; height: 222rpx; margin-top: 23rpx; color: #9c8a76; font-size: 24rpx; background: rgba(255, 255, 255, .42); border-radius: 15rpx; }
.featured-shop-card { flex: 0 0 211rpx; width: 211rpx; min-width: 0; }
.featured-shop-image { display: flex; align-items: center; justify-content: center; width: 211rpx; height: 154rpx; border-radius: 15rpx; background: #ffffff; }
.featured-shop-name { margin-top: 22rpx; color: #222222; font-size: 26rpx; font-weight: 500; line-height: 26rpx; }
.featured-shop-meta { display: flex; align-items: center; gap: 12rpx; margin-top: 16rpx; color: #666666; font-size: 18rpx; line-height: 18rpx; white-space: nowrap; overflow: hidden; }
.featured-shop-meta text:first-child { color: #a0610d; }
.featured-shop-divider { width: 1rpx; height: 14rpx; background: #cbb89e; }
.home-recommend-panel { min-height: 593rpx; margin-top: 24rpx; padding: 22rpx 14rpx 19rpx; background: #f8ede1; }
.recommend-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26rpx 21rpx; margin-top: 17rpx; }
.recommend-card { min-width: 0; }
.recommend-image { display: flex; align-items: center; justify-content: center; width: 211rpx; height: 154rpx; border-radius: 15rpx; background: #ffffff; }
.recommend-name { margin-top: 22rpx; color: #222222; font-size: 26rpx; font-weight: 500; line-height: 26rpx; }
.recommend-price { margin-top: 18rpx; color: #a0610d; font-size: 26rpx; font-weight: 500; line-height: 26rpx; }
.section-title { margin: 34rpx 0 20rpx; color: #a0610d; font-size: 32rpx; font-family: SimSun, serif; font-weight: 700; line-height: 40rpx; }
.recent-visit-panel { margin-top: 24rpx; padding: 22rpx 0 24rpx; border-radius: 15rpx; background: #f8ede1; overflow: hidden; }
.recent-visit-head { display: flex; align-items: center; justify-content: space-between; padding: 0 22rpx; }
.recent-visit-title { color: #a0610d; font-size: 32rpx; font-family: SimSun, serif; font-weight: 700; line-height: 40rpx; }
.recent-visit-more { display: flex; align-items: center; gap: 8rpx; color: #a0610d; font-size: 24rpx; line-height: 34rpx; }
.recent-visit-more__icon { position: relative; width: 18rpx; height: 24rpx; }
.recent-visit-more__icon::after { content: ''; position: absolute; left: 2rpx; top: 5rpx; width: 10rpx; height: 10rpx; border-top: 3rpx solid #a0610d; border-right: 3rpx solid #a0610d; transform: rotate(45deg); }
.recent-shop-scroll { width: 100%; margin-top: 22rpx; white-space: nowrap; }
.recent-shop-list { display: inline-flex; align-items: flex-start; padding: 0 22rpx; box-sizing: border-box; }
.recent-shop-card { flex: 0 0 131rpx; width: 131rpx; margin-right: 6rpx; text-align: center; }
.recent-shop-card:last-child { margin-right: 22rpx; }
.recent-shop-card__image { display: flex; align-items: center; justify-content: center; width: 86rpx; height: 86rpx; margin: 0 auto; border-radius: 50%; background: #fff9f0; }
.recent-shop-card__name { width: 132rpx; margin: 12rpx auto 0; color: #222222; font-size: 24rpx; line-height: 32rpx; }
.image-placeholder { color: #9c8a76; font-size: 22rpx; line-height: 28rpx; text-align: center; background: #fff9f0; }
.activity-list, .goods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18rpx; }
.activity-card { position: relative; min-height: 180rpx; padding: 24rpx; border-radius: 15rpx; background: #fff9f0; box-sizing: border-box; }
.activity-card__title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; }
.activity-card__desc { width: 58%; margin-top: 12rpx; color: #8b7663; font-size: 24rpx; line-height: 34rpx; }
.activity-card__image { position: absolute; right: 16rpx; bottom: 14rpx; display: flex; align-items: center; justify-content: center; width: 112rpx; height: 112rpx; }
.goods-card { min-width: 0; padding: 16rpx; background: #fff9f0; border-radius: 15rpx; box-sizing: border-box; }
.goods-card__image { display: flex; align-items: center; justify-content: center; width: 100%; height: 220rpx; border-radius: 14rpx; background: #ffffff; }
.goods-card__name { min-height: 64rpx; margin-top: 14rpx; color: #222222; font-size: 26rpx; line-height: 34rpx; }
.goods-card__desc, .goods-card__shop { margin-top: 8rpx; color: #8b7663; font-size: 22rpx; line-height: 30rpx; }
.goods-card__tags { display: flex; flex-wrap: wrap; gap: 8rpx; min-height: 34rpx; margin-top: 10rpx; overflow: hidden; }
.goods-card__tag { max-width: 132rpx; padding: 0 10rpx; color: #a0610d; font-size: 20rpx; line-height: 32rpx; border-radius: 16rpx; background: #f8ede1; box-sizing: border-box; }
.goods-card__bottom { display: flex; align-items: baseline; min-width: 0; margin-top: 10rpx; }
.goods-card__price { color: #a0610d; font-size: 28rpx; font-weight: 600; line-height: 38rpx; }
.goods-card__market { margin-left: 10rpx; color: #b5a18c; font-size: 22rpx; line-height: 30rpx; text-decoration: line-through; }
.goods-card__meta { display: flex; align-items: center; justify-content: space-between; min-height: 30rpx; margin-top: 6rpx; color: #9c8a76; font-size: 22rpx; line-height: 30rpx; }
.shop-list { display: flex; flex-direction: column; gap: 16rpx; }
.shop-card { display: flex; align-items: center; padding: 18rpx; background: #fff9f0; border-radius: 15rpx; box-sizing: border-box; }
.shop-card__logo { flex: none; display: flex; align-items: center; justify-content: center; width: 96rpx; height: 96rpx; margin-right: 18rpx; border-radius: 14rpx; background: #ffffff; }
.shop-card__body { flex: 1; min-width: 0; }
.shop-card__name { color: #222222; font-size: 28rpx; font-weight: 600; line-height: 40rpx; }
.shop-card__address { margin-top: 8rpx; color: #8b7663; font-size: 24rpx; line-height: 34rpx; }
.shop-card__meta { margin-left: 16rpx; text-align: right; }
.shop-card__status { color: #a0610d; font-size: 24rpx; line-height: 34rpx; }
.shop-card__score { margin-top: 8rpx; color: #222222; font-size: 26rpx; font-weight: 600; line-height: 36rpx; }
.identity-title { margin: 50rpx 0 26rpx; color: #a0610d; font-size: 32rpx; font-family: SimSun, serif; font-weight: 700; line-height: 44rpx; }
.identity-card { display: flex; align-items: center; justify-content: space-between; height: 210rpx; margin-bottom: 24rpx; padding: 0 54rpx 0 58rpx; border-radius: 15rpx; box-sizing: border-box; }
.identity-card--seller { background: #fff9f0; }
.identity-card--buyer { background: #fff9f0; }
.identity-card__title { color: #222222; font-size: 38rpx; font-weight: 600; line-height: 52rpx; }
.identity-card__desc { margin-top: 14rpx; color: #8b7663; font-size: 28rpx; line-height: 40rpx; }
.identity-illustration { width: 182rpx; height: 152rpx; }

@media screen and (max-width: 360px) {
    .feature-grid { gap: 14rpx; }
    .feature-card { min-height: 176rpx; padding: 24rpx 16rpx 22rpx; }
    .feature-title,
    .promoter-card__title { font-size: 28rpx; line-height: 38rpx; }
    .feature-desc,
    .promoter-card__desc { font-size: 21rpx; line-height: 30rpx; }
    .feature-icon { width: 60rpx; height: 60rpx; }
    .promoter-card { align-items: flex-start; flex-direction: column; }
    .promoter-card__action { align-self: flex-end; }
}
</style>
