<template>
    <view class="license-page">
        <view class="license-bg"></view>
        <navbar title="商家入驻" :background="{ background: 'transparent' }" title-color="#ffffff"></navbar>

        <view class="license-hero">
            <view class="license-hero__title">商家入驻申请</view>
            <view class="license-hero__desc">提交主体、证照、店铺和微信商户号，审核通过后开通商家后台权限。</view>
        </view>

        <view class="status-card" v-if="!kycApproved && !kycRedirecting">
            <view class="status-card__head">
                <view>
                    <view class="status-card__label">实名认证</view>
                    <view class="status-card__value status-card__value--danger">{{ kycStatusText }}</view>
                </view>
                <view class="status-pill status-pill--danger">需先实名</view>
            </view>
            <view class="status-card__remark">只有实名认证审核通过后，才能提交商家入驻申请。</view>
            <view class="kyc-action" @tap="goKyc">去实名认证</view>
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
        </view>

        <view class="approved-card" v-if="isApproved">
            <view class="approved-card__title">商家入驻已通过</view>
            <view class="approved-card__row"><text>商户名称</text><text>{{ form.merchantName || '-' }}</text></view>
            <view class="approved-card__row"><text>店铺名称</text><text>{{ form.shopName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系人</text><text>{{ form.contactName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系电话</text><text>{{ form.contactMobile || '-' }}</text></view>
            <view class="approved-card__row"><text>经营类型</text><text>{{ merchantTypeLabel }}</text></view>
            <view class="approved-card__row"><text>微信商户号</text><text>{{ maskedWechatMerchantNo }}</text></view>
            <view class="approved-card__row approved-card__row--address"><text>经营地址</text><text>{{ fullAddressText || '-' }}</text></view>
        </view>

        <view v-if="!isApproved && kycApproved" class="license-form">
            <view class="form-section" v-if="requiresAccountCredentials || readonlyBackendUsername">
                <view class="form-section__title">后台账号</view>
                <view class="form-section__desc">
                    {{ readonlyBackendUsername ? '当前小程序账号已绑定后台账号，本次申请将复用已有账号。' : '首次申请商家需要设置后台管理系统登录账号。' }}
                </view>
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

            <view class="account-tip" v-else>当前账号已绑定后台账号，本次申请将复用已有账号，无需重新填写登录账号和密码。</view>

            <view class="form-section">
                <view class="form-section__title">主体信息</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">商户名称</text>
                        <input class="form-input" v-model="form.merchantName" placeholder="请输入营业执照主体名称" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--picker">
                        <text class="form-label required">商户类型</text>
                        <picker class="form-picker-wrap" mode="selector" :range="merchantTypeOptions" range-key="label" :value="merchantTypeIndex" @change="onMerchantTypeChange">
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
                    <view class="form-row form-row--wide">
                        <text class="form-label form-label--long required">统一社会信用代码</text>
                        <input class="form-input" v-model="form.licenseNo" placeholder="请输入营业执照编号" placeholder-class="form-placeholder" />
                    </view>
                </view>
                <view class="upload-grid">
                    <view v-for="item in requiredUploadItems" :key="item.field" class="upload-item">
                        <view class="upload-item__title"><text class="upload-item__required">*</text>{{ item.title }}</view>
                        <view class="upload-item__box" @tap="chooseImage(item.field)">
                            <image v-if="form[item.field]" class="upload-item__image" :src="form[item.field]" mode="aspectFit"></image>
                            <view v-else class="upload-item__empty">
                                <view class="upload-item__plus">+</view>
                                <view class="upload-item__tip">上传图片</view>
                            </view>
                            <view v-if="form[item.field]" class="upload-item__remove" @tap.stop="removeImage(item.field)">×</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">店铺与收款</view>
                <view class="form-section__desc">请补充店铺展示资料，平台审核通过后会同步到后台店铺详情。</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">店铺名称</text>
                        <input class="form-input" v-model="form.shopName" placeholder="请输入店铺展示名称" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--picker">
                        <text class="form-label required">行业分类</text>
                        <picker class="form-picker-wrap" mode="selector" :range="industryOptions" range-key="label" :value="industryIndex" @change="onIndustryChange">
                            <view class="form-picker">{{ industryLabel }}</view>
                        </picker>
                    </view>
                    <view class="form-row">
                        <text class="form-label">营业时间</text>
                        <input class="form-input" v-model="form.businessHours" placeholder="例如 09:00-22:00" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide form-row--textarea">
                        <text class="form-label">店铺简介</text>
                        <textarea class="form-textarea" v-model="form.shopDescription" placeholder="请输入店铺介绍、主营业务或服务特色" placeholder-class="form-placeholder" />
                    </view>
                </view>

                <view class="shop-media-card">
                    <view class="shop-media-card__head">
                        <view>
                            <view class="shop-media-card__title">店铺展示资料</view>
                            <view class="shop-media-card__desc">店铺 Logo 和门店照片为必填，审核端会用这些资料查看店铺详情。</view>
                        </view>
                        <view class="shop-media-card__badge">必填</view>
                    </view>
                    <view class="upload-grid upload-grid--shop">
                        <view class="upload-item">
                            <view class="upload-item__title"><text class="upload-item__required">*</text>店铺 Logo</view>
                            <view class="upload-item__box" @tap="chooseImage('shopLogoUrl')">
                                <image v-if="form.shopLogoUrl" class="upload-item__image" :src="form.shopLogoUrl" mode="aspectFit"></image>
                                <view v-else class="upload-item__empty"><view class="upload-item__plus">+</view><view class="upload-item__tip">上传 Logo</view></view>
                                <view v-if="form.shopLogoUrl" class="upload-item__remove" @tap.stop="removeImage('shopLogoUrl')">×</view>
                            </view>
                        </view>
                        <view v-for="(url, index) in form.shopImageUrls" :key="url + index" class="upload-item">
                            <view class="upload-item__title">门店照片 {{ index + 1 }}</view>
                            <view class="upload-item__box">
                                <image class="upload-item__image" :src="url" mode="aspectFit"></image>
                                <view class="upload-item__remove" @tap.stop="removeShopImage(index)">×</view>
                            </view>
                        </view>
                        <view class="qualification-add qualification-add--shop" v-if="form.shopImageUrls.length < 6" @tap="chooseShopImages">
                            <view class="qualification-add__inner"><view class="qualification-add__plus">+</view><view class="qualification-add__text">上传门店照片</view></view>
                        </view>
                    </view>
                    <view class="shop-media-card__tip">至少上传 1 张门店照片，最多 6 张。</view>
                </view>

                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">微信商户号</text>
                        <input class="form-input" v-model="form.wechatMerchantNo" type="number" placeholder="请输入微信支付商户号" placeholder-class="form-placeholder" />
                    </view>
                    <picker
                        class="form-row form-row--wide form-row--picker"
                        mode="multiSelector"
                        :range="regionPickerColumns"
                        range-key="label"
                        :value="regionPickerValue"
                        @columnchange="onRegionColumnChange"
                        @change="onRegionConfirm"
                    >
                        <view>
                            <text class="form-label required">经营区域</text>
                            <view :class="['form-picker', selectedRegionText ? '' : 'form-picker--placeholder']">
                                {{ selectedRegionText || (regionOptions.length ? '请选择省 / 市 / 区' : '区域数据加载中') }}
                            </view>
                        </view>
                    </picker>
                    <view class="form-row form-row--wide">
                        <text class="form-label required">详细地址</text>
                        <input class="form-input" v-model="form.detailAddress" placeholder="请输入省市区及详细地址" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide">
                        <view class="map-picker">
                            <view class="map-picker__main">
                                <text class="form-label required">店铺地图位置</text>
                                <view :class="['map-picker__value', hasShopLocation ? '' : 'map-picker__value--placeholder']">
                                    {{ shopLocationText || '请选择店铺所在位置' }}
                                </view>
                                <view class="map-picker__coord" v-if="hasShopLocation">
                                    经度 {{ form.longitude }} / 纬度 {{ form.latitude }}
                                </view>
                            </view>
                            <view class="map-picker__btn" @tap="chooseShopLocation">{{ hasShopLocation ? '重新选择' : '地图选点' }}</view>
                        </view>
                    </view>
                </view>

                <view class="form-section__subtitle">店铺视频</view>
                <view class="video-list">
                    <view v-for="(url, index) in form.shopVideoUrls" :key="url + index" class="video-item">
                        <text class="video-item__text">{{ url }}</text>
                        <text class="video-item__remove" @tap="removeShopVideo(index)">删除</text>
                    </view>
                    <view class="video-add" v-if="form.shopVideoUrls.length < 3" @tap="chooseShopVideos">上传店铺视频</view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">行业资质</view>
                <view class="form-section__desc">食品经营许可证、行业许可或其他补充材料，可上传多张。</view>
                <view class="qualification-list">
                    <view v-for="(url, index) in form.qualificationUrls" :key="url + index" class="qualification-item">
                        <image class="qualification-item__image" :src="url" mode="aspectFit"></image>
                        <view class="qualification-item__remove" @tap="removeQualification(index)">×</view>
                    </view>
                    <view class="qualification-add" @tap="chooseQualification">
                        <view class="qualification-add__inner"><view class="qualification-add__plus">+</view><view class="qualification-add__text">上传资质</view></view>
                    </view>
                </view>
            </view>
        </view>

        <view v-if="!isApproved && kycApproved" class="submit-bar">
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
    getKycStatus,
    getOnboardingContext,
    getMerchantIndustries,
    getMiniappRegions,
    getMerchantApplicationStatus,
    resubmitMerchantApplication,
    submitMerchantApplication
} from '@/api/user'

const merchantTypeOptions = [
    { label: '企业/公司', value: 'COMPANY' },
    { label: '个体工商户', value: 'INDIVIDUAL' },
    { label: '个人经营者', value: 'PERSONAL' }
]

const defaultIndustryOptions = [
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
        const text = list.trim()
        if (!text) return []
        try {
            list = JSON.parse(text)
        } catch (error) {
            list = text.split(/[,，]/)
        }
    }
    if (!Array.isArray(list)) list = [list]
    return list.map(item => typeof item === 'string' ? item.trim() : firstValue(item.url, item.fileUrl, item.file_url, item.imageUrl, item.image_url, item.path, item.uri)).filter(Boolean)
}

function normalizeUploadUrl(res = {}) {
    return firstValue(res.url, res.fileUrl, res.file_url, res.uri, res.path, res.data && res.data.url, res.data && res.data.fileUrl, res.data && res.data.file_url, res.data && res.data.path)
}

function cloneForm(form = {}) {
    return JSON.parse(JSON.stringify(form))
}

function hasSubmittedMerchantApplication(data = {}) {
    const status = normalizeBackendCode(data.auditStatus || data.audit_status || data.applyStatus || data.apply_status || data.applicationStatus || data.application_status || data.status || '')
    return Boolean(
        data.applicationNo
        || data.application_no
        || data.merchantId
        || data.merchant_id
        || data.merchantName
        || data.merchant_name
        || data.shopName
        || data.shop_name
        || (status && status !== 'NOT_SUBMITTED')
    )
}

function normalizeRegionOptions(source = []) {
    const list = Array.isArray(source)
        ? source
        : source.tree || source.list || source.records || source.items || source.regions || source.regionOptions || source.region_options || source.children || []
    const normalized = (Array.isArray(list) ? list : []).map(item => normalizeRegionOption(item)).filter(item => item.label && item.value)
    if (normalized.length === 1 && String(normalized[0].value).toUpperCase() === 'CN' && normalized[0].children && normalized[0].children.length) {
        return normalized[0].children
    }
    return normalized
}

function normalizeRegionOption(item = {}) {
    if (typeof item === 'string') return { label: item, value: item, children: [] }
    const label = item.label || item.name || item.regionName || item.region_name || item.areaName || item.area_name || item.provinceName || item.province_name || item.cityName || item.city_name || item.districtName || item.district_name || ''
    const value = item.value || item.code || item.regionCode || item.region_code || item.areaCode || item.area_code || item.provinceCode || item.province_code || item.cityCode || item.city_code || item.districtCode || item.district_code || item.id || label
    const children = item.children || item.childList || item.child_list || item.list || item.cities || item.cityList || item.city_list || item.districts || item.districtList || item.district_list || []
    return {
        ...item,
        label,
        value,
        children: normalizeRegionOptions(children)
    }
}

export default {
    components: { Navbar },
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
                shopLogoUrl: '',
                shopImageUrls: [],
                shopVideoUrls: [],
                shopDescription: '',
                businessHours: '09:00-22:00',
                industryId: '',
                wechatMerchantNo: '',
                provinceCode: '',
                provinceName: '',
                cityCode: '',
                cityName: '',
                districtCode: '',
                districtName: '',
                detailAddress: '',
                longitude: '',
                latitude: ''
            },
            regionCodeText: '',
            regionOptions: [],
            regionPickerValue: [0, 0, 0],
            regionPickerColumns: [[], [], []],
            industryOptions: defaultIndustryOptions.map(item => ({ ...item })),
            status: {},
            kycStatus: {},
            onboardingContext: {},
            kycRedirecting: false,
            submitting: false,
            statusLoading: false,
            applyingRemoteStatus: false,
            dirtyForm: false,
            suppressNextShowReload: false,
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
        kycStatusCode() {
            return normalizeBackendCode(this.kycStatus.kycStatus || this.kycStatus.kyc_status || this.kycStatus.auditStatus || this.kycStatus.status || '')
        },
        kycApproved() {
            return ['APPROVED', 'SUCCESS', 'VERIFIED', 'PASS', 'PASSED'].includes(this.kycStatusCode)
        },
        kycStatusText() {
            const map = { PENDING_AUDIT: '审核中', PENDING: '审核中', REJECTED: '未通过', NOT_SUBMITTED: '未提交', INIT: '未提交' }
            return this.kycApproved ? '已通过' : (map[this.kycStatusCode] || '未提交')
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
                PENDING: '审核中',
                PENDING_AUDIT: '审核中',
                WAIT_AUDIT: '审核中',
                AUDITING: '审核中',
                APPROVED: '已通过',
                SUCCESS: '已通过',
                REJECTED: '未通过',
                FAILED: '未通过'
            }
            return map[this.auditStatus] || '未提交'
        },
        statusPillText() {
            if (this.isApproved) return '审核通过'
            if (this.isRejected) return '请修改后重提'
            if (this.isPending) return '平台审核中'
            return '待提交'
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
        hasExistingPlatformAccount() {
            const context = this.onboardingContext || {}
            const account = context.backendAccount || context.backend_account || {}
            return Boolean(context.hasBackendAccount || context.has_backend_account || account.username || context.backendUsername || context.backend_username || this.status.username || this.status.backendUsername)
        },
        requiresAccountCredentials() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            if (hints.showBackendAccountFields === false) return false
            return !this.hasExistingPlatformAccount
        },
        requiresBackendUsername() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            if (hints.requireBackendUsername === false) return false
            return this.requiresAccountCredentials
        },
        requiresBackendPassword() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            if (hints.requireBackendPassword === false) return false
            return this.requiresAccountCredentials
        },
        readonlyBackendUsername() {
            return !this.requiresBackendUsername && Boolean(this.form.username)
        },
        maskedWechatMerchantNo() {
            const value = String(this.form.wechatMerchantNo || '')
            if (!value) return '-'
            if (value.length <= 8) return value
            return `${value.slice(0, 4)} **** ${value.slice(-4)}`
        },
        fullAddressText() {
            return [this.form.provinceName || this.form.provinceCode, this.form.cityName || this.form.cityCode, this.form.districtName || this.form.districtCode, this.form.detailAddress].filter(Boolean).join(' ')
        },
        hasShopLocation() {
            return Boolean(this.form.longitude && this.form.latitude)
        },
        shopLocationText() {
            return this.hasShopLocation ? (this.fullAddressText || '已选择店铺位置') : ''
        },
        selectedRegionText() {
            return [this.form.provinceName, this.form.cityName, this.form.districtName].filter(Boolean).join(' / ')
        }
    },
    onLoad() {
        Promise.resolve(this.$store.dispatch('getUser')).finally(() => {
            this.restoreDraft()
            this.prefillFromUser()
            this.loadInitialData()
        })
    },
    onShow() {
        if (this.kycRedirecting) return
        if (this.suppressNextShowReload) {
            this.suppressNextShowReload = false
            return
        }
        this.prefillFromUser()
        if (this.userId) this.loadInitialData()
    },
    onPullDownRefresh() {
        Promise.resolve(this.loadInitialData()).finally(() => uni.stopPullDownRefresh())
    },
    methods: {
        loadInitialData() {
            if (!this.userId) return Promise.resolve()
            return Promise.all([this.getKyc(), this.getOnboardingContext(), this.getIndustries(), this.getRegions(), this.getStatus()])
                .then(() => {
                    this.redirectToKycIfNeeded()
                })
        },
        getKyc() {
            return getKycStatus({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) {
                    this.kycStatus = res.data
                    this.applyKycToForm(res.data)
                }
            }).catch(() => {})
        },
        getOnboardingContext() {
            return getOnboardingContext({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) {
                    this.onboardingContext = res.data
                    const account = res.data.backendAccount || res.data.backend_account || {}
                    this.form.username = firstValue(res.data.backendUsername, res.data.backend_username, account.username, this.form.username)
                    this.applyKycToForm(res.data.reusableProfile || res.data.reusable_profile || res.data)
                    this.applyRegionOptions(res.data)
                }
            }).catch(() => {})
        },
        applyKycToForm(data = {}) {
            this.form.contactName = firstValue(this.form.contactName, data.realName, data.real_name, data.applicantName, data.applicant_name)
            this.form.legalPerson = firstValue(this.form.legalPerson, data.realName, data.real_name, data.applicantName, data.applicant_name)
            this.form.legalIdFrontUrl = firstValue(this.form.legalIdFrontUrl, data.certFrontUrl, data.cert_front_url)
            this.form.legalIdBackUrl = firstValue(this.form.legalIdBackUrl, data.certBackUrl, data.cert_back_url)
        },
        getIndustries() {
            return getMerchantIndustries({ show: false }).then(res => {
                const list = res.code == 1 && res.data ? (res.data.list || []) : []
                if (list.length) {
                    this.industryOptions = [
                        { label: '请选择行业分类', value: '' },
                        ...list.map(item => ({
                            label: item.label || item.name || item.industryName || item.industry_name,
                            value: item.value || item.id || item.industryId || item.industry_id || item.code || item.industryCode || item.industry_code
                        })).filter(item => item.label && item.value !== undefined && item.value !== null && item.value !== '')
                    ]
                }
            }).catch(() => {})
        },
        getRegions() {
            return getMiniappRegions({ tree: true, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyRegionOptions(res.data)
            }).catch(() => {
                this.refreshRegionColumns()
            })
        },
        applyRegionOptions(source = {}) {
            const tree = normalizeRegionOptions(source.areaOptions || source.area_options || source.regionOptions || source.region_options || source.tree || source.list || source.regions || source)
            if (tree.length) this.regionOptions = tree
            this.syncRegionPickerValueByForm()
        },
        getStatus() {
            if (this.statusLoading) return Promise.resolve()
            this.statusLoading = true
            return getMerchantApplicationStatus({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyStatusToForm(res.data)
            }).catch(() => {}).finally(() => {
                this.statusLoading = false
            })
        },
        applyStatusToForm(data = {}) {
            this.status = data
            if (!hasSubmittedMerchantApplication(data)) {
                this.restoreDraft()
                return
            }
            this.applyingRemoteStatus = true
            this.form.username = firstValue(data.backendUsername, data.backend_username, data.username, this.form.username)
            this.form.merchantName = firstValue(data.merchantName, data.merchant_name, this.form.merchantName)
            this.form.merchantType = firstValue(data.merchantType, data.merchant_type, this.form.merchantType)
            this.form.contactName = firstValue(data.contactName, data.contact_name, this.form.contactName)
            this.form.contactMobile = firstValue(data.contactMobile, data.contact_mobile, data.mobile, this.form.contactMobile)
            this.form.legalPerson = firstValue(data.legalPerson, data.legal_person, this.form.legalPerson)
            this.form.licenseNo = firstValue(data.licenseNo, data.license_no, this.form.licenseNo)
            this.form.licenseUrl = firstValue(data.licenseUrl, data.license_url, this.form.licenseUrl)
            this.form.licenseImageUrl = firstValue(data.licenseImageUrl, data.license_image_url, this.form.licenseImageUrl)
            this.form.legalIdFrontUrl = firstValue(data.legalIdFrontUrl, data.legal_id_front_url, this.form.legalIdFrontUrl)
            this.form.legalIdBackUrl = firstValue(data.legalIdBackUrl, data.legal_id_back_url, this.form.legalIdBackUrl)
            this.form.qualificationUrls = normalizeUrlList(firstValue(data.qualificationUrls, data.qualification_urls, this.form.qualificationUrls))
            this.form.shopName = firstValue(data.shopName, data.shop_name, this.form.shopName)
            this.form.shopLogoUrl = firstValue(data.shopLogoUrl, data.shop_logo_url, data.shopLogo, data.shop_logo, this.form.shopLogoUrl)
            this.form.shopImageUrls = normalizeUrlList(firstValue(data.shopImageUrls, data.shop_image_urls, this.form.shopImageUrls))
            this.form.shopVideoUrls = normalizeUrlList(firstValue(data.shopVideoUrls, data.shop_video_urls, this.form.shopVideoUrls))
            this.form.shopDescription = firstValue(data.shopDescription, data.shop_description, data.storeDescription, data.store_description, data.remark, this.form.shopDescription)
            this.form.businessHours = firstValue(data.businessHours, data.business_hours, this.form.businessHours)
            this.form.industryId = firstValue(data.industryId, data.industry_id, this.form.industryId)
            this.form.wechatMerchantNo = firstValue(data.wechatMerchantNo, data.wechat_merchant_no, data.subMchId, data.sub_mch_id, data.settlementAccountNo, data.settlement_account_no, this.form.wechatMerchantNo)
            this.form.provinceCode = firstValue(data.provinceCode, data.province_code, this.form.provinceCode)
            this.form.provinceName = firstValue(data.provinceName, data.province_name, data.province, this.form.provinceName)
            this.form.cityCode = firstValue(data.cityCode, data.city_code, this.form.cityCode)
            this.form.cityName = firstValue(data.cityName, data.city_name, data.city, this.form.cityName)
            this.form.districtCode = firstValue(data.districtCode, data.district_code, this.form.districtCode)
            this.form.districtName = firstValue(data.districtName, data.district_name, data.district, data.areaName, data.area_name, this.form.districtName)
            this.form.detailAddress = firstValue(data.detailAddress, data.detail_address, data.address, this.form.detailAddress)
            this.form.longitude = firstValue(data.longitude, data.lng, this.form.longitude)
            this.form.latitude = firstValue(data.latitude, data.lat, this.form.latitude)
            this.regionCodeText = [this.form.provinceCode, this.form.cityCode, this.form.districtCode].filter(Boolean).join('/')
            this.syncRegionPickerValueByForm()
            this.applyingRemoteStatus = false
            this.dirtyForm = false
            this.clearDraft()
        },
        draftKey() {
            return this.userId ? `merchant_application_draft_${this.userId}` : ''
        },
        saveDraft() {
            const key = this.draftKey()
            if (!key || this.isApproved || this.applyingRemoteStatus) return
            try {
                uni.setStorageSync(key, cloneForm(this.form))
                this.dirtyForm = true
            } catch (error) {}
        },
        restoreDraft() {
            const key = this.draftKey()
            if (!key || this.isApproved) return
            try {
                const draft = uni.getStorageSync(key)
                if (draft && typeof draft === 'object') {
                    this.form = {
                        ...this.form,
                        ...draft,
                        qualificationUrls: normalizeUrlList(draft.qualificationUrls),
                        shopImageUrls: normalizeUrlList(draft.shopImageUrls),
                        shopVideoUrls: normalizeUrlList(draft.shopVideoUrls)
                    }
                    this.regionCodeText = [this.form.provinceCode, this.form.cityCode, this.form.districtCode].filter(Boolean).join('/')
                    this.syncRegionPickerValueByForm()
                    this.dirtyForm = true
                }
            } catch (error) {}
        },
        clearDraft() {
            const key = this.draftKey()
            if (!key) return
            try {
                uni.removeStorageSync(key)
            } catch (error) {}
            this.dirtyForm = false
        },
        markFormDirty() {
            if (this.applyingRemoteStatus || this.isApproved) return
            this.dirtyForm = true
        },
        prefillFromUser() {
            const info = this.userInfo || {}
            this.form.contactMobile = this.form.contactMobile || info.mobile || info.phone || ''
            this.form.contactName = this.form.contactName || info.realName || info.real_name || info.nickname || ''
            this.form.legalPerson = this.form.legalPerson || info.realName || info.real_name || ''
            this.form.username = this.form.username || (this.userId ? `merchant_${this.userId}` : '')
        },
        onMerchantTypeChange(e) {
            this.form.merchantType = (this.merchantTypeOptions[Number(e.detail.value || 0)] || this.merchantTypeOptions[0]).value
            this.saveDraft()
        },
        onIndustryChange(e) {
            this.form.industryId = (this.industryOptions[Number(e.detail.value || 0)] || this.industryOptions[0]).value
            this.saveDraft()
        },
        syncRegionCodeText() {
            const parts = String(this.regionCodeText || '').split(/[\/,\s，]+/).filter(Boolean)
            this.form.provinceCode = parts[0] || this.form.provinceCode
            this.form.cityCode = parts[1] || this.form.cityCode
            this.form.districtCode = parts[2] || this.form.districtCode
            this.syncRegionPickerValueByForm()
        },
        refreshRegionColumns() {
            const provinces = this.regionOptions
            const provinceIndex = Math.min(this.regionPickerValue[0] || 0, Math.max(provinces.length - 1, 0))
            const cities = provinces[provinceIndex] && provinces[provinceIndex].children ? provinces[provinceIndex].children : []
            const cityIndex = Math.min(this.regionPickerValue[1] || 0, Math.max(cities.length - 1, 0))
            const districts = cities[cityIndex] && cities[cityIndex].children ? cities[cityIndex].children : []
            const districtIndex = Math.min(this.regionPickerValue[2] || 0, Math.max(districts.length - 1, 0))
            this.regionPickerValue = [provinceIndex, cityIndex, districtIndex]
            this.regionPickerColumns = [provinces, cities, districts]
        },
        onRegionColumnChange(e) {
            const column = Number(e.detail.column || 0)
            const value = Number(e.detail.value || 0)
            const next = this.regionPickerValue.slice()
            next[column] = value
            if (column === 0) {
                next[1] = 0
                next[2] = 0
            } else if (column === 1) {
                next[2] = 0
            }
            this.regionPickerValue = next
            this.refreshRegionColumns()
        },
        onRegionConfirm(e) {
            const value = Array.isArray(e.detail.value) ? e.detail.value : this.regionPickerValue
            this.regionPickerValue = value
            this.refreshRegionColumns()
            const province = this.regionPickerColumns[0][this.regionPickerValue[0]] || {}
            const city = this.regionPickerColumns[1][this.regionPickerValue[1]] || {}
            const district = this.regionPickerColumns[2][this.regionPickerValue[2]] || {}
            this.form.provinceCode = province.value || ''
            this.form.provinceName = province.label || ''
            this.form.cityCode = city.value || ''
            this.form.cityName = city.label || ''
            this.form.districtCode = district.value || ''
            this.form.districtName = district.label || ''
            this.regionCodeText = [this.form.provinceCode, this.form.cityCode, this.form.districtCode].filter(Boolean).join('/')
            this.saveDraft()
        },
        syncRegionPickerValueByForm() {
            const provinces = this.regionOptions
            if (!provinces.length) {
                this.refreshRegionColumns()
                return
            }
            const provinceIndex = Math.max(provinces.findIndex(item => this.regionOptionMatched(item, this.form.provinceCode, this.form.provinceName)), 0)
            const cities = provinces[provinceIndex] && provinces[provinceIndex].children ? provinces[provinceIndex].children : []
            const cityIndex = Math.max(cities.findIndex(item => this.regionOptionMatched(item, this.form.cityCode, this.form.cityName)), 0)
            const districts = cities[cityIndex] && cities[cityIndex].children ? cities[cityIndex].children : []
            const districtIndex = Math.max(districts.findIndex(item => this.regionOptionMatched(item, this.form.districtCode, this.form.districtName)), 0)
            this.regionPickerValue = [provinceIndex, cityIndex, districtIndex]
            this.refreshRegionColumns()
        },
        regionOptionMatched(item = {}, code, name) {
            return Boolean((code && String(item.value) === String(code)) || (name && item.label === name))
        },
        chooseShopLocation() {
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
                    if (address && !this.form.detailAddress) this.form.detailAddress = address
                    this.saveDraft()
                },
                fail: (error) => {
                    const message = String((error && (error.errMsg || error.message)) || '')
                    if (/cancel/i.test(message)) return
                    this.$toast({ title: '地图选点失败，请检查定位权限' })
                }
            })
        },
        formatDisplayTime(value) {
            if (!value) return ''
            if (typeof value === 'string' && /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) return value.replace(/-/g, '/').slice(0, 16)
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return String(value)
            const pad = num => String(num).padStart(2, '0')
            return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        },
        validateForm() {
            if (!this.userId) return '请先登录'
            if (!this.kycApproved) return '请先完成实名认证审核'
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
            if (!this.form.wechatMerchantNo.trim()) return '请输入微信商户号'
            if (!/^\d{8,32}$/.test(String(this.form.wechatMerchantNo || '').trim())) return '请输入正确的微信商户号'
            if (!this.form.shopLogoUrl) return '请上传店铺 Logo'
            if (!this.form.shopImageUrls.length) return '请至少上传一张门店照片'
            if (!this.form.provinceCode || !this.form.cityCode || !this.form.districtCode) return '请选择经营区域'
            if (!this.form.detailAddress.trim()) return '请输入详细地址'
            if (!this.form.longitude || !this.form.latitude) return '请选择店铺地图位置'
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
                shopDescription: this.form.shopDescription.trim(),
                industryId: Number.isNaN(industryId) ? this.form.industryId : industryId,
                wechatMerchantNo: this.form.wechatMerchantNo.trim(),
                settlementAccountNo: this.form.wechatMerchantNo.trim(),
                detailAddress: this.form.detailAddress.trim(),
                longitude: this.form.longitude,
                latitude: this.form.latitude,
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
                if (!this.kycApproved) this.goKyc()
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
                    this.clearDraft()
                } else {
                    this.$toast({ title: localizeBackendText(res.msg || res.message || '提交失败') })
                }
            }).catch(() => {
                this.$toast({ title: '提交失败，请稍后再试' })
            }).finally(() => {
                this.submitting = false
            })
        },
        chooseImage(field) {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseImage({
                count: 1,
                success: res => {
                    const file = (res.tempFiles || [])[0]
                    const path = file && (file.path || file.tempFilePath)
                    if (path) this.uploadAndSet(field, path)
                }
            })
        },
        chooseShopImages() {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseImage({
                count: Math.max(1, 6 - this.form.shopImageUrls.length),
                success: res => (res.tempFiles || []).forEach(file => {
                    const path = file.path || file.tempFilePath
                    if (path) this.uploadToList('shopImageUrls', path)
                })
            })
        },
        chooseShopVideos() {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseVideo({
                success: res => {
                    const path = res.tempFilePath || res.path
                    if (path) this.uploadToList('shopVideoUrls', path)
                },
                fail: () => {
                    this.restoreDraft()
                }
            })
        },
        chooseQualification() {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseImage({
                count: Math.max(1, 9 - this.form.qualificationUrls.length),
                success: res => (res.tempFiles || []).forEach(file => {
                    const path = file.path || file.tempFilePath
                    if (path) this.uploadToList('qualificationUrls', path)
                })
            })
        },
        uploadAndSet(field, path) {
            this.saveDraft()
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path).then(res => {
                this.form[field] = normalizeUploadUrl(res)
                if (!this.form[field]) {
                    this.restoreDraft()
                    this.$toast({ title: '上传失败' })
                    return
                }
                this.saveDraft()
            }).catch(() => {
                this.restoreDraft()
                this.$toast({ title: '上传失败' })
            }).finally(() => uni.hideLoading())
        },
        uploadToList(field, path) {
            this.saveDraft()
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path, { fileType: field === 'shopVideoUrls' ? 'video' : 'image' }).then(res => {
                const url = normalizeUploadUrl(res)
                if (!url) {
                    this.restoreDraft()
                    this.$toast({ title: '上传失败' })
                    return
                }
                this.form[field].push(url)
                this.saveDraft()
            }).catch(() => {
                this.restoreDraft()
                this.$toast({ title: '上传失败' })
            }).finally(() => uni.hideLoading())
        },
        removeImage(field) {
            this.form[field] = ''
            this.saveDraft()
        },
        removeShopImage(index) {
            this.form.shopImageUrls.splice(index, 1)
            this.saveDraft()
        },
        removeShopVideo(index) {
            this.form.shopVideoUrls.splice(index, 1)
            this.saveDraft()
        },
        removeQualification(index) {
            this.form.qualificationUrls.splice(index, 1)
            this.saveDraft()
        },
        goKyc() {
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
            if (!this.userId || this.kycApproved || this.kycRedirecting) return
            this.goKyc()
        }
    }
}
</script>

