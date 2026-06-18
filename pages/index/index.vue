<template>
    <view class="home-page">
        <view class="home-hero">
            <view class="home-copy">
                <view class="home-hi">Hi~</view>
                <view class="home-title">欢迎加入{{ userName }}</view>
            </view>
            <image class="home-hero__image" :src="designAssets.homeHeroFigure" mode="aspectFit"></image>

            <navigator class="home-search" hover-class="none" url="/pages/goods_search/goods_search">
                <text class="home-search__placeholder">输入关键词</text>
                <u-icon name="search" size="48" color="#222222"></u-icon>
            </navigator>
        </view>

        <view class="home-content">
            <view class="feature-grid">
                <navigator class="balance-card" hover-class="none" url="/bundle/pages/user_wallet/user_wallet">
                    <view class="feature-label">我的余额</view>
                    <view class="balance-amount">¥{{ walletBalanceText }}</view>
                    <image class="balance-image" :src="designAssets.homeBalanceBill" mode="aspectFit"></image>
                </navigator>

            <view class="feature-stack">
                    <view class="feature-card" @tap="openBusinessPage(businessRoutes.pages.notice)">
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
                    <image class="quick-image" :src="item.image" mode="aspectFill"></image>
                    <view class="quick-name line1">{{ item.name }}</view>
                </view>
                <view class="quick-item quick-more" @tap="switchTab('/pages/sort/sort')">
                    <image class="quick-more__icon" :src="designAssets.homeMoreIcon" mode="aspectFit"></image>
                    <view class="quick-name is-blue">全部</view>
                </view>
            </view>

            <view class="section-title" v-if="recentVisitList.length">最近访问</view>
            <scroll-view v-if="recentVisitList.length" class="recent-scroll" scroll-x>
                <view class="recent-list">
                    <view v-for="(item, index) in recentVisitList" :key="index" class="recent-card" @tap="handleVisitTap(item)">
                        <image class="recent-card__image" :src="item.cover || designAssets.homeHeroFigure" mode="aspectFill"></image>
                        <view class="recent-card__title line1">{{ item.title || item.name || '最近访问' }}</view>
                    </view>
                </view>
            </scroll-view>

            <view class="section-title" v-if="hotActivityList.length">热门活动</view>
            <view v-if="hotActivityList.length" class="activity-list">
                <view v-for="(item, index) in hotActivityList" :key="index" class="activity-card" @tap="handleActivityTap(item)">
                    <view class="activity-card__title line1">{{ item.title || item.name || '热门活动' }}</view>
                    <view class="activity-card__desc line2">{{ item.desc || item.subTitle || '活动内容待补充' }}</view>
                    <image class="activity-card__image" :src="item.cover || designAssets.homeEcologyIcon" mode="aspectFill"></image>
                </view>
            </view>

            <view class="section-title" v-if="recommendedProductList.length">推荐商品</view>
            <view v-if="recommendedProductList.length" class="goods-grid">
                <navigator
                    v-for="(item, index) in recommendedProductList"
                    :key="index"
                    class="goods-card"
                    hover-class="none"
                    :url="'/pages/goods_details/goods_details?id=' + (item.id || item.goods_id)"
                >
                    <image class="goods-card__image" :src="item.image || item.goods_image || designAssets.homeHeroFigure" mode="aspectFill"></image>
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
                    <image class="shop-card__logo" :src="item.shopLogo || item.logo || designAssets.homeHeroFigure" mode="aspectFill"></image>
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
            <view class="identity-card identity-card--seller" @tap="goPage('/bundle/pages/license/license')">
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
import { businessRoutes, openBusinessRoute } from '@/utils/business-routes'
import { designAssets, designAssetList } from '@/utils/design-assets'

