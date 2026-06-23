export const businessRoutes = {
  tabs: {
    home: { name: "首页", url: "/pages/index/index", openType: "switchTab" },
    mall: { name: "商城", url: "/pages/sort/sort", openType: "switchTab" },
    street: { name: "商街", url: "/pages/street/street", openType: "switchTab" },
    cart: { name: "购物车", url: "/pages/shop_cart/shop_cart", openType: "switchTab" },
    user: { name: "我的", url: "/pages/user/user", openType: "switchTab" },
  },
  pages: {
    feedback: { name: "意见反馈", url: "/business/pages/business_pages/feedback" },
    notice: { name: "消息通知", url: "/bundle_misc/pages/notice/notice" },
    noticeDetail: {
      name: "消息通知-详情",
      url:
        "/bundle_misc/pages/notice_detail/notice_detail?title=%E7%B3%BB%E7%BB%9F%E9%80%9A%E7%9F%A5&time=2026-05-10%2010%3A00%3A00&content=%E8%BF%99%E6%98%AF%E7%B3%BB%E7%BB%9F%E9%80%9A%E7%9F%A5%E8%AF%A6%E6%83%85%E7%A4%BA%E4%BE%8B",
    },
    storeDetail: { name: "店铺详情", url: "/business/pages/business_pages/store_detail" },
    fiatBalance2: { name: "法币余额2", url: "/business/pages/business_pages/fiat_balance_2" },
    pendingPayment: { name: "待付款", url: "/business/pages/business_pages/pending_payment" },
    storeQr: { name: "店铺二维码", url: "/business/pages/business_pages/store_qr" },
    goodsQr: { name: "商品二维码", url: "/business/pages/business_pages/goods_qr" },
    storeGroup: { name: "店铺团购", url: "/business/pages/business_pages/store_group" },
    storeAlbum: { name: "店铺相册", url: "/business/pages/business_pages/store_album" },
    wallet: { name: "法币余额", url: "/bundle_finance/pages/user_wallet/user_wallet" },
    fiatBalance3: { name: "法币余额3", url: "/business/pages/business_pages/fiat_balance_3" },
    paymentFilter: { name: "付款记录-筛选", url: "/business/pages/business_pages/payment_filter" },
    paymentRecord: { name: "付款记录", url: "/business/pages/business_pages/payment_record" },
    aboutUs: { name: "关于我们", url: "/business/pages/business_pages/about_us" },
    activityExchange: { name: "活动兑换", url: "/business/pages/business_pages/activity_exchange" },
    activityCenter: { name: "活动中心", url: "/business/pages/business_pages/activity_center" },
    introCard: { name: "介绍名片", url: "/business/pages/business_pages/intro_card" },
    facePay: { name: "面对面付款", url: "/business/pages/business_pages/face_pay" },
    recentVisits: { name: "最近访问", url: "/business/pages/business_pages/recent_visits" },
    license: { name: "商家资质", url: "/bundle_user/pages/license/license" },
    streetGoods: { name: "商街商品", url: "/business/pages/business_pages/street_goods" },
    goodsDetail: { name: "商品详情", url: "/bundle/pages/goods_details/goods_details?id=1" },
    ecoApp: { name: "生态应用", url: "/business/pages/business_pages/eco_app" },
    autoPoints: { name: "自动领取积分", url: "/business/pages/business_pages/auto_points" },
    goodsSearch: { name: "搜索列表", url: "/bundle/pages/goods_search/goods_search" },
    addressList: { name: "收货地址", url: "/bundle/pages/user_address/user_address" },
    addressEdit: { name: "新增地址", url: "/bundle/pages/address_edit/address_edit" },
    myService: { name: "我的客服", url: "/business/pages/business_pages/my_service" },
    userOrder: { name: "我的订单", url: "/bundle_order/pages/user_order/user_order" },
    userKyc: { name: "用户KYC", url: "/business/pages/business_pages/user_kyc" },
    confirmOrder: {
      name: "确认订单",
      url:
        "/bundle/pages/confirm_order/confirm_order?data=%7B%22goods%22%3A%5B%7B%22item_id%22%3A1%2C%22num%22%3A1%7D%5D%2C%22type%22%3A%22buy_now%22%7D",
    },
    payment: { name: "支付订单", url: "/bundle/pages/payment/payment?from=order&order_id=1" },
    payResult: { name: "支付详情", url: "/bundle_user/pages/pay_result/pay_result?id=1" },
    pageIndex: { name: "页面总览", url: "/business/pages/page_index/page_index" },
  },
};

export const businessTabGroups = {
  home: [
    businessRoutes.pages.activityCenter,
    businessRoutes.pages.activityExchange,
    businessRoutes.pages.ecoApp,
    businessRoutes.pages.notice,
    businessRoutes.pages.noticeDetail,
    businessRoutes.pages.feedback,
  ],
  mall: [
    businessRoutes.pages.goodsSearch,
    businessRoutes.pages.goodsDetail,
    businessRoutes.tabs.cart,
    businessRoutes.pages.addressList,
    businessRoutes.pages.addressEdit,
  ],
  street: [
    businessRoutes.pages.streetGoods,
    businessRoutes.pages.storeDetail,
    businessRoutes.pages.storeGroup,
    businessRoutes.pages.storeAlbum,
    businessRoutes.pages.license,
    businessRoutes.pages.storeQr,
    businessRoutes.pages.goodsQr,
    businessRoutes.pages.recentVisits,
  ],
  cart: [
    businessRoutes.pages.goodsDetail,
    businessRoutes.pages.confirmOrder,
    businessRoutes.pages.pendingPayment,
    businessRoutes.pages.payment,
    businessRoutes.pages.payResult,
    businessRoutes.pages.addressList,
  ],
  user: [
    businessRoutes.pages.userOrder,
    businessRoutes.pages.wallet,
    businessRoutes.pages.fiatBalance2,
    businessRoutes.pages.fiatBalance3,
    businessRoutes.pages.paymentRecord,
    businessRoutes.pages.paymentFilter,
    businessRoutes.pages.facePay,
    businessRoutes.pages.introCard,
    businessRoutes.pages.autoPoints,
    businessRoutes.pages.userKyc,
    businessRoutes.pages.myService,
    businessRoutes.pages.aboutUs,
    businessRoutes.pages.addressList,
    businessRoutes.pages.feedback,
  ],
};

export function openBusinessRoute(route) {
  if (!route || !route.url) return;
  if (route.openType === "switchTab") {
    uni.switchTab({ url: route.url });
    return;
  }
  uni.navigateTo({ url: route.url });
}
