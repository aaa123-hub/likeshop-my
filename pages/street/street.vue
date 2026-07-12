<template>
    <view class="street-page">
        <view class="street-header">
            <view class="street-header__nav">
                <view class="street-header__title">商街</view>
                <view class="street-header__capsule">
                    <view class="street-header__capsule-dot"></view>
                    <view class="street-header__capsule-divider"></view>
                    <view class="street-header__capsule-circle"></view>
                </view>
            </view>
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
                    <view class="street-search__icon-lens"></view>
                </view>
            </view>
        </view>

        <view class="street-sheet">
            <view class="street-service-section">
                <swiper
                    v-if="streetCategoryPages.length"
                    class="street-service-swiper"
                    :indicator-dots="false"
                    indicator-color="rgba(160, 97, 13, 0.22)"
                    indicator-active-color="#a0610d"
                    :autoplay="false"
                    :circular="false"
                >
                    <swiper-item v-for="(page, pageIndex) in streetCategoryPages" :key="pageIndex">
                        <view class="street-service-grid">
                            <view
                                v-for="(item, index) in page"
                                :key="item.key || index"
                                class="street-service-item"
                                :data-page-index="pageIndex"
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
                    </swiper-item>
                </swiper>
                <view v-if="!streetCategoryPages.length && !streetLoading" class="street-empty street-empty--grid">暂无分类</view>
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
                        <view class="street-merchant-card__rating" v-if="item.score">
                            <view class="street-merchant-card__stars">
                                <text
                                    v-for="starIndex in item.starCount"
                                    :key="starIndex"
                                    class="street-merchant-card__star"
                                >★</text>
                            </view>
                            <text class="street-merchant-card__score">{{ item.score }}</text>
                        </view>
                        <view class="street-merchant-card__time-row">
                            <view class="street-merchant-card__time-icon"></view>
                            <text class="street-merchant-card__time line1">{{ item.meta }}</text>
                        </view>
                    </view>
                </view>
                <view v-if="!streetMerchants.length && !streetLoading" class="street-empty">暂无商家</view>
            </view>
        </view>
    </view>
</template>

<script>
import { getStreetIndex } from '@/api/store'
import { setTabbar, tabbarList } from '@/utils/tools'
import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder'
const fallbackStreetCategories = []

