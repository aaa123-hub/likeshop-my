import axios from "../js_sdk/xtshadow-axios/axios.min";
import store from "../store";
import { paramsToStr, currentPage, tabbarList, acountList } from "./tools";
import Cache from "./cache";
import { TOKEN, BACK_URL, USER_INFO } from "../config/cachekey";
import { baseURL } from "../config/app";
import { getWxCode, toLogin, wxMnpLogin } from "./login";

let index = 0;
let reloginPromise = null;

const IMAGE_FIELD_PATTERN = /(^|_)(image|img|icon|avatar|cover|logo|thumb|thumbnail|pic|poster|photo)(s|url|urls|_url|_urls)?$/i;
const ISO_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

function isSkippableUrl(value = "") {
  return /^(https?:)?\/\//i.test(value)
    || /^(data|blob|wxfile|file):/i.test(value)
    || value.startsWith("#");
}

function normalizeBackendImageUrl(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || isSkippableUrl(trimmed)) return value;
  if (trimmed.includes(",")) {
    return trimmed.split(",").map((item) => normalizeBackendImageUrl(item)).join(",");
  }
  return trimmed.startsWith("/") ? `${baseURL}${trimmed}` : `${baseURL}/${trimmed}`;
}

function normalizeResponseImages(target, parentKey = "") {
  if (!target || typeof target !== "object") return target;
  if (Array.isArray(target)) {
    target.forEach((item) => normalizeResponseImages(item, parentKey));
    return target;
  }
  Object.keys(target).forEach((key) => {
    const value = target[key];
    if (typeof value === "string" && IMAGE_FIELD_PATTERN.test(key)) {
      target[key] = normalizeBackendImageUrl(value);
      return;
    }
    if (Array.isArray(value) && IMAGE_FIELD_PATTERN.test(key)) {
      target[key] = value.map((item) => typeof item === "string" ? normalizeBackendImageUrl(item) : normalizeResponseImages(item, key));
      return;
    }
    if (value && typeof value === "object") normalizeResponseImages(value, key);
  });
  return target;
}

function formatIsoTime(value) {
  const normalized = value.replace(/(\.\d{3})\d+/, "$1");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizeResponseTimes(target) {
  if (!target || typeof target !== "object") return target;
  if (Array.isArray(target)) {
    target.forEach((item) => normalizeResponseTimes(item));
    return target;
  }
  Object.keys(target).forEach((key) => {
    const value = target[key];
    if (typeof value === "string" && ISO_TIME_PATTERN.test(value)) {
      target[key] = formatIsoTime(value);
      return;
    }
    if (value && typeof value === "object") normalizeResponseTimes(value);
  });
  return target;
}

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
  if (/^miniapp\/orders\/[^/]+\/cancel$/.test(url)) return false;
  return [
    "miniapp/addresses",
    "miniapp/cart",
    "miniapp/orders",
    "miniapp/payments",
    "miniapp/wallet",
    "miniapp/coupons",
    "miniapp/alliance",
    "miniapp/favorites",
    "miniapp/feedback",
    "miniapp/service/tickets",
    "miniapp/eco-applications/merchant-qualification",
    "miniapp/merchant-applications",
    "miniapp/messages",
    "miniapp/points",
    "miniapp/kyc",
    "miniapp/offline-payments",
    "miniapp/user/profile",
    "miniapp/after-sales",
    "miniapp/lottery",
    "miniapp/sms",
    "miniapp/wechat/official-account",
  ].some((prefix) => url.startsWith(prefix));
}

