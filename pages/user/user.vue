<template>
    <view :class="['my-page', {
        'my-page--guest': !isLogin,
        'my-page--no-offline': !isMerchantApproved,
        'my-page--no-promotion': !showPromotionSection
    }]">
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
                    <view :class="['my-page__nickname', isLogin && !displayNickname ? 'my-page__nickname--empty' : '']">{{ displayNickname || (isLogin ? '昵称待完善' : '点击登录') }}</view>
                    <view class="my-page__member-id" v-if="isLogin && userInfo.sn">ID（邀请码）：{{ userInfo.sn }}</view>
                    <view class="my-page__member-id my-page__member-id--hint" v-else>{{ isLogin ? '完善昵称后，好友更容易识别你' : '登录体验更多功能' }}</view>
                    <view v-if="isLogin" class="my-page__identity-row">
                        <view
                            v-for="item in displayRoleBadges"
                            :key="item.code"
                            :class="['my-page__identity-pill', 'my-page__role-badge--' + item.code.toLowerCase()]"
                        >{{ item.label }}</view>
                    </view>
                    <view v-if="isLogin && pendingRoleBadges.length" class="my-page__role-badges">
                        <view
                            v-for="item in pendingRoleBadges"
                            :key="item.code"
                            :class="['my-page__role-badge', 'my-page__role-badge--' + item.code.toLowerCase()]"
                        >{{ item.label }}</view>
                    </view>
                    <view v-if="needsWechatProfile" class="my-page__profile-tip" @tap.stop="goLogin">完善微信资料</view>
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
                    <view class="my-page__merchant-title">我是实体商家</view>
                    <view class="my-page__merchant-action">
                        <text>{{ userInfo.next_level_tips || '立即开通' }}</text>
                        <image class="my-page__merchant-arrow" :src="designAssets.myMerchantArrow" mode="aspectFit"></image>
                    </view>
                </view>
            </view>

            <image class="my-page__strategy" :src="designAssets.myStrategyBanner" mode="scaleToFill" @tap="goPage(businessRoutes.pages.mallGuide.url)"></image>

            <view class="my-page__assets">
                <view class="my-page__asset-card my-page__asset-card--coupon" @tap="goPage('/bundle_user/pages/user_coupon/user_coupon')">
                    <view class="my-page__asset-title">我的优惠券</view>
                    <view class="my-page__asset-value">{{ couponCountText }}</view>
                </view>
                <view class="my-page__asset-card my-page__asset-card--points" @tap="goPage('/bundle_misc/pages/user_sign/user_sign')">
                    <view class="my-page__asset-title">我的积分</view>
                    <view class="my-page__asset-value">{{ userIntegralText }}</view>
                </view>
            </view>

            <view class="my-section my-section--online">
                <view class="my-section__head">
                    <text class="my-section__title">我的订单</text>
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

            <view class="my-section my-section--pair my-section--pair-1" v-if="isMerchantApproved">
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

            <view class="my-section my-section--pair my-section--pair-2" v-if="showPromotionSection">
                <view class="my-section__head my-section__head--plain">
                    <text class="my-section__title">我的推广</text>
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
                        <view class="my-value-icon-wrap">
                            <image class="my-value-icon" :src="item.image" mode="aspectFit"></image>
                            <view v-if="item.badge" class="my-value-badge">{{ item.badge }}</view>
                        </view>
                        <view class="my-value-text">{{ item.name }}</view>
                    </view>
                </view>
            </view>

            <view class="my-section my-section--feature">
                <view class="my-section__head my-section__head--plain">
                    <text class="my-section__title">其它功能</text>
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
                <view class="service-qrcode-card">
                    <image class="service-qrcode" :src="serviceQrCode" mode="aspectFit" @tap="previewServiceQr"></image>
                    <view class="service-qrcode__title">扫码联系平台客服</view>
                    <view class="service-qrcode__desc">长按或点击放大二维码，按页面提示添加客服处理问题</view>
                </view>
                <view class="service-sheet__cancel" @tap="closeServiceModal">取消</view>
            </view>
        </view>

        <view v-if="promotionModalVisible" class="promotion-modal">
            <view class="promotion-modal__mask" @tap="closePromotionCode"></view>
            <view class="promotion-sheet">
                <view class="promotion-sheet__head">
                    <view>
                        <view class="promotion-sheet__title">{{ promotionRoleLabel }}推广码</view>
                        <view class="promotion-sheet__subtitle">{{ promotionInviteCode || '正在生成推广码' }}</view>
                    </view>
                    <view class="promotion-sheet__close" @tap="closePromotionCode">×</view>
                </view>
                <view class="promotion-code-box">
                    <image v-if="promotionQrImage" class="promotion-code-image" :src="promotionQrImage" mode="aspectFit" @tap="previewPromotionQr"></image>
                    <view v-else-if="promotionQrText" class="promotion-code-fallback" @tap="copyPromotionCode">
                        <view class="promotion-code-fallback__label">推广码</view>
                        <view class="promotion-code-fallback__value">{{ promotionInviteCode || '待生成' }}</view>
                        <view class="promotion-code-fallback__hint">点击复制后分享给粉丝绑定</view>
                    </view>
                    <view v-else class="promotion-code-empty">{{ promotionLoading ? '加载中...' : (promotionError || '暂无推广码') }}</view>
                </view>
                <view class="promotion-code-tip">粉丝扫码后登录注册，系统会自动绑定到当前角色名下。</view>
                <view class="promotion-code-actions">
                    <button class="promotion-code-btn" open-type="share">分享</button>
                    <button class="promotion-code-btn promotion-code-btn--primary" @tap="copyPromotionCode">复制推广码</button>
                </view>
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
import { getMerchantQualificationStatus, getPromotionInviteCode, getRoleApplications, getRoles, inputInviteCode } from '@/api/user'
import { getShareMnQrcode } from '@/api/app'

