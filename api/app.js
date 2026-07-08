import request from "@/utils/request";
import wechath5 from "@/utils/wechath5";
import { client } from "@/utils/tools";
import { resolveImage } from "@/utils/image-placeholder";
import store from "@/store";
import Cache from "@/utils/cache";
import { USER_INFO } from "@/config/cachekey";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

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
  const linkUrl = item.entryUrl || item.entry_url || item.linkUrl || item.link_url || item.url || item.appUrl || item.app_url || item.jumpUrl || item.jump_url || item.pagePath || item.page_path || "";
  const image = item.icon || item.iconUrl || item.icon_url || item.logoUrl || item.logo_url || item.imageUrl || item.image_url || item.image || item.cover;
  return {
    ...item,
    id: item.id || item.appId || item.app_id || item.appCode || item.app_code || index,
    title: item.title || item.appName || item.app_name || item.name || "生态应用",
    desc: item.desc || item.appDesc || item.app_desc || item.description || "",
    icon: resolveImage(image, "goods"),
    iconUrl: resolveImage(image, "goods"),
    entryUrl: item.entryUrl || item.entry_url || linkUrl,
    linkUrl,
    urlText: item.urlText || item.url_text || linkUrl || item.appCode || item.app_code || "暂未配置链接",
    openType: item.openType || item.open_type || item.jumpType || item.jump_type || item.type || "",
    pagePath: item.pagePath || item.page_path || item.path || (/^\//.test(linkUrl) ? linkUrl : ""),
    appId: item.targetAppId || item.target_app_id || item.appid || item.appId || item.app_id || "",
  };
}

function extractList(payload = {}) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.content)) return payload.content;
  if (payload.page && typeof payload.page === "object") return extractList(payload.page);
  return [];
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
    wechat: "WECHAT_JSAPI",
    wxpay: "WECHAT_JSAPI",
    wechat_jsapi: "WECHAT_JSAPI",
  };
  return payMethodMap[String(method || "").toLowerCase()] || "WECHAT_JSAPI";
}

