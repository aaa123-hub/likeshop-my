<template>
    <view class="street-page">
        <view class="street-header">
            <view class="street-header__title">商街</view>
            <view class="street-search">
                <input
                    v-model="streetKeyword"
                    class="street-search__input"
                    confirm-type="search"
                    :placeholder="streetSearchText"
                    placeholder-class="street-search__placeholder"
                    @confirm="onStreetSearch"
                />
                <view class="street-search__icon" @tap="onStreetSearch">
                    <image class="street-search__icon-image" :src="streetSearchIcon" mode="aspectFit"></image>
                </view>
            </view>
        </view>

        <view class="street-sheet">
            <view class="street-service-grid">
                <view
                    v-for="(item, index) in streetCategories"
                    :key="index"
                    class="street-service-item"
                    :data-index="index"
                    @tap.stop="openStreetCategory"
                >
                    <view class="street-service-item__icon-shell">
                        <view v-if="isEmptyImage(item.image)" class="street-service-item__image image-placeholder">无</view>
                        <image v-else class="street-service-item__image" :src="item.image" mode="aspectFit"></image>
                    </view>
                    <text class="street-service-item__text">{{ item.name }}</text>
                </view>
            </view>

            <view class="street-merchant-list">
                <view
                    v-for="(item, index) in streetMerchants"
                    :key="index"
                    class="street-merchant-card"
                    :data-index="index"
                    @tap.stop="openStreetMerchant"
                >
                    <view class="street-merchant-card__image-shell">
                        <view v-if="isEmptyImage(item.image)" class="street-merchant-card__image image-placeholder">无</view>
                        <image v-else class="street-merchant-card__image" :src="item.image" mode="aspectFill"></image>
                    </view>
                    <view class="street-merchant-card__body">
                        <view class="street-merchant-card__title line1">{{ item.name }}</view>
                        <view class="street-merchant-card__rating">
                            <view class="street-merchant-card__stars">
                                <image
                                    v-for="starIndex in item.starCount"
                                    :key="starIndex"
                                    class="street-merchant-card__star"
                                    :src="streetStarIcon"
                                    mode="aspectFit"
                                ></image>
                            </view>
                            <text class="street-merchant-card__score">{{ item.score }}</text>
                        </view>
                        <view class="street-merchant-card__time-row">
                            <image class="street-merchant-card__time-icon" :src="streetTimeIcon" mode="aspectFit"></image>
                            <text class="street-merchant-card__time line1">{{ item.meta }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getStreetIndex } from '@/api/store'
import { setTabbar, tabbarList } from '@/utils/tools'
import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder'

const streetAsset = (name) => `/static/lanhu/slices/street/${name}`
const merchantThumb = ''
const emptyServiceNames = ['服装', '本地生活', '粮油饮品']

