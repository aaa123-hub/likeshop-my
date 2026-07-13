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
        <view :class="['header', isOrderStatus('CREATED') ? 'header--paying' : '']">
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
          <template v-if="isExpressOrder">
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

          <template v-if="isSelfFetchOrder">
            <view class="item" v-if="isOrderStatus('PAID')">
              <view class="white lg mb10">待核销</view>
              <view class="white sm">请凭核销码到门店取货，商家核销后完成订单</view>
            </view>
            <view class="item" v-if="isOrderStatus('COMPLETED')">
              <view class="white lg mb10">已核销</view>
              <view class="white sm">自提订单已核销完成，感谢您的购买！</view>
            </view>
            <view class="item" v-if="isOrderStatus('CANCELLED')">
              <view class="white lg mb10">订单已关闭</view>
            </view>
          </template>
        </view>

        <!-- 扫码收货 -->
        <view v-if="isSelfFetchOrder && (showQRSelffetch || isVerifiedOrder)" class="contain receive">
          <view v-if="isVerifiedOrder" class="delivery--die">
            <image
              src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/delivery_die.png"
              class="delivery--die__image"
              mode="scaleFill"
            />
          </view>

          <view class="receive-qr" v-if="showQRSelffetch">
            <text class="receive-qr__title">取货核销码</text>
            <text class="receive-qr__desc">到店后请向商家出示二维码或提货码</text>
            <view
              class="qr-contain"
              :class="{ 'qr-contain--die': isVerifiedOrder }"
              ref="qr-image"
            >
              <tki-qrcode
                ref="qrcode"
                :val="pickupQrValue"
                :size="236"
                :onval="true"
                :load-make="true"
                :show-loading="false"
              ></tki-qrcode>
            </view>
            <view class="qr-code"
              >提货码：{{ pickupQrValue }}</view
            >
          </view>

          <view v-else class="receive-done">
            <view class="receive-done__title">已完成核销</view>
            <view class="receive-done__desc">该自提订单已核销，无需重复出示取货码</view>
          </view>
        </view>

        <view class="goods contain">
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
          <view class="order-goods-list">
            <view v-for="(item, index) in orderGoodsList" :key="index" class="order-goods-item">
              <view class="order-goods-main" @tap="toGoods(item)">
                <custom-image class="order-goods-image" width="168rpx" height="168rpx" radius="18rpx" mode="aspectFill" lazy-load :src="item.image_str || item.image"></custom-image>
                <view class="order-goods-info">
                  <view class="order-goods-name line2">
                    <text v-if="team.need" class="team-tag">{{ team.need }}人团</text>{{ goodsName(item) }}
                  </view>
                  <view v-if="goodsSpec(item)" class="order-goods-spec line1">{{ goodsSpec(item) }}</view>
                  <view class="order-goods-bottom">
                    <view class="order-goods-price">
                      <price-format v-if="hasMoneyValue(goodsPriceValue(item))" :weight="500" :subscript-size="24" :first-size="34" :second-size="24" :price="goodsPriceValue(item)"></price-format>
                      <text v-else class="order-goods-price__pending">金额待确认</text>
                    </view>
                    <view class="order-goods-num">{{ goodsNumText(item) }}</view>
                  </view>
                </view>
              </view>
              <view class="order-goods-actions" v-if="item.comment_btn || canApplyRefund(item) || afterStatusText(item)">
                <view class="after-status" v-if="afterStatusText(item)">{{ afterStatusText(item) }}</view>
                <navigator hover-class="none" :url="'/bundle_order/pages/goods_reviews/goods_reviews?id=' + encodeURIComponent(refundItemId(item)) + '&order_id=' + encodeURIComponent(refundOrderId(item))" v-if="item.comment_btn">
                  <button size="xs" class="goods-action-btn" hover-class="none">评价晒图</button>
                </navigator>
                <navigator hover-class="none" :url="refundUrl(item)" v-if="canApplyRefund(item)">
                  <button size="xs" class="goods-action-btn" hover-class="none">申请退款</button>
                </navigator>
              </view>
            </view>
          </view>
        </view>

        <view class="price contain">
          <view class="price-title">金额明细</view>
          <view class="row-between">
            <view>商品总价</view>
            <view class="black">
              <price-format v-if="hasMoneyValue(orderDetail.goods_price)" :price="orderDetail.goods_price"></price-format>
              <text v-else>待确认</text>
            </view>
          </view>
          <view class="row-between">
            <view>运费</view>
            <view class="black">
              <template v-if="hasMoneyValue(orderDetail.shipping_price)">
                +<price-format :price="orderDetail.shipping_price"></price-format>
              </template>
              <text v-else>待确认</text>
            </view>
          </view>
          <view
            v-if="hasPositiveMoney(orderDetail.discount_amount)"
            class="row-between"
          >
            <view>优惠券</view>
            <view class="primary"
              >-
              <price-format :price="orderDetail.discount_amount"></price-format>
            </view>
          </view>
          <view
            v-if="hasPositiveMoney(orderDetail.integral_amount)"
            class="row-between"
          >
            <view>积分抵扣</view>
            <view class="primary"
              >-
              <price-format :price="orderDetail.integral_amount"></price-format>
            </view>
          </view>
          <view class="row-between price-pay-row">
            <view class="price-pay-label">{{ isOrderStatus('CREATED') ? '待支付金额' : '实付金额' }}</view>
            <view class="price-pay-amount">
              <price-format
                v-if="hasMoneyValue(orderDetail.order_amount)"
                :first-size="42"
                :second-size="30"
                :subscript-size="30"
                :price="orderDetail.order_amount"
              >
              </price-format>
              <text v-else class="price-pay-pending">待确认</text>
            </view>
          </view>
        </view>
        <view class="order-info contain">
          <view class="item row" style="align-items: flex-start">
            <view class="title">买家留言</view>
            <view class="black">{{ orderDetail.user_remark || "无" }}</view>
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
            <view class="black order-status-text">{{ displayValue(currentOrderStatusText) }}</view>
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
            <view class="black">{{ displayValue(formatDisplayTime(orderDetail.create_time)) }}</view>
          </view>
          <view v-if="orderDetail.pay_time" class="item row">
            <view class="title">付款时间</view>
            <view class="black">{{ formatDisplayTime(orderDetail.pay_time) }}</view>
          </view>
          <view v-if="orderDetail.shipping_time" class="item row">
            <view class="title">发货时间</view>
            <view class="black">{{ formatDisplayTime(orderDetail.shipping_time) }}</view>
          </view>
          <view v-if="orderDetail.confirm_take_time" class="item row">
            <view class="title">成交时间</view>
            <view class="black">{{ formatDisplayTime(orderDetail.confirm_take_time) }}</view>
          </view>
          <view v-if="orderDetail.cancel_time" class="item row">
            <view class="title">关闭时间</view>
            <view class="black">{{ formatDisplayTime(orderDetail.cancel_time) }}</view>
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
            showDeliveryButton ||
            showTakeButton ||
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
            v-if="showDeliveryButton"
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
          <view v-if="showTakeButton" class="ml20">
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
    <u-modal v-model="showOrderDialog" :show-cancel-button="true" :content="orderDialogText" confirm-color="#a0610d" @confirm="onOrderDialogConfirm"></u-modal>
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
  cancelOrder as cancelOrderApi,
  delOrder as delOrderApi,
} from "@/api/order";
import { compareWeChatVersion } from "@/utils/tools";

