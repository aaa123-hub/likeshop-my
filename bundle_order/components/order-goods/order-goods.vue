<template>
    <view class="order-goods bg-white">
        <view v-for="(item, index) in list" :key="index" class="item-wrap">
            <view class="item row" @tap="toGoods(item.goods_id)">
                <view class="goods-img">
                    <custom-image
                        width="180rpx"
                        radius="10rpx"
                        height="180rpx"
                        lazy-load
                        :src="item.image_str || item.image"
                    ></custom-image>
                </view>
                <view class="goods-info ml20 flex1">
                    <view class="goods-name line2 mb10">
                        <u-tag
                            class="mr10"
                            v-if="team.need"
                            :text="team.need + '人团'"
                            size="mini"
                            type="primary"
                            mode="plain"
                        />
                        {{ goodsName(item) }}
                    </view>
                    <view v-if="goodsSpec(item)" class="goods-spec xs muted mb20">{{ goodsSpec(item) }}</view>
                    <view class="row-between">
                        <view class="goods-price row">
                            <view class="primary">
                                <price-format
                                    v-if="!item.is_member && order_type === 0 && goodsPrice(item) !== ''"
                                    :weight="500"
                                    :subscript-size="24"
                                    :first-size="34"
                                    :second-size="24"
                                    :price="goodsPrice(item)"
                                ></price-format>
                            </view>
                            <view class="vip-price row" v-if="item.is_member && order_type === 0 && goodsPrice(item) !== ''">
                                <view class="price-name xxs">会员价</view>
                                <view style="padding: 0 10rpx">
                                    <price-format
                                        :price="goodsPrice(item)"
                                        :first-size="22"
                                        :second-size="22"
                                        :subscript-size="22"
                                        :weight="500"
                                        color="#7B3200"
                                    ></price-format>
                                </view>
                            </view>
                            <view class="vip-price row" v-if="(order_type === 1 || order_type === 2 || order_type === 3) && goodsPrice(item) !== ''">
                                <view class="price-name xxs" style="background-color: #a0610d">
                                    <text v-if="order_type === 1">秒杀价</text>
                                    <text v-if="order_type === 2">拼团价</text>
                                    <text v-if="order_type === 3">砍价</text>
                                </view>
                                <view style="padding: 0 10rpx">
                                    <price-format
                                        :price="goodsPrice(item)"
                                        :first-size="22"
                                        :second-size="22"
                                        :subscript-size="22"
                                        :weight="500"
                                        color="#7B3200"
                                    ></price-format>
                                </view>
                            </view>
                        </view>
                        <view v-if="goodsNumText(item)" class="goods-num sm">{{ goodsNumText(item) }}</view>
                    </view>
                </view>
            </view>
            <template v-if="mode === 'comfirm'">
                <view class="delivery" v-if="delivery === 1 && !item.is_express">该商品不支持快递配送</view>
                <view class="delivery" v-if="delivery === 2 && !item.is_selffetch">该商品不支持门店自提</view>
            </template>

            <view class="goods-footer row-end" v-if="showGoodsFooter(item)">
                <navigator
                    class="mr20"
                    hover-class="none"
                    :url="'/bundle_order/pages/goods_reviews/goods_reviews?id=' + item.id"
                    v-if="showComment && item.comment_btn"
                >
                    <button size="xs" class="plain goods-action br60" hover-class="none">评价晒图</button>
                </navigator>
                <navigator
                    v-if="canApplyRefund(item)"
                    hover-class="none"
                    :url="refundUrl(item)"
                >
                    <button size="xs" class="plain goods-action goods-action--primary br60" hover-class="none">申请退款</button>
                </navigator>
                <view v-if="afterStatusText(item)" class="after-status">
                    {{ afterStatusText(item) }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import PriceFormat from '@/bundle_order/components/price-format/price-format.vue'
import CustomImage from '@/components/custom-image/custom-image.vue'
import { cleanEmptyBackendText, cleanBackendText, isEmptyBackendText } from '@/utils/backend-text'

export default {
    components: {
        PriceFormat,
        CustomImage
    },
    props: {
        list: {
            type: Array,
            default: () => []
        },
        link: {
            type: Boolean,
            default: false
        },
        team: {
            type: [Object, Array],
            default: () => ({})
        },
        delivery: {
            type: Number,
            default: 1
        },
        mode: {
            type: String,
            default: 'order'
        },
        order_type: {
            type: Number,
            default: 0
        },
        showComment: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        goodsPrice(item) {
            const value = [item.original_price, item.goods_price, item.price].find((price) => price !== undefined && price !== null && price !== '')
            return value === undefined || value === null ? '' : value
        },
        goodsName(item = {}) {
            return cleanEmptyBackendText(item.goods_name || item.name, '商品待确认')
        },
        goodsSpec(item = {}) {
            return cleanEmptyBackendText(item.spec_value_str || item.spec_value, '')
        },
        goodsNumText(item = {}) {
            const value = this.pickValue(item, ['goods_num', 'goodsNum', 'quantity', 'num'])
            return value === '' ? '' : `x${value}`
        },
        showGoodsFooter(item) {
            return this.link && Boolean((this.showComment && item.comment_btn) || this.canApplyRefund(item) || this.afterStatusText(item))
        },
        canApplyRefund(item = {}) {
            const flag = this.pickValue(item, ['refund_btn', 'refundBtn', 'canRefund', 'can_refund', 'refundable', 'order_can_refund'])
            const statusAllowsRefund = this.canRefundByStatus(item)
            const itemAllowsRefund = flag === '' ? statusAllowsRefund : this.parseBoolean(flag)
            return itemAllowsRefund && !this.afterStatusText(item) && !this.hasAfterSale(item) && Boolean(this.refundOrderId(item) && this.refundItemId(item))
        },
        hasAfterSale(item = {}) {
            const afterSale = item.after_sale || item.afterSale || {}
            const refundInfo = item.refund_info || item.refundInfo || {}
            return Boolean(
                item.after_sale_id ||
                item.afterSaleId ||
                item.refundNo ||
                item.refund_no ||
                item.refundId ||
                item.refund_id ||
                this.afterStatusText(item) ||
                this.hasAfterSalePayload(afterSale) ||
                this.hasAfterSalePayload(refundInfo)
            )
        },
        afterStatusText(item = {}) {
            return this.localizeStatus(
                item.after_status_desc ||
                item.afterStatusDesc ||
                item.after_status ||
                item.afterSaleStatus ||
                item.after_sale_status ||
                item.refundStatusText ||
                item.refund_status_text ||
                item.refundStatus ||
                item.refund_status ||
                item.status_text ||
                item.after_sale?.desc ||
                item.afterSale?.desc ||
                item.after_sale?.refundStatusText ||
                item.afterSale?.refundStatusText ||
                item.after_sale?.refundStatus ||
                item.afterSale?.refundStatus ||
                item.refund_info?.status_text ||
                item.refundInfo?.statusText ||
                item.refund_info?.refundStatusText ||
                item.refundInfo?.refundStatusText ||
                item.refund_info?.refundStatus ||
                item.refundInfo?.refundStatus ||
                ''
            )
        },
        pickValue(source = {}, keys = []) {
            for (const key of keys) {
                const value = source && source[key]
                if (!isEmptyBackendText(value)) return value
            }
            return ''
        },
        hasMeaningfulObject(value) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) return false
            return Object.keys(value).some((key) => {
                const item = value[key]
                if (item === undefined || item === null || item === '') return false
                if (typeof item === 'object') return this.hasMeaningfulObject(item)
                return true
            })
        },
        parseBoolean(value, fallback = false) {
            if (value === undefined || value === null || value === '') return fallback
            if (value === true || value === 1 || value === '1') return true
            if (value === false || value === 0 || value === '0') return false
            const text = String(value).trim().toUpperCase()
            if (['TRUE', 'YES', 'Y', 'ENABLE', 'ENABLED'].includes(text)) return true
            if (['FALSE', 'NO', 'N', 'DISABLE', 'DISABLED'].includes(text)) return false
            return Boolean(value)
        },
        hasAfterSalePayload(value = {}) {
            if (!value || typeof value !== 'object') return false
            return Boolean(this.pickValue(value, [
                'after_sale_id',
                'afterSaleId',
                'afterSaleNo',
                'after_sale_no',
                'refundNo',
                'refund_no',
                'refundId',
                'refund_id',
                'after_status',
                'afterSaleStatus',
                'after_sale_status',
                'status',
                'statusText',
                'status_text',
                'refundStatus',
                'refund_status',
                'refundStatusText',
                'refund_status_text',
                'desc'
            ]))
        },
        canRefundByStatus(item = {}) {
            const status = item.order_status || item.orderStatus
            const value = String(status || '').toUpperCase()
            return status === 1 || value === '1' || ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY'].includes(value)
        },
        refundOrderId(item = {}) {
            return this.pickValue(item, ['order_id', 'orderId', 'orderNo', 'order_sn'])
        },
        refundItemId(item = {}) {
            return this.pickValue(item, ['item_id', 'itemId', 'order_item_id', 'orderItemId', 'id', 'sku_id', 'skuId'])
        },
        refundUrl(item = {}) {
            return `/bundle_order/pages/apply_refund/apply_refund?order_id=${encodeURIComponent(this.refundOrderId(item))}&item_id=${encodeURIComponent(this.refundItemId(item))}`
        },
        localizeStatus(value) {
            const cleaned = cleanBackendText(value, '')
            if (!cleaned) return ''
            const text = String(value || '')
            const map = {
                APPLIED: '待商家处理',
                PENDING: '待商家处理',
                PROCESSING: '处理中',
                REFUNDING: '退款中',
                APPROVED: '商家已同意',
                RETURNING: '待买家退货',
                REJECTED: '商家已拒绝',
                CANCELLED: '已撤销',
                CANCELED: '已撤销',
                REFUNDED: '退款成功',
                SUCCESS: '退款成功',
                FAILED: '退款失败'
            }
            return map[text.toUpperCase()] || cleaned
        },
        toGoods(id) {
            if (!this.link) return
            uni.navigateTo({
                url: `/bundle/pages/goods_details/goods_details?id=${id}`
            })
        }
    }
}
</script>

