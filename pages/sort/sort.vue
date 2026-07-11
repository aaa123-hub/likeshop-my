<template>
    <view class="sort-page">
        <view class="sort-header">
            <view class="sort-nav">
                <text class="sort-nav__title">分类</text>
            </view>
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
                    :key="item.id || index"
                    :class="['sort-aside__item', index === activeIndex ? 'is-active' : '']"
                    @tap="changeCategory(index)"
                >
                    <text class="sort-aside__text line2">{{ item.name }}</text>
                </view>
                <view v-if="!sideCategories.length && !categoryLoading" class="sort-aside__empty">暂无分类</view>
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
                    <view v-if="currentCategory.name" class="sort-current">
                        <text class="sort-current__title">{{ currentCategory.name }}</text>
                    </view>

                    <view v-if="!secondCategories.length && !categoryLoading" class="sort-empty">
                        <view class="sort-empty__title">暂无分类</view>
                        <view class="sort-empty__desc">分类数据更新中</view>
                    </view>

                    <view v-if="secondCategories.length" class="sort-second-grid">
                        <view
                            v-for="(second, secondIndex) in secondCategories"
                            :key="second.id || secondIndex"
                            :class="['sort-second-item', secondIndex === activeSecondIndex ? 'is-active' : '']"
                            @tap="selectSecondCategory(secondIndex)"
                        >
                            <view v-if="isEmptyImage(getCategoryImage(second, secondIndex))" class="sort-second-item__icon image-placeholder">
                                {{ categoryInitial(second.name) }}
                            </view>
                            <image v-else class="sort-second-item__icon" :src="getCategoryImage(second, secondIndex)" mode="aspectFit"></image>
                            <text class="sort-second-item__name line1">{{ second.name }}</text>
                        </view>
                    </view>

                    <view v-if="selectedSecondCategory" class="sort-third-panel">
                        <view class="sort-third-panel__title">{{ selectedSecondCategory.name }}</view>
                        <view v-if="selectedThirdCategories.length" class="sort-third-list">
                            <view
                                v-for="(third, thirdIndex) in selectedThirdCategories"
                                :key="third.id || thirdIndex"
                                :class="['sort-third-item', thirdIndex === activeThirdIndex ? 'is-active' : '']"
                                @tap="selectThirdCategory(thirdIndex)"
                            >
                                <text class="sort-third-item__name line1">{{ third.name }}</text>
                            </view>
                        </view>
                        <view v-else class="sort-third-empty">当前二级分类暂无下级类目</view>
                    </view>

                    <view class="sort-section-title">
                        <text>{{ selectedGoodsCategoryName || '分类商品' }}</text>
                        <text class="sort-section-title__meta">销量优先</text>
                    </view>
                    <view v-if="goodsLoading" class="sort-goods-state">商品加载中...</view>
                    <view v-else-if="!categoryGoods.length" class="sort-goods-state">当前类目暂无商品</view>
                    <view v-else class="sort-like-grid">
                        <navigator
                            v-for="(item, index) in categoryGoods"
                            :key="index"
                            class="sort-like-card"
                            hover-class="none"
                            :url="`/bundle/pages/goods_details/goods_details?id=${item.id || 1}`"
                        >
                            <view v-if="isEmptyImage(item.image)" class="sort-like-card__image image-placeholder">图</view>
                            <image v-else class="sort-like-card__image" :src="item.image" mode="aspectFill"></image>
                            <view class="sort-like-card__body">
                                <text class="sort-like-card__name line2">{{ item.name }}</text>
                                <view class="sort-like-card__footer">
                                    <text class="sort-like-card__price">￥{{ item.price }}</text>
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
import { getCatrgory, getGoodsSearch } from '@/api/store'
import Cache from '@/utils/cache'
import { setTabbar } from '@/utils/tools'
import { getDesignAsset } from '@/utils/design-assets'
import { isPlaceholderImage } from '@/utils/image-placeholder'

