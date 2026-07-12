<template>
  <view>
    <!-- pages/apply_refund/apply_refund.wxml -->
    <view class="apply-refund">
      <view class="goods">
        <view class="row">
          <custom-image
            width="160rpx"
            height="160rpx"
            radius="6rpx"
            lazy-load
            :src="goods.image"
          />
          <view class="goods-info">
            <view class="nr line2">{{ goodsNameText }}</view>
            <view class="xs muted mt10">{{ goodsSpecText }}</view>
          </view>
        </view>
      </view>
      <view class="opt-box mt20" :hidden="hiddenOpt">
        <view class="opt-item row-between border-line" @tap="onlyRefund">
          <view>
            <view class="lg normal">仅退款</view>
            <view class="muted xs mt10"
              >未收到货，与卖家协商同意无需退货只需退款</view
            >
          </view>
          <image
            style="width: 28rpx; height: 28rpx"
            src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"
          ></image>
        </view>
        <view class="opt-item row-between" @tap="allRefunds">
          <view>
            <view class="lg normal">退货退款</view>
            <view class="muted xs mt10">已收到货，需退还收到的实物</view>
          </view>
          <image
            style="width: 28rpx; height: 28rpx"
            src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"
          ></image>
        </view>
      </view>
      <view :hidden="!hiddenOpt">
        <view class="existing-sale-tip" v-if="hasExistingAfterSale">
          <view class="existing-sale-tip__title">该商品已提交售后申请</view>
          <view class="existing-sale-tip__desc">{{ existingAfterSaleText }}</view>
          <button v-if="existingAfterSaleId" size="sm" class="existing-sale-tip__btn" hover-class="none" @tap="showExistingAfterSale">查看售后进度</button>
        </view>
        <view class="refund-info row-between mt20" v-if="!hasExistingAfterSale">
          <view class="lable">数量</view>
          <view>{{ goodsNumText }}</view>
        </view>
        <view class="refund-info row-between" v-if="!hasExistingAfterSale">
          <view class="lable">现金退款</view>
          <price-format
            v-if="hasRefundCashAmount"
            color="#a0610d"
            :price="refundCashAmount"
            showSubscript="true"
            :subscriptSize="28"
            :firstSize="28"
            :secondSize="28"
          />
          <view v-else class="muted">金额待确认</view>
        </view>
        <view class="refund-info row-between" v-if="!hasExistingAfterSale && refundPointsAmount > 0">
          <view class="lable">积分退还</view>
          <view class="refund-points">¥{{ formatAmount(refundPointsAmount) }}</view>
        </view>
        <view class="refund-info row-between" v-if="!hasExistingAfterSale && refundPointsAmount > 0">
          <view class="lable">合计权益</view>
          <view class="refund-total">¥{{ formatAmount(refundTotalAmount) }}</view>
        </view>
        <view class="refund-info row-between" v-if="!hasExistingAfterSale" @tap="showPopup">
          <view class="lable">退款原因</view>
          <view class="row">
            <text :class="'nr ' + (reasonIndex == -1 ? 'muted' : 'normal')">{{
              reasonText
            }}</text>
            <image
              class="icon-sm ml20"
              src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"
            ></image>
          </view>
        </view>
        <view class="refund-info row" v-if="!hasExistingAfterSale">
          <view class="label">备注说明</view>
          <textarea
            v-show="!showPop"
            class="bg-body"
            placeholder="请描述申请售后的具体原因，100字以内"
            v-model="remark"
            name="textarea"
          ></textarea>
        </view>
        <view class="upload bg-white" v-if="!hasExistingAfterSale">
          <view class="title row-between">
            <view>上传凭证</view>
            <view class="muted">（选填，最多可上传1张）</view>
          </view>
          <uploader
            :deletable="true"
            preview-size="160rpx"
            :file-list="fileList"
            @after-read="afterRead"
            @delete="deleteImage"
            image-fit="aspectFill"
          />
        </view>
        <button v-if="!hasExistingAfterSale" class="btn br60" type="primary" size="lg" @tap="onSubmit">
          申请退款
        </button>
      </view>
    </view>

    <u-popup id="popup" v-model="showPop" mode="bottom">
      <view class="pop-container bg-white">
        <view class="pop-header row-center md normal"> 退款原因 </view>
        <scroll-view style="height: 800rpx" :scroll-y="true">
          <view class="reason-box mt20">
            <view v-if="!reason.length" class="reason-empty">退款原因待确认</view>
            <radio-group @change="radioChange">
              <label
                v-for="(item, index) in reason"
                :key="index"
                class="reason-item row-between"
                @tap="hidePopup"
              >
                <view class="reason-desc nr">
                  {{ item }}
                </view>
                <radio :value="index"></radio>
              </label>
            </radio-group>
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import UPopup from '@/bundle_order/components/uview-ui/components/u-popup/u-popup.vue'
import Uploader from '@/bundle_order/components/uploader/uploader.vue'
// +----------------------------------------------------------------------
// | likeshop开源商城系统
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | gitee下载：https://gitee.com/likeshop_gitee
// | github下载：https://github.com/likeshop-github
// | 访问官网：https://www.likeshop.cn
// | 访问社区：https://home.likeshop.cn
// | 访问手册：http://doc.likeshop.cn
// | 微信公众号：likeshop技术社区
// | likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识
// |  likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识
// | 禁止对系统程序代码以任何目的，任何形式的再发布
// | likeshop团队版权所有并拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeshop.cn.team
// +----------------------------------------------------------------------
import { refundOptType } from "@/utils/type";
import { baseURL } from "@/config/app";
import { getGoodsInfo, applyAfterSale, applyAgain } from "@/api/user";
import { uploadFile, trottle } from "@/utils/tools.js";
import PriceFormat from '@/bundle_order/components/price-format/price-format.vue'
import CustomImage from '@/components/custom-image/custom-image.vue'

