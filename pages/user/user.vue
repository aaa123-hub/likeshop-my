<template>
    <view class="my-page">
        <image class="my-page__page-bg" :src="designAssets.myPageBg" mode="scaleToFill"></image>
        <view class="my-page__screen">
            <view class="my-page__top">
                <view class="my-page__title">我的</view>
            </view>

            <view class="my-page__profile">
                <image
                    class="my-page__avatar"
                    @tap="goLogin"
                    :src="isLogin ? resolveAvatar(userInfo.avatar) : designAssets.myAvatarDefault"
                    mode="aspectFill"
                ></image>
                <view class="my-page__profile-text" @tap="goLogin">
                    <view :class="['my-page__nickname', isLogin && !displayNickname ? 'my-page__nickname--empty' : '']">{{ displayNickname || (isLogin ? '暂未设置用户名' : '点击登录') }}</view>
                    <view class="my-page__member-id" v-if="isLogin && userInfo.sn">ID（邀请码）：{{ userInfo.sn }}</view>
                    <view class="my-page__member-id my-page__member-id--hint" v-else>{{ isLogin ? '完善昵称后，好友更容易识别你' : '登录体验更多功能' }}</view>
                </view>
                <image
                    class="my-page__setting"
                    :src="designAssets.mySetting"
                    mode="aspectFit"
                    @tap="goPage('/bundle_user/pages/user_profile/user_profile')"
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

            <image class="my-page__strategy" :src="designAssets.myStrategyBanner" mode="scaleToFill" @tap="goPage(businessRoutes.pages.mallGuide.url)"></image>

            <view class="my-section my-section--online">
                <view class="my-section__head">
                    <text class="my-section__title">线上订单</text>
                    <view class="my-section__more" @tap="goPage('/bundle_order/pages/user_order/user_order')">
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

        <view v-if="showServiceModal" class="service-modal">
            <view class="service-modal__mask" @tap="closeServiceModal"></view>
            <view class="service-sheet">
                <image class="service-sheet__bg" src="https://shengyuan.store/api/miniapp/files/miniapp/7f2a2e10cdc84ef0a400da7bde38e665/service-dialog-bg.png" mode="scaleToFill"></image>
                <view class="service-sheet__head">
                    <view class="service-sheet__title">平台客服</view>
                    <image class="service-sheet__hero" :src="serviceHeroImage" mode="aspectFit"></image>
                </view>
                <view
                    v-for="item in serviceContacts"
                    :key="item.type"
                    class="service-contact"
                >
                    <image class="service-contact__icon" :src="item.icon" mode="aspectFit"></image>
                    <view class="service-contact__info">
                        <view class="service-contact__name">{{ item.type }}</view>
                        <view class="service-contact__value">{{ item.value }}</view>
                    </view>
                    <view class="service-contact__btn" @tap="contactService(item)">联系</view>
                </view>
                <view class="service-sheet__cancel" @tap="closeServiceModal">取消</view>
            </view>
        </view>

    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { toLogin } from '@/utils/login'
import { copy, setTabbar } from '@/utils/tools'
import Cache from '@/utils/cache'
import { businessRoutes, openBusinessRoute } from '@/utils/business-routes'
import { designAssets } from '@/utils/design-assets'
import { resolveImage } from '@/utils/image-placeholder'
import { getService } from '@/api/app'

