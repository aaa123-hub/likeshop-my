<template>
    <view class="license">
        <view class="license-bg"></view>
        <navbar title="商家资质" :background="{ background: 'transparent' }" title-color="#ffffff"></navbar>
        <view class="license-header">
            <view class="license-header__title">商家资质认证</view>
            <view class="license-header__desc">完善门店信息后提交平台审核</view>
        </view>
        <view class="license-status" v-if="auditStatus">
            <view class="license-status__label">申请状态</view>
            <view class="license-status__value" :class="statusClass">{{ statusText }}</view>
            <view class="license-status__remark" v-if="statusRemark">{{ statusRemark }}</view>
            <view class="license-status__time" v-if="statusTime">{{ statusTime }}</view>
        </view>
        <view class="license-card">
            <view class="license-item">
                <view class="license-item__label">店铺名称</view>
                <input class="license-item__input" v-model="form.merchantName" placeholder="请输入您的店铺名称" placeholder-class="license-placeholder" />
            </view>
            <view class="license-item">
                <view class="license-item__label">联系电话</view>
                <input class="license-item__input" v-model="form.contactMobile" type="number" maxlength="11" placeholder="请输入您的电话" placeholder-class="license-placeholder" />
            </view>
            <view class="license-item">
                <view class="license-item__label">电子邮箱</view>
                <input class="license-item__input" v-model="form.email" placeholder="请输入您的电子邮箱" placeholder-class="license-placeholder" />
            </view>
        </view>
        <view class="license-extra">
            <view class="license-desc">
                <view class="license-desc__title">网店说明</view>
                <textarea class="license-desc__textarea" v-model="form.remark" placeholder="请输入网店说明" placeholder-class="license-placeholder" maxlength="200"></textarea>
                <view class="license-desc__count">{{ form.remark.length }}/200</view>
            </view>
        </view>
        <view class="license-btn" :class="{ 'license-btn--disabled': submitting }" @tap="submitApply">{{ submitting ? '提交中...' : submitButtonText }}</view>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
    import { mapGetters } from "vuex"
    import {
        applyMerchantQualification,
        getMerchantQualificationStatus
	} from "@/api/user";
    const defaultQualificationUrl = 'https://shengyuan.store/api/miniapp/files/miniapp/7d58e17458874d54b2452a10998cd590/22-merchant-license.png'
    export default {
	components: {
		Navbar
	},
        data() {
            return {
                form: {
                    merchantName: '',
                    contactMobile: '',
                    email: '',
                    settlementAccountNo: '',
                    qualificationUrl: defaultQualificationUrl,
                    remark: ''
                },
                status: {},
                submitting: false
            }
        },
        computed: {
            ...mapGetters(['userInfo']),
            userId() {
                return this.userInfo.user_id || this.userInfo.userId || this.userInfo.id
            },
            auditStatus() {
                return this.status.audit_status || this.status.auditStatus || this.status.status
            },
            statusRemark() {
                return this.status.audit_remark || this.status.auditRemark || this.status.remark || ''
            },
            statusTime() {
                return this.status.updated_at || this.status.updatedAt || this.status.updateTime || this.status.createTime || ''
            },
            statusText() {
                const statusMap = {
                    PENDING: '审核中',
                    AUDITING: '审核中',
                    APPROVED: '已通过',
                    PASS: '已通过',
                    REJECTED: '未通过',
                    REJECT: '未通过'
                }
                return statusMap[this.auditStatus] || this.auditStatus
            },
            statusClass() {
                const status = this.auditStatus
                if (status === 'APPROVED' || status === 'PASS') return 'license-status__value--success'
                if (status === 'REJECTED' || status === 'REJECT') return 'license-status__value--danger'
                return 'license-status__value--pending'
            },
            submitButtonText() {
                return this.auditStatus ? '重新提交' : '去开通'
            }
        },
        methods: {
            pickValue(source, keys) {
                for (const key of keys) {
                    if (source[key] !== undefined && source[key] !== null && source[key] !== '') return source[key]
                }
                return ''
            },
            getStatus() {
                if (!this.userId) return
                getMerchantQualificationStatus({ userId: this.userId }).then(res => {
                    if (res.code == 1 && res.data) {
                        this.status = res.data
                        this.form.merchantName = this.pickValue(res.data, ['merchantName', 'merchant_name', 'shopName', 'shop_name', 'storeName']) || this.form.merchantName
                        this.form.contactMobile = this.pickValue(res.data, ['contactMobile', 'contact_mobile', 'mobile', 'phone']) || this.form.contactMobile
                        this.form.email = this.pickValue(res.data, ['email', 'merchantEmail', 'merchant_email', 'contactEmail', 'contact_email', 'settlementAccountNo', 'settlement_account_no']) || this.form.email
                        this.form.settlementAccountNo = this.pickValue(res.data, ['settlementAccountNo', 'settlement_account_no', 'email', 'merchantEmail', 'merchant_email']) || this.form.settlementAccountNo
                        this.form.qualificationUrl = this.pickValue(res.data, ['qualificationUrl', 'qualification_url']) || this.form.qualificationUrl
                        this.form.remark = this.pickValue(res.data, ['remark', 'description', 'shopDescription', 'shop_description', 'storeDescription', 'store_description']) || this.form.remark
                    }
                })
            },
            validateForm() {
                if (!this.userId) return '请先登录'
                if (!this.form.merchantName.trim()) return '请输入店铺名称'
                if (!this.form.contactMobile.trim()) return '请输入联系电话'
                return ''
            },
            submitApply() {
                if (this.submitting) return
                const message = this.validateForm()
                if (message) {
                    this.$toast({ title: message })
                    return
                }
                this.submitting = true
                applyMerchantQualification({
                    userId: this.userId,
                    merchantName: this.form.merchantName.trim(),
                    contactMobile: this.form.contactMobile.trim(),
                    email: this.form.email.trim(),
                    settlementAccountNo: (this.form.settlementAccountNo || this.form.email).trim(),
                    qualificationUrl: this.form.qualificationUrl || defaultQualificationUrl,
                    remark: this.form.remark.trim()
                }).then(res => {
                    if (res.code == 1) {
                        this.$toast({ title: '提交成功' })
                        this.getStatus()
                    }
                }).finally(() => {
                    this.submitting = false
                })
            }
        },
        onLoad() {
            this.$store.dispatch('getUser').then(() => {
                this.getStatus()
            })
        },
        onShow() {
            if (!this.userId) {
                this.$store.dispatch('getUser').then(() => {
                    this.getStatus()
                })
                return
            }
            this.getStatus()
        }
    }
