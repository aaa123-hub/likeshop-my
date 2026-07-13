<template>
<view class="user-coupon">
    <view class="coupon-hero">
        <view class="coupon-nav">
            <view class="coupon-nav__back" @tap="goBack"></view>
            <view class="coupon-nav__title">优惠券</view>
            <view class="coupon-nav__capsule">
                <view class="coupon-nav__capsule-dot"></view>
                <view class="coupon-nav__capsule-divider"></view>
                <view class="coupon-nav__capsule-circle"></view>
            </view>
        </view>
    </view>

    <view class="coupon-tabs">
        <view
            v-for="(item, index) in coupons"
            :key="item.type"
            :class="['coupon-tab', active === index ? 'coupon-tab--active' : '']"
            @tap="changeTab(index)"
        >
            <text>{{ item.title }}</text>
            <view v-if="active === index" class="coupon-tab__line"></view>
        </view>
    </view>

    <view class="coupon-list">
        <view v-if="loading" class="coupon-loading">加载中...</view>
        <template v-else-if="currentList.length">
            <view
                v-for="(item, index) in currentList"
                :key="index"
                :class="[
                    'coupon-card',
                    couponItemStatus(item) !== 0 ? 'coupon-card--disabled' : '',
                    couponItemStatus(item) === 1 ? 'coupon-card--used' : '',
                    couponItemStatus(item) === 2 ? 'coupon-card--expired' : ''
                ]"
            >
                <view class="coupon-card__shop">
                    <view class="coupon-card__avatar"></view>
                    <view class="coupon-card__shop-name line1">{{ item.shop_name || item.shopName || item.merchant_name || item.merchantName || '' }}</view>
                    <view class="coupon-card__expire line1">{{ item.use_time_tips || item.expire_time || item.expireTime || '有效期以实际使用规则为准' }}</view>
                </view>
                <view class="coupon-card__divider"></view>
                    <view class="coupon-card__body">
                    <view class="coupon-card__price">
                        <view v-if="hasMoney(item.money)" class="coupon-card__money">HK${{ formatMoney(item.money) }}</view>
                        <view class="coupon-card__condition line1">{{ item.use_condition || item.useCondition || couponTypeText(item) }}</view>
                    </view>
                    <view class="coupon-card__info">
                        <view class="coupon-card__name line1">{{ item.name || item.title || '优惠券' }}</view>
                        <view class="coupon-card__type line1">{{ couponText(item.tips || item.use_rule || item.useRule || item.use_condition, '') }}</view>
                    </view>
                    <view class="coupon-card__action" @tap.stop="useCoupon(item)">
                        <text>{{ actionTextFor(item) }}</text>
                    </view>
                </view>
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
import { getMyCoupon } from '@/api/user'
import { formatCouponText, formatCouponTypeText } from '@/utils/backend-text'

