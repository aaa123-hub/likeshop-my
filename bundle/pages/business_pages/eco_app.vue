<template>
    <view class="eco-page">
        <view class="eco-bg">
            <view class="eco-content">
                <view class="eco-header">
                    <view class="eco-back" @tap="goBack"></view>
                    <text class="eco-title">生态应用</text>
                </view>

                <view class="eco-grid">
                    <view
                        v-for="(item, index) in loopData0"
                        :key="index"
                        class="eco-card"
						:style="{ backgroundImage: `url(${item.cardBg})` }"
                        @tap="openApp(item)"
                    >
                        <view class="eco-card__head">
                            <image class="eco-card__icon" :src="item.icon" mode="aspectFill"></image>
                            <text class="eco-card__name">{{ item.title }}</text>
                        </view>
                        <view class="eco-card__foot">
                            <text class="eco-card__url">{{ item.urlText }}</text>
                            <image class="eco-card__arrow" :src="item.arrow" mode="aspectFit"></image>
                        </view>
                    </view>
                </view>

                <view v-if="!loading && !loopData0.length" class="eco-empty">
                    <view class="eco-empty__title">暂无生态应用</view>
                    <view class="eco-empty__desc">应用配置后会展示在这里</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getEcoApplications } from '@/api/app'
import { resolveImage } from '@/utils/image-placeholder'

const cardBackgrounds = [
    'https://lanhu-oss-proxy.lanhuapp.com/be7cc876b2094b74ee0eba29ef07b145',
    'https://lanhu-oss-proxy.lanhuapp.com/d4c33ec474b6bbd7d39c0203a548fb40',
    'https://lanhu-oss-proxy.lanhuapp.com/af2bbdf994fa3c0ef35cc2e313008722',
    'https://lanhu-oss-proxy.lanhuapp.com/ef5de8906549dcff1344adc4bd30f99e',
    'https://lanhu-oss-proxy.lanhuapp.com/0413578f349662726395145504d86344',
    'https://lanhu-oss-proxy.lanhuapp.com/aa437949540bc4253ca48ef9fd839e2a',
    'https://lanhu-oss-proxy.lanhuapp.com/fa48364177ff3653867cbdb9c8da0f01',
    'https://lanhu-oss-proxy.lanhuapp.com/81c2c956434428e9896b8063bfc9a72a'
]

const arrowImages = [
    'https://lanhu-oss-proxy.lanhuapp.com/5f7942136bf528b7f933552a0d63aeaf',
    'https://lanhu-oss-proxy.lanhuapp.com/d34cf0e062a2622299d7bbbdfcaee748',
    'https://lanhu-oss-proxy.lanhuapp.com/2bf6f361e9ad935d35e6b5c91fe92e99',
    'https://lanhu-oss-proxy.lanhuapp.com/32fadc5465767727fd4a49dc8ddb377a',
    'https://lanhu-oss-proxy.lanhuapp.com/bbc08b0b6626f28391202b013859163b',
    'https://lanhu-oss-proxy.lanhuapp.com/cb0d48c1bdf5ae493d0e3c8ab0327b9b',
    'https://lanhu-oss-proxy.lanhuapp.com/adf3250c832fea164c3d1b2946302dbb',
    'https://lanhu-oss-proxy.lanhuapp.com/a232c7c25a8a69a30c18152f3aba48cf'
]

