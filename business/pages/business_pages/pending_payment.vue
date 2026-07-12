<template>
    <view class="pending-page" :class="{ 'pending-page--notch': isNotchScreen }">
        <view class="page-head">
            <view class="nav-row">
                <view class="back-icon" @tap="goBack"></view>
                <text class="nav-title">待付款</text>
                <view class="nav-capsule">
                    <view class="nav-capsule__dot"></view>
                    <view class="nav-capsule__divider"></view>
                    <view class="nav-capsule__circle"></view>
                </view>
            </view>
            <view class="tips-row">
                <view class="tips-icon-wrap">
                    <image
                        class="tips-icon"
                        src="https://shengyuan.store/api/miniapp/files/miniapp/af8480d8856d4f44839745edb33b090f/ff33c2922125b8c5475cc7e97121c885.png"
                        mode="scaleToFill"
                    ></image>
                </view>
                <view class="tips-copy">
                    <text class="tips-text">温馨提示：请确认订单信息、收货地址和支付方式后再完成付款，线上订单确认收货后积分到账，退款时将按原订单抵扣和赠送记录同步退回。</text>
                </view>
            </view>
        </view>

        <scroll-view v-if="order" class="page-scroll" scroll-y>
            <view class="order-card product-card">
                <view class="address-row" @tap="handleAddressTap">
                    <image
                        class="address-icon"
                        src="https://shengyuan.store/api/miniapp/files/miniapp/24b1ebea2beb495f912d142e2edc47d5/0146a8e36079dd8f8d2ac6992908ca91.png"
                        mode="scaleToFill"
                    ></image>
                    <view class="address-content">
                        <template v-if="selectedAddressTitle || selectedAddressDetail">
                            <text v-if="selectedAddressTitle" class="address-title">{{ selectedAddressTitle }}</text>
                            <text v-if="selectedAddressDetail" class="address-detail">{{ selectedAddressDetail }}</text>
                        </template>
                        <text v-else class="address-text">{{ addressPlaceholder }}</text>
                    </view>
                    <image
                        class="arrow-icon"
                        src="https://shengyuan.store/api/miniapp/files/miniapp/06daad93a2434b5da9b424ba2a6dbf16/028c746e2b6db5e5ace971faf762da45.png"
                        mode="scaleToFill"
                    ></image>
                </view>
                <view v-for="(shop, shopIndex) in shopGroups" :key="shop.key" class="shop-block">
                    <view class="divider"></view>
                    <view class="shop-row">
                        <view class="shop-logo"></view>
                        <text class="shop-name">{{ shop.name }}</text>
                    </view>
                    <view
                        v-for="(item, itemIndex) in shop.items"
                        :key="goodsKey(item, itemIndex)"
                        class="shop-goods-wrap"
                    >
                        <view class="divider"></view>
                        <view class="goods-row">
                            <image v-if="goodsImage(item)" class="goods-image" :src="goodsImage(item)" mode="aspectFill"></image>
                            <view v-else class="goods-image"></view>
                            <view class="goods-info">
                                <text class="goods-name">{{ goodsDisplayName(item) }}</text>
                                <text v-if="goodsDisplaySpec(item)" class="goods-spec">{{ goodsDisplaySpec(item) }}</text>
                                <view v-if="goodsDisplayPriceText(item)" class="goods-price">
                                    <text class="price-symbol">¥</text>
                                    <text class="price-main">{{ splitAmount(goodsDisplayPrice(item)).main }}</text>
                                    <text class="price-decimal">{{ splitAmount(goodsDisplayPrice(item)).decimal }}</text>
                                </view>
                                <view v-else class="goods-price goods-price--pending">金额待确认</view>
                            </view>
                            <text class="goods-num">{{ goodsDisplayNumText(item) }}</text>
                        </view>
                    </view>
                </view>
                <view class="divider"></view>
                <view class="summary-row freight-row">
                    <text>运费</text>
                    <text class="muted-text">{{ freightHintText }}</text>
                </view>
            </view>

            <view class="remark-card">
                <text>买家留言</text>
                <text class="muted-text">选填</text>
            </view>

            <view class="order-card price-card">
                <view class="summary-row">
                    <text>商品总价</text>
                    <text>{{ goodsAmountText }}</text>
                </view>
                <view class="divider"></view>
                <view class="summary-row">
                    <text>运费合计</text>
                    <text class="muted-text">{{ freightHintText }}</text>
                </view>
                <view class="divider"></view>
                <view class="summary-row" @tap="openCouponPopup">
                    <text>优惠券</text>
                    <view class="coupon-value">
                        <text :class="effectiveDiscountAmount > 0 ? 'deduct-text' : 'muted-text'">{{ couponText }}</text>
                        <image
                            class="small-arrow"
                            src="https://shengyuan.store/api/miniapp/files/miniapp/3849158480cd4923b9cc5b2b70851070/ae74a0c5306c3522ddc47cca96392384.png"
                            mode="scaleToFill"
                        ></image>
                    </view>
                </view>
                <view class="divider"></view>
                <view class="summary-row points-row" :class="{ 'points-row--disabled': !pointsInfo.enabled }">
                    <view class="points-copy">
                        <text>积分抵扣</text>
                        <text class="points-desc">{{ pointsSummaryText }}</text>
                    </view>
                    <view class="points-value">
                        <text class="points-num">{{ pointsInfo.availableText }}</text>
                    </view>
                </view>
                <template v-if="pointsInfo.enabled">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>最多抵扣</text>
                        <text class="muted-text">{{ pointsInfo.maxDeductText }}</text>
                    </view>
                </template>
                <template v-if="pointsInfo.deductAmount > 0">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>积分抵扣金额</text>
                        <text class="deduct-text">-¥{{ formatAmount(pointsInfo.deductAmount) }}</text>
                    </view>
                </template>
                <template v-if="pointsInfo.used > 0">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>使用积分</text>
                        <text class="muted-text">{{ pointsInfo.used }}积分</text>
                    </view>
                </template>
                <template v-else-if="pointsInfo.hasUsed && pointsInfo.enabled">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>使用积分</text>
                        <text class="muted-text">0积分</text>
                    </view>
                </template>
                <template v-if="pointsInfo.give > 0">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>预计到账积分</text>
                        <text class="muted-text">+{{ pointsInfo.give }}积分</text>
                    </view>
                </template>
                <template v-else-if="pointsInfo.hasGive">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>预计到账积分</text>
                        <text class="muted-text">0积分</text>
                    </view>
                </template>
            </view>

            <view class="pay-section">
                <view class="section-title-row">
                    <view class="title-mark"></view>
                    <text>付款方式</text>
                </view>
                <view class="pay-card">
                    <view class="pay-notice">
                        <view class="pay-notice__icon"></view>
                        <view class="pay-notice__body">
                            <text class="pay-notice__title">继续付款后选择支付方式</text>
                            <text class="pay-notice__desc">可用支付方式以支付页展示为准</text>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <view v-else class="pending-empty">暂无待付款订单</view>

        <view v-if="order" class="bottom-bar">
            <text class="goods-count">{{ goodsTotalCountText }}</text>
            <text class="total-label">合计：</text>
            <view class="total-stack">
                <view class="total-price">
                    <text class="total-symbol">¥</text>
                    <text class="total-main">{{ totalAmountParts.main }}</text>
                    <text class="total-decimal">{{ totalAmountParts.decimal }}</text>
                </view>
                <text v-if="bottomDeductText" class="bottom-deduct">{{ bottomDeductText }}</text>
            </view>
            <view class="pay-button" @tap="handlePay">
                <text class="pay-button__main">继续付款</text>
                <text class="pay-button__sub">{{ paymentCountdownText }}</text>
            </view>
        </view>

        <u-popup v-model="showCoupon" border-radius="18" mode="bottom" closeable>
            <view class="coupon-popup">
                <view class="coupon-popup-title">优惠券</view>
                <view class="coupon-tabs">
                    <view :class="['coupon-tab', couponTabsIndex === 0 ? 'is-active' : '']" @tap="couponTabsIndex = 0">可使用({{ usableCoupon.length }})</view>
                    <view :class="['coupon-tab', couponTabsIndex === 1 ? 'is-active' : '']" @tap="couponTabsIndex = 1">不可用({{ unusableCoupon.length }})</view>
                </view>
                <scroll-view class="coupon-scroll" scroll-y>
                    <view
                        v-for="(item, index) in currentCouponList"
                        :key="couponStableKey(item, index)"
                        :class="['coupon-card', couponTabsIndex === 1 ? 'coupon-card--disabled' : '']"
                        :data-coupon-index="index"
                        :data-coupon-key="couponStableKey(item, index)"
                        @tap="toggleCouponByEvent"
                    >
                        <view class="coupon-price">
                            <text class="coupon-symbol">¥</text>
                            <text>{{ couponAmountValue(item) }}</text>
                        </view>
                        <view class="coupon-info">
                            <view class="coupon-name">{{ couponName(item) }}</view>
                            <view class="coupon-desc">{{ couponConditionText(item) }}</view>
                            <view class="coupon-desc">{{ couponTimeText(item) }}</view>
                        </view>
                        <view
                            v-if="couponTabsIndex === 0"
                            :class="['coupon-check', isCouponPendingSelected(item) ? 'coupon-check--active' : '']"
                            :data-coupon-index="index"
                            :data-coupon-key="couponStableKey(item, index)"
                            @tap.stop="toggleCouponByEvent"
                        ></view>
                    </view>
                    <view v-if="!currentCouponList.length" class="coupon-empty">暂无优惠券</view>
                </scroll-view>
                <view class="coupon-confirm" @tap="confirmCouponPopup">确定</view>
            </view>
        </u-popup>
    </view>
