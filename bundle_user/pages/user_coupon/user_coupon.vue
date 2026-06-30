<template>
<view class="user-coupon page-adaptive">
    <navbar title="我的优惠券"></navbar>
    <view class="coupon-tabs">
        <view
            v-for="(item, index) in coupons"
            :key="item.type"
            :class="['coupon-tab', active === index ? 'coupon-tab--active' : '']"
            @tap="changeTab(index)"
        >
            <text>{{ item.title }}({{ item.num }})</text>
            <view v-if="active === index" class="coupon-tab__line"></view>
        </view>
    </view>

    <view class="coupon-list">
        <view v-if="loading" class="coupon-loading">加载中...</view>
        <template v-else-if="currentList.length">
            <view v-for="(item, index) in currentList" :key="index" :class="['coupon-card', active !== 0 ? 'coupon-card--disabled' : '']">
                <view class="coupon-card__price">
                    <text class="coupon-card__symbol">¥</text>
                    <text class="coupon-card__money">{{ formatMoney(item.money) }}</text>
                    <view class="coupon-card__condition line1">{{ item.use_condition }}</view>
                </view>
                <view class="coupon-card__info">
                    <view class="coupon-card__name line1">{{ item.name || '优惠券' }}</view>
                    <view class="coupon-card__time line1">{{ item.use_time_tips || '有效期以实际使用规则为准' }}</view>
                    <view class="coupon-card__type line1">{{ item.coupon_type || item.use_condition }}</view>
                </view>
                <view class="coupon-card__action" @tap.stop="useCoupon(item)">{{ actionText }}</view>
            </view>
        </template>
        <view v-else class="coupon-empty">
            <view class="coupon-empty__icon">
                <view class="coupon-empty__stub"></view>
                <view class="coupon-empty__dot coupon-empty__dot--left"></view>
                <view class="coupon-empty__dot coupon-empty__dot--right"></view>
            </view>
            <view class="coupon-empty__title">暂无优惠券</view>
            <view class="coupon-empty__desc">有可用优惠券时会展示在这里</view>
            <view class="coupon-empty__button" @tap="useCoupon">去首页看看</view>
        </view>
    </view>
</view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import { getMyCoupon } from '@/api/user'

export default {
    components: {
			Navbar
		},
    data() {
        return {
            active: 0,
            loading: false,
            couponLists: {
                0: [],
                1: [],
                2: []
            },
            coupons: [
                { title: '可使用', num: 0, type: 0 },
                { title: '已使用', num: 0, type: 1 },
                { title: '已过期', num: 0, type: 2 }
            ]
        }
    },
    computed: {
        currentType() {
            return this.coupons[this.active].type
        },
        currentList() {
            return this.couponLists[this.currentType] || []
        },
        actionText() {
            if (this.currentType === 1) return '已使用'
            if (this.currentType === 2) return '已过期'
            return '去使用'
        }
    },
    onShow() {
        this.loadAllCouponCounts()
    },
    methods: {
        changeTab(index) {
            if (this.active === index) return
            this.active = index
            this.loadCouponList()
        },
        async loadCouponList() {
            return this.loadCouponByType(this.currentType)
        },
        async loadAllCouponCounts() {
            this.loading = true
            await Promise.all(this.coupons.map(item => this.loadCouponByType(item.type, false)))
            this.loading = false
        },
        async loadCouponByType(type, manageLoading = true) {
            if (manageLoading) this.loading = true
            try {
                const res = await getMyCoupon({ type, status: type })
                const list = res.code == 1 ? (Array.isArray(res.data) ? res.data : (res.data?.list || res.data?.lists || [])) : []
                this.$set(this.couponLists, type, list)
                const index = this.coupons.findIndex(item => item.type === type)
                if (index !== -1) this.$set(this.coupons[index], 'num', list.length)
            } catch (error) {
                this.$set(this.couponLists, type, [])
                const index = this.coupons.findIndex(item => item.type === type)
                if (index !== -1) this.$set(this.coupons[index], 'num', 0)
            } finally {
                if (manageLoading) this.loading = false
            }
        },
        formatMoney(value) {
            const money = Number(value || 0)
            if (Number.isNaN(money)) return value || '0'
            return Number.isInteger(money) ? String(money) : money.toFixed(2)
        },
        useCoupon() {
            if (this.currentType !== 0) return
            uni.switchTab({ url: '/pages/index/index' })
        }
    }
}
</script>

