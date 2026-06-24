<template>
  <view class="shop-cart-page">
    <view class="shop-cart-page__screen">
      <view class="shop-cart-page__top">
        <view class="shop-cart-page__title">购物车({{ cartCountText }})</view>
        <view v-if="isLogin && cartType === 1" class="shop-cart-page__manage" @tap="toggleManageMode">
          {{ isManageMode ? '完成' : '管理' }}
        </view>
      </view>

      <view v-if="isLogin" class="shop-cart-page__content">
        <view v-if="cartType === 1" class="cart-list">
          <view v-for="(item, index) in cartLists" :key="item.cart_id || index" class="cart-card">
            <view class="cart-card__shop">
              <view
                class="cart-check"
                :class="{ 'is-checked': item.selected == 1 && item.cart_status == 0, 'is-disabled': item.cart_status != 0 }"
                @tap="item.cart_status == 0 && changOneSelect(item.cart_id, item.selected)"
              >
                <u-icon v-if="item.selected == 1 && item.cart_status == 0" name="checkbox-mark" color="#ffffff" size="16"></u-icon>
              </view>
              <text class="cart-card__shop-name line1">{{ item.shop_name || '商城自营' }}</text>
              <text v-if="item.cart_status != 0" class="cart-card__invalid">已失效</text>
            </view>

            <view class="cart-card__goods">
              <view
                class="cart-check cart-card__goods-check"
                :class="{ 'is-checked': item.selected == 1 && item.cart_status == 0, 'is-disabled': item.cart_status != 0 }"
                @tap="item.cart_status == 0 && changOneSelect(item.cart_id, item.selected)"
              >
                <u-icon v-if="item.selected == 1 && item.cart_status == 0" name="checkbox-mark" color="#ffffff" size="16"></u-icon>
              </view>

              <view class="cart-card__body">
                <view class="cart-card__image-wrap" @tap="goGoodsDetail(item.goods_id)">
                  <image v-if="item.img || item.image" class="cart-card__image" :src="item.img || item.image" mode="aspectFill"></image>
                  <view v-else class="cart-card__image cart-card__image--empty">商品</view>
                </view>
                <view class="cart-card__info">
                  <view class="cart-card__name line2" @tap="goGoodsDetail(item.goods_id)">{{ item.name }}</view>
                  <view class="cart-card__spec line1" @tap="goGoodsDetail(item.goods_id)">{{ item.spec_value_str || '默认规格' }}</view>
                  <view class="cart-card__bottom">
                    <view class="cart-card__price">
                      <price-format
                        :price="item.price"
                        :firstSize="38"
                        :secondSize="26"
                        :subscriptSize="26"
                        :weight="500"
                        color="#FF2C3C"
                      ></price-format>
                    </view>
                    <view class="cart-card__num" @tap.stop.prevent="noop">
                      <u-number-box
                        v-model="item.goods_num"
                        :min="1"
                        :max="getItemStock(item)"
                        :disabled="item.cart_status != 0"
                        :bgColor="'#F3F6FA'"
                        :inputWidth="64"
                        :inputHeight="50"
                        :size="24"
                        @input="onNumberBoxChange($event, item)"
                        @change="onNumberBoxChange($event, item)"
                        @plus="onNumberBoxChange($event, item)"
                        @minus="onNumberBoxChange($event, item)"
                        @blur="onNumberBoxChange($event, item)"
                      ></u-number-box>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="cartType === 2" class="cart-empty">
          <u-empty mode="car" text="购物车暂无任何商品~" :iconSize="160" color="#999999">
            <view slot="bottom" class="cart-empty__action">
              <navigator open-type="switchTab" url="/pages/index/index" hover-class="none" class="cart-empty__btn">去逛逛</navigator>
            </view>
          </u-empty>
        </view>
      </view>

      <view v-else class="cart-login">
        <u-empty mode="car" text="登录后才能查看购物车哦" :iconSize="160" color="#999999">
          <view slot="bottom" class="cart-empty__action">
            <navigator class="cart-empty__btn cart-empty__btn--login" url="/bundle/pages/login/login" hover-class="none">去登录</navigator>
          </view>
        </u-empty>
      </view>
    </view>

    <view v-if="isLogin && cartType === 1" class="cart-footer">
      <view class="cart-footer__summary">
        <view class="cart-footer__check" @tap="changeAllSelect">
          <view class="cart-check" :class="{ 'is-checked': isSelectedAll }">
            <u-icon v-if="isSelectedAll" name="checkbox-mark" color="#ffffff" size="16"></u-icon>
          </view>
          <text class="cart-footer__check-text">已选{{ selectedCount }}件</text>
        </view>
        <view v-if="!isManageMode" class="cart-footer__price">
          <text class="cart-footer__price-label">合计：</text>
          <text class="cart-footer__price-value">¥{{ totalPriceText }}</text>
        </view>
      </view>
      <view v-if="isManageMode" class="cart-footer__delete" :class="{ disabled: nullSelect }" @tap="deleteSelectedGoods">删除</view>
      <view v-else class="cart-footer__pay" :class="{ disabled: nullSelect }" @tap="goToConfirm">立即支付</view>
    </view>

    <u-modal
      v-model="delPopup"
      :showCancelButton="true"
      confirm-text="狠心删除"
      confirm-color="#FF2C3C"
      :show-title="false"
      @confirm="goodsDelete"
      @cancel="changeDelPopup"
    >
      <view class="cart-delete-dialog">
        <image class="cart-delete-dialog__icon" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_warning.png"></image>
        <view class="cart-delete-dialog__text">确认删除该商品吗？</view>
      </view>
    </u-modal>
  </view>
