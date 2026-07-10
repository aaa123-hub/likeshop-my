// +---------------------------------------------------------------------- // |
likeshop开源商城系统 //
+---------------------------------------------------------------------- // |
欢迎阅读学习系统程序代码，建议反馈是我们前进的动力 // |
gitee下载：https://gitee.com/likeshop_gitee // |
github下载：https://github.com/likeshop-github // |
访问官网：https://www.likeshop.cn // | 访问社区：https://home.likeshop.cn // |
访问手册：http://doc.likeshop.cn // | 微信公众号：likeshop技术社区 // |
likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识
// |
likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识
// | 禁止对系统程序代码以任何目的，任何形式的再发布 // |
likeshop团队版权所有并拥有最终解释权 //
+---------------------------------------------------------------------- // |
author: likeshop.cn.team //
+----------------------------------------------------------------------

<template>
  <view>
    <view class="order-list">
      <navigator
        v-for="(item, index) in orderList"
        :key="index"
        hover-class="none"
        class="order-item"
        :url="'/bundle/pages/order_details/order_details?id=' + item.id"
      >
        <view class="order-header row-between">
          <view class="order-sn row">
            <view v-if="isSelfFetchOrder(item)" class="mr10">
              <u-tag
                text="自提"
                size="mini"
                type="primary"
                mode="dark"
                bg-color="#0cc21e"
              />
            </view>
            <view v-if="item.order_type == 1" class="mr10">
              <u-tag text="秒杀" size="mini" type="primary" mode="plain" />
            </view>
            <view v-if="item.order_type == 2" class="mr10">
              <u-tag text="拼团" size="mini" type="primary" mode="plain" />
            </view>
            <view v-if="item.order_type == 3" class="mr10">
              <u-tag text="砍价" size="mini" type="primary" mode="plain" />
            </view>
            <text class="line1">订单编号：{{ item.order_sn || item.id }}</text>
          </view>
          <view class="order-header__right">
            <view v-if="isAfterSaleOrder(item)" class="order-after-tag">{{ afterSaleStatusText(item) || '售后中' }}</view>
            <view v-else-if="showAfterSaleGoodsTag(item)" class="order-after-tag">含售后中商品</view>
            <view :class="['order-status', orderStatusClass(item)]">{{ formatOrderStatusText(item) }}</view>
          </view>
        </view>
        <view class="order-meta" v-if="orderMetaRows(item).length">
          <view v-for="row in orderMetaRows(item)" :key="row.label" class="order-meta__item">
            <text class="order-meta__label">{{ row.label }}</text>
            <text class="order-meta__value">{{ row.value }}</text>
          </view>
        </view>
        <view class="pickup-summary" v-if="isSelfFetchOrder(item)">
          <view class="pickup-summary__row">
            <text class="pickup-summary__label">自提门店</text>
            <text class="pickup-summary__value line1">{{ selfFetchShopName(item) }}</text>
          </view>
          <view class="pickup-summary__row" v-if="selfFetchShopAddress(item)">
            <text class="pickup-summary__label">自提地址</text>
            <text class="pickup-summary__value">{{ selfFetchShopAddress(item) }}</text>
          </view>
          <view class="pickup-summary__row">
            <text class="pickup-summary__label">提货信息</text>
            <text class="pickup-summary__value line1">{{ selfFetchContactText(item) }}</text>
          </view>
          <view class="pickup-summary__row" v-if="pickupCode(item)">
            <text class="pickup-summary__label">提货码</text>
            <text class="pickup-summary__value pickup-summary__code">{{ pickupCode(item) }}</text>
          </view>
        </view>
        <view class="order-con">
          <order-goods
            :list="item.order_goods"
            :order_type="item.order_type"
            :link="true"
            :show-comment="false"
          ></order-goods>
          <view v-if="goodsCountText(item) || hasOrderAmount(item)" class="all-price row-end">
            <text v-if="goodsCountText(item)" class="muted xs">{{ goodsCountText(item) }}</text>
            <text v-if="goodsCountText(item) && hasOrderAmount(item)" class="muted xs">，</text>
            <text v-if="hasOrderAmount(item)" class="muted xs">{{ orderAmountLabel(item) }}：</text>
            <price-format
              v-if="hasOrderAmount(item)"
              :subscript-size="30"
              :first-size="30"
              :second-size="30"
              :price="orderAmount(item)"
            ></price-format>
          </view>
          <view v-if="amountDetailRows(item).length" class="amount-detail">
            <view v-for="row in amountDetailRows(item)" :key="row.label" class="amount-detail__row">
              <text class="amount-detail__label">{{ row.label }}</text>
              <text :class="['amount-detail__value', row.type === 'deduct' ? 'amount-detail__value--deduct' : '']">{{ row.value }}</text>
            </view>
          </view>
        </view>
        <view
          class="order-footer row"
          v-if="
            (!isAfterSaleOrder(item) && (
              item.pickup_btn ||
              canCancelOrder(item) ||
              showDeliveryButton(item) ||
              showTakeButton(item) ||
              item.del_btn ||
              canPayOrder(item) ||
              item.comment_btn
            ))
          "
        >
          <view style="flex: 1">
            <view
              class="primary sm row"
              style="line-height: 26rpx"
              v-if="!isLocallyPaidOrder(item) && !isClosedOrder(item) && getCancelTime(item.order_cancel_time) > 0"
              ><u-count-down
                separator="zh"
                :timestamp="getCancelTime(item.order_cancel_time)"
                separator-color="#FF2C3C"
                color="#FF2C3C"
                :separator-size="26"
                :font-size="26"
                bg-color="transparent"
                @end="reflesh"
              ></u-count-down>
            </view>
          </view>
          <view v-if="canCancelOrder(item)">
            <button
              size="sm"
              class="plain br60 lighter"
              hover-class="none"
              @tap.stop="cancelOrder(item.id)"
            >
              取消订单
            </button>
          </view>
          <view
            v-if="showDeliveryButton(item)"
            @tap.stop="
              goPage(
                '/bundle_order/pages/goods_logistics/goods_logistics?id=' + item.id
              )
            "
          >
            <button size="sm" class="btn plain br60 lighter" hover-class="none">
              查看物流
            </button>
          </view>
          <view v-if="item.del_btn">
            <button
              size="sm"
              class="btn plain br60 lighter"
              hover-class="none"
              @tap.stop="delOrder(item.id)"
            >
              删除订单
            </button>
          </view>
          <view v-if="canPayOrder(item)" class="ml20">
            <button
              size="sm"
              class="btn bg-primary br60 white"
              @tap.stop="payNow(item.id)"
            >
              立即付款
            </button>
          </view>
          <view v-if="item.comment_btn" class="ml20">
            <button
              size="sm"
              hover-class="none"
              class="btn plain btn br60 primary red"
              @tap.stop="goCommentPage(item)"
            >
              评价晒图
            </button>
          </view>
          <view v-if="item.pickup_btn" class="ml20">
            <button
              size="sm"
              hover-class="none"
              class="btn plain btn br60 primary red"
            >
              查看提货码
            </button>
          </view>
          <view v-if="showTakeButton(item)" class="ml20">
            <button
              size="sm"
              class="btn plain br60 primary red"
              hover-class="none"
              @tap.stop="comfirmOrder(item.id, orderPayWay(item))"
            >
              确认收货
            </button>
          </view>
        </view>
      </navigator>
      <view v-if="showPlaceholder" class="order-placeholder column-center">
        <text class="lighter">{{ placeholderText }}</text>
      </view>
      <loading-footer v-else :status="footerStatus" :slot-empty="true" @refresh="reload">
        <view slot="empty" class="column-center order-placeholder">
          <text class="lighter">暂无订单</text>
        </view>
      </loading-footer>
    </view>
    <order-dialog
      ref="orderDialog"
      :order-id="orderId"
      :type="type"
      @refresh="handleOrderDialogRefresh"
    ></order-dialog>
    <loading-view
      v-if="showLoading"
      background-color="transparent"
      :size="50"
    ></loading-view>
  </view>
