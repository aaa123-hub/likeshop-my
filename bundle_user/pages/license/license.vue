<template>
    <view class="license-page">
        <view class="license-bg"></view>
        <navbar title="商家入驻" :background="{ background: 'transparent' }" title-color="#ffffff"></navbar>

        <view class="license-hero">
            <view class="license-hero__title">商家入驻申请</view>
            <view class="license-hero__desc">提交主体、证照、店铺和结算资料，平台审核通过后开通商家能力</view>
        </view>

        <view class="status-card" v-if="auditStatus">
            <view>
                <view class="status-card__label">当前状态</view>
                <view :class="['status-card__value', 'status-card__value--' + statusClass]">{{ statusText }}</view>
            </view>
            <view class="status-card__meta" v-if="status.applicationNo">申请编号：{{ status.applicationNo }}</view>
            <view class="status-card__remark" v-if="statusRemark">{{ statusRemark }}</view>
            <view class="status-card__time" v-if="statusTime">更新时间：{{ statusTime }}</view>
        </view>

        <view class="approved-card" v-if="isApproved">
            <view class="approved-card__title">商家入驻已通过</view>
            <view class="approved-card__row"><text>商户名称</text><text>{{ form.merchantName || '-' }}</text></view>
            <view class="approved-card__row"><text>店铺名称</text><text>{{ form.shopName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系人</text><text>{{ form.contactName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系电话</text><text>{{ form.contactMobile || '-' }}</text></view>
        </view>

        <view v-if="!isApproved" class="license-form">
            <view class="form-section" v-if="requiresAccountCredentials">
                <view class="form-section__title">后台账号</view>
                <view class="form-section__desc">首次申请商家需要设置平台管理系统登录账号</view>
                <view class="form-row">
                    <text class="form-label required">登录账号</text>
                    <input class="form-input" v-model="form.username" placeholder="例如 merchant_51" placeholder-class="form-placeholder" />
                </view>
                <view class="form-row">
                    <text class="form-label required">登录密码</text>
                    <input class="form-input" v-model="form.password" password placeholder="请设置至少 6 位密码" placeholder-class="form-placeholder" />
                </view>
            </view>

            <view class="account-tip" v-else>
                当前账号已绑定平台后台账号，本次申请将复用已有账号，无需重新填写登录账号和密码。
            </view>

            <view class="form-section">
                <view class="form-section__title">主体信息</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">商户名称</text>
                        <input class="form-input" v-model="form.merchantName" placeholder="请输入营业执照主体名称" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row">
                        <text class="form-label required">商户类型</text>
                        <picker mode="selector" :range="merchantTypeOptions" range-key="label" :value="merchantTypeIndex" @change="onMerchantTypeChange">
                            <view class="form-picker">{{ merchantTypeLabel }}</view>
                        </picker>
                    </view>
                    <view class="form-row">
                        <text class="form-label required">联系人</text>
                        <input class="form-input" v-model="form.contactName" placeholder="请输入联系人姓名" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row">
                        <text class="form-label required">联系电话</text>
                        <input class="form-input" v-model="form.contactMobile" type="number" maxlength="11" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">法人及证照</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">法人姓名</text>
                        <input class="form-input" v-model="form.legalPerson" placeholder="请输入法人或经营者姓名" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row">
                        <text class="form-label required">统一社会信用代码</text>
                        <input class="form-input" v-model="form.licenseNo" placeholder="请输入营业执照编号" placeholder-class="form-placeholder" />
                    </view>
                </view>
                <view class="upload-grid">
                    <upload-item title="营业执照" required :url="form.licenseImageUrl" @choose="chooseImage('licenseImageUrl')" @remove="removeImage('licenseImageUrl')" />
                    <upload-item title="身份证人像面" required :url="form.legalIdFrontUrl" @choose="chooseImage('legalIdFrontUrl')" @remove="removeImage('legalIdFrontUrl')" />
                    <upload-item title="身份证国徽面" required :url="form.legalIdBackUrl" @choose="chooseImage('legalIdBackUrl')" @remove="removeImage('legalIdBackUrl')" />
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">店铺与结算</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">店铺名称</text>
                        <input class="form-input" v-model="form.shopName" placeholder="请输入店铺展示名称" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row">
                        <text class="form-label">行业 ID</text>
                        <input class="form-input" v-model="form.industryId" type="number" placeholder="后端未配置可暂不填" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide">
                        <text class="form-label required">结算账号</text>
                        <input class="form-input" v-model="form.settlementAccountNo" placeholder="请输入银行卡号或结算账号" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide">
                        <text class="form-label required">详细地址</text>
                        <input class="form-input" v-model="form.detailAddress" placeholder="请输入省市区及详细地址" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">行业资质</view>
                <view class="form-section__desc">食品经营许可证、行业许可或其它补充材料，可上传多张</view>
                <view class="qualification-list">
                    <view v-for="(url, index) in form.qualificationUrls" :key="url + index" class="qualification-item">
                        <image class="qualification-item__image" :src="url" mode="aspectFit"></image>
                        <view class="qualification-item__remove" @tap="removeQualification(index)">×</view>
                    </view>
                    <view class="qualification-add" @tap="chooseQualification">
                        <view class="qualification-add__plus">+</view>
                        <view class="qualification-add__text">上传资质</view>
                    </view>
                </view>
            </view>
        </view>

        <view v-if="!isApproved" class="submit-bar">
            <view class="submit-btn" :class="{ 'submit-btn--disabled': submitting || isPending }" @tap="submitApply">
                {{ submitting ? '提交中...' : submitButtonText }}
            </view>
        </view>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import { mapGetters } from 'vuex'
import { localizeBackendText, normalizeBackendCode } from '@/utils/backend-text'
import { uploadFile } from '@/utils/tools'
import {
    getMerchantApplicationStatus,
    resubmitMerchantApplication,
    submitMerchantApplication
} from '@/api/user'

const merchantTypeOptions = [
    { label: '企业/公司', value: 'COMPANY' },
    { label: '个体工商户', value: 'INDIVIDUAL' },
    { label: '个人经营者', value: 'PERSONAL' }
]

const UploadItem = {
    props: {
        title: String,
        url: String,
        required: Boolean
    },
    template: `
        <view class="upload-item">
            <view class="upload-item__title">
                <text v-if="required" class="upload-item__required">*</text>{{ title }}
            </view>
            <view class="upload-item__box" @tap="$emit('choose')">
                <image v-if="url" class="upload-item__image" :src="url" mode="aspectFit"></image>
                <view v-else class="upload-item__empty">
                    <view class="upload-item__plus">+</view>
                    <view class="upload-item__tip">上传图片</view>
                </view>
                <view v-if="url" class="upload-item__remove" @tap.stop="$emit('remove')">×</view>
            </view>
        </view>
    `
}

export default {
    components: {
        Navbar,
        UploadItem
    },
    data() {
        return {
            merchantTypeOptions,
            form: {
                username: '',
                password: '',
                merchantName: '',
                merchantType: 'COMPANY',
                contactName: '',
                contactMobile: '',
                legalPerson: '',
                licenseNo: '',
                licenseUrl: '',
                licenseImageUrl: '',
                legalIdFrontUrl: '',
                legalIdBackUrl: '',
                qualificationUrls: [],
                shopName: '',
                industryId: '',
                settlementAccountNo: '',
                detailAddress: ''
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
        merchantTypeIndex() {
            const index = this.merchantTypeOptions.findIndex(item => item.value === this.form.merchantType)
            return index === -1 ? 0 : index
        },
        merchantTypeLabel() {
            return (this.merchantTypeOptions[this.merchantTypeIndex] || this.merchantTypeOptions[0]).label
        },
        auditStatus() {
            return normalizeBackendCode(this.status.auditStatus || this.status.audit_status || this.status.applyStatus || this.status.apply_status || this.status.status || '')
        },
        statusRemark() {
            return localizeBackendText(this.status.auditRemark || this.status.audit_remark || this.status.remark || '', '')
        },
        statusTime() {
            return this.formatDisplayTime(this.status.updatedAt || this.status.updated_at || this.status.updateTime || this.status.createTime || this.status.createdAt || '')
        },
        statusText() {
            const map = {
                NOT_SUBMITTED: '未提交',
                SUBMITTED: '审核中',
                PENDING: '审核中',
                PENDING_AUDIT: '审核中',
                WAIT_AUDIT: '审核中',
                AUDITING: '审核中',
                APPROVED: '已通过',
                PASS: '已通过',
                PASSED: '已通过',
                SUCCESS: '已通过',
                REJECTED: '未通过',
                REJECT: '未通过',
                FAILED: '未通过',
                FAIL: '未通过'
            }
            return map[this.auditStatus] || localizeBackendText(this.auditStatus, '未提交')
        },
        statusClass() {
            if (this.isApproved) return 'success'
            if (this.isRejected) return 'danger'
            if (this.isPending) return 'pending'
            return 'default'
        },
        isApproved() {
            return ['APPROVED', 'PASS', 'PASSED', 'SUCCESS'].includes(this.auditStatus)
        },
        isRejected() {
            return ['REJECTED', 'REJECT', 'FAILED', 'FAIL'].includes(this.auditStatus)
        },
        isPending() {
            return ['SUBMITTED', 'PENDING', 'PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING'].includes(this.auditStatus)
        },
        submitButtonText() {
            if (this.isPending) return '审核中'
            if (this.isRejected) return '重新提交'
            return this.auditStatus && this.auditStatus !== 'NOT_SUBMITTED' ? '重新提交' : '提交入驻申请'
        },
        platformRoleValues() {
            const info = this.userInfo || {}
            const status = this.status || {}
            return []
                .concat(status.roleCode || status.role_code || status.role || status.userRole || status.user_role || [])
                .concat(info.roleCode || info.role_code || info.role || info.userRole || info.user_role || [])
                .concat(Array.isArray(status.roles) ? status.roles.map(item => item.roleCode || item.role_code || item.role || item.code || item.value || item) : [])
                .concat(Array.isArray(info.roles) ? info.roles.map(item => item.roleCode || item.role_code || item.role || item.code || item.value || item) : [])
        },
        hasExistingPlatformAccount() {
            const info = this.userInfo || {}
            const status = this.status || {}
            const roleValues = this.platformRoleValues
            const hasPlatformRole = roleValues.some(value => ['MERCHANT', 'PROMOTER', 'AGENT', 'SUBSIDIARY'].includes(normalizeBackendCode(value)))
            return Boolean(
                status.username
                || status.loginName
                || status.login_name
                || status.platformUserId
                || status.platform_user_id
                || status.adminUserId
                || status.admin_user_id
                || hasPlatformRole
                || info.isMerchant
                || info.is_merchant
                || info.platformUserId
                || info.platform_user_id
                || info.adminUserId
                || info.admin_user_id
                || info.backendUserId
                || info.backend_user_id
                || info.merchantId
                || info.merchant_id
                || info.promoterId
                || info.promoter_id
                || info.agentId
                || info.agent_id
                || info.subsidiaryId
                || info.subsidiary_id
                || info.promoterCode
                || info.promoter_code
            )
        },
        requiresAccountCredentials() {
            return !this.hasExistingPlatformAccount
        },
        suggestedUsername() {
            const info = this.userInfo || {}
            const status = this.status || {}
            return status.username
                || status.loginName
                || status.login_name
                || info.platformUsername
                || info.platform_username
                || info.adminUsername
                || info.admin_username
                || info.loginName
                || info.login_name
                || (this.userId ? `merchant_${this.userId}` : '')
        }
    },
    onLoad() {
        this.$store.dispatch('getUser').finally(() => {
            this.prefillFromUser()
            this.getStatus()
        })
    },
    onShow() {
        this.prefillFromUser()
        this.getStatus()
    },
    methods: {
        onMerchantTypeChange(e) {
            const index = Number(e.detail.value || 0)
            this.form.merchantType = (this.merchantTypeOptions[index] || this.merchantTypeOptions[0]).value
        },
        prefillFromUser() {
            const info = this.userInfo || {}
            this.form.contactMobile = this.form.contactMobile || info.mobile || info.phone || ''
            this.form.contactName = this.form.contactName || info.realName || info.real_name || info.nickname || ''
            this.form.legalPerson = this.form.legalPerson || info.realName || info.real_name || ''
            this.form.username = this.form.username || this.suggestedUsername
        },
        applyStatusToForm(data = {}) {
            this.status = data
            this.form.username = data.username || data.loginName || data.login_name || this.form.username || this.suggestedUsername
            this.form.merchantName = data.merchantName || data.merchant_name || this.form.merchantName
            this.form.merchantType = data.merchantType || data.merchant_type || this.form.merchantType
            this.form.contactName = data.contactName || data.contact_name || this.form.contactName
            this.form.contactMobile = data.contactMobile || data.contact_mobile || this.form.contactMobile
            this.form.legalPerson = data.legalPerson || data.legal_person || this.form.legalPerson
            this.form.licenseNo = data.licenseNo || data.license_no || this.form.licenseNo
            this.form.licenseUrl = data.licenseUrl || data.license_url || this.form.licenseUrl
            this.form.licenseImageUrl = data.licenseImageUrl || data.license_image_url || this.form.licenseImageUrl
            this.form.legalIdFrontUrl = data.legalIdFrontUrl || data.legal_id_front_url || this.form.legalIdFrontUrl
            this.form.legalIdBackUrl = data.legalIdBackUrl || data.legal_id_back_url || this.form.legalIdBackUrl
            this.form.qualificationUrls = Array.isArray(data.qualificationUrls) ? data.qualificationUrls : this.form.qualificationUrls
            this.form.shopName = data.shopName || data.shop_name || this.form.shopName
            this.form.industryId = data.industryId || data.industry_id || this.form.industryId
            this.form.settlementAccountNo = data.settlementAccountNo || data.settlement_account_no || this.form.settlementAccountNo
            this.form.detailAddress = data.detailAddress || data.detail_address || this.form.detailAddress
        },
        getStatus() {
            if (!this.userId) return
            getMerchantApplicationStatus({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyStatusToForm(res.data)
            })
        },
        formatDisplayTime(value) {
            if (!value) return ''
            if (typeof value === 'string' && /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) return value.replace(/-/g, '/').slice(0, 16)
            const time = Number(value)
            const date = Number.isNaN(time) ? new Date(value) : new Date(time > 10000000000 ? time : time * 1000)
            if (Number.isNaN(date.getTime())) return String(value)
            const pad = (num) => String(num).padStart(2, '0')
            return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        },
        validateForm() {
            if (!this.userId) return '请先登录'
            if (this.requiresAccountCredentials && !this.form.username.trim()) return '请填写登录账号'
            if (this.requiresAccountCredentials && (!this.form.password || this.form.password.length < 6)) return '请设置至少 6 位密码'
            if (!this.form.merchantName.trim()) return '请输入商户名称'
            if (!this.form.contactName.trim()) return '请输入联系人'
            if (!/^1\d{10}$/.test(String(this.form.contactMobile || ''))) return '请输入正确联系电话'
            if (!this.form.legalPerson.trim()) return '请输入法人姓名'
            if (!this.form.licenseNo.trim()) return '请输入营业执照编号'
            if (!this.form.licenseImageUrl) return '请上传营业执照'
            if (!this.form.legalIdFrontUrl || !this.form.legalIdBackUrl) return '请上传法人身份证正反面'
            if (!this.form.shopName.trim()) return '请输入店铺名称'
            if (!this.form.settlementAccountNo.trim()) return '请输入结算账号'
            if (!this.form.detailAddress.trim()) return '请输入详细地址'
            return ''
        },
        buildPayload() {
            return {
                ...this.form,
                userId: this.userId,
                username: this.requiresAccountCredentials ? this.form.username.trim() : this.form.username,
                password: this.requiresAccountCredentials ? this.form.password : '',
                merchantName: this.form.merchantName.trim(),
                contactName: this.form.contactName.trim(),
                contactMobile: this.form.contactMobile.trim(),
                legalPerson: this.form.legalPerson.trim(),
                licenseNo: this.form.licenseNo.trim(),
                shopName: this.form.shopName.trim(),
                industryId: this.form.industryId,
                settlementAccountNo: this.form.settlementAccountNo.trim(),
                detailAddress: this.form.detailAddress.trim(),
                applicationNo: this.status.applicationNo || this.status.application_no || ''
            }
        },
        submitApply() {
            if (this.submitting || this.isPending || this.isApproved) {
                if (this.isPending) this.$toast({ title: '申请正在审核中' })
                return
            }
            const message = this.validateForm()
            if (message) {
                this.$toast({ title: message })
                return
            }
            this.submitting = true
            const payload = this.buildPayload()
            const request = this.isRejected && payload.applicationNo
                ? resubmitMerchantApplication(payload)
                : submitMerchantApplication(payload)
            request.then(res => {
                if (res.code == 1) {
                    this.$toast({ title: '提交成功' })
                    if (res.data) this.applyStatusToForm(res.data)
                    this.getStatus()
                } else {
                    this.$toast({ title: res.msg || res.message || '提交失败' })
                }
            }).finally(() => {
                this.submitting = false
            })
        },
        chooseImage(field) {
            uni.chooseImage({
                count: 1,
                success: (res) => {
                    const file = (res.tempFiles || [])[0]
                    const path = file && (file.path || file.tempFilePath)
                    if (path) this.uploadAndSet(field, path)
                }
            })
        },
        chooseQualification() {
            uni.chooseImage({
                count: Math.max(1, 9 - this.form.qualificationUrls.length),
                success: (res) => {
                    const files = res.tempFiles || []
                    files.forEach(file => {
                        const path = file.path || file.tempFilePath
                        if (path) this.uploadQualification(path)
                    })
                }
            })
        },
        uploadAndSet(field, path) {
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path).then(res => {
                this.form[field] = res.url || res.uri || res.file_url || ''
            }).catch(() => {
                this.$toast({ title: '图片上传失败' })
            }).finally(() => {
                uni.hideLoading()
            })
        },
        uploadQualification(path) {
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path).then(res => {
                const url = res.url || res.uri || res.file_url || ''
                if (url) this.form.qualificationUrls.push(url)
            }).catch(() => {
                this.$toast({ title: '资质上传失败' })
            }).finally(() => {
                uni.hideLoading()
            })
        },
        removeImage(field) {
            this.form[field] = ''
        },
        removeQualification(index) {
            this.form.qualificationUrls.splice(index, 1)
        }
    }
}
</script>

<style lang="scss">
.license-page {
    position: relative;
    min-height: 100vh;
    padding: 0 24rpx calc(132rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: #f6f8fb;
}

.license-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 430rpx;
    background: linear-gradient(135deg, #1677ff 0%, #18c59f 100%);
}

.license-hero {
    position: relative;
    z-index: 1;
    padding: 44rpx 0 34rpx;
    color: #ffffff;
}

.license-hero__title {
    font-size: 40rpx;
    font-weight: 700;
    line-height: 56rpx;
}

.license-hero__desc {
    margin-top: 10rpx;
    max-width: 620rpx;
    color: rgba(255, 255, 255, .9);
    font-size: 25rpx;
    line-height: 38rpx;
}

.status-card,
.approved-card,
.form-section,
.account-tip {
    position: relative;
    z-index: 1;
    margin-bottom: 18rpx;
    border-radius: 22rpx;
    background: #ffffff;
    box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08);
    box-sizing: border-box;
}

.status-card {
    padding: 24rpx;
}

.status-card__label,
.status-card__meta,
.status-card__remark,
.status-card__time {
    color: #667085;
    font-size: 23rpx;
    line-height: 34rpx;
}

.status-card__value {
    margin-top: 8rpx;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 46rpx;
}

.status-card__value--success { color: #10a66a; }
.status-card__value--danger { color: #e5484d; }
.status-card__value--pending { color: #1677ff; }
.status-card__value--default { color: #667085; }

.status-card__meta,
.status-card__remark,
.status-card__time {
    margin-top: 10rpx;
}

.approved-card {
    padding: 26rpx 24rpx;
}

.approved-card__title {
    margin-bottom: 16rpx;
    color: #10a66a;
    font-size: 31rpx;
    font-weight: 700;
}

.approved-card__row {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    padding: 12rpx 0;
    color: #344054;
    font-size: 25rpx;
    line-height: 36rpx;
}

.license-form {
    position: relative;
    z-index: 1;
}

.account-tip {
    padding: 20rpx 22rpx;
    color: #176b55;
    background: #eefbf6;
    border: 1rpx solid #c7f0df;
    font-size: 24rpx;
    line-height: 36rpx;
}

.form-section {
    padding: 24rpx;
}

.form-section__title {
    color: #172033;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 42rpx;
}

.form-section__desc {
    margin-top: 6rpx;
    color: #7a8594;
    font-size: 23rpx;
    line-height: 34rpx;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 20rpx;
}

.form-row {
    display: flex;
    align-items: center;
    min-height: 86rpx;
    padding: 0 18rpx;
    border-radius: 16rpx;
    background: #f8fafc;
    border: 1rpx solid #edf1f6;
    box-sizing: border-box;
}

.form-row--wide {
    grid-column: 1 / -1;
}

.form-label {
    flex: none;
    width: 164rpx;
    color: #465366;
    font-size: 25rpx;
    font-weight: 600;
    line-height: 36rpx;
}

.required::before,
.upload-item__required {
    content: '*';
    margin-right: 4rpx;
    color: #e5484d;
}

.form-input,
.form-picker {
    flex: 1;
    min-width: 0;
    height: 84rpx;
    color: #1f2937;
    font-size: 26rpx;
    line-height: 84rpx;
    text-align: right;
}

.form-placeholder {
    color: #a6afbd;
}

.upload-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 20rpx;
}

.upload-item__title {
    margin-bottom: 10rpx;
    color: #465366;
    font-size: 24rpx;
    font-weight: 600;
    line-height: 34rpx;
}

.upload-item__box,
.qualification-add,
.qualification-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1 / .72;
    border-radius: 16rpx;
    background: #f8fafc;
    border: 1rpx dashed #cfd7e3;
    overflow: hidden;
    box-sizing: border-box;
}

.upload-item__image,
.qualification-item__image {
    width: 100%;
    height: 100%;
}

.upload-item__empty,
.qualification-add {
    flex-direction: column;
    color: #98a2b3;
    font-size: 23rpx;
}

.upload-item__plus,
.qualification-add__plus {
    font-size: 42rpx;
    line-height: 46rpx;
}

.upload-item__tip,
.qualification-add__text {
    margin-top: 4rpx;
    font-size: 22rpx;
    line-height: 32rpx;
}

.upload-item__remove,
.qualification-item__remove {
    position: absolute;
    right: 8rpx;
    top: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    color: #ffffff;
    background: rgba(0, 0, 0, .55);
    font-size: 28rpx;
    line-height: 1;
}

.qualification-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 20rpx;
}

.submit-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    background: rgba(246, 248, 251, .96);
    box-shadow: 0 -10rpx 24rpx rgba(31, 58, 94, .08);
    box-sizing: border-box;
}

.submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 86rpx;
    border-radius: 43rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #1677ff, #18c59f);
    font-size: 29rpx;
    font-weight: 700;
    box-shadow: 0 14rpx 28rpx rgba(22, 119, 255, .2);
}

.submit-btn--disabled {
    opacity: .62;
}

@media screen and (max-width: 360px) {
    .license-page {
        padding-left: 18rpx;
        padding-right: 18rpx;
    }

    .form-grid,
    .upload-grid,
    .qualification-list {
        grid-template-columns: 1fr;
    }

    .form-row {
        align-items: flex-start;
        flex-direction: column;
        padding: 14rpx 18rpx;
    }

    .form-label {
        width: auto;
    }

    .form-input,
    .form-picker {
        width: 100%;
        text-align: left;
    }
}
</style>