<style lang="scss">
.license-page { position: relative; min-height: 100vh; padding: 0 24rpx calc(142rpx + env(safe-area-inset-bottom)); box-sizing: border-box; background: #f5f7fb; }
.license-bg { position: absolute; left: 0; right: 0; top: 0; height: 438rpx; background: linear-gradient(135deg, #1d73f6 0%, #23b99a 100%); }
.license-hero { position: relative; z-index: 1; padding: 44rpx 0 34rpx; color: #ffffff; }
.license-hero__title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.license-hero__desc { margin-top: 10rpx; max-width: 620rpx; color: rgba(255,255,255,.9); font-size: 25rpx; line-height: 38rpx; }
.status-card, .approved-card, .form-section, .account-tip { position: relative; z-index: 1; margin-bottom: 18rpx; border-radius: 22rpx; background: #ffffff; box-shadow: 0 12rpx 34rpx rgba(31,58,94,.08); box-sizing: border-box; }
.status-card { padding: 26rpx 24rpx 24rpx; }
.status-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.status-card__label, .status-card__meta, .status-card__remark, .status-card__time { color: #667085; font-size: 23rpx; line-height: 34rpx; }
.status-card__value { margin-top: 6rpx; font-size: 34rpx; font-weight: 700; line-height: 46rpx; }
.status-pill { flex: none; max-width: 240rpx; padding: 8rpx 18rpx; border-radius: 999rpx; font-size: 23rpx; font-weight: 600; line-height: 32rpx; text-align: center; box-sizing: border-box; }
.status-pill--success { color: #0b8f5a; background: #e9fbf3; }
.status-pill--danger { color: #d92d20; background: #fff1f1; }
.status-pill--pending { color: #1769ff; background: #edf5ff; }
.status-pill--default { color: #667085; background: #f2f4f7; }
.status-card__value--success { color: #10a66a; }
.status-card__value--danger { color: #e5484d; }
.status-card__value--pending { color: #1677ff; }
.status-card__value--default { color: #667085; }
.status-card__meta, .status-card__remark, .status-card__time { margin-top: 10rpx; }
.kyc-action { display: inline-flex; align-items: center; justify-content: center; margin-top: 20rpx; height: 64rpx; padding: 0 28rpx; border-radius: 32rpx; color: #ffffff; background: #1677ff; font-size: 25rpx; font-weight: 700; }
.approved-card { padding: 26rpx 24rpx; }
.approved-card__title { margin-bottom: 16rpx; color: #10a66a; font-size: 31rpx; font-weight: 700; }
.approved-card__row { display: flex; justify-content: space-between; gap: 20rpx; padding: 12rpx 0; color: #344054; font-size: 25rpx; line-height: 36rpx; }
.approved-card__row text:first-child { flex: none; color: #7a8494; }
.approved-card__row text:last-child { flex: 1; min-width: 0; text-align: right; word-break: break-word; }
.approved-card__row--address { align-items: flex-start; }
.license-form { position: relative; z-index: 1; }
.account-tip { padding: 20rpx 22rpx; color: #176b55; background: #eefbf6; border: 1rpx solid #c7f0df; font-size: 24rpx; line-height: 36rpx; }
.account-fields { display: grid; grid-template-columns: 1fr; gap: 16rpx; margin-top: 18rpx; }
.form-section { padding: 24rpx 22rpx; }
.form-section__title { color: #172033; font-size: 30rpx; font-weight: 700; line-height: 42rpx; }
.form-section__subtitle { margin-top: 24rpx; color: #172033; font-size: 26rpx; font-weight: 700; line-height: 38rpx; }
.form-section__desc { margin-top: 8rpx; color: #667085; font-size: 23rpx; line-height: 34rpx; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 16rpx; margin-top: 18rpx; }
.form-row { min-height: 86rpx; padding: 14rpx 18rpx; border: 1rpx solid #e5eaf2; border-radius: 16rpx; background: #fbfcfe; box-sizing: border-box; }
.form-row--readonly { background: #f5f7fb; }
.form-label { display: block; color: #344054; font-size: 23rpx; line-height: 32rpx; }
.form-label.required::after, .form-label--long.required::after { content: ' *'; color: #e5484d; }
.form-input, .form-picker { width: 100%; min-height: 44rpx; margin-top: 8rpx; color: #172033; font-size: 27rpx; line-height: 44rpx; }
.form-picker--placeholder { color: #b7c0cc; font-size: 25rpx; }
.form-placeholder { color: #b7c0cc; font-size: 25rpx; }
.form-picker-wrap { display: block; }
.form-row--textarea { min-height: 184rpx; }
.form-textarea { width: 100%; min-height: 118rpx; margin-top: 8rpx; color: #172033; font-size: 26rpx; line-height: 38rpx; box-sizing: border-box; }
.map-picker { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.map-picker__main { flex: 1; min-width: 0; }
.map-picker__value { margin-top: 8rpx; color: #172033; font-size: 27rpx; line-height: 40rpx; word-break: break-all; }
.map-picker__value--placeholder { color: #b7c0cc; font-size: 25rpx; }
.map-picker__coord { margin-top: 6rpx; color: #7a8494; font-size: 22rpx; line-height: 32rpx; }
.map-picker__btn { flex: none; min-width: 128rpx; height: 58rpx; padding: 0 20rpx; border-radius: 29rpx; color: #1769ff; background: #edf5ff; font-size: 24rpx; line-height: 58rpx; text-align: center; box-sizing: border-box; }
.shop-media-card { margin-top: 20rpx; padding: 20rpx; border: 1rpx solid #e5eaf2; border-radius: 18rpx; background: linear-gradient(180deg, #fbfcff 0%, #f7fbff 100%); box-sizing: border-box; }
.shop-media-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.shop-media-card__title { color: #172033; font-size: 27rpx; font-weight: 700; line-height: 38rpx; }
.shop-media-card__desc { margin-top: 6rpx; color: #667085; font-size: 22rpx; line-height: 32rpx; }
.shop-media-card__badge { flex: none; padding: 6rpx 14rpx; border-radius: 999rpx; color: #0b8f5a; background: #e9fbf3; font-size: 22rpx; font-weight: 700; line-height: 30rpx; }
.shop-media-card__tip { margin-top: 12rpx; color: #7a8494; font-size: 22rpx; line-height: 32rpx; }
.upload-grid--shop { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.upload-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; margin-top: 18rpx; }
.upload-item__title { min-height: 34rpx; color: #344054; font-size: 23rpx; line-height: 34rpx; }
.upload-item__required { color: #e5484d; margin-right: 4rpx; }
.upload-item__box { position: relative; display: flex; align-items: center; justify-content: center; height: 176rpx; margin-top: 8rpx; border: 1rpx dashed #c8d2df; border-radius: 16rpx; background: #f8fafc; overflow: hidden; }
.upload-item__image { width: 100%; height: 100%; }
.upload-item__empty { text-align: center; color: #7a8494; }
.upload-item__plus, .qualification-add__plus { font-size: 42rpx; line-height: 44rpx; }
.upload-item__tip, .qualification-add__text { margin-top: 6rpx; font-size: 23rpx; line-height: 32rpx; }
.upload-item__remove, .qualification-item__remove { position: absolute; right: 10rpx; top: 10rpx; display: flex; align-items: center; justify-content: center; width: 42rpx; height: 42rpx; border-radius: 50%; color: #ffffff; background: rgba(0,0,0,.55); font-size: 28rpx; line-height: 42rpx; }
.qualification-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14rpx; margin-top: 18rpx; }
.qualification-item, .qualification-add { position: relative; height: 150rpx; border-radius: 14rpx; overflow: hidden; background: #f8fafc; }
.qualification-add--shop { height: 176rpx; margin-top: 42rpx; }
.qualification-item__image { width: 100%; height: 100%; }
.qualification-add { border: 1rpx dashed #c8d2df; color: #7a8494; }
.qualification-add__inner { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.video-list { margin-top: 14rpx; }
.video-item { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; min-height: 64rpx; padding: 12rpx 14rpx; border: 1rpx solid #e5eaf2; border-radius: 12rpx; background: #f8fafc; color: #344054; font-size: 23rpx; line-height: 34rpx; }
.video-item + .video-item { margin-top: 10rpx; }
.video-item__text { flex: 1; min-width: 0; word-break: break-all; }
.video-item__remove { flex: none; color: #e5484d; }
.video-add { display: inline-flex; align-items: center; justify-content: center; margin-top: 12rpx; min-height: 58rpx; padding: 0 22rpx; border-radius: 30rpx; color: #1769ff; background: #edf5ff; font-size: 24rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,.96); box-shadow: 0 -8rpx 24rpx rgba(31,58,94,.08); }
.submit-btn { display: flex; align-items: center; justify-content: center; height: 88rpx; border-radius: 44rpx; color: #ffffff; background: linear-gradient(135deg, #1d73f6, #16b889); font-size: 30rpx; font-weight: 700; }
.submit-btn--disabled { opacity: .56; }
@media screen and (min-width: 768px) {
    .license-page { max-width: 750rpx; margin: 0 auto; }
    .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .form-row--wide { grid-column: span 2; }
    .upload-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