export default {
    data() {
        return {
            streetKeyword: '',
            streetSearchText: '输入关键词',
            streetLoaded: false,
            streetLoading: false,
            navigating: false,
            streetCategories: [],
            backendCategoryPages: [],
            streetMerchants: []
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
    computed: {
        streetCategoryPages() {
            if (this.backendCategoryPages.length) return this.backendCategoryPages
            const pageSize = 8
            const list = Array.isArray(this.streetCategories) && this.streetCategories.length
                ? this.streetCategories
                : fallbackStreetCategories.map((item, index) => this.mapStreetCategory(item, {}, index))
            const pages = []
            for (let index = 0; index < list.length; index += pageSize) {
                pages.push(list.slice(index, index + pageSize))
            }
            return pages
        }
    },
    methods: {
        async loadStreetIndex() {
            if (this.streetLoaded) return Promise.resolve()
            this.streetLoaded = true
            this.streetLoading = true
            try {
                const res = await getStreetIndex({ keyword: this.streetKeyword })
                if (res.code != 1 || !res.data) {
                    this.streetCategories = []
                    this.backendCategoryPages = []
                    this.streetMerchants = []
                    return
                }
                const data = res.data
                const searchBox = data.searchBox || {}
                const recommendedCategories = Array.isArray(data.recommendedCategories) ? data.recommendedCategories : []
                const categoryPages = Array.isArray(data.categoryPages) ? data.categoryPages : []
                const recommendedShops = Array.isArray(data.recommendedShops) ? data.recommendedShops : []
                this.streetSearchText = searchBox.keyword || searchBox.placeholder || this.streetSearchText
                this.streetCategories = recommendedCategories.map((item, index) => this.mapStreetCategory(item, {}, index))
                this.backendCategoryPages = categoryPages
                    .map(page => (Array.isArray(page) ? page : []).map((item, index) => this.mapStreetCategory(item, {}, index)))
                    .filter(page => page.length)
                this.streetMerchants = recommendedShops.map(item => this.mapStreetMerchant(item, {}))
            } catch (error) {
                this.streetCategories = []
                this.backendCategoryPages = []
                this.streetMerchants = []
            } finally {
                this.streetLoading = false
            }
        },
        mapStreetCategory(item = {}, fallback = {}, index = 0) {
            const categoryId = item.categoryId || item.id || fallback.categoryId || fallback.id || ''
            return {
                ...fallback,
                ...item,
                name: item.name || item.categoryName || fallback.name || '',
                image: resolveImage(item.image || item.icon || item.iconUrl || fallback.image),
                categoryId,
                url: categoryId
                    ? `/business/pages/business_pages/street_goods?categoryId=${categoryId}`
                    : (fallback.url || '/business/pages/business_pages/street_goods'),
                key: categoryId || item.name || item.categoryName || fallback.name || index
            }
        },
        mapStreetMerchant(item = {}, fallback = {}) {
            const shopId = item.shop_id || item.shopId || item.merchantShopId || item.merchant_shop_id || item.id || fallback.shopId || ''
            const scoreValue = item.shop_score ?? item.shopScore ?? item.score ?? item.star ?? item.rating ?? fallback.score
            const statusLabel = this.getStreetOpenStatusLabel(item.open_status || item.openStatus, item.businessHours || item.business_hours || item.openHours)
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
                meta: metaParts.join(' · ') || fallback.meta || '',
                url: shopId
                    ? `/business/pages/business_pages/store_detail?shopId=${shopId}`
                    : (fallback.url || '/business/pages/business_pages/store_detail')
            }
        },
        isEmptyImage(src) {
            return isPlaceholderImage(src)
        },
        formatStreetScore(value) {
            if (value === '' || value === null || value === undefined) return ''
            const score = Number(value)
            if (Number.isNaN(score)) return String(value)
            return score.toFixed(1)
        },
        getStreetStarCount(value) {
            const score = Number(value)
            if (Number.isNaN(score) || score <= 0) return 0
            return Math.max(1, Math.min(5, Math.round(score)))
        },
        inferOpenStatusFromHours(hours, status = '') {
            const text = String(hours || '').trim()
            if (!text) return String(status || '').toUpperCase()
            if (/24\s*小时|全天|00[:：]00\s*[-~至到]\s*24[:：]00/i.test(text)) return 'OPEN'
            const match = text.match(/(\d{1,2})[:：](\d{2})\s*(?:-|~|至|到)\s*(\d{1,2})[:：](\d{2})/)
            if (!match) return String(status || '').toUpperCase()
            const start = Math.max(0, Math.min(23, Number(match[1]) || 0)) * 60 + Math.max(0, Math.min(59, Number(match[2]) || 0))
            const end = Math.max(0, Math.min(23, Number(match[3]) || 0)) * 60 + Math.max(0, Math.min(59, Number(match[4]) || 0))
            const now = new Date()
            const current = now.getHours() * 60 + now.getMinutes()
            if (start === end) return 'OPEN'
            return start < end
                ? (current >= start && current < end ? 'OPEN' : 'CLOSED')
                : (current >= start || current < end ? 'OPEN' : 'CLOSED')
        },
        getStreetOpenStatusLabel(status, hours = '') {
            const normalized = this.inferOpenStatusFromHours(hours, status)
            if (normalized === 'OPEN') return '营业中'
            if (normalized === 'CLOSED') return '未营业'
            if (normalized === 'REST') return '休息中'
            return normalized || ''
        },
        onStreetSearch() {
            this.streetKeyword = (this.streetKeyword || '').trim()
            this.streetLoaded = false
            uni.hideKeyboard()
            this.loadStreetIndex()
        },
        openStreetCategory(event) {
            const dataset = event && event.currentTarget && event.currentTarget.dataset ? event.currentTarget.dataset : {}
            const pageIndex = Number(dataset.pageIndex || 0)
            const index = Number(dataset.index || 0)
            const page = this.streetCategoryPages[pageIndex] || []
            const item = page[index]
            this.goPage(item && item.url)
        },
        openStreetMerchant(event) {
            const index = Number(event && event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.index)
            const item = this.streetMerchants[index]
            if (!item || (!item.shopId && !item.url)) return
            this.goPage(item.url)
        },
        goPage(eventOrUrl) {
            const url = typeof eventOrUrl === 'string'
                ? eventOrUrl
                : eventOrUrl && eventOrUrl.currentTarget && eventOrUrl.currentTarget.dataset && eventOrUrl.currentTarget.dataset.url
            if (!url || this.navigating) return
            this.navigating = true
            const routePath = url.split('?')[0].replace(/^\//, '')
            const navigateFail = () => {
                this.navigating = false
                uni.showToast({ title: '页面暂不可打开', icon: 'none' })
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
            uni.navigateTo({ url, complete: navigateComplete, fail: navigateFail })
        }
    }
}
</script>

<style lang="scss">
.street-page {
    --page-safe-top: var(--status-bar-height, 44rpx);
    position: relative;
    min-height: 100vh;
    padding-bottom: calc(40rpx + var(--window-bottom));
    background: #f8ede1;
    box-sizing: border-box;
    overflow-x: hidden;
}

.street-page::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 396rpx;
    background: linear-gradient(180deg, #f3d2a7 0%, #f8ede1 100%);
}

.street-header {
    position: relative;
    z-index: 4;
    padding: calc(var(--page-safe-top) + 28rpx) 24rpx 26rpx;
    box-sizing: border-box;
}

.street-header__nav {
    position: relative;
    width: 100%;
    max-width: 702rpx;
    height: 58rpx;
    margin: 0 auto;
}

.street-header__title {
    position: absolute;
    left: 50%;
    top: 11rpx;
    color: #5f350d;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 36rpx;
    white-space: nowrap;
    transform: translateX(-50%);
}

.street-header__capsule {
    position: absolute;
    right: 0;
    top: 22rpx;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 168rpx;
    height: 64rpx;
    padding: 0 25rpx;
    border: 1rpx solid transparent;
    border-radius: 32rpx;
    background: transparent;
    box-sizing: border-box;
    opacity: 0;
}

.street-header__capsule-dot {
    width: 9rpx;
    height: 9rpx;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 20rpx 0 0 #ffffff, 40rpx 0 0 #ffffff;
}

.street-header__capsule-divider {
    width: 1rpx;
    height: 34rpx;
    margin-left: 36rpx;
    background: rgba(255, 255, 255, .38);
}

.street-header__capsule-circle {
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid #ffffff;
    border-radius: 50%;
    box-sizing: border-box;
}

.street-search {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100vw - 48rpx);
    max-width: 702rpx;
    height: 65rpx;
    margin: 24rpx auto 0;
    padding: 0 29rpx 0 39rpx;
    background: rgba(255, 249, 240, .92);
    border: 1rpx solid rgba(160, 97, 13, .4);
    border-radius: 33rpx;
    box-shadow: 0 10rpx 24rpx rgba(118, 66, 19, .06);
    box-sizing: border-box;
}

.street-search__input {
    flex: 1;
    min-width: 0;
    height: 61rpx;
    padding-right: 18rpx;
    color: #222222;
    font-size: 22rpx;
    line-height: 61rpx;
}

.street-search__placeholder {
    color: #b7b7b7;
    font-size: 22rpx;
}

.street-search__icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42rpx;
    height: 42rpx;
}

.street-search__icon-lens {
    position: relative;
    width: 34rpx;
    height: 34rpx;
}

.street-search__icon-lens::before {
    content: '';
    position: absolute;
    left: 4rpx;
    top: 3rpx;
    width: 20rpx;
    height: 20rpx;
    border: 4rpx solid #a0610d;
    border-radius: 50%;
    box-sizing: border-box;
}

.street-search__icon-lens::after {
    content: '';
    position: absolute;
    right: 3rpx;
    bottom: 5rpx;
    width: 13rpx;
    height: 4rpx;
    background: #a0610d;
    border-radius: 4rpx;
    transform: rotate(45deg);
    transform-origin: right center;
}

.street-sheet {
    position: relative;
    z-index: 2;
    min-height: calc(100vh - 173rpx);
    margin-top: 0;
    padding-top: 18rpx;
    background: #f8ede1;
    border-top-left-radius: 24rpx;
    border-top-right-radius: 24rpx;
    box-shadow: 0 -8rpx 24rpx rgba(118, 66, 19, .04);
}

.street-service-section {
    padding: 0 24rpx;
}

.street-service-swiper {
    height: 284rpx;
}

.street-service-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    padding: 0;
}

