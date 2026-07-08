<template>
    <view class="kyc-page" :style="{ backgroundImage: `url(${kycAssets.pageBg})` }">
        <view class="kyc-hero" :style="{ backgroundImage: `url(${kycAssets.headerBg})` }">
            <view class="kyc-back-btn" @tap="goBack">
                <view class="kyc-back-arrow"></view>
            </view>
            <text class="kyc-title">用户KYC</text>
            <text class="kyc-subtitle">{{ statusSubtitle }}</text>
            <image class="kyc-hero-img" :src="kycAssets.heroIllustration" mode="aspectFit"></image>
        </view>

        <view class="kyc-card">
            <view v-if="loading" class="kyc-empty">加载中...</view>
            <template v-else>
                <view :class="['status-box', 'status-box--' + statusType]">
                    <view>
                        <view class="status-title">{{ statusText }}</view>
                        <view class="status-desc">{{ statusSubtitle }}</view>
                        <view class="status-desc" v-if="statusMessage">{{ statusMessage }}</view>
                        <view class="status-desc" v-if="statusInfo.lastSubmitTime">提交时间：{{ statusInfo.lastSubmitTime }}</view>
                    </view>
                </view>

                <view class="form-row">
                    <text class="form-label">姓名</text>
                    <input class="form-input" v-model="form.realName" :disabled="readOnly" placeholder="请输入真实姓名" placeholder-class="placeholder" />
                </view>
                <view class="line"></view>
                <view class="form-row">
                    <text class="form-label">证件类型</text>
                    <view class="form-picker">身份证</view>
                </view>
                <view class="line"></view>
                <view class="form-row">
                    <text class="form-label">证件号码</text>
                    <input class="form-input" v-model="form.certNo" :disabled="readOnly" placeholder="请输入证件号码" placeholder-class="placeholder" />
                </view>
                <view class="line"></view>

                <view class="photo-title">证件照片</view>
                <view class="photo-list">
                    <view class="photo-box" :style="{ backgroundImage: `url(${kycAssets.photoFrontBg})` }" @tap="chooseImage('certFrontUrl')">
                        <image v-if="form.certFrontUrl" class="photo-img" :src="form.certFrontUrl" mode="aspectFill"></image>
                        <image v-else class="photo-placeholder-icon" :src="kycAssets.uploadIcon" mode="aspectFit"></image>
                    </view>
                    <view class="photo-box" :style="{ backgroundImage: `url(${kycAssets.photoBackBg})` }" @tap="chooseImage('certBackUrl')">
                        <image v-if="form.certBackUrl" class="photo-img" :src="form.certBackUrl" mode="aspectFill"></image>
                        <view v-else class="photo-plus-wrap">
                            <image class="photo-plus-icon" :src="kycAssets.plusIcon" mode="aspectFit"></image>
                        </view>
                    </view>
                </view>

                <button v-if="canSubmit" class="submit-btn" :loading="submitting" @tap="submit">{{ submitText }}</button>
                <button v-else class="submit-btn submit-btn--plain" @tap="refreshStatus">刷新状态</button>
            </template>
        </view>
    </view>
</template>

<script>
import { submitKyc, getKycStatus } from '@/api/user'
import { uploadFile } from '@/utils/tools'
import { formatKycStatusText, localizeBackendText, normalizeKycStatus } from '@/utils/backend-text'

const KYC_ASSETS = {
    backIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/4319d1ba5ac6419ea63a5fa32f7ce9dd/kyc_back_icon-097ab946dbaa04397e2e5764e5ce75da.png',
    pageBg: 'https://shengyuan.store/api/miniapp/files/miniapp/34a5b1926f48421cab099da90818f6ab/kyc_page_bg-b9e7de2c995ec4fb96c591809908a10d.png',
    headerBg: 'https://shengyuan.store/api/miniapp/files/miniapp/cf66415bf11441ca96eb58ecdfcaa419/kyc_header_bg-033bdca85e38f41ccfbda94133198053.png',
    heroIllustration: 'https://shengyuan.store/api/miniapp/files/miniapp/2668ecfb67e44216b32b672605d879ed/kyc_hero_illustration-447f889fdd7aba2d9c33e93eeb15e50b.png',
    uploadIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/4e0997cbf20e4dada514532ec3f0b327/kyc_upload_icon-55f17afc942884185b55bbcecd87de64.png',
    plusIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/0e3eb700081d496093648bc6b04d8c6d/kyc_plus_icon-ac126f69b68c9ba9c828f7e0d04cc427.png',
    photoFrontBg: 'https://shengyuan.store/api/miniapp/files/miniapp/73f494794de84fd4be4a4b224d535dff/kyc_photo_front_bg-7cfc48b4017c60cab0cd1f4dfe85fa05.png',
    photoBackBg: 'https://shengyuan.store/api/miniapp/files/miniapp/b5ab465327674382843897e9739f4239/kyc_photo_back_bg-e46b78fd9e4096a3a4374942a753e7e5.png'
}