export default {
    data() {
        return {
            businessRoutes,
            designAssets,
            showServiceModal: false,
			serviceHeroImage: 'https://shengyuan.store/api/miniapp/files/miniapp/732689fee36e4d7a9cfc4e2ba2c178b6/service-hero.png',
            serviceContacts: [
                { type: '微信', value: '', icon: 'https://shengyuan.store/api/miniapp/files/miniapp/c4f6d65e2af84cdc96cbd0a164610364/contact-phone-icon.png' },
                { type: 'QQ', value: '', icon: 'https://shengyuan.store/api/miniapp/files/miniapp/f3a751f36ea442378ed3b18f916ce872/contact-message-icon.png' },
                { type: '手机号', value: '', icon: 'https://shengyuan.store/api/miniapp/files/miniapp/ad78cb6626b94083b5b4690cd5d7bc91/contact-email-icon.png' }
            ]
        }
    },
    onLoad() {
        setTabbar()
        this.getServiceInfo()
    },
    onShow() {
        this.getUser()
        this.getCartNum()
    },
    onPullDownRefresh() {
        this.getUser().then(() => {
            uni.stopPullDownRefresh()
        })
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
        resolveAvatar(avatar) {
            return resolveImage(avatar, 'avatar')
        },
        goLogin() {
            if (this.isLogin) {
                uni.navigateTo({ url: '/bundle_user/pages/user_set/user_set' })
                return
            }
            toLogin()
        },
        goPage(target) {
            if (!this.isLogin) return toLogin()
            const route = typeof target === 'string' ? { url: target } : target
            if (!route?.url) return
            if (route.openType === 'switchTab') {
                uni.switchTab({ url: route.url })
                return
            }
            uni.navigateTo({ url: route.url })
        },
        openFree(item) {
            openBusinessRoute(item)
        },
        openEntry(item) {
            if (!this.isLogin) return toLogin()
            if (item.action === 'service') {
                this.openServiceModal()
                return
            }
            openBusinessRoute(item)
        },
        openServiceModal() {
            this.showServiceModal = true
        },
        closeServiceModal() {
            this.showServiceModal = false
        },
        getServiceInfo() {
            getService().then(res => {
                if (res.code != 1) return
                const data = res.data || {}
                this.serviceContacts = [
                    { ...this.serviceContacts[0], value: data.wechat || '' },
                    { ...this.serviceContacts[1], value: data.qq || '' },
                    { ...this.serviceContacts[2], value: data.phone || '' }
                ]
            })
        },
        contactService(item) {
            if (!item.value) {
                uni.showToast({ title: '客服信息暂未配置', icon: 'none' })
                return
            }
            if (item.type === '手机号') {
                uni.makePhoneCall({ phoneNumber: item.value.replace(/\s/g, '') })
                return
            }
            copy(item.value)
        },
        onCopy() {
            copy(this.userInfo.sn)
        }
    },
    computed: {
        ...mapGetters(['cartNum', 'userInfo', 'inviteCode', 'appConfig']),
        onlineOrderEntries() {
            return [
                { name: '待付款', url: '/bundle_order/pages/user_order/user_order?type=pay', image: designAssets.myOrderPay, badge: this.userInfo.wait_pay },
                { name: '待发货', url: '/bundle_order/pages/user_order/user_order?type=ship', image: designAssets.myOrderShip, badge: this.userInfo.wait_delivery },
                { name: '待收货/核销', url: '/bundle_order/pages/user_order/user_order?type=delivery', image: designAssets.myOrderReceive, badge: this.userInfo.wait_take },
                { name: '待取积分', url: '/bundle_order/pages/user_order/user_order?points=1', image: designAssets.myOrderPoints, badge: this.userInfo.wait_comment },
                { name: '售后', url: '/bundle_order/pages/post_sale/post_sale', image: designAssets.myOrderAfterSale, badge: this.userInfo.after_sale }
            ]
        },
        offlineOrderEntries() {
            return [
                { name: '现场付款', url: '/business/pages/business_pages/face_pay', image: designAssets.myOfflinePay },
                { name: '付款记录', url: '/business/pages/business_pages/payment_record', image: designAssets.myPaymentRecord }
            ]
        },
        allianceEntries() {
            return [
                { name: '联盟码', url: '/business/pages/business_pages/intro_card', image: designAssets.myAllianceCode },
                { name: '订单记录', url: '/bundle_order/pages/user_order/user_order', image: designAssets.myAllianceRecord }
            ]
        },
        valueEntries() {
            return [
                { name: `我的积分\n${this.userInfo.user_integral || 0}`, url: '/bundle_misc/pages/user_sign/user_sign', image: designAssets.myOrderPoints },
                { name: '待领取\n线上订单', url: '/bundle_order/pages/user_order/user_order?points=1', image: designAssets.myValueOnline },
                { name: '待领取\n线下订单', url: '/business/pages/business_pages/face_pay', image: designAssets.myValueOffline },
                { name: '联盟订单', url: '/pages/street/street', image: designAssets.myValueAlliance, openType: 'switchTab' },
                { name: '领取积分\n设置', url: businessRoutes.pages.autoPoints.url, image: designAssets.myOrderPoints }
            ]
        },
        featureEntries() {
            return [
                { name: 'KYC', url: businessRoutes.pages.userKyc.url, image: designAssets.myKyc },
                { name: '收货地址', url: businessRoutes.pages.addressList.url, image: designAssets.myAddress },
                { name: '反馈意见', url: businessRoutes.pages.feedback.url, image: designAssets.myFeedback },
                { name: '生态应用', url: businessRoutes.pages.ecoApp.url, image: designAssets.myEcology },
                { name: '关于我们', url: businessRoutes.pages.aboutUs.url, image: designAssets.myAbout },
                { name: '平台客服', action: 'service', image: designAssets.myService }
            ]
        },
        displayNickname() {
            const nickname = this.userInfo.nickname || this.userInfo.username || this.userInfo.mobile || ''
            return String(nickname).trim()
        }
    }
}
</script>

<style lang="scss">
.my-page {
    --page-safe-top: var(--status-bar-height, 44rpx);
    position: relative;
    min-height: 100vh;
    padding-bottom: calc(40rpx + var(--window-bottom));
    background: #f4f6ff;
    overflow-x: hidden;
}

.my-page__page-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}

.my-page__screen {
    position: relative;
    width: 100%;
    min-height: calc(1918rpx + var(--page-safe-top));
    overflow: visible;
}

.my-page__header-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 574rpx;
}

.my-page__status {
    position: absolute;
    left: 30rpx;
    top: var(--page-safe-top);
    width: 690rpx;
    height: 26rpx;
}