</script>

<style lang="scss">
    .license {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100vh;
        min-height: 100vh;
        padding: 0 24rpx calc(24rpx + env(safe-area-inset-bottom));
        box-sizing: border-box;
        overflow: hidden;
        background: #f7f8fa;

        > *:not(.license-bg) {
            position: relative;
            z-index: 2;
        }
    }

    .license-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 430rpx;
            z-index: 0;
            background: url('https://shengyuan.store/api/miniapp/files/miniapp/3197896ad4914e239b78b2ab24a6822a/ead6bedfc9b4f66aa345e91ae43fb231.png') center top / cover no-repeat;
            pointer-events: none;
    }

    .license-header {
        flex: none;
        z-index: 3;
        height: 196rpx;
        padding-top: 50rpx;
        box-sizing: border-box;
        color: #ffffff;
    }

    .license-header__title {
        font-size: 40rpx;
        font-weight: 700;
        line-height: 56rpx;
    }

    .license-header__desc {
        margin-top: 10rpx;
        font-size: 26rpx;
        line-height: 36rpx;
        opacity: 0.9;
    }

    .license-card,
    .license-desc {
        background: #ffffff;
        border-radius: 24rpx;
        overflow: hidden;
    }

    .license-card {
        flex: none;
        margin-top: 0;
        box-shadow: 0 10rpx 28rpx rgba(31, 122, 244, 0.08);
    }

    .license-status {
        flex: none;
        z-index: 3;
        margin: 6rpx 0 18rpx;
        padding: 16rpx 24rpx;
        background: rgba(255, 255, 255, 0.96);
        border-radius: 20rpx;
        box-shadow: 0 10rpx 28rpx rgba(31, 122, 244, 0.1);
    }

    .license-status__label {
        font-size: 28rpx;
        color: #666666;
    }

    .license-status__value {
        margin-top: 12rpx;
        font-size: 34rpx;
        font-weight: 600;
    }

    .license-status__value--pending {
        color: #1f7af4;
    }

    .license-status__value--success {
        color: #18a058;
    }

    .license-status__value--danger {
        color: #e5484d;
    }

    .license-status__remark,
    .license-status__time {
        margin-top: 12rpx;
        font-size: 26rpx;
        line-height: 38rpx;
        color: #8a8f99;
    }

    .license-item {
        display: flex;
        align-items: center;
        min-height: 82rpx;
        padding: 0 24rpx;

        & + .license-item {
            border-top: 1rpx solid #edf0f4;
        }
    }

    .license-item__label {
        flex: none;
        width: 156rpx;
        font-size: 28rpx;
        font-weight: 600;
        color: #222222;
    }

    .license-item__input {
        flex: 1;
        height: 82rpx;
        font-size: 28rpx;
        color: #222222;
        text-align: right;
    }

    .license-placeholder {
        color: #7b8494;
    }

    .license-extra {
        flex: none;
        margin-top: 16rpx;
    }

    .license-desc {
        position: relative;
        // height: 100%;
        padding: 22rpx;
        box-sizing: border-box;
    }

    .license-desc__title {
        font-size: 28rpx;
        font-weight: 600;
        color: #222222;
    }

    .license-desc__textarea {
        width: 100%;
        height: 190rpx;
        min-height: 190rpx;
        margin-top: 16rpx;
        padding: 20rpx;
        font-size: 28rpx;
        line-height: 40rpx;
        color: #222222;
        background: #f7f8fa;
        border-radius: 18rpx;
        box-sizing: border-box;
    }

    .license-desc__count {
        position: absolute;
        right: 48rpx;
        bottom: 34rpx;
        font-size: 24rpx;
        color: #c4c7cd;
    }

    .license-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 540rpx;
        height: 78rpx;
        margin: 22rpx auto 0;
        color: #ffffff;
        font-size: 30rpx;
        font-weight: 600;
        background: #1f7af4;
        border-radius: 44rpx;
    }

    .license-btn--disabled {
        opacity: 0.65;
    }
</style>
