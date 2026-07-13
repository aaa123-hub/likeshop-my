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
            <view class="order-switch__back" @tap="goBack"></view>
            <view class="scene-switch">
                <view
                    v-for="item in orderScenes"
                    :key="item.value"
                    :class="['scene-switch__item', orderScene === item.value ? 'is-scene-active' : '']"
                    @tap="changeOrderScene(item.value)"
                >
                    {{ item.name }}
                </view>
            </view>
            <view class="order-switch__capsule">
                <view class="order-switch__capsule-dot"></view>
                <view class="order-switch__capsule-divider"></view>
                <view class="order-switch__capsule-circle"></view>
            </view>
        </view>
        <view class="order-tabs">
            <view
                v-for="(item, index) in currentOrderTabs"
                :key="item.type"
                :class="['order-tabs__item', active === index ? 'is-active' : '']"
                @tap="changeShow(index, true)"
            >
                {{ item.name }}
            </view>
        </view>
    </view>
    <view class="order-content">
        <order-list
            v-for="(item, index) in currentOrderTabs"
            :key="item.type"
            v-if="item.isShow"
            v-show="active === index"
            :order-type="item.type"
            :order-scene="orderScene"
            :ref="'order' + item.type"
        ></order-list>
    </view>
</view>
</template>

<script>

import OrderList from '@/bundle_order/components/order-list/order-list.vue'
import { orderType } from '@/utils/type';

export default {
  data() {
    return {
      active: 0,
      orderScene: 'online',
      orderScenes: [
        { name: '商城订单', value: 'online' },
        { name: '商街订单', value: 'offline' }
      ],
      onlineOrderTabs: [{
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
        isShow: false
      }, {
        name: '已关闭',
        type: orderType.CLOSE,
        isShow: false
      }],
      offlineOrderTabs: [{
        name: '全部',
        type: orderType.ALL,
        isShow: false
      }, {
        name: '待支付',
        type: orderType.PAY,
        isShow: false
      }, {
        name: '待核销',
        type: orderType.SHIP,
        isShow: false
      }, {
        name: '已核销',
        type: orderType.FINISH,
        isShow: false
      }, {
        name: '售后',
        type: 'afterSale',
        isShow: false
      }, {
        name: '已关闭',
        type: orderType.CLOSE,
        isShow: false
      }]
    };
  },

  components: {
			OrderList
		},
  props: {},
  onLoad: function (options = {}) {
    const type = options.type === 'closed' ? orderType.CLOSE : (options.type || orderType.ALL);
    if (['online', 'offline'].includes(options.scene)) this.orderScene = options.scene
    const index = this.currentOrderTabs.findIndex(item => item.type == type)
    this.changeShow(index >= 0 ? index : 0);
  },

  onPullDownRefresh: function () {
    const {active} = this
    const order = this.currentOrderTabs
    const current = this.$refs['order' + order[active].type]
    const component = Array.isArray(current) ? current[0] : current
    if (component && component.reflesh) {
      Promise.resolve(component.reflesh()).finally(() => uni.stopPullDownRefresh())
      return
    }
    uni.stopPullDownRefresh()
  },

  onReachBottom: function () {
	  const {active} = this
    const order = this.currentOrderTabs
    const current = this.$refs['order' + order[active].type]
    const component = Array.isArray(current) ? current[0] : current
    if (component && component.getOrderListFun) component.getOrderListFun()
  },
  computed: {
    currentOrderTabs() {
      return this.orderScene === 'offline' ? this.offlineOrderTabs : this.onlineOrderTabs
    }
  },
  methods: {
    changeShow(index, forceRefresh = false) {
		if(index >= 0) {
			const item = this.currentOrderTabs[index]
			if (!item) return
			if (this.active === index && item.isShow && forceRefresh) return
			const wasShown = Boolean(item.isShow)
			this.active = index
			this.$set(this.currentOrderTabs[index], 'isShow', true)
			if (forceRefresh && wasShown) {
				this.$nextTick(() => {
					const current = this.$refs['order' + item.type]
					const component = Array.isArray(current) ? current[0] : current
					if (component && component.reflesh) component.reflesh()
				})
			}
		}
    },
    changeOrderScene(scene) {
      if (!['online', 'offline'].includes(scene) || this.orderScene === scene) return
      this.orderScene = scene
      if (this.active >= this.currentOrderTabs.length) this.active = 0
      this.changeShow(this.active)
      this.$nextTick(() => {
        this.currentOrderTabs.forEach((item) => {
          const current = this.$refs['order' + item.type]
          const component = Array.isArray(current) ? current[0] : current
          if (component && component.reflesh) component.reflesh()
        })
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
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(180deg, #fff9f0 0%, #fffdf8 266rpx, #fffdf8 100%);
}

.order-top {
  position: sticky;
  top: 0;
  z-index: 9;
  padding-top: var(--status-bar-height);
  height: calc(var(--status-bar-height) + 266rpx);
  background: #fff9f0;
  box-shadow: none;
  box-sizing: border-box;
}

.order-switch {
  position: relative;
  display: flex;
  align-items: center;
  height: 104rpx;
  padding: 0;
  box-sizing: border-box;
}

.order-switch__back {
  position: absolute;
  left: 24rpx;
  top: 50%;
  width: 44rpx;
  height: 44rpx;
  transform: translateY(-50%);
}

.order-switch__back::after {
  content: '';
  position: absolute;
  left: 0;
  top: 10rpx;
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #222222;
  border-bottom: 4rpx solid #222222;
  transform: rotate(45deg);
}

.order-switch__capsule {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 24rpx;
  top: 24rpx;
  width: 168rpx;
  height: 64rpx;
  border: 1rpx solid transparent;
  border-radius: 32rpx;
  background: transparent;
  box-sizing: border-box;
  opacity: 0;
}

.order-switch__capsule-dot {
  width: 8rpx;
  height: 8rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #222222;
  box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
}

.order-switch__capsule-divider {
  width: 1rpx;
  height: 36rpx;
  margin: 0 22rpx 0 42rpx;
  background: rgba(34, 34, 34, .18);
}

.order-switch__capsule-circle {
  width: 34rpx;
  height: 34rpx;
  border: 4rpx solid #222222;
  border-radius: 50%;
  box-sizing: border-box;
}

.order-tabs {
  display: flex;
  align-items: center;
  width: calc(100vw - 48rpx);
  max-width: 636rpx;
  height: 53rpx;
  margin: 29rpx auto 0;
  padding: 0;
  box-sizing: border-box;
  gap: 42rpx;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.order-tabs::-webkit-scrollbar {
  display: none;
}

.scene-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100vw - 328rpx);
  max-width: 311rpx;
  min-width: 240rpx;
  height: 40rpx;
  margin: 42rpx auto 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.scene-switch__item {
  position: relative;
  flex: none;
  height: 40rpx;
  color: #999999;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 30rpx;
  text-align: left;
  border-radius: 0;
}

.is-scene-active {
  color: #a0610d;
  background: transparent;
  box-shadow: none;
}

.order-tabs__item {
  position: relative;
  flex: none;
  min-width: 50rpx;
  padding: 0;
  color: #999999;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  background: transparent;
  border-radius: 0;
  box-sizing: border-box;
  line-height: 26rpx;
  white-space: nowrap;
}

.is-active {
  color: #a0610d;
  background: transparent;
  box-shadow: none;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -28rpx;
    width: 27rpx;
    height: 6rpx;
    background: #a0610d;
    transform: translateX(-50%);
  }
}

.order-content {
  min-height: calc(100vh - var(--status-bar-height) - 266rpx);
  padding-top: 0;
}
</style>