.street-service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
    flex: 0 0 25%;
    min-width: 0;
    height: 124rpx;
    margin-bottom: 18rpx;
    box-sizing: border-box;
}

.street-service-item__icon-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 84rpx;
    height: 76rpx;
}

.street-service-item__image {
    width: 84rpx;
    height: 76rpx;
}

.street-service-item__text {
    max-width: 132rpx;
    margin-top: 10rpx;
    overflow: hidden;
    color: #222222;
    font-size: 24rpx;
    line-height: 30rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.street-merchant-list {
    padding: 8rpx 24rpx 32rpx;
}

.street-empty {
    width: 100%;
    padding: 52rpx 24rpx;
    color: #9ca3af;
    font-size: 26rpx;
    line-height: 36rpx;
    text-align: center;
    box-sizing: border-box;
}

.street-empty--grid {
    padding-top: 12rpx;
    padding-bottom: 34rpx;
}

.street-merchant-card {
    display: flex;
    align-items: flex-start;
    min-height: 188rpx;
    margin-bottom: 18rpx;
    background: #fff9f0;
    border-radius: 15rpx;
    border: 1rpx solid rgba(160, 97, 13, .1);
    box-shadow: 0 10rpx 24rpx rgba(118, 66, 19, .05);
    overflow: hidden;
    box-sizing: border-box;
}

.street-merchant-card__image-shell { flex: none; width: 152rpx; height: 152rpx; margin: 18rpx 0 18rpx 18rpx; border-radius: 12rpx; background: #fff7f1; overflow: hidden; }
.street-merchant-card__image { display: flex; align-items: center; justify-content: center; width: 152rpx; height: 152rpx; object-fit: cover; }
.image-placeholder { color: #9ca3af; font-size: 24rpx; line-height: 32rpx; text-align: center; background: #eef1f5; }
.street-merchant-card__body { flex: 1; min-width: 0; padding: 24rpx 22rpx 18rpx 24rpx; }
.street-merchant-card__title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 40rpx; }
.street-merchant-card__rating { display: flex; align-items: center; margin-top: 12rpx; }
.street-merchant-card__stars { display: flex; align-items: center; }
.street-merchant-card__star { width: 24rpx; height: 23rpx; margin-right: 3rpx; color: #ffb02e; font-size: 22rpx; line-height: 23rpx; text-align: center; }
.street-merchant-card__score { margin-left: 9rpx; color: #f86821; font-size: 24rpx; font-weight: 500; line-height: 24rpx; }
.street-merchant-card__time-row { display: flex; align-items: center; margin-top: 20rpx; }
.street-merchant-card__time-icon { position: relative; width: 25rpx; height: 25rpx; margin-right: 6rpx; border: 3rpx solid #9aa0a6; border-radius: 50%; box-sizing: border-box; }
.street-merchant-card__time-icon::before { content: ''; position: absolute; left: 9rpx; top: 4rpx; width: 3rpx; height: 8rpx; background: #9aa0a6; border-radius: 3rpx; }
.street-merchant-card__time-icon::after { content: ''; position: absolute; left: 10rpx; top: 10rpx; width: 7rpx; height: 3rpx; background: #9aa0a6; border-radius: 3rpx; transform: rotate(25deg); transform-origin: left center; }
.street-merchant-card__time { color: #666666; font-size: 24rpx; font-weight: 500; line-height: 34rpx; }
.line1 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
