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
                                    {{ address.province + address.city + address.district + address.address }}
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
                    <view class="divider" v-if="orderInfo.order_type == 0"></view>
                    <view class="summary-row summary-row--coupon" v-if="orderInfo.order_type == 0" @tap="showCoupon = true">
                        <text>优惠券</text>
                        <view class="row-value">
                            <text :class="discountAmount > 0 ? 'red-value' : 'muted-value'">{{ couponText }}</text>
                            <image class="small-arrow" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png" mode="scaleToFill"></image>
                        </view>
                    </view>
                    <template v-if="orderInfo.integral_switch">
                        <view class="divider"></view>
                        <view class="summary-row" @tap="changeIntegral">
                            <text>总积分</text>
                            <view class="row-value">
                                <text class="orange-value">{{ integralText }}</text>
                                <checkbox
                                    class="integral-check"
                                    :disabled="
                                        Number(orderInfo.user_integral || 0) < Number(orderInfo.integral_limit || 0) ||
                                        Number(orderInfo.integral_config) === 0
                                    "
                                    :checked="Boolean(useIntegral)"
                                ></checkbox>
                            </view>
                        </view>
                    </template>
                </view>

                <view class="points-settle-tip">
                    <view class="points-settle-tip__icon">i</view>
                    <view class="points-settle-tip__text">
                        <text>线上订单确认收货后积分到账。</text>
                        <text>退款时将按原订单抵扣和赠送记录同步退回。</text>
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
                            :price="orderInfo.order_amount || 0"
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
                        不可用优惠券 ({{ unusableCoupon.length }})
                    </view>
                </view>
                <scroll-view class="coupon-scroll" scroll-y>
                    <view class="coupon-obj">
                        <view
                            v-for="item in currentCouponList"
                            :key="item.id"
                            class="coupon-card"
                            @tap="toggleCoupon(item.id)"
                        >
                            <view class="coupon-item row">
                                <view class="price white column-center">
                                    <price-format :subscript-size="34" :first-size="60" :second-size="50" :price="item.money" :weight="500"></price-format>
                                    <view class="nr">{{ item.use_condition }}</view>
                                </view>
                                <view class="row-between coupon-info-wrap">
                                    <view class="info ml20">
                                        <view class="bold md mb10 line1">{{ item.name }}</view>
                                        <view class="xxs lighter mb10">{{ item.coupon_type }}</view>
                                        <view class="xxs lighter">{{ item.use_time_tips }}</view>
                                    </view>
                                    <checkbox v-if="couponTabsIndex === 0" :checked="couponId == item.id" class="mr20"></checkbox>
                                </view>
                            </view>
                            <view class="coupon-tips xs" v-if="item.tips">{{ item.tips }}</view>
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
import { orderBuy, getOrderCoupon, getDelivery } from '@/api/order'
import { getDefaultAddress } from '@/api/user'
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
            showCoupon: false,
            couponTabsIndex: 0,
            usableCoupon: [],
            unusableCoupon: [],
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
            if (!this.address.id && this.currentDelivery.sign === 'express') {
                return '填写地址后自动计算运费'
            }
            return `¥${this.orderInfo.shipping_price || '0.00'}`
        },
        discountAmount() {
            return Number(this.orderInfo.discount_amount || this.orderInfo.discountAmount || 0)
        },
        couponText() {
            if (this.discountAmount > 0) return `-¥${this.discountAmount.toFixed(2)}`
            if (this.selectedCoupon) return this.selectedCoupon.name || this.selectedCoupon.couponName || '已选择优惠券'
            if (this.usableCoupon.length) return `${this.usableCoupon.length}张可用`
            return '没有可用的优惠券'
        },
        selectedCoupon() {
            if (!this.couponId) return null
            return this.usableCoupon.find(item => String(item.id || item.coupon_id || item.couponId) === String(this.couponId)) || null
        },
        integralText() {
            const userIntegral = Number(this.orderInfo.user_integral || 0)
            if (this.useIntegral && this.pointsDeductAmount > 0) return `${this.pointsAmount || userIntegral}积分抵¥${this.pointsDeductAmount.toFixed(2)}`
            if (this.pointsDeductAmount > 0) return `${userIntegral}积分，可抵¥${this.pointsDeductAmount.toFixed(2)}`
            return `${userIntegral}积分`
        },
        pointsAmount() {
            return this.pickNumber(this.orderInfo, ['pointsAmount', 'points_amount', 'usedPoints', 'used_points', 'integralNum', 'integral_num', 'deductPoints', 'deduct_points', 'maxUsablePoints', 'max_usable_points'])
        },
        pointsDeductAmount() {
            return this.pickNumber(this.orderInfo, ['pointsDeductAmount', 'points_deduct_amount', 'integral_amount', 'integralAmount', 'integralDeductAmount', 'integral_deduct_amount', 'maxPointsDeductAmount', 'max_points_deduct_amount'])
        },
        currentCouponList() {
            return this.couponTabsIndex === 0 ? this.usableCoupon : this.unusableCoupon
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
                this.initCouponData()
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
            if (Number(this.orderInfo.integral_config) === 0) {
                return this.$toast({ title: '当前订单暂不支持积分抵扣' })
            }
            if (Number(this.orderInfo.integral_limit || 0) > Number(this.orderInfo.user_integral || 0)) {
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
            this.showCoupon = false
            this.handleOrderMethods('info')
        },
        toggleCoupon(id) {
            if (this.couponTabsIndex !== 0) return
            this.couponId = this.couponId == id ? '' : id
        },
        confirmCouponPopup() {
            this.showCoupon = false
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
        initCouponData() {
            if (!this.goods.length) return
            getOrderCoupon({ goods: this.goods })
                .then(({ code, data, msg }) => {
                    if (code != 1) throw new Error(msg)
                    return data
                })
                .then((data) => {
                    this.usableCoupon = data.usable || []
                    this.unusableCoupon = data.unusable || []
                })
                .catch(() => {})
        },
        async initPageData(from) {
            this.showLoading = true
            try {
                const { code, data, msg } = this.teamId ? await teamBuy(from) : await orderBuy(from)
                if (code != 1) throw new Error(msg)
                const responseAddress = data.address || {}
                this.address = responseAddress.id ? responseAddress : (this.address && this.address.id ? this.address : {})
                if (this.address.id) this.addressId = this.address.id
                if (!this.address.id && this.currentDelivery.sign === 'express') {
                    await this.loadDefaultAddress()
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
        async handleOrderSubmit(from) {
            this.showLoading = true
            from.remark = this.userRemark
            from.type = this.type
            from.payWay = 'WECHAT_JSAPI'
            from.payMethod = 'WECHAT_JSAPI'
            try {
                const { code, data, msg } = this.teamId ? await teamBuy(from) : await orderBuy(from)
                if (code != 1) throw new Error(msg)
                uni.redirectTo({ url: `/bundle/pages/payment/payment?from=${data.type}&order_id=${data.order_id}&pay_way=WECHAT_JSAPI&payWay=WECHAT_JSAPI` })
            } catch (err) {
                this.$toast({ title: '下单异常，请重新操作' })
            } finally {
                this.showLoading = false
            }
        },
        syncDiscountData(data = {}) {
            const usableCoupon = data.usable || data.usableCoupon || data.usable_coupon || []
            const unusableCoupon = data.unusable || data.unusableCoupon || data.unusable_coupon || []
            if (Array.isArray(usableCoupon)) this.usableCoupon = usableCoupon
            if (Array.isArray(unusableCoupon)) this.unusableCoupon = unusableCoupon
            if (data.coupon_id || data.couponId) this.couponId = data.coupon_id || data.couponId
            if (this.couponId && !this.usableCoupon.some(item => String(item.id || item.coupon_id || item.couponId) === String(this.couponId))) this.couponId = ''
        },
        ensureDefaultCoupon() {
            if (Number(this.orderInfo.order_type || 0) !== 0) return false
            if (this.couponId || !this.usableCoupon.length) return false
            const firstCoupon = this.usableCoupon[0]
            const id = firstCoupon.id || firstCoupon.coupon_id || firstCoupon.couponId
            if (!id) return false
            this.couponId = id
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
                orderInfo: this.orderInfo,
                pointsDeductAmount: this.useIntegral ? this.pointsDeductAmount : 0,
                pointsAmount: this.useIntegral ? this.pointsAmount : 0,
                address_id: this.addressId,
                address: this.address && this.address.id ? this.address : undefined,
                coupon_id: this.couponId,
                bargain_launch_id: this.bargainLaunchId == -1 ? '' : this.bargainLaunchId
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
            if (action === 'info') this.initPageData(orderFrom)
            if (action === 'submit') this.handleOrderSubmit(orderFrom)
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
    min-height: 96rpx;
    padding: 14rpx 24rpx;
    background: #ffebd8;
    box-sizing: border-box;
}

/* #ifdef MP-WEIXIN */
.tips-row {
    padding-right: 220rpx;
}
/* #endif */

.tips-icon {
    flex: none;
    width: 68rpx;
    height: 68rpx;
}

.tips-text {
    margin-left: 14rpx;
    font-size: 24rpx;
    line-height: 28rpx;
    color: #f1790e;
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

.summary-row--coupon {
    background: linear-gradient(90deg, rgba(255, 246, 241, 0.9) 0%, #ffffff 52%);
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

.integral-check {
    margin-left: 18rpx;
    transform: scale(0.72);
}

.points-settle-tip {
    display: flex;
    align-items: flex-start;
    margin: 19rpx 0 0;
    padding: 22rpx 24rpx;
    border: 1rpx solid #d9eaff;
    border-radius: 15rpx;
    background: linear-gradient(135deg, #f2f8ff 0%, #ffffff 100%);
    box-shadow: 0 10rpx 24rpx rgba(3, 125, 250, 0.08);
    box-sizing: border-box;
}

.points-settle-tip__icon {
    flex: none;
    width: 30rpx;
    height: 30rpx;
    margin-top: 2rpx;
    border-radius: 50%;
    background: #037dfa;
    font-size: 22rpx;
    font-weight: 600;
    line-height: 30rpx;
    text-align: center;
    color: #ffffff;
}

.points-settle-tip__text {
    flex: 1;
    margin-left: 12rpx;
    font-size: 23rpx;
    line-height: 34rpx;
    color: #4d6580;
}

.points-settle-tip__text text {
    display: block;
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
    width: 200rpx;
}

.coupon-info-wrap {
    flex: 1;
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
