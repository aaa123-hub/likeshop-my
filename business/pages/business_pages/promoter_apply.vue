<template>
    <view class="promoter-page">
        <navbar title="角色申请" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>
        <view class="header">
            <view class="title-row">
                <view class="title">角色申请</view>
                <view class="header-tags">
                    <view class="header-tag" v-for="item in headerRoleTags" :key="item.roleCode">{{ roleLabel(item.roleCode) }}</view>
                </view>
            </view>
            <view class="subtitle">实名通过后选择角色，提交必要资料等待审核</view>
        </view>

        <view class="kyc-gate" v-if="!isKycApproved">
            <view>
                <view class="kyc-gate__title">{{ kycGateTitle }}</view>
                <view class="kyc-gate__desc">{{ kycGateDesc }}</view>
            </view>
            <view class="kyc-gate__btn" @tap="goKyc">去实名</view>
        </view>

        <view class="apply-entry" v-if="showReapplyEntry" @tap="startApply">
            <view>
                <view class="apply-entry__title">申请新角色</view>
            </view>
            <view class="apply-entry__btn">去申请</view>
        </view>

        <view class="empty-state" v-else-if="showFirstApplyEntry">
            <view class="empty-state__title">申请角色</view>
            <view class="empty-state__desc">请选择推广者、区域代理、子公司或总部提交申请</view>
            <view class="empty-state__btn" @tap="startFirstApply">去申请</view>
        </view>

        <view :class="['status-card', 'status-card--' + currentStatusType]" v-if="currentApplication">
            <view>
                <view class="status-title">{{ roleLabel(currentApplication.roleCode) }}</view>
                <view class="status-desc">{{ currentStatusDesc }}</view>
                <view class="status-desc" v-if="applicationAuditRemark(currentApplication)">{{ applicationAuditRemark(currentApplication) }}</view>
                <view class="status-desc" v-if="currentApplication.applicationNo">申请编号：{{ currentApplication.applicationNo }}</view>
            </view>
            <view class="status-value">{{ statusLabel(currentApplication.applicationStatus) }}</view>
        </view>

        <view :class="['focus-card', 'focus-card--' + currentStatusType]" v-if="currentApplication && focusInfo.length">
            <view class="focus-item" v-for="item in focusInfo" :key="item.label">
                <text class="focus-label">{{ item.label }}</text>
                <text class="focus-value">{{ item.value }}</text>
            </view>
        </view>

        <view class="info-card" v-if="currentApplication">
            <view class="info-title">{{ currentRole ? '角色信息' : '申请信息' }}</view>
            <view class="info-grid">
                <view class="info-item" v-for="item in visibleApplicationInfo" :key="item.label">
                    <text class="info-label">{{ item.label }}</text>
                    <text class="info-value">{{ item.value }}</text>
                </view>
            </view>
        </view>

        <view class="action-card" v-if="currentApplication && !showApplyForm && statusActions.length">
            <view class="action-title">下一步操作</view>
            <view class="action-buttons">
                <button
                    v-for="item in statusActions"
                    :key="item.type"
                    :class="['action-btn', item.primary ? 'action-btn--primary' : 'action-btn--plain']"
                    @tap="handleStatusAction(item.type)"
                >{{ item.label }}</button>
            </view>
        </view>

        <view class="form-card" v-if="shouldShowForm">
            <view class="form-title">{{ currentApplication ? '重新提交资料' : '提交申请资料' }}</view>
            <view class="role-select">
                <view class="role-select__head">
                    <text class="role-select__title">申请角色</text>
                    <text class="role-select__current">当前选择：{{ selectedRoleLabel }}</text>
                </view>
                <view class="role-select__grid">
                    <view
                        v-for="item in rolePickerRange"
                        :key="item.value"
                        :class="['role-select__option', normalizeRoleCode(item.value) === selectedRoleCode ? 'role-select__option--active' : '']"
                        @tap="onRoleCardTap(item)"
                    >
                        <view>
                            <view class="role-select__name">{{ item.label }}</view>
                            <view class="role-select__desc">{{ roleOptionDesc(item.value) }}</view>
                        </view>
                        <view class="role-select__check"></view>
                    </view>
                </view>
            </view>
            <view class="form-item">
                <text class="label">姓名</text>
                <view class="picker-value">{{ form.applicantName || '-' }}</view>
            </view>
            <view class="form-item">
                <text class="label">手机号</text>
                <input v-model="form.mobile" type="number" placeholder="请输入手机号" />
            </view>
            <view class="form-item">
                <text class="label">证件类型</text>
                <view class="picker-value">{{ currentCertTypeLabel }}</view>
            </view>
            <view class="form-item">
                <text class="label">证件号码</text>
                <view class="picker-value">{{ form.certNo || '-' }}</view>
            </view>
            <view class="form-item" v-if="selectedDepositText">
                <text class="label">平台押金</text>
                <view class="picker-value">{{ selectedDepositText }}</view>
            </view>
            <view class="form-item">
                <text class="label">登录账号</text>
                <input v-model="form.username" placeholder="审核通过后用于登录渠道后台" />
            </view>
            <view class="form-item">
                <text class="label">登录密码</text>
                <input v-model="form.password" password placeholder="请设置至少 6 位密码" />
            </view>
            <view class="form-item">
                <text class="label">确认密码</text>
                <input v-model="form.confirmPassword" password placeholder="请再次输入密码" />
            </view>
            <view class="form-item form-item--textarea">
                <text class="label">申请说明</text>
                <textarea v-model="form.remark" placeholder="可填写推广资源、经营区域等信息" />
            </view>
            <view class="kyc-material">
                <view class="kyc-material__title">实名材料</view>
                <view class="kyc-material__photos">
                    <image v-if="form.certFrontUrl" class="kyc-material__photo" :src="form.certFrontUrl" mode="aspectFit"></image>
                    <image v-if="form.certBackUrl" class="kyc-material__photo" :src="form.certBackUrl" mode="aspectFit"></image>
                </view>
            </view>
        </view>

        <button class="submit-btn" v-if="shouldShowForm" :loading="submitting" @tap="submitApply">{{ currentApplication ? '重新提交申请' : '提交申请' }}</button>

        <view class="history" v-if="applications.length">
            <view class="history-title">申请记录</view>
            <view v-for="item in applications" :key="item.applicationNo" class="history-item">
                <view>
                    <view class="history-role">{{ roleLabel(item.roleCode) }}</view>
                    <view class="history-time">{{ item.appliedAt || item.createdAt || '' }}</view>
                    <view class="history-desc" v-if="applicationAuditRemark(item)">{{ applicationAuditRemark(item) }}</view>
                </view>
                <view :class="['history-status', 'history-status--' + statusType(item.applicationStatus)]">{{ statusLabel(item.applicationStatus) }}</view>
            </view>
        </view>

    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@/components/navbar/navbar.vue'