</template>

<script>
import {
  getOrderList,
  cancelOrder,
  delOrder,
  confirmOrder,
  getwxReceiveDetail,
  getwechatSyncCheck,
} from "@/api/order";
import { compareWeChatVersion } from "@/utils/tools";

import { prepay } from "@/api/app";
import { loadingType } from "@/utils/type";

import { wxpay, alipay } from "@/utils/pay";
import { loadingFun } from "@/utils/tools";
import UTag from '@/bundle_order/components/uview-ui/components/u-tag/u-tag.vue'
import UCountDown from '@/bundle_order/components/uview-ui/components/u-count-down/u-count-down.vue'
import PriceFormat from '@/bundle_order/components/price-format/price-format.vue'
import OrderGoods from '@/bundle_order/components/order-goods/order-goods.vue'
import LoadingFooter from '@/components/loading-footer/loading-footer.vue'
import LoadingView from '@/components/loading-view/loading-view.vue'
import OrderDialog from '@/bundle_order/components/order-dialog/order-dialog.vue'
import { cleanBackendText, cleanEmptyBackendText, isBackendCodeText } from '@/utils/backend-text'
export default {
  data() {
    return {
      page: 1,
      orderList: [],
      status: loadingType.LOADING,
      isFetching: false,
      showCancel: false,
      type: 0,
      orderId: "",
      deletedOrderIds: [],
      paidOrderIds: [],
      showLoading: false,
      pay_way: "",
    };
  },

  components: {
			PriceFormat,
			UTag,
			UCountDown,
			OrderGoods,
			LoadingFooter,
			LoadingView,
			OrderDialog
		},
  props: {
    orderType: {
      type: String,
    },
  },
  created: function () {
    this.loadPaidOrderIds();
    uni.$on("refreshorder", () => {
      this.reflesh();
    });
    uni.$on("payment", (params) => {
      if (params.result) {
        this.rememberPaidOrder(params);
        this.reflesh();
        setTimeout(() => this.$toast({ title: "支付成功" }), 0.5 * 1000);
      }
    });
  },
  beforeMount: function () {
    this.getOrderListFun();
  },
  destroyed: function () {
    uni.$off(["payment", "refreshorder"]);
  },
  methods: {
    reflesh() {
      this.page = 1;
      this.orderList = [];
      this.status = loadingType.LOADING;
      this.type = 0;
      return this.getOrderListFun();
    },

    handleOrderDialogRefresh(payload = {}) {
      if (payload.type === 1) {
        const matched = this.orderList.find((item) => this.orderIdentityList(item).includes(String(payload.orderId || ''))) || {}
        const deletedIds = this.orderIdentityList({ ...matched, id: payload.orderId }).filter(Boolean);
        deletedIds.forEach((deletedId) => {
          if (!this.deletedOrderIds.includes(deletedId)) this.deletedOrderIds.push(deletedId);
        })
        this.rememberDeletedOrder(deletedIds)
        this.orderList = this.orderList.filter((item) => !this.orderIdentityList(item).some((id) => deletedIds.includes(id)));
        uni.$emit('orderDeleted', {
          orderId: payload.orderId,
          orderNo: matched.orderNo || matched.order_no || matched.order_sn || payload.orderId,
          order_sn: matched.order_sn,
          bizOrderNo: matched.bizOrderNo || matched.biz_order_no,
          subOrderNo: matched.subOrderNo || matched.sub_order_no
        })
      }
      return this.reflesh();
    },

    reload() {
      this.status = loadingType.LOADING;
      return this.getOrderListFun();
    },

    orderDialog() {
      this.$refs.orderDialog.open();
    },

    delOrder(id) {
      this.orderId = id;
      this.type = 1;
      this.$nextTick(() => {
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
        item.sub_order_no,
        item.payOrderNo,
        item.pay_order_no
      ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
    },
    rememberDeletedOrder(id) {
      const ids = uni.getStorageSync('ORDER_DELETED_IDS') || []
      const values = Array.isArray(id) ? id : [id]
      values.map((value) => String(value || '')).filter(Boolean).forEach((text) => {
        if (!ids.includes(text)) ids.push(text)
      })
      uni.setStorageSync('ORDER_DELETED_IDS', ids.slice(-200))
    },
    loadPaidOrderIds() {
      const ids = uni.getStorageSync('ORDER_PAID_IDS') || []
      this.paidOrderIds = Array.isArray(ids) ? ids.map((id) => String(id || '')).filter(Boolean) : []
    },
    rememberPaidOrder(payload = {}) {
      const ids = (uni.getStorageSync('ORDER_PAID_IDS') || []).map((id) => String(id || '')).filter(Boolean)
      this.orderIdentityList({
        id: payload.order_id || payload.orderId || payload.id,
        orderNo: payload.orderNo || payload.order_no,
        order_sn: payload.order_sn,
        payOrderNo: payload.payOrderNo || payload.pay_order_no
      }).forEach((id) => {
        if (!ids.includes(id)) ids.push(id)
      })
      const nextIds = ids.slice(-200)
      uni.setStorageSync('ORDER_PAID_IDS', nextIds)
      this.paidOrderIds = nextIds
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
    comfirmOrder(id, pay_way) {
      this.orderId = id;
      this.pay_way = pay_way;
      this.type = 2;
      this.$nextTick(async () => {
        // #ifdef MP-WEIXIN
        let res = {};
        if (this.isWechatPayWay(this.pay_way)) {
          res = await getwechatSyncCheck({ id: this.orderId });
        }
        if (
          compareWeChatVersion("2.6.0") === 1 &&
          wx.openBusinessView &&
          this.isWechatPayWay(this.pay_way) &&
          res.data &&
          res.data.order &&
          res.data.order.order_state !== 1
        ) {
          try {
            const { data } = await getwxReceiveDetail({
              order_id: this.orderId,
            });
            await this.comfirmReceive(data.transaction_id);
            await this.querycomfirmReceive(this.orderId);
            await confirmOrder(this.orderId);
          } catch (error) {
            this.orderDialog();
            return;
          }
          this.reflesh();
        } else {
          this.orderDialog();
        }
        // #endif

        // #ifndef MP-WEIXIN
        this.orderDialog();
        // #endif
      });
    },

    cancelOrder(id) {
      this.orderId = id;
      this.type = 0;
      this.$nextTick(() => {
        this.orderDialog();
      });
    },

    payNow(id) {
      // this.showLoading = true

      uni.navigateTo({
        url: `/bundle/pages/payment/payment?from=${"order"}&order_id=${id}`,
      });

      // prepay({
      // 	from: 'order',
      // 	order_id: id
      // }).then(res => {
      // 	let args = res.data;
      // 	this.showLoading = false
      // 	if (res.code == 1) {
      // 		wxpay(args).then((resPay) => {
      // 			if(resPay == 'success') {
      // 				this.$toast({
      // 					title: "支付成功"
      // 				})
      // 				uni.$emit("refreshorder")
      // 			}
      // 		})
      // 	}else if(res.code == 20001){
      // 		alipay(args).then((resPay) => {
      // 			if(resPay == 'success') {
      // 				this.$toast({
      // 					title: "支付成功"
      // 				})
      // 				uni.$emit("refreshorder")
      // 			}
      // 		})
      // 	}
      // });
    },
    async getOrderListFun() {
      if (this.isFetching) return;
      let { page, orderType, orderList, status } = this;
      const showInitialLoading = page === 1 && !orderList.length;
      this.isFetching = true;
      if (showInitialLoading) this.showLoading = true;
      try {
        let data = null;
        let loadCount = 0;
        do {
          data = await loadingFun(getOrderList, page, orderList, status, {
            type: this.requestOrderType(orderType),
          });
          if (!data) {
            if (!this.orderList.length && this.status === loadingType.LOADING) {
              this.status = loadingType.FINISHED;
            }
            return;
          }
          page = data.page;
          status = data.status;
          orderList = data.dataList
            .filter((item) => {
              const ids = (uni.getStorageSync('ORDER_DELETED_IDS') || []).concat(this.deletedOrderIds)
              return !this.orderIdentityList(item).some((id) => ids.includes(id))
            })
            .filter((item) => this.shouldShowOrder(item));
          loadCount += 1;
        } while (this.shouldAutoLoadNextPage(orderType, orderList, status, loadCount));

        this.page = page;
        this.orderList = orderList;
        this.status = status;
      } catch (error) {
        console.error('[order-list] getOrderListFun failed:', error);
        this.status = this.orderList.length ? loadingType.FINISHED : loadingType.ERROR;
      } finally {
        this.isFetching = false;
        this.showLoading = false;
      }
    },
    requestOrderType(type) {
      const value = String(type || '');
      return ['ended', 'delivery'].includes(value) ? 'all' : type;
    },
    shouldAutoLoadNextPage(type, list, status, loadCount) {
      return ['delivery', 'ended'].includes(String(type || '')) &&
        !list.length &&
        status === loadingType.LOADING &&
        loadCount < 10;
    },
    goPage(url) {
      uni.navigateTo({
        url,
      });
    },
    goodCount(goodLists) {
      let count = 0;
      ;(goodLists || []).forEach((item) => {
        count += Number(item.goods_num || item.quantity || item.num || 0);
      });
      return count;
    },
    goodsCountText(item) {
      const backendCount = item.goods_num || item.goodsNum || item.total_num || item.totalNum || item.goods_count || item.goodsCount || item.quantity;
      const count = backendCount || this.goodCount(item.order_goods || item.goods_lists);
      return count ? `共${count}件商品` : '';
    },
    hasOrderAmount(item) {
      return this.orderAmount(item) !== undefined && this.orderAmount(item) !== null && this.orderAmount(item) !== '';
    },
    moneyValue(value) {
      const number = Number(value)
      return Number.isNaN(number) ? 0 : number
    },
    firstAmount(...values) {
      return values.find((amount) => amount !== undefined && amount !== null && amount !== '' && !Number.isNaN(Number(amount)))
    },
    formatMoney(value) {
      return this.moneyValue(value).toFixed(2)
    },
    orderAmount(item) {
      return this.firstAmount(
        item.order_amount,
        item.payAmount,
        item.pay_amount,
        item.orderAmount,
        item.actualAmount,
        item.actual_amount,
        item.paidAmount,
        item.paid_amount,
        item.totalAmount,
        item.total_amount,
        item.shopPayAmount,
        item.shop_pay_amount,
        item.merchantPayAmount,
        item.merchant_pay_amount,
        item.storePayAmount,
        item.store_pay_amount,
        item.shop_amount,
        item.shopAmount,
        this.goodsAmountSum(item.order_goods || item.goods_lists)
      );
    },
    orderOriginalAmount(item = {}) {
      return this.firstAmount(
        item.goods_total_amount,
        item.goodsTotalAmount,
        item.goods_amount,
        item.goodsAmount,
        item.total_goods_price,
        item.totalGoodsPrice,
        item.shop_amount,
        item.shopAmount,
        this.goodsAmountSum(item.order_goods || item.goods_lists)
      )
    },
    couponDeductAmount(item = {}) {
      const amountInfo = item.amountInfo || item.amount_info || item.settlementAmount || item.settlement_amount || {}
      const coupon = item.coupon || item.couponInfo || item.coupon_info || {}
      return this.moneyValue(this.firstAmount(
        item.coupon_discount_amount,
        item.couponDiscountAmount,
        item.coupon_amount,
        item.couponAmount,
        item.discount_amount,
        item.discountAmount,
        item.discount_price,
        item.discountPrice,
        amountInfo.coupon_discount_amount,
        amountInfo.couponDiscountAmount,
        amountInfo.coupon_amount,
        amountInfo.couponAmount,
        amountInfo.discount_amount,
        amountInfo.discountAmount,
        coupon.discountAmount,
        coupon.discount_amount,
        coupon.amount,
        0
      ))
    },
    pointsDeductAmount(item = {}) {
      const amountInfo = item.amountInfo || item.amount_info || item.settlementAmount || item.settlement_amount || {}
      const pointsInfo = item.pointsInfo || item.points_info || item.integralInfo || item.integral_info || {}
      return this.moneyValue(this.firstAmount(
        item.pointsDeductAmount,
        item.points_deduct_amount,
        item.integral_amount,
        item.integralAmount,
        item.integralDeductAmount,
        item.integral_deduct_amount,
        amountInfo.pointsDeductAmount,
        amountInfo.points_deduct_amount,
        amountInfo.integral_amount,
        amountInfo.integralAmount,
        pointsInfo.pointsDeductAmount,
        pointsInfo.points_deduct_amount,
        pointsInfo.integral_amount,
        pointsInfo.integralAmount,
        0
      ))
    },
    amountDetailRows(item = {}) {
      const rows = []
      const originalAmount = this.moneyValue(this.orderOriginalAmount(item))
      const payAmount = this.moneyValue(this.orderAmount(item))
      const couponAmount = this.couponDeductAmount(item)
      const pointsAmount = this.pointsDeductAmount(item)
      if (originalAmount > 0 && payAmount > 0 && originalAmount > payAmount) {
        rows.push({ label: '商品合计', value: `¥${this.formatMoney(originalAmount)}` })
      }
      if (couponAmount > 0) rows.push({ label: '优惠券抵扣', value: `-¥${this.formatMoney(couponAmount)}`, type: 'deduct' })
      if (pointsAmount > 0) rows.push({ label: '积分抵扣', value: `-¥${this.formatMoney(pointsAmount)}`, type: 'deduct' })
      return rows
    },
    orderAmountLabel(item = {}) {
      if (this.isPendingPayOrder(item)) return '应付'
      if (this.isPaidOrder(item)) return '实付'
      return '合计'
    },
    goodsAmountSum(list = []) {
      const amount = (list || []).reduce((sum, goods = {}) => {
        const count = Number(goods.goods_num || goods.quantity || goods.num || 1);
        const price = Number(goods.goods_price || goods.goodsPrice || goods.salePrice || goods.unitPrice || goods.price || 0);
        if (!Number.isNaN(count) && !Number.isNaN(price) && price > 0) return sum + count * price;
        const explicitAmount = Number(goods.total_price || goods.totalPrice || goods.totalAmount || goods.realAmount);
        return !Number.isNaN(explicitAmount) && explicitAmount > 0 ? sum + explicitAmount : sum;
      }, 0);
      return amount > 0 ? amount.toFixed(2) : '';
    },
    orderPayWay(item) {
      return item.pay_way || item.payMethod || item.payWay;
    },
    isWechatPayWay(value) {
      return value === 1 || value === '1' || value === 'WECHAT_JSAPI' || value === 'wechat' || value === 'wxpay';
    },
    normalizeStatus(value) {
      return String(value || '').toUpperCase();
    },
    cleanText(value, fallback = '') {
      return cleanBackendText(value, fallback);
    },
    cleanPlainText(value, fallback = '') {
      return cleanEmptyBackendText(value, fallback);
    },
    isClosedOrder(item) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      return item.order_status == 4 || item.close_btn || item.closed_btn || this.isExpiredPendingPayOrder(item) || ['CANCELLED', 'CANCELED', 'CLOSED', 'CLOSE', 'CLOSED_ORDER'].includes(status);
    },
    isAfterSaleOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      if (this.isRefundFinishedOrder(item)) return false;
      return Boolean(
        ['REFUNDING', 'AFTER_SALE', 'AFTER_SALES', 'AFTERSALE', 'REFUND_APPLIED', 'REFUND_PROCESSING'].includes(status) ||
        item.after_sale_id ||
        item.afterSaleId ||
        item.refundNo ||
        item.refund_no ||
        this.afterSaleStatusText(item) ||
        this.hasAfterSaleGoods(item)
      );
    },
    shouldShowOrder(item = {}) {
      const type = String(this.orderType || 'all');
      if (type === 'pay') return !this.isAfterSaleOrder(item) && this.isPendingPayOrder(item);
      if (type === 'ship') return !this.isAfterSaleOrder(item) && this.isWaitShipOrder(item);
      if (type === 'delivery') return !this.isAfterSaleOrder(item) && !this.isEndedOrder(item) && (this.isShippedOrder(item) || this.isPendingSelfFetchOrder(item));
      if (type === 'ended') return this.isEndedOrder(item);
      return true;
    },
    hasShippingSignal(item = {}) {
      return Boolean(
        item.shipping_time ||
        item.shippedAt ||
        item.express_no ||
        item.expressNo ||
        item.tracking_no ||
        item.trackingNo ||
        item.invoice_no ||
        item.invoiceNo
      );
    },
    isShippedText(value) {
      return /(已发货|待收货|待签收|运输中|派送中|已揽收)/.test(String(value || ''));
    },
    isWaitShipOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      const rawText = item.order_status_desc || item.orderStatusDesc || item.statusText || '';
      if (this.isShippedOrder(item) || this.isEndedOrder(item) || this.isClosedOrder(item)) return false;
      if (!this.isSelfFetchOrder(item) && this.isPaidOrder(item) && this.isRawPendingPayOrder(item)) return true;
      return item.order_status == 1 || ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY'].includes(status) || /待发货/.test(String(rawText || ''));
    },
    isShippedOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      const deliveryStatus = this.normalizeStatus(item.delivery_status || item.deliveryStatus);
      const rawText = item.order_status_desc || item.orderStatusDesc || item.statusText || '';
      return Boolean(
        item.order_status == 2 ||
        ['SHIPPED', 'WAIT_RECEIVE', 'DELIVERED', 'IN_TRANSIT', 'RECEIVING'].includes(status) ||
        ['SHIPPED', 'WAIT_RECEIVE', 'DELIVERED', 'IN_TRANSIT', 'RECEIVING', 'SIGNED'].includes(deliveryStatus) ||
        this.isShippedText(rawText) ||
        this.hasShippingSignal(item)
      );
    },
    isPendingSelfFetchOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      return Boolean(
        this.isSelfFetchOrder(item) &&
        !item.verification_status &&
        (this.isPaidOrder(item) && this.isRawPendingPayOrder(item) || item.order_status == 1 || item.order_status == 2 || ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY', 'SHIPPED', 'WAIT_RECEIVE', 'DELIVERED'].includes(status))
      );
    },
    isEndedOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      return Boolean(
        item.order_status == 3 ||
        item.order_status == 4 ||
        ['COMPLETED', 'SUCCESS', 'FINISHED', 'CANCELLED', 'CANCELED', 'CLOSED', 'CLOSE', 'CLOSED_ORDER', 'REFUNDED'].includes(status) ||
        this.isClosedOrder(item)
      );
    },
    isFinishedOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      return Boolean(item.order_status == 3 || ['COMPLETED', 'SUCCESS', 'FINISHED'].includes(status));
    },
    isRefundFinishedOrder(item = {}) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      const rawRefundStatus = item.refundStatus || item.refund_status || item.after_status_desc || item.afterStatusDesc || item.refundStatusText || item.refund_status_text;
      const refundStatus = this.normalizeStatus(rawRefundStatus);
      const refundText = String(rawRefundStatus || '').trim();
      return ['REFUNDED', 'REFUND_SUCCESS'].includes(status) || ['REFUNDED', 'REFUND_SUCCESS', 'SUCCESS'].includes(refundStatus) || ['退款成功', '已退款'].includes(refundText);
    },
    isPendingPayOrder(item) {
      if (this.isPaidOrder(item) || this.isExpiredPendingPayOrder(item)) return false;
      return this.isRawPendingPayOrder(item);
    },
    isRawPendingPayOrder(item) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status || item.pay_status || item.payStatus);
      return item.order_status == 0 || item.pay_status == 0 || ['CREATED', 'WAIT_PAY', 'PENDING_PAY', 'UNPAID', 'NOT_PAID'].includes(status);
    },
    isLocallyPaidOrder(item = {}) {
      return this.orderIdentityList(item).some((id) => this.paidOrderIds.includes(id))
    },
    isBackendPaidOrder(item = {}) {
      const payStatus = this.normalizeStatus(item.pay_status || item.payStatus || item.paymentStatus || item.payment_status)
      const orderStatus = this.normalizeStatus(item.order_status || item.orderStatus || item.status)
      return Boolean(
        item.pay_status == 1 ||
        item.payStatus == 1 ||
        ['PAID', 'PAYED', 'SUCCESS', 'PAID_SUCCESS', 'PAY_SUCCESS'].includes(payStatus) ||
        ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY', 'SHIPPED', 'WAIT_RECEIVE', 'DELIVERED', 'COMPLETED', 'SUCCESS', 'FINISHED'].includes(orderStatus) ||
        item.pay_time ||
        item.payTime ||
        item.paidAt ||
        item.paid_at
      )
    },
    isPaidOrder(item = {}) {
      return this.isBackendPaidOrder(item) || this.isLocallyPaidOrder(item)
    },
    orderExpireTimestamp(item = {}) {
      const value = item.order_cancel_time || item.expireTime || item.expire_time || item.cancel_time || item.cancelTime || item.pay_expire_time || item.payExpireTime
      if (!value) return 0
      if (typeof value === 'string' && /[-/:T]/.test(value)) {
        const time = new Date(value.replace(/-/g, '/')).getTime()
        return Number.isNaN(time) ? 0 : Math.floor(time / 1000)
      }
      const number = Number(value)
      if (Number.isNaN(number) || number <= 0) return 0
      return number > 10000000000 ? Math.floor(number / 1000) : number
    },
    isExpiredPendingPayOrder(item = {}) {
      const expireAt = this.orderExpireTimestamp(item)
      return expireAt > 0 && this.isRawPendingPayOrder(item) && expireAt <= Date.now() / 1000
    },
    canPayOrder(item) {
      if (this.isPaidOrder(item) || this.isExpiredPendingPayOrder(item)) return false;
      return Boolean(item.pay_btn || item.payBtn || item.pay_button || (this.isPendingPayOrder(item) && !this.isClosedOrder(item)));
    },
    canCancelOrder(item) {
      if (this.isPaidOrder(item) || this.isExpiredPendingPayOrder(item)) return false;
      return Boolean(item.cancel_btn || item.cancelBtn || item.cancel_button || (this.isPendingPayOrder(item) && !this.isClosedOrder(item)));
    },
    showDeliveryButton(item) {
      return Boolean(!this.isSelfFetchOrder(item) && (item.delivery_btn || this.isShippedOrder(item) || (this.isFinishedOrder(item) && this.hasShippingSignal(item))))
    },
    showTakeButton(item) {
      return Boolean(!this.isSelfFetchOrder(item) && !this.isEndedOrder(item) && (item.take_btn || this.isReceivableOrder(item)))
    },
    isReceivableOrder(item = {}) {
      if (item.receivable || item.can_confirm_receipt) return true
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      const deliveryStatus = this.normalizeStatus(item.delivery_status || item.deliveryStatus);
      return Boolean(
        item.order_status == 2 ||
        ['WAIT_RECEIVE', 'DELIVERED', 'RECEIVING'].includes(status) ||
        ['WAIT_RECEIVE', 'DELIVERED', 'RECEIVING'].includes(deliveryStatus)
      )
    },
    goCommentPage(item = {}) {
      const goods = (item.order_goods || item.goods_lists || [])[0] || {}
      const id = goods.id || goods.item_id || goods.itemId || goods.order_item_id || goods.orderItemId || item.id || ''
      if (!id) {
        this.$toast({ title: '缺少评价商品信息' })
        return
      }
      this.goPage(`/bundle_order/pages/goods_reviews/goods_reviews?id=${encodeURIComponent(id)}&order_id=${encodeURIComponent(item.id || item.order_sn || '')}`)
    },
    formatOrderStatusText(item) {
      if (this.isRefundFinishedOrder(item)) return '已退款';
      if (this.isAfterSaleOrder(item)) return '售后中';
      if (this.isExpiredPendingPayOrder(item)) return '已关闭';
      if (this.isPaidOrder(item) && this.isRawPendingPayOrder(item)) return this.isSelfFetchOrder(item) ? '待取货' : '待发货';
      const rawText = item.order_status_desc || item.orderStatusDesc || item.statusText || '';
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status || rawText);
      if (this.isSelfFetchOrder(item) && ['PAID', 'WAIT_SHIP', 'WAIT_DELIVERY', 'SHIPPED', 'WAIT_RECEIVE', 'DELIVERED', '1', '2'].includes(status)) {
        return '待取货';
      }
      if (this.isShippedOrder(item) && !this.isEndedOrder(item)) return this.isShippedText(rawText) ? this.cleanText(rawText) : '已发货';
      if (/^submit-/i.test(String(rawText || status))) return '订单已提交';
      const map = {
        CREATED: '待付款',
        WAIT_PAY: '待付款',
        PENDING_PAY: '待付款',
        UNPAID: '待付款',
        SUBMITTED: '订单已提交',
        SUBMIT: '订单已提交',
        PAID: '待发货',
        WAIT_SHIP: '待发货',
        WAIT_DELIVERY: '待发货',
        SHIPPED: '待收货',
        WAIT_RECEIVE: '待收货',
        DELIVERED: '待收货',
        COMPLETED: '已完成',
        SUCCESS: '已完成',
        FINISHED: '已完成',
        REFUNDING: '售后处理中',
        REFUNDED: '已退款',
        CANCELLED: '已关闭',
        CANCELED: '已关闭',
        CLOSED: '已关闭',
        CLOSE: '已关闭',
        CLOSED_ORDER: '已关闭'
      };
      if (map[status]) return map[status];
      if (this.isClosedOrder(item)) return '已关闭';
      return isBackendCodeText(rawText) ? '订单处理中' : (this.cleanText(rawText) || this.getOrderStatus(item.order_status) || '处理中');
    },
    hasAfterSaleGoods(item = {}) {
      return (item.order_goods || item.goods_lists || []).some((goods = {}) => {
        const afterSale = goods.after_sale || goods.afterSale || goods.refund_info || goods.refundInfo || {}
        return Boolean(
          goods.after_sale_id ||
          goods.afterSaleId ||
          goods.refundNo ||
          goods.refund_no ||
          goods.refundId ||
          goods.refund_id ||
          this.cleanText(goods.after_status_desc || goods.afterStatusDesc || goods.refundStatusText || goods.refund_status_text || goods.after_status || goods.afterSaleStatus || goods.after_sale_status) ||
          this.cleanText(afterSale.desc || afterSale.statusText || afterSale.status_text || afterSale.refundStatusText || afterSale.refund_status_text || afterSale.refundStatus || afterSale.refund_status || afterSale.status)
        )
      })
    },
    showAfterSaleGoodsTag(item = {}) {
      if (String(this.orderType || '') === 'ended') return false;
      if (this.isRefundFinishedOrder(item)) return false;
      return this.hasAfterSaleGoods(item);
    },
    afterSaleStatusText(item = {}) {
      const text = this.formatRefundStatusText(item.after_status_desc || item.afterStatusDesc || item.refundStatusText || item.refund_status_text || item.refundStatus || item.refund_status);
      if (text) return text;
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      if (status === 'REFUNDING') return '退款中';
      return '';
    },
    formatRefundStatusText(value) {
      const status = this.normalizeStatus(value);
      const map = {
        APPLIED: '待商家处理',
        APPLY: '待商家处理',
        PENDING: '待商家处理',
        PENDING_REVIEW: '待商家处理',
        PROCESSING: '处理中',
        REFUNDING: '退款中',
        IN_PROGRESS: '处理中',
        APPROVED: '商家已同意',
        RETURNING: '待买家退货',
        WAIT_RETURN: '待买家退货',
        REJECTED: '商家已拒绝',
        REJECT: '商家已拒绝',
        CANCELLED: '已撤销',
        CANCELED: '已撤销',
        REFUNDED: '退款成功',
        REFUND_SUCCESS: '退款成功',
        SUCCESS: '退款成功',
        FAILED: '退款失败'
      };
      return map[status] || this.cleanText(value);
    },
    orderStatusClass(item) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      if (this.isRefundFinishedOrder(item)) return 'is-closed';
      if (this.isAfterSaleOrder(item)) return 'is-after-sale';
      if (this.isClosedOrder(item)) return 'is-closed';
      if (this.isPaidOrder(item) && this.isRawPendingPayOrder(item)) return 'is-active-status';
      if (status === 'CREATED' || item.order_status == 0) return 'is-pay';
      if (status === 'COMPLETED' || status === 'SUCCESS' || item.order_status == 3) return 'is-finished';
      return 'is-active-status';
    },
    formatDisplayTime(value) {
      if (!value) return '';
      const time = Number(value);
      const normalized = typeof value === 'string' ? value.replace(/(\.\d{3})\d+/, '$1') : value;
      const date = Number.isNaN(time) ? new Date(normalized) : new Date(time > 10000000000 ? time : time * 1000);
      if (Number.isNaN(date.getTime())) return String(value);
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
    formatDeliveryType(type) {
      const map = { 1: '快递配送', 2: '门店自提', EXPRESS: '快递配送', DELIVERY: '快递配送', LOGISTICS: '快递配送', PICKUP: '门店自提', SELF_FETCH: '门店自提', SELF_PICKUP: '门店自提', SELFFETCH: '门店自提' };
      return map[type] || this.cleanText(type);
    },
    isSelfFetchOrder(item = {}) {
      const type = item.delivery_type || item.deliveryType
      const value = String(type || '').toUpperCase()
      return type === 2 || value === '2' || ['PICKUP', 'SELF_FETCH', 'SELF_PICKUP', 'SELFFETCH', 'STORE_PICKUP'].includes(value)
    },
    selfFetchShop(item = {}) {
      return item.selffetch_shop || item.selffetchShop || item.pickupShop || {}
    },
    selfFetchShopName(item = {}) {
      const shop = this.selfFetchShop(item)
      return this.cleanPlainText(shop.name || shop.shopName || shop.shop_name || shop.storeName || item.shop_name || item.shopName, '自提门店')
    },
    selfFetchShopAddress(item = {}) {
      const shop = this.selfFetchShop(item)
      return this.cleanPlainText(shop.shop_address || shop.address || shop.detailAddress || shop.detail_address || shop.addressText || item.pickupAddress || item.pickup_address, '')
    },
    selfFetchContactText(item = {}) {
      const name = this.cleanPlainText(item.consignee || item.pickupContact || item.pickup_contact || item.receiverName, '')
      const mobile = this.cleanPlainText(item.mobile || item.pickupMobile || item.pickup_mobile || item.receiverMobile, '')
      return [name, mobile].filter(Boolean).join(' ') || '待补充提货信息'
    },
    pickupCode(item = {}) {
      const value = item.pickup_code || item.pickupCode || item.verifyCode || ''
      return this.isOrderNoLikePickupCode(value, item) ? '' : value
    },
    isOrderNoLikePickupCode(value, item = {}) {
      const text = String(value || '').trim()
      if (!text) return false
      return [
        item.order_sn,
        item.orderNo,
        item.order_no,
        item.id
      ].filter(Boolean).map(String).includes(text)
    },
    formatPayWay(value) {
      const map = { WECHAT_JSAPI: '微信支付', WECHAT: '微信支付', ALIPAY: '支付宝', BALANCE: '余额支付', OFFLINE: '线下支付', 1: '微信支付', 2: '支付宝', 3: '余额支付' };
      return map[value] || this.cleanText(value);
    },
    formatPayStatus(status) {
      const map = { UNPAID: '未支付', PAID: '已支付', REFUNDED: '已退款', CLOSED: '已关闭', 0: '未支付', 1: '已支付' };
      return map[status] || this.cleanText(status);
    },
    orderMetaRows(item) {
      const rows = [
        { label: '订单类型', value: this.cleanText(item.order_type_desc) },
        { label: '商家', value: this.cleanPlainText(item.shop_name || item.shopName) },
        { label: '下单时间', value: this.formatDisplayTime(item.create_time || item.createTime || item.createdAt) },
        { label: '支付时间', value: this.formatDisplayTime(item.pay_time || item.payTime || item.paidAt) },
        { label: this.isSelfFetchOrder(item) ? '取货方式' : '配送方式', value: this.formatDeliveryType(item.delivery_type || item.deliveryType) },
        { label: '支付方式', value: this.formatPayWay(item.pay_way_text || item.payMethod || item.pay_way) },
        { label: '支付状态', value: this.formatPayStatus(item.pay_status || item.payStatus) }
      ]
      if (this.isSelfFetchOrder(item)) {
        rows.push({ label: '核销状态', value: item.verification_status ? '已核销' : '待核销' })
      }
      return rows.filter((row) => this.cleanText(row.value) !== '');
    },
  },
  computed: {
    getOrderStatus() {
      return (status) => {
        let text = "";
        switch (status) {
          case 0:
            text = "待支付";
            break;
          case 1:
            text = "待发货";
            break;
          case 2:
            text = "待收货";
            break;
          case 3:
            text = "已完成";
            break;
          case 4:
            text = "订单已关闭";
            break;
        }
        return text;
      };
    },
    getCancelTime() {
      return (time) => {
        const timestamp = this.orderExpireTimestamp({ order_cancel_time: time })
        return timestamp > 0 ? timestamp - Date.now() / 1000 : 0
      };
    },
    showPlaceholder() {
      return !this.orderList.length && (this.status === loadingType.EMPTY || this.status === loadingType.ERROR);
    },
    placeholderText() {
      return this.status === loadingType.ERROR ? '加载失败，请稍后重试' : '暂无订单';
    },
    footerStatus() {
      if (this.isFetching) return loadingType.LOADING;
      if (this.orderList.length && this.status === loadingType.LOADING) return loadingType.FINISHED;
      return this.status;
    },
  },
};
</script>
<style lang="scss">
.order-list {
  // min-height: calc(100vh - 80rpx);
  padding: 10rpx 22rpx calc(32rpx + env(safe-area-inset-bottom));
  overflow: hidden;

  .order-item {
    display: block;
    margin-top: 24rpx;
    background: #ffffff;
    border: 1rpx solid rgba(31, 122, 244, .08);
    border-radius: 30rpx;
    overflow: hidden;
    box-shadow: 0 16rpx 42rpx rgba(24, 54, 104, .1);

    .order-header {
      display: flex;
      align-items: center;
      gap: 12rpx 16rpx;
      flex-wrap: wrap;
      min-height: 96rpx;
      padding: 20rpx 24rpx;
      background: linear-gradient(135deg, #f4f9ff 0%, #ffffff 76%);
      border-bottom: 1rpx solid #edf2f7;
      box-sizing: border-box;
    }

    .order-sn {
      flex: 1;
      min-width: 0;
      margin-right: 10rpx;
      color: #343b48;
      font-size: 25rpx;
      line-height: 36rpx;
    }

    .order-header__right {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10rpx;
      max-width: 100%;
      flex-wrap: wrap;
    }

    .order-after-tag {
      flex: none;
      padding: 7rpx 14rpx;
      color: #c2410c;
      background: #fff7ed;
      border: 1rpx solid #fed7aa;
      border-radius: 999rpx;
      font-size: 22rpx;
      font-weight: 600;
      line-height: 30rpx;
      white-space: nowrap;
    }

    .order-status {
      flex: none;
      max-width: 240rpx;
      padding: 8rpx 16rpx;
      font-size: 24rpx;
      font-weight: 600;
      text-align: right;
      border-radius: 999rpx;
      line-height: 32rpx;
      white-space: nowrap;
    }

    .order-status.is-active-status {
      color: #1f7af4;
      background: rgba(31, 122, 244, .08);
    }

    .order-status.is-pay {
      color: #ff6a00;
      background: rgba(255, 106, 0, .1);
    }

    .order-status.is-finished {
      color: #18a058;
      background: rgba(24, 160, 88, .1);
    }

    .order-status.is-closed {
      color: #8f9aaf;
      background: #f1f3f6;
    }

    .order-status.is-after-sale {
      color: #c2410c;
      background: #fff7ed;
    }

    .order-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx 12rpx;
      padding: 18rpx 24rpx 4rpx;
      color: #7d8795;
      font-size: 23rpx;
      line-height: 32rpx;
    }

    .order-meta__item {
      display: flex;
      max-width: 100%;
      min-width: 0;
      max-width: 100%;
      padding: 7rpx 13rpx;
      background: #f6f8fb;
      border-radius: 999rpx;
    }

    .order-meta__label {
      flex: none;
      margin-right: 6rpx;
    }

    .order-meta__value {
      min-width: 0;
      word-break: break-all;
    }

    .pickup-summary {
      margin: 14rpx 24rpx 6rpx;
      padding: 18rpx 20rpx;
      border: 1rpx solid #c9f2d8;
      border-radius: 18rpx;
      background: #f4fff8;
    }

    .pickup-summary__row {
      display: flex;
      align-items: flex-start;
      gap: 14rpx;
      min-height: 34rpx;
      margin-top: 8rpx;
    }

    .pickup-summary__row:first-child {
      margin-top: 0;
    }

    .pickup-summary__label {
      flex: none;
      width: 112rpx;
      color: #18a058;
      font-size: 23rpx;
      line-height: 34rpx;
    }

    .pickup-summary__value {
      flex: 1;
      min-width: 0;
      color: #263238;
      font-size: 24rpx;
      line-height: 34rpx;
      word-break: break-all;
    }

    .pickup-summary__code {
      color: #1f7af4;
      font-weight: 600;
    }

    .all-price {
      text-align: right;
      padding: 12rpx 24rpx 8rpx;
      flex-wrap: wrap;
      gap: 4rpx;
    }

    .amount-detail {
      padding: 0 24rpx 24rpx;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8rpx;
    }

    .amount-detail__row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 18rpx;
      color: #7a8491;
      font-size: 23rpx;
      line-height: 32rpx;
    }

    .amount-detail__label {
      min-width: 120rpx;
      text-align: right;
    }

    .amount-detail__value {
      min-width: 112rpx;
      text-align: right;
      color: #536173;
      font-weight: 500;
    }

    .amount-detail__value--deduct {
      color: #ff4d4f;
    }

    .order-footer {
      min-height: 104rpx;
      border-top: 1rpx solid #edf2f7;
      padding: 16rpx 24rpx;
      box-sizing: border-box;
      flex-wrap: wrap;
      gap: 14rpx;
      justify-content: flex-end;

      button {
        min-width: 140rpx;
        height: 60rpx;
        padding: 0 22rpx;
        line-height: 60rpx;
        font-size: 24rpx;
      }

      .plain {
        border: 1rpx solid #c9d1dc;
        color: #536173;

        &.red {
          border-color: $color-primary;
        }
      }
    }
  }
}

@media screen and (max-width: 360px) {
  .order-list {
    padding-left: 16rpx;
    padding-right: 16rpx;

    .order-item {
      border-radius: 24rpx;

      .order-header,
      .order-meta,
      .pickup-summary,
      .all-price,
      .amount-detail,
      .order-footer {
        padding-left: 18rpx;
        padding-right: 18rpx;
      }

      .order-status {
        max-width: 200rpx;
        font-size: 22rpx;
      }

      .order-footer button {
        min-width: 128rpx;
        padding: 0 18rpx;
        font-size: 22rpx;
      }
    }
  }
}

.order-placeholder {
  min-height: 520rpx;
  padding-top: 160rpx;
  box-sizing: border-box;
}
</style>
