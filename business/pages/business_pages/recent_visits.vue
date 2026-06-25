<template>
    <view class="recent-visits-page">
        <navbar title="最近访问" :background="{ background: '#f5f7fb' }" :border-bottom="false"></navbar>
        <view class="recent-page">
            <view class="recent-list">
                <view
                    v-for="item in visitList"
                    :key="item.shopId"
                    class="recent-item"
                    @tap="goShopDetail(item)"
                >
                    <image class="recent-item__image" :src="item.image" mode="aspectFill"></image>
                    <view class="recent-item__body">
                        <view class="recent-item__name line1">{{ item.name }}</view>
                        <view class="recent-item__desc line1">18:00&nbsp;访问过的商家</view>
                    </view>
                    <view :class="['recent-item__action', item.subscribed ? 'is-subscribed' : '']" @tap.stop="toggleSubscribe(item)">
                        <text>{{ item.subscribed ? '已订阅' : '+订阅' }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'

export default {
    components: {
        Navbar
    },
    data() {
        return {
            visitList: [
                { shopId: 101, name: '数码投影仪专卖店', image: 'https://lanhu-oss-proxy.lanhuapp.com/6c1b9219335c90eb81ddc57cd6d0016e', subscribed: false },
                { shopId: 102, name: '数码投影仪专卖店', image: 'https://lanhu-oss-proxy.lanhuapp.com/f21776365ba8ce89b023c7c2e2684e57', subscribed: true },
                { shopId: 103, name: '数码投影仪专卖店', image: 'https://lanhu-oss-proxy.lanhuapp.com/5d511a04c34c12bd44c079a1e325c0af', subscribed: false },
                { shopId: 104, name: '数码投影仪专卖店', image: 'https://lanhu-oss-proxy.lanhuapp.com/9c9d1024a38ab252eefb034fefc6b369', subscribed: true }
            ]
        }
    },
    methods: {
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
    background: #f5f7fb;
}

.recent-page {
    min-height: calc(100vh - 88rpx);
    padding-top: 22rpx;
    background: #ffffff url('https://lanhu-oss-proxy.lanhuapp.com/d8467d9a62a60ccdbb6908777aebe692') no-repeat center top;
    background-size: 100% auto;
}

.recent-list {
    padding: 0 23rpx 24rpx;
}

.recent-item {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 128rpx;
    padding: 24rpx 0;
    background: #ffffff;
    border-bottom: 1rpx solid #eeeeee;
    box-sizing: border-box;
}

.recent-item__image {
    flex: none;
    width: 128rpx;
    height: 128rpx;
    border-radius: 8rpx;
    background: #eef1f5;
}

.recent-item__body {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
}

.recent-item__name {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.recent-item__desc {
    margin-top: 26rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}

.recent-item__action {
    flex: none;
    width: 150rpx;
    height: 58rpx;
    margin-left: 24rpx;
    background: #037dfa;
    border-radius: 29rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 58rpx;
    text-align: center;
}

.recent-item__action.is-subscribed {
    background: #d0e7ff;
    color: #037dfa;
}
</style>
