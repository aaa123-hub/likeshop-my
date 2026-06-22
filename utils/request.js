import axios from "../js_sdk/xtshadow-axios/axios.min";
import store from "../store";
import { paramsToStr, currentPage, tabbarList, acountList } from "./tools";
import Cache from "./cache";
import { TOKEN, BACK_URL, USER_INFO } from "../config/cachekey";
import { baseURL } from "../config/app";
import { getWxCode, toLogin, wxMnpLogin } from "./login";

let index = 0;

function checkParams(params) {
  if (typeof params != "object") return params;
  for (let key in params) {
    const value = params[key];
    if (value === null || value === undefined || value === "") {
      delete params[key];
    }
  }
  return params;
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === "";
}

function getParamValue(config, names = []) {
  const sourceList = [config.params, config.data];
  for (const source of sourceList) {
    if (!source || typeof source !== "object") continue;
    for (const name of names) {
      if (!isEmptyValue(source[name])) return source[name];
    }
  }
  const query = String(config.url || "").split("?")[1] || "";
  if (query) {
    const queryParams = query.split("&").reduce((params, pair) => {
      const [key, value] = pair.split("=");
      params[decodeURIComponent(key || "")] = decodeURIComponent(value || "");
      return params;
    }, {});
    for (const name of names) {
      if (!isEmptyValue(queryParams[name])) return queryParams[name];
    }
  }
  return undefined;
}

function hasInvalidPathParam(url = "") {
  return /(^|\/)(undefined|null|NaN)(\/|\?|$)/.test(url) || /\/$/.test(url);
}

function validateRequestParams(config) {
  const url = config.url || "";
  const method = String(config.method || "GET").toUpperCase();
  const missing = [];

  if (url.startsWith("miniapp/user/profile") && !getParamValue(config, ["userId", "user_id", "id"])) {
    missing.push("userId");
  }
  if (/^miniapp\/(product|shop)\//.test(url) && hasInvalidPathParam(url.split("?")[0])) {
    missing.push(url.startsWith("miniapp/product/") ? "spuId" : "shopId");
  }
  if (/^miniapp\/coupons\//.test(url) && hasInvalidPathParam(url.split("?")[0])) {
    missing.push("couponId");
  }
  if (/^miniapp\/messages\//.test(url) && hasInvalidPathParam(url.split("?")[0])) {
    missing.push("messageId");
  }
  if (/^miniapp\/orders\//.test(url) && hasInvalidPathParam(url.split("?")[0])) {
    missing.push("orderNo");
  }
  if (url === "miniapp/cart/items" && method === "POST") {
    if (!getParamValue(config, ["skuId", "sku_id", "item_id"])) missing.push("skuId");
    if (!getParamValue(config, ["quantity", "goods_num", "num"])) missing.push("quantity");
  }
  if (url === "miniapp/orders/preview" && method === "POST" && !getParamValue(config, ["source"])) {
    missing.push("source");
  }
  if (url === "miniapp/payments/create" && method === "POST") {
    if (!getParamValue(config, ["bizType"])) missing.push("bizType");
    if (!getParamValue(config, ["bizOrderNo"])) missing.push("bizOrderNo");
    if (!getParamValue(config, ["payMethod"])) missing.push("payMethod");
    if (!getParamValue(config, ["idempotentKey"])) missing.push("idempotentKey");
  }
  if (url === "miniapp/kyc/submit" && method === "POST") {
    if (!getParamValue(config, ["realName"])) missing.push("realName");
    if (!getParamValue(config, ["certType"])) missing.push("certType");
    if (!getParamValue(config, ["certNo"])) missing.push("certNo");
    if (!getParamValue(config, ["certFrontUrl"])) missing.push("certFrontUrl");
    if (!getParamValue(config, ["certBackUrl"])) missing.push("certBackUrl");
    if (!getParamValue(config, ["requestNo"])) missing.push("requestNo");
  }
  if (url === "miniapp/feedback" && method === "POST") {
    if (!getParamValue(config, ["feedbackType", "type"])) missing.push("feedbackType");
    if (!getParamValue(config, ["content", "feedbackContent"])) missing.push("content");
    if (!getParamValue(config, ["idempotentKey"])) missing.push("idempotentKey");
  }

  return Array.from(new Set(missing));
}

function rejectMissingParams(config, missing) {
  const responseData = {
    code: 0,
    msg: `缺少必要参数：${missing.join(", ")}`,
    message: `缺少必要参数：${missing.join(", ")}`,
    data: null,
  };
  console.warn("[request] 缺少必要参数，已取消接口请求", {
    url: config.url,
    method: String(config.method || "GET").toUpperCase(),
    missing,
    params: config.params || {},
    data: config.data || {},
  });
  return Promise.reject({
    __skipRequest: true,
    responseData,
  });
}

