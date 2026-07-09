# 后端联调确认：推广者状态链与优惠券领取状态

更新时间：2026-07-09

本文只保留当前仍需要联调确认的问题。已完成的前端优化不再列入待处理项。

## 0. 本轮前端已完成对接

- KYC 状态已兼容 `kycStatus/kyc_status/auditStatus/audit_status/realnameStatus/realname_status/status`。
- KYC 证件资料已兼容 `certFrontUrl/cert_front_url/frontUrl/front_url/idCardFrontUrl/id_card_front_url/frontImage/front_image` 与背面同类字段。
- KYC 证件照片展示已改为自适应完整显示，不再裁切证件图。
- 角色申请已兼容 `applicationStatus/application_status/auditStatus/audit_status/reviewStatus/review_status/applyStatus/apply_status/status`。
- 角色押金状态已兼容 `payStatus/pay_status/paymentStatus/payment_status/depositStatus/deposit_status`。
- 角色申请接口返回单对象 `application/currentApplication/current_application` 时，前端也能识别为申请记录。
- 商品详情优惠券已兼容 `receiveStatus/receive_status/isGet/is_get/received/hasReceived/canReceive/can_receive`。

## 1. 商品详情优惠券领取状态

### 当前前端已做

- 商品详情优惠券领取已改为事件 dataset 回查，避免小程序端点击时拿不到对应券数据。
- 领取成功后，前端会立即把当前券标记为已领取。
- 已增加本地领取缓存：重新进入同一商品详情页时，如果后端仍未返回领取状态，前端会按本地缓存先显示“已领取”。

### 仍需联调确认

前端本地缓存只能解决当前设备和当前用户的短期展示问题，不能替代后端真实状态。需要确认后端商品详情接口已经按当前登录用户返回优惠券领取状态。

#### `GET /api/miniapp/product/{spuId}` 或商品详情接口

商品详情返回的优惠券列表中，每一张券必须包含稳定模板 ID 和领取状态：

```json
{
  "couponList": [
    {
      "couponTemplateId": 10001,
      "couponId": 10001,
      "name": "满50减5",
      "amount": 5,
      "thresholdAmount": 50,
      "useTimeTips": "2026-07-09 至 2026-07-31",
      "receiveStatus": "RECEIVED",
      "isGet": true,
      "is_get": 1,
      "canReceive": false,
      "receivedAt": "2026-07-09 12:00:00"
    }
  ]
}
```

联调确认字段：

- `couponTemplateId/templateId/couponTplId`：必须稳定，领取接口也用同一个 ID。
- `isGet/is_get`：当前登录用户是否已领取。
- `receiveStatus`：建议枚举 `CLAIMABLE/RECEIVED/SOLD_OUT/EXPIRED/LIMIT_REACHED`。
- `canReceive`：是否还能领取。
- `receivedAt`：已领取时间，可选。
- `receiveLimit`、`receivedCount`：如果有限领次数，需要返回。

#### `POST /api/miniapp/coupons/{couponTemplateId}/receive`

领取成功后建议返回完整领取结果：

```json
{
  "couponTemplateId": 10001,
  "userCouponId": 90001,
  "receiveStatus": "RECEIVED",
  "isGet": true,
  "receivedAt": "2026-07-09 12:00:00"
}
```

错误状态建议明确：

- 已领取：返回业务码或 `receiveStatus=RECEIVED`，不要当系统错误。
- 已抢完：`receiveStatus=SOLD_OUT`。
- 已过期：`receiveStatus=EXPIRED`。
- 超出限领：`receiveStatus=LIMIT_REACHED`。

### 仍存在的风险

- 如果商品详情一直不返回用户维度领取状态，用户换设备、清缓存、重新登录后仍会看到“可领取”，需要再次点击才知道已领取。
- 如果领取接口和详情接口使用的券 ID 不一致，前端无法稳定合并状态。

## 2. 推广者押金后状态链

### 当前前端已做

- 角色申请页已按 `applicationStatus` 展示：
  - `PENDING_DEPOSIT`：待缴押金。
  - `PENDING_AUDIT`：待审核。
  - `APPROVED`：审核通过，角色正式生效。
  - `REJECTED`：审核拒绝。
- 如果后端只返回 `depositStatus/payStatus=PAID`，但申请状态为空或仍是待支付，前端会临时归一化为 `PENDING_AUDIT`。
- 该归一化只用于页面展示，不能作为正式权限依据。