<style lang="scss">
.user-coupon {
    min-height: 100vh;
    background: #f6f7fb;
    overflow-x: hidden;
}

.coupon-tabs {
    display: flex;
    height: 88rpx;
    background: #ffffff;
    box-shadow: 0 8rpx 22rpx rgba(24, 40, 80, 0.04);
}

.coupon-tab {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #333333;
    font-size: 28rpx;
}

.coupon-tab--active {
    color: #ff2c3c;
    font-weight: 600;
}

.coupon-tab__line {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 48rpx;
    height: 4rpx;
    border-radius: 4rpx;
    background: #ff2c3c;
    transform: translateX(-50%);
}

.coupon-list {
    padding: 20rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
}

.coupon-loading {
    padding: 80rpx 0;
    color: #999999;
    font-size: 26rpx;
    text-align: center;
}

.coupon-card {
    position: relative;
    display: flex;
    min-height: 196rpx;
    margin-bottom: 20rpx;
    border-radius: 22rpx;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10rpx 30rpx rgba(24, 40, 80, 0.05);
}

.coupon-card::before,
.coupon-card::after {
    content: '';
    position: absolute;
    left: 190rpx;
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    background: #f6f7fb;
    z-index: 2;
}

.coupon-card::before {
    top: -14rpx;
}

.coupon-card::after {
    bottom: -14rpx;
}

.coupon-card__price {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 210rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #ff8b3d 0%, #ff2c3c 100%);
}

.coupon-card--disabled .coupon-card__price {
    background: linear-gradient(135deg, #c9ced8 0%, #aeb4bf 100%);
}

.coupon-card__symbol {
    font-size: 28rpx;
}

.coupon-card__money {
    font-size: 58rpx;
    font-weight: 700;
    line-height: 68rpx;
}

.coupon-card__condition {
    max-width: 166rpx;
    margin-top: 6rpx;
    font-size: 22rpx;
}

.coupon-card__info {
    flex: 1;
    min-width: 0;
    padding: 32rpx 150rpx 24rpx 24rpx;
    box-sizing: border-box;
}

.coupon-card__name {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.coupon-card__time,
.coupon-card__type {
    margin-top: 12rpx;
    color: #999999;
    font-size: 22rpx;
    line-height: 30rpx;
}

.coupon-card__action {
    position: absolute;
    right: 20rpx;
    bottom: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    height: 48rpx;
    border-radius: 24rpx;
    border: 1rpx solid #ff2c3c;
    color: #ff2c3c;
    font-size: 22rpx;
}

.coupon-card--disabled .coupon-card__action {
    border-color: #c5c8cf;
    color: #999999;
}

.coupon-empty {
    margin: 120rpx 6rpx 0;
    padding: 74rpx 30rpx 64rpx;
    background: #ffffff;
    border-radius: 24rpx;
    text-align: center;
    box-shadow: 0 12rpx 36rpx rgba(24, 40, 80, 0.04);
}

.coupon-empty__icon {
    position: relative;
    width: 210rpx;
    height: 126rpx;
    margin: 0 auto 34rpx;
    border-radius: 22rpx;
    background: linear-gradient(135deg, #fff5ed 0%, #ffe2d8 100%);
    overflow: hidden;
}

.coupon-empty__stub {
    position: absolute;
    left: 36rpx;
    top: 40rpx;
    width: 138rpx;
    height: 18rpx;
    border-radius: 18rpx;
    background: rgba(255, 76, 54, 0.22);
    box-shadow: 0 34rpx 0 rgba(255, 76, 54, 0.14);
}

.coupon-empty__dot {
    position: absolute;
    top: 49rpx;
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    background: #ffffff;
}

.coupon-empty__dot--left {
    left: -15rpx;
}

.coupon-empty__dot--right {
    right: -15rpx;
}

.coupon-empty__title {
    color: #333333;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.coupon-empty__desc {
    margin-top: 14rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}

.coupon-empty__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 216rpx;
    height: 64rpx;
    margin: 34rpx auto 0;
    border-radius: 32rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 600;
    background: linear-gradient(90deg, #ff8b3d 0%, #ff2c3c 100%);
    box-shadow: 0 10rpx 22rpx rgba(255, 76, 54, 0.18);
}
</style>