function getCurrentUserId() {
  const stateUserInfo = store.getters.userInfo || {};
  const cachedUserInfo = Cache.get(USER_INFO) || {};
  return stateUserInfo.userId || stateUserInfo.user_id || stateUserInfo.id
    || cachedUserInfo.userId || cachedUserInfo.user_id || cachedUserInfo.id;
}

function shouldAttachUserId(url = "") {
  return [
    "miniapp/addresses",
    "miniapp/cart",
    "miniapp/orders",
    "miniapp/payments",
    "miniapp/wallet",
    "miniapp/favorites",
    "miniapp/feedback",
    "miniapp/service/tickets",
    "miniapp/eco-applications/merchant-qualification",
    "miniapp/messages",
    "miniapp/points",
    "miniapp/kyc",
    "miniapp/offline-payments",
    "miniapp/user/profile",
  ].some((prefix) => url.startsWith(prefix));
}

function shouldAttachUserIdToQuery(url = "", method = "") {
  const normalizedMethod = String(method || "").toUpperCase();
  return normalizedMethod === "GET"
    || url.startsWith("miniapp/addresses")
    || (url.startsWith("miniapp/cart") && ["PUT", "DELETE"].includes(normalizedMethod));
}

function appendParamsToUrl(config) {
  if (!config.params || typeof config.params !== "object") return;
  const query = paramsToStr(config.params);
  if (!query || query === "?") return;
  config.url += config.url.includes("?") ? `&${query.slice(1)}` : query;
  config.params = undefined;
}

function attachUserId(config) {
  const url = config.url || "";
  if (!shouldAttachUserId(url)) return;
  const userId = getCurrentUserId();
  if (!userId) return;

  if (shouldAttachUserIdToQuery(url, config.method)) {
    config.params = config.params || {};
    config.params.userId = config.params.userId || config.params.user_id || userId;
    return;
  }

  config.data = config.data || {};
  if (typeof config.data === "object" && !Array.isArray(config.data)) {
    config.data.userId = config.data.userId || config.data.user_id || userId;
  }
}

const service = axios.create({
  baseURL: `${baseURL}/api/`,
  timeout: 10000,
  header: {
    "content-type": "application/json",
  },
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    config.header = config.header || {};
    config.data = checkParams(config.data);
    config.params = checkParams(config.params);
    attachUserId(config);
    const missingParams = validateRequestParams(config);
    if (missingParams.length) return rejectMissingParams(config, missingParams);
    appendParamsToUrl(config);
    const token = config.header.token || Cache.get(TOKEN);
    if (token) {
      config.header.token = token;
      config.header.Authorization = config.header.Authorization || `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  async (response) => {
    if (response.data) {
      const data = response.data;
      const backendCode = data.code;
      const backendMessage = data.message || data.msg;
      if (backendCode === "0") {
        data.rawCode = data.code;
        data.code = 1;
        data.msg = data.msg || data.message || "SUCCESS";
      } else if (backendCode !== undefined && backendCode !== 1 && backendCode !== 0) {
        data.rawCode = backendCode;
        data.code = 0;
        data.msg = backendMessage || "请求失败";
      } else if (backendMessage && !data.msg) {
        data.msg = backendMessage;
      }

      const { code, show, msg } = data;
      const { route, options } = currentPage();
      if (code == 0 && msg && show !== false) {
        uni.showToast({
          title: msg,
          icon: "none",
        });
      } else if (code == -1) {
        store.commit("LOGOUT");
        //#ifdef MP-WEIXIN
        wxMnpLogin();
        // #endif
        //#ifdef H5 || APP-PLUS
        if (route && !tabbarList.includes(route)) {
          toLogin();
        }
        // #endif
        //#ifdef H5
        if (!acountList.includes(route)) {
          Cache.set(BACK_URL, `/${route}${paramsToStr(options)}`);
        }
        // #endif
      }
    }

    return Promise.resolve(response.data);
  },
  (error) => {
    if (error && error.__skipRequest) {
      return Promise.resolve(error.responseData);
    }
    const responseData = error && error.response && error.response.data;
    if (responseData && responseData.code !== undefined) {
      const message = responseData.message || responseData.msg || "请求失败";
      uni.showToast({
        title: message,
        icon: "none",
      });
      return Promise.resolve({
        ...responseData,
        rawCode: responseData.code,
        code: 0,
        msg: message,
      });
    }
    // tryHideFullScreenLoading()
    console.log(error);
    console.log("err" + error); // for debug
    return Promise.reject(error);
  }
);

export default service;