const SERVICE_QR_CODE = 'https://shengyuan.store/api/miniapp/files/miniapp/d748a229d2504aaeac129746548bc086/11.png'

export default {
    data() {
        return {
            businessRoutes,
            designAssets,
            showServiceModal: false,
			roleApplications: [],
            roleList: [],
            merchantQualification: {},
            serviceHeroImage: 'https://shengyuan.store/api/miniapp/files/miniapp/732689fee36e4d7a9cfc4e2ba2c178b6/service-hero.png',
            serviceQrCode: SERVICE_QR_CODE,
            promotionModalVisible: false,
            promotionLoading: false,
            promotionInfo: {},
            promotionError: ''
        }
    },
    onLoad() {
        setTabbar()
    },
    onShow() {
        this.getUser().then(() => this.getRoleInfo())
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
        openRoleWorkbench(roleCode) {
            const code = this.normalizeRoleCode(roleCode || this.primaryPromotionRoleCode || 'PROMOTER')
            uni.navigateTo({ url: `/business/pages/business_pages/role_workbench?roleCode=${encodeURIComponent(code)}` })
        },
        async openPromotionCode(roleCode) {
            const code = this.normalizeRoleCode(roleCode || this.primaryPromotionRoleCode || 'PROMOTER')
            this.promotionModalVisible = true
            this.promotionError = ''
            this.promotionInfo = {
                roleCode: code,
                roleName: this.roleLabel(code)
            }
            this.promotionLoading = true
            try {
                const res = await getPromotionInviteCode({ roleCode: code, show: false })
                if (res && res.code == 1) {
                    const data = res.data || {}
                    const inviteCode = data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.code || ''
                    const scene = data.scene || this.buildPromotionScene(code, inviteCode)
                    this.promotionInfo = {
                        ...this.promotionInfo,
                        ...data,
                        roleCode: code,
                        roleName: this.roleLabel(code),
                        inviteCode,
                        scene,
                        qrcodeUrl: this.resolvePromotionQrUrl(data.qrcodeUrl || data.qrcode_url || data.posterUrl || data.poster_url || ''),
                        qrText: data.qrText || data.qr_text || scene
                    }
                    await this.ensurePromotionQrImage()
                } else {
                    this.promotionError = (res && (res.msg || res.message)) || '推广码加载失败'
                }
            } catch (error) {
                this.promotionError = '推广码加载失败'
            } finally {
                this.promotionLoading = false
            }
        },
        buildPromotionScene(roleCode, inviteCode = '') {
            const userId = this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
            const params = [`uid_${userId}`, `role=${this.normalizeRoleCode(roleCode)}`]
            if (inviteCode) params.push(`invite_code=${inviteCode}`)
            return params.join('&')
        },
        async ensurePromotionQrImage() {
            if (this.promotionQrImage || !this.promotionInviteCode) return
            try {
                const res = await getShareMnQrcode({
                    path: 'pages/index/index',
                    pagePath: 'pages/index/index',
                    scene: this.promotionScene,
                    roleType: this.promotionRoleCode,
                    roleCode: this.promotionRoleCode,
                    userId: this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || '',
                    inviteCode: this.promotionInviteCode
                })
                const data = res.data || {}
                const image = data.posterUrl || data.poster_url || data.qrcodeUrl || data.qrcode_url || data.qrCode || data.qr_code || data.image || data.imageUrl || ''
                if (image) {
                    const resolvedImage = this.resolvePromotionQrUrl(image)
                    this.promotionInfo = { ...this.promotionInfo, qrcodeUrl: resolvedImage, posterUrl: resolvedImage }
                }
            } catch (error) {}
        },
        resolvePromotionQrUrl(image) {
            return image ? resolveImage(image, 'goods') : ''
        },
        closePromotionCode() {
            this.promotionModalVisible = false
        },
        previewPromotionQr() {
            if (!this.promotionQrImage) return
            uni.previewImage({
                urls: [this.promotionQrImage],
                current: this.promotionQrImage
            })
        },
        copyPromotionCode() {
            const value = this.promotionInviteCode || this.promotionScene
            if (!value) {
                uni.showToast({ title: '暂无可复制内容', icon: 'none' })
                return
            }
            uni.setClipboardData({
                data: value,
                success: () => uni.showToast({ title: '已复制', icon: 'success' })
            })
        },
        openFree(item) {
            openBusinessRoute(item)
        },
        openEntry(item) {
            if (!this.isLogin) return toLogin()
            if (item.action === 'promotionCode') {
                this.openPromotionCode(item.roleCode)
                return
            }
            if (item.action === 'roleWorkbench') {
                this.openRoleWorkbench(item.roleCode)
                return
            }
            if (item.action === 'scanFans') {
                this.scanFansCode()
                return
            }
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
        previewServiceQr() {
            uni.previewImage({
                urls: [this.serviceQrCode],
                current: this.serviceQrCode
            })
        },
        getRoleInfo() {
            if (!this.isLogin) {
                this.roleApplications = []
                this.roleList = []
                this.merchantQualification = {}
                return
            }
            Promise.all([
                getRoleApplications().catch(() => null),
                getRoles().catch(() => null),
                getMerchantQualificationStatus({ userId: this.userInfo.user_id || this.userInfo.userId || this.userInfo.id }).catch(() => null)
            ]).then(([applicationsRes, rolesRes, merchantRes]) => {
                if (applicationsRes && applicationsRes.code == 1) {
                    const data = applicationsRes.data || {}
                    this.roleApplications = data.applications || data.list || []
                }
                if (rolesRes && rolesRes.code == 1) {
                    const data = rolesRes.data || {}
                    this.roleList = data.roles || data.list || []
                }
                if (merchantRes && merchantRes.code == 1) {
                    this.merchantQualification = merchantRes.data || {}
                }
            })
        },
        roleLabel(roleCode) {
            const code = this.normalizeRoleCode(roleCode)
            const map = { HQ: '总部', HEADQUARTERS: '总部', SUBSIDIARY: '子公司', AGENT: '区域代理', OPERATION_CENTER: '区域代理', PROMOTER: '推广者', MERCHANT: '商家' }
            return map[code] || code || '普通用户'
        },
        normalizeRoleCode(roleCode) {
            const code = String(roleCode || '').toUpperCase()
            const map = { HEADQUARTERS: 'HQ', OPERATION_CENTER: 'AGENT', AREA_AGENT: 'AGENT', COUNTY_AGENT: 'AGENT', BRANCH: 'SUBSIDIARY', COMPANY_BRANCH: 'SUBSIDIARY' }
            return map[code] || code
        },
        roleStatusType(status) {
            const normalized = String(status || '').toUpperCase()
            if (['APPROVED', 'PASS', 'PASSED', 'SUCCESS'].includes(normalized)) return 'approved'
            if (['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING', 'PENDING'].includes(normalized)) return 'pending'
            if (['REJECTED', 'REJECT', 'FAILED'].includes(normalized)) return 'rejected'
            return 'default'
        },
        roleStatusLabel(status) {
            const type = this.roleStatusType(status)
            if (type === 'approved') return '已通过'
            if (type === 'pending') return '待审核'
            if (type === 'rejected') return '未通过'
            return '未申请'
        },
        scanFansCode() {
            uni.scanCode({
                onlyFromCamera: false,
                success: async (res) => {
                    const raw = res.result || res.path || ''
                    const payload = this.parseFansScanPayload(raw)
                    if (!payload.inviteCode && !payload.promoterUserId && !payload.ownerMerchantId && !payload.ownerUserId) {
                        uni.showToast({ title: '未识别到吸粉码', icon: 'none' })
                        return
                    }
                    const bindPayload = await this.buildFansBindPayload(payload)
                    const bindRes = await inputInviteCode(bindPayload).catch(() => null)
                    if (bindRes && bindRes.code == 1) {
                        uni.showToast({ title: bindRes.msg || '绑定成功', icon: 'success' })
                    } else {
                        uni.showToast({ title: (bindRes && (bindRes.msg || bindRes.message)) || '绑定失败', icon: 'none' })
                    }
                },
                fail: () => uni.showToast({ title: '扫码未完成', icon: 'none' })
            })
        },
        parseFansScanPayload(raw = '') {
            const text = String(raw || '').trim()
            const params = this.parseQueryParams(text.includes('?') ? text.split('?').pop() : text)
            const scene = params.scene ? decodeURIComponent(params.scene) : text
            const sceneParams = this.parseQueryParams(scene)
            const inviteCode = params.invite_code || params.inviteCode || params.allianceCode || params.alliance_code || params.promotionCode || params.promotion_code || params.code || sceneParams.invite_code || sceneParams.inviteCode || sceneParams.allianceCode || sceneParams.alliance_code || sceneParams.promotionCode || sceneParams.promotion_code || sceneParams.code || ''
            const ownerMerchantId = params.ownerMerchantId || params.owner_merchant_id || params.inviterMerchantId || params.inviter_merchant_id || params.targetMerchantId || params.target_merchant_id || params.merchantId || params.merchant_id || params.shopId || params.shop_id || params.storeId || params.store_id || sceneParams.ownerMerchantId || sceneParams.owner_merchant_id || sceneParams.inviterMerchantId || sceneParams.inviter_merchant_id || sceneParams.targetMerchantId || sceneParams.target_merchant_id || sceneParams.merchantId || sceneParams.merchant_id || sceneParams.shopId || sceneParams.shop_id || sceneParams.storeId || sceneParams.store_id || ''
            const ownerUserId = params.ownerUserId || params.owner_user_id || params.inviterUserId || params.inviter_user_id || params.promoterUserId || params.promoter_user_id || params.uid || sceneParams.ownerUserId || sceneParams.owner_user_id || sceneParams.inviterUserId || sceneParams.inviter_user_id || sceneParams.promoterUserId || sceneParams.promoter_user_id || sceneParams.uid || ''
            const fanScene = params.fanScene || params.fan_scene || params.sceneType || params.scene_type || sceneParams.fanScene || sceneParams.fan_scene || sceneParams.sceneType || sceneParams.scene_type || (ownerMerchantId ? 'STORE_QR' : 'INTRO_CARD')
            return {
                inviteCode,
                promoterUserId: ownerUserId,
                ownerUserId,
                roleCode: this.normalizeRoleCode(params.roleCode || params.role_code || params.role || sceneParams.roleCode || sceneParams.role_code || sceneParams.role || 'PROMOTER'),
                ownerMerchantId,
                fanScene,
                scene: scene || text,
                rawScene: text
            }
        },
        parseQueryParams(text = '') {
            const params = {}
            String(text || '').split(/[&]/).forEach((pair) => {
                const [key, value = ''] = pair.split('=')
                if (!key) return
                if (/^uid_\w+$/i.test(key)) {
                    params.uid = key.replace(/^uid_/i, '')
                    return
                }
                params[decodeURIComponent(key)] = decodeURIComponent(value)
            })
            return params
        },
        async buildFansBindPayload(payload = {}) {
            const merchantId = this.currentMerchantId
            const userId = this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
            const inviteCode = payload.inviteCode || await this.resolveFansInviteCode(payload)
            return {
                userId,
                fanUserId: userId,
                inviteCode,
                promoterUserId: payload.promoterUserId,
                ownerUserId: payload.ownerUserId,
                roleCode: payload.roleCode || 'PROMOTER',
                scene: payload.scene,
                rawScene: payload.rawScene,
                fanScene: payload.fanScene,
                ownerMerchantId: payload.ownerMerchantId,
                fanType: merchantId ? 'MERCHANT' : 'CONSUMER',
                merchantId,
                fanRoleCode: merchantId ? 'MERCHANT' : 'CONSUMER'
            }
        },
        async resolveFansInviteCode(payload = {}) {
            const ownerUserId = payload.ownerUserId || payload.promoterUserId || ''
            if (!ownerUserId) return ''
            const res = await getPromotionInviteCode({
                userId: ownerUserId,
                roleCode: payload.roleCode || 'PROMOTER',
                show: false
            }).catch(() => null)
            if (res && res.code == 1) {
                const data = res.data || {}
                return data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.code || ''
            }
            return ''
        },
        onCopy() {
            copy(this.userInfo.sn)
        },
        formatKnownCount(value) {
            if (value === undefined || value === null || value === '') return '待确认'
            const count = Number(value)
            return Number.isNaN(count) || !Number.isFinite(count) ? '待确认' : String(count)
        }
    },
    computed: {
        ...mapGetters(['cartNum', 'userInfo', 'inviteCode', 'appConfig']),
        onlineOrderEntries() {
            return [
                { name: '待支付', url: '/bundle_order/pages/user_order/user_order?type=pay', image: designAssets.myOrderPay, badge: this.userInfo.wait_pay },
                { name: '待发货', url: '/bundle_order/pages/user_order/user_order?type=ship', image: designAssets.myOrderShip, badge: this.userInfo.wait_delivery },
                { name: '待收货/核销', url: '/bundle_order/pages/user_order/user_order?type=delivery', image: designAssets.myOrderReceive, badge: this.userInfo.wait_take },
                { name: '待取积分', url: businessRoutes.pages.autoPoints.url, image: designAssets.myOrderPoints, badge: this.pendingPointsCount },
                { name: '售后', url: '/bundle_order/pages/post_sale/post_sale', image: designAssets.myOrderAfterSale, badge: this.userInfo.after_sale }
            ]
        },
        offlineOrderEntries() {
            return [
                { name: '核销订单', url: '/bundle_misc/pages/writeoff_order/writeoff_order', image: designAssets.myOfflinePay },
                { name: '付款记录', url: '/business/pages/business_pages/payment_record', image: designAssets.myPaymentRecord }
            ]
        },
        allianceEntries() {
            const roles = this.approvedRoleEntries.filter(item => this.promotionRoleCodes.includes(this.normalizeRoleCode(item.code || item.roleCode)))
            const entries = roles.map((item) => {
                const code = this.normalizeRoleCode(item.code || item.roleCode)
                return {
                    name: `${this.roleLabel(code)}推广码`,
                    action: 'promotionCode',
                    roleCode: code,
                    image: designAssets.myAllianceCode
                }
            })
            entries.push({ name: '分销推广', url: '/bundle_misc/pages/user_spread/user_spread', image: designAssets.myAllianceRecord || designAssets.myAllianceCode })
            entries.push({ name: '扫描粉丝码', action: 'scanFans', image: designAssets.myAllianceCode })
            return entries
        },
        legacyAllianceEntries() {
            return [
                { name: '推广码', url: '/business/pages/business_pages/intro_card', image: designAssets.myAllianceCode }
            ]
        },
        valueEntries() {
            return [
                { name: `我的积分\n${this.userIntegralText}`, url: '/bundle_misc/pages/user_sign/user_sign', image: designAssets.myOrderPoints },
                { name: '待领取\n线上订单', url: businessRoutes.pages.autoPoints.url, image: designAssets.myValueOnline, badge: this.pendingPointsCount },
                { name: '待核销\n自提订单', url: '/bundle_order/pages/user_order/user_order?scene=offline&type=ship', image: designAssets.myValueOffline },
                { name: '领取积分\n设置', url: businessRoutes.pages.autoPoints.url, image: designAssets.myOrderPoints }
            ]
        },
        featureEntries() {
            return [
                { name: 'KYC', url: businessRoutes.pages.userKyc.url, image: designAssets.myKyc },
                { name: '我的收藏', url: '/bundle_user/pages/user_collection/user_collection', image: designAssets.myGiftCard },
                { name: '我的钱包', url: businessRoutes.pages.wallet.url, image: designAssets.myPaymentRecord },
                { name: '消息中心', url: '/bundle_misc/pages/message_center/message_center', image: designAssets.homeNoticeIcon },
                { name: '会员中心', url: '/bundle_user/pages/user_vip/user_vip', image: designAssets.myCouponCard },
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
        },
        needsWechatProfile() {
            if (!this.isLogin) return false
            return !this.userInfo.avatar || !this.displayNickname || !this.userInfo.mobile
        },
        pendingPointsCount() {
            return this.userInfo.wait_points ?? this.userInfo.waitPoints ?? this.userInfo.pending_points ?? this.userInfo.pendingPoints ?? this.userInfo.wait_receive_points ?? this.userInfo.waitReceivePoints ?? 0
        },
        userIntegralText() {
            return this.formatKnownCount(this.userInfo.user_integral ?? this.userInfo.userIntegral ?? this.userInfo.availablePoints ?? this.userInfo.available_points)
        },
        couponCountText() {
            const count = this.userInfo.coupon_num ?? this.userInfo.couponNum ?? this.userInfo.coupon
            const text = this.formatKnownCount(count)
            return text === '待确认' ? text : `${text}张`
        },
        normalizedRoles() {
            const roles = this.roleList.length ? this.roleList : (this.userInfo.roles || this.userInfo.roleList || [])
            return Array.isArray(roles) ? roles.map(item => typeof item === 'string' ? { roleCode: this.normalizeRoleCode(item) } : { ...item, roleCode: this.normalizeRoleCode(item.roleCode || item.role_code || item.role) }) : []
        },
        approvedRoles() {
            const profileRoles = this.normalizedRoles.filter(item => item.roleCode || item.role_code || item.role)
            const applicationRoles = this.roleApplications.filter(item => this.roleStatusType(item.applicationStatus || item.auditStatus || item.status) === 'approved')
                .map(item => ({ ...item, roleCode: this.normalizeRoleCode(item.roleCode || item.role_code || item.role) }))
            const merchantRole = this.isMerchantApproved ? [{
                roleCode: 'MERCHANT',
                roleName: this.roleLabel('MERCHANT'),
                merchantId: this.currentMerchantId
            }] : []
            const seen = new Set()
            return merchantRole.concat(profileRoles, applicationRoles).filter((item) => {
                const code = this.normalizeRoleCode(item.roleCode || item.role_code || item.role)
                if (!code || seen.has(code)) return false
                seen.add(code)
                item.roleCode = code
                return true
            })
        },
        displayRoleBadges() {
            const badges = [{ code: this.isMerchantApproved ? 'MERCHANT' : 'NORMAL', label: this.baseIdentityLabel }]
            this.approvedRoleEntries.forEach((item) => {
                if (!badges.some((badge) => badge.code === item.code)) badges.push(item)
            })
            return badges.slice(0, 4)
        },
        pendingRoleBadges() {
            if (!this.approvedRoleEntries.length && this.activeRoleApplication) {
                const code = this.normalizeRoleCode(this.activeRoleApplication.roleCode || this.activeRoleApplication.role_code || this.activeRoleApplication.role)
                return [{
                    code: code || 'pending',
                    label: `${this.roleLabel(code)}${this.roleStatusLabel(this.activeRoleApplication.applicationStatus || this.activeRoleApplication.auditStatus || this.activeRoleApplication.status)}`
                }]
            }
            return []
        },
        approvedRoleEntries() {
            return this.approvedRoles.map(item => {
                const code = this.normalizeRoleCode(item.roleCode || item.role_code || item.role)
                return { ...item, code, label: this.roleLabel(code) }
            })
        },
        showPromotionSection() {
            if (!this.isLogin) return false
            return this.approvedRoleEntries.some(item => this.promotionRoleCodes.includes(this.normalizeRoleCode(item.code || item.roleCode)))
        },
        activeRoleApplication() {
            return this.roleApplications.find(item => this.roleStatusType(item.applicationStatus || item.auditStatus || item.status) !== 'default') || null
        },
        isMerchantApproved() {
            const status = String(this.merchantQualification.audit_status || this.merchantQualification.auditStatus || this.merchantQualification.status || this.userInfo.merchantStatus || this.userInfo.merchant_status || '').toUpperCase()
            const flag = this.userInfo.isMerchant || this.userInfo.is_merchant || this.userInfo.merchantId || this.userInfo.merchant_id
            return Boolean(flag) || ['APPROVED', 'PASS', 'PASSED', 'SUCCESS', 'REALNAME_VERIFIED'].includes(status)
        },
        currentMerchantId() {
            return this.merchantQualification.merchantId || this.merchantQualification.merchant_id || this.merchantQualification.id || this.userInfo.merchantId || this.userInfo.merchant_id || this.userInfo.shopId || this.userInfo.shop_id || ''
        },
        baseIdentityLabel() {
            return this.isMerchantApproved ? '商家' : '普通用户'
        },
        promotionRoleCodes() {
            return ['MERCHANT', 'PROMOTER', 'AGENT', 'SUBSIDIARY', 'HQ']
        },
        primaryPromotionRoleCode() {
            const role = this.approvedRoleEntries.find(item => this.promotionRoleCodes.includes(this.normalizeRoleCode(item.code || item.roleCode)))
            return role ? this.normalizeRoleCode(role.code || role.roleCode) : ''
        },
        promotionRoleCode() {
            return this.normalizeRoleCode(this.promotionInfo.roleCode || this.primaryPromotionRoleCode || 'PROMOTER')
        },
        promotionRoleLabel() {
            return this.promotionInfo.roleName || this.roleLabel(this.promotionRoleCode)
        },
        promotionInviteCode() {
            return this.promotionInfo.inviteCode || this.promotionInfo.invite_code || this.promotionInfo.promoterCode || this.promotionInfo.promoter_code || this.promotionInfo.code || ''
        },
        promotionScene() {
            return this.promotionInfo.scene || this.buildPromotionScene(this.promotionRoleCode, this.promotionInviteCode)
        },
        promotionQrText() {
            return this.promotionInfo.qrText || this.promotionInfo.qr_text || this.promotionInfo.shareUrl || this.promotionInfo.share_url || this.promotionScene
        },
        promotionQrImage() {
            const image = this.promotionInfo.qrcodeUrl || this.promotionInfo.qrcode_url || this.promotionInfo.posterUrl || this.promotionInfo.poster_url || ''
            return this.resolvePromotionQrUrl(image)
        },
        promoterEntryName() {
            return '角色申请'
        }
    }
}
</script>

<style lang="scss">
.my-page {
    --page-safe-top: var(--status-bar-height, 44rpx);
    position: relative;
    min-height: 100vh;
    padding-bottom: calc(18rpx + var(--window-bottom));
    background: #fff9f0;
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
    min-height: calc(1951rpx + var(--page-safe-top) + var(--window-bottom));
    overflow: visible;
}

.my-page--guest .my-page__screen {
    min-height: calc(1545rpx + var(--page-safe-top) + var(--window-bottom));
}

.my-page--no-offline .my-page__screen,
.my-page--no-promotion .my-page__screen {
    min-height: calc(1826rpx + var(--page-safe-top) + var(--window-bottom));
}

.my-page--no-offline.my-page--no-promotion .my-page__screen {
    min-height: calc(1589rpx + var(--page-safe-top) + var(--window-bottom));
}

.my-page--guest.my-page--no-offline.my-page--no-promotion .my-page__screen {
    min-height: calc(1560rpx + var(--page-safe-top) + var(--window-bottom));
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
    min-height: 178rpx;
    display: flex;
    align-items: flex-start;
}

.my-page__avatar {
    width: 142rpx;
    height: 142rpx;
    flex: none;
    margin-top: 6rpx;
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
    color: #b27135;
}

.my-page__identity-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 10rpx;
}

.my-page__profile-tip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 10rpx;
    height: 38rpx;
    padding: 0 16rpx;
    border-radius: 19rpx;
    color: #b27135;
    background: rgba(178, 113, 53, .1);
    font-size: 22rpx;
    line-height: 38rpx;
}