</template>

<script>
import UPopup from '@/bundle/components/uview-ui/components/u-popup/u-popup.vue'
import { getOrderDetail } from '@/api/order'
import { cleanEmptyBackendText } from '@/utils/backend-text'

export default {
    components: {
        UPopup
    },
    data() {
        return {
            order: null,
            isNotchScreen: false,
            selectedStore: null,
            couponId: '',
            selectedCouponCache: null,
            selectedCouponCandidateIds: [],
            pendingCouponId: '',
            pendingCouponCache: null,
            pendingCouponCandidateIds: [],
            couponManuallyCleared: false,
            showCoupon: false,
            couponTabsIndex: 0,
            usableCoupon: [],
            unusableCoupon: []
        }
    },
    computed: {
        isSelfFetchOrder() {
            const order = this.order || {}
            const type = String(this.firstDefined(order.delivery_type, order.deliveryType, order.deliveryMode, order.orderChannel, order.order_channel, '')).toUpperCase()
            const categoryType = this.orderCategoryType(order)
            if (order.delivery_type === 2 || order.deliveryType === 2 || order.delivery_type === '2' || order.deliveryType === '2') return true
            return categoryType === 'OFFLINE' || ['PICKUP', 'SELF_FETCH', 'SELF_PICKUP', 'SELFFETCH', 'STORE_PICKUP', 'OFFLINE_PICKUP'].includes(type)
        },
        selectedAddressTitle() {
            if (this.isSelfFetchOrder) {
                return ''
            }
            const order = this.order || {}
            return this.safeText(this.firstDefined(order.consignee, order.receiverName, order.contact, ''))
        },
        selectedAddressDetail() {
            if (this.isSelfFetchOrder) {
                const store = this.pickStoreInfo()
                return this.safeText(this.firstDefined(
                    store.map_address,
                    store.mapAddress,
                    store.shop_address,
                    store.address,
                    store.detailAddress,
                    store.detail_address,
                    store.poiAddress,
                    store.poiaddress,
                    ''
                ))
            }
            const order = this.order || {}
            return this.safeText(this.firstDefined(
                order.delivery_address,
                order.addressText,
                order.fullAddress,
                order.receiverAddress,
                order.detailAddress,
                ''
            ))
        },
        addressPlaceholder() {
            return this.isSelfFetchOrder ? '请选择自提门店' : '请选择收货地址'
        },
        shopNameText() {
            const order = this.order || {}
            return this.safeText(order.shopName || order.shop_name, '店铺待确认')
        },
        goodsList() {
            const order = this.order || {}
            return order.order_goods || order.goods_lists || order.itemList || order.items || []
        },
        shopGroups() {
            const order = this.order || {}
            const rawShopOrders = order.shopOrders || order.shop_orders || []
            if (Array.isArray(rawShopOrders) && rawShopOrders.length) {
                return rawShopOrders.map((shop, index) => {
                    const items = shop.itemList || shop.items || shop.goodsList || shop.goods_lists || shop.order_goods || []
                    return {
                        key: this.firstDefined(shop.shopId, shop.shop_id, shop.id, `shop_${index}`),
                        name: this.safeText(this.firstDefined(shop.shopName, shop.shop_name, shop.name, shop.storeName, shop.store_name, this.shopNameText), '店铺待确认'),
                        items: Array.isArray(items) && items.length ? items : this.goodsList
                    }
                })
            }
            const groups = []
            this.goodsList.forEach((item, index) => {
                const shopId = this.firstDefined(item.shop_id, item.shopId, item.store_id, item.storeId, order.shop_id, order.shopId, 'default')
                let group = groups.find((shop) => shop.key === String(shopId))
                if (!group) {
                    group = {
                        key: String(shopId || `shop_${index}`),
                        name: this.safeText(this.firstDefined(item.shop_name, item.shopName, item.store_name, item.storeName, order.shop_name, order.shopName), '店铺待确认'),
                        items: []
                    }
                    groups.push(group)
                }
                group.items.push(item)
            })
            if (groups.length) return groups
            return [{
                key: 'default',
                name: this.shopNameText,
                items: [{
                    goods_name: this.goodsNameText,
                    spec_value_str: this.goodsSpecText,
                    goods_price: this.firstDefined(order.goods_price, order.goodsPrice, order.price, order.payAmount, order.order_amount, ''),
                    goods_num: this.firstDefined(order.goods_num, order.goodsNum, order.num, '')
                }]
            }]
        },
        goodsNameText() {
            const order = this.order || {}
            const firstGoods = (order.order_goods || order.goods_lists || [])[0] || {}
            return this.safeText(order.goodsName || order.goods_name || firstGoods.goods_name || firstGoods.name, '商品待确认')
        },
        goodsSpecText() {
            const order = this.order || {}
            const firstGoods = (order.order_goods || order.goods_lists || [])[0] || {}
            return this.safeText(order.spec || order.spec_value_str || firstGoods.spec_value_str || firstGoods.spec_value, '')
        },
        freightHintText() {
            return this.isSelfFetchOrder ? '自提无需运费' : '填写地址后自动算运费'
        },
        pointsInfo() {
            const order = this.order || {}
            const pointsInfo = this.normalizedPointsInfo
            const baseInfo = order.baseInfo || order.base_info || {}
            const orderInfo = order.orderInfo || order.order_info || {}
            const amountInfo = order.amountInfo || order.amount_info || order.settlementAmount || order.settlement_amount || baseInfo.amountInfo || baseInfo.amount_info || orderInfo.amountInfo || orderInfo.amount_info || {}
            const pointsAccount = order.pointsAccount || order.points_account || order.userPoints || order.user_points || baseInfo.pointsAccount || baseInfo.points_account || orderInfo.pointsAccount || orderInfo.points_account || {}
            const enabledValue = this.firstDefined(
                order.integralSwitch,
                order.integral_switch,
                order.pointsEnabled,
                order.points_enabled,
                order.supportPoints,
                order.support_points,
                order.canUsePoints,
                order.can_use_points,
                baseInfo.integralSwitch,
                baseInfo.integral_switch,
                orderInfo.integralSwitch,
                orderInfo.integral_switch,
                pointsInfo.integralSwitch,
                pointsInfo.integral_switch,
                pointsInfo.pointsEnabled,
                pointsInfo.points_enabled,
                pointsInfo.supportPoints,
                pointsInfo.support_points,
                pointsInfo.canUsePoints,
                pointsInfo.can_use_points,
                ''
            )
            const availableRaw = this.firstDefined(
                order.user_integral,
                order.userIntegral,
                order.availablePoints,
                order.available_points,
                order.availableIntegral,
                order.available_integral,
                order.points,
                order.totalPoints,
                order.total_points,
                order.integral,
                baseInfo.user_integral,
                baseInfo.userIntegral,
                baseInfo.availablePoints,
                baseInfo.available_points,
                baseInfo.integral,
                orderInfo.user_integral,
                orderInfo.userIntegral,
                orderInfo.availablePoints,
                orderInfo.available_points,
                orderInfo.integral,
                pointsAccount.availablePoints,
                pointsAccount.available_points,
                pointsAccount.availableIntegral,
                pointsAccount.available_integral,
                pointsAccount.points,
                pointsAccount.integral,
                pointsInfo.userIntegral,
                pointsInfo.user_integral,
                pointsInfo.available,
                pointsInfo.availablePoints,
                pointsInfo.available_points,
                pointsInfo.availableIntegral,
                pointsInfo.available_integral,
                pointsInfo.points,
                pointsInfo.integral
            )
            const hasAvailable = this.hasBackendValue(availableRaw)
            const available = hasAvailable ? this.numberValue(availableRaw) : 0
            const usedRaw = this.firstDefined(
                order.pointsAmount,
                order.points_amount,
                order.usedPoints,
                order.used_points,
                order.integralNum,
                order.integral_num,
                order.maxUsablePoints,
                order.max_usable_points,
                order.maxUsableIntegral,
                order.max_usable_integral,
                order.usablePoints,
                order.usable_points,
                order.usableIntegral,
                order.usable_integral,
                baseInfo.pointsAmount,
                baseInfo.points_amount,
                baseInfo.usedPoints,
                baseInfo.used_points,
                baseInfo.integralNum,
                baseInfo.integral_num,
                orderInfo.pointsAmount,
                orderInfo.points_amount,
                orderInfo.usedPoints,
                orderInfo.used_points,
                orderInfo.integralNum,
                orderInfo.integral_num,
                amountInfo.pointsAmount,
                amountInfo.points_amount,
                amountInfo.integralNum,
                amountInfo.integral_num,
                pointsInfo.pointsAmount,
                pointsInfo.points_amount,
                pointsInfo.used,
                pointsInfo.usedPoints,
                pointsInfo.used_points,
                pointsInfo.integralNum,
                pointsInfo.integral_num,
                pointsInfo.maxUsablePoints,
                pointsInfo.max_usable_points,
                pointsInfo.usablePoints,
                pointsInfo.usable_points
            )
            const hasUsed = this.hasBackendValue(usedRaw)
            const used = hasUsed ? this.numberValue(usedRaw) : 0
            const backendDeductAmountRaw = this.firstDefined(
                order.pointsDeductAmount,
                order.points_deduct_amount,
                order.integralAmount,
                order.integral_amount,
                order.integralDeductAmount,
                order.integral_deduct_amount,
                baseInfo.pointsDeductAmount,
                baseInfo.points_deduct_amount,
                baseInfo.integralAmount,
                baseInfo.integral_amount,
                baseInfo.integralDeductAmount,
                baseInfo.integral_deduct_amount,
                orderInfo.pointsDeductAmount,
                orderInfo.points_deduct_amount,
                orderInfo.integralAmount,
                orderInfo.integral_amount,
                orderInfo.integralDeductAmount,
                orderInfo.integral_deduct_amount,
                amountInfo.pointsDeductAmount,
                amountInfo.points_deduct_amount,
                amountInfo.integralAmount,
                amountInfo.integral_amount,
                amountInfo.integralDeductAmount,
                amountInfo.integral_deduct_amount,
                amountInfo.maxDeductAmount,
                amountInfo.max_deduct_amount,
                pointsInfo.pointsDeductAmount,
                pointsInfo.points_deduct_amount,
                pointsInfo.deductAmount,
                pointsInfo.deduct_amount,
                pointsInfo.integralAmount,
                pointsInfo.integral_amount,
                pointsInfo.integralDeductAmount,
                pointsInfo.integral_deduct_amount
            )
            const hasBackendDeductAmount = this.hasBackendValue(backendDeductAmountRaw)
            const backendDeductAmount = hasBackendDeductAmount ? this.numberValue(backendDeductAmountRaw) : 0
            const maxDeductAmountRaw = this.firstDefined(
                order.maxDeductAmount,
                order.max_deduct_amount,
                order.maxPointsDeductAmount,
                order.max_points_deduct_amount,
                order.maxIntegralDeductAmount,
                order.max_integral_deduct_amount,
                baseInfo.maxDeductAmount,
                baseInfo.max_deduct_amount,
                orderInfo.maxDeductAmount,
                orderInfo.max_deduct_amount,
                amountInfo.maxDeductAmount,
                amountInfo.max_deduct_amount,
                pointsInfo.maxDeductAmount,
                pointsInfo.max_deduct_amount,
                pointsInfo.maxPointsDeductAmount,
                pointsInfo.max_points_deduct_amount,
                pointsInfo.maxIntegralDeductAmount,
                pointsInfo.max_integral_deduct_amount
            )
            const hasMaxDeductAmount = this.hasBackendValue(maxDeductAmountRaw)
            const maxDeductAmount = hasMaxDeductAmount ? this.numberValue(maxDeductAmountRaw) : 0
            const exchangeRate = this.pointsExchangeRate(order, baseInfo, orderInfo, amountInfo, pointsInfo)
            const byPoints = exchangeRate > 0 ? available * exchangeRate : 0
            const deductCandidates = [
                backendDeductAmount,
                maxDeductAmount,
                this.orderAmountBeforePoints,
                byPoints
            ].filter((value) => Number(value) > 0)
            const deductAmount = deductCandidates.length ? Number(Math.min(...deductCandidates).toFixed(2)) : 0
            const normalizedUsed = used > 0
                ? Math.min(available || used, used)
                : (deductAmount > 0 && exchangeRate > 0 ? Math.min(available, Math.ceil(deductAmount / exchangeRate)) : 0)
            const giveRaw = this.firstDefined(
                order.order_give_integral,
                order.giveIntegral,
                order.give_integral,
                order.rewardPoints,
                order.reward_points,
                baseInfo.order_give_integral,
                baseInfo.giveIntegral,
                baseInfo.give_integral,
                orderInfo.order_give_integral,
                orderInfo.giveIntegral,
                orderInfo.give_integral,
                pointsInfo.giveIntegral,
                pointsInfo.give_integral,
                pointsInfo.rewardPoints,
                pointsInfo.reward_points
            )
            const hasGive = this.hasBackendValue(giveRaw)
            const give = hasGive ? this.numberValue(giveRaw) : 0
            const hasAnyData = Boolean(
                hasAvailable
                || hasUsed
                || hasBackendDeductAmount
                || hasMaxDeductAmount
                || hasGive
                || enabledValue !== ''
                || Object.keys(pointsInfo || {}).length
            )
            const enabled = this.boolValue(enabledValue, available > 0 || used > 0 || deductAmount > 0)
            return {
                available,
                availableText: hasAvailable ? `${available}积分` : '积分待确认',
                used: normalizedUsed,
                deductAmount,
                hasAvailable,
                hasUsed,
                hasGive,
                hasBackendDeductAmount,
                maxDeductAmount: maxDeductAmount > 0 ? Math.min(maxDeductAmount, this.orderAmountBeforePoints || maxDeductAmount) : 0,
                maxDeductText: maxDeductAmount > 0 ? `¥${this.formatAmount(Math.min(maxDeductAmount, this.orderAmountBeforePoints || maxDeductAmount))}` : (exchangeRate > 0 && available > 0 ? `¥${this.formatAmount(deductAmount)}` : '待确认'),
                give,
                enabled,
                hasAnyData
            }
        },
        shouldUsePoints() {
            return this.pointsInfo.enabled && (this.pointsInfo.used > 0 || this.pointsInfo.deductAmount > 0)
        },
        pointsSummaryText() {
            if (!this.pointsInfo.hasAnyData) return '订单详情未返回积分抵扣数据'
            if (!this.pointsInfo.enabled) return '当前订单暂不支持积分抵扣'
            if (this.pointsInfo.deductAmount > 0 && this.pointsInfo.used > 0) return `已用${this.pointsInfo.used}积分抵扣¥${this.formatAmount(this.pointsInfo.deductAmount)}`
            if (this.pointsInfo.deductAmount > 0) return `已抵扣¥${this.formatAmount(this.pointsInfo.deductAmount)}`
            if (this.pointsInfo.used > 0) return `已使用${this.pointsInfo.used}积分`
            if (this.pointsInfo.available > 0) return '有可用积分，抵扣金额待确认'
            if (!this.pointsInfo.hasAvailable) return '可用积分待确认'
            return '暂无可用积分抵扣'
        },
        normalizedPointsInfo() {
            const order = this.order || {}
            const baseInfo = order.baseInfo || order.base_info || {}
            const orderInfo = order.orderInfo || order.order_info || {}
            return order.pointsInfo || order.points_info || order.integralInfo || order.integral_info || order.pointsConfig || order.points_config || baseInfo.pointsInfo || baseInfo.points_info || baseInfo.integralInfo || baseInfo.integral_info || orderInfo.pointsInfo || orderInfo.points_info || orderInfo.integralInfo || orderInfo.integral_info || {}
        },
        selectedCoupon() {
            if (!this.couponId) return null
            const ids = this.selectedCouponCandidateIds.length ? this.selectedCouponCandidateIds : [this.couponId]
            return this.usableCoupon.find(item => this.couponIdsIntersect(this.couponCompareIds(item), ids)) || this.selectedCouponCache || null
        },
        discountAmount() {
            if (!this.couponId) return 0
            const order = this.order || {}
            const amountInfo = order.amountInfo || order.amount_info || order.settlementAmount || order.settlement_amount || {}
            return this.numberValue(this.firstDefined(
                order.discount_amount,
                order.discountAmount,
                order.coupon_discount_amount,
                order.couponDiscountAmount,
                order.coupon_amount,
                order.couponAmount,
                amountInfo.discountAmount,
                amountInfo.discount_amount,
                amountInfo.couponDiscountAmount,
                amountInfo.coupon_discount_amount,
                amountInfo.couponAmount,
                amountInfo.coupon_amount,
                0
            ))
        },
        effectiveDiscountAmount() {
            if (this.selectedCoupon) return this.discountAmount || this.couponAmountValue(this.selectedCoupon)
            return this.discountAmount
        },
        couponText() {
            if (this.couponManuallyCleared && !this.couponId) return '不使用优惠券'
            if (this.effectiveDiscountAmount > 0) return `-¥${this.formatAmount(this.effectiveDiscountAmount)}`
            if (this.selectedCoupon) return this.couponName(this.selectedCoupon)
            if (this.usableCoupon.length) return `${this.usableCoupon.length}张可用`
            return '没有可用的优惠券'
        },
        currentCouponList() {
            return this.couponTabsIndex === 0 ? this.usableCoupon : this.unusableCoupon
        },
        orderAmountBeforePoints() {
            const order = this.order || {}
            const amountInfo = order.amountInfo || order.amount_info || order.settlementAmount || order.settlement_amount || {}
            const rawAmount = this.firstDefined(
                order.payAmount,
                order.pay_amount,
                order.order_amount,
                order.orderAmount,
                amountInfo.payAmount,
                amountInfo.pay_amount,
                order.totalAmount,
                order.total_amount,
                0
            )
            return Math.max(this.numberValue(rawAmount) - this.effectiveDiscountAmount, 0)
        },
        goodsAmountText() {
            const order = this.order || {}
            const amountInfo = order.amountInfo || order.amount_info || order.settlementAmount || order.settlement_amount || {}
            const value = this.firstDefined(
                order.goodsAmount,
                order.goods_amount,
                order.goods_price,
                order.totalGoodsAmount,
                order.total_goods_amount,
                order.total_goods_price,
                amountInfo.goodsAmount,
                amountInfo.goods_amount,
                amountInfo.totalGoodsAmount,
                amountInfo.total_goods_amount,
                ''
            )
            if (value === '') return '待确认'
            return `¥${this.formatAmount(value)}`
        },
        totalPayAmount() {
            const order = this.order || {}
            const amountInfo = order.amountInfo || order.amount_info || order.settlementAmount || order.settlement_amount || {}
            const rawAmount = this.firstDefined(
                order.payAmount,
                order.pay_amount,
                order.order_amount,
                order.orderAmount,
                amountInfo.payAmount,
                amountInfo.pay_amount,
                order.totalAmount,
                order.total_amount,
                order.totalMain !== undefined || order.totalDecimal !== undefined ? `${order.totalMain || 0}${order.totalDecimal || '.00'}` : '',
                0
            )
            const baseAmount = this.numberValue(rawAmount)
            if (!this.selectedCoupon || this.discountAmount > 0) return baseAmount
            return Math.max(baseAmount - this.effectiveDiscountAmount, 0)
        },
        totalAmountParts() {
            return this.splitAmount(this.totalPayAmount)
        },
        goodsTotalCount() {
            return this.shopGroups.reduce((sum, shop) => {
                const items = Array.isArray(shop.items) ? shop.items : []
                return sum + items.reduce((itemSum, item) => {
                    const num = this.goodsDisplayNum(item)
                    return itemSum + (num > 0 ? num : 0)
                }, 0)
            }, 0)
        },
        goodsTotalCountText() {
            return this.goodsTotalCount > 0 ? `共${this.goodsTotalCount}件` : '件数待确认'
        },
        bottomDeductText() {
            if (this.pointsInfo.deductAmount > 0) return `积分抵扣:¥${this.formatAmount(this.pointsInfo.deductAmount)}`
            if (this.effectiveDiscountAmount > 0) return `优惠抵扣:¥${this.formatAmount(this.effectiveDiscountAmount)}`
            return ''
        },
        paymentCountdownText() {
            const order = this.order || {}
            const text = this.firstDefined(order.payLeftTimeText, order.pay_left_time_text, order.countdownText, order.countdown_text, order.expireTimeText, order.expire_time_text, '')
            if (text) return String(text).startsWith('剩余') ? text : `剩余：${text}`
            const seconds = this.numberValue(this.firstDefined(order.payLeftSeconds, order.pay_left_seconds, order.countdownSeconds, order.countdown_seconds, order.expireSeconds, order.expire_seconds, 0))
            if (seconds > 0) return `剩余：${this.formatCountdown(seconds)}`
            return '剩余：待确认'
        }
    },
    onLoad(options = {}) {
        this.setScreenSafeState()
        this.bindStoreEvents()
        this.initOrder(options)
    },
    onShow() {
        this.applyCachedStore()
    },
    onUnload() {
        uni.$off('store')
        uni.$off('store:selected')
    },
    methods: {
        firstDefined(...values) {
            return values.find((value) => value !== undefined && value !== null && value !== '')
        },
        safeText(value, fallback = '') {
            return cleanEmptyBackendText(value, fallback)
        },
        numberValue(value) {
            const number = Number(value)
            return Number.isNaN(number) ? 0 : number
        },
        hasBackendValue(value) {
            return value !== undefined && value !== null && value !== ''
        },
        boolValue(value, fallback = false) {
            if (value === undefined || value === null || value === '') return fallback
            if (typeof value === 'boolean') return value
            if (typeof value === 'number') return value !== 0
            const normalized = String(value).trim().toUpperCase()
            if (['0', 'FALSE', 'NO', 'N', 'OFF', 'DISABLED'].includes(normalized)) return false
            if (['1', 'TRUE', 'YES', 'Y', 'ON', 'ENABLED'].includes(normalized)) return true
            return fallback
        },
        orderCategoryType(order = {}) {
            const candidates = [
                order.categoryType,
                order.category_type,
                order.goodsCategoryType,
                order.goods_category_type,
                order.orderScene,
                order.order_scene,
                order.scene,
                order.freightType,
                order.freight_type
            ]
            const goods = order.order_goods || order.goods_lists || order.itemList || order.items || []
            if (Array.isArray(goods)) {
                goods.forEach((item = {}) => {
                    candidates.push(item.categoryType, item.category_type, item.goodsCategoryType, item.goods_category_type, item.orderScene, item.order_scene, item.freightType, item.freight_type)
                })
            }
            return String(this.firstDefined(...candidates, '')).toUpperCase()
        },
        isOfflineCategoryOrder(order = {}) {
            const categoryType = this.orderCategoryType(order)
            const channel = String(this.firstDefined(order.orderChannel, order.order_channel, '')).toUpperCase()
            return categoryType === 'OFFLINE' || categoryType === 'PICKUP' || channel === 'OFFLINE_PICKUP'
        },
        normalizeOfflineOrderDelivery() {
            if (!this.order || !this.isOfflineCategoryOrder(this.order)) return
            this.$set(this.order, 'delivery_type', 2)
            this.$set(this.order, 'deliveryType', 2)
            this.$set(this.order, 'orderChannel', 'OFFLINE_PICKUP')
            this.$set(this.order, 'order_channel', 'OFFLINE_PICKUP')
            this.$set(this.order, 'freight', 0)
            this.$set(this.order, 'freight_amount', 0)
            uni.setStorageSync('pending_payment_order', this.order)
        },
        formatAmount(value) {
            return this.numberValue(value).toFixed(2)
        },
        formatCountdown(seconds) {
            const total = Math.max(0, Math.floor(Number(seconds) || 0))
            const hours = Math.floor(total / 3600)
            const minutes = Math.floor((total % 3600) / 60)
            const secs = total % 60
            const pad = value => String(value).padStart(2, '0')
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
        },
        pointsExchangeRate(order = {}, baseInfo = {}, orderInfo = {}, amountInfo = {}, pointsInfo = {}) {
            const raw = this.numberValue(this.firstDefined(
                pointsInfo.exchangeAmount,
                pointsInfo.exchange_amount,
                pointsInfo.moneyPerPoint,
                pointsInfo.money_per_point,
                pointsInfo.amountPerPoint,
                pointsInfo.amount_per_point,
                pointsInfo.pointMoney,
                pointsInfo.point_money,
                pointsInfo.exchangeRate,
                pointsInfo.exchange_rate,
                pointsInfo.deductRate,
                pointsInfo.deduct_rate,
                pointsInfo.pointRate,
                pointsInfo.point_rate,
                pointsInfo.integralRate,
                pointsInfo.integral_rate,
                pointsInfo.integralRatio,
                pointsInfo.integral_ratio,
                pointsInfo.pointsRatio,
                pointsInfo.points_ratio,
                amountInfo.exchangeRate,
                amountInfo.exchange_rate,
                amountInfo.deductRate,
                amountInfo.deduct_rate,
                orderInfo.exchangeRate,
                orderInfo.exchange_rate,
                baseInfo.exchangeRate,
                baseInfo.exchange_rate,
                order.exchangeAmount,
                order.exchange_amount,
                order.moneyPerPoint,
                order.money_per_point,
                order.amountPerPoint,
                order.amount_per_point,
                order.exchangeRate,
                order.exchange_rate,
                order.deductRate,
                order.deduct_rate,
                order.integralRate,
                order.integral_rate,
                order.integralRatio,
                order.integral_ratio,
                0
            ))
            if (raw > 0 && raw <= 1) return raw
            if (raw > 1) return 1 / raw
            return 0
        },
        splitAmount(value) {
            const parts = this.formatAmount(value).split('.')
            return {
                main: parts[0] || '0',
                decimal: `.${parts[1] || '00'}`
            }
        },
        goodsKey(item = {}, index = 0) {
            return this.firstDefined(item.item_id, item.itemId, item.goods_id, item.goodsId, item.skuId, item.sku_id, item.id, `goods_${index}`)
        },
        goodsImage(item = {}) {
            return this.firstDefined(item.image, item.image_str, item.goods_image, item.goodsImage, item.pic, item.cover, item.imageUrl, item.image_url, '')
        },
        goodsDisplayName(item = {}) {
            return this.safeText(this.firstDefined(item.goods_name, item.goodsName, item.name, item.title, this.goodsNameText), '商品待确认')
        },
        goodsDisplaySpec(item = {}) {
            return this.safeText(this.firstDefined(item.spec_value_str, item.specValueStr, item.spec_value, item.specValue, item.skuValue, item.sku_value, item.spec, ''))
        },
        goodsDisplayPrice(item = {}) {
            const value = this.firstDefined(item.original_price, item.originalPrice, item.goods_price, item.goodsPrice, item.price, item.sellPrice, item.sell_price, item.amount, '')
            return value === '' ? '' : this.numberValue(value)
        },
        goodsDisplayPriceText(item = {}) {
            const value = this.goodsDisplayPrice(item)
            return value === '' ? '' : this.formatAmount(value)
        },
        goodsDisplayNum(item = {}) {
            const value = this.firstDefined(item.goods_num, item.goodsNum, item.num, item.quantity, item.count, '')
            return value === '' ? '' : this.numberValue(value)
        },
        goodsDisplayNumText(item = {}) {
            const value = this.goodsDisplayNum(item)
            return value === '' || value <= 0 ? '数量待确认' : `X${value}`
        },
        async initOrder(options = {}) {
            const encoded = this.firstDefined(options.order, options.data, options.detail)
            if (encoded) {
                try {
                    this.order = JSON.parse(decodeURIComponent(encoded))
                } catch (error) {}
            }
            const cached = uni.getStorageSync('pending_payment_order')
            if (!this.order && cached) this.order = cached
            if (this.order) {
                this.normalizeOfflineOrderDelivery()
                this.applyOrderStore()
                this.syncCouponData(this.order)
            }
            const orderId = this.firstDefined(options.id, options.order_id, options.orderNo, options.order_sn, this.order && (this.order.id || this.order.order_id || this.order.orderNo || this.order.order_sn))
            if (!orderId) return
            try {
                const res = await getOrderDetail(orderId)
                if (res.code == 1 && res.data) {
                    this.order = res.data
                    this.normalizeOfflineOrderDelivery()
                    this.applyOrderStore()
                    this.syncCouponData(res.data)
                }
            } catch (error) {}
        },
        pickCouponList(...lists) {
            const arrays = lists.filter(Array.isArray)
            return arrays.find(list => list.length) || arrays[0] || []
        },
        syncCouponData(data = {}) {
            const couponInfo = data.couponInfo || data.coupon_info || data.couponSummary || data.coupon_summary || {}
            this.usableCoupon = this.pickCouponList(
                data.usableCoupon,
                data.usable_coupon,
                data.usable,
                data.availableCoupons,
                data.usableCoupons,
                couponInfo.usableCoupon,
                couponInfo.usable_coupon,
                couponInfo.usable,
                couponInfo.availableCoupons,
                []
            )
            this.unusableCoupon = this.pickCouponList(
                data.unusableCoupon,
                data.unusable_coupon,
                data.unusable,
                data.unavailableCoupons,
                data.unusableCoupons,
                couponInfo.unusableCoupon,
                couponInfo.unusable_coupon,
                couponInfo.unusable,
                couponInfo.unavailableCoupons,
                []
            )
            const responseCouponId = this.firstDefined(data.coupon_id, data.couponId, data.selected_coupon_id, data.selectedCouponId, couponInfo.coupon_id, couponInfo.couponId, '')
            if (responseCouponId && (!this.couponManuallyCleared || this.couponId)) {
                this.couponId = String(responseCouponId)
                this.couponManuallyCleared = false
            }
            if (this.couponId) {
                const selected = this.usableCoupon.find(item => this.couponIdsIntersect(this.couponCompareIds(item), [this.couponId]))
                if (selected) {
                    this.selectedCouponCache = selected
                    this.selectedCouponCandidateIds = this.couponApplyIds(selected)
                }
                if (!selected && !this.selectedCouponCache) this.couponId = ''
            } else {
                this.selectedCouponCache = null
                this.selectedCouponCandidateIds = []
            }
            if (!this.showCoupon) {
                this.pendingCouponId = this.couponId
                this.pendingCouponCache = this.selectedCouponCache
                this.pendingCouponCandidateIds = this.selectedCouponCandidateIds.slice()
            }
            this.ensureDefaultCoupon()
        },
        ensureDefaultCoupon() {
            if (this.couponManuallyCleared || this.couponId || !this.usableCoupon.length) return
            const firstCoupon = this.usableCoupon[0]
            const id = this.couponApplyId(firstCoupon)
            if (!id) return
            this.couponId = id
            this.selectedCouponCache = firstCoupon
            this.selectedCouponCandidateIds = this.couponApplyIds(firstCoupon)
            this.pendingCouponId = id
            this.pendingCouponCache = firstCoupon
            this.pendingCouponCandidateIds = this.selectedCouponCandidateIds.slice()
        },
        openCouponPopup() {
            if (!this.usableCoupon.length && !this.unusableCoupon.length) return
            this.pendingCouponId = this.couponId
            this.pendingCouponCache = this.selectedCouponCache
            this.pendingCouponCandidateIds = this.selectedCouponCandidateIds.slice()
            this.couponTabsIndex = this.usableCoupon.length ? 0 : 1
            this.showCoupon = true
        },
        couponAmountRaw(item = {}) {
            const coupon = item.coupon || item.couponInfo || item.coupon_info || {}
            return this.firstDefined(
                item.money,
                item.amount,
                item.discountAmount,
                item.discount_amount,
                item.discountValue,
                item.discount_value,
                item.couponAmount,
                item.coupon_amount,
                item.reduceAmount,
                item.reduce_amount,
                item.deductAmount,
                item.deduct_amount,
                item.faceValue,
                item.face_value,
                item.value,
                coupon.money,
                coupon.amount,
                coupon.discountAmount,
                coupon.discount_amount,
                0
            )
        },
        couponAmountValue(item = {}) {
            return this.formatAmount(this.couponAmountRaw(item))
        },
        couponName(item = {}) {
            return this.safeText(item.name || item.couponName || item.coupon_name || item.title || '优惠券')
        },
        couponConditionText(item = {}) {
            const threshold = this.firstDefined(item.thresholdAmount, item.threshold_amount, item.minAmount, item.min_amount, item.useThreshold, item.use_threshold)
            return this.safeText(item.use_condition || item.useCondition || item.conditionText || item.condition || (Number(threshold) > 0 ? `满${threshold}可用` : '无门槛'))
        },
        couponTimeText(item = {}) {
            return this.safeText(item.use_time_tips || item.useTimeTips || item.validTimeText || item.valid_time_text || [item.startTime || item.start_time, item.endTime || item.end_time].filter(Boolean).join(' 至 ') || '有效期以实际使用规则为准')
        },
        couponKey(item = {}) {
            const template = item.couponTemplate || item.coupon_template || item.template || item.templateInfo || item.template_info || {}
            const coupon = item.coupon || item.couponInfo || item.coupon_info || {}
            return this.firstDefined(item.coupon_id, item.couponId, item.userCouponId, item.user_coupon_id, item.templateId, item.template_id, item.couponTemplateId, item.coupon_template_id, item.couponTplId, item.coupon_tpl_id, template.id, template.couponId, template.coupon_id, template.templateId, template.template_id, coupon.couponId, coupon.coupon_id, coupon.userCouponId, coupon.user_coupon_id, coupon.id, item.id, '')
        },
        couponStableKey(item = {}, index = 0) {
            return String(this.couponKey(item) || `${this.couponTabsIndex}-${index}`)
        },
        couponApplyIds(item = {}) {
            const coupon = item.coupon || item.couponInfo || item.coupon_info || {}
            return [
                item.coupon_id,
                item.couponId,
                item.userCouponId,
                item.user_coupon_id,
                item.userCouponNo,
                item.user_coupon_no,
                coupon.couponId,
                coupon.coupon_id,
                coupon.userCouponId,
                coupon.user_coupon_id,
                coupon.id,
                item.id,
                this.couponKey(item)
            ].filter(value => value !== undefined && value !== null && value !== '').map(value => String(value)).filter((value, index, list) => list.indexOf(value) === index)
        },
        couponApplyId(item = {}) {
            return this.couponApplyIds(item)[0] || ''
        },
        couponCompareIds(item = {}) {
            const template = item.couponTemplate || item.coupon_template || item.template || item.templateInfo || item.template_info || {}
            const coupon = item.coupon || item.couponInfo || item.coupon_info || {}
            return this.couponApplyIds(item).concat([
                item.coupon_id, item.couponId, item.templateId, item.template_id, item.couponTemplateId, item.coupon_template_id, item.couponTplId, item.coupon_tpl_id,
                template.id, template.couponId, template.coupon_id, template.templateId, template.template_id,
                coupon.couponId, coupon.coupon_id, coupon.templateId, coupon.template_id, coupon.id, coupon.userCouponId, coupon.user_coupon_id
            ]).filter(value => value !== undefined && value !== null && value !== '').map(value => String(value))
        },
        couponIdsIntersect(left = [], right = []) {
            const ids = new Set((right || []).filter(value => value !== undefined && value !== null && value !== '').map(value => String(value)))
            return (left || []).some(value => ids.has(String(value)))
        },
        isCouponPendingSelected(item = {}) {
            const ids = this.pendingCouponCandidateIds.length ? this.pendingCouponCandidateIds : (this.pendingCouponId ? [this.pendingCouponId] : [])
            if (!ids.length) return false
            return this.couponIdsIntersect(this.couponCompareIds(item), ids)
        },
        couponItemAt(index) {
            return this.currentCouponList[Number(index)] || {}
        },
        resolveCouponFromEvent(event = {}) {
            const dataset = event.currentTarget && event.currentTarget.dataset ? event.currentTarget.dataset : {}
            const index = Number(dataset.couponIndex ?? dataset.coupon_index)
            const key = String(dataset.couponKey || dataset.coupon_key || '')
            if (!Number.isNaN(index) && this.currentCouponList[index]) {
                const item = this.currentCouponList[index]
                if (!key || this.couponStableKey(item, index) === key) return item
            }
            return this.currentCouponList.find((item, itemIndex) => this.couponStableKey(item, itemIndex) === key) || {}
        },
        selectableCouponIds(item = {}) {
            const ids = this.couponApplyIds(item)
            const compareIds = this.couponCompareIds(item)
            return ids.length ? ids : compareIds
        },
        toggleCouponByEvent(event = {}) {
            const item = this.resolveCouponFromEvent(event)
            return this.toggleCoupon(item)
        },
        toggleCoupon(item = {}, index) {
            if (!item || !Object.keys(item).length) item = this.couponItemAt(index)
            if ((typeof item === 'number' || typeof item === 'string') && index === undefined) item = this.couponItemAt(item)
            if (this.couponTabsIndex !== 0) return
            if (!item || !Object.keys(item).length) return
            if (this.isCouponPendingSelected(item)) {
                this.clearPendingCoupon()
                return
            }
            const ids = this.selectableCouponIds(item)
            const id = ids[0] || ''
            if (!id) return
            this.couponManuallyCleared = false
            this.pendingCouponId = id
            this.pendingCouponCache = item
            this.pendingCouponCandidateIds = ids
        },
        clearPendingCoupon() {
            this.pendingCouponId = ''
            this.pendingCouponCache = null
            this.pendingCouponCandidateIds = []
        },
        confirmCouponPopup() {
            this.showCoupon = false
            this.couponId = this.pendingCouponId
            this.selectedCouponCache = this.pendingCouponCache
            this.selectedCouponCandidateIds = this.pendingCouponCandidateIds.length
                ? this.pendingCouponCandidateIds.slice()
                : (this.selectedCouponCache ? this.couponApplyIds(this.selectedCouponCache) : (this.couponId ? [this.couponId] : []))
            if (this.couponId && !this.selectedCouponCandidateIds.includes(String(this.couponId))) {
                this.selectedCouponCandidateIds.unshift(String(this.couponId))
            }
            this.couponManuallyCleared = !this.couponId
            if (this.order) {
                this.$set(this.order, 'coupon_id', this.couponId)
                this.$set(this.order, 'couponId', this.couponId)
                this.$set(this.order, 'noCoupon', this.couponManuallyCleared)
                this.$set(this.order, 'no_coupon', this.couponManuallyCleared)
                uni.setStorageSync('pending_payment_order', this.order)
            }
        },
        bindStoreEvents() {
            uni.$off('store')
            uni.$off('store:selected')
            uni.$on('store', this.applySelectedStore)
            uni.$on('store:selected', this.applySelectedStore)
        },
        normalizeStoreInfo(info = {}) {
            const latitude = info.latitude ?? info.lat ?? info.location?.latitude ?? ''
            const longitude = info.longitude ?? info.lng ?? info.location?.longitude ?? ''
            const id = this.firstDefined(info.id, info.shop_id, info.shopId, info.selffetch_shop_id, info.selffetchShopId, latitude && longitude ? `map_${latitude}_${longitude}` : '')
            const orderId = this.currentOrderId()
            const address = this.safeText(this.firstDefined(info.map_address, info.mapAddress, info.shop_address, info.address, info.detailAddress, info.detail_address, info.poiAddress, info.poiaddress, info.pickupAddress, ''))
            const name = this.safeText(this.firstDefined(info.name, info.shop_name, info.shopName, info.storeName, info.pickupName, ''), '')
            return {
                ...info,
                id,
                shop_id: info.shop_id || id,
                shopId: info.shopId || id,
                selffetch_shop_id: info.selffetch_shop_id || id,
                selffetchShopId: info.selffetchShopId || id,
                name,
                shop_name: info.shop_name || name,
                shopName: info.shopName || name,
                map_address: address,
                mapAddress: address,
                shop_address: address,
                address,
                latitude,
                longitude,
                pending_order_id: info.pending_order_id || info.pendingOrderId || orderId,
                map_selected: Boolean(info.map_selected || info.mapSelected || String(id).indexOf('map_') === 0)
            }
        },
        currentOrderId() {
            const order = this.order || {}
            return this.firstDefined(order.id, order.order_id, order.orderNo, order.order_sn, '')
        },
        selectedStoreCacheKey() {
            const orderId = this.currentOrderId()
            return orderId ? `selected_self_fetch_store_${orderId}` : ''
        },
        pickStoreInfo() {
            const order = this.order || {}
            return this.selectedStore
                || order.selffetch_shop
                || order.selffetchShop
                || order.pickupInfo
                || order.pickup_info
                || {}
        },
        applySelectedStore(info = {}) {
            const store = this.normalizeStoreInfo(info)
            if (!store.id && !(store.latitude && store.longitude)) return
            this.selectedStore = store
            uni.setStorageSync('selected_self_fetch_store', store)
            const key = this.selectedStoreCacheKey()
            if (key) uni.setStorageSync(key, store)
            if (this.order) {
                this.$set(this.order, 'selffetch_shop', store)
                uni.setStorageSync('pending_payment_order', this.order)
            }
        },
        applyCachedStore() {
            if (!this.isSelfFetchOrder) return
            const key = this.selectedStoreCacheKey()
            const cached = (key && uni.getStorageSync(key)) || uni.getStorageSync('selected_self_fetch_store')
            const orderId = this.currentOrderId()
            if (cached && orderId && cached.pending_order_id && String(cached.pending_order_id) !== String(orderId)) return
            if (cached) this.applySelectedStore(cached)
        },
        applyOrderStore() {
            if (!this.isSelfFetchOrder) return
            const store = this.normalizeStoreInfo(this.pickStoreInfo())
            if (store.id || store.latitude || store.longitude) {
                this.selectedStore = store
                uni.setStorageSync('selected_self_fetch_store', store)
            } else {
                this.applyCachedStore()
            }
        },
        handleAddressTap() {
            if (this.isSelfFetchOrder) return this.openStoreLocationPicker()
            uni.navigateTo({ url: '/bundle/pages/user_address/user_address?type=1' })
        },
        async openStoreLocationPicker() {
            const location = await this.getCurrentMapLocation()
            const picked = await this.chooseStoreLocation(location)
            if (picked) this.applySelectedStore(this.createMapStoreInfo(picked))
        },
        callLocationApi(name, params = {}) {
            return new Promise((resolve, reject) => {
                const normalize = (result) => resolve(Array.isArray(result) ? result[1] : result)
                // #ifdef MP-WEIXIN
                const wxApi = typeof wx !== 'undefined' && wx && wx[name]
                if (wxApi) {
                    wxApi({ ...params, success: normalize, fail: reject, cancel: reject })
                    return
                }
                // #endif
                if (!uni || !uni[name]) {
                    reject(new Error(`${name} is unavailable`))
                    return
                }
                uni[name](params).then(normalize).catch(reject)
            })
        },
        async getCurrentMapLocation() {
            const store = this.pickStoreInfo()
            try {
                return await this.callLocationApi('getLocation', { type: 'gcj02' })
            } catch (error) {
                return store && store.latitude && store.longitude
                    ? { latitude: store.latitude, longitude: store.longitude }
                    : {}
            }
        },
        async chooseStoreLocation(location = {}) {
            try {
                const params = {}
                if (location.latitude && location.longitude) {
                    params.latitude = location.latitude
                    params.longitude = location.longitude
                }
                return await this.callLocationApi('chooseLocation', params)
            } catch (error) {
                uni.showModal({
                    title: '位置选择未完成',
                    content: '需要授权位置或在地图中选择地址后才能作为自提地址。',
                    confirmText: '去设置',
                    cancelText: '取消',
                    success: ({ confirm }) => {
                        if (confirm) uni.openSetting && uni.openSetting()
                    }
                })
                return null
            }
        },
        createMapStoreInfo(res = {}) {
            const latitude = res.latitude || ''
            const longitude = res.longitude || ''
            const id = latitude && longitude ? `map_${latitude}_${longitude}` : ''
            const address = res.address || res.name || ''
            const name = ''
            return {
                id,
                shop_id: id,
                shopId: id,
                selffetch_shop_id: id,
                selffetchShopId: id,
                name,
                shop_name: name,
                shopName: name,
                map_address: address,
                mapAddress: address,
                shop_address: address,
                address,
                detailAddress: address,
                detail_address: address,
                poiAddress: address,
                poiaddress: address,
                latitude,
                longitude,
                lat: latitude,
                lng: longitude,
                pending_order_id: this.currentOrderId(),
                map_selected: true
            }
        },
        handlePay() {
            const order = this.order || {}
            const orderId = this.currentOrderId()
            if (!orderId) return uni.showToast({ title: '订单信息异常', icon: 'none' })
            if (this.isSelfFetchOrder && !this.selectedAddressDetail && !this.selectedAddressTitle) {
                return uni.showToast({ title: '请先选择自提门店', icon: 'none' })
            }
            if (!this.isSelfFetchOrder && !this.selectedAddressDetail && !this.selectedAddressTitle) {
                uni.showToast({ title: '请先添加收货地址', icon: 'none' })
                return this.handleAddressTap()
            }
            const query = [`from=order`, `order_id=${encodeURIComponent(orderId)}`]
            if (this.couponId) query.push(`coupon_id=${encodeURIComponent(this.couponId)}`)
            if (this.couponManuallyCleared) query.push('no_coupon=1')
            if (this.shouldUsePoints) {
                query.push('use_integral=1')
                query.push(`points_amount=${encodeURIComponent(this.pointsInfo.used)}`)
                query.push(`points_deduct_amount=${encodeURIComponent(this.pointsInfo.deductAmount)}`)
            }
            uni.navigateTo({ url: `/bundle/pages/payment/payment?${query.join('&')}` })
        },
        setScreenSafeState() {
            try {
                const systemInfo = uni.getSystemInfoSync()
                const safeTop = systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.top
                this.isNotchScreen = Number(safeTop || systemInfo.statusBarHeight || 0) > 24
            } catch (e) {
                this.isNotchScreen = false
            }
        },
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
                return
            }
            uni.switchTab({ url: '/pages/user/user' })
        }
    }
}
</script>

