<template>
    <view class="recent-visits-page">
        <view class="recent-visits-topbar">
            <view class="recent-visits-back" @tap="goBack"></view>
            <view class="recent-visits-title">最近访问</view>
        </view>

        <view class="recent-visits-list" v-if="visitList.length">
            <view
                v-for="item in visitList"
                :key="item.shopId"
                class="recent-visits-item"
                @tap="goShopDetail(item)"
            >
                <view v-if="!item.image" class="recent-visits-thumb recent-visits-thumb--empty">无</view>
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
        <view v-else class="recent-visits-empty">
            <view class="recent-visits-empty__title">暂无最近访问</view>
            <view class="recent-visits-empty__desc">浏览过的商家会展示在这里</view>
        </view>
    </view>
</template>

<script>
import { getRecentVisitShops, subscribeShop } from '@/api/app'

export default {
    data() {
        return {
            loading: false,
            visitList: []
        }
    },
    onLoad() {
        this.loadRecentVisits()
    },
    onPullDownRefresh() {
        this.loadRecentVisits().finally(() => {
            uni.stopPullDownRefresh()
        })
    },
    methods: {
        async loadRecentVisits() {
            if (this.loading) return Promise.resolve()
            this.loading = true
            try {
                const res = await getRecentVisitShops({ pageNo: 1, pageSize: 30 })
                if (res.code == 1) {
                    this.visitList = res.data || []
                }
            } finally {
                this.loading = false
            }
        },
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack({ delta: 1 })
                return
            }
            uni.switchTab({ url: '/pages/index/index' })
        },
        async toggleSubscribe(item) {
            if (!item.shopId) return
            const nextSubscribed = !item.subscribed
            const previousSubscribed = item.subscribed
            item.subscribed = nextSubscribed
            const res = await subscribeShop({ shopId: item.shopId, subscribed: nextSubscribed })
            if (res.code != 1) {
                item.subscribed = previousSubscribed
                uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
            }
        },
        goShopDetail(item) {
            if (!item.shopId) return
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
    padding-top: calc(var(--status-bar-height) + 24rpx);
    background: #ffffff url('https://shengyuan.store/api/miniapp/files/miniapp/2faee69a62c34ddab3bc464bc7b57d22/d8467d9a62a60ccdbb6908777aebe692.png') no-repeat center top;
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

/* #ifdef MP-WEIXIN */
.recent-visits-topbar {
    margin-right: 220rpx;
}
/* #endif */

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
    top: 50%;
    color: #222222;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 40rpx;
    white-space: nowrap;
    transform: translate(-50%, -50%);
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 128rpx;
    height: 128rpx;
    border-radius: 8rpx;
    background: #d5d5d5;
}

.recent-visits-thumb--empty {
    color: #9ca3af;
    font-size: 26rpx;
    line-height: 32rpx;
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

.recent-visits-empty {
    margin: 160rpx 48rpx 0;
    text-align: center;
}

.recent-visits-empty__title {
    color: #222222;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
}

.recent-visits-empty__desc {
    margin-top: 16rpx;
    color: #999999;
    font-size: 26rpx;
    line-height: 36rpx;
}
</style>
