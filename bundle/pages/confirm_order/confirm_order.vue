<template>
    <view class="confirm-order-page">
        <view class="confirm-order">
            <view class="page-head">
                <view class="nav-row">
                    <view class="back-icon" @tap="goBack"></view>
                    <text class="nav-title">待付款</text>
                </view>
                <view class="tips-row">
                    <image
                        class="tips-icon"
                        src="https://shengyuan.store/api/miniapp/files/miniapp/af8480d8856d4f44839745edb33b090f/ff33c2922125b8c5475cc7e97121c885.png"
                        mode="scaleToFill"
                    ></image>
                    <text class="tips-text">温馨提示：请确认订单信息、收货地址和支付方式后再完成付款</text>
                </view>
            </view>

            <scroll-view class="confirm-con" scroll-y>
                <view class="order-card main-card">
                    <view v-if="addressTabsList.length > 1" class="delivery-tabs">
                        <view
                            v-for="(item, index) in addressTabsList"
                            :key="item.id"
                            class="delivery-tab"
                            :class="{ active: addressTabsIndex === index }"
                            @tap="changeDelivery(index)"
                        >
                            {{ item.name }}
                        </view>
                    </view>

                    <view
                        v-show="currentDelivery.sign === 'express'"
                        class="address-row"
                        @tap="onAddressExpress"
                    >
                        <image class="address-icon" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_address.png" mode="scaleToFill"></image>
                        <view class="address-content">
                            <template v-if="address.id">
                                <view class="address-person">
                                    <text>{{ address.contact }}</text>
                                    <text class="phone">{{ address.telephone }}</text>
                                </view>
                                <view class="address-detail">
                                    {{ addressText }}
                                </view>
                            </template>
                            <template v-else>
                                <view class="address-empty">下单前请填写收货地址</view>
                            </template>
                        </view>
                        <image class="arrow-icon" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png" mode="scaleToFill"></image>
                    </view>

                    <view
                        v-show="currentDelivery.sign === 'store'"
                        class="address-row"
                        @tap="onAddressStore"
                    >
                        <image class="address-icon" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_address.png" mode="scaleToFill"></image>
                        <view class="address-content">
                            <template v-if="storeInfo.id">
                                <view class="address-person">{{ storeInfo.name }}</view>
                                <view class="address-detail">{{ storeInfo.shop_address }}</view>
                            </template>
                            <template v-else>
                                <view class="address-empty">请选择门店地址</view>
                            </template>
                        </view>
                        <image class="arrow-icon" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png" mode="scaleToFill"></image>
                    </view>

                    <view v-show="currentDelivery.sign === 'store'" class="store-form">
                        <view class="store-field">
                            <text>提货人</text>
                            <input
                                v-model="userConsignee"
                                class="field-input"
                                type="text"
                                input-align="right"
                                :clearable="false"
                                placeholder="请输入提货人"
                            />
                        </view>
                        <view class="store-field">
                            <text>联系方式</text>
                            <input
                                v-model="userMobile"
                                class="field-input"
                                type="text"
                                input-align="right"
                                :clearable="false"
                                placeholder="请输入联系方式"
                            />
                        </view>
                    </view>

                    <view class="divider"></view>
                    <view class="shop-row">
                        <image v-if="shopLogo" class="shop-logo" :src="shopLogo" mode="aspectFill"></image>
                        <view v-else class="shop-logo"></view>
                        <text class="shop-name">{{ shopName }}</text>
                    </view>
                    <view class="divider"></view>

                    <view v-for="(item, index) in goodsLists" :key="index" class="goods-row">
                        <custom-image
                            class="goods-image"
                            width="160rpx"
                            height="160rpx"
                            radius="8rpx"
                            lazy-load
                            :src="goodsImage(item)"
                        ></custom-image>
                        <view class="goods-info">
                            <view class="goods-name line1">{{ item.goods_name || item.name }}</view>
                            <view class="goods-spec">{{ item.spec_value_str || item.spec_value }}</view>
                            <view class="goods-price">
                                <price-format
                                    :weight="500"
                                    :subscript-size="26"
                                    :first-size="37"
                                    :second-size="26"
                                    :price="item.original_price || item.goods_price"
                                ></price-format>
                            </view>
                        </view>
                        <text class="goods-num">X{{ item.goods_num || item.num || 1 }}</text>
                    </view>

                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>运费</text>
                        <text class="muted-value">{{ freightText }}</text>
                    </view>
                </view>

                <view class="remark-card">
                    <text class="label">买家留言</text>
                    <input
                        v-model="userRemark"
                        class="remark-input"
                        :clearable="false"
                        input-align="right"
                        placeholder="选填"
                    ></input>
                </view>

                <view class="order-card price-card">
                    <view class="summary-row">
                        <text>商品总价</text>
                        <text>¥{{ orderInfo.total_goods_price || '0.00' }}</text>
                    </view>
                    <view class="divider"></view>
                    <view class="summary-row">
                        <text>运费合计</text>
                        <text class="muted-value">{{ freightText }}</text>
                    </view>
                    <view class="divider"></view>
                    <view class="summary-row" @tap="openCouponPopup">
                        <text>优惠券</text>
                        <view class="row-value">
                            <text :class="effectiveDiscountAmount > 0 ? 'red-value' : 'muted-value'">{{ couponText }}</text>
                            <view :class="['coupon-arrow', showCoupon ? 'coupon-arrow--open' : '']"></view>
                        </view>
                    </view>
                    <template v-if="showIntegralRow">
                        <view class="divider"></view>
                        <view class="summary-row" @tap="changeIntegral">
                            <view class="points-label">
                                <text>积分抵扣</text>
                                <text class="points-label__desc">{{ pointsHelpText }}</text>
                            </view>
                            <view class="row-value">
                                <text class="orange-value">{{ integralText }}</text>
                                <checkbox
                                    class="integral-check"
                                    :disabled="!canUseIntegral"
                                    :checked="Boolean(useIntegral)"
                                ></checkbox>
                            </view>
                        </view>
                        <view v-if="useIntegral && pointsDeductAmount > 0" class="summary-row summary-row--deduct">
                            <text>已抵扣</text>
                            <text class="red-value">-¥{{ pointsDeductAmount.toFixed(2) }}</text>
                        </view>
                    </template>
                </view>

                <view class="points-settle-tip">
                    <view class="points-settle-tip__text">
                        <text>线上订单确认收货后积分到账，退款时将按原订单抵扣和赠送记录同步退回。</text>
                    </view>
                </view>

                <view class="pay-section">
                    <view class="pay-card">
                        <view class="pay-item" :class="{ active: payWay === 'WECHAT_JSAPI' }" @tap="selectPayWay('WECHAT_JSAPI')">
                            <image
                                class="pay-icon"
                                src="https://shengyuan.store/api/miniapp/files/miniapp/2d6eda26285643b8aada027e1d657532/34f5d621b59abc567bcabd522381293f.png"
                                mode="scaleToFill"
                            ></image>
                            <text>微信支付</text>
                            <view class="pay-badge">当前支付方式</view>
                        </view>
                    </view>
                </view>
            </scroll-view>

            <view class="footer">
                <view class="all-price">
                    <text class="total-label">合计：</text>
                    <view class="total-price">
                        <price-format
                            :subscript-size="35"
                            :first-size="50"
                            :second-size="35"
                            :price="payAmount"
                            :weight="500"
                        ></price-format>
                    </view>
                </view>
                <button class="pay-btn" hover-class="none" @tap="onSubmitOrder">立即支付</button>
            </view>
        </view>
        <loading-view v-if="showLoading" background-color="transparent" :size="50"></loading-view>
        <loading-view v-if="isFirstLoading"></loading-view>
        <u-popup v-model="showCoupon" border-radius="14" mode="bottom" closeable>
            <view class="pop-title row-between">
                <view class="title">优惠券</view>
            </view>
            <view v-if="showCoupon">
                <view class="coupon-tabs">
                    <view :class="['coupon-tab', couponTabsIndex === 0 ? 'is-active' : '']" @tap="couponTabsIndex = 0">
                        可使用优惠券 ({{ usableCoupon.length }})
                    </view>
                    <view :class="['coupon-tab', couponTabsIndex === 1 ? 'is-active' : '']" @tap="couponTabsIndex = 1">
                        可领取优惠券 ({{ receivableCoupon.length }})
                    </view>
                    <view :class="['coupon-tab', couponTabsIndex === 2 ? 'is-active' : '']" @tap="couponTabsIndex = 2">
                        不可用优惠券 ({{ unusableCoupon.length }})
                    </view>
                </view>
                <scroll-view class="coupon-scroll" scroll-y>
                    <view class="coupon-obj">
                        <view
                            v-for="item in currentCouponList"
                            :key="couponKey(item)"
                            class="coupon-card"
                            @tap="handleCouponCardTap(item)"
                        >
                            <view class="coupon-item row">
                                <view class="price white column-center">
                                    <price-format :subscript-size="34" :first-size="60" :second-size="50" :price="couponAmountValue(item)" :weight="500"></price-format>
                                    <view class="nr">{{ couponConditionText(item) }}</view>
                                </view>
                                <view class="row-between coupon-info-wrap">
                                    <view class="info ml20">
                                        <view class="bold md mb10 line1">{{ couponName(item) }}</view>
                                        <view class="xxs lighter mb10">{{ couponTypeText(item) }}</view>
                                        <view class="xxs lighter">{{ couponTimeText(item) }}</view>
                                    </view>
                                    <checkbox v-if="couponTabsIndex === 0" :checked="isCouponSelected(item)" class="mr20" @tap.stop="toggleCoupon(item)"></checkbox>
                                    <view
                                        v-if="couponTabsIndex === 1"
                                        :class="['coupon-receive-btn', couponButtonDisabled(item) ? 'coupon-receive-btn--disabled' : '']"
                                        @tap.stop="receiveCoupon(item)"
                                    >{{ couponButtonText(item) }}</view>
                                </view>
                            </view>
                            <view class="coupon-tips xs" v-if="item.tips">{{ localizeCouponText(item.tips) }}</view>
                        </view>
                    </view>
                    <view v-if="!currentCouponList.length" class="coupon-empty column-center">
                        <text class="muted">暂无优惠券</text>
                    </view>
                </scroll-view>
                <view class="column-center">
                    <view class="coupon-confirm bg-primary white row-center br60 mb10 lg" @tap="confirmCouponPopup">确定</view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