import { applyRoleApplication, getKycStatus, getRoleApplications, getRoles } from '@/api/user'
import { prepay } from '@/api/app'
import { wxpay } from '@/utils/pay'
import { localizeBackendText, normalizeBackendCode, normalizeKycStatus } from '@/utils/backend-text'

const roleOptions = [
    { label: '推广者', value: 'PROMOTER' },
    { label: '区域代理', value: 'AGENT' },
    { label: '子公司', value: 'SUBSIDIARY' },
    { label: '总部', value: 'HQ' }
]

const APPLY_ROLE_CODES = roleOptions.map(item => item.value)

export default {
    components: {
        Navbar
    },
    data() {
        return {
            roleOptions: roleOptions.map(item => ({ ...item })),
            roleDepositConfig: {},
            roleIndex: 0,
            roles: [],
            applications: [],
            certTypes: [
                { label: '身份证', value: 'ID_CARD' },
                { label: '营业执照', value: 'BUSINESS_LICENSE' }
            ],
            certTypeIndex: 0,
            form: {
                applicantName: '',
                mobile: '',
                certType: 'ID_CARD',
                certNo: '',
                certFrontUrl: '',
                certBackUrl: '',
                businessLicenseUrl: '',
                username: '',
                password: '',
                confirmPassword: '',
                remark: '',
                materialUrlsText: '',
                agreementAccepted: false
            },
            showApplyForm: false,
            kycInfo: {},
            submitting: false
        }
    },
    computed: {
        ...mapGetters(['userInfo', 'isLogin', 'inviteCode']),
        currentApplication() {
            const item = this.applications.find((item) => this.normalizeRoleCode(item.roleCode) === this.selectedRoleCode)
            return item ? this.withPromoterCode(item) : null
        },
        currentRole() {
            return this.currentRoles.find((item) => this.normalizeRoleCode(item.roleCode) === this.selectedRoleCode) || null
        },
        currentRoles() {
            const approvedApplications = this.applications.filter((item) => this.statusType(item.applicationStatus || item.auditStatus || item.status) === 'approved')
            const roles = this.roles.length ? this.roles : approvedApplications
            return roles
                .filter((item) => {
                    const status = item.applicationStatus || item.auditStatus || item.status
                    return !status || this.statusType(status) === 'approved'
                })
                .map((item) => this.withPromoterCode({ ...item, roleCode: this.normalizeRoleCode(item.roleCode || item.role_code || item.role) }))
                .filter((item) => APPLY_ROLE_CODES.includes(this.normalizeRoleCode(item.roleCode)))
        },
        displayCurrentRoles() {
            const tags = []
            if (this.isMerchantRole) tags.push({ roleCode: 'MERCHANT', roleName: '商家' })
            this.currentRoles.forEach((item) => {
                const code = this.normalizeRoleCode(item.roleCode)
                if (!tags.some((tag) => this.normalizeRoleCode(tag.roleCode) === code)) {
                    tags.push(item)
                }
            })
            if (tags.length) return tags
            return [{ roleCode: 'USER', roleName: '普通用户' }]
        },
        headerRoleTags() {
            const tags = [{ roleCode: 'MERCHANT', roleName: '商家' }]
            this.currentRoles.forEach((item) => {
                const code = this.normalizeRoleCode(item.roleCode)
                if (code && code !== 'MERCHANT' && code !== 'USER' && !tags.some((tag) => this.normalizeRoleCode(tag.roleCode) === code)) {
                    tags.push({ ...item, roleCode: code })
                }
            })
            return tags
        },
        selectableRoleOptions() {
            return this.roleOptions.map((item) => ({
                ...item,
                label: this.roleLabel(item.value)
            }))
        },
        normalizedRoleOptions() {
            const seen = {}
            return this.selectableRoleOptions.filter((item) => {
                const code = this.normalizeRoleCode(item.value)
                if (!APPLY_ROLE_CODES.includes(code) || seen[code]) return false
                seen[code] = true
                return true
            }).map((item) => ({
                ...item,
                value: this.normalizeRoleCode(item.value),
                label: this.roleLabel(item.value)
            }))
        },
        rolePickerRange() {
            return this.normalizedRoleOptions.length ? this.normalizedRoleOptions : roleOptions.map((item) => ({ ...item }))
        },
        selectedRoleCode() {
            const item = this.roleOptions[this.roleIndex] || this.roleOptions[0] || {}
            return this.normalizeRoleCode(item.value || 'PROMOTER')
        },
        selectedRoleLabel() {
            return this.roleLabel(this.selectedRoleCode)
        },
        isMerchantRole() {
            const info = this.userInfo || {}
            const rawRoles = [
                info.roleCode,
                info.role_code,
                info.role,
                info.userRole,
                info.user_role,
                info.identity,
                info.identityType,
                info.identity_type
            ]
            const roleList = []
                .concat(Array.isArray(info.roles) ? info.roles : [])
                .concat(Array.isArray(this.roles) ? this.roles : [])
            const roleCodeList = roleList.map((item) => this.normalizeRoleCode(item.roleCode || item.role_code || item.role || item.code || item.value || item))
            const hasMerchantCode = rawRoles.concat(roleCodeList).some((code) => this.normalizeRoleCode(code) === 'MERCHANT')
            return Boolean(
                hasMerchantCode
                || info.isMerchant
                || info.is_merchant
                || info.merchantId
                || info.merchant_id
                || info.shopId
                || info.shop_id
            )
        },
        currentCertTypeLabel() {
            const item = this.certTypes[this.certTypeIndex] || this.certTypes[0] || {}
            return item.label || '身份证'
        },
        normalizedKycStatus() {
            return normalizeKycStatus(this.kycInfo.kycStatus || this.kycInfo.kyc_status || 'NOT_SUBMITTED')
        },
        isKycApproved() {
            return this.normalizedKycStatus === 'APPROVED'
        },
        kycGateTitle() {
            if (this.normalizedKycStatus === 'PENDING_AUDIT') return '实名审核中'
            if (this.normalizedKycStatus === 'REJECTED') return '实名未通过'
            return '请先完成实名认证'
        },
        kycGateDesc() {
            if (this.kycGateTitle === '实名审核中') return '实名审核通过后可申请角色。'
            if (this.kycGateTitle === '实名未通过') return '请重新提交实名资料后再申请角色。'
            return '角色申请会使用实名通过后的姓名、证件和照片。'
        },
        roleDepositAmount() {
            const role = this.roleOptions[this.roleIndex] || {}
            const config = {
                ...(this.userInfo.roleDepositConfig || this.userInfo.role_deposit_config || this.userInfo.depositConfig || this.userInfo.deposit_config || {}),
                ...this.roleDepositConfig
            }
            const value = role.depositAmount ?? config[this.selectedRoleCode] ?? config[this.normalizeRoleCode(role.value)] ?? ''
            return value === undefined || value === null ? '' : value
        },
        applyRoleApplications() {
            return this.applications.filter(item => APPLY_ROLE_CODES.includes(this.normalizeRoleCode(item.roleCode)))
        },
        hasApplyRoleRecord() {
            return this.currentRoles.length > 0 || this.applyRoleApplications.length > 0
        },
        promoterInviteCode() {
            return this.userInfo.promoter_code || this.userInfo.promoterCode || this.userInfo.distribution_code || this.userInfo.distributionCode || this.inviteCode || ''
        },
        requiresPrepayDeposit() {
            return APPLY_ROLE_CODES.includes(this.selectedRoleCode)
        },
        selectedDepositText() {
            if (!this.requiresPrepayDeposit) return '无需押金'
            if (this.roleDepositAmount === '') return '待平台配置'
            return this.moneyText(this.roleDepositAmount)
        },
        currentStatusType() {
            return this.statusType(this.currentApplication && this.currentApplication.applicationStatus)
        },
        currentStatusDesc() {
            if (this.currentStatusType === 'approved') return '当前角色已生效，可查看对应角色能力和入口。'
            const descMap = {
                deposit: '资料已提交，请按平台要求完成押金缴纳。',
                pending: '押金已完成，申请待平台管理员审核，通过后推广者角色才会正式生效。',
                approved: '审核已通过，角色已开通。',
                rejected: '申请未通过，请根据审核意见调整后重新提交。',
                cancelled: '该申请已取消，如需继续可重新提交资料。'
            }
            return descMap[this.currentStatusType] || '填写资料后提交审核。'
        },
        focusInfo() {
            const item = this.currentApplication || {}
            const status = this.currentStatusType
            if (status === 'deposit') {
                return [
                    { label: '待缴押金', value: this.moneyText(item.depositAmount) || '以平台通知为准' },
                    { label: '押金状态', value: this.depositStatusLabel(item.depositStatus) || '待缴纳' }
                ]
            }
            if (status === 'approved') {
                return [
                    { label: '推广码', value: item.inviteCode || item.promoterCode || this.promoterInviteCode },
                    { label: '通过时间', value: item.auditTime }
                ].filter((info) => info.value)
            }
            if (status === 'rejected') {
                return [
                    { label: '拒绝原因', value: this.applicationAuditRemark(item) || '请联系平台获取具体原因' },
                    { label: '审核时间', value: item.auditTime }
                ].filter((info) => info.value)
            }
            return [
                { label: '申请时间', value: item.appliedAt },
                { label: '当前状态', value: this.statusLabel(item.applicationStatus) }
            ].filter((info) => info.value)
        },
        applicationInfo() {
            const item = this.currentApplication || {}
            return [
                { label: '申请人', value: item.applicantName },
                { label: '手机号', value: item.mobile },
                { label: '推广码', value: item.inviteCode || item.promoterCode || this.promoterInviteCode },
                { label: '押金金额', value: this.moneyText(item.depositAmount) },
                { label: '押金状态', value: this.depositStatusLabel(item.depositStatus) },
                { label: '申请时间', value: item.appliedAt },
                { label: '审核时间', value: item.auditTime },
                { label: '申请说明', value: item.remark }
            ]
        },
        visibleApplicationInfo() {
            return this.applicationInfo.filter((item) => item.value)
        },
        shouldShowForm() {
            if (!this.isKycApproved || this.currentStatusType === 'approved') return false
            if (!this.currentApplication && !this.hasApplyRoleRecord) return true
            return !this.currentApplication || this.showApplyForm
        },
        showFirstApplyEntry() {
            return false
        },
        showReapplyEntry() {
            return this.isKycApproved && !this.showApplyForm && this.hasApplyRoleRecord && !this.currentApplication
        },
        currentActionDesc() {
            if (this.currentStatusType === 'approved') return '当前角色已开通，可使用后端返回的角色信息。'
            const descMap = {
                deposit: '当前申请已进入押金缴纳环节，完成缴纳后继续等待审核。',
                pending: '申请正在审核中，暂时无需重复提交资料。',
                approved: '申请已通过，请使用审核通过后的账号进入渠道后台。',
                rejected: '申请未通过，可根据审核意见修改资料后重新提交。',
                cancelled: '申请已取消，如需继续可重新提交资料。'
            }
            return descMap[this.currentStatusType] || '请根据当前状态继续处理。'
        },
        statusActions() {
            const status = this.currentStatusType
            if (status === 'approved') {
                return [{ type: 'backend', label: '进入角色工作台', primary: true }]
            }
            if (status === 'rejected' || status === 'cancelled') {
                return [{ type: 'reapply', label: '重新申请', primary: true }]
            }
            if (status === 'deposit') {
                return [{ type: 'deposit', label: '去缴押金', primary: true }]
            }
            return []
        }
    },
    onLoad() {
        this.form.mobile = this.userInfo.mobile || ''
        this.loadPageData()
    },
    methods: {
        async loadPageData() {
            await Promise.all([this.loadKycStatus(), this.loadApplications(), this.loadRoles()])
            this.mergeRoleOptions()
            this.syncSelectedRole()
        },
        async loadKycStatus() {
            try {
                const res = await getKycStatus()
                if (res.code != 1) return
                this.kycInfo = res.data || {}
                if (this.isKycApproved) this.applyKycToForm()
                else this.clearKycForm()
            } catch (error) {}
        },
        clearKycForm() {
            this.form.applicantName = ''
            this.form.certType = 'ID_CARD'
            this.form.certNo = ''
            this.form.certFrontUrl = ''
            this.form.certBackUrl = ''
            this.certTypeIndex = 0
        },
        applyKycToForm() {
            const data = this.kycInfo || {}
            this.form.applicantName = data.realName || data.real_name || this.form.applicantName
            this.form.certType = data.certType || data.cert_type || this.form.certType
            this.form.certNo = data.certNo || data.cert_no || this.form.certNo
            this.form.certFrontUrl = data.certFrontUrl || data.cert_front_url || this.form.certFrontUrl
            this.form.certBackUrl = data.certBackUrl || data.cert_back_url || this.form.certBackUrl
            const certIndex = this.certTypes.findIndex((item) => item.value === this.form.certType)
            if (certIndex !== -1) this.certTypeIndex = certIndex
        },
        async loadRoles() {
            const res = await getRoles().catch(() => null)
            if (res && res.code == 1) {
                const data = res.data || {}
                this.roles = data.roles || data.list || []
                this.roleDepositConfig = data.roleDepositConfig || data.role_deposit_config || data.depositConfig || data.deposit_config || this.roleDepositConfig
                this.mergeApplyRoleOptions(data.applyRoles || data.roleOptions || [])
            }
        },
        async loadApplications() {
            try {
                const res = await getRoleApplications()
                if (res.code == 1) {
                    const data = res.data || {}
                    this.applications = (data.applications || data.list || []).map((item) => this.normalizeApplicationState(item))
                }
            } catch (error) {
                uni.showToast({ title: '获取申请记录失败', icon: 'none' })
            }
        },
        normalizeApplicationState(item = {}) {
            const status = normalizeBackendCode(item.applicationStatus || item.auditStatus || item.status)
            const payStatus = normalizeBackendCode(item.payStatus || item.depositStatus || item.pay_status || item.deposit_status)
            if ((status === '' || status === 'PENDING_DEPOSIT' || status === 'WAIT_PAY' || status === 'PENDING_PAY') && ['PAID', 'SUCCESS', 'WAIVED', 'FREE'].includes(payStatus)) {
                return {
                    ...item,
                    rawApplicationStatus: item.rawApplicationStatus || item.raw_application_status || status,
                    raw_application_status: item.rawApplicationStatus || item.raw_application_status || status,
                    applicationStatus: 'PENDING_AUDIT',
                    auditStatus: 'PENDING_AUDIT',
                    depositStatus: payStatus,
                    payStatus
                }
            }
            return item
        },
        markDepositPaidPendingAudit(application = this.currentApplication || {}) {
            const code = this.normalizeRoleCode(application.roleCode || application.role_code || this.selectedRoleCode)
            const existedIndex = this.applications.findIndex((item) => this.normalizeRoleCode(item.roleCode || item.role_code || item.role) === code)
            if (existedIndex === -1) return
            const next = this.normalizeApplicationState({
                ...this.applications[existedIndex],
                ...application,
                roleCode: code,
                payStatus: 'PAID',
                depositStatus: 'PAID'
            })
            this.$set(this.applications, existedIndex, next)
        },
        syncSelectedRole() {
            const roleCode = (this.currentRoles[0] && this.currentRoles[0].roleCode) || (this.applyRoleApplications[0] && this.applyRoleApplications[0].roleCode)
            if (!roleCode) return
            this.selectRole(roleCode)
        },
        firstApplyableRoleIndex() {
            return this.roleOptions.findIndex((role) => {
                const code = this.normalizeRoleCode(role.value)
                const application = this.applications.find((item) => this.normalizeRoleCode(item.roleCode) === code)
                return this.statusType(application && application.applicationStatus) !== 'approved'
            })
        },
        mergeRoleOptions() {
            const source = this.applications
            source.forEach((item) => {
                const code = this.normalizeRoleCode(item.roleCode)
                if (!APPLY_ROLE_CODES.includes(code) || this.roleOptions.some((role) => role.value === code)) return
                this.roleOptions.push({ label: item.roleName || code, value: code })
            })
        },
        mergeApplyRoleOptions(source = []) {
            source.forEach((item) => {
                const code = this.normalizeRoleCode(item.roleCode || item.value || item.code)
                if (!APPLY_ROLE_CODES.includes(code)) return
                const existed = this.roleOptions.find((role) => role.value === code)
                const next = {
                    label: item.label || item.roleName || item.role_name || this.roleLabel(code),
                    value: code,
                    depositAmount: item.depositAmount ?? item.deposit_amount ?? item.bondAmount ?? item.bond_amount ?? item.marginAmount ?? item.margin_amount ?? ''
                }
                if (existed) {
                    Object.assign(existed, next)
                } else {
                    this.roleOptions.push(next)
                }
                if (next.depositAmount !== '') this.$set(this.roleDepositConfig, code, next.depositAmount)
            })
        },
        withPromoterCode(item = {}) {
            if (this.normalizeRoleCode(item.roleCode || item.role_code || item.role) !== 'PROMOTER') return item
            const code = item.inviteCode || item.invite_code || item.promoterCode || item.promoter_code || this.promoterInviteCode
            return {
                ...item,
                inviteCode: code,
                promoterCode: code
            }
        },
        isApplyRole(roleCode) {
            return APPLY_ROLE_CODES.includes(this.normalizeRoleCode(roleCode))
        },
        selectDisplayRole(item = {}) {
            const code = this.normalizeRoleCode(item.roleCode || item.role_code || item.role)
            if (!this.isApplyRole(code)) return
            this.selectRole(code)
        },
        selectRole(roleCode) {
            const index = this.roleOptions.findIndex((item) => item.value === this.normalizeRoleCode(roleCode))
            if (index !== -1) {
                this.roleIndex = index
                this.showApplyForm = false
            }
        },
        onRoleCardTap(item = {}) {
            const roleIndex = this.roleOptions.findIndex((role) => this.normalizeRoleCode(role.value) === this.normalizeRoleCode(item.value))
            if (roleIndex === -1) return
            this.roleIndex = roleIndex
            this.prefillForm(this.currentApplication || {})
        },
        startApply() {
            if (!this.isKycApproved) return this.goKyc()
            const index = this.firstApplyableRoleIndex()
            if (index === -1) {
                uni.showToast({ title: '当前角色均已开通', icon: 'none' })
                return
            }
            this.roleIndex = index
            this.prefillForm(this.currentApplication || {})
            this.applyKycToForm()
            this.showApplyForm = true
        },
        roleLabel(roleCode) {
            const code = this.normalizeRoleCode(roleCode)
            const map = {
                MERCHANT: '商家',
                USER: '普通用户',
                PROMOTER: '推广者',
                AGENT: '区域代理',
                SUBSIDIARY: '子公司',
                HQ: '总部'
            }
            if (map[code]) return map[code]
            const role = roleOptions.find((item) => item.value === code)
            if (role) return role.label
            const currentRole = this.currentRoles.find((item) => this.normalizeRoleCode(item.roleCode) === code)
            return (currentRole && currentRole.roleName) || code
        },
        normalizeRoleCode(roleCode) {
            const code = normalizeBackendCode(roleCode)
            const map = { HEADQUARTERS: 'HQ', OPERATION_CENTER: 'AGENT', AREA_AGENT: 'AGENT', COUNTY_AGENT: 'AGENT' }
            return map[code] || code
        },
        startFirstApply() {
            if (!this.isKycApproved) return this.goKyc()
            const index = this.firstApplyableRoleIndex()
            this.roleIndex = index === -1 ? 0 : index
            this.prefillForm({})
            this.applyKycToForm()
            this.showApplyForm = true
        },
        statusType(status) {
            const normalized = normalizeBackendCode(status)
            if (['PENDING_DEPOSIT'].includes(normalized)) return 'deposit'
            if (['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING'].includes(normalized)) return 'pending'
            if (['APPROVED', 'PASS', 'PASSED', 'REALNAME_VERIFIED'].includes(normalized)) return 'approved'
            if (['REJECTED', 'REJECT', 'FAILED'].includes(normalized)) return 'rejected'
            if (['CANCELLED'].includes(normalized)) return 'cancelled'
            return 'default'
        },
        statusLabel(status) {
            const normalized = normalizeBackendCode(status)
            const map = {
                NOT_SUBMITTED: '未申请',
                PENDING_DEPOSIT: '待缴押金',
                PENDING_AUDIT: '待审核',
                WAIT_AUDIT: '待审核',
                APPROVED: '已通过',
                PASS: '已通过',
                PASSED: '已通过',
                REJECTED: '已拒绝',
                REJECT: '已拒绝',
                CANCELLED: '已取消',
                AUDITING: '待审核',
                SUCCESS: '待审核',
                FAILED: '已拒绝'
            }
            return map[normalized] || localizeBackendText(status, '未申请')
        },
        depositStatusLabel(status) {
            const normalized = normalizeBackendCode(status)
            const map = {
                UNPAID: '待缴纳',
                PENDING: '待缴纳',
                WAIT_PAY: '待缴纳',
                PENDING_PAY: '待缴纳',
                PAID: '已缴纳',
                SUCCESS: '已缴纳',
                REFUNDED: '已退还',
                WAIVED: '无需缴纳'
            }
            return map[normalized] || localizeBackendText(status, '')
        },
        roleOptionDesc(roleCode) {
            const map = {
                PROMOTER: '适合推广获客和邀请分销',
                AGENT: '适合区域渠道和门店拓展',
                SUBSIDIARY: '适合直营网点和下级管理',
                HQ: '适合总部统一运营管理'
            }
            return map[this.normalizeRoleCode(roleCode)] || '提交资料后等待平台审核'
        },
        applicationAuditRemark(item = {}) {
            const raw = item.auditRemark || item.audit_remark || item.rejectReasonMessage || item.reject_reason_message || item.rejectReasonCode || item.reject_reason_code || item.remark || ''
            return localizeBackendText(raw, '')
        },
        moneyText(value) {
            if (value === '' || value === null || value === undefined) return ''
            return `¥${value}`
        },
        async handleStatusAction(type) {
            if (type === 'reapply') {
                this.prefillForm(this.currentApplication || {})
                this.showApplyForm = true
                return
            }
            if (type === 'deposit') {
                await this.payDeposit()
                return
            }
            if (type === 'backend') {
                const url = this.currentApplication && this.currentApplication.backendUrl
                if (url) {
                    uni.navigateTo({ url })
                    return
                }
                uni.navigateTo({ url: `/business/pages/business_pages/role_workbench?roleCode=${this.selectedRoleCode}` })
            }
        },
        goKyc() {
            uni.navigateTo({ url: '/business/pages/business_pages/user_kyc' })
        },
        async payDeposit() {
            const application = this.currentApplication || {}
            const depositNo = application.depositNo || application.deposit_no
            if (!depositNo) {
                uni.showModal({
                    title: '押金单未生成',
                    content: application.applicationNo ? `申请编号：${application.applicationNo}` : '请刷新后重试，或联系平台确认押金单。',
                    showCancel: false
                })
                return
            }
            if (['PAID', 'SUCCESS', 'WAIVED'].includes(String(application.payStatus || application.depositStatus || '').toUpperCase())) {
                uni.showToast({ title: '押金已缴纳', icon: 'none' })
                this.markDepositPaidPendingAudit(application)
                await this.loadPageData()
                return
            }
            try {
                const res = await prepay({
                    bizType: 'ROLE_DEPOSIT',
                    bizOrderNo: depositNo,
                    amount: application.depositAmount,
                    idempotentKey: `role-deposit-${depositNo}-WECHAT_JSAPI`
                })
                const { code, data, msg, message } = res || {}
                if (code != 1 && code != 20001) {
                    uni.showModal({
                        title: '押金支付未发起',
                        content: msg || message || `押金单号：${depositNo}`,
                        showCancel: false
                    })
                    return
                }
                if (data && data.payStatus === 'SUCCESS') {
                    uni.showToast({ title: '押金已缴纳', icon: 'success' })
                    this.markDepositPaidPendingAudit(application)
                    await this.loadPageData()
                    return
                }
                const payInfo = data && (data.channelPayInfo || data.channel_pay_info || data)
                const payResult = await wxpay(payInfo || {})
                if (payResult === 'success') {
                    uni.showToast({ title: '支付成功', icon: 'success' })
                    this.markDepositPaidPendingAudit(application)
                } else {
                    uni.showToast({ title: '支付未完成', icon: 'none' })
                }
                await this.loadPageData()
            } catch (error) {
                uni.showModal({
                    title: '押金支付异常',
                    content: (error && error.message) || `押金单号：${depositNo}`,
                    showCancel: false
                })
            }
        },
        prefillForm(application = {}) {
            this.form.applicantName = application.applicantName || this.form.applicantName
            this.form.mobile = application.mobile || this.form.mobile
            this.form.username = application.username || this.form.username
            this.form.businessLicenseUrl = application.businessLicenseUrl || application.business_license_url || this.form.businessLicenseUrl
            this.applyKycToForm()
            this.form.remark = application.remark || this.form.remark
            this.form.materialUrlsText = Array.isArray(application.materialUrls) ? application.materialUrls.join('\n') : (application.materialUrls || this.form.materialUrlsText)
            this.form.password = ''
            this.form.confirmPassword = ''
        },
        validateForm() {
            if (!this.isKycApproved) {
                uni.showToast({ title: '请先完成实名认证', icon: 'none' })
                return false
            }
            if (!this.form.applicantName.trim() || !this.form.mobile.trim()) {
                uni.showToast({ title: '请填写姓名和手机号', icon: 'none' })
                return false
            }
            if (!this.form.username.trim()) {
                uni.showToast({ title: '请填写登录账号', icon: 'none' })
                return false
            }
            if (!this.form.certNo.trim()) {
                uni.showToast({ title: '请填写证件号码', icon: 'none' })
                return false
            }
            if (!this.form.certNo.trim() || !this.form.certFrontUrl || !this.form.certBackUrl) {
                uni.showToast({ title: '实名材料不完整，请先完成实名认证', icon: 'none' })
                return false
            }
            if (!this.form.password || this.form.password.length < 6) {
                uni.showToast({ title: '请设置至少 6 位密码', icon: 'none' })
                return false
            }
            if (this.form.password !== this.form.confirmPassword) {
                uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
                return false
            }
            return true
        },
        buildPreApplyOrderNo() {
            const userId = this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || 'user'
            return `ROLE_${this.selectedRoleCode}_${userId}_${Date.now()}`
        },
        extractPayOrderNo(data = {}) {
            return data.payOrderNo || data.pay_order_no || data.orderNo || data.order_no || data.bizOrderNo || data.biz_order_no || data.depositNo || data.deposit_no || ''
        },
        async payDepositBeforeSubmit() {
            if (!this.requiresPrepayDeposit) return { depositPayOrderNo: '', depositBizOrderNo: '' }
            if (this.roleDepositAmount === '' || Number(this.roleDepositAmount) < 0) {
                throw new Error('该角色押金金额未配置，请联系平台')
            }
            if (Number(this.roleDepositAmount) === 0) return { depositPayOrderNo: '', depositBizOrderNo: '' }
            const bizOrderNo = this.buildPreApplyOrderNo()
            const res = await prepay({
                bizType: 'ROLE_DEPOSIT',
                bizOrderNo,
                amount: this.roleDepositAmount,
                idempotentKey: `role-apply-${bizOrderNo}-WECHAT_JSAPI`
            })
            const { code, data, msg, message } = res || {}
            if (code != 1 && code != 20001) throw new Error(msg || message || '押金支付未发起')
            if (data && data.payStatus !== 'SUCCESS') {
                const payInfo = data.channelPayInfo || data.channel_pay_info || data
                const payResult = await wxpay(payInfo || {})
                if (payResult !== 'success') throw new Error('押金支付未完成')
            }
            return {
                depositPayOrderNo: this.extractPayOrderNo(data || {}) || bizOrderNo,
                depositBizOrderNo: bizOrderNo
            }
        },
        async submitApply() {
            if (!this.validateForm()) return
            this.submitting = true
            try {
                const roleCode = this.roleOptions[this.roleIndex].value
                const depositInfo = await this.payDepositBeforeSubmit()
                const res = await applyRoleApplication({
                    ...this.form,
                    roleCode,
                    ...depositInfo,
                    depositAmount: this.roleDepositAmount,
                    materialUrls: [this.form.certFrontUrl, this.form.certBackUrl].filter(Boolean),
                    kycStatus: this.normalizedKycStatus,
                    kycVerified: true,
                    realnameVerified: true
                })
                if (res.code == 1) {
                    uni.showToast({ title: '申请已提交', icon: 'success' })
                    this.upsertPendingAuditApplication(roleCode, depositInfo)
                    this.showApplyForm = false
                    await this.loadPageData()
                } else {
                    uni.showToast({ title: res.msg || res.message || '提交失败', icon: 'none' })
                }
            } catch (error) {
                uni.showModal({
                    title: '提交申请失败',
                    content: (error && error.message) || '请稍后重试',
                    showCancel: false
                })
            } finally {
                this.submitting = false
            }
        },
        upsertPendingAuditApplication(roleCode, depositInfo = {}) {
            const code = this.normalizeRoleCode(roleCode)
            const existedIndex = this.applications.findIndex((item) => this.normalizeRoleCode(item.roleCode) === code)
            const next = {
                ...(existedIndex === -1 ? {} : this.applications[existedIndex]),
                ...this.form,
                ...depositInfo,
                roleCode: code,
                applicationStatus: 'PENDING_AUDIT',
                auditStatus: 'PENDING_AUDIT',
                depositStatus: depositInfo.depositPayOrderNo || depositInfo.depositBizOrderNo ? 'PAID' : '',
                payStatus: depositInfo.depositPayOrderNo || depositInfo.depositBizOrderNo ? 'PAID' : '',
                depositAmount: this.roleDepositAmount,
                appliedAt: new Date().toISOString()
            }
            if (existedIndex === -1) this.applications.unshift(next)
            else this.$set(this.applications, existedIndex, next)
        }
    }
}
</script>

