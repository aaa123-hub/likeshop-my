# 今日整改记录

更新时间：2026-07-03

本文只记录今天已改内容和当前还差的事项。旧版接口清单、整改跟踪和字段说明文档已清理，后续统一维护本文件。

## 今天已修改

- 微信公众平台后台配置已同步记录：二维码规则为 `https://shengyuan.store`，商品详情功能页面为 `bundle/pages/goods_details/goods_details`，店铺详情功能页面为 `business/pages/business_pages/store_detail`。
- 商品详情相关逻辑有改动，涉及 `bundle/pages/goods_details/goods_details.vue`、`api/store.js`、`utils/tools.js`，重点是商品数据、规格、价格和图片等兼容处理。
- 订单相关逻辑有改动，涉及 `api/order.js`、`bundle/pages/order_details/order_details.vue`、`bundle_order/components/order-dialog/order-dialog.vue`、`bundle_order/components/order-list/order-list.vue`、`bundle_order/pages/apply_refund/apply_refund.vue`，重点是订单状态、订单详情、弹窗操作和售后申请展示。
- 用户相关逻辑有改动，涉及 `api/user.js`、`bundle_user/pages/user_profile/user_profile.vue`、`bundle_user/pages/user_set/user_set.vue`、`bundle_user/pages/user_coupon/user_coupon.vue`，重点是用户资料、设置页和优惠券数据兼容。
- 二维码与图片处理有改动，涉及 `bundle/components/tki-qrcode/*`、`business/components/tki-qrcode/qrcode.js`、`activity/components/lime-painter/components/l-painter/utils.js`、`bundle_poster/components/lime-painter/components/l-painter/utils.js`，重点是二维码生成和图片绘制兼容。
- 新增商家推广申请页 `business/pages/business_pages/promoter_apply.vue`，并在 `pages.json`、`manifest.json`、`project.config.json` 中同步相关配置。
- 新增 `utils/message.js`，并调整 `main.js`、`utils/uview-lite.js`，用于统一轻量消息能力。
- 首页和场景页有改动，涉及 `pages/index/index.vue`、`business/pages/business_scene/scene-shell.vue`，重点是页面入口、跳转和展示结构。

## 目前还差什么

- 需要真机验证微信小程序二维码规则能正确识别 `https://shengyuan.store`，并能跳转到商品详情和店铺详情功能页面。
- 需要确认 `bundle/pages/goods_details/goods_details` 接收后台二维码参数后，能稳定拿到商品 ID 并加载真实商品详情。
- 需要确认 `business/pages/business_pages/store_detail` 接收后台二维码参数后，能稳定拿到店铺 ID 并加载真实店铺详情。
- 需要后端确认商品详情接口字段稳定，包括商品基础信息、轮播图、SKU、规格组、库存、价格、优惠券、评价摘要和店铺信息。
- 需要后端确认订单接口字段稳定，包括订单列表、订单详情、订单状态流、按钮权限、物流、自提核销、退款和售后状态。
- 需要后端确认用户接口字段稳定，包括用户资料、绑定手机号、用户设置、优惠券列表和优惠券状态。
- 需要后端确认图片上传接口稳定，返回可公网访问的完整 URL，并能覆盖头像、售后凭证、评论图片、商家资质和提现收款码。
- 需要真机验证微信支付创建、支付取消、支付成功、支付失败和支付状态查询。
- 需要完整跑通购物车、确认订单、创建订单、支付、订单详情、售后申请的交易主链路。
- 需要完整跑通钱包余额、提现配置、提现申请、钱包流水、支付密码和转账相关流程。
- 需要完整跑通 KYC、商家资质、反馈图片上传和消息已读/未读相关流程。
- 活动中心、活动兑换、拼团、砍价、签到提交、充值套餐、独立抽奖记录等未闭环功能，如果后端暂未支持，需要继续隐藏入口或展示明确不可用提示。
- 客服配置仍需要确认是否使用独立接口，建议后端提供电话、微信、二维码、服务时间和在线客服链接。
- 所有当前前端调用的 `/api/miniapp/*` 接口都不能再返回 `A0108 No static resource`，失败时必须返回明确业务错误和可展示文案。
