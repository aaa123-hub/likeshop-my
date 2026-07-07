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

function couponAmountValue(item = {}) {
  const coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {};
  return firstDefined(
    item.money,
    item.amount,
    item.discountAmount,
    item.discount_amount,
    item.discountValue,
    item.discount_value,
    item.couponAmount,
    item.coupon_amount,
    item.reduceAmount,
    item.reduce_amount,
    item.deductAmount,
    item.deduct_amount,
    item.faceValue,
    item.face_value,
    item.value,
    coupon.money,
    coupon.amount,
    coupon.discountAmount,
    coupon.discount_amount,
    0
  );
}

function couponTypeText(item = {}) {
  const type = String(item.coupon_type || item.couponType || item.typeText || item.type || "").toUpperCase();
  const map = {
    DISCOUNT: "折扣券",
    REDUCE: "满减券",
    FULL_REDUCTION: "满减券",
    FULL_DISCOUNT: "满减券",
    CASH: "现金券",
    VOUCHER: "代金券",
    FREIGHT: "运费券",
    FREE_SHIPPING: "包邮券",
    PLATFORM: "平台券",
    MERCHANT: "商家券"
  };
  return map[type] || item.coupon_type || item.couponType || item.typeText || "优惠券";
}

function compactPayload(payload = {}) {
  return Object.keys(payload).reduce((result, key) => {
    const value = payload[key];
    if (value === undefined || value === null || value === "") return result;
    if (Array.isArray(value) && !value.length && key !== "couponIds") return result;
    result[key] = value;
    return result;
  }, {});
}

function buildPointsPayload(data = {}) {
  const usePoints = Boolean(data.use_integral || data.usePoints);
  const pointsDeductAmount = usePoints ? numberValue(firstDefined(
    data.pointsDeductAmount,
    data.points_deduct_amount,
    data.integral_amount,
    data.maxDeductAmount,
    data.max_deduct_amount,
    data.orderInfo?.pointsDeductAmount,
    data.orderInfo?.points_deduct_amount,
    data.orderInfo?.integral_amount,
    data.orderInfo?.maxDeductAmount,
    data.orderInfo?.max_deduct_amount
  )) : 0;
  const pointsAmount = usePoints ? numberValue(firstDefined(
    data.pointsAmount,
    data.points_amount,
    data.integral_num,
    data.orderInfo?.pointsAmount,
    data.orderInfo?.points_amount,
    data.orderInfo?.usedPoints,
    data.orderInfo?.used_points,
    data.orderInfo?.integral_num
  )) : 0;

  return {
    pointsDeductAmount,
    points_deduct_amount: pointsDeductAmount,
    integral_amount: pointsDeductAmount,
    pointsAmount,
    points_amount: pointsAmount,
    integral_num: pointsAmount,
    usePoints,
    use_integral: usePoints
  };
}

function normalizeCouponItem(item = {}) {
  const threshold = firstDefined(item.use_condition, item.useCondition, item.conditionText, item.thresholdAmount, item.minAmount, item.useThreshold);
  const amount = couponAmountValue(item);
  const couponTemplate = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {};
  const coupon = item.coupon || item.couponInfo || item.coupon_info || item.couponDTO || item.coupon_dto || {};
  const couponId = firstDefined(item.coupon_id, item.couponId, item.templateId, item.template_id, item.couponTemplateId, item.coupon_template_id, item.couponTplId, item.coupon_tpl_id, item.couponTemplateNo, item.coupon_template_no, couponTemplate.couponId, couponTemplate.coupon_id, couponTemplate.templateId, couponTemplate.template_id, couponTemplate.couponTemplateId, couponTemplate.coupon_template_id, couponTemplate.couponTplId, couponTemplate.coupon_tpl_id, couponTemplate.id, coupon.couponId, coupon.coupon_id, coupon.templateId, coupon.template_id, coupon.couponTemplateId, coupon.coupon_template_id, coupon.couponTplId, coupon.coupon_tpl_id, coupon.id, item.id, item.userCouponId);
  return {
    ...item,
    id: firstDefined(item.id, couponId),
    coupon_id: couponId,
    couponId,
    couponTemplateId: firstDefined(item.couponTemplateId, item.coupon_template_id, couponTemplate.id, couponTemplate.templateId, couponTemplate.couponTemplateId, couponId),
    name: firstDefined(item.name, item.couponName, item.coupon_name, item.title, "优惠券"),
    money: amount,
    use_condition: item.use_condition || item.useCondition || item.conditionText || (threshold ? `满${threshold}可用` : "无门槛"),
    coupon_type: couponTypeText(item),
    use_time_tips: item.use_time_tips || item.useTimeTips || item.validTimeText || item.valid_time_text || "有效期以实际使用规则为准",
    is_get: item.is_get || item.received || item.hasReceived || item.has_received || false,
    tips: item.tips || item.reason || item.unavailableReason || item.unavailable_reason || ""
  };
}

