<template>
    <view class="sort-page">
        <view class="sort-header">
            <navigator class="sort-search" hover-class="none" url="/pages/goods_search/goods_search">
                <text class="sort-search__placeholder">请输入您想要的商品</text>
                <u-icon name="camera" size="38" color="#b8b8b8"></u-icon>
                <view class="sort-search__btn">搜索</view>
            </navigator>
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

            <scroll-view class="sort-content" scroll-y scroll-with-animation>
                <view class="sort-content__inner">
                    <view class="sort-topline">
                        <view class="sort-topline__active">
                            <view class="sort-topline__marker"></view>
                            <text>为你推荐</text>
                        </view>
                        <text class="sort-topline__title">热卖类目</text>
                    </view>

                    <view class="sort-grid">
                        <navigator
                            v-for="(item, index) in hotCategories"
                            :key="`${item.name}-${index}`"
                            class="sort-grid__item"
                            hover-class="none"
                            :url="buildSearchUrl(item)"
                        >
                            <image class="sort-grid__image" :src="item.image" mode="aspectFit"></image>
                            <text class="sort-grid__name line1">{{ item.name }}</text>
                        </navigator>
                    </view>

                    <view class="sort-section-title">猜你喜欢</view>
                    <view class="sort-like-grid">
                        <navigator
                            v-for="(item, index) in likeGoods"
                            :key="item.id || index"
                            class="sort-like-card"
                            hover-class="none"
                            :url="`/pages/goods_details/goods_details?id=${item.id || 1}`"
                        >
                            <image class="sort-like-card__image" :src="item.image" mode="aspectFill"></image>
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
            const sons = this.currentCategory.sons || []
            const source = sons.length ? sons : fallbackHotCategories
            return source.slice(0, 9).map((item, index) => ({
                id: item.id,
                name: item.name || fallbackHotCategories[index % fallbackHotCategories.length].name,
                image: this.resolveImage(item.image || item.pic || item.cover, index)
            }))
        },
        likeGoods() {
            return [
                {
                    id: 1,
                    name: '女裤纯棉舒适',
                    price: '2300',
                    sold: '1000',
                    image: getDesignAsset('/static/lanhu/designs/27-search-list.png')
                },
                {
                    id: 2,
                    name: '女裤纯棉舒适',
                    price: '2300',
                    sold: '1000',
                    image: getDesignAsset('/static/lanhu/designs/24-goods-detail.png')
                },
                {
                    id: 3,
                    name: '女裤纯棉舒适',
                    price: '2300',
                    sold: '1000',
                    image: getDesignAsset('/static/lanhu/designs/27-search-list.png')
                },
                {
                    id: 4,
                    name: '女裤纯棉舒适',
                    price: '2300',
                    sold: '1000',
                    image: getDesignAsset('/static/lanhu/designs/24-goods-detail.png')
                }
            ]
        }
    },
    onLoad() {
        setTabbar()
        this.getCategoryList()
    },
    onShow() {
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
            const res = await getCatrgory()
            if (res.code == 1) {
                this.cateList = res.data || []
                this.activeIndex = 0
            }
        },
        changeCategory(index) {
            this.activeIndex = index
        },
        buildSearchUrl(item) {
            const id = item.id || ''
            const name = encodeURIComponent(item.name || '')
            return `/pages/goods_search/goods_search?id=${id}&name=${name}`
        },
        resolveImage(image, index) {
            if (image) {
                return getDesignAsset(image)
            }
            return fallbackHotCategories[index % fallbackHotCategories.length].image
        }
    }
}
</script>

<style lang="scss">
.sort-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #ffffff;
}

.sort-header {
    flex: none;
    padding: calc(var(--status-bar-height) + 18rpx) 24rpx 18rpx;
    background: #ffffff;
}

.sort-search {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding: 0 8rpx 0 34rpx;
    box-sizing: border-box;
    border: 2rpx solid #1688ff;
    border-radius: 36rpx;
}

.sort-search__placeholder {
    flex: 1;
    color: #c4c4c4;
    font-size: 24rpx;
}

.sort-search__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 52rpx;
    margin-left: 12rpx;
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
    padding: 10rpx 24rpx calc(180rpx + var(--window-bottom)) 26rpx;
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
    width: 132rpx;
    height: 132rpx;
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
    width: 313rpx;
    margin-bottom: 18rpx;
    overflow: hidden;
    border-radius: 22rpx;
    background: #ffffff;
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.sort-like-card__image {
    display: block;
    width: 100%;
    height: 286rpx;
    background: #f1f1f1;
}

.sort-like-card__body {
    padding: 16rpx 16rpx 18rpx;
}

.sort-like-card__name {
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 38rpx;
}

.sort-like-card__footer {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 12rpx;
}

.sort-like-card__price {
    color: #ff2d2d;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 42rpx;
}

.sort-like-card__sold {
    color: #999999;
    font-size: 22rpx;
    line-height: 30rpx;
}
</style>
