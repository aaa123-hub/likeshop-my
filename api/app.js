import request from "@/utils/request";
import wechath5 from "@/utils/wechath5";
import { client } from "@/utils/tools";
import { resolveImage } from "@/utils/image-placeholder";

function normalizeMiniappLoginResult(res) {
  const payload = res && res.data ? res.data : res;
  const accessToken = payload && (payload.accessToken || payload.token);
  const userId = payload && (payload.userId || payload.user_id || payload.id || payload.user?.userId || payload.user?.id);

  if (!accessToken) return res;

  return {
    ...(res || {}),
    code: 1,
    rawCode: res && res.code,
    data: {
      ...(payload || {}),
      token: accessToken,
      refresh_token: payload.refreshToken,
      expire_in: payload.expireIn,
      userId,
      user_id: userId,
      id: userId,
      openid: payload.openId,
      session_key: payload.sessionKey,
      user_status: payload.userStatus,
      need_bind_mobile: payload.needBindMobile,
      need_kyc: payload.needKyc,
      is_new_user: false,
    },
  };
}

function normalizeEcoApplication(item = {}, index = 0) {
  const linkUrl = item.linkUrl || item.url || item.appUrl || item.jumpUrl || item.pagePath || "";
  return {
    ...item,
    id: item.id || item.appId || item.appCode || index,
    title: item.title || item.appName || item.name || "生态应用",
    desc: item.desc || item.appDesc || item.description || "",
    icon: resolveImage(item.icon || item.iconUrl || item.logoUrl || item.imageUrl, "goods"),
    linkUrl,
    urlText: item.urlText || linkUrl || item.appCode || "暂未配置链接",
    openType: item.openType || item.jumpType || item.type || "",
    pagePath: item.pagePath || item.path || "",
    appId: item.targetAppId || item.appid || item.appId || "",
  };
}

function buildMiniappLoginPayload(data = {}) {
  const jsCode = data.jsCode || data.loginCode || data.code;

  return {
    jsCode,
    loginCode: jsCode,
    channelCode: "wechat-miniapp",
  };
}

function shouldFallbackMiniappLogin(res) {
  const code = res && (res.rawCode || res.code);
  return code === "A0110" || code === "A0108";
}

function normalizePayMethod(method) {
  const payMethodMap = {
    1: "WECHAT_JSAPI",
    2: "ALIPAY",
    3: "BALANCE",
    wechat: "WECHAT_JSAPI",
    wxpay: "WECHAT_JSAPI",
    wechat_jsapi: "WECHAT_JSAPI",
    alipay: "ALIPAY",
    balance: "BALANCE",
    wallet: "BALANCE",
  };
  return payMethodMap[String(method || "").toLowerCase()] || method || "BALANCE";
}

function normalizePaymentResult(data = {}) {
  const payInfo = data.channelPayInfo || data.orderInfo || data.payInfo || data;
  return {
    ...data,
    ...payInfo,
    timeStamp: payInfo.timeStamp || payInfo.timestamp,
    nonceStr: payInfo.nonceStr || payInfo.nonce_str,
    package: payInfo.package || payInfo.packageValue,
    signType: payInfo.signType || payInfo.sign_type || "RSA",
    paySign: payInfo.paySign || payInfo.pay_sign,
    orderInfo: payInfo.orderInfo || data.orderInfo || data.channelPayInfo,
  };
}

function normalizePaymentResponse(res) {
  if (!res || res.code != 1 || !res.data) return res;
  const payStatus = res.data.payStatus || "";
  return {
    ...res,
    code: payStatus === "PAID" || payStatus === "SUCCESS" ? 20001 : 1,
    data: normalizePaymentResult(res.data),
  };
}

function normalizeBubbleItem(item = {}, index = 0) {
  const user = item.user || item.userInfo || {};
  const nickname = user.nickname || item.nickname || item.userName || "用户";
  const avatar = resolveImage(user.avatar || item.avatar || item.headimgurl, "avatar");
  const goodsName = item.goodsName || item.goods_name || item.productName || item.title || item.name || "商品";

  return {
    ...item,
    id: item.id || item.visitId || item.targetId || index,
    user: {
      ...user,
      avatar,
      nickname,
    },
    template: item.template || `${nickname}刚刚浏览了${goodsName}`,
  };
}

