import request from "@/utils/request";
import { resolveImage } from "@/utils/image-placeholder";
import { cleanBackendText, cleanEmptyBackendText, isEmptyBackendText } from "@/utils/backend-text";

let latestSubmitToken = "";

function firstDefined(...values) {
  return values.find((value) => !isEmptyBackendText(value));
}

function numberValue(value, fallback = 0) {
  const number = Number(firstDefined(value, fallback));
  return Number.isNaN(number) ? fallback : number;
}

function booleanValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  const text = String(value).trim().toUpperCase();
  if (["TRUE", "YES", "Y", "ENABLE", "ENABLED"].includes(text)) return true;
  if (["FALSE", "NO", "N", "DISABLE", "DISABLED"].includes(text)) return false;
  return Boolean(value);
}

function pickAfterSaleId(source = {}) {
  const value = firstDefined(
    source.afterSaleId,
    source.after_sale_id,
    source.afterSaleNo,
    source.after_sale_no,
    source.refundNo,
    source.refund_no,
    source.refundId,
    source.refund_id,
    source.id
  );
  return value && !isBackendStatusOnlyId(source, value) ? value : "";
}

function pickAfterSaleStatus(source = {}) {
  return firstDefined(
    source.statusText,
    source.status_text,
    source.refundStatusText,
    source.refund_status_text,
    source.afterSaleStatusText,
    source.after_sale_status_text,
    source.desc,
    source.refundStatus,
    source.refund_status,
    source.afterSaleStatus,
    source.after_sale_status,
    source.after_status,
    source.status
  );
}

function pickOrderItemId(source = {}) {
  return firstDefined(
    source.orderItemId,
    source.order_item_id,
    source.itemId,
    source.item_id,
    source.orderGoodsId,
    source.order_goods_id,
    source.id,
    source.skuId,
    source.sku_id
  );
}

function collectAfterSaleRecords(data = {}) {
  const sources = [
    data.afterSales,
    data.after_sales,
    data.afterSaleList,
    data.after_sale_list,
    data.refundList,
    data.refund_list,
    data.refunds,
    data.refundInfo,
    data.refund_info,
    data.afterSale,
    data.after_sale
  ];
  return sources.reduce((list, source) => {
    if (!source) return list;
    if (Array.isArray(source)) return list.concat(source);
    if (Array.isArray(source.list)) return list.concat(source.list);
    if (Array.isArray(source.records)) return list.concat(source.records);
    if (Array.isArray(source.items)) return list.concat(source.items);
    return list.concat(source);
  }, []);
}

function isBackendStatusOnlyId(source = {}, value) {
  const text = String(value || '').toUpperCase();
  if (!text) return false;
  const statusLike = ['APPLIED', 'APPLY', 'PENDING', 'PENDING_REVIEW', 'WAIT_AUDIT', 'WAIT_SELLER', 'WAIT_MERCHANT', 'PROCESSING', 'REFUNDING', 'IN_PROGRESS', 'APPROVED', 'PASS', 'PASSED', 'MERCHANT_APPROVED', 'RETURNING', 'WAIT_RETURN', 'WAIT_BUYER_RETURN', 'REJECTED', 'REJECT', 'CANCELLED', 'CANCELED', 'CLOSED', 'REFUNDED', 'REFUND_SUCCESS', 'SUCCESS', 'FAILED'];
  return source.id === value && statusLike.includes(text) && !source.afterSaleId && !source.after_sale_id && !source.refundNo && !source.refund_no && !source.refundId && !source.refund_id;
}

function matchAfterSaleRecord(item = {}, records = []) {
  const itemIds = [
    item.orderItemId,
    item.order_item_id,
    item.itemId,
    item.item_id,
    item.id,
    item.skuId,
    item.sku_id
  ].filter((value) => value !== undefined && value !== null && value !== "").map(String);
  return records.find((record = {}) => {
    const goods = record.orderGoods || record.orderItem || record.item || record.goods || record.goodsInfo || {};
    const recordItemIds = [
      record.orderItemId,
      record.order_item_id,
      record.itemId,
      record.item_id,
      record.orderGoodsId,
      record.order_goods_id,
      record.goodsItemId,
      record.goods_item_id,
      record.item?.id,
      record.item?.orderItemId,
      record.orderItem?.id,
      record.orderItem?.orderItemId,
      record.goods?.id,
      record.goods?.orderItemId,
      pickOrderItemId(goods)
    ].filter((value) => value !== undefined && value !== null && value !== "").map(String);
    return recordItemIds.length && itemIds.some((id) => recordItemIds.includes(id));
  }) || {};
}

function hasAfterSaleSignal(source = {}) {
  return Boolean(pickAfterSaleId(source) || pickAfterSaleStatus(source));
}

