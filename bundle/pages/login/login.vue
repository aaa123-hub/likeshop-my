<template>
    <view class="company-login">
        <image class="company-login__bg" :src="designAssets.homeHeroBg" mode="aspectFill"></image>
        <view class="company-login__shade"></view>

        <view class="company-login__nav">
            <view class="company-login__back" @tap="goBack" v-if="canBack"></view>
            <view class="company-login__nav-title">登录</view>
        </view>

        <view class="company-login__content">
            <view class="company-login__brand">
                <view class="company-login__logo">
                    <image :src="designAssets.myTabUser" mode="aspectFit"></image>
                </view>
                <view class="company-login__title">商街生活</view>
                <view class="company-login__subtitle">登录后体验商城、商街与会员服务</view>
            </view>

            <view class="company-login__panel">
                <view class="company-login__user-card">
                    <view class="company-login__avatar">
                        <image :src="designAssets.myAvatarDefault" mode="aspectFill"></image>
                    </view>
                    <view class="company-login__user-info">
                        <view class="company-login__user-name">微信用户</view>
                        <view class="company-login__user-code">使用微信授权登录</view>
                    </view>
                </view>

                <view class="company-login__agree" @tap="changeChecked">
                    <view class="company-login__checkbox" :class="{ 'is-checked': isAgree }">
                        <text v-if="isAgree">✓</text>
                    </view>
                    <view class="company-login__agreement-text">
                        已阅读并同意
                        <view
                            class="company-login__link"
                            @tap.stop="openAgreement(0)"
                        >
                            《服务协议》
                        </view>
                        和
                        <view
                            class="company-login__link"
                            @tap.stop="openAgreement(1)"
                        >
                            《隐私政策》
                        </view>
                    </view>
                </view>

                <button
                    class="company-login__button"
                    :class="{ 'is-loading': loginLoading }"
                    hover-class="company-login__button--hover"
                    :loading="loginLoading"
                    @tap="mnpLoginFun"
                >
                    一键登录
                </button>
            </view>
        </view>

        <u-modal
            :value="showModel"
            show-cancel-button
            :show-title="false"
            @confirm="handleAgreementModalConfirm"
            @cancel="showModel = false"
            confirm-color="#FF4D3D"
        >
            <view class="company-login__modal">
                <view>请先阅读并同意</view>
                <view class="company-login__modal-links">
                    <view
                        class="company-login__link"
                        @tap.stop="openAgreement(0)"
                    >
                        《服务协议》
                    </view>
                    和
                    <view
                        class="company-login__link"
                        @tap.stop="openAgreement(1)"
                    >
                        《隐私政策》
                    </view>
                </view>
                <view class="company-login__modal-tip">{{ agreementReadTip }}</view>
            </view>
        </u-modal>
    </view>
</template>

<script>
import UModal from '@/bundle/components/uview-ui/components/u-modal/u-modal.vue'
import { mapMutations, mapGetters } from 'vuex'
import { authLogin } from '@/api/app'
import { inputInviteCode } from '@/api/user'
import { currentPage } from '@/utils/tools'
import { getWxCode } from '@/utils/login'
import Cache from '@/utils/cache'
import { BACK_URL } from '@/config/cachekey'
import { designAssets } from '@/utils/design-assets'

const LOGIN_AGREEMENT_READ_PREFIX = 'LOGIN_AGREEMENT_READ_'

