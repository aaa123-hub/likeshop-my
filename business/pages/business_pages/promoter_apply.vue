<template>
    <view class="promoter-page">
        <navbar title="成为推广者" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>
        <view class="header">
            <view class="eyebrow">角色申请</view>
            <view class="title">成为推广者</view>
            <view class="subtitle">按后端返回的角色、申请记录和审核状态展示，申请后等待平台审核。</view>
        </view>

        <view class="role-card" v-if="currentRoles.length">
            <view class="card-head">
                <view>
                    <view class="card-title">当前角色</view>
                    <view class="card-subtitle">已开通角色会优先展示</view>
                </view>
                <view class="card-count">{{ currentRoles.length }}个</view>
            </view>
            <view class="role-list">
                <view :class="['role-chip', item.roleCode === selectedRoleCode ? 'role-chip--active' : '']" v-for="item in currentRoles" :key="item.roleCode" @tap="selectRole(item.roleCode)">
                    <text class="role-chip__name">{{ roleLabel(item.roleCode) }}</text>
                    <text class="role-chip__meta" v-if="item.areaName">{{ item.areaName }}</text>
                </view>
            </view>
        </view>

        <view class="empty-state" v-else-if="!applications.length && !shouldShowForm">
            <view class="empty-state__title">还没有角色</view>
            <view class="empty-state__desc">可以先选择角色提交申请，审核通过后会展示角色标识。</view>
            <view class="empty-state__btn" @tap="showApplyForm = true">去申请</view>
        </view>

        <view :class="['status-card', 'status-card--' + currentStatusType]" v-if="currentApplication">
            <view>
                <view class="status-title">{{ roleLabel(currentApplication.roleCode) }}</view>
                <view class="status-desc">{{ currentStatusDesc }}</view>
                <view class="status-desc" v-if="currentApplication.auditRemark">{{ currentApplication.auditRemark }}</view>
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
            <view class="action-desc">{{ currentActionDesc }}</view>
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
            <view class="form-desc">请填写真实信息，具体审核要求以后端规则为准。</view>
            <view class="form-item">
                <text class="label">申请角色</text>
                <picker :range="roleOptions" range-key="label" :value="roleIndex" @change="onRoleChange">
                    <view class="picker-value">{{ roleOptions[roleIndex].label }}</view>
                </picker>
            </view>
            <view class="form-item">
                <text class="label">姓名</text>
                <input v-model="form.applicantName" placeholder="请输入真实姓名" />
            </view>
            <view class="form-item">
                <text class="label">手机号</text>
                <input v-model="form.mobile" type="number" placeholder="请输入手机号" />
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
            <view class="form-item">
                <text class="label">省份编码</text>
                <input v-model="form.provinceCode" placeholder="选填，用于渠道区域审核" />
            </view>
            <view class="form-item">
                <text class="label">城市编码</text>
                <input v-model="form.cityCode" placeholder="选填，用于渠道区域审核" />
            </view>
            <view class="form-item">
                <text class="label">区县编码</text>
                <input v-model="form.districtCode" placeholder="选填，用于渠道区域审核" />
            </view>
            <view class="form-item form-item--textarea">
                <text class="label">申请说明</text>
                <textarea v-model="form.remark" placeholder="可填写推广资源、经营区域等信息" />
            </view>
            <view class="form-item form-item--textarea">
                <text class="label">材料链接</text>
                <textarea v-model="form.materialUrlsText" placeholder="选填，多个材料链接用换行或逗号分隔" />
            </view>
            <view class="agreement-row" @tap="form.agreementAccepted = !form.agreementAccepted">
                <checkbox :checked="form.agreementAccepted"></checkbox>
                <text>我确认提交资料真实有效，并同意平台审核规则</text>
            </view>
        </view>

        <button class="submit-btn" v-if="shouldShowForm" :loading="submitting" @tap="submitApply">{{ currentApplication ? '重新提交申请' : '提交申请' }}</button>

        <view class="history" v-if="applications.length">
            <view class="history-title">申请记录</view>
            <view v-for="item in applications" :key="item.applicationNo" class="history-item">
                <view>
                    <view class="history-role">{{ roleLabel(item.roleCode) }}</view>
                    <view class="history-time">{{ item.appliedAt || item.createdAt || '' }}</view>
                    <view class="history-desc" v-if="item.auditRemark">{{ item.auditRemark }}</view>
                </view>
                <view :class="['history-status', 'history-status--' + statusType(item.applicationStatus)]">{{ statusLabel(item.applicationStatus) }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@/components/navbar/navbar.vue'
import { applyRoleApplication, getRoleApplications, getRoles } from '@/api/user'

const roleOptions = [
    { label: '推广者', value: 'PROMOTER' },
    { label: '总部', value: 'HEADQUARTERS' },
    { label: '子公司', value: 'SUBSIDIARY' },
    { label: '区域代理', value: 'OPERATION_CENTER' },
    { label: '商家', value: 'MERCHANT' }
]

export default {
    components: {
        Navbar
    },
    data() {
        return {
            roleOptions,
            roleIndex: 0,
            roles: [],
            applications: [],
            form: {
                applicantName: '',
                mobile: '',
                username: '',
                password: '',
                confirmPassword: '',
                provinceCode: '',
                cityCode: '',
                districtCode: '',
                remark: '',
                materialUrlsText: '',
                agreementAccepted: true
            },
            showApplyForm: false,
            submitting: false
        }
    },
    computed: {
        ...mapGetters(['userInfo', 'isLogin', 'inviteCode']),
        currentApplication() {
            const item = this.applications.find((item) => item.roleCode === this.selectedRoleCode)
            return item ? this.withPromoterCode(item) : null
        },
        currentRoles() {
            const roles = this.roles.length ? this.roles : this.applications.filter((item) => this.statusType(item.applicationStatus) === 'approved')
            return roles.map(this.withPromoterCode)
        },
        promoterInviteCode() {
            return this.userInfo.promoter_code || this.userInfo.promoterCode || this.userInfo.distribution_code || this.userInfo.distributionCode || this.inviteCode || ''
        },
        selectedRoleCode() {
            return this.roleOptions[this.roleIndex].value
        },
        currentStatusType() {
            return this.statusType(this.currentApplication && this.currentApplication.applicationStatus)
        },
        currentStatusDesc() {
            if (this.currentStatusType === 'approved') return '当前角色已生效，可查看对应角色能力和入口。'
            const descMap = {
                deposit: '资料已提交，请按平台要求完成押金缴纳。',
                pending: '申请正在审核中，请保持手机号畅通。',
                approved: '审核已通过，可使用登录账号进入渠道后台。',
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
                    { label: '登录账号', value: item.username },
                    { label: '推广码', value: item.inviteCode || item.promoterCode || this.promoterInviteCode },
                    { label: '通过时间', value: item.auditTime }
                ].filter((info) => info.value)
            }
            if (status === 'rejected') {
                return [
                    { label: '拒绝原因', value: item.auditRemark || '请联系平台获取具体原因' },
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
                { label: '登录账号', value: item.username },
                { label: '申请区域', value: this.areaText(item) },
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
            return this.currentStatusType !== 'approved' && (!this.currentApplication || this.showApplyForm)
        },
        currentActionDesc() {
            if (this.currentStatusType === 'approved') return '当前角色已开通，可使用后端返回的角色信息。'
            const descMap = {
                deposit: '当前申请已进入押金缴纳环节，完成缴纳后继续等待审核。',
                pending: '申请正在审核中，暂时无需重复提交资料。',
                approved: '申请已通过，请使用审核通过后的账号进入渠道后台。',
                rejected: '申请未通过，可根据审核意见修改资料后重新提交。',
                cancelled: '申请已取消，如需继续成为推广者可重新提交资料。'
            }
            return descMap[this.currentStatusType] || '请根据当前状态继续处理。'
        },
        statusActions() {
            const status = this.currentStatusType
            if (status === 'approved') {
                return [{ type: 'backend', label: '进入渠道后台', primary: true }]
            }
            if (status === 'rejected' || status === 'cancelled') {
                return [{ type: 'reapply', label: '重新申请', primary: true }]
            }
            if (status === 'pending') {
                return [{ type: 'refresh', label: '刷新审核状态', primary: false }]
            }
            return []
        }
    },
    onLoad() {
        this.form.applicantName = this.userInfo.nickname || this.userInfo.realName || ''
        this.form.mobile = this.userInfo.mobile || ''
        this.loadPageData()
    },
    methods: {
        async loadPageData() {
            await Promise.all([this.loadApplications(), this.loadRoles()])
            this.mergeRoleOptions()
            this.syncSelectedRole()
        },
        async loadRoles() {
            const res = await getRoles().catch(() => null)
            if (res && res.code == 1) {
                const data = res.data || {}
                this.roles = data.roles || data.list || []
            }
        },
        async loadApplications() {
            const res = await getRoleApplications()
            if (res.code == 1) {
                const data = res.data || {}
                this.applications = data.applications || []
            }
        },
        syncSelectedRole() {
            const roleCode = (this.currentRoles[0] && this.currentRoles[0].roleCode) || (this.applications[0] && this.applications[0].roleCode)
            if (!roleCode) return
            this.selectRole(roleCode)
        },
        mergeRoleOptions() {
            const source = this.applications
            source.forEach((item) => {
                if (!item.roleCode || this.roleOptions.some((role) => role.value === item.roleCode)) return
                this.roleOptions.push({ label: item.roleName || item.roleCode, value: item.roleCode })
            })
        },
        withPromoterCode(item = {}) {
            if (String(item.roleCode || item.role_code || item.role || '').toUpperCase() !== 'PROMOTER') return item
            const code = item.inviteCode || item.invite_code || item.promoterCode || item.promoter_code || this.promoterInviteCode
            return {
                ...item,
                inviteCode: code,
                promoterCode: code
            }
        },
        selectRole(roleCode) {
            const index = this.roleOptions.findIndex((item) => item.value === roleCode)
            if (index !== -1) {
                this.roleIndex = index
                this.showApplyForm = false
            }
        },
        onRoleChange(event) {
            this.roleIndex = Number(event.detail.value || 0)
            this.showApplyForm = false
        },
        roleLabel(roleCode) {
            const role = roleOptions.find((item) => item.value === roleCode)
            if (role) return role.label
            const currentRole = this.currentRoles.find((item) => item.roleCode === roleCode)
            return (currentRole && currentRole.roleName) || roleCode
        },
        statusType(status) {
            const normalized = String(status || '').toUpperCase()
            if (['PENDING_DEPOSIT'].includes(normalized)) return 'deposit'
            if (['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING'].includes(normalized)) return 'pending'
            if (['APPROVED', 'PASS', 'PASSED', 'SUCCESS'].includes(normalized)) return 'approved'
            if (['REJECTED', 'REJECT', 'FAILED'].includes(normalized)) return 'rejected'
            if (['CANCELLED'].includes(normalized)) return 'cancelled'
            return 'default'
        },
        statusLabel(status) {
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
                SUCCESS: '已通过',
                FAILED: '已拒绝'
            }
            return map[status] || status || '未申请'
        },
        depositStatusLabel(status) {
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
            return map[status] || status || ''
        },
        moneyText(value) {
            if (value === '' || value === null || value === undefined) return ''
            return `¥${value}`
        },
        areaText(item = {}) {
            const province = item.provinceName || item.provinceCode || ''
            const city = item.cityName || item.cityCode || ''
            const district = item.districtName || item.districtCode || ''
            return [province, city, district].filter(Boolean).join(' / ')
        },
        handleStatusAction(type) {
            if (type === 'reapply') {
                this.prefillForm(this.currentApplication || {})
                this.showApplyForm = true
                return
            }
            if (type === 'refresh') {
                this.loadPageData()
                uni.showToast({ title: '状态已刷新', icon: 'none' })
                return
            }
            if (type === 'deposit') {
                uni.showToast({ title: '请按后端返回流程继续处理', icon: 'none' })
                return
            }
            if (type === 'backend') {
                const url = this.currentApplication && this.currentApplication.backendUrl
                if (url) {
                    uni.navigateTo({ url })
                    return
                }
                uni.showToast({ title: '请使用渠道后台入口登录', icon: 'none' })
            }
        },
        prefillForm(application = {}) {
            this.form.applicantName = application.applicantName || this.form.applicantName
            this.form.mobile = application.mobile || this.form.mobile
            this.form.username = application.username || this.form.username
            this.form.provinceCode = application.provinceCode || this.form.provinceCode
            this.form.cityCode = application.cityCode || this.form.cityCode
            this.form.districtCode = application.districtCode || this.form.districtCode
            this.form.remark = application.remark || this.form.remark
            this.form.materialUrlsText = Array.isArray(application.materialUrls) ? application.materialUrls.join('\n') : (application.materialUrls || this.form.materialUrlsText)
            this.form.password = ''
            this.form.confirmPassword = ''
        },
        validateForm() {
            if (!this.form.applicantName.trim() || !this.form.mobile.trim()) {
                uni.showToast({ title: '请填写姓名和手机号', icon: 'none' })
                return false
            }
            if (!this.form.username.trim()) {
                uni.showToast({ title: '请填写登录账号', icon: 'none' })
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
            if (!this.form.agreementAccepted) {
                uni.showToast({ title: '请先确认并同意审核规则', icon: 'none' })
                return false
            }
            return true
        },
        materialUrls() {
            return String(this.form.materialUrlsText || '').split(/[\n,，]/).map(item => item.trim()).filter(Boolean)
        },
        async submitApply() {
            if (!this.validateForm()) return
            this.submitting = true
            try {
                const roleCode = this.roleOptions[this.roleIndex].value
                const res = await applyRoleApplication({ ...this.form, roleCode, materialUrls: this.materialUrls(), realnameVerified: this.userInfo.realnameVerified || this.userInfo.realname_verified })
                if (res.code == 1) {
                    uni.showToast({ title: '申请已提交', icon: 'success' })
                    this.showApplyForm = false
                    await this.loadPageData()
                } else {
                    uni.showToast({ title: res.msg || res.message || '提交失败', icon: 'none' })
                }
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>

<style lang="scss">
.promoter-page { min-height: 100vh; padding: 24rpx 24rpx 48rpx; background: linear-gradient(180deg, #eef7ff 0%, #f6f7fb 360rpx, #f6f7fb 100%); box-sizing: border-box; }
.header { padding: 34rpx 30rpx; border-radius: 28rpx; color: #ffffff; background: linear-gradient(135deg, #176bff 0%, #18c59f 100%); box-shadow: 0 18rpx 42rpx rgba(22, 136, 255, .2); }
.eyebrow { display: inline-flex; padding: 6rpx 16rpx; border-radius: 999rpx; color: rgba(255, 255, 255, .92); background: rgba(255, 255, 255, .18); font-size: 22rpx; line-height: 30rpx; }
.title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.subtitle { margin-top: 12rpx; font-size: 26rpx; line-height: 38rpx; opacity: .92; }
.role-card, .status-card, .focus-card, .info-card, .action-card, .form-card, .history, .empty-state { margin-top: 22rpx; padding: 26rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08); }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.card-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.card-subtitle { margin-top: 6rpx; color: #888888; font-size: 23rpx; }
.card-count { flex: none; padding: 8rpx 16rpx; border-radius: 999rpx; color: #1688ff; background: #eef7ff; font-size: 23rpx; }
.role-list { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 18rpx; }
.role-chip { min-width: 150rpx; padding: 16rpx 20rpx; border-radius: 20rpx; border: 1rpx solid #e6eaf0; background: #f7f9fc; box-sizing: border-box; }
.role-chip--active { border-color: #1688ff; background: #eef7ff; }
.role-chip__name { display: block; color: #222222; font-size: 27rpx; font-weight: 600; }
.role-chip__meta { display: block; margin-top: 6rpx; color: #888888; font-size: 22rpx; }
.empty-state { text-align: center; }
.empty-state__title { color: #222222; font-size: 30rpx; font-weight: 600; }
.empty-state__desc { margin-top: 10rpx; color: #777777; font-size: 25rpx; line-height: 38rpx; }
.empty-state__btn { display: inline-flex; align-items: center; justify-content: center; margin-top: 22rpx; height: 68rpx; padding: 0 36rpx; border-radius: 34rpx; color: #ffffff; background: linear-gradient(135deg, #1688ff, #03a6ff); font-size: 27rpx; }
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
.form-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.form-desc { margin-top: 8rpx; margin-bottom: 10rpx; color: #888888; font-size: 24rpx; line-height: 36rpx; }
.form-item { display: flex; align-items: center; min-height: 92rpx; border-bottom: 1rpx solid #f0f1f3; }
.form-item:last-child { border-bottom: 0; }
.form-item--textarea { align-items: flex-start; padding-top: 26rpx; }
.label { flex: none; width: 160rpx; color: #333333; font-size: 28rpx; }
input, textarea, .picker-value { flex: 1; min-width: 0; color: #222222; font-size: 28rpx; }
textarea { height: 150rpx; line-height: 40rpx; }
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
</style>