.my-page__top {
    position: absolute;
    left: 25rpx;
    right: 31rpx;
    top: calc(var(--page-safe-top) + 28rpx);
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

.my-page__profile {
    position: absolute;
    left: 36rpx;
    right: 34rpx;
    top: calc(var(--page-safe-top) + 104rpx);
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
    flex: 1;
    min-width: 0;
    margin-left: 33rpx;
}

.my-page__nickname {
    color: rgba(34, 34, 34, 1);
    font-size: 34rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 44rpx;
    min-height: 44rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.my-page__nickname--empty {
    color: #999999;
    font-weight: 400;
}

.my-page__member-id {
    margin-top: 11rpx;
    color: rgba(102, 102, 102, 1);
    font-size: 24rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 34rpx;
    min-height: 34rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.my-page__member-id--hint {
    color: #037dfa;
}

.service-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 120;
}

.service-modal__mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.55);
}

.service-sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 704rpx;
    padding: 9rpx 30rpx calc(55rpx + env(safe-area-inset-bottom));
    background: none url('https://shengyuan.store/api/miniapp/files/miniapp/7f2a2e10cdc84ef0a400da7bde38e665/service-dialog-bg.png') no-repeat center top;
    background-size: 100% 100%;
    border-radius: 32rpx 32rpx 0 0;
    box-sizing: border-box;
}

.service-sheet__bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    border-radius: 32rpx 32rpx 0 0;
}

.service-sheet__head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    height: 157rpx;
}

.service-sheet__title {
    margin-top: 44rpx;
    color: #222222;
    font-size: 38rpx;
    font-weight: 700;
    line-height: 42rpx;
    white-space: nowrap;
}

.service-sheet__hero {
    width: 170rpx;
    height: 157rpx;
}

.service-sheet__message {
    position: absolute;
    right: 130rpx;
    top: 22rpx;
    width: 58rpx;
    height: 58rpx;
}

.service-contact {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    height: 72rpx;
    margin-top: 58rpx;
}

.service-contact:first-of-type {
    margin-top: 38rpx;
}

.service-contact__icon {
    flex: none;
    width: 72rpx;
    height: 72rpx;
}

.service-contact__info {
    flex: 1;
    min-width: 0;
    margin-left: 25rpx;
}

.service-contact__name {
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 32rpx;
    white-space: nowrap;
}

.service-contact__value {
    margin-top: 20rpx;
    color: #999999;
    font-size: 28rpx;
    line-height: 32rpx;
    white-space: nowrap;
}

.service-contact__value:empty::after {
    content: '暂未配置';
    color: #999999;
}

.service-contact__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 153rpx;
    height: 54rpx;
    color: #ffffff;
    font-size: 23rpx;
    font-weight: 600;
    line-height: 26rpx;
    background: #037dfa;
    border-radius: 27rpx;
    white-space: nowrap;
}

.service-sheet__cancel {
    position: relative;
    z-index: 1;
    margin-top: 84rpx;
    color: #666666;
    font-size: 29rpx;
    font-weight: 600;
    line-height: 34rpx;
    text-align: center;
    white-space: nowrap;
}

.my-page__setting {
    width: 37rpx;
    height: 42rpx;
    margin-left: 24rpx;
    flex: none;
}

.my-page__merchant {
    position: absolute;
    left: 47rpx;
    right: 47rpx;
    top: calc(var(--page-safe-top) + 299rpx);
    height: 157rpx;
}

.my-page__merchant-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
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

.my-page__strategy {
    position: absolute;
    left: 26rpx;
    right: 26rpx;
    top: calc(var(--page-safe-top) + 395rpx);
    height: 184rpx;
    border-radius: 24rpx;
    box-shadow: 0 16rpx 38rpx rgba(31, 122, 244, 0.12);
    width: auto;
}

.my-section {
    position: absolute;
    left: 26rpx;
    right: 26rpx;
    background: rgba(255, 255, 255, 0.97);
    border-radius: 24rpx;
    box-shadow: 0 12rpx 30rpx rgba(28, 45, 90, 0.06);
}

.my-section--online {
    top: calc(var(--page-safe-top) + 611rpx);
    min-height: 213rpx;
    padding-bottom: 28rpx;
    box-sizing: border-box;
}

.my-section--pair {
    height: 213rpx;
}

.my-section--pair-1 {
    top: calc(var(--page-safe-top) + 845rpx);
}

.my-section--pair-2 {
    top: calc(var(--page-safe-top) + 1079rpx);
}

.my-section--value {
    top: calc(var(--page-safe-top) + 1313rpx);
    min-height: 237rpx;
    padding-bottom: 28rpx;
    box-sizing: border-box;
}

.my-section--feature {
    top: calc(var(--page-safe-top) + 1572rpx);
    min-height: 322rpx;
    padding-bottom: 28rpx;
    box-sizing: border-box;
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
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 41rpx 20rpx 0;
}

.my-order-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    margin-bottom: 28rpx;
    box-sizing: border-box;
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
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 42rpx 20rpx 0;
}

.my-value-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    margin-bottom: 28rpx;
    box-sizing: border-box;
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
    width: 100%;
    white-space: pre-wrap;
    overflow: hidden;
}

.my-feature-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 42rpx 20rpx 0;
}

.my-feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    margin-bottom: 32rpx;
    box-sizing: border-box;
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
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>
