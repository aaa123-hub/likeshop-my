<template>
    <view class="license">
        <navbar title="商家资质" :background="{ background: 'transparent' }" title-color="#ffffff"></navbar>
        <view class="license-header"></view>
        <view class="license-status" v-if="status.audit_status">
            <view class="license-status__label">申请状态</view>
            <view class="license-status__value" :class="statusClass">{{ statusText }}</view>
            <view class="license-status__remark" v-if="status.audit_remark">{{ status.audit_remark }}</view>
            <view class="license-status__time" v-if="status.updated_at">{{ status.updated_at }}</view>
        </view>
        <view class="license-card">
            <view class="license-item">
                <view class="license-item__label">店铺名称</view>
                <input class="license-item__input" v-model="form.merchantName" placeholder="请输入您的店铺名称" />
                <u-icon name="arrow-right" size="28" color="#222222"></u-icon>
            </view>
            <view class="license-item">
                <view class="license-item__label">联系电话</view>
                <input class="license-item__input" v-model="form.contactMobile" type="number" maxlength="11" placeholder="请输入您的电话" />
                <u-icon name="arrow-right" size="28" color="#222222"></u-icon>
            </view>
            <view class="license-item">
                <view class="license-item__label">电子邮箱</view>
                <input class="license-item__input" v-model="form.settlementAccountNo" placeholder="请输入您的电子邮箱" />
                <u-icon name="arrow-right" size="28" color="#222222"></u-icon>
            </view>
        </view>
        <view class="license-extra">
            <view class="license-desc">
                <view class="license-desc__title">网店说明</view>
                <textarea class="license-desc__textarea" v-model="form.remark" placeholder="请输入网店说明" maxlength="200"></textarea>
                <view class="license-desc__count">{{ form.remark.length }}/200</view>
            </view>
        </view>
        <view class="license-btn" :class="{ 'license-btn--disabled': submitting }" @tap="submitApply">{{ submitting ? '提交中...' : '去开通' }}</view>
    </view>
</template>

<script>
    import { mapGetters } from "vuex"
	import {
        applyMerchantQualification,
        getMerchantQualificationStatus
	} from "@/api/user";
    export default {
        data() {
            return {
                form: {
                    merchantName: '',
                    contactMobile: '',
                    settlementAccountNo: '',
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
            statusText() {
                const statusMap = {
                    PENDING: '审核中',
                    AUDITING: '审核中',
                    APPROVED: '已通过',
                    PASS: '已通过',
                    REJECTED: '未通过',
                    REJECT: '未通过'
                }
                return statusMap[this.status.audit_status] || this.status.audit_status
            },
            statusClass() {
                const status = this.status.audit_status
                if (status === 'APPROVED' || status === 'PASS') return 'license-status__value--success'
                if (status === 'REJECTED' || status === 'REJECT') return 'license-status__value--danger'
                return 'license-status__value--pending'
            }
        },
        methods: {
            getStatus() {
                if (!this.userId) return
                getMerchantQualificationStatus({ userId: this.userId }).then(res => {
                    if (res.code == 1 && res.data) {
                        this.status = res.data
                        this.form.merchantName = res.data.merchant_name || this.form.merchantName
                        this.form.contactMobile = res.data.contact_mobile || this.form.contactMobile
                        this.form.settlementAccountNo = res.data.settlement_account_no || this.form.settlementAccountNo
                    }
                })
            },
            validateForm() {
                if (!this.userId) return '请先登录'
                if (!this.form.merchantName) return '请输入店铺名称'
                if (!this.form.contactMobile) return '请输入联系电话'
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
                    merchantName: this.form.merchantName,
                    contactMobile: this.form.contactMobile,
                    settlementAccountNo: this.form.settlementAccountNo,
                    remark: this.form.remark
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
        display: flex;
        flex-direction: column;
        // min-height: 100vh;
        // height: 100vh;
        padding: 0 24rpx calc(24rpx + env(safe-area-inset-bottom));
        box-sizing: border-box;
        overflow: hidden;
        background: linear-gradient(180deg, #0f63ff 0%, #d9e8ff 300rpx, #f7f8fa 600rpx, #f7f8fa 100%);
    }

    .license-header {
        flex: none;
        height: 148rpx;
    }

    .license-card,
    .license-desc {
        background: #ffffff;
        border-radius: 24rpx;
        overflow: hidden;
    }

    .license-card {
        flex: none;
        margin-top: -10rpx;
    }

    .license-status {
        flex: none;
        margin: -42rpx 0 16rpx;
        padding: 18rpx 24rpx;
        background: #ffffff;
        border-radius: 20rpx;
    }

    .license-status__label {
        font-size: 28rpx;
        color: #666666;
    }

    .license-status__value {
        margin-top: 12rpx;
        font-size: 36rpx;
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
    }

    .license-extra {
        flex: 1;
        min-height: 0;
        margin-top: 20rpx;
    }

    .license-desc {
        position: relative;
        // height: 100%;
        padding: 26rpx;
        box-sizing: border-box;
    }

    .license-desc__title {
        font-size: 28rpx;
        font-weight: 600;
        color: #222222;
    }

    .license-desc__textarea {
        width: 100%;
        height: calc(100% - 72rpx);
        min-height: 220rpx;
        margin-top: 22rpx;
        padding: 24rpx;
        font-size: 28rpx;
        line-height: 40rpx;
        background: #f7f8fa;
        border-radius: 18rpx;
        box-sizing: border-box;
    }

    .license-desc__count {
        position: absolute;
        right: 48rpx;
        bottom: 40rpx;
        font-size: 24rpx;
        color: #c4c7cd;
    }

    .license-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 540rpx;
        height: 78rpx;
        margin: 20rpx auto 0;
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
