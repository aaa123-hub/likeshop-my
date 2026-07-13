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
  "shopImageUrl": "https://shengyuan.store/api/miniapp/files/xxx/shop-front.png",
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
  "shopImageUrl": "https://...",
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

## 当前前端回显依赖字段清单

`bundle_user/pages/license/license` 的状态查询回显依赖 `GET /api/miniapp/merchant-applications?userId=51`。如果后端缺少下面字段，会造成页面已提交资料展示不完整、无法判断重提、或无法复用已有后台账号。

### 必须返回

| 字段 | 用途 | 缺失影响 |
| --- | --- | --- |
| `applicationNo` | 驳回后重提、展示申请编号 | 驳回后前端无法走重提接口，只能按新增提交处理 |
| `auditStatus` 或 `applyStatus` | 展示审核状态、禁用审核中重复提交 | 页面只能显示未提交或状态不准 |
| `merchantName` | 商户主体名称回显 | 主体信息为空 |
| `merchantType` | 商户类型回显，枚举如 `COMPANY` | 页面只能显示默认企业/公司 |
| `contactName` | 联系人回显 | 联系人为空 |
| `contactMobile` | 联系电话回显和重提参数 | 重提可能缺少手机号 |
| `legalPerson` | 法人姓名回显 | 法人信息为空 |
| `licenseNo` | 统一社会信用代码回显 | 证照编号为空 |
| `licenseImageUrl` | 营业执照图片回显 | 已上传证照不显示，用户可能重复上传 |
| `legalIdFrontUrl` | 身份证人像面回显 | 已上传证件不显示 |
| `legalIdBackUrl` | 身份证国徽面回显 | 已上传证件不显示 |
| `shopName` | 店铺名称回显 | 店铺信息为空 |
| `shopImageUrl` | 店铺照片/门头照回显 | 店铺照片不显示；审核中无法确认门店形象资料 |
| `settlementAccountNo` | 结算账号回显 | 结算信息为空 |
| `detailAddress` | 经营地址回显 | 地址为空 |

### 建议返回

| 字段 | 用途 | 缺失影响 |
| --- | --- | --- |
| `industryId` | 行业分类回显 | 页面显示“请选择行业分类”，不影响提交 |
| `qualificationUrls` | 行业资质多图回显 | 补充资质不显示 |
| `auditRemark` | 审核驳回原因 | 用户不知道修改哪里 |
| `updatedAt` | 更新时间 | 状态卡缺少更新时间 |
| `username` 或 `platformUserId/adminUserId` | 判断是否已有后台账号 | 可能误要求已有平台账号用户填写账号密码 |
| `merchantId` | 审核通过后的商户标识 | 用户中心商家身份和后续商家功能判断可能不完整 |

### 字段格式要求

- `qualificationUrls` 前端已兼容 JSON 字符串数组、普通数组、逗号分隔字符串和对象数组，但建议后端统一返回数组：`["https://..."]`。
- 图片字段必须返回小程序可访问的完整 URL，如 `https://shengyuan.store/api/miniapp/files/...`。
- 店铺照片建议统一使用 `shopImageUrl`，后端可兼容 `shop_image_url/shopPhotoUrl/shop_photo_url`，但前端提交建议用 `shopImageUrl`。
- 状态枚举建议统一：`NOT_SUBMITTED`、`PENDING`、`APPROVED`、`REJECTED`。
- 如果当前用户已有后台账号，建议返回 `username` 或 `platformUserId/adminUserId`，前端据此隐藏账号密码。

### 平台审核封装

如果小程序/管理壳需要在当前项目前端调用平台审核能力，请后端提供网关路径：

- 列表：`GET /api/miniapp/platform-admin/merchant-audits?auditStatus=PENDING&pageNo=1&pageSize=100`
- 审核：`POST /api/miniapp/platform-admin/merchant-audits/{applicationNo}`
- 旧审核兜底：`POST /api/miniapp/platform-admin/merchants/{merchantId}/audit`

后端分别映射到：

- `GET /api/platform-admin/merchant-audits`
- `POST /api/platform-admin/merchant-audits/{applicationNo}`
- `POST /api/platform-admin/merchants/{merchantId}/audit`
