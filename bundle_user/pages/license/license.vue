<template>
    <view class="license-page">
        <view class="license-bg"></view>
        <navbar title="商家入驻" :background="{ background: 'transparent' }" title-color="#ffffff"></navbar>

        <view class="license-hero">
            <view class="license-hero__title">商家入驻申请</view>
            <view class="license-hero__desc">提交主体、证照、店铺和结算资料，平台审核通过后开通商家能力</view>
        </view>

        <view class="status-card" v-if="auditStatus">
            <view class="status-card__head">
                <view>
                    <view class="status-card__label">当前状态</view>
                    <view :class="['status-card__value', 'status-card__value--' + statusClass]">{{ statusText }}</view>
                </view>
                <view :class="['status-pill', 'status-pill--' + statusClass]">{{ statusPillText }}</view>
            </view>
            <view class="status-card__meta" v-if="status.applicationNo">申请编号：{{ status.applicationNo }}</view>
            <view class="status-card__remark" v-if="statusRemark">{{ statusRemark }}</view>
            <view class="status-card__time" v-if="statusTime">更新时间：{{ statusTime }}</view>
            <view class="status-steps">
                <view
                    v-for="(step, index) in statusSteps"
                    :key="step.key"
                    :class="['status-step', step.active ? 'is-active' : '', step.done ? 'is-done' : '']"
                >
                    <view class="status-step__dot">{{ index + 1 }}</view>
                    <view class="status-step__text">{{ step.label }}</view>
                </view>
            </view>
        </view>

        <view class="approved-card" v-if="isApproved">
            <view class="approved-card__title">商家入驻已通过</view>
            <view class="approved-card__row"><text>商户名称</text><text>{{ form.merchantName || '-' }}</text></view>
            <view class="approved-card__row"><text>店铺名称</text><text>{{ form.shopName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系人</text><text>{{ form.contactName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系电话</text><text>{{ form.contactMobile || '-' }}</text></view>
            <view class="approved-card__row"><text>经营类型</text><text>{{ merchantTypeLabel }}</text></view>
            <view class="approved-card__row"><text>结算账号</text><text>{{ maskedSettlementAccount }}</text></view>
            <view class="approved-card__row approved-card__row--address"><text>经营地址</text><text>{{ form.detailAddress || '-' }}</text></view>
        </view>

        <view v-if="!isApproved" class="license-form">
            <view class="form-section" v-if="requiresAccountCredentials || readonlyBackendUsername">
                <view class="form-section__title">后台账号</view>
                <view class="form-section__desc">{{ readonlyBackendUsername ? '当前账号已绑定平台后台账号，本次申请将复用已有账号' : '首次申请商家需要设置平台管理系统登录账号' }}</view>
                <view class="account-fields">
                    <view :class="['form-row', readonlyBackendUsername ? 'form-row--readonly' : '']">
                        <text class="form-label required">登录账号</text>
                        <input class="form-input" v-model="form.username" :disabled="readonlyBackendUsername" placeholder="例如 merchant_51" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row" v-if="requiresBackendPassword">
                        <text class="form-label required">登录密码</text>
                        <input class="form-input" v-model="form.password" password placeholder="请设置至少 6 位密码" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="account-tip" v-else>
                当前账号已绑定平台后台账号，本次申请将复用已有账号，无需重新填写登录账号和密码。
            </view>

            <view class="form-section">
                <view class="form-section__title">主体信息</view>
                <view class="form-grid">
                    <view :class="['form-row', isReadonlyField('merchantName') ? 'form-row--readonly' : '']">
                        <text class="form-label required">商户名称</text>
                        <input class="form-input" v-model="form.merchantName" :disabled="isReadonlyField('merchantName')" placeholder="请输入营业执照主体名称" placeholder-class="form-placeholder" />
                    </view>
                    <view :class="['form-row', 'form-row--picker', isReadonlyField('merchantType') ? 'form-row--readonly' : '']">
                        <text class="form-label required">商户类型</text>
                        <picker class="form-picker-wrap" mode="selector" :disabled="isReadonlyField('merchantType')" :range="merchantTypeOptions" range-key="label" :value="merchantTypeIndex" @change="onMerchantTypeChange">
                            <view class="form-picker">{{ merchantTypeLabel }}</view>
                        </picker>
                    </view>
                    <view :class="['form-row', isReadonlyField('contactName') ? 'form-row--readonly' : '']">
                        <text class="form-label required">联系人</text>
                        <input class="form-input" v-model="form.contactName" :disabled="isReadonlyField('contactName')" placeholder="请输入联系人姓名" placeholder-class="form-placeholder" />
                    </view>
                    <view :class="['form-row', isReadonlyField('contactMobile') ? 'form-row--readonly' : '']">
                        <text class="form-label required">联系电话</text>
                        <input class="form-input" v-model="form.contactMobile" :disabled="isReadonlyField('contactMobile')" type="number" maxlength="11" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">法人及证照</view>
                <view class="form-grid">
                    <view :class="['form-row', isReadonlyField('legalPerson') ? 'form-row--readonly' : '']">
                        <text class="form-label required">法人姓名</text>
                        <input class="form-input" v-model="form.legalPerson" :disabled="isReadonlyField('legalPerson')" placeholder="请输入法人或经营者姓名" placeholder-class="form-placeholder" />
                    </view>
                    <view :class="['form-row', 'form-row--license-no', isReadonlyField('licenseNo') ? 'form-row--readonly' : '']">
                        <text class="form-label form-label--long required">统一社会信用代码</text>
                        <input class="form-input" v-model="form.licenseNo" :disabled="isReadonlyField('licenseNo')" placeholder="请输入营业执照编号" placeholder-class="form-placeholder" />
                    </view>
                </view>
                <view class="upload-grid">
                    <view
                        v-for="item in requiredUploadItems"
                        :key="item.field"
                        class="upload-item"
                    >
                        <view class="upload-item__title">
                            <text class="upload-item__required">*</text>{{ item.title }}
                        </view>
                        <view :class="['upload-item__box', isReadonlyField(item.field) ? 'upload-item__box--readonly' : '']" @tap="chooseImage(item.field)">
                            <image v-if="form[item.field]" class="upload-item__image" :src="form[item.field]" mode="aspectFit"></image>
                            <view v-else class="upload-item__empty">
                                <view class="upload-item__plus">+</view>
                                <view class="upload-item__tip">上传图片</view>
                            </view>
                            <view v-if="form[item.field] && !isReadonlyField(item.field)" class="upload-item__remove" @tap.stop="removeImage(item.field)">×</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">店铺与结算</view>
                <view class="form-grid">
                    <view :class="['form-row', isReadonlyField('shopName') ? 'form-row--readonly' : '']">
                        <text class="form-label required">店铺名称</text>
                        <input class="form-input" v-model="form.shopName" :disabled="isReadonlyField('shopName')" placeholder="请输入店铺展示名称" placeholder-class="form-placeholder" />
                    </view>
                    <view :class="['form-row', 'form-row--picker', isReadonlyField('industryId') ? 'form-row--readonly' : '']">
                        <text class="form-label required">行业分类</text>
                        <picker class="form-picker-wrap" mode="selector" :disabled="isReadonlyField('industryId')" :range="industryOptions" range-key="label" :value="industryIndex" @change="onIndustryChange">
                            <view class="form-picker">{{ industryLabel }}</view>
                        </picker>
                    </view>
                    <view :class="['form-row', 'form-row--wide', isReadonlyField('settlementAccountNo') ? 'form-row--readonly' : '']">
                        <text class="form-label required">结算账号</text>
                        <input class="form-input" v-model="form.settlementAccountNo" :disabled="isReadonlyField('settlementAccountNo')" placeholder="请输入银行卡号或结算账号" placeholder-class="form-placeholder" />
                    </view>
                    <view :class="['form-row', 'form-row--wide', isReadonlyField('detailAddress') ? 'form-row--readonly' : '']">
                        <text class="form-label required">详细地址</text>
                        <input class="form-input" v-model="form.detailAddress" :disabled="isReadonlyField('detailAddress')" placeholder="请输入省市区及详细地址" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="form-section" v-if="showQualificationSection">
                <view class="form-section__title">行业资质</view>
                <view class="form-section__desc">食品经营许可证、行业许可或其它补充材料，可上传多张。非必填，有则建议上传。</view>
                <view class="qualification-list">
                    <view v-for="(url, index) in form.qualificationUrls" :key="url + index" class="qualification-item">
                        <image class="qualification-item__image" :src="url" mode="aspectFit"></image>
                        <view v-if="!isReadonlyQualification(url)" class="qualification-item__remove" @tap="removeQualification(index)">×</view>
                    </view>
                    <view class="qualification-add" v-if="canUploadQualification" @tap="chooseQualification">
                        <view class="qualification-add__inner">
                            <view class="qualification-add__plus">+</view>
                            <view class="qualification-add__text">上传资质</view>
                        </view>
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
    getOnboardingContext,
    getMerchantIndustries,
    getMerchantApplicationStatus,
    resubmitMerchantApplication,
    submitMerchantApplication
} from '@/api/user'

const merchantTypeOptions = [
    { label: '企业/公司', value: 'COMPANY' },
    { label: '个体工商户', value: 'INDIVIDUAL' },
    { label: '个人经营者', value: 'PERSONAL' }
]

const industryOptions = [
    { label: '请选择行业分类', value: '' },
    { label: '餐饮美食', value: 1 },
    { label: '生活服务', value: 2 },
    { label: '美容养生', value: 3 },
    { label: '休闲娱乐', value: 4 },
    { label: '商超零售', value: 5 },
    { label: '教育培训', value: 6 },
    { label: '其它行业', value: 99 }
]

function firstValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '') || ''
}

function normalizeUrlList(value) {
    if (!value) return []
    let list = value
    if (typeof list === 'string') {
        try {
            const parsed = JSON.parse(list)
            list = parsed
        } catch (error) {
            list = list.split(/[,，]/)
        }
    }
    if (!Array.isArray(list)) list = [list]
    return list.map(item => {
        if (typeof item === 'string') return item.trim()
        return firstValue(item.url, item.fileUrl, item.file_url, item.path, item.uri)
    }).filter(Boolean)
}

function normalizeUploadUrl(res = {}) {
    return firstValue(res.url, res.fileUrl, res.file_url, res.uri, res.path, res.data && res.data.url, res.data && res.data.fileUrl, res.data && res.data.file_url, res.data && res.data.path)
}

export default {
    components: {
        Navbar
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
            industryOptions: industryOptions.map(item => ({ ...item })),
            status: {},
            onboardingContext: {},
            readonlyFields: {},
            readonlyQualificationUrls: [],
            submitting: false,
            statusLoading: false,
            onboardingLoading: false,
            initialDataPromise: null,
            requiredUploadItems: [
                { title: '营业执照', field: 'licenseImageUrl' },
                { title: '身份证人像面', field: 'legalIdFrontUrl' },
                { title: '身份证国徽面', field: 'legalIdBackUrl' }
            ]
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        userId() {
            const info = this.userInfo || {}
            return info.user_id || info.userId || info.id
        },
        merchantTypeIndex() {
            const index = this.merchantTypeOptions.findIndex(item => item.value === this.form.merchantType)
            return index === -1 ? 0 : index
        },
        merchantTypeLabel() {
            return (this.merchantTypeOptions[this.merchantTypeIndex] || this.merchantTypeOptions[0]).label
        },
        industryIndex() {
            const industryId = String(this.form.industryId || '')
            const index = this.industryOptions.findIndex(item => String(item.value) === industryId)
            return index === -1 ? 0 : index
        },
        industryLabel() {
            return (this.industryOptions[this.industryIndex] || this.industryOptions[0]).label
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
        statusPillText() {
            if (this.isApproved) return '审核通过'
            if (this.isRejected) return '请修改后重提'
            if (this.isPending) return '平台审核中'
            return '待提交'
        },
        statusSteps() {
            const submitted = Boolean(this.status.applicationNo || this.status.application_no || this.isPending || this.isApproved || this.isRejected)
            return [
                { key: 'submit', label: '提交资料', done: submitted || this.isApproved, active: !submitted },
                { key: 'audit', label: '平台审核', done: this.isApproved, active: this.isPending },
                { key: 'result', label: this.isRejected ? '修改重提' : '审核结果', done: this.isApproved, active: this.isApproved || this.isRejected }
            ]
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
                .concat(Array.isArray(status.roles) ? status.roles.map(item => item.roleCode || item.role_code || item.role || item.code || item.value || item) : [])
                .concat(info.roleCode || info.role_code || info.role || info.userRole || info.user_role || [])
                .concat(Array.isArray(info.roles) ? info.roles.map(item => item.roleCode || item.role_code || item.role || item.code || item.value || item) : [])
        },
        hasExistingPlatformAccount() {
            const info = this.userInfo || {}
            const status = this.status || {}
            const context = this.onboardingContext || {}
            const account = context.backendAccount || context.backend_account || {}
            const roleValues = this.platformRoleValues
            const hasPlatformRole = roleValues.some(value => ['MERCHANT', 'PROMOTER', 'AGENT', 'SUBSIDIARY'].includes(normalizeBackendCode(value)))
            const statusAccount = status.backendAccount || status.backend_account || {}
            const statusHints = status.uiHints || status.ui_hints || {}
            return Boolean(
                context.hasBackendAccount
                || context.has_backend_account
                || status.hasBackendAccount
                || status.has_backend_account
                || statusHints.showBackendAccountFields === false
                || account.adminUserId
                || account.admin_user_id
                || account.platformUserId
                || account.platform_user_id
                || account.username
                || context.backendUsername
                || context.backend_username
                || statusAccount.adminUserId
                || statusAccount.admin_user_id
                || statusAccount.platformUserId
                || statusAccount.platform_user_id
                || statusAccount.username
                || status.backendUsername
                || status.backend_username
                || status.username
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
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            const statusHints = (this.status && (this.status.uiHints || this.status.ui_hints)) || {}
            if (hints.showBackendAccountFields === false) return false
            if (statusHints.showBackendAccountFields === false) return false
            return !this.hasExistingPlatformAccount
        },
        requiresBackendUsername() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            const statusHints = (this.status && (this.status.uiHints || this.status.ui_hints)) || {}
            if (hints.requireBackendUsername === false) return false
            if (statusHints.requireBackendUsername === false) return false
            return this.requiresAccountCredentials
        },
        requiresBackendPassword() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            const statusHints = (this.status && (this.status.uiHints || this.status.ui_hints)) || {}
            if (hints.requireBackendPassword === false) return false
            if (statusHints.requireBackendPassword === false) return false
            return this.requiresAccountCredentials
        },
        readonlyBackendUsername() {
            return !this.requiresBackendUsername && Boolean(this.form.username)
        },
        showQualificationSection() {
            if (this.isPending) return this.form.qualificationUrls.length > 0
            return true
        },
        canUploadQualification() {
            return !this.isPending
        },
        suggestedUsername() {
            const info = this.userInfo || {}
            const status = this.status || {}
            const context = this.onboardingContext || {}
            const account = context.backendAccount || context.backend_account || {}
            const statusAccount = status.backendAccount || status.backend_account || {}
            return status.username
                || status.loginName
                || status.login_name
                || context.backendUsername
                || context.backend_username
                || account.username
                || status.backendUsername
                || status.backend_username
                || statusAccount.username
                || info.platformUsername
                || info.platform_username
                || info.adminUsername
                || info.admin_username
                || info.loginName
                || info.login_name
                || (this.userId ? `merchant_${this.userId}` : '')
        },
        maskedSettlementAccount() {
            const value = String(this.form.settlementAccountNo || '')
            if (!value) return '-'
            if (value.length <= 8) return value
            return `${value.slice(0, 4)} **** **** ${value.slice(-4)}`
        }
    },
    onLoad() {
        Promise.resolve(this.$store.dispatch('getUser')).finally(() => {
            this.prefillFromUser()
            this.loadInitialData()
        })
    },
    onShow() {
        this.prefillFromUser()
        if (this.userId) this.loadInitialData()
    },
    onPullDownRefresh() {
        Promise.resolve(this.loadInitialData()).finally(() => {
            uni.stopPullDownRefresh()
        })
    },
    methods: {
        loadInitialData() {
            if (!this.userId) return Promise.resolve()
            if (this.initialDataPromise) return this.initialDataPromise
            this.initialDataPromise = Promise.all([this.getOnboardingContext(), this.getIndustries(), this.getStatus()]).finally(() => {
                this.initialDataPromise = null
            })
            return this.initialDataPromise
        },
        onMerchantTypeChange(e) {
            const index = Number(e.detail.value || 0)
            this.form.merchantType = (this.merchantTypeOptions[index] || this.merchantTypeOptions[0]).value
        },
        onIndustryChange(e) {
            const index = Number(e.detail.value || 0)
            this.form.industryId = (this.industryOptions[index] || this.industryOptions[0]).value
        },
        isReadonlyField(field) {
            return Boolean(this.readonlyFields && this.readonlyFields[field])
        },
        markReadonlyField(field, value) {
            if (value === undefined || value === null || value === '') return
            this.$set(this.readonlyFields, field, true)
        },
        markReadonlyFields(source = {}, map = {}) {
            Object.keys(map).forEach(field => {
                const keys = map[field]
                const actualKeys = keys.filter(key => Object.prototype.hasOwnProperty.call(source, key))
                const value = firstValue(...actualKeys.map(key => source[key]))
                this.markReadonlyField(field, value)
            })
        },
        isReadonlyQualification(url) {
            return this.readonlyQualificationUrls.includes(url)
        },
        getIndustries() {
            return getMerchantIndustries({ show: false }).then(res => {
                const list = res.code == 1 && res.data ? (res.data.list || []) : []
                if (list.length) {
                    this.industryOptions = [
                        { label: '请选择行业分类', value: '' },
                        ...list.map(item => ({
                            ...item,
                            label: item.label || item.name || item.industryName || item.industry_name,
                            value: item.value || item.id || item.industryId || item.industry_id || item.code || item.industryCode || item.industry_code
                        })).filter(item => item.label && item.value !== undefined && item.value !== null && item.value !== '')
                    ]
                    this.ensureIndustryOptionFromStatus(this.status)
                }
            }).catch(() => {})
        },
        ensureIndustryOptionFromStatus(data = {}) {
            const value = firstValue(data.industryId, data.industry_id, data.industryCode, data.industry_code)
            const label = firstValue(data.industryName, data.industry_name)
            if (!value || !label) return
            if (this.industryOptions.some(item => String(item.value) === String(value))) return
            this.industryOptions.push({ label, value })
        },
        prefillFromUser() {
            const info = this.userInfo || {}
            this.form.contactMobile = this.form.contactMobile || info.mobile || info.phone || ''
            this.form.contactName = this.form.contactName || info.realName || info.real_name || info.nickname || ''
            this.form.legalPerson = this.form.legalPerson || info.realName || info.real_name || ''
            this.form.username = this.form.username || this.suggestedUsername
        },
        getOnboardingContext() {
            if (!this.userId || this.onboardingLoading) return Promise.resolve()
            this.onboardingLoading = true
            return getOnboardingContext({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyOnboardingContext(res.data)
            }).catch(() => {}).finally(() => {
                this.onboardingLoading = false
            })
        },
        applyOnboardingContext(data = {}) {
            this.onboardingContext = data
            const profile = data.reusableProfile || data.reusable_profile || {}
            const hints = data.uiHints || data.ui_hints || {}
            const backendUsername = firstValue(data.backendUsername, data.backend_username, data.backendAccount && data.backendAccount.username, data.backend_account && data.backend_account.username)
            this.form.username = firstValue(backendUsername, this.form.username)
            this.markReadonlyField('username', backendUsername)
            if (hints.canReuseKycProfile || hints.hideRepeatedKycFields || profile.realName || profile.applicantName) {
                const contactName = firstValue(profile.applicantName, profile.applicant_name, profile.realName, profile.real_name, data.realName, data.real_name)
                const legalPerson = firstValue(profile.realName, profile.real_name, profile.applicantName, profile.applicant_name, data.realName, data.real_name)
                const contactMobile = firstValue(profile.mobile, data.mobile, data.contactMobile, data.contact_mobile)
                const frontUrl = firstValue(profile.certFrontUrl, profile.cert_front_url, data.certFrontUrl, data.cert_front_url)
                const backUrl = firstValue(profile.certBackUrl, profile.cert_back_url, data.certBackUrl, data.cert_back_url)
                this.form.contactName = firstValue(contactName, this.form.contactName)
                this.form.legalPerson = firstValue(legalPerson, this.form.legalPerson)
                this.form.contactMobile = firstValue(contactMobile, this.form.contactMobile)
                this.form.legalIdFrontUrl = firstValue(frontUrl, this.form.legalIdFrontUrl)
                this.form.legalIdBackUrl = firstValue(backUrl, this.form.legalIdBackUrl)
                this.markReadonlyField('contactName', contactName)
                this.markReadonlyField('legalPerson', legalPerson)
                this.markReadonlyField('contactMobile', contactMobile)
                this.markReadonlyField('legalIdFrontUrl', frontUrl)
                this.markReadonlyField('legalIdBackUrl', backUrl)
            }
        },
        applyStatusToForm(data = {}) {
            this.status = data
            this.markReadonlyFields(data, {
                username: ['backendUsername', 'backend_username', 'username', 'loginName', 'login_name'],
                merchantName: ['merchantName', 'merchant_name', 'companyName', 'company_name', 'subjectName', 'subject_name'],
                merchantType: ['merchantType', 'merchant_type'],
                contactName: ['contactName', 'contact_name', 'contactPerson', 'contact_person'],
                contactMobile: ['contactMobile', 'contact_mobile', 'mobile', 'phone', 'contactPhone', 'contact_phone'],
                legalPerson: ['legalPerson', 'legal_person', 'legalName', 'legal_name'],
                licenseNo: ['licenseNo', 'license_no', 'businessLicenseNo', 'business_license_no', 'qualificationNo', 'qualification_no'],
                licenseImageUrl: ['licenseImageUrl', 'license_image_url', 'businessLicenseUrl', 'business_license_url', 'qualificationUrl', 'qualification_url'],
                legalIdFrontUrl: ['legalIdFrontUrl', 'legal_id_front_url', 'idCardFrontUrl', 'id_card_front_url'],
                legalIdBackUrl: ['legalIdBackUrl', 'legal_id_back_url', 'idCardBackUrl', 'id_card_back_url'],
                shopName: ['shopName', 'shop_name', 'storeName', 'store_name'],
                industryId: ['industryId', 'industry_id', 'industryCode', 'industry_code'],
                settlementAccountNo: ['settlementAccountNo', 'settlement_account_no', 'bankAccountNo', 'bank_account_no'],
                detailAddress: ['detailAddress', 'detail_address', 'businessAddress', 'business_address', 'address']
            })
            if (data.hasBackendAccount || data.has_backend_account || data.backendAccount || data.backend_account || data.backendUsername || data.backend_username || data.uiHints || data.ui_hints) {
                this.onboardingContext = {
                    ...this.onboardingContext,
                    hasBackendAccount: data.hasBackendAccount || data.has_backend_account || this.onboardingContext.hasBackendAccount,
                    has_backend_account: data.has_backend_account || data.hasBackendAccount || this.onboardingContext.has_backend_account,
                    backendAccount: data.backendAccount || data.backend_account || this.onboardingContext.backendAccount,
                    backend_account: data.backend_account || data.backendAccount || this.onboardingContext.backend_account,
                    backendUsername: data.backendUsername || data.backend_username || this.onboardingContext.backendUsername,
                    backend_username: data.backend_username || data.backendUsername || this.onboardingContext.backend_username,
                    uiHints: data.uiHints || data.ui_hints || this.onboardingContext.uiHints,
                    ui_hints: data.ui_hints || data.uiHints || this.onboardingContext.ui_hints
                }
            }
            this.ensureIndustryOptionFromStatus(data)
            const statusUsername = firstValue(data.username, data.loginName, data.login_name, data.backendUsername, data.backend_username)
            this.form.username = firstValue(statusUsername, this.form.username, this.suggestedUsername)
            this.markReadonlyField('username', statusUsername)
            this.form.merchantName = firstValue(data.merchantName, data.merchant_name, data.companyName, data.company_name, data.subjectName, data.subject_name, this.form.merchantName)
            this.form.merchantType = firstValue(data.merchantType, data.merchant_type, this.form.merchantType)
            this.form.contactName = firstValue(data.contactName, data.contact_name, data.contactPerson, data.contact_person, this.form.contactName)
            this.form.contactMobile = firstValue(data.contactMobile, data.contact_mobile, data.mobile, data.phone, data.contactPhone, data.contact_phone, this.form.contactMobile)
            this.form.legalPerson = firstValue(data.legalPerson, data.legal_person, data.legalName, data.legal_name, this.form.legalPerson)
            this.form.licenseNo = firstValue(data.licenseNo, data.license_no, data.businessLicenseNo, data.business_license_no, data.qualificationNo, data.qualification_no, this.form.licenseNo)
            this.form.licenseUrl = firstValue(data.licenseUrl, data.license_url, this.form.licenseUrl)
            this.form.licenseImageUrl = firstValue(data.licenseImageUrl, data.license_image_url, data.businessLicenseUrl, data.business_license_url, data.qualificationUrl, data.qualification_url, this.form.licenseImageUrl)
            this.form.legalIdFrontUrl = firstValue(data.legalIdFrontUrl, data.legal_id_front_url, data.idCardFrontUrl, data.id_card_front_url, this.form.legalIdFrontUrl)
            this.form.legalIdBackUrl = firstValue(data.legalIdBackUrl, data.legal_id_back_url, data.idCardBackUrl, data.id_card_back_url, this.form.legalIdBackUrl)
            const qualificationUrls = normalizeUrlList(firstValue(data.qualificationUrls, data.qualification_urls, data.qualificationUrlList, data.qualification_url_list))
            if (qualificationUrls.length) {
                this.form.qualificationUrls = qualificationUrls
                this.readonlyQualificationUrls = Array.from(new Set(this.readonlyQualificationUrls.concat(qualificationUrls)))
            }
            this.form.shopName = firstValue(data.shopName, data.shop_name, data.storeName, data.store_name, this.form.shopName)
            this.form.industryId = firstValue(data.industryId, data.industry_id, data.industryCode, data.industry_code, this.form.industryId)
            this.form.settlementAccountNo = firstValue(data.settlementAccountNo, data.settlement_account_no, data.bankAccountNo, data.bank_account_no, this.form.settlementAccountNo)
            this.form.detailAddress = firstValue(data.detailAddress, data.detail_address, data.businessAddress, data.business_address, data.address, this.form.detailAddress)
        },
        getStatus() {
            if (!this.userId || this.statusLoading) return Promise.resolve()
            this.statusLoading = true
            return getMerchantApplicationStatus({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyStatusToForm(res.data)
            }).catch(() => {
                this.status = this.status || {}
            }).finally(() => {
                this.statusLoading = false
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
            if (this.requiresBackendUsername && !this.form.username.trim()) return '请填写登录账号'
            if (this.requiresBackendPassword && (!this.form.password || this.form.password.length < 6)) return '请设置至少 6 位密码'
            if (!this.form.merchantName.trim()) return '请输入商户名称'
            if (!this.form.contactName.trim()) return '请输入联系人'
            if (!/^1\d{10}$/.test(String(this.form.contactMobile || ''))) return '请输入正确联系电话'
            if (!this.form.legalPerson.trim()) return '请输入法人姓名'
            if (!this.form.licenseNo.trim()) return '请输入营业执照编号'
            if (!this.form.licenseImageUrl) return '请上传营业执照'
            if (!this.form.legalIdFrontUrl || !this.form.legalIdBackUrl) return '请上传法人身份证正反面'
            if (!this.form.shopName.trim()) return '请输入店铺名称'
            if (!this.form.industryId) return '请选择行业分类'
            if (!this.form.settlementAccountNo.trim()) return '请输入结算账号'
            if (!this.form.detailAddress.trim()) return '请输入详细地址'
            return ''
        },
        buildPayload() {
            const industryId = this.form.industryId === '' ? '' : Number(this.form.industryId)
            return {
                ...this.form,
                userId: this.userId,
                username: this.requiresBackendUsername ? this.form.username.trim() : this.form.username,
                password: this.requiresBackendPassword ? this.form.password : '',
                merchantName: this.form.merchantName.trim(),
                contactName: this.form.contactName.trim(),
                contactMobile: this.form.contactMobile.trim(),
                legalPerson: this.form.legalPerson.trim(),
                licenseNo: this.form.licenseNo.trim(),
                shopName: this.form.shopName.trim(),
                industryId: Number.isNaN(industryId) ? this.form.industryId : industryId,
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
            const request = payload.applicationNo && this.auditStatus !== 'NOT_SUBMITTED'
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
            }).catch(() => {
                this.$toast({ title: '提交失败，请稍后再试' })
            }).finally(() => {
                this.submitting = false
            })
        },
        chooseImage(field) {
            if (this.isReadonlyField(field)) {
                this.$toast({ title: '该图片由系统带出，不能修改' })
                return
            }
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
            if (!this.canUploadQualification) {
                this.$toast({ title: '审核中不能修改资质' })
                return
            }
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
                this.form[field] = normalizeUploadUrl(res)
            }).catch(() => {
                this.$toast({ title: '图片上传失败' })
            }).finally(() => {
                uni.hideLoading()
            })
        },
        uploadQualification(path) {
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path).then(res => {
                const url = normalizeUploadUrl(res)
                if (url) this.form.qualificationUrls.push(url)
            }).catch(() => {
                this.$toast({ title: '资质上传失败' })
            }).finally(() => {
                uni.hideLoading()
            })
        },
        removeImage(field) {
            if (this.isReadonlyField(field)) {
                this.$toast({ title: '该图片由系统带出，不能删除' })
                return
            }
            this.form[field] = ''
        },
        removeQualification(index) {
            const url = this.form.qualificationUrls[index]
            if (this.isPending) {
                this.$toast({ title: '审核中不能删除资质' })
                return
            }
            if (this.isReadonlyQualification(url)) {
                this.$toast({ title: '该资质由系统带出，不能删除' })
                return
            }
            this.form.qualificationUrls.splice(index, 1)
        }
    }
}
</script>