export default {
    data() {
        return {
            streetKeyword: '',
            streetSearchText: '输入关键词',
            streetLoaded: false,
            navigating: false,
            streetSearchIcon: streetAsset('searchlist_menu_capsule.png'),
            streetStarIcon: streetAsset('searchlist_star.png'),
            streetTimeIcon: streetAsset('searchlist_time.png'),
            streetCategories: [
                { name: '美食餐饮', image: streetAsset('image_4.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '休闲娱乐', image: streetAsset('image_4_2.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '美容美发', image: streetAsset('image_4_3.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '体育运动', image: streetAsset('image_4_4.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '酒店住宿', image: streetAsset('image_4_5.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '本地生活', image: '', url: '/business/pages/business_pages/street_goods' },
                { name: '百货日用', image: streetAsset('image_4_7.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '粮油饮品', image: '', url: '/business/pages/business_pages/street_goods' }
            ],
            streetMerchants: [
                { name: '广州市越秀区斌记面家', score: '5.0', meta: '营业中 · 到店体验', image: merchantThumb, url: '/business/pages/business_pages/store_detail' },
                { name: '本地生活精选店', score: '5.0', meta: '营业中 · 本地生活', image: merchantThumb, url: '/business/pages/business_pages/store_detail' },
                { name: '社区优选服务中心', score: '5.0', meta: '营业中 · 社区服务', image: merchantThumb, url: '/business/pages/business_pages/store_detail' }
            ]
        }
    },
    onLoad() {
        setTabbar()
    },
    onShow() {
        uni.showTabBar()
        setTabbar()
        this.streetLoaded = false
        this.loadStreetIndex()
    },
    onPullDownRefresh() {
        this.streetLoaded = false
        this.loadStreetIndex().finally(() => {
            uni.stopPullDownRefresh()
        })
    },
    methods: {
        async loadStreetIndex() {
            if (this.streetLoaded) return Promise.resolve()
            this.streetLoaded = true
            const defaultCategories = this.streetCategories.slice()
            const defaultMerchants = this.streetMerchants.slice()
            try {
                const res = await getStreetIndex({
                    keyword: this.streetKeyword
                })
                if (res.code != 1 || !res.data) return
                const data = res.data
                const searchBox = data.searchBox || {}
                const recommendedCategories = Array.isArray(data.recommendedCategories) ? data.recommendedCategories : []
                const recommendedShops = Array.isArray(data.recommendedShops) ? data.recommendedShops : []
                this.streetSearchText = searchBox.keyword || searchBox.placeholder || this.streetSearchText
                this.streetCategories = recommendedCategories.length
                    ? recommendedCategories.map((item, index) => this.mapStreetCategory(item, defaultCategories[index], index))
                    : defaultCategories
                this.streetMerchants = recommendedShops.length
                    ? recommendedShops.map((item, index) => this.mapStreetMerchant(item, defaultMerchants[index]))
                    : defaultMerchants
            } catch (error) {
                this.streetCategories = defaultCategories
                this.streetMerchants = defaultMerchants
            }
        },
        mapStreetCategory(item = {}, fallback = {}, index = 0) {
            const categoryId = item.categoryId || item.id || fallback.categoryId || fallback.id || ''
            return {
                ...fallback,
                ...item,
                name: item.name || fallback.name || '',
                image: this.shouldUseEmptyServiceImage(item.name || fallback.name) ? '' : resolveImage(item.image || fallback.image),
                categoryId,
                url: categoryId
                    ? `/business/pages/business_pages/street_goods?categoryId=${categoryId}`
                    : (fallback.url || '/business/pages/business_pages/street_goods'),
                key: categoryId || item.name || fallback.name || index
            }
        },
        mapStreetMerchant(item = {}, fallback = {}) {
            const shopId = item.shop_id || item.shopId || item.merchantShopId || item.merchant_shop_id || item.id || fallback.shopId || ''
            const scoreValue = item.shop_score ?? item.shopScore ?? item.score ?? item.star ?? item.rating ?? fallback.score
            const statusLabel = this.getStreetOpenStatusLabel(item.open_status || item.openStatus)
            const address = item.detail_address || item.detailAddress || item.address || fallback.detailAddress || ''
            const metaParts = [statusLabel, address].filter(Boolean)
            return {
                ...fallback,
                ...item,
                shopId,
                name: item.shop_name || item.shopName || item.name || fallback.name || '',
                score: this.formatStreetScore(scoreValue),
                starCount: this.getStreetStarCount(scoreValue),
                image: resolveImage(item.shop_logo || item.shopLogo || item.logo || item.logoUrl || item.avatarUrl || item.image || item.cover || item.imageUrl || item.picUrl || fallback.image, 'goods'),
                meta: metaParts.join(' · ') || fallback.meta || '营业状态待更新',
                url: shopId
                    ? `/business/pages/business_pages/store_detail?shopId=${shopId}`
                    : (fallback.url || '/business/pages/business_pages/store_detail')
            }
        },
        isEmptyImage(src) {
            return isPlaceholderImage(src)
        },
        shouldUseEmptyServiceImage(name = '') {
            return emptyServiceNames.some(item => String(name).includes(item))
        },
        formatStreetScore(value) {
            if (value === '' || value === null || value === undefined) return '5.0'
            const score = Number(value)
            if (Number.isNaN(score)) return String(value)
            return score.toFixed(1)
        },
        getStreetStarCount(value) {
            const score = Number(value)
            if (Number.isNaN(score) || score <= 0) return 5
            return Math.max(1, Math.min(5, Math.round(score)))
        },
        getStreetOpenStatusLabel(status) {
            if (!status) return ''
            if (status === 'OPEN') return '营业中'
            if (status === 'CLOSED') return '未营业'
            if (status === 'REST') return '休息中'
            return status
        },
        onStreetSearch() {
            this.streetKeyword = (this.streetKeyword || '').trim()
            this.streetLoaded = false
            uni.hideKeyboard()
            this.loadStreetIndex()
        },
        openStreetCategory(event) {
            const index = Number(event && event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.index)
            const item = this.streetCategories[index]
            this.goPage(item && item.url)
        },
        openStreetMerchant(event) {
            const index = Number(event && event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.index)
            const item = this.streetMerchants[index]
            if (!item) return
            if (!item.shopId && !item.url) {
                return
            }
            this.goPage(item.url)
        },
        goPage(eventOrUrl) {
            const url = typeof eventOrUrl === 'string'
                ? eventOrUrl
                : eventOrUrl && eventOrUrl.currentTarget && eventOrUrl.currentTarget.dataset && eventOrUrl.currentTarget.dataset.url
            if (!url) return
            if (this.navigating) return
            this.navigating = true
            const routePath = url.split('?')[0].replace(/^\//, '')
            const navigateFail = () => {
                this.navigating = false
                uni.showToast({
                    title: '页面暂不可打开',
                    icon: 'none'
                })
            }
            const navigateComplete = () => {
                this.navigating = false
            }
            if (tabbarList.includes(routePath)) {
                uni.switchTab({
                    url: routePath.startsWith('/') ? routePath : `/${routePath}`,
                    complete: navigateComplete,
                    fail: navigateFail
                })
                return
            }
            uni.navigateTo({
                url,
                complete: navigateComplete,
                fail: navigateFail
            })
        }
    }
}
</script>

<style lang="scss">
.street-page {
    --page-safe-top: var(--status-bar-height, 44rpx);
    min-height: 100vh;
    padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, #377df2 0%, #68a3f7 266rpx, #f8f8f8 266rpx, #f8f8f8 100%);
    box-sizing: border-box;
}

.street-header {
    padding: calc(var(--page-safe-top) + 24rpx) 24rpx 20rpx;
}

.street-header__title {
    color: #ffffff;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 64rpx;
    text-align: center;
}

.street-search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 65rpx;
    margin-top: 13rpx;
    padding: 0 18rpx 0 34rpx;
    background: #ffffff;
    border: 2rpx solid #ffffff;
    border-radius: 33rpx;
    box-shadow: 0 8rpx 24rpx rgba(24, 91, 192, 0.12);
    box-sizing: border-box;
}

.street-search__input {
    flex: 1;
    min-width: 0;
    height: 61rpx;
    padding-right: 18rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 61rpx;
}

.street-search__placeholder {
    color: #b7b7b7;
    font-size: 26rpx;
}

.street-search__icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
}

.street-search__icon-image {
    width: 34rpx;
    height: 34rpx;
}

.street-sheet {
    min-height: calc(100vh - 266rpx);
    margin-top: 20rpx;
    background: #f8f8f8;
    border-top-left-radius: 21rpx;
    border-top-right-radius: 21rpx;
    box-shadow: 0 -3rpx 16rpx rgba(224, 224, 224, 0.67);
}

.street-service-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 48rpx 42rpx 0;
}

.street-service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
    flex: 0 0 25%;
    margin-bottom: 34rpx;
}

.street-service-item__icon-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 97rpx;
    height: 84rpx;
}

.street-service-item__image {
    width: 97rpx;
    height: 84rpx;
}

.street-service-item__text {
    margin-top: 18rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 26rpx;
    white-space: nowrap;
}

.street-merchant-list {
    padding: 6rpx 24rpx 24rpx;
}

.street-merchant-card {
    display: flex;
    align-items: flex-start;
    min-height: 226rpx;
    margin-bottom: 26rpx;
    background: #ffffff;
    border-radius: 15rpx;
    overflow: hidden;
}

.street-merchant-card__image-shell {
    flex: none;
    width: 189rpx;
    height: 189rpx;
    margin: 18rpx 0 0 19rpx;
    border-radius: 10rpx;
    background: #fff7f1;
    overflow: hidden;
}

.street-merchant-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 189rpx;
    height: 189rpx;
    object-fit: cover;
}

.image-placeholder {
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 32rpx;
    text-align: center;
    background: #eef1f5;
}

.street-merchant-card__body {
    flex: 1;
    min-width: 0;
    padding: 36rpx 24rpx 0 29rpx;
}

.street-merchant-card__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 500;
    line-height: 30rpx;
}

.street-merchant-card__rating {
    display: flex;
    align-items: center;
    margin-top: 22rpx;
}

.street-merchant-card__stars {
    display: flex;
    align-items: center;
}

.street-merchant-card__star {
    width: 24rpx;
    height: 23rpx;
    margin-right: 3rpx;
}

.street-merchant-card__score {
    margin-left: 9rpx;
    color: #f86821;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.street-merchant-card__time-row {
    display: flex;
    align-items: center;
    margin-top: 46rpx;
}

.street-merchant-card__time-icon {
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
}

.street-merchant-card__time {
    color: #666666;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 26rpx;
}

.line1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
