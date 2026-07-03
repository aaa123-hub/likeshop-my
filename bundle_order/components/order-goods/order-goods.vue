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
                        {{ item.goods_name || item.name }}
                    </view>
                    <view class="goods-spec xs muted mb20">{{ item.spec_value_str || item.spec_value }}</view>
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
                                <view class="price-name xxs" style="background-color: #e74346">
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
                        <view v-if="item.goods_num" class="goods-num sm">x{{ item.goods_num }}</view>
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
                    v-if="item.comment_btn"
                >
                    <button size="xs" class="plain goods-action br60" hover-class="none">评价晒图</button>
                </navigator>
                <navigator
                    v-if="item.refund_btn"
                    hover-class="none"
                    :url="'/bundle_order/pages/apply_refund/apply_refund?order_id=' + item.order_id + '&item_id=' + item.item_id"
                >
                    <button size="xs" class="plain goods-action goods-action--primary br60" hover-class="none">申请退款</button>
                </navigator>
                <view v-if="item.after_status_desc" class="after-status">
                    {{ item.after_status_desc }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import PriceFormat from '@/bundle_order/components/price-format/price-format.vue'
import CustomImage from '@/components/custom-image/custom-image.vue'

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
        }
    },
    methods: {
        goodsPrice(item) {
            const value = [item.original_price, item.goods_price, item.price].find((price) => price !== undefined && price !== null && price !== '')
            return value === undefined || value === null ? '' : value
        },
        showGoodsFooter(item) {
            return this.link && Boolean(item.comment_btn || item.refund_btn || item.after_status_desc)
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