<style lang="scss">
page {
    min-height: 100%;
    background: #fff9f0;
}

.pending-page {
    min-height: 100vh;
    background: #fff9f0;
    color: #222222;
}

.pending-empty {
    padding-top: 260rpx;
    color: #9ca3af;
    font-size: 28rpx;
    text-align: center;
}

.nav-row {
    position: relative;
    display: flex;
    align-items: center;
    height: calc(var(--app-safe-top) + 64rpx);
    padding: var(--app-safe-top) 24rpx 0;
    box-sizing: border-box;
}

.pending-page--notch .nav-row {
    height: calc(var(--app-safe-top) + 112rpx);
    padding-top: calc(var(--app-safe-top) + 48rpx);
}

.back-icon {
    position: relative;
    width: 42rpx;
    height: 64rpx;
}

.back-icon::after {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 20rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.nav-title {
    position: absolute;
    left: 50%;
    bottom: 13rpx;
    transform: translateX(-50%);
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
}

.nav-capsule {
    position: absolute;
    right: 23rpx;
    bottom: 14rpx;
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
    opacity: 0;
}

.nav-capsule__dot {
    width: 46rpx;
    height: 12rpx;
    border-top: 6rpx dotted #222222;
    box-sizing: border-box;
}

.nav-capsule__divider {
    width: 1rpx;
    height: 35rpx;
    background: rgba(0, 0, 0, .16);
}

.nav-capsule__circle {
    width: 31rpx;
    height: 31rpx;
    border: 4rpx solid #222222;
    border-radius: 50%;
    box-sizing: border-box;
}

.tips-row {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 750rpx;
    height: 96rpx;
    margin: 0;
    padding: 14rpx 46rpx 14rpx 24rpx;
    border: 0;
    border-radius: 0;
    background: #f2decb;
    box-shadow: none;
    box-sizing: border-box;
}

.tips-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 68rpx;
    height: 68rpx;
    border-radius: 0;
    background: transparent;
    box-sizing: border-box;
}