function normalizeBubbleListsResponse(res) {
  if (!res || res.code != 1) return res;
  const payload = res.data || {};
  const list = Array.isArray(payload)
    ? payload
    : payload.lists || payload.list || payload.recentVisits || payload.rows || [];

  return {
    ...res,
    data: {
      ...payload,
      lists: list.map(normalizeBubbleItem),
      time: payload.time || Math.floor(Date.now() / 1000),
    },
  };
}

export function getContentPage(pageCode, fallback = "") {
  return request.get(`miniapp/content-pages/${pageCode}`).then((res) => {
    if (res.code != 1) return res;
    const data = res.data || {};
    return { ...res, data: { ...data, content: data.content || fallback } };
  });
}

function contentPage(pageCode, fallback = "") {
  return getContentPage(pageCode, fallback).then((res) => {
    if (res.code != 1) return res;
    return { ...res, data: res.data?.content || fallback };
  });
}

function normalizeConfigResponse(res) {
  if (!res || res.code != 1) return res;
  const data = res.data || {};
  return {
    ...res,
    data: {
      name: data.name || data.siteName || "",
      app_agreement: data.app_agreement ?? 1,
      center_setting: data.center_setting || data.centerSetting || {},
      index_setting: data.index_setting || data.indexSetting || {},
      navigation_menu: data.navigation_menu || data.quickEntries || [],
      navigation_setting: data.navigation_setting || {},
      register_setting: data.register_setting ?? false,
      ...data,
    },
  };
}

function normalizePaywayResponse(res, params = {}) {
  const data = res && res.data ? res.data : {};
  const now = Math.floor(Date.now() / 1000);
  const amount = data.paidAmount || data.payAmount || data.orderAmount || params.order_amount || params.amount || 0;
  return {
    ...(res || {}),
    code: res && res.code == 0 ? 0 : 1,
    data: {
      ...data,
      order_amount: amount,
      cancel_time: data.cancelTime || data.expireTime || params.cancel_time || now + 30 * 60,
      pay: data.pay || data.payMethods || data.paymentMethods || [],
    },
  };
}

//小程序授权登录
export async function authLogin(data) {
  const payload = buildMiniappLoginPayload(data);
  if (!payload.jsCode) {
    return Promise.resolve({
      code: 0,
      msg: "缺少微信登录凭证 code",
      message: "缺少微信登录凭证 code",
      data: null,
    });
  }
  const res = await request.post("miniapp/auth/wechat-login", payload);
  const normalized = normalizeMiniappLoginResult(res);
  if (normalized && normalized.code == 1) return normalized;
  if (!shouldFallbackMiniappLogin(normalized)) return normalized;

  const fallbackRes = await request.post("miniapp/auth/login", payload);
  return normalizeMiniappLoginResult(fallbackRes);
}
//小程序静默登录
export async function silentLogin(data) {
  return authLogin(data);
}

//更新小程序头像昵称
export function updateUser(data, token) {
  return request.put("miniapp/user/profile", data, { header: { token } });
}
// app登录
export function opLogin(data) {
  return authLogin(data);
}

//预支付接口
export async function prepay(data = {}) {
  const res = await request.post("miniapp/payments/create", {
    bizType: data.bizType || (data.from === "recharge" ? "RECHARGE" : "ORDER"),
    bizOrderNo: data.bizOrderNo || data.payOrderNo || data.order_no || data.order_id,
    payScene: data.payScene || "MINIAPP",
    payMethod: normalizePayMethod(data.payMethod || data.pay_way || data.payWay),
    clientIp: data.clientIp || "127.0.0.1",
    openId: data.openId || data.openid || data.open_id,
    idempotentKey:
      data.idempotentKey ||
      `pay-${data.order_id || data.bizOrderNo || Date.now()}-${normalizePayMethod(data.pay_way)}`,
    client,
  });
  return normalizePaymentResponse(res);
}

//小程序订阅
export function getMnpNotice(data) {
  return request.get("miniapp/messages/unread-count", { params: { bizType: data?.scene || data?.bizType } })
    .then((res) => (res.code == 1 ? { ...res, data: [] } : res));
}

//账号登录
export function accountLogin(data) {
  return authLogin(data);
}