function shouldAttachUserIdToQuery(url = "", method = "") {
  const normalizedMethod = String(method || "").toUpperCase();
  return normalizedMethod === "GET"
    || url.startsWith("miniapp/user/profile")
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

function isAuthRequest(url = "") {
  return url.startsWith("miniapp/auth/");
}

function isLoginExpiredResponse(code, message = "", statusCode) {
  const normalizedCode = String(code || "");
  const normalizedMessage = String(message || "").toLowerCase();
  if (statusCode === 401) return true;
  if (normalizedCode === "A0106") return normalizedMessage.includes("token");
  if (normalizedCode === "A0107") {
    return normalizedMessage.includes("token") || normalizedMessage.includes("permission denied");
  }
  return normalizedCode === "-1";
}

function isMissingStaticResourceResponse(code, message = "") {
  return String(code || "").toUpperCase() === "A0108"
    && /no static resource/i.test(String(message || ""));
}

function reloginAfterAuthExpired() {
  if (!reloginPromise) {
    store.commit("LOGOUT");
    //#ifdef MP-WEIXIN
    reloginPromise = Promise.resolve(wxMnpLogin()).finally(() => {
      reloginPromise = null;
    });
    // #endif
    //#ifndef MP-WEIXIN
    reloginPromise = Promise.resolve().finally(() => {
      reloginPromise = null;
    });
    // #endif
  }
  return reloginPromise;
}

function canRetryAfterRelogin(config = {}) {
  return config && !config.__retriedAfterRelogin && !isAuthRequest(config.url || "");
}

async function retryAfterRelogin(config) {
  await reloginAfterAuthExpired();
  const token = Cache.get(TOKEN);
  if (!token) return null;
  return service.request({
    ...config,
    __retriedAfterRelogin: true,
    header: {
      ...(config.header || {}),
      token,
      Authorization: `Bearer ${token}`,
    },
  });
}

function handleLoginExpired(route, options) {
  reloginAfterAuthExpired();
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
    return Promise.reject(error);
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
        data.msg = data.msg || data.message || "操作成功";
      } else if (backendCode !== undefined && backendCode !== 1 && backendCode !== 0) {
        data.rawCode = backendCode;
        data.code = 0;
        data.msg = backendMessage || "请求失败";
      } else if (backendMessage && !data.msg) {
        data.msg = backendMessage;
      }
      if (String(data.msg || '').toUpperCase() === 'SUCCESS') data.msg = '操作成功';
      if (response.config?.show === false) data.show = false;

      const { code, show, msg, rawCode } = data;
      const { route, options } = currentPage();
      if (!isAuthRequest(response.config?.url || "") && isLoginExpiredResponse(rawCode || code, msg, response.statusCode || response.status)) {
        if (canRetryAfterRelogin(response.config)) {
          const retryResponse = await retryAfterRelogin(response.config);
          if (retryResponse) return retryResponse;
        }
        handleLoginExpired(route, options);
        data.show = false;
      } else if (isMissingStaticResourceResponse(rawCode || backendCode || code, msg)) {
        data.show = false;
      } else if (code == 0 && msg && show !== false) {
        uni.showToast({
          title: msg,
          icon: "none",
        });
      } else if (code == -1) {
        handleLoginExpired(route, options);
      }

      if (data.data) {
        normalizeResponseImages(data.data);
        normalizeResponseTimes(data.data);
      }
    }

    return Promise.resolve(response.data);
  },
  async (error) => {
    if (error && error.__skipRequest) {
      return Promise.resolve(error.responseData);
    }
    const responseData = error && error.response && error.response.data;
    if (responseData && responseData.code !== undefined) {
      const message = responseData.message || responseData.msg || "请求失败";
      const statusCode = error.response.statusCode || error.response.status;
      if (!isAuthRequest(error.config?.url || "") && isLoginExpiredResponse(responseData.code, message, statusCode)) {
        if (canRetryAfterRelogin(error.config)) {
          const retryResponse = await retryAfterRelogin(error.config);
          if (retryResponse) return retryResponse;
        }
        const { route, options } = currentPage();
        handleLoginExpired(route, options);
        return Promise.resolve({
          ...responseData,
          rawCode: responseData.code,
          code: 0,
          msg: message,
          show: false,
        });
      }
      const shouldShow = error.config?.show === false ? false : !isMissingStaticResourceResponse(responseData.code, message);
      if (shouldShow) {
        uni.showToast({
          title: message,
          icon: "none",
        });
      }
      return Promise.resolve({
        ...responseData,
        rawCode: responseData.code,
        code: 0,
        msg: message,
        show: shouldShow,
      });
    }
    return Promise.reject(error);
  }
);

export default service;