</template>

<script>
import { getCartList, changeCartSelect, changeGoodsCount, deleteGoods } from "@/api/store";
import { mapGetters, mapActions } from "vuex";
import { setTabbar } from "@/utils/tools";
import { designAssets } from "@/utils/design-assets";
import UModal from '@/components/uview-ui/components/u-modal/u-modal.vue'

export default {
  components: {
    UModal
  },
  data() {
    return {
      designAssets,
      cartType: 0,
      cartLists: [],
      delPopup: false,
      totalPrice: 0,
      cartId: "",
      isManageMode: false,
      countSyncTimers: {},
      cartLoading: false,
    };
  },
  computed: {
    ...mapGetters(["cartNum", "isLogin"]),
    cartCountText() {
      return this.localCartCount;
    },
    localCartCount() {
      return this.cartLists.reduce((sum, item) => {
        if (item.cart_status != 0) return sum;
        return sum + Number(item.goods_num || item.quantity || item.num || 0);
      }, 0);
    },
    nullSelect() {
      return this.cartLists.findIndex((item) => item.selected == 1 && item.cart_status == 0) === -1;
    },
    isSelectedAll() {
      return this.cartLists.length > 0 && this.cartLists.findIndex((item) => item.selected == 0 && item.cart_status == 0) === -1;
    },
    selectedCount() {
      return this.cartLists.filter((item) => item.selected == 1 && item.cart_status == 0).length;
    },
    totalPriceText() {
      const value = this.cartLists.reduce((sum, item) => {
        if (item.selected != 1 || item.cart_status != 0) return sum;
        return sum + Number(item.price || 0) * Number(item.goods_num || item.quantity || 0);
      }, 0);
      return value.toFixed(2);
    }
  },
  onLoad() {
    setTabbar();
  },
  onShow() {
    if (this.isLogin) {
      this.getCartListFun();
    } else {
      this.cartType = 0;
      this.cartLists = [];
    }
  },
  onPullDownRefresh() {
    if (this.isLogin) {
      this.getCartListFun();
      return;
    }
    uni.stopPullDownRefresh();
  },
  methods: {
    ...mapActions(["getCartNum"]),
    async goodsDelete() {
      this.delPopup = false;
      const ids = Array.isArray(this.cartId) ? this.cartId : [this.cartId];
      const results = await Promise.all(ids.map((id) => deleteGoods({ cart_id: id })));
      const res = results.find((item) => item.code != 1) || { code: 1 };
      if (res.code == 1) {
        const wasBatchDelete = Array.isArray(this.cartId);
        this.cartId = "";
        if (wasBatchDelete) this.isManageMode = false;
        this.getCartListFun();
      }
    },
    changeDelPopup(cartId) {
      if (cartId) {
        this.cartId = cartId;
      }
      this.delPopup = !this.delPopup;
    },
    async getCartListFun() {
      if (this.cartLoading) {
        uni.stopPullDownRefresh();
        return;
      }
      this.cartLoading = true;
      try {
        const res = await getCartList();
        if (res.code == 1) {
          const { lists = [], total_amount = 0 } = res.data || {};
          this.cartLists = lists;
          this.cartType = lists.length ? 1 : 2;
          this.totalPrice = total_amount;
          this.getCartNum(
            this.cartLists.reduce((sum, item) => {
              const count = Number(item.goods_num || item.quantity || item.num || 0);
              return sum + count;
            }, 0)
          );
        }
      } finally {
        this.cartLoading = false;
        uni.stopPullDownRefresh();
      }
    },
    changOneSelect(cartId, selected) {
      this.changeCartSelectFun([cartId], !selected);
    },
    changeAllSelect() {
      const cartid = this.cartLists.filter((item) => item.cart_status == 0).map((item) => item.cart_id);
      this.changeCartSelectFun(cartid, !this.isSelectedAll);
    },
    toggleManageMode() {
      this.isManageMode = !this.isManageMode;
    },
    noop() {},
    goGoodsDetail(goodsId) {
      if (!goodsId) return;
      uni.navigateTo({
        url: `/bundle/pages/goods_details/goods_details?id=${goodsId}`,
      });
    },
    deleteSelectedGoods() {
      const ids = this.cartLists.filter((item) => item.selected == 1 && item.cart_status == 0).map((item) => item.cart_id);
      if (!ids.length) {
        this.$toast({ title: "请选择要删除的商品" });
        return;
      }
      this.cartId = ids;
      this.delPopup = true;
    },
    async changeCartSelectFun(cartId, selected) {
      const ids = Array.isArray(cartId) ? cartId : [cartId];
      const selectedValue = selected ? 1 : 0;
      this.cartLists = this.cartLists.map((item) => ids.includes(item.cart_id) ? { ...item, selected: selectedValue } : item);
      try {
        await Promise.all(ids.map((id) => changeCartSelect({
          cart_id: id,
          selected: selectedValue,
          checked: selectedValue,
        })));
      } finally {
        this.getCartListFun();
      }
    },
    isMaxCount(item) {
      const stock = this.getItemStock(item);
      if (!stock) return false;
      return Number(item.goods_num || 1) >= stock;
    },
    getItemStock(item = {}) {
      return Number(item.item_stock || item.stock || 999999);
    },
    changeItemCount(item, step) {
      if (!item || item.cart_status != 0) return;
      const currentCount = Number(item.goods_num || item.quantity || 1);
      const stock = Number(item.item_stock || item.stock || 0);
      let nextValue = currentCount + step;
      if (nextValue < 1) return;
      if (stock && nextValue > stock) return;
      this.updateCartItemCount(item.cart_id, nextValue);
    },
    normalizeCartCount(value, item = {}) {
      let nextValue = parseInt(value, 10);
      if (!nextValue || Number.isNaN(nextValue) || nextValue < 1) nextValue = 1;
      const stock = Number(item.item_stock || item.stock || 0);
      if (stock && nextValue > stock) nextValue = stock;
      return nextValue;
    },
    onCountInput(event, item) {
      if (!item || item.cart_status != 0) return;
      const rawValue = event?.detail?.value;
      const nextValue = rawValue === '' ? '' : this.normalizeCartCount(rawValue, item);
      this.cartLists = this.cartLists.map((cartItem) => String(cartItem.cart_id) === String(item.cart_id) ? { ...cartItem, goods_num: nextValue, quantity: nextValue } : cartItem);
    },
    onCountBlur(event, item) {
      if (!item || item.cart_status != 0) return;
      const nextValue = this.normalizeCartCount(event?.detail?.value, item);
      this.updateCartItemCount(item.cart_id, nextValue);
    },
    onNumberBoxChange(event, item) {
      if (!item || item.cart_status != 0) return;
      const value = event?.value ?? event?.detail?.value ?? event;
      this.updateCartItemCount(item.cart_id, value);
    },
    updateCartItemCount(cartId, nextValue) {
      const current = this.cartLists.find((item) => String(item.cart_id) === String(cartId)) || {};
      nextValue = this.normalizeCartCount(nextValue, current);
      const index = this.cartLists.findIndex((item) => String(item.cart_id) === String(cartId));
      if (index === -1) return;
      this.$set(this.cartLists, index, {
        ...this.cartLists[index],
        goods_num: nextValue,
        quantity: nextValue,
      });
      this.getCartNum(this.localCartCount);
      if (this.countSyncTimers[cartId]) clearTimeout(this.countSyncTimers[cartId]);
      const timer = setTimeout(async () => {
        await changeGoodsCount({
          cart_id: cartId,
          goods_num: nextValue,
        });
        this.$delete(this.countSyncTimers, cartId);
        this.getCartListFun();
      }, 250);
      this.$set(this.countSyncTimers, cartId, timer);
    },
    goToConfirm() {
      const goods = [];
      this.cartLists.forEach((item) => {
        if (item.selected && item.cart_status == 0) {
          goods.push({
            item_id: item.item_id,
            num: item.goods_num,
          });
        }
      });
      if (!goods.length) {
        return this.$toast({
          title: "您还没有选择商品哦",
        });
      }
      uni.navigateTo({
        url:
          "/bundle/pages/confirm_order/confirm_order?data=" +
          encodeURIComponent(
            JSON.stringify({
              goods,
              type: "cart",
            })
          ),
      });
    },
  },
};
</script>

