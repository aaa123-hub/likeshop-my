import request from "@/utils/request";
import { resolveImage } from "@/utils/image-placeholder";

let latestSubmitToken = "";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function numberValue(value, fallback = 0) {
  const number = Number(firstDefined(value, fallback));
  return Number.isNaN(number) ? fallback : number;
}

function normalizeCouponItem(item = {}) {
  const threshold = firstDefined(item.use_condition, item.useCondition, item.conditionText, item.thresholdAmount, item.minAmount, item.useThreshold);
  const amount = firstDefined(item.money, item.amount, item.discountAmount, item.couponAmount, item.value, 0);
  return {
    ...item,
    id: firstDefined(item.id, item.couponId, item.userCouponId),
    coupon_id: firstDefined(item.coupon_id, item.couponId, item.id, item.userCouponId),
    name: firstDefined(item.name, item.couponName, item.coupon_name, item.title, "优惠券"),
    money: amount,
    use_condition: item.use_condition || item.useCondition || item.conditionText || (threshold ? `满${threshold}可用` : "无门槛"),
    coupon_type: item.coupon_type || item.couponType || item.typeText || "优惠券",
    use_time_tips: item.use_time_tips || item.useTimeTips || item.validTimeText || item.valid_time_text || "有效期以实际使用规则为准",
    tips: item.tips || item.reason || item.unavailableReason || item.unavailable_reason || ""
  };
}

function normalizeOrderItem(item = {}) {
  const image = resolveImage(item.image || item.image_str || item.imageUrl || item.goodsImageUrl || item.mainImageUrl || item.cover || item.skuImage || item.skuImageUrl || item.goodsImage || item.picUrl, "goods");
  const price = item.goods_price || item.goodsPrice || item.salePrice || item.unitPrice || item.price;
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
    shop_logo: resolveImage(item.shop_logo || item.shopLogo || item.shopLogoUrl || item.storeLogo || "", "goods"),
    spec_value_str: item.spec_value_str || item.specValue || item.skuName || "",
    spec_value: item.spec_value || item.specValue || item.skuName || "",
    goods_num: item.goods_num || item.quantity || item.num,
    goods_price: price,
    total_price: item.total_price || item.totalAmount || item.realAmount || price,
    original_price: item.original_price || item.originPrice || item.marketPrice || price,
    is_express: item.is_express ?? item.supportDelivery ?? true,
    is_selffetch: item.is_selffetch ?? item.supportPickup ?? true,
  };
}