export default {
    data() {
        return {
            kycAssets: KYC_ASSETS,
            loading: true,
            loadError: '',
            submitting: false,
            statusInfo: {},
            form: {
                realName: '',
                certType: 'ID_CARD',
                certNo: '',
                certFrontUrl: '',
                certBackUrl: ''
            }
        }
    },
    computed: {
        normalizedStatus() {
            return normalizeKycStatus(this.statusInfo.kycStatus || this.statusInfo.kyc_status || 'NOT_SUBMITTED')
        },
        statusType() {
            if (this.normalizedStatus === 'APPROVED') return 'approved'
            if (this.normalizedStatus === 'PENDING_AUDIT') return 'pending'
            if (this.normalizedStatus === 'REJECTED') return 'rejected'
            return 'empty'
        },
        statusText() {
            return formatKycStatusText(this.normalizedStatus)
        },
        statusSubtitle() {
            if (this.statusType === 'pending') return '资料已提交，等待平台审核'
            if (this.statusType === 'approved') return '实名资料已认证通过'
            if (this.statusType === 'rejected') return '请按驳回原因重新提交'
            return '当前账号未提交实名认证，请填写资料后提交'
        },
        statusMessage() {
            const raw = this.statusInfo.rejectReasonMessage || this.statusInfo.reject_reason_message || this.statusInfo.rejectReasonCode || this.statusInfo.reject_reason_code || this.statusInfo.auditMessage || this.statusInfo.audit_message || ''
            return localizeBackendText(raw, this.statusType === 'rejected' ? '实名审核未通过，请重新提交资料' : '')
        },
        readOnly() {
            return this.statusType === 'pending' || this.statusType === 'approved'
        },
        canSubmit() {
            return this.statusType === 'empty' || this.statusType === 'rejected'
        },
        submitText() {
            return this.statusType === 'rejected' ? '重新提交申请' : '提交申请'
        }
    },
    onLoad() {
        this.refreshStatus()
    },
    methods: {
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) uni.navigateBack()
            else uni.switchTab({ url: '/pages/user/user' })
        },
        fillForm(data = {}) {
            this.form.realName = data.realName || data.real_name || ''
            this.form.certNo = data.certNo || data.cert_no || ''
            this.form.certType = 'ID_CARD'
            this.form.certFrontUrl = data.certFrontUrl || data.cert_front_url || ''
            this.form.certBackUrl = data.certBackUrl || data.cert_back_url || ''
        },
        async refreshStatus() {
            this.loading = true
            this.loadError = ''
            try {
                const res = await getKycStatus()
                if (res.code == 1) {
                    this.statusInfo = res.data || {}
                    this.fillForm(this.statusInfo)
                } else {
                    this.applyStatusFallback(res.msg || res.message || '状态接口暂不可用')
                }
            } catch (error) {
                this.applyStatusFallback((error && error.message) || '状态接口暂不可用')
            } finally {
                this.loading = false
            }
        },
        applyStatusFallback(message = '') {
            this.statusInfo = {
                kycStatus: 'NOT_SUBMITTED',
                kyc_status: 'NOT_SUBMITTED'
            }
            this.fillForm(this.statusInfo)
            this.loadError = ''
        },
        async chooseImage(field) {
            if (this.readOnly) return
            try {
                const result = await uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] })
                const chooseRes = Array.isArray(result) ? result[1] : result
                const path = chooseRes && chooseRes.tempFilePaths && chooseRes.tempFilePaths[0]
                if (!path) return
                uni.showLoading({ title: '上传中' })
                const file = await uploadFile(path)
                this.form[field] = file.url || file.uri || file.fileUrl || file.file_url || ''
            } catch (error) {
                uni.showToast({ title: '图片上传失败', icon: 'none' })
            } finally {
                uni.hideLoading()
            }
        },
        validate() {
            if (!this.form.realName.trim()) return '请输入真实姓名'
            if (!this.form.certNo.trim()) return '请输入证件号码'
            if (!this.form.certFrontUrl || !this.form.certBackUrl) return '请上传证件照片'
            return ''
        },
        async submit() {
            if (this.submitting) return
            const message = this.validate()
            if (message) {
                uni.showToast({ title: message, icon: 'none' })
                return
            }
            this.submitting = true
            try {
                const res = await submitKyc({
                    realName: this.form.realName.trim(),
                    certType: this.form.certType,
                    certNo: this.form.certNo.trim(),
                    certFrontUrl: this.form.certFrontUrl,
                    certBackUrl: this.form.certBackUrl,
                    requestNo: `kyc-${Date.now()}`
                })
                if (res.code == 1) {
                    uni.showToast({ title: '申请已提交', icon: 'success' })
                    await this.refreshStatus()
                } else {
                    uni.showToast({ title: localizeBackendText(res.msg || res.message, '提交失败'), icon: 'none' })
                }
            } catch (error) {
                uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>

<style lang="scss">
.kyc-page { min-height: 100vh; background-color: #f5f7fb; background-repeat: no-repeat; background-position: center top; background-size: 100% 100%; overflow: hidden; }
.kyc-hero { position: relative; height: 385rpx; padding: calc(var(--status-bar-height) + 41rpx) 24rpx 0; background-repeat: no-repeat; background-position: center top; background-size: 100% 277rpx; box-sizing: border-box; overflow: hidden; }
.kyc-back-btn { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255, 255, 255, .86); box-shadow: 0 10rpx 26rpx rgba(3, 125, 250, .12); }
.kyc-back-arrow { width: 18rpx; height: 18rpx; border-left: 4rpx solid #1f2937; border-bottom: 4rpx solid #1f2937; transform: rotate(45deg); margin-left: 6rpx; box-sizing: border-box; }
.kyc-title { display: block; margin-top: 82rpx; color: #222222; font-size: 44rpx; font-weight: 700; line-height: 44rpx; }
.kyc-subtitle { position: absolute; left: 26rpx; top: 303rpx; z-index: 2; display: block; max-width: 360rpx; color: #222222; font-size: 26rpx; line-height: 26rpx; }
.kyc-hero-img { position: absolute; right: 42rpx; top: 200rpx; z-index: 2; width: 226rpx; height: 184rpx; }
.kyc-card { min-height: calc(100vh - 384rpx); margin-top: 0; padding: 36rpx 24rpx 64rpx; border: 2rpx solid #ffffff; border-radius: 30rpx 30rpx 0 0; background: #ffffff; box-sizing: border-box; position: relative; z-index: 1; }
.kyc-empty { padding: 90rpx 0; text-align: center; color: #999999; font-size: 28rpx; }
.kyc-empty__title { display: block; color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; }
.kyc-empty__desc { display: block; margin: 12rpx auto 0; max-width: 600rpx; color: #888888; font-size: 25rpx; line-height: 38rpx; }
.retry-btn { display: flex; align-items: center; justify-content: center; width: 260rpx; height: 72rpx; margin: 30rpx auto 0; border-radius: 36rpx; color: #ffffff; background: #037dfa; font-size: 26rpx; }
.status-box { margin-bottom: 24rpx; padding: 22rpx 24rpx; border-radius: 20rpx; background: #f2f8ff; }
.status-box--approved { background: #f0fff7; }
.status-box--rejected { background: #fff5f3; }
.status-title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; }
.status-desc { margin-top: 8rpx; color: #666666; font-size: 24rpx; line-height: 34rpx; }
.form-row { display: flex; align-items: center; justify-content: space-between; min-height: 99rpx; padding: 0 2rpx 0 1rpx; box-sizing: border-box; }
.form-label { flex: none; width: 170rpx; color: #222222; font-size: 28rpx; font-weight: 500; line-height: 28rpx; }
.form-input, .form-picker { flex: 1; min-width: 0; color: #222222; font-size: 28rpx; line-height: 28rpx; text-align: right; }
.placeholder { color: #bfbfbf; }
.line { height: 1rpx; background: #eeeeee; }
.photo-title { margin-top: 30rpx; color: #222222; font-size: 28rpx; font-weight: 500; line-height: 28rpx; }
.photo-list { display: flex; justify-content: space-between; width: 648rpx; max-width: 100%; margin-top: 24rpx; }
.photo-box { flex: none; width: 301rpx; height: 192rpx; border-radius: 0; background-repeat: no-repeat; background-position: center; background-size: 100% 100%; overflow: hidden; }
.photo-img { width: 100%; height: 100%; }
.photo-placeholder-icon { display: block; width: 69rpx; height: 69rpx; margin: 62rpx auto 0; }
.photo-plus-wrap { display: flex; align-items: center; justify-content: center; width: 67rpx; height: 67rpx; margin: 64rpx auto 0; border-radius: 50%; background: #037dfa; }
.photo-plus-icon { width: 30rpx; height: 29rpx; }
.submit-btn { display: flex; align-items: center; justify-content: center; width: 582rpx; max-width: 100%; height: 81rpx; margin: 56rpx auto 0; border-radius: 40rpx; color: #ffffff; background: #037dfa; font-size: 28rpx; font-weight: 500; line-height: 81rpx; }
.submit-btn--plain { color: #037dfa; background: #edf7ff; }
</style>
