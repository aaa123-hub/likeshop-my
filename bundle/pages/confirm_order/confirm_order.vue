<!--
// +---------------------------------------------------------------------- // | likeshop开源商城系统
// +---------------------------------------------------------------------- // |
欢迎阅读学习系统程序代码，建议反馈是我们前进的动力 // | gitee下载：https://gitee.com/likeshop_gitee
// | github下载：https://github.com/likeshop-github // | 访问官网：https://www.likeshop.cn // |
访问社区：https://home.likeshop.cn // | 访问手册：http://doc.likeshop.cn // |
微信公众号：likeshop技术社区 // |
likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识 // |
likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识 // |
禁止对系统程序代码以任何目的，任何形式的再发布 // | likeshop团队版权所有并拥有最终解释权 //
+---------------------------------------------------------------------- // | author:
likeshop.cn.team // +----------------------------------------------------------------------

-->
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
                        <view class="shop-logo"></view>
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
                            :src="item.image_str || item.image"
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
                    <view class="summary-row" v-if="orderInfo.order_type == 0" @tap="showCoupon = true">
                        <text>优惠券</text>
                        <view class="row-value">
                            <text :class="orderInfo.discount_amount ? 'red-value' : 'muted-value'">{{ couponText }}</text>
                            <image class="small-arrow" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png" mode="scaleToFill"></image>
                        </view>
                    </view>
                    <template v-if="orderInfo.integral_switch">
                        <view class="divider"></view>
                        <view class="summary-row" @tap="changeIntegral">
                            <text>总积分</text>
                            <view class="row-value">
                                <text class="orange-value">{{ orderInfo.user_integral || 0 }}</text>
                                <checkbox
                                    class="integral-check"
                                    :disabled="
                                        orderInfo.user_integral < orderInfo.integral_limit ||
                                        orderInfo.integral_config == 0
                                    "
                                    :checked="Boolean(useIntegral)"
                                ></checkbox>
                            </view>
                        </view>
                    </template>
                </view>

                <view class="pay-section">
                    <view class="section-title-row">
                        <view class="title-mark"></view>
                        <text>选择付款方式</text>
                    </view>
                    <view class="pay-card">
                        <view class="pay-item" :class="{ active: payWay === 'WECHAT_JSAPI' }" @tap="selectPayWay('WECHAT_JSAPI')">
                            <image
                                class="pay-icon"
                                src="https://shengyuan.store/api/miniapp/files/miniapp/2d6eda26285643b8aada027e1d657532/34f5d621b59abc567bcabd522381293f.png"
                                mode="scaleToFill"
                            ></image>
                            <text>微信支付</text>
                            <view class="pay-radio"></view>
                        </view>
                        <view class="divider"></view>
                        <view class="pay-item" :class="{ active: payWay === 'BALANCE' }" @tap="selectPayWay('BALANCE')">
                            <image
                                class="pay-icon bank"
                                src="https://shengyuan.store/api/miniapp/files/miniapp/094ba7e82c9843c6996af9fe0ac4ff41/bf1f6b760680089957df01cc0be7ea9e.png"
                                mode="scaleToFill"
                            ></image>
                            <text>余额支付</text>
                            <view class="pay-radio"></view>
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
                <tabs :active="couponTabsIndex" :config="{ underLineWidth: 100 }">
                    <tab :title="'可使用优惠券 (' + usableCoupon.length + ')'">
                        <coupon-obj
                            :list="usableCoupon"
                            :type="0"
                            @change="onSelectCoupon"
                            :coupon-id="couponId"
                        ></coupon-obj>
                    </tab>
                    <tab :title="'不可用优惠券 (' + unusableCoupon.length + ')'">
                        <coupon-obj
                            :list="unusableCoupon"
                            :type="1"
                            @change="onSelectCoupon"
                        ></coupon-obj>
                    </tab>
                </tabs>
            </view>
        </u-popup>
    </view>
</template>

<script>
import UPopup from '@/bundle/components/uview-ui/components/u-popup/u-popup.vue'
import { orderBuy, getOrderCoupon, getDelivery } from '@/api/order'
import { teamBuy } from '@/api/activity'
import { prepay, getMnpNotice, getPayway } from '@/api/app'
import { wxpay, alipay } from '@/utils/pay'
import PriceFormat from '@/bundle/components/price-format/price-format.vue'

