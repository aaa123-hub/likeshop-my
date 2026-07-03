<template>
    <view class="promoter-page">
        <navbar title="成为推广者" :background="{ background: '#ffffff' }" title-color="#222222"></navbar>
        <view class="header">
            <view class="title">成为推广者</view>
            <view class="subtitle">填写资料并设置渠道后台登录账号，提交后由总代理或运营人员审核。</view>
        </view>

        <view class="status-card" v-if="currentApplication">
            <view>
                <view class="status-title">{{ roleLabel(currentApplication.roleCode) }}</view>
                <view class="status-desc" v-if="currentApplication.auditRemark">{{ currentApplication.auditRemark }}</view>
            </view>
            <view class="status-value">{{ statusLabel(currentApplication.applicationStatus) }}</view>
        </view>

        <view class="form-card">
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
        </view>

        <button class="submit-btn" :loading="submitting" @tap="submitApply">提交申请</button>

        <view class="history" v-if="applications.length">
            <view class="history-title">申请记录</view>
            <view v-for="item in applications" :key="item.applicationNo" class="history-item">
                <view>
                    <view class="history-role">{{ roleLabel(item.roleCode) }}</view>
                    <view class="history-time">{{ item.appliedAt || item.createdAt || '' }}</view>
                </view>
                <view class="history-status">{{ statusLabel(item.applicationStatus) }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@/components/navbar/navbar.vue'
import { applyRoleApplication, getRoleApplications } from '@/api/user'

const roleOptions = [
    { label: '推广者', value: 'PROMOTER' },
    { label: '渠道代理', value: 'SUBSIDIARY' },
    { label: '区代理', value: 'OPERATION_CENTER' }
]

export default {
    components: {
        Navbar
    },
    data() {
        return {
            roleOptions,
            roleIndex: 0,
            applications: [],
            form: {
                applicantName: '',
                mobile: '',
                username: '',
                password: '',
                confirmPassword: '',
                cityCode: '',
                districtCode: '',
                remark: ''
            },
            submitting: false
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        currentApplication() {
            const roleCode = this.roleOptions[this.roleIndex].value
            return this.applications.find((item) => item.roleCode === roleCode)
        }
    },
    onLoad() {
        this.form.applicantName = this.userInfo.nickname || this.userInfo.realName || ''
        this.form.mobile = this.userInfo.mobile || ''
        this.loadApplications()
    },
    methods: {
        async loadApplications() {
            const res = await getRoleApplications()
            if (res.code == 1) {
                const data = res.data || {}
                this.applications = data.applications || []
            }
        },
        onRoleChange(event) {
            this.roleIndex = Number(event.detail.value || 0)
        },
        roleLabel(roleCode) {
            const role = roleOptions.find((item) => item.value === roleCode)
            return role ? role.label : roleCode
        },
        statusLabel(status) {
            const map = {
                PENDING_DEPOSIT: '待缴押金',
                PENDING_AUDIT: '待审核',
                APPROVED: '已通过',
                REJECTED: '已拒绝',
                CANCELLED: '已取消'
            }
            return map[status] || status || '未申请'
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
            return true
        },
        async submitApply() {
            if (!this.validateForm()) return
            this.submitting = true
            try {
                const roleCode = this.roleOptions[this.roleIndex].value
                const res = await applyRoleApplication({ ...this.form, roleCode })
                if (res.code == 1) {
                    uni.showToast({ title: '申请已提交', icon: 'success' })
                    await this.loadApplications()
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
.header { padding: 30rpx 28rpx; border-radius: 24rpx; color: #ffffff; background: linear-gradient(135deg, #1688ff, #20c997); box-shadow: 0 18rpx 42rpx rgba(22, 136, 255, .18); }
.title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.subtitle { margin-top: 12rpx; font-size: 26rpx; line-height: 38rpx; opacity: .92; }
.status-card, .form-card, .history { margin-top: 22rpx; padding: 26rpx; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31, 58, 94, .08); }
.status-card { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.status-title { color: #222222; font-size: 30rpx; font-weight: 600; }
.status-value { flex: none; color: #1688ff; font-size: 26rpx; }
.status-desc { margin-top: 6rpx; color: #999999; font-size: 24rpx; }
.form-item { display: flex; align-items: center; min-height: 92rpx; border-bottom: 1rpx solid #f0f1f3; }
.form-item:last-child { border-bottom: 0; }
.form-item--textarea { align-items: flex-start; padding-top: 26rpx; }
.label { flex: none; width: 160rpx; color: #333333; font-size: 28rpx; }
input, textarea, .picker-value { flex: 1; min-width: 0; color: #222222; font-size: 28rpx; }
textarea { height: 150rpx; line-height: 40rpx; }
.submit-btn { margin-top: 30rpx; height: 88rpx; color: #ffffff; background: linear-gradient(135deg, #1688ff, #03a6ff); border-radius: 44rpx; font-size: 30rpx; box-shadow: 0 14rpx 28rpx rgba(22, 136, 255, .22); }
.history-title { margin-bottom: 16rpx; color: #222222; font-size: 30rpx; font-weight: 600; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 18rpx 0; border-top: 1rpx solid #f0f1f3; }
.history-role { color: #222222; font-size: 28rpx; }
.history-time { margin-top: 6rpx; color: #999999; font-size: 22rpx; }
.history-status { color: #1688ff; font-size: 26rpx; }
</style>