function selectAfterSalePayload(...sources) {
  return sources.find((source) => hasAfterSaleSignal(source || {})) || {};
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
  const usePoints = Boolean(data.use_integral || data.useIntegral || data.usePoints || data.use_points);
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
    usedPoints: pointsAmount,
    used_points: pointsAmount,
    integral_num: pointsAmount,
    usePoints,
    use_points: usePoints,
    useIntegral: usePoints,
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
    data.usePointsAmount,
    data.use_points_amount,
    data.usablePointsAmount,
    data.usable_points_amount,
    data.maxUsableAmount,
    data.max_usable_amount,
    data.integralAmount,
    data.integral_amount,
    data.integralDeductAmount,
    data.integral_deduct_amount,
    baseInfo.deductAmount,
    baseInfo.deduct_amount,
    baseInfo.pointsDeductAmount,
    baseInfo.points_deduct_amount,
    baseInfo.usePointsAmount,
    baseInfo.use_points_amount,
    baseInfo.usablePointsAmount,
    baseInfo.usable_points_amount,
    baseInfo.maxUsableAmount,
    baseInfo.max_usable_amount,
    baseInfo.integralAmount,
    baseInfo.integral_amount,
    baseInfo.integralDeductAmount,
    baseInfo.integral_deduct_amount,
    orderInfo.deductAmount,
    orderInfo.deduct_amount,
    orderInfo.pointsDeductAmount,
    orderInfo.points_deduct_amount,
    orderInfo.usePointsAmount,
    orderInfo.use_points_amount,
    orderInfo.usablePointsAmount,
    orderInfo.usable_points_amount,
    orderInfo.maxUsableAmount,
    orderInfo.max_usable_amount,
    orderInfo.integralAmount,
    orderInfo.integral_amount,
    orderInfo.integralDeductAmount,
    orderInfo.integral_deduct_amount,
    amountInfo.pointsDeductAmount,
    amountInfo.points_deduct_amount,
    amountInfo.usePointsAmount,
    amountInfo.use_points_amount,
    amountInfo.usablePointsAmount,
    amountInfo.usable_points_amount,
    amountInfo.maxUsableAmount,
    amountInfo.max_usable_amount,
    amountInfo.integralAmount,
    amountInfo.integral_amount,
    amountInfo.integralDeductAmount,
    amountInfo.integral_deduct_amount,
    pointsInfo.pointsDeductAmount,
    pointsInfo.points_deduct_amount,
    pointsInfo.usePointsAmount,
    pointsInfo.use_points_amount,
    pointsInfo.usablePointsAmount,
    pointsInfo.usable_points_amount,
    pointsInfo.maxUsableAmount,
    pointsInfo.max_usable_amount,
    pointsInfo.integralAmount,
    pointsInfo.integral_amount,
    pointsInfo.integralDeductAmount,
    pointsInfo.integral_deduct_amount,
    pointsInfo.deductAmount,
    pointsInfo.deduct_amount,
    0
  );
  const maxDeductAmount = firstDefined(
    data.maxDeductAmount,
    data.max_deduct_amount,
    data.maxUseAmount,
    data.max_use_amount,
    data.maxUsableAmount,
    data.max_usable_amount,
    data.maxPointsDeductAmount,
    data.max_points_deduct_amount,
    data.maxIntegralDeductAmount,
    data.max_integral_deduct_amount,
    baseInfo.maxDeductAmount,
    baseInfo.max_deduct_amount,
    baseInfo.maxUseAmount,
    baseInfo.max_use_amount,
    baseInfo.maxUsableAmount,
    baseInfo.max_usable_amount,
    baseInfo.maxPointsDeductAmount,
    baseInfo.max_points_deduct_amount,
    baseInfo.maxIntegralDeductAmount,
    baseInfo.max_integral_deduct_amount,
    orderInfo.maxDeductAmount,
    orderInfo.max_deduct_amount,
    orderInfo.maxUseAmount,
    orderInfo.max_use_amount,
    orderInfo.maxUsableAmount,
    orderInfo.max_usable_amount,
    orderInfo.maxPointsDeductAmount,
    orderInfo.max_points_deduct_amount,
    orderInfo.maxIntegralDeductAmount,
    orderInfo.max_integral_deduct_amount,
    amountInfo.maxDeductAmount,
    amountInfo.max_deduct_amount,
    amountInfo.maxUseAmount,
    amountInfo.max_use_amount,
    amountInfo.maxUsableAmount,
    amountInfo.max_usable_amount,
    pointsInfo.maxDeductAmount,
    pointsInfo.max_deduct_amount,
    pointsInfo.maxUseAmount,
    pointsInfo.max_use_amount,
    pointsInfo.maxUsableAmount,
    pointsInfo.max_usable_amount,
    pointsInfo.maxPointsDeductAmount,
    pointsInfo.max_points_deduct_amount,
    pointsInfo.maxIntegralDeductAmount,
    pointsInfo.max_integral_deduct_amount,
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
    maxDeductAmount,
    max_deduct_amount: maxDeductAmount,
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
    maxDeductAmount,
    max_deduct_amount: maxDeductAmount,
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
  const count = numberValue(firstDefined(item.goods_num, item.quantity, item.num, 1), 1);
  const itemAmount = numberValue(firstDefined(item.total_price, item.totalPrice, item.totalAmount, item.realAmount, item.payAmount, item.pay_amount, ""), 0);
  const computedAmount = numberValue(price, 0) * count;
  const totalPrice = itemAmount > 0 ? itemAmount : (computedAmount > 0 ? computedAmount : price);
  return {
    ...item,
    id: item.id || item.orderItemId || item.itemId || item.skuId,
    item_id: item.item_id || item.orderItemId || item.itemId || item.skuId,
    goods_id: firstDefined(item.goods_id, item.goodsId, item.spuId, item.spu_id, item.productId, item.product_id, item.product_id_str, item.item?.goodsId, item.goods?.id),
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
    total_price: totalPrice,
    totalPrice,
    totalAmount: firstDefined(item.totalAmount, item.total_price, item.totalPrice, item.realAmount, totalPrice),
    original_price: item.original_price || item.originPrice || item.marketPrice || price,
    is_express: item.is_express ?? item.supportDelivery ?? true,
    is_selffetch: item.is_selffetch ?? item.supportPickup ?? true,
  };
}

function itemListAmountSum(list = []) {
  const amount = list.reduce((sum, item = {}) => {
    const count = numberValue(firstDefined(item.goods_num, item.quantity, item.num, 1), 1);
    const price = numberValue(firstDefined(item.goods_price, item.goodsPrice, item.salePrice, item.unitPrice, item.price, ""), 0);
    if (price > 0) return sum + (price * count);
    const explicitAmount = numberValue(firstDefined(item.total_price, item.totalPrice, item.totalAmount, item.realAmount, ""), 0);
    return explicitAmount > 0 ? sum + explicitAmount : sum;
  }, 0);
  return amount > 0 ? amount.toFixed(2) : "";
}

function pickShopAmount(data = {}, itemList = []) {
  const amountInfo = data.amountInfo || data.amount_info || {};
  const shopInfo = data.shopInfo || data.shop_info || data.storeInfo || data.store_info || {};
  const explicitAmount = firstDefined(
    data.shopAmount,
    data.shop_amount,
    data.shopPayAmount,
    data.shop_pay_amount,
    data.merchantPayAmount,
    data.merchant_pay_amount,
    data.storePayAmount,
    data.store_pay_amount,
    amountInfo.shopAmount,
    amountInfo.shop_amount,
    amountInfo.shopPayAmount,
    amountInfo.shop_pay_amount,
    shopInfo.shopAmount,
    shopInfo.shop_amount,
    shopInfo.payAmount,
    shopInfo.pay_amount
  );
  if (!isEmptyBackendText(explicitAmount)) return explicitAmount;
  return itemListAmountSum(itemList);
}

