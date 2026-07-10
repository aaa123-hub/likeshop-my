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
                    :key="index"
                    :class="['sort-aside__item', index === activeIndex ? 'is-active' : '']"
                    @tap="changeCategory(index)"
                >
                    <text class="sort-aside__text line1">{{ item.name }}</text>
                </view>
                <view v-if="!sideCategories.length && !categoryLoading" class="sort-aside__empty">暂无分类</view>
            </scroll-view>

            <view class="sort-content">
                <view v-if="secondCategoryOptions.length" class="sort-second-tabs">
                    <view class="sort-second-tabs__row">
                        <scroll-view class="sort-second-tabs__scroll" scroll-x :show-scrollbar="false">
                            <view class="sort-second-tabs__list">
                                <view
                                    v-for="(item, index) in secondCategoryOptions"
                                    :key="`${item.name}-${index}`"
                                    :class="['sort-second-tabs__item', index === activeSecondIndex ? 'is-active' : '']"
                                    @tap="changeSecondCategory(index)"
                                >
                                    <text class="line1">{{ item.name }}</text>
                                </view>
                            </view>
                        </scroll-view>
                        <view class="sort-second-tabs__arrow" @tap="toggleSecondPanel">
                            <view :class="['sort-second-tabs__arrow-icon', showSecondPanel ? 'is-open' : '']"></view>
                        </view>
                    </view>
                    <view v-if="showSecondPanel" class="sort-second-panel">
                        <view
                            v-for="(item, index) in secondCategoryOptions"
                            :key="`panel-${item.name}-${index}`"
                            :class="['sort-second-panel__item', index === activeSecondIndex ? 'is-active' : '']"
                            @tap="changeSecondCategory(index)"
                        >
                            <text class="line1">{{ item.name }}</text>
                        </view>
                    </view>
                </view>
                <scroll-view
                    class="sort-content__scroll"
                    scroll-y
                    scroll-with-animation
                    refresher-enabled
                    :refresher-triggered="refreshing"
                    :scroll-into-view="contentAnchor"
                    @refresherrefresh="refreshCategoryList"
                >
                    <view id="sort-content-top" class="sort-content__inner">
                        <view v-if="!categoryGroups.length && !categoryLoading" class="sort-empty">
                            <view class="sort-empty__title">暂无分类</view>
                            <view class="sort-empty__desc">分类数据更新中</view>
                        </view>
                        <view v-for="(group, groupIndex) in categoryGroups" :key="`${group.name}-${groupIndex}`" class="sort-category-group">
                            <view v-if="group.name" class="sort-category-group__title">{{ group.name }}</view>
                            <view class="sort-grid">
                                <navigator
                                    v-for="(item, index) in group.children"
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
                        </view>

                        <view v-if="likeGoods.length" class="sort-section-title">猜你喜欢</view>
                        <view v-if="likeGoods.length" class="sort-like-grid">
                            <navigator
                                v-for="(item, index) in likeGoods"
                                :key="index"
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
    </view>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getCatrgory } from '@/api/store'
import Cache from '@/utils/cache'
import { setTabbar } from '@/utils/tools'
import { getDesignAsset } from '@/utils/design-assets'
import { isPlaceholderImage } from '@/utils/image-placeholder'

