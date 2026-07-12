<template>
<!--pages/user_bill/user_bill.wxml-->
<view class="user-bill">
    <tabs :active="active" line-width="40" @change="onChange">
        <tab title="全部">
            <view class="list mt20">
                <view v-for="(item, index) in lists" :key="index" class="item">
                    <view class="bill-list bg-white">
                        <view class="bill-item row-between">
                            <view>
                                <view class="bill-title black mb10">{{ displayText(item.source_type || item.type_desc, '账单类型待确认') }}</view>
                                <view class="bill-time xs muted">{{ displayText(item.create_time, '时间待确认') }}</view>
                            </view>
                            <view :class="'bill-amount lg ' + (isIncome(item) ? 'income' : '')">{{ amountText(item) }}</view>
                        </view>
                    </view>
                </view>
            </view>
            <loading-footer :status="loadingStatus" slotEmpty>
                <view class="data-null column-center" slot="empty">
                    <text class="nr muted">暂无记录～</text>
                </view>
            </loading-footer>
        </tab>
        <tab title="支出">
            <view class="list mt20">
                <view v-for="(item, index) in lists" :key="index" class="item">
                    <view class="bill-list bg-white">
                        <view class="bill-item row-between">
                            <view>
                                <view class="bill-title black mb10">{{ displayText(item.source_type || item.type_desc, '账单类型待确认') }}</view>
                                <view class="bill-time xs muted">{{ displayText(item.create_time, '时间待确认') }}</view>
                            </view>

                            <view class="bill-amount lg">{{ amountText(item) }}</view>
                        </view>
                    </view>
                </view>
            </view>
            <loading-footer :status="loadingStatus" slotEmpty>
                <view class="data-null column-center" slot="empty">
                    <text class="nr muted">暂无支出记录～</text>
                </view>
            </loading-footer>
        </tab>
        <tab title="收入">
            <view class="list mt20">
                <view v-for="(item, index) in lists" :key="index" class="item">
                    <view class="bill-list bg-white">
                        <view class="bill-item row-between">
                            <view>
                                <view class="bill-title black mb10">{{ displayText(item.source_type || item.type_desc, '账单类型待确认') }}</view>
                                <view class="bill-time xs muted">{{ displayText(item.create_time, '时间待确认') }}</view>
                            </view>
                            <view class="bill-amount lg income">{{ amountText(item) }}</view>
                        </view>
                    </view>
                </view>
            </view>
            <loading-footer :status="loadingStatus" slotEmpty>
                <view class="data-null column-center" slot="empty">
                    <text class="nr muted">暂无收入记录～</text>
                </view>
            </loading-footer>
        </tab>
    </tabs>
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
import { getAccountLog } from "@/api/user";
import { loadingType } from "@/utils/type";
import {loadingFun} from "@/utils/tools"
export default {
  data() {
    return {
      active: 0,
      lists: [],
      page: 1,
      loadingStatus: loadingType.LOADING
    };
  },

  components: {
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const active = parseInt(options.type || 0);
    this.active = Number.isNaN(active) ? 0 : active;

    this.getAccountLogFun(this.active);
  },


  onReachBottom: function () {
    this.getAccountLogFun(this.active);
  },

  methods: {
    hasKnownValue(value) {
      return value !== undefined && value !== null && value !== ''
    },
    displayText(value, fallback) {
      return this.hasKnownValue(value) ? value : fallback
    },
    isIncome(item = {}) {
      const value = item.direction ?? item.change_type ?? item.changeType ?? item.type
      const text = String(value).toLowerCase()
      return value == 1 || text === 'in' || text === 'income'
    },
    amountText(item = {}) {
      const value = item.change_amount ?? item.money ?? item.amount
      if (!this.hasKnownValue(value)) return '金额待确认'
      const amount = String(value).replace(/^[+-]/, '')
      return `${this.isIncome(item) ? '+' : '-'}${amount}`
    },
    onChange(e) {
      this.active = e;
      this.cleanStatus();
      this.getAccountLogFun(e);
    },

    cleanStatus() {
      // 清理状态
      this.page = 1;
      this.lists = [];
      this.loadingStatus = loadingType.LOADING
    },

    getAccountLogFun(type) {
      let changeType = 'all';
      changeType = type == 0 ? 'all' : type == 1 ? 'out' : 'in';
      let {
        lists,
        loadingStatus,
        page
      } = this;
      loadingFun(getAccountLog, page, lists, loadingStatus, { direction: changeType }).then(res => {
          if(res) {
              this.page = res.page;
              this.lists = res.dataList
              this.loadingStatus = res.status
          }
      })
    }

  }
};
</script>
<style lang="scss">
/* pages/user_bill/user_bill.wxss */
.user-bill {
    .list {
        .item {
            .time{
                padding: 30rpx;
            }
            .bill-list {
                .bill-item {
                    padding: 20rpx 30rpx;
                    border-bottom: $solid-border;
                    gap: 20rpx;
                    align-items: flex-start;
                    box-sizing: border-box;
                    .income {
                        color: $color-primary;
                    }
                    .bill-title,
                    .bill-time {
                        max-width: 440rpx;
                        word-break: break-all;
                        line-height: 1.4;
                    }
                    .bill-amount {
                        flex: none;
                        max-width: 220rpx;
                        text-align: right;
                        word-break: break-all;
                        line-height: 1.4;
                    }
                }
            }
        }
    }
}

.order-null {
    padding-top: 200rpx;
}

.data-null {
    padding-top: 150rpx;
}
</style>