.my-page__identity-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    height: 36rpx;
    padding: 0 16rpx;
    color: #666666;
    font-size: 22rpx;
    line-height: 36rpx;
    background: rgba(255, 255, 255, 0.72);
    border-radius: 18rpx;
    white-space: nowrap;
}

.my-page__role-tag--pending {
    color: #d98200;
    background: rgba(255, 158, 31, 0.12);
}

.my-page__role-tag--rejected {
    color: #a0610d;
    background: rgba(160, 97, 13, 0.1);
}

.my-page__role-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    max-height: 44rpx;
    margin-top: 8rpx;
    overflow: hidden;
}

.my-page__role-badge {
    height: 34rpx;
    padding: 0 14rpx;
    border-radius: 17rpx;
    color: #666666;
    background: rgba(255, 255, 255, .76);
    font-size: 21rpx;
    line-height: 34rpx;
}

.my-page__role-badge--promoter { color: #b27135; background: #fff3e8; }
.my-page__role-badge--agent { color: #00a66a; background: #eafff6; }
.my-page__role-badge--subsidiary { color: #8a5cf6; background: #f1edff; }
.my-page__role-badge--hq { color: #d98200; background: #fff6e6; }
.my-page__role-badge--merchant { color: #b27135; background: #fff3e8; }
.my-page__role-badge--normal { color: #667085; background: rgba(255, 255, 255, .78); }
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

.service-qrcode-card {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 18rpx auto 0;
    padding: 26rpx 28rpx 28rpx;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, .92);
    box-shadow: 0 14rpx 34rpx rgba(33, 79, 146, .08);
    box-sizing: border-box;
}

.service-qrcode {
    width: 336rpx;
    height: 336rpx;
    border-radius: 20rpx;
    background: #ffffff;
    box-shadow: 0 8rpx 20rpx rgba(31, 58, 94, .06);
}

.service-qrcode__title {
    margin-top: 22rpx;
    color: #222222;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 42rpx;
    text-align: center;
}

.service-qrcode__desc {
    max-width: 520rpx;
    margin-top: 8rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 36rpx;
    text-align: center;
}

.service-sheet__cancel {
    position: relative;
    z-index: 1;
    margin-top: 34rpx;
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
    margin: 10rpx 0 0 24rpx;
    flex: none;
}

.my-page__merchant {
    position: absolute;
    left: 47rpx;
    right: 47rpx;
    top: calc(var(--page-safe-top) + 299rpx);
    z-index: 1;
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
    display: none;
}

.my-page__assets {
    position: absolute;
    left: 26rpx;
    right: 26rpx;
    top: calc(var(--page-safe-top) + 411rpx);
    z-index: 4;
    display: flex;
    justify-content: space-between;
    height: 123rpx;
    padding: 0 27rpx;
    box-sizing: border-box;
}

.my-page__asset-card {
    width: 311rpx;
    height: 123rpx;
    padding: 25rpx 0 0 26rpx;
    border-radius: 20rpx;
    box-sizing: border-box;
    background: linear-gradient(135deg, #fff7e7 0%, #ffe1bd 100%);
    box-shadow: 0 10rpx 24rpx rgba(178, 113, 53, .10);
}

.my-page__asset-card--points {
    background: linear-gradient(135deg, #fff5e5 0%, #ffdba6 100%);
}

.my-page__asset-title {
    color: #ef5a18;
    font-size: 24rpx;
    line-height: 24rpx;
    white-space: nowrap;
}

.my-page__asset-card--points .my-page__asset-title,
.my-page__asset-card--points .my-page__asset-value {
    color: #d07101;
}

.my-page__asset-value {
    margin-top: 20rpx;
    color: #ef5a18;
    font-size: 35rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 35rpx;
    white-space: nowrap;
}

.my-section {
    position: absolute;
    left: 26rpx;
    right: 26rpx;
    z-index: 3;
    background: rgba(255, 249, 240, 1);
    border-radius: 15rpx;
    box-shadow: none;
}

.my-section--online {
    top: calc(var(--page-safe-top) + 626rpx);
    min-height: 213rpx;
    padding-bottom: 28rpx;
    box-sizing: border-box;
}

.my-section--pair {
    height: 213rpx;
}

.my-section--pair-1 {
    top: calc(var(--page-safe-top) + 860rpx);
}

.my-section--pair-2 {
    top: calc(var(--page-safe-top) + 1094rpx);
}

.my-section--value {
    top: calc(var(--page-safe-top) + 1328rpx);
    min-height: 237rpx;
    padding-bottom: 28rpx;
    box-sizing: border-box;
}

.my-section--feature {
    top: calc(var(--page-safe-top) + 1579rpx);
    min-height: 322rpx;
    padding-bottom: 28rpx;
    box-sizing: border-box;
}

.my-page--no-offline .my-section--pair-2 {
    top: calc(var(--page-safe-top) + 860rpx);
}

.my-page--no-offline .my-section--value {
    top: calc(var(--page-safe-top) + 1094rpx);
}

.my-page--no-offline .my-section--feature {
    top: calc(var(--page-safe-top) + 1345rpx);
}

.my-page--no-promotion .my-section--value {
    top: calc(var(--page-safe-top) + 1094rpx);
}

.my-page--no-promotion .my-section--feature {
    top: calc(var(--page-safe-top) + 1345rpx);
}

.my-page--no-offline.my-page--no-promotion .my-section--value {
    top: calc(var(--page-safe-top) + 860rpx);
}

.my-page--no-offline.my-page--no-promotion .my-section--feature {
    top: calc(var(--page-safe-top) + 1111rpx);
}

.my-page--guest .my-page__merchant {
    top: calc(var(--page-safe-top) + 270rpx);
}

.my-page--guest .my-section--online {
    top: calc(var(--page-safe-top) + 597rpx);
}

.my-page--guest.my-page--no-offline.my-page--no-promotion .my-section--value {
    top: calc(var(--page-safe-top) + 831rpx);
}

.my-page--guest.my-page--no-offline.my-page--no-promotion .my-section--feature {
    top: calc(var(--page-safe-top) + 1082rpx);
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
    border: 1rpx solid rgba(178, 113, 53, 1);
    border-radius: 28rpx;
    color: rgba(178, 113, 53, 1);
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

.my-value-icon-wrap {
    position: relative;
    width: 42rpx;
    height: 42rpx;
}

.my-value-badge {
    position: absolute;
    right: -4rpx;
    top: -10rpx;
    min-width: 28rpx;
    height: 28rpx;
    padding: 0 8rpx;
    color: #ffffff;
    font-size: 18rpx;
    line-height: 28rpx;
    text-align: center;
    background: #b27135;
    border-radius: 18rpx;
    box-sizing: border-box;
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
    margin-bottom: 28rpx;
    box-sizing: border-box;
}

.my-feature-icon {
    width: 42rpx;
    height: 42rpx;
}

.my-feature-text {
    margin-top: 15rpx;
    color: rgba(34, 34, 34, 1);
    font-size: 22rpx;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: normal;
    line-height: 29rpx;
    text-align: center;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.promotion-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
}

.promotion-modal__mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(13, 20, 34, .48);
}

.promotion-sheet {
    position: absolute;
    left: 24rpx;
    right: 24rpx;
    bottom: calc(24rpx + env(safe-area-inset-bottom));
    padding: 30rpx 28rpx 32rpx;
    border-radius: 28rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.promotion-sheet__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
}

.promotion-sheet__title {
    color: #1d2433;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 46rpx;
}

.promotion-sheet__subtitle {
    margin-top: 8rpx;
    color: #7b8494;
    font-size: 25rpx;
    line-height: 34rpx;
    word-break: break-all;
}

.promotion-sheet__close {
    flex: none;
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    color: #7b8494;
    background: #f2f5f9;
    font-size: 36rpx;
    line-height: 50rpx;
    text-align: center;
}

.promotion-code-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 420rpx;
    height: 420rpx;
    margin: 30rpx auto 0;
    border-radius: 24rpx;
    background: #f7f9fc;
    overflow: hidden;
}

.promotion-code-image {
    width: 360rpx;
    height: 360rpx;
}

.promotion-code-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 360rpx;
    height: 360rpx;
    padding: 36rpx;
    border-radius: 20rpx;
    background: #ffffff;
    box-sizing: border-box;
    text-align: center;
}

.promotion-code-fallback__label {
    color: #7b8494;
    font-size: 24rpx;
    line-height: 34rpx;
}

.promotion-code-fallback__value {
    max-width: 100%;
    margin-top: 18rpx;
    color: #a0610d;
    font-size: 42rpx;
    font-weight: 700;
    line-height: 52rpx;
    word-break: break-all;
}

.promotion-code-fallback__hint {
    margin-top: 20rpx;
    color: #8b96a8;
    font-size: 22rpx;
    line-height: 32rpx;
}

.promotion-code-empty {
    color: #8b96a8;
    font-size: 26rpx;
    line-height: 38rpx;
}

.promotion-code-tip {
    margin-top: 24rpx;
    color: #6f7a8c;
    font-size: 24rpx;
    line-height: 36rpx;
    text-align: center;
}

.promotion-code-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
    margin-top: 26rpx;
}

.promotion-code-btn {
    height: 76rpx;
    margin: 0;
    border: 0;
    border-radius: 38rpx;
    color: #a0610d;
    background: #fff2df;
    font-size: 27rpx;
    line-height: 76rpx;
}

.promotion-code-btn--primary {
    color: #ffffff;
    background: #a0610d;
}

/* Lanhu-style refresh: keep page logic intact, replace the absolute legacy shell with compact flow cards. */
.my-page {
    background: #f8ede1;
}

.my-page__page-bg {
    display: none;
}

.my-page__screen,
.my-page--guest .my-page__screen,
.my-page--no-offline .my-page__screen,
.my-page--no-promotion .my-page__screen,
.my-page--no-offline.my-page--no-promotion .my-page__screen,
.my-page--guest.my-page--no-offline.my-page--no-promotion .my-page__screen {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    width: 100%;
    min-height: 0;
    padding: calc(var(--page-safe-top) + 26rpx) 24rpx calc(42rpx + var(--window-bottom));
    box-sizing: border-box;
}

.my-page__top,
.my-page__profile,
.my-page__merchant,
.my-page__assets,
.my-section {
    position: relative;
    left: auto;
    right: auto;
    top: auto;
    width: 100%;
    box-sizing: border-box;
}

.my-page__top {
    height: 58rpx;
    margin: 0;
}

.my-page__title,
.my-section__title {
    color: #a0610d;
    font-family: SimSun, PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 700;
}

.my-page__profile {
    min-height: 172rpx;
    padding: 26rpx 24rpx;
    align-items: center;
    border: 1rpx solid rgba(160, 97, 13, .14);
    border-radius: 18rpx;
    background: linear-gradient(180deg, #fff8ed 0%, #fff1dc 100%);
    box-shadow: 0 12rpx 30rpx rgba(118, 66, 19, .08);
}

.my-page__avatar {
    width: 124rpx;
    height: 124rpx;
    margin-top: 0;
    border: 4rpx solid rgba(255, 255, 255, .8);
    border-radius: 50%;
    background: #fff9f0;
}

.my-page__profile-text {
    margin-left: 24rpx;
}

.my-page__nickname {
    color: #222222;
}

.my-page__member-id {
    color: #8b7663;
}

.my-page__identity-pill,
.my-page__role-badge {
    color: #764213;
    background: rgba(255, 249, 240, .9);
}

.my-page__role-badge--agent,
.my-page__role-badge--subsidiary,
.my-page__role-badge--normal {
    color: #764213;
    background: #fff3e8;
}

.my-page__setting {
    width: 40rpx;
    height: 40rpx;
    margin-top: 0;
}

.my-page__merchant {
    height: auto;
    min-height: 132rpx;
    padding: 28rpx 30rpx;
    border-radius: 18rpx;
    background: linear-gradient(135deg, #fff9f0 0%, #ffe7bd 100%);
    box-shadow: 0 12rpx 30rpx rgba(118, 66, 19, .08);
}

.my-page--guest .my-page__merchant {
    display: none;
}

.my-page__merchant-bg {
    display: none;
}

.my-page__merchant-content {
    padding: 0;
}

.my-page__merchant-title,
.my-page__merchant-action {
    color: #764213;
}

.my-page__assets {
    height: auto;
    padding: 0;
    gap: 18rpx;
}

.my-page__asset-card {
    flex: 1;
    width: auto;
    min-width: 0;
    height: 122rpx;
    padding: 22rpx 24rpx;
    border: 1rpx solid rgba(160, 97, 13, .12);
    border-radius: 18rpx;
    background: #fff9f0;
    box-shadow: 0 10rpx 24rpx rgba(118, 66, 19, .06);
}

.my-page__asset-card--points {
    background: #fff9f0;
}

.my-page__asset-title,
.my-page__asset-value,
.my-page__asset-card--points .my-page__asset-title,
.my-page__asset-card--points .my-page__asset-value {
    color: #a0610d;
}

.my-section {
    min-height: 0;
    height: auto;
    top: auto;
    padding: 24rpx 20rpx 26rpx;
    border: 1rpx solid rgba(160, 97, 13, .12);
    border-radius: 18rpx;
    background: #fff9f0;
    box-shadow: 0 10rpx 24rpx rgba(118, 66, 19, .05);
}

.my-section--online,
.my-section--pair,
.my-section--pair-1,
.my-section--pair-2,
.my-section--value,
.my-section--feature,
.my-page--no-offline .my-section--pair-2,
.my-page--no-offline .my-section--value,
.my-page--no-offline .my-section--feature,
.my-page--no-promotion .my-section--value,
.my-page--no-promotion .my-section--feature,
.my-page--no-offline.my-page--no-promotion .my-section--value,
.my-page--no-offline.my-page--no-promotion .my-section--feature,
.my-page--guest .my-section--online,
.my-page--guest.my-page--no-offline.my-page--no-promotion .my-section--value,
.my-page--guest.my-page--no-offline.my-page--no-promotion .my-section--feature {
    top: auto;
}

.my-section__head,
.my-section__head--plain {
    padding: 0 4rpx;
}

.my-section__more {
    color: #a0610d;
}

.my-order-grid,
.my-value-grid,
.my-feature-grid {
    padding: 30rpx 0 0;
}

.my-pair-grid {
    flex-wrap: wrap;
    gap: 28rpx 48rpx;
    padding: 30rpx 0 0;
}

.my-pair-item,
.my-pair-item + .my-pair-item {
    width: 118rpx;
    margin-left: 0;
}

.my-order-text,
.my-pair-text,
.my-value-text,
.my-feature-text {
    color: #5f4a3a;
}

.my-order-badge,
.my-value-badge {
    border-color: #a0610d;
    color: #a0610d;
    background: #fff9f0;
}

.service-sheet {
    background: linear-gradient(180deg, #fff8ed 0%, #f8ede1 100%);
}

.service-sheet__bg {
    display: none;
}

.service-qrcode-card,
.promotion-sheet,
.promotion-code-fallback {
    background: #fff9f0;
    box-shadow: 0 14rpx 34rpx rgba(118, 66, 19, .08);
}

.service-qrcode__desc,
.promotion-sheet__subtitle,
.promotion-code-fallback__hint,
.promotion-code-tip {
    color: #8b7663;
}

.promotion-sheet__close,
.promotion-code-box {
    background: #f3e7db;
}
</style>
