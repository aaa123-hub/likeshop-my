<template>
    <view class="developing-page">
        <view class="developing-shell">
            <view class="developing-banner">
                <view class="developing-banner__title">提示</view>
                <image class="developing-banner__art" src="https://shengyuan.store/api/miniapp/files/miniapp/25ff3d3aec1b4f0785c6c5d0166a1086/developing_illustration-107af76ebce3d6f8b998822ee39d3561.png" mode="scaleToFill"></image>
            </view>
            <view class="developing-card">
                <view class="developing-card__text">{{ message }}</view>
                <button class="developing-card__button" @tap="goHome">返回首页</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            message: '该功能暂未开放，请从已上线业务入口进入。'
        }
    },
    onLoad(options = {}) {
        if (options.message) {
            this.message = decodeURIComponent(options.message)
        }
    },
    methods: {
        goHome() {
            uni.switchTab({
                url: '/pages/index/index',
                fail: () => uni.navigateBack()
            })
        }
    }
}
</script>

<style lang="scss">
.developing-page {
    position: relative;
    width: 100%;
    max-width: 750rpx;
    min-height: 100vh;
    margin: 0 auto;
    overflow: hidden;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/09882680cc5e46ad98289093253c748c/developing_page_bg-448c8d80dd5792f814b1a4171e188bc7.png') no-repeat center top;
    background-size: 100% 100%;
}

.developing-shell {
    position: relative;
    min-height: 1827rpx;
    padding-top: 683rpx;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/f43acc702da5464d97cf279cd64d8846/developing_shell_bg-809d6be2fd0063dfe25759e14e78166d.png') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.developing-banner {
    position: relative;
    width: 528rpx;
    height: 184rpx;
    margin-left: 111rpx;
    padding: 27rpx 0 0 40rpx;
    color: #ffffff;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/a1445f3fc0854b18a0091d55fc0c12d7/developing_banner_bg-1926b71406a317b9d3f8e0e3d9706501.png') no-repeat center top;
    background-size: 100% 100%;
    border-radius: 0;
    box-sizing: border-box;
    box-shadow: none;
}

.developing-banner__title {
    font-size: 33rpx;
    font-weight: 700;
    line-height: 33rpx;
    white-space: nowrap;
}

.developing-banner__art {
    position: absolute;
    left: 358rpx;
    top: -82rpx;
    width: 162rpx;
    height: 180rpx;
}

.developing-card {
    position: absolute;
    left: 73rpx;
    top: 763rpx;
    width: 604rpx;
    height: 277rpx;
    padding-top: 71rpx;
    background: #ffffff;
    border-radius: 15rpx;
    box-sizing: border-box;
    box-shadow: none;
}

.developing-card__text {
    width: 505rpx;
    min-height: 31rpx;
    max-height: 82rpx;
    margin-left: 52rpx;
    color: #222222;
    font-size: 29rpx;
    line-height: 41rpx;
    text-align: left;
    white-space: normal;
    overflow: hidden;
    word-break: break-all;
}

.developing-card__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 321rpx;
    height: 80rpx;
    margin: 51rpx 0 0 142rpx;
    padding: 0;
    color: #ffffff;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/24dfdafc421c4c22a6723f4d4f3d3e3a/developing_button_bg-077667811064315e1526140a1324b1cf.png') no-repeat center top;
    background-size: 100% 100%;
    border: 0;
    border-radius: 0;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 28rpx;
}

.developing-card__button::after {
    display: none;
}
</style>
