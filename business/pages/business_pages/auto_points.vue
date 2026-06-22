<template>
    <view class="auto-points-page">
        <view class="auto-points-topbar">
            <image class="auto-points-back" src="https://shengyuan.store/api/miniapp/files/miniapp/f7aa105f2e8b470798a431a761e2ca45/auto-points-back-icon.png" mode="aspectFit" @tap="goBack"></image>
            <view class="auto-points-title">自动领取积分设置</view>
        </view>

        <view class="auto-points-section-title">
            <view class="auto-points-section-title__bar"></view>
            <text>线上订单</text>
        </view>

        <view class="auto-points-card">
            <view class="auto-points-row">
                <text>支付后</text>
                <view :class="['auto-points-switch', onlinePay ? 'is-active' : '']" @tap="onlinePay = !onlinePay">
                    <view class="auto-points-switch__thumb"></view>
                </view>
            </view>
            <image class="auto-points-divider" src="https://shengyuan.store/api/miniapp/files/miniapp/b8dfe9dcba7644ef89bbf62c4230aba3/auto-points-divider.png" mode="scaleToFill"></image>
            <view class="auto-points-row">
                <text>确认收货后</text>
                <view :class="['auto-points-switch', onlineReceive ? 'is-active' : '']" @tap="onlineReceive = !onlineReceive">
                    <view class="auto-points-switch__thumb"></view>
                </view>
            </view>
        </view>

        <view class="auto-points-section-title auto-points-section-title--offline">
            <view class="auto-points-section-title__bar"></view>
            <text>线下订单</text>
        </view>

        <view class="auto-points-card auto-points-card--single">
            <view class="auto-points-row">
                <text>支付后</text>
                <view :class="['auto-points-switch', offlinePay ? 'is-active' : '']" @tap="offlinePay = !offlinePay">
                    <view class="auto-points-switch__thumb"></view>
                </view>
            </view>
        </view>
        <image class="auto-points-divider auto-points-divider--standalone" src="https://shengyuan.store/api/miniapp/files/miniapp/b8dfe9dcba7644ef89bbf62c4230aba3/auto-points-divider.png" mode="scaleToFill"></image>

        <view class="auto-points-save" @tap="saveSettings">保存</view>
    </view>
</template>

<script>
import { setAutoReceivePoints } from '@/api/user'

export default {
    data() {
        return {
            onlinePay: true,
            onlineReceive: false,
            offlinePay: true
        }
    },
    methods: {
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
                return
            }
            uni.switchTab({ url: '/pages/user/user' })
        },
        async saveSettings() {
            const res = await setAutoReceivePoints({
                onlinePay: this.onlinePay,
                onlineReceive: this.onlineReceive,
                offlinePay: this.offlinePay,
                autoReceiveFlag: this.onlinePay || this.onlineReceive || this.offlinePay
            })
            if (res.code == 1) {
                uni.showToast({ title: '保存成功', icon: 'success' })
            }
        }
    }
}
</script>

<style lang="scss">
.auto-points-page {
    position: relative;
    min-height: 100vh;
    padding-top: calc(var(--status-bar-height) + 45rpx);
    overflow: hidden;
    background: #f6f8fb url('https://shengyuan.store/api/miniapp/files/miniapp/d436eea929e84f17a7bbc5f609cc7188/auto-points-bg.png') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.auto-points-topbar {
    display: flex;
    align-items: center;
    height: 64rpx;
    margin: 0 24rpx;
}

.auto-points-back {
    width: 14rpx;
    height: 24rpx;
    padding: 20rpx 28rpx 20rpx 0;
}

.auto-points-title {
    margin-left: 168rpx;
    color: #222222;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
    white-space: nowrap;
}

.auto-points-section-title {
    display: flex;
    align-items: center;
    margin: 45rpx 0 0 24rpx;
    color: #222222;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 32rpx;
}

.auto-points-section-title--offline {
    margin-top: 59rpx;
}

.auto-points-section-title__bar {
    width: 11rpx;
    height: 26rpx;
    margin-right: 18rpx;
    background: #037dfa;
}

.auto-points-card {
    width: 703rpx;
    height: 201rpx;
    margin: 34rpx 0 0 24rpx;
    overflow: hidden;
    background: #ffffff;
    border-radius: 15rpx;
}

.auto-points-card--single {
    height: 99rpx;
}

.auto-points-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 99rpx;
    padding: 0 35rpx 0 29rpx;
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    box-sizing: border-box;
}

.auto-points-switch {
    position: relative;
    width: 83rpx;
    height: 42rpx;
    background: #c7c7c7;
    border-radius: 21rpx;
    transition: background 0.2s;
}

.auto-points-switch.is-active {
    background: #037dfa;
}

.auto-points-switch__thumb {
    position: absolute;
    left: 4rpx;
    top: 4rpx;
    width: 34rpx;
    height: 34rpx;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.18);
    transition: transform 0.2s;
}

.auto-points-switch.is-active .auto-points-switch__thumb {
    transform: translateX(41rpx);
}

.auto-points-divider {
    display: block;
    width: 702rpx;
    height: 1rpx;
}

.auto-points-divider--standalone {
    margin-left: 24rpx;
}

.auto-points-save {
    position: fixed;
    left: 84rpx;
    right: 84rpx;
    bottom: calc(113rpx + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: center;
    height: 81rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    background: #037dfa;
    border-radius: 40rpx;
}
</style>