export default {
	components: {
			UModal
		},
    data() {
        return {
            isAgree: false,
            showModel: false,
            loginLoading: false,
            agreementReadState: {
                service: false,
                privacy: false
            },
            designAssets
        }
    },
    computed: {
        ...mapGetters(['isLogin']),
        canBack() {
            const pages = getCurrentPages()
            return pages.length > 1
        },
        hasReadAllAgreements() {
            return Boolean(this.agreementReadState.service && this.agreementReadState.privacy)
        },
        agreementReadTip() {
            if (this.hasReadAllAgreements) return '已阅读完成，可勾选后继续登录。'
            const unread = []
            if (!this.agreementReadState.service) unread.push('服务协议')
            if (!this.agreementReadState.privacy) unread.push('隐私政策')
            return `请先阅读完${unread.join('和')}，滑动至页面底部后再返回勾选。`
        }
    },
    onLoad() {
        if (this.isLogin) {
            uni.switchTab({
                url: '/pages/index/index'
            })
        }
        this.refreshAgreementReadState()
    },
    onShow() {
        this.refreshAgreementReadState()
    },
    methods: {
        ...mapMutations(['LOGIN']),
        goBack() {
            uni.navigateBack()
        },
        refreshAgreementReadState() {
            let service = false
            let privacy = false
            try {
                service = Boolean(uni.getStorageSync(`${LOGIN_AGREEMENT_READ_PREFIX}0`))
                privacy = Boolean(uni.getStorageSync(`${LOGIN_AGREEMENT_READ_PREFIX}1`))
            } catch (error) {}
            this.agreementReadState = { service, privacy }
            if (!this.hasReadAllAgreements) this.isAgree = false
        },
        openAgreement(type) {
            this.showModel = false
            uni.navigateTo({
                url: `/bundle_user/pages/server_explan/server_explan?type=${type}`
            })
        },
        changeChecked() {
            this.refreshAgreementReadState()
            if (!this.hasReadAllAgreements) {
                this.isAgree = false
                this.showModel = true
                return
            }
            this.isAgree = !this.isAgree
        },
        handleAgreementModalConfirm() {
            this.showModel = false
            if (this.hasReadAllAgreements) {
                this.isAgree = true
                return
            }
            this.openAgreement(this.agreementReadState.service ? 1 : 0)
        },
        async mnpLoginFun() {
            if (this.loginLoading) return
            this.refreshAgreementReadState()
            if (!this.hasReadAllAgreements || !this.isAgree) {
                this.isAgree = false
                this.showModel = true
                return
            }

            this.loginLoading = true
            uni.showLoading({
                title: '登录中...',
                mask: true
            })

            try {
                const loginPayload = await this.buildLoginPayload()
                const { code, data, msg } = await authLogin(loginPayload)
                if (code == 1 && data && data.token) {
                    await this.loginHandle(data)
                } else {
                    this.$toast({
                        title: msg || '登录失败，请稍后重试'
                    })
                }
            } catch (error) {
                this.$toast({
                    title: error && error.message === 'wx.login timeout'
                        ? '微信登录凭证获取失败，请重试'
                        : '登录失败，请检查接口服务'
                })
            } finally {
                this.loginLoading = false
                uni.hideLoading()
            }
        },
        async buildLoginPayload() {
            // #ifdef MP-WEIXIN
            const loginCode = await this.getLoginCodeWithTimeout()
            return {
                jsCode: loginCode,
                loginCode,
                channelCode: 'wechat-miniapp'
            }
            // #endif

            // #ifndef MP-WEIXIN
            const loginCode = `h5-dev-${Date.now()}`
            return {
                jsCode: loginCode,
                loginCode,
                channelCode: 'wechat-miniapp'
            }
            // #endif
        },
        getLoginCodeWithTimeout() {
            return Promise.race([
                getWxCode(),
                new Promise((resolve, reject) => {
                    setTimeout(() => reject(new Error('wx.login timeout')), 5000)
                })
            ])
        },
        async loginHandle(data) {
            this.LOGIN(data)
            const inviteCode = Cache.get('INVITE_CODE')
            if (inviteCode) {
                Cache.remove('INVITE_CODE')
                const invitePayload = typeof inviteCode === 'object' ? inviteCode : { code: inviteCode }
                inputInviteCode(invitePayload)
            }

            // #ifdef H5
            location.replace('/mobile' + (Cache.get(BACK_URL) || '/'))
            Cache.remove(BACK_URL)
            // #endif

            // #ifndef H5
            if (this.canBack) {
                uni.navigateBack({
                    success() {
                        const { onLoad, options } = currentPage()
                        onLoad && onLoad(options)
                    }
                })
            } else {
                uni.switchTab({
                    url: '/pages/index/index'
                })
            }
            // #endif
        }
    }
}
</script>

<style lang="scss">
page {
    background: #f7f8fb;
}

.company-login {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    color: #1d2433;
}

.company-login__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 470rpx;
}