.tips-icon {
    width: 68rpx;
    height: 68rpx;
}

.tips-copy {
    flex: 1;
    min-width: 0;
    margin-left: 14rpx;
}

.tips-text {
    display: block;
    font-size: 24rpx;
    font-weight: 400;
    line-height: 24rpx;
    color: #d16c13;
    white-space: normal;
}

.page-scroll {
    height: calc(100vh - var(--app-safe-top) - 166rpx - 154rpx - env(safe-area-inset-bottom));
    padding: 0 24rpx 32rpx;
    box-sizing: border-box;
}

.pending-page--notch .page-scroll {
    height: calc(100vh - var(--app-safe-top) - 214rpx - 154rpx - env(safe-area-inset-bottom));
}

.order-card,
.remark-card,
.pay-card {
    width: 100%;
    background: #fdf4ea;
    border-radius: 15rpx;
    box-sizing: border-box;
}

.product-card {
    margin-top: 19rpx;
}

.address-row {
    display: flex;
    align-items: center;
    min-height: 91rpx;
    padding: 0 31rpx 0 27rpx;
    box-sizing: border-box;
}

.address-icon {
    flex: none;
    width: 25rpx;
    height: 29rpx;
}

.address-content {
    flex: 1;
    min-width: 0;
    margin-left: 17rpx;
    padding: 18rpx 0;
    box-sizing: border-box;
}

