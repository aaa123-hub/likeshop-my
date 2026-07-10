# 商家入驻与角色申请数据链最终汇总

更新时间：2026-07-10

本文已清除旧版“待后端补齐字段”内容，只保留当前后端已调整后的前端对接结果、可打通的数据链、仍存在的风险和需要后端继续确认的事项。

## 1. 本次对接范围

前端文件：

- `api/user.js`
- `bundle_user/pages/license/license.vue`
- `business/pages/business_pages/promoter_apply.vue`

已对接接口：

- `GET /api/miniapp/user/onboarding-context`
- `GET /api/miniapp/merchant-applications?userId=xxx`
- `GET /api/miniapp/merchant-industries`
- `GET /api/miniapp/merchant-applications/industries`
- `POST /api/miniapp/merchant-applications`
- `POST /api/miniapp/merchant-applications/resubmit`
- `POST /api/miniapp/role-applications`

## 1.1 店铺照片字段对接建议

用户新增需求：商家入驻页“店铺与结算”模块需要增加店铺照片。

应对接接口：

- 新提交：`POST /api/miniapp/merchant-applications`
- 驳回后重提：`POST /api/miniapp/merchant-applications/resubmit`
- 状态回显：`GET /api/miniapp/merchant-applications?userId=xxx`

不建议接到店铺详情接口，因为此时商家还未审核通过，店铺实体可能还没有正式生成。店铺照片应先落到 `merchant_registration_application` 入驻申请记录，审核通过后再由后端同步到正式店铺资料。

建议新增入参字段：

| 字段 | 类型 | 用途 | 说明 |
| --- | --- | --- | --- |
| `shopImageUrl` | string | 店铺主图/门头照 | 推荐主字段，前端提交单张店铺照片 URL |
| `shop_image_url` | string | 同上 | 后端如需要 snake_case 可兼容 |
| `shopPhotoUrl` | string | 兼容字段 | 可作为别名，不建议作为唯一字段 |
| `shop_photo_url` | string | 兼容字段 | 可作为别名，不建议作为唯一字段 |

建议状态接口回显字段：

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `shopImageUrl` | string | 商家入驻页回显店铺照片 |
| `shop_image_url` | string | 兼容回显 |

建议最终请求示例：

```json
{
  "userId": 62,
  "merchantName": "宜春嘉典颜科技有限公司",
  "merchantType": "COMPANY",
  "contactName": "张三",
  "contactMobile": "13671071747",
  "legalPerson": "张三",
  "licenseNo": "91360900XXXXXXXXXX",
  "licenseImageUrl": "https://shengyuan.store/api/miniapp/files/xxx/license.png",
  "legalIdFrontUrl": "https://shengyuan.store/api/miniapp/files/xxx/id-front.png",
  "legalIdBackUrl": "https://shengyuan.store/api/miniapp/files/xxx/id-back.png",
  "shopName": "嘉典颜旗舰店",
  "shopImageUrl": "https://shengyuan.store/api/miniapp/files/xxx/shop-front.png",
  "industryId": 1,
  "settlementAccountNo": "6222********8888",
  "detailAddress": "江西省宜春市袁州区xxx",
  "qualificationUrls": "[\"https://shengyuan.store/api/miniapp/files/xxx/permit.png\"]"
}
```

前端实现建议：

- 上传方式继续复用当前 `uploadFile()`。
- 店铺照片放在 `bundle_user/pages/license/license.vue` 的“店铺与结算”模块中。
- 如果 `GET /api/miniapp/merchant-applications?userId=xxx` 已回显 `shopImageUrl`，前端应展示并禁用修改/删除，规则和营业执照、身份证图片一致。
- 审核中状态下不允许重新上传或删除店铺照片。

后端需要确认：

- `POST /api/miniapp/merchant-applications` 是否接受 `shopImageUrl`。
- `POST /api/miniapp/merchant-applications/resubmit` 是否接受 `shopImageUrl`。
- `GET /api/miniapp/merchant-applications?userId=xxx` 是否回显 `shopImageUrl`。
- 审核通过后是否把 `shopImageUrl` 同步到正式店铺表的店铺主图/门头照字段。

## 2. 已打通的数据链

### 2.1 入驻上下文

接口：`GET /api/miniapp/user/onboarding-context`

调用方式：

