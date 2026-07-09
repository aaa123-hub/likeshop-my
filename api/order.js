import request from "@/utils/request";
import { resolveImage } from "@/utils/image-placeholder";
import { cleanBackendText, cleanEmptyBackendText } from "@/utils/backend-text";

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
    MERCHANT: "商家券",
    ORDER_CONFIRM_RECEIVABLE: "",
    ORDER_CONFIRM_AVAILABLE: "",
    ORDER_CONFIRM_UNAVAILABLE: "",
    RECEIVABLE: "可领取",
    AVAILABLE: "可使用",
    UNAVAILABLE: "不可用"
  };
  if (Object.prototype.hasOwnProperty.call(map, type)) return map[type];
  return map[type] || item.coupon_type || item.couponType || item.typeText || "优惠券";
}

function compactPayload(payload = {}) {
  return Object.keys(payload).reduce((result, key) => {
    const value = payload[key];
    if (value === undefined || value === null || value === "") return result;
    if (Array.isArray(value) && !value.length && key !== "couponIds" && key !== "coupon_ids") return result;
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

function pickPointsSources(data = {}) {
  const baseInfo = data.baseInfo || data.base_info || {};
  const orderInfo = data.orderInfo || data.order_info || {};
  const amountInfo = data.amountInfo || data.amount_info || data.settlementAmount || data.settlement_amount || baseInfo.amountInfo || baseInfo.amount_info || orderInfo.amountInfo || orderInfo.amount_info || {};
  const pointsInfo = data.pointsInfo || data.points_info || data.integralInfo || data.integral_info || data.pointsConfig || data.points_config || baseInfo.pointsInfo || baseInfo.points_info || baseInfo.integralInfo || baseInfo.integral_info || orderInfo.pointsInfo || orderInfo.points_info || orderInfo.integralInfo || orderInfo.integral_info || {};
  return {
    baseInfo,
    orderInfo,
    pointsInfo,
    amountInfo,
    pointsAccount: data.pointsAccount || data.points_account || data.userPoints || data.user_points || baseInfo.pointsAccount || baseInfo.points_account || orderInfo.pointsAccount || orderInfo.points_account || {}
  };
}

function normalizePointsFields(data = {}) {
  const { baseInfo, orderInfo, pointsInfo, amountInfo, pointsAccount } = pickPointsSources(data);
  const available = firstDefined(
    data.available,
    data.userIntegral,
    data.user_integral,
    data.availablePoints,
    data.available_points,
    data.availableIntegral,
    data.available_integral,
    data.points,
    data.integral,
    data.balancePoints,
    data.balance_points,
    data.userPoints,
    data.user_points,
    baseInfo.userIntegral,
    baseInfo.user_integral,
    baseInfo.availablePoints,
    baseInfo.available_points,
    baseInfo.availableIntegral,
    baseInfo.available_integral,
    baseInfo.points,
    baseInfo.integral,
    orderInfo.userIntegral,
    orderInfo.user_integral,
    orderInfo.availablePoints,
    orderInfo.available_points,
    orderInfo.availableIntegral,
    orderInfo.available_integral,
    orderInfo.points,
    orderInfo.integral,
    pointsAccount.availablePoints,
    pointsAccount.available_points,
    pointsAccount.availableIntegral,
    pointsAccount.available_integral,
    pointsAccount.points,
    pointsAccount.integral,
    pointsInfo.userIntegral,
    pointsInfo.user_integral,
    pointsInfo.available,
    pointsInfo.availablePoints,
    pointsInfo.available_points,
    pointsInfo.availableIntegral,
    pointsInfo.available_integral,
    pointsInfo.points,
    pointsInfo.integral,
    0
  );
  const used = firstDefined(
    data.used,
    data.pointsAmount,
    data.points_amount,
    data.usedPoints,
    data.used_points,
    data.integralNum,
    data.integral_num,
    data.deductPoints,
    data.deduct_points,
    data.maxUsablePoints,
    data.max_usable_points,
    data.maxUsableIntegral,
    data.max_usable_integral,
    data.usablePoints,
    data.usable_points,
    data.usableIntegral,
    data.usable_integral,
    baseInfo.pointsAmount,
    baseInfo.points_amount,
    baseInfo.usedPoints,
    baseInfo.used_points,
    baseInfo.integralNum,
    baseInfo.integral_num,
    baseInfo.deductPoints,
    baseInfo.deduct_points,
    baseInfo.maxUsablePoints,
    baseInfo.max_usable_points,
    baseInfo.maxUsableIntegral,
    baseInfo.max_usable_integral,
    baseInfo.usablePoints,
    baseInfo.usable_points,
    baseInfo.usableIntegral,
    baseInfo.usable_integral,
    orderInfo.pointsAmount,
    orderInfo.points_amount,
    orderInfo.usedPoints,
    orderInfo.used_points,
    orderInfo.integralNum,
    orderInfo.integral_num,
    orderInfo.deductPoints,
    orderInfo.deduct_points,
    orderInfo.maxUsablePoints,
    orderInfo.max_usable_points,
    orderInfo.maxUsableIntegral,
    orderInfo.max_usable_integral,
    orderInfo.usablePoints,
    orderInfo.usable_points,
    orderInfo.usableIntegral,
    orderInfo.usable_integral,
    amountInfo.pointsAmount,
    amountInfo.points_amount,
    amountInfo.usedPoints,
    amountInfo.used_points,
    amountInfo.integralNum,
    amountInfo.integral_num,
    amountInfo.deductPoints,
    amountInfo.deduct_points,
    pointsInfo.pointsAmount,
    pointsInfo.points_amount,
    pointsInfo.used,
    pointsInfo.usedPoints,
    pointsInfo.used_points,
    pointsInfo.integralNum,
    pointsInfo.integral_num,
    pointsInfo.deductPoints,
    pointsInfo.deduct_points,
    pointsInfo.maxUsablePoints,
    pointsInfo.max_usable_points,
    pointsInfo.maxUsableIntegral,
    pointsInfo.max_usable_integral,
    pointsInfo.usablePoints,
    pointsInfo.usable_points,
    pointsInfo.usableIntegral,
    pointsInfo.usable_integral,
    0
  );
  const deductAmount = firstDefined(
    data.deductAmount,
    data.deduct_amount,
    data.pointsDeductAmount,
    data.points_deduct_amount,
    data.integralAmount,
    data.integral_amount,
    data.integralDeductAmount,
    data.integral_deduct_amount,
    data.maxPointsDeductAmount,
    data.max_points_deduct_amount,
    data.maxIntegralDeductAmount,
    data.max_integral_deduct_amount,
    data.maxDeductAmount,
    data.max_deduct_amount,
    baseInfo.deductAmount,
    baseInfo.deduct_amount,
    baseInfo.pointsDeductAmount,
    baseInfo.points_deduct_amount,
    baseInfo.integralAmount,
    baseInfo.integral_amount,
    baseInfo.integralDeductAmount,
    baseInfo.integral_deduct_amount,
    baseInfo.maxPointsDeductAmount,
    baseInfo.max_points_deduct_amount,
    baseInfo.maxIntegralDeductAmount,
    baseInfo.max_integral_deduct_amount,
    baseInfo.maxDeductAmount,
    baseInfo.max_deduct_amount,
    orderInfo.deductAmount,
    orderInfo.deduct_amount,
    orderInfo.pointsDeductAmount,
    orderInfo.points_deduct_amount,
    orderInfo.integralAmount,
    orderInfo.integral_amount,
    orderInfo.integralDeductAmount,
    orderInfo.integral_deduct_amount,
    orderInfo.maxPointsDeductAmount,
    orderInfo.max_points_deduct_amount,
    orderInfo.maxIntegralDeductAmount,
    orderInfo.max_integral_deduct_amount,
    orderInfo.maxDeductAmount,
    orderInfo.max_deduct_amount,
    amountInfo.pointsDeductAmount,
    amountInfo.points_deduct_amount,
    amountInfo.integralAmount,
    amountInfo.integral_amount,
    amountInfo.integralDeductAmount,
    amountInfo.integral_deduct_amount,
    amountInfo.maxDeductAmount,
    amountInfo.max_deduct_amount,
    pointsInfo.pointsDeductAmount,
    pointsInfo.points_deduct_amount,
    pointsInfo.integralAmount,
    pointsInfo.integral_amount,
    pointsInfo.integralDeductAmount,
    pointsInfo.integral_deduct_amount,
    pointsInfo.maxPointsDeductAmount,
    pointsInfo.max_points_deduct_amount,
    pointsInfo.maxIntegralDeductAmount,
    pointsInfo.max_integral_deduct_amount,
    pointsInfo.maxDeductAmount,
    pointsInfo.max_deduct_amount,
    pointsInfo.deductAmount,
    pointsInfo.deduct_amount,
    0
  );
  const give = firstDefined(
    data.order_give_integral,
    data.giveIntegral,
    data.give_integral,
    data.rewardPoints,
    data.reward_points,
    baseInfo.order_give_integral,
    baseInfo.giveIntegral,
    baseInfo.give_integral,
    baseInfo.rewardPoints,
    baseInfo.reward_points,
    orderInfo.order_give_integral,
    orderInfo.giveIntegral,
    orderInfo.give_integral,
    orderInfo.rewardPoints,
    orderInfo.reward_points,
    pointsInfo.giveIntegral,
    pointsInfo.give_integral,
    pointsInfo.rewardPoints,
    pointsInfo.reward_points,
    0
  );
  const enabled = firstDefined(
    data.integralSwitch,
    data.integral_switch,
    data.pointsEnabled,
    data.points_enabled,
    data.supportPoints,
    data.support_points,
    data.canUsePoints,
    data.can_use_points,
    baseInfo.integralSwitch,
    baseInfo.integral_switch,
    baseInfo.pointsEnabled,
    baseInfo.points_enabled,
    baseInfo.supportPoints,
    baseInfo.support_points,
    baseInfo.canUsePoints,
    baseInfo.can_use_points,
    orderInfo.integralSwitch,
    orderInfo.integral_switch,
    orderInfo.pointsEnabled,
    orderInfo.points_enabled,
    orderInfo.supportPoints,
    orderInfo.support_points,
    orderInfo.canUsePoints,
    orderInfo.can_use_points,
    pointsInfo.integralSwitch,
    pointsInfo.integral_switch,
    pointsInfo.pointsEnabled,
    pointsInfo.points_enabled,
    pointsInfo.supportPoints,
    pointsInfo.support_points,
    pointsInfo.canUsePoints,
    pointsInfo.can_use_points
  );
  const normalizedEnabled = enabled ?? (numberValue(deductAmount) > 0 || numberValue(used) > 0 || numberValue(available) > 0);
  const normalizedInfo = {
    ...pointsInfo,
    available,
    available_points: available,
    availablePoints: available,
    user_integral: available,
    userIntegral: available,
    used,
    used_points: used,
    usedPoints: used,
    pointsAmount: used,
    points_amount: used,
    integral_num: used,
    deductAmount,
    deduct_amount: deductAmount,
    pointsDeductAmount: deductAmount,
    points_deduct_amount: deductAmount,
    integralAmount: deductAmount,
    integral_amount: deductAmount,
    give,
    give_integral: give,
    giveIntegral: give,
    rewardPoints: give,
    reward_points: give,
    enabled: normalizedEnabled,
    pointsEnabled: normalizedEnabled,
    points_enabled: normalizedEnabled,
    integralSwitch: normalizedEnabled,
    integral_switch: normalizedEnabled,
    integral_limit: data.integralLimit ?? data.integral_limit ?? baseInfo.integralLimit ?? baseInfo.integral_limit ?? orderInfo.integralLimit ?? orderInfo.integral_limit ?? pointsInfo.integralLimit ?? pointsInfo.integral_limit ?? 0,
    integralLimit: data.integralLimit ?? data.integral_limit ?? baseInfo.integralLimit ?? baseInfo.integral_limit ?? orderInfo.integralLimit ?? orderInfo.integral_limit ?? pointsInfo.integralLimit ?? pointsInfo.integral_limit ?? 0,
    integral_config: data.integralConfig ?? data.integral_config ?? baseInfo.integralConfig ?? baseInfo.integral_config ?? orderInfo.integralConfig ?? orderInfo.integral_config ?? pointsInfo.integralConfig ?? pointsInfo.integral_config ?? 1,
    integralConfig: data.integralConfig ?? data.integral_config ?? baseInfo.integralConfig ?? baseInfo.integral_config ?? orderInfo.integralConfig ?? orderInfo.integral_config ?? pointsInfo.integralConfig ?? pointsInfo.integral_config ?? 1,
    integral_desc: data.integralDesc || data.integral_desc || baseInfo.integralDesc || baseInfo.integral_desc || orderInfo.integralDesc || orderInfo.integral_desc || pointsInfo.integralDesc || pointsInfo.integral_desc || "可使用积分抵扣订单金额",
    integralDesc: data.integralDesc || data.integral_desc || baseInfo.integralDesc || baseInfo.integral_desc || orderInfo.integralDesc || orderInfo.integral_desc || pointsInfo.integralDesc || pointsInfo.integral_desc || "可使用积分抵扣订单金额"
  };
  return {
    pointsInfo: normalizedInfo,
    points_info: normalizedInfo,
    pointsConfig: normalizedInfo,
    points_config: normalizedInfo,
    integralInfo: normalizedInfo,
    integral_info: normalizedInfo,
    user_integral: available,
    userIntegral: available,
    available_points: available,
    availablePoints: available,
    pointsAmount: used,
    points_amount: used,
    usedPoints: used,
    used_points: used,
    integral_num: used,
    pointsDeductAmount: deductAmount,
    points_deduct_amount: deductAmount,
    integralAmount: deductAmount,
    integral_amount: deductAmount,
    maxDeductAmount: deductAmount,
    max_deduct_amount: deductAmount,
    give_integral: give,
    giveIntegral: give,
    order_give_integral: give,
    integral_switch: normalizedEnabled,
    integralSwitch: normalizedEnabled,
    pointsEnabled: normalizedEnabled,
    points_enabled: normalizedEnabled,
    integral_limit: normalizedInfo.integral_limit,
    integralLimit: normalizedInfo.integralLimit,
    integral_config: normalizedInfo.integral_config,
    integralConfig: normalizedInfo.integralConfig,
    integral_desc: normalizedInfo.integral_desc,
    integralDesc: normalizedInfo.integralDesc
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
  const province = String(firstDefined(source.province, source.provinceName, source.province_name, ""));
  const city = String(firstDefined(source.city, source.cityName, source.city_name, ""));
  const district = String(firstDefined(source.district, source.districtName, source.district_name, source.area, source.areaName, source.area_name, ""));
  const detail = String(firstDefined(source.address, source.detailAddress, source.detail_address, source.addressDetail, source.address_detail, ""));
  const fullAddress = String(firstDefined(source.fullAddress, source.full_address, source.addressText, source.address_text, source.deliveryAddress, source.delivery_address, "") || [province, city, district, detail].filter(Boolean).join(""));
  return {
    ...source,
    id,
    addressId: id,
    contact: firstDefined(source.contact, source.receiverName, source.receiver_name, source.consignee, source.name, ""),
    telephone: firstDefined(source.telephone, source.mobile, source.phone, source.receiverMobile, source.receiver_mobile, source.receiverPhone, source.receiver_phone, ""),
    province,
    city,
    district,
    address: detail,
    detailAddress: detail,
    fullAddress,
    addressText: fullAddress
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
  return statusMap[normalized] || cleanBackendText(status, "") || "";
}
function formatRefundStatus(status) {
  if (status === 0 || status === '0') return '待商家处理';
  if (status === 1 || status === '1') return '处理中';
  if (status === 2 || status === '2' || status === 3 || status === '3') return '商家已同意';
  if (status === 4 || status === '4') return '商家已拒绝';
  if (status === 5 || status === '5') return '退款成功';
  if (status === 6 || status === '6') return '已撤销';
  const map = {
    APPLIED: "待商家处理",
    PENDING: "待商家处理",
    PROCESSING: "处理中",
    REFUNDING: "退款中",
    APPROVED: "商家已同意",
    RETURNING: "待买家退货",
    REJECTED: "商家已拒绝",
    CANCELLED: "已撤销",
    CANCELED: "已撤销",
    REFUNDED: "退款成功",
    SUCCESS: "退款成功",
    FAILED: "退款失败"
  };
  return map[String(status || '').toUpperCase()] || cleanBackendText(status, "") || "";
}
function normalizeOrderDetail(data = {}) {
  const baseInfo = data.baseInfo || data;
  const amountInfo = data.amountInfo || {};
  const normalizedPoints = normalizePointsFields(data);
  const pointsInfo = normalizedPoints.pointsInfo || {};
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
  const shopOrders = data.shopOrders || data.shop_orders || [];
  const itemListSource = data.itemList || data.order_goods || data.goods_lists || data.items || (Array.isArray(shopOrders) ? flattenShopOrders(shopOrders) : []);
  const itemList = itemListSource.map((item) => {
    const normalizedItem = normalizeOrderItem(item);
    const afterSale = item.afterSale || item.after_sale || item.refundInfo || item.refund_info || {};
    const afterSaleId = firstDefined(afterSale.afterSaleId, afterSale.after_sale_id, afterSale.refundNo, afterSale.id, item.afterSaleId, item.after_sale_id, item.refundNo, item.refund_no);
    const afterStatus = firstDefined(afterSale.statusText, afterSale.status_text, afterSale.refundStatusText, afterSale.refund_status_text, afterSale.status, item.after_status_desc, item.afterStatusDesc, item.refundStatusText, item.refund_status_text, item.refundStatus, item.afterSaleStatus);
    const afterStatusText = afterSaleId || afterStatus !== undefined ? formatRefundStatus(afterStatus) : '';
    return {
      ...normalizedItem,
      order_id: data.orderNo || baseInfo.orderNo || data.id,
      after_sale_id: afterSaleId || '',
      after_status_desc: afterStatusText || '',
      refund_info: afterSale,
      refund_btn: Boolean(canRefund || item.refund_btn || item.canRefund || item.refundable) && !afterSaleId && !afterStatusText
    };
  });
  return {
    ...data,
    ...normalizedPoints,
    id: data.orderNo || baseInfo.orderNo || data.id,
    order_sn: data.orderNo || baseInfo.orderNo || baseInfo.orderSn || data.order_sn,
    order_status: status,
    order_status_desc: cleanBackendText(data.orderStatusText || data.order_status_text || baseInfo.orderStatusText || baseInfo.order_status_text || data.orderStatusDesc || data.statusText || data.status_text || baseInfo.orderStatusDesc || baseInfo.statusText || data.order_status_desc, "") || formatOrderStatus(data.orderStatus || baseInfo.orderStatus || data.order_status),
    pay_status: data.payStatus || baseInfo.payStatus || data.pay_status || data.paymentStatus || baseInfo.paymentStatus,
    order_amount: firstDefined(amountInfo.payAmount, data.payAmount, baseInfo.orderAmount, data.order_amount),
    goods_price: firstDefined(amountInfo.goodsAmount, data.goodsAmount, baseInfo.goodsAmount, data.goods_price),
    shipping_price: firstDefined(amountInfo.freightAmount, data.freightAmount, baseInfo.freightAmount, data.shipping_price),
    discount_amount: firstDefined(amountInfo.discountAmount, data.discountAmount, baseInfo.discountAmount, data.discount_amount),
    integral_amount: normalizedPoints.integral_amount,
    integralAmount: normalizedPoints.integralAmount,
    pointsDeductAmount: normalizedPoints.pointsDeductAmount,
    points_deduct_amount: normalizedPoints.points_deduct_amount,
    pointsAmount: normalizedPoints.pointsAmount,
    points_amount: normalizedPoints.points_amount,
    user_integral: normalizedPoints.user_integral,
    give_integral: normalizedPoints.give_integral,
    shopOrders,
    shop_orders: shopOrders,
    order_goods: itemList,
    goods_lists: itemList,
    order_type_desc: cleanBackendText(data.orderTypeDesc || baseInfo.orderTypeDesc || data.order_type_desc, ""),
    pay_way_text: cleanBackendText(data.payMethodText || data.payMethodName || data.payMethod || baseInfo.payMethodText || baseInfo.payMethodName || baseInfo.payMethod || data.pay_way_text, ""),
    pay_way: data.payMethod || baseInfo.payMethod || data.pay_way || data.payWay,
    shop_name: cleanEmptyBackendText(data.shopName || data.shop_name || shopInfo.shopName || shopInfo.name || baseInfo.shopName, ""),
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
    consignee: cleanEmptyBackendText(baseInfo.consignee || baseInfo.receiverName || receiverInfo.consignee || receiverInfo.receiverName || data.consignee, ""),
    mobile: cleanEmptyBackendText(baseInfo.mobile || baseInfo.receiverMobile || receiverInfo.mobile || receiverInfo.receiverMobile || data.mobile, ""),
    delivery_address: cleanEmptyBackendText(baseInfo.addressText || baseInfo.deliveryAddress || baseInfo.detailAddress || receiverInfo.addressText || receiverInfo.detailAddress || data.delivery_address, ""),
    user_remark: cleanEmptyBackendText(data.userRemark || data.user_remark || baseInfo.userRemark || baseInfo.remark, ""),
    express_name: cleanEmptyBackendText(deliveryInfo.expressName || deliveryInfo.company || deliveryInfo.shippingName || data.express_name || data.expressName, ""),
    express_no: cleanEmptyBackendText(deliveryInfo.expressNo || deliveryInfo.trackingNo || deliveryInfo.invoiceNo || data.express_no || data.trackingNo || data.invoice_no, ""),
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
  const normalizedPoints = normalizePointsFields(data);
  const pointsInfo = normalizedPoints.pointsInfo || {};
  const amountInfo = data.amountInfo || data.amount_info || data.settlementAmount || data.settlement_amount || {};
  const goodsAmount = firstDefined(amountInfo.goodsAmount, amountInfo.goods_amount, data.goodsAmount, data.goods_amount, data.totalGoodsAmount, data.total_goods_amount, data.total_goods_price, 0);
  const freightAmount = firstDefined(amountInfo.freightAmount, amountInfo.freight_amount, data.freightAmount, data.freight_amount, data.shippingAmount, data.shipping_amount, data.shipping_price, 0);
  const payAmount = firstDefined(amountInfo.payAmount, amountInfo.pay_amount, data.payAmount, data.pay_amount, data.orderAmount, data.order_amount, data.actualAmount, data.actual_amount, 0);
  const explicitDiscountAmount = firstDefined(
    amountInfo.couponDiscountAmount,
    amountInfo.coupon_discount_amount,
    amountInfo.discountAmount,
    amountInfo.discount_amount,
    amountInfo.discountPrice,
    amountInfo.discount_price,
    amountInfo.reduceAmount,
    amountInfo.reduce_amount,
    amountInfo.couponAmount,
    amountInfo.coupon_amount,
    data.couponDiscountAmount,
    data.coupon_discount_amount,
    data.discountAmount,
    data.discount_amount,
    data.discountPrice,
    data.discount_price,
    data.reduceAmount,
    data.reduce_amount,
    data.couponAmount,
    data.coupon_amount,
    data.promotionAmount,
    data.promotion_amount,
    couponInfo.discountAmount,
    couponInfo.discount_amount,
    couponInfo.couponDiscountAmount,
    couponInfo.coupon_discount_amount,
    0
  );
  const inferredDiscountAmount = Math.max(numberValue(goodsAmount) + numberValue(freightAmount) - numberValue(payAmount), 0);
  const discountAmount = numberValue(explicitDiscountAmount) > 0 ? explicitDiscountAmount : inferredDiscountAmount;
  const selectedCouponId = firstDefined(
    data.couponId,
    data.coupon_id,
    data.selectedCouponId,
    data.selected_coupon_id,
    data.usedCouponId,
    data.used_coupon_id,
    data.userCouponId,
    data.user_coupon_id,
    Array.isArray(data.couponIds) ? data.couponIds[0] : '',
    Array.isArray(data.coupon_ids) ? data.coupon_ids[0] : '',
    amountInfo.couponId,
    amountInfo.coupon_id,
    couponInfo.couponId,
    couponInfo.coupon_id,
    couponInfo.selectedCouponId,
    couponInfo.selected_coupon_id
  );
  return {
    ...data,
    ...normalizedPoints,
    address: normalizePreviewAddress(data),
    shop_orders: data.shopOrders || data.shop_orders || [],
    goods_lists: goodsLists,
    total_goods_price: goodsAmount,
    discount_amount: discountAmount,
    discountAmount,
    coupon_discount_amount: discountAmount,
    couponDiscountAmount: discountAmount,
    points_deduct_amount: normalizedPoints.points_deduct_amount,
    pointsDeductAmount: normalizedPoints.pointsDeductAmount,
    maxDeductAmount: normalizedPoints.maxDeductAmount,
    max_deduct_amount: normalizedPoints.max_deduct_amount,
    points_amount: normalizedPoints.points_amount,
    pointsAmount: normalizedPoints.pointsAmount,
    integral_amount: normalizedPoints.integral_amount,
    integral_num: normalizedPoints.integral_num,
    shipping_price: freightAmount,
    order_amount: payAmount,
    integral_switch: normalizedPoints.integral_switch,
    integral_limit: normalizedPoints.integral_limit,
    integral_config: normalizedPoints.integral_config,
    integral_desc: normalizedPoints.integral_desc,
    user_integral: normalizedPoints.user_integral,
    coupon_id: selectedCouponId || '',
    couponId: selectedCouponId || '',
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
    orderChannel: data.orderChannel || data.order_channel || '',
    order_channel: data.order_channel || data.orderChannel || '',
    goodsSource: data.goodsSource || data.goods_source || '',
    goods_source: data.goods_source || data.goodsSource || '',
    is1688: data.is1688 ?? data.is_1688,
    is_1688: data.is_1688 ?? data.is1688,
    cartItemIds,
    skuId: isCartOrder ? undefined : data.skuId || data.item_id || goodsList[0]?.skuId || goodsList[0]?.item_id || goodsList[0]?.id,
    quantity: isCartOrder ? undefined : data.quantity || data.goods_num || goodsList[0]?.quantity || goodsList[0]?.num,
    addressId: data.addressId || data.address_id || '',
    couponIds: data.noCoupon || data.no_coupon ? [] : (data.couponIds || (data.coupon_id ? [data.coupon_id] : [])),
    coupon_ids: data.noCoupon || data.no_coupon ? [] : (data.coupon_ids || data.couponIds || (data.coupon_id ? [data.coupon_id] : [])),
    noCoupon: data.noCoupon || data.no_coupon,
    no_coupon: data.no_coupon || data.noCoupon,
    deliveryType: data.deliveryType || data.delivery_type,
    delivery_type: data.delivery_type || data.deliveryType,
    selffetchShopId: data.selffetchShopId || data.selffetch_shop_id || data.store_id,
    selffetch_shop_id: data.selffetch_shop_id || data.selffetchShopId || data.store_id,
    pickupLatitude: data.pickupLatitude || data.pickup_latitude,
    pickupLongitude: data.pickupLongitude || data.pickup_longitude,
    pickupAddress: data.pickupAddress || data.pickup_address,
    pickupName: data.pickupName || data.pickup_name,
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
    couponIds: data?.noCoupon || data?.no_coupon ? [] : (data?.couponIds || (data?.coupon_id ? [data.coupon_id] : [])),
    coupon_ids: data?.noCoupon || data?.no_coupon ? [] : (data?.coupon_ids || data?.couponIds || (data?.coupon_id ? [data.coupon_id] : [])),
    noCoupon: data?.noCoupon || data?.no_coupon,
    no_coupon: data?.no_coupon || data?.noCoupon,
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

// 商家核销自提订单
export function merchantVerifyOrder(data = {}) {
  const subOrderNo = data.subOrderNo || data.sub_order_no || data.orderNo || data.order_no || data.id || ''
  return request.post(`miniapp/merchant/orders/${subOrderNo}/verify`, {
    merchantId: data.merchantId || data.merchant_id,
    verifyCode: data.verifyCode || data.verify_code || data.code,
    operatorId: data.operatorId || data.operator_id || data.userId || data.user_id
  })
}
