# 商家入驻与审核接口对接说明

更新时间：2026-07-10

## 小程序端实际调用

项目校验要求 `api/` 下所有请求必须走 `miniapp/` 网关，前端不会直接暴露 `merchant-admin` 或 `platform-admin` 原始路径。

### 提交商家入驻

- 前端调用：`POST /api/miniapp/merchant-applications`
- 后端应映射到：`POST /api/merchant-admin/auth/registration`
- 数据表：`merchant_registration_application`

关键入参：

```json
{
  "userId": 51,
  "username": "merchant_51",
  "password": "123456",
  "merchantName": "宜春嘉典颜科技有限公司",
  "merchantType": "COMPANY",
  "contactName": "张三",
  "contactMobile": "13671071747",
  "legalPerson": "张三",
  "licenseNo": "91360900XXXXXXXXXX",
  "licenseUrl": "",
  "licenseImageUrl": "https://shengyuan.store/api/miniapp/files/xxx/license.png",
  "legalIdFrontUrl": "https://shengyuan.store/api/miniapp/files/xxx/id-front.png",
  "legalIdBackUrl": "https://shengyuan.store/api/miniapp/files/xxx/id-back.png",
  "qualificationUrls": "[\"https://shengyuan.store/api/miniapp/files/xxx/permit.png\"]",
  "shopName": "嘉典颜旗舰店",
  "industryId": 1,
  "settlementAccountNo": "6222********8888",
  "detailAddress": "江西省宜春市袁州区xxx"
}
```

说明：

- 当前用户已有平台账号时，前端不提交 `username/password`。
- 首次申请时，前端要求填写 `username/password`。
- `qualificationUrls` 前端按 JSON 字符串数组提交，后端建议兼容普通数组。

### 查询入驻状态

- 前端调用：`GET /api/miniapp/merchant-applications?userId=51`
- 后端可聚合后台状态查询，按 `userId` 返回当前用户最新一条申请。

返回至少包含：

```json
{
  "applicationNo": "MR20260710123456ABCDEF",
  "merchantId": 62,
  "applyStatus": "PENDING",
  "auditStatus": "PENDING",
  "merchantName": "宜春嘉典颜科技有限公司",
  "shopName": "嘉典颜旗舰店",
  "contactName": "张三",
  "contactMobile": "13671071747",
  "legalPerson": "张三",
  "licenseNo": "91360900XXXXXXXXXX",
  "licenseImageUrl": "https://...",
  "legalIdFrontUrl": "https://...",
  "legalIdBackUrl": "https://...",
  "qualificationUrls": ["https://..."],
  "settlementAccountNo": "6222********8888",
  "detailAddress": "江西省宜春市袁州区xxx",
  "auditRemark": "",
  "updatedAt": "2026-07-10 18:30:00"
}
```

### 驳回后重提

- 前端调用：`POST /api/miniapp/merchant-applications/resubmit`
- 后端应映射到：`POST /api/merchant-admin/auth/registration/resubmit`

必须支持：

- `applicationNo`
- `contactMobile`
- 其它主体、证照、店铺、结算字段同提交接口。

### 平台审核封装

如果小程序/管理壳需要在当前项目前端调用平台审核能力，请后端提供网关路径：

- 列表：`GET /api/miniapp/platform-admin/merchant-audits?auditStatus=PENDING&pageNo=1&pageSize=100`
- 审核：`POST /api/miniapp/platform-admin/merchant-audits/{applicationNo}`
- 旧审核兜底：`POST /api/miniapp/platform-admin/merchants/{merchantId}/audit`

后端分别映射到：

- `GET /api/platform-admin/merchant-audits`
- `POST /api/platform-admin/merchant-audits/{applicationNo}`
- `POST /api/platform-admin/merchants/{merchantId}/audit`