<style lang="scss">
.order-goods {
    .item {
        padding: 20rpx 24rpx;
        .vip-price {
            background-color: #ffe9ba;
            line-height: 30rpx;
            border-radius: 6rpx;
            overflow: hidden;
            .price-name {
                background-color: #101010;
                padding: 3rpx 10rpx;
                color: #ffd4b7;
                position: relative;
                overflow: hidden;
                &::after {
                    content: '';
                    display: block;
                    width: 20rpx;
                    height: 20rpx;
                    position: absolute;
                    right: -15rpx;
                    background-color: #ffe9ba;
                    border-radius: 50%;
                    top: 50%;
                    transform: translateY(-50%);
                    box-sizing: border-box;
                }
            }
        }
    }
    .goods-footer {
        align-items: center;
        justify-content: flex-end;
        min-height: 70rpx;
        padding: 0 24rpx 18rpx;
        .goods-action {
            border: 1px solid #d6dbe3;
            color: #536173;
            height: 52rpx;
            line-height: 52rpx;
            font-size: 26rpx;
        }

        .goods-action--primary {
            border-color: $color-primary;
            color: $color-primary;
            background: #fff7f8;
        }

        .after-status {
            color: #ff8a00;
            font-size: 24rpx;
            line-height: 34rpx;
        }
    }

    .delivery {
        display: inline-block;
        margin-left: calc(180rpx + 20rpx * 2);
        padding: 4rpx 15rpx;
        border-radius: 60px;
        font-size: 20rpx;
        background-color: #f4f4f4;
        color: #999999;
    }
}
</style>
