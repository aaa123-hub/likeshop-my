<template>
    <view class="home-page">
        <view class="home-hero">
            <view class="home-copy">
                <view class="home-hi">Hi~</view>
                <view class="home-title">欢迎加入{{ userName }}</view>
            </view>
            <image class="home-hero__image" :src="designAssets.homeHeroFigure" mode="aspectFit"></image>

            <navigator class="home-search" hover-class="none" url="/bundle/pages/goods_search/goods_search">
                <text class="home-search__placeholder">输入关键词</text>
                <view class="home-search__icon">
                    <view class="home-search__icon-circle"></view>
                    <view class="home-search__icon-line"></view>
                </view>
            </navigator>
        </view>

        <view class="home-content">
            <view class="feature-grid">
                <navigator class="balance-card" hover-class="none" url="/bundle_finance/pages/user_wallet/user_wallet">
                    <view class="feature-label">我的余额</view>
                    <view class="balance-amount">¥{{ walletBalanceText }}</view>
                    <image class="balance-image" :src="designAssets.homeBalanceBill" mode="aspectFit"></image>
                </navigator>

                <view class="feature-stack">
                    <view class="feature-card" @tap="openScan">
                        <view>
                            <view class="feature-title">扫一扫</view>
                            <view class="feature-desc">辅助文案填充</view>
                        </view>
                        <image class="feature-icon" :src="designAssets.homeNoticeIcon" mode="aspectFit"></image>
                    </view>
                    <view class="feature-card" @tap="openBusinessPage(businessRoutes.pages.ecoApp)">
                        <view>
                            <view class="feature-title">生态应用</view>
                            <view class="feature-desc">辅助文案填充</view>
                        </view>
                        <image class="feature-icon" :src="designAssets.homeEcologyIcon" mode="aspectFit"></image>
                    </view>
                </view>
            </view>

            <view class="banner-wrap" v-if="bannerList.length">
                <swiper class="banner-swiper" autoplay circular :interval="3000" :duration="300" indicator-dots indicator-color="rgba(255,255,255,.45)" indicator-active-color="#ffffff">
                    <swiper-item v-for="(item, index) in bannerList" :key="index">
                        <image class="banner-image" :src="item.image" mode="aspectFill" @tap="handleBannerTap(item)"></image>
                    </swiper-item>
                </swiper>
            </view>

            <view class="quick-strip">
                <view
                    v-for="(item, index) in shortcutList"
                    :key="index"
                    class="quick-item"
                    @tap="openShortcut(item)"
                >
                    <view v-if="isEmptyImage(item.image)" class="quick-image image-placeholder">无</view>
                    <image v-else class="quick-image" :src="displayImage(item.image)" mode="aspectFill"></image>
                    <view class="quick-name line1">{{ item.name }}</view>
                </view>
                <view class="quick-item quick-more" @tap="switchTab('/pages/sort/sort')">
                    <image class="quick-more__icon" :src="designAssets.homeMoreIcon" mode="aspectFit"></image>
                    <view class="quick-name is-blue">全部</view>
                </view>
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
                        <view v-for="(item, index) in recentVisitList" :key="item.key || item.shopId || index" class="recent-shop-card" @tap="handleVisitTap(item)">
                            <view v-if="isEmptyImage(item.image || item.cover)" class="recent-shop-card__image image-placeholder">无</view>
                            <image v-else class="recent-shop-card__image" :src="displayImage(item.image || item.cover)" mode="aspectFill"></image>
                            <view class="recent-shop-card__name line1">{{ formatRecentVisitName(item) }}</view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <view class="section-title" v-if="hotActivityList.length">热门活动</view>
            <view v-if="hotActivityList.length" class="activity-list">
                <view v-for="(item, index) in hotActivityList" :key="index" class="activity-card" @tap="handleActivityTap(item)">
                    <view class="activity-card__title line1">{{ item.title || item.name || '热门活动' }}</view>
                    <view class="activity-card__desc line2">{{ item.desc || item.subTitle || '活动内容待补充' }}</view>
                    <view v-if="isEmptyImage(item.cover)" class="activity-card__image image-placeholder">无</view>
                    <image v-else class="activity-card__image" :src="displayImage(item.cover)" mode="aspectFill"></image>
                </view>
            </view>

            <view class="section-title" v-if="recommendedProductList.length">推荐商品</view>
            <view v-if="recommendedProductList.length" class="goods-grid">
                <navigator
                    v-for="(item, index) in recommendedProductList"
                    :key="index"
                    class="goods-card"
                    hover-class="none"
                    :url="'/bundle/pages/goods_details/goods_details?id=' + (item.id || item.goods_id)"
                >
                    <view v-if="isEmptyImage(item.image || item.goods_image)" class="goods-card__image image-placeholder">无</view>
                    <image v-else class="goods-card__image" :src="displayImage(item.image || item.goods_image, 'goods')" mode="aspectFill"></image>
                    <view class="goods-card__name line2">{{ item.name }}</view>
                    <view class="goods-card__price">¥{{ item.price || 0 }}</view>
                </navigator>
            </view>

            <view class="section-title" v-if="recommendedShopList.length">推荐门店</view>
            <view v-if="recommendedShopList.length" class="shop-list">
                <view
                    v-for="(item, index) in recommendedShopList"
                    :key="index"
                    class="shop-card"
                    @tap="handleShopTap(item)"
                >
                    <view v-if="isEmptyImage(getShopImage(item))" class="shop-card__logo image-placeholder">无</view>
                    <image v-else class="shop-card__logo" :src="displayImage(getShopImage(item))" mode="aspectFill"></image>
                    <view class="shop-card__body">
                        <view class="shop-card__name line1">{{ item.shopName || item.name || '默认门店' }}</view>
                        <view class="shop-card__address line2">{{ item.detailAddress || item.address || '地址待补充' }}</view>
                    </view>
                    <view class="shop-card__meta">
                        <view class="shop-card__status">{{ item.openStatus === 'OPEN' ? '营业中' : '未营业' }}</view>
                        <view class="shop-card__score">{{ item.shopScore || 0 }}分</view>
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
import { mapActions, mapGetters } from 'vuex'
import { getHome } from '@/api/store'
import { getRecentVisitShops } from '@/api/app'
import { businessRoutes, openBusinessRoute } from '@/utils/business-routes'
import { designAssets, designAssetList } from '@/utils/design-assets'
import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder'

