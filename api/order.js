import request from "@/utils/request";
import { resolveImage } from "@/utils/image-placeholder";

let latestSubmitToken = "";

function normalizeOrderItem(item = {}) {
  const image = resolveImage(item.image || item.imageUrl || item.mainImageUrl || item.cover || item.skuImage || item.skuImageUrl || item.goodsImage, "goods");
  const price = item.goods_price || item.goodsPrice || item.salePrice || item.unitPrice || item.price || 0;
  return {
    ...item,
    id: item.id || item.orderItemId || item.itemId || item.skuId,
    item_id: item.item_id || item.orderItemId || item.itemId || item.skuId,
    goods_id: item.goods_id || item.spuId || item.goodsId,
    sku_id: item.sku_id || item.skuId,
    goods_name: item.goods_name || item.spuName || item.productName || item.goodsName || item.skuName || item.name,
    name: item.name || item.spuName || item.productName || item.goodsName || item.skuName,
    image,
    image_str: item.image_str || image,
    spec_value_str: item.spec_value_str || item.specValue || item.skuName || "",
    spec_value: item.spec_value || item.specValue || item.skuName || "",
    goods_num: item.goods_num || item.quantity || item.num || 1,
    goods_price: price,
    total_price: item.total_price || item.totalAmount || item.realAmount || price,
    original_price: item.original_price || item.originPrice || item.marketPrice || price,
    is_express: item.is_express ?? item.supportDelivery ?? true,
    is_selffetch: item.is_selffetch ?? item.supportPickup ?? true,
  };
}

function normalizeOrderListItem(item = {}) {
  const detail = normalizeOrderDetail(item);
  const status = detail.order_status;
  return {
    ...detail,
    id: detail.id || detail.orderNo || detail.order_sn,
    order_status_desc: detail.order_status_desc || formatOrderStatus(status),
    pay_btn: detail.pay_btn ?? status === "CREATED",
    cancel_btn: detail.cancel_btn ?? status === "CREATED",
    take_btn: detail.take_btn ?? status === "SHIPPED",
    del_btn: detail.del_btn ?? ["CANCELLED", "COMPLETED"].includes(status),
    order_goods: detail.order_goods?.length ? detail.order_goods : (item.itemList || item.items || []).map(normalizeOrderItem),
    goods_lists: detail.goods_lists?.length ? detail.goods_lists : (item.itemList || item.items || []).map(normalizeOrderItem),
  };
}

function formatOrderStatus(status) {
  const statusMap = {
    CREATED: "待付款",
    PAID: "待发货",
    SHIPPED: "待收货",
    COMPLETED: "已完成",
    CANCELLED: "已关闭",
  };
  return statusMap[status] || status || "";
}

function normalizeOrderStatus(status) {
  const statusMap = {
    all: "",
    pay: "CREATED",
    created: "CREATED",
    wait_pay: "CREATED",
    WAIT_PAY: "CREATED",
    ship: "PAID",
    paid: "PAID",
    wait_ship: "PAID",
    WAIT_SHIP: "PAID",
    delivery: "SHIPPED",
    shipped: "SHIPPED",
    finish: "COMPLETED",
    completed: "COMPLETED",
    close: "CANCELLED",
    cancelled: "CANCELLED",
  };
  return statusMap[String(status || "")] ?? status;
}

function normalizeOrderPage(data = {}) {
  const list = (data.list || data.records || data.items || data.rows || data.content || []).map(normalizeOrderListItem);
  return {
    ...data,
    list,
    lists: list,
    more: data.hasNext ?? data.more ?? false,
    page_no: data.pageNo || data.page_no || 1,
    page_size: data.pageSize || data.page_size || list.length || 10,
    total: data.total || list.length
  };
}

function flattenShopOrders(shopOrders = []) {
  return shopOrders.reduce((list, shop) => {
    const items = shop.itemList || shop.items || shop.goodsList || shop.goods_lists || [];
    return list.concat(items.map((item) => normalizeOrderItem({
      ...item,
      shop_id: item.shop_id || shop.shopId,
      shop_name: item.shop_name || shop.shopName
    })));
  }, []);
}

function normalizeOrderPreview(data = {}) {
  const goodsLists = data.goods_lists || data.itemList || data.items || flattenShopOrders(data.shopOrders || []);
  return {
    ...data,
    address: data.address || {},
    shop_orders: data.shopOrders || data.shop_orders || [],
    goods_lists: goodsLists,
    total_goods_price: data.goodsAmount || data.total_goods_price || 0,
    discount_amount: data.discountAmount || data.discount_amount || 0,
    shipping_price: data.freightAmount || data.shipping_price || 0,
    order_amount: data.payAmount || data.order_amount || 0,
    usableCoupon: data.availableCoupons || [],
    usable_coupon: data.availableCoupons || [],
    usable: data.availableCoupons || data.usable || [],
    unusable: data.unusable || [],
  };
}

