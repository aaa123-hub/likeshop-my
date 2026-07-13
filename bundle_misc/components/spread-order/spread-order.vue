<template>
<view class="spread-order">
  <view class="content">
      <view class="order-container">
          <view v-for="(item, index) in lists" :key="item.order_sn" class="order-item bg-white mt20">
              <view class="order-header row-between">
                  <view>订单编号:{{ displayText(item.order_sn, '订单号待确认') }}</view>
                  <view class="white guide-shop-btn row-center">{{ displayText(item.status, '状态待确认') }}</view>
              </view>
              <view class="order-content row">
                  <view class="order-goods-img">
                      <image width="100%" height="100%" radius="6px" :src="item.image" />
                  </view>
                  <view class="order-goods-info ml20">
                      <view class="name row sm">{{ displayText(item.goods_name, '商品待确认') }}</view>
                      <view class="row-between">
                          <view class="xs">数量<text class="normal nr">{{ displayText(item.goods_num, '待确认') }}</text></view>
                          <view class="xs">
                            付款金额
                            <price-format v-if="hasKnownValue(item.pay_price)" showSubscript :subScriptSize="28" :firstSize="28" :secondSize="28" weight="bold" :price="item.pay_price" />
                            <text v-else class="amount-pending">金额待确认</text>
                          </view>
                      </view>
                      <view class="pre-income muted">预估收益
                          <price-format v-if="hasKnownValue(item.money)" showSubscript :subScriptSize="28" :firstSize="28" :secondSize="28" color="#a0610d" weight="bold" :price="item.money" />
                          <text v-else class="income-pending">金额待确认</text>
                      </view>
                  </view>
              </view>
              <view class="order-footer row-between">
                  <view class="time muted sm">{{ displayText(item.create_time, '时间待确认') }}</view>
                  <view class="static sm" :style="{color: item.status == '待返佣' ? '#a0610d' : item.status == '已失效' ? '#909090' : '#00c735'}">{{ displayText(item.status, '状态待确认') }}</view>
              </view>
          </view>
          <loading-footer slotEmpty :status="loadingStatus">
              <view slot="empty" class="data-null column-center">
                <text class="sm muted">暂无推广订单～</text>
              </view>
          </loading-footer>
      </view>
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
import { userOrderPromoteOrder } from "@/utils/type";
import { loadingType } from "@/utils/type";
import { getPromoteOrder } from "@/api/user";
import {loadingFun} from '@/utils/tools'
import PriceFormat from '@/bundle_misc/components/price-format/price-format.vue'

export default {
  data() {
    return {
      lists: [],
      page: 1,
      loadingStatus: loadingType.LOADING,
      confirmDialog: false
    };
  },

  components: {
			PriceFormat,
  },
  props: {
    type: {
      type: Number | String,
      default: userOrderPromoteOrder.ALL
    }
  },

  created() {
    this.$on('RESET_LIST', this.reflesh, this);
  },

  beforeMount() {
    this.getPromoteOrderFun(); // this.$getAfterSaleList()
  },

  methods: {
    hasKnownValue(value) {
      return value !== undefined && value !== null && value !== ''
    },
    displayText(value, fallback) {
      return this.hasKnownValue(value) ? value : fallback
    },
    reflesh() {
      this.page = 1;
      this.lists = [];
      this.loadingStatus = loadingType.LOADING; // this.$getAfterSaleList();
    },

    getPromoteOrderFun() {
      let {
        loadingStatus,
        lists,
        page
      } = this;
      loadingFun(getPromoteOrder, page, lists, loadingStatus, {status: this.type}).then(res => {
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
.spread-order {
    .spread-header {
      height: 240rpx;
      background-color: var(--primary-color);
      padding-top: 60rpx;
      .deal-num {
        flex: 1;
        align-self: flex-start;
        .num {
            font-size: 42rpx;
        }
        .explain {
            line-height: 34rpx;
            margin-top: 16rpx;
        }
      }
      .income-num {
        flex: 1;
        align-self: flex-start;
        .explain {
          line-height: 34rpx;
          margin-top: 12rpx;
        }
      }
    }
    .content {
      padding: 0 20rpx;
      /* margin-top: -120rpx; */
      .order-container {
          .order-item {
            border-radius: 14rpx;
            .order-header {
              padding: 20rpx 30rpx;
              border-bottom: var(--border);
              .status {
                  /* background: linear-gradient(80deg, #d79a43 0%, #a0610d 100%);
                  border-radius: 4rpx;
                  width: 134rpx;
                  height: 42rpx;
                  font-size: 24rpx;
                  line-height: 34rpx; */
                  color: #d79a43;
              }
            }
            .order-content {
              padding: 20rpx 30rpx 20rpx 20rpx;
              border-bottom: var(--border);
              .order-goods-img {
                width: 140rpx;
                height: 140rpx;
                flex: none;
              }
              .order-goods-info {
                text-align: left;
                flex: 1;
                .name {
                    line-height: 36rpx;
                }
                .pre-income {
                    line-height: 34rpx;
                    margin-top: 8rpx;
                }
                .amount-pending,
                .income-pending {
                    color: #8b95a5;
                    font-size: 24rpx;
                }
              }
            }
            .order-footer {
              padding: 20rpx 30rpx 20rpx 20rpx;
              .static {
                  color: #d79a43;
              }
              .wait-return {
                  color: #d79a43;
              }
            }
          }
      }
    }
}
.data-null {
  padding-top: 200rpx;
}
</style>