- 有登录态时优先走小程序 token，接口会带 `Authorization: Bearer xxx`，前端不主动追加 `userId`。
- 当前页面暂时没有 token 且能取到用户 ID 时，才通过 `userId` 作为兜底查询参数。
- 后端返回 `code: "0"` 已由请求层统一转换为前端成功态 `code == 1`。

前端已使用字段：

| 后端字段 | 当前前端处理 |
| --- | --- |
| `hasBackendAccount` | 为 `true` 时隐藏后台用户名、密码、确认密码 |
| `backendAccount` | 归一化 `adminUserId/platformUserId/userId/accountNo/username/roleCode/accountStatus/displayName` |
| `backendUsername` | 回显已有后台账号名 |
| `uiHints.showBackendAccountFields` | 为 `false` 时强制隐藏后台账号字段 |
| `uiHints.requireBackendUsername` | 为 `false` 时不校验 `username` |
| `uiHints.requireBackendPassword` | 为 `false` 时不校验 `password/confirmPassword` |
| `uiHints.canReuseKycProfile` | 为 `true` 时使用 `reusableProfile` 回显实名资料 |
| `uiHints.hideRepeatedKycFields` | 当前作为可复用实名资料信号处理 |
| `reusableProfile.applicantName/realName` | 角色申请页回显姓名；商家入驻页回显联系人/法人 |
| `reusableProfile.mobile` | 回显手机号 |
| `reusableProfile.certType` | 回显证件类型 |
| `reusableProfile.certNo/certNoMask` | 回显证件号或脱敏证件号 |
| `reusableProfile.certFrontUrl/certBackUrl` | 回显身份证正反面 |

结论：

- `userId=62` 已有后台账号时，前端应隐藏账号密码输入，并跳过账号密码校验。
- `userId=61` 无后台账号时，前端应显示账号密码输入，并按首次申请规则校验。
- 商家入驻、推广者、区域代理、子公司申请都已接入这套判断规则。

### 2.2 商家入驻状态

接口：`GET /api/miniapp/merchant-applications?userId=xxx`

后端已补齐内容：

- 顶层字段和 `applications/list` 列表字段。
- `hasBackendAccount/backendAccount/backendUsername/adminUserId/platformUserId`。
- `roles/roleCode`。
- `uiHints.showBackendAccountFields/requireBackendUsername/requireBackendPassword`。
- `industryId/industryCode/industryName`。
- `qualificationUrls` 数组化返回。
- 无申请记录时返回 `NOT_SUBMITTED`。

前端已处理：

- 状态接口返回的账号字段会合并进 `onboardingContext`，参与账号密码显示和校验判断。
- 状态接口返回的 `industryId/industryCode/industryName` 会用于行业回显。
- `qualificationUrls` 继续兼容数组、JSON 字符串、逗号分隔字符串和对象数组。
- 无申请记录返回 `NOT_SUBMITTED` 时，页面展示为可提交状态，不再按接口缺失处理。

### 2.3 行业分类

接口：

- 主接口：`GET /api/miniapp/merchant-industries`
- 兜底接口：`GET /api/miniapp/merchant-applications/industries`

前端已处理：

- 页面进入时优先加载后端行业列表。
- 接口失败时保留本地行业列表兜底，避免页面不可用。
- 状态接口如果返回了 `industryName`，但行业列表里没有对应项，前端会动态补充该选项，保证回显不丢。
- 提交前行业分类仍为必选。

### 2.4 角色申请

页面：`business/pages/business_pages/promoter_apply.vue`

已打通规则：

- 已有后台账号时，不显示登录账号、登录密码、确认密码。
- `uiHints.requireBackendUsername === false` 时不校验账号。
- `uiHints.requireBackendPassword === false` 时不校验密码和确认密码。
- 提交角色申请时，如果账号密码为空，`api/user.js` 会从 payload 删除 `username/password`，避免后端收到空字符串后误判。
- `onboarding-context` 的实名资料优先级高于旧 KYC 接口，旧 KYC 接口只做兜底补缺。
- 已是推广者后继续申请区域代理或子公司时，继续沿用已有后台账号，只选择申请区域。

## 3. 当前前端改动结果

### `api/user.js`