export default {
    data() {
        return {
            activeIndex: 0,
            activeSecondIndex: 0,
            showSecondPanel: false,
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
            return this.cateList
        },
        currentCategory() {
            return this.sideCategories[this.activeIndex] || {}
        },
        secondCategories() {
            return this.getCategoryChildren(this.currentCategory)
        },
        secondCategoryOptions() {
            if (!this.secondCategories.length) return []
            return [{ name: '全部' }].concat(this.secondCategories)
        },
        categoryGroups() {
            if (!this.secondCategories.length) {
                if (this.cateList.length && this.currentCategory.id) {
                    return [{ name: '', children: [this.formatCategoryItem(this.currentCategory, 0)] }]
                }
                return []
            }

            if (this.activeSecondIndex === 0) {
                const children = this.secondCategories.reduce((list, item, groupIndex) => {
                    const thirdCategories = this.getCategoryChildren(item)
                    const source = thirdCategories.length ? thirdCategories : [item]
                    return list.concat(source.map((child, index) => this.formatCategoryItem(child, groupIndex + index)))
                }, [])
                return [{ name: '', children }]
            }

            const activeSecondCategory = this.secondCategories[this.activeSecondIndex - 1]
            const visibleSecondCategories = this.activeSecondIndex > 0 && activeSecondCategory
                ? [activeSecondCategory]
                : this.secondCategories

            return visibleSecondCategories.map((item, groupIndex) => {
                const thirdCategories = this.getCategoryChildren(item)
                const children = thirdCategories.length ? thirdCategories : [item]
                return {
                    name: this.activeSecondIndex > 0 ? '' : item.name || '',
                    children: children.map((child, index) => this.formatCategoryItem(child, groupIndex + index))
                }
            })
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
            const activeCategoryId = this.currentCategory.id
            try {
                const res = await getCatrgory()
                if (res.code == 1) {
                    this.cateList = res.data || []
                    const nextIndex = activeCategoryId !== undefined && activeCategoryId !== null
                        ? this.cateList.findIndex((item) => String(item.id) === String(activeCategoryId))
                        : this.activeIndex
                    this.activeIndex = nextIndex >= 0 && nextIndex < this.sideCategories.length ? nextIndex : 0
                    this.normalizeSecondCategory()
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
            this.activeSecondIndex = 0
            this.showSecondPanel = false
            this.contentAnchor = ''
            this.$nextTick(() => {
                this.contentAnchor = 'sort-content-top'
            })
        },
        changeSecondCategory(index) {
            if (index === this.activeSecondIndex && !this.showSecondPanel) return
            this.activeSecondIndex = index
            this.showSecondPanel = false
            this.contentAnchor = ''
            this.$nextTick(() => {
                this.contentAnchor = 'sort-content-top'
            })
        },
        toggleSecondPanel() {
            this.showSecondPanel = !this.showSecondPanel
        },
        normalizeSecondCategory() {
            if (this.activeSecondIndex >= this.secondCategoryOptions.length) {
                this.activeSecondIndex = 0
            }
            if (!this.secondCategoryOptions.length) {
                this.showSecondPanel = false
            }
        },
        buildSearchUrl(item) {
            const id = item.id || ''
            const name = encodeURIComponent(item.name || '')
            return `/bundle/pages/goods_search/goods_search?id=${id}&name=${name}&type=1&from=category`
        },
        getCategoryChildren(item) {
            return (item && (item.sons || item.children)) || []
        },
        formatCategoryItem(item, index) {
            return {
                id: item.id || item.categoryId,
                name: item.name || '',
                image: this.resolveImage(item.icon || item.image || item.iconUrl || item.imageUrl || item.pic || item.cover, index)
            }
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

.sort-aside__empty {
    padding: 40rpx 16rpx;
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 34rpx;
    text-align: center;
}

.sort-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
}

.sort-content__scroll {
    flex: 1;
    min-height: 0;
    width: 100%;
}

.sort-content__inner {
    padding: 14rpx 18rpx calc(180rpx + var(--app-window-bottom, var(--window-bottom, 0px)) + constant(safe-area-inset-bottom)) 18rpx;
    padding: 14rpx 18rpx calc(180rpx + var(--app-window-bottom, var(--window-bottom, 0px)) + env(safe-area-inset-bottom)) 18rpx;
    box-sizing: border-box;
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

.sort-second-tabs {
    position: relative;
    flex: none;
    width: 100%;
    padding: 10rpx 18rpx 12rpx;
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: 0 8rpx 18rpx rgba(31, 41, 51, 0.04);
    z-index: 2;
}

.sort-second-tabs__row {
    display: flex;
    align-items: center;
    max-width: 100%;
    overflow: hidden;
}

.sort-second-tabs__scroll {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
}

.sort-second-tabs__list {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
}

.sort-second-tabs__item,
.sort-second-panel__item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52rpx;
    max-width: 128rpx;
    margin-right: 10rpx;
    padding: 0 16rpx;
    box-sizing: border-box;
    color: #4b5563;
    font-size: 23rpx;
    line-height: 32rpx;
    border: 1rpx solid #edf1f5;
    border-radius: 18rpx;
    background: #f7f9fc;
}

.sort-second-tabs__item.is-active,
.sort-second-panel__item.is-active {
    color: #1688ff;
    font-weight: 600;
    border-color: rgba(22, 136, 255, 0.35);
    background: #edf7ff;
    box-shadow: 0 8rpx 18rpx rgba(22, 136, 255, 0.1);
}

.sort-second-tabs__arrow {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 52rpx;
    border-radius: 18rpx;
    background: #f7f9fc;
}

.sort-second-tabs__arrow-icon {
    width: 14rpx;
    height: 14rpx;
    border-right: 3rpx solid #6b7280;
    border-bottom: 3rpx solid #6b7280;
    transform: rotate(45deg) translateY(-4rpx);
    transition: transform 0.2s ease;
}

.sort-second-tabs__arrow-icon.is-open {
    transform: rotate(225deg) translate(-2rpx, -2rpx);
}

.sort-second-panel {
    display: flex;
    flex-wrap: wrap;
    margin-top: 12rpx;
    padding: 16rpx 4rpx 4rpx 14rpx;
    border: 1rpx solid #edf1f5;
    border-radius: 22rpx;
    background: #ffffff;
    box-shadow: 0 12rpx 34rpx rgba(31, 41, 51, 0.08);
}

.sort-second-panel__item {
    margin: 0 10rpx 12rpx 0;
}

.sort-category-group {
    margin-bottom: 14rpx;
}

.sort-category-group__title {
    position: relative;
    display: flex;
    align-items: center;
    margin: 4rpx 0 22rpx;
    padding-left: 18rpx;
    color: #1f2933;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.sort-category-group__title::before {
    position: absolute;
    left: 0;
    width: 6rpx;
    height: 24rpx;
    border-radius: 999rpx;
    background: #1688ff;
    content: '';
}

.sort-grid {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 18rpx;
}

.sort-grid__item {
    width: 33.333%;
    min-width: 0;
    margin-bottom: 30rpx;
    padding: 0 1rpx;
    box-sizing: border-box;
    text-align: center;
}

.sort-grid__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc((100vw - 252rpx) / 3 - 2rpx);
    height: calc(((100vw - 252rpx) / 3 - 2rpx) * 1.12);
    max-width: 142rpx;
    max-height: 160rpx;
    min-width: 92rpx;
    min-height: 104rpx;
    margin: 0 auto;
    border-radius: 18rpx;
    background: #f2f5f8;
}

.image-placeholder {
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 32rpx;
    text-align: center;
}

.sort-grid__name {
    display: block;
    max-width: 100%;
    margin-top: 12rpx;
    color: #303133;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 32rpx;
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