### 仍需联调确认的状态规则

用户已缴押金后，后端不能只更新支付单，必须同步角色申请单状态。

正确流转：

```text
未申请
  -> 提交申请/创建押金单
  -> PENDING_DEPOSIT
  -> 押金支付成功
  -> PENDING_AUDIT
  -> 管理员审核通过
  -> APPROVED
  -> 角色正式生效
```

关键规则：

- `PENDING_AUDIT` 不能当正式角色。
- `APPROVED` 必须由平台管理员审核通过后产生。
- `GET /api/miniapp/roles` 只能返回已生效角色。
- `GET /api/miniapp/role-applications` 必须返回申请中、待审核、已拒绝、已通过的申请记录。

## 3. `GET /api/miniapp/role-applications`

用途：角色申请页展示当前申请、押金状态、审核状态。

必须返回：

```json
{
  "applications": [
    {
      "applicationNo": "RA202607090001",
      "userId": 51,
      "roleCode": "PROMOTER",
      "roleName": "推广者",
      "applicationStatus": "PENDING_AUDIT",
      "auditStatus": "PENDING_AUDIT",
      "depositNo": "DEP202607090001",
      "depositPayOrderNo": "PAY202607090001",
      "depositBizOrderNo": "DEP202607090001",
      "depositAmount": 300,
      "depositStatus": "PAID",
      "payStatus": "PAID",
      "paidAt": "2026-07-09 11:20:00",
      "appliedAt": "2026-07-09 11:21:00",
      "auditTime": "",
      "auditRemark": "",
      "rejectReason": "",
      "inviteCode": "",
      "promoterCode": ""
    }
  ]
}
```

状态枚举：

- `PENDING_DEPOSIT`：待缴押金。
- `PENDING_AUDIT`：押金已缴，待平台审核。
- `APPROVED`：审核通过，角色正式生效。
- `REJECTED`：审核拒绝。
- `CANCELLED`：用户取消或后台取消，可选。

押金状态枚举：

- `UNPAID`
- `PAYING`
- `PAID`
- `REFUNDING`
- `REFUNDED`
- `WAIVED`：免押金。

后端注意：

- 不要只返回 `depositStatus=PAID` 而缺失 `applicationStatus`。
- 不要把 `depositStatus=PAID` 直接映射成 `APPROVED`。
- 拒绝时必须返回 `auditRemark/rejectReason`。
- 如果用户重复进入申请页，必须能查到最新申请记录。

## 4. `GET /api/miniapp/roles`

用途：判断用户已正式拥有的角色、展示角色标签、进入工作台。

必须返回：

```json
{
  "roles": [
    {
      "roleCode": "MERCHANT",
      "roleName": "商家"
    },
    {
      "roleCode": "PROMOTER",
      "roleName": "推广者",
      "inviteCode": "P51A8",
      "promoterCode": "P51A8",
      "backendUrl": ""
    }
  ],
  "applyRoles": [
    {
      "roleCode": "PROMOTER",
      "roleName": "推广者",
      "depositAmount": 300
    }
  ],
  "roleDepositConfig": {
    "PROMOTER": 300,
    "AGENT": 1000,
    "SUBSIDIARY": 3000,
    "HQ": 5000,
    "MERCHANT": 0
  }
}
```

规则：

- `roles` 里只能放 `APPROVED` 后正式生效的角色。
- `PENDING_AUDIT` 的角色不要出现在 `roles`。
- 待审核状态必须通过 `role-applications` 返回。
- 推广者审核通过后必须生成 `inviteCode/promoterCode`。

## 5. `POST /api/miniapp/role-applications`

用途：提交申请并绑定押金支付单。

前端会提交：

```json
{
  "userId": 51,
  "roleCode": "PROMOTER",
  "depositPayOrderNo": "PAY202607090001",
  "depositBizOrderNo": "DEP202607090001",
  "depositAmount": 300,
  "applicantName": "张三",
  "mobile": "13800000000",
  "certType": "ID_CARD",
  "certNo": "330************1234",
  "certFrontUrl": "https://example.com/front.png",
  "certBackUrl": "https://example.com/back.png",
  "agreementAccepted": true,
  "remark": ""
}
```

成功后建议返回：