<style lang="scss">
.shop-cart-page {
  min-height: 100vh;
  background: #f6f7fb;
}

.shop-cart-page__screen {
  min-height: 100vh;
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.shop-cart-page__status {
  display: block;
  width: 100%;
  height: 44rpx;
}

.shop-cart-page__top {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: calc(var(--status-bar-height) + 18rpx) 180rpx 28rpx 28rpx;
}

.shop-cart-page__title {
  color: #232323;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 56rpx;
}

.shop-cart-page__manage {
  flex: none;
  margin-left: 22rpx;
  color: #0d7cf2;
  font-size: 28rpx;
  line-height: 44rpx;
  white-space: nowrap;
}

.shop-cart-page__menu {
  width: 258rpx;
  height: 68rpx;
  flex-shrink: 0;
}

.shop-cart-page__content {
  padding: 0 24rpx;
}

.cart-list {
  display: flex;
  flex-direction: column;
}

.cart-card {
  position: relative;
  padding: 20rpx 0 18rpx;
  margin-bottom: 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 26rpx rgba(20, 40, 80, 0.04);
}

.cart-card__shop {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0 24rpx;
}

.cart-card__shop-name {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
  color: #222222;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
}

.cart-card__invalid {
  margin-left: auto;
  color: #999999;
  font-size: 24rpx;
}

.cart-card__goods {
  display: flex;
  align-items: flex-start;
  margin-top: 20rpx;
  padding: 0 24rpx;
}

.cart-card__goods-check {
  margin-top: 42rpx;
}

.cart-card__body {
  display: flex;
  flex: 1;
  align-items: flex-start;
  min-width: 0;
  margin-left: 18rpx;
}

.cart-card__image-wrap {
  flex: none;
  width: 166rpx;
  height: 166rpx;
  border-radius: 18rpx;
  background: #f0f3f8;
  overflow: hidden;
}

.cart-card__image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #a8b0bf;
  font-size: 24rpx;
  background: #f0f3f8;
}

