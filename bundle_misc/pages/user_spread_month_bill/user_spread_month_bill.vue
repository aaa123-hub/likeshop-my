<template>
<view class="user-spread-month-bill">
    <view v-for="(item, index) in orderList" :key="index">
        <view class="bill-time row normal sm">
            {{ displayText(item.date, '账单月份待确认') }}
        </view>
        <view class="show-panel row">
            <view class="panel-item column-center">
                <price-format v-if="hasKnownValue(item.total_money)" :price="item.total_money" showSubscript :subScriptSize="26" color="#a0610d" :firstSize="36" :secondSize="36" />
                <view v-else class="amount-pending">金额待确认</view>
                <view class="lighter label mt10">预估收入</view>
            </view>
            <view class="panel-item column-center">
                <view class="normal xxl">{{ displayText(item.order_num, '待确认') }}</view>
                <view class="lighter label mt10">成交笔数</view>
            </view>
            <view class="panel-item column-center" style="align-self: flex-end;">
                <view class="row lighter detail-link" @tap="openMonthBillDetail(item)">
                    查看详情<u-icon name="arrow-right" size="28rpx" color="#666666" />
                </view>
            </view>
        </view>
    </view>
    <loading-footer :status="loadingStatus" slotEmpty>
        <view slot="empty" class="data-null column-center">
            <view class="muted xs">暂无相关数据～</view>
        </view>
    </loading-footer>
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
import { getMonthBill } from "@/api/user";
import { loadingType } from '@/utils/type';
import {loadingFun} from "@/utils/tools"
import UIcon from '@/bundle_misc/components/uview-ui/components/u-icon/u-icon.vue'
import PriceFormat from '@/bundle_misc/components/price-format/price-format.vue'
export default {
  data() {
    return {
      loadingStatus: loadingType.LOADING,
      page: 1,
      orderList: []
    };
  },

  components: {
			PriceFormat,
			UIcon
		},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMonthBillFun();
  },


  onReachBottom: function () {
      this.getMonthBillFun()
  },

  methods: {
    hasKnownValue(value) {
      return value !== undefined && value !== null && value !== ''
    },
    displayText(value, fallback) {
      return this.hasKnownValue(value) ? value : fallback
    },
    openMonthBillDetail(item = {}) {
      if (!this.hasKnownValue(item.year) || !this.hasKnownValue(item.month)) {
        this.$toast({ title: '账单月份待确认' })
        return
      }
      uni.navigateTo({
        url: `/bundle_misc/pages/user_spread_month_bill_detail/user_spread_month_bill_detail?year=${item.year}&month=${item.month}`
      })
    },
    getMonthBillFun() {
      let {
        loadingStatus,
        page,
        orderList
      } = this;
      loadingFun(getMonthBill, page, orderList, loadingStatus).then(res => {
          if(res) {
              this.page = res.page;
              this.orderList = res.dataList
              this.loadingStatus = res.status
          }
      })
    }
  }
};
</script>
<style lang="scss">

.user-spread-month-bill {
    .bill-time {
        padding: 20rpx;
        line-height: 34rpx;
    }
    .show-panel {
        background-color: white;
        padding: 36rpx 0 26rpx;
    }
    .show-panel {
        .panel-item {
            flex: 1;
            line-height: 34rpx;
            .amount-pending {
                color: #8b95a5;
                font-size: 28rpx;
                line-height: 44rpx;
            }
        }
    }
}

.data-null {
    padding-top: 200rpx;
}
</style>