import { prepay } from "@/api/app";
import { wxpay, alipay } from "@/utils/pay";
import UCountDown from '@/bundle/components/uview-ui/components/u-count-down/u-count-down.vue'
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
import UModal from '@/bundle/components/uview-ui/components/u-modal/u-modal.vue'
import PriceFormat from '@/bundle/components/price-format/price-format.vue'
import { cleanBackendText, cleanEmptyBackendText, isBackendCodeText, isEmptyBackendText } from '@/utils/backend-text'

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
      showOrderDialog: false,
      imageQR: "",
      didShowOnce: false,
    };
  },

  components: {
			PriceFormat,
			Navbar,
			TkiQrcode,
			UCountDown,
			UIcon,
			UModal
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
        uni.$emit("refreshorder");
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      }
    },
    orderDialog() {
      this.showOrderDialog = true;
    },

    async onOrderDialogConfirm() {
      let res = null;
      if (this.type === 0) res = await cancelOrderApi(this.orderDetail.id);
      if (this.type === 1) res = await delOrderApi(this.orderDetail.id);
      if (this.type === 2) res = await confirmOrder(this.orderDetail.id);
      if (res && res.code == 1) {
        if (this.type === 1) this.rememberDeletedOrder(this.orderDetail)
        this.showOrderDialog = false;
        this.$toast({ title: res.msg || '操作成功' });
        this.onRefresh();
      }
    },

    toGoods(item) {
      const goodsId = typeof item === 'object'
        ? this.pickValue(item, ['goods_id', 'goodsId', 'spuId', 'spu_id', 'productId', 'product_id'])
        : item;
      if (!goodsId) {
        uni.showToast({ title: '商品信息缺失', icon: 'none' });
        return;
      }
      const skuId = typeof item === 'object'
        ? this.pickValue(item, ['sku_id', 'skuId', 'item_id', 'itemId', 'order_item_id', 'orderItemId'])
        : '';
      const query = skuId ? `&skuId=${encodeURIComponent(skuId)}&itemId=${encodeURIComponent(skuId)}` : '';
      uni.navigateTo({ url: `/bundle/pages/goods_details/goods_details?id=${encodeURIComponent(goodsId)}${query}` });
    },

    delOrder() {
      this.type = 1;
      this.$nextTick(async () => {
        this.orderDialog();
      });
    },
    orderIdentityList(item = {}) {
      return [
        item.id,
        item.orderNo,
        item.order_no,
        item.order_sn,
        item.orderSn,
        item.order_id,
        item.orderId,
        item.bizOrderNo,
        item.biz_order_no,
        item.subOrderNo,
        item.sub_order_no
      ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
    },
    rememberDeletedOrder(order = {}) {
      const ids = uni.getStorageSync('ORDER_DELETED_IDS') || []
      const values = this.orderIdentityList(order)
      values.forEach((id) => {
        if (!ids.includes(id)) ids.push(id)
      })
      uni.setStorageSync('ORDER_DELETED_IDS', ids.slice(-200))
      uni.$emit('orderDeleted', {
        orderId: order.id || order.order_id || order.orderNo || order.order_sn,
        orderNo: order.orderNo || order.order_no || order.order_sn || order.id,
        order_sn: order.order_sn,
        bizOrderNo: order.bizOrderNo || order.biz_order_no,
        subOrderNo: order.subOrderNo || order.sub_order_no
      })
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
    // 查询是否收货成功
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
          if (this.isSelfFetchDeliveryType(data.delivery_type)) {
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
        if (!isEmptyBackendText(value)) return value;
      }
      return '';
    },
    isOrderNoLikePickupCode(value) {
      const text = String(value || '').trim();
      if (!text) return false;
      return [
        this.orderDetail.order_sn,
        this.orderDetail.orderNo,
        this.orderDetail.order_no,
        this.orderDetail.id
      ].filter(Boolean).map(String).includes(text);
    },
    displayValue(value) {
      if (value === undefined || value === null || value === '') return '-';
      if (Array.isArray(value)) return value.length ? value.join('、') : '-';
      if (typeof value === 'object') return JSON.stringify(value);
      return cleanEmptyBackendText(value, '') || '-';
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
    hasMoneyValue(value) {
      return value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value))
    },
    hasPositiveMoney(value) {
      return this.hasMoneyValue(value) && Number(value) > 0
    },
    goodsName(item = {}) {
      return cleanEmptyBackendText(item.goods_name || item.name, '商品待确认');
    },
    goodsSpec(item = {}) {
      return cleanEmptyBackendText(item.spec_value_str || item.spec_value, '');
    },
    goodsPriceValue(item = {}) {
      return item.original_price ?? item.originalPrice ?? item.goods_price ?? item.goodsPrice ?? item.price ?? ''
    },
    goodsNumText(item = {}) {
      const value = item.goods_num ?? item.goodsNum ?? item.quantity ?? item.num ?? ''
      const count = Number(value)
      return value !== '' && !Number.isNaN(count) && count > 0 ? `x${count}` : '数量待确认'
    },
    joinText(list, separator = ' ') {
      return list.filter((item) => item !== undefined && item !== null && item !== '').join(separator);
    },
    formatDisplayTime(value) {
      if (!value) return '';
      if (typeof value === 'string' && /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) {
        const normalized = value.replace('T', ' ').replace(/-/g, '/');
        const [date = '', time = ''] = normalized.split(' ');
        const [year, month, day] = date.split('/');
        return `${year}年${month}月${day}日 ${time.slice(0, 5)}`.trim();
      }
      const time = Number(value);
      const date = Number.isNaN(time) ? new Date(value) : new Date(time > 10000000000 ? time : time * 1000);
      if (Number.isNaN(date.getTime())) return String(value);
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },
    formatDeliveryType(type) {
      const map = { 1: '快递配送', 2: '门店自提', EXPRESS: '快递配送', DELIVERY: '快递配送', LOGISTICS: '快递配送', PICKUP: '门店自提', SELF_FETCH: '门店自提', SELF_PICKUP: '门店自提', SELFFETCH: '门店自提' };
      return map[type] || cleanBackendText(type, '');
    },
    isSelfFetchDeliveryType(type) {
      const value = String(type || '').toUpperCase()
      return type === 2 || value === '2' || ['PICKUP', 'SELF_FETCH', 'SELF_PICKUP', 'SELFFETCH', 'STORE_PICKUP'].includes(value)
    },
    isExpressDeliveryType(type) {
      const value = String(type || '').toUpperCase()
      return type === 1 || value === '1' || ['EXPRESS', 'DELIVERY', 'LOGISTICS', 'SHIP'].includes(value)
    },
    openMapLocation({ latitude, longitude, name, address }) {
      const lat = Number(latitude)
      const lng = Number(longitude)
      if (Number.isNaN(lat) || Number.isNaN(lng) || !lat || !lng) {
        uni.showToast({ title: '暂无可定位坐标', icon: 'none' })
        return
      }
      uni.openLocation({
        latitude: lat,
        longitude: lng,
        name: name || address || '订单地址',
        address: address || name || '',
        scale: 16
      })
    },
    onAddressExpress() {
      const receiver = this.orderDetail.receiverInfo || this.orderDetail.receiver_info || {}
      this.openMapLocation({
        latitude: this.pickValue(this.orderDetail, ['receiver_latitude', 'receiverLatitude', 'latitude', 'lat', 'mapLat', 'map_lat', 'addressLat', 'address_lat']) || this.pickValue(receiver, ['receiverLatitude', 'receiver_latitude', 'latitude', 'lat', 'mapLat', 'map_lat', 'addressLat', 'address_lat']),
        longitude: this.pickValue(this.orderDetail, ['receiver_longitude', 'receiverLongitude', 'longitude', 'lng', 'lon', 'mapLng', 'map_lng', 'addressLng', 'address_lng']) || this.pickValue(receiver, ['receiverLongitude', 'receiver_longitude', 'longitude', 'lng', 'lon', 'mapLng', 'map_lng', 'addressLng', 'address_lng']),
        name: this.orderDetail.consignee || '收货地址',
        address: this.orderDetail.delivery_address
      })
    },
    onAddressSelfFetch() {
      this.openMapLocation({
        latitude: this.pickValue(this.selfFetchShop, ['latitude', 'lat', 'shopLatitude', 'shop_latitude', 'mapLat', 'map_lat', 'pickupLatitude', 'pickup_latitude']),
        longitude: this.pickValue(this.selfFetchShop, ['longitude', 'lng', 'lon', 'shopLongitude', 'shop_longitude', 'mapLng', 'map_lng', 'pickupLongitude', 'pickup_longitude']),
        name: this.selfFetchShopName,
        address: this.selfFetchShopAddress
      })
    },
    formatPayStatus(status) {
      const map = { UNPAID: '未支付', WAIT_PAY: '未支付', PAID: '已支付', SUCCESS: '已支付', REFUNDED: '已退款', REFUND: '已退款', CLOSED: '已关闭', CANCELLED: '已关闭', CANCELED: '已关闭', 0: '未支付', 1: '已支付' };
      return map[String(status).toUpperCase()] || map[status] || cleanBackendText(status, '');
    },
    formatPayWay(value) {
      if (value === undefined || value === null || value === '') return '待确认';
      const raw = String(value).trim();
      if (!raw) return '待确认';
      const normalized = raw.toUpperCase();
      const map = {
        WECHAT_JSAPI: '微信支付',
        WECHAT: '微信支付',
        WXPAY: '微信支付',
        WX_PAY: '微信支付',
        ALIPAY: '支付宝',
        ALI_PAY: '支付宝',
        BALANCE: '余额支付',
        USER_MONEY: '余额支付',
        OFFLINE: '线下支付',
        CASH: '线下支付',
        BANK: '银行卡支付',
        BANK_CARD: '银行卡支付',
        1: '微信支付',
        2: '支付宝',
        3: '余额支付',
        4: '线下支付'
      };
      return map[normalized] || cleanBackendText(raw, raw);
    },
    isWechatPayWay(value) {
      return value === 1 || value === '1' || value === 'WECHAT_JSAPI' || value === 'wechat' || value === 'wxpay';
    },
    formatOrderStatusText(status) {
      const text = String(status || '')
      if (/^submit-/i.test(text)) return '待提交'
      const normalized = text.toUpperCase()
      const isSelfFetch = this.isSelfFetchOrder
      if (isSelfFetch && ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY', '1'].includes(normalized)) return '待核销'
      const map = { CREATED: '待支付', WAIT_PAY: '待支付', PENDING_PAY: '待支付', UNPAID: '待支付', SUBMITTED: '待提交', SUBMIT: '待提交', PAID: '已支付', WAIT_SHIP: '待发货', WAIT_DELIVERY: '待发货', SHIPPED: '待收货', WAIT_RECEIVE: '待收货', DELIVERED: '已送达', COMPLETED: '已完成', SUCCESS: '已完成', FINISHED: '已完成', REFUNDING: '售后中', REFUNDED: '已退款', CANCELLED: '已取消', CANCELED: '已取消', CLOSED: '已关闭', CLOSE: '已关闭', CLOSED_ORDER: '已关闭', 0: '待支付', 1: '已支付', 2: '待发货', 3: '待收货', 4: '已完成' };
      const mapped = map[normalized] || map[status];
      return mapped || (isBackendCodeText(text) ? '未知状态' : cleanBackendText(status, ''));
    },
    formatRefundStatusText(status) {
      const cleaned = cleanBackendText(status, '')
      if (!cleaned) return ''
      const text = String(status || '')
      const map = {
        APPLIED: '待商家处理',
        PENDING: '待商家处理',
        PENDING_REVIEW: '待商家处理',
        WAIT_AUDIT: '待商家处理',
        PROCESSING: '处理中',
        REFUNDING: '退款中',
        APPROVED: '商家已同意',
        RETURNING: '待买家退货',
        REJECTED: '商家已拒绝',
        CANCELLED: '已撤销',
        CANCELED: '已撤销',
        REFUNDED: '退款成功',
        SUCCESS: '退款成功',
        FAILED: '退款失败',
        0: '待商家处理',
        1: '处理中',
        2: '商家已同意',
        3: '商家已同意',
        4: '商家已拒绝',
        5: '退款成功',
        6: '已撤销'
      }
      return map[text.toUpperCase()] || map[status] || (isBackendCodeText(text) ? '售后处理中' : cleaned)
    },
    formatRefundTypeText(type) {
      const text = String(type || '')
      const map = {
        ONLY_REFUND: '仅退款',
        REFUND_ONLY: '仅退款',
        REFUND: '仅退款',
        RETURN_REFUND: '退货退款',
        RETURN_AND_REFUND: '退货退款',
        REFUND_RETURN: '退货退款',
        RETURN: '退货退款',
        0: '仅退款',
        1: '退货退款'
      }
      return map[text.toUpperCase()] || map[type] || (text.includes('RETURN') ? '退货退款' : cleanBackendText(text, ''))
    },
    formatRefundReasonText(reason) {
      const text = String(reason || '')
      const map = {
        QUALITY_PROBLEM: '商品质量问题',
        WRONG_GOODS: '商品错发/漏发',
        NOT_RECEIVED: '未收到货',
        NO_REASON: '七天无理由',
        DO_NOT_WANT: '拍错/多拍/不想要',
        NOT_AS_DESCRIBED: '商品与描述不符',
        DELAY_SHIPMENT: '未按约定时间发货',
        OTHER: '其他'
      }
      return text.split(/[,，、]/).map(item => map[item.toUpperCase()] || item).join('、')
    },
    hasMeaningfulObject(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false
      return Object.keys(value).some((key) => {
        const item = value[key]
        if (item === undefined || item === null || item === '') return false
        if (typeof item === 'object') return this.hasMeaningfulObject(item)
        return true
      })
    },
    parseBoolean(value, fallback = false) {
      if (value === undefined || value === null || value === '') return fallback
      if (value === true || value === 1 || value === '1') return true
      if (value === false || value === 0 || value === '0') return false
      const text = String(value).trim().toUpperCase()
      if (['TRUE', 'YES', 'Y', 'ENABLE', 'ENABLED'].includes(text)) return true
      if (['FALSE', 'NO', 'N', 'DISABLE', 'DISABLED'].includes(text)) return false
      return Boolean(value)
    },
    hasAfterSalePayload(value = {}) {
      if (!value || typeof value !== 'object') return false
      return Boolean(this.pickValue(value, [
        'after_sale_id',
        'afterSaleId',
        'afterSaleNo',
        'after_sale_no',
        'refundNo',
        'refund_no',
        'refundId',
        'refund_id',
        'after_status',
        'afterSaleStatus',
        'after_sale_status',
        'status',
        'statusText',
        'status_text',
        'refundStatus',
        'refund_status',
        'refundStatusText',
        'refund_status_text',
        'desc'
      ]))
    },
    hasAfterSale(item = {}) {
      const afterSale = item.after_sale || item.afterSale || {}
      const refundInfo = item.refund_info || item.refundInfo || {}
      return Boolean(
        item.after_sale_id ||
        item.afterSaleId ||
        item.refundNo ||
        item.refund_no ||
        item.refundId ||
        item.refund_id ||
        this.afterStatusText(item) ||
        this.hasAfterSalePayload(afterSale) ||
        this.hasAfterSalePayload(refundInfo)
      )
    },
    afterStatusText(item = {}) {
      return this.formatRefundStatusText(this.pickValue(item, ['after_status_desc', 'afterStatusDesc', 'after_status', 'afterSaleStatus', 'after_sale_status', 'refundStatusText', 'refund_status_text', 'refundStatus', 'refund_status', 'status_text']) || this.pickValue(item.after_sale || item.afterSale || {}, ['desc', 'statusText', 'status_text', 'refundStatusText', 'refund_status_text', 'refundStatus', 'refund_status', 'afterSaleStatus', 'after_sale_status', 'status']) || this.pickValue(item.refund_info || item.refundInfo || {}, ['statusText', 'status_text', 'refundStatusText', 'refund_status_text', 'refundStatus', 'refund_status', 'afterSaleStatus', 'after_sale_status', 'status']))
    },
    canRefundByOrderStatus() {
      const status = this.orderDetail.order_status
      const value = String(status || '').toUpperCase()
      return status === 1 || value === '1' || ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY'].includes(value)
    },
    orderAllowsRefund() {
      const flag = this.pickValue(this.orderDetail, ['refund_btn', 'refundBtn', 'canRefund', 'can_refund', 'refundable'])
      if (flag !== '') return this.parseBoolean(flag)
      return this.canRefundByOrderStatus()
    },
    canApplyRefund(item = {}) {
      const flag = this.pickValue(item, ['refund_btn', 'refundBtn', 'canRefund', 'can_refund', 'refundable', 'order_can_refund'])
      const itemAllowsRefund = flag === '' ? this.orderAllowsRefund() : this.parseBoolean(flag)
      return itemAllowsRefund && !this.hasAfterSale(item) && Boolean(this.refundOrderId(item) && this.refundItemId(item))
    },
    refundOrderId(item = {}) {
      return this.pickValue(item, ['order_id', 'orderId', 'orderNo', 'order_sn']) || this.pickValue(this.orderDetail, ['id', 'order_id', 'orderId', 'orderNo', 'order_sn'])
    },
    refundItemId(item = {}) {
      return this.pickValue(item, ['item_id', 'itemId', 'order_item_id', 'orderItemId', 'id', 'sku_id', 'skuId'])
    },
    refundUrl(item = {}) {
      return `/bundle_order/pages/apply_refund/apply_refund?order_id=${encodeURIComponent(this.refundOrderId(item))}&item_id=${encodeURIComponent(this.refundItemId(item))}`
    },
  },
  computed: {
    isSelfFetchOrder() {
      return this.isSelfFetchDeliveryType(this.orderDetail.delivery_type || this.orderDetail.deliveryType)
    },
    isExpressOrder() {
      if (this.isSelfFetchOrder) return false
      return this.isExpressDeliveryType(this.orderDetail.delivery_type || this.orderDetail.deliveryType) || !this.orderDetail.delivery_type
    },
    showDeliveryButton() {
      return Boolean(this.orderDetail.delivery_btn && !this.isSelfFetchOrder)
    },
    showTakeButton() {
      return Boolean(!this.isSelfFetchOrder && (this.orderDetail.take_btn || this.orderDetail.receivable))
    },
    currentOrderStatusText() {
      const status = this.orderDetail.order_status || this.orderDetail.order_status_desc
      const value = String(status || '').toUpperCase()
      if (this.isSelfFetchOrder && ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY', 'SHIPPED', 'WAIT_RECEIVE', 'DELIVERED', '1', '2'].includes(value)) {
        return this.isVerifiedOrder ? '已核销' : '待核销'
      }
      if (this.isSelfFetchOrder && ['COMPLETED', 'SUCCESS', 'FINISHED', '3'].includes(value)) {
        return '已核销'
      }
      return this.formatOrderStatusText(status)
    },
    orderGoodsList() {
      return this.orderDetail.order_goods || this.orderDetail.goods_lists || [];
    },
    orderDialogText() {
      const map = { 0: '确认取消订单吗？', 1: '确认删除订单吗？', 2: '确认收货吗？' };
      return map[this.type] || '确认操作吗？';
    },
    showQRSelffetch() {
      let result = false;

      if (this.orderDetail.order_status) {
        result = true;
      }

      if (this.orderDetail.order_type == 2) {
        this.orderDetail.team_status == 1 ? (result = true) : (result = false);
      }

      return result && !!this.pickupQrValue && !this.isVerifiedOrder;
    },
    isOrderStatus() {
      const statusMap = {
        CREATED: [0, '0', 'CREATED', 'WAIT_PAY'],
        PAID: [1, '1', 'PAID', 'WAIT_SHIP'],
        SHIPPED: [2, '2', 'SHIPPED', 'WAIT_RECEIVE'],
        COMPLETED: [3, '3', 'COMPLETED', 'SUCCESS', 'FINISHED'],
        CANCELLED: [4, '4', 'CANCELLED', 'CANCELED', 'CLOSED', 'CLOSE']
      };
      return (status) => statusMap[status].includes(this.orderDetail.order_status);
    },
    pickupQrValue() {
      const verify = this.orderDetail.verify_info || {};
      const value = this.pickValue(verify, ['pickupCode', 'pickup_code', 'verifyCode', 'verify_code', 'code']) ||
        this.orderDetail.pickup_code ||
        this.orderDetail.pickupCode ||
        this.orderDetail.verify_code ||
        this.orderDetail.verifyCode ||
        '';
      return this.isOrderNoLikePickupCode(value) ? '' : value;
    },
    isVerifiedOrder() {
      const value = this.orderDetail.verification_status ?? this.orderDetail.verificationStatus ?? this.orderDetail.verifyStatus ?? this.orderDetail.verify_status ?? ''
      if (value === true || value === 1 || value === '1') return true
      const status = String(value || '').trim().replace(/[\s-]+/g, '_').toUpperCase()
      return ['VERIFIED', 'USED', 'CONSUMED', 'SUCCESS', 'DONE', 'COMPLETED'].includes(status)
    },
    selfFetchShop() {
      return this.orderDetail.selffetch_shop || this.orderDetail.selffetchShop || this.orderDetail.pickupShop || {}
    },
    selfFetchShopName() {
      return this.pickValue(this.selfFetchShop, ['name', 'shopName', 'shop_name', 'storeName']) || this.orderDetail.shop_name || '门店待确认'
    },
    selfFetchShopAddress() {
      return this.pickValue(this.selfFetchShop, ['shop_address', 'address', 'detailAddress', 'detail_address']) || this.pickValue(this.orderDetail, ['pickupAddress', 'pickup_address']) || '-'
    },
    selfFetchBusinessTime() {
      const time = this.joinText([
        this.pickValue(this.selfFetchShop, ['business_start_time', 'businessStartTime', 'openStartTime']),
        this.pickValue(this.selfFetchShop, ['business_end_time', 'businessEndTime', 'openEndTime'])
      ], ' - ')
      return time || '以门店实际营业时间为准'
    },
    selfFetchContactName() {
      return this.orderDetail.consignee || this.pickValue(this.orderDetail, ['pickupContact', 'pickup_contact', 'receiverName']) || '-'
    },
    selfFetchContactMobile() {
      return this.orderDetail.mobile || this.pickValue(this.orderDetail, ['pickupMobile', 'pickup_mobile', 'receiverMobile']) || '-'
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
      if (!this.isExpressOrder) return [];
      return this.buildRows([
        ['配送方式', this.formatDeliveryType(this.orderDetail.delivery_type)],
        ['收货人', this.orderDetail.consignee],
        ['联系电话', this.orderDetail.mobile],
        ['收货地址', this.orderDetail.delivery_address],
        ['物流公司', this.pickValue(this.orderDetail, ['express_name', 'expressName', 'shipping_name', 'shippingName'])],
        ['物流单号', this.pickValue(this.orderDetail, ['invoice_no', 'trackingNo', 'tracking_no', 'express_no', 'expressNo'])],
        ['发货时间', this.formatDisplayTime(this.orderDetail.shipping_time)]
      ]);
    },
    selfFetchRows() {
      if (!this.isSelfFetchOrder) return [];
      return this.buildRows([
        ['自提门店', this.selfFetchShopName],
        ['自提地址', this.selfFetchShopAddress],
        ['提货人', this.selfFetchContactName],
        ['联系方式', this.selfFetchContactMobile],
        ['营业时间', this.selfFetchBusinessTime],
        ['自提方式', '到店出示核销码'],
        ['门店电话', this.pickValue(this.selfFetchShop, ['mobile', 'phone', 'contactMobile'])]
      ]);
    },
    verifyRows() {
      const verify = this.orderDetail.verify_info || {};
      if (!this.isSelfFetchOrder && !Object.keys(verify).length) return [];
      return this.buildRows([
        ['核销码', this.pickValue(verify, ['pickupCode', 'verifyCode', 'code']) || this.pickupQrValue],
        ['核销状态', this.isVerifiedOrder ? '已核销' : '待核销'],
        ['核销时间', this.formatDisplayTime(this.pickValue(verify, ['verifyTime', 'verify_time', 'verificationTime']))],
        ['核销门店', this.pickValue(verify, ['shopName', 'shop_name', 'storeName'])],
        ['核销员', this.pickValue(verify, ['staffName', 'staff_name', 'operator'])]
      ]);
    },
    refundRows() {
      const refund = this.orderDetail.refund_info || {};
      return this.buildRows([
        ['售后状态', this.formatRefundStatusText(this.pickValue(refund, ['statusText', 'status_text', 'refundStatusText', 'refund_status_text', 'status']))],
        ['售后类型', this.formatRefundTypeText(this.pickValue(refund, ['typeText', 'type_text', 'refundTypeText', 'refund_type_text', 'type']))],
        ['退款金额', this.formatMoney(this.pickValue(refund, ['refundAmount', 'refund_amount', 'amount']))],
        ['申请原因', this.formatRefundReasonText(this.pickValue(refund, ['reason', 'refundReason', 'refund_reason']))],
        ['申请时间', this.formatDisplayTime(this.pickValue(refund, ['createTime', 'create_time', 'applyTime', 'apply_time']))],
        ['处理时间', this.formatDisplayTime(this.pickValue(refund, ['handleTime', 'handle_time', 'auditTime', 'audit_time']))]
      ]);
    },
    statusFlowRows() {
      const list = this.orderDetail.status_flow || this.orderDetail.statusFlow || [];
      if (!Array.isArray(list)) return [];
      return list.map((item) => ({
        title: this.formatOrderStatusText(this.pickValue(item, ['title', 'name', 'statusText', 'status_text', 'status'])) || '订单状态',
        desc: this.formatFlowDesc(this.pickValue(item, ['desc', 'description', 'content', 'remark'])),
        time: this.formatDisplayTime(this.pickValue(item, ['time', 'createTime', 'create_time', 'createdAt']))
      })).filter((item) => item.title || item.desc || item.time);
    },
    formatFlowDesc() {
      return (value) => {
        const text = String(value || '')
        if (/^submit-/i.test(text)) return '订单已提交，等待系统处理'
        return value
      }
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
  background: #fff9f0;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.order-details .header-bg {
  position: absolute;
  top: 0;
  width: 100%;
  height: 276rpx;
  background: linear-gradient(135deg, #a0610d 0%, #d79a43 54%, #b26c10 100%);
  z-index: 0;
}


.order-details .goods .status {
  height: 88rpx;
  padding: 0 26rpx;
  color: #303133;
  font-size: 27rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.order-goods-list {
  padding: 10rpx 0;
}

.order-goods-item {
  padding: 26rpx 26rpx;
}

.order-goods-item + .order-goods-item {
  border-top: 1rpx solid #f0f2f5;
}

.order-goods-main {
  display: flex;
  align-items: flex-start;
}

.order-goods-image {
  flex: none;
  background: #fff8ed;
}

.order-goods-info {
  flex: 1;
  min-width: 0;
  margin-left: 22rpx;
}

.order-goods-name {
  color: #172033;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
}

.team-tag {
  display: inline-flex;
  align-items: center;
  height: 32rpx;
  margin-right: 10rpx;
  padding: 0 10rpx;
  color: #a0610d;
  font-size: 20rpx;
  line-height: 32rpx;
  border: 1rpx solid rgba(160, 97, 13, .28);
  border-radius: 999rpx;
  background: #fff1dc;
}

.order-goods-spec {
  margin-top: 12rpx;
  color: #8b9098;
  font-size: 24rpx;
  line-height: 34rpx;
}

.order-goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
}

.order-goods-price {
  color: #a0610d;
}

.order-goods-price__pending {
  color: #8b95a5;
  font-size: 24rpx;
  font-weight: 500;
}

.order-goods-num {
  color: #909399;
  font-size: 24rpx;
}

.order-goods-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 64rpx;
  padding-top: 18rpx;
}

.after-status {
  display: inline-flex;
  align-items: center;
  min-height: 44rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #fff7e8;
  color: #f1790e;
  font-size: 24rpx;
  line-height: 44rpx;
}

.goods-action-btn {
  height: 56rpx;
  margin-left: 16rpx;
  padding: 0 24rpx;
  color: #1f2937;
  font-size: 24rpx;
  line-height: 52rpx;
  border: 1rpx solid #d8dee8;
  border-radius: 999rpx;
  background: #ffffff;
}

.goods-action-btn::after {
  border: 0;
}

.order-details .main {
  position: relative;
  z-index: 1;
  padding-top: 10rpx;
}

.order-details .contain {
  margin: 0 24rpx 24rpx;
  border-radius: 22rpx;
  background-color: #fff;
  box-shadow: 0 10rpx 28rpx rgba(24, 44, 84, .06);
  overflow: hidden;
}

.order-details .header {
  min-height: auto;
  margin: 0 24rpx 18rpx;
  padding: 28rpx 32rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, .14);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, .24);
  box-sizing: border-box;
}