function formatOrderStatus(status) {
  const normalized = String(status || '').toUpperCase();
  const statusMap = {
    CREATED: "待付款",
    WAIT_PAY: "待付款",
    PENDING_PAY: "待付款",
    UNPAID: "待付款",
    PAID: "待发货",
    WAIT_SHIP: "待发货",
    WAIT_DELIVERY: "待发货",
    SHIPPED: "待收货",
    WAIT_RECEIVE: "待收货",
    DELIVERED: "待收货",
    COMPLETED: "已完成",
    SUCCESS: "已完成",
    FINISHED: "已完成",
    CANCELLED: "已关闭",
    CANCELED: "已关闭",
    CLOSED: "已关闭",
    CLOSE: "已关闭",
    REFUNDING: "售后处理中",
    REFUNDED: "已退款"
  };
  return statusMap[normalized] || status || "";
}
function normalizeOrderDetail(data = {}) {
  const baseInfo = data.baseInfo || data;
  const amountInfo = data.amountInfo || {};
  const deliveryInfo = data.deliveryInfo || data.delivery_info || data.logisticsInfo || data.logistics_info || {};
  const receiverInfo = data.receiverInfo || data.receiver_info || data.addressInfo || data.address_info || {};
  const shopInfo = data.shopInfo || data.shop_info || data.storeInfo || data.store_info || {};
  const status = firstDefined(data.orderStatus, baseInfo.orderStatus, data.order_status, data.status);
  const normalizedStatus = String(status || '').toUpperCase();
  const isWaitPay = ['CREATED', 'WAIT_PAY', 'PENDING_PAY', 'UNPAID', 'NOT_PAID', '0'].includes(normalizedStatus) || status === 0;
  const isWaitReceive = ['SHIPPED', 'WAIT_RECEIVE', 'DELIVERED', '2'].includes(normalizedStatus) || status === 2;
  const isFinished = ['COMPLETED', 'SUCCESS', 'FINISHED', '3'].includes(normalizedStatus) || status === 3;
  const isClosed = ['CANCELLED', 'CANCELED', 'CLOSED', 'CLOSE', 'CLOSED_ORDER', '4'].includes(normalizedStatus) || status === 4;
  const canRefund = Boolean(data.canRefund ?? data.refundable ?? data.can_refund ?? baseInfo.canRefund ?? baseInfo.refundable);
  const itemList = (data.itemList || data.order_goods || data.goods_lists || []).map((item) => ({
    ...normalizeOrderItem(item),
    order_id: data.orderNo || baseInfo.orderNo || data.id,
    refund_btn: canRefund || item.refund_btn || item.canRefund || item.refundable
  }));
  return {
    ...data,
    id: data.orderNo || baseInfo.orderNo || data.id,
    order_sn: data.orderNo || baseInfo.orderNo || baseInfo.orderSn || data.order_sn,
    order_status: status,
    order_status_desc: data.orderStatusText || data.order_status_text || baseInfo.orderStatusText || baseInfo.order_status_text || data.orderStatusDesc || data.statusText || data.status_text || baseInfo.orderStatusDesc || baseInfo.statusText || data.order_status_desc || formatOrderStatus(data.orderStatus || baseInfo.orderStatus || data.order_status),
    pay_status: data.payStatus || baseInfo.payStatus || data.pay_status || data.paymentStatus || baseInfo.paymentStatus,
    order_amount: firstDefined(amountInfo.payAmount, data.payAmount, baseInfo.orderAmount, data.order_amount),
    goods_price: firstDefined(amountInfo.goodsAmount, data.goodsAmount, baseInfo.goodsAmount, data.goods_price),
    shipping_price: firstDefined(amountInfo.freightAmount, data.freightAmount, baseInfo.freightAmount, data.shipping_price),
    discount_amount: firstDefined(amountInfo.discountAmount, data.discountAmount, baseInfo.discountAmount, data.discount_amount),
    integral_amount: firstDefined(amountInfo.integralAmount, baseInfo.integralAmount, data.integral_amount),
    order_goods: itemList,
    goods_lists: itemList,
    order_type_desc: data.orderTypeDesc || baseInfo.orderTypeDesc || data.order_type_desc,
    pay_way_text: data.payMethodText || data.payMethodName || data.payMethod || baseInfo.payMethodText || baseInfo.payMethodName || baseInfo.payMethod || data.pay_way_text,
    pay_way: data.payMethod || baseInfo.payMethod || data.pay_way || data.payWay,
    shop_name: data.shopName || data.shop_name || shopInfo.shopName || shopInfo.name || baseInfo.shopName,
    shop_logo: resolveImage(data.shopLogo || data.shop_logo || shopInfo.logo || shopInfo.shopLogo || '', 'goods'),
    goods_num: firstDefined(data.goodsNum, data.goods_num, data.totalNum, data.total_num, itemList.reduce((sum, item) => sum + Number(item.goods_num || 0), 0)),
    create_time: baseInfo.createdAt || baseInfo.createTime || data.createdAt || data.create_time,
    pay_time: baseInfo.paidAt || baseInfo.payTime || data.paidAt || data.pay_time,
    shipping_time: baseInfo.shippedAt || baseInfo.shippingTime || data.shippedAt || data.shipping_time,
    confirm_take_time: baseInfo.confirmTime || data.confirm_take_time,
    cancel_time: baseInfo.cancelTime || data.cancel_time,
    order_cancel_time: baseInfo.expireTime || data.expireTime || data.order_cancel_time,
    delivery_type: baseInfo.deliveryType || data.delivery_type || data.deliveryType,
    order_type: baseInfo.orderType || data.order_type || 0,
    consignee: baseInfo.consignee || baseInfo.receiverName || receiverInfo.consignee || receiverInfo.receiverName || data.consignee,
    mobile: baseInfo.mobile || baseInfo.receiverMobile || receiverInfo.mobile || receiverInfo.receiverMobile || data.mobile,
    delivery_address: baseInfo.addressText || baseInfo.deliveryAddress || baseInfo.detailAddress || receiverInfo.addressText || receiverInfo.detailAddress || data.delivery_address,
    user_remark: data.userRemark || data.user_remark || baseInfo.userRemark || baseInfo.remark,
    express_name: deliveryInfo.expressName || deliveryInfo.company || deliveryInfo.shippingName || data.express_name || data.expressName,
    express_no: deliveryInfo.expressNo || deliveryInfo.trackingNo || deliveryInfo.invoiceNo || data.express_no || data.trackingNo || data.invoice_no,
    selffetch_shop: baseInfo.selffetchShop || data.selffetch_shop || {},
    pickup_code: baseInfo.pickupCode || data.verifyInfo?.pickupCode || data.pickup_code,
    verification_status: baseInfo.verificationStatus || data.verifyInfo?.verificationStatus || data.verification_status,
    status_flow: data.statusFlow || data.status_flow || [],
    refund_info: data.refundInfo || data.refund_info || {},
    verify_info: data.verifyInfo || data.verify_info || {},
    team: data.team || {},
    cancel_btn: firstDefined(data.cancel_btn, data.cancelBtn, baseInfo.cancelBtn, isWaitPay),
    delivery_btn: firstDefined(data.delivery_btn, data.deliveryBtn, baseInfo.deliveryBtn, isWaitReceive || isFinished),
    take_btn: firstDefined(data.take_btn, data.takeBtn, baseInfo.takeBtn, isWaitReceive),
    del_btn: firstDefined(data.del_btn, data.delBtn, baseInfo.delBtn, isClosed || isFinished),
    pay_btn: firstDefined(data.pay_btn, data.payBtn, baseInfo.payBtn, isWaitPay),
    comment_btn: firstDefined(data.comment_btn, data.commentBtn, baseInfo.commentBtn, isFinished),
    pickup_btn: firstDefined(data.pickup_btn, data.pickupBtn, baseInfo.pickupBtn),
    canRefund,
    refundable: canRefund,
    refund_btn: canRefund
  };
}