export default {
    data() {
        return {
            statusImage: 'https://lanhu-oss-proxy.lanhuapp.com/4d93cd1c8d542d2e086451b42c6ea382',
            backImage: 'https://lanhu-oss-proxy.lanhuapp.com/c073f61c3357ea0c4fb34f91dc409aad',
            capsuleImage: 'https://lanhu-oss-proxy.lanhuapp.com/78088a7223eda53dc8e5a5bc96c57cb1',
            loading: false,
            loopData0: []
        }
    },
    onLoad() {
        this.getEcoApplications()
    },
    methods: {
        getEcoApplications() {
            this.loading = true
            getEcoApplications().then(res => {
                if (res.code == 1) {
                    this.loopData0 = (res.data || []).map((item, index) => ({
                        ...item,
                        cardBg: cardBackgrounds[index % cardBackgrounds.length],
                        arrow: arrowImages[index % arrowImages.length],
                        icon: resolveImage(item.icon, 'goods')
                    }))
                }
            }).finally(() => {
                this.loading = false
            })
        },
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack({ delta: 1 })
                return
            }
            uni.switchTab({ url: '/pages/index/index' })
        },
        openApp(item) {
            if (item.pagePath) {
                uni.navigateTo({ url: item.pagePath })
                return
            }
            if (item.linkUrl && /^https?:\/\//i.test(item.linkUrl)) {
                uni.setClipboardData({ data: item.linkUrl })
                return
            }
            uni.showToast({ title: item.urlText || '暂未配置应用链接', icon: 'none' })
        }
    }
}
</script>

<style lang="scss">
.eco-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    background: #f8f8f9;
}

.eco-status {
    display: block;
    width: 690rpx;
    height: 26rpx;
    margin: 28rpx 0 0 34rpx;
}

.eco-content {
    width: 100%;
    min-height: 100vh;
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
}

.eco-header {
    display: flex;
    align-items: flex-start;
    width: 702rpx;
    height: 64rpx;
    margin: calc(var(--status-bar-height) + 24rpx) auto 0;
}

.eco-back {
    position: relative;
    width: 42rpx;
    height: 64rpx;
    margin-top: 0;
}

.eco-back::after {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 20rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.eco-title {
    flex: 1;
    height: 34rpx;
    margin: 17rpx 42rpx 0 0;
    overflow: hidden;
    color: #222222;
    font-size: 36rpx;
    font-family: PingFangSC-Medium, PingFang SC, sans-serif;
    font-weight: 500;
    line-height: 36rpx;
    text-align: center;
    white-space: nowrap;
}

.eco-capsule {
    width: 168rpx;
    height: 64rpx;
    margin-left: 114rpx;
}

.eco-grid {
    display: flex;
    flex-wrap: wrap;
    width: 702rpx;
    margin: 28rpx auto 0;
}

.eco-card {
    width: 338rpx;
    height: 141rpx;
    margin: 0 26rpx 18rpx 0;
    background-repeat: no-repeat;
    background-position: -4rpx -4rpx;
    background-size: 346rpx 149rpx;
    border-radius: 20rpx;
    box-sizing: border-box;
}

.eco-card:nth-child(2n) {
    margin-right: 0;
}

.eco-card:nth-last-child(-n + 2) {
    margin-bottom: 0;
}

.eco-card__head {
    display: flex;
    align-items: flex-start;
    width: 231rpx;
    height: 52rpx;
    margin: 19rpx 0 0 17rpx;
}

.eco-card__icon {
    flex: none;
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
}

.eco-card__name {
    width: 165rpx;
    height: 27rpx;
    margin: 12rpx 0 0 14rpx;
    overflow: hidden;
    color: #222222;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, PingFang SC, sans-serif;
    font-weight: 500;
    line-height: 28rpx;
    text-align: left;
    white-space: nowrap;
}

.eco-card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 294rpx;
    height: 22rpx;
    margin: 25rpx 0 23rpx 20rpx;
}

.eco-card__url {
    width: 221rpx;
    height: 22rpx;
    overflow: hidden;
    color: #999999;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 22rpx;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.eco-card__arrow {
    width: 20rpx;
    height: 21rpx;
}

.eco-empty {
    width: 702rpx;
    margin: 120rpx auto 0;
    padding: 70rpx 30rpx;
    background: #ffffff;
    border-radius: 24rpx;
    text-align: center;
    box-sizing: border-box;
}

.eco-empty__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.eco-empty__desc {
    margin-top: 16rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}
</style>