.company-login__shade {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 560rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, #f7f8fb 88%);
}

.company-login__nav {
    position: relative;
    z-index: 2;
    height: 96rpx;
    padding: var(--status-bar-height) 32rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: content-box;
}

.company-login__back {
    position: absolute;
    left: 28rpx;
    bottom: 12rpx;
    width: 64rpx;
    height: 64rpx;
    color: #1d2433;
}

.company-login__back::after {
    content: '';
    position: absolute;
    left: 20rpx;
    top: 18rpx;
    width: 22rpx;
    height: 22rpx;
    border-left: 4rpx solid currentColor;
    border-bottom: 4rpx solid currentColor;
    transform: rotate(45deg);
}

.company-login__nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1d2433;
}

.company-login__content {
    position: relative;
    z-index: 1;
    padding: 92rpx 38rpx 54rpx;
}

.company-login__brand {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.company-login__logo {
    width: 132rpx;
    height: 132rpx;
    border-radius: 38rpx;
    background: linear-gradient(135deg, #ff7a45 0%, #ff4d3d 52%, #2f6bff 100%);
    box-shadow: 0 18rpx 40rpx rgba(255, 91, 61, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.company-login__logo image {
    width: 74rpx;
    height: 74rpx;
}

.company-login__title {
    margin-top: 32rpx;
    font-size: 48rpx;
    line-height: 58rpx;
    font-weight: 700;
    color: #1b2232;
}

.company-login__subtitle {
    margin-top: 12rpx;
    font-size: 26rpx;
    line-height: 36rpx;
    color: #697386;
}

.company-login__panel {
    margin-top: 70rpx;
    padding: 34rpx 30rpx 36rpx;
    background: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 24rpx 60rpx rgba(31, 41, 55, 0.08);
}

.company-login__user-card {
    min-height: 142rpx;
    padding: 26rpx;
    border-radius: 22rpx;
    background: #f4f7ff;
    display: flex;
    align-items: center;
}

.company-login__avatar {
    width: 90rpx;
    height: 90rpx;
    border-radius: 50%;
    overflow: hidden;
    background: #ffffff;
}

.company-login__avatar image {
    width: 100%;
    height: 100%;
}

.company-login__user-info {
    margin-left: 22rpx;
}

.company-login__user-name {
    font-size: 30rpx;
    line-height: 42rpx;
    font-weight: 600;
    color: #1d2433;
}

.company-login__user-code {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #7b8496;
}

.company-login__agree {
    margin-top: 34rpx;
    display: flex;
    align-items: flex-start;
}

.company-login__checkbox {
    flex: 0 0 auto;
    width: 32rpx;
    height: 32rpx;
    margin-top: 2rpx;
    border-radius: 50%;
    border: 2rpx solid #c6ccd8;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    color: #ffffff;
    font-size: 22rpx;
    line-height: 1;
}

.company-login__checkbox.is-checked {
    border-color: #ff4d3d;
    background: #ff4d3d;
}

.company-login__agreement-text {
    margin-left: 12rpx;
    flex: 1;
    font-size: 24rpx;
    line-height: 36rpx;
    color: #6b7280;
}

.company-login__link {
    display: inline-flex;
    color: #ff4d3d;
    font-weight: 600;
}

.company-login__button {
    margin-top: 38rpx;
    width: 100%;
    height: 96rpx;
    border-radius: 48rpx;
    background: linear-gradient(90deg, #ff7a45 0%, #ff4d3d 100%);
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 96rpx;
    box-shadow: 0 18rpx 36rpx rgba(255, 77, 61, 0.26);
}

.company-login__button::after {
    border: none;
}

.company-login__button--hover {
    opacity: 0.9;
}

.company-login__button.is-loading {
    opacity: 0.8;
}

.company-login__modal {
    padding: 56rpx 0 62rpx;
    text-align: center;
    font-size: 30rpx;
    color: #1d2433;
}

.company-login__modal-links {
    margin-top: 20rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 26rpx;
    color: #697386;
}

.company-login__modal-tip {
    margin-top: 14rpx;
    padding: 0 28rpx;
    color: #8a94a6;
    font-size: 24rpx;
    line-height: 36rpx;
}
</style>
