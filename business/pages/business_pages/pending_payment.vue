<template>
    <view class="pending-page" :class="{ 'pending-page--notch': isNotchScreen }">
        <view class="page-head">
            <view class="nav-row">
                <view class="back-icon" @tap="goBack"></view>
                <text class="nav-title">待付款</text>
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
                <view class="divider"></view>
                <view class="shop-row">
                    <view class="shop-logo"></view>
                    <text class="shop-name">{{ shopNameText }}</text>
                </view>
                <view class="divider"></view>
                <view class="goods-row">
                    <view class="goods-image"></view>
                    <view class="goods-info">
                        <text class="goods-name">{{ goodsNameText }}</text>
                        <text class="goods-spec">{{ goodsSpecText }}</text>
                        <view class="goods-price">
                            <text class="price-symbol">¥</text>
                            <text class="price-main">{{ order.priceMain || '0' }}</text>
                            <text class="price-decimal">{{ order.priceDecimal || '.00' }}</text>
                        </view>
                    </view>
                    <text class="goods-num">X1</text>
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
                    <text>{{ order.goodsAmount || '¥0.00' }}</text>
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
                <view class="summary-row points-row">
                    <view class="points-copy">
                        <text>积分抵扣</text>
                        <text class="points-desc">{{ pointsSummaryText }}</text>
                    </view>
                    <view class="points-value">
                        <text class="points-num">{{ pointsInfo.available }}</text>
                        <text class="points-unit">积分</text>
                    </view>
                </view>
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
                <template v-if="pointsInfo.give > 0">
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>预计到账积分</text>
                        <text class="muted-text">+{{ pointsInfo.give }}积分</text>
                    </view>
                </template>
            </view>

            <view class="pay-section">
                <view class="section-title-row">
                    <view class="title-mark"></view>
                    <text>选择付款方式</text>
                </view>
                <view class="pay-card">
                    <view class="pay-item">
                        <image
                            class="pay-icon wechat"
                            src="https://shengyuan.store/api/miniapp/files/miniapp/2d6eda26285643b8aada027e1d657532/34f5d621b59abc567bcabd522381293f.png"
                            mode="scaleToFill"
                        ></image>
                        <text>微信支付</text>
                        <view class="pay-radio"></view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <view v-else class="pending-empty">暂无待付款订单</view>

        <view v-if="order" class="bottom-bar">
            <text class="total-label">合计：</text>
            <view class="total-price">
                <text class="total-symbol">¥</text>
                <text class="total-main">{{ totalAmountParts.main }}</text>
                <text class="total-decimal">{{ totalAmountParts.decimal }}</text>
            </view>
            <view class="pay-button" @tap="handlePay">立即支付</view>
        </view>

        <u-popup v-model="showCoupon" border-radius="18" mode="bottom" closeable>
            <view class="coupon-popup">
                <view class="coupon-popup-title">优惠券</view>
                <view class="coupon-tabs">
                    <view :class="['coupon-tab', couponTabsIndex === 0 ? 'is-active' : '']" @tap="couponTabsIndex = 0">可使用({{ usableCoupon.length }})</view>
                    <view :class="['coupon-tab', couponTabsIndex === 1 ? 'is-active' : '']" @tap="couponTabsIndex = 1">不可用({{ unusableCoupon.length }})</view>
                </view>
                <scroll-view class="coupon-scroll" scroll-y>
                    <view v-if="couponTabsIndex === 0" class="coupon-none" @tap="clearPendingCoupon">
                        <view>
                            <view class="coupon-name">不使用优惠券</view>
                            <view class="coupon-desc">本次付款不抵扣优惠券</view>
                        </view>
                        <view :class="['coupon-check', !pendingCouponId ? 'coupon-check--active' : '']"></view>
                    </view>
                    <view
                        v-for="item in currentCouponList"
                        :key="couponKey(item)"
                        :class="['coupon-card', couponTabsIndex === 1 ? 'coupon-card--disabled' : '']"
                        @tap="toggleCoupon(item)"
                    >
                        <view class="coupon-price">
                            <text class="coupon-symbol">¥</text>
                            <text>{{ couponAmountValue(item) }}</text>
                        </view>
                        <view class="coupon-info">
                            <view class="coupon-name">{{ couponName(item) }}</view>
                            <view class="coupon-desc">{{ couponConditionText(item) }}</view>
                            <view class="coupon-desc">{{ couponTimeText(item) }}</view>
                            <view v-if="item.tips" class="coupon-desc">{{ safeText(item.tips) }}</view>
                        </view>
                        <view
                            v-if="couponTabsIndex === 0"
                            :class="['coupon-check', isCouponPendingSelected(item) ? 'coupon-check--active' : '']"
                            @tap.stop="toggleCoupon(item)"
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
            const type = String(this.firstDefined(order.delivery_type, order.deliveryType, order.deliveryMode, order.orderChannel, '')).toUpperCase()
            if (order.delivery_type === 2 || order.deliveryType === 2 || order.delivery_type === '2' || order.deliveryType === '2') return true
            return ['PICKUP', 'SELF_FETCH', 'SELFFETCH', 'STORE_PICKUP', 'OFFLINE_PICKUP'].includes(type)
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
            return this.isSelfFetchOrder ? '请选择自提地址' : '下单前请填写收货地址'
        },
        shopNameText() {
            const order = this.order || {}
            return this.safeText(order.shopName || order.shop_name, '店铺信息')
        },
        goodsNameText() {
            const order = this.order || {}
            const firstGoods = (order.order_goods || order.goods_lists || [])[0] || {}
            return this.safeText(order.goodsName || order.goods_name || firstGoods.goods_name || firstGoods.name, '商品信息')
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
            const pointsInfo = order.pointsInfo || order.points_info || order.integralInfo || order.integral_info || order.pointsConfig || order.points_config || {}
            const amountInfo = order.amountInfo || order.amount_info || order.settlementAmount || order.settlement_amount || {}
            return {
                available: this.numberValue(this.firstDefined(
                    order.user_integral,
                    order.userIntegral,
                    order.availablePoints,
                    order.available_points,
                    order.points,
                    order.totalPoints,
                    order.total_points,
                    pointsInfo.userIntegral,
                    pointsInfo.user_integral,
                    pointsInfo.availablePoints,
                    pointsInfo.available_points,
                    pointsInfo.points,
                    0
                )),
                used: this.numberValue(this.firstDefined(
                    order.pointsAmount,
                    order.points_amount,
                    order.usedPoints,
                    order.used_points,
                    order.integralNum,
                    order.integral_num,
                    amountInfo.pointsAmount,
                    amountInfo.points_amount,
                    amountInfo.integralNum,
                    amountInfo.integral_num,
                    pointsInfo.pointsAmount,
                    pointsInfo.points_amount,
                    pointsInfo.integralNum,
                    pointsInfo.integral_num,
                    0
                )),
                deductAmount: this.numberValue(this.firstDefined(
                    order.pointsDeductAmount,
                    order.points_deduct_amount,
                    order.integralAmount,
                    order.integral_amount,
                    order.integralDeductAmount,
                    order.integral_deduct_amount,
                    amountInfo.pointsDeductAmount,
                    amountInfo.points_deduct_amount,
                    amountInfo.integralAmount,
                    amountInfo.integral_amount,
                    pointsInfo.pointsDeductAmount,
                    pointsInfo.points_deduct_amount,
                    pointsInfo.integralAmount,
                    pointsInfo.integral_amount,
                    0
                )),
                give: this.numberValue(this.firstDefined(
                    order.order_give_integral,
                    order.giveIntegral,
                    order.give_integral,
                    order.rewardPoints,
                    order.reward_points,
                    pointsInfo.giveIntegral,
                    pointsInfo.give_integral,
                    pointsInfo.rewardPoints,
                    pointsInfo.reward_points,
                    0
                ))
            }
        },
        pointsSummaryText() {
            if (this.pointsInfo.deductAmount > 0) return `已抵扣¥${this.formatAmount(this.pointsInfo.deductAmount)}`
            if (this.pointsInfo.available > 0) return '当前订单可查看积分抵扣'
            return '暂无可用积分抵扣'
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
        formatAmount(value) {
            return this.numberValue(value).toFixed(2)
        },
        splitAmount(value) {
            const parts = this.formatAmount(value).split('.')
            return {
                main: parts[0] || '0',
                decimal: `.${parts[1] || '00'}`
            }
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
                this.applyOrderStore()
                this.syncCouponData(this.order)
            }
            const orderId = this.firstDefined(options.id, options.order_id, options.orderNo, options.order_sn, this.order && (this.order.id || this.order.order_id || this.order.orderNo || this.order.order_sn))
            if (!orderId) return
            try {
                const res = await getOrderDetail(orderId)
                if (res.code == 1 && res.data) {
                    this.order = res.data
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
        toggleCoupon(item = {}) {
            if (this.couponTabsIndex !== 0) return
            if (this.isCouponPendingSelected(item)) {
                this.pendingCouponId = ''
                this.pendingCouponCache = null
                this.pendingCouponCandidateIds = []
                return
            }
            const id = this.couponApplyId(item)
            if (!id) {
                uni.showToast({ title: '优惠券参数异常', icon: 'none' })
                return
            }
            this.couponManuallyCleared = false
            this.pendingCouponId = id
            this.pendingCouponCache = item
            this.pendingCouponCandidateIds = this.couponApplyIds(item)
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
            const address = this.safeText(this.firstDefined(info.map_address, info.mapAddress, info.shop_address, info.address, info.detailAddress, info.detail_address, info.poiAddress, info.poiaddress, info.pickupAddress, info.name, ''))
            const name = address || this.safeText(this.firstDefined(info.name, info.shop_name, info.shopName, info.storeName, info.pickupName, '地图选点地址'), '地图选点地址')
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
        openStoreLocationPicker() {
            const store = this.pickStoreInfo()
            const query = []
            if (store && (store.id || store.latitude || store.longitude)) {
                query.push(`selected=${encodeURIComponent(JSON.stringify(store))}`)
            }
            const orderId = this.currentOrderId()
            if (orderId) query.push(`order_id=${encodeURIComponent(orderId)}`)
            uni.navigateTo({ url: `/bundle_misc/pages/store_list/store_list${query.length ? `?${query.join('&')}` : ''}` })
        },
        handlePay() {
            const order = this.order || {}
            const orderId = this.currentOrderId()
            if (!orderId) return uni.showToast({ title: '订单信息异常', icon: 'none' })
            if (this.isSelfFetchOrder && !this.selectedAddressDetail && !this.selectedAddressTitle) {
                return uni.showToast({ title: '请先选择自提地址', icon: 'none' })
            }
            const query = [`from=order`, `order_id=${encodeURIComponent(orderId)}`]
            if (this.couponId) query.push(`coupon_id=${encodeURIComponent(this.couponId)}`)
            if (this.couponManuallyCleared) query.push('no_coupon=1')
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
    background: #f5f5f5;
}

.pending-page {
    min-height: 100vh;
    background: #f5f5f5;
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

/* #ifdef MP-WEIXIN */
.nav-row {
    padding-right: 220rpx;
}
/* #endif */

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

.tips-row {
    display: flex;
    align-items: center;
    min-height: 84rpx;
    margin: 14rpx 24rpx 0;
    padding: 16rpx 24rpx;
    border: 1rpx solid rgba(255, 158, 54, 0.16);
    border-radius: 24rpx;
    background: linear-gradient(135deg, #fff8ef 0%, #fffdf8 100%);
    box-shadow: 0 6rpx 18rpx rgba(222, 125, 20, 0.06);
    box-sizing: border-box;
}

.tips-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 48rpx;
    height: 48rpx;
    border-radius: 16rpx;
    background: rgba(255, 226, 190, 0.58);
    box-sizing: border-box;
}

.tips-icon {
    width: 32rpx;
    height: 32rpx;
}

.tips-copy {
    flex: 1;
    min-width: 0;
    margin-left: 14rpx;
}

.tips-text {
    display: block;
    font-size: 23rpx;
    font-weight: 500;
    line-height: 34rpx;
    color: #bf6618;
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
    width: 703rpx;
    background: #ffffff;
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
    color: #ff1919;
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

.points-num {
    font-size: 28rpx;
    font-weight: 600;
    line-height: 28rpx;
    color: #ff7417;
}

.points-unit {
    margin-left: 6rpx;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 22rpx;
    color: #c97730;
}

.deduct-text {
    color: #ff1919;
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
    background: #037dfa;
}

.pay-card {
    margin-top: 32rpx;
    margin-bottom: 41rpx;
}

.pay-item {
    display: flex;
    align-items: center;
    height: 108rpx;
    padding: 0 40rpx 0 36rpx;
    font-size: 28rpx;
    font-weight: 500;
    box-sizing: border-box;
}

.pay-icon.wechat {
    width: 47rpx;
    height: 42rpx;
    margin-right: 37rpx;
}

.pay-icon.bank {
    width: 55rpx;
    height: 43rpx;
    margin-right: 30rpx;
}

.pay-radio {
    width: 37rpx;
    height: 37rpx;
    margin-left: auto;
    border: 3rpx solid #d6d6d6;
    border-radius: 50%;
    box-sizing: border-box;
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
    background: #ffffff;
    box-shadow: 0 -2rpx 21rpx rgba(82, 82, 82, 0.08);
    box-sizing: content-box;
}

.total-label {
    margin-top: 32rpx;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
}

.total-price {
    margin: 20rpx 0 0 19rpx;
    font-weight: 500;
    color: #ff1919;
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

.pay-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 282rpx;
    height: 81rpx;
    margin-left: auto;
    border-radius: 40rpx;
    background: #037dfa;
    font-size: 28rpx;
    font-weight: 500;
    color: #ffffff;
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
    background: #f5f7fb;
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
    color: #037dfa;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(3, 125, 250, 0.08);
}

.coupon-scroll {
    max-height: 650rpx;
    min-height: 260rpx;
    margin-top: 22rpx;
}

.coupon-none,
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
    border-color: #037dfa;
    background: #037dfa;
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
    background: #037dfa;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
}
</style>