.address-text {
    display: block;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 26rpx;
}

.address-title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 32rpx;
}

.address-detail {
    display: block;
    overflow: hidden;
    margin-top: 8rpx;
    color: #666666;
    font-size: 23rpx;
    line-height: 31rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.arrow-icon,
.small-arrow {
    flex: none;
    width: 10rpx;
    height: 17rpx;
    margin-left: auto;
}

.divider {
    height: 1rpx;
    background: #eeeeee;
}

.shop-row {
    display: flex;
    align-items: center;
    height: 110rpx;
    padding: 0 29rpx;
}

.shop-logo {
    width: 63rpx;
    height: 63rpx;
    border-radius: 5rpx;
    background: #eaeaea;
}

.shop-name {
    margin-left: 18rpx;
    font-size: 26rpx;
    line-height: 26rpx;
}

.goods-row {
    display: flex;
    height: 202rpx;
    padding: 18rpx 29rpx 23rpx 24rpx;
    box-sizing: border-box;
}

.goods-image {
    flex: none;
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
    background: #d5d5d5;
}

.goods-info {
    flex: 1;
    min-width: 0;
    margin: 17rpx 0 0 26rpx;
}

.goods-name {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 26rpx;
    line-height: 26rpx;
}

.goods-spec {
    display: block;
    margin-top: 22rpx;
    font-size: 24rpx;
    line-height: 24rpx;
    color: #999999;
}

.goods-price {
    margin-top: 42rpx;
    font-weight: 500;
    color: #a0610d;
    white-space: nowrap;
}

.price-symbol,
.price-decimal {
    font-size: 26rpx;
    line-height: 26rpx;
}

.price-main {
    font-size: 37rpx;
    line-height: 37rpx;
}

.goods-num {
    align-self: flex-end;
    margin: 0 0 3rpx 21rpx;
    font-size: 24rpx;
    line-height: 24rpx;
    color: #999999;
}

.summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 97rpx;
    padding: 0 31rpx 0 29rpx;
    font-size: 26rpx;
    font-weight: 500;
    box-sizing: border-box;
}

