<template>
    <view class="sort-page">
        <view class="sort-header">
            <view class="sort-search">
                <view class="sort-search__glass">
                    <view class="sort-search__glass-circle"></view>
                    <view class="sort-search__glass-line"></view>
                </view>
                <input
                    v-model="searchKeyword"
                    class="sort-search__input"
                    confirm-type="search"
                    placeholder="请输入您想要的商品"
                    placeholder-class="sort-search__placeholder"
                    @confirm="onSortSearch"
                />
                <view class="sort-search__btn" @tap="onSortSearch">搜索</view>
            </view>
        </view>

        <view class="sort-main">
            <scroll-view class="sort-aside" scroll-y scroll-with-animation>
                <view
                    v-for="(item, index) in sideCategories"
                    :key="index"
                    :class="['sort-aside__item', index === activeIndex ? 'is-active' : '']"
                    @tap="changeCategory(index)"
                >
                    <text class="sort-aside__text line1">{{ item.name }}</text>
                </view>
            </scroll-view>

            <scroll-view
                class="sort-content"
                scroll-y
                scroll-with-animation
                refresher-enabled
                :refresher-triggered="refreshing"
                :scroll-into-view="contentAnchor"
                @refresherrefresh="refreshCategoryList"
            >
                <view id="sort-content-top" class="sort-content__inner">
                    <view class="sort-topline">
                        <text class="sort-topline__title">{{ currentCategory.name || '热卖类目' }}</text>
                    </view>

                    <view class="sort-grid">
                        <navigator
                            v-for="(item, index) in hotCategories"
                            :key="`${item.name}-${index}`"
                            class="sort-grid__item"
                            hover-class="none"
                            :url="buildSearchUrl(item)"
                        >
                            <view v-if="isEmptyImage(item.image)" class="sort-grid__image image-placeholder">无</view>
                            <image v-else class="sort-grid__image" :src="item.image" mode="aspectFit"></image>
                            <text class="sort-grid__name line1">{{ item.name }}</text>
                        </navigator>
                    </view>

                    <view v-if="likeGoods.length" class="sort-section-title">猜你喜欢</view>
                    <view v-if="likeGoods.length" class="sort-like-grid">
                        <navigator
                            v-for="(item, index) in likeGoods"
                            :key="item.id || index"
                            class="sort-like-card"
                            hover-class="none"
                            :url="`/bundle/pages/goods_details/goods_details?id=${item.id || 1}`"
                        >
                            <view v-if="isEmptyImage(item.image)" class="sort-like-card__image image-placeholder">无</view>
                            <image v-else class="sort-like-card__image" :src="item.image" mode="aspectFill"></image>
                            <view class="sort-like-card__body">
                                <text class="sort-like-card__name line2">{{ item.name }}</text>
                                <view class="sort-like-card__footer">
                                    <text class="sort-like-card__price">¥{{ item.price }}</text>
                                    <text class="sort-like-card__sold">{{ item.sold }}人付款</text>
                                </view>
                            </view>
                        </navigator>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getCatrgory } from '@/api/store'
import Cache from '@/utils/cache'
import { setTabbar } from '@/utils/tools'
import { getDesignAsset, designAssetList } from '@/utils/design-assets'
import { isPlaceholderImage } from '@/utils/image-placeholder'

const defaultCategories = [
    '为你推荐',
    '保健食品',
    '家庭日用',
    '护理美发',
    '母婴用品',
    '服饰内衣',
    '礼品箱包',
    '出行箱包',
    '个护化妆',
    '家居家电'
]

const fallbackHotCategories = [
    { name: '冬季毛衣', image: designAssetList.categoryFallbacks[0] },
    { name: '风衣', image: designAssetList.categoryFallbacks[1] },
    { name: '冬季毛衣', image: designAssetList.categoryFallbacks[2] },
    { name: '冬季毛衣', image: designAssetList.categoryFallbacks[0] },
    { name: '风衣', image: designAssetList.categoryFallbacks[1] },
    { name: '冬季毛衣', image: designAssetList.categoryFallbacks[2] },
    { name: '冬季毛衣', image: designAssetList.categoryFallbacks[0] },
    { name: '风衣', image: designAssetList.categoryFallbacks[1] },
    { name: '冬季毛衣', image: designAssetList.categoryFallbacks[2] }
]