.cart-card__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 166rpx;
  margin-left: 20rpx;
}

.cart-card__name {
  color: #222222;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 38rpx;
}

.cart-card__spec {
  margin-top: 10rpx;
  color: #a0a0a0;
  font-size: 22rpx;
  line-height: 30rpx;
}

.cart-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  margin-top: auto;
}

.cart-card__price {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.cart-card__num {
  flex: none;
  display: flex;
  align-items: center;
  height: 50rpx;
  margin-left: 12rpx;
}

.cart-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 50%;
  background: #ffffff;
  box-sizing: border-box;

  &.is-checked {
    border-color: #0d7cf2;
    background: #0d7cf2;
  }

  &.is-disabled {
    opacity: 0.45;
  }
}

.cart-empty,
.cart-login {
  min-height: calc(100vh - 320rpx);
  padding-top: 140rpx;
  box-sizing: border-box;
}

.cart-empty__action {
  margin-top: 28rpx;
}

.cart-empty__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220rpx;
  height: 76rpx;
  border-radius: 38rpx;
  border: 2rpx solid #0d7cf2;
  color: #0d7cf2;
  font-size: 28rpx;
}

.cart-empty__btn--login {
  background: #0d7cf2;
  color: #ffffff;
}

.cart-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: calc(96rpx + env(safe-area-inset-bottom));
  padding: 10rpx 20rpx 0;
  background: #ffffff;
  box-shadow: 0 -8rpx 28rpx rgba(17, 24, 39, 0.06);
  box-sizing: border-box;
}

.cart-footer__summary {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 12rpx;
}

.cart-footer__check {
  display: flex;
  align-items: center;
  flex: none;
  max-width: 132rpx;
}

.cart-footer__check-text {
  margin-left: 8rpx;
  color: #8a8a8a;
  font-size: 22rpx;
  white-space: nowrap;
}

.cart-footer__price {
  display: flex;
  align-items: baseline;
  flex: 1;
  min-width: 0;
  margin-left: 10rpx;
  white-space: nowrap;
}

.cart-footer__price-label {
  flex: none;
  color: #232323;
  font-size: 22rpx;
}

.cart-footer__price-value {
  min-width: 0;
  color: #ff2c2c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 44rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-footer__pay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 184rpx;
  height: 68rpx;
  border-radius: 38rpx;
  background: #0d7cf2;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;

  &.disabled {
    background: #d7dbe2;
    color: #ffffff;
  }
}

.cart-footer__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 184rpx;
  height: 68rpx;
  border-radius: 38rpx;
  background: #ff2c3c;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;

  &.disabled {
    background: #ffd4d8;
  }
}

.cart-delete-dialog {
  padding-top: 40rpx;
  text-align: center;
}

.cart-delete-dialog__icon {
  width: 104rpx;
  height: 104rpx;
}

.cart-delete-dialog__text {
  margin: 30rpx 0 10rpx;
  color: #222222;
  font-size: 30rpx;
  line-height: 42rpx;
}
</style>