export default {
	components: {
			PriceFormat,
			UPopup
		},
    data() {
        return {
            isFirstLoading: true, // 首次页面加载loading
            showLoading: false, // Loading: 显示 | 隐藏
            address: {}, // 收货地址信息
            orderInfo: {}, // 订单信息
            goodsLists: [], // 商品列表
            addressId: '', // 收货地址ID
            useIntegral: 0, // 使用积分
            userRemark: '', // 用户留言
            userConsignee: '', // 取货人
            userMobile: '', // 联系电话

            storeInfo: {}, // 门店信息

            couponId: '', // 优惠券ID
            showCoupon: false, // 显示优惠券Popup
            couponTabsIndex: 0, // 优惠券Tabs索引
            usableCoupon: [], // 优惠券--可使用
            unusableCoupon: [], // 优惠券--不可用
            payWay: 'WECHAT_JSAPI',

            bargainLaunchId: -1,

            addressTabsIndex: 0, // 地址Tabs索引
            // 地址Tabs列表
            addressTabsList: [
                {
                    id: 1,
                    sign: 'express',
                    name: '快递配送'
                },
                {
                    id: 2,
                    sign: 'store',
                    name: '门店自提'
                }
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
        freightText() {
            if (!this.address.id && this.currentDelivery.sign === 'express') {
                return '填写地址后自动算运费'
            }
            return `¥${this.orderInfo.shipping_price || '0.00'}`
        },
        couponText() {
            if (this.orderInfo.discount_amount) return `-¥${this.orderInfo.discount_amount}`
            if (this.usableCoupon.length) return `${this.usableCoupon.length}张可用`
            return '没有可用的优惠券'
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
            // 请求结果判断
            .then(({ code, data, msg }) => {
                if (code != 1) throw new Error(msg)
                return data
            })
            // 配送方式Tabs处理
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
            // 页面数据初始化
            .then(() => {
                this.handleOrderMethods('info')
                this.initCouponData()
            })
            // 监听全局事件
            .then(() => {
                uni.$on('selectaddress', (params) => {
                    this.addressId = params.id
                    this.handleOrderMethods('info')
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
                    this.storeInfo = params
                })
            })
            .catch(() => {})
    },

    onUnload() {
        // 取消全局监听
        uni.$off(['selectaddress', 'store'])
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

        // 更改配送方式
        changeDelivery(index) {
            this.addressTabsIndex = index
            this.handleOrderMethods('info')
        },

        // 点击选择收货地址
        onAddressExpress() {
            uni.navigateTo({
                url: `/bundle/pages/user_address/user_address?type=${1}`
            })
        },

        // 点击门店自提
        onAddressStore() {
            uni.navigateTo({
                url: `/bundle_misc/pages/store_list/store_list`
            })
        },

        // 更改积分使用
        changeIntegral() {
            const useIntegral = this.useIntegral

            const orderInfo = this.orderInfo
            const integral_limit = orderInfo.integral_limit
            const user_integral = orderInfo.user_integral

            if (integral_limit > user_integral) return this.$toast({ title: '未满足使用条件' })

            this.useIntegral = useIntegral ? 0 : 1
            this.$nextTick(() => this.handleOrderMethods('info'))
        },

        // 积分使用说明Dialog
        dialogIntegralDesc() {
            const desc = this.orderInfo.integral_desc

            uni.showModal({
                title: '积分使用说明',
                content: desc,
                confirmColor: '#FF2C3C',
                showCancel: false
            })
        },

        // 选择优惠券
        onSelectCoupon(value) {
            this.couponId = value
            this.showCoupon = false
            this.handleOrderMethods('info')
        },

        // 获取微信授权
        authWechatMessage() {
            return new Promise((resolve, reject) => {
                getMnpNotice({
                    scene: 1
                })
                    .then(({ code, data, msg }) => {
                        if (code != 1) throw new Error(msg)
                        return data
                    })
                    .then((data) => {
                        if (!data.length) return reject()
                        uni.requestSubscribeMessage({
                            tmplIds: data,
                            success(res) {
                                resolve(res)
                            },
                            fail(err) {
                                reject(err)
                            }
                        })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },

        // 点击订单提交
        onSubmitOrder() {
            uni.showModal({
                title: '温馨提示',
                content: '是否确认下单?',
                confirmColor: '#FF2C3C',
                success: ({ confirm }) => {
                    if (!confirm) return

                    // #ifdef MP-WEIXIN
                    this.authWechatMessage()
                        .catch(() => {})
                        .finally(() => {
                            this.handleOrderMethods('submit')
                        })
                    // #endif

                    // #ifndef MP-WEIXIN
                    this.handleOrderMethods('submit')
                    // #endif
                }
            })
        },

        selectPayWay(value) {
            this.payWay = value
        },

        // 初始化优惠券数据
        initCouponData() {
            if (!this.goods.length) return
            getOrderCoupon({
                goods: this.goods
            })
                .then(({ code, data, msg }) => {
                    if (code != 1) throw new Error(msg)
                    return data
                })
                .then((data) => {
                    this.usableCoupon = data.usable
                    this.unusableCoupon = data.unusable
                })
                .catch(() => {})
        },

        // 初始化页面数据
        async initPageData(from) {
            this.showLoading = true

            try {
                const { code, data, msg } = this.teamId ? await teamBuy(from) : await orderBuy(from)

                if (code == 1) {
                    this.address = data.address
                    this.goodsLists = data.goods_lists
                    //TODO
                    if (data.selffetch_info) {
                        const selffetchInfo = data.selffetch_info || {}
                        this.storeInfo = selffetchInfo.selffetch_shop || {}
                        this.userConsignee = selffetchInfo.contact || ''
                        this.userMobile = selffetchInfo.mobile || ''
                    }

                    this.orderInfo = data
                    this.$nextTick(() => {
                        this.isFirstLoading = false
                    })
                } else {
                    throw new Error(msg)
                }
            } catch (err) {
                this.isFirstLoading = false
                this.$toast({ title: '网络异常，请重新进入页面' })
            } finally {
                this.showLoading = false
            }
        },

        // 订单提交
        async handleOrderSubmit(from) {
            this.showLoading = true

            from.remark = this.userRemark
            from.type = this.type
            from.payWay = this.payWay
            from.payMethod = this.payWay

            try {
                const { code, data, msg } = this.teamId ? await teamBuy(from) : await orderBuy(from)

                if (code == 1) {
                    uni.redirectTo({
                        url: `/bundle/pages/payment/payment?from=${data.type}&order_id=${data.order_id}`
                    })
                } else {
                    throw new Error(msg)
                }
            } catch (err) {
                this.$toast({ title: '下单异常，请重新操作' })
            } finally {
                this.showLoading = false
            }
        },

        // 订单处理
        handleOrderMethods(action) {
            if (!this.goods.length) {
                this.isFirstLoading = false
                this.showLoading = false
                return this.$toast({ title: '商品参数异常，请重新选择商品' })
            }
            // 订单提交数据
            const orderFrom = {
                action,
                goods: this.goods,
                delivery_type: this.delivery,
                use_integral: this.useIntegral,
                address_id: this.addressId,
                coupon_id: this.couponId,
                bargain_launch_id: this.bargainLaunchId == -1 ? '' : this.bargainLaunchId
            }

            // 门店自提
            if (this.currentDelivery.sign === 'store') {
                orderFrom.selffetch_shop_id = this.storeInfo.id
                orderFrom.consignee = this.userConsignee
                orderFrom.mobile = this.userMobile
            }

            // 拼团
            if (this.teamId) {
                const goods = this.goods[0]

                delete orderFrom.goods

                orderFrom.item_id = goods.item_id
                orderFrom.goods_num = goods.num
                orderFrom.team_id = this.teamId
                orderFrom.found_id = this.foundId
            }

            switch (action) {
                case 'info':
                    this.initPageData(orderFrom)
                    break
                case 'submit':
                    this.handleOrderSubmit(orderFrom)
                    break
            }
        }
    }
}
</script>
<style lang="scss">
page {
    min-height: 100%;
    background: #f5f5f5;
}

.confirm-order-page,
.confirm-order {
    min-height: 100vh;
    background: #f5f5f5;
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
    height: calc(100vh - var(--status-bar-height) - 160rpx - 154rpx - env(safe-area-inset-bottom));
    height: calc(100dvh - var(--status-bar-height) - 160rpx - 154rpx - env(safe-area-inset-bottom));
    padding: 0 24rpx 32rpx;
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
    color: #222222;
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

.pay-radio {
    width: 37rpx;
    height: 37rpx;
    margin-left: auto;
    border: 3rpx solid #d6d6d6;
    border-radius: 50%;
    background: #ffffff;
    box-sizing: border-box;
}

.pay-item.active .pay-radio {
    border: 10rpx solid #037dfa;
}

.footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    align-items: center;
    height: 112rpx;
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
</style>
