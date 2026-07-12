<template>
    <view class="ledger-page">
        <view class="ledger-hero">
            <view class="ledger-nav">
                <view class="ledger-nav__back" @tap="goBack"></view>
                <view class="ledger-nav__title">积分账单</view>
                <view class="ledger-nav__capsule">
                    <view class="ledger-nav__dot"></view>
                    <view class="ledger-nav__divider"></view>
                    <view class="ledger-nav__circle"></view>
                </view>
            </view>
            <view class="points-summary">
                <view class="points-summary__content">
                    <view class="points-summary__label">我的积分</view>
                    <view class="points-summary__value">
                        <view class="points-summary__coin"></view>
                        <text>{{ pointsBalance }}</text>
                    </view>
                </view>
                <view class="points-summary__illustration"></view>
            </view>
        </view>

        <view class="ledger-panel">
            <view class="filters">
                <view class="filter-tabs">
                    <view :class="['filter-tab', timeRange === 'MONTH' ? 'active' : '']" @tap="changeTime('MONTH')">本月</view>
                    <view :class="['filter-tab', timeRange === 'HISTORY' ? 'active' : '']" @tap="changeTime('HISTORY')">历史</view>
                </view>
                <picker :range="typeOptions" range-key="label" :value="typeIndex" @change="onTypeChange">
                    <view class="type-picker">{{ typeOptions[typeIndex].label }}</view>
                </picker>
            </view>

            <scroll-view class="ledger-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="refresh" @scrolltolower="loadMore">
                <view v-for="item in list" :key="item.id || item.order_no || item.create_time" class="ledger-item">
                    <view class="ledger-item__text">
                        <view :class="['ledger-title', item.isRefund ? 'ledger-title--refund' : '']">{{ item.displayText }}</view>
                        <view class="ledger-time">{{ item.create_time || item.change_time || '' }}</view>
                    </view>
                    <view :class="['ledger-amount', isNegativeAmount(item.change_amount) ? 'ledger-amount--minus' : '']">{{ amountText(item.change_amount) }}</view>
                </view>
                <view v-if="!list.length && !loading" class="empty">暂无积分流水</view>
                <view v-if="loading" class="empty">加载中...</view>
                <view v-if="finished && list.length" class="footer-tip">没有更多了</view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
import { getRolePointsLedger } from '@/api/user'
import { mapGetters } from 'vuex'