function normalizePreviewAddress(data = {}) {
  const source = data.address || data.addressInfo || data.address_info || data.receiverInfo || data.receiver_info || data.defaultAddress || data.default_address || {};
  const id = firstDefined(source.id, source.addressId, source.address_id);
  if (!id) return {};
  return {
    ...source,
    id,
    addressId: id,
    contact: firstDefined(source.contact, source.receiverName, source.receiver_name, source.consignee, source.name, ""),
    telephone: firstDefined(source.telephone, source.mobile, source.phone, source.receiverMobile, source.receiver_mobile, ""),
    province: String(firstDefined(source.province, source.provinceName, source.province_name, "")),
    city: String(firstDefined(source.city, source.cityName, source.city_name, "")),
    district: String(firstDefined(source.district, source.districtName, source.district_name, "")),
    address: String(firstDefined(source.address, source.detailAddress, source.detail_address, source.addressDetail, source.address_detail, ""))
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
  const couponInfo = data.couponInfo || data.coupon_info || data.couponSummary || data.coupon_summary || {};
  const usableCoupons = (data.availableCoupons || data.usableCoupons || data.usableCoupon || data.available_coupon || data.usable_coupon || data.usable || couponInfo.availableCoupons || couponInfo.usableCoupons || couponInfo.usableCoupon || couponInfo.usable || []).map(normalizeCouponItem);
  const unusableCoupons = (data.unavailableCoupons || data.unusableCoupons || data.unusableCoupon || data.unavailable_coupon || data.unusable_coupon || data.unusable || couponInfo.unavailableCoupons || couponInfo.unusableCoupons || couponInfo.unusableCoupon || couponInfo.unusable || []).map(normalizeCouponItem);
  const receivableCoupons = (data.receivableCoupons || data.receivableCoupon || data.receivable_coupons || data.receivable_coupon || data.claimableCoupons || data.claimableCoupon || data.claimable_coupons || data.claimable_coupon || data.coupons || data.couponList || data.coupon_list || couponInfo.receivableCoupons || couponInfo.receivableCoupon || couponInfo.claimableCoupons || couponInfo.claimableCoupon || couponInfo.coupons || []).map(normalizeCouponItem);
  const pointsInfo = data.pointsInfo || data.points_info || data.integralInfo || data.integral_info || data.pointsConfig || data.points_config || {};
  const amountInfo = data.amountInfo || data.amount_info || data.settlementAmount || data.settlement_amount || {};
  const pointsAccount = data.pointsAccount || data.points_account || {};
  const pointsDeductAmount = firstDefined(data.pointsDeductAmount, data.points_deduct_amount, data.integralAmount, data.integral_amount, data.integralDeductAmount, data.integral_deduct_amount, data.maxPointsDeductAmount, data.max_points_deduct_amount, data.maxDeductAmount, data.max_deduct_amount, amountInfo.pointsDeductAmount, amountInfo.points_deduct_amount, amountInfo.integralAmount, amountInfo.integral_amount, pointsInfo.pointsDeductAmount, pointsInfo.points_deduct_amount, pointsInfo.integralAmount, pointsInfo.integral_amount, pointsInfo.maxPointsDeductAmount, pointsInfo.max_points_deduct_amount, pointsInfo.maxDeductAmount, pointsInfo.max_deduct_amount, 0);
  const pointsAmount = firstDefined(data.pointsAmount, data.points_amount, data.usedPoints, data.used_points, data.integralNum, data.integral_num, data.deductPoints, data.deduct_points, data.maxUsablePoints, data.max_usable_points, amountInfo.pointsAmount, amountInfo.points_amount, amountInfo.usedPoints, amountInfo.used_points, amountInfo.integralNum, amountInfo.integral_num, pointsInfo.pointsAmount, pointsInfo.points_amount, pointsInfo.usedPoints, pointsInfo.used_points, pointsInfo.integralNum, pointsInfo.integral_num, pointsInfo.maxUsablePoints, pointsInfo.max_usable_points, 0);
  const pointsEnabled = firstDefined(data.integralSwitch, data.integral_switch, data.pointsEnabled, data.points_enabled, data.supportPoints, data.support_points, data.canUsePoints, data.can_use_points, pointsInfo.integralSwitch, pointsInfo.integral_switch, pointsInfo.pointsEnabled, pointsInfo.points_enabled, pointsInfo.supportPoints, pointsInfo.support_points, pointsInfo.canUsePoints, pointsInfo.can_use_points);
  const userIntegral = firstDefined(data.userIntegral, data.user_integral, data.availablePoints, data.available_points, data.points, pointsAccount.availablePoints, pointsAccount.available_points, pointsAccount.points, pointsInfo.userIntegral, pointsInfo.user_integral, pointsInfo.availablePoints, pointsInfo.available_points, pointsInfo.points, 0);
  const selectedCouponId = firstDefined(data.couponId, data.coupon_id, data.selectedCouponId, data.selected_coupon_id, data.usedCouponId, data.used_coupon_id);
  return {
    ...data,
    address: normalizePreviewAddress(data),
    shop_orders: data.shopOrders || data.shop_orders || [],
    goods_lists: goodsLists,
    total_goods_price: firstDefined(amountInfo.goodsAmount, amountInfo.goods_amount, data.goodsAmount, data.total_goods_price, 0),
    discount_amount: firstDefined(amountInfo.discountAmount, amountInfo.discount_amount, data.discountAmount, data.discount_amount, 0),
    points_deduct_amount: pointsDeductAmount,
    pointsDeductAmount,
    maxDeductAmount: pointsDeductAmount,
    max_deduct_amount: pointsDeductAmount,
    points_amount: pointsAmount,
    pointsAmount,
    integral_amount: pointsDeductAmount,
    integral_num: pointsAmount,
    shipping_price: firstDefined(amountInfo.freightAmount, amountInfo.freight_amount, data.freightAmount, data.shipping_price, 0),
    order_amount: firstDefined(amountInfo.payAmount, amountInfo.pay_amount, data.payAmount, data.pay_amount, data.order_amount, 0),
    integral_switch: pointsEnabled ?? (Number(pointsDeductAmount) > 0 || Number(pointsAmount) > 0),
    integral_limit: data.integralLimit ?? data.integral_limit ?? pointsInfo.integralLimit ?? pointsInfo.integral_limit ?? 0,
    integral_config: data.integralConfig ?? data.integral_config ?? pointsInfo.integralConfig ?? pointsInfo.integral_config ?? 1,
    integral_desc: data.integralDesc || data.integral_desc || pointsInfo.integralDesc || pointsInfo.integral_desc || '可使用积分抵扣订单金额',
    user_integral: userIntegral,
    coupon_id: selectedCouponId || '',
    usableCoupon: usableCoupons,
    usable_coupon: usableCoupons,
    usable: usableCoupons,
    unusable: unusableCoupons,
    receivableCoupon: receivableCoupons,
    receivable_coupon: receivableCoupons,
    receivable: receivableCoupons,
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
  const amountInfo = data.amountInfo || {};
  return {
    ...data,
    order_id: data.orderNo || data.order_id || data.id,
    orderNo: data.orderNo || data.order_id || data.id,
    type: data.type || 'order',
    payOrderNo: data.payOrderNo || data.pay_order_no || '',
    pay_order_no: data.pay_order_no || data.payOrderNo || '',
    orderStatus: firstDefined(data.orderStatus, data.order_status, 0),
    payStatus: firstDefined(data.payStatus, data.pay_status, ''),
    order_amount: firstDefined(amountInfo.payAmount, data.payAmount, data.pay_amount, data.order_amount, 0),
    payAmount: firstDefined(amountInfo.payAmount, data.payAmount, data.pay_amount, data.order_amount, 0),
    expireTime: data.expireTime || data.cancel_time || 0,
  }
}

//下单
export async function orderBuy(data) {
  const isSubmit = data && (data.action === 'submit' || data.submitToken || data.source || data.payScene || data.idempotentKey);
  const goodsList = data.goods || [];
  const cartItemIds = data.cartItemIds || goodsList.map((item) => item.cartItemId || item.cart_id).filter(Boolean);
  const isCartOrder = data.type === 'cart' || cartItemIds.length > 0;
  const pointsPayload = buildPointsPayload(data);
  const payload = compactPayload({
    submitToken: data.submitToken || data.submit_token || data.orderInfo?.submitToken || latestSubmitToken || '',
    source: data.source || (isCartOrder ? 'CART' : 'BUY_NOW'),
    cartItemIds,
    skuId: isCartOrder ? undefined : data.skuId || data.item_id || goodsList[0]?.skuId || goodsList[0]?.item_id || goodsList[0]?.id,
    quantity: isCartOrder ? undefined : data.quantity || data.goods_num || goodsList[0]?.quantity || goodsList[0]?.num,
    addressId: data.addressId || data.address_id || '',
    couponIds: data.couponIds || (data.coupon_id ? [data.coupon_id] : []),
    deliveryType: data.deliveryType || data.delivery_type,
    delivery_type: data.delivery_type || data.deliveryType,
    selffetchShopId: data.selffetchShopId || data.selffetch_shop_id || data.store_id,
    selffetch_shop_id: data.selffetch_shop_id || data.selffetchShopId || data.store_id,
    consignee: data.consignee,
    mobile: data.mobile,
    ...pointsPayload,
    remark: data.remark || data.userRemark || '',
    payScene: data.payScene || 'MINIAPP',
    idempotentKey: data.idempotentKey || `order-${Date.now()}`
  })

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
  const cartItemIds = data?.cartItemIds || goodsList.map((item) => item.cartItemId || item.cart_id).filter(Boolean);
  const isCartOrder = data?.type === 'cart' || cartItemIds.length > 0;
  const pointsPayload = buildPointsPayload(data);
  return request.post("miniapp/orders/preview", {
    source: data?.source || (isCartOrder ? "CART" : "BUY_NOW"),
    cartItemIds,
    skuId: isCartOrder ? undefined : data?.skuId || data?.item_id || goodsList[0]?.skuId || goodsList[0]?.item_id || goodsList[0]?.id,
    quantity: isCartOrder ? undefined : data?.quantity || data?.goods_num || goodsList[0]?.quantity || goodsList[0]?.num,
    addressId: data?.addressId || data?.address_id || '',
    couponIds: data?.couponIds || (data?.coupon_id ? [data.coupon_id] : []),
    ...pointsPayload,
    remark: data?.remark || '',
    idempotentKey: data?.idempotentKey || `order-preview-${Date.now()}`
  }).then((res) => {
    if (res.code == 1 && res.data) {
      return {
        ...res,
        data: {
          usable: (res.data.availableCoupons || res.data.usableCoupons || res.data.usable_coupon || res.data.usableCoupon || res.data.usable || []).map(normalizeCouponItem),
          unusable: (res.data.unavailableCoupons || res.data.unusableCoupons || res.data.unusable_coupon || res.data.unusableCoupon || res.data.unusable || []).map(normalizeCouponItem),
          usableCoupon: (res.data.availableCoupons || res.data.usableCoupons || res.data.usable_coupon || res.data.usableCoupon || res.data.usable || []).map(normalizeCouponItem),
          receivable: (res.data.receivableCoupons || res.data.receivableCoupon || res.data.receivable_coupons || res.data.receivable_coupon || res.data.claimableCoupons || res.data.claimableCoupon || res.data.claimable_coupons || res.data.claimable_coupon || res.data.coupons || res.data.couponList || res.data.coupon_list || res.data.couponInfo?.receivableCoupons || res.data.couponInfo?.claimableCoupons || res.data.coupon_info?.receivable_coupons || res.data.coupon_info?.claimable_coupons || []).map(normalizeCouponItem)
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
