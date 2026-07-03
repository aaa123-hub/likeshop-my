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
            <view v-if="item.delivery_type == 2" class="mr10">
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
          <view :class="['order-status', orderStatusClass(item)]">{{ formatOrderStatusText(item) }}</view>
        </view>
        <view class="order-meta" v-if="orderMetaRows(item).length">
          <view v-for="row in orderMetaRows(item)" :key="row.label" class="order-meta__item">
            <text class="order-meta__label">{{ row.label }}</text>
            <text class="order-meta__value">{{ row.value }}</text>
          </view>
        </view>
        <view class="order-con">
          <order-goods
            :list="item.order_goods"
            :order_type="item.order_type"
            :link="true"
          ></order-goods>
          <view v-if="goodsCountText(item) || hasOrderAmount(item)" class="all-price row-end">
            <text v-if="goodsCountText(item)" class="muted xs">{{ goodsCountText(item) }}</text>
            <text v-if="goodsCountText(item) && hasOrderAmount(item)" class="muted xs">，</text>
            <text v-if="hasOrderAmount(item)" class="muted xs">总金额：</text>
            <price-format
              v-if="hasOrderAmount(item)"
              :subscript-size="30"
              :first-size="30"
              :second-size="30"
              :price="orderAmount(item)"
            ></price-format>
          </view>
        </view>
        <view
          class="order-footer row"
          v-if="
            item.pickup_btn ||
            item.cancel_btn ||
            item.delivery_btn ||
            item.take_btn ||
            item.del_btn ||
            canPayOrder(item) ||
            item.comment_btn
          "
        >
          <view style="flex: 1">
            <view
              class="primary sm row"
              style="line-height: 26rpx"
              v-if="getCancelTime(item.order_cancel_time) > 0"
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
            v-if="item.delivery_btn"
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
            >
              去评价
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
          <view v-if="item.take_btn" class="ml20">
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
    uni.$on("refreshorder", () => {
      this.reflesh();
    });
    uni.$on("payment", (params) => {
      if (params.result) {
        this.reflesh();
        uni.navigateBack();
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
        const deletedId = String(payload.orderId || '');
        if (deletedId && !this.deletedOrderIds.includes(deletedId)) this.deletedOrderIds.push(deletedId);
        this.orderList = this.orderList.filter((item) => String(item.id || item.order_sn || item.orderNo) !== deletedId);
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
        const data = await loadingFun(getOrderList, page, orderList, status, {
          type: orderType,
        });
        if (!data) {
          if (!this.orderList.length && this.status === loadingType.LOADING) {
            this.status = loadingType.FINISHED;
          }
          return;
        }
        this.page = data.page;
        this.orderList = data.dataList.filter((item) => !this.deletedOrderIds.includes(String(item.id || item.order_sn || item.orderNo)));
        this.status = data.status;
      } catch (error) {
        console.error('[order-list] getOrderListFun failed:', error);
        this.status = this.orderList.length ? loadingType.FINISHED : loadingType.ERROR;
      } finally {
        this.isFetching = false;
        this.showLoading = false;
      }
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
    orderAmount(item) {
      return [item.order_amount, item.payAmount, item.orderAmount, item.totalAmount].find((value) => value !== undefined && value !== null && value !== '');
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
    isClosedOrder(item) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      return item.order_status == 4 || item.close_btn || item.closed_btn || ['CANCELLED', 'CANCELED', 'CLOSED', 'CLOSE', 'CLOSED_ORDER'].includes(status);
    },
    isPendingPayOrder(item) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status || item.pay_status || item.payStatus);
      return item.order_status == 0 || item.pay_status == 0 || ['CREATED', 'WAIT_PAY', 'PENDING_PAY', 'UNPAID', 'NOT_PAID'].includes(status);
    },
    canPayOrder(item) {
      return Boolean(item.pay_btn || item.payBtn || item.pay_button || (this.isPendingPayOrder(item) && !this.isClosedOrder(item)));
    },
    canCancelOrder(item) {
      return Boolean(item.cancel_btn || item.cancelBtn || item.cancel_button || (this.isPendingPayOrder(item) && !this.isClosedOrder(item)));
    },
    formatOrderStatusText(item) {
      const rawText = item.order_status_desc || item.orderStatusDesc || item.statusText || '';
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status || rawText);
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
      return (/^[A-Z0-9_-]+$/.test(String(rawText))) ? '订单处理中' : (rawText || this.getOrderStatus(item.order_status) || '处理中');
    },
    orderStatusClass(item) {
      const status = this.normalizeStatus(item.order_status || item.orderStatus || item.status);
      if (this.isClosedOrder(item)) return 'is-closed';
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
      const map = { 1: '快递配送', 2: '门店自提', EXPRESS: '快递配送', PICKUP: '门店自提' };
      return map[type] || type || '';
    },
    formatPayWay(value) {
      const map = { WECHAT_JSAPI: '微信支付', WECHAT: '微信支付', ALIPAY: '支付宝', BALANCE: '余额支付', OFFLINE: '线下支付', 1: '微信支付', 2: '支付宝', 3: '余额支付' };
      return map[value] || value || '';
    },
    formatPayStatus(status) {
      const map = { UNPAID: '未支付', PAID: '已支付', REFUNDED: '已退款', CLOSED: '已关闭', 0: '未支付', 1: '已支付' };
      return map[status] || status || '';
    },
    orderMetaRows(item) {
      return [
        { label: '订单类型', value: item.order_type_desc },
        { label: '商家', value: item.shop_name || item.shopName },
        { label: '下单时间', value: this.formatDisplayTime(item.create_time || item.createTime || item.createdAt) },
        { label: '支付时间', value: this.formatDisplayTime(item.pay_time || item.payTime || item.paidAt) },
        { label: '配送方式', value: this.formatDeliveryType(item.delivery_type || item.deliveryType) },
        { label: '支付方式', value: this.formatPayWay(item.pay_way_text || item.payMethod || item.pay_way) },
        { label: '支付状态', value: this.formatPayStatus(item.pay_status || item.payStatus) }
      ].filter((row) => row.value !== undefined && row.value !== null && row.value !== '');
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
      return (time) => time - Date.now() / 1000;
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

    .all-price {
      text-align: right;
      padding: 12rpx 24rpx 24rpx;
      flex-wrap: wrap;
      gap: 4rpx;
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
      .all-price,
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
