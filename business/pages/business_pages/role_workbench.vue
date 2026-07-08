<template>
    <view class="role-page">
        <navbar :title="roleLabel + '工作台'" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>
        <view class="hero">
            <view class="hero-title">{{ roleLabel }}工作台</view>
            <view class="hero-desc">当前身份的数据看板与吸粉码入口</view>
        </view>

        <view class="metrics">
            <view class="metric-item">
                <text class="metric-label">可用积分</text>
                <text class="metric-value">{{ displayNumber(workbench.availablePoints) }}</text>
            </view>
            <view class="metric-item">
                <text class="metric-label">冻结中积分</text>
                <text class="metric-value">{{ displayNumber(workbench.frozenPoints) }}</text>
            </view>
            <view class="metric-item">
                <text class="metric-label">今日预计分润</text>
                <text class="metric-value">{{ displayNumber(workbench.todayProfit) }}</text>
            </view>
        </view>

        <view class="invite-card" @tap="openPoster">
            <view>
                <view class="invite-title">我的专属吸粉码</view>
                <view class="invite-desc">邀请粉丝/商家绑定当前角色</view>
            </view>
            <view class="invite-btn">生成海报</view>
        </view>

        <view class="entry-list">
            <view class="entry-item" @tap="goLedger">
                <text>积分收入明细</text>
                <text class="entry-arrow">›</text>
            </view>
            <view class="entry-item" v-if="roleCode === 'MERCHANT'" @tap="goMerchantCashier">
                <text>线下核销/收款计算器</text>
                <text class="entry-arrow">›</text>
            </view>
        </view>

        <view v-if="loading" class="empty">加载中...</view>
        <view v-else-if="loadError" class="empty">{{ loadError }}</view>

        <view v-if="posterVisible" class="poster-modal">
            <view class="poster-mask" @tap="posterVisible = false"></view>
            <view class="poster-sheet">
                <view class="poster-title">专属吸粉码</view>
                <view class="poster-subtitle">scene=uid_{{ userId }}&role={{ roleCode }}</view>
                <image v-if="posterImage" class="poster-image" :src="posterImage" mode="aspectFit"></image>
                <view v-else class="poster-empty">{{ posterError || '正在生成...' }}</view>
                <view class="poster-actions">
                    <button class="poster-action" open-type="share">分享好友</button>
                    <button class="poster-action poster-action--primary" @tap="savePoster">保存至相册</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@/components/navbar/navbar.vue'
import { getRoleWorkbench } from '@/api/user'
import { getShareMnQrcode } from '@/api/app'

export default {
    components: { Navbar },
    data() {
        return {
            roleCode: 'PROMOTER',
            workbench: {},
            loading: false,
            loadError: '',
            posterVisible: false,
            posterImage: '',
            posterError: ''
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        userId() {
            return this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
        },
        roleLabel() {
            const map = { PROMOTER: '推广者', AGENT: '区域代理', SUBSIDIARY: '子公司', HQ: '总部', MERCHANT: '商家' }
            return map[this.roleCode] || this.roleCode
        }
    },
    onLoad(options = {}) {
        this.roleCode = this.normalizeRoleCode(options.roleCode || options.role || 'PROMOTER')
        this.loadWorkbench()
    },
    onShareAppMessage() {
        const inviteCode = this.workbench.inviteCode || this.userInfo.promoter_code || this.userInfo.distribution_code || ''
        const scene = encodeURIComponent(this.buildScene(inviteCode))
        return {
            title: `${this.roleLabel}邀请`,
            path: `/pages/index/index?scene=${scene}`,
            imageUrl: this.posterImage || ''
        }
    },
    methods: {
        normalizeRoleCode(roleCode) {
            const code = String(roleCode || '').toUpperCase()
            const map = { HEADQUARTERS: 'HQ', OPERATION_CENTER: 'AGENT' }
            return map[code] || code
        },
        displayNumber(value) {
            if (value === undefined || value === null || value === '') return '0'
            return String(value)
        },
        buildScene(inviteCode = '') {
            return `uid_${this.userId}&role=${this.roleCode}${inviteCode ? `&invite_code=${inviteCode}` : ''}`
        },
        async loadWorkbench() {
            this.loading = true
            this.loadError = ''
            try {
                const res = await getRoleWorkbench({ roleCode: this.roleCode })
                if (res.code == 1) {
                    this.workbench = res.data || {}
                } else {
                    this.loadError = res.msg || res.message || '角色看板接口暂不可用'
                }
            } catch (error) {
                this.loadError = '角色看板接口暂不可用'
            } finally {
                this.loading = false
            }
        },
        async openPoster() {
            this.posterVisible = true
            this.posterError = ''
            this.posterImage = this.workbench.posterUrl || this.workbench.qrcodeUrl || ''
            if (this.posterImage) return
            try {
                const inviteCode = this.workbench.inviteCode || this.userInfo.promoter_code || this.userInfo.distribution_code || ''
                const scene = this.buildScene(inviteCode)
                const res = await getShareMnQrcode({
                    path: 'pages/index/index',
                    pagePath: 'pages/index/index',
                    scene,
                    roleType: this.roleCode,
                    roleCode: this.roleCode,
                    userId: this.userId
                })
                const data = res.data || {}
                this.posterImage = data.posterUrl || data.poster_url || data.poster || data.posterImage || data.poster_image || data.qr_code || data.qrCode || data.qrcode || data.qrcodeUrl || data.qrcode_url || data.image || ''
                if (!this.posterImage) this.posterError = '后端未返回吸粉码图片'
            } catch (error) {
                this.posterError = '生成吸粉码失败'
            }
        },
        savePoster() {
            if (!this.posterImage) {
                uni.showToast({ title: '暂无可保存图片', icon: 'none' })
                return
            }
            uni.downloadFile({
                url: this.posterImage,
                success: (res) => {
                    if (res.statusCode !== 200) {
                        uni.showToast({ title: '下载失败', icon: 'none' })
                        return
                    }
                    uni.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => uni.showToast({ title: '已保存', icon: 'success' }),
                        fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
                    })
                },
                fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
            })
        },
        goLedger() {
            uni.navigateTo({ url: `/business/pages/business_pages/points_ledger?roleCode=${this.roleCode}` })
        },
        goMerchantCashier() {
            uni.navigateTo({ url: '/business/pages/business_pages/face_pay' })
        }
    }
}
</script>