function normalizeOrderListItem(item = {}) {
  const detail = normalizeOrderDetail(item);
  const status = detail.order_status;
  return {
    ...detail,
    id: detail.id || detail.orderNo || detail.order_sn,
    order_status_desc: detail.order_status_desc || formatOrderStatus(status),
    pay_btn: detail.pay_btn,
    cancel_btn: detail.cancel_btn,
    delivery_btn: detail.delivery_btn,
    take_btn: detail.take_btn,
    del_btn: detail.del_btn,
    comment_btn: detail.comment_btn,
    pickup_btn: detail.pickup_btn,
    refund_btn: detail.canRefund,
    canRefund: detail.canRefund,
    refundable: detail.refundable,
    order_goods: detail.order_goods,
    goods_lists: detail.goods_lists,
  };
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
    done: "COMPLETED",
    close: "CLOSED",
    closed: "CLOSED",
    cancelled: "CANCELLED",
    canceled: "CANCELLED",
    CLOSED: "CLOSED",
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
      shop_name: item.shop_name || shop.shopName,
      shop_logo: item.shop_logo || item.shopLogo || shop.shopLogo || shop.shop_logo || shop.logo || shop.logoUrl || shop.image
    })));
  }, []);
}

function normalizeOrderPreview(data = {}) {
  const goodsLists = (data.goods_lists || data.itemList || data.items || flattenShopOrders(data.shopOrders || [])).map(normalizeOrderItem);
  const usableCoupons = (data.availableCoupons || data.usableCoupons || data.usable_coupon || data.usable || []).map(normalizeCouponItem);
  const unusableCoupons = (data.unavailableCoupons || data.unusableCoupons || data.unusable_coupon || data.unusable || []).map(normalizeCouponItem);
  const pointsDeductAmount = firstDefined(data.pointsDeductAmount, data.points_deduct_amount, data.integralAmount, data.integral_amount, data.integralDeductAmount, data.integral_deduct_amount, data.maxPointsDeductAmount, data.max_points_deduct_amount, 0);
  const pointsAmount = firstDefined(data.pointsAmount, data.points_amount, data.usedPoints, data.used_points, data.integralNum, data.integral_num, data.deductPoints, data.deduct_points, data.maxUsablePoints, data.max_usable_points, 0);
  const pointsEnabled = firstDefined(data.integralSwitch, data.integral_switch, data.pointsEnabled, data.points_enabled, data.supportPoints, data.support_points, data.canUsePoints, data.can_use_points);
  const selectedCouponId = firstDefined(data.couponId, data.coupon_id, data.selectedCouponId, data.selected_coupon_id, data.usedCouponId, data.used_coupon_id);
  return {
    ...data,
    address: data.address || {},
    shop_orders: data.shopOrders || data.shop_orders || [],
    goods_lists: goodsLists,
    total_goods_price: data.goodsAmount || data.total_goods_price || 0,
    discount_amount: data.discountAmount || data.discount_amount || 0,
    points_deduct_amount: pointsDeductAmount,
    pointsDeductAmount,
    points_amount: pointsAmount,
    pointsAmount,
    integral_amount: pointsDeductAmount,
    integral_num: pointsAmount,
    shipping_price: data.freightAmount || data.shipping_price || 0,
    order_amount: data.payAmount || data.order_amount || 0,
    integral_switch: pointsEnabled ?? (Number(pointsDeductAmount) > 0 || Number(pointsAmount) > 0),
    integral_limit: data.integralLimit ?? data.integral_limit ?? 0,
    integral_config: data.integralConfig ?? data.integral_config ?? 1,
    integral_desc: data.integralDesc || data.integral_desc || '可使用积分抵扣订单金额',
    user_integral: data.userIntegral ?? data.user_integral ?? data.availablePoints ?? data.available_points ?? 0,
    coupon_id: selectedCouponId || '',
    usableCoupon: usableCoupons,
    usable_coupon: usableCoupons,
    usable: usableCoupons,
    unusable: unusableCoupons,
  };
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
    pointsDeductAmount: data.use_integral ? numberValue(firstDefined(data.pointsDeductAmount, data.points_deduct_amount, data.integral_amount, data.orderInfo?.pointsDeductAmount, data.orderInfo?.points_deduct_amount, data.orderInfo?.integral_amount)) : 0,
    pointsAmount: data.use_integral ? numberValue(firstDefined(data.pointsAmount, data.points_amount, data.integral_num, data.orderInfo?.pointsAmount, data.orderInfo?.points_amount, data.orderInfo?.usedPoints, data.orderInfo?.used_points, data.orderInfo?.integral_num)) : 0,
    usePoints: Boolean(data.use_integral),
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
  return request.delete(`miniapp/orders/${id}`);
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
    pointsDeductAmount: data?.pointsDeductAmount || data?.points_deduct_amount || data?.integral_amount || (data?.use_integral ? data?.orderInfo?.pointsDeductAmount || data?.orderInfo?.points_deduct_amount || data?.orderInfo?.integral_amount || 0 : 0),
    pointsAmount: data?.pointsAmount || data?.points_amount || (data?.use_integral ? data?.orderInfo?.pointsAmount || data?.orderInfo?.points_amount || data?.orderInfo?.usedPoints || data?.orderInfo?.used_points || 0 : 0),
    remark: data?.remark || '',
    idempotentKey: data?.idempotentKey || `order-preview-${Date.now()}`
  }).then((res) => {
    if (res.code == 1 && res.data) {
      return {
        ...res,
        data: {
          usable: (res.data.availableCoupons || res.data.usableCoupons || res.data.usable || []).map(normalizeCouponItem),
          unusable: (res.data.unavailableCoupons || res.data.unusableCoupons || res.data.unusable || []).map(normalizeCouponItem),
          usableCoupon: (res.data.availableCoupons || res.data.usableCoupons || res.data.usable || []).map(normalizeCouponItem)
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