```json
{
  "applicationNo": "RA202607090001",
  "roleCode": "PROMOTER",
  "applicationStatus": "PENDING_AUDIT",
  "depositStatus": "PAID",
  "payStatus": "PAID",
  "depositAmount": 300
}
```

后端需要校验：

- KYC 必须已通过。
- 押金单必须属于当前用户。
- 押金金额必须和角色配置一致。
- 同一角色不能重复生成多个待审核申请。
- 已 `APPROVED` 的角色不能重复申请。

## 6. `POST /api/miniapp/payments/create`

角色押金支付时，前端会传：

```json
{
  "bizType": "ROLE_DEPOSIT",
  "roleCode": "PROMOTER",
  "amount": 300,
  "userId": 51
}
```

后端需要返回：

```json
{
  "payOrderNo": "PAY202607090001",
  "bizOrderNo": "DEP202607090001",
  "amount": 300,
  "payParams": {}
}
```

支付回调成功后必须：

1. 押金单状态改为 `PAID`。
2. 绑定或更新角色申请单。
3. 角色申请单状态改为 `PENDING_AUDIT`。
4. 后续 `GET role-applications` 能查询到该状态。

## 7. 审核通过后的后续功能接口

### `GET /api/miniapp/roles/workbench`

审核通过后，推广者工作台需要：

```json
{
  "roleCode": "PROMOTER",
  "availablePoints": 1200,
  "frozenPoints": 100,
  "todayProfit": 18.5,
  "fansCount": 36,
  "orderCount": 8,
  "inviteCode": "P51A8",
  "promoterCode": "P51A8",
  "posterUrl": "https://example.com/poster.png",
  "qrcodeUrl": "https://example.com/qrcode.png"
}
```

### `POST /api/miniapp/share/qrcode`

需要支持带角色的吸粉码：

```json
{
  "pagePath": "pages/index/index",
  "scene": "uid_51&role=PROMOTER&invite_code=P51A8",
  "roleCode": "PROMOTER",
  "userId": 51
}
```

返回：

```json
{
  "qrcodeUrl": "https://example.com/qrcode.png",
  "posterUrl": "https://example.com/poster.png"
}
```

### 粉丝绑定

扫码进入后，后端需要识别：

- `promoterUserId/userId`
- `roleCode`
- `inviteCode`
- `scene`
- 当前登录粉丝 `fanUserId`

建议落库字段：

```json
{
  "promoterUserId": 51,
  "roleCode": "PROMOTER",
  "inviteCode": "P51A8",
  "fanUserId": 88,
  "bindScene": "MINIAPP_QRCODE",
  "bindTime": "2026-07-09 12:00:00"
}
```

### `GET /api/miniapp/points/ledger`

积分流水必须按角色过滤：

```json
{
  "list": [
    {
      "roleCode": "PROMOTER",
      "sourceType": "FAN_ORDER_REWARD",
      "changeAmount": 100,
      "orderNo": "O202607090001",
      "fanName": "用户A",
      "merchantName": "门店A",
      "createTime": "2026-07-09 12:00:00"
    }
  ]
}
```

## 8. 管理端审核要求

平台管理员审核通过时，后端需要原子完成：

1. 申请单 `applicationStatus=APPROVED`。
2. 用户角色表新增或激活 `PROMOTER`。
3. 生成并保存 `promoterCode/inviteCode`。
4. `GET roles` 返回该角色。
5. `GET role-applications` 返回申请记录为 `APPROVED`。
6. `GET roles/workbench?roleCode=PROMOTER` 返回工作台数据。

审核拒绝时：

1. 申请单 `applicationStatus=REJECTED`。
2. 返回 `auditRemark/rejectReason`。
3. 不下发 `PROMOTER` 到 `roles`。
4. 如需退押金，返回 `refundStatus` 和退款进度。

## 9. 当前后端重点排查项

- 商品详情优惠券列表是否按当前用户返回了 `isGet/is_get/receiveStatus`。
- 商品详情券 ID 与领取接口使用的 ID 是否一致。
- 押金支付回调是否已经把角色申请单改为 `PENDING_AUDIT`。
- `GET role-applications` 是否返回了当前用户最新申请记录。
- `GET roles` 是否只返回 `APPROVED` 的正式角色。
- 管理端审核通过后是否写入用户角色表，并生成 `promoterCode/inviteCode`。
- 推广者工作台、吸粉码、粉丝绑定、积分流水是否已按 `roleCode=PROMOTER` 隔离。
