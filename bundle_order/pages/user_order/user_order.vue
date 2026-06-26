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
        <view class="order-type-switch">
            <view :class="['order-switch__item', activeTop === 'order' ? 'is-active' : '']" @tap="changeTopType('order')">
                全部订单
            </view>
            <view :class="['order-switch__item', activeTop === 'points' ? 'is-active' : '']" @tap="changeTopType('points')">
                待领取积分
            </view>
        </view>
        <view class="order-tabs">
            <view
                v-for="(item, index) in currentTabs"
                :key="index"
                :class="['order-tabs__item', active === index ? 'is-active' : '']"
                @tap="changeShow(index)"
            >
                {{ item.name }}
            </view>
        </view>
    </view>
    <view class="order-content">
        <block v-if="activeTop === 'order'">
            <order-list
                v-for="(item, index) in order"
                :key="item.type"
                v-if="item.isShow"
                v-show="active === index"
                :order-type="item.type"
                :ref="'order' + item.type"
            ></order-list>
        </block>
        <view v-else class="points-placeholder">
            <view class="points-placeholder__title">待领取积分功能准备中</view>
            <view class="points-placeholder__desc">当前先按积分来源分类展示，后续接入积分领取数据后可直接查看对应明细。</view>
            <view class="points-placeholder__card">{{ currentTabs[active] && currentTabs[active].name }}暂无可领取积分</view>
        </view>
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
      activeTop: 'order',
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
        name: '售后',
        type: 'afterSale',
        isShow: false,
        url: '/bundle_order/pages/post_sale/post_sale'
      }],
      pointsTabs: [{
        name: '全部'
      }, {
        name: '线上待领取'
      }, {
        name: '线下待领取'
      }, {
        name: '联盟待领取'
      }, {
        name: '领取记录'
      }]
    };
  },

  components: {
			OrderList,
			UIcon
		},
  props: {},
  computed: {
    currentTabs() {
      return this.activeTop === 'order' ? this.order : this.pointsTabs
    }
  },
  onLoad: function (options = {}) {
    if (options && options.points == 1) {
      this.changeTopType('points')
      return
    }
    const { order } = this
    const type = options.type || orderType.ALL;
    const index = order.findIndex(item => item.type == type)
    this.changeShow(index >= 0 ? index : 0);
  },

  onPullDownRefresh: function () {
    if (this.activeTop === 'points') {
      uni.stopPullDownRefresh()
      return
    }
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
	  if (this.activeTop === 'points') return
	  const {active, order} = this
    const current = this.$refs['order' + order[active].type]
    const component = Array.isArray(current) ? current[0] : current
    if (component && component.getOrderListFun) component.getOrderListFun()
  },
  methods: {
    changeShow(index) {
		if(index >= 0) {
			const item = this.currentTabs[index]
			if (!item) return
			if (item && item.url) {
				uni.navigateTo({ url: item.url })
				return
			}
			this.active = index
			if (this.activeTop === 'order') this.order[index].isShow = true
		}
    },
    changeTopType(type) {
      this.activeTop = type
      this.active = 0
      if (type === 'points') return
      const targetType = orderType.ALL
      const index = this.order.findIndex(item => item.type == targetType)
      this.changeShow(index)
      this.$nextTick(() => {
        const current = this.$refs['order' + targetType]
        const component = Array.isArray(current) ? current[0] : current
        if (component && component.reflesh) component.reflesh()
      })
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
  background: #f7f8fa;
}

.order-top {
  position: sticky;
  top: 0;
  z-index: 9;
  padding-top: var(--status-bar-height);
  background: #ffffff;
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

.order-type-switch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 76rpx;
  padding: 0 156rpx;
}

.order-switch__item {
  position: relative;
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #a5a5a5;
}

.order-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  border-top: 1rpx solid #f2f3f5;
}

.order-tabs__item {
  position: relative;
  font-size: 30rpx;
  font-weight: 500;
  color: #a5a5a5;
}

.is-active {
  color: #1f7af4;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -18rpx;
    width: 52rpx;
    height: 8rpx;
    background: #1f7af4;
    border-radius: 8rpx;
    transform: translateX(-50%);
  }
}

.order-content {
  min-height: calc(100vh - 184rpx);
}

.points-placeholder {
  padding: 80rpx 32rpx 0;
  text-align: center;
}

.points-placeholder__title {
  color: #222222;
  font-size: 34rpx;
  font-weight: 600;
}

.points-placeholder__desc {
  margin-top: 20rpx;
  color: #8a8f99;
  font-size: 26rpx;
  line-height: 40rpx;
}

.points-placeholder__card {
  margin-top: 36rpx;
  padding: 36rpx 24rpx;
  color: #666666;
  font-size: 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
}
</style>