function normalizeOrderDetail(data = {}) {
  const baseInfo = data.baseInfo || data
  const amountInfo = data.amountInfo || {}
  const itemList = (data.itemList || data.order_goods || data.goods_lists || []).map(normalizeOrderItem)
  const orderStatus = data.orderStatus || baseInfo.orderStatus || data.order_status
  const payAmount = amountInfo.payAmount || amountInfo.orderAmount || baseInfo.payAmount || baseInfo.orderAmount || data.payAmount || data.orderAmount || data.totalAmount || data.order_amount || 0
  return {
    ...data,
    id: data.orderNo || baseInfo.orderNo || data.id,
    order_sn: data.orderNo || baseInfo.orderNo || baseInfo.orderSn || data.order_sn,
    order_status: orderStatus,
    pay_status: data.payStatus || baseInfo.payStatus || data.pay_status,
    order_amount: payAmount,
    payAmount,
    goods_price: amountInfo.goodsAmount || baseInfo.goodsAmount || data.goods_price || 0,
    shipping_price: amountInfo.freightAmount || baseInfo.freightAmount || data.shipping_price || 0,
    discount_amount: amountInfo.discountAmount || baseInfo.discountAmount || data.discount_amount || 0,
    integral_amount: amountInfo.integralAmount || baseInfo.integralAmount || data.integral_amount || 0,
    order_goods: itemList,
    goods_lists: itemList,
    order_type_desc: data.orderTypeDesc || baseInfo.orderTypeDesc || data.order_type_desc,
    pay_way_text: data.payMethod || baseInfo.payMethod || data.pay_way_text,
    create_time: baseInfo.createdAt || baseInfo.createTime || data.createdAt || data.create_time,
    pay_time: baseInfo.paidAt || baseInfo.payTime || data.paidAt || data.pay_time,
    shipping_time: baseInfo.shippedAt || baseInfo.shippingTime || data.shippedAt || data.shipping_time,
    confirm_take_time: baseInfo.confirmTime || data.confirm_take_time,
    cancel_time: baseInfo.cancelTime || data.cancel_time,
    order_cancel_time: baseInfo.expireTime || data.order_cancel_time,
    delivery_type: baseInfo.deliveryType || data.delivery_type,
    order_type: baseInfo.orderType || data.order_type || 0,
    consignee: baseInfo.consignee || baseInfo.receiverName || data.consignee,
    mobile: baseInfo.mobile || baseInfo.receiverMobile || data.mobile,
    delivery_address: baseInfo.addressText || baseInfo.deliveryAddress || baseInfo.detailAddress || data.delivery_address,
    selffetch_shop: baseInfo.selffetchShop || data.selffetch_shop || {},
    pickup_code: baseInfo.pickupCode || data.verifyInfo?.pickupCode || data.pickup_code,
    verification_status: baseInfo.verificationStatus || data.verifyInfo?.verificationStatus || data.verification_status,
    status_flow: data.statusFlow || data.status_flow || [],
    refund_info: data.refundInfo || data.refund_info || {},
    verify_info: data.verifyInfo || data.verify_info || {},
    team: data.team || {},
    cancel_btn: data.cancel_btn ?? orderStatus === 'CREATED',
    delivery_btn: data.delivery_btn ?? orderStatus === 'SHIPPED',
    take_btn: data.take_btn ?? orderStatus === 'SHIPPED',
    del_btn: data.del_btn ?? ['CANCELLED', 'COMPLETED'].includes(orderStatus),
    pay_btn: data.pay_btn ?? orderStatus === 'CREATED'
  }
}

function normalizePayResult(data = {}) {
  return {
    ...data,
    timeStamp: data.timeStamp || data.timestamp,
    nonceStr: data.nonceStr || data.nonce_str,
    package: data.package,
    signType: data.signType || data.sign_type || 'RSA',
    paySign: data.paySign || data.pay_sign,
    orderInfo: data.orderInfo || data.order_info || data.channelPayInfo
  }
}

function normalizeSubmitOrder(data = {}) {
  return {
    ...data,
    order_id: data.orderNo || data.order_id || data.id,
    orderNo: data.orderNo || data.order_id || data.id,
    type: data.type || 'order',
    payOrderNo: data.payOrderNo || data.pay_order_no || '',
    pay_order_no: data.pay_order_no || data.payOrderNo || '',
    orderStatus: data.orderStatus || 0,
    payStatus: data.payStatus || '',
    expireTime: data.expireTime || data.cancel_time || 0,
  }
}