.freight-row {
    height: 102rpx;
}

.muted-text {
    font-size: 24rpx;
    font-weight: 400;
    color: #999999;
}

.remark-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    margin-top: 19rpx;
    padding: 0 31rpx 0 29rpx;
    font-size: 26rpx;
    font-weight: 500;
}

.price-card {
    margin-top: 19rpx;
}

.coupon-value {
    display: flex;
    align-items: center;
    min-width: 0;
    margin-left: 20rpx;
}

.coupon-value .small-arrow {
    margin-left: 17rpx;
}

.points-row {
    min-height: 108rpx;
    border-radius: 0 0 15rpx 15rpx;
    background: linear-gradient(90deg, #ffffff 0%, #fff8f1 100%);
}

.points-row--disabled {
    background: #ffffff;
}

.points-copy {
    display: flex;
    flex-direction: column;
}

.points-desc {
    margin-top: 10rpx;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 24rpx;
    color: #c97730;
}

.points-value {
    display: flex;
    align-items: center;
    min-width: 116rpx;
    height: 48rpx;
    padding: 0 18rpx;
    border: 1rpx solid rgba(255, 116, 23, 0.22);
    border-radius: 24rpx;
    background: #fff3e8;
    box-sizing: border-box;
}

.points-row--disabled .points-value {
    border-color: #eeeeee;
    background: #f7f7f7;
}

.points-num {
    font-size: 28rpx;
    font-weight: 600;
    line-height: 28rpx;
    color: #ff7417;
}

.points-row--disabled .points-num,
.points-row--disabled .points-desc {
    color: #999999;
}

.deduct-text {
    color: #a0610d;
}

.pay-section {
    padding: 41rpx 0 0;
}

.section-title-row {
    display: flex;
    align-items: center;
    height: 32rpx;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 32rpx;
}

.title-mark {
    width: 11rpx;
    height: 29rpx;
    margin-right: 13rpx;
    background: #a0610d;
}

.pay-card {
    margin-top: 32rpx;
    margin-bottom: 41rpx;
}

.pay-notice {
    display: flex;
    align-items: center;
    min-height: 132rpx;
    padding: 0 36rpx;
    box-sizing: border-box;
}

.pay-notice__icon {
    position: relative;
    flex: none;
    width: 55rpx;
    height: 55rpx;
    margin-right: 24rpx;
    border-radius: 50%;
    background: #fff3e8;
}

.pay-notice__icon::before {
    content: '';
    position: absolute;
    left: 17rpx;
    top: 14rpx;
    width: 16rpx;
    height: 22rpx;
    border-right: 5rpx solid #a0610d;
    border-bottom: 5rpx solid #a0610d;
    transform: rotate(45deg);
    box-sizing: border-box;
}

.pay-notice__body {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
}

.pay-notice__title {
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 36rpx;
}

.pay-notice__desc {
    margin-top: 10rpx;
    color: #999999;
    font-size: 24rpx;
    font-weight: 400;
    line-height: 32rpx;
}

.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    align-items: flex-start;
    height: 154rpx;
    padding: 32rpx 24rpx 0;
    padding-bottom: env(safe-area-inset-bottom);
    border-radius: 34rpx 34rpx 0 0;
    background: #fdf4ea;
    box-shadow: 0 -2rpx 21rpx rgba(82, 82, 82, 0.08);
    box-sizing: content-box;
}

