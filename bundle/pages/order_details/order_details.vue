<!--
likeshop开源商城系统
author: likeshop.cn.team
-->

<template>
  <view>
    <navbar title="订单详情"></navbar>
    <view class="order-details">
      <view class="header-bg"></view>
      <view class="main">
        <view class="header">
          <view class="item" v-if="isOrderStatus('CREATED')">
            <view class="white lg mb10">等待买家付款</view>
            <view
              class="white sm row"
              style="line-height: 26rpx"
              v-if="cancelTime > 0"
              >支付剩余
              <u-count-down
                separator="zh"
                :timestamp="cancelTime"
                separator-color="#fff"
                color="#fff"
                :separator-size="26"
                :font-size="26"
                bg-color="transparent"
              ></u-count-down>
              自动关闭</view
            >
          </view>
          <template v-if="orderDetail.delivery_type == 1">
            <view class="item" v-if="isOrderStatus('PAID')">
              <view class="white lg mb10">等待商家发货</view>
              <view class="white sm">您的商品正在打包中，请耐心等待…</view>
            </view>
            <view class="item" v-if="isOrderStatus('SHIPPED')">
              <view class="white lg mb10">已发货</view>
              <view class="white sm">您的商品正在路中，请耐心等待…</view>
            </view>
            <view class="item" v-if="isOrderStatus('COMPLETED')">
              <view class="white lg mb10">已完成</view>
              <view class="white sm">商品已签收，期待再次购买！</view>
            </view>
            <view class="item" v-if="isOrderStatus('CANCELLED')">
              <view class="white lg mb10">订单已关闭</view>
              <!-- <view class="white sm">原因：超时未支付</view> -->
            </view>
          </template>

          <template v-if="orderDetail.delivery_type == 2">
            <view class="item" v-if="isOrderStatus('PAID')">
              <view class="white lg mb10">待取货</view>
              <view class="white sm">请前往指定门店取货</view>
            </view>
            <view class="item" v-if="isOrderStatus('COMPLETED')">
              <view class="white lg mb10">已完成</view>
              <view class="white sm">交易已完成，感谢您的购买！</view>
            </view>
            <view class="item" v-if="isOrderStatus('CANCELLED')">
              <view class="white lg mb10">订单已关闭</view>
            </view>
          </template>
        </view>

        <!-- 快递配送 -->
        <view
          v-if="orderDetail.delivery_type == 1"
          class="receiving-card contain"
          @tap="onAddressExpress"
        >
          <image
            class="icon-md mr20"
            width="44"
            height="44"
            src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_address.png"
            mode="scaleToFill"
          />
          <view class="receiving-content">
            <view class="md black bold">
              <text>{{ orderDetail.consignee }}</text>
              <text class="ml10">{{ orderDetail.mobile }}</text>
            </view>
            <view class="xs black mt10">{{
              orderDetail.delivery_address
            }}</view>
          </view>
        </view>

        <!-- 门店自提 -->
        <view
          v-if="orderDetail.delivery_type == 2"
          class="receiving-card contain"
        >
          <image
            class="icon-md mr20"
            width="44"
            height="44"
            src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_address.png"
            mode="scaleToFill"
          />
          <view class="receiving-content">
            <text class="md black bold">{{
              orderDetail.selffetch_shop.name
            }}</text>
            <text class="xs black mt10">{{
              orderDetail.selffetch_shop.shop_address
            }}</text>
            <text class="xs muted mt10">
              <text>营业时间：</text>
              <text
                >{{ orderDetail.selffetch_shop.business_start_time }} -
                {{ orderDetail.selffetch_shop.business_end_time }}</text
              >
            </text>
          </view>
        </view>

        <!-- 扫码收货 -->
        <view v-if="orderDetail.delivery_type == 2" class="contain receive">
          <view v-if="orderDetail.verification_status" class="delivery--die">
            <image
              src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/delivery_die.png"
              width="134"
              height="98"
              mode="scaleFill"
            />
          </view>

          <view class="receive-qr" v-if="showQRSelffetch">
            <text class="xs lighter">请凭二维码取货</text>
            <view
              class="mt20 qr-contain"
              :class="{ 'qr-contain--die': orderDetail.verification_status }"
              ref="qr-image"
            >
              <tki-qrcode
                ref="qrcode"
                :val="pickupQrValue"
                :size="118"
                :onval="true"
                :load-make="true"
                :show-loading="false"
              ></tki-qrcode>
            </view>
            <view class="mt30 xs black qr-code"
              >提货码：{{ pickupQrValue }}</view
            >
          </view>

          <view class="nr receive-info">
            <view class="receive-info-item">
              <text class="normal">提货人</text>
              <text class="black">{{ orderDetail.consignee }}</text>
            </view>
            <view class="receive-info-item">
              <text class="normal">联系方式</text>
              <text class="black">{{ orderDetail.mobile }}</text>
            </view>
          </view>
        </view>

        <view class="goods contain" style="margin-bottom: 0">
          <view class="status row-between" v-if="team.status != null">
            <view>拼团状态</view>
            <view
              :style="
                'padding: 6rpx 26rpx; ' +
                (team.status == 2 && 'background-color: #d7d7d7')
              "
              class="bg-primary br60 white sm"
            >
              {{ teamStatus(team.status) }}
            </view>
          </view>
          <order-goods
            :team="team"
            :link="true"
            :list="orderDetail.order_goods"
            :order_type="orderDetail.order_type"
          ></order-goods>
        </view>

        <view class="price contain" style="border-radius: 0rpx 14rpx">
          <view class="row-between" v-if="priceShow">
            <view>商品总价</view>
            <view class="black">
              <price-format :price="orderDetail.goods_price"></price-format>
            </view>
          </view>
          <view class="row-between" v-if="priceShow">
            <view>运费</view>
            <view class="black"
              >+
              <price-format :price="orderDetail.shipping_price"></price-format>
            </view>
          </view>
          <view
            v-if="orderDetail.discount_amount != 0 && priceShow"
            class="row-between"
          >
            <view>优惠券</view>
            <view class="primary"
              >-
              <price-format :price="orderDetail.discount_amount"></price-format>
            </view>
          </view>
          <view
            v-if="orderDetail.integral_amount != 0 && priceShow"
            class="row-between"
          >
            <view>积分抵扣</view>
            <view class="primary"
              >-
              <price-format :price="orderDetail.integral_amount"></price-format>
            </view>
          </view>
          <view class="row-between">
            <view class="">
              <text v-if="isOrderStatus('CREATED')">需</text>
              <text v-else>实</text>
              付款：
            </view>
            <view class="primary xl">
              <price-format
                :first-size="34"
                :second-size="34"
                :price="orderDetail.order_amount"
              >
              </price-format>
            </view>
          </view>
          <view
            class="row-center muted"
            style="padding: 40rpx 0"
            @tap="priceShow = !priceShow"
          >
            <view>
              <text class="mr10" v-if="priceShow"> 收起 </text>
              <text class="mr10" v-else> 查看更多 </text>

              <u-icon name="arrow-up" v-if="priceShow" />
              <u-icon name="arrow-down" v-else />
            </view>
          </view>
        </view>
        <view class="order-info contain">
          <view class="item row" style="align-items: flex-start">
            <view class="title">买家留言</view>
            <view class="black">{{ orderDetail.user_remark || "无" }}</view>
          </view>
        </view>
        <view v-if="amountRows.length" class="order-info contain">
          <view class="card-title">金额明细</view>
          <view v-for="row in amountRows" :key="row.label" class="item row">
            <view class="title">{{ row.label }}</view>
            <view class="black">{{ row.value }}</view>
          </view>
        </view>
        <view v-if="deliveryRows.length" class="order-info contain">
          <view class="card-title">配送信息</view>
          <view v-for="row in deliveryRows" :key="row.label" class="item row">
            <view class="title">{{ row.label }}</view>
            <view class="black">{{ row.value }}</view>
          </view>
        </view>
        <view v-if="selfFetchRows.length" class="order-info contain">
          <view class="card-title">自提信息</view>
          <view v-for="row in selfFetchRows" :key="row.label" class="item row">
            <view class="title">{{ row.label }}</view>
            <view class="black">{{ row.value }}</view>
          </view>
        </view>
        <view v-if="verifyRows.length" class="order-info contain">
          <view class="card-title">核销信息</view>
          <view v-for="row in verifyRows" :key="row.label" class="item row">
            <view class="title">{{ row.label }}</view>
            <view class="black">{{ row.value }}</view>
          </view>
        </view>
        <view v-if="refundRows.length" class="order-info contain">
          <view class="card-title">售后信息</view>
          <view v-for="row in refundRows" :key="row.label" class="item row">
            <view class="title">{{ row.label }}</view>
            <view class="black">{{ row.value }}</view>
          </view>
        </view>
        <view v-if="statusFlowRows.length" class="order-info contain">
          <view class="card-title">订单进度</view>
          <view v-for="(row, index) in statusFlowRows" :key="index" class="flow-item">
            <view class="flow-dot"></view>
            <view class="flow-content">
              <view class="flow-title">{{ row.title }}</view>
              <view v-if="row.desc" class="flow-desc">{{ row.desc }}</view>
              <view v-if="row.time" class="flow-time">{{ row.time }}</view>
            </view>
          </view>
        </view>
        <view class="order-info contain">
          <view class="card-title">订单信息</view>
          <view class="item row">
            <view class="title">订单编号</view>
            <view class="black">{{ displayValue(orderDetail.order_sn) }}</view>
          </view>
          <view class="item row">
            <view class="title">订单类型</view>
            <view class="black">{{ displayValue(orderDetail.order_type_desc || getOrderType(orderDetail.order_type)) }}</view>
          </view>
          <view class="item row">
            <view class="title">订单状态</view>
            <view class="black">{{ displayValue(orderDetail.order_status_desc || formatOrderStatusText(orderDetail.order_status)) }}</view>
          </view>
          <view class="item row">
            <view class="title">支付状态</view>
            <view class="black">{{ displayValue(formatPayStatus(orderDetail.pay_status)) }}</view>
          </view>
          <view class="item row">
            <view class="title">支付方式</view>
            <view class="black">{{ displayValue(formatPayWay(orderDetail.pay_way_text || orderDetail.payMethod || orderDetail.pay_way)) }}</view>
          </view>
          <view class="item row">
            <view class="title">下单时间</view>
            <view class="black">{{ displayValue(orderDetail.create_time) }}</view>
          </view>
          <view v-if="orderDetail.pay_time" class="item row">
            <view class="title">付款时间</view>
            <view class="black">{{ orderDetail.pay_time }}</view>
          </view>
          <view v-if="orderDetail.shipping_time" class="item row">
            <view class="title">发货时间</view>
            <view class="black">{{ orderDetail.shipping_time }}</view>
          </view>
          <view v-if="orderDetail.confirm_take_time" class="item row">
            <view class="title">成交时间</view>
            <view class="black">{{ orderDetail.confirm_take_time }}</view>
          </view>
          <view v-if="orderDetail.cancel_time" class="item row">
            <view class="title">关闭时间</view>
            <view class="black">{{ orderDetail.cancel_time }}</view>
          </view>
          <view v-for="row in extraOrderRows" :key="row.label" class="item row">
            <view class="title">{{ row.label }}</view>
            <view class="black">{{ row.value }}</view>
          </view>
        </view>
        <view
          class="footer bg-white row fixed"
          v-if="
            orderDetail.cancel_btn ||
            orderDetail.delivery_btn ||
            orderDetail.take_btn ||
            orderDetail.del_btn ||
            orderDetail.pay_btn
          "
        >
          <view style="flex: 1"></view>
          <view v-if="orderDetail.cancel_btn">
            <button
              size="sm"
              class="footer-btn footer-btn--plain"
              hover-class="none"
              @tap="cancelOrder"
            >
              取消订单
            </button>
          </view>
          <navigator
            v-if="orderDetail.delivery_btn"
            hover-class="none"
            :url="
              '/bundle_order/pages/goods_logistics/goods_logistics?id=' +
              orderDetail.id
            "
          >
            <button size="sm" class="footer-btn footer-btn--plain" hover-class="none">
              查看物流
            </button>
          </navigator>
          <view v-if="orderDetail.take_btn" class="ml20">
            <button
              size="sm"
              class="footer-btn footer-btn--primary"
              hover-class="none"
              @tap.stop="comfirmOrder"
            >
              确认收货
            </button>
          </view>
          <view v-if="orderDetail.del_btn">
            <button
              size="sm"
              class="footer-btn footer-btn--plain"
              hover-class="none"
              @tap="delOrder"
            >
              删除订单
            </button>
          </view>
          <view class="ml20" v-if="orderDetail.pay_btn">
            <button size="sm" class="footer-btn footer-btn--primary" @tap="payNow">
              立即付款
            </button>
          </view>
        </view>
      </view>
    </view>

    <loading-view v-if="isFirstLoading"></loading-view>
    <order-dialog
      ref="orderDialog"
      :orderId="orderDetail.id"
      :type="type"
      @refresh="onRefresh"
    ></order-dialog>
    <loading-view
      v-if="showLoading"
      background-color="transparent"
      :size="50"
    ></loading-view>
  </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import TkiQrcode from '@/bundle/components/tki-qrcode/tki-qrcode.vue'
