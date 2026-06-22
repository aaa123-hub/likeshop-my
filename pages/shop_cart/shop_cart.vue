<template>
  <view class="shop-cart-page">
    <view class="shop-cart-page__screen">
      <view class="shop-cart-page__top">
        <view class="shop-cart-page__title">购物车({{ cartCountText }})</view>
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
              <text class="cart-card__shop-name">{{ item.shop_name || '商城自营' }}</text>
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

              <navigator
                class="cart-card__body"
                hover-class="none"
                :url="'/pages/goods_details/goods_details?id=' + item.goods_id"
              >
                <image class="cart-card__image" :src="item.img" mode="aspectFill"></image>
                <view class="cart-card__info">
                  <view class="cart-card__name line2">{{ item.name }}</view>
                  <view class="cart-card__spec line1">{{ item.spec_value_str || '默认规格' }}</view>
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
                  </view>
                </view>
              </navigator>

              <view class="cart-card__actions" @tap.stop="">
                <u-number-box
                  :disabled="item.cart_status != 0"
                  :value="item.goods_num"
                  :min="1"
                  :max="item.item_stock"
                  :bgColor="'#F3F3F3'"
                  :inputWidth="70"
                  :inputHeight="54"
                  :size="28"
                  @change="countChange($event, item.cart_id, item)"
                />
                <view class="cart-card__delete" @tap="changeDelPopup(item.cart_id)">
                  <u-icon name="trash" color="#A7A7A7" size="24"></u-icon>
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
            <navigator class="cart-empty__btn cart-empty__btn--login" url="/pages/login/login" hover-class="none">去登录</navigator>
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
        <view class="cart-footer__price">
          <text class="cart-footer__price-label">合计：</text>
          <text class="cart-footer__price-value">¥{{ totalPriceText }}</text>
        </view>
      </view>
      <view class="cart-footer__pay" :class="{ disabled: nullSelect }" @tap="goToConfirm">立即支付</view>
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
        <image class="cart-delete-dialog__icon" src="/static/images/icon_warning.png"></image>
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

export default {
  data() {
    return {
      designAssets,
      cartType: 0,
      cartLists: [],
      delPopup: false,
      totalPrice: 0,
      cartId: "",
    };
  },
  computed: {
    ...mapGetters(["cartNum", "isLogin"]),
    cartCountText() {
      return this.cartNum || this.cartLists.length || 0;
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
      const value = Number(this.totalPrice || 0);
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
      const res = await deleteGoods({
        cart_id: this.cartId,
      });
      if (res.code == 1) {
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
      const res = await getCartList();
      uni.stopPullDownRefresh();
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
    },
    changOneSelect(cartId, selected) {
      this.changeCartSelectFun([cartId], !selected);
    },
    changeAllSelect() {
      const cartid = this.cartLists.filter((item) => item.cart_status == 0).map((item) => item.cart_id);
      this.changeCartSelectFun(cartid, !this.isSelectedAll);
    },
    async changeCartSelectFun(cartId, selected) {
      const res = await changeCartSelect({
        cart_id: cartId,
        selected: selected ? 1 : 0,
      });
      if (res.code == 1) {
        this.getCartListFun();
      }
    },
    async countChange({ value }, cartId) {
      await changeGoodsCount({
        cart_id: cartId,
        goods_num: value,
      });
      this.getCartListFun();
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
          "/pages/confirm_order/confirm_order?data=" +
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
  padding-bottom: calc(220rpx + var(--window-bottom));
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
  justify-content: space-between;
  padding: calc(var(--status-bar-height) + 18rpx) 28rpx 28rpx;
}

.shop-cart-page__title {
  color: #232323;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 56rpx;
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
  gap: 24rpx;
}

.cart-card {
  padding: 22rpx 0 18rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.cart-card__shop {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.cart-card__shop-name {
  margin-left: 20rpx;
  color: #222222;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
}

.cart-card__invalid {
  margin-left: auto;
  color: #999999;
  font-size: 24rpx;
}

.cart-card__goods {
  display: flex;
  align-items: flex-start;
  margin-top: 28rpx;
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
  margin-left: 24rpx;
}

.cart-card__image {
  width: 158rpx;
  height: 158rpx;
  flex-shrink: 0;
  border-radius: 18rpx;
  background: #f5f5f5;
}

.cart-card__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  margin-left: 24rpx;
}

.cart-card__name {
  color: #222222;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 42rpx;
}

.cart-card__spec {
  margin-top: 12rpx;
  color: #a0a0a0;
  font-size: 22rpx;
  line-height: 30rpx;
}

.cart-card__bottom {
  margin-top: 22rpx;
}

.cart-card__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 158rpx;
  margin-left: 18rpx;
}

.cart-card__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
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
  bottom: calc(var(--window-bottom) + 100rpx);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 24rpx 24rpx;
  background: #ffffff;
  box-shadow: 0 -8rpx 28rpx rgba(17, 24, 39, 0.06);
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
}

.cart-footer__check-text {
  margin-left: 14rpx;
  color: #8a8a8a;
  font-size: 26rpx;
}

.cart-footer__price {
  display: flex;
  align-items: baseline;
  margin-left: 16rpx;
  min-width: 0;
}

.cart-footer__price-label {
  color: #232323;
  font-size: 26rpx;
}

.cart-footer__price-value {
  color: #ff2c2c;
  font-size: 42rpx;
  font-weight: 600;
  line-height: 56rpx;
}

.cart-footer__pay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 268rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #0d7cf2;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;

  &.disabled {
    background: #d7dbe2;
    color: #ffffff;
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