import UPopup from '@/bundle/components/uview-ui/components/u-popup/u-popup.vue'
import { orderBuy, getDelivery } from '@/api/order'
import { getCoupon, getDefaultAddress } from '@/api/user'
import { teamBuy } from '@/api/activity'
import { prepay, getMnpNotice, getPayway } from '@/api/app'
import { wxpay, alipay } from '@/utils/pay'
import PriceFormat from '@/bundle/components/price-format/price-format.vue'
import { resolveImage } from '@/utils/image-placeholder'

export default {
	components: {
			PriceFormat,
			UPopup
		},
    data() {
        return {
            isFirstLoading: true,
            showLoading: false,
            address: {},
            orderInfo: {},
            goodsLists: [],
            addressId: '',
            useIntegral: 0,
            userRemark: '',
            userConsignee: '',
            userMobile: '',
            storeInfo: {},
            couponId: '',
            selectedCouponCache: null,
            selectedCouponCandidateIds: [],
            pendingCouponId: '',
            pendingCouponCache: null,
            pendingCouponCandidateIds: [],
            showCoupon: false,
            couponTabsIndex: 0,
            usableCoupon: [],
            receivableCoupon: [],
            unusableCoupon: [],
            receivingCouponId: '',
            couponManuallyCleared: false,
            payWay: 'WECHAT_JSAPI',
            bargainLaunchId: -1,
            addressTabsIndex: 0,
            addressTabsList: [
                { id: 1, sign: 'express', name: '快递配送' },
                { id: 2, sign: 'store', name: '门店自提' }
            ]
        }
    },
    computed: {
        delivery() {
            return this.currentDelivery.id
        },
        currentDelivery() {
            return this.addressTabsList[this.addressTabsIndex] || this.addressTabsList[0] || { id: 1, sign: 'express', name: '快递配送' }
        },
        shopName() {
            const firstGoods = this.goodsLists[0] || {}
            return firstGoods.shop_name || firstGoods.store_name || this.orderInfo.shop_name || '店铺名称'
        },
        shopLogo() {
            const firstGoods = this.goodsLists[0] || {}
            return this.resolveOrderImage(firstGoods.shop_logo || firstGoods.shopLogo || firstGoods.shopLogoUrl || firstGoods.storeLogo || this.orderInfo.shop_logo || this.orderInfo.shopLogo || this.orderInfo.shopLogoUrl || this.orderInfo.storeLogo || '', 'avatar')
        },
        freightText() {
            if (this.currentDelivery.sign === 'store') {
                return '¥0.00'
            }
            if (!this.address.id && this.currentDelivery.sign === 'express') {
                return '填写地址后自动计算运费'
            }
            return `¥${this.orderInfo.shipping_price || '0.00'}`
        },
        addressText() {
            return [this.address.province, this.address.city, this.address.district, this.address.address]
                .map(this.safeText)
                .filter(Boolean)
                .join('')
        },
        payAmount() {
            return this.currentPayAmount.toFixed(2)
        },
        currentPayAmount() {
            const orderAmount = this.orderAmountBeforeDiscount
            const baseAmount = Math.max(orderAmount - this.effectiveDiscountAmount, 0)
            if (!this.useIntegral || this.pointsDeductAmount <= 0) return baseAmount
            const beforePoints = this.orderAmountBeforePoints
            const deductedAmount = Math.max(beforePoints - this.pointsDeductAmount, 0)
            const backendAppliedPoints = beforePoints > 0 && baseAmount <= deductedAmount + 0.009
            return backendAppliedPoints ? baseAmount : Math.max(baseAmount - this.pointsDeductAmount, 0)
        },
        orderAmountBeforeDiscount() {
            const goodsAmount = this.moneyValue(this.orderInfo.total_goods_price || this.orderInfo.goodsAmount)
            const shippingPrice = this.currentDelivery.sign === 'store' ? 0 : this.moneyValue(this.orderInfo.shipping_price || this.orderInfo.freightAmount)
            if (goodsAmount > 0) return goodsAmount + shippingPrice
            const payAmount = this.moneyValue(this.orderInfo.order_amount || this.orderInfo.pay_amount || this.orderInfo.payAmount)
            return payAmount + this.effectiveDiscountAmount + (this.useIntegral ? this.pointsDeductAmount : 0)
        },
        orderAmountBeforePoints() {
            return Math.max(this.orderAmountBeforeDiscount - this.effectiveDiscountAmount, 0)
        },
        discountAmount() {
            if (!this.couponId) return 0
            return Number(this.orderInfo.discount_amount || this.orderInfo.discountAmount || 0)
        },
        selectedCouponAmount() {
            return this.selectedCoupon ? this.couponAmountValue(this.selectedCoupon) : 0
        },
        effectiveDiscountAmount() {
            if (this.selectedCoupon) return this.discountAmount || this.selectedCouponAmount
            return this.discountAmount
        },
        couponText() {
            if (this.effectiveDiscountAmount > 0) return `-¥${this.effectiveDiscountAmount.toFixed(2)}`
            if (this.selectedCoupon) return this.couponName(this.selectedCoupon)
            if (this.usableCoupon.length) return `${this.usableCoupon.length}张可用`
            if (this.receivableCoupon.length) return `${this.receivableCoupon.length}张可领取`
            return '没有可用的优惠券'
        },
        canOpenCoupon() {
            return this.usableCoupon.length || this.receivableCoupon.length || this.unusableCoupon.length
        },
        selectedCoupon() {
            if (!this.couponId) return null
            return this.usableCoupon.find(item => this.isCouponSelected(item)) || this.selectedCouponCache || null
        },
        activeCouponId() {
            return this.showCoupon ? this.pendingCouponId : this.couponId
        },
        integralText() {
            const userIntegral = this.userIntegral
            if (!this.canUseIntegral) return `${userIntegral}积分，不满足抵扣条件`
            if (this.useIntegral && this.pointsDeductAmount > 0) return `已使用${this.pointsAmount || userIntegral}积分`
            if (this.pointsDeductAmount > 0) return `可抵¥${this.pointsDeductAmount.toFixed(2)}`
            return `${userIntegral}积分可用`
        },
        pointsHelpText() {
            if (!this.canUseIntegral) return '当前订单暂不可用'
            if (this.pointsDeductAmount > 0) return `勾选后应付金额减少¥${this.pointsDeductAmount.toFixed(2)}`
            return '勾选后将按订单规则试算抵扣'
        },
        showIntegralRow() {
            const switchValue = this.orderInfo.integral_switch
            if (switchValue === false || switchValue === 0 || switchValue === '0') return false
            return this.userIntegral > 0 || this.pointsDeductAmount > 0 || this.pointsAmount > 0 || switchValue === true || switchValue === 1 || switchValue === '1'
        },
        canUseIntegral() {
            if (!this.showIntegralRow) return false
            if (this.orderInfo.integral_config === 0 || this.orderInfo.integral_config === '0' || this.orderInfo.integral_config === false) return false
            return this.userIntegral > 0 && this.userIntegral >= Number(this.orderInfo.integral_limit || 0)
        },
        userIntegral() {
            const data = this.orderInfo || {}
            const totalPoints = data.user_integral ?? data.userIntegral ?? data.availablePoints ?? data.available_points ?? data.points ?? 0
            return this.moneyValue(totalPoints)
        },
        pointsAmount() {
            return this.pickNumber(this.orderInfo, ['pointsAmount', 'points_amount', 'usedPoints', 'used_points', 'integralNum', 'integral_num', 'deductPoints', 'deduct_points', 'maxUsablePoints', 'max_usable_points'])
        },
        pointsDeductAmount() {
            return this.pickNumber(this.orderInfo, ['pointsDeductAmount', 'points_deduct_amount', 'integral_amount', 'integralAmount', 'integralDeductAmount', 'integral_deduct_amount', 'maxPointsDeductAmount', 'max_points_deduct_amount', 'maxDeductAmount', 'max_deduct_amount'])
        },
        currentCouponList() {
            if (this.couponTabsIndex === 0) return this.usableCoupon
            if (this.couponTabsIndex === 1) return this.receivableCoupon
            return this.unusableCoupon
        }
    },
    onLoad(options) {
        const data = JSON.parse(decodeURIComponent(options.data))

        this.goods = Array.isArray(data.goods) ? data.goods : []
        this.type = data.type
        this.teamId = data.teamId || ''
        this.bargainLaunchId = options.bargain_launch_id
        this.foundId = data.foundId || 0

        // 配送方式
        getDelivery()
            .then(({ code, data, msg }) => {
                if (code != 1) throw new Error(msg)
                return data
            })
        // 配送方式
            .then((data) => {
                // 快递
                if (!data.is_express) {
                    this.addressTabsList = this.addressTabsList.filter(
                        (item) => item.sign !== 'express'
                    )
                }
                // 自提
                if (!data.is_selffetch) {
                    this.addressTabsList = this.addressTabsList.filter(
                        (item) => item.sign !== 'store'
                    )
                }
                if (!this.addressTabsList.length) {
                    this.addressTabsList = [{ id: 1, sign: 'express', name: '快递配送' }]
                }
                if (!this.addressTabsList[this.addressTabsIndex]) {
                    this.addressTabsIndex = 0
                }
            })
            .then(() => {
                this.handleOrderMethods('info')
            })
            // 监听全局事件
            .then(() => {
                uni.$on('selectaddress', (params) => {
                    this.addressId = params.id
                    if (params.address) this.address = params.address
                    this.$nextTick(() => this.handleOrderMethods('info'))
                })

                uni.$on('payment', (params) => {
                    setTimeout(() => {
                        uni.$off('payment')

                        if (params.result) {
                            uni.redirectTo({
                                url: `/bundle_user/pages/pay_result/pay_result?id=${params.order_id}`
                            })
                        } else {
                            uni.redirectTo({
                                url: '/bundle_order/pages/user_order/user_order'
                            })
                        }
                    }, 500)
                })

                uni.$on('store', (params) => {
                    this.storeInfo = this.normalizeStoreInfo(params)
                    this.$nextTick(() => this.handleOrderMethods('info'))
                })
            })
            .catch(() => {})
    },

    onUnload() {
        // 取消全局监听
        uni.$off('selectaddress')
        uni.$off('store')
        uni.$off('payment')
    },

    methods: {
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
                return
            }
            uni.switchTab({ url: '/pages/shop_cart/shop_cart' })
        },
        resolveOrderImage(image, type = 'goods') {
            return image ? resolveImage(image, type) : ''
        },
        goodsImage(item = {}) {
            return this.resolveOrderImage(item.image_str || item.image || item.imageUrl || item.goodsImageUrl || item.mainImageUrl || item.cover || item.skuImage || item.skuImageUrl || item.goodsImage || item.picUrl, 'goods')
        },
        pickNumber(source = {}, keys = []) {
            for (const key of keys) {
                const value = Number(source[key])
                if (!Number.isNaN(value) && value > 0) return value
            }
            return 0
        },
        moneyValue(value) {
            const number = Number(value)
            return Number.isNaN(number) ? 0 : number
        },
        firstDefined(...values) {
            return values.find(value => value !== undefined && value !== null && value !== '')
        },
        safeText(value) {
            if (value === undefined || value === null) return ''
            const text = String(value)
            return text === 'NaN' || text === 'undefined' || text === 'null' ? '' : text
        },
        couponAmountRaw(item = {}) {
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
                item.coupon && (item.coupon.money || item.coupon.amount || item.coupon.discountAmount || item.coupon.discount_amount),
                item.couponInfo && (item.couponInfo.money || item.couponInfo.amount || item.couponInfo.discountAmount || item.couponInfo.discount_amount),
                0
            )
        },
        couponAmountValue(item = {}) {
            return this.moneyValue(this.couponAmountRaw(item))
        },
        couponName(item = {}) {
            return this.localizeCouponText(item.name || item.couponName || item.coupon_name || item.title || '优惠券')
        },
        couponConditionText(item = {}) {
            const threshold = this.firstDefined(item.thresholdAmount, item.threshold_amount, item.minAmount, item.min_amount, item.useThreshold, item.use_threshold)
            return this.localizeCouponText(item.use_condition || item.useCondition || item.conditionText || item.condition || (Number(threshold) > 0 ? `满${threshold}可用` : '无门槛'))
        },
        couponTypeText(item = {}) {
            const type = String(item.coupon_type || item.couponType || item.typeText || item.type || '').toUpperCase()
            const map = {
                COUPON: '优惠券',
                FULL: '满减券',
                FULL_REDUCE: '满减券',
                DISCOUNT: '折扣券',
                FIXED_DISCOUNT: '折扣券',
                REDUCE: '满减券',
                MONEY: '现金券',
                CASH_COUPON: '现金券',
                FULL_REDUCTION: '满减券',
                FULL_DISCOUNT: '满减券',
                CASH: '现金券',
                VOUCHER: '代金券',
                FREIGHT: '运费券',
                FREE_SHIPPING: '包邮券',
                PLATFORM: '平台券',
                MERCHANT: '商家券',
                SHOP: '商家券',
                STORE: '商家券'
            }
            return map[type] || this.localizeCouponText(item.coupon_type || item.couponType || item.typeText || '优惠券')
        },
        couponTimeText(item = {}) {
            return this.localizeCouponText(item.use_time_tips || item.useTimeTips || item.validTimeText || item.valid_time_text || [item.startTime || item.start_time, item.endTime || item.end_time].filter(Boolean).join(' 至 ') || '有效期以实际使用规则为准')
        },
        localizeCouponText(value) {
            const text = String(value || '')
            const exactMap = {
                AVAILABLE: '可使用',
                UNAVAILABLE: '不可用',
                RECEIVABLE: '可领取',
                CLAIMABLE: '可领取',
                RECEIVED: '已领取',
                USED: '已使用',
                EXPIRED: '已过期',
                UNUSED: '未使用',
                PLATFORM: '平台券',
                MERCHANT: '商家券',
                SHOP: '商家券',
                STORE: '商家券',
                DISCOUNT: '折扣券',
                REDUCE: '满减券',
                FULL_REDUCTION: '满减券',
                FREE_SHIPPING: '包邮券'
            }
            const upper = text.toUpperCase()
            if (exactMap[upper]) return exactMap[upper]
            return text
                .replace(/\bAVAILABLE\b/gi, '可使用')
                .replace(/\bUNAVAILABLE\b/gi, '不可用')
                .replace(/\bRECEIVABLE\b/gi, '可领取')
                .replace(/\bCLAIMABLE\b/gi, '可领取')
                .replace(/\bRECEIVED\b/gi, '已领取')
                .replace(/\bUSED\b/gi, '已使用')
                .replace(/\bEXPIRED\b/gi, '已过期')
                .replace(/\bUNUSED\b/gi, '未使用')
                .replace(/\bPLATFORM\b/gi, '平台')
                .replace(/\bMERCHANT\b/gi, '商家')
                .replace(/\bSHOP\b/gi, '商家')
        },
        couponKey(item = {}) {
            const template = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {}
            const coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {}
            return item.coupon_id || item.couponId || item.templateId || item.template_id || item.couponTemplateId || item.coupon_template_id || item.couponTplId || item.coupon_tpl_id || item.couponTemplateNo || item.coupon_template_no || template.couponId || template.coupon_id || template.templateId || template.template_id || template.couponTemplateId || template.coupon_template_id || template.couponTplId || template.coupon_tpl_id || template.id || coupon.couponId || coupon.coupon_id || coupon.templateId || coupon.template_id || coupon.couponTemplateId || coupon.coupon_template_id || coupon.couponTplId || coupon.coupon_tpl_id || coupon.id || item.id || item.userCouponId || ''
        },
        couponApplyId(item = {}) {
            return this.couponApplyIds(item)[0] || ''
        },
        couponApplyIds(item = {}) {
            const coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {}
            return [
                item.coupon_id,
                item.couponId,
                item.userCouponId,
                item.user_coupon_id,
                item.userCouponNo,
                item.user_coupon_no,
                item.receiveId,
                item.receive_id,
                coupon.couponId,
                coupon.coupon_id,
                coupon.userCouponId,
                coupon.user_coupon_id,
                coupon.userCouponNo,
                coupon.user_coupon_no,
                coupon.id,
                item.id,
                this.couponKey(item)
            ].filter(value => value !== undefined && value !== null && value !== '').map(value => String(value)).filter((value, index, list) => list.indexOf(value) === index)
        },
        couponCompareIds(item = {}) {
            const template = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {}
            const coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {}
            return [
                ...this.couponApplyIds(item),
                item.coupon_id, item.couponId, item.templateId, item.template_id, item.couponTemplateId, item.coupon_template_id, item.couponTplId, item.coupon_tpl_id, item.id, item.userCouponId, item.user_coupon_id,
                template.couponId, template.coupon_id, template.templateId, template.template_id, template.couponTemplateId, template.coupon_template_id, template.id,
                coupon.couponId, coupon.coupon_id, coupon.templateId, coupon.template_id, coupon.couponTemplateId, coupon.coupon_template_id, coupon.id, coupon.userCouponId, coupon.user_coupon_id
            ].filter(value => value !== undefined && value !== null && value !== '').map(value => String(value))
        },
        isCouponSelected(item = {}) {
            if (!this.activeCouponId) return false
            return this.couponCompareIds(item).includes(String(this.activeCouponId))
        },
        couponReceivePayload(item = {}) {
            const id = this.couponKey(item)
            const template = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {}
            const templateId = item.couponTemplateId || item.coupon_template_id || item.couponTplId || item.coupon_tpl_id || item.templateId || item.template_id || template.couponTemplateId || template.coupon_template_id || template.templateId || template.template_id || template.id || id
            const goods = this.goods[0] || {}
            const productId = goods.goods_id || goods.goodsId || goods.spuId || goods.spu_id || goods.productId || goods.product_id || ''
            return {
                couponId: item.couponId || item.coupon_id || id,
                coupon_id: item.couponId || item.coupon_id || id,
                couponTemplateId: templateId,
                coupon_template_id: templateId,
                couponTplId: templateId,
                coupon_tpl_id: templateId,
                templateId,
                template_id: templateId,
                receiveScene: 'ORDER_CONFIRM',
                receive_scene: 'ORDER_CONFIRM',
                spuId: productId,
                spu_id: productId,
                productId,
                product_id: productId,
                goodsId: productId,
                goods_id: productId
            }
        },
        normalizePreviewGoods(item = {}, index = 0) {
            const original = this.goods[index] || this.goods.find(goods => String(goods.item_id || goods.skuId || goods.id || '') === String(item.item_id || item.skuId || item.sku_id || item.id || '')) || {}
            const image = this.goodsImage(item) || this.goodsImage(original)
            const shopLogo = this.resolveOrderImage(item.shop_logo || item.shopLogo || item.shopLogoUrl || item.storeLogo || original.shop_logo || original.shopLogo || original.shopLogoUrl || original.storeLogo, 'avatar')
            return {
                ...original,
                ...item,
                image,
                image_str: item.image_str || image,
                shop_logo: shopLogo,
                shopLogo,
                shop_name: item.shop_name || item.shopName || original.shop_name || original.shopName || this.orderInfo.shop_name || '',
                shopName: item.shopName || item.shop_name || original.shopName || original.shop_name || this.orderInfo.shopName || ''
            }
        },
        normalizeStoreInfo(info = {}) {
            const id = info.id || info.shop_id || info.shopId || info.selffetch_shop_id || info.selffetchShopId || ''
            return {
                ...info,
                id,
                name: info.name || info.shop_name || info.shopName || info.storeName || '自提门店',
                shop_address: info.shop_address || info.address || info.detailAddress || info.detail_address || '',
                mobile: info.mobile || info.phone || info.telephone || ''
            }
        },
        changeDelivery(index) {
            this.addressTabsIndex = index
            this.handleOrderMethods('info')
        },
        onAddressExpress() {
            uni.navigateTo({ url: `/bundle/pages/user_address/user_address?type=${1}` })
        },
        onAddressStore() {
            uni.navigateTo({ url: `/bundle_misc/pages/store_list/store_list` })
        },
        changeIntegral() {
            if (this.orderInfo.integral_config === 0 || this.orderInfo.integral_config === '0' || this.orderInfo.integral_config === false) {
                return this.$toast({ title: '当前订单暂不支持积分抵扣' })
            }
            if (this.userIntegral <= 0) {
                return this.$toast({ title: '暂无可用积分' })
            }
            if (Number(this.orderInfo.integral_limit || 0) > this.userIntegral) {
                return this.$toast({ title: '未满足积分使用条件' })
            }
            this.useIntegral = this.useIntegral ? 0 : 1
            this.$nextTick(() => this.handleOrderMethods('info'))
        },
        dialogIntegralDesc() {
            uni.showModal({
                title: '积分使用说明',
                content: this.orderInfo.integral_desc,
                confirmColor: '#FF2C3C',
                showCancel: false
            })
        },
        onSelectCoupon(value) {
            this.couponId = value
            this.selectedCouponCache = this.usableCoupon.find(item => this.couponCompareIds(item).includes(String(value))) || null
            this.couponManuallyCleared = !value
            this.showCoupon = false
            this.handleOrderMethods('info')
        },
        openCouponPopup() {
            if (!this.canOpenCoupon) return
            this.pendingCouponId = this.couponId
            this.pendingCouponCache = this.selectedCouponCache
            this.pendingCouponCandidateIds = this.selectedCouponCandidateIds.slice()
            this.showCoupon = true
        },
        handleCouponCardTap(item) {
            if (this.couponTabsIndex === 1) return this.receiveCoupon(item)
            this.toggleCoupon(item)
        },
        toggleCoupon(item = {}) {
            if (this.couponTabsIndex !== 0) return
            const id = this.couponApplyId(item)
            const nextId = this.isCouponSelected(item) ? '' : id
            this.pendingCouponId = nextId
            this.pendingCouponCache = nextId ? item : null
            this.pendingCouponCandidateIds = nextId ? this.couponApplyIds(item) : []
        },
        async receiveCoupon(item = {}) {
            const id = this.couponKey(item)
            if (item.is_get || item.isGet) return
            if (!id || this.receivingCouponId) return
            this.receivingCouponId = id
            try {
                const res = await getCoupon(id, this.couponReceivePayload(item))
                if (res.code != 1) {
                    uni.showToast({ title: res.msg || '领取失败', icon: 'none' })
                    return
                }
                this.$set(item, 'is_get', 1)
                this.$set(item, 'isGet', 1)
                uni.showToast({ title: res.msg || '领取成功', icon: 'success' })
                await this.refreshCouponsAfterReceive()
            } catch (error) {
                uni.showToast({ title: '领取失败', icon: 'none' })
            } finally {
                this.receivingCouponId = ''
            }
        },
        async refreshCouponsAfterReceive() {
            await this.handleOrderMethods('info')
            this.couponTabsIndex = this.receivableCoupon.length ? 1 : 0
        },
        couponButtonText(item = {}) {
            if (item.is_get || item.isGet) return '已领取'
            if (!this.couponKey(item)) return '暂不可领'
            return this.receivingCouponId == this.couponKey(item) ? '领取中' : '领取'
        },
        couponButtonDisabled(item = {}) {
            return Boolean(item.is_get || item.isGet || !this.couponKey(item) || this.receivingCouponId == this.couponKey(item))
        },
        confirmCouponPopup() {
            this.showCoupon = false
            this.couponId = this.pendingCouponId
            this.selectedCouponCache = this.pendingCouponCache
            this.selectedCouponCandidateIds = this.pendingCouponCandidateIds.slice()
            if (!this.couponId) this.couponManuallyCleared = true
            else this.couponManuallyCleared = false
            this.handleOrderMethods('info')
        },
        authWechatMessage() {
            return new Promise((resolve, reject) => {
                getMnpNotice({ scene: 1 })
                    .then(({ code, data, msg }) => {
                        if (code != 1) throw new Error(msg)
                        return data
                    })
                    .then((data) => {
                        if (!data.length) return reject()
                        uni.requestSubscribeMessage({ tmplIds: data, success: resolve, fail: reject })
                    })
                    .catch(reject)
            })
        },
        onSubmitOrder() {
            if (this.currentDelivery.sign === 'express' && !this.address.id) {
                return this.$toast({ title: '请先选择收货地址' })
            }
            if (this.currentDelivery.sign === 'store' && !this.storeInfo.id) {
                return this.$toast({ title: '请先选择自提门店' })
            }
            if (this.currentDelivery.sign === 'store' && (!this.userConsignee || !this.userMobile)) {
                return this.$toast({ title: '请填写提货人和联系方式' })
            }
            uni.showModal({
                title: '温馨提示',
                content: '是否确认下单？',
                confirmColor: '#FF2C3C',
                success: ({ confirm }) => {
                    if (!confirm) return
                    // #ifdef MP-WEIXIN
                    this.authWechatMessage().catch(() => {}).finally(() => this.handleOrderMethods('submit'))
                    // #endif
                    // #ifndef MP-WEIXIN
                    this.handleOrderMethods('submit')
                    // #endif
                }
            })
        },
        selectPayWay(value) {
            this.payWay = 'WECHAT_JSAPI'
        },
        mergeReceivableCoupons(list = []) {
            const ownedIds = new Set(this.usableCoupon.concat(this.unusableCoupon).map(item => String(this.couponKey(item))))
            const seen = new Set()
            return list.filter((item) => {
                const id = String(this.couponKey(item))
                if (!id || seen.has(id) || ownedIds.has(id) || item.is_get) return false
                seen.add(id)
                return true
            })
        },
        async initPageData(from) {
            this.showLoading = true
            try {
                const { code, data, msg } = await this.previewOrderWithCouponFallback(from)
                if (code != 1) throw new Error(msg)
                const responseAddress = data.address || {}
                this.address = responseAddress.id ? responseAddress : (this.address && this.address.id ? this.address : {})
                if (this.address.id) this.addressId = this.address.id
                if (!this.address.id && this.currentDelivery.sign === 'express') {
                    await this.loadDefaultAddress()
                    if (this.addressId) {
                        this.$nextTick(() => this.handleOrderMethods('info'))
                        return
                    }
                }
                this.orderInfo = data
                this.goodsLists = (data.goods_lists || []).map(this.normalizePreviewGoods)
                this.syncDiscountData(data)
                if (this.ensureDefaultCoupon()) {
                    this.$nextTick(() => this.handleOrderMethods('info'))
                    return
                }
                const selffetchInfo = data.selffetch_info || data.selffetchInfo || data.pickupInfo || {}
                if (Object.keys(selffetchInfo).length) {
                    const responseStore = this.normalizeStoreInfo(selffetchInfo.selffetch_shop || selffetchInfo.selffetchShop || selffetchInfo.shop || {})
                    this.storeInfo = responseStore.id ? responseStore : (this.storeInfo && this.storeInfo.id ? this.storeInfo : {})
                    this.userConsignee = selffetchInfo.contact || selffetchInfo.consignee || selffetchInfo.receiverName || this.userConsignee
                    this.userMobile = selffetchInfo.mobile || selffetchInfo.receiverMobile || this.userMobile
                }
                this.$nextTick(() => { this.isFirstLoading = false })
            } catch (err) {
                this.isFirstLoading = false
                this.$toast({ title: '网络异常，请重新进入页面' })
            } finally {
                this.showLoading = false
            }
        },
        async loadDefaultAddress() {
            try {
                const res = await getDefaultAddress()
                if (res.code == 1 && res.data && res.data.id) {
                    this.address = res.data
                    this.addressId = res.data.id
                }
            } catch (error) {}
        },
        previewDiscountAmount(data = {}) {
            return this.moneyValue(data.discount_amount || data.discountAmount)
        },
        async previewOrderWithCouponFallback(from) {
            if (this.teamId) return teamBuy(from)
            if (!from.coupon_id || !this.selectedCouponCandidateIds.length) return orderBuy(from)
            const candidates = this.selectedCouponCandidateIds.filter((value, index, list) => value && list.indexOf(value) === index)
            let fallbackRes = null
            for (const id of candidates) {
                const res = await orderBuy({
                    ...from,
                    coupon_id: id,
                    couponId: id,
                    couponIds: [id]
                })
                if (!fallbackRes) fallbackRes = res
                if (res.code == 1 && this.previewDiscountAmount(res.data || {}) > 0) {
                    this.couponId = id
                    this.selectedCouponCandidateIds = [id].concat(candidates.filter(item => item !== id))
                    return res
                }
            }
            return fallbackRes || orderBuy(from)
        },
        async handleOrderSubmit(from) {
            this.showLoading = true
            from.remark = this.userRemark
            from.type = this.type
            from.payWay = 'WECHAT_JSAPI'
            from.payMethod = 'WECHAT_JSAPI'
            try {
                const { code, data, msg } = this.teamId ? await teamBuy(from) : await orderBuy(from)
                if (code != 1) throw new Error(msg)
                const amount = data.payAmount || data.order_amount || this.payAmount
                if (Number(amount || 0) <= 0) {
                    uni.redirectTo({ url: `/bundle_user/pages/pay_result/pay_result?id=${data.order_id}` })
                    return
                }
                uni.redirectTo({ url: `/bundle/pages/payment/payment?from=${data.type}&order_id=${data.order_id}&amount=${amount}&pay_way=WECHAT_JSAPI&payWay=WECHAT_JSAPI` })
            } catch (err) {
                this.$toast({ title: '下单异常，请重新操作' })
            } finally {
                this.showLoading = false
            }
        },
        syncDiscountData(data = {}) {
            const usableCoupon = data.usable || data.usableCoupon || data.usable_coupon || []
            const receivableCoupon = data.receivable || data.receivableCoupon || data.receivable_coupon || []
            const unusableCoupon = data.unusable || data.unusableCoupon || data.unusable_coupon || []
            this.usableCoupon = Array.isArray(usableCoupon) ? usableCoupon : []
            this.unusableCoupon = Array.isArray(unusableCoupon) ? unusableCoupon : []
            this.receivableCoupon = Array.isArray(receivableCoupon) ? this.mergeReceivableCoupons(receivableCoupon) : []
            const responseCouponId = data.coupon_id || data.couponId
            if (responseCouponId && (!this.couponManuallyCleared || this.couponId)) {
                this.couponId = responseCouponId
                this.couponManuallyCleared = false
            }
            if (this.couponId) {
                const selected = this.usableCoupon.find(item => this.couponCompareIds(item).includes(String(this.couponId)))
                if (selected) {
                    this.selectedCouponCache = selected
                    this.selectedCouponCandidateIds = this.couponApplyIds(selected)
                }
                if (!selected && !this.selectedCouponCache) this.couponId = ''
            }
            if (!this.showCoupon) {
                this.pendingCouponId = this.couponId
                this.pendingCouponCache = this.selectedCouponCache
                this.pendingCouponCandidateIds = this.selectedCouponCandidateIds.slice()
            }
        },
        ensureDefaultCoupon() {
            if (Number(this.orderInfo.order_type || 0) !== 0) return false
            if (this.couponManuallyCleared) return false
            if (this.couponId || !this.usableCoupon.length) return false
            const firstCoupon = this.usableCoupon[0]
            const id = this.couponApplyId(firstCoupon)
            if (!id) return false
            this.couponId = id
            this.selectedCouponCache = firstCoupon
            this.selectedCouponCandidateIds = this.couponApplyIds(firstCoupon)
            this.pendingCouponId = id
            this.pendingCouponCache = firstCoupon
            this.pendingCouponCandidateIds = this.selectedCouponCandidateIds.slice()
            this.couponManuallyCleared = false
            return true
        },
        handleOrderMethods(action) {
            if (!this.goods.length) {
                this.isFirstLoading = false
                this.showLoading = false
                return this.$toast({ title: '商品参数异常，请重新选择商品' })
            }
            const orderFrom = {
                action,
                goods: this.goods,
                delivery_type: this.delivery,
                use_integral: this.useIntegral,
                usePoints: Boolean(this.useIntegral),
                orderInfo: this.orderInfo,
                pointsDeductAmount: this.useIntegral ? this.pointsDeductAmount : 0,
                pointsAmount: this.useIntegral ? this.pointsAmount : 0,
                points_deduct_amount: this.useIntegral ? this.pointsDeductAmount : 0,
                points_amount: this.useIntegral ? this.pointsAmount : 0,
                integral_amount: this.useIntegral ? this.pointsDeductAmount : 0,
                integral_num: this.useIntegral ? this.pointsAmount : 0,
                addressId: this.addressId,
                address_id: this.addressId,
                address: this.address && this.address.id ? this.address : undefined,
                coupon_id: this.couponId,
                couponIds: this.couponId ? [this.couponId] : [],
                bargain_launch_id: this.bargainLaunchId == -1 ? '' : this.bargainLaunchId
            }
            if (this.couponId) {
                orderFrom.couponId = this.couponId
            }
            if (this.currentDelivery.sign === 'store') {
                orderFrom.selffetch_shop_id = this.storeInfo.id
                orderFrom.store_id = this.storeInfo.id
                orderFrom.consignee = this.userConsignee
                orderFrom.mobile = this.userMobile
            }
            if (this.teamId) {
                const goods = this.goods[0]
                delete orderFrom.goods
                orderFrom.item_id = goods.item_id
                orderFrom.goods_num = goods.num
                orderFrom.team_id = this.teamId
                orderFrom.found_id = this.foundId
            }
            if (action === 'info') return this.initPageData(orderFrom)
            if (action === 'submit') return this.handleOrderSubmit(orderFrom)
        }
    }
}</script>
<style lang="scss">
page {
    min-height: 100%;
    background: #f5f5f5;
}