- 新增 `getOnboardingContext()`。
- 新增 `normalizeBackendAccount()`。
- 新增 `normalizeOnboardingContext()`。
- 新增 `getMerchantIndustries()`。
- 新增行业列表归一化。
- `normalizeMerchantQualification()` 增加后台账号、`uiHints`、角色、行业名称/编码字段归一化。
- `applyRoleApplication()` 提交前删除空 `username/password`。

### `bundle_user/pages/license/license.vue`

- 接入 `onboarding-context`。
- 接入后端行业分类接口。
- 商家状态接口返回的后台账号字段会合并到页面上下文。
- 已有后台账号时隐藏登录账号和登录密码。
- 不再因为账号密码为空拦截已有后台账号用户提交。
- 实名资料可复用时回显联系人、法人、手机号、身份证正反面。
- 行业分类按后端返回回显，仍保留本地兜底。

### `business/pages/business_pages/promoter_apply.vue`

- 接入 `onboarding-context`。
- 推广者、区域代理、子公司申请共用后台账号判断。
- 已有后台账号时隐藏账号密码和确认密码。
- 区域代理/子公司只选择区域，不强制变更账号密码。
- 实名资料优先从 `onboarding-context.reusableProfile` 回显。

## 4. 仍需后端确认或继续补充的风险

### 4.1 行业字段 ID 与后台配置必须一致

前端现在已接入行业接口，但最终提交仍依赖后端返回的 `id/industryId/code/value`。

后端需保证：

- 行业列表里的 ID 和商家入驻提交接口接受的 `industryId` 是同一套值。
- 状态接口回显的 `industryId/industryCode` 能在行业列表中找到。

### 4.2 账号复用规则以后端为准

前端已经按 `hasBackendAccount` 和 `uiHints` 隐藏/校验账号密码。

后端需保证：

- `hasBackendAccount=true` 时，提交商家/角色申请允许不传 `username/password`。
- 后端按当前小程序用户绑定的后台账号继续授权。
- 不要因为前端未传 `username/password` 拒绝已有后台账号用户提交。

### 4.3 `reusableProfile.certNoMask` 只能用于展示

如果后端只返回脱敏证件号：

- 页面可以展示。
- 但后端提交接口不能要求前端传真实证件号。

建议后端在已有实名资料复用场景中，提交接口按用户实名档案关联，不要求前端再次提交真实证件号。

### 4.4 角色申请接口仍需确认是否已完全兼容空账号密码

前端已经删除空 `username/password` 字段。

后端仍需确认：

- `POST /api/miniapp/role-applications` 对已有后台账号用户不强制校验账号密码。
- 区域代理、子公司申请只校验区域、实名资料、押金等必要字段。

### 4.5 商家入驻重提仍依赖申请编号

驳回后重提必须有：

- `applicationNo`
- `contactMobile`

后端已补状态字段后仍需保证驳回记录返回这两个字段，否则前端无法准确走重提接口。

## 5. 建议测试用例

### 5.1 已有后台账号用户

测试用户：`userId=62`

预期：

- `onboarding-context.hasBackendAccount=true`。
- 商家入驻页不展示登录账号、登录密码。
- 角色申请页不展示登录账号、登录密码、确认密码。
- 直接提交不因账号密码为空被前端拦截。

### 5.2 无后台账号用户

测试用户：`userId=61`

预期：

- `onboarding-context.hasBackendAccount=false`。
- 商家入驻页展示登录账号、登录密码。
- 角色申请页展示登录账号、登录密码、确认密码。
- 未填写账号密码时前端拦截提交。

### 5.3 行业分类

预期：

- `/api/miniapp/merchant-industries` 返回 `code: "0"` 时，页面能加载行业列表。
- 选择行业后提交的 `industryId` 与后端行业配置一致。
- 已有申请记录返回 `industryId/industryName` 时页面能正确回显。

### 5.4 实名资料复用

预期：

- `uiHints.canReuseKycProfile=true` 时，页面使用 `reusableProfile` 回显姓名、手机号、证件类型、证件号、证件照片。
- 如果只返回 `certNoMask`，后端提交接口不能要求真实证件号。

## 6. 当前验证结果

- 项目静态校验：`npm run verify` 通过。
- 前端代码已按附件规则完成数据链对接。
- 线上接口实际返回需在小程序真机或开发者工具里按上方测试用例继续点测。
