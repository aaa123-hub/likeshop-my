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
<template>
<view class="user-order">
    <view class="order-top">
        <view class="order-switch">
            <view class="order-switch__back" @tap="goBack">
                <u-icon name="arrow-left" size="36" color="#222222"></u-icon>
            </view>
            <view class="order-switch__title">我的订单</view>
        </view>
        <view class="order-tabs">
            <view
                v-for="(item, index) in order"
                :key="index"
                :class="['order-tabs__item', active === index ? 'is-active' : '']"
                @tap="changeShow(index, true)"
            >
                {{ item.name }}
            </view>
        </view>
    </view>
    <view class="order-content">
        <order-list
            v-for="(item, index) in order"
            :key="item.type"
            v-if="item.isShow"
            v-show="active === index"
            :order-type="item.type"
            :ref="'order' + item.type"
        ></order-list>
    </view>
</view>
</template>

<script>

import OrderList from '@/bundle_order/components/order-list/order-list.vue'
import { orderType } from '@/utils/type';
import UIcon from '@/bundle_order/components/uview-ui/components/u-icon/u-icon.vue'

export default {
  data() {
    return {
      active: 0,
      order: [{
        name: '全部',
        type: orderType.ALL,
        isShow: false
      }, {
        name: '待支付',
        type: orderType.PAY,
        isShow: false
      }, {
        name: '待发货',
        type: orderType.SHIP,
        isShow: false
      }, {
        name: '待收货',
        type: orderType.DELIVERY,
        isShow: false
      }, {
        name: '已结束',
        type: orderType.ENDED,
        isShow: false
      }]
    };
  },

  components: {
			OrderList,
			UIcon
		},
  props: {},
  onLoad: function (options = {}) {
    const { order } = this
    const type = options.type === 'closed' ? orderType.CLOSE : (options.type || orderType.ALL);
    const index = order.findIndex(item => item.type == type)
    this.changeShow(index >= 0 ? index : 0);
  },

  onPullDownRefresh: function () {
    const {active, order} = this
    const current = this.$refs['order' + order[active].type]
    const component = Array.isArray(current) ? current[0] : current
    if (component && component.reflesh) {
      Promise.resolve(component.reflesh()).finally(() => uni.stopPullDownRefresh())
      return
    }
    uni.stopPullDownRefresh()
  },

  onReachBottom: function () {
	  const {active, order} = this
    const current = this.$refs['order' + order[active].type]
    const component = Array.isArray(current) ? current[0] : current
    if (component && component.getOrderListFun) component.getOrderListFun()
  },
  methods: {
    changeShow(index, forceRefresh = false) {
		if(index >= 0) {
			const item = this.order[index]
			if (!item) return
			if (item && item.url) {
				uni.navigateTo({ url: item.url })
				return
			}
			const wasShown = Boolean(item.isShow)
			this.active = index
			this.order[index].isShow = true
			if (forceRefresh && wasShown) {
				this.$nextTick(() => {
					const current = this.$refs['order' + item.type]
					const component = Array.isArray(current) ? current[0] : current
					if (component && component.reflesh) component.reflesh()
				})
			}
		}
    },
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
        return;
      }
      uni.switchTab({ url: '/pages/user/user' });
    },
  }
};
</script>
<style lang="scss">
.user-order {
  min-height: 100vh;
  background: linear-gradient(180deg, #eaf3ff 0%, #f7f9fc 320rpx, #f7f9fc 100%);
}

.order-top {
  position: sticky;
  top: 0;
  z-index: 9;
  padding-top: var(--status-bar-height);
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 10rpx 30rpx rgba(26, 72, 130, .06);
}

.order-switch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  padding: 0 120rpx;
}

.order-switch__back {
  position: absolute;
  left: 24rpx;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  transform: translateY(-50%);
}

.order-switch__title {
  color: #222222;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 44rpx;
}

.order-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
  height: 104rpx;
  padding: 0 16rpx 12rpx;
  box-sizing: border-box;
}

.order-tabs__item {
  flex: 1;
  position: relative;
  min-width: 0;
  padding: 16rpx 4rpx;
  color: #667085;
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  background: #f3f6fb;
  border-radius: 999rpx;
  box-sizing: border-box;
  line-height: 30rpx;
  white-space: nowrap;
}

.is-active {
  color: #ffffff;
  background: linear-gradient(135deg, #1f7af4 0%, #03a6ff 100%);
  box-shadow: 0 10rpx 22rpx rgba(31, 122, 244, .2);

  &::after {
    display: none;
  }
}

.order-content {
  min-height: calc(100vh - 184rpx);
  padding-top: 4rpx;
}
</style>