export default {
    data() {
        return {
            activeIndex: 0,
            contentAnchor: '',
            searchKeyword: '',
            refreshing: false,
            categoryLoading: false,
            didShowOnce: false,
            cateList: []
        }
    },
    computed: {
        ...mapGetters(['cartNum', 'inviteCode']),
        sideCategories() {
            return this.cateList.length ? this.cateList : defaultCategories.map((name) => ({ name }))
        },
        currentCategory() {
            return this.sideCategories[this.activeIndex] || {}
        },
        hotCategories() {
            const sons = this.currentCategory.sons || this.currentCategory.children || []
            const source = sons.length ? sons : fallbackHotCategories
            return source.slice(0, 9).map((item, index) => ({
                id: item.id || item.categoryId,
                name: item.name || fallbackHotCategories[index % fallbackHotCategories.length].name,
                image: this.resolveImage(item.icon || item.image || item.iconUrl || item.imageUrl || item.pic || item.cover, index)
            }))
        },
        likeGoods() {
            const goodsList = this.currentCategory.goodsList || this.currentCategory.products || []
            if (goodsList.length) {
                return goodsList.slice(0, 4).map((item, index) => ({
                    id: item.id || item.spuId || item.productId || index + 1,
                    name: item.name || item.spuName || item.productName || item.title || '推荐商品',
                    price: item.price || item.salePrice || item.minPrice || 0,
                    sold: item.salesCount || item.sales_sum || item.sold || 0,
                    image: this.resolveImage(item.image || item.cover || item.mainImageUrl || item.imageUrl, index)
                }))
            }
            return []
        }
    },
    onLoad() {
        setTabbar()
        this.getCategoryList()
    },
    onShow() {
        if (!this.didShowOnce) {
            this.didShowOnce = true
        } else {
            this.getCategoryList()
        }
        this.getCartNum()
    },
    onShareAppMessage() {
        const shareInfo = Cache.get('shareInfo') || {}
        return {
            title: shareInfo.mnp_share_title,
            path: 'pages/index/index?invite_code=' + this.inviteCode,
            imageUrl: shareInfo.mnp_share_image
        }
    },
    methods: {
        ...mapActions(['getCartNum']),
        async getCategoryList() {
            if (this.categoryLoading) return Promise.resolve()
            this.categoryLoading = true
            try {
                const res = await getCatrgory()
                if (res.code == 1) {
                    this.cateList = res.data || []
                    this.activeIndex = 0
                }
            } catch (error) {
                console.error('[sort-tab] getCategoryList failed:', error)
            } finally {
                this.categoryLoading = false
            }
        },
        refreshCategoryList() {
            if (this.refreshing) return Promise.resolve()
            this.refreshing = true
            return this.getCategoryList().finally(() => {
                this.refreshing = false
            })
        },
        changeCategory(index) {
            if (index === this.activeIndex) return
            this.activeIndex = index
            this.contentAnchor = ''
            this.$nextTick(() => {
                this.contentAnchor = 'sort-content-top'
            })
        },
        buildSearchUrl(item) {
            const id = item.id || ''
            const name = encodeURIComponent(item.name || '')
            return `/bundle/pages/goods_search/goods_search?id=${id}&name=${name}`
        },
        onSortSearch() {
            const keyword = (this.searchKeyword || '').trim()
            if (!keyword) return
            uni.navigateTo({
                url: `/bundle/pages/goods_search/goods_search?keyword=${encodeURIComponent(keyword)}`
            })
        },
        resolveImage(image, index) {
            if (image) {
                return getDesignAsset(image)
            }
            return ''
        },
        isEmptyImage(src) {
            return isPlaceholderImage(src)
        }
    }
}
</script>

<style lang="scss">
.sort-page {
    --page-safe-top: var(--status-bar-height, 44rpx);
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    min-height: 100vh;
    overflow: hidden;
    background: #ffffff;
}

.sort-header {
    flex: none;
    padding: calc(var(--page-safe-top) + 18rpx) 24rpx 18rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.sort-search {
    position: relative;
    display: flex;
    align-items: center;
    height: 76rpx;
    padding: 0 8rpx 0 28rpx;
    box-sizing: border-box;
    border: 1rpx solid rgba(22, 136, 255, 0.16);
    border-radius: 42rpx;
    background: #f0f7ff;
    box-shadow: 0 10rpx 28rpx rgba(22, 136, 255, 0.08);
    overflow: hidden;
}

.sort-search::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0));
    pointer-events: none;
}

