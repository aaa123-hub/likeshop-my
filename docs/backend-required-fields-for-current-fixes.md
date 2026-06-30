# 后端接口缺字段清单

更新时间：2026-06-30

| 接口 | 缺少或需固定的字段 | 用途 |
| --- | --- | --- |
| `user/profile` |缺少 `user_integral` 或 `availablePoints` | 我的页“我的积分”数量展示，签到后刷新用户资料也依赖该值 
| `user/profile` |缺少 `coupon` 或 `availableCouponCount` | 我的页“我的优惠券”数量展示；
| `wallet/recharge` |缺少 `orderNo` 或 `rechargeNo` 或 `bizOrderNo` | 法币余额页从微信入账到余额时，创建充值业务单并跳转支付页 
| `wallet/recharge` |缺少 `amount` 或 `rechargeAmount` | 支付页展示微信入账金额 
| `payments/create` |缺少 `timeStamp`、`nonceStr`、`package`、`signType`、`paySign` | 拉起微信支付 
| `product/{spuId}` |缺少 `goods_image[]` 或 `image/mainImageUrl/cover` | 商品详情大图和款式缩略图展示，数量需要一致 
| `product/{spuId}` |缺少 `goods_item[].image` 或 `goods_item[].imageUrl/skuImageUrl` | 点击“已选”规格弹层顶部商品图片展示
| `product/{spuId}` |缺少 `shopLogo` 或 `shop_logo` 或 `shop.logo/shop.shopLogo` | 商品详情店铺名称前头像展示
| `product/{spuId}` |缺少 `team_found[].avatar` 或 `groupRecords[].avatar` | 商品详情“跟团买”按钮左侧头像展示 
| `orders/preview` |缺少 `goods_lists[].image` 或 `itemList[].imageUrl/goodsImageUrl/skuImageUrl` | 立即购买后待付款页面商品图片展示
| `orders/preview` |缺少 `shopOrders[].shopLogo` 或商品项 `shopLogo/shop_logo` | 立即购买后待付款页面店铺图片展示
| `search/products` 或 `street/products` |缺少 `list[]`，每项含 `spuId/goodsId/name/image/price/shopId/shopName` | 商街商品页列表无数据
