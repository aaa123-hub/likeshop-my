<template>
    <view class="my-page">
        <image class="my-page__page-bg" :src="designAssets.myPageBg" mode="scaleToFill"></image>
        <view class="my-page__screen">
            <image class="my-page__header-bg" :src="designAssets.myHeaderBg" mode="scaleToFill"></image>
            <image class="my-page__status" :src="designAssets.myStatusBar" mode="aspectFit"></image>

            <view class="my-page__top">
                <view class="my-page__title">我的</view>
                <image class="my-page__menu" :src="designAssets.myMenuCapsule" mode="aspectFit"></image>
            </view>

            <view class="my-page__profile">
                <image
                    class="my-page__avatar"
                    @tap="goLogin"
                    :src="isLogin ? userInfo.avatar : designAssets.myAvatarDefault"
                    mode="aspectFill"
                ></image>
                <view class="my-page__profile-text">
                    <view class="my-page__nickname">{{ isLogin ? userInfo.nickname : '点击登录' }}</view>
                    <view class="my-page__member-id" v-if="isLogin && userInfo.sn">ID（邀请码）：{{ userInfo.sn }}</view>
                    <view class="my-page__member-id" v-else>登录体验更多功能</view>
                </view>
                <image
                    class="my-page__setting"
                    :src="designAssets.mySetting"
                    mode="aspectFit"
                    @tap="goPage('/bundle/pages/user_profile/user_profile')"
                ></image>
            </view>

            <view class="my-page__merchant" @tap="openFree(businessRoutes.pages.license)">
                <image class="my-page__merchant-bg" :src="designAssets.myMerchantBg" mode="scaleToFill"></image>
                <view class="my-page__merchant-content">
                    <view class="my-page__merchant-title">我是商家</view>
                    <view class="my-page__merchant-action">
                        <text>{{ userInfo.next_level_tips || '立即开通' }}</text>
                        <image class="my-page__merchant-arrow" :src="designAssets.myMerchantArrow" mode="aspectFit"></image>
                    </view>
                </view>
            </view>

            <view class="my-page__asset-panel">
                <view class="my-page__gift-card" @tap="goPage(businessRoutes.pages.wallet.url)">
                    <image class="my-page__card-bg my-page__card-bg--gift" :src="designAssets.myGiftCard" mode="scaleToFill"></image>
                    <view class="my-page__card-name my-page__card-name--gift">我的礼品卡</view>
                    <view class="my-page__card-number my-page__card-number--gift">{{ userInfo.coupon || 0 }}张</view>
                </view>
                <view class="my-page__asset-right">
                    <view class="my-page__asset-item my-page__asset-item--points" @tap="goPage('/bundle/pages/user_sign/user_sign')">
                        <image class="my-page__card-bg my-page__card-bg--asset" :src="designAssets.myPointsCard" mode="scaleToFill"></image>
                        <view class="my-page__card-name my-page__card-name--points">我的积分</view>
                        <view class="my-page__card-number my-page__card-number--points">{{ userInfo.user_integral || 0 }}</view>
                    </view>
                    <view class="my-page__asset-item my-page__asset-item--coupon" @tap="goPage('/pages/user_coupon/user_coupon')">
                        <image class="my-page__card-bg my-page__card-bg--asset" :src="designAssets.myCouponCard" mode="scaleToFill"></image>
                        <view class="my-page__card-name my-page__card-name--coupon">我的优惠券</view>
                        <view class="my-page__card-number my-page__card-number--coupon">{{ userInfo.coupon || 0 }}张</view>
                    </view>
                </view>
            </view>

            <image class="my-page__strategy" :src="designAssets.myStrategyBanner" mode="scaleToFill" @tap="goPage(businessRoutes.pages.pageIndex.url)"></image>

            <view class="my-section my-section--online">
                <view class="my-section__head">
                    <text class="my-section__title">线上订单</text>
                    <view class="my-section__more" @tap="goPage('/pages/user_order/user_order')">
                        <text>全部</text>
                        <image class="my-section__more-icon" :src="designAssets.myArrowCircle" mode="aspectFit"></image>
                    </view>
                </view>
                <view class="my-order-grid">
                    <view class="my-order-item" v-for="item in onlineOrderEntries" :key="item.name" @tap="openEntry(item)">
                        <view class="my-order-icon-wrap">
                            <image class="my-order-icon" :src="item.image" mode="aspectFit"></image>
                            <view v-if="item.badge" class="my-order-badge">{{ item.badge }}</view>
                        </view>
                        <view class="my-order-text">{{ item.name }}</view>
                    </view>
                </view>
            </view>

            <view class="my-section my-section--pair my-section--pair-1">
                <view class="my-section__head my-section__head--plain">
                    <text class="my-section__title">线下订单</text>
                </view>
                <view class="my-pair-grid">
                    <view class="my-pair-item" v-for="item in offlineOrderEntries" :key="item.name" @tap="openEntry(item)">
                        <image class="my-pair-icon" :src="item.image" mode="aspectFit"></image>
                        <view class="my-pair-text">{{ item.name }}</view>
                    </view>
                </view>
            </view>

            <view class="my-section my-section--pair my-section--pair-2">
                <view class="my-section__head my-section__head--plain">
                    <text class="my-section__title">我的联盟订单</text>
                </view>
                <view class="my-pair-grid">
                    <view class="my-pair-item" v-for="item in allianceEntries" :key="item.name" @tap="openEntry(item)">
                        <image class="my-pair-icon" :src="item.image" mode="aspectFit"></image>
                        <view class="my-pair-text">{{ item.name }}</view>
                    </view>
                </view>
            </view>

            <view class="my-section my-section--value">
                <view class="my-section__head my-section__head--plain">
                    <text class="my-section__title">我的消费增值</text>
                </view>
                <view class="my-value-grid">
                    <view class="my-value-item" v-for="item in valueEntries" :key="item.name" @tap="openEntry(item)">
                        <image class="my-value-icon" :src="item.image" mode="aspectFit"></image>
                        <view class="my-value-text">{{ item.name }}</view>
                    </view>
                </view>
            </view>

            <view class="my-section my-section--feature">
                <view class="my-section__head my-section__head--plain">
                    <text class="my-section__title">其他功能</text>
                </view>
                <view class="my-feature-grid">
                    <view class="my-feature-item" v-for="item in featureEntries" :key="item.name" @tap="openEntry(item)">
                        <image class="my-feature-icon" :src="item.image" mode="aspectFit"></image>
                        <view class="my-feature-text">{{ item.name }}</view>
                    </view>
                </view>
            </view>
        </view>

        <view class="my-page__tab-spacer"></view>
    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getMenu } from '@/api/store'
