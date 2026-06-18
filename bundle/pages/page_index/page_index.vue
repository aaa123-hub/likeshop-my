<template>
    <view class="page-index">
        <navbar title="页面总览"></navbar>
        <view class="page-index__body">
            <view class="page-index__summary">
                <view class="page-index__title">商城小程序 · 36页映射</view>
                <view class="page-index__meta">业务页 {{ businessCount }} · 场景页 {{ sceneCount }}</view>
            </view>

            <view class="page-index__list">
                <view
                    v-for="item in designList"
                    :key="item.id"
                    class="page-index__item"
                    @tap="openPage(item)"
                >
                    <view class="page-index__left">
                        <view class="page-index__badge">{{ item.id }}</view>
                        <view class="page-index__info">
                            <view class="page-index__name">{{ item.name }}</view>
                            <view class="page-index__file">{{ item.file }}</view>
                        </view>
                    </view>
                    <view class="page-index__right">
                        <view :class="['page-index__tag', item.type === 'business' ? 'is-business' : 'is-scene']">
                            {{ item.type === 'business' ? '业务页' : '场景页' }}
                        </view>
                        <u-icon name="arrow-right" size="24" color="#9aa0aa"></u-icon>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import navbar from '@/components/navbar/navbar.vue'
import { pageDesignMap } from './page-map'

export default {
    components: {
        navbar
    },
    data() {
        return {
            designList: pageDesignMap
        }
    },
    computed: {
        businessCount() {
            return this.designList.filter((item) => item.type === 'business').length
        },
        sceneCount() {
            return this.designList.filter((item) => item.type === 'scene').length
        }
    },
    methods: {
        openPage(item) {
            if (item.openType === 'switchTab') {
                uni.switchTab({
                    url: item.route
                })
                return
            }
            uni.navigateTo({
                url: item.route
            })
        }
    }
}
</script>

<style lang="scss">
.page-index {
    min-height: 100vh;
    background: #f5f7fb;
}

.page-index__body {
    padding: 24rpx;
}

.page-index__summary {
    padding: 28rpx;
    background: linear-gradient(135deg, #2f79ff 0%, #5b92ff 100%);
    border-radius: 24rpx;
    color: #ffffff;
}

.page-index__title {
    font-size: 34rpx;
    font-weight: 600;
    line-height: 48rpx;
}

.page-index__meta {
    margin-top: 14rpx;
    font-size: 24rpx;
    opacity: 0.92;
}

.page-index__list {
    margin-top: 24rpx;
}

.page-index__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    margin-bottom: 18rpx;
    background: #ffffff;
    border-radius: 20rpx;
}

.page-index__left,
.page-index__right {
    display: flex;
    align-items: center;
}

.page-index__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 52rpx;
    margin-right: 18rpx;
    color: #2f79ff;
    font-size: 24rpx;
    font-weight: 600;
    background: rgba(47, 121, 255, 0.12);
    border-radius: 16rpx;
}

.page-index__name {
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 40rpx;
}

.page-index__file {
    margin-top: 8rpx;
    color: #9097a3;
    font-size: 22rpx;
    line-height: 32rpx;
}

.page-index__tag {
    margin-right: 14rpx;
    padding: 0 18rpx;
    line-height: 44rpx;
    border-radius: 22rpx;
    font-size: 22rpx;
}

.page-index__tag.is-business {
    color: #1767ff;
    background: rgba(23, 103, 255, 0.1);
}

.page-index__tag.is-scene {
    color: #ff7b1d;
    background: rgba(255, 123, 29, 0.12);
}
</style>