export default {
    data() {
        return {
            homeData: {},
            designAssets,
            businessRoutes
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
                image: item.image || item.cover || item.pic || item.banner || designAssets.homeHeroBg,
                url: item.url || item.link || item.jumpUrl || '',
                type: item.type || item.linkType || item.jumpType || '',
                title: item.title || item.name || `banner-${index}`
            }))
        },
        shortcutList() {
            return this.quickEntryList.slice(0, 5)
        },
        recentVisitList() {
            return this.homeData.recentVisits || []
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
                { name: '分类', image: designAssetList.homeShortcuts[0], url: '/pages/sort/sort', type: 'switchTab' },
                { name: '订单', image: designAssetList.homeShortcuts[1], url: '/pages/user_order/user_order' },
                { name: '消息', image: designAssetList.homeShortcuts[2], url: '/bundle/pages/notice/notice' },
                { name: '活动', image: designAssets.homeHeroBg, url: '/bundle/pages/business_pages/activity_center' },
                { name: '门店', image: designAssets.homeHeroFigure, url: '/bundle/pages/business_pages/store_detail' }
            ]
        }
    },
    onLoad() {
        this.getHomeFun()
    },
    onPullDownRefresh() {
        this.getHomeFun().finally(() => {
            uni.stopPullDownRefresh()
        })
    },
    methods: {
        async getHomeFun() {
            const res = await getHome()
            if (res.code == 1) {
                this.homeData = res.data || {}
            }
        },
        normalizeQuickEntry(item = {}) {
            const code = String(item.code || '').toUpperCase()
            const quickEntryMap = {
                CATEGORY: {
                    name: item.title || '分类',
                    image: designAssetList.homeShortcuts[0],
                    url: '/pages/sort/sort',
                    type: 'switchTab'
                },
                ORDER: {
                    name: item.title || '订单',
                    image: designAssetList.homeShortcuts[1],
                    url: '/pages/user_order/user_order'
                },
                MESSAGE: {
                    name: item.title || '消息',
                    image: designAssetList.homeShortcuts[2],
                    url: '/bundle/pages/notice/notice'
                }
            }
            return quickEntryMap[code] || {
                name: item.title || item.code || '入口',
                image: designAssets.homeMoreIcon,
                url: ''
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
            if ((item.visitType || '').toUpperCase() === 'SHOP' && item.targetId) {
                this.goPage(`/bundle/pages/business_pages/store_detail?shopId=${item.targetId}`)
                return
            }
            if (item.targetId) {
                this.goPage(`/pages/goods_details/goods_details?id=${item.targetId}`)
            }
        },
        handleActivityTap(item) {
            if (item.targetId) {
                this.goPage(`/bundle/pages/activity_detail/activity_detail?id=${item.targetId}`)
                return
            }
            this.openBusinessPage(businessRoutes.pages.activityCenter)
        },
        handleShopTap(item) {
            this.goPage(`/bundle/pages/business_pages/store_detail?shopId=${item.shopId || item.id || ''}`)
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
                this.goPage('/pages/user_order/user_order')
                return
            }
            if (code === 'MESSAGE' || item.name === '消息') {
                this.goPage('/bundle/pages/notice/notice')
            }
        }
    }
}
</script>

<style lang="scss">
.home-page {
    min-height: 100vh;
    padding-bottom: calc(40rpx + var(--window-bottom));
    background: #f5f5f5;
}

.home-hero {
    position: relative;
    min-height: 496rpx;
    padding: calc(var(--status-bar-height) + 98rpx) 24rpx 0;
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
    right: -24rpx;
    top: 110rpx;
    width: 412rpx;
    height: 300rpx;
    z-index: 1;
}

.home-search {
    position: absolute;
    left: 24rpx;
    right: 24rpx;
    bottom: 30rpx;
    z-index: 2;
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

.home-content {
    padding: 20rpx 24rpx 0;
}

.banner-wrap {
    margin-top: 22rpx;
}

.banner-swiper {
    height: 180rpx;
    border-radius: 18rpx;
    overflow: hidden;
}

.banner-image {
    width: 100%;
    height: 180rpx;
}

.feature-grid {
    display: flex;
    justify-content: space-between;
}

.balance-card {
    position: relative;
    width: 324rpx;
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
    right: 30rpx;
    bottom: 24rpx;
    width: 138rpx;
    height: 138rpx;
}

.feature-stack {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 354rpx;
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
    height: 144rpx;
    margin-top: 22rpx;
    padding: 0 22rpx;
    border-radius: 16rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.quick-item {
    width: 116rpx;
    text-align: center;
}

.quick-image {
    width: 66rpx;
    height: 66rpx;
    margin: 0 auto;
    border-radius: 50%;
    background: #edf3fb;
}

.quick-more__icon {
    width: 66rpx;
    height: 66rpx;
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

.recent-scroll {
    white-space: nowrap;
}

.recent-list {
    display: inline-flex;
    gap: 18rpx;
}

.recent-card {
    width: 148rpx;
    flex-shrink: 0;
}

.recent-card__image {
    width: 148rpx;
    height: 148rpx;
    border-radius: 18rpx;
    background: #ffffff;
}

.recent-card__title {
    margin-top: 12rpx;
    color: #222222;
    font-size: 24rpx;
    line-height: 32rpx;
    text-align: center;
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
    width: 112rpx;
    height: 112rpx;
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