//下单
export async function orderBuy(data) {
  const isSubmit = data && (data.action === 'submit' || data.submitToken || data.source || data.payScene || data.idempotentKey);
  const goodsList = data.goods || [];
  const cartItemIds = data.cartItemIds || goodsList.map((item) => item.cartItemId || item.cart_id).filter(Boolean);
  const payload = {
    submitToken: data.submitToken || data.submit_token || data.orderInfo?.submitToken || latestSubmitToken || '',
    source: data.source || (cartItemIds.length ? 'CART' : 'BUY_NOW'),
    cartItemIds,
    skuId: data.skuId || data.item_id || goodsList[0]?.skuId || goodsList[0]?.item_id || goodsList[0]?.id,
    quantity: data.quantity || data.goods_num || goodsList[0]?.quantity || goodsList[0]?.num,
    addressId: data.addressId || data.address_id || '',
    couponIds: data.couponIds || (data.coupon_id ? [data.coupon_id] : []),
    remark: data.remark || data.userRemark || '',
    payScene: data.payScene || 'MINIAPP',
    idempotentKey: data.idempotentKey || `order-${Date.now()}`
  }

  const res = await request.post(isSubmit ? 'miniapp/orders' : 'miniapp/orders/preview', payload);
  if (res && res.code == 1 && res.data) {
    if (!isSubmit && res.data.submitToken) {
      latestSubmitToken = res.data.submitToken;
    }
    return {
      ...res,
      data: isSubmit ? normalizeSubmitOrder(res.data) : normalizeOrderPreview(res.data)
    };
  }
  return res;
}
//删除订单
export function delOrder(id) {
  return cancelOrder(id);
}

// 获取配送方式
export function getDelivery() {
  return Promise.resolve({
    code: 1,
    msg: "使用默认配送方式",
    data: {
      is_express: 1,
      is_selffetch: 1,
      deliveryType: "MIXED"
    }
  });
}

//订单列表
export function getOrderList(data) {
  return request.get("miniapp/orders", {
    params: {
      status: normalizeOrderStatus(data.status || data.type),
      pageNo: data.pageNo || data.page_no || data.page,
      pageSize: data.pageSize || data.page_size || 10
    },
  }).then((res) => res.code == 1 ? { ...res, data: normalizeOrderPage(res.data || {}) } : res);
}
//订单详情
export async function getOrderDetail(id) {
  const res = await request.get(`miniapp/orders/${id}`);
  if (res && res.code == 1 && res.data) {
    return {
      ...res,
      data: normalizeOrderDetail(res.data)
    };
  }
  return res;
}

//取消订单
export function cancelOrder(id) {
  return request.post(`miniapp/orders/${id}/cancel`, {
    reason: "用户取消",
    idempotentKey: `cancel-order-${id}-${Date.now()}`
  });
}

//物流
export function orderTraces(id) {
  return request.get(`miniapp/orders/${id}`);
}

//确认收货
export function confirmOrder(id) {
  return request.post(`miniapp/orders/${id}/confirm-receipt`, {
    idempotentKey: `confirm-order-${id}-${Date.now()}`
  });
}

//下单获取优惠券
export function getOrderCoupon(data) {
  const goodsList = data?.goods || [];
  return request.post("miniapp/orders/preview", {
    source: data?.source || "BUY_NOW",
    cartItemIds: data?.cartItemIds || goodsList.map((item) => item.cartItemId || item.cart_id).filter(Boolean),
    skuId: data?.skuId || data?.item_id || goodsList[0]?.skuId || goodsList[0]?.item_id || goodsList[0]?.id,
    quantity: data?.quantity || data?.goods_num || goodsList[0]?.quantity || goodsList[0]?.num,
    addressId: data?.addressId || data?.address_id || '',
    couponIds: data?.couponIds || (data?.coupon_id ? [data.coupon_id] : []),
    remark: data?.remark || '',
    idempotentKey: data?.idempotentKey || `order-preview-${Date.now()}`
  }).then((res) => {
    if (res.code == 1 && res.data) {
      return {
        ...res,
        data: {
          usable: res.data.availableCoupons || res.data.usable || [],
          unusable: res.data.unusable || [],
          usableCoupon: res.data.availableCoupons || res.data.usable || []
        }
      }
    }
    return res
  });
}

// 核销订单
export function getVerifyLists(data) {
  return request.get("miniapp/orders", {
    params: data,
  });
}
// 核销详情
export function verification(data) {
  return request.post("miniapp/orders/" + data.id + "/verify", {
    ...data,
    idempotentKey: data.idempotentKey || `order-verify-${data.id}-${Date.now()}`
  });
}

// 确认核销
export function verificationConfirm(data) {
  return request.post("miniapp/orders/" + data.id + "/verify/confirm", {
    ...data,
    idempotentKey: data.idempotentKey || `order-verify-confirm-${data.id}-${Date.now()}`
  });
}
//确认收货组件
export function getwxReceiveDetail(params) {
  return request.get(`miniapp/orders/${params.order_id || params.id}`);
}
//查询确认收货
export function getwechatSyncCheck(params) {
  return request.get(`miniapp/orders/${params.id || params.order_id}`);
}