import { toLogin } from '@/utils/login'
import { menuJump, copy, setTabbar } from '@/utils/tools'
import Cache from '@/utils/cache'
import { businessRoutes, openBusinessRoute } from '@/utils/business-routes'
import { designAssets } from '@/utils/design-assets'

export default {
    data() {
        return {
            menuList: [],
            businessRoutes,
            designAssets
        }
    },
    onLoad() {
        setTabbar()
        this.getMenuFun()
    },
    onShow() {
        this.getUser()
        this.getCartNum()
    },
    onPullDownRefresh() {
        this.getUser().then(() => {
            uni.stopPullDownRefresh()
        })
        this.getMenuFun()
    },
    onShareAppMessage() {
        const shareInfo = Cache.get('shareInfo')
        return {
            title: shareInfo.mnp_share_title,
            path: 'pages/index/index?invite_code=' + this.inviteCode,
            imageUrl: shareInfo.mnp_share_image
        }
    },
    methods: {
        ...mapActions(['getCartNum', 'getUser']),
        goLogin() {
            if (this.isLogin) {
                uni.navigateTo({ url: '/bundle/pages/user_set/user_set' })
                return
            }
            toLogin()
        },
        goPage(url) {
            if (!this.isLogin) return toLogin()
            uni.navigateTo({ url })
        },
        openFree(item) {
            openBusinessRoute(item)
        },
        tapMenu(item) {
            if (!this.isLogin) return toLogin()
            menuJump(item)
        },
        openEntry(item) {
            if (!this.isLogin) return toLogin()
            openBusinessRoute(item)
        },
        async getMenuFun() {
            const { data, code } = await getMenu({ type: 2 })
            if (code == 1) {
                this.menuList = data
            }
        },
        onCopy() {
            copy(this.userInfo.sn)
        }
    },
    computed: {
        ...mapGetters(['cartNum', 'userInfo', 'inviteCode', 'appConfig']),
        onlineOrderEntries() {
            return [
                { name: '待付款', url: '/pages/user_order/user_order?type=pay', image: designAssets.myOrderPay, badge: this.userInfo.wait_pay },
                { name: '待发货', url: '/pages/user_order/user_order?type=delivery', image: designAssets.myOrderShip, badge: this.userInfo.wait_delivery },
                { name: '待收货/核销', url: '/pages/user_order/user_order?type=delivery', image: designAssets.myOrderReceive, badge: this.userInfo.wait_take },
                { name: '待取积分', url: '/bundle/pages/goods_comment_list/goods_comment_list', image: designAssets.myOrderPoints, badge: this.userInfo.wait_comment },
                { name: '售后', url: '/bundle/pages/post_sale/post_sale', image: designAssets.myOrderAfterSale, badge: this.userInfo.after_sale }
            ]
        },
        offlineOrderEntries() {
            return [
                { name: '现场付款', url: '/bundle/pages/business_pages/face_pay', image: designAssets.myOfflinePay },
                { name: '付款记录', url: '/bundle/pages/business_pages/payment_record', image: designAssets.myPaymentRecord }
            ]
        },
        allianceEntries() {
            return [
                { name: '联盟码', url: '/bundle/pages/business_pages/intro_card', image: designAssets.myAllianceCode },
                { name: '订单记录', url: '/pages/user_order/user_order', image: designAssets.myAllianceRecord }
            ]
        },
        valueEntries() {
            return [
                { name: '待领取\n线上订单', url: '/pages/user_order/user_order', image: designAssets.myValueOnline },
                { name: '待领取\n线下订单', url: '/bundle/pages/business_pages/face_pay', image: designAssets.myValueOffline },
                { name: '联盟订单', url: '/pages/street/street', image: designAssets.myValueAlliance, openType: 'switchTab' },
                { name: '领取积分\n设置', url: '/bundle/pages/business_pages/auto_points', image: designAssets.myValueSetting }
            ]
        },
        featureEntries() {
            return [
                { name: 'KYC', url: businessRoutes.pages.userKyc.url, image: designAssets.myKyc },
                { name: '收货地址', url: businessRoutes.pages.addressList.url, image: designAssets.myAddress },
                { name: '反馈意见', url: businessRoutes.pages.feedback.url, image: designAssets.myFeedback },
                { name: '生态应用', url: businessRoutes.pages.ecoApp.url, image: designAssets.myEcology },
                { name: '关于我们', url: businessRoutes.pages.aboutUs.url, image: designAssets.myAbout },
                { name: '平台客服', url: businessRoutes.pages.myService.url, image: designAssets.myService }
            ]
        }
    }
}
</script>

