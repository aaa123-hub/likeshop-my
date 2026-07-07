<template>
<!-- components/my-coupons/my-coupons.wxml -->
<view class="my-coupons">
    <coupon-list v-if="!showNull" :list="couponList" :btnType="type"></coupon-list>
    <view v-else class="coupon-empty">
        <view class="coupon-empty__title">暂无优惠券</view>
        <view class="coupon-empty__desc">有可用优惠券时会展示在这里</view>
    </view>
</view>
</template>

<script>
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
import { getMyCoupon } from '@/api/user';

export default {
  data() {
    return {
      couponList: [],
      showNull: false,
      loading: true
    };
  },

  props: {
    type: {
      type: Number,
      default: 0
    }
  },
  beforeMount: function () {
    this.getMyCouponFun();
  },
  methods: {
    getMyCouponFun() {
      const {
        type
      } = this;
      getMyCoupon({
        type,
        status: type,
        pageSize: 100
      }).then(res => {
        if (res.code == 1) {
          const data = res.data || {}
          const list = Array.isArray(data) ? data : (data.list || data.lists || [])
          this.$emit('getnum', {
            detail: data.total ?? list.length
          });

          this.couponList = list;
          this.showNull = list.length <= 0;
        }
      }).catch(() => {
        this.couponList = []
        this.showNull = true
        this.$emit('getnum', { detail: 0 })
      }).finally(() => {
        this.loading = false
      });
    }

  }
};
</script>
<style>
/* components/my-coupons/my-coupons.wxss */
.my-coupons {
    min-height: calc(100vh - 80rpx);
    box-sizing: border-box;
}

.coupon-empty {
    margin: 160rpx 30rpx 0;
    padding: 80rpx 30rpx;
    background: #ffffff;
    border-radius: 24rpx;
    text-align: center;
    box-shadow: 0 12rpx 36rpx rgba(24, 40, 80, 0.04);
}

.coupon-empty__title {
    color: #333333;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.coupon-empty__desc {
    margin-top: 14rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}
</style>