.sort-search__glass {
    position: relative;
    flex: none;
    width: 36rpx;
    height: 36rpx;
    margin-right: 16rpx;
    color: #1688ff;
    z-index: 1;
}

.sort-search__glass-circle {
    position: absolute;
    left: 3rpx;
    top: 2rpx;
    width: 22rpx;
    height: 22rpx;
    border: 4rpx solid currentColor;
    border-radius: 50%;
    box-sizing: border-box;
}

.sort-search__glass-line {
    position: absolute;
    right: 4rpx;
    bottom: 6rpx;
    width: 16rpx;
    height: 4rpx;
    border-radius: 4rpx;
    background: currentColor;
    transform: rotate(45deg);
    transform-origin: right center;
}

.sort-search__placeholder {
    color: #c4c4c4;
    font-size: 24rpx;
}

.sort-search__input {
    flex: 1;
    min-width: 0;
    height: 72rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 72rpx;
    position: relative;
    z-index: 1;
}

.sort-search__btn {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    height: 60rpx;
    margin-left: 14rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 600;
    border-radius: 30rpx;
    background: linear-gradient(135deg, #45a5ff 0%, #1688ff 100%);
    box-shadow: 0 8rpx 18rpx rgba(22, 136, 255, 0.24);
}

.sort-main {
    display: flex;
    flex: 1;
    min-height: 0;
}

.sort-aside {
    flex: none;
    width: 164rpx;
    height: 100%;
    padding: 8rpx 0 20rpx;
    box-sizing: border-box;
    background: #f7f7f7;
}

.sort-aside__item {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 112rpx;
    padding: 0 18rpx 0 32rpx;
    box-sizing: border-box;
    color: #222222;
    font-size: 26rpx;
    line-height: 36rpx;
}

.sort-aside__item.is-active {
    color: #1688ff;
    font-weight: 600;
    background: #ffffff;
    border-radius: 0 26rpx 26rpx 0;
}

.sort-aside__item.is-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 6rpx;
    height: 32rpx;
    transform: translateY(-50%);
    border-radius: 0 8rpx 8rpx 0;
    background: #1688ff;
}

.sort-aside__text {
    display: block;
    width: 100%;
}

.sort-content {
    flex: 1;
    height: 100%;
}

.sort-content__inner {
    padding: 10rpx 24rpx calc(180rpx + var(--window-bottom) + env(safe-area-inset-bottom)) 26rpx;
    box-sizing: border-box;
}

.sort-topline {
    display: flex;
    align-items: flex-end;
    gap: 46rpx;
    margin-bottom: 18rpx;
}

.sort-topline__active {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 48rpx;
    color: #1688ff;
    font-size: 28rpx;
    font-weight: 600;
}

.sort-topline__marker {
    width: 6rpx;
    height: 28rpx;
    margin-right: 16rpx;
    border-radius: 0 8rpx 8rpx 0;
    background: #1688ff;
}

.sort-topline__title {
    color: #222222;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 46rpx;
}

.sort-grid {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 18rpx;
}

.sort-grid__item {
    width: 33.333%;
    margin-bottom: 28rpx;
    text-align: center;
}

.sort-grid__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 132rpx;
    height: 132rpx;
    border-radius: 14rpx;
    background: #eef1f5;
}

.image-placeholder {
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 32rpx;
    text-align: center;
}

.sort-grid__name {
    display: block;
    margin-top: 12rpx;
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 40rpx;
}

.sort-section-title {
    margin: 12rpx 0 20rpx;
    color: #222222;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 46rpx;
}

.sort-like-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.sort-like-card {
    width: 48.4%;
    margin-bottom: 18rpx;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 22rpx;
    background: #ffffff;
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.sort-like-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 220rpx;
    background: #eef1f5;
}

.sort-like-card__body {
    padding: 14rpx 12rpx 16rpx;
}

.sort-like-card__name {
    color: #222222;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 34rpx;
}

.sort-like-card__footer {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 12rpx;
}

.sort-like-card__price {
    color: #ff2d2d;
    font-size: 28rpx;
    font-weight: 700;
    line-height: 42rpx;
}

.sort-like-card__sold {
    flex: none;
    margin-left: 8rpx;
    color: #999999;
    font-size: 20rpx;
    line-height: 30rpx;
    white-space: nowrap;
}
</style>