export default {
    data() {
        return {
            homeData: {},
            designAssets,
            businessRoutes,
            recentVisitFallback: [
                { shopId: 101, name: '潮流集合店精选', image: '' },
                { shopId: 102, name: '城市鲜选', image: '' },
                { shopId: 103, name: '悦享生活馆', image: '' },
                { shopId: 104, name: '蓝鲸优品', image: '' },
                { shopId: 105, name: '轻奢好物店', image: '' },
                { shopId: 106, name: '优选便利铺', image: '' },
                { shopId: 107, name: '邻里百货', image: '' }
            ],
            homeRecentVisitList: [],
            homeLoading: false,
            didShowOnce: false,
            homeLoaded: false
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        userName() {
            return this.userInfo.nickname || this.userInfo.user_name || this.userInfo.mobile || 'XXXX'
        },
        walletBalanceText() {
            const balance = this.homeData.walletCard?.balance
            const value = balance !== undefined && balance !== null ? balance : this.userInfo.user_money
            return Number(value || 0).toFixed(2)
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
        recentVisitList() {
            if (this.homeRecentVisitList.length) return this.homeRecentVisitList
            const homeRecentVisits = this.homeData.recentVisits || []
            return homeRecentVisits.length ? homeRecentVisits : this.recentVisitFallback
        },
        hotActivityList() {
            return this.homeData.hotActivities || []
        },
        recommendedProductList() {
            return this.homeData.recommendedProducts || []
        },
        recommendedShopList() {
            return this.homeData.recommendedShops || []
        },
        homeShortcutFallback() {
            return [
                { name: '分类', image: '', url: '/pages/sort/sort', type: 'switchTab' },
                { name: '订单', image: '', url: '/bundle_order/pages/user_order/user_order' },
                { name: '消息', image: '', url: '/bundle_misc/pages/notice/notice' },
                { name: '活动', image: '', url: '/business/pages/business_pages/activity_center' },
                { name: '门店', image: '', url: '/business/pages/business_pages/store_detail' }
            ]
        }
    },
    onLoad() {
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
        this.getHomeFun().finally(() => {
            uni.stopPullDownRefresh()
        })
    },
    methods: {
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
        isEmptyImage(src) {
            return isPlaceholderImage(src)
        },
        displayImage(src, type = 'common') {
            return resolveImage(src, type)
        },
        formatRecentVisitName(item = {}) {
            const name = String(item.name || item.shopName || '默认门店')
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
                userRole: this.userInfo.userRole || this.userInfo.user_role || this.userInfo.role || 'USER',
                lat: lat !== undefined && lat !== null && lat !== '' ? lat : 23.1291,
                lng: lng !== undefined && lng !== null && lng !== '' ? lng : 113.2644
            }
            return params
        },
        openScan() {
            uni.scanCode({
                onlyFromCamera: false,
                success: (res) => {
                    const result = res.result || res.path || ''
                    if (result && /^\//.test(result)) {
                        uni.navigateTo({ url: result })
                        return
                    }
                    if (result) {
                        uni.showToast({ title: '扫码成功', icon: 'success' })
                        return
                    }
                    uni.showToast({ title: '未识别到内容', icon: 'none' })
                },
                fail: () => {
                    uni.showToast({ title: '扫一扫未完成', icon: 'none' })
                }
            })
        },
        normalizeQuickEntry(item = {}) {
            const code = String(item.code || '').toUpperCase()
            const quickEntryMap = {
                CATEGORY: {
                    name: item.title || '分类',
                    image: resolveImage(item.iconUrl || ''),
                    url: item.pagePath && item.pagePath !== '/pages/category/index' ? item.pagePath : '/pages/sort/sort',
                    type: 'switchTab'
                },
                ORDER: {
                    name: item.title || '订单',
                    image: resolveImage(item.iconUrl || ''),
                    url: item.pagePath && item.pagePath !== '/pages/order/list' ? item.pagePath : '/bundle_order/pages/user_order/user_order'
                },
                MESSAGE: {
                    name: item.title || '消息',
                    image: resolveImage(item.iconUrl || ''),
                    url: item.pagePath && item.pagePath !== '/pages/message/list' ? item.pagePath : '/bundle_misc/pages/notice/notice'
                },
                COUPON: {
                    name: item.title || '优惠券',
                    image: resolveImage(item.iconUrl || ''),
                    url: item.pagePath && item.pagePath !== '/pages/coupon/list' ? item.pagePath : '/bundle_user/pages/user_coupon/user_coupon'
                },
                WALLET: {
                    name: item.title || '钱包',
                    image: resolveImage(item.iconUrl || ''),
                    url: item.pagePath && item.pagePath !== '/pages/wallet/index' ? item.pagePath : '/bundle_finance/pages/user_wallet/user_wallet'
                }
            }
            return quickEntryMap[code] || {
                name: item.title || item.code || '入口',
                image: resolveImage(item.iconUrl || ''),
                url: item.pagePath || ''
            }
        },
        goPage(url) {
            uni.navigateTo({
                url
            })
        },
        switchTab(url) {
            uni.switchTab({
                url
            })
        },
        openBusinessPage(item) {
            openBusinessRoute(item)
        },
        handleBannerTap(item) {
            if (item.url) {
                if (item.type === 'switchTab') {
                    this.switchTab(item.url)
                } else {
                    this.goPage(item.url)
                }
                return
            }
            if (item.scene && businessRoutes.pages[item.scene]) {
                openBusinessRoute(businessRoutes.pages[item.scene])
            }
        },
        handleVisitTap(item) {
            const shopId = item.shopId || item.shop_id || item.targetId || item.target_id || ''
            if (shopId && ((item.visitType || item.targetType || '').toUpperCase() === 'SHOP' || item.shopId || item.shop_id)) {
                this.goPage(`/business/pages/business_pages/store_detail?shopId=${shopId}`)
                return
            }
            if (item.targetId) {
                this.goPage(`/bundle/pages/goods_details/goods_details?id=${item.targetId}`)
            }
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
            if (!shopId) {
                uni.showToast({ title: '门店信息暂不可打开', icon: 'none' })
                return
            }
            this.goPage(`/business/pages/business_pages/store_detail?shopId=${shopId}`)
        },
        openShortcut(item) {
            if (item.type === 'switchTab') {
                this.switchTab(item.url)
                return
            }
            if (item.url) {
                this.goPage(item.url)
                return
            }
            const code = String(item.code || item.name || '').toUpperCase()
            if (code === 'CATEGORY' || item.name === '分类') {
                this.switchTab('/pages/sort/sort')
                return
            }
            if (code === 'ORDER' || item.name === '订单') {
                this.goPage('/bundle_order/pages/user_order/user_order')
                return
            }
            if (code === 'MESSAGE' || item.name === '消息') {
                this.goPage('/bundle_misc/pages/notice/notice')
            }
        }
    }
}
</script>

<style lang="scss">
.home-page {
    --page-safe-top: var(--status-bar-height, 44rpx);
    min-height: 100vh;
    padding-bottom: calc(40rpx + var(--window-bottom));
    background: #f5f5f5;
}

.home-hero {
    position: relative;
    min-height: 496rpx;
    padding: calc(var(--page-safe-top) + 64rpx) 24rpx 0;
    overflow: hidden;
    background: linear-gradient(180deg, #1688ff 0%, #74b2ff 100%);
}

.home-copy {
    position: relative;
    z-index: 2;
    color: #ffffff;
}

.home-hi {
    font-size: 52rpx;
    font-weight: 600;
    line-height: 72rpx;
}

.home-title {
    margin-top: 16rpx;
    font-size: 40rpx;
    font-weight: 500;
    line-height: 56rpx;
}

.home-hero__image {
    position: absolute;
    right: -18rpx;
    top: calc(var(--page-safe-top) + 44rpx);
    width: 456rpx;
    height: 366rpx;
    z-index: 1;
}

.home-search {
    position: absolute;
    left: 24rpx;
    right: 24rpx;
    bottom: 30rpx;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 82rpx;
    padding: 0 30rpx 0 40rpx;
    background: #ffffff;
    border-radius: 42rpx;
    box-sizing: border-box;
}

.home-search__placeholder {
    color: #b3b3b3;
    font-size: 28rpx;
}

.home-search__icon {
    position: relative;
    width: 44rpx;
    height: 44rpx;
    color: #222222;
}

.home-search__icon-circle {
    position: absolute;
    left: 7rpx;
    top: 6rpx;
    width: 23rpx;
    height: 23rpx;
    border: 4rpx solid currentColor;
    border-radius: 50%;
    box-sizing: border-box;
}

.home-search__icon-line {
    position: absolute;
    right: 7rpx;
    bottom: 8rpx;
    width: 17rpx;
    height: 4rpx;
    background: currentColor;
    border-radius: 4rpx;
    transform: rotate(45deg);
    transform-origin: right center;
}

.home-content {
    padding: 20rpx 24rpx 0;
}

.banner-wrap {
    margin-top: 22rpx;
}

.banner-swiper {
    height: 220rpx;
    border-radius: 18rpx;
    overflow: hidden;
    background: #f1f2f5;
}

.banner-image {
    width: 100%;
    height: 220rpx;
}

.feature-grid {
    display: flex;
    gap: 24rpx;
    justify-content: space-between;
}

.balance-card {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    height: 326rpx;
    padding: 40rpx 28rpx;
    overflow: hidden;
    border: 2rpx solid #ffffff;
    border-radius: 18rpx;
    background: linear-gradient(180deg, #dceeff 0%, #eef7ff 100%);
    box-sizing: border-box;
}

.feature-label {
    color: #666666;
    font-size: 30rpx;
    font-weight: 600;
}

.balance-amount {
    margin-top: 26rpx;
    color: #222222;
    font-size: 56rpx;
    font-weight: 600;
    line-height: 72rpx;
}

.balance-image {
    position: absolute;
    right: 18rpx;
    bottom: 14rpx;
    width: 156rpx;
    height: 156rpx;
    opacity: 0.92;
    z-index: 0;
}

.feature-label,
.balance-amount {
    position: relative;
    z-index: 1;
}

.feature-stack {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1 1 0;
    min-width: 0;
}

.feature-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 152rpx;
    padding: 0 26rpx 0 30rpx;
    border-radius: 16rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.feature-title {
    color: #222222;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
}

.feature-desc {
    margin-top: 12rpx;
    color: #999999;
    font-size: 26rpx;
    line-height: 36rpx;
}

.feature-icon {
    width: 84rpx;
    height: 84rpx;
}

.quick-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 144rpx;
    margin-top: 22rpx;
    padding: 0 22rpx;
    border-radius: 16rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.quick-item {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
}

.quick-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 66rpx;
    height: 66rpx;
    margin: 0 auto;
    border-radius: 50%;
    background: #edf3fb;
}

.quick-more__icon {
    width: 52rpx;
    height: 52rpx;
    margin: 0 auto;
}

.quick-name {
    margin-top: 12rpx;
    color: #222222;
    font-size: 24rpx;
    line-height: 32rpx;
}

.is-blue {
    color: #1688ff;
}

.section-title {
    margin: 34rpx 0 20rpx;
    color: #222222;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 48rpx;
}

.recent-visit-panel {
    margin-top: 28rpx;
    padding: 22rpx 0 24rpx;
    border-radius: 18rpx;
    background: #ffffff;
    overflow: hidden;
}

.recent-visit-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22rpx;
}

.recent-visit-title {
    color: #222222;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
}

.recent-visit-more {
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #666666;
    font-size: 24rpx;
    line-height: 34rpx;
}

.recent-visit-more__icon {
    position: relative;
    width: 18rpx;
    height: 24rpx;
}

.recent-visit-more__icon::after {
    content: '';
    position: absolute;
    left: 2rpx;
    top: 5rpx;
    width: 10rpx;
    height: 10rpx;
    border-top: 3rpx solid #1688ff;
    border-right: 3rpx solid #1688ff;
    transform: rotate(45deg);
}

.recent-shop-scroll {
    width: 100%;
    margin-top: 22rpx;
    white-space: nowrap;
}

.recent-shop-list {
    display: inline-flex;
    align-items: flex-start;
    padding: 0 22rpx;
    box-sizing: border-box;
}

.recent-shop-card {
    flex: 0 0 131rpx;
    width: 131rpx;
    margin-right: 6rpx;
    text-align: center;
}

.recent-shop-card:last-child {
    margin-right: 22rpx;
}

.recent-shop-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 86rpx;
    height: 86rpx;
    margin: 0 auto;
    border-radius: 50%;
    background: #eef1f5;
}