export default {
    data() {
        return {
            active: 0,
            loading: false,
            couponLists: {
                0: [],
                1: [],
                2: []
            },
            couponPages: {
                0: 1,
                1: 1,
                2: 1
            },
            couponHasNext: {
                0: true,
                1: true,
                2: true
            },
            couponLoading: {
                0: false,
                1: false,
                2: false
            },
            pageSize: 20,
            coupons: [
                { title: '全部', num: 0, type: 'all' },
                { title: '未使用', num: 0, type: 0 },
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
            if (this.currentType === 'all') {
                return [0, 1, 2].flatMap(type => (this.couponLists[type] || []).map(item => ({ ...item, __couponStatus: type })))
            }
            return (this.couponLists[this.currentType] || []).map(item => ({ ...item, __couponStatus: this.currentType }))
        },
    },
    onShow() {
        this.loadAllCouponCounts()
    },
    onReachBottom() {
        this.loadCouponByType(this.currentType, true, false)
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
        changeTab(index) {
            if (this.active === index) return
            this.active = index
            if (!this.currentList.length) this.loadCouponList()
        },
        async loadCouponList() {
            return this.loadCouponByType(this.currentType, true, true)
        },
        async loadAllCouponCounts() {
            this.loading = true
            await Promise.all([0, 1, 2].map(type => this.loadCouponByType(type, false, true)))
            this.updateAllCouponCount()
            this.loading = false
        },
        async loadCouponByType(type, manageLoading = true, reset = false) {
            if (type === 'all') {
                if (reset) {
                    await Promise.all([0, 1, 2].map(item => this.loadCouponByType(item, false, true)))
                    this.updateAllCouponCount()
                }
                return
            }
            if (this.couponLoading[type]) return
            if (!reset && !this.couponHasNext[type]) return
            if (manageLoading) this.loading = true
            this.$set(this.couponLoading, type, true)
            try {
                const pageNo = reset ? 1 : this.couponPages[type]
                const res = await getMyCoupon({ type, status: type, pageNo, pageSize: this.pageSize })
                const data = res.data || {}
                const list = res.code == 1 ? (Array.isArray(data) ? data : (data.list || data.lists || [])) : []
                const nextList = reset ? list : (this.couponLists[type] || []).concat(list)
                this.$set(this.couponLists, type, nextList)
                this.$set(this.couponPages, type, pageNo + 1)
                this.$set(this.couponHasNext, type, this.resolveHasNext(data, pageNo, list))
                const index = this.coupons.findIndex(item => item.type === type)
                if (index !== -1) this.$set(this.coupons[index], 'num', data.total ?? nextList.length)
                this.updateAllCouponCount()
            } catch (error) {
                if (reset) this.$set(this.couponLists, type, [])
                const index = this.coupons.findIndex(item => item.type === type)
                if (index !== -1 && reset) this.$set(this.coupons[index], 'num', 0)
            } finally {
                this.$set(this.couponLoading, type, false)
                if (manageLoading) this.loading = false
            }
        },
        updateAllCouponCount() {
            const total = [0, 1, 2].reduce((sum, type) => sum + (this.couponLists[type] || []).length, 0)
            const index = this.coupons.findIndex(item => item.type === 'all')
            if (index !== -1) this.$set(this.coupons[index], 'num', total)
        },
        resolveHasNext(data = {}, pageNo = 1, list = []) {
            if (data.hasNext !== undefined) return Boolean(data.hasNext)
            if (data.more !== undefined) return Boolean(data.more)
            const total = Number(data.total ?? data.count ?? 0)
            const pageSize = Number(data.pageSize || data.page_size || this.pageSize)
            if (total && pageSize) return total > Number(pageNo) * pageSize
            return Array.isArray(list) && list.length >= this.pageSize
        },
        formatMoney(value) {
            const money = Number(value || 0)
            if (Number.isNaN(money)) return value || '0'
            return Number.isInteger(money) ? String(money) : money.toFixed(2)
        },
        hasMoney(value) {
            return value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value))
        },
        couponItemStatus(item = {}) {
            if (item.__couponStatus !== undefined) return item.__couponStatus
            return this.currentType === 'all' ? 0 : this.currentType
        },
        actionTextFor(item = {}) {
            const status = this.couponItemStatus(item)
            if (status === 1) return '已使用'
            if (status === 2) return '已过期'
            return '立即使用'
        },
        couponTypeText(item = {}) {
            return formatCouponTypeText(item.coupon_type || item.couponType || item.typeText || item.type || item.use_condition || item.useCondition, '优惠券')
        },
        couponText(value, fallback = '') {
            return formatCouponText(value, fallback)
        },
        useCoupon(item = {}) {
            if (this.couponItemStatus(item) !== 0) return
            uni.switchTab({ url: '/pages/index/index' })
        }
    }
}
</script>

<style lang="scss">
.user-coupon {
    min-height: 100vh;
    background: #fff9f0;
    overflow-x: hidden;
}

.coupon-hero {
    height: calc(184rpx + var(--status-bar-height));
    padding-top: var(--status-bar-height);
    background: #fff9f0;
    border-radius: 0 0 15rpx 15rpx;
    box-sizing: border-box;
}