<style lang="scss">
.promoter-page { min-height: 100vh; padding: 24rpx 24rpx 48rpx; background: linear-gradient(180deg, #eef7ff 0%, #f6f7fb 360rpx, #f6f7fb 100%); box-sizing: border-box; }
.header { padding: 34rpx 30rpx; border-radius: 28rpx; color: #ffffff; background: linear-gradient(135deg, #176bff 0%, #18c59f 100%); box-shadow: 0 18rpx 42rpx rgba(22, 136, 255, .2); }
.title-row { display: flex; align-items: center; gap: 16rpx; min-width: 0; }
.title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.header-tags { display: flex; flex-wrap: wrap; gap: 10rpx; min-width: 0; }
.header-tag { height: 40rpx; padding: 0 16rpx; border-radius: 20rpx; color: #ffffff; background: rgba(255, 255, 255, .18); border: 1rpx solid rgba(255, 255, 255, .32); font-size: 22rpx; line-height: 40rpx; }
.subtitle { margin-top: 10rpx; color: rgba(255, 255, 255, .88); font-size: 25rpx; line-height: 36rpx; }
.role-card, .status-card, .focus-card, .info-card, .action-card, .form-card, .history, .empty-state { margin-top: 22rpx; padding: 26rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08); }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.card-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.card-subtitle { margin-top: 6rpx; color: #888888; font-size: 23rpx; }
.card-count { flex: none; padding: 8rpx 16rpx; border-radius: 999rpx; color: #1688ff; background: #eef7ff; font-size: 23rpx; }
.role-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 18rpx; }
.role-chip { min-width: 150rpx; padding: 16rpx 20rpx; border-radius: 20rpx; border: 1rpx solid #e6eaf0; background: #f7f9fc; box-sizing: border-box; }
.role-chip--active { border-color: #1688ff; background: #eef7ff; }
.role-chip--readonly { border-color: #e7ebf0; background: #f9fafc; }
.role-chip__name { display: block; color: #222222; font-size: 27rpx; font-weight: 600; }
.role-chip__meta { display: block; margin-top: 6rpx; color: #888888; font-size: 22rpx; }
.empty-state { text-align: center; }
.empty-state__title { color: #222222; font-size: 30rpx; font-weight: 600; }
.empty-state__desc { margin-top: 10rpx; color: #777777; font-size: 25rpx; line-height: 38rpx; }
.empty-state__btn { display: inline-flex; align-items: center; justify-content: center; margin-top: 22rpx; height: 68rpx; padding: 0 36rpx; border-radius: 34rpx; color: #ffffff; background: linear-gradient(135deg, #1688ff, #03a6ff); font-size: 27rpx; }
.kyc-gate, .apply-entry { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-top: 22rpx; padding: 28rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08); box-sizing: border-box; }
.kyc-gate { border: 1rpx solid #ffd2a8; background: linear-gradient(135deg, #fff8ef, #ffffff); }
.kyc-gate__title, .apply-entry__title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; }
.kyc-gate__desc { margin-top: 8rpx; color: #8a5a22; font-size: 24rpx; line-height: 36rpx; }
.kyc-gate__btn, .apply-entry__btn { flex: none; height: 64rpx; padding: 0 28rpx; border-radius: 32rpx; color: #ffffff; background: #1688ff; font-size: 26rpx; line-height: 64rpx; }
.apply-entry { border: 1rpx solid #cce5ff; background: linear-gradient(135deg, #eef8ff, #ffffff); }
.apply-entry__btn { background: linear-gradient(135deg, #1688ff, #03a6ff); }
.status-card { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; overflow: hidden; }
.status-card--deposit { background: linear-gradient(135deg, #fff7e6, #ffffff); border: 1rpx solid #ffd89a; }
.status-card--pending { background: linear-gradient(135deg, #eaf4ff, #ffffff); border: 1rpx solid #b9dcff; }
.status-card--approved { background: linear-gradient(135deg, #e8fff4, #ffffff); border: 1rpx solid #9ee8c0; }
.status-card--rejected { background: linear-gradient(135deg, #fff0f0, #ffffff); border: 1rpx solid #ffc2c2; }
.status-card--cancelled { background: linear-gradient(135deg, #f2f3f5, #ffffff); border: 1rpx solid #dcdfe6; }
.status-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.status-value { flex: none; padding: 10rpx 18rpx; border-radius: 999rpx; color: #1688ff; background: rgba(22, 136, 255, .1); font-size: 26rpx; }
.status-card--deposit .status-value { color: #d48806; background: rgba(250, 173, 20, .14); }
.status-card--pending .status-value { color: #1677ff; background: rgba(22, 119, 255, .12); }
.status-card--approved .status-value { color: #10a66a; background: rgba(16, 166, 106, .12); }
.status-card--rejected .status-value { color: #e34d59; background: rgba(227, 77, 89, .12); }
.status-card--cancelled .status-value { color: #7a7f8a; background: rgba(122, 127, 138, .12); }
.status-desc { margin-top: 6rpx; color: #666666; font-size: 24rpx; line-height: 36rpx; }
.focus-card { display: flex; gap: 18rpx; }
.focus-card--deposit { background: #fffaf0; }
.focus-card--pending { background: #f2f8ff; }
.focus-card--approved { background: #f2fff8; }
.focus-card--rejected { background: #fff6f6; }
.focus-card--cancelled { background: #f7f8fa; }
.focus-item { flex: 1; min-width: 0; padding: 20rpx; border-radius: 18rpx; background: rgba(255, 255, 255, .76); }
.focus-label { display: block; color: #888888; font-size: 23rpx; }
.focus-value { display: block; margin-top: 10rpx; color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; word-break: break-all; }
.info-title { margin-bottom: 18rpx; color: #222222; font-size: 30rpx; font-weight: 600; }
.info-item { display: flex; justify-content: space-between; gap: 20rpx; padding: 14rpx 0; border-top: 1rpx solid #f0f1f3; }
.info-label { flex: none; color: #999999; font-size: 24rpx; }
.info-value { color: #222222; font-size: 26rpx; text-align: right; word-break: break-all; }
.action-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.action-desc { margin-top: 10rpx; color: #666666; font-size: 25rpx; line-height: 38rpx; }
.action-buttons { display: flex; gap: 18rpx; margin-top: 22rpx; }
.action-btn { flex: 1; height: 76rpx; line-height: 76rpx; border-radius: 38rpx; font-size: 28rpx; }
.action-btn--primary { color: #ffffff; background: linear-gradient(135deg, #1688ff, #03a6ff); box-shadow: 0 10rpx 22rpx rgba(22, 136, 255, .18); }
.action-btn--plain { color: #1688ff; background: #eef7ff; }
.form-card { padding: 30rpx; }
.form-title { margin-bottom: 20rpx; color: #222222; font-size: 32rpx; font-weight: 700; }
.role-select { margin-bottom: 20rpx; padding: 22rpx; border-radius: 20rpx; background: linear-gradient(180deg, #f7fbff, #ffffff); border: 1rpx solid #e1efff; box-sizing: border-box; }
.role-select__head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.role-select__title { color: #222222; font-size: 29rpx; font-weight: 700; }
.role-select__current { flex: none; color: #1688ff; font-size: 24rpx; }
.role-select__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-top: 18rpx; }
.role-select__option { position: relative; min-height: 136rpx; padding: 20rpx 18rpx; border-radius: 18rpx; border: 2rpx solid #e5ebf2; background: #ffffff; box-sizing: border-box; overflow: hidden; }
.role-select__option--active { border-color: #1688ff; background: linear-gradient(135deg, #eef7ff, #ffffff); box-shadow: 0 10rpx 24rpx rgba(22, 136, 255, .14); }
.role-select__name { color: #222222; font-size: 28rpx; font-weight: 700; line-height: 40rpx; }
.role-select__desc { margin-top: 8rpx; color: #7a8594; font-size: 22rpx; line-height: 32rpx; }
.role-select__check { position: absolute; right: 16rpx; top: 16rpx; width: 30rpx; height: 30rpx; border-radius: 50%; border: 2rpx solid #d6dee9; background: #ffffff; box-sizing: border-box; }
.role-select__option--active .role-select__check { border-color: #1688ff; background: #1688ff; }
.role-select__option--active .role-select__check::after { content: ''; position: absolute; left: 8rpx; top: 4rpx; width: 9rpx; height: 15rpx; border-right: 3rpx solid #ffffff; border-bottom: 3rpx solid #ffffff; transform: rotate(45deg); }
.form-item { display: flex; align-items: center; min-height: 96rpx; margin-top: 16rpx; padding: 18rpx 20rpx; border: 1rpx solid #edf1f6; border-radius: 18rpx; background: #f8fafc; box-sizing: border-box; }
.form-item:first-of-type { margin-top: 0; }
.form-item--textarea { align-items: flex-start; padding-top: 22rpx; }
.label { flex: none; width: 160rpx; color: #465366; font-size: 27rpx; font-weight: 500; line-height: 40rpx; }
input, textarea, .picker-value { flex: 1; min-width: 0; color: #1f2937; font-size: 28rpx; }
input, .picker-value { min-height: 62rpx; line-height: 62rpx; text-align: right; }
textarea { height: 168rpx; padding: 16rpx; border-radius: 16rpx; background: #ffffff; line-height: 40rpx; box-sizing: border-box; text-align: left; }
.kyc-material { margin-top: 24rpx; padding: 24rpx; border-radius: 20rpx; background: #f8fafc; border: 1rpx solid #edf1f6; }
.kyc-material__title { color: #333333; font-size: 28rpx; font-weight: 600; }
.kyc-material__photos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; margin-top: 18rpx; }
.kyc-material__photo { width: 100%; height: 180rpx; border-radius: 14rpx; background: #edf1f6; }
.agreement-row { display: flex; align-items: center; gap: 14rpx; margin-top: 22rpx; color: #666666; font-size: 24rpx; line-height: 34rpx; }
.submit-btn { margin-top: 30rpx; height: 88rpx; color: #ffffff; background: linear-gradient(135deg, #1688ff, #03a6ff); border-radius: 44rpx; font-size: 30rpx; box-shadow: 0 14rpx 28rpx rgba(22, 136, 255, .22); }
.history-title { margin-bottom: 16rpx; color: #222222; font-size: 30rpx; font-weight: 600; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 18rpx 0; border-top: 1rpx solid #f0f1f3; }
.history-role { color: #222222; font-size: 28rpx; }
.history-time { margin-top: 6rpx; color: #999999; font-size: 22rpx; }
.history-desc { margin-top: 6rpx; color: #999999; font-size: 22rpx; line-height: 32rpx; }
.history-status { flex: none; padding: 8rpx 16rpx; border-radius: 999rpx; color: #1688ff; background: rgba(22, 136, 255, .1); font-size: 24rpx; }
.history-status--deposit { color: #d48806; background: rgba(250, 173, 20, .14); }
.history-status--pending { color: #1677ff; background: rgba(22, 119, 255, .12); }
.history-status--approved { color: #10a66a; background: rgba(16, 166, 106, .12); }
.history-status--rejected { color: #e34d59; background: rgba(227, 77, 89, .12); }
.history-status--cancelled { color: #7a7f8a; background: rgba(122, 127, 138, .12); }
.agreement-modal { position: fixed; inset: 0; z-index: 99; }
.agreement-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, .55); }
.agreement-sheet { position: absolute; left: 34rpx; right: 34rpx; top: 12vh; padding: 30rpx; border-radius: 28rpx; background: #ffffff; box-sizing: border-box; }
.agreement-title { color: #222222; font-size: 34rpx; font-weight: 700; text-align: center; }
.agreement-content { height: 520rpx; margin-top: 24rpx; padding: 22rpx; border-radius: 18rpx; background: #f7f9fc; color: #555555; font-size: 26rpx; line-height: 42rpx; box-sizing: border-box; }
.agreement-btn { margin-top: 24rpx; height: 78rpx; border-radius: 39rpx; color: #ffffff; background: #1688ff; font-size: 28rpx; line-height: 78rpx; }
.agreement-btn--disabled { background: #c7d0dc; }
</style>