.goods-count {
    margin-top: 37rpx;
    color: #666666;
    font-size: 28rpx;
    line-height: 28rpx;
    white-space: nowrap;
}

.total-label {
    margin: 38rpx 0 0 15rpx;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
    white-space: nowrap;
}

.total-stack {
    flex: 1;
    min-width: 0;
    margin-left: 19rpx;
}

.total-price {
    margin-top: 18rpx;
    font-weight: 500;
    color: #a0610d;
    white-space: nowrap;
}

.total-symbol,
.total-decimal {
    font-size: 35rpx;
    line-height: 35rpx;
}

.total-main {
    font-size: 50rpx;
    line-height: 50rpx;
}

.bottom-deduct {
    display: block;
    margin-top: 14rpx;
    color: #a0610d;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.pay-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 250rpx;
    height: 81rpx;
    margin: 0 16rpx 0 18rpx;
    border-radius: 40rpx;
    background: #a0610d;
    font-weight: 500;
    color: #ffffff;
}

.pay-button__main {
    font-size: 28rpx;
    line-height: 28rpx;
}

.pay-button__sub {
    margin-top: 9rpx;
    font-size: 24rpx;
    font-weight: 400;
    line-height: 24rpx;
}

.coupon-popup {
    padding: 28rpx 24rpx calc(26rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    box-sizing: border-box;
}

.coupon-popup-title {
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
    text-align: center;
}

.coupon-tabs {
    display: flex;
    align-items: center;
    height: 72rpx;
    margin-top: 20rpx;
    border-radius: 36rpx;
    background: #fff8ed;
    padding: 6rpx;
    box-sizing: border-box;
}

.coupon-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 60rpx;
    border-radius: 30rpx;
    color: #666666;
    font-size: 26rpx;
}