import {
  getOrderDetail,
  getwechatSyncCheck,
  getwxReceiveDetail,
  confirmOrder,
} from "@/api/order";
import { compareWeChatVersion } from "@/utils/tools";

import { prepay } from "@/api/app";
import { wxpay, alipay } from "@/utils/pay";
import UCountDown from '@/bundle/components/uview-ui/components/u-count-down/u-count-down.vue'
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
import PriceFormat from '@/bundle/components/price-format/price-format.vue'

export default {
  data() {
    return {
      orderDetail: {},
      team: {},
      isFirstLoading: true,
      type: 0,
      cancelTime: 0,
      showCancel: "",
      showLoading: false,
      imageQR: "",
      priceShow: false,
      didShowOnce: false,
    };
  },

  components: {
			PriceFormat,
			Navbar,
			TkiQrcode,
			UCountDown,
			UIcon
		},
  props: {},

  onLoad: function (options) {
    this.id = options.id;
    this.getOrderDetailFun();
  },

  onUnload() {
    uni.$off("payment");
  },

  onShow() {
    if (!this.didShowOnce) {
      this.didShowOnce = true;
      return;
    }
    this.getOrderDetailFun();
  },

  methods: {
    onRefresh() {
      uni.$emit("refreshorder");
      const { type } = this;
      if ([0, 2].includes(type)) {
        this.getOrderDetailFun();
      } else if (type == 1) {
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
      }
    },
    orderDialog() {
      this.$refs.orderDialog.open();
    },

    delOrder() {
      this.type = 1;
      this.$nextTick(async () => {
        this.orderDialog();
      });
    },
    // 小程序确认收货
    comfirmReceive(transaction_id) {
      return new Promise((resolve, reject) => {
        wx.openBusinessView({
          businessType: "weappOrderConfirm",
          extraData: {
            transaction_id,
          },
          success({ extraData }) {
            if (extraData.status == "success") {
              resolve("确认收货");
            } else {
              resolve("取消收货");
            }
          },
          fail(err) {
            reject(err);
          },
        });
      });
    },
    //查询是否收货成功
    querycomfirmReceive(id) {
      return new Promise((resolve, reject) => {
        getwechatSyncCheck({ id })
          .then(({ data }) => {
            if (data && data.order && data.order.order_state === 4) {
              resolve("已确认收货");
            } else {
              reject("未确认收货");
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    comfirmOrder() {
      this.type = 2;
      this.$nextTick(async () => {
        // #ifdef MP-WEIXIN
        let res = {};
        if (this.isWechatPayWay(this.orderDetail.pay_way || this.orderDetail.payMethod)) {
          res = await getwechatSyncCheck({ id: this.id });
        }
        if (
          compareWeChatVersion("2.6.0") === 1 &&
          wx.openBusinessView &&
          this.isWechatPayWay(this.orderDetail.pay_way || this.orderDetail.payMethod) &&
          res.data &&
          res.data.order &&
          res.data.order.order_state !== 1
        ) {
          try {
            const { data } = await getwxReceiveDetail({
              order_id: this.id,
            });
            await this.comfirmReceive(data.transaction_id);
            await this.querycomfirmReceive(this.id);
            await confirmOrder(this.id);
          } catch (error) {
            this.orderDialog();
            return;
          }
          this.getOrderDetailFun();
        } else {
          this.orderDialog();
        }
        // #endif

        // #ifndef MP-WEIXIN
        this.orderDialog();
        // #endif
      });
    },

    cancelOrder() {
      this.type = 0;
      this.$nextTick(() => {
        this.orderDialog();
      });
    },

    payNow() {
      uni.$off("payment");
      uni.$on("payment", (params) => {
        setTimeout(() => {
          if (params.result) {
            this.$toast({
              title: "支付成功",
            });
            this.getOrderDetailFun();
            uni.$emit("refreshorder");
          } else {
            this.getOrderDetailFun();
          }
          uni.$off("payment");
        }, 500);
      });

      uni.navigateTo({
        url: `/bundle/pages/payment/payment?from=${"order"}&order_id=${this.id}`,
      });
    },

    getOrderDetailFun() {
      getOrderDetail(this.id)
        .then((res) => {
          if (res.code == 1) {
            const data = res.data || {};
            this.cancelTime = (data.order_cancel_time || 0) - Date.now() / 1000;
            this.orderDetail = data;
            this.team = data.team || {};
            this.$nextTick(() => {
              this.isFirstLoading = false;
            });
          } else {
            setTimeout(() => uni.navigateBack(), 1500);
          }
          return res.data || {};
        })
        .then((data) => {
          if (data.delivery_type === 2) {
            // 提货码
            this.$nextTick(function () {
              const refQR = this.$refs["qrcode"];
              if (refQR && refQR._makeCode) refQR._makeCode();
            });
          }
        });
    },
    pickValue(source = {}, keys = []) {
      for (const key of keys) {
        const value = source && source[key];
        if (value !== undefined && value !== null && value !== '') return value;
      }
      return '';
    },
    displayValue(value) {
      if (value === undefined || value === null || value === '') return '-';
      if (Array.isArray(value)) return value.length ? value.join('、') : '-';
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    },
    buildRows(rows) {
      return rows
        .map(([label, value]) => ({ label, value: this.displayValue(value) }))
        .filter((row) => row.value !== '-');
    },
    formatMoney(value) {
      if (value === undefined || value === null || value === '') return '';
      const amount = Number(value);
      if (Number.isNaN(amount)) return value;
      return `¥${amount.toFixed(2)}`;
    },
    joinText(list, separator = ' ') {
      return list.filter((item) => item !== undefined && item !== null && item !== '').join(separator);
    },
    formatDeliveryType(type) {
      const map = { 1: '快递配送', 2: '门店自提', EXPRESS: '快递配送', PICKUP: '门店自提' };
      return map[type] || type;
    },
    formatPayStatus(status) {
      const map = { UNPAID: '未支付', PAID: '已支付', REFUNDED: '已退款', CLOSED: '已关闭', 0: '未支付', 1: '已支付' };
      return map[status] || status;
    },
    formatPayWay(value) {
      const map = { BALANCE: '钱包余额', WECHAT_JSAPI: '微信支付', ALIPAY: '支付宝', 1: '微信支付', 2: '支付宝', 3: '钱包余额' };
      return map[value] || value;
    },
    isWechatPayWay(value) {
      return value === 1 || value === '1' || value === 'WECHAT_JSAPI' || value === 'wechat' || value === 'wxpay';
    },
    formatOrderStatusText(status) {
      const map = { CREATED: '待付款', PAID: '待发货', SHIPPED: '待收货', COMPLETED: '已完成', CANCELLED: '已关闭', 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已关闭' };
      return map[status] || status;
    },
  },
  computed: {
    showQRSelffetch() {
      let result = false;

      if (this.orderDetail.order_status) {
        result = true;
      }

      if (this.orderDetail.order_type == 2) {
        this.orderDetail.team_status == 1 ? (result = true) : (result = false);
      }

      return result && !!this.pickupQrValue;
    },
    isOrderStatus() {
      const statusMap = {
        CREATED: [0, '0', 'CREATED'],
        PAID: [1, '1', 'PAID'],
        SHIPPED: [2, '2', 'SHIPPED'],
        COMPLETED: [3, '3', 'COMPLETED'],
        CANCELLED: [4, '4', 'CANCELLED']
      };
      return (status) => statusMap[status].includes(this.orderDetail.order_status);
    },
    pickupQrValue() {
      return this.orderDetail.pickup_code || this.orderDetail.pickupCode || this.orderDetail.verifyCode || this.orderDetail.order_sn || this.orderDetail.orderNo || '';
    },
    amountRows() {
      return this.buildRows([
        ['商品金额', this.formatMoney(this.pickValue(this.orderDetail, ['goods_price', 'goodsAmount', 'goods_amount']))],
        ['运费', this.formatMoney(this.pickValue(this.orderDetail, ['shipping_price', 'freightAmount', 'freight_amount']))],
        ['优惠金额', this.formatMoney(this.pickValue(this.orderDetail, ['discount_amount', 'discountAmount']))],
        ['积分抵扣', this.formatMoney(this.pickValue(this.orderDetail, ['integral_amount', 'integralAmount']))],
        ['实付金额', this.formatMoney(this.pickValue(this.orderDetail, ['order_amount', 'payAmount', 'orderAmount']))],
        ['退款金额', this.formatMoney(this.pickValue(this.orderDetail.refund_info || {}, ['refundAmount', 'refund_amount', 'amount']))]
      ]);
    },
    deliveryRows() {
      return this.buildRows([
        ['配送方式', this.formatDeliveryType(this.orderDetail.delivery_type)],
        ['收货人', this.orderDetail.consignee],
        ['联系电话', this.orderDetail.mobile],
        ['收货地址', this.orderDetail.delivery_address],
        ['物流公司', this.pickValue(this.orderDetail, ['express_name', 'expressName', 'shipping_name', 'shippingName'])],
        ['物流单号', this.pickValue(this.orderDetail, ['invoice_no', 'trackingNo', 'tracking_no', 'express_no', 'expressNo'])],
        ['发货时间', this.orderDetail.shipping_time]
      ]);
    },
    selfFetchRows() {
      const shop = this.orderDetail.selffetch_shop || {};
      return this.buildRows([
        ['门店名称', this.pickValue(shop, ['name', 'shopName', 'shop_name'])],
        ['门店地址', this.pickValue(shop, ['shop_address', 'address', 'detailAddress'])],
        ['营业时间', this.joinText([this.pickValue(shop, ['business_start_time', 'businessStartTime']), this.pickValue(shop, ['business_end_time', 'businessEndTime'])], ' - ')],
        ['门店电话', this.pickValue(shop, ['mobile', 'phone', 'contactMobile'])],
        ['提货码', this.pickupQrValue],
        ['提货状态', this.orderDetail.verification_status ? '已核销' : '待核销']
      ]);
    },
    verifyRows() {
      const verify = this.orderDetail.verify_info || {};
      if (this.orderDetail.delivery_type != 2 && !Object.keys(verify).length) return [];
      return this.buildRows([
        ['核销码', this.pickValue(verify, ['pickupCode', 'verifyCode', 'code']) || this.pickupQrValue],
        ['核销状态', this.orderDetail.verification_status ? '已核销' : '未核销'],
        ['核销时间', this.pickValue(verify, ['verifyTime', 'verify_time', 'verificationTime'])],
        ['核销门店', this.pickValue(verify, ['shopName', 'shop_name', 'storeName'])],
        ['核销员', this.pickValue(verify, ['staffName', 'staff_name', 'operator'])]
      ]);
    },
    refundRows() {
      const refund = this.orderDetail.refund_info || {};
      return this.buildRows([
        ['售后状态', this.pickValue(refund, ['statusText', 'status_text', 'refundStatusText', 'refund_status_text', 'status'])],
        ['售后类型', this.pickValue(refund, ['typeText', 'type_text', 'refundTypeText', 'refund_type_text', 'type'])],
        ['退款金额', this.formatMoney(this.pickValue(refund, ['refundAmount', 'refund_amount', 'amount']))],
        ['申请原因', this.pickValue(refund, ['reason', 'refundReason', 'refund_reason'])],
        ['申请时间', this.pickValue(refund, ['createTime', 'create_time', 'applyTime', 'apply_time'])],
        ['处理时间', this.pickValue(refund, ['handleTime', 'handle_time', 'auditTime', 'audit_time'])]
      ]);
    },
    statusFlowRows() {
      const list = this.orderDetail.status_flow || this.orderDetail.statusFlow || [];
      if (!Array.isArray(list)) return [];
      return list.map((item) => ({
        title: this.pickValue(item, ['title', 'name', 'statusText', 'status_text', 'status']) || '订单状态',
        desc: this.pickValue(item, ['desc', 'description', 'content', 'remark']),
        time: this.pickValue(item, ['time', 'createTime', 'create_time', 'createdAt'])
      })).filter((item) => item.title || item.desc || item.time);
    },
    extraOrderRows() {
      return this.buildRows([
        ['支付单号', this.pickValue(this.orderDetail, ['payOrderNo', 'pay_order_no', 'transaction_id', 'transactionId'])],
        ['第三方流水号', this.pickValue(this.orderDetail, ['outTradeNo', 'out_trade_no', 'tradeNo', 'trade_no'])],
        ['订单来源', this.pickValue(this.orderDetail, ['source', 'orderSource', 'order_source', 'client'])],
        ['关闭原因', this.pickValue(this.orderDetail, ['cancelReason', 'cancel_reason', 'closeReason', 'close_reason'])],
        ['备注', this.pickValue(this.orderDetail, ['remark', 'adminRemark', 'admin_remark'])]
      ]);
    },
    teamStatus() {
      return (status) => {
        switch (status) {
          case 0:
            return "拼团中";
          case 1:
            return "拼团成功";
          case 2:
            return "拼团失败";
        }
      };
    },
    getOrderType() {
      return (type) => {
        switch (type) {
          case 0:
            return "普通订单";
          case 1:
            return "秒杀订单";
          case 2:
            return "拼团订单";
          case 3:
            return "砍价订单";
        }
      };
    },
  },
};
</script>
<style lang="scss">
.order-details {
  position: relative;
  min-height: 100vh;
  background: #f6f7fb;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.order-details .header-bg {
  position: absolute;
  top: 0;
  width: 100%;
  height: 260rpx;
  background: linear-gradient(135deg, #ff7a35 0%, #ff2c3c 100%);
  z-index: 0;
}

.order-details .goods .status {
  height: 88rpx;
  padding: 0 20rpx;
}

.order-details .main {
  position: relative;
  z-index: 1;
  padding-top: 8rpx;
}

.order-details .contain {
  margin: 0 24rpx 22rpx;
  border-radius: 24rpx;
  background-color: #fff;
  box-shadow: 0 10rpx 28rpx rgba(25, 31, 46, .05);
  overflow: hidden;
}

.order-details .header {
  min-height: 160rpx;
  padding: 34rpx 42rpx 28rpx;
  box-sizing: border-box;
}

.order-details .header .lg {
  font-size: 38rpx;
  font-weight: 700;
  line-height: 52rpx;
}

.order-details .header .sm {
  font-size: 25rpx;
  opacity: .92;
}

.order-details .img-line {
  height: 3rpx;
  width: 100%;
  display: block;
}

.order-details .address-wrap {
  height: 164rpx;
  padding: 0 24rpx;
}

.order-details .order-info {
  padding: 16rpx 0;
}

.order-details .card-title {
  padding: 22rpx 26rpx 12rpx;
  color: #202124;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 42rpx;
}

.order-details .order-info .item {
  min-height: 56rpx;
  padding: 14rpx 26rpx;
  box-sizing: border-box;
  color: #606266;
  font-size: 26rpx;
}

.order-details .order-info .item .title {
  width: 176rpx;
  flex: none;
  color: #8b9098;
}

.order-details .order-info .item .black {
  flex: 1;
  min-width: 0;
  line-height: 38rpx;
  word-break: break-all;
}

.flow-item {
  position: relative;
  display: flex;
  padding: 12rpx 26rpx 18rpx;
}

.flow-dot {
  flex: none;
  width: 14rpx;
  height: 14rpx;
  margin-top: 12rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: #ff2c3c;
}

.flow-content {
  flex: 1;
  min-width: 0;
}

.flow-title {
  color: #303133;
  font-size: 27rpx;
  line-height: 38rpx;
}

.flow-desc,
.flow-time {
  margin-top: 6rpx;
  color: #8b9098;
  font-size: 24rpx;
  line-height: 34rpx;
}

.order-details .price > view {
  min-height: 64rpx;
  padding: 0 26rpx;
  color: #606266;
  font-size: 26rpx;
}

.order-details .price > view:last-child {
  min-height: 86rpx;
}

.order-details .footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  min-height: 112rpx;
  padding: 16rpx 24rpx calc(16rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 -10rpx 30rpx rgba(18, 24, 38, .08);
}

.footer button::after {
  border: 0;
}

.footer-btn {
  min-width: 156rpx;
  height: 68rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  line-height: 68rpx;
}

.footer-btn--plain {
  color: #303133;
  background: #ffffff;
  border: 1rpx solid #dcdfe6;
}

.footer-btn--primary {
  color: #ffffff;
  background: linear-gradient(90deg, #ff7a35 0%, #ff2c3c 100%);
  box-shadow: 0 10rpx 24rpx rgba(255, 65, 55, .22);
  border: 0;
}

.tips-dialog {
  height: 230rpx;
  width: 100%;
}

.order-details .invite-btn {
  background: linear-gradient(270deg, #ff2c3c 0%, #f95f2f 100%);
  margin: 30rpx 26rpx 40rpx;
}

.receiving-card {
  display: flex;
  align-items: center;
  min-height: 152rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.receiving-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.receive {
  position: relative;
  padding-bottom: 10rpx;
}

.delivery--die {
  position: absolute;
  top: 0;
  right: 30rpx;
}

.receive-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 430rpx;
}

.qr-contain {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 280rpx;
  height: 280rpx;
  padding: 16rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 22rpx;
  background: #ffffff;
}

.qr-contain--die {
  position: relative;
}

.qr-contain--die::before {
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: block;
  content: "";
  background-color: rgba(255, 255, 255, 0.5);
}

.qr-code {
  padding: 8rpx 30rpx;
  border-radius: 120rpx;
  background-color: #f6f7fb;
}

.receive-info {
  padding-left: 20rpx;
}

.receive-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding-right: 30rpx;
}

.receive-info-item:nth-child(n + 2) {
  border-top: $dashed-border;
}
</style>
