import request from "@/utils/request";
import wechath5 from "@/utils/wechath5";
import { client } from "@/utils/tools";

export const miniappTestLoginPayload = {
  loginCode: "demo-openid-0001",
  channelCode: "wechat-miniapp",
  deviceId: "dev-001",
};

function normalizeMiniappLoginResult(res) {
  const payload = res && res.data ? res.data : res;
  const accessToken = payload && (payload.accessToken || payload.token);

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
      user_id: payload.userId,
      openid: payload.openId,
      session_key: payload.sessionKey,
      user_status: payload.userStatus,
      need_bind_mobile: payload.needBindMobile,
      need_kyc: payload.needKyc,
      is_new_user: false,
    },
  };
}

function buildMiniappLoginPayload(data = {}) {
  const { loginCode, channelCode, deviceId } = data;

  return {
    loginCode: loginCode || miniappTestLoginPayload.loginCode,
    channelCode: channelCode || miniappTestLoginPayload.channelCode,
    deviceId: deviceId || miniappTestLoginPayload.deviceId,
  };
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
    package: payInfo.package,
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
  const avatar = user.avatar || item.avatar || item.headimgurl || "/static/images/my_portrait_empty.png";
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

//小程序授权登录
export async function authLogin(data) {
  const res = await request.post("miniapp/auth/wechat-login", buildMiniappLoginPayload(data));
  return normalizeMiniappLoginResult(res);
}
//小程序静默登录
export async function silentLogin(data) {
  const res = await request.post("miniapp/auth/wechat-login", buildMiniappLoginPayload(data));
  return normalizeMiniappLoginResult(res);
}

//更新小程序头像昵称
export function updateUser(data, token) {
  return request.post("miniapp/auth/bind-mobile", data, { header: { token } });
}
// app登录
export function opLogin(data) {
  return authLogin({ ...data, channelCode: "wechat-miniapp", deviceId: "dev-001" });
}

//预支付接口
export async function prepay(data = {}) {
  const res = await request.post("miniapp/payments/create", {
    bizType: data.bizType || (data.from === "recharge" ? "RECHARGE" : "ORDER"),
    bizOrderNo: data.bizOrderNo || data.payOrderNo || data.order_no || data.order_id,
    payMethod: normalizePayMethod(data.payMethod || data.pay_way || data.payWay),
    clientIp: data.clientIp || "127.0.0.1",
    idempotentKey:
      data.idempotentKey ||
      `pay-${data.order_id || data.bizOrderNo || Date.now()}-${normalizePayMethod(data.pay_way)}`,
    client,
  });
  return normalizePaymentResponse(res);
}

//小程序订阅
export function getMnpNotice(data) {
  return Promise.resolve({ code: 1, data: [] });
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
  return Promise.resolve({ code: 1, data: {} });
}

// 忘记密码
export function forgetPwd(data) {
  return Promise.resolve({ code: 0, msg: "当前小程序接口文档暂未提供找回密码接口" });
}

// 发送短信
export function sendSms(data) {
  return Promise.resolve({ code: 1, msg: "开发环境默认验证码已兼容", data: { smsCode: data?.smsCode || "000000" } });
}

// Html5 注册账号
export function register(data) {
  return authLogin(data);
}

// 获取服务协议
export function getServerProto() {
  return Promise.resolve({ code: 1, data: { content: "" } });
}

// 获取隐私政策
export function getPrivatePolicy() {
  return Promise.resolve({ code: 1, data: { content: "" } });
}

// 售后保障
export function getAfterSaleGuar() {
  return Promise.resolve({ code: 1, data: { content: "" } });
}

//客服
export function getService() {
  return Promise.resolve({ code: 1, data: [] });
}

// 足迹气泡
export function getBubbleLists() {
  return request.get("miniapp/home/recent-visits").then(normalizeBubbleListsResponse);
}

// 用户自定义分享
export function userShare(params) {
  return Promise.resolve({
    code: 1,
    data: {
      mnp_share_title: "商街生活",
      mnp_share_image: "",
      h5_share_title: "商街生活",
      h5_share_image: "",
      ...params,
    },
  });
}

// 验证码登录
export function smsCodeLogin(data) {
  return authLogin(data);
}
export function getConfig() {
  return Promise.resolve({
    code: 1,
    data: {
      name: "商街生活",
      app_agreement: 0,
      center_setting: {},
      index_setting: {},
      navigation_menu: [],
      navigation_setting: {},
      register_setting: false,
    },
  });
}

// 注册赠送优惠券
export function getRegisterCoupon() {
  return Promise.resolve({ code: 1, data: [] });
}

// 获取支付配置
export function getPayway(params) {
  return Promise.resolve({
    code: 1,
    data: {
      order_amount: params?.order_amount || 0,
      cancel_time: Math.floor(Date.now() / 1000) + 30 * 60,
      pay: [
        {
          id: "BALANCE",
          name: "余额支付",
          pay_way: "BALANCE",
          extra: "使用账户余额完成支付",
          icon: "/static/images/icon_my_payment.png",
        },
        {
          id: "WECHAT",
          name: "微信支付",
          pay_way: "WECHAT",
          extra: "调用微信支付",
          icon: "/static/images/icon_wechat.png",
        },
      ],
    },
  });
}

// 获取微信小程序码-生成海报需使用
export function getShareMnQrcode(params) {
  return request.get("miniapp/shop/" + (params.shopId || params.shop_id || ''), { params });
}
