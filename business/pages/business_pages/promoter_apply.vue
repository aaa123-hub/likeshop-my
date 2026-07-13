<template>
    <view class="promoter-page">
        <view class="promoter-nav">
            <view class="promoter-nav__back" @tap="goBack">
                <view class="promoter-nav__arrow"></view>
            </view>
            <view class="promoter-nav__title">渠道服务商</view>
            <view class="promoter-nav__capsule">
                <view class="promoter-nav__dot"></view>
                <view class="promoter-nav__divider"></view>
                <view class="promoter-nav__circle"></view>
            </view>
        </view>

        <view class="kyc-gate" v-if="!isKycApproved && !kycRedirecting">
            <view>
                <view class="kyc-gate__title">{{ kycGateTitle }}</view>
                <view class="kyc-gate__desc">{{ kycGateDesc }}</view>
            </view>
            <view class="kyc-gate__btn" @tap="goKyc">去实名</view>
        </view>

        <view class="role-board" v-if="isKycApproved && !showApplyForm">
            <view class="role-apply-list">
                <view
                    v-for="item in roleApplyCards"
                    :key="item.roleCode"
                    :class="['role-apply-card', 'role-apply-card--' + item.type, selectedRoleCode === item.roleCode ? 'role-apply-card--active' : '', item.disabled ? 'role-apply-card--disabled' : '']"
                    @tap="handleRoleCardAction(item)"
                >
                    <view class="role-apply-card__title">{{ item.label }}</view>
                    <view class="role-apply-card__content">
                        <view class="role-apply-card__body">
                            <view class="role-apply-card__bar"></view>
                            <view class="role-apply-card__desc">{{ item.desc }}</view>
                            <button class="role-apply-card__button" @tap.stop="handleRoleCardAction(item)">{{ item.actionText }}</button>
                        </view>
                        <view :class="['role-apply-card__art', 'role-apply-card__art--' + roleTagType(item.roleCode)]"></view>
                    </view>
                    <view v-if="item.timeText || item.statusText" class="role-apply-card__meta">
                        <text>{{ item.statusText }}</text>
                        <text v-if="item.timeText">{{ item.timeText }}</text>
                    </view>
                    <view class="role-apply-card__remark" v-if="item.remark">{{ item.remark }}</view>
                    <view class="role-apply-card__hint" v-if="item.hintText">{{ item.hintText }}</view>
                </view>
            </view>
        </view>

        <view class="form-card" v-if="shouldShowForm">
            <view class="form-head">
                <view>
                    <view class="form-title">{{ currentApplication ? '重新提交资料' : '提交申请资料' }}</view>
                    <view class="form-subtitle">当前申请：{{ selectedRoleLabel }}</view>
                </view>
                <view class="form-close" @tap="cancelApplyForm">返回选择</view>
            </view>
            <view class="form-item">
                <text class="label">姓名</text>
                <view class="picker-value">{{ form.applicantName || '-' }}</view>
            </view>
            <view :class="['form-item', isReadonlyField('mobile') ? 'form-item--readonly' : '']">
                <text class="label">手机号</text>
                <input v-model="form.mobile" :disabled="isReadonlyField('mobile')" type="number" placeholder="请输入手机号" />
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
            <picker
                v-if="needsAreaSelection && hasAreaOptions"
                mode="multiSelector"
                :range="areaPickerColumns"
                range-key="label"
                :value="areaPickerValue"
                @columnchange="onAreaColumnChange"
                @change="onAreaConfirm"
            >
                <view class="form-item form-item--picker">
                    <text class="label">申请区域</text>
                    <view :class="['picker-value', selectedAreaText ? '' : 'picker-value--placeholder']">
                        {{ selectedAreaText || '请选择申请区域' }}
                    </view>
                </view>
            </picker>
            <view class="form-item form-item--picker" v-else-if="needsAreaSelection" @tap="handleEmptyAreaTap">
                <text class="label">申请区域</text>
                <view class="picker-value picker-value--placeholder">暂无可选区域</view>
            </view>
            <view class="form-item form-item--map" v-if="needsAreaSelection">
                <text class="label">地图定位</text>
                <view class="map-picker">
                    <view class="map-picker__text">
                        <view :class="['map-picker__address', form.detailAddress ? '' : 'map-picker__address--placeholder']">
                            {{ form.detailAddress || '请选择区域办公或经营位置' }}
                        </view>
                        <view class="map-picker__coord" v-if="form.longitude && form.latitude">
                            经度 {{ form.longitude }} / 纬度 {{ form.latitude }}
                        </view>
                    </view>
                    <view class="map-picker__btn" @tap="chooseApplyLocation">{{ form.longitude && form.latitude ? '重新选择' : '地图选点' }}</view>
                </view>
            </view>
            <view class="upgrade-tip" v-if="accountCredentialTip">
                {{ accountCredentialTip }}
            </view>
            <view :class="['form-item', readonlyBackendUsername ? 'form-item--readonly' : '']" v-if="requiresAccountCredentials || readonlyBackendUsername">
                <text class="label">登录账号</text>
                <input v-model="form.username" :disabled="readonlyBackendUsername" placeholder="审核通过后用于登录渠道后台" />
            </view>
            <view class="form-item" v-if="requiresBackendPassword">
                <text class="label">登录密码</text>
                <input v-model="form.password" password placeholder="请设置至少 6 位密码" />
            </view>
            <view class="form-item" v-if="requiresBackendPassword">
                <text class="label">确认密码</text>
                <input v-model="form.confirmPassword" password placeholder="请再次输入密码" />
            </view>
            <view class="form-item form-item--textarea">
                <text class="label">申请说明</text>
                <textarea v-model="form.remark" placeholder="可填写推广资源、经营区域等信息" />
            </view>
            <view :class="['kyc-material', hasReadonlyKycMaterial ? 'kyc-material--readonly' : '']">
                <view class="kyc-material__title">实名材料</view>
                <view class="kyc-material__photos">
                    <image v-if="form.certFrontUrl" class="kyc-material__photo" :src="form.certFrontUrl" mode="aspectFit"></image>
                    <image v-if="form.certBackUrl" class="kyc-material__photo" :src="form.certBackUrl" mode="aspectFit"></image>
                </view>
            </view>
        </view>

        <button class="submit-btn" v-if="shouldShowForm" :loading="submitting" @tap="submitApply">{{ currentApplication ? '重新提交申请' : '提交申请' }}</button>

        <view class="history" v-if="applyRoleApplications.length && !showApplyForm">
            <view class="history-title">申请记录</view>
            <view v-for="item in applyRoleApplications" :key="item.applicationNo" class="history-item">
                <view class="history-main">
                    <view class="history-row">
                        <view class="history-role">{{ roleLabel(item.roleCode) }}</view>
                        <view :class="['history-status', 'history-status--' + statusType(item.applicationStatus)]">{{ statusLabel(item.applicationStatus) }}</view>
                    </view>
                    <view class="history-meta" v-if="historyPrimaryTime(item)">
                        <text v-if="historyPrimaryTime(item)">{{ historyPrimaryTime(item) }}</text>
                    </view>
                    <view class="history-detail" v-if="visibleHistoryInfo(item).length">
                        <view class="history-detail__item" v-for="info in visibleHistoryInfo(item)" :key="info.label">
                            <text class="history-detail__label">{{ info.label }}</text>
                            <text class="history-detail__value">{{ info.value }}</text>
                        </view>
                    </view>
                    <view class="history-info" v-if="historySecondaryTime(item)">{{ historySecondaryTime(item) }}</view>
                    <view :class="['history-desc', 'history-desc--' + statusType(item.applicationStatus)]" v-if="applicationAuditRemark(item)">
                        <text class="history-desc__label">{{ historyRemarkLabel(item) }}</text>
                        <text class="history-desc__value">{{ applicationAuditRemark(item) }}</text>
                    </view>
                </view>
            </view>
        </view>

    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { applyRoleApplication, getKycStatus, getMiniappRegions, getOnboardingContext, getRoleApplications, getRoles } from '@/api/user'
import { prepay } from '@/api/app'
import { wxpay } from '@/utils/pay'
import { localizeBackendText, normalizeBackendCode, normalizeKycStatus } from '@/utils/backend-text'
import { toLogin } from '@/utils/login'

const roleOptions = [
    { label: '子公司', value: 'SUBSIDIARY' },
    { label: '运营中心', value: 'AGENT' },
    { label: '推广者', value: 'PROMOTER' }
]

const APPLY_ROLE_CODES = roleOptions.map(item => item.value)
const KYC_CACHE_PREFIX = 'PROMOTER_APPLY_KYC_INFO_'

