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
                <view class="address-row">
                    <image
                        class="address-icon"
                        src="https://shengyuan.store/api/miniapp/files/miniapp/24b1ebea2beb495f912d142e2edc47d5/0146a8e36079dd8f8d2ac6992908ca91.png"
                        mode="scaleToFill"
                    ></image>
                    <text class="address-text">下单前请填写收货地址</text>
                    <image
                        class="arrow-icon"
                        src="https://shengyuan.store/api/miniapp/files/miniapp/06daad93a2434b5da9b424ba2a6dbf16/028c746e2b6db5e5ace971faf762da45.png"
                        mode="scaleToFill"
                    ></image>
                </view>
                <view class="divider"></view>
                <view class="shop-row">
                    <view class="shop-logo"></view>
                    <text class="shop-name">{{ order.shopName || order.shop_name || '店铺信息' }}</text>
                </view>
                <view class="divider"></view>
                <view class="goods-row">
                    <view class="goods-image"></view>
                    <view class="goods-info">
                        <text class="goods-name">{{ order.goodsName || order.goods_name || '商品信息' }}</text>
                        <text class="goods-spec">{{ order.spec || order.spec_value_str || '' }}</text>
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
                    <text class="muted-text">填写地址后自动算运费</text>
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
                    <text class="muted-text">填写地址后自动算运费</text>
                </view>
                <view class="divider"></view>
                <view class="summary-row">
                    <text>优惠券</text>
                    <view class="coupon-value">
                        <text class="muted-text">没有可用的优惠券</text>
                        <image
                            class="small-arrow"
                            src="https://shengyuan.store/api/miniapp/files/miniapp/3849158480cd4923b9cc5b2b70851070/ae74a0c5306c3522ddc47cca96392384.png"
                            mode="scaleToFill"
                        ></image>
                    </view>
                </view>
                <view class="divider"></view>
                <view class="summary-row points-row">
                    <text>总积分</text>
                    <view class="points-value">
                        <text class="points-num">{{ order.points || 0 }}</text>
                        <text class="points-unit">积分</text>
                    </view>
                </view>
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
                <text class="total-main">{{ order.totalMain || '0' }}</text>
                <text class="total-decimal">{{ order.totalDecimal || '.00' }}</text>
            </view>
            <view class="pay-button">立即支付</view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            order: null,
            isNotchScreen: false
        }
    },
    onLoad() {
        this.setScreenSafeState()
    },
    methods: {
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
    height: 91rpx;
    padding: 0 31rpx 0 27rpx;
}

.address-icon {
    width: 25rpx;
    height: 29rpx;
}

.address-text {
    margin-left: 17rpx;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 26rpx;
}

.arrow-icon,
.small-arrow {
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
}

.coupon-value .small-arrow {
    margin-left: 17rpx;
}

.points-row {
    min-height: 108rpx;
    border-radius: 0 0 15rpx 15rpx;
    background: linear-gradient(90deg, #ffffff 0%, #fff8f1 100%);
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
</style>
