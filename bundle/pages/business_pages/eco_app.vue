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
                            <view class="eco-card__icon"></view>
                            <text class="eco-card__name">{{ item.title }}</text>
                        </view>
                        <view class="eco-card__foot">
                            <text class="eco-card__url">{{ item.urlText }}</text>
                            <image class="eco-card__arrow" :src="item.arrow" mode="aspectFit"></image>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            statusImage: 'https://lanhu-oss-proxy.lanhuapp.com/4d93cd1c8d542d2e086451b42c6ea382',
            backImage: 'https://lanhu-oss-proxy.lanhuapp.com/c073f61c3357ea0c4fb34f91dc409aad',
            capsuleImage: 'https://lanhu-oss-proxy.lanhuapp.com/78088a7223eda53dc8e5a5bc96c57cb1',
            loopData0: [
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/be7cc876b2094b74ee0eba29ef07b145',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/5f7942136bf528b7f933552a0d63aeaf'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/d4c33ec474b6bbd7d39c0203a548fb40',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/d34cf0e062a2622299d7bbbdfcaee748'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/af2bbdf994fa3c0ef35cc2e313008722',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/2bf6f361e9ad935d35e6b5c91fe92e99'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/ef5de8906549dcff1344adc4bd30f99e',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/32fadc5465767727fd4a49dc8ddb377a'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/0413578f349662726395145504d86344',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/bbc08b0b6626f28391202b013859163b'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/aa437949540bc4253ca48ef9fd839e2a',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/cb0d48c1bdf5ae493d0e3c8ab0327b9b'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/fa48364177ff3653867cbdb9c8da0f01',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/adf3250c832fea164c3d1b2946302dbb'
                },
                {
					cardBg: 'https://lanhu-oss-proxy.lanhuapp.com/81c2c956434428e9896b8063bfc9a72a',
                    title: 'web官网链接',
                    urlText: 'HTTP:www.lksajf.com',
					arrow: 'https://lanhu-oss-proxy.lanhuapp.com/a232c7c25a8a69a30c18152f3aba48cf'
                }
            ]
        }
    },
    methods: {
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack({ delta: 1 })
                return
            }
            uni.switchTab({ url: '/pages/index/index' })
        },
        openApp(item) {
            uni.showToast({
                title: item.urlText,
                icon: 'none'
            })
        }
    }
}
</script>

<style lang="scss">
.eco-page {
    position: relative;
    width: 750rpx;
    min-height: 100vh;
    overflow: hidden;
    background: #f8f8f9;
}

.eco-status {
    display: block;
    width: 690rpx;
    height: 26rpx;
    margin: 28rpx 0 0 34rpx;
}

.eco-content {
    width: 750rpx;
    min-height: 1573rpx;
}

.eco-header {
    display: flex;
    align-items: flex-start;
    width: 702rpx;
    height: 64rpx;
    margin: 24rpx 0 0 24rpx;
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
    width: 140rpx;
    height: 34rpx;
    margin: 17rpx 0 0 266rpx;
    overflow: hidden;
    color: #222222;
    font-size: 36rpx;
    font-family: PingFangSC-Medium, PingFang SC, sans-serif;
    font-weight: 500;
    line-height: 36rpx;
    text-align: left;
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
    min-height: 617rpx;
    margin: 28rpx 0 0 24rpx;
}

.eco-card {
    width: 338rpx;
    height: 141rpx;
    margin: 0 26rpx 18rpx 0;
    background-repeat: no-repeat;
    background-position: -4rpx -4rpx;
    background-size: 346rpx 149rpx;
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
    background: #eeeeee;
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
}

.eco-card__arrow {
    width: 20rpx;
    height: 21rpx;
}
</style>