export default {
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
                provinceCode: '',
                provinceName: '',
                cityCode: '',
                cityName: '',
                districtCode: '',
                districtName: '',
                detailAddress: '',
                longitude: '',
                latitude: '',
                remark: '',
                materialUrlsText: '',
                agreementAccepted: false
            },
            areaOptions: [],
            areaPickerValue: [0, 0, 0],
            areaPickerColumns: [[], [], []],
            showApplyForm: false,
            kycInfo: {},
            onboardingContext: {},
            readonlyFields: {},
            kycRedirecting: false,
            submitting: false,
            pageReady: false,
            pageRefreshing: false
        }
    },
    computed: {
        ...mapGetters(['userInfo', 'isLogin', 'inviteCode']),
        currentApplication() {
            const item = this.applications.find((item) => this.normalizeRoleCode(item.roleCode) === this.selectedRoleCode)
            return item ? this.withPromoterCode(item) : null
        },
        currentUserId() {
            const info = this.userInfo || {}
            return info.user_id || info.userId || info.id || ''
        },
        hasLoginUser() {
            return Boolean(this.isLogin && this.currentUserId)
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
            const tags = this.isMerchantRole ? [{ roleCode: 'MERCHANT', roleName: '商家' }] : []
            this.currentRoles.forEach((item) => {
                const code = this.normalizeRoleCode(item.roleCode)
                if (code && code !== 'MERCHANT' && code !== 'USER' && !tags.some((tag) => this.normalizeRoleCode(tag.roleCode) === code)) {
                    tags.push({ ...item, roleCode: code })
                }
            })
            return tags.length ? tags : [{ roleCode: 'USER', roleName: '普通用户' }]
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
        roleApplyCards() {
            return this.rolePickerRange.filter((role) => {
                const roleCode = this.normalizeRoleCode(role.value)
                return !(roleCode === 'PROMOTER' && this.hasApprovedPromoterRole)
            }).sort((a, b) => this.roleSortWeight(a.value) - this.roleSortWeight(b.value)).map((role) => {
                const roleCode = this.normalizeRoleCode(role.value)
                const application = this.applicationByRole(roleCode)
                const statusType = this.statusType(application && application.applicationStatus)
                const approved = statusType === 'approved'
                const pending = statusType === 'pending'
                const deposit = statusType === 'deposit'
                const rejected = statusType === 'rejected' || statusType === 'cancelled'
                const applied = Boolean(application)
                const actionText = approved
                    ? '已生效'
                    : deposit
                        ? '去缴押金'
                        : pending
                            ? '待审核'
                            : rejected
                                ? '重新申请'
                                : '申请该角色'
                const time = application && this.applicationPrimaryTime(application)
                return {
                    roleCode,
                    label: this.roleLabel(roleCode),
                    desc: this.roleOptionDesc(roleCode),
                    type: statusType === 'default' ? this.roleTagType(roleCode) : statusType,
                    statusText: applied ? this.statusLabel(application.applicationStatus) : '可申请',
                    depositText: this.displayDepositText({ ...application, roleCode }) || '押金以平台通知为准',
                    timeText: time ? `${approved ? '通过' : '申请'}：${time}` : '',
                    remark: application && !approved ? this.applicationAuditRemark(application) : '',
                    application,
                    statusType,
                    actionText,
                    disabled: approved || pending,
                    primary: !approved && !pending,
                    hintText: approved ? '' : pending ? '等待平台审核' : '点击进入申请'
                }
            })
        },
        selectedRoleCode() {
            const item = this.roleOptions[this.roleIndex] || this.roleOptions[0] || {}
            return this.normalizeRoleCode(item.value || 'PROMOTER')
        },
        selectedRoleLabel() {
            return this.roleLabel(this.selectedRoleCode)
        },
        selectedRoleConfig() {
            return this.roleOptions.find((item) => this.normalizeRoleCode(item.value || item.roleCode) === this.selectedRoleCode) || {}
        },
        selectedRoleAreaOptions() {
            const roleAreaOptions = this.extractAreaSource(this.selectedRoleConfig)
            const normalizedRoleAreas = this.normalizeAreaOptions(roleAreaOptions)
            return normalizedRoleAreas.length ? normalizedRoleAreas : this.areaOptions
        },
        hasAreaOptions() {
            return this.selectedRoleAreaOptions.length > 0
        },
        needsAreaSelection() {
            return ['AGENT', 'SUBSIDIARY'].includes(this.selectedRoleCode)
        },
        selectedAreaText() {
            return [this.form.provinceName, this.form.cityName, this.form.districtName].filter(Boolean).join(' / ')
        },
        approvedPromoterApplication() {
            return this.applications.find((item) => {
                return this.normalizeRoleCode(item.roleCode || item.role_code || item.role) === 'PROMOTER'
                    && this.statusType(item.applicationStatus || item.auditStatus || item.status) === 'approved'
            }) || null
        },
        hasApprovedPromoterRole() {
            return Boolean(
                this.hasPromoterSignalInUserInfo()
                || this.roles.some((item) => this.isApprovedRoleItem(item, 'PROMOTER'))
                || this.approvedPromoterApplication
            )
        },
        isRoleUpgradeApplication() {
            return this.hasApprovedPromoterRole && ['AGENT', 'SUBSIDIARY'].includes(this.selectedRoleCode)
        },
        hasBackendAccount() {
            const context = this.onboardingContext || {}
            const account = context.backendAccount || context.backend_account || {}
            const info = this.userInfo || {}
            return Boolean(
                context.hasBackendAccount
                || context.has_backend_account
                || account.adminUserId
                || account.admin_user_id
                || account.platformUserId
                || account.platform_user_id
                || account.username
                || context.backendUsername
                || context.backend_username
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
            )
        },
        onboardingUiHints() {
            return (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
        },
        requiresAccountCredentials() {
            if (this.onboardingUiHints.showBackendAccountFields === false) return false
            if (this.hasBackendAccount) return false
            if (this.isMerchantRole) return false
            if (this.isRoleUpgradeApplication) return false
            return true
        },
        requiresBackendUsername() {
            if (this.onboardingUiHints.requireBackendUsername === false) return false
            return this.requiresAccountCredentials
        },
        requiresBackendPassword() {
            if (this.onboardingUiHints.requireBackendPassword === false) return false
            if (this.hasBackendAccount || this.isMerchantRole) return false
            return this.requiresAccountCredentials
        },
        readonlyBackendUsername() {
            return !this.requiresBackendUsername && Boolean(this.form.username)
        },
        backendUsernameFromSources() {
            const context = this.onboardingContext || {}
            const account = context.backendAccount || context.backend_account || {}
            const info = this.userInfo || {}
            const merchantRole = this.roles.find((item) => this.normalizeRoleCode(item.roleCode || item.role_code || item.role || item.code || item.value) === 'MERCHANT') || {}
            return context.backendUsername
                || context.backend_username
                || account.username
                || account.loginName
                || account.login_name
                || account.accountNo
                || account.account_no
                || info.backendUsername
                || info.backend_username
                || info.platformUsername
                || info.platform_username
                || info.adminUsername
                || info.admin_username
                || info.loginName
                || info.login_name
                || info.username
                || info.accountNo
                || info.account_no
                || merchantRole.username
                || merchantRole.loginName
                || merchantRole.login_name
                || merchantRole.accountNo
                || merchantRole.account_no
                || ''
        },
        accountCredentialTip() {
            if (this.hasBackendAccount || this.onboardingUiHints.showBackendAccountFields === false) return '当前账号已绑定平台后台账号，本次申请将沿用已有账号，无需重新填写登录账号和密码。'
            if (this.isRoleUpgradeApplication) return `已是推广者，继续申请${this.selectedRoleLabel}只需选择申请区域，渠道后台账号和密码沿用原账户。`
            if (this.isMerchantRole) return '当前账号已是商家，平台管理系统已有对应账号，本次申请无需重新设置登录账号和密码。'
            return ''
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
            return this.normalizedKycStatus === 'APPROVED' || this.hasApprovedApplyRoleRecord
        },
        kycGateTitle() {
            if (!this.hasLoginUser) return '请先登录'
            if (this.normalizedKycStatus === 'PENDING_AUDIT') return '实名审核中'
            if (this.normalizedKycStatus === 'REJECTED') return '实名未通过'
            return '请先完成实名认证'
        },
        kycGateDesc() {
            if (!this.hasLoginUser) return '登录后可继续提交实名认证和角色入驻资料。'
            if (this.kycGateTitle === '实名审核中') return '实名审核通过后可申请角色。'
            if (this.kycGateTitle === '实名未通过') return '请重新提交实名资料后再申请角色。'
            return '角色申请会使用实名通过后的姓名、证件和照片。'
        },
        roleDepositAmount() {
            return this.roleDepositAmountFor(this.selectedRoleCode)
        },
        applyRoleApplications() {
            return this.applications
                .filter(item => APPLY_ROLE_CODES.includes(this.normalizeRoleCode(item.roleCode)))
                .slice()
                .sort((a, b) => this.applicationTimeValue(b) - this.applicationTimeValue(a))
        },
        hasApplyRoleRecord() {
            return this.currentRoles.length > 0 || this.applyRoleApplications.length > 0
        },
        hasApprovedApplyRoleRecord() {
            return this.currentRoles.length > 0 || this.applyRoleApplications.some((item) => this.statusType(item.applicationStatus || item.auditStatus || item.status) === 'approved')
        },
        promoterInviteCode() {
            return this.userInfo.promoter_code || this.userInfo.promoterCode || this.userInfo.distribution_code || this.userInfo.distributionCode || this.inviteCode || ''
        },
        requiresPrepayDeposit() {
            return APPLY_ROLE_CODES.includes(this.selectedRoleCode)
        },
        selectedDepositText() {
            if (!this.requiresPrepayDeposit) return '无需押金'
            if (this.roleDepositAmount === '') return '待平台确认'
            return this.moneyText(this.roleDepositAmount)
        },
        hasReadonlyKycMaterial() {
            return this.isReadonlyField('certFrontUrl') || this.isReadonlyField('certBackUrl')
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
                    { label: '待缴押金', value: this.displayDepositText(item) || '以平台通知为准' },
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
                { label: '押金金额', value: this.displayDepositText(item) },
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
            if (!this.isKycApproved) return false
            return this.showApplyForm
        },
        showFirstApplyEntry() {
            return false
        },
        showReapplyEntry() {
            return this.isKycApproved && !this.showApplyForm && this.hasApplyRoleRecord && !this.currentApplication
        },
        currentActionDesc() {
            if (this.currentStatusType === 'approved') return '当前角色已开通，可使用审核通过后的角色信息。'
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
                if (this.nextApplyableRole) {
                    return [{ type: 'apply-other', label: `继续申请${this.roleLabel(this.nextApplyableRole.value)}`, primary: true }]
                }
                return []
            }
            if (status === 'rejected' || status === 'cancelled') {
                return [{ type: 'reapply', label: '重新申请', primary: true }]
            }
            if (status === 'deposit') {
                return [{ type: 'deposit', label: '去缴押金', primary: true }]
            }
            return []
        },
        nextApplyableRole() {
            return this.roleOptions.find((role) => {
                const code = this.normalizeRoleCode(role.value)
                if (!APPLY_ROLE_CODES.includes(code)) return false
                const application = this.applications.find((item) => this.normalizeRoleCode(item.roleCode) === code)
                return this.statusType(application && application.applicationStatus) !== 'approved'
            }) || null
        }
    },
    onLoad() {
        this.form.mobile = this.userInfo.mobile || ''
        const loadTask = this.hasLoginUser ? this.loadPageData() : Promise.resolve()
        loadTask.finally(() => {
            this.pageReady = true
        })
    },
    onShow() {
        if (this.kycRedirecting) return
        if (!this.pageReady) return
        if (!this.hasLoginUser) return
        this.loadPageData()
    },
    methods: {
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
                return
            }
            uni.switchTab({ url: '/pages/user/user' })
        },
        async loadPageData() {
            if (!this.hasLoginUser) {
                this.mergeRoleOptions()
                this.syncSelectedRole()
                return
            }
            if (this.pageRefreshing) return
            this.pageRefreshing = true
            try {
                await this.loadOnboardingContext()
                await this.loadApplications()
                await Promise.all([this.loadKycStatus(), this.loadRegionOptions()])
                this.mergeRoleOptions()
                this.syncSelectedRole()
                this.prefillBackendUsername()
                this.redirectToKycIfNeeded()
            } finally {
                this.pageRefreshing = false
            }
        },
        async loadOnboardingContext() {
            if (!this.hasLoginUser) return
            try {
                const res = await getOnboardingContext({ userId: this.currentUserId, show: false })
                if (res.code != 1 || !res.data) return
                this.applyOnboardingContext(res.data)
            } catch (error) {}
        },
        applyOnboardingContext(data = {}) {
            this.onboardingContext = data
            const profile = data.reusableProfile || data.reusable_profile || {}
            const hints = data.uiHints || data.ui_hints || {}
            const kycData = this.mergeKycInfo(this.kycInfo, {
                ...data,
                ...profile,
                kycStatus: data.kycStatus || data.kyc_status || data.auditStatus || data.audit_status,
                realName: profile.realName || profile.real_name || profile.applicantName || profile.applicant_name || data.realName || data.real_name,
                certNo: profile.certNo || profile.cert_no || profile.certNoMask || profile.cert_no_mask || data.certNo || data.cert_no || data.certNoMask || data.cert_no_mask,
                certType: profile.certType || profile.cert_type || data.certType || data.cert_type,
                certFrontUrl: profile.certFrontUrl || profile.cert_front_url || data.certFrontUrl || data.cert_front_url,
                certBackUrl: profile.certBackUrl || profile.cert_back_url || data.certBackUrl || data.cert_back_url
            })
            if (kycData.kycStatus || hints.canReuseKycProfile || profile.realName || profile.applicantName) {
                this.kycInfo = kycData
                this.applyKycToForm(true)
            }
            const account = data.backendAccount || data.backend_account || {}
            const backendUsername = data.backendUsername || data.backend_username || account.username
            const mobile = profile.mobile || data.mobile || data.contactMobile || data.contact_mobile
            this.form.username = backendUsername || this.form.username
            this.form.mobile = mobile || this.form.mobile
            this.markReadonlyField('username', backendUsername)
            this.markReadonlyField('applicantName', profile.applicantName || profile.applicant_name || profile.realName || profile.real_name || data.realName || data.real_name)
            this.markReadonlyField('mobile', mobile)
            this.markReadonlyField('certType', profile.certType || profile.cert_type || data.certType || data.cert_type)
            this.markReadonlyField('certNo', profile.certNo || profile.cert_no || profile.certNoMask || profile.cert_no_mask || data.certNo || data.cert_no || data.certNoMask || data.cert_no_mask)
            this.markReadonlyField('certFrontUrl', profile.certFrontUrl || profile.cert_front_url || data.certFrontUrl || data.cert_front_url)
            this.markReadonlyField('certBackUrl', profile.certBackUrl || profile.cert_back_url || data.certBackUrl || data.cert_back_url)
            if (this.hasBackendAccount || hints.showBackendAccountFields === false) {
                this.form.password = ''
                this.form.confirmPassword = ''
            }
        },
        async loadRegionOptions() {
            if (this.areaOptions.length) return
            try {
                const res = await getMiniappRegions({ tree: true, show: false })
                if (res.code == 1 && res.data) {
                    const options = this.normalizeAreaOptions(res.data.areaOptions || res.data.area_options || res.data.regionOptions || res.data.region_options || res.data.tree || res.data.list || [])
                    if (options.length) {
                        this.areaOptions = options
                        this.syncAreaPickerValueByForm()
                    }
                }
            } catch (error) {}
        },
        isReadonlyField(field) {
            return Boolean(this.readonlyFields && this.readonlyFields[field])
        },
        markReadonlyField(field, value) {
            if (value === undefined || value === null || value === '') return
            this.$set(this.readonlyFields, field, true)
        },
        prefillBackendUsername() {
            const username = this.backendUsernameFromSources
            if (!username) return
            this.form.username = this.form.username || username
            if (this.hasBackendAccount || this.isMerchantRole || this.onboardingUiHints.showBackendAccountFields === false) {
                this.markReadonlyField('username', username)
                this.form.password = ''
                this.form.confirmPassword = ''
            }
        },
        async loadKycStatus() {
            if (!this.hasLoginUser) return
            const localKyc = this.localKycInfo()
            const cachedKyc = this.cachedKycInfo()
            const fallbackKyc = this.mergeKycInfo(this.mergeKycInfo(localKyc, cachedKyc), this.kycInfo)
            if (localKyc.kycStatus) {
                this.kycInfo = fallbackKyc
                if (this.isKycApproved) this.applyKycToForm(true)
                else this.clearKycForm()
                if (localKyc.fromProfile && this.isKycInfoComplete(fallbackKyc)) return
            }
            try {
                const res = await getKycStatus({ userId: this.currentUserId, show: false })
                if (res.code != 1) return
                const remoteStatus = normalizeKycStatus((res.data || {}).kycStatus || (res.data || {}).kyc_status || 'NOT_SUBMITTED')
                const currentStatus = normalizeKycStatus(this.kycInfo.kycStatus || this.kycInfo.kyc_status || 'NOT_SUBMITTED')
                if ((currentStatus === 'APPROVED' || this.hasApprovedApplyRoleRecord) && remoteStatus === 'NOT_SUBMITTED') {
                    this.kycInfo = this.mergeKycInfo(fallbackKyc, { kycStatus: 'APPROVED', kyc_status: 'APPROVED' })
                    this.saveKycCache(this.kycInfo)
                    this.applyKycToForm(true)
                    return
                }
                if (currentStatus !== 'NOT_SUBMITTED' && remoteStatus === 'NOT_SUBMITTED') {
                    if (this.isKycApproved) this.applyKycToForm(true)
                    return
                }
                this.kycInfo = this.mergeKycInfo(fallbackKyc, res.data || {})
                this.saveKycCache(this.kycInfo)
                if (this.isKycApproved) this.applyKycToForm(true)
                else if (!localKyc.kycStatus) this.clearKycForm()
            } catch (error) {
                if (fallbackKyc.kycStatus) {
                    this.kycInfo = fallbackKyc
                    if (this.isKycApproved) this.applyKycToForm(true)
                }
            }
        },
        localKycInfo() {
            const info = this.userInfo || {}
            const rawStatus = info.kycStatus || info.kyc_status || info.realnameStatus || info.realname_status || info.realNameStatus || info.real_name_status || info.certificationStatus || info.certification_status || info.authStatus || info.auth_status || ''
            const status = rawStatus ? normalizeKycStatus(rawStatus) : ''
            const kycInfo = info.kycInfo || info.kyc_info || info.realnameInfo || info.realname_info || info.realNameInfo || info.real_name_info || info.certificationInfo || info.certification_info || info.authInfo || info.auth_info || {}
            const source = { ...info, ...kycInfo }
            return {
                fromProfile: Boolean(status),
                kycStatus: status,
                kyc_status: status,
                realName: source.realName || source.real_name || source.trueName || source.true_name || source.name || '',
                real_name: source.realName || source.real_name || source.trueName || source.true_name || source.name || '',
                certNo: source.certNo || source.cert_no || source.idCardNo || source.id_card_no || source.idNo || source.id_no || source.identityNo || source.identity_no || source.idNumber || source.id_number || '',
                cert_no: source.certNo || source.cert_no || source.idCardNo || source.id_card_no || source.idNo || source.id_no || source.identityNo || source.identity_no || source.idNumber || source.id_number || '',
                certType: source.certType || source.cert_type || source.idType || source.id_type || 'ID_CARD',
                cert_type: source.certType || source.cert_type || source.idType || source.id_type || 'ID_CARD',
                certFrontUrl: source.certFrontUrl || source.cert_front_url || source.frontUrl || source.front_url || source.idCardFrontUrl || source.id_card_front_url || '',
                cert_front_url: source.certFrontUrl || source.cert_front_url || source.frontUrl || source.front_url || source.idCardFrontUrl || source.id_card_front_url || '',
                certBackUrl: source.certBackUrl || source.cert_back_url || source.backUrl || source.back_url || source.idCardBackUrl || source.id_card_back_url || '',
                cert_back_url: source.certBackUrl || source.cert_back_url || source.backUrl || source.back_url || source.idCardBackUrl || source.id_card_back_url || ''
            }
        },
        isKycInfoComplete(data = {}) {
            return Boolean((data.realName || data.real_name) && (data.certNo || data.cert_no) && (data.certFrontUrl || data.cert_front_url) && (data.certBackUrl || data.cert_back_url))
        },
        kycCacheKey() {
            const userId = this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
            return userId ? `${KYC_CACHE_PREFIX}${userId}` : ''
        },
        cachedKycInfo() {
            const key = this.kycCacheKey()
            if (!key) return {}
            try {
                return uni.getStorageSync(key) || {}
            } catch (error) {
                return {}
            }
        },
        saveKycCache(data = {}) {
            const key = this.kycCacheKey()
            if (!key || !data.kycStatus && !data.kyc_status) return
            try {
                uni.setStorageSync(key, data)
            } catch (error) {}
        },
        mergeKycInfo(local = {}, remote = {}) {
            return {
                ...local,
                ...remote,
                kycStatus: remote.kycStatus || remote.kyc_status || local.kycStatus || local.kyc_status,
                kyc_status: remote.kyc_status || remote.kycStatus || local.kyc_status || local.kycStatus,
                realName: remote.realName || remote.real_name || local.realName || local.real_name,
                real_name: remote.real_name || remote.realName || local.real_name || local.realName,
                certNo: remote.certNo || remote.cert_no || local.certNo || local.cert_no,
                cert_no: remote.cert_no || remote.certNo || local.cert_no || local.certNo,
                certType: remote.certType || remote.cert_type || local.certType || local.cert_type || 'ID_CARD',
                cert_type: remote.cert_type || remote.certType || local.cert_type || local.certType || 'ID_CARD',
                certFrontUrl: remote.certFrontUrl || remote.cert_front_url || local.certFrontUrl || local.cert_front_url,
                cert_front_url: remote.cert_front_url || remote.certFrontUrl || local.cert_front_url || local.certFrontUrl,
                certBackUrl: remote.certBackUrl || remote.cert_back_url || local.certBackUrl || local.cert_back_url,
                cert_back_url: remote.cert_back_url || remote.certBackUrl || local.cert_back_url || local.certBackUrl
            }
        },
        clearKycForm() {
            this.form.applicantName = ''
            this.form.certType = 'ID_CARD'
            this.form.certNo = ''
            this.form.certFrontUrl = ''
            this.form.certBackUrl = ''
            this.certTypeIndex = 0
        },
        applyKycToForm(markReadonly = false) {
            const data = this.kycInfo || {}
            this.form.applicantName = data.realName || data.real_name || this.form.applicantName
            this.form.certType = data.certType || data.cert_type || this.form.certType
            this.form.certNo = data.certNo || data.cert_no || this.form.certNo
            this.form.certFrontUrl = data.certFrontUrl || data.cert_front_url || this.form.certFrontUrl
            this.form.certBackUrl = data.certBackUrl || data.cert_back_url || this.form.certBackUrl
            if (markReadonly) {
                this.markReadonlyField('applicantName', data.realName || data.real_name)
                this.markReadonlyField('certType', data.certType || data.cert_type)
                this.markReadonlyField('certNo', data.certNo || data.cert_no)
                this.markReadonlyField('certFrontUrl', data.certFrontUrl || data.cert_front_url)
                this.markReadonlyField('certBackUrl', data.certBackUrl || data.cert_back_url)
            }
            const certIndex = this.certTypes.findIndex((item) => item.value === this.form.certType)
            if (certIndex !== -1) this.certTypeIndex = certIndex
        },
        shouldLoadRoleConfig() {
            return this.roleOptions.some((item) => {
                const code = this.normalizeRoleCode(item.value || item.roleCode)
                return APPLY_ROLE_CODES.includes(code) && this.roleDepositAmountFor(code) === ''
            })
        },
        async ensureRoleConfig() {
            if (this.shouldLoadRoleConfig()) await this.loadRoles()
        },
        async loadRoles() {
            const res = await getRoles({ show: false }).catch(() => null)
            if (res && res.code == 1) {
                const data = res.data || {}
                this.roles = data.roles || data.list || []
                this.roleDepositConfig = data.roleDepositConfig || data.role_deposit_config || data.depositConfig || data.deposit_config || this.roleDepositConfig
                this.areaOptions = this.normalizeAreaOptions(this.extractAreaSource(data))
                this.refreshAreaColumns()
                this.mergeApplyRoleOptions(data.applyRoles || data.roleOptions || [])
            }
        },
        async loadApplications() {
            try {
                const res = await getRoleApplications({ show: false })
                if (res.code == 1) {
                    const data = res.data || {}
                    this.applications = (data.applications || data.list || []).map((item) => this.normalizeApplicationState(item))
                }
            } catch (error) {}
        },
        applicationByRole(roleCode) {
            const code = this.normalizeRoleCode(roleCode)
            const item = this.applications.find((item) => this.normalizeRoleCode(item.roleCode || item.role_code || item.role) === code)
            return item ? this.withPromoterCode(item) : null
        },
        normalizeApplicationState(item = {}) {
            const statusValues = [
                item.applicationStatus,
                item.application_status,
                item.auditStatus,
                item.audit_status,
                item.reviewStatus,
                item.review_status,
                item.applyStatus,
                item.apply_status,
                item.status,
                item.rawApplicationStatus,
                item.raw_application_status
            ].map((value) => normalizeBackendCode(value)).filter(Boolean)
            const rejectedStatuses = ['REJECTED', 'REJECT', 'REFUSED', 'REFUSE', 'FAILED', 'FAIL', 'AUDIT_REJECTED', 'REVIEW_REJECTED', 'NOT_PASS', 'NOT_PASSED']
            if (statusValues.some((status) => rejectedStatuses.includes(status))) {
                return this.normalizeApplicationFields({
                    ...item,
                    applicationStatus: 'REJECTED',
                    auditStatus: 'REJECTED'
                })
            }
            const status = statusValues[0] || ''
            const payStatus = normalizeBackendCode(item.payStatus || item.depositStatus || item.pay_status || item.deposit_status)
            if ((status === '' || status === 'PENDING_DEPOSIT' || status === 'WAIT_PAY' || status === 'PENDING_PAY') && ['PAID', 'SUCCESS', 'WAIVED', 'FREE'].includes(payStatus)) {
                return this.normalizeApplicationFields({
                    ...item,
                    rawApplicationStatus: item.rawApplicationStatus || item.raw_application_status || status,
                    raw_application_status: item.rawApplicationStatus || item.raw_application_status || status,
                    applicationStatus: 'PENDING_AUDIT',
                    auditStatus: 'PENDING_AUDIT',
                    depositStatus: payStatus,
                    payStatus
                })
            }
            return this.normalizeApplicationFields(item)
        },
        normalizeApplicationFields(item = {}) {
            const roleCode = this.normalizeRoleCode(item.roleCode || item.role_code || item.role)
            const applicationNo = item.applicationNo || item.application_no || item.applyNo || item.apply_no || item.no || ''
            const appliedAt = item.appliedAt || item.applied_at || item.applyTime || item.apply_time || item.createTime || item.create_time || item.createdAt || item.created_at || ''
            const auditTime = item.auditTime || item.audit_time || item.reviewTime || item.review_time || item.approvedAt || item.approved_at || item.updatedAt || item.updated_at || ''
            const paidAt = item.paidAt || item.paid_at || item.payTime || item.pay_time || item.depositPaidAt || item.deposit_paid_at || ''
            return {
                ...item,
                roleCode,
                applicationNo,
                appliedAt,
                auditTime,
                paidAt,
                applicationStatus: item.applicationStatus || item.application_status || item.auditStatus || item.audit_status || item.reviewStatus || item.review_status || item.applyStatus || item.apply_status || item.status || ''
            }
        },
        hasPromoterSignalInUserInfo() {
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
                .concat(Array.isArray(info.roleList) ? info.roleList : [])
                .concat(Array.isArray(info.role_list) ? info.role_list : [])
            const roleMatched = rawRoles.concat(roleList.map((item) => item.roleCode || item.role_code || item.role || item.code || item.value || item))
                .some((code) => this.normalizeRoleCode(code) === 'PROMOTER')
            return Boolean(
                roleMatched
                || info.isPromoter
                || info.is_promoter
                || info.promoterId
                || info.promoter_id
                || info.promoterCode
                || info.promoter_code
            )
        },
        isApprovedRoleItem(item = {}, roleCode) {
            if (this.normalizeRoleCode(item.roleCode || item.role_code || item.role || item.code || item.value) !== this.normalizeRoleCode(roleCode)) return false
            const status = item.applicationStatus || item.application_status || item.auditStatus || item.audit_status || item.status || item.roleStatus || item.role_status
            if (!status) return Boolean(item.approved || item.isApproved || item.is_approved || item.enabled || item.active)
            return this.statusType(status) === 'approved'
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
            if (this.showApplyForm) return
            const roleCode = (this.roleApplyCards[0] && this.roleApplyCards[0].roleCode) || (this.currentRoles[0] && this.currentRoles[0].roleCode) || (this.applyRoleApplications[0] && this.applyRoleApplications[0].roleCode)
            if (!roleCode) return
            this.selectRole(roleCode)
        },
        firstApplyableRoleIndex() {
            return this.roleOptions.findIndex((role) => {
                const code = this.normalizeRoleCode(role.value)
                if (code === 'PROMOTER' && this.hasApprovedPromoterRole) return false
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
                    depositAmount: item.depositAmount ?? item.deposit_amount ?? item.bondAmount ?? item.bond_amount ?? item.marginAmount ?? item.margin_amount ?? '',
                    areaOptions: this.normalizeAreaOptions(this.extractAreaSource(item))
                }
                if (existed) {
                    Object.assign(existed, next)
                } else {
                    this.roleOptions.push(next)
                }
                if (next.depositAmount !== '') this.$set(this.roleDepositConfig, code, next.depositAmount)
            })
            this.refreshAreaColumns()
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
        selectRoleForView(roleCode) {
            const index = this.roleOptions.findIndex((item) => this.normalizeRoleCode(item.value) === this.normalizeRoleCode(roleCode))
            if (index !== -1) {
                this.roleIndex = index
                this.refreshAreaColumns()
            }
        },
        selectRole(roleCode) {
            const index = this.roleOptions.findIndex((item) => item.value === this.normalizeRoleCode(roleCode))
            if (index !== -1) {
                this.roleIndex = index
                this.showApplyForm = false
                this.refreshAreaColumns()
            }
        },
        onRoleCardTap(item = {}) {
            const roleIndex = this.roleOptions.findIndex((role) => this.normalizeRoleCode(role.value) === this.normalizeRoleCode(item.value))
            if (roleIndex === -1) return
            this.roleIndex = roleIndex
            this.showApplyForm = false
            this.prefillForm(this.currentApplication || {})
            this.refreshAreaColumns()
        },
        cancelApplyForm() {
            this.showApplyForm = false
            this.prefillForm(this.currentApplication || {})
        },
        async startApply() {
            if (!this.isKycApproved) return this.goKyc()
            await this.ensureRoleConfig()
            const index = this.firstApplyableRoleIndex()
            if (index === -1) {
                uni.showToast({ title: '当前角色均已开通', icon: 'none' })
                return
            }
            this.roleIndex = index
            this.prefillForm(this.currentApplication || {})
            this.applyKycToForm(true)
            this.prefillUpgradeAccount()
            this.prefillBackendUsername()
            this.refreshAreaColumns()
            this.showApplyForm = true
        },
        async startApplyRole(roleCode) {
            if (!this.isKycApproved) return this.goKyc()
            await this.ensureRoleConfig()
            const index = this.roleOptions.findIndex((role) => this.normalizeRoleCode(role.value) === this.normalizeRoleCode(roleCode))
            if (index === -1) return
            this.roleIndex = index
            this.prefillForm(this.currentApplication || {})
            this.applyKycToForm(true)
            this.prefillUpgradeAccount()
            this.prefillBackendUsername()
            this.refreshAreaColumns()
            this.showApplyForm = true
        },
        async handleRoleCardAction(item = {}) {
            this.selectRoleForView(item.roleCode)
            if (item.disabled) return
            if (item.statusType === 'deposit') {
                await this.payDeposit()
                return
            }
            await this.startApplyRole(item.roleCode)
        },
        roleLabel(roleCode) {
            const code = this.normalizeRoleCode(roleCode)
            const map = {
                MERCHANT: '商家',
                USER: '普通用户',
                PROMOTER: '推广者',
                AGENT: '运营中心',
                SUBSIDIARY: '子公司'
            }
            if (map[code]) return map[code]
            const role = roleOptions.find((item) => item.value === code)
            if (role) return role.label
            const currentRole = this.currentRoles.find((item) => this.normalizeRoleCode(item.roleCode) === code)
            return (currentRole && currentRole.roleName) || code
        },
        roleTagType(roleCode) {
            const code = this.normalizeRoleCode(roleCode)
            const map = {
                MERCHANT: 'merchant',
                PROMOTER: 'promoter',
                AGENT: 'agent',
                SUBSIDIARY: 'subsidiary',
                USER: 'user'
            }
            return map[code] || 'default'
        },
        normalizeRoleCode(roleCode) {
            const code = normalizeBackendCode(roleCode)
            const map = { OPERATION_CENTER: 'AGENT', AREA_AGENT: 'AGENT', COUNTY_AGENT: 'AGENT', BRANCH: 'SUBSIDIARY', COMPANY_BRANCH: 'SUBSIDIARY' }
            return map[code] || code
        },
        async startFirstApply() {
            if (!this.isKycApproved) return this.goKyc()
            await this.ensureRoleConfig()
            const index = this.firstApplyableRoleIndex()
            this.roleIndex = index === -1 ? 0 : index
            this.prefillForm({})
            this.applyKycToForm(true)
            this.prefillUpgradeAccount()
            this.prefillBackendUsername()
            this.refreshAreaColumns()
            this.showApplyForm = true
        },
        statusType(status) {
            const normalized = normalizeBackendCode(status)
            if (['PENDING_DEPOSIT'].includes(normalized)) return 'deposit'
            if (['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING'].includes(normalized)) return 'pending'
            if (['APPROVED', 'PASS', 'PASSED', 'REALNAME_VERIFIED'].includes(normalized)) return 'approved'
            if (['REJECTED', 'REJECT', 'REFUSED', 'REFUSE', 'FAILED', 'FAIL', 'AUDIT_REJECTED', 'REVIEW_REJECTED', 'NOT_PASS', 'NOT_PASSED'].includes(normalized)) return 'rejected'
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
                REFUSED: '已拒绝',
                REFUSE: '已拒绝',
                AUDIT_REJECTED: '已拒绝',
                REVIEW_REJECTED: '已拒绝',
                NOT_PASS: '已拒绝',
                NOT_PASSED: '已拒绝',
                CANCELLED: '已取消',
                AUDITING: '待审核',
                SUCCESS: '待审核',
                FAIL: '已拒绝',
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
                PROMOTER: '权益说明权益说明权益说明权益说明权益说明权益说明权益',
                AGENT: '权益说明权益说明权益说明权益说明权益说明权益说明权益',
                SUBSIDIARY: '权益说明权益说明权益说明权益说明权益说明权益说明权益'
            }
            return map[this.normalizeRoleCode(roleCode)] || '提交资料后等待平台审核'
        },
        roleSortWeight(roleCode) {
            const map = { SUBSIDIARY: 1, AGENT: 2, PROMOTER: 3 }
            return map[this.normalizeRoleCode(roleCode)] || 99
        },
        applicationAuditRemark(item = {}) {
            const raw = item.auditRemark || item.audit_remark || item.reviewRemark || item.review_remark || item.auditOpinion || item.audit_opinion || item.rejectReasonMessage || item.reject_reason_message || item.rejectReasonCode || item.reject_reason_code || item.approveRemark || item.approve_remark || item.remark || ''
            return localizeBackendText(raw, '')
        },
        historyRemarkLabel(item = {}) {
            const status = this.statusType(item.applicationStatus)
            if (status === 'rejected') return '拒绝原因'
            if (status === 'approved') return '通过说明'
            if (status === 'cancelled') return '取消说明'
            return '审核说明'
        },
        applicationPrimaryTime(item = {}) {
            const status = this.statusType(item.applicationStatus)
            if (status === 'approved') return item.auditTime || item.appliedAt || item.createdAt || item.created_at || ''
            return item.appliedAt || item.createdAt || item.created_at || item.auditTime || ''
        },
        historyPrimaryTime(item = {}) {
            const status = this.statusType(item.applicationStatus)
            if (status === 'approved') {
                const time = item.auditTime || this.applicationPrimaryTime(item)
                return time ? `通过时间：${time}` : ''
            }
            if (status === 'pending') {
                const time = item.paidAt || item.appliedAt || this.applicationPrimaryTime(item)
                return time ? `提交时间：${time}` : ''
            }
            if (status === 'deposit') {
                const time = item.appliedAt || this.applicationPrimaryTime(item)
                return time ? `申请时间：${time}` : ''
            }
            const time = this.applicationPrimaryTime(item)
            return time ? `申请时间：${time}` : ''
        },
        historySecondaryTime(item = {}) {
            const status = this.statusType(item.applicationStatus)
            if (status === 'pending' && item.paidAt) return `押金支付：${item.paidAt}`
            if ((status === 'rejected' || status === 'cancelled') && item.auditTime) return `审核时间：${item.auditTime}`
            if (status === 'approved' && item.appliedAt && item.auditTime && item.appliedAt !== item.auditTime) return `申请时间：${item.appliedAt}`
            return ''
        },
        historyApplicationNo(item = {}) {
            return item.applicationNo || item.application_no || item.applyNo || item.apply_no || ''
        },
        visibleHistoryInfo(item = {}) {
            return [
                { label: '申请人', value: item.applicantName || item.applicant_name },
                { label: '手机号', value: item.mobile },
                { label: '申请区域', value: this.applicationAreaText(item) },
                { label: '定位地址', value: item.detailAddress || item.detail_address },
                { label: '押金', value: this.displayDepositText(item) },
                { label: '押金状态', value: this.depositStatusLabel(item.depositStatus || item.payStatus) }
            ].filter((info) => info.value)
        },
        applicationTimeValue(item = {}) {
            const raw = item.auditTime || item.appliedAt || item.createdAt || item.created_at || item.createTime || item.create_time || ''
            const value = raw ? new Date(String(raw).replace(/-/g, '/')).getTime() : 0
            return Number.isNaN(value) ? 0 : value
        },
        moneyText(value) {
            if (value === '' || value === null || value === undefined) return ''
            return `¥${value}`
        },
        roleDepositAmountFor(roleCode, fallback = '') {
            const code = this.normalizeRoleCode(roleCode || this.selectedRoleCode)
            const role = this.roleOptions.find((item) => this.normalizeRoleCode(item.value || item.roleCode) === code) || {}
            const config = {
                ...(this.userInfo.roleDepositConfig || this.userInfo.role_deposit_config || this.userInfo.depositConfig || this.userInfo.deposit_config || {}),
                ...this.roleDepositConfig
            }
            const value = [config[code], role.depositAmount, fallback].find((item) => item !== undefined && item !== null && item !== '')
            return value === undefined || value === null ? '' : value
        },
        displayDepositAmount(application = {}) {
            const roleCode = application.roleCode || application.role_code || this.selectedRoleCode
            const applicationAmount = application.depositAmount ?? application.deposit_amount ?? application.bondAmount ?? application.bond_amount ?? ''
            return this.roleDepositAmountFor(roleCode, applicationAmount)
        },
        displayDepositText(application = {}) {
            return this.moneyText(this.displayDepositAmount(application))
        },
        async handleStatusAction(type) {
            if (type === 'reapply') {
                this.prefillForm(this.currentApplication || {})
                this.showApplyForm = true
                return
            }
            if (type === 'apply-other') {
                this.startApply()
                return
            }
            if (type === 'deposit') {
                await this.payDeposit()
                return
            }
        },
        goKyc() {
            if (!this.hasLoginUser) {
                toLogin()
                return
            }
            if (this.kycRedirecting) return
            this.kycRedirecting = true
            uni.redirectTo({
                url: '/business/pages/business_pages/user_kyc',
                fail: () => {
                    this.kycRedirecting = false
                    uni.navigateTo({ url: '/business/pages/business_pages/user_kyc' })
                }
            })
        },
        redirectToKycIfNeeded() {
            if (!this.hasLoginUser) return
            if (this.isKycApproved || this.hasApprovedApplyRoleRecord || this.kycRedirecting) return
            this.goKyc()
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
                    amount: this.displayDepositAmount(application),
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
            this.form.provinceCode = application.provinceCode || application.province_code || ''
            this.form.provinceName = application.provinceName || application.province_name || application.province || ''
            this.form.cityCode = application.cityCode || application.city_code || ''
            this.form.cityName = application.cityName || application.city_name || application.city || ''
            this.form.districtCode = application.districtCode || application.district_code || ''
            this.form.districtName = application.districtName || application.district_name || application.district || ''
            this.form.detailAddress = application.detailAddress || application.detail_address || application.address || this.form.detailAddress
            this.form.longitude = application.longitude || application.lng || this.form.longitude
            this.form.latitude = application.latitude || application.lat || this.form.latitude
            this.applyKycToForm(true)
            this.form.remark = application.remark || this.form.remark
            this.form.materialUrlsText = Array.isArray(application.materialUrls) ? application.materialUrls.join('\n') : (application.materialUrls || this.form.materialUrlsText)
            this.form.password = ''
            this.form.confirmPassword = ''
            this.syncAreaPickerValueByForm()
            this.prefillUpgradeAccount()
            this.prefillBackendUsername()
        },
        prefillUpgradeAccount() {
            if (!this.isRoleUpgradeApplication) return
            const promoter = this.approvedPromoterApplication || {}
            const username = promoter.username || promoter.loginName || promoter.login_name
            this.form.username = username || this.form.username
            this.markReadonlyField('username', username)
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
            if (this.needsAreaSelection && !this.selectedAreaText) {
                uni.showToast({ title: this.hasAreaOptions ? '请选择申请区域' : '暂无可选区域，请联系平台', icon: 'none' })
                return false
            }
            if (this.needsAreaSelection && (!this.form.longitude || !this.form.latitude)) {
                uni.showToast({ title: '请选择地图定位', icon: 'none' })
                return false
            }
            if (this.requiresBackendUsername && !this.form.username.trim()) {
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
            if (this.requiresBackendPassword && (!this.form.password || this.form.password.length < 6)) {
                uni.showToast({ title: '请设置至少 6 位密码', icon: 'none' })
                return false
            }
            if (this.requiresBackendPassword && this.form.password !== this.form.confirmPassword) {
                uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
                return false
            }
            return true
        },
        extractAreaSource(source = {}) {
            return source.areaOptions || source.area_options || source.areas || source.areaList || source.area_list
                || source.regions || source.regionOptions || source.region_options || source.regionList || source.region_list
                || source.availableAreas || source.available_areas || source.applyAreas || source.apply_areas
                || source.availableRegions || source.available_regions || []
        },
        normalizeAreaOptions(source = []) {
            const list = Array.isArray(source)
                ? source
                : Array.isArray(source.list)
                    ? source.list
                    : Array.isArray(source.records)
                        ? source.records
                        : Array.isArray(source.children)
                            ? source.children
                            : []
            const normalized = list.map((item) => this.normalizeAreaItem(item)).filter((item) => item.label)
            if (normalized.length === 1 && String(normalized[0].value).toUpperCase() === 'CN' && normalized[0].children && normalized[0].children.length) {
                return normalized[0].children
            }
            return normalized
        },
        normalizeAreaItem(item = {}) {
            if (typeof item === 'string') return { label: item, value: item, children: [] }
            const label = item.label || item.name || item.areaName || item.area_name || item.regionName || item.region_name || item.provinceName || item.province_name || item.cityName || item.city_name || item.districtName || item.district_name || ''
            const value = item.value || item.code || item.areaCode || item.area_code || item.regionCode || item.region_code || item.provinceCode || item.province_code || item.cityCode || item.city_code || item.districtCode || item.district_code || item.id || label
            const children = item.children || item.childList || item.child_list || item.list || item.cities || item.cityList || item.city_list || item.districts || item.districtList || item.district_list || []
            return {
                ...item,
                label,
                value,
                children: this.normalizeAreaOptions(children)
            }
        },
        refreshAreaColumns() {
            const areas = this.selectedRoleAreaOptions
            const provinceIndex = Math.min(this.areaPickerValue[0] || 0, Math.max(areas.length - 1, 0))
            const cities = areas[provinceIndex] && areas[provinceIndex].children ? areas[provinceIndex].children : []
            const cityIndex = Math.min(this.areaPickerValue[1] || 0, Math.max(cities.length - 1, 0))
            const districts = cities[cityIndex] && cities[cityIndex].children ? cities[cityIndex].children : []
            const districtIndex = Math.min(this.areaPickerValue[2] || 0, Math.max(districts.length - 1, 0))
            this.areaPickerValue = [provinceIndex, cityIndex, districtIndex]
            this.areaPickerColumns = [areas, cities, districts]
        },
        onAreaColumnChange(e) {
            const column = Number(e.detail.column || 0)
            const value = Number(e.detail.value || 0)
            const next = this.areaPickerValue.slice()
            next[column] = value
            if (column === 0) {
                next[1] = 0
                next[2] = 0
            } else if (column === 1) {
                next[2] = 0
            }
            this.areaPickerValue = next
            this.refreshAreaColumns()
        },
        onAreaConfirm(e) {
            const value = Array.isArray(e.detail.value) ? e.detail.value : this.areaPickerValue
            this.areaPickerValue = value
            this.refreshAreaColumns()
            const province = this.areaPickerColumns[0][this.areaPickerValue[0]] || {}
            const city = this.areaPickerColumns[1][this.areaPickerValue[1]] || {}
            const district = this.areaPickerColumns[2][this.areaPickerValue[2]] || {}
            this.form.provinceCode = province.value || ''
            this.form.provinceName = province.label || ''
            this.form.cityCode = city.value || ''
            this.form.cityName = city.label || ''
            this.form.districtCode = district.value || ''
            this.form.districtName = district.label || ''
        },
        syncAreaPickerValueByForm() {
            const areas = this.selectedRoleAreaOptions
            if (!areas.length) {
                this.refreshAreaColumns()
                return
            }
            const provinceIndex = Math.max(areas.findIndex((item) => this.areaOptionMatched(item, this.form.provinceCode, this.form.provinceName)), 0)
            const cities = areas[provinceIndex] && areas[provinceIndex].children ? areas[provinceIndex].children : []
            const cityIndex = Math.max(cities.findIndex((item) => this.areaOptionMatched(item, this.form.cityCode, this.form.cityName)), 0)
            const districts = cities[cityIndex] && cities[cityIndex].children ? cities[cityIndex].children : []
            const districtIndex = Math.max(districts.findIndex((item) => this.areaOptionMatched(item, this.form.districtCode, this.form.districtName)), 0)
            this.areaPickerValue = [provinceIndex, cityIndex, districtIndex]
            this.refreshAreaColumns()
        },
        areaOptionMatched(item = {}, code, name) {
            return Boolean((code && String(item.value) === String(code)) || (name && item.label === name))
        },
        handleEmptyAreaTap() {
            uni.showToast({ title: '暂无可选区域，请联系平台', icon: 'none' })
        },
        chooseApplyLocation() {
            const params = {}
            const latitude = Number(this.form.latitude)
            const longitude = Number(this.form.longitude)
            if (!Number.isNaN(latitude) && !Number.isNaN(longitude) && latitude && longitude) {
                params.latitude = latitude
                params.longitude = longitude
            }
            uni.chooseLocation({
                ...params,
                success: (res) => {
                    this.form.longitude = res.longitude || ''
                    this.form.latitude = res.latitude || ''
                    const address = [res.address, res.name].filter(Boolean).join(' ')
                    if (address) this.form.detailAddress = address
                },
                fail: (error) => {
                    const message = String((error && (error.errMsg || error.message)) || '')
                    if (/cancel/i.test(message)) return
                    uni.showToast({ title: '地图选点失败，请检查定位权限', icon: 'none' })
                }
            })
        },
        applicationAreaText(item = {}) {
            return [item.provinceName || item.province_name || item.province, item.cityName || item.city_name || item.city, item.districtName || item.district_name || item.district].filter(Boolean).join(' / ')
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
            await this.ensureRoleConfig()
            if (this.roleDepositAmount === '' || Number(this.roleDepositAmount) < 0) {
                throw new Error('该角色押金金额待确认，请联系平台')
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
                const application = this.currentApplication || {}
                const depositInfo = await this.payDepositBeforeSubmit()
                const res = await applyRoleApplication({
                    ...this.form,
                    applicationNo: application.applicationNo || application.application_no || '',
                    applicationId: application.applicationId || application.application_id || application.id || '',
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
                    this.upsertPendingAuditApplication(roleCode, depositInfo, res.data || {})
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
        upsertPendingAuditApplication(roleCode, depositInfo = {}, backendApplication = {}) {
            const code = this.normalizeRoleCode(roleCode)
            const existedIndex = this.applications.findIndex((item) => this.normalizeRoleCode(item.roleCode) === code)
            const existed = existedIndex === -1 ? {} : this.applications[existedIndex]
            const normalizedBackend = this.normalizeApplicationState(backendApplication || {})
            const backendStatus = this.statusType(normalizedBackend.applicationStatus || normalizedBackend.auditStatus || normalizedBackend.status)
            const fallbackStatus = backendStatus === 'approved' ? 'APPROVED' : 'PENDING_AUDIT'
            const paidStatus = depositInfo.depositPayOrderNo || depositInfo.depositBizOrderNo ? 'PAID' : ''
            const next = {
                ...existed,
                ...this.form,
                ...depositInfo,
                ...normalizedBackend,
                roleCode: code,
                applicationStatus: normalizedBackend.applicationStatus || fallbackStatus,
                auditStatus: normalizedBackend.auditStatus || normalizedBackend.applicationStatus || fallbackStatus,
                depositStatus: normalizedBackend.depositStatus || paidStatus || existed.depositStatus || '',
                payStatus: normalizedBackend.payStatus || paidStatus || existed.payStatus || '',
                depositAmount: this.roleDepositAmountFor(code, normalizedBackend.depositAmount),
                appliedAt: normalizedBackend.appliedAt || existed.appliedAt || new Date().toISOString()
            }
            if (existedIndex === -1) this.applications.unshift(next)
            else this.$set(this.applications, existedIndex, next)
        }
    }
}
</script>

<style lang="scss">
.promoter-page { min-height: 100vh; padding: calc(var(--status-bar-height) + 21rpx) 24rpx 48rpx; background: linear-gradient(180deg, #fff8ed 0%, #fff4e6 100%); box-sizing: border-box; }
.promoter-nav { position: relative; display: flex; align-items: center; justify-content: center; height: 98rpx; margin: 0 -24rpx 39rpx; padding: 0 24rpx; box-sizing: border-box; }
.promoter-nav__back { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 86rpx; height: 98rpx; }
.promoter-nav__arrow { width: 18rpx; height: 18rpx; border-left: 4rpx solid #222222; border-bottom: 4rpx solid #222222; transform: rotate(45deg); box-sizing: border-box; }
.promoter-nav__title { color: #222222; font-size: 36rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 36rpx; white-space: nowrap; }
.promoter-nav__capsule { position: absolute; right: 24rpx; top: 24rpx; display: flex; align-items: center; justify-content: space-around; width: 168rpx; height: 64rpx; padding: 0 19rpx; border: 1rpx solid transparent; border-radius: 32rpx; background: transparent; box-sizing: border-box; opacity: 0; }
.promoter-nav__dot { width: 46rpx; height: 12rpx; border-top: 6rpx dotted #222222; box-sizing: border-box; }
.promoter-nav__divider { width: 1rpx; height: 35rpx; background: rgba(0, 0, 0, .16); }
.promoter-nav__circle { width: 31rpx; height: 31rpx; border: 4rpx solid #222222; border-radius: 50%; box-sizing: border-box; }
.header { padding: 34rpx 30rpx; border-radius: 28rpx; color: #ffffff; background: linear-gradient(135deg, #a0610d 0%, #c8872e 100%); box-shadow: 0 18rpx 42rpx rgba(160, 97, 13, .2); }
.title-row { display: flex; align-items: center; gap: 16rpx; min-width: 0; }
.title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.header-tags { display: flex; flex-wrap: wrap; gap: 10rpx; min-width: 0; }
.header-tag { height: 42rpx; padding: 0 16rpx; border-radius: 21rpx; color: #ffffff; background: rgba(255, 255, 255, .18); border: 1rpx solid rgba(255, 255, 255, .32); font-size: 22rpx; line-height: 42rpx; }
.header-tag--merchant { background: rgba(255, 255, 255, .2); border-color: rgba(255, 255, 255, .36); }
.header-tag--promoter { background: rgba(255, 188, 84, .28); border-color: rgba(255, 214, 142, .48); }
.header-tag--agent { background: rgba(158, 112, 255, .28); border-color: rgba(202, 180, 255, .48); }
.header-tag--subsidiary { background: rgba(84, 154, 255, .28); border-color: rgba(172, 218, 255, .48); }
.header-tag--user, .header-tag--default { background: rgba(255, 255, 255, .16); }
.subtitle { margin-top: 10rpx; color: rgba(255, 255, 255, .88); font-size: 25rpx; line-height: 36rpx; }
.role-card, .status-card, .focus-card, .info-card, .action-card, .form-card, .history, .empty-state { margin-top: 22rpx; padding: 26rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08); }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.card-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.card-subtitle { margin-top: 6rpx; color: #888888; font-size: 23rpx; }
.card-count { flex: none; padding: 8rpx 16rpx; border-radius: 999rpx; color: #a0610d; background: #fff1dc; font-size: 23rpx; }
.role-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 18rpx; }
.role-chip { min-width: 150rpx; padding: 16rpx 20rpx; border-radius: 20rpx; border: 1rpx solid #e6eaf0; background: #f7f9fc; box-sizing: border-box; }
.role-chip--active { border-color: #a0610d; background: #fff1dc; }
.role-chip--readonly { border-color: #e7ebf0; background: #f9fafc; }
.role-chip__name { display: block; color: #222222; font-size: 27rpx; font-weight: 600; }
.role-chip__meta { display: block; margin-top: 6rpx; color: #888888; font-size: 22rpx; }
.empty-state { text-align: center; }
.empty-state__title { color: #222222; font-size: 30rpx; font-weight: 600; }
.empty-state__desc { margin-top: 10rpx; color: #777777; font-size: 25rpx; line-height: 38rpx; }
.empty-state__btn { display: inline-flex; align-items: center; justify-content: center; margin-top: 22rpx; height: 68rpx; padding: 0 36rpx; border-radius: 34rpx; color: #ffffff; background: linear-gradient(135deg, #a0610d, #c8872e); font-size: 27rpx; }
.kyc-gate, .apply-entry { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-top: 22rpx; padding: 28rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08); box-sizing: border-box; }
.kyc-gate { border: 1rpx solid #ffd2a8; background: linear-gradient(135deg, #fff8ef, #ffffff); }
.kyc-gate__title, .apply-entry__title { color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; }
.kyc-gate__desc { margin-top: 8rpx; color: #8a5a22; font-size: 24rpx; line-height: 36rpx; }
.kyc-gate__btn, .apply-entry__btn { flex: none; height: 64rpx; padding: 0 28rpx; border-radius: 32rpx; color: #ffffff; background: #a0610d; font-size: 26rpx; line-height: 64rpx; }
.apply-entry { border: 1rpx solid #f1d7b9; background: linear-gradient(135deg, #fff7ec, #ffffff); }
.apply-entry__btn { background: linear-gradient(135deg, #a0610d, #c8872e); }
.role-board { margin-top: 0; padding: 0; border-radius: 0; background: transparent; box-shadow: none; border: 0; }
.role-board__head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.role-board__title { color: #172033; font-size: 31rpx; font-weight: 700; line-height: 44rpx; }
.role-apply-list { display: flex; flex-direction: column; align-items: center; gap: 23rpx; width: 100%; margin-top: 0; }
.role-apply-card { position: relative; width: 100%; max-width: 703rpx; min-height: 294rpx; padding: 42rpx 42rpx 22rpx 39rpx; border-radius: 12rpx 12rpx 147rpx 147rpx; border: 0; background: #ffffff; box-sizing: border-box; overflow: hidden; box-shadow: none; }
.role-apply-card--active { background: #ffffff; box-shadow: 0 10rpx 28rpx rgba(160, 97, 13, .08); }
.role-apply-card--disabled .role-apply-card__button { background: rgba(160, 97, 13, .45); }
.role-apply-card__title { color: #222222; font-size: 34rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 34rpx; white-space: nowrap; }
.role-apply-card__content { display: flex; gap: 18rpx; justify-content: space-between; margin-top: 16rpx; }
.role-apply-card__body { flex: 1; min-width: 0; max-width: 432rpx; padding-top: 4rpx; box-sizing: border-box; }
.role-apply-card__bar { width: 41rpx; height: 5rpx; margin-left: 5rpx; background: #a0610d; }
.role-apply-card__desc { width: 100%; margin: 26rpx 0 0 2rpx; color: #666666; font-size: 24rpx; font-weight: 400; line-height: 35rpx; word-break: break-all; box-sizing: border-box; }
.role-apply-card__button { display: flex; align-items: center; justify-content: center; width: 228rpx; height: 70rpx; margin: 19rpx 0 0 0; padding: 0; color: #ffffff; background: #a0610d; border: 0; border-radius: 35rpx; font-size: 26rpx; font-weight: 400; line-height: 26rpx; white-space: nowrap; box-sizing: border-box; }
.role-apply-card__button::after { display: none; }
.role-apply-card--agent .role-apply-card__button { width: 253rpx; }
.role-apply-card__art { position: relative; flex: none; margin-top: 0; }
.role-apply-card__art--promoter { width: 111rpx; height: 132rpx; margin-right: 28rpx; }
.role-apply-card__art--agent { width: 129rpx; height: 121rpx; margin-right: 9rpx; }
.role-apply-card__art--subsidiary { width: 141rpx; height: 141rpx; margin-right: 1rpx; }
.role-apply-card__art::before,
.role-apply-card__art::after { content: ''; position: absolute; box-sizing: border-box; }
.role-apply-card__art--subsidiary::before { left: 13rpx; top: 18rpx; width: 96rpx; height: 91rpx; border-radius: 18rpx; background: linear-gradient(180deg, #ffd99b, #c9892c); box-shadow: 20rpx 18rpx 0 rgba(160, 97, 13, .22); }
.role-apply-card__art--subsidiary::after { left: 42rpx; top: 0; width: 70rpx; height: 141rpx; border-radius: 35rpx 35rpx 20rpx 20rpx; border: 8rpx solid #a0610d; background: rgba(255, 246, 228, .85); }
.role-apply-card__art--agent::before { left: 0; top: 20rpx; width: 112rpx; height: 82rpx; border-radius: 41rpx; background: linear-gradient(135deg, #f2c16d, #a0610d); transform: rotate(-12deg); }
.role-apply-card__art--agent::after { right: 0; top: 6rpx; width: 66rpx; height: 66rpx; border-radius: 50%; border: 10rpx solid #fff1d8; background: #a0610d; box-shadow: -42rpx 73rpx 0 -14rpx #c48a3d; }
.role-apply-card__art--promoter::before { left: 7rpx; top: 0; width: 83rpx; height: 83rpx; border-radius: 50%; background: linear-gradient(180deg, #f8d38c, #a0610d); box-shadow: 27rpx 49rpx 0 -8rpx rgba(160, 97, 13, .42); }
.role-apply-card__art--promoter::after { left: 0; bottom: 0; width: 111rpx; height: 54rpx; border-radius: 27rpx 27rpx 12rpx 12rpx; background: #fff1d8; border: 8rpx solid #a0610d; }
.role-apply-card__meta { display: flex; flex-wrap: wrap; gap: 8rpx 16rpx; margin-top: 8rpx; color: #9a6b2a; font-size: 20rpx; line-height: 28rpx; }
.role-apply-card__remark { margin-top: 6rpx; color: #a0610d; font-size: 21rpx; line-height: 30rpx; }
.role-apply-card--rejected .role-apply-card__remark { color: #e34d59; }
.role-apply-card__hint { display: none; }
.status-card { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 18rpx; overflow: hidden; }
.status-card::after { content: ''; position: absolute; right: -58rpx; top: -58rpx; width: 172rpx; height: 172rpx; border-radius: 50%; background: rgba(255, 255, 255, .55); }
.status-card--deposit { background: linear-gradient(135deg, #fff7e6, #ffffff); border: 1rpx solid #ffd89a; }
.status-card--pending { background: linear-gradient(135deg, #fff1dc 0%, #fff8ed 58%, #ffffff 100%); border: 1rpx solid #ead5b8; box-shadow: 0 18rpx 46rpx rgba(160, 97, 13, .14); }
.status-card--approved { background: linear-gradient(135deg, #e8fff4, #ffffff); border: 1rpx solid #9ee8c0; }
.status-card--rejected { background: linear-gradient(135deg, #fff0f0, #ffffff); border: 1rpx solid #ffc2c2; }
.status-card--cancelled { background: linear-gradient(135deg, #f2f3f5, #ffffff); border: 1rpx solid #dcdfe6; }
.status-main { position: relative; z-index: 1; flex: 1; min-width: 0; }
.status-title-row { display: flex; align-items: center; gap: 14rpx; min-width: 0; }
.status-icon { flex: none; width: 52rpx; height: 52rpx; border-radius: 18rpx; background: linear-gradient(135deg, #a0610d, #c8872e); box-shadow: 0 10rpx 18rpx rgba(160, 97, 13, .18); }
.status-icon::after { content: ''; display: block; width: 20rpx; height: 10rpx; margin: 17rpx 0 0 15rpx; border-left: 4rpx solid #ffffff; border-bottom: 4rpx solid #ffffff; transform: rotate(-45deg); }
.status-title { color: #222222; font-size: 32rpx; font-weight: 700; line-height: 44rpx; }
.status-value { position: relative; z-index: 1; flex: none; padding: 12rpx 20rpx; border-radius: 999rpx; color: #a0610d; background: rgba(160, 97, 13, .1); font-size: 26rpx; font-weight: 600; }
.status-card--deposit .status-value { color: #d48806; background: rgba(250, 173, 20, .14); }
.status-card--pending .status-value { color: #ffffff; background: linear-gradient(135deg, #a0610d, #c8872e); box-shadow: 0 10rpx 22rpx rgba(160, 97, 13, .24); }
.status-card--approved .status-value { color: #10a66a; background: rgba(16, 166, 106, .12); }
.status-card--rejected .status-value { color: #e34d59; background: rgba(227, 77, 89, .12); }
.status-card--cancelled .status-value { color: #7a7f8a; background: rgba(122, 127, 138, .12); }
.status-desc { margin-top: 10rpx; color: #5f6b7a; font-size: 25rpx; line-height: 38rpx; }
.status-desc--no { color: #8a96a6; font-size: 23rpx; }
.status-pending-flow { display: flex; align-items: center; gap: 10rpx; margin-top: 20rpx; padding: 16rpx; border-radius: 18rpx; background: rgba(255, 255, 255, .72); }
.status-flow-step { flex: none; color: #8a96a6; font-size: 22rpx; line-height: 32rpx; white-space: nowrap; }
.status-flow-step.is-done { color: #18a058; }
.status-flow-step.is-active { color: #a0610d; font-weight: 700; }
.status-flow-line { flex: 1; min-width: 24rpx; height: 2rpx; background: linear-gradient(90deg, rgba(24, 160, 88, .5), rgba(160, 97, 13, .28)); }
.focus-card { display: flex; gap: 18rpx; }
.focus-card--deposit { background: #fffaf0; }
.focus-card--pending { background: #fff8ed; }
.focus-card--approved { background: #f2fff8; }
.focus-card--rejected { background: #fff6f6; }
.focus-card--cancelled { background: #f8f1e8; }
.focus-item { flex: 1; min-width: 0; padding: 20rpx; border-radius: 18rpx; background: rgba(255, 255, 255, .76); }
.focus-label { display: block; color: #888888; font-size: 23rpx; }
.focus-value { display: block; margin-top: 10rpx; color: #222222; font-size: 30rpx; font-weight: 600; line-height: 42rpx; word-break: break-all; }
.info-title { margin-bottom: 18rpx; color: #222222; font-size: 30rpx; font-weight: 600; }
.info-card--approved { border: 1rpx solid #9ee8c0; background: linear-gradient(135deg, #f0fff7, #ffffff); }
.approved-head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.approved-title { color: #12352a; font-size: 32rpx; font-weight: 700; line-height: 44rpx; }
.approved-desc { margin-top: 8rpx; color: #5d776e; font-size: 24rpx; line-height: 36rpx; }
.approved-tag { flex: none; height: 52rpx; padding: 0 20rpx; border-radius: 26rpx; font-size: 25rpx; font-weight: 600; line-height: 52rpx; }
.approved-tag--merchant { color: #a0610d; background: rgba(160, 97, 13, .1); }
.approved-tag--promoter { color: #b26a00; background: rgba(255, 159, 28, .16); }
.approved-tag--agent { color: #0c8f61; background: rgba(24, 197, 159, .15); }
.approved-tag--subsidiary { color: #a0610d; background: rgba(160, 97, 13, .12); }
.approved-tag--user, .approved-tag--default { color: #6b7280; background: rgba(107, 114, 128, .12); }
.info-item { display: flex; justify-content: space-between; gap: 20rpx; padding: 14rpx 0; border-top: 1rpx solid #f0f1f3; }
.info-label { flex: none; color: #999999; font-size: 24rpx; }
.info-value { color: #222222; font-size: 26rpx; text-align: right; word-break: break-all; }
.action-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.action-desc { margin-top: 10rpx; color: #666666; font-size: 25rpx; line-height: 38rpx; }
.action-buttons { display: flex; gap: 18rpx; margin-top: 22rpx; }
.action-btn { flex: 1; height: 76rpx; line-height: 76rpx; border-radius: 38rpx; font-size: 28rpx; }
.action-btn--primary { color: #ffffff; background: linear-gradient(135deg, #a0610d, #c8872e); box-shadow: 0 10rpx 22rpx rgba(160, 97, 13, .18); }
.action-btn--plain { color: #a0610d; background: #fff1dc; }
.form-card { padding: 30rpx; }
.form-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; margin-bottom: 22rpx; }
.form-title { color: #222222; font-size: 32rpx; font-weight: 700; line-height: 44rpx; }
.form-subtitle { margin-top: 6rpx; color: #a0610d; font-size: 24rpx; line-height: 34rpx; }
.form-close { flex: none; height: 56rpx; padding: 0 22rpx; border-radius: 28rpx; color: #5f6b7a; background: #fff8ed; font-size: 24rpx; line-height: 56rpx; }
.role-select { margin-bottom: 20rpx; padding: 22rpx; border-radius: 20rpx; background: linear-gradient(180deg, #fff8ed, #ffffff); border: 1rpx solid #f0dcc0; box-sizing: border-box; }
.role-select__head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10rpx 18rpx; }
.role-select__title { color: #222222; font-size: 29rpx; font-weight: 700; }
.role-select__current { flex: none; max-width: 100%; color: #a0610d; font-size: 24rpx; line-height: 34rpx; }
.role-select__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12rpx; margin-top: 18rpx; }
.role-select__option { position: relative; min-height: 146rpx; padding: 20rpx 16rpx 18rpx; border-radius: 18rpx; border: 2rpx solid #e5ebf2; background: #ffffff; box-sizing: border-box; overflow: hidden; }
.role-select__option--active { border-color: #a0610d; background: linear-gradient(135deg, #fff7ec, #ffffff); box-shadow: 0 10rpx 24rpx rgba(160, 97, 13, .14); }
.role-select__name { padding-right: 34rpx; color: #222222; font-size: 27rpx; font-weight: 700; line-height: 38rpx; word-break: keep-all; }
.role-select__desc { margin-top: 8rpx; color: #7a8594; font-size: 21rpx; line-height: 30rpx; word-break: break-all; }
.role-select__check { position: absolute; right: 14rpx; top: 16rpx; width: 28rpx; height: 28rpx; border-radius: 50%; border: 2rpx solid #d6dee9; background: #ffffff; box-sizing: border-box; }
.role-select__option--active .role-select__check { border-color: #a0610d; background: #a0610d; }
.role-select__option--active .role-select__check::after { content: ''; position: absolute; left: 8rpx; top: 4rpx; width: 9rpx; height: 15rpx; border-right: 3rpx solid #ffffff; border-bottom: 3rpx solid #ffffff; transform: rotate(45deg); }
.form-item { display: flex; align-items: center; min-height: 96rpx; margin-top: 16rpx; padding: 18rpx 20rpx; border: 1rpx solid #edf1f6; border-radius: 18rpx; background: #f8fafc; box-sizing: border-box; }
.form-item:first-of-type { margin-top: 0; }
.form-item--textarea { align-items: flex-start; padding-top: 22rpx; }
.label { flex: none; width: 160rpx; color: #465366; font-size: 27rpx; font-weight: 500; line-height: 40rpx; }
input, textarea, .picker-value { flex: 1; min-width: 0; color: #1f2937; font-size: 28rpx; }
input, .picker-value { min-height: 62rpx; line-height: 62rpx; text-align: right; }
.picker-value--placeholder { color: #98a2b3; }
textarea { height: 168rpx; padding: 16rpx; border-radius: 16rpx; background: #ffffff; line-height: 40rpx; box-sizing: border-box; text-align: left; }
.form-item--map { align-items: flex-start; }
.map-picker { flex: 1; display: flex; align-items: center; gap: 16rpx; min-width: 0; }
.map-picker__text { flex: 1; min-width: 0; text-align: right; }
.map-picker__address { color: #1f2937; font-size: 27rpx; line-height: 38rpx; word-break: break-all; }
.map-picker__address--placeholder { color: #98a2b3; }
.map-picker__coord { margin-top: 6rpx; color: #7a8494; font-size: 22rpx; line-height: 32rpx; }
.map-picker__btn { flex: none; height: 58rpx; padding: 0 20rpx; border-radius: 29rpx; color: #a0610d; background: #fff1dc; font-size: 24rpx; line-height: 58rpx; }
.upgrade-tip { margin-top: 16rpx; padding: 18rpx 20rpx; border-radius: 18rpx; color: #176b55; background: #eefbf6; border: 1rpx solid #c7f0df; font-size: 24rpx; line-height: 36rpx; }
.form-item--readonly {
    background: #f3f6fa;
}
.form-item--readonly input {
    color: #667085;
}
.kyc-material { margin-top: 24rpx; padding: 24rpx; border-radius: 20rpx; background: #f8fafc; border: 1rpx solid #edf1f6; }
.kyc-material--readonly { background: #f3f6fa; border-color: #e5ebf2; }
.kyc-material__title { color: #333333; font-size: 28rpx; font-weight: 600; }
.kyc-material__photos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; margin-top: 18rpx; }
.kyc-material__photo { width: 100%; height: 180rpx; border-radius: 14rpx; background: #edf1f6; }
.agreement-row { display: flex; align-items: center; gap: 14rpx; margin-top: 22rpx; color: #666666; font-size: 24rpx; line-height: 34rpx; }
.submit-btn { margin-top: 30rpx; height: 88rpx; color: #ffffff; background: linear-gradient(135deg, #a0610d, #c8872e); border-radius: 44rpx; font-size: 30rpx; box-shadow: 0 14rpx 28rpx rgba(160, 97, 13, .22); }
.history { padding: 14rpx; }
.history-title { margin-bottom: 8rpx; color: #1f2937; font-size: 26rpx; font-weight: 700; }
.history-item { position: relative; padding: 10rpx 12rpx 10rpx 18rpx; border: 1rpx solid #edf1f6; border-radius: 12rpx; background: #fbfcff; box-sizing: border-box; overflow: hidden; }
.history-item + .history-item { margin-top: 6rpx; }
.history-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5rpx; background: #c9d4e5; }
.history-main { min-width: 0; }
.history-row { display: flex; align-items: center; justify-content: space-between; gap: 10rpx; }
.history-role { color: #1f2937; font-size: 24rpx; font-weight: 700; line-height: 32rpx; }
.history-meta { display: flex; flex-wrap: wrap; gap: 2rpx 12rpx; margin-top: 2rpx; color: #667085; font-size: 19rpx; line-height: 26rpx; }
.history-detail { display: flex; flex-wrap: wrap; gap: 0 12rpx; margin-top: 4rpx; padding: 0; border-radius: 0; background: transparent; }
.history-detail__item { min-width: 0; }
.history-detail__label { display: inline; color: #98a2b3; font-size: 19rpx; line-height: 26rpx; }
.history-detail__label::after { content: '：'; }
.history-detail__value { display: inline; color: #1f2937; font-size: 20rpx; line-height: 26rpx; word-break: break-all; }
.history-info { margin-top: 2rpx; color: #8a96a6; font-size: 19rpx; line-height: 26rpx; }
.history-desc { margin-top: 4rpx; padding: 6rpx 8rpx; border-radius: 8rpx; color: #c2410c; background: #fff7ed; font-size: 19rpx; line-height: 28rpx; }
.history-desc--approved { color: #10a66a; background: rgba(16, 166, 106, .08); }
.history-desc__label { display: inline; font-weight: 700; line-height: 28rpx; }
.history-desc__label::after { content: '：'; }
.history-desc__value { display: inline; line-height: 28rpx; word-break: break-all; }
.history-status { flex: none; padding: 3rpx 10rpx; border-radius: 999rpx; color: #a0610d; background: rgba(160, 97, 13, .1); font-size: 19rpx; font-weight: 600; line-height: 26rpx; }
.history-status--deposit { color: #d48806; background: rgba(250, 173, 20, .14); }
.history-status--pending { color: #a0610d; background: rgba(160, 97, 13, .12); }
.history-status--approved { color: #10a66a; background: rgba(16, 166, 106, .12); }
.history-status--rejected { color: #e34d59; background: rgba(227, 77, 89, .12); }
.history-status--cancelled { color: #7a7f8a; background: rgba(122, 127, 138, .12); }
.agreement-modal { position: fixed; inset: 0; z-index: 99; }
.agreement-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, .55); }
.agreement-sheet { position: absolute; left: 34rpx; right: 34rpx; top: 12vh; padding: 30rpx; border-radius: 28rpx; background: #ffffff; box-sizing: border-box; }
.agreement-title { color: #222222; font-size: 34rpx; font-weight: 700; text-align: center; }
.agreement-content { height: 520rpx; margin-top: 24rpx; padding: 22rpx; border-radius: 18rpx; background: #f7f9fc; color: #555555; font-size: 26rpx; line-height: 42rpx; box-sizing: border-box; }
.agreement-btn { margin-top: 24rpx; height: 78rpx; border-radius: 39rpx; color: #ffffff; background: #a0610d; font-size: 28rpx; line-height: 78rpx; }
.agreement-btn--disabled { background: #c7d0dc; }

@media screen and (max-width: 360px) {
    .promoter-page { padding-left: 18rpx; padding-right: 18rpx; }
    .header, .form-card, .status-card, .focus-card, .info-card, .action-card, .history, .empty-state { padding-left: 22rpx; padding-right: 22rpx; }
    .promoter-nav { margin-left: 0; margin-right: 0; }
    .role-apply-card { width: 100%; }
    .title-row, .status-card, .kyc-gate, .apply-entry { align-items: flex-start; flex-direction: column; }
    .status-value, .kyc-gate__btn, .apply-entry__btn { align-self: flex-start; }
    .status-pending-flow { width: 100%; box-sizing: border-box; overflow-x: auto; }
    .role-select__grid { grid-template-columns: 1fr; }
    .role-select__option { min-height: 112rpx; }
    .focus-card, .action-buttons { flex-direction: column; }
    .role-apply-card__top { flex-direction: column; }
    .role-apply-card__status { align-self: flex-start; }
    .form-item { align-items: flex-start; flex-direction: column; }
    .label { width: auto; margin-bottom: 8rpx; }
    input, .picker-value { width: 100%; text-align: left; }
    .kyc-material__photos { grid-template-columns: 1fr; }
}
</style>