<style lang="scss">
.role-page { min-height: 100vh; padding: 24rpx; background: #f6f8fb; box-sizing: border-box; }
.hero { padding: 34rpx 30rpx; border-radius: 24rpx; color: #ffffff; background: linear-gradient(135deg, #1677ff 0%, #12b886 100%); }
.hero-title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.hero-desc { margin-top: 10rpx; font-size: 25rpx; opacity: .9; }
.metrics { display: flex; gap: 16rpx; margin-top: 22rpx; }
.metric-item { flex: 1; min-width: 0; padding: 24rpx 14rpx; border-radius: 20rpx; background: #ffffff; text-align: center; box-shadow: 0 10rpx 26rpx rgba(25, 47, 89, .06); }
.metric-label { display: block; color: #777777; font-size: 22rpx; line-height: 32rpx; }
.metric-value { display: block; margin-top: 10rpx; color: #222222; font-size: 34rpx; font-weight: 700; line-height: 42rpx; }
.invite-card { display: flex; align-items: center; justify-content: space-between; margin-top: 22rpx; padding: 32rpx 28rpx; border-radius: 24rpx; background: linear-gradient(135deg, #fff6e8, #ffffff); border: 1rpx solid #ffd8a8; }
.invite-title { color: #222222; font-size: 32rpx; font-weight: 700; }
.invite-desc { margin-top: 8rpx; color: #8a5a22; font-size: 24rpx; }
.invite-btn { flex: none; padding: 0 24rpx; height: 60rpx; border-radius: 30rpx; color: #ffffff; background: #ff9f1c; font-size: 24rpx; line-height: 60rpx; }
.entry-list { margin-top: 22rpx; border-radius: 20rpx; background: #ffffff; overflow: hidden; }
.entry-item { display: flex; align-items: center; justify-content: space-between; min-height: 92rpx; padding: 0 28rpx; border-bottom: 1rpx solid #f0f1f3; color: #222222; font-size: 28rpx; }
.entry-arrow { color: #aaaaaa; font-size: 40rpx; }
.empty { margin-top: 22rpx; padding: 40rpx 20rpx; color: #888888; background: #ffffff; border-radius: 20rpx; text-align: center; font-size: 26rpx; }
.poster-modal { position: fixed; inset: 0; z-index: 99; }
.poster-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, .55); }
.poster-sheet { position: absolute; left: 36rpx; right: 36rpx; top: 15vh; padding: 34rpx 28rpx; border-radius: 28rpx; background: #ffffff; text-align: center; }
.poster-title { color: #222222; font-size: 34rpx; font-weight: 700; }
.poster-subtitle { margin-top: 10rpx; color: #777777; font-size: 22rpx; }
.poster-image { width: 420rpx; height: 420rpx; margin-top: 28rpx; }
.poster-empty { display: flex; align-items: center; justify-content: center; height: 360rpx; margin-top: 28rpx; color: #999999; background: #f6f8fb; border-radius: 20rpx; font-size: 26rpx; }
.poster-actions { display: flex; gap: 18rpx; margin-top: 30rpx; }
.poster-action { flex: 1; height: 76rpx; border-radius: 38rpx; color: #1677ff; background: #eef7ff; font-size: 27rpx; line-height: 76rpx; }
.poster-action--primary { color: #ffffff; background: #1677ff; }
</style>
