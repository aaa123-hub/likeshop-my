const TEXT_MAP = {
    NOT_SUBMITTED: '未实名',
    UNSUBMITTED: '未实名',
    NONE: '未实名',
    NO_AUTH: '未实名',
    UNAUTHENTICATED: '未实名',
    UNVERIFIED: '未实名',
    NOT_AUTHENTICATED: '未实名',
    NOT_VERIFIED: '未实名',
    PENDING: '审核中',
    PENDING_AUDIT: '审核中',
    WAIT_AUDIT: '审核中',
    AUDITING: '审核中',
    SUBMITTED: '审核中',
    APPROVED: '已通过',
    PASS: '已通过',
    PASSED: '已通过',
    SUCCESS: '已通过',
    REALNAME_VERIFIED: '已通过',
    REJECTED: '未通过',
    REJECT: '未通过',
    FAILED: '未通过',
    FAIL: '未通过',
    CANCELLED: '已取消',
    CANCELED: '已取消',
    PENDING_DEPOSIT: '待缴押金',
    UNPAID: '待支付',
    WAIT_PAY: '待支付',
    PENDING_PAY: '待支付',
    PAID: '已支付',
    REFUNDED: '已退款',
    WAIVED: '无需缴纳',

    ID_CARD: '身份证',
    IDCARD: '身份证',
    PASSPORT: '护照',
    HK_MACAO: '港澳通行证',
    TAIWAN: '台湾居民通行证',
    BUSINESS_LICENSE: '营业执照',

    NAME_MISMATCH: '姓名与证件信息不一致',
    ID_CARD_INVALID: '证件号码不正确',
    CERT_NO_INVALID: '证件号码不正确',
    ID_NO_INVALID: '证件号码不正确',
    PHOTO_BLUR: '证件照片不清晰',
    CERT_IMAGE_BLUR: '证件照片不清晰',
    IMAGE_BLUR: '证件照片不清晰',
    FRONT_IMAGE_MISSING: '请补充证件正面照片',
    BACK_IMAGE_MISSING: '请补充证件背面照片',
    CERT_FRONT_MISSING: '请补充证件正面照片',
    CERT_BACK_MISSING: '请补充证件背面照片',
    FACE_VERIFY_FAILED: '人脸核验未通过',
    EXPIRED_CERT: '证件已过期',
    INVALID_CERT: '证件信息无效',
    DUPLICATE_CERT: '该证件已被使用',
    OTHER: '其他原因',

    COUPON: '优惠券',
    FULL: '满减券',
    FULL_REDUCE: '满减券',
    FULL_REDUCTION: '满减券',
    FULL_DISCOUNT: '满减券',
    REDUCE: '满减券',
    DISCOUNT: '折扣券',
    FIXED_DISCOUNT: '折扣券',
    MONEY: '现金券',
    CASH: '现金券',
    CASH_COUPON: '现金券',
    VOUCHER: '代金券',
    FREIGHT: '运费券',
    FREE_SHIPPING: '包邮券',
    PLATFORM: '平台券',
    MERCHANT: '商家券',
    SHOP: '商家券',
    STORE: '商家券',
    AVAILABLE: '可使用',
    UNAVAILABLE: '不可用',
    RECEIVABLE: '可领取',
    CLAIMABLE: '可领取',
    RECEIVED: '已领取',
    USED: '已使用',
    EXPIRED: '已过期',
    UNUSED: '未使用',

    PROMOTER: '推广者',
    AGENT: '区域代理',
    AREA_AGENT: '区域代理',
    COUNTY_AGENT: '区域代理',
    OPERATION_CENTER: '区域代理',
    SUBSIDIARY: '子公司',
    HQ: '总部',
    HEADQUARTERS: '总部',

    DELIVERY: '快递配送',
    EXPRESS: '快递配送',
    PICKUP: '门店自提',
    SELF_FETCH: '门店自提',
    SELFFETCH: '门店自提',
    STORE_PICKUP: '门店自提',
    OFFLINE_PICKUP: '门店自提',
    ONLINE: '线上订单',
    MINIAPP: '小程序'
}

const HIDDEN_CODES = [
    'ORDER_CONFIRM_RECEIVABLE',
    'ORDER_CONFIRM_AVAILABLE',
    'ORDER_CONFIRM_UNAVAILABLE'
]

const EMPTY_DISPLAY_CODES = [
    'NONE',
    'NULL',
    'UNDEFINED',
    'NIL',
    'N_A',
    'NA',
    'NO_DATA',
    'NO_VALUE',
    'EMPTY',
    '-',
    '--'
]

export function normalizeBackendCode(value) {
    return String(value || '')
        .trim()
        .replace(/[\s-]+/g, '_')
        .toUpperCase()
}

export function isBackendCodeText(value) {
    const text = String(value || '').trim()
    return Boolean(text && /^[A-Z0-9_\-\s]+$/.test(text) && /[A-Z]/.test(text))
}

export function isEmptyBackendText(value) {
    if (value === undefined || value === null || value === '') return true
    const text = String(value).trim()
    if (!text) return true
    return EMPTY_DISPLAY_CODES.includes(normalizeBackendCode(text))
}

export function localizeBackendText(value, fallback = '') {
    if (value === undefined || value === null || value === '') return fallback
    const text = String(value).trim()
    if (!text) return fallback

    const normalized = normalizeBackendCode(text)
    if (HIDDEN_CODES.includes(normalized)) return fallback
    if (Object.prototype.hasOwnProperty.call(TEXT_MAP, normalized)) return TEXT_MAP[normalized]

    let localized = text
    HIDDEN_CODES.forEach((code) => {
        localized = localized.replace(new RegExp(`\\b${code}\\b`, 'gi'), '')
    })
    Object.keys(TEXT_MAP).forEach((code) => {
        localized = localized.replace(new RegExp(`\\b${code}\\b`, 'gi'), TEXT_MAP[code])
    })
    localized = localized.replace(/\s{2,}/g, ' ').trim()
    if (localized && localized !== text) return localized

    return isBackendCodeText(text) ? fallback : text
}

export function cleanBackendText(value, fallback = '') {
    if (isEmptyBackendText(value)) return fallback
    return localizeBackendText(value, fallback)
}

export function cleanEmptyBackendText(value, fallback = '') {
    if (isEmptyBackendText(value)) return fallback
    return String(value).trim()
}

export function normalizeKycStatus(value) {
    const status = normalizeBackendCode(value)
    if (['APPROVED', 'PASS', 'PASSED', 'SUCCESS', 'REALNAME_VERIFIED'].includes(status)) return 'APPROVED'
    if (['PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING', 'PENDING', 'SUBMITTED'].includes(status)) return 'PENDING_AUDIT'
    if (['REJECTED', 'REJECT', 'FAILED', 'FAIL'].includes(status)) return 'REJECTED'
    return 'NOT_SUBMITTED'
}

export function formatKycStatusText(value) {
    const status = normalizeKycStatus(value)
    const map = {
        NOT_SUBMITTED: '未实名',
        PENDING_AUDIT: '审核中',
        APPROVED: '认证已通过',
        REJECTED: '认证未通过'
    }
    return map[status] || '未实名'
}

export function formatAuditStatusText(value, fallback = '审核中') {
    return localizeBackendText(value, fallback)
}

export function formatCouponText(value, fallback = '') {
    return localizeBackendText(value, fallback)
}

export function formatCouponTypeText(value, fallback = '优惠券') {
    return localizeBackendText(value, fallback) || fallback
}
