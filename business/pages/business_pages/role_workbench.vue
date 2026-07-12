<template>
    <view class="role-page">
        <navbar :title="roleLabel + '工作台'" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>

        <view class="page-inner">
            <view :class="['hero', 'hero--' + roleTheme]">
                <view class="hero-main">
                    <view class="hero-kicker">{{ roleStatusText }}</view>
                    <view class="hero-title">{{ roleLabel }}工作台</view>
                    <view class="hero-desc">{{ shareDesc }}</view>
                </view>
                <view class="hero-code" @tap.stop="copyInviteCode">
                    <text class="hero-code__label">邀请码</text>
                    <text class="hero-code__value">{{ inviteCode || '待生成' }}</text>
                </view>
            </view>

            <view v-if="loadError" class="state-card">
                <view>{{ loadError }}</view>
                <view class="state-card__btn" @tap="loadWorkbench">重新加载</view>
            </view>

            <view class="summary-grid">
                <view v-for="item in primaryMetrics" :key="item.key" class="summary-card">
                    <view class="summary-label">{{ item.label }}</view>
                    <view class="summary-value">{{ item.value }}</view>
                    <view class="summary-sub">{{ item.sub }}</view>
                </view>
            </view>

            <view class="section">
                <view class="section-head">
                    <view>
                        <view class="section-title">吸粉推广</view>
                        <view class="section-sub">分享专属码后，粉丝会按当前角色绑定</view>
                    </view>
                    <button class="share-mini" open-type="share">分享</button>
                </view>
                <view class="invite-panel">
                    <view class="invite-preview" @tap="openPoster">
                        <image v-if="previewImage" class="invite-preview__image" :src="previewImage" mode="aspectFit"></image>
                        <tki-qrcode
                            v-else-if="qrText"
                            cid="role-preview-qrcode"
                            :val="qrText"
                            :size="164"
                            :onval="true"
                            :load-make="true"
                            :show-loading="false"
                        ></tki-qrcode>
                        <view v-else class="invite-preview__empty">
                            <text>生成</text>
                            <text>吸粉码</text>
                        </view>
                    </view>
                    <view class="invite-info">
                        <view class="invite-title">{{ inviteCode ? inviteCode : '邀请码待生成' }}</view>
                        <view class="invite-desc line2">{{ sceneText }}</view>
                        <view class="invite-actions">
                            <view class="invite-action" @tap="copyInviteCode">复制邀请码</view>
                            <view class="invite-action invite-action--primary" @tap="openPoster">查看海报</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="metric-list">
                <view v-for="item in secondaryMetrics" :key="item.key" class="metric-row">
                    <view>
                        <view class="metric-row__label">{{ item.label }}</view>
                        <view class="metric-row__sub">{{ item.sub }}</view>
                    </view>
                    <view class="metric-row__value">{{ item.value }}</view>
                </view>
            </view>

            <view class="section">
                <view class="section-title">常用功能</view>
                <view class="entry-grid">
                    <view v-for="item in actionEntries" :key="item.key" class="entry-card" @tap="openAction(item)">
                        <view class="entry-icon">{{ item.icon }}</view>
                        <view class="entry-body">
                            <view class="entry-title">{{ item.title }}</view>
                            <view class="entry-desc">{{ item.desc }}</view>
                        </view>
                    </view>
                </view>
            </view>

            <view v-if="loading" class="loading-card">数据加载中...</view>
        </view>

        <view v-if="posterVisible" class="poster-modal">
            <view class="poster-mask" @tap="closePoster"></view>
            <view class="poster-sheet">
                <view class="poster-head">
                    <view>
                        <view class="poster-title">专属吸粉码</view>
                        <view class="poster-subtitle">{{ inviteCode || '邀请码待生成' }}</view>
                    </view>
                    <view class="poster-close" @tap="closePoster">×</view>
                </view>
                <image v-if="posterImage" class="poster-image" :src="posterImage" mode="aspectFit"></image>
                <view v-else-if="qrText" class="poster-qr">
                    <tki-qrcode
                        cid="role-poster-qrcode"
                        :val="qrText"
                        :size="360"
                        :onval="true"
                        :load-make="true"
                        :show-loading="false"
                        @result="onPosterQrResult"
                    ></tki-qrcode>
                </view>
                <view v-else class="poster-empty">{{ posterError || '正在生成吸粉码...' }}</view>
                <view class="poster-scene line2">{{ qrTipText }}</view>
                <view class="poster-actions">
                    <button class="poster-action" open-type="share">分享好友</button>
                    <button class="poster-action poster-action--primary" @tap="savePoster">保存图片</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@/components/navbar/navbar.vue'
