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
        class="order-item bg-white mt20"
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
            <text class="line1">订单编号：{{ item.order_sn }}</text>
          </view>
          <view :class="['order-status', isClosedOrder(item) ? 'muted' : 'primary']">{{ item.order_status_desc }}</view>
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
          ></order-goods>
          <view class="all-price row-end">
            <text class="muted xs"
              >{{ goodsCountText(item) }}，总金额：</text
            >
            <price-format
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
            item.pay_btn ||
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
          <view v-if="item.cancel_btn">
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
          <view v-if="item.pay_btn" class="ml20">
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
      <loading-footer v-else :status="status" :slot-empty="true" @refresh="reload">
        <view slot="empty" class="column-center order-placeholder">
          <text class="lighter">暂无订单</text>
        </view>
      </loading-footer>
    </view>
    <order-dialog
      ref="orderDialog"
      :order-id="orderId"
      :type="type"
      @refresh="reflesh"
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
      showCancel: false,
      type: 0,
      orderId: "",
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
      let { page, orderType, orderList, status } = this;
      try {
        const data = await loadingFun(getOrderList, page, orderList, status, {
          type: orderType,
        });
        if (!data) {
          if (!this.orderList.length && this.status === loadingType.LOADING) {
            this.status = loadingType.EMPTY;
          }
          return;
        }
        this.page = data.page;
        this.orderList = data.dataList;
        this.status = data.status;
      } catch (error) {
        console.error('[order-list] getOrderListFun failed:', error);
        this.status = this.orderList.length ? loadingType.FINISHED : loadingType.ERROR;
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
      return count ? `共${count}件商品` : '商品数量以详情为准';
    },
    orderAmount(item) {
      return item.order_amount || item.payAmount || item.orderAmount || item.totalAmount || 0;
    },
    orderPayWay(item) {
      return item.pay_way || item.payMethod || item.payWay;
    },
    isWechatPayWay(value) {
      return value === 1 || value === '1' || value === 'WECHAT_JSAPI' || value === 'wechat' || value === 'wxpay';
    },
    isClosedOrder(item) {
      return item.order_status == 4 || item.order_status === 'CANCELLED';
    },
    formatDeliveryType(type) {
      const map = { 1: '快递配送', 2: '门店自提', EXPRESS: '快递配送', PICKUP: '门店自提' };
      return map[type] || '';
    },
    formatPayWay(value) {
      const map = { BALANCE: '钱包余额', WECHAT_JSAPI: '微信支付', ALIPAY: '支付宝', 1: '微信支付', 2: '支付宝', 3: '钱包余额' };
      return map[value] || value || '';
    },
    formatPayStatus(status) {
      const map = { UNPAID: '未支付', PAID: '已支付', REFUNDED: '已退款', CLOSED: '已关闭', 0: '未支付', 1: '已支付' };
      return map[status] || status || '';
    },
    orderMetaRows(item) {
      return [
        { label: '下单时间', value: item.create_time || item.createTime || item.createdAt },
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
  },
};
</script>
<style lang="scss">
.order-list {
  // min-height: calc(100vh - 80rpx);
  padding: 0 20rpx calc(24rpx + env(safe-area-inset-bottom));
  overflow: hidden;

  .order-item {
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(20, 28, 45, .05);

    .order-header {
      min-height: 82rpx;
      padding: 0 24rpx;
      border-bottom: 1px dotted #e5e5e5;
      box-sizing: border-box;
    }

    .order-sn {
      flex: 1;
      min-width: 0;
      margin-right: 18rpx;
      color: #303133;
      font-size: 25rpx;
    }

    .order-status {
      flex: none;
      max-width: 180rpx;
      font-size: 25rpx;
      text-align: right;
    }

    .order-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx 18rpx;
      padding: 16rpx 24rpx 0;
      color: #8b9098;
      font-size: 23rpx;
      line-height: 32rpx;
    }

    .order-meta__item {
      display: flex;
      max-width: 100%;
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
      padding: 4rpx 24rpx 22rpx;
      flex-wrap: wrap;
    }

    .order-footer {
      min-height: 104rpx;
      border-top: $solid-border;
      padding: 14rpx 24rpx;
      box-sizing: border-box;
      flex-wrap: wrap;
      gap: 12rpx 0;

      button {
        height: 60rpx;
        line-height: 60rpx;
        font-size: 24rpx;
      }

      .plain {
        border: 1px solid #bbbbbb;

        &.red {
          border-color: $color-primary;
        }
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