.confirm-order-page,
.confirm-order {
    height: 100vh;
    background: #f5f5f5;
    overflow: hidden;
}

.confirm-order {
    display: flex;
    flex-direction: column;
}

.page-head {
    background: #f5f5f5;
}

.nav-row {
    position: relative;
    display: flex;
    align-items: center;
    height: calc(var(--status-bar-height) + 64rpx);
    padding: var(--status-bar-height) 24rpx 0;
    box-sizing: border-box;
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
    color: #222222;
}

.tips-row {
    display: flex;
    align-items: center;
    width: calc(100% - 48rpx);
    min-height: 76rpx;
    margin: 14rpx 24rpx 0;
    padding: 16rpx 24rpx;
    border: 1rpx solid rgba(255, 158, 54, 0.16);
    border-radius: 24rpx;
    background: linear-gradient(135deg, #fff8ef 0%, #fffdf8 100%);
    box-shadow: 0 6rpx 18rpx rgba(222, 125, 20, 0.06);
    box-sizing: border-box;
}

.tips-icon {
    flex: none;
    width: 34rpx;
    height: 34rpx;
}

.tips-text {
    flex: 1;
    min-width: 0;
    margin-left: 12rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #bf6618;
    white-space: normal;
}

.confirm-con {
    flex: 1;
    min-height: 0;
    height: auto;
    padding: 0 24rpx 220rpx;
    box-sizing: border-box;
}

.order-card,
.remark-card,
.pay-card {
    width: 100%;
    background: #ffffff;
    border-radius: 15rpx;
    box-sizing: border-box;
}

.main-card {
    margin-top: 20rpx;
}

.delivery-tabs {
    display: flex;
    padding: 20rpx 28rpx 0;
}

.delivery-tab {
    height: 52rpx;
    padding: 0 24rpx;
    margin-right: 18rpx;
    border-radius: 26rpx;
    background: #f5f7fb;
    font-size: 24rpx;
    line-height: 52rpx;
    color: #666666;
}

.delivery-tab.active {
    color: #037dfa;
    background: #e9f3ff;
}

.address-row {
    display: flex;
    align-items: center;
    min-height: 91rpx;
    padding: 31rpx 31rpx 31rpx 27rpx;
    box-sizing: border-box;
}

.address-icon {
    flex: none;
    width: 25rpx;
    height: 29rpx;
}

.address-content {
    flex: 1;
    margin-left: 17rpx;
    overflow: hidden;
}

.address-person,
.address-empty {
    font-size: 26rpx;
    font-weight: 500;
    line-height: 30rpx;
    color: #222222;
}

.address-person .phone {
    margin-left: 12rpx;
}

.address-detail {
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #666666;
}

.arrow-icon,
.small-arrow {
    flex: none;
    width: 10rpx;
    height: 17rpx;
}

.store-form {
    padding: 0 29rpx 12rpx;
}

.store-field {
    display: flex;
    align-items: center;
    height: 78rpx;
    border-top: 1rpx solid #f0f0f0;
    font-size: 26rpx;
    color: #222222;
}

.field-input {
    flex: 1;
    margin-left: 20rpx;
}

.divider {
    height: 1rpx;
    background: #eeeeee;
}

.shop-row {
    display: flex;
    align-items: center;
    height: 111rpx;
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
    color: #222222;
}

.goods-row {
    display: flex;
    min-height: 202rpx;
    padding: 18rpx 29rpx 23rpx 24rpx;
    box-sizing: border-box;
}

.goods-image {
    flex: none;
}

.goods-info {
    flex: 1;
    min-width: 0;
    margin: 17rpx 0 0 26rpx;
}

.goods-name {
    font-size: 26rpx;
    line-height: 30rpx;
    color: #222222;
}

.goods-spec {
    margin-top: 18rpx;
    font-size: 24rpx;
    line-height: 28rpx;
    color: #999999;
}

.goods-price {
    margin-top: 34rpx;
    color: #ff1919;
}

.goods-num {
    align-self: flex-end;
    margin: 0 0 3rpx 18rpx;
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
    color: #222222;
    box-sizing: border-box;
}

.summary-row--deduct {
    min-height: 56rpx;
    padding-top: 0;
    color: #666666;
    font-size: 24rpx;
}

.points-label {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.points-label__desc {
    max-width: 390rpx;
    color: #999999;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 30rpx;
}

.muted-value {
    font-size: 24rpx;
    font-weight: 400;
    color: #999999;
}

.red-value {
    font-size: 24rpx;
    color: #ff1919;
}

.orange-value {
    font-size: 24rpx;
    font-weight: 500;
    color: #ff7417;
}

.remark-card {
    display: flex;
    align-items: center;
    height: 88rpx;
    margin-top: 19rpx;
    padding: 0 31rpx 0 29rpx;
}

.remark-card .label {
    flex: none;
    font-size: 26rpx;
    font-weight: 500;
    color: #222222;
}

.remark-input {
    flex: 1;
    margin-left: 20rpx;
}

.price-card {
    margin-top: 19rpx;
    overflow: hidden;
}

.row-value {
    display: flex;
    align-items: center;
}

.row-value .small-arrow {
    margin-left: 17rpx;
}

.coupon-arrow {
    flex: none;
    width: 16rpx;
    height: 16rpx;
    margin-left: 17rpx;
    border-right: 3rpx solid #9aa0a6;
    border-bottom: 3rpx solid #9aa0a6;
    transform: rotate(-45deg);
    transition: transform .2s ease;
    box-sizing: border-box;
}

.coupon-arrow--open {
    transform: rotate(45deg);
}

.integral-check {
    margin-left: 18rpx;
    transform: scale(0.72);
}

.points-settle-tip {
    display: flex;
    align-items: center;
    margin: 19rpx 0 0;
    padding: 20rpx 24rpx;
    border: 1rpx solid #d9eaff;
    border-radius: 15rpx;
    background: linear-gradient(135deg, #f2f8ff 0%, #ffffff 100%);
    box-shadow: 0 10rpx 24rpx rgba(3, 125, 250, 0.08);
    box-sizing: border-box;
}

.points-settle-tip__text {
    flex: 1;
    min-width: 0;
    font-size: 20rpx;
    line-height: 28rpx;
    color: #4d6580;
    white-space: nowrap;
}

.points-settle-tip__text text {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
}

.pay-section {
    padding: 22rpx 0 0;
}

.pay-card {
    margin-bottom: 28rpx;
    padding: 0 0 1rpx;
}

.pay-item {
    display: flex;
    align-items: center;
    height: 108rpx;
    padding: 0 40rpx 0 36rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #222222;
    box-sizing: border-box;
}

.pay-icon {
    flex: none;
    width: 47rpx;
    height: 42rpx;
    margin-right: 37rpx;
}

.pay-icon.bank {
    width: 55rpx;
    height: 43rpx;
    margin-right: 30rpx;
}

.pay-badge {
    height: 44rpx;
    padding: 0 18rpx;
    margin-left: auto;
    border-radius: 22rpx;
    background: #e9f3ff;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 44rpx;
    color: #037dfa;
    box-sizing: border-box;
}

.footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    align-items: center;
    min-height: 112rpx;
    padding: 0 24rpx;
    padding-bottom: env(safe-area-inset-bottom);
    box-sizing: content-box;
    border-radius: 34rpx 34rpx 0 0;
    background: #ffffff;
    box-shadow: 0 -2rpx 21rpx rgba(82, 82, 82, 0.08);
}

.all-price {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.total-label {
    flex: none;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
    color: #222222;
}

.total-price {
    margin-left: 19rpx;
    color: #ff1919;
}

.pay-btn {
    flex: none;
    width: 282rpx;
    height: 76rpx;
    margin-left: 24rpx;
    border: none;
    border-radius: 40rpx;
    background: #037dfa;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 76rpx;
    color: #ffffff;
}

.pay-btn::after {
    border: none;
}

.pop-title {
    height: 100rpx;
    border-bottom: 1rpx solid #f2f2f2;
}

.pop-title .title {
    margin-left: 30rpx;
    font-size: 34rpx;
    font-weight: bold;
    line-height: 36rpx;
}

.coupon-tabs {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 24rpx;
    box-sizing: border-box;
    background: #ffffff;
}

.coupon-tab {
    position: relative;
    flex: 1;
    color: #606266;
    font-size: 28rpx;
    line-height: 88rpx;
    text-align: center;
}

.coupon-tab.is-active {
    color: #037dfa;
    font-weight: 600;
}

.coupon-tab.is-active::after {
    position: absolute;
    left: 50%;
    bottom: 8rpx;
    width: 76rpx;
    height: 5rpx;
    border-radius: 999rpx;
    background: #037dfa;
    transform: translateX(-50%);
    content: '';
}

.coupon-scroll {
    height: 640rpx;
    background: #f6f6f6;
}

.coupon-obj {
    padding: 20rpx 24rpx;
}

.coupon-card {
    margin-bottom: 20rpx;
    background: #ffffff;
}

.coupon-item {
    position: relative;
    height: 160rpx;
    background-image: url(https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/coupon_bg.png);
    background-size: 100% 100%;
}

.coupon-item .price {
    flex: none;
    width: 200rpx;
    min-width: 180rpx;
    box-sizing: border-box;
}

.coupon-info-wrap {
    flex: 1;
    min-width: 0;
}

.coupon-info-wrap .info {
    flex: 1;
    min-width: 0;
}

.coupon-receive-btn {
    flex: none;
    min-width: 104rpx;
    height: 52rpx;
    margin-right: 20rpx;
    padding: 0 18rpx;
    border-radius: 26rpx;
    background: #037dfa;
    color: #ffffff;
    font-size: 24rpx;
    line-height: 52rpx;
    text-align: center;
    box-sizing: border-box;
}

.coupon-receive-btn--disabled {
    background: #d6d9df;
    color: #ffffff;
}

.coupon-tips {
    padding: 14rpx 20rpx;
}

.coupon-empty {
    padding-top: 50rpx;
}

.coupon-confirm {
    width: 710rpx;
    height: 74rpx;
    margin-top: 12rpx;
}
</style>