export default {
    data() {
        return {
            activeIndex: 0,
            activeSecondIndex: 0,
            activeThirdIndex: 0,
            contentAnchor: '',
            searchKeyword: '',
            refreshing: false,
            categoryLoading: false,
            goodsLoading: false,
            didShowOnce: false,
            cateList: [],
            categoryGoods: [],
            goodsRequestKey: ''
        }
    },
    computed: {
        ...mapGetters(['cartNum', 'inviteCode']),
        sideCategories() {
            return this.cateList
        },
        currentCategory() {
            return this.sideCategories[this.activeIndex] || {}
        },
        secondCategories() {
            return this.getCategoryChildren(this.currentCategory)
        },
        selectedSecondCategory() {
            return this.secondCategories[this.activeSecondIndex] || null
        },
        selectedThirdCategories() {
            return this.selectedSecondCategory ? this.getCategoryChildren(this.selectedSecondCategory) : []
        },
        selectedGoodsCategory() {
            return this.selectedThirdCategories[this.activeThirdIndex] || this.selectedSecondCategory || this.currentCategory || {}
        },
        selectedGoodsCategoryId() {
            const item = this.selectedGoodsCategory || {}
            return item.id || item.categoryId || ''
        },
        selectedGoodsCategoryName() {
            return (this.selectedGoodsCategory && this.selectedGoodsCategory.name) || ''
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
            const activeCategoryId = this.currentCategory.id
            try {
                const res = await getCatrgory()
                if (res.code == 1) {
                    this.cateList = res.data || []
                    const nextIndex = activeCategoryId !== undefined && activeCategoryId !== null
                        ? this.cateList.findIndex((item) => String(item.id) === String(activeCategoryId))
                        : this.activeIndex
                    this.activeIndex = nextIndex >= 0 && nextIndex < this.sideCategories.length ? nextIndex : 0
                    this.resetChildSelection()
                    this.loadCategoryGoods()
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
            this.resetChildSelection()
            this.loadCategoryGoods()
            this.contentAnchor = ''
            this.$nextTick(() => {
                this.contentAnchor = 'sort-content-top'
            })
        },
        selectSecondCategory(index) {
            this.activeSecondIndex = index
            this.activeThirdIndex = 0
            this.loadCategoryGoods()
        },
        selectThirdCategory(index) {
            this.activeThirdIndex = index
            this.loadCategoryGoods()
        },
        resetChildSelection() {
            this.activeSecondIndex = 0
            this.activeThirdIndex = 0
        },
        getCategoryChildren(item) {
            return (item && (item.sons || item.children)) || []
        },
        getCategoryImage(item, index) {
            return this.resolveImage(item && (item.icon || item.image || item.iconUrl || item.imageUrl || item.pic || item.cover))
        },
        categoryInitial(name) {
            const text = String(name || '').trim()
            return text ? text.slice(0, 1) : '类'
        },
        async loadCategoryGoods() {
            const categoryId = this.selectedGoodsCategoryId
            const selected = this.selectedGoodsCategory || {}
            const second = this.selectedSecondCategory || {}
            const requestKey = [
                categoryId || '',
                selected.id || '',
                second.id || '',
                this.activeIndex,
                this.activeSecondIndex,
                this.activeThirdIndex
            ].join(':')
            this.goodsRequestKey = requestKey
            if (!categoryId) {
                this.categoryGoods = []
                return
            }
            this.goodsLoading = true
            try {
                const res = await getGoodsSearch({
                    categoryId,
                    category_id: categoryId,
                    thirdCategoryId: selected.id || categoryId,
                    third_category_id: selected.id || categoryId,
                    secondCategoryId: second.id || '',
                    second_category_id: second.id || '',
                    pageNo: 1,
                    pageSize: 20,
                    sortType: 'SALES_DESC',
                    sales_sum: 'SALES_DESC'
                })
                if (this.goodsRequestKey !== requestKey) return
                const list = res.code == 1 && res.data ? (res.data.list || []) : []
                this.categoryGoods = list.map((item, index) => ({
                    id: item.id || item.spuId || item.productId || index + 1,
                    name: item.name || item.spuName || item.productName || item.title || '商品',
                    price: item.price || item.salePrice || item.minPrice || 0,
                    sold: Number(item.salesCount || item.sales_sum || item.sales_count || item.sold || 0),
                    image: this.resolveImage(item.image || item.cover || item.mainImageUrl || item.imageUrl || item.goods_image)
                })).sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
            } catch (error) {
                if (this.goodsRequestKey === requestKey) this.categoryGoods = []
            } finally {
                if (this.goodsRequestKey === requestKey) this.goodsLoading = false
            }
        },
        onSortSearch() {
            const keyword = (this.searchKeyword || '').trim()
            if (!keyword) return
            uni.navigateTo({
                url: `/bundle/pages/goods_search/goods_search?keyword=${encodeURIComponent(keyword)}`
            })
        },
        resolveImage(image) {
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
    --page-safe-top: var(--app-safe-top, var(--status-bar-height, 44rpx));
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    min-height: var(--app-page-height, 100vh);
    max-width: var(--app-max-width, 750rpx);
    margin: 0 auto;
    overflow: hidden;
    background: #ffffff;
}

.sort-header {
    flex: none;
    padding: calc(var(--page-safe-top) + 12rpx) 24rpx 18rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.sort-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    margin-bottom: 14rpx;
}

.sort-nav__title {
    color: #222222;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 48rpx;
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
    color: #9ca3af;
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
    background: #1688ff;
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
    min-height: 104rpx;
    padding: 0 18rpx 0 30rpx;
    box-sizing: border-box;
    color: #222222;
    font-size: 26rpx;
    line-height: 36rpx;
}

.sort-aside__item.is-active {
    color: #1688ff;
    font-weight: 600;
    background: #ffffff;
    border-radius: 0 24rpx 24rpx 0;
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

.sort-aside__empty {
    padding: 40rpx 16rpx;
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 34rpx;
    text-align: center;
}

.sort-content {
    flex: 1;
    min-width: 0;
    height: 100%;
}

.sort-content__inner {
    padding: 18rpx 20rpx calc(180rpx + var(--app-window-bottom, var(--window-bottom, 0px)) + constant(safe-area-inset-bottom)) 20rpx;
    padding: 18rpx 20rpx calc(180rpx + var(--app-window-bottom, var(--window-bottom, 0px)) + env(safe-area-inset-bottom)) 20rpx;
    box-sizing: border-box;
}

.sort-current {
    display: flex;
    align-items: center;
    height: 54rpx;
    margin-bottom: 12rpx;
}

.sort-current__title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.sort-empty {
    padding: 120rpx 24rpx;
    color: #9ca3af;
    text-align: center;
}

.sort-empty__title {
    color: #6b7280;
    font-size: 28rpx;
    line-height: 40rpx;
}

.sort-empty__desc {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
}

.sort-second-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.sort-second-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 156rpx;
    padding: 12rpx 8rpx;
    box-sizing: border-box;
    border: 1rpx solid #edf1f5;
    border-radius: 8rpx;
    background: #ffffff;
}

.sort-second-item.is-active {
    border-color: rgba(22, 136, 255, 0.42);
    background: #edf7ff;
}

.sort-second-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: 8rpx;
    background: #eef6ff;
}

.sort-second-item__name {
    width: 100%;
    margin-top: 12rpx;
    color: #111827;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 34rpx;
    text-align: center;
}

.sort-third-panel {
    padding: 18rpx 16rpx;
    margin-bottom: 18rpx;
    border: 1rpx solid #edf1f5;
    border-radius: 8rpx;
    background: #ffffff;
}

.sort-third-panel__title {
    margin-bottom: 14rpx;
    color: #111827;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 40rpx;
}

.sort-third-list {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx 12rpx;
}

.sort-third-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc((100% - 24rpx) / 3);
    height: 58rpx;
    padding: 0 10rpx;
    box-sizing: border-box;
    border: 1rpx solid #edf1f5;
    border-radius: 8rpx;
    background: #f8fafc;
}

.sort-third-item.is-active {
    border-color: rgba(22, 136, 255, 0.45);
    background: #edf7ff;
}

.sort-third-item__name {
    max-width: 100%;
    color: #374151;
    font-size: 24rpx;
    line-height: 34rpx;
}

.sort-third-item.is-active .sort-third-item__name {
    color: #1688ff;
    font-weight: 600;
}

.sort-third-empty {
    display: flex;
    align-items: center;
    height: 58rpx;
    color: #1688ff;
    font-size: 24rpx;
    line-height: 34rpx;
}

.sort-section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14rpx;
    margin: 32rpx 0 18rpx;
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.sort-section-title__meta {
    flex: none;
    color: #9ca3af;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 32rpx;
}

.sort-goods-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180rpx;
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 34rpx;
    text-align: center;
}

.sort-like-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
}

.sort-like-card {
    display: block;
    overflow: hidden;
    border: 1rpx solid #edf1f5;
    border-radius: 8rpx;
    background: #ffffff;
}

.sort-like-card__image {
    display: block;
    width: 100%;
    height: 210rpx;
    background: #f3f4f6;
}

.sort-like-card__body {
    padding: 14rpx;
}

.sort-like-card__name {
    min-height: 68rpx;
    color: #222222;
    font-size: 24rpx;
    line-height: 34rpx;
}

.sort-like-card__footer {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10rpx;
    margin-top: 10rpx;
}

.sort-like-card__price {
    color: #ef4444;
    font-size: 28rpx;
    font-weight: 700;
}

.sort-like-card__sold {
    color: #9ca3af;
    font-size: 20rpx;
}

.image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1688ff;
    font-size: 24rpx;
    font-weight: 600;
}
</style>