function currentOpenId() {
  const userInfo = store.getters.userInfo || {};
  const cachedUserInfo = Cache.get(USER_INFO) || {};
  return userInfo.openId || userInfo.openid || userInfo.open_id
    || cachedUserInfo.openId || cachedUserInfo.openid || cachedUserInfo.open_id
    || "";
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

function normalizeRecentVisitShop(item = {}, index = 0) {
  const shop = item.shop || item.shopInfo || item.target || item;
  const shopId = shop.shopId || shop.shop_id || shop.merchantShopId || shop.merchant_shop_id || item.targetId || item.target_id || shop.id || item.id || "";
  const visitTime = item.visitTime || item.visit_time || item.createTime || item.create_time || item.time || "";
  return {
    ...item,
    key: String(item.id || item.visitId || shopId || index),
    id: item.id || item.visitId || index,
    shopId,
    name: shop.shopName || shop.shop_name || shop.storeName || shop.name || item.title || "默认门店",
    image: resolveImage(shop.shopLogo || shop.shop_logo || shop.logo || shop.logoUrl || shop.image || shop.cover || item.cover || item.image),
    time: formatRecentVisitTime(visitTime),
    subscribed: Boolean(shop.subscribed || shop.isSubscribed || shop.is_subscribe || item.subscribed || item.isSubscribed),
  };
}

function formatRecentVisitTime(value) {
  if (!value) return "刚刚";
  if (typeof value === "string" && /^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5);
  const time = Number(value);
  const date = Number.isNaN(time) ? new Date(value) : new Date(time > 10000000000 ? time : time * 1000);
  if (Number.isNaN(date.getTime())) return String(value);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function normalizeRecentVisitShopResponse(res) {
  if (!res || res.code != 1) return res;
  const payload = res.data || {};
  const source = Array.isArray(payload) ? payload : payload.shops || payload.shopList || payload.recentShops || payload.recentVisits || payload.lists || payload.list || payload.rows || payload.records || [];
  return {
    ...res,
    data: source.map(normalizeRecentVisitShop).filter(item => item.shopId || item.name),
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
  const amountInfo = data.amountInfo || {};
  const baseInfo = data.baseInfo || {};
  const amount = firstDefined(amountInfo.payAmount, data.payAmount, data.pay_amount, data.order_amount, data.paidAmount, data.orderAmount, baseInfo.orderAmount, params.order_amount, params.amount, 0);
  return {
    ...(res || {}),
    code: res && res.code == 0 ? 0 : 1,
    data: {
      ...data,
      order_amount: amount,
      cancel_time: data.cancelTime || data.expireTime || baseInfo.expireTime || params.cancel_time || now + 30 * 60,
      pay: data.pay || data.payMethods || data.paymentMethods || defaultPaywayList(),
    },
  };
}

function defaultPaywayList() {
  return [
    {
      id: "WECHAT_JSAPI",
      name: "微信支付",
      pay_way: "WECHAT_JSAPI",
      extra: "使用微信支付",
      icon: "https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_paySuccess.png",
    },
  ];
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
  const openId = data.openId || data.openid || data.open_id || currentOpenId();
  const bizOrderNo = data.bizOrderNo || data.payOrderNo || data.order_no || data.order_id;
  const res = await request.post("miniapp/payments/create", {
    bizType: data.bizType || (data.from === "recharge" ? "RECHARGE" : "ORDER"),
    bizOrderNo,
    amount: firstDefined(data.amount, data.payAmount, data.order_amount),
    payScene: data.payScene || "MINIAPP",
    payMethod: "WECHAT_JSAPI",
    clientIp: data.clientIp || "127.0.0.1",
    openId,
    idempotentKey:
      data.idempotentKey ||
      `pay-${bizOrderNo || Date.now()}-WECHAT_JSAPI`,
    client,
  });
  return normalizePaymentResponse(res);
}

export function queryPayment(data = {}) {
  const payOrderNo = data.payOrderNo || data.pay_order_no || data.pay_order_id || data.order_id;
  if (!payOrderNo) return Promise.resolve({ code: 0, msg: "缺少支付单号", data: null });
  return request.get(`miniapp/payments/${payOrderNo}`).then(normalizePaymentResponse);
}

//小程序订阅
export function getMnpNotice(data) {
  return request.get("miniapp/messages/unread-count", { params: { bizType: data?.scene || data?.bizType } })
    .then((res) => (res.code == 1 ? { ...res, data: [] } : { code: 1, data: [] }))
    .catch(() => ({ code: 1, data: [] }));
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
export function forgetPwd(data = {}) {
  return request.post("miniapp/auth/password/reset", {
    mobile: data.mobile || data.phone,
    smsCode: data.smsCode || data.code,
    code: data.code || data.smsCode,
    password: data.password || data.newPassword || data.new_password,
    newPassword: data.newPassword || data.new_password || data.password,
  });
}

// 发送短信
export function sendSms(data = {}) {
  return request.post("miniapp/sms/send", {
    mobile: data.mobile || data.phone,
    scene: data.scene || data.key || data.type || "LOGIN",
  });
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
    const payload = res.data || {};
    const list = extractList(payload);
    const serviceApp = list.find((item) => {
      const text = `${item.appCode || ""}${item.appName || ""}${item.name || ""}${item.title || ""}`.toLowerCase();
      return text.includes("service") || text.includes("客服") || text.includes("contact");
    }) || {};
    const service = {
      ...serviceApp,
      ...(payload.service || {}),
      ...(payload.customerService || {}),
      ...(payload.contact || {}),
    };
    const qrCode = service.qrCode || service.qrCodeUrl || service.qrcode || service.wechatQrCode || service.wechatQr || service.imageUrl || service.iconUrl || payload.qrCodeUrl || payload.serviceQrCode;
    const avatar = service.avatar || service.avatarUrl || service.logo || service.logoUrl || service.icon || service.iconUrl || service.imageUrl || qrCode;
    return {
      ...res,
      code: res.code == 1 ? 1 : res.code,
      data: {
        name: service.appName || service.name || service.title || payload.name || "平台客服",
        image: avatar ? resolveImage(avatar, "avatar") : "",
        qrcode: qrCode ? resolveImage(qrCode, "avatar") : "",
        wechat: service.wechat || service.wechatNo || service.wechatAccount || service.wechatId || service.wechat_id || payload.wechat || "",
        qq: service.qq || service.qqNo || service.qqAccount || payload.qq || "",
        phone: service.contactPhone || service.servicePhone || service.phone || service.mobile || payload.phone || "",
        time: service.appDesc || service.desc || service.description || service.serviceTime || service.service_time || service.workTime || service.work_time || payload.time || "",
        onlineUrl: service.onlineUrl || service.online_url || service.entryUrl || service.linkUrl || service.url || "",
        list,
      },
    };
  });
}

export function getEcoApplications(params = {}) {
  return request.get("miniapp/eco-applications", { params }).then((res) => {
    if (res.code != 1) return res;
    const payload = res.data || {};
    const list = extractList(payload);
    return {
      ...res,
      data: {
        ...payload,
        list: list.map(normalizeEcoApplication),
        customerService: payload.customerService || payload.customer_service || {},
      },
    };
  });
}

// 足迹气泡
export function getBubbleLists() {
  return request.get("miniapp/home/recent-visits")
    .then(normalizeBubbleListsResponse)
    .catch(() => ({
      code: 1,
      data: {
        lists: [],
        time: Math.floor(Date.now() / 1000),
      },
    }));
}

export function getRecentVisitShops(params = {}) {
  return request.get("miniapp/home/recent-visits", { params: { pageNo: params.pageNo || 1, pageSize: params.pageSize || 20, targetType: "SHOP" } })
    .then(normalizeRecentVisitShopResponse)
    .catch(() => ({ code: 1, data: [] }));
}

export function subscribeShop(data = {}) {
  const shopId = data.shopId || data.shop_id || data.id || "";
  if (!shopId) return Promise.resolve({ code: 0, msg: "缺少门店ID" });
  const payload = {
    shopId,
    shop_id: shopId,
    subscribed: data.subscribed,
  };
  return request.post(`miniapp/shop/${shopId}/subscribe`, payload).catch(() => (
    request.post("miniapp/user/shop-subscribe", payload)
  ));
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
    .then((res) => ({ ...res, data: extractList(res.data || {}) }));
}

// 获取支付配置
export function getPayway(params = {}) {
  const bizOrderNo = params.bizOrderNo || params.payOrderNo || params.order_no || params.order_id;
  if (bizOrderNo) {
    if (params.from === "recharge") {
      return request.get("miniapp/wallet/balance").then((res) => normalizePaywayResponse(res, params));
    }
    return request.get(`miniapp/orders/${bizOrderNo}`).then((res) => normalizePaywayResponse(res, params));
  }
  return Promise.resolve({ code: 0, msg: "缺少支付业务单号", data: null });
}

function normalizeShareQrcodeResponse(res, fallbackPath = "") {
  const data = res && res.data ? res.data : {};
  const qrcodeInfo = data.qrcodeInfo || data.qrCodeInfo || data.qrcode_info || data.qr_code_info || {};
  const qrCode = data.qr_code || data.qrCode || data.qrcode || data.image || data.urlImage
    || qrcodeInfo.qr_code || qrcodeInfo.qrCode || qrcodeInfo.qrcode || qrcodeInfo.image || qrcodeInfo.urlImage;
  return {
    ...(res || {}),
    code: qrCode || res?.code == 1 ? 1 : 0,
    data: {
      ...data,
      qr_code: qrCode || "",
      path: data.path || data.pagePath || fallbackPath,
    },
  };
}

function buildShareQrcodePayload(params = {}) {
  const path = params.path || params.pagePath || params.url || "";
  return {
    ...params,
    path: path.replace(/^\//, ""),
    pagePath: path.replace(/^\//, ""),
    url: path.replace(/^\//, ""),
  };
}

// 获取微信小程序码-生成海报需使用
export function getShareMnQrcode(params = {}) {
  const payload = buildShareQrcodePayload(params);
  const fallbackPath = payload.path ? `/${payload.path}` : "";
  const shopId = payload.shopId || payload.shop_id || "";
  const fallback = () => shopId
    ? request.get("miniapp/shop/" + shopId, { params: payload }).then((res) => normalizeShareQrcodeResponse(res, fallbackPath))
    : Promise.resolve({ code: 1, data: { qr_code: "", path: fallbackPath } });

  return request.post("miniapp/share/qrcode", payload)
    .then((res) => {
      const normalized = normalizeShareQrcodeResponse(res, fallbackPath);
      return normalized.data.qr_code ? normalized : fallback();
    })
    .catch(fallback);
}
