<template>
    <view class="mall-guide-page">
        <view class="mall-guide-topbar">
            <view class="mall-guide-back" @tap="goBack"></view>
            <view class="mall-guide-title">商城使用引导</view>
        </view>

        <view class="mall-guide-hero">
            <view class="mall-guide-hero__label">CURRENT MALL MINI PROGRAM</view>
            <view class="mall-guide-hero__title">快速了解当前商城小程序</view>
            <view class="mall-guide-hero__desc">从选购商品、线下商街、订单售后到积分领取，按你的使用场景快速进入。</view>
        </view>

        <view class="mall-guide-section">
            <view class="mall-guide-section__title">常用入口</view>
            <view class="mall-guide-grid">
                <view class="mall-guide-card" v-for="item in guideEntries" :key="item.title" @tap="openEntry(item)">
                    <view class="mall-guide-card__icon">{{ item.icon }}</view>
                    <view class="mall-guide-card__content">
                        <view class="mall-guide-card__title">{{ item.title }}</view>
                        <view class="mall-guide-card__desc">{{ item.desc }}</view>
                    </view>
                </view>
            </view>
        </view>

        <view class="mall-guide-section mall-guide-section--steps">
            <view class="mall-guide-section__title">使用流程</view>
            <view class="mall-guide-step" v-for="(item, index) in steps" :key="item.title">
                <view class="mall-guide-step__num">{{ index + 1 }}</view>
                <view>
                    <view class="mall-guide-step__title">{{ item.title }}</view>
                    <view class="mall-guide-step__desc">{{ item.desc }}</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            guideEntries: [
                { icon: '购', title: '商城购物', desc: '浏览分类、搜索商品并加入购物车', url: '/pages/sort/sort', openType: 'switchTab' },
                { icon: '街', title: '线下商街', desc: '查看门店、商街商品和线下服务', url: '/pages/street/street', openType: 'switchTab' },
                { icon: '单', title: '我的订单', desc: '查看待支付、待发货、待收货和售后', url: '/bundle_order/pages/user_order/user_order' },
                { icon: '分', title: '积分设置', desc: '设置线上和线下订单自动领取积分', url: '/business/pages/business_pages/auto_points' }
            ],
            steps: [
                { title: '选择商品或门店', desc: '通过首页、分类或商街进入对应商品和门店。' },
                { title: '完成下单支付', desc: '确认收货地址、优惠信息和支付方式后提交订单。' },
                { title: '跟踪订单状态', desc: '在我的订单中按状态查看履约进度或发起售后。' },
                { title: '领取积分权益', desc: '积分功能接入后，可按线上、线下和联盟订单查看可领取积分。' }
            ]
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
        openEntry(item) {
            if (item.openType === 'switchTab') {
                uni.switchTab({ url: item.url })
                return
            }
            uni.navigateTo({ url: item.url })
        }
    }
}
</script>

<style lang="scss">
.mall-guide-page {
    min-height: 100vh;
    padding: var(--app-safe-top) 28rpx 56rpx;
    background: linear-gradient(180deg, #fff1dc 0%, #fff9f0 42%, #fff9f0 100%);
    box-sizing: border-box;
}

.mall-guide-topbar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
}

.mall-guide-back {
    position: absolute;
    left: 0;
    top: 50%;
    width: 72rpx;
    height: 72rpx;
    transform: translateY(-50%);
}

.mall-guide-back::after {
    content: '';
    position: absolute;
    left: 24rpx;
    top: 22rpx;
    width: 20rpx;
    height: 20rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.mall-guide-title {
    color: #222222;
    font-size: 34rpx;
    font-weight: 600;
}

.mall-guide-hero {
    margin-top: 28rpx;
    padding: 44rpx 36rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #a0610d 0%, #d79a43 100%);
    border-radius: 32rpx;
    box-shadow: 0 20rpx 42rpx rgba(160, 97, 13, 0.18);
}

.mall-guide-hero__label {
    opacity: 0.72;
    font-size: 22rpx;
    letter-spacing: 2rpx;
}

.mall-guide-hero__title {
    margin-top: 18rpx;
    font-size: 42rpx;
    font-weight: 700;
    line-height: 54rpx;
}

.mall-guide-hero__desc {
    margin-top: 18rpx;
    opacity: 0.88;
    font-size: 26rpx;
    line-height: 40rpx;
}

.mall-guide-section {
    margin-top: 32rpx;
}

.mall-guide-section__title {
    margin-bottom: 20rpx;
    color: #222222;
    font-size: 32rpx;
    font-weight: 600;
}

.mall-guide-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20rpx;
}

.mall-guide-card {
    min-height: 206rpx;
    padding: 28rpx;
    background: #ffffff;
    border-radius: 28rpx;
    box-shadow: 0 12rpx 28rpx rgba(35, 61, 99, 0.06);
    box-sizing: border-box;
}

.mall-guide-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    color: #a0610d;
    font-size: 28rpx;
    font-weight: 700;
    background: #fff1dc;
    border-radius: 18rpx;
}

.mall-guide-card__title {
    margin-top: 22rpx;
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
}

.mall-guide-card__desc {
    margin-top: 10rpx;
    color: #7b8291;
    font-size: 24rpx;
    line-height: 34rpx;
}

.mall-guide-section--steps {
    padding: 30rpx 28rpx;
    background: #ffffff;
    border-radius: 30rpx;
}

.mall-guide-step {
    display: flex;
    gap: 20rpx;
    padding: 22rpx 0;
    border-top: 1rpx solid #f0f2f5;
}

.mall-guide-step__num {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42rpx;
    height: 42rpx;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 700;
    background: #a0610d;
    border-radius: 50%;
}

.mall-guide-step__title {
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
}

.mall-guide-step__desc {
    margin-top: 8rpx;
    color: #7b8291;
    font-size: 24rpx;
    line-height: 36rpx;
}
</style>