export default {
	components: {
			PriceFormat,
			UPopup,
			Uploader,
			CustomImage
		},
  data() {
    return {
      hiddenOpt: false,
      optTyle: refundOptType.ONLY_REFUND,
      goods: {},
      reason: [],
      showPop: false,
      reasonIndex: -1,
      fileList: [],
      remark: "",
      existingAfterSale: null,
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { order_id, item_id, afterSaleId } = options;
    this.orderId = order_id;
    this.itemId = item_id;
    this.afterSaleId = afterSaleId;
    this.getGoodsInfoFun();

    this.onSubmit = trottle(this.onSubmit, 1000, this);
  },

  methods: {
    showPopup() {
      this.showPop = true;
    },

    radioChange(e) {
      this.reasonIndex = e.detail.value;
    },

    hidePopup() {
      this.showPop = false;
    },

    amountValue(value) {
      const number = Number(value)
      return Number.isNaN(number) ? 0 : number
    },

    formatAmount(value) {
      return this.amountValue(value).toFixed(2)
    },

    cleanStatusText(value) {
      const text = String(value || '').trim()
      if (!text || ['none', 'null', 'undefined', 'nil', 'na', 'n/a', '-', '--'].includes(text.toLowerCase())) return ''
      const map = {
        APPLIED: '待商家处理',
        APPLY: '待商家处理',
        PENDING: '待商家处理',
        PENDING_REVIEW: '待商家处理',
        WAIT_AUDIT: '待商家处理',
        WAIT_SELLER: '待商家处理',
        WAIT_MERCHANT: '待商家处理',
        PROCESSING: '处理中',
        REFUNDING: '退款中',
        IN_PROGRESS: '处理中',
        APPROVED: '商家已同意',
        RETURNING: '待买家退货',
        WAIT_RETURN: '待买家退货',
        REJECTED: '商家已拒绝',
        CANCELLED: '已撤销',
        CANCELED: '已撤销',
        CLOSED: '已关闭',
        REFUNDED: '退款成功',
        REFUND_SUCCESS: '退款成功',
        SUCCESS: '退款成功',
        FAILED: '退款失败'
      }
      return map[text.toUpperCase()] || (/^[A-Z0-9_-]+$/.test(text) ? '售后处理中' : text)
    },

    onlyRefund: function () {
      this.optTyle = refundOptType.ONLY_REFUND;
      this.hiddenOpt = true;
    },

    allRefunds() {
      this.optTyle = refundOptType.REFUNDS;
      this.hiddenOpt = true;
    },

    onSubmit() {
      if (!this.afterSaleId && this.hasExistingAfterSale) {
        this.showExistingAfterSale();
        return;
      }
      if (this.afterSaleId) {
        this.applyAgainFun();
      } else {
        this.applyAfterSaleFun();
      }
    },

    // 重新申请
    applyAgainFun() {
      let { reason, reasonIndex, optTyle, remark, fileList } = this;

      if (!reason[reasonIndex]) {
        return this.$toast({
          title: "请选择退款原因",
        });
      }
      if (!this.hasRefundCashAmount) {
        return this.$toast({
          title: "退款金额待确认",
        });
      }

      const data = {
        id: this.afterSaleId,
        reason: reason[reasonIndex],
        refund_type: optTyle,
        remark: remark,
        order_id: this.orderId,
        item_id: this.itemId,
        img: fileList.length <= 0 ? "" : (fileList[0].url || fileList[0].base_url),
      };
      applyAgain(data).then((res) => {
        if (res.code == 1) {
          const result = res.data || {};
          const afterSaleId = result.after_sale_id || result.refundNo || result.refundId || result.id || this.afterSaleId;
          uni.$emit("refreshsale");
          this.$toast(
            {
              title: res.msg,
            },
            {
              tab: 5,
              url:
                "/bundle_order/pages/after_sales_detail/after_sales_detail?afterSaleId=" +
                afterSaleId +
                "&refundReason=" +
                encodeURIComponent(remark || ""),
            }
          );
        }
      });
    },

    onInput(e) {
      this.setData({
        remark: e.detail.value,
      });
      this.remark = e.detail.value;
    },

    applyAfterSaleFun() {
      let { reason, reasonIndex, optTyle, remark, fileList, goods } = this;

      if (!reason[reasonIndex]) {
        return this.$toast({
          title: "请选择退款原因",
        });
      }

      const data = {
        item_id: this.itemId,
        order_id: this.orderId,
        reason: reason[reasonIndex],
        refund_type: optTyle,
        amount: this.refundCashAmount + this.amountValue(goods.refund_express_money),
        refundCashAmount: this.refundCashAmount,
        refundableCashAmount: this.refundCashAmount,
        refundPointsAmount: this.refundPointsAmount,
        remark: remark,
        img: fileList.length <= 0 ? "" : (fileList[0].url || fileList[0].base_url),
      };
      applyAfterSale(data).then((res) => {
        if (res.code == 1) {
          const result = res.data || {};
          const afterSaleId = result.after_sale_id || result.refundNo || result.refundId || result.id;
          if (res.existingAfterSale || res.msg === '该订单正在退款/售后处理中，请勿重复申请') {
            this.showExistingAfterSale(afterSaleId);
            return;
          }
          uni.$emit("refreshsale");
          this.$toast({
            title: "提交成功",
          });
          setTimeout(() => {
            if (Number(optTyle) === refundOptType.REFUNDS) {
              uni.redirectTo({
                url: "/bundle_order/pages/input_express_info/input_express_info?id=" +
                  afterSaleId +
                  "&order_id=" +
                  encodeURIComponent(this.orderId || "") +
                  "&refundReason=" +
                  encodeURIComponent(remark || ""),
              });
              return;
            }
            uni.redirectTo({
              url:
                "/bundle_order/pages/after_sales_detail/after_sales_detail?afterSaleId=" +
                afterSaleId +
                "&refundReason=" +
                encodeURIComponent(remark || ""),
            });
          }, 500);
        }
      });
    },
    showExistingAfterSale(afterSaleId = '') {
      const id = afterSaleId || this.existingAfterSaleId;
      uni.showToast({ title: '该订单正在退款/售后处理中，请勿重复申请', icon: 'none' });
      if (!id) return;
      setTimeout(() => {
        uni.redirectTo({
          url: '/bundle_order/pages/after_sales_detail/after_sales_detail?afterSaleId=' + id + '&order_id=' + this.orderId
        });
      }, 500);
    },

    afterRead(e) {
      const file = e;
      uni.showLoading({
        title: "正在上传中...",
        mask: true,
      });
      file.map((item) => {
        uploadFile(item.path).then((res) => {
          uni.hideLoading();
          this.fileList.push(res);
        });
      });
    },

    deleteImage(index) {
      this.fileList.splice(index, 1);
    },

    getGoodsInfoFun() {
      let { orderId, itemId } = this;
      getGoodsInfo({
        order_id: orderId,
        item_id: itemId,
      }).then((res) => {
        if (res.code == 1) {
          const data = res.data || {};
          this.goods = data.goods || {};
          this.reason = Array.isArray(data.reason) ? data.reason : [];
          this.existingAfterSale = data.existingAfterSale ? {
            afterSaleId: data.afterSaleId || this.goods.after_sale_id,
            statusText: data.afterStatusText || this.goods.after_status_desc
          } : null;
          if (this.hasExistingAfterSale) {
            this.hiddenOpt = true;
          }
        }
      });
    },
  },
  computed: {
    refundCashAmount() {
      return this.amountValue(
        this.refundCashAmountRaw
      )
    },
    refundCashAmountRaw() {
      return this.goods.refund_cash_amount ??
        this.goods.refundableCashAmount ??
        this.goods.refundable_cash_amount ??
        this.goods.actualPayAmount ??
        this.goods.actual_pay_amount ??
        this.goods.pay_amount ??
        this.goods.payAmount ??
        this.goods.total_pay_price
    },
    hasRefundCashAmount() {
      const value = this.refundCashAmountRaw
      return value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value))
    },
    goodsNameText() {
      return this.goods.goods_name || this.goods.goodsName || this.goods.name || '商品待确认'
    },
    goodsSpecText() {
      return this.goods.spec_value || this.goods.specValue || this.goods.sku_value || this.goods.skuValue || '规格待确认'
    },
    reasonText() {
      return this.reasonIndex == -1 ? "请选择" : (this.reason[this.reasonIndex] || '退款原因待确认')
    },
    refundPointsAmount() {
      return this.amountValue(
        this.goods.refund_points_amount ??
        this.goods.refundablePointsAmount ??
        this.goods.refundable_points_amount ??
        this.goods.pointsDeductAmount ??
        this.goods.points_deduct_amount ??
        this.goods.integralAmount ??
        this.goods.integral_amount
      )
    },
    refundTotalAmount() {
      return this.refundCashAmount + this.refundPointsAmount
    },
    goodsNumText() {
      const value = this.goods.goods_num ?? this.goods.goodsNum ?? this.goods.quantity ?? this.goods.num ?? ''
      return value === '' || value === null || value === undefined ? '数量待确认' : value
    },
    hasExistingAfterSale() {
      return Boolean(this.existingAfterSale || this.goods.after_sale_id || this.cleanStatusText(this.goods.after_status_desc))
    },
    existingAfterSaleId() {
      return this.goods.after_sale_id || this.afterSaleId || this.existingAfterSale?.afterSaleId || ''
    },
    existingAfterSaleText() {
      return this.cleanStatusText(this.goods.after_status_desc || this.existingAfterSale?.statusText) || '售后处理中，请勿重复申请'
    }
  }
};
</script>
<style lang="scss">
/* pages/apply_refund/apply_refund.wxss */
.apply-refund {
  min-height: 100vh;
  padding: 24rpx 24rpx 50rpx;
  background: #fff9f0;
  max-width: 750rpx;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;

  .goods {
    background-color: white;
    padding: 24rpx;
    border-radius: 22rpx;
    box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);

    .goods-info {
      margin-left: 24rpx;
      flex: 1;
      min-width: 0;
      word-break: break-all;
    }
  }
}