.order-details .header--paying {
  margin-bottom: 14rpx;
  padding: 22rpx 28rpx 20rpx;
}

.order-details .header--paying .item {
  min-height: 0;
}

.order-details .header--paying .lg {
  margin-bottom: 6rpx;
  font-size: 34rpx;
  line-height: 44rpx;
}

.order-details .header--paying .sm {
  align-items: center;
  line-height: 32rpx !important;
}

.order-details .header .lg {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.order-details .header .sm {
  font-size: 24rpx;
  line-height: 34rpx;
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
  padding: 24rpx 28rpx 14rpx;
  color: #202124;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 42rpx;
}

.order-details .order-info .item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  min-height: 56rpx;
  padding: 16rpx 28rpx;
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
  text-align: right;
  word-break: break-all;
}

.flow-item {
  position: relative;
  display: flex;
  margin: 8rpx 20rpx 14rpx;
  padding: 18rpx 20rpx;
  background: #fff8ed;
  border-radius: 18rpx;
}

.flow-dot {
  flex: none;
  width: 18rpx;
  height: 18rpx;
  margin-top: 10rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #a0610d 0%, #d79a43 100%);
  box-shadow: 0 0 0 8rpx rgba(22, 119, 255, .1);
}

.flow-content {
  flex: 1;
  min-width: 0;
}