import { getPromotionInviteCode, getRoleWorkbench } from '@/api/user'
import { getShareMnQrcode } from '@/api/app'
import TkiQrcode from '@/business/components/tki-qrcode/tki-qrcode.vue'
import { localizeBackendText } from '@/utils/backend-text'

export default {
    components: { Navbar, TkiQrcode },
    data() {
        return {
            roleCode: 'PROMOTER',
            workbench: {},
            loading: false,
            loadError: '',
            posterVisible: false,
            posterImage: '',
            posterQrImage: '',
            posterError: ''
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        userId() {
            return this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
        },
        roleLabel() {
            const rawName = this.workbench.roleName || this.workbench.role_name || ''
            return this.mapRoleLabel(rawName || this.roleCode)
        },
        roleTheme() {
            const map = { PROMOTER: 'promoter', AGENT: 'agent', SUBSIDIARY: 'subsidiary', MERCHANT: 'merchant' }
            return map[this.roleCode] || 'default'
        },
        roleStatusText() {
            const status = String(this.workbench.applicationStatus || this.workbench.roleStatus || '').toUpperCase()
            const map = {
                APPROVED: '已生效',
                ENABLED: '已生效',
                ACTIVE: '已生效',
                SUCCESS: '已生效',
                PENDING_AUDIT: '待审核',
                WAIT_AUDIT: '待审核',
                AUDITING: '待审核',
                PENDING_DEPOSIT: '待缴押金',
                WAIT_PAY: '待缴押金',
                PENDING_PAY: '待缴押金',
                REJECTED: '已驳回',
                REFUSED: '已驳回',
                FAILED: '已驳回'
            }
            return map[status] || '角色已开通'
        },
        inviteCode() {
            return this.workbench.inviteCode || this.workbench.invite_code || this.workbench.promoterCode || this.workbench.promoter_code || this.userInfo.promoter_code || this.userInfo.distribution_code || ''
        },
        previewImage() {
            return this.workbench.qrcodeUrl || this.workbench.qrcode_url || this.workbench.posterUrl || this.workbench.poster_url || this.posterImage || ''
        },
        shareDesc() {
            return this.mapBackendText(this.workbench.shareDesc || this.workbench.share_desc, '查看粉丝、订单、积分收益，生成专属吸粉码')
        },
        sceneText() {
            return this.buildScene(this.inviteCode)
        },
        qrText() {
            return this.workbench.qrText || this.workbench.qr_text || this.workbench.shareUrl || this.workbench.share_url || this.sceneText
        },
        qrTipText() {
            return this.inviteCode ? `专属邀请码：${this.inviteCode}` : `${this.roleLabel}专属吸粉码待生成`
        },
        primaryMetrics() {
            return [
                { key: 'fans', label: '累计粉丝', value: this.displayNumber(this.workbench.fansCount), sub: `今日新增 ${this.displayNumber(this.workbench.todayFans)}` },
                { key: 'orders', label: '推广订单', value: this.displayNumber(this.workbench.orderCount), sub: `今日 ${this.displayCountWithUnit(this.workbench.todayOrderCount, '单')}` },
                { key: 'profit', label: '累计分润', value: this.displayMoney(this.workbench.totalProfit), sub: `本月 ${this.displayMoney(this.workbench.monthProfit)}` },
                { key: 'points', label: '可用积分', value: this.displayNumber(this.workbench.availablePoints), sub: `冻结 ${this.displayNumber(this.workbench.frozenPoints)}` }
            ]
        },
        secondaryMetrics() {
            const list = [
                { key: 'todayProfit', label: '今日预计分润', value: this.displayMoney(this.workbench.todayProfit), sub: '按实时统计展示' },
                { key: 'merchantCount', label: '绑定商家', value: this.displayNumber(this.workbench.merchantCount), sub: '商家/门店维度绑定数量' }
            ]
            if (this.workbench.merchantName) {
                list.push({ key: 'merchantName', label: '当前门店', value: this.mapBackendText(this.workbench.merchantName), sub: '商家角色关联门店' })
            }
            return list
        },
        actionEntries() {
            const entries = [
                { key: 'ledger', icon: '积', title: '积分收入明细', desc: '查看角色收益流水' },
                { key: 'poster', icon: '码', title: '生成吸粉码', desc: '海报、二维码与分享' },
                { key: 'fans', icon: '粉', title: '粉丝列表', desc: '查看绑定粉丝和订单' }
            ]
            if (this.roleCode === 'MERCHANT') {
                entries.push({ key: 'verify', icon: '核', title: '扫码核销订单', desc: '线下订单快速核验' })
                entries.push({ key: 'cashier', icon: '单', title: '核销订单', desc: '待核销/已核销列表' })
            }
            return entries
        }
    },
    onLoad(options = {}) {
        this.roleCode = this.normalizeRoleCode(options.roleCode || options.role || 'PROMOTER')
        this.loadWorkbench()
    },
    onPullDownRefresh() {
        this.loadWorkbench().finally(() => uni.stopPullDownRefresh())
    },
    onShareAppMessage() {
        return {
            title: this.mapBackendText(this.workbench.shareTitle || this.workbench.share_title, `${this.roleLabel}邀请`),
            path: `/pages/index/index?scene=${encodeURIComponent(this.sceneText)}`,
            imageUrl: this.posterImage || this.workbench.posterUrl || this.workbench.poster_url || ''
        }
    },
    methods: {
        normalizeRoleCode(roleCode) {
            const code = String(roleCode || '').toUpperCase()
            const map = { HEADQUARTERS: 'HQ', OPERATION_CENTER: 'AGENT', AREA_AGENT: 'AGENT', COUNTY_AGENT: 'AGENT', BRANCH: 'SUBSIDIARY', COMPANY_BRANCH: 'SUBSIDIARY' }
            return map[code] || code
        },
        mapRoleLabel(value) {
            const normalized = this.normalizeRoleCode(value)
            const map = {
                PROMOTER: '推广者',
                AGENT: '区域代理',
                SUBSIDIARY: '子公司',
                HQ: '总部',
                MERCHANT: '商家',
                USER: '普通用户',
                NORMAL_USER: '普通用户'
            }
            return map[normalized] || value || '角色'
        },
        mapBackendText(value, fallback = '') {
            const localized = localizeBackendText(value, fallback)
            if (localized) return localized
            if (value === undefined || value === null || value === '') return fallback
            const normalized = String(value).trim().toUpperCase()
            const map = {
                PROMOTER: '推广者',
                AGENT: '区域代理',
                SUBSIDIARY: '子公司',
                MERCHANT: '商家',
                APPROVED: '已通过',
                ENABLED: '已启用',
                ACTIVE: '已启用',
                PENDING_AUDIT: '待审核',
                PENDING_DEPOSIT: '待缴押金',
                REJECTED: '已驳回'
            }
            return map[normalized] || fallback || String(value)
        },
        displayNumber(value) {
            if (!this.hasMetricValue(value)) return '待确认'
            const num = Number(value)
            if (Number.isNaN(num) || !Number.isFinite(num)) return '待确认'
            return num.toLocaleString()
        },
        displayCountWithUnit(value, unit) {
            return this.hasMetricValue(value) ? `${this.displayNumber(value)} ${unit}` : '待确认'
        },
        displayMoney(value) {
            if (typeof value === 'string' && /[¥￥]/.test(value)) return value
            if (!this.hasMetricValue(value)) return '金额待确认'
            const num = Number(value)
            if (Number.isNaN(num) || !Number.isFinite(num)) return '金额待确认'
            const valueText = num % 1 === 0 ? String(num) : num.toFixed(2)
            return `¥${valueText}`
        },
        hasMetricValue(value) {
            return value !== undefined && value !== null && value !== ''
        },
        buildScene(inviteCode = '') {
            const params = [`uid_${this.userId}`, `role=${this.roleCode}`]
            if (inviteCode) params.push(`invite_code=${inviteCode}`)
            return params.join('&')
        },
        async loadWorkbench() {
            this.loading = true
            this.loadError = ''
            try {
                const res = await getRoleWorkbench({ roleCode: this.roleCode })
                if (res.code == 1) {
                    this.workbench = res.data || {}
                    await this.ensureInviteCode()
                } else {
                    this.loadError = this.mapBackendText(res.msg || res.message, '角色看板接口暂不可用')
                }
            } catch (error) {
                this.loadError = '角色看板接口暂不可用'
            } finally {
                this.loading = false
            }
        },
        async ensureInviteCode() {
            if (this.inviteCode && this.previewImage) return
            try {
                const res = await getPromotionInviteCode({ roleCode: this.roleCode })
                if (res.code == 1 && res.data) {
                    this.workbench = { ...this.workbench, ...res.data }
                }
            } catch (error) {}
        },
        extractPosterImage(data = {}) {
            return data.posterUrl || data.poster_url || data.poster || data.posterImage || data.poster_image || data.qr_code || data.qrCode || data.qrcode || data.qrcodeUrl || data.qrcode_url || data.image || data.imageUrl || ''
        },
        async openPoster() {
            this.posterVisible = true
            this.posterError = ''
            this.posterQrImage = ''
            this.posterImage = this.workbench.posterUrl || this.workbench.poster_url || this.workbench.qrcodeUrl || this.workbench.qrcode_url || ''
            if (this.posterImage) return
            try {
                await this.ensureInviteCode()
                const res = await getShareMnQrcode({
                    path: 'pages/index/index',
                    pagePath: 'pages/index/index',
                    scene: this.sceneText,
                    roleType: this.roleCode,
                    roleCode: this.roleCode,
                    userId: this.userId,
                    inviteCode: this.inviteCode
                })
                const posterImage = this.extractPosterImage(res.data || {})
                this.posterImage = posterImage
                if (posterImage) {
                    this.workbench = { ...this.workbench, posterUrl: posterImage }
                } else {
                    this.posterError = ''
                }
            } catch (error) {
                this.posterError = ''
            }
        },
        closePoster() {
            this.posterVisible = false
        },
        onPosterQrResult(result) {
            this.posterQrImage = typeof result === 'string' ? result : ''
        },
        copyInviteCode() {
            const value = this.inviteCode || this.sceneText
            if (!value) {
                uni.showToast({ title: '暂无可复制内容', icon: 'none' })
                return
            }
            uni.setClipboardData({
                data: value,
                success: () => uni.showToast({ title: '已复制', icon: 'success' })
            })
        },
        savePoster() {
            const image = this.posterImage || this.posterQrImage
            if (!image) {
                uni.showToast({ title: '暂无可保存图片', icon: 'none' })
                return
            }
            const saveFile = (filePath) => {
                uni.saveImageToPhotosAlbum({
                    filePath,
                    success: () => uni.showToast({ title: '已保存', icon: 'success' }),
                    fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
                })
            }
            if (!/^https?:\/\//.test(image)) {
                saveFile(image)
                return
            }
            uni.downloadFile({
                url: image,
                success: (res) => {
                    if (res.statusCode !== 200) {
                        uni.showToast({ title: '下载失败', icon: 'none' })
                        return
                    }
                    saveFile(res.tempFilePath)
                },
                fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
            })
        },
        openAction(item) {
            if (item.key === 'ledger') {
                uni.navigateTo({ url: `/business/pages/business_pages/points_ledger?roleCode=${this.roleCode}` })
                return
            }
            if (item.key === 'poster') {
                this.openPoster()
                return
            }
            if (item.key === 'fans') {
                uni.navigateTo({ url: `/bundle_misc/pages/user_fans/user_fans?roleCode=${this.roleCode}` })
                return
            }
            if (item.key === 'cashier') {
                uni.navigateTo({ url: '/bundle_misc/pages/writeoff_order/writeoff_order' })
                return
            }
            if (item.key === 'verify') {
                const merchantId = this.workbench.merchantId || this.workbench.merchant_id || this.userInfo.merchantId || this.userInfo.merchant_id || ''
                uni.navigateTo({ url: `/business/pages/business_pages/merchant_verify${merchantId ? `?merchantId=${merchantId}` : ''}` })
            }
        }
    }
}
</script>

<style lang="scss">
.role-page { min-height: 100vh; background: #fff9f0; box-sizing: border-box; }
.page-inner { width: 100%; max-width: 750rpx; margin: 0 auto; padding: 22rpx 24rpx calc(48rpx + env(safe-area-inset-bottom)); box-sizing: border-box; }
.hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rpx; min-height: 220rpx; padding: 34rpx 30rpx; border-radius: 24rpx; color: #ffffff; background: linear-gradient(135deg, #7f4c0a 0%, #d79a43 100%); box-shadow: 0 18rpx 42rpx rgba(160, 97, 13, .18); box-sizing: border-box; }
.hero--promoter { background: linear-gradient(135deg, #a0610d 0%, #f2b45f 100%); }
.hero--agent { background: linear-gradient(135deg, #6f7b2b 0%, #d79a43 100%); }
.hero--subsidiary { background: linear-gradient(135deg, #6e4a22 0%, #e0ad62 100%); }
.hero--merchant { background: linear-gradient(135deg, #a0610d 0%, #c7a64a 100%); }
.hero-main { min-width: 0; }
.hero-kicker { display: inline-flex; align-items: center; height: 42rpx; padding: 0 18rpx; border-radius: 22rpx; background: rgba(255, 255, 255, .18); font-size: 22rpx; line-height: 42rpx; }
.hero-title { margin-top: 18rpx; font-size: 42rpx; font-weight: 700; line-height: 56rpx; }
.hero-desc { margin-top: 10rpx; max-width: 430rpx; font-size: 24rpx; line-height: 34rpx; opacity: .92; }
.hero-code { flex: none; width: 172rpx; padding: 20rpx 14rpx; border-radius: 20rpx; background: rgba(255, 255, 255, .16); text-align: center; box-sizing: border-box; }
.hero-code__label { display: block; font-size: 22rpx; line-height: 30rpx; opacity: .86; }
.hero-code__value { display: block; margin-top: 8rpx; font-size: 27rpx; font-weight: 700; line-height: 36rpx; word-break: break-all; }
.state-card, .loading-card { margin-top: 20rpx; padding: 30rpx 24rpx; border-radius: 20rpx; color: #7b8494; background: #ffffff; text-align: center; font-size: 26rpx; line-height: 38rpx; }
.state-card__btn { display: inline-flex; align-items: center; justify-content: center; height: 58rpx; margin-top: 18rpx; padding: 0 30rpx; border-radius: 30rpx; color: #ffffff; background: #a0610d; }
.summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; margin-top: 20rpx; }
.summary-card { min-width: 0; min-height: 154rpx; padding: 24rpx 22rpx; border-radius: 20rpx; background: #ffffff; box-shadow: 0 10rpx 28rpx rgba(20, 36, 70, .05); box-sizing: border-box; }
.summary-label { color: #7b8494; font-size: 23rpx; line-height: 32rpx; }
.summary-value { margin-top: 10rpx; color: #1d2433; font-size: 38rpx; font-weight: 700; line-height: 48rpx; word-break: break-all; }
.summary-sub { margin-top: 6rpx; color: #9aa3b2; font-size: 22rpx; line-height: 30rpx; }
.section { margin-top: 20rpx; padding: 26rpx 24rpx; border-radius: 22rpx; background: #ffffff; box-sizing: border-box; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.section-title { color: #1d2433; font-size: 31rpx; font-weight: 700; line-height: 44rpx; }
.section-sub { margin-top: 6rpx; color: #8d96a6; font-size: 23rpx; line-height: 32rpx; }
.share-mini { flex: none; min-width: 108rpx; height: 56rpx; margin: 0; padding: 0 24rpx; border: 0; border-radius: 28rpx; color: #ffffff; background: #a0610d; font-size: 24rpx; line-height: 56rpx; }
.share-mini::after, .poster-action::after { border: 0; }
.invite-panel { display: flex; gap: 22rpx; margin-top: 24rpx; }
.invite-preview { flex: none; display: flex; align-items: center; justify-content: center; width: 180rpx; height: 180rpx; padding: 8rpx; border-radius: 20rpx; background: #fff1dc; overflow: hidden; box-sizing: border-box; }
.invite-preview__image { width: 164rpx; height: 164rpx; }
.invite-preview__empty { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 132rpx; height: 132rpx; border-radius: 18rpx; color: #a0610d; background: #ffffff; font-size: 24rpx; line-height: 34rpx; }
.invite-info { flex: 1; min-width: 0; }
.invite-title { color: #1d2433; font-size: 34rpx; font-weight: 700; line-height: 44rpx; word-break: break-all; }
.invite-desc { margin-top: 8rpx; color: #8d96a6; font-size: 22rpx; line-height: 32rpx; word-break: break-all; }
.invite-actions { display: flex; gap: 14rpx; margin-top: 20rpx; }
.invite-action { flex: 1; min-width: 0; height: 62rpx; border-radius: 32rpx; color: #a0610d; background: #fff1dc; text-align: center; font-size: 24rpx; line-height: 62rpx; }
.invite-action--primary { color: #ffffff; background: #ff9f1c; }
.metric-list { margin-top: 20rpx; border-radius: 20rpx; background: #ffffff; overflow: hidden; }
.metric-row { display: flex; align-items: center; justify-content: space-between; min-height: 94rpx; padding: 20rpx 24rpx; border-bottom: 1rpx solid #edf0f5; box-sizing: border-box; }
.metric-row:last-child { border-bottom: 0; }
.metric-row__label { color: #1d2433; font-size: 28rpx; font-weight: 600; line-height: 38rpx; }
.metric-row__sub { margin-top: 4rpx; color: #9aa3b2; font-size: 22rpx; line-height: 30rpx; }
.metric-row__value { max-width: 320rpx; margin-left: 24rpx; color: #a0610d; font-size: 30rpx; font-weight: 700; line-height: 40rpx; text-align: right; word-break: break-all; }
.entry-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-top: 22rpx; }
.entry-card { display: flex; align-items: center; min-height: 112rpx; padding: 18rpx; border-radius: 18rpx; background: #fff8ed; box-sizing: border-box; }
.entry-icon { flex: none; display: flex; align-items: center; justify-content: center; width: 58rpx; height: 58rpx; margin-right: 16rpx; border-radius: 18rpx; color: #ffffff; background: #a0610d; font-size: 25rpx; font-weight: 700; }
.entry-body { flex: 1; min-width: 0; }
.entry-title { color: #1d2433; font-size: 27rpx; font-weight: 600; line-height: 36rpx; }
.entry-desc { margin-top: 4rpx; color: #8d96a6; font-size: 21rpx; line-height: 30rpx; }
.poster-modal { position: fixed; inset: 0; z-index: 99; }
.poster-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, .55); }
.poster-sheet { position: absolute; left: 28rpx; right: 28rpx; top: 10vh; max-width: 694rpx; margin: 0 auto; padding: 30rpx 26rpx; border-radius: 26rpx; background: #ffffff; box-sizing: border-box; }
.poster-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; }
.poster-title { color: #1d2433; font-size: 33rpx; font-weight: 700; line-height: 44rpx; }
.poster-subtitle { margin-top: 6rpx; color: #8d96a6; font-size: 23rpx; line-height: 32rpx; word-break: break-all; }
.poster-close { flex: none; display: flex; align-items: center; justify-content: center; width: 54rpx; height: 54rpx; border-radius: 50%; color: #7b8494; background: #fff8ed; font-size: 38rpx; line-height: 54rpx; }
.poster-image { display: block; width: 100%; height: 520rpx; max-height: 60vh; margin-top: 26rpx; border-radius: 20rpx; background: #fff8ed; }
.poster-empty { display: flex; align-items: center; justify-content: center; height: 420rpx; margin-top: 26rpx; border-radius: 20rpx; color: #8d96a6; background: #fff8ed; font-size: 26rpx; }
.poster-qr { display: flex; align-items: center; justify-content: center; height: 420rpx; margin-top: 26rpx; border-radius: 20rpx; background: linear-gradient(180deg, #fff8ed, #ffffff); border: 1rpx solid #f0dcc0; box-sizing: border-box; }
.poster-scene { margin-top: 18rpx; color: #9aa3b2; font-size: 21rpx; line-height: 30rpx; word-break: break-all; }
.poster-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.poster-action { flex: 1; height: 76rpx; margin: 0; border-radius: 38rpx; color: #a0610d; background: #fff1dc; font-size: 26rpx; line-height: 76rpx; }
.poster-action--primary { color: #ffffff; background: #a0610d; }
.line2 { display: -webkit-box; overflow: hidden; text-overflow: ellipsis; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

@media screen and (min-width: 900px) {
    .summary-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .entry-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