<style lang="scss">
.license-page {
    position: relative;
    min-height: 100vh;
    padding: 0 24rpx calc(142rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: #f5f7fb;
}

.license-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 438rpx;
    background: linear-gradient(135deg, #1d73f6 0%, #23b99a 100%);
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
    padding: 26rpx 24rpx 24rpx;
}

.status-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18rpx;
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
    margin-top: 6rpx;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 46rpx;
}

.status-pill {
    flex: none;
    max-width: 240rpx;
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    font-size: 23rpx;
    font-weight: 600;
    line-height: 32rpx;
    text-align: center;
    box-sizing: border-box;
}

.status-pill--success { color: #0b8f5a; background: #e9fbf3; }
.status-pill--danger { color: #d92d20; background: #fff1f1; }
.status-pill--pending { color: #1769ff; background: #edf5ff; }
.status-pill--default { color: #667085; background: #f2f4f7; }

.status-card__value--success { color: #10a66a; }
.status-card__value--danger { color: #e5484d; }
.status-card__value--pending { color: #1677ff; }
.status-card__value--default { color: #667085; }

.status-card__meta,
.status-card__remark,
.status-card__time {
    margin-top: 10rpx;
}

.status-steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10rpx;
    margin-top: 22rpx;
    padding-top: 22rpx;
    border-top: 1rpx solid #eef2f6;
}

.status-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #98a2b3;
    font-size: 22rpx;
    line-height: 32rpx;
}

.status-step__dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42rpx;
    height: 42rpx;
    margin-bottom: 8rpx;
    border-radius: 50%;
    color: #98a2b3;
    background: #f2f4f7;
    font-size: 22rpx;
    font-weight: 700;
}

.status-step.is-active {
    color: #1769ff;
    font-weight: 600;
}

.status-step.is-active .status-step__dot {
    color: #ffffff;
    background: #1769ff;
}

.status-step.is-done {
    color: #10a66a;
}

.status-step.is-done .status-step__dot {
    color: #ffffff;
    background: #10a66a;
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

.approved-card__row text:first-child {
    flex: none;
    color: #7a8494;
}

.approved-card__row text:last-child {
    flex: 1;
    min-width: 0;
    text-align: right;
    word-break: break-word;
}

.approved-card__row--address {
    align-items: flex-start;
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

.account-fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16rpx;
    margin-top: 18rpx;
}

.form-section {
    padding: 24rpx 22rpx;
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
    grid-template-columns: 1fr;
    gap: 16rpx;
    margin-top: 18rpx;
}

.form-row {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    padding: 0 22rpx;
    border-radius: 18rpx;
    background: #f9fbfd;
    border: 1rpx solid #edf2f7;
    box-sizing: border-box;
}

.form-row--wide {
    grid-column: 1 / -1;
}

.form-row--picker {
    justify-content: space-between;
    gap: 20rpx;
}

.form-row--readonly {
    background: #f3f6fa;
    border-color: #e5ebf2;
}

.form-row--readonly .form-input,
.form-row--readonly .form-picker {
    color: #667085;
}

.form-label {
    flex: none;
    width: 190rpx;
    color: #465366;
    font-size: 25rpx;
    font-weight: 600;
    line-height: 36rpx;
}

.form-label--long {
    width: 238rpx;
    white-space: nowrap;
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
    height: 94rpx;
    color: #1f2937;
    font-size: 26rpx;
    line-height: 94rpx;
    text-align: right;
    word-break: break-word;
}

.form-picker-wrap {
    display: block;
    flex: 1;
    min-width: 0;
    text-align: right;
}

.form-placeholder {
    color: #a6afbd;
}

.upload-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 18rpx;
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
    height: 156rpx;
    border-radius: 16rpx;
    background: #f8fafc;
    border: 1rpx dashed #cfd7e3;
    overflow: hidden;
    box-sizing: border-box;
}

.qualification-add {
    height: 156rpx;
    min-height: 156rpx;
    color: #1769ff;
    background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
    border-color: #b8d6ff;
}

.upload-item__box--readonly {
    background: #f3f6fa;
    border-style: solid;
    border-color: #e5ebf2;
}

.qualification-item {
    background: #ffffff;
    border-style: solid;
    border-color: #e7edf5;
    box-shadow: 0 8rpx 18rpx rgba(31, 58, 94, .05);
}

.upload-item__image,
.qualification-item__image {
    width: 100%;
    height: 100%;
}

.upload-item__empty,
.qualification-add__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    color: #98a2b3;
    font-size: 23rpx;
}

.qualification-add__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 156rpx;
}

.upload-item__plus,
.qualification-add__plus {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54rpx;
    height: 54rpx;
    border-radius: 50%;
    background: rgba(23, 105, 255, .1);
    color: #1769ff;
    font-size: 42rpx;
    line-height: 54rpx;
}

.upload-item__tip,
.qualification-add__text {
    margin-top: 10rpx;
    font-size: 23rpx;
    font-weight: 600;
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
    margin-top: 18rpx;
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

    .upload-grid,
    .qualification-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .status-card__head {
        flex-direction: column;
    }

    .status-pill {
        max-width: 100%;
    }

    .form-row {
        align-items: flex-start;
        flex-direction: column;
        padding: 16rpx 18rpx;
    }

    .form-row--picker {
        align-items: center;
        flex-direction: row;
        min-height: 96rpx;
    }

    .form-label {
        width: auto;
        white-space: nowrap;
    }

    .form-row--picker .form-label {
        width: 190rpx;
    }

    .form-input,
    .form-picker {
        width: 100%;
        height: 70rpx;
        line-height: 70rpx;
    }

    .form-picker-wrap {
        width: auto;
        flex: 1;
    }

    .form-input {
        text-align: left;
    }

    .form-picker {
        text-align: right;
    }

    .upload-item__box,
    .qualification-add,
    .qualification-item {
        height: 156rpx;
    }
}
</style>
