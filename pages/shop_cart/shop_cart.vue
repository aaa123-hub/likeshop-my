<template>
  <view class="shop-cart-page">
    <view class="shop-cart-page__screen">
      <view class="shop-cart-page__top">
        <view class="shop-cart-page__title">购物车({{ cartCountText }})</view>
        <view v-if="isLogin && cartType === 1" class="shop-cart-page__manage" @tap="toggleManageMode">
          {{ isManageMode ? '完成' : '管理' }}
        </view>
        <view class="shop-cart-page__capsule">
          <view class="shop-cart-page__capsule-dot"></view>
          <view class="shop-cart-page__capsule-divider"></view>
          <view class="shop-cart-page__capsule-circle"></view>
        </view>
      </view>

      <view v-if="isLogin" class="shop-cart-page__content">
        <view v-if="cartType === 1" class="cart-list">
          <view v-for="(item, index) in cartLists" :key="index" class="cart-card">
            <view class="cart-card__shop">
              <view
                class="cart-check"
                :class="{ 'is-checked': item.selected == 1 && item.cart_status == 0, 'is-disabled': item.cart_status != 0 }"
                @tap="item.cart_status == 0 && changOneSelect(item.cart_id, item.selected)"
              >
                <view v-if="item.selected == 1 && item.cart_status == 0" class="cart-check__mark"></view>
              </view>
              <text class="cart-card__shop-name line1">{{ item.shop_name || item.shopName || '店铺待确认' }}</text>
              <text v-if="item.cart_status != 0" class="cart-card__invalid">已失效</text>
            </view>

            <view class="cart-card__goods">
              <view
                class="cart-check cart-card__goods-check"
                :class="{ 'is-checked': item.selected == 1 && item.cart_status == 0, 'is-disabled': item.cart_status != 0 }"
                @tap="item.cart_status == 0 && changOneSelect(item.cart_id, item.selected)"
              >
                <view v-if="item.selected == 1 && item.cart_status == 0" class="cart-check__mark"></view>
              </view>

              <view class="cart-card__body">
                <view class="cart-card__image-wrap" @tap="goGoodsDetail(item)">
                  <image v-if="item.img || item.image" class="cart-card__image" :src="item.img || item.image" mode="aspectFill"></image>
                  <view v-else class="cart-card__image cart-card__image--empty">商品</view>
                </view>
                <view class="cart-card__info">
                  <view class="cart-card__name line2" @tap="goGoodsDetail(item)">{{ item.name }}</view>
                  <view v-if="item.subtitle" class="cart-card__subtitle line1">{{ item.subtitle }}</view>
                  <view v-if="item.spec_value_str" class="cart-card__spec line1" @tap="goGoodsDetail(item)">{{ item.spec_value_str }}</view>
                  <view v-if="formatCartTags(item).length" class="cart-card__tags">
                    <text v-for="tag in formatCartTags(item)" :key="tag" class="cart-card__tag line1">{{ tag }}</text>
                  </view>
                  <view class="cart-card__meta">
                    <text v-if="item.sales_sum">已售{{ item.sales_sum }}</text>
                    <text v-if="hasItemStock(item)">库存{{ getItemStock(item) }}</text>
                    <text v-if="item.unit">单位：{{ item.unit }}</text>
                    <text v-if="item.weight">{{ item.weight }}</text>
                  </view>
                  <view class="cart-card__bottom">
                    <view class="cart-card__price-wrap">
                      <view class="cart-card__price">
                        <text class="cart-card__price-symbol">¥</text>
                        <text class="cart-card__price-main">{{ formatPrice(item.price)[0] }}</text>
                        <text class="cart-card__price-decimal">.{{ formatPrice(item.price)[1] }}</text>
                      </view>
                      <view v-if="item.market_price && Number(item.market_price) > Number(item.price || 0)" class="cart-card__market">¥{{ formatMoney(item.market_price) }}</view>
                    </view>
                    <view class="cart-card__num u-numberbox">
                      <button
                        class="cart-stepper__btn cart-stepper__btn--minus"
                        :class="{ 'is-disabled': !isCartItemAvailable(item) || item.goods_num <= 1 }"
                        @tap.stop="changeItemCount(index, -1)"
                      >
                        <view class="cart-stepper__icon cart-stepper__icon--minus"></view>
                      </button>
                      <input
                        class="cart-stepper__input u-number-input"
                        type="digit"
                        :disabled="!isCartItemAvailable(item)"
                        :data-cart-id="item.cart_id"
                        :value="item.goods_num"
                        @input="onCountInput($event, index)"
                        @blur="onCountBlur($event, index)"
                      />
                      <button
                        class="cart-stepper__btn cart-stepper__btn--plus"
                        :class="{ 'is-disabled': !isCartItemAvailable(item) || (hasItemStock(item) && item.goods_num >= getItemStock(item)) }"
                        @tap.stop="changeItemCount(index, 1)"
                      >
                        <view class="cart-stepper__icon cart-stepper__icon--plus"></view>
                      </button>
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
            <view v-if="isSelectedAll" class="cart-check__mark"></view>
          </view>
          <text class="cart-footer__check-text">全选</text>
        </view>
        <view v-if="!isManageMode" class="cart-footer__price">
          <view class="cart-footer__price-line">
            <text class="cart-footer__price-label">合计：</text>
            <text class="cart-footer__price-value">¥{{ totalPriceText }}</text>
          </view>
          <text class="cart-footer__selected">已选{{ selectedCount }}件</text>
        </view>
      </view>
      <view v-if="isManageMode" class="cart-footer__delete" :class="{ disabled: nullSelect }" @tap="deleteSelectedGoods">删除</view>
      <view v-else class="cart-footer__pay" :class="{ disabled: nullSelect }" @tap="goToConfirm">去结算</view>
    </view>

    <u-modal
      v-model="delPopup"
      :showCancelButton="true"
      confirm-text="狠心删除"
      confirm-color="#a0610d"
      :show-title="false"
      @confirm="goodsDelete"
      @cancel="changeDelPopup"
    >
      <view class="cart-delete-dialog">
        <view class="cart-delete-dialog__icon">
          <view class="cart-delete-dialog__icon-mark"></view>
        </view>
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
      const availableItems = this.cartLists.filter((item) => item.cart_status == 0);
      return availableItems.length > 0 && availableItems.findIndex((item) => item.selected == 0) === -1;
    },
    selectedCount() {
      return this.cartLists.reduce((sum, item) => {
        if (item.selected != 1 || item.cart_status != 0) return sum;
        return sum + Number(item.goods_num || item.quantity || item.num || 0);
      }, 0);
    },
    totalPrice() {
      return this.cartLists.reduce((sum, item) => {
        if (item.selected != 1 || item.cart_status != 0) return sum;
        return sum + this.getCartItemPrice(item) * this.getCartItemCount(item);
      }, 0);
    },
    totalPriceText() {
      return this.totalPrice.toFixed(2);
    },
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
      return this.getCartListFun();
    }
    uni.stopPullDownRefresh();
  },
  onUnload() {
    this.clearCountSyncTimers();
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
        this.$toast({ title: wasBatchDelete ? '已删除选中商品' : '商品已删除', icon: 'success' });
        this.getCartListFun();
      } else {
        this.$toast({ title: '删除失败，请稍后重试' });
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
          const { lists = [] } = res.data || {};
          this.cartLists = lists.map((item) => this.normalizeCartItem(item));
          this.cartType = lists.length ? 1 : 2;
          this.syncCartBadgeCount();
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
    goGoodsDetail(item) {
      const goodsId = typeof item === 'object' ? item.goods_id : item;
      if (!goodsId) return;
      const skuId = typeof item === 'object' ? (item.item_id || item.sku_id || item.skuId || item.itemSkuId || '') : '';
      const query = skuId ? `&skuId=${encodeURIComponent(skuId)}&itemId=${encodeURIComponent(skuId)}` : '';
      uni.navigateTo({
        url: `/bundle/pages/goods_details/goods_details?id=${goodsId}${query}`,
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
      if (!ids.length || ids.some((id) => !id)) return;
      const selectedValue = selected ? 1 : 0;
      this.cartLists = this.cartLists.map((item) => {
        if (!ids.includes(item.cart_id)) return item;
        return Object.assign({}, item, { selected: selectedValue });
      });
      this.syncCartBadgeCount();
      try {
        await Promise.all(ids.map((id) => changeCartSelect({
          cart_id: id,
          selected: selectedValue,
          checked: selectedValue,
        })));
        uni.showToast({ title: selectedValue ? '已选中商品' : '已取消选中', icon: 'none' });
      } catch (error) {
        uni.showToast({ title: '购物车状态同步失败', icon: 'none' });
      } finally {
        this.getCartListFun();
      }
    },
    isMaxCount(item) {
      const stock = this.getItemStock(item);
      if (!stock) return false;
      return Number(item.goods_num || 1) >= stock;
    },
    hasItemStock(item = {}) {
      return item.item_stock !== undefined || item.stock !== undefined;
    },
    getItemStock(item = {}) {
      const stock = Number(item.item_stock ?? item.stock ?? 0);
      return Number.isNaN(stock) ? 0 : stock;
    },
    formatPrice(value) {
      return Number(value || 0).toFixed(2).split('.');
    },
    formatMoney(value) {
      const price = Number(value || 0);
      return price.toFixed(price % 1 === 0 ? 0 : 2);
    },
    formatCartTags(item = {}) {
      const tags = Array.isArray(item.service_tags) ? item.service_tags : [];
      return tags.map((tag) => typeof tag === 'string' ? tag : (tag.name || tag.title || tag.label || '')).filter(Boolean).slice(0, 3);
    },
    normalizeCartStatus(value) {
      if (value === undefined || value === null || value === '') return 0;
      if (value === 0 || value === '0') return 0;
      const text = String(value).toUpperCase();
      if (['ACTIVE', 'VALID', 'NORMAL', 'AVAILABLE', 'ON_SALE', 'ENABLE', 'ENABLED'].includes(text)) return 0;
      return value;
    },
    isCartItemAvailable(item = {}) {
      return this.normalizeCartStatus(item.cart_status !== undefined ? item.cart_status : item.cartStatus) == 0;
    },
    getCartItemPrice(item = {}) {
      const price = Number(
        item.price ??
        item.goods_price ??
        item.sell_price ??
        item.member_price ??
        item.salePrice ??
        item.unitPrice ??
        item.sale_price ??
        item.pay_price ??
        0
      );
      return Number.isNaN(price) ? 0 : price;
    },
    getCartItemCount(item = {}) {
      const count = Number(item.goods_num || item.quantity || item.num || 0);
      return Number.isNaN(count) ? 0 : count;
    },
    syncCartBadgeCount() {
      this.getCartNum(this.localCartCount);
      setTabbar();
    },
    normalizeCartItem(item = {}) {
      const count = Number(item.goods_num || item.quantity || item.num || 1);
      const cartId = item.cart_id || item.cartItemId || item.id;
      return Object.assign({}, item, {
        id: item.id || cartId,
        cart_id: cartId,
        cartItemId: item.cartItemId || cartId,
        goods_num: count,
        quantity: count,
        num: count,
        selected: item.selected !== undefined ? item.selected : (item.checked !== undefined ? item.checked : 1),
        cart_status: this.normalizeCartStatus(item.cart_status !== undefined ? item.cart_status : (item.cartStatus !== undefined ? item.cartStatus : item.status))
      });
    },
    changeItemCount(index, step) {
      const item = this.cartLists[index];
      if (!item || !this.isCartItemAvailable(item)) return;
      const currentCount = Number(item.goods_num || item.quantity || 1);
      const stock = this.getItemStock(item);
      let nextValue = currentCount + step;
      if (nextValue < 1) return;
      if (this.hasItemStock(item) && nextValue > stock) return;
      this.updateCartItemCount(index, nextValue, true);
    },
    normalizeCartCount(value, item = {}) {
      let nextValue = parseInt(value, 10);
      if (!nextValue || Number.isNaN(nextValue) || nextValue < 1) nextValue = 1;
      const stock = this.getItemStock(item);
      if (this.hasItemStock(item) && stock > 0 && nextValue > stock) nextValue = stock;
      return nextValue;
    },
    onCountInput(event, index) {
      const item = this.cartLists[index];
      if (!item || !this.isCartItemAvailable(item)) return;
      const rawValue = event && event.detail ? event.detail.value : undefined;
      const nextValue = rawValue === '' ? '' : this.normalizeCartCount(rawValue, item);
      this.setCartItemCount(index, nextValue);
      this.syncCartBadgeCount();
    },
    onCountBlur(event, index) {
      const item = this.cartLists[index];
      if (!item || !this.isCartItemAvailable(item)) return;
      const nextValue = this.normalizeCartCount(event && event.detail ? event.detail.value : undefined, item);
      this.updateCartItemCount(index, nextValue, true);
    },
    updateCartItemCount(index, nextValue, shouldSync = false) {
      const current = this.cartLists[index] || {};
      nextValue = this.normalizeCartCount(nextValue, current);
      if (index < 0 || !current.cart_id) return;
      this.setCartItemCount(index, nextValue);
      this.syncCartBadgeCount();
      if (!shouldSync) return;
      this.syncCartItemCount(current.cart_id, nextValue);
    },
    syncCartItemCount(cartId, nextValue) {
      if (this.countSyncTimers[cartId]) clearTimeout(this.countSyncTimers[cartId]);
      const timer = setTimeout(async () => {
        try {
          const res = await changeGoodsCount({
            cart_id: cartId,
            goods_num: nextValue,
          });
          if (res.code != 1) {
            uni.showToast({ title: '数量同步失败，请稍后重试', icon: 'none' });
            this.getCartListFun();
          } else {
            uni.showToast({ title: '数量已更新', icon: 'none' });
          }
        } catch (error) {
          uni.showToast({ title: '数量同步失败', icon: 'none' });
          this.getCartListFun();
        }
        this.removeCountSyncTimer(cartId);
      }, 250);
      this.setCountSyncTimer(cartId, timer);
    },
    setCountSyncTimer(cartId, timer) {
      const timers = Object.assign({}, this.countSyncTimers);
      timers[cartId] = timer;
      this.countSyncTimers = timers;
    },
    removeCountSyncTimer(cartId) {
      const timers = Object.assign({}, this.countSyncTimers);
      delete timers[cartId];
      this.countSyncTimers = timers;
    },
    clearCountSyncTimers() {
      Object.keys(this.countSyncTimers).forEach((cartId) => {
        clearTimeout(this.countSyncTimers[cartId]);
      });
      this.countSyncTimers = {};
    },
    setCartItemCount(index, nextValue) {
      if (index === -1) return;
      const count = nextValue === '' ? '' : Number(nextValue || 0);
      const nextItem = Object.assign({}, this.cartLists[index], {
          goods_num: count,
          quantity: count,
          num: count
      });
      this.cartLists.splice(index, 1, nextItem);
    },
    goToConfirm() {
      const goods = [];
      this.cartLists.forEach((item) => {
        if (item.selected && item.cart_status == 0) {
          goods.push({
            cart_id: item.cart_id,
            cartItemId: item.cart_id,
            item_id: item.item_id,
            skuId: item.sku_id || item.skuId || item.item_id,
            goods_id: item.goods_id || item.goodsId || item.spuId || item.spu_id || item.productId || item.product_id,
            goodsId: item.goodsId || item.goods_id || item.spuId || item.spu_id || item.productId || item.product_id,
            spuId: item.spuId || item.spu_id || item.goods_id || item.goodsId || item.productId || item.product_id,
            productId: item.productId || item.product_id || item.goods_id || item.goodsId || item.spuId || item.spu_id,
            goods_name: item.goods_name || item.name,
            name: item.name || item.goods_name,
            image: item.image || item.img,
            goods_price: item.price || item.goods_price,
            spec_value_str: item.spec_value_str,
            shop_id: item.shop_id || item.shopId,
            shopId: item.shopId || item.shop_id,
            shop_name: item.shop_name || item.shopName,
            shopName: item.shopName || item.shop_name,
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
  --page-safe-top: var(--status-bar-height, 44rpx);
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9f0 0%, #fffdf8 100%);
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
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: calc(var(--page-safe-top) + 23rpx) 180rpx 24rpx 25rpx;
}

/* #ifdef MP-WEIXIN */
.shop-cart-page__top {
  padding-right: 220rpx;
}
/* #endif */

.shop-cart-page__title {
  min-width: 0;
  color: #232323;
  font-size: 36rpx;
  font-weight: 500;
  line-height: 36rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-cart-page__manage {
  flex: none;
  margin-left: 22rpx;
  color: #a0610d;
  font-size: 28rpx;
  line-height: 44rpx;
  white-space: nowrap;
}

.shop-cart-page__capsule {
  position: absolute;
  right: 24rpx;
  top: calc(var(--page-safe-top) + 22rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 168rpx;
  height: 64rpx;
  padding: 0 19rpx;
  border: 1rpx solid transparent;
  border-radius: 32rpx;
  background: transparent;
  box-sizing: border-box;
  opacity: 0;
}

.shop-cart-page__capsule-dot {
  width: 46rpx;
  height: 12rpx;
  border-top: 6rpx dotted #222222;
  box-sizing: border-box;
}

.shop-cart-page__capsule-divider {
  width: 1rpx;
  height: 35rpx;
  background: rgba(0, 0, 0, .16);
}

.shop-cart-page__capsule-circle {
  width: 31rpx;
  height: 31rpx;
  border: 4rpx solid #222222;
  border-radius: 50%;
  box-sizing: border-box;
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
  padding: 24rpx 0 34rpx;
  margin-bottom: 20rpx;
  border-radius: 15rpx;
  background: #fff9f0;
  box-shadow: none;
}

.cart-card__shop {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0 25rpx;
}

.cart-card__shop-name {
  flex: 1;
  min-width: 0;
  margin-left: 15rpx;
  color: #222222;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 28rpx;
}

.cart-card__invalid {
  margin-left: auto;
  color: #999999;
  font-size: 24rpx;
}

.cart-card__goods {
  display: flex;
  align-items: flex-start;
  margin-top: 33rpx;
  padding: 0 17rpx 0 25rpx;
}

.cart-card__goods-check {
  margin-top: 50rpx;
}

.cart-card__body {
  display: flex;
  flex: 1;
  align-items: flex-start;
  min-width: 0;
  margin-left: 22rpx;
}

.cart-card__image-wrap {
  flex: none;
  width: 157rpx;
  height: 157rpx;
  border-radius: 8rpx;
  background: #a5a5a5;
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
  background: #a5a5a5;
}

.cart-card__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 158rpx;
  margin-left: 21rpx;
}

.cart-card__name {
  color: #222222;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 28rpx;
}

.cart-card__spec {
  margin-top: 20rpx;
  color: #999999;
  font-size: 20rpx;
  line-height: 20rpx;
}

.cart-card__subtitle {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 30rpx;
}

.cart-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
  overflow: hidden;
}

.cart-card__tag {
  max-width: 150rpx;
  padding: 0 10rpx;
  color: #a0610d;
  font-size: 20rpx;
  line-height: 30rpx;
  border-radius: 15rpx;
  background: #fff0dc;
  box-sizing: border-box;
}

.cart-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx 16rpx;
  min-height: 28rpx;
  margin-top: 8rpx;
  color: #9aa2af;
  font-size: 20rpx;
  line-height: 28rpx;
}

.cart-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  margin-top: auto;
}

.cart-card__price-wrap {
  flex: 1;
  min-width: 0;
}

.cart-card__price {
  color: #a0610d;
  font-weight: 500;
  white-space: nowrap;
}

.cart-card__market {
  margin-top: 2rpx;
  color: #b5bac4;
  font-size: 20rpx;
  line-height: 28rpx;
  text-decoration: line-through;
}

.cart-card__price-symbol,
.cart-card__price-decimal {
  font-size: 24rpx;
}

.cart-card__price-main {
  font-size: 35rpx;
}

.cart-card__num {
  flex: none;
  display: inline-flex;
  align-items: center;
  height: 50rpx;
  margin-left: 11rpx;
  overflow: visible;
  border-radius: 0;
  background: transparent;
}

.cart-check {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #dfdfdf;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: none;
  box-sizing: border-box;
  overflow: hidden;

  &.is-checked {
    border-color: #a0610d;
    background: #a0610d;
    box-shadow: none;
  }

  &.is-disabled {
    opacity: 0.45;
  }
}

.cart-check__mark {
  width: 16rpx;
  height: 9rpx;
  border-left: 4rpx solid #ffffff;
  border-bottom: 4rpx solid #ffffff;
  transform: rotate(-45deg) translate(1rpx, -1rpx);
}

.cart-stepper__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39rpx;
  height: 39rpx;
  margin: 0;
  padding: 0;
  color: #323233;
  font-size: 0;
  line-height: 39rpx;
  background: #a0610d;
  border-radius: 50%;
  border: 0;
  box-sizing: border-box;
}

.cart-stepper__btn::after {
  border: 0;
}

.cart-stepper__icon {
  position: relative;
  width: 22rpx;
  height: 22rpx;
  color: #fee4cd;
}

.cart-stepper__icon::before,
.cart-stepper__icon--plus::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 22rpx;
  height: 3rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.cart-stepper__icon--plus::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.cart-stepper__btn.is-disabled {
  color: #fee4cd;
  background: rgba(160, 97, 13, 0.55);
}

.cart-stepper__btn--minus {
  border-radius: 50%;
}

.cart-stepper__btn--plus {
  border-radius: 50%;
}

.cart-stepper__input {
  width: 55rpx;
  height: 51rpx;
  min-height: 51rpx;
  margin: 0 18rpx;
  padding: 0;
  color: #323233;
  font-size: 30rpx;
  text-align: center;
  background: #ffffff;
  border-radius: 4rpx;
  box-sizing: border-box;
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
  border: 2rpx solid #a0610d;
  color: #a0610d;
  font-size: 28rpx;
}

.cart-empty__btn--login {
  background: #a0610d;
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
  min-height: calc(113rpx + env(safe-area-inset-bottom));
  padding: 16rpx 44rpx 16rpx 24rpx;
  background: #fff9f0;
  border-radius: 21rpx 21rpx 0 0;
  box-shadow: 0 -3rpx 16rpx rgba(224, 224, 224, 0.67);
  box-sizing: border-box;
}

.cart-footer__summary {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 20rpx;
}

.cart-footer__check {
  display: flex;
  align-items: center;
  flex: none;
  max-width: 124rpx;
}

.cart-footer__check-text {
  margin-left: 8rpx;
  color: #222222;
  font-size: 24rpx;
  white-space: nowrap;
}

.cart-footer__price {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  margin-left: 43rpx;
  white-space: nowrap;
}

.cart-footer__price-line {
  display: flex;
  align-items: baseline;
  max-width: 100%;
}

.cart-footer__price-label {
  flex: none;
  color: #232323;
  font-size: 24rpx;
}

.cart-footer__price-value {
  min-width: 0;
  color: #a0610d;
  font-size: 33rpx;
  font-weight: 500;
  line-height: 44rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-footer__selected {
  margin: 8rpx 0 0 4rpx;
  color: #999999;
  font-size: 24rpx;
  line-height: 24rpx;
}

.cart-footer__pay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 259rpx;
  height: 81rpx;
  border-radius: 40rpx;
  background: #a0610d;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
  white-space: nowrap;

  &.disabled {
    background: rgba(160, 97, 13, 0.45);
    color: #ffffff;
  }
}

.cart-footer__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 259rpx;
  height: 81rpx;
  border-radius: 40rpx;
  background: #a0610d;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: #fff0dc;
  box-sizing: border-box;
}

.cart-delete-dialog__icon::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 19rpx;
  width: 0;
  height: 0;
  border-left: 31rpx solid transparent;
  border-right: 31rpx solid transparent;
  border-bottom: 58rpx solid #ff9900;
  transform: translateX(-50%);
}

.cart-delete-dialog__icon-mark {
  position: relative;
  z-index: 1;
  width: 8rpx;
  height: 30rpx;
  margin-top: 18rpx;
  border-radius: 8rpx;
  background: #ffffff;
}

.cart-delete-dialog__icon-mark::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -13rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #ffffff;
}

.cart-delete-dialog__text {
  margin: 30rpx 0 10rpx;
  color: #222222;
  font-size: 30rpx;
  line-height: 42rpx;
}
</style>
