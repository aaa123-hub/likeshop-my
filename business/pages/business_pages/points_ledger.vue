<template>
    <view class="ledger-page">
        <navbar :title="roleLabel + '积分流水'" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>
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
                <view>
                    <view :class="['ledger-title', item.isRefund ? 'ledger-title--refund' : '']">{{ item.displayText }}</view>
                    <view class="ledger-time">{{ item.create_time || item.change_time || '' }}</view>
                </view>
                <view :class="['ledger-amount', Number(item.change_amount) < 0 ? 'ledger-amount--minus' : '']">{{ amountText(item.change_amount) }}</view>
            </view>
            <view v-if="!list.length && !loading" class="empty">暂无积分流水</view>
            <view v-if="loading" class="empty">加载中...</view>
            <view v-if="finished && list.length" class="footer-tip">没有更多了</view>
        </scroll-view>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import { getRolePointsLedger } from '@/api/user'

export default {
    components: { Navbar },
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
        roleLabel() {
            const map = { PROMOTER: '推广者', AGENT: '区域代理', SUBSIDIARY: '子公司', HQ: '总部', MERCHANT: '商家' }
            return map[this.roleCode] || this.roleCode
        }
    },
    onLoad(options = {}) {
        this.roleCode = this.normalizeRoleCode(options.roleCode || options.role || 'PROMOTER')
        this.refresh()
    },
    methods: {
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
                const rows = (data.list || []).map(this.normalizeItem)
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
            const amount = Number(item.change_amount ?? item.changeAmount ?? item.pointsChange ?? item.points_change ?? item.pointAmount ?? item.point_amount ?? item.amount ?? 0)
            const fanName = item.fanName || item.fan_name || item.nickname || item.userName || item.user_name || '用户'
            const areaName = item.areaName || item.area_name || item.districtName || item.district_name || '辖区'
            const merchantName = item.merchantName || item.merchant_name || item.shopName || item.shop_name || '商家'
            const orderNo = item.order_no || item.orderNo || item.bizOrderNo || item.biz_order_no || ''
            let displayText = item.remark || item.type_desc || '积分变动'
            if (['FAN_COMMISSION', 'PROMOTER_COMMISSION', 'INVITE_FAN_COMMISSION', 'PROMOTER_PROFIT', 'FAN_ORDER_COMMISSION'].includes(type)) {
                displayText = `来自粉丝 [${fanName}] 线上消费提成`
            } else if (['AREA_COMMISSION', 'REGION_COMMISSION', 'AGENT_COMMISSION', 'SUBSIDIARY_COMMISSION', 'REGIONAL_PROFIT'].includes(type)) {
                displayText = `来自辖区 [${areaName}] 商家 [${merchantName}] 流水提成`
            } else if (['AFTER_SALE_REFUND', 'REFUND', 'REFUND_DEDUCT', 'REFUND_CLAWBACK', 'COMMISSION_REFUND'].includes(type) || amount < 0) {
                displayText = `订单 [${orderNo || '未知订单'}] 售后退款扣回`
            }
            return {
                ...item,
                change_amount: amount,
                displayText,
                isRefund: ['AFTER_SALE_REFUND', 'REFUND', 'REFUND_DEDUCT', 'REFUND_CLAWBACK', 'COMMISSION_REFUND'].includes(type) || amount < 0
            }
        },
        amountText(value) {
            const number = Number(value || 0)
            return `${number >= 0 ? '+' : ''}${number} 积分`
        }
    }
}
</script>

<style lang="scss">
.ledger-page { min-height: 100vh; background: #f6f8fb; }
.filters { display: flex; align-items: center; justify-content: space-between; padding: 22rpx 24rpx; background: #ffffff; }
.filter-tabs { display: flex; padding: 6rpx; border-radius: 999rpx; background: #f1f4f8; }
.filter-tab { min-width: 120rpx; height: 56rpx; border-radius: 28rpx; color: #666666; font-size: 25rpx; line-height: 56rpx; text-align: center; }
.filter-tab.active { color: #ffffff; background: #1677ff; }
.type-picker { min-width: 180rpx; height: 58rpx; padding: 0 22rpx; border-radius: 29rpx; color: #1677ff; background: #eef7ff; font-size: 25rpx; line-height: 58rpx; text-align: center; box-sizing: border-box; }
.ledger-scroll { height: calc(100vh - 190rpx); padding: 20rpx 24rpx; box-sizing: border-box; }
.ledger-item { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-bottom: 16rpx; padding: 24rpx; border-radius: 20rpx; background: #ffffff; box-shadow: 0 8rpx 22rpx rgba(24, 44, 84, .05); }
.ledger-title { color: #222222; font-size: 27rpx; line-height: 38rpx; }
.ledger-title--refund { color: #e85d35; }
.ledger-time { margin-top: 8rpx; color: #999999; font-size: 22rpx; }
.ledger-amount { flex: none; color: #0ca678; font-size: 28rpx; font-weight: 700; }
.ledger-amount--minus { color: #e85d35; }
.empty, .footer-tip { padding: 46rpx 0; color: #999999; font-size: 26rpx; text-align: center; }
</style>