.opt-box {
  border-radius: 22rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);

  .opt-item {
    padding: 28rpx 24rpx;
    background-color: white;
  }
}

.border-line {
  border-bottom: 1px solid #f2f2f2;
}

.existing-sale-tip {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #fff7ed;
  border: 1rpx solid #fed7aa;
}

.existing-sale-tip__title {
  color: #9a3412;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.existing-sale-tip__desc {
  margin-top: 8rpx;
  color: #c2410c;
  font-size: 24rpx;
  line-height: 34rpx;
}

.existing-sale-tip__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  margin-top: 18rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  color: #c2410c;
  background: #ffffff;
  border: 1rpx solid #fdba74;
  font-size: 24rpx;
  line-height: 56rpx;
}

.apply-refund {
  .refund-info {
    background-color: #fff;
    padding: 26rpx 24rpx;
    border-bottom: var(--border);

    &:first-child {
      margin-top: 20rpx;
      border-radius: 22rpx 22rpx 0 0;
    }

    .label {
      align-self: start;
      width: 140rpx;
      line-height: 36rpx;
      margin-top: 19rpx;
    }
    textarea {
      flex: 1;
      height: 172rpx;
      border-radius: 16rpx;
      padding: 20rpx;
      box-sizing: border-box;
      background: #fff8ed;
    }
  }
  .upload {
    padding: 0 24rpx 24rpx;
    border-radius: 0 0 22rpx 22rpx;
    box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);

    .title {
      padding: 24rpx 0;
    }
  }
  .btn {
    width: 100%;
    margin-top: 32rpx;
    margin-left: 0;
    margin-right: 0;
    box-shadow: 0 12rpx 24rpx rgba(160, 97, 13, 0.18);
  }
}

.pop-header {
  line-height: 42rpx;
  padding: 30rpx;
}

.reason-box {
  .reason-item {
    padding: 24rpx 20rpx;
    .reason-desc {
      line-height: 46rpx;
      word-break: break-all;
    }
  }
}

.reason-empty {
  padding: 56rpx 24rpx;
  color: #999;
  font-size: 26rpx;
  line-height: 38rpx;
  text-align: center;
}
</style>
