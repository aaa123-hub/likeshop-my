<template>
    <view class="verify-page">
        <navbar title="商家核销" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>
        <view class="panel">
            <view class="title">扫码核销自提订单</view>
            <view class="desc">扫描客户订单里的核销二维码，系统会自动完成核销。</view>
            <button class="scan-btn" @tap="scanCode">扫一扫</button>
        </view>
        <view class="form">
            <view class="field">
                <text>子订单号</text>
                <input v-model="form.subOrderNo" placeholder="二维码未包含时可不填" />
            </view>
            <view class="field">
                <text>核销码</text>
                <input v-model="form.verifyCode" placeholder="请输入或扫码获取" />
            </view>
            <button class="submit-btn" :disabled="submitting" @tap="submitVerify">
                {{ submitting ? '核销中...' : '确认核销' }}
            </button>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@/components/navbar/navbar.vue'
import { merchantVerifyOrder } from '@/api/order'

export default {
    components: { Navbar },
    data() {
        return {
            form: {
                subOrderNo: '',
                verifyCode: '',
                merchantId: ''
            },
            submitting: false
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        userId() {
            return this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
        }
    },
    onLoad(options = {}) {
        this.form.merchantId = options.merchantId || options.merchant_id || this.userInfo.merchantId || this.userInfo.merchant_id || ''
    },
    methods: {
        scanCode() {
            uni.scanCode({
                onlyFromCamera: false,
                success: (res) => {
                    this.applyScanResult(res.result || res.path || '')
                    if (this.form.verifyCode) this.submitVerify()
                },
                fail: () => uni.showToast({ title: '扫码未完成', icon: 'none' })
            })
        },
        applyScanResult(raw = '') {
            const value = decodeURIComponent(String(raw || ''))
            const query = value.includes('?') ? value.split('?')[1] : value
            const pairs = {}
            query.split(/[&;]/).forEach((part) => {
                const [key, val] = part.split('=')
                if (key) pairs[key] = val || ''
            })
            const scene = pairs.scene || pairs.qrScene || pairs.qr_scene || ''
            if (scene) {
                decodeURIComponent(scene).split(/[&;]/).forEach((part) => {
                    const [key, val] = part.split('=')
                    if (key && !pairs[key]) pairs[key] = val || ''
                })
            }
            this.form.subOrderNo = pairs.subOrderNo || pairs.sub_order_no || pairs.orderNo || pairs.order_no || pairs.orderSn || pairs.order_sn || pairs.bizOrderNo || pairs.biz_order_no || this.findToken(value, /(SO|SUB|OS)[A-Z0-9]{6,}/i) || this.form.subOrderNo
            this.form.verifyCode = pairs.verifyCode || pairs.verify_code || pairs.pickupCode || pairs.pickup_code || pairs.code || pairs.qrCode || pairs.qr_code || this.findToken(value, /(?:verifyCode|verify_code|pickupCode|pickup_code|code)[:=]?([A-Z0-9_-]{4,64})/i) || this.form.verifyCode
            if (!this.form.verifyCode && /^[A-Za-z0-9_-]{4,64}$/.test(value)) this.form.verifyCode = value
        },
        findToken(value, pattern) {
            const matched = String(value || '').match(pattern)
            return matched ? (matched[1] || matched[0]) : ''
        },
        async submitVerify() {
            if (!this.form.verifyCode) {
                uni.showToast({ title: '请先扫码或填写核销码', icon: 'none' })
                return
            }
            this.submitting = true
            try {
                const res = await merchantVerifyOrder({
                    ...this.form,
                    operatorId: this.userId
                })
                if (res.code == 1) {
                    uni.showToast({ title: '核销成功', icon: 'success' })
                    this.form.subOrderNo = ''
                    this.form.verifyCode = ''
                    return
                }
                uni.showToast({ title: res.msg || res.message || '核销失败', icon: 'none' })
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>

<style lang="scss">
.verify-page { min-height: 100vh; padding: 24rpx; background: #fff9f0; box-sizing: border-box; }
.panel, .form { margin-top: 24rpx; padding: 32rpx; border-radius: 20rpx; background: #ffffff; }
.title { color: #222222; font-size: 34rpx; font-weight: 700; }
.desc { margin-top: 12rpx; color: #777777; font-size: 26rpx; line-height: 38rpx; }
.scan-btn, .submit-btn { margin-top: 28rpx; height: 84rpx; border-radius: 42rpx; color: #ffffff; background: #a0610d; font-size: 30rpx; line-height: 84rpx; }
.field { padding: 20rpx 0; border-bottom: 1rpx solid #edf0f5; }
.field text { display: block; color: #555555; font-size: 24rpx; }
.field input { margin-top: 12rpx; height: 56rpx; color: #222222; font-size: 28rpx; }
.submit-btn[disabled] { opacity: .65; }
</style>
