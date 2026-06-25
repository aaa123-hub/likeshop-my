<template>
    <view class="recent-visits-page">
        <view class="recent-visits-topbar">
            <view class="recent-visits-back" @tap="goBack"></view>
            <view class="recent-visits-title">最近访问</view>
        </view>

        <view class="recent-visits-list">
            <view
                v-for="item in visitList"
                :key="item.shopId"
                class="recent-visits-item"
                @tap="goShopDetail(item)"
            >
                <view v-if="!item.image" class="recent-visits-thumb"></view>
                <image v-else class="recent-visits-thumb" :src="item.image" mode="aspectFill"></image>
                <view class="recent-visits-info">
                    <view class="recent-visits-name line1">{{ item.name }}</view>
                    <view class="recent-visits-time line1">{{ item.time }}&nbsp;访问过的商家</view>
                </view>
                <view :class="['recent-visits-btn', item.subscribed ? 'recent-visits-btn--subscribed' : '']" @tap.stop="toggleSubscribe(item)">
                    <text>{{ item.subscribed ? '已订阅' : '+订阅' }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            visitList: [
                { shopId: 101, name: '数码投影仪专卖店', time: '18:00', image: '', subscribed: false },
                { shopId: 102, name: '数码投影仪专卖店', time: '18:00', image: '', subscribed: true },
                { shopId: 103, name: '数码投影仪专卖店', time: '18:00', image: '', subscribed: false },
                { shopId: 104, name: '数码投影仪专卖店', time: '18:00', image: '', subscribed: true }
            ]
        }
    },
    methods: {
        goBack() {
            uni.navigateBack({ delta: 1 })
        },
        toggleSubscribe(item) {
            item.subscribed = !item.subscribed
        },
        goShopDetail(item) {
            uni.navigateTo({ url: `/business/pages/business_pages/store_detail?shopId=${item.shopId}` })
        }
    }
}
</script>

<style lang="scss">
.recent-visits-page {
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding-top: calc(var(--status-bar-height) + 45rpx);
    background: #ffffff url('https://lanhu-oss-proxy.lanhuapp.com/d8467d9a62a60ccdbb6908777aebe692') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.recent-visits-topbar {
    position: relative;
    display: flex;
    align-items: center;
    width: calc(100% - 48rpx);
    height: 64rpx;
    margin: 0 24rpx;
}

.recent-visits-back {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    color: #222222;
}

.recent-visits-back::after {
    content: '';
    position: absolute;
    left: 16rpx;
    top: 20rpx;
    width: 20rpx;
    height: 20rpx;
    border-left: 4rpx solid currentColor;
    border-bottom: 4rpx solid currentColor;
    transform: rotate(45deg);
}

.recent-visits-title {
    position: absolute;
    left: 50%;
    top: 17rpx;
    color: #222222;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 40rpx;
    white-space: nowrap;
    transform: translateX(-50%);
}

.recent-visits-list {
    margin: 36rpx 24rpx 0 23rpx;
}

.recent-visits-item {
    display: flex;
    align-items: center;
    height: 181rpx;
    border-bottom: 1rpx solid #f0f0f0;
    box-sizing: border-box;
}

.recent-visits-item:first-child {
    height: 157rpx;
    align-items: flex-start;
}

.recent-visits-thumb {
    flex: none;
    width: 128rpx;
    height: 128rpx;
    border-radius: 8rpx;
    background: #d5d5d5;
}

.recent-visits-info {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
}

.recent-visits-name {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 34rpx;
}

.recent-visits-time {
    margin-top: 30rpx;
    color: #999999;
    font-size: 26rpx;
    line-height: 30rpx;
}

.recent-visits-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 150rpx;
    height: 58rpx;
    margin-left: 24rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 30rpx;
    background: #037dfa;
    border-radius: 29rpx;
    white-space: nowrap;
}

.recent-visits-btn--subscribed {
    color: #037dfa;
    background: #d0e7ff;
}
</style>
