<template>
<view class="user-withdraw-code">
    <view class="withdraw-code-container mt10">
        <view class="withdraw-code-contain">
            <view v-for="(item, index) in withdrawRecords" :key="index" class="withdraw-code-item bg-white" hover-class="none"
			 @tap="goWithdrawDetail(item)">
                <view class="row-between">
                    <view class="withdraw-title">{{ displayText(item.desc, '提现记录待确认') }}</view>
                    <price-format v-if="hasKnownValue(item.left_money)" showSubscript :subScriptSize="26" :firstSize="36" :secondSize="36" :price="item.left_money" />
                    <view v-else class="withdraw-money-pending">金额待确认</view>
                </view>
                <view class="row-between mt10">
                    <view class="muted xs time">{{ displayText(item.create_time, '时间待确认') }}</view>
                    <view class="withdraw-status xs" :class="{'error-status' : item.status == 2 || item.status == 4, 'common-status': item.status == 3}">{{ displayText(item.status_text, '状态待确认') }}</view>
                </view>
				  <view v-if="item.description && item.status == 4" class="primary mt10 line1 xs">{{ item.description }}</view>
            </view>
        </view>
        <loading-footer :status="loadingStatus" slotEmpty>
            <view class="data-null column-center" slot="empty">
                <text class="muted">暂无提现记录～</text>
            </view>
        </loading-footer>
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
import { getWithdrawRecords } from '@/api/user';
import { loadingType } from '@/utils/type.js';
import {loadingFun} from "@/utils/tools"
import PriceFormat from '@/bundle_finance/components/price-format/price-format.vue'
export default {
  data() {
    return {
      loadingStatus: loadingType.LOADING,
      page: 1,
      withdrawRecords: []
    };
  },

  components: {
			PriceFormat,
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWithdrawRecordsFun();
  },

  onReachBottom: function () {
      this.getWithdrawRecordsFun()
  },

  methods: {
    hasKnownValue(value) {
      return value !== undefined && value !== null && value !== ''
    },

    displayText(value, fallback) {
      return this.hasKnownValue(value) ? value : fallback
    },

    goWithdrawDetail(item = {}) {
      if (!this.hasKnownValue(item.id)) {
        this.$toast({ title: '提现记录信息待确认' })
        return
      }
      uni.navigateTo({
        url: `/bundle_finance/pages/widthdraw_result/widthdraw_result?id=${encodeURIComponent(item.id)}&type=1`
      })
    },

    getWithdrawRecordsFun() {
      let {
        loadingStatus,
        withdrawRecords,
        page
      } = this;

      loadingFun(getWithdrawRecords, page, withdrawRecords, loadingStatus).then(res => {
          if(res) {
              this.page = res.page;
              this.withdrawRecords = res.dataList
              this.loadingStatus = res.status
          }
      })
    }

  }
};
</script>
<style lang="scss">
.user-withdraw-code {
    .withdraw-code-container {
        .withdraw-code-item {
            padding: 24rpx 30rpx;
            box-sizing: border-box;
            .time {
              line-height: 32rpx;
            }
            .withdraw-title {
              min-width: 0;
              max-width: 420rpx;
              word-break: break-all;
              line-height: 1.4;
            }
            .withdraw-money-pending {
              flex: none;
              max-width: 220rpx;
              color: $color-primary;
              font-size: 28rpx;
              text-align: right;
              word-break: break-all;
            }
            .withdraw-status {
              color: #0CC21E;
              max-width: 220rpx;
              text-align: right;
              word-break: break-all;
            }
            .common-status {
              color: #666666;
            }
            .error-status {
              color: $color-primary;
            }
            &:not(:last-of-type) {
              border-bottom: var(--border);
            }
        }
    }
    .data-null {
      padding-top: 200rpx;
    }
}
</style>
