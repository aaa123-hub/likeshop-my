<template>
  <view>
    <view>
      <view class="sale-list" v-if="type == 'normal'">
        <view
          v-for="(items, index) in normalApplyList"
          :key="index"
          class="sale-item bg-white"
        >
          <!--  <view class="sale-header row">
                    <view class="store-name nr ml10 normal">成交时间: {{items.time}}</view>
                </view> -->
          <view
            v-for="(item, index2) in orderGoodsList(items)"
            :key="index2"
            class="goods-item"
          >
            <view class="sale-goods-show row">
              <view class="goods-img">
                <custom-image
                  width="100%"
                  height="100%"
                  radius="6rpx"
                  lazy-load
                  :src="item.image"
                />
              </view>
              <view class="goods-desc">
                <view class="goods-name line2 nr">{{ goodsNameText(item) }}</view>
                <view class="row-between mt20">
                  <price-format
                    v-if="hasGoodsPrice(item)"
                    class="sm"
                    :firstSize="30"
                    :secondSize="30"
                    :showSubscript="true"
                    :subscriptSize="26"
                    :price="goodsPrice(item)"
                  />
                  <view v-else class="nr muted">金额待确认</view>
                  <view class="nr">{{ goodsNumText(item) }}</view>
                </view>
              </view>
            </view>
            <view
              :class="
                'sale-footer row-end ' +
                (afterSaleAbleApply(items) == 1 ? '' : 'bottom-opacity')
              "
            >
              <view
                class="btn row-center bd-primary primary br60"
                @click="
                  goPage(
                    $event,
                    afterSaleAbleApply(items),
                    '/bundle_order/pages/apply_refund/apply_refund',
                    items.order_id,
                    item.item_id
                  )
                "
              >
                申请售后
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="sale-list" v-else-if="type == 'apply'">
        <view
          v-for="(items, index) in displayLists"
          :key="index"
          class="sale-item bg-white"
        >
          <view class="sale-header row-between">
            <view class="row">
              <view class="store-name nr ml10 mr10"
                >申请时间: {{ items.time }}</view
              >
            </view>
            <view class="primary nr">{{ afterSaleTypeText(items) }}</view>
          </view>
          <view
            v-for="(item, index2) in orderGoodsList(items)"
            :key="index2"
            class="sale-goods-show"
            @tap="openAfterSaleDetail(items)"
          >
            <view class="row">
              <view class="goods-img">
                <custom-image
                  width="100%"
                  height="100%"
                  radius="6rpx"
                  lazy-load
                  :src="item.image"
                />
              </view>
              <view class="goods-desc">
                <view class="goods-name line2 nr">{{ goodsNameText(item) }}</view>
                <view class="row-between mt20">
                  <view>
                    <price-format
                      v-if="hasGoodsPrice(item)"
                      :firstSize="26"
                      :price="goodsPrice(item)"
                      weight="600"
                      :showSubscript="true"
                    />
                    <view v-else class="nr muted">金额待确认</view>
                  </view>
                  <view class="nr">{{ goodsNumText(item) }}</view>
                </view>
              </view>
            </view>
            <view class="sale-status mt20 row">
              <view class="nr" style="font-weight: bold">申请状态</view>
              <view class="nr ml20">{{ afterSaleStatusText(items) }}</view>
            </view>
            <view class="sale-meta mt20">
              <view class="sale-meta-row" v-if="afterSaleId(items)">
                <text>售后编号</text>
                <text>{{ afterSaleId(items) }}</text>
              </view>
              <view class="sale-meta-row" v-if="items.refund_reason">
                <text>退款原因</text>
                <text>{{ items.refund_reason }}</text>
              </view>
              <view class="sale-meta-row" v-if="items.refund_remark">
                <text>备注说明</text>
                <text>{{ items.refund_remark }}</text>
              </view>
            </view>
          </view>
          <view class="sale-footer row-end">
            <view
              class="row-center normal br60 mr20 grey-btn nr"
              @tap="showDialog(afterSaleId(items))"
              >撤销申请</view
            >
            <navigator
              v-if="afterSaleId(items)"
              hover-class="none"
              :url="
                '/bundle_order/pages/input_express_info/input_express_info?id=' +
                afterSaleId(items)
              "
              class="row-center normal br60 grey-btn nr"
              :hidden="afterSaleStatusValue(items) != 2"
              >填写快递单号
            </navigator>
          </view>
        </view>
      </view>
      <view class="sale-list" v-else>
        <view
          v-for="(items, index) in displayLists"
          :key="index"
          class="sale-item bg-white"
        >
          <view
            @tap="openAfterSaleDetail(items)"
          >
            <view class="sale-header row-between">
              <view class="row">
                <!-- <image style="width: 40rpx;height: 40rpx" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_shop.png"></image> -->
                <view class="store-name nr ml10 mr10"
                  >申请时间: {{ items.time }}</view
                >
              </view>
              <view class="primary nr">{{ afterSaleTypeText(items) }}</view>
            </view>
            <view
              v-for="(item, index2) in orderGoodsList(items)"
              :key="index2"
              class="sale-goods-show"
            >
              <view class="row">
                <view class="goods-img">
                  <custom-image
                    lazy-load
                    width="100%"
                    height="100%"
                    radius="6rpx"
                    :src="item.image"
                  />
                </view>
                <view class="goods-desc">
                  <view class="goods-name line2 nr">{{ goodsNameText(item) }}</view>
                  <view class="row-between mt20 row-between">
                    <price-format
                      v-if="hasGoodsPrice(item)"
                      :firstSize="26"
                      :price="goodsPrice(item)"
                      weight="600"
                      :showSubscript="true"
                    />
                    <view v-else class="nr muted">金额待确认</view>
                    <view class="nr">{{ goodsNumText(item) }}</view>
                  </view>
                </view>
              </view>
              <view class="refund-summary" v-if="index2 === orderGoodsList(items).length - 1">
                <view class="refund-summary__main">
                  <text class="refund-summary__label">退款金额</text>
                  <price-format
                    v-if="hasRefundPrice(items)"
                    class="refund-summary__price"
                    :firstSize="34"
                    :secondSize="26"
                    :price="refundPrice(items)"
                    weight="700"
                    :showSubscript="true"
                    color="red"
                  />
                  <text v-else class="refund-summary__empty">金额待确认</text>
                </view>
                <text class="refund-summary__desc">{{ afterSaleTypeText(items) }}</text>
              </view>
              <view class="sale-status mt20 row">
                <view class="nr" style="font-weight: bold">申请状态</view>
                <view class="nr ml20">{{ afterSaleStatusText(items) }}</view>
              </view>
              <view class="sale-meta mt20">
                <view class="sale-meta-row" v-if="afterSaleId(items)">
                  <text>售后编号</text>
                  <text>{{ afterSaleId(items) }}</text>
                </view>
                <view class="sale-meta-row" v-if="items.refund_reason">
                  <text>退款原因</text>
                  <text>{{ items.refund_reason }}</text>
                </view>
                <view class="sale-meta-row" v-if="items.refund_remark">
                  <text>备注说明</text>
                  <text>{{ items.refund_remark }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="sale-footer row-end">
            <view
              class="row-center normal br60 grey-btn nr"
              @tap="showDeleteDialog(items, index)"
            >删除记录</view>
          </view>
        </view>
      </view>
      <loading-footer :status="loadingStatus" slotEmpty>
        <view class="data-null column-center" slot="empty">
          <text class="nr muted">暂无售后数据～</text>
        </view>
      </loading-footer>
    </view>
    <u-modal
      v-model="confirmDialog"
      confirm-text="确定"
      :showCancelButton="true"
      :show-title="false"
      confirm-color="#a0610d"
      @confirm="cancelApplyFun"
      @cancel="hideDialog"
    >
      <view class="column-center tips-dialog" style="padding: 20rpx 0">
        <image class="icon-lg" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_warning.png"></image>
        <view style="margin-top: 30rpx">{{ confirmText }}</view>
      </view>
    </u-modal>
  </view>
</template>

<script>
import UModal from '@/bundle_order/components/uview-ui/components/u-modal/u-modal.vue'
// +----------------------------------------------------------------------
// | LikeShop100%开源免费商用电商系统
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | 开源版本可自由商用，保留版权即可
// | 商业版本务必购买商业授权，以免引起法律纠纷
// | 禁止对系统程序代码以任何目的，任何形式的再发布
// | Gitee下载：https://gitee.com/likeshop_gitee/likeshop
// | 访问官网：https://www.likemarket.net
// | 访问社区：https://home.likemarket.net
// | 访问手册：http://doc.likemarket.net
// | 微信公众号：好象科技
// | 好象科技开发团队 版权所有 拥有最终解释权
// +----------------------------------------------------------------------
// | Author: LikeShopTeam
// +----------------------------------------------------------------------
import { AfterSaleType, loadingType } from "@/utils/type";
import {
  getAfterSaleList,
  cancelApply,
  deleteAfterSale,
  afterSaleDetail,
  applyAgain,
} from "@/api/user";
import { loadingFun } from "@/utils/tools";
import PriceFormat from '@/bundle_order/components/price-format/price-format.vue'
import CustomImage from '@/components/custom-image/custom-image.vue'
import LoadingFooter from '@/components/loading-footer/loading-footer.vue'

export default {
  data() {
    return {
      lists: [],
      localDeletedRecords: [],
      deletedOrderIds: [],
      page: 1,
      loadingStatus: loadingType.LOADING,
      confirmDialog: false,
      confirmType: 'cancel',
      deleteIndex: -1,
      deleteItem: null,
    };
  },

  components: {
			PriceFormat,
			UModal,
			CustomImage,
			LoadingFooter
		},
  props: {
    type: {
      type: String,
      default: AfterSaleType.NORMAL,
    },
  },

  created() {
    uni.$on("refreshsale", () => {
      this.reflesh();
    });
    uni.$on("afterSaleDeleted", this.onAfterSaleDeleted);
    uni.$on("orderDeleted", this.onOrderDeleted);
  },

  beforeMount() {
    this.getAfterSaleListFun();
  },
  destroyed: function () {
    uni.$off("refreshsale");
    uni.$off("afterSaleDeleted", this.onAfterSaleDeleted);
    uni.$off("orderDeleted", this.onOrderDeleted);
  },
  computed: {
    confirmText() {
      return this.confirmType === 'delete' ? '是否删除该售后记录？' : '是否要撤销申请？'
    },
    displayLists() {
      return (this.lists || []).filter((item) => !this.isLocallyDeleted(item) && !this.isOrderDeleted(item))
    },
    normalApplyList() {
      return this.displayLists.map((order) => {
        const goods = this.orderGoodsList(order).filter((item) => {
          const afterSale = item.after_sale || item.afterSale || item.refund_info || item.refundInfo || {}
          return !(
            item.after_sale_id
            || item.afterSaleId
            || item.refundNo
            || item.after_status_desc
            || item.refundStatusText
            || afterSale.after_sale_id
            || afterSale.afterSaleId
            || afterSale.refundNo
            || afterSale.status
            || afterSale.statusText
            || afterSale.status_text
          )
        })
        const ableApply = Number(this.afterSaleAbleApply(order)) === 1
        return ableApply && goods.length ? { ...order, order_goods: goods } : null
      }).filter(Boolean)
    }
  },
  methods: {
    pickValue(source = {}, keys = []) {
      for (const key of keys) {
        const value = source && source[key]
        if (value !== undefined && value !== null && value !== '') return value
      }
      return ''
    },
    goodsNameText(item = {}) {
      return this.pickValue(item, ['goods_name', 'goodsName', 'name', 'title']) || '商品待确认'
    },
    goodsPrice(item = {}) {
      return this.pickValue(item, ['goods_price', 'goodsPrice', 'price', 'pay_price', 'payPrice'])
    },
    hasGoodsPrice(item = {}) {
      const value = this.goodsPrice(item)
      return value !== '' && !Number.isNaN(Number(value))
    },
    goodsNumText(item = {}) {
      const value = this.pickValue(item, ['goods_num', 'goodsNum', 'quantity', 'num'])
      return value === '' ? '数量待确认' : `x${value}`
    },
    orderGoodsList(item = {}) {
      const goods = item.order_goods || item.orderGoods || item.goods || item.goods_list || item.goodsList || []
      if (Array.isArray(goods)) return goods
      return goods && typeof goods === 'object' ? [goods] : []
    },
    afterSaleInfo(item = {}) {
      return item.after_sale || item.afterSale || item.refund_info || item.refundInfo || {}
    },
    afterSaleAbleApply(item = {}) {
      const info = this.afterSaleInfo(item)
      return this.pickValue(info, ['able_apply', 'ableApply']) || this.pickValue(item, ['able_apply', 'ableApply'])
    },
    afterSaleStatusValue(item = {}) {
      const info = this.afterSaleInfo(item)
      return this.pickValue(info, ['status', 'after_status', 'afterStatus', 'refund_status', 'refundStatus'])
    },
    afterSaleTypeText(item = {}) {
      const info = this.afterSaleInfo(item)
      return this.pickValue(info, ['type_text', 'typeText', 'refund_type_text', 'refundTypeText']) || '售后类型待确认'
    },
    afterSaleStatusText(item = {}) {
      const info = this.afterSaleInfo(item)
      return this.pickValue(info, ['desc', 'status_text', 'statusText', 'after_status_desc', 'afterStatusDesc']) || '状态待确认'
    },
    refundPrice(item = {}) {
      const info = this.afterSaleInfo(item)
      return this.pickValue(info, ['refund_price', 'refundPrice', 'refund_amount', 'refundAmount', 'amount'])
    },
    hasRefundPrice(item = {}) {
      const value = this.refundPrice(item)
      return value !== '' && !Number.isNaN(Number(value))
    },
    afterSaleDetailUrl(item = {}) {
      const id = this.afterSaleId(item)
      if (!id) return ''
      const orderId = this.orderIdentity(item)
      return '/bundle_order/pages/after_sales_detail/after_sales_detail?afterSaleId=' +
        encodeURIComponent(id) +
        (orderId ? '&order_id=' + encodeURIComponent(orderId) : '')
    },
    openAfterSaleDetail(item = {}) {
      const url = this.afterSaleDetailUrl(item)
      if (!url) {
        this.$toast({ title: '售后编号待确认' })
        return
      }
      uni.navigateTo({ url })
    },
    cancelApplyFun() {
      if (this.confirmType === 'delete') {
        this.deleteAfterSaleRecord()
        return
      }
      cancelApply({
        id: this.id,
      }).then((res) => {
        if (res.code == 1) {
          this.$toast({
            title: res.msg,
          });
          this.confirmDialog = false;
          uni.$emit("refreshsale");
        }
      });
    },
    async deleteAfterSaleRecord() {
      const item = this.deleteItem || {}
      const deletedId = this.afterSaleId(item)
      const deletedOrderNo = this.orderIdentity(item)
      const res = await deleteAfterSale({
        ...item,
        afterSaleId: deletedId
      })
      if (res && res.code != 1) {
        this.$toast({ title: res.msg || '删除失败' })
        return
      }
      this.removeAfterSaleFromList(deletedId, deletedOrderNo)
      this.rememberDeletedRecord(deletedId, deletedOrderNo)
      this.confirmDialog = false
      this.$toast({ title: '删除成功' })
      uni.$emit("afterSaleDeleted", { afterSaleId: deletedId, orderNo: deletedOrderNo })
    },

    getAfterSaleListFun() {
      let { lists, loadingStatus, page } = this;
      loadingFun(getAfterSaleList, page, lists, loadingStatus, {
        type: this.type,
      }).then((res) => {
        if (res) {
          this.page = res.page;
          this.loadingStatus = res.status;
          this.lists = (res.dataList || []).filter((item) => !this.isLocallyDeleted(item));
        }
      });
    },

    goPage(e, able_apply, url, order_id, item_id) {
      if (able_apply != 1) {
        return;
      }
      url = url + "?order_id=" + order_id + "&item_id=" + item_id;
      uni.navigateTo({
        url: url,
      });
    },

    reflesh() {
      this.page = 1;
      this.lists = [];
      this.loadingStatus = loadingType.LOADING;
      this.getAfterSaleListFun();
    },

    showDialog(id) {
      if (!id) {
        this.$toast({ title: '售后编号待确认' })
        return
      }
      this.id = id;
      this.confirmType = 'cancel';
      this.confirmDialog = true;
    },
    showDeleteDialog(item, index) {
      this.deleteItem = item;
      this.deleteIndex = index;
      this.confirmType = 'delete';
      this.confirmDialog = true;
    },
    afterSaleId(item = {}) {
      return item.after_sale?.after_sale_id || item.afterSaleId || item.after_sale_id || item.refundNo || item.refund_no || item.id || ''
    },
    orderIdentity(item = {}) {
      return item.orderNo
        || item.order_no
        || item.order_id
        || item.orderId
        || item.order_sn
        || item.orderSn
        || item.bizOrderNo
        || item.biz_order_no
        || item.subOrderNo
        || item.sub_order_no
        || item.id
        || ''
    },
    orderIdentityList(item = {}) {
      return [
        item.orderNo,
        item.order_no,
        item.order_id,
        item.orderId,
        item.order_sn,
        item.orderSn,
        item.bizOrderNo,
        item.biz_order_no,
        item.subOrderNo,
        item.sub_order_no,
        item.id
      ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
    },
    deletedStorageKey() {
      return `AFTER_SALE_DELETED_${this.type}`
    },
    loadDeletedRecords() {
      if (this.localDeletedRecords.length) return
      this.localDeletedRecords = uni.getStorageSync(this.deletedStorageKey()) || []
    },
    loadDeletedOrders() {
      this.deletedOrderIds = uni.getStorageSync('ORDER_DELETED_IDS') || []
    },
    rememberDeletedRecord(afterSaleId, orderNo) {
      this.loadDeletedRecords()
      const record = { afterSaleId: String(afterSaleId || ''), orderNo: String(orderNo || '') }
      if (!record.afterSaleId && !record.orderNo) return
      const exists = this.localDeletedRecords.some((item) => item.afterSaleId === record.afterSaleId && item.orderNo === record.orderNo)
      if (!exists) this.localDeletedRecords.push(record)
      uni.setStorageSync(this.deletedStorageKey(), this.localDeletedRecords.slice(-100))
    },
    isLocallyDeleted(item = {}) {
      this.loadDeletedRecords()
      const itemId = String(this.afterSaleId(item) || '')
      const itemOrders = this.orderIdentityList(item)
      return this.localDeletedRecords.some((record) => {
        if (record.afterSaleId && itemId && record.afterSaleId === itemId) return true
        if (record.orderNo && itemOrders.includes(record.orderNo) && this.type !== AfterSaleType.NORMAL) return true
        return false
      })
    },
    isOrderDeleted(item = {}) {
      this.loadDeletedOrders()
      const itemOrders = this.orderIdentityList(item)
      return itemOrders.some((itemOrder) => this.deletedOrderIds.includes(itemOrder))
    },
    removeAfterSaleFromList(afterSaleId, orderNo) {
      const idText = String(afterSaleId || '')
      const orderText = String(orderNo || '')
      this.lists = (this.lists || []).filter((item) => {
        const itemId = String(this.afterSaleId(item) || '')
        const itemOrders = this.orderIdentityList(item)
        if (idText && itemId === idText) return false
        if (orderText && itemOrders.includes(orderText) && this.type !== AfterSaleType.NORMAL) return false
        return true
      })
    },
    onAfterSaleDeleted(payload = {}) {
      this.rememberDeletedRecord(payload.afterSaleId, payload.orderNo)
      this.removeAfterSaleFromList(payload.afterSaleId, payload.orderNo)
    },
    onOrderDeleted(payload = {}) {
      this.loadDeletedOrders()
      const ids = [
        payload.orderId,
        payload.orderNo,
        payload.order_sn,
        payload.orderSn,
        payload.bizOrderNo,
        payload.biz_order_no,
        payload.subOrderNo,
        payload.sub_order_no
      ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
      ids.forEach((id) => {
        if (!this.deletedOrderIds.includes(id)) this.deletedOrderIds.push(id)
      })
      uni.setStorageSync('ORDER_DELETED_IDS', this.deletedOrderIds.slice(-200))
      this.lists = (this.lists || []).filter((item) => !this.isOrderDeleted(item))
    },

    hideDialog() {
      this.confirmDialog = false;
    },
  },
};
</script>
<style lang="scss">
.sale-list {
  padding: 24rpx;
  max-width: 750rpx;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sale-item {
  margin-bottom: 24rpx;
  border-radius: 22rpx;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);
}

.sale-header {
  align-items: center;
  padding: 24rpx 24rpx 12rpx;
  color: #667085;
  font-size: 24rpx;
  line-height: 34rpx;
}

.store-name {
  color: #667085;
  font-size: 24rpx;
  line-height: 34rpx;
}

.sale-goods-show {
  display: block;
  padding: 24rpx;
}

.goods-item + .goods-item,
.sale-goods-show + .sale-goods-show {
  border-top: 1rpx solid #f0f2f5;
}

.goods-img {
  width: 160rpx;
  height: 160rpx;
  flex: none;
  border-radius: 14rpx;
  overflow: hidden;
  background: #f4f6f8;
}

.goods-desc {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
}

.goods-name {
  color: #172033;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
  word-break: break-all;
}

.sale-status {
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
  color: #344054;
  background: #fff8ed;
}

.sale-status view:first-child {
  flex: none;
  color: #667085;
}

.sale-status view:last-child {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
  color: #a0610d;
  font-weight: 600;
  text-align: right;
}

.refund-summary {
  margin-top: 22rpx;
  padding: 20rpx 22rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #fff8f7 0%, #fff1f1 100%);
  border: 1rpx solid rgba(160, 97, 13, .08);
}

.refund-summary__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refund-summary__label {
  color: #475467;
  font-size: 26rpx;
  font-weight: 600;
}

.refund-summary__price {
  color: #a0610d;
  font-weight: 700;
}

.refund-summary__empty {
  color: #a0610d;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.refund-summary__desc {
  display: block;
  margin-top: 8rpx;
  color: #98a2b3;
  font-size: 22rpx;
  line-height: 32rpx;
}

.sale-meta {
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: #f8fafc;
}

.sale-meta-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  color: #8b9098;
  font-size: 24rpx;
  line-height: 36rpx;
}

.sale-meta-row + .sale-meta-row {
  margin-top: 8rpx;
}

.sale-meta-row text:first-child {
  flex: none;
  width: 120rpx;
}

.sale-meta-row text:last-child {
  flex: 1;
  min-width: 0;
  color: #30343b;
  text-align: right;
  word-break: break-all;
}

.sale-footer {
  padding: 0 24rpx 24rpx;
}

.sale-footer .btn,
.sale-footer .grey-btn {
  min-width: 154rpx;
  height: 60rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  line-height: 60rpx;
  box-sizing: border-box;
}

.sale-footer .btn {
  color: #a0610d;
  border: 1rpx solid rgba(160, 97, 13, .45);
  background: #fff7f8;
}

.sale-footer .grey-btn {
  color: #4b5563;
  border: 1rpx solid #d8dee8;
  background: #ffffff;
}

.bottom-opacity {
  opacity: 0.5;
}

.data-null {
  padding-top: 180rpx;
}

.tips-dialog {
  height: 230rpx;
  width: 100%;
}
</style>