<style lang="scss">
.my-page {
    position: relative;
    min-height: 100vh;
    background: #f4f6ff;
    overflow: hidden;
}

.my-page__page-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 750rpx;
    height: 2565rpx;
}

.my-page__screen {
    position: relative;
    width: 750rpx;
    height: 2565rpx;
    overflow: hidden;
}

.my-page__header-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 750rpx;
    height: 574rpx;
}

.my-page__status {
    position: absolute;
    left: 30rpx;
    top: 40rpx;
    width: 690rpx;
    height: 26rpx;
}

.my-page__top {
    position: absolute;
    left: 25rpx;
    top: 105rpx;
    width: 669rpx;
    height: 58rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.my-page__title {
    color: rgba(34, 34, 34, 1);
    font-size: 36rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 24rpx;
}

.my-page__menu {
    width: 159rpx;
    height: 58rpx;
}

.my-page__profile {
    position: absolute;
    left: 36rpx;
    top: 186rpx;
    width: 680rpx;
    height: 142rpx;
    display: flex;
    align-items: center;
}

.my-page__avatar {
    width: 142rpx;
    height: 142rpx;
    flex: none;
}

.my-page__profile-text {
    width: 265rpx;
    margin-left: 33rpx;
}

.my-page__nickname {
    color: rgba(34, 34, 34, 1);
    font-size: 34rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-page__member-id {
    margin-top: 23rpx;
    color: rgba(102, 102, 102, 1);
    font-size: 24rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-page__setting {
    width: 37rpx;
    height: 42rpx;
    margin-left: 203rpx;
    flex: none;
}

.my-page__merchant {
    position: absolute;
    left: 47rpx;
    top: 381rpx;
    width: 656rpx;
    height: 157rpx;
}

.my-page__merchant-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 656rpx;
    height: 157rpx;
}

.my-page__merchant-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 31rpx 34rpx 0 31rpx;
}

.my-page__merchant-title {
    color: rgba(178, 113, 53, 1);
    font-size: 30rpx;
    font-family: AlimamaShuHeiTi-Bold, PingFangSC-Regular, sans-serif;
    font-weight: 700;
    line-height: 30rpx;
    white-space: nowrap;
}

.my-page__merchant-action {
    display: flex;
    align-items: center;
    color: rgba(178, 113, 53, 1);
    font-size: 24rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-page__merchant-arrow {
    width: 14rpx;
    height: 24rpx;
    margin-left: 20rpx;
}

.my-page__asset-panel {
    position: absolute;
    left: 26rpx;
    top: 477rpx;
    width: 698rpx;
    height: 349rpx;
    background: rgba(255, 255, 255, 1);
    border-radius: 15rpx;
}

.my-page__gift-card {
    position: absolute;
    left: 22rpx;
    top: 50rpx;
    width: 311rpx;
    height: 269rpx;
    overflow: hidden;
}

.my-page__card-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
}

.my-page__card-bg--gift {
    width: 311rpx;
    height: 269rpx;
}

.my-page__card-bg--asset {
    width: 311rpx;
    height: 123rpx;
}

.my-page__card-name {
    position: absolute;
    z-index: 1;
    font-size: 24rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-page__card-name--gift {
    left: 27rpx;
    top: 31rpx;
    color: rgba(208, 50, 1, 1);
}

.my-page__card-name--points {
    left: 22rpx;
    top: 25rpx;
    color: rgba(1, 59, 208, 1);
}

.my-page__card-name--coupon {
    left: 26rpx;
    top: 25rpx;
    color: rgba(54, 1, 208, 1);
}

.my-page__card-number {
    position: absolute;
    z-index: 1;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-size: 35rpx;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-page__card-number--gift {
    left: 28rpx;
    top: 74rpx;
    color: rgba(208, 50, 1, 1);
}

.my-page__card-number--points {
    left: 27rpx;
    top: 62rpx;
    color: rgba(35, 1, 208, 1);
}

.my-page__card-number--coupon {
    left: 27rpx;
    top: 62rpx;
    color: rgba(54, 1, 208, 1);
}

.my-page__asset-right {
    position: absolute;
    left: 355rpx;
    top: 50rpx;
    width: 311rpx;
    height: 269rpx;
}

.my-page__asset-item {
    position: relative;
    width: 311rpx;
    height: 123rpx;
    overflow: hidden;
}

.my-page__asset-item + .my-page__asset-item {
    margin-top: 23rpx;
}

.my-page__strategy {
    position: absolute;
    left: 26rpx;
    top: 862rpx;
    width: 698rpx;
    height: 135rpx;
}

.my-section {
    position: absolute;
    left: 26rpx;
    width: 698rpx;
    background: rgba(255, 255, 255, 1);
    border-radius: 15rpx;
}

.my-section--online {
    top: 1023rpx;
    height: 213rpx;
}

.my-section--pair {
    height: 213rpx;
}

.my-section--pair-1 {
    top: 1257rpx;
}

.my-section--pair-2 {
    top: 1491rpx;
}

.my-section--value {
    top: 1725rpx;
    height: 237rpx;
}

.my-section--feature {
    top: 1984rpx;
    height: 322rpx;
}

.my-section__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 27rpx 28rpx 0;
}

.my-section__head--plain {
    padding: 27rpx 28rpx 0;
}

.my-section__title {
    color: rgba(34, 34, 34, 1);
    font-size: 28rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-section__more {
    display: flex;
    align-items: center;
    color: rgba(34, 34, 34, 1);
    font-size: 24rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-section__more-icon {
    width: 23rpx;
    height: 23rpx;
    margin-left: 10rpx;
}

.my-order-grid {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 41rpx 32rpx 0 32rpx;
}

.my-order-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 82rpx;
}

.my-order-icon-wrap {
    position: relative;
    width: 47rpx;
    height: 42rpx;
}

.my-order-icon {
    width: 47rpx;
    height: 42rpx;
}

.my-order-badge {
    position: absolute;
    left: 33rpx;
    top: -10rpx;
    min-width: 28rpx;
    height: 28rpx;
    padding: 0 6rpx;
    border: 1rpx solid rgba(3, 125, 250, 1);
    border-radius: 28rpx;
    color: rgba(3, 125, 250, 1);
    font-size: 22rpx;
    line-height: 28rpx;
    text-align: center;
    background: #ffffff;
    box-sizing: border-box;
}

.my-order-text {
    margin-top: 19rpx;
    color: rgba(34, 34, 34, 1);
    font-size: 22rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 22rpx;
    text-align: center;
    white-space: nowrap;
}

.my-pair-grid {
    display: flex;
    align-items: center;
    padding: 41rpx 32rpx 0;
}

.my-pair-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 87rpx;
    flex: none;
}

.my-pair-item + .my-pair-item {
    margin-left: 64rpx;
}

.my-pair-icon {
    width: 40rpx;
    height: 40rpx;
}

.my-pair-text {
    margin-top: 18rpx;
    color: rgba(34, 34, 34, 1);
    font-size: 22rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 22rpx;
    text-align: center;
    white-space: nowrap;
}

.my-value-grid {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 42rpx 41rpx 0;
}

.my-value-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 87rpx;
}

.my-value-icon {
    width: 42rpx;
    height: 42rpx;
}

.my-value-text {
    margin-top: 15rpx;
    color: rgba(34, 34, 34, 1);
    font-size: 22rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 29rpx;
    text-align: center;
    white-space: pre-wrap;
}

.my-feature-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    padding: 42rpx 41rpx 0;
}

.my-feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 87rpx;
    margin-bottom: 32rpx;
}

.my-feature-icon {
    width: 39rpx;
    height: 39rpx;
}

.my-feature-text {
    margin-top: 17rpx;
    color: rgba(34, 34, 34, 1);
    font-size: 22rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 22rpx;
    text-align: center;
    white-space: nowrap;
}

.my-page__tab-spacer {
    position: absolute;
    left: 0;
    top: 2412rpx;
    width: 750rpx;
    height: 153rpx;
    box-shadow: 0px -3px 16px 0px rgba(224, 224, 224, 0.67);
    background-color: rgba(255, 255, 255, 1);
    border-radius: 21rpx;
}
</style>