.coupon-tab.is-active {
    background: #ffffff;
    color: #a0610d;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(160, 97, 13, 0.12);
}

.coupon-scroll {
    max-height: 650rpx;
    min-height: 260rpx;
    margin-top: 22rpx;
}

.coupon-card {
    display: flex;
    align-items: center;
    min-height: 132rpx;
    margin-bottom: 18rpx;
    padding: 22rpx 24rpx;
    border: 1rpx solid #edf0f5;
    border-radius: 16rpx;
    background: #ffffff;
    box-shadow: 0 4rpx 16rpx rgba(30, 41, 59, 0.05);
    box-sizing: border-box;
}

.coupon-card--disabled {
    opacity: 0.58;
}

.coupon-price {
    flex: none;
    width: 138rpx;
    color: #ff1919;
    font-size: 42rpx;
    font-weight: 700;
    line-height: 48rpx;
}

.coupon-symbol {
    font-size: 24rpx;
    line-height: 28rpx;
}

.coupon-info {
    flex: 1;
    min-width: 0;
}

.coupon-name {
    overflow: hidden;
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 36rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.coupon-desc {
    overflow: hidden;
    margin-top: 8rpx;
    color: #999999;
    font-size: 22rpx;
    line-height: 30rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.coupon-check {
    flex: none;
    position: relative;
    width: 38rpx;
    height: 38rpx;
    margin-left: 20rpx;
    border: 3rpx solid #d6d6d6;
    border-radius: 50%;
    box-sizing: border-box;
}

.coupon-check--active {
    border-color: #a0610d;
    background: #a0610d;
}

.coupon-check--active::after {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 5rpx;
    width: 10rpx;
    height: 18rpx;
    border-right: 4rpx solid #ffffff;
    border-bottom: 4rpx solid #ffffff;
    transform: rotate(45deg);
}

.coupon-empty {
    padding: 96rpx 0;
    color: #999999;
    font-size: 26rpx;
    text-align: center;
}

.coupon-confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 82rpx;
    margin-top: 8rpx;
    border-radius: 41rpx;
    background: #a0610d;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
}
</style>
