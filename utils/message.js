const FIELD_LABELS = {
  accountName: '账户姓名',
  accountNo: '账户账号',
  addressId: '地址',
  amount: '金额',
  bizOrderNo: '业务订单号',
  bizType: '业务类型',
  cardNo: '礼品卡卡号',
  cardSecret: '礼品卡卡密',
  couponId: '优惠券',
  idempotentKey: '幂等键',
  messageId: '消息',
  mobile: '手机号',
  orderNo: '订单',
  password: '密码',
  payMethod: '支付方式',
  phone: '手机号',
  quantity: '数量',
  shopId: '店铺',
  skuId: '商品规格',
  spuId: '商品',
  userId: '用户',
  verifyCode: '验证码'
}

const EXACT_MESSAGES = {
  success: '操作成功',
  ok: '操作成功',
  logout: '已退出登录',
  'operation successful': '操作成功',
  'request failed': '请求失败',
  'network error': '网络异常，请稍后重试',
  timeout: '请求超时，请稍后重试',
  'permission denied': '暂无操作权限',
  unauthorized: '登录已失效，请重新登录',
  forbidden: '暂无操作权限',
  'not found': '数据不存在',
  'server error': '服务器异常，请稍后重试',
  'internal server error': '服务器异常，请稍后重试',
  'bad request': '请求参数错误',
  'invalid token': '登录已失效，请重新登录',
  'token expired': '登录已失效，请重新登录',
  'login expired': '登录已失效，请重新登录',
  'refund already applied': '已申请售后',
  'insufficient balance': '余额不足',
  'insufficient stock': '库存不足',
  'password error': '密码错误',
  'pay password error': '支付密码错误',
  'pay password incorrect': '支付密码错误',
  'verification code error': '验证码错误',
  'verification code expired': '验证码已过期'
}

const PATTERN_MESSAGES = [
  [/^(.+?)\s+is\s+required$/i, (match) => `缺少必要参数：${fieldLabel(match[1])}`],
  [/^missing\s+required\s+parameter[:：]?\s*(.+)$/i, (match) => `缺少必要参数：${fieldLabel(match[1])}`],
  [/^required\s+parameter\s+(.+?)\s+is\s+not\s+present$/i, (match) => `缺少必要参数：${fieldLabel(match[1])}`],
  [/^invalid\s+(.+)$/i, (match) => `${fieldLabel(match[1])}不正确`],
  [/^(.+?)\s+not\s+found$/i, (match) => `${fieldLabel(match[1])}不存在`],
  [/^(.+?)\s+already\s+exists$/i, (match) => `${fieldLabel(match[1])}已存在`],
  [/^(.+?)\s+already\s+applied$/i, () => '已申请，请勿重复提交'],
  [/^(.+?)\s+cannot\s+be\s+empty$/i, (match) => `${fieldLabel(match[1])}不能为空`],
  [/^(.+?)\s+must\s+not\s+be\s+blank$/i, (match) => `${fieldLabel(match[1])}不能为空`],
  [/timeout/i, () => '请求超时，请稍后重试'],
  [/network\s+error/i, () => '网络异常，请稍后重试'],
  [/token|unauthori[sz]ed|login\s+expired/i, () => '登录已失效，请重新登录'],
  [/permission\s+denied|forbidden/i, () => '暂无操作权限'],
  [/insufficient\s+balance/i, () => '余额不足'],
  [/insufficient\s+stock/i, () => '库存不足'],
  [/refund\s+already\s+applied/i, () => '已申请售后'],
  [/verify|verification|captcha/i, () => '验证码错误或已过期']
]

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text)
}

function fieldLabel(value = '') {
  const normalized = String(value).trim().replace(/^['"]|['"]$/g, '')
  return FIELD_LABELS[normalized] || FIELD_LABELS[normalized.replace(/[_-]([a-z])/g, (_, char) => char.toUpperCase())] || normalized
}

export function translateBackendMessage(message, fallback = '') {
  if (message === undefined || message === null || message === '') return fallback
  const text = String(message).trim()
  if (!text) return fallback
  if (hasChinese(text)) return text

  const normalized = text.toLowerCase().replace(/[.!。！]+$/g, '').trim()
  if (EXACT_MESSAGES[normalized]) return EXACT_MESSAGES[normalized]

  for (const [pattern, getMessage] of PATTERN_MESSAGES) {
    const match = text.match(pattern)
    if (match) return getMessage(match)
  }

  return fallback || '操作失败，请稍后重试'
}

export function normalizeToastOptions(options) {
  if (typeof options === 'string') return translateBackendMessage(options, options)
  if (!options || typeof options !== 'object') return options
  return {
    ...options,
    title: translateBackendMessage(options.title, options.title)
  }
}

export function installToastTranslator() {
  if (typeof uni === 'undefined' || uni.__toastTranslatorInstalled || typeof uni.showToast !== 'function') return
  const rawShowToast = uni.showToast.bind(uni)
  uni.showToast = (options = {}) => rawShowToast(normalizeToastOptions(options))
  uni.__toastTranslatorInstalled = true
}