function formatOrderStatus(status) {
  const normalized = String(status || '').toUpperCase();
  const statusMap = {
    CREATED: "待支付",
    WAIT_PAY: "待支付",
    PENDING_PAY: "待支付",
    UNPAID: "待支付",
    PAID: "待发货",
    WAIT_SHIP: "待发货",
    WAIT_DELIVERY: "待发货",
    SHIPPED: "已发货",
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

function normalizePayStatusValue(value) {
  return String(value || '').trim().replace(/[\s-]+/g, '_').toUpperCase();
}

function isPaidStatusValue(value) {
  const normalized = normalizePayStatusValue(value);
  return value === 1 || value === "1" || ["PAID", "PAYED", "SUCCESS", "SUCCEEDED", "PAID_SUCCESS", "PAY_SUCCESS", "FINISHED", "COMPLETED"].includes(normalized);
}

function isUnpaidOrderStatusValue(value) {
  const normalized = normalizePayStatusValue(value);
  return value === 0 || value === "0" || ["CREATED", "WAIT_PAY", "PENDING_PAY", "UNPAID", "NOT_PAID"].includes(normalized);
}

function isWaitShipStatusValue(value) {
  const normalized = normalizePayStatusValue(value);
  return value === 1 || value === "1" || ["PAID", "WAIT_SHIP", "WAIT_DELIVERY"].includes(normalized);
}
function formatRefundStatus(status) {
  if (isEmptyBackendText(status)) return "";
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

function isRefundingOrderStatus(status) {
  const normalized = String(status || '').toUpperCase();
  return ['REFUNDING', 'AFTER_SALE', 'AFTER_SALES', 'AFTERSALE', 'REFUND_APPLIED', 'REFUND_PROCESSING'].includes(normalized);
}

function normalizeDeliveryStatus(value) {
  return String(value || '').trim().replace(/[\s-]+/g, '_').toUpperCase();
}

function isShippedStatusText(value) {
  const text = cleanBackendText(value, "");
  return Boolean(text && /(已发货|待收货|待签收|运输中|派送中|已揽收)/.test(text));
}

function isShippedDeliveryStatus(status) {
  return ['SHIPPED', 'DELIVERED', 'IN_TRANSIT', 'WAIT_RECEIVE', 'RECEIVING', 'RECEIVED', 'SIGNED'].includes(normalizeDeliveryStatus(status)) || isShippedStatusText(status);
}

function isReceivableDeliveryStatus(status) {
  return ['WAIT_RECEIVE', 'DELIVERED', 'RECEIVING'].includes(normalizeDeliveryStatus(status));
}

function hasShippingSignal(data = {}, baseInfo = {}, deliveryInfo = {}) {
  return Boolean(
    isShippedDeliveryStatus(data.deliveryStatus || data.delivery_status || baseInfo.deliveryStatus || baseInfo.delivery_status || deliveryInfo.deliveryStatus || deliveryInfo.delivery_status) ||
    isShippedStatusText(data.orderStatusText || data.order_status_text || baseInfo.orderStatusText || baseInfo.order_status_text || data.orderStatusDesc || data.statusText || data.status_text || baseInfo.orderStatusDesc || baseInfo.statusText || data.order_status_desc) ||
    firstDefined(data.shippedAt, data.shippingTime, data.shipping_time, baseInfo.shippedAt, baseInfo.shippingTime, baseInfo.shipping_time, deliveryInfo.shippedAt, deliveryInfo.shippingTime, deliveryInfo.shipping_time) ||
    firstDefined(data.expressNo, data.express_no, data.trackingNo, data.tracking_no, data.invoice_no, baseInfo.expressNo, baseInfo.express_no, baseInfo.trackingNo, baseInfo.tracking_no, baseInfo.invoice_no, deliveryInfo.expressNo, deliveryInfo.express_no, deliveryInfo.trackingNo, deliveryInfo.tracking_no, deliveryInfo.invoiceNo, deliveryInfo.invoice_no)
  );
}

function isOrderNoLikePickupCode(value, data = {}, baseInfo = {}) {
  const text = String(value || '').trim();
  if (!text) return false;
  const orderIds = [
    data.orderNo,
    data.order_no,
    data.orderSn,
    data.order_sn,
    data.id,
    baseInfo.orderNo,
    baseInfo.order_no,
    baseInfo.orderSn,
    baseInfo.order_sn,
    baseInfo.id
  ].filter(Boolean).map(String);
  return orderIds.includes(text);
}

function pickRealPickupCode(data = {}, baseInfo = {}, pickupInfo = {}) {
  const verifyInfo = data.verifyInfo || data.verify_info || {};
  const candidates = [
    baseInfo.pickupCode,
    baseInfo.pickup_code,
    verifyInfo.pickupCode,
    verifyInfo.pickup_code,
    verifyInfo.verifyCode,
    verifyInfo.verify_code,
    verifyInfo.code,
    pickupInfo.pickupCode,
    pickupInfo.pickup_code,
    pickupInfo.verifyCode,
    pickupInfo.verify_code,
    pickupInfo.code,
    data.pickup_code,
    data.pickupCode,
    data.verifyCode,
    data.verify_code
  ];
  return candidates.find((value) => value && !isOrderNoLikePickupCode(value, data, baseInfo)) || '';
}

function pickOrderAfterSalePayload(data = {}, baseInfo = {}) {
  const refundInfo = data.refundInfo || data.refund_info || {};
  const afterSale = data.afterSale || data.after_sale || {};
  return selectAfterSalePayload(refundInfo, afterSale, {
    refundNo: data.refundNo || data.refund_no || baseInfo.refundNo || baseInfo.refund_no,
    refundStatus: data.refundStatus || data.refund_status || baseInfo.refundStatus || baseInfo.refund_status,
    refundStatusText: data.refundStatusText || data.refund_status_text || baseInfo.refundStatusText || baseInfo.refund_status_text,
    afterSaleStatus: data.afterSaleStatus || data.after_sale_status || baseInfo.afterSaleStatus || baseInfo.after_sale_status,
    afterSaleStatusText: data.afterSaleStatusText || data.after_sale_status_text || baseInfo.afterSaleStatusText || baseInfo.after_sale_status_text,
    status: isRefundingOrderStatus(data.orderStatus || data.order_status || data.status || baseInfo.orderStatus || baseInfo.order_status || baseInfo.status) ? 'REFUNDING' : ''
  });
}

function normalizeOrderDetail(data = {}) {
  const baseInfo = data.baseInfo || data;
  const amountInfo = data.amountInfo || data.amount_info || baseInfo.amountInfo || baseInfo.amount_info || {};
  const normalizedPoints = normalizePointsFields(data);
  const pointsInfo = normalizedPoints.pointsInfo || {};
  const deliveryInfo = data.deliveryInfo || data.delivery_info || data.logisticsInfo || data.logistics_info || {};
  const receiverInfo = data.receiverInfo || data.receiver_info || data.addressInfo || data.address_info || {};
  const shopInfo = data.shopInfo || data.shop_info || data.storeInfo || data.store_info || {};
  const pickupInfo = data.pickupInfo || data.pickup_info || data.selffetchInfo || data.selffetch_info || data.selfFetchInfo || data.self_fetch_info || data.pickup || data.selfPickup || data.self_pickup || baseInfo.pickupInfo || baseInfo.pickup_info || {};
  const selffetchShop = baseInfo.selffetchShop || data.selffetch_shop || data.selffetchShop || data.pickupShop || data.pickup_shop || data.storeInfo || data.store_info || pickupInfo.selffetchShop || pickupInfo.selffetch_shop || pickupInfo.pickupShop || pickupInfo.pickup_shop || pickupInfo.store || pickupInfo.shop || {};
  const orderChannel = data.orderChannel || data.order_channel || baseInfo.orderChannel || baseInfo.order_channel || '';
  const channelText = String(orderChannel || '').toUpperCase();
  const deliveryType = baseInfo.deliveryType || data.delivery_type || data.deliveryType || pickupInfo.deliveryType || pickupInfo.delivery_type || (channelText === 'OFFLINE_PICKUP' ? 2 : '');
  const normalizedDeliveryType = String(deliveryType || '').toUpperCase();
  const isSelfFetch = deliveryType === 2 || normalizedDeliveryType === '2' || ['PICKUP', 'SELF_FETCH', 'SELF_PICKUP', 'SELFFETCH', 'STORE_PICKUP'].includes(normalizedDeliveryType);
  const orderScene = firstDefined(data.orderScene, data.order_scene, data.categoryType, data.category_type, isSelfFetch ? 'offline' : '');
  const status = firstDefined(data.orderStatus, baseInfo.orderStatus, data.order_status, data.status);
  const normalizedStatus = String(status || '').toUpperCase();
  const paymentInfo = data.paymentInfo || data.payment_info || data.payInfo || data.pay_info || baseInfo.paymentInfo || baseInfo.payment_info || {};
  const payStatus = firstDefined(data.payStatus, baseInfo.payStatus, data.pay_status, baseInfo.pay_status, data.paymentStatus, baseInfo.paymentStatus, data.payment_status, baseInfo.payment_status, paymentInfo.payStatus, paymentInfo.pay_status, paymentInfo.paymentStatus, paymentInfo.payment_status, paymentInfo.status);
  const payTime = firstDefined(baseInfo.paidAt, baseInfo.payTime, baseInfo.pay_time, data.paidAt, data.pay_time, data.payTime, data.paid_at, paymentInfo.paidAt, paymentInfo.paid_at, paymentInfo.payTime, paymentInfo.pay_time);
  const paidAmount = firstDefined(data.paidAmount, data.paid_amount, baseInfo.paidAmount, baseInfo.paid_amount, paymentInfo.paidAmount, paymentInfo.paid_amount);
  const transactionNo = firstDefined(data.transactionId, data.transaction_id, data.transactionNo, data.transaction_no, baseInfo.transactionId, baseInfo.transaction_id, paymentInfo.transactionId, paymentInfo.transaction_id, paymentInfo.transactionNo, paymentInfo.transaction_no);
  const isPaidByPayment = isPaidStatusValue(payStatus) || Boolean(payTime) || Boolean(transactionNo) || numberValue(paidAmount, 0) > 0;
  const deliveryStatus = data.deliveryStatus || data.delivery_status || baseInfo.deliveryStatus || baseInfo.delivery_status || deliveryInfo.deliveryStatus || deliveryInfo.delivery_status;
  const verificationStatus = firstDefined(data.verificationStatus, data.verification_status, data.verifyStatus, data.verify_status, baseInfo.verificationStatus, baseInfo.verification_status, baseInfo.verifyStatus, baseInfo.verify_status);
  const paidFallbackStatus = isUnpaidOrderStatusValue(status) ? 'PAID' : status;
  const effectiveBaseStatus = isPaidByPayment ? paidFallbackStatus : status;
  const effectiveBaseStatusText = String(effectiveBaseStatus || '').toUpperCase();
  const effectiveStatus = isWaitShipStatusValue(effectiveBaseStatus) && hasShippingSignal(data, baseInfo, deliveryInfo) ? 'SHIPPED' : effectiveBaseStatus;
  const normalizedEffectiveStatus = String(effectiveStatus || '').toUpperCase();
  const orderAfterSale = pickOrderAfterSalePayload(data, baseInfo);
  const orderAfterSaleId = firstDefined(pickAfterSaleId(orderAfterSale), data.refundNo, data.refund_no, baseInfo.refundNo, baseInfo.refund_no);
  const orderAfterSaleStatus = firstDefined(
    pickAfterSaleStatus(orderAfterSale),
    data.refundStatusText,
    data.refund_status_text,
    data.refundStatus,
    data.refund_status,
    baseInfo.refundStatusText,
    baseInfo.refund_status_text,
    baseInfo.refundStatus,
    baseInfo.refund_status,
    isRefundingOrderStatus(status) ? 'REFUNDING' : ''
  );
  const refundedByStatus = ['REFUNDED', 'REFUND_SUCCESS'].includes(normalizedStatus) || ['REFUNDED', 'REFUND_SUCCESS'].includes(normalizedEffectiveStatus);
  const orderAfterSaleText = refundedByStatus ? '售后' : (orderAfterSaleId || orderAfterSaleStatus ? (formatRefundStatus(orderAfterSaleStatus) || '售后处理中') : '');
  const isAfterSaleOrder = Boolean(refundedByStatus || orderAfterSaleId || orderAfterSaleText || isRefundingOrderStatus(status));
  const isWaitPay = !isPaidByPayment && isUnpaidOrderStatusValue(effectiveStatus);
  const isWaitShip = isWaitShipStatusValue(effectiveStatus);
  const isSelfFetchVerified = isSelfFetch && (['VERIFIED', 'USED', 'CONSUMED'].includes(String(verificationStatus || '').toUpperCase()) || ['COMPLETED', 'SUCCESS', 'FINISHED', '3'].includes(normalizedEffectiveStatus) || effectiveStatus === 3);
  const selfFetchStatusText = isSelfFetch ? (refundedByStatus ? '售后' : isSelfFetchVerified ? '已核销' : isWaitShip ? '待核销' : '') : '';
  const isWaitReceive = ['WAIT_RECEIVE', 'DELIVERED', 'RECEIVING', '2'].includes(normalizedEffectiveStatus) || effectiveStatus === 2 || isReceivableDeliveryStatus(deliveryStatus);
  const isShippedOnly = ['SHIPPED', 'IN_TRANSIT'].includes(normalizedEffectiveStatus) || hasShippingSignal(data, baseInfo, deliveryInfo);
  const isFinished = ['COMPLETED', 'SUCCESS', 'FINISHED', '3'].includes(normalizedEffectiveStatus) || effectiveStatus === 3;
  const isClosed = ['CANCELLED', 'CANCELED', 'CLOSED', 'CLOSE', 'CLOSED_ORDER', '4'].includes(normalizedEffectiveStatus) || effectiveStatus === 4;
  const backendCanRefund = firstDefined(data.canRefund, data.refundable, data.can_refund, data.refund_btn, data.refundBtn, baseInfo.canRefund, baseInfo.refundable, baseInfo.can_refund, baseInfo.refund_btn, baseInfo.refundBtn);
  const canRefund = !isAfterSaleOrder && booleanValue(backendCanRefund, isWaitShip);
  const shopOrders = data.shopOrders || data.shop_orders || [];
  const itemListSource = data.itemList || data.order_goods || data.goods_lists || data.items || (Array.isArray(shopOrders) ? flattenShopOrders(shopOrders) : []);
  const afterSaleRecords = collectAfterSaleRecords(data);
  const itemList = itemListSource.map((item) => {
    const normalizedItem = normalizeOrderItem(item);
    const matchedAfterSale = matchAfterSaleRecord(item, afterSaleRecords);
    const afterSale = selectAfterSalePayload(item.afterSale, item.after_sale, item.refundInfo, item.refund_info, matchedAfterSale, orderAfterSale);
    const afterSaleId = firstDefined(pickAfterSaleId(afterSale), item.afterSaleId, item.after_sale_id, item.refundNo, item.refund_no, item.refundId, item.refund_id, orderAfterSaleId);
    const afterStatus = firstDefined(
      pickAfterSaleStatus(afterSale),
      item.after_status_desc,
      item.afterStatusDesc,
      item.after_status,
      item.refundStatusText,
      item.refund_status_text,
      item.refundStatus,
      item.refund_status,
      item.afterSaleStatus,
      item.after_sale_status,
      orderAfterSaleStatus
    );
    const afterStatusText = afterSaleId ? (formatRefundStatus(afterStatus) || '售后处理中') : (afterStatus !== undefined ? formatRefundStatus(afterStatus) : '');
    const itemRefundFlag = firstDefined(item.refund_btn, item.refundBtn, item.canRefund, item.can_refund, item.refundable);
    return {
      ...normalizedItem,
      order_id: firstDefined(item.order_id, item.orderId, item.orderNo, item.order_sn, data.orderNo, baseInfo.orderNo, data.id),
      order_status: effectiveStatus,
      raw_order_status: status,
      delivery_status: deliveryStatus,
      verification_status: verificationStatus,
      verify_status: verificationStatus,
      order_status_desc: selfFetchStatusText || (effectiveStatus !== status ? formatOrderStatus(effectiveStatus) : (cleanBackendText(data.orderStatusText || data.order_status_text || baseInfo.orderStatusText || baseInfo.order_status_text || data.orderStatusDesc || data.statusText || data.status_text || baseInfo.orderStatusDesc || baseInfo.statusText || data.order_status_desc, "") || formatOrderStatus(effectiveStatus))),
      order_can_refund: canRefund,
      after_sale_id: afterSaleId || '',
      after_status_desc: afterStatusText || '',
      refund_info: afterSale,
      refund_btn: booleanValue(itemRefundFlag, canRefund) && !afterSaleId && !afterStatusText
    };
  });
  const shopAmount = pickShopAmount(data, itemList);
  return {
    ...data,
    ...normalizedPoints,
    id: data.orderNo || baseInfo.orderNo || data.id,
    order_sn: data.orderNo || baseInfo.orderNo || baseInfo.orderSn || data.order_sn,
    order_status: effectiveStatus,
    raw_order_status: status,
    delivery_status: deliveryStatus,
    verification_status: verificationStatus,
    verify_status: verificationStatus,
    order_status_desc: orderAfterSaleText || selfFetchStatusText || (effectiveStatus !== status ? formatOrderStatus(effectiveStatus) : (cleanBackendText(data.orderStatusText || data.order_status_text || baseInfo.orderStatusText || baseInfo.order_status_text || data.orderStatusDesc || data.statusText || data.status_text || baseInfo.orderStatusDesc || baseInfo.statusText || data.order_status_desc, "") || formatOrderStatus(effectiveStatus))),
    pay_status: payStatus,
    order_amount: firstDefined(amountInfo.payAmount, data.payAmount, baseInfo.orderAmount, data.order_amount),
    shop_amount: shopAmount,
    shopAmount,
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
    pay_time: payTime,
    shipping_time: baseInfo.shippedAt || baseInfo.shippingTime || data.shippedAt || data.shipping_time,
    confirm_take_time: baseInfo.confirmTime || data.confirm_take_time,
    cancel_time: baseInfo.cancelTime || data.cancel_time,
    order_cancel_time: baseInfo.expireTime || data.expireTime || data.order_cancel_time,
    delivery_type: deliveryType,
    orderScene,
    order_scene: orderScene,
    categoryType: orderScene,
    category_type: orderScene,
    order_type: baseInfo.orderType || data.order_type || 0,
    consignee: cleanEmptyBackendText(baseInfo.consignee || baseInfo.receiverName || pickupInfo.consignee || pickupInfo.receiverName || pickupInfo.contact || pickupInfo.contactName || pickupInfo.contact_name || pickupInfo.pickupName || pickupInfo.pickup_name || receiverInfo.consignee || receiverInfo.receiverName || data.consignee, ""),
    mobile: cleanEmptyBackendText(baseInfo.mobile || baseInfo.receiverMobile || pickupInfo.mobile || pickupInfo.receiverMobile || pickupInfo.telephone || pickupInfo.phone || pickupInfo.contactMobile || pickupInfo.contact_mobile || pickupInfo.pickupMobile || pickupInfo.pickup_mobile || receiverInfo.mobile || receiverInfo.receiverMobile || data.mobile, ""),
    delivery_address: cleanEmptyBackendText(baseInfo.addressText || baseInfo.deliveryAddress || baseInfo.detailAddress || receiverInfo.addressText || receiverInfo.detailAddress || data.delivery_address, ""),
    receiver_latitude: firstDefined(baseInfo.receiverLatitude, baseInfo.receiver_latitude, baseInfo.latitude, baseInfo.lat, receiverInfo.receiverLatitude, receiverInfo.receiver_latitude, receiverInfo.latitude, receiverInfo.lat, receiverInfo.mapLat, receiverInfo.map_lat, receiverInfo.addressLat, receiverInfo.address_lat, data.receiverLatitude, data.receiver_latitude, data.latitude, data.lat, data.mapLat, data.map_lat, data.addressLat, data.address_lat, ''),
    receiver_longitude: firstDefined(baseInfo.receiverLongitude, baseInfo.receiver_longitude, baseInfo.longitude, baseInfo.lng, baseInfo.lon, receiverInfo.receiverLongitude, receiverInfo.receiver_longitude, receiverInfo.longitude, receiverInfo.lng, receiverInfo.lon, receiverInfo.mapLng, receiverInfo.map_lng, receiverInfo.addressLng, receiverInfo.address_lng, data.receiverLongitude, data.receiver_longitude, data.longitude, data.lng, data.lon, data.mapLng, data.map_lng, data.addressLng, data.address_lng, ''),
    user_remark: cleanEmptyBackendText(data.userRemark || data.user_remark || baseInfo.userRemark || baseInfo.remark, ""),
    express_name: cleanEmptyBackendText(deliveryInfo.expressName || deliveryInfo.company || deliveryInfo.shippingName || data.express_name || data.expressName, ""),
    express_no: cleanEmptyBackendText(deliveryInfo.expressNo || deliveryInfo.trackingNo || deliveryInfo.invoiceNo || data.express_no || data.trackingNo || data.invoice_no, ""),
    selffetch_shop: {
      ...selffetchShop,
      name: selffetchShop.name || selffetchShop.shopName || selffetchShop.shop_name || selffetchShop.storeName || pickupInfo.pickupName || pickupInfo.pickup_name || data.pickupName || data.pickup_name || '',
      shop_address: selffetchShop.shop_address || selffetchShop.address || selffetchShop.detailAddress || selffetchShop.detail_address || selffetchShop.addressText || selffetchShop.address_text || pickupInfo.pickupAddress || pickupInfo.pickup_address || pickupInfo.address || pickupInfo.addressText || pickupInfo.address_text || data.pickupAddress || data.pickup_address || '',
      business_start_time: selffetchShop.business_start_time || selffetchShop.businessStartTime || selffetchShop.openStartTime || '',
      business_end_time: selffetchShop.business_end_time || selffetchShop.businessEndTime || selffetchShop.openEndTime || '',
      mobile: selffetchShop.mobile || selffetchShop.phone || selffetchShop.contactMobile || selffetchShop.contact_mobile || '',
      latitude: firstDefined(selffetchShop.latitude, selffetchShop.lat, selffetchShop.shopLatitude, selffetchShop.shop_latitude, selffetchShop.mapLat, selffetchShop.map_lat, selffetchShop.pickupLatitude, selffetchShop.pickup_latitude, pickupInfo.pickupLatitude, pickupInfo.pickup_latitude, pickupInfo.latitude, pickupInfo.lat, pickupInfo.mapLat, pickupInfo.map_lat, data.pickupLatitude, data.pickup_latitude, data.latitude, data.lat, ''),
      longitude: firstDefined(selffetchShop.longitude, selffetchShop.lng, selffetchShop.lon, selffetchShop.shopLongitude, selffetchShop.shop_longitude, selffetchShop.mapLng, selffetchShop.map_lng, selffetchShop.pickupLongitude, selffetchShop.pickup_longitude, pickupInfo.pickupLongitude, pickupInfo.pickup_longitude, pickupInfo.longitude, pickupInfo.lng, pickupInfo.lon, pickupInfo.mapLng, pickupInfo.map_lng, data.pickupLongitude, data.pickup_longitude, data.longitude, data.lng, data.lon, '')
    },
    pickup_code: pickRealPickupCode(data, baseInfo, pickupInfo),
    verification_status: baseInfo.verificationStatus || data.verifyInfo?.verificationStatus || data.verification_status,
    status_flow: data.statusFlow || data.status_flow || [],
    refund_info: orderAfterSale,
    after_sale_id: orderAfterSaleId || '',
    after_status_desc: orderAfterSaleText || '',
    verify_info: data.verifyInfo || data.verify_info || {},
    team: data.team || {},
    cancel_btn: !isAfterSaleOrder && firstDefined(data.cancel_btn, data.cancelBtn, baseInfo.cancelBtn, isWaitPay),
    delivery_btn: !isSelfFetch && firstDefined(data.delivery_btn, data.deliveryBtn, baseInfo.deliveryBtn, isWaitReceive || isFinished || isShippedOnly),
    take_btn: !isSelfFetch && firstDefined(data.take_btn, data.takeBtn, baseInfo.takeBtn, isWaitReceive),
    receivable: !isSelfFetch && isWaitReceive,
    can_confirm_receipt: !isSelfFetch && isWaitReceive,
    del_btn: firstDefined(data.del_btn, data.delBtn, baseInfo.delBtn, isClosed || isFinished),
    pay_btn: firstDefined(data.pay_btn, data.payBtn, baseInfo.payBtn, isWaitPay),
    comment_btn: firstDefined(data.comment_btn, data.commentBtn, baseInfo.commentBtn, isFinished),
    pickup_btn: !isAfterSaleOrder && firstDefined(data.pickup_btn, data.pickupBtn, baseInfo.pickupBtn, isSelfFetch && !isClosed),
    canRefund,
    refundable: canRefund,
    refund_btn: canRefund
  };
}

function normalizeOrderListItem(item = {}) {
  const detail = normalizeOrderDetail(item);
  const status = detail.order_status;
  const listAmount = pickShopAmount(detail, detail.order_goods || detail.goods_lists || []);
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
    shop_amount: firstDefined(detail.shop_amount, detail.shopAmount, listAmount),
    shopAmount: firstDefined(detail.shopAmount, detail.shop_amount, listAmount),
  };
}

function normalizeTraceRow(item = {}) {
  if (Array.isArray(item)) return item.filter(Boolean);
  if (typeof item === "string") return [item];
  const time = firstDefined(item.time, item.acceptTime, item.accept_time, item.createdAt, item.created_at, item.traceTime, item.trace_time);
  const content = firstDefined(item.content, item.context, item.desc, item.description, item.statusText, item.status_text, item.message, item.remark);
  const location = firstDefined(item.location, item.area, item.city);
  return [time, content, location].filter(Boolean);
}

function normalizeOrderTraces(data = {}) {
  const baseInfo = data.baseInfo || data;
  const deliveryInfo = data.deliveryInfo || data.delivery_info || data.logisticsInfo || data.logistics_info || {};
  const detail = normalizeOrderDetail(data);
  const goods = (detail.order_goods || detail.goods_lists || [])[0] || {};
  const receiverInfo = data.receiverInfo || data.receiver_info || data.addressInfo || data.address_info || {};
  const traceSource = firstDefined(
    deliveryInfo.traces,
    deliveryInfo.traceList,
    deliveryInfo.trace_list,
    deliveryInfo.routes,
    data.traces,
    data.traceList,
    data.trace_list,
    data.logisticsTraces,
    data.logistics_traces,
    []
  );
  const traces = Array.isArray(traceSource) ? traceSource.map(normalizeTraceRow).filter((row) => row.length) : [];
  const statusFlow = Array.isArray(detail.status_flow || data.statusFlow || data.status_flow) ? (detail.status_flow || data.statusFlow || data.status_flow) : [];
  const paidFlow = statusFlow.find((item = {}) => /支付|付款|PAID/i.test(String(item.title || item.name || item.status || item.statusText || ""))) || {};
  const shippedFlow = statusFlow.find((item = {}) => /发货|已发货|SHIPPED/i.test(String(item.title || item.name || item.status || item.statusText || ""))) || {};
  const finishedFlow = statusFlow.find((item = {}) => /完成|签收|收货|COMPLETED|FINISH/i.test(String(item.title || item.name || item.status || item.statusText || ""))) || {};
  const shippedTime = firstDefined(detail.shipping_time, shippedFlow.time, shippedFlow.createdAt, shippedFlow.created_at);
  const payTime = firstDefined(detail.pay_time, paidFlow.time, paidFlow.createdAt, paidFlow.created_at);
  const finishTime = firstDefined(detail.confirm_take_time, finishedFlow.time, finishedFlow.createdAt, finishedFlow.created_at);
  const expressName = firstDefined(detail.express_name, detail.shipping_name, deliveryInfo.expressName, deliveryInfo.express_name, deliveryInfo.company, deliveryInfo.companyName, deliveryInfo.company_name, deliveryInfo.shippingName, deliveryInfo.shipping_name, deliveryInfo.logisticsCompany, deliveryInfo.logistics_company, "");
  const expressNo = firstDefined(detail.express_no, detail.invoice_no, deliveryInfo.expressNo, deliveryInfo.express_no, deliveryInfo.trackingNo, deliveryInfo.tracking_no, deliveryInfo.invoiceNo, deliveryInfo.invoice_no, deliveryInfo.logisticsNo, deliveryInfo.logistics_no, deliveryInfo.deliveryNo, deliveryInfo.delivery_no, "");
  const receiverName = firstDefined(detail.consignee, baseInfo.receiverName, baseInfo.receiver_name, receiverInfo.receiverName, receiverInfo.receiver_name, receiverInfo.consignee, "");
  const receiverMobile = firstDefined(detail.mobile, baseInfo.receiverMobile, baseInfo.receiver_mobile, receiverInfo.receiverMobile, receiverInfo.receiver_mobile, receiverInfo.mobile, "");
  const receiverAddress = firstDefined(detail.delivery_address, baseInfo.addressText, baseInfo.address_text, baseInfo.deliveryAddress, baseInfo.delivery_address, receiverInfo.addressText, receiverInfo.address_text, receiverInfo.fullAddress, receiverInfo.full_address, receiverInfo.detailAddress, receiverInfo.detail_address, "");

  return {
    shipment: {
      title: "商家已发货",
      tips: shippedTime || expressNo || isShippedDeliveryStatus(detail.delivery_status) ? "包裹已交给承运方" : "",
      time: shippedTime || ""
    },
    buy: {
      title: "订单已支付",
      tips: payTime ? "买家已付款" : "",
      time: payTime || ""
    },
    delivery: {
      title: expressName || "物流运输中",
      traces
    },
    finish: {
      title: "确认收货",
      tips: finishTime ? "订单已确认收货" : "",
      time: finishTime || ""
    },
    order: {
      image: goods.image || goods.goods_image || goods.goodsImage || detail.shop_logo || "",
      count: detail.goods_num || (detail.order_goods || []).reduce((sum, item) => sum + Number(item.goods_num || 0), 0) || 1,
      tips: detail.order_status_desc || formatOrderStatus(detail.order_status),
      order_sn: detail.order_sn || detail.id || "",
      shipping_name: expressName || "暂无物流公司",
      invoice_no: expressNo || "暂无物流单号",
      delivery_status: detail.delivery_status || "",
      shipped_time: shippedTime || "",
      pay_time: payTime || "",
      finish_time: finishTime || ""
    },
    take: {
      contacts: receiverName,
      mobile: receiverMobile,
      address: receiverAddress
    },
    raw: detail
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
  const shopOrders = data.shopOrders || data.shop_orders || [];
  const goodsLists = (data.goods_lists || data.itemList || data.items || flattenShopOrders(shopOrders)).map(normalizeOrderItem);
  const couponInfo = data.couponInfo || data.coupon_info || data.couponSummary || data.coupon_summary || {};
  const usableCoupons = (data.availableCoupons || data.usableCoupons || data.usableCoupon || data.available_coupon || data.usable_coupon || data.usable || couponInfo.availableCoupons || couponInfo.usableCoupons || couponInfo.usableCoupon || couponInfo.usable || []).map(normalizeCouponItem);
  const unusableCoupons = (data.unavailableCoupons || data.unusableCoupons || data.unusableCoupon || data.unavailable_coupon || data.unusable_coupon || data.unusable || couponInfo.unavailableCoupons || couponInfo.unusableCoupons || couponInfo.unusableCoupon || couponInfo.unusable || []).map(normalizeCouponItem);
  const receivableCoupons = (data.receivableCoupons || data.receivableCoupon || data.receivable_coupons || data.receivable_coupon || data.claimableCoupons || data.claimableCoupon || data.claimable_coupons || data.claimable_coupon || data.coupons || data.couponList || data.coupon_list || couponInfo.receivableCoupons || couponInfo.receivableCoupon || couponInfo.claimableCoupons || couponInfo.claimableCoupon || couponInfo.coupons || []).map(normalizeCouponItem);
  const normalizedPoints = normalizePointsFields(data);
  const pointsInfo = normalizedPoints.pointsInfo || {};
  const amountInfo = data.amountInfo || data.amount_info || data.settlementAmount || data.settlement_amount || {};
  const shopAmountSum = (list = [], keys = []) => {
    const amount = list.reduce((sum, shop = {}) => {
      const value = firstDefined(...keys.map((key) => shop[key]));
      return value === undefined || value === null || value === '' ? sum : sum + numberValue(value, 0);
    }, 0);
    return amount > 0 ? amount : '';
  };
  const itemAmountSum = goodsLists.reduce((sum, item = {}) => {
    const count = numberValue(firstDefined(item.goods_num, item.quantity, item.num, 1), 1);
    const price = numberValue(firstDefined(item.goods_price, item.goodsPrice, item.salePrice, item.price, 0), 0);
    return sum + price * count;
  }, 0);
  const goodsAmount = firstDefined(amountInfo.goodsAmount, amountInfo.goods_amount, data.goodsAmount, data.goods_amount, data.totalGoodsAmount, data.total_goods_amount, data.total_goods_price, shopAmountSum(shopOrders, ['goodsAmount', 'goods_amount', 'totalGoodsAmount', 'total_goods_amount', 'goodsPrice', 'goods_price']), itemAmountSum, 0);
  const freightAmount = firstDefined(amountInfo.freightAmount, amountInfo.freight_amount, data.freightAmount, data.freight_amount, data.shippingAmount, data.shipping_amount, data.shipping_price, shopAmountSum(shopOrders, ['freightAmount', 'freight_amount', 'shippingAmount', 'shipping_amount', 'shippingPrice', 'shipping_price']), 0);
  const payAmount = firstDefined(amountInfo.payAmount, amountInfo.pay_amount, data.payAmount, data.pay_amount, data.orderAmount, data.order_amount, data.actualAmount, data.actual_amount, shopAmountSum(shopOrders, ['payAmount', 'pay_amount', 'orderAmount', 'order_amount', 'actualAmount', 'actual_amount']), 0);
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
    shopOrders,
    shop_orders: shopOrders,
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
  const categoryCandidates = [
    data.categoryType,
    data.category_type,
    data.goodsCategoryType,
    data.goods_category_type,
    data.orderScene,
    data.order_scene,
    data.freightType,
    data.freight_type,
    data.orderChannel,
    data.order_channel,
    ...goodsList.flatMap((item = {}) => [
      item.categoryType,
      item.category_type,
      item.goodsCategoryType,
      item.goods_category_type,
      item.orderScene,
      item.order_scene,
      item.freightType,
      item.freight_type
    ])
  ].map((item) => String(item || '').toUpperCase());
  const isOfflineOrder = categoryCandidates.includes('OFFLINE') || categoryCandidates.includes('OFFLINE_PICKUP') || categoryCandidates.includes('PICKUP');
  const normalizedDeliveryType = isOfflineOrder ? 2 : (data.deliveryType || data.delivery_type);
  const normalizedOrderChannel = isOfflineOrder ? 'OFFLINE_PICKUP' : (data.orderChannel || data.order_channel || '');
  const payload = compactPayload({
    submitToken: data.submitToken || data.submit_token || data.orderInfo?.submitToken || latestSubmitToken || '',
    source: data.source || (isCartOrder ? 'CART' : 'BUY_NOW'),
    orderChannel: normalizedOrderChannel,
    order_channel: normalizedOrderChannel,
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
    deliveryType: normalizedDeliveryType,
    delivery_type: normalizedDeliveryType,
    selffetchShopId: data.selffetchShopId || data.selffetch_shop_id || data.store_id,
    selffetch_shop_id: data.selffetch_shop_id || data.selffetchShopId || data.store_id,
    pickupLatitude: data.pickupLatitude || data.pickup_latitude,
    pickup_latitude: data.pickup_latitude || data.pickupLatitude,
    pickupLongitude: data.pickupLongitude || data.pickup_longitude,
    pickup_longitude: data.pickup_longitude || data.pickupLongitude,
    pickupAddress: data.pickupAddress || data.pickup_address,
    pickup_address: data.pickup_address || data.pickupAddress,
    pickupName: data.pickupName || data.pickup_name,
    pickup_name: data.pickup_name || data.pickupName,
    pickupContact: data.pickupContact || data.pickup_contact,
    pickup_contact: data.pickup_contact || data.pickupContact,
    pickupMobile: data.pickupMobile || data.pickup_mobile,
    pickup_mobile: data.pickup_mobile || data.pickupMobile,
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
  const orderScene = data.orderScene || data.order_scene || data.scene || '';
  return request.get("miniapp/orders", {
    params: {
      status: normalizeOrderStatus(data.status || data.type),
      orderScene,
      order_scene: orderScene,
      categoryType: orderScene,
      category_type: orderScene,
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
  return request.get(`miniapp/orders/${id}`).then((res) => res.code == 1 ? {
    ...res,
    data: normalizeOrderTraces(res.data || {})
  } : res);
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
  const payload = {
    merchantId: data.merchantId || data.merchant_id,
    verifyCode: data.verifyCode || data.verify_code || data.code,
    verify_code: data.verify_code || data.verifyCode || data.code,
    pickupCode: data.pickupCode || data.pickup_code || data.verifyCode || data.verify_code || data.code,
    pickup_code: data.pickup_code || data.pickupCode || data.verifyCode || data.verify_code || data.code,
    operatorId: data.operatorId || data.operator_id || data.userId || data.user_id,
    operator_id: data.operator_id || data.operatorId || data.userId || data.user_id
  }
  if (subOrderNo) {
    return request.put(`miniapp/merchant/orders/${subOrderNo}/verify`, payload)
      .then((res) => (res.rawCode === 'A0108' || /method/i.test(String(res.msg || res.message || '')))
        ? request.get(`miniapp/merchant/orders/${subOrderNo}/verify`, { params: payload, show: false })
        : res)
  }
  return request.put('miniapp/merchant/orders/verify', payload)
    .then((res) => (res.rawCode === 'A0108' || /method/i.test(String(res.msg || res.message || '')))
      ? request.get('miniapp/merchant/orders/verify', { params: payload, show: false })
      : res)
}