export default {
    data() {
        return {
            roleCode: 'PROMOTER',
            timeRange: 'MONTH',
            typeOptions: [
                { label: '全部类型', value: '' },
                { label: '吸粉提成', value: 'FAN_COMMISSION' },
                { label: '区域提成', value: 'AREA_COMMISSION' },
                { label: '售后退款', value: 'AFTER_SALE_REFUND' }
            ],
            typeIndex: 0,
            pageNo: 1,
            pageSize: 20,
            list: [],
            loading: false,
            refreshing: false,
            finished: false
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        pointsBalance() {
            return this.userInfo.user_integral ?? this.userInfo.userIntegral ?? this.userInfo.availablePoints ?? this.userInfo.available_points ?? '待确认'
        }
    },
    onLoad(options = {}) {
        this.roleCode = this.normalizeRoleCode(options.roleCode || options.role || 'PROMOTER')
        this.refresh()
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
        normalizeRoleCode(roleCode) {
            const code = String(roleCode || '').toUpperCase()
            const map = { HEADQUARTERS: 'HQ', OPERATION_CENTER: 'AGENT' }
            return map[code] || code
        },
        changeTime(value) {
            if (this.timeRange === value) return
            this.timeRange = value
            this.refresh()
        },
        onTypeChange(event) {
            this.typeIndex = Number(event.detail.value || 0)
            this.refresh()
        },
        async refresh() {
            this.refreshing = true
            this.pageNo = 1
            this.finished = false
            await this.loadList(true)
            this.refreshing = false
        },
        loadMore() {
            if (this.loading || this.finished) return
            this.pageNo += 1
            this.loadList(false)
        },
        async loadList(reset) {
            this.loading = true
            try {
                const res = await getRolePointsLedger({
                    roleCode: this.roleCode,
                    timeRange: this.timeRange,
                    bizType: this.typeOptions[this.typeIndex].value,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                })
                if (res.code != 1) {
                    if (reset) this.list = []
                    uni.showToast({ title: res.msg || '获取流水失败', icon: 'none' })
                    return
                }
                const data = res.data || {}
                const rows = (data.list || []).map(this.normalizeItem).filter((item) => item.displayText || item.change_amount !== '')
                this.list = reset ? rows : this.list.concat(rows)
                this.finished = rows.length < this.pageSize || data.hasNext === false
            } catch (error) {
                if (reset) this.list = []
                uni.showToast({ title: '获取流水失败', icon: 'none' })
            } finally {
                this.loading = false
            }
        },
        normalizeItem(item = {}) {
            const type = String(item.source_type || item.bizType || item.biz_type || item.type || '').toUpperCase()
            const rawAmount = item.change_amount ?? item.changeAmount ?? item.pointsChange ?? item.points_change ?? item.pointAmount ?? item.point_amount ?? item.amount ?? ''
            const amount = rawAmount === '' || rawAmount === null || rawAmount === undefined ? '' : Number(rawAmount)
            const hasAmount = amount !== '' && !Number.isNaN(amount)
            const fanName = item.fanName || item.fan_name || item.nickname || item.userName || item.user_name || '用户待确认'
            const areaName = item.areaName || item.area_name || item.districtName || item.district_name || '辖区待确认'
            const merchantName = item.merchantName || item.merchant_name || item.shopName || item.shop_name || '商家待确认'
            const orderNo = item.order_no || item.orderNo || item.bizOrderNo || item.biz_order_no || ''
            let displayText = item.remark || item.type_desc || item.bizTypeDesc || item.biz_type_desc || item.title || '积分记录'
            if (['FAN_COMMISSION', 'PROMOTER_COMMISSION', 'INVITE_FAN_COMMISSION', 'PROMOTER_PROFIT', 'FAN_ORDER_COMMISSION'].includes(type)) {
                displayText = `来自粉丝 [${fanName}] 线上消费提成`
            } else if (['AREA_COMMISSION', 'REGION_COMMISSION', 'AGENT_COMMISSION', 'SUBSIDIARY_COMMISSION', 'REGIONAL_PROFIT'].includes(type)) {
                displayText = `来自辖区 [${areaName}] 商家 [${merchantName}] 流水提成`
            } else if (['AFTER_SALE_REFUND', 'REFUND', 'REFUND_DEDUCT', 'REFUND_CLAWBACK', 'COMMISSION_REFUND'].includes(type) || (hasAmount && amount < 0)) {
                displayText = `订单 [${orderNo || '订单待确认'}] 售后退款扣回`
            }
            return {
                ...item,
                change_amount: hasAmount ? amount : '',
                displayText,
                isRefund: ['AFTER_SALE_REFUND', 'REFUND', 'REFUND_DEDUCT', 'REFUND_CLAWBACK', 'COMMISSION_REFUND'].includes(type) || (hasAmount && amount < 0)
            }
        },
        isNegativeAmount(value) {
            const number = Number(value)
            return value !== '' && value !== null && value !== undefined && !Number.isNaN(number) && number < 0
        },
        amountText(value) {
            if (value === '' || value === null || value === undefined) return '积分待确认'
            const number = Number(value)
            if (Number.isNaN(number)) return '积分待确认'
            if (number === 0) return '0'
            return `${number >= 0 ? '+' : ''}${number}`
        }
    }
}
</script>

<style lang="scss">
.ledger-page {
    position: relative;
    min-height: 100vh;
    background:
        radial-gradient(circle at 80% 250rpx, rgba(215, 154, 67, .22) 0, rgba(215, 154, 67, 0) 210rpx),
        linear-gradient(180deg, #fff1dc 0%, #fff7ea 34%, #fffdf8 100%);
    overflow: hidden;
}

.ledger-hero {
    height: calc(555rpx + var(--status-bar-height));
    padding-top: var(--status-bar-height);
    background:
        radial-gradient(circle at 82% 160rpx, rgba(215, 154, 67, .3) 0, rgba(215, 154, 67, 0) 190rpx),
        linear-gradient(180deg, #ffe7bd 0%, #fff1dc 60%, rgba(255, 241, 220, 0) 100%);
    box-sizing: border-box;
}

.ledger-nav {
    height: 97rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}

.ledger-nav__back {
    position: relative;
    width: 56rpx;
    height: 56rpx;
    flex: none;
}

.ledger-nav__back::after {
    content: '';
    position: absolute;
    left: 16rpx;
    top: 15rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.ledger-nav__title {
    color: #222222;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
}

.ledger-nav__capsule {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 168rpx;
    height: 64rpx;
    padding: 0 19rpx;
    border: 1rpx solid transparent;
    border-radius: 32rpx;
    background: transparent;
    box-sizing: border-box;
    flex: none;
    opacity: 0;
}

.ledger-nav__dot {
    width: 46rpx;
    height: 12rpx;
    border-top: 6rpx dotted #222222;
    box-sizing: border-box;
}

.ledger-nav__divider {
    width: 1rpx;
    height: 35rpx;
    background: rgba(0, 0, 0, .16);
}

.ledger-nav__circle {
    width: 31rpx;
    height: 31rpx;
    border: 4rpx solid #222222;
    border-radius: 50%;
    box-sizing: border-box;
}

.points-summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 648rpx;
    height: 170rpx;
    margin: 15rpx 0 0 24rpx;
}

.points-summary__content {
    width: 260rpx;
    margin-top: 8rpx;
}

.points-summary__label {
    color: #8b6b45;
    font-size: 26rpx;
    line-height: 26rpx;
}

.points-summary__value {
    display: flex;
    align-items: center;
    margin-top: 23rpx;
    color: #222222;
    font-size: 55rpx;
    font-weight: 700;
    line-height: 55rpx;
}

.points-summary__coin {
    position: relative;
    width: 52rpx;
    height: 55rpx;
    margin-right: 15rpx;
    border-radius: 50%;
    background: linear-gradient(145deg, #f4c36e 0%, #a0610d 100%);
    box-shadow: inset 0 -6rpx 0 rgba(116, 67, 9, .18);
}

.points-summary__coin::after {
    content: '分';
    position: absolute;
    left: 50%;
    top: 50%;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 700;
    transform: translate(-50%, -50%);
}

.points-summary__illustration {
    position: relative;
    width: 139rpx;
    height: 170rpx;
    border-radius: 70rpx 70rpx 24rpx 24rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f4c36e 100%);
    box-shadow: 0 18rpx 30rpx rgba(160, 97, 13, .18);
}

.points-summary__illustration::before {
    content: '';
    position: absolute;
    left: 29rpx;
    top: 27rpx;
    width: 82rpx;
    height: 82rpx;
    border-radius: 50%;
    background: #ffffff;
}

.points-summary__illustration::after {
    content: '';
    position: absolute;
    left: 42rpx;
    top: 112rpx;
    width: 56rpx;
    height: 22rpx;
    border-radius: 22rpx;
    background: #ffffff;
}

.ledger-panel {
    position: absolute;
    left: 24rpx;
    right: 23rpx;
    top: calc(329rpx + var(--status-bar-height));
    bottom: 0;
    padding-top: 9rpx;
    border-radius: 20rpx 20rpx 0 0;
    background: #ffffff;
    box-sizing: border-box;
    box-shadow: 0 -10rpx 28rpx rgba(42, 126, 204, .08);
}

.filters {
    display: none;
}

.filter-tabs {
    display: flex;
    padding: 6rpx;
    border-radius: 999rpx;
    background: #f1f4f8;
}

.filter-tab {
    min-width: 104rpx;
    height: 52rpx;
    border-radius: 26rpx;
    color: #666666;
    font-size: 24rpx;
    line-height: 52rpx;
    text-align: center;
}

.filter-tab.active {
    color: #ffffff;
    background: #a0610d;
}

.type-picker {
    max-width: 220rpx;
    height: 58rpx;
    padding: 0 22rpx;
    border-radius: 29rpx;
    color: #a0610d;
    background: #fff4e6;
    font-size: 24rpx;
    line-height: 58rpx;
    text-align: center;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ledger-scroll {
    height: calc(100vh - var(--status-bar-height) - 353rpx);
    padding: 0 24rpx calc(28rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
}

.ledger-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
    min-height: 122rpx;
    padding: 0 20rpx 0 13rpx;
    border-bottom: 1rpx solid #eef2f7;
    box-sizing: border-box;
}

.ledger-item__text {
    flex: 1;
    min-width: 0;
}

.ledger-title {
    color: #222222;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 36rpx;
    word-break: break-word;
}

.ledger-title--refund {
    color: #222222;
}

.ledger-time {
    margin-top: 18rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 24rpx;
}

.ledger-amount {
    flex: none;
    max-width: 180rpx;
    color: #fe1b1b;
    font-size: 35rpx;
    font-weight: 500;
    line-height: 35rpx;
    text-align: right;
}

.ledger-amount--minus {
    color: #222222;
}

.empty,
.footer-tip {
    padding: 46rpx 0;
    color: #999999;
    font-size: 26rpx;
    text-align: center;
}
</style>