export function getWechatConfig() {
  return request.get("miniapp/home/index", {
    params: {
      url: encodeURIComponent(wechath5.signLink()),
    },
  });
}

// 登录
export function wechatLogin(data) {
  return authLogin(data);
}

// 获取获取向微信请求code的链接
export function getCodeUrl() {
  return request.get("miniapp/auth/wechat-login", {
    params: {
      url: encodeURIComponent(location.href),
    },
  });
}

//微信sdk配置
export function getJsconfig() {
  return request.get("miniapp/home/index", {
    params: {
      url: encodeURIComponent(wechath5.signLink()),
    },
  });
}

// 忘记密码
export function forgetPwd(data) {
  return Promise.resolve({ code: 0, msg: "当前小程序接口文档暂未提供找回密码接口" });
}

// 发送短信
export function sendSms(data) {
  return Promise.resolve({ code: 0, msg: "当前后端暂未提供小程序短信发送接口", data: null });
}

// Html5 注册账号
export function register(data) {
  return authLogin(data);
}

// 获取服务协议
export function getServerProto() {
  return contentPage("service_agreement");
}

// 获取隐私政策
export function getPrivatePolicy() {
  return contentPage("privacy_policy");
}

// 售后保障
export function getAfterSaleGuar() {
  return contentPage("after_sale_guarantee");
}

//客服
export function getService() {
  return request.get("miniapp/eco-applications").then((res) => {
    const list = res.data?.list || [];
    const service = list.find((item) => String(item.appCode || "").toLowerCase().includes("service")) || {};
    return {
      ...res,
      data: {
        image: resolveImage(service.iconUrl, "avatar"),
        wechat: service.appCode || "",
        phone: service.contactPhone || "",
        time: service.appDesc || "",
        list,
      },
    };
  });
}

export function getEcoApplications(params = {}) {
  return request.get("miniapp/eco-applications", { params }).then((res) => {
    if (res.code != 1) return res;
    const payload = res.data || {};
    const list = Array.isArray(payload) ? payload : (payload.list || payload.rows || payload.records || []);
    return {
      ...res,
      data: list.map(normalizeEcoApplication),
    };
  });
}

// 足迹气泡
export function getBubbleLists() {
  return request.get("miniapp/home/recent-visits").then(normalizeBubbleListsResponse);
}

// 用户自定义分享
export function userShare(params) {
  return request.get("miniapp/home/index").then((res) => {
    if (res.code != 1) return res;
    const data = res.data || {};
    return {
      ...res,
      data: {
        mnp_share_title: data.shareTitle || data.name || "",
        mnp_share_image: resolveImage(data.shareImage || ""),
        h5_share_title: data.shareTitle || data.name || "",
        h5_share_image: resolveImage(data.shareImage || ""),
        ...params,
      },
    };
  });
}

// 验证码登录
export function smsCodeLogin(data) {
  return authLogin(data);
}
export function getConfig() {
  return request.get("miniapp/home/index").then(normalizeConfigResponse);
}

// 注册赠送优惠券
export function getRegisterCoupon() {
  return request.get("miniapp/coupons", { params: { pageNo: 1, pageSize: 20 } })
    .then((res) => ({ ...res, data: res.data?.list || [] }));
}

// 获取支付配置
export function getPayway(params = {}) {
  const bizOrderNo = params.bizOrderNo || params.payOrderNo || params.order_no || params.order_id;
  if (bizOrderNo) {
    return request.post("miniapp/payments/preview", {
      bizType: params.bizType || (params.from === "recharge" ? "RECHARGE" : "ORDER"),
      bizOrderNo,
      payScene: params.payScene || "MINIAPP",
      payMethod: normalizePayMethod(params.payMethod || params.pay_way || params.payWay || "BALANCE"),
      clientIp: params.clientIp || "127.0.0.1",
      openId: params.openId || params.openid || params.open_id,
      idempotentKey: params.idempotentKey || `pay-preview-${bizOrderNo}-${Date.now()}`,
      client,
    }).then((res) => normalizePaywayResponse(res, params));
  }
  return Promise.resolve({ code: 0, msg: "缺少支付业务单号", data: null });
}

// 获取微信小程序码-生成海报需使用
export function getShareMnQrcode(params) {
  return request.get("miniapp/shop/" + (params.shopId || params.shop_id || ''), { params });
}