.recent-shop-card__name {
    width: 132rpx;
    margin: 12rpx auto 0;
    color: #222222;
    font-size: 24rpx;
    line-height: 32rpx;
}

.home-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150rpx;
    color: #999999;
    font-size: 26rpx;
    border-radius: 18rpx;
    background: #ffffff;
}

.activity-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18rpx;
}

.activity-card {
    position: relative;
    min-height: 180rpx;
    padding: 24rpx;
    border-radius: 18rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.activity-card__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.activity-card__desc {
    width: 58%;
    margin-top: 12rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}

.activity-card__image {
    position: absolute;
    right: 16rpx;
    bottom: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    height: 112rpx;
}

.image-placeholder {
    color: #9ca3af;
    font-size: 22rpx;
    line-height: 28rpx;
    text-align: center;
    background: #eef1f5;
}

.goods-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18rpx;
}

.goods-card {
    padding: 16rpx;
    background: #ffffff;
    border-radius: 18rpx;
    box-sizing: border-box;
}

.goods-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 220rpx;
    border-radius: 14rpx;
    background: #f3f6fb;
}

.goods-card__name {
    min-height: 68rpx;
    margin-top: 14rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 34rpx;
}

.goods-card__price {
    margin-top: 8rpx;
    color: #ff2c3c;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 38rpx;
}