.flow-title {
  color: #202124;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.flow-desc,
.flow-time {
  margin-top: 6rpx;
  color: #8b9098;
  font-size: 24rpx;
  line-height: 34rpx;
}

.flow-desc {
  color: #606a78;
}

.order-details .price > .row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  min-height: 58rpx;
  padding: 0 28rpx;
  color: #606266;
  font-size: 26rpx;
}

.order-details .price {
  padding: 26rpx 0 24rpx;
}

.price-title {
  padding: 0 28rpx 14rpx;
  color: #172033;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.order-details .price .price-pay-row {
  min-height: 98rpx;
  margin: 18rpx 22rpx 0;
  padding: 0 24rpx;
  color: #202124;
  background: linear-gradient(135deg, #fff8f4 0%, #fff1f1 100%);
  border: 1rpx solid #ffe1dc;
  border-radius: 20rpx;
  box-sizing: border-box;
}

.price-pay-label {
  color: #6b7280;
  font-size: 28rpx;
  font-weight: 600;
}

.price-pay-amount {
  color: #a0610d;
  font-weight: 800;
}

.price-pay-pending {
  color: #8b95a5;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 42rpx;
}

.order-status-text {
  color: #a0610d;
  font-weight: 600;
}

.order-details .footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  min-height: 116rpx;
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
  background: linear-gradient(90deg, #d79a43 0%, #a0610d 100%);
  box-shadow: 0 10rpx 24rpx rgba(255, 65, 55, .22);
  border: 0;
}

.tips-dialog {
  height: 230rpx;
  width: 100%;
}

.order-details .invite-btn {
  background: linear-gradient(270deg, #a0610d 0%, #d79a43 100%);
  margin: 30rpx 26rpx 40rpx;
}

.receive {
  position: relative;
  padding: 26rpx 0 30rpx;
}

.delivery--die {
  position: absolute;
  top: 22rpx;
  right: 28rpx;
  z-index: 3;
  width: 132rpx;
  height: 96rpx;
  opacity: .9;
}

.delivery--die__image {
  width: 132rpx;
  height: 96rpx;
  display: block;
}

.receive-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 390rpx;
}

.receive-qr__title {
  color: #172033;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.receive-qr__desc {
  margin-top: 8rpx;
  color: #7a8594;
  font-size: 23rpx;
  line-height: 32rpx;
}

.qr-contain {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 268rpx;
  height: 268rpx;
  margin-top: 22rpx;
  padding: 16rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 26rpx rgba(18, 24, 38, .06);
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
  margin-top: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 120rpx;
  color: #172033;
  background-color: #f2f6fb;
  font-size: 24rpx;
  line-height: 34rpx;
}

.receive-done {
  padding: 48rpx 30rpx;
  text-align: center;
}

.receive-done__title {
  color: #10a66a;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 44rpx;
}

.receive-done__desc {
  margin-top: 10rpx;
  color: #7a8594;
  font-size: 24rpx;
  line-height: 34rpx;
}
</style>