.coupon-nav {
    position: relative;
    height: 102rpx;
    padding: 0;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

.coupon-nav__back {
    position: relative;
    width: 40rpx;
    height: 102rpx;
    margin-left: 24rpx;
    flex: none;
}

.coupon-nav__back::after {
    content: '';
    position: absolute;
    left: 0;
    top: 48rpx;
    width: 19rpx;
    height: 19rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.coupon-nav__title {
    position: absolute;
    left: 50%;
    top: 41rpx;
    max-width: calc(100% - 260rpx);
    color: #222222;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transform: translateX(-50%);
}

.coupon-nav__capsule {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 168rpx;
    height: 64rpx;
    margin: 24rpx 24rpx 0 auto;
    border: 1rpx solid transparent;
    border-radius: 32rpx;
    background: transparent;
    box-sizing: border-box;
    flex: none;
    opacity: 0;
}

.coupon-nav__capsule-dot {
    width: 8rpx;
    height: 8rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    background: #222222;
    box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
}

.coupon-nav__capsule-divider {
    width: 1rpx;
    height: 36rpx;
    margin: 0 22rpx 0 42rpx;
    background: rgba(34, 34, 34, .18);
}

.coupon-nav__capsule-circle {
    width: 34rpx;
    height: 34rpx;
    border: 4rpx solid #222222;
    border-radius: 50%;
    box-sizing: border-box;
}

.coupon-tabs {
    display: flex;
    align-items: flex-start;
    height: 93rpx;
    padding: 0 57rpx;
    background: #fff9f0;
    box-sizing: border-box;
}

.coupon-tab {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 93rpx;
    color: #222222;
    font-size: 32rpx;
    line-height: 32rpx;
}

.coupon-tab--active {
    color: #a0610d;
    font-weight: 500;
}

.coupon-tab__line {
    position: absolute;
    left: 50%;
    bottom: 3rpx;
    width: 36rpx;
    height: 6rpx;
    background: #a0610d;
    transform: translateX(-50%);
}

.coupon-list {
    min-height: calc(100vh - 277rpx);
    padding: 30rpx 24rpx calc(36rpx + env(safe-area-inset-bottom));
    background: #fff9f0;
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
    min-height: 245rpx;
    margin-bottom: 22rpx;
    border-radius: 0;
    overflow: hidden;
    background: #fffbf6;
    box-shadow: none;
}

.coupon-card::before {
    content: '立即使用';
    position: absolute;
    right: 0;
    top: 0;
    width: 166rpx;
    height: 245rpx;
    padding: 58rpx 56rpx 0 84rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 32rpx;
    word-break: break-all;
    background: #a0610d;
    border-radius: 27rpx 0 0 27rpx;
    opacity: .98;
    box-sizing: border-box;
    writing-mode: vertical-rl;
    text-orientation: upright;
}

.coupon-card--disabled::before {
    background: rgba(160, 97, 13, .4);
}

.coupon-card--disabled {
    width: 100%;
    padding-right: 71rpx;
    box-sizing: border-box;
    background: transparent;
}

.coupon-card--disabled::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    right: 71rpx;
    height: 244rpx;
    background: #fffbf6;
}

.coupon-card--disabled .coupon-card__shop,
.coupon-card--disabled .coupon-card__divider,
.coupon-card--disabled .coupon-card__body {
    position: relative;
    z-index: 1;
}

.coupon-card--used::before {
    content: '已使用';
}

.coupon-card--expired::before {
    content: '已过期';
}

.coupon-card__shop {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding: 11rpx 124rpx 0 23rpx;
    box-sizing: border-box;
}

.coupon-card__avatar {
    flex: none;
    width: 42rpx;
    height: 42rpx;
    border-radius: 50%;
    background: #b3b3b3;
}

.coupon-card__shop-name {
    flex: 1;
    min-width: 0;
    margin-left: 11rpx;
    color: #a2a2a2;
    font-size: 24rpx;
    line-height: 42rpx;
}

.coupon-card__expire {
    flex: none;
    max-width: 300rpx;
    margin-left: 16rpx;
    color: #222222;
    font-size: 24rpx;
    line-height: 42rpx;
    text-align: right;
}

.coupon-card__divider {
    height: 1rpx;
    margin: 0 101rpx 0 24rpx;
    background: rgba(160, 97, 13, .16);
}

.coupon-card__body {
    display: flex;
    align-items: center;
    min-height: 180rpx;
    padding: 24rpx 166rpx 24rpx 25rpx;
    box-sizing: border-box;
}

.coupon-card__price {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 131rpx;
    height: 131rpx;
    border-radius: 8rpx;
    color: #ffffff;
    background: #a0610d;
}

.coupon-card__money {
    max-width: 118rpx;
    font-size: 34rpx;
    font-weight: 500;
    line-height: 34rpx;
    white-space: nowrap;
}

.coupon-card__condition {
    max-width: 104rpx;
    margin-top: 11rpx;
    color: #ffffff;
    font-size: 20rpx;
    line-height: 20rpx;
    text-align: center;
}

.coupon-card__info {
    flex: 1;
    min-width: 0;
    margin-left: 23rpx;
}

.coupon-card__name {
    color: #222222;
    font-size: 30rpx;
    font-weight: 500;
    line-height: 30rpx;
}

.coupon-card__type {
    margin-top: 19rpx;
    color: #222222;
    font-size: 23rpx;
    line-height: 23rpx;
}

.coupon-card__action {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 166rpx;
    height: 245rpx;
    color: transparent;
    z-index: 2;
}

.coupon-card__action text {
    display: none;
}

.coupon-empty {
    margin: 80rpx 6rpx 0;
    padding: 74rpx 30rpx 64rpx;
    background: #fffbf6;
    border-radius: 25rpx;
    text-align: center;
    box-shadow: none;
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
    background: #a0610d;
    box-shadow: none;
}
</style>