.shop-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.shop-card {
    display: flex;
    align-items: center;
    padding: 18rpx;
    background: #ffffff;
    border-radius: 18rpx;
    box-sizing: border-box;
}

.shop-card__logo {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96rpx;
    height: 96rpx;
    margin-right: 18rpx;
    border-radius: 14rpx;
    background: #f3f6fb;
}

.shop-card__body {
    flex: 1;
    min-width: 0;
}

.shop-card__name {
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 40rpx;
}

.shop-card__address {
    margin-top: 8rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}

.shop-card__meta {
    margin-left: 16rpx;
    text-align: right;
}

.shop-card__status {
    color: #1688ff;
    font-size: 24rpx;
    line-height: 34rpx;
}

.shop-card__score {
    margin-top: 8rpx;
    color: #222222;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 36rpx;
}

.identity-title {
    margin: 50rpx 0 26rpx;
    color: #222222;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 50rpx;
}

.identity-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 210rpx;
    margin-bottom: 24rpx;
    padding: 0 54rpx 0 58rpx;
    border-radius: 14rpx;
    box-sizing: border-box;
}

.identity-card--seller {
    border: 2rpx solid #dcecff;
    background: linear-gradient(180deg, #edf7ff 0%, #ffffff 100%);
}

.identity-card--buyer {
    border: 2rpx solid #fff2d4;
    background: linear-gradient(180deg, #fff9eb 0%, #ffffff 100%);
}

.identity-card__title {
    color: #222222;
    font-size: 38rpx;
    font-weight: 600;
    line-height: 52rpx;
}

.identity-card__desc {
    margin-top: 14rpx;
    color: #666666;
    font-size: 28rpx;
    line-height: 40rpx;
}

.identity-illustration {
    width: 182rpx;
    height: 152rpx;
}

</style>
