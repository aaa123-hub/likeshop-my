# 多角色分销与区域代理前端对接缺口

本次前端已接入真实接口路径，不使用 Mock 数据。以下能力需要后端确认或补齐，否则页面会展示空态或接口不可用提示。

## 已接入接口

- `GET miniapp/roles`：返回当前用户已激活角色列表，同时可返回可申请角色配置。
- `GET miniapp/role-applications`：返回角色申请与押金状态。
- `POST miniapp/role-applications`：提交推广者、区域代理、子公司、总部、商家申请。
- `GET miniapp/roles/workbench`：角色工作台看板。
- `GET miniapp/points/ledger`：角色积分流水。
- `POST miniapp/share/qrcode`：生成吸粉码/小程序码。
- `POST miniapp/kyc/submit`、`GET miniapp/kyc/status`：用户 KYC。
- `POST miniapp/payments/create`：角色押金支付预下单。
- `GET miniapp/alliance/card`：扫码/太阳码进入后绑定推广关系，前端已传 `inviteCode/promoterUserId/roleCode/scene`。

## 需要后端确认的字段

- 用户角色建议统一返回 `roles: [{ roleCode, roleName, areaName, inviteCode, backendUrl }]`。
- 可申请角色建议在 `GET miniapp/roles` 返回 `applyRoles` 或 `roleOptions`，格式 `[{ roleCode, roleName, depositAmount }]`。前端会用该配置覆盖静态兜底选项。
- 角色码请统一为 `PROMOTER`、`AGENT`、`SUBSIDIARY`、`HQ`、`MERCHANT`。前端已兼容旧值 `OPERATION_CENTER`、`HEADQUARTERS`。
- 用户只能拥有 `MERCHANT/PROMOTER/AGENT/SUBSIDIARY/HQ` 中任意一个经营/分销身份时，需要后端强约束。前端可隐藏或提示，但最终唯一性必须由后端校验。
- 角色申请需要返回 `applicationStatus`、`depositNo`、`depositAmount`、`depositStatus`、`payStatus`、`auditRemark`、`applicationNo`、`appliedAt`、`auditTime`。
- 用户资料或角色配置需要返回角色押金金额，例如 `roleDepositConfig: { PROMOTER, AGENT, SUBSIDIARY, HQ, MERCHANT }`。未返回时前端会阻断提交并提示“押金金额未配置”。
- 区域角色申请需要保存并回显 `provinceCode/provinceName/cityCode/cityName/districtCode/districtName`。
- 角色申请资料前端会提交 `certType/certNo/certFrontUrl/certBackUrl/businessLicenseUrl/materialUrls/agreementAccepted`，后端需要保存并用于审核。
- KYC 状态接口需要真实返回状态，建议 `NOT_SUBMITTED/PENDING_AUDIT/APPROVED/REJECTED`，并返回 `auditMessage/rejectReasonMessage/lastSubmitTime`。前端不再把接口失败伪造成未提交。
- 工作台接口需要返回 `availablePoints`、`frozenPoints`、`todayProfit`、`qrcodeUrl` 或 `posterUrl`。
- 积分流水需要返回 `source_type`、`change_amount`、`create_time`，吸粉提成建议返回 `fanName`，区域提成建议返回 `areaName`、`merchantName`，退款建议返回 `order_no`。

## 当前仍依赖后端完成的流程

- 前端已改为角色申请提交前先调用 `miniapp/payments/create`，`bizType=ROLE_DEPOSIT`，支付成功后再调用 `POST miniapp/role-applications` 并带上 `depositPayOrderNo`、`depositAmount`。后端需要接受该押金流水并与申请单绑定。
- 如果后端要求先生成申请单再缴押金，需要提供 `POST miniapp/role-applications` 返回 `depositNo` 且状态为 `PENDING_DEPOSIT`，前端已支持在申请记录里继续支付。
- 微信太阳码海报如果需要完整海报图，应由 `miniapp/share/qrcode` 返回 `posterUrl`；仅返回二维码时前端展示二维码图。请求参数包含 `path/pagePath/scene/roleCode/roleType/userId`，scene 形如 `uid_123&role=PROMOTER&invite_code=xxx`。
- 吸粉绑定需要后端在 `GET miniapp/alliance/card` 或新的绑定接口中识别 `promoterUserId + roleCode + scene`，并落库粉丝与对应角色的绑定关系。仅依赖传统邀请码不足以区分推广者、区域代理、子公司等角色。
- 商家小程序账户的积分划转由订单完成后的后端结算执行，前端已按 1 积分 = 0.008 元展示抵扣与提示。
- 角色工作台数据、积分收入流水、粉丝绑定数、商家绑定数都需要后端按 `roleCode` 隔离统计，否则一个用户多角色时数据会混在一起。

## 下单、分账、售后场景

前端已在订单预览/提交时传递兼容字段：`orderChannel`、`goodsSource`、`is1688`、`pickupLatitude`、`pickupLongitude`、`pickupAddress`。

后端需要按以下 6 类场景返回或落库分账结果，供订单详情/流水页核对：

- 线上非 1688 商品正常完成：返回推广者、区域代理、子公司、商家各自分账积分/金额。
- 线上非 1688 商品售后退款：返回原分账扣回流水，类型建议 `AFTER_SALE_REFUND`。
- 线上 1688 商品正常完成：按 1688 供应链订单规则返回分账结果，建议 `goodsSource=1688`。
- 线上 1688 商品售后退款：返回供应链退款状态和分账扣回流水。
- 线下核销正常完成：按核销/收款订单返回分账结果，建议 `orderChannel=OFFLINE_PICKUP` 或 `OFFLINE_VERIFY`。
- 线下核销售后退款：返回核销订单退款和分账扣回流水。

积分流水接口 `GET miniapp/points/ledger` 建议按 `roleCode` 返回 `source_type`、`change_amount`、`order_no`、`fanName`、`areaName`、`merchantName`，这样前端能展示“吸粉提成/区域提成/售后退款扣回”的精细文案。

## 前端已完成的关键兼容

- KYC 页面现在会显示加载失败原因和重试按钮，不再展示空白页或假状态。
- 角色申请页支持选择 `PROMOTER/AGENT/SUBSIDIARY/HQ/MERCHANT`，并提交实名材料、区域地址、协议确认、押金支付流水。
- 角色审核通过后可进入对应角色工作台，工作台可生成带 `userId + roleCode` 的吸粉码并支持保存/分享。
- 门店自提地图选点会返回稳定的地图点 ID、经纬度、地址，并同时发出 `store` 和 `store:selected` 事件供确认订单接收。
- 确认订单已按 `ORDER_CONFIRM_RECEIVABLE/ORDER_CONFIRM_AVAILABLE/ORDER_CONFIRM_UNAVAILABLE` 做中文映射，并继续传递积分抵扣、优惠券、线上/线下、1688、门店自提坐标等字段。
