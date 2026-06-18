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
	<navbar title="全部订单"></navbar>
    <view class="order-top">
        <view class="order-switch">
            <view :class="['order-switch__item', activeTop === 0 ? 'is-active' : '']" @tap="activeTop = 0">
                全部订单
            </view>
            <view :class="['order-switch__item', activeTop === 1 ? 'is-active' : '']" @tap="activeTop = 1">
                待领取积分
            </view>
        </view>
        <view class="order-tabs">
            <view
                v-for="(item, index) in order"
                :key="index"
                :class="['order-tabs__item', active === index ? 'is-active' : '']"
                @tap="changeShow(index)"
            >
                {{ item.name }}
            </view>
        </view>
    </view>
    <view class="order-content">
		<order-list
            v-for="(item, index) in order"
            v-show="active === index"
            v-if="item.isShow"
            :key="item.type"
            :order-type="item.type"
            :ref="'order' + item.type"
        ></order-list>
    </view>
</view>
</template>

<script>

import { orderType } from '@/utils/type';

export default {
  data() {
    return {
      activeTop: 0,
      active: orderType.ALL,
      order: [{
        name: '全部',
        type: orderType.ALL,
        isShow: false
      }, {
        name: '待付款',
        type: orderType.PAY,
        isShow: false
      }, {
        name: '待收货',
        type: orderType.DELIVERY,
        isShow: false
      }, {
        name: '已完成',
        type: orderType.FINISH,
        isShow: false
      }, {
        name: '已关闭',
        type: orderType.CLOSE,
        isShow: false
      }]
    };
  },

  components: {
  },
  props: {},
  onLoad: function (options) {
    const{order} = this
    let type = options.type || orderType.ALL;
	let index = order.findIndex(item => item.type == type)
    this.changeShow(index);
  },

  onPullDownRefresh: function () {
   const {active, order} = this
   console.log(this.$refs['order' + order[active].type])
   this.$refs['order' + order[active].type][0].reflesh()
  },

  onReachBottom: function () {
	  const {active, order} = this
	console.log(this.$refs['order' + order[active].type])
	this.$refs['order' + order[active].type][0].getOrderListFun()
  },
  methods: {
    changeShow(index) {
		if(index != -1) {
			this.active = index
			this.order[index].isShow = true
		}
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
  background: #ffffff;
}

.order-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  padding: 0 120rpx;
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
</style>
