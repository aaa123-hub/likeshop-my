<template>
<!--pages/sign_detail/sign_detail.wxml-->

<view class="sign-detail-container">
  <navbar title="积分明细"></navbar>
  <view class="points-summary">
    <view class="points-summary__label">积分明细</view>
    <view class="points-summary__desc">展示积分获取、使用、过期等账户流水</view>
  </view>
  <view class="sign-list">
    <view v-for="(item, index) in displayDetailList" :key="index" class="sign-item">
      <view :class="item.iconClass">{{ item.changeIcon }}</view>
      <view class="sign-item__main">
        <view class="sign-item__top">
          <view class="sign-type line1">{{ item.sourceText }}</view>
          <text :class="item.amountClass">{{ item.amountText }}</text>
        </view>
        <view class="sign-item__meta">
          <text>{{ item.timeText }}</text>
          <text v-if="item.statusText" class="sign-status">{{ item.statusText }}</text>
        </view>
        <view v-if="item.remarkText" class="sign-remark line2">{{ item.remarkText }}</view>
        <view v-if="item.orderText" class="sign-order line1">单号：{{ item.orderText }}</view>
        <view v-if="item.extraRows.length" class="sign-extra">
          <view v-for="row in item.extraRows" :key="row.label" class="sign-extra__item">
            <text class="sign-extra__label">{{ row.label }}</text>
            <text class="sign-extra__value">{{ row.value }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
  <loading-footer :status="loadingStatus" slotEmpty>
    <view class="data-null column-center" slot="empty">
      <view class="muted sm">暂无其他记录～</view>
    </view>
  </loading-footer>
</view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
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
import { loadingType } from '@/utils/type';
import { getAccountLog } from '@/api/user.js';
import {loadingFun} from "@/utils/tools"

export default {
  data() {
    return {
      rule: '',
      loadingStatus: loadingType.LOADING,
      detailList: [],
      page: 1
    };
  },

  components: {
			Navbar
		},
  props: {},

  computed: {
    displayDetailList() {
      return this.detailList.map(item => this.normalizeDetailItem(item))
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAccountLogFun();
  },

  onReachBottom: function () {
    this.getAccountLogFun();
  },

  methods: {
    normalizeDetailItem(item = {}) {
      const changeClass = this.formatChangeClass(item)
      return {
        ...item,
        sourceText: this.formatSourceText(item),
        timeText: this.formatTime(item),
        statusText: this.formatStatusText(item),
        remarkText: this.formatRemark(item),
        orderText: item.bizNo || item.biz_no || item.orderNo || item.order_no || item.bizOrderNo || item.biz_order_no || '',
        changeIcon: changeClass === 'is-plus' ? '+' : '-',
        amountText: this.formatAmount(item),
        extraRows: this.formatExtraRows(item),
        iconClass: `sign-item__icon ${changeClass}`,
        amountClass: `sign-amount ${changeClass}`
      }
    },
    formatSourceText(item = {}) {
      const raw = item.type_desc || item.source_type || item.bizTypeName || item.biz_type_name || item.bizType || item.biz_type || item.title || item.desc || '积分变动'
      const key = String(raw).toUpperCase()
      const map = {
        POINTS: '积分变动',
        POINT: '积分变动',
        SIGN: '签到奖励',
        SIGN_IN: '签到奖励',
        ORDER: '订单奖励',
        ORDER_REWARD: '订单奖励',
        CONSUME: '消费抵扣',
        DEDUCT: '积分抵扣',
        EXCHANGE: '积分兑换',
        REFUND: '订单退款',
        EXPIRE: '积分过期',
        ADMIN: '平台调整',
        MANUAL: '平台调整',
        REGISTER: '注册奖励',
        INVITE: '邀请奖励'
      }
      return map[key] || String(raw).replace(/_/g, ' ')
    },
    formatTime(item = {}) {
      return this.formatDisplayTime(item.create_time || item.change_time || item.createTime || item.txnTime || item.txn_time) || '--'
    },
    formatRemark(item = {}) {
      return item.remark || item.memo || item.content || item.description || item.reason || ''
    },
    formatStatusText(item = {}) {
      const status = item.statusText || item.status_text || item.auditStatus || item.status || ''
      const statusMap = {
        SUCCESS: '成功',
        PENDING: '处理中',
        PROCESSING: '处理中',
        FAILED: '失败',
        FAIL: '失败',
        CANCELED: '已取消',
        CANCELLED: '已取消'
      }
      return statusMap[String(status).toUpperCase()] || status
    },
    formatChangeClass(item = {}) {
      const amount = Number(item.change_amount ?? item.changeAmount ?? item.pointsChange ?? item.points_change ?? item.pointAmount ?? item.point_amount ?? item.integral ?? item.amount ?? 0)
      const type = Number(item.change_type ?? item.changeType)
      return type === 1 || amount > 0 ? 'is-plus' : 'is-minus'
    },
    formatAmount(item = {}) {
      const amount = Number(item.change_amount ?? item.changeAmount ?? item.pointsChange ?? item.points_change ?? item.pointAmount ?? item.point_amount ?? item.integral ?? item.amount ?? 0)
      const prefix = this.formatChangeClass(item) === 'is-plus' ? '+' : '-'
      return `${prefix}${Math.abs(amount || 0)}`
    },
    formatExtraRows(item = {}) {
      const rows = []
      const balance = item.left_amount ?? item.left_money ?? item.balanceAfter ?? item.balance_after ?? item.balance
      const bizType = item.bizTypeName || item.biz_type_name || item.bizType || item.biz_type || item.source_type
      const scene = item.sceneName || item.scene_name || item.scene || item.channelName || item.channel_name || item.channel
      if (balance !== undefined && balance !== null && balance !== '') rows.push({ label: '剩余积分', value: balance })
      if (bizType) rows.push({ label: '业务类型', value: this.formatSourceText({ type_desc: bizType }) })
      if (scene) rows.push({ label: '来源渠道', value: scene })
      return rows.filter((row, index, list) => list.findIndex(item => item.label === row.label && item.value === row.value) === index)
    },
    formatDisplayTime(value) {
      if (!value) return ''
      if (typeof value === 'string' && /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) return value.replace(/-/g, '/').slice(0, 16)
      const time = Number(value)
      const date = Number.isNaN(time) ? new Date(value) : new Date(time > 10000000000 ? time : time * 1000)
      if (Number.isNaN(date.getTime())) return String(value)
      const pad = (num) => String(num).padStart(2, '0')
      return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    },
    getAccountLogFun() {
      let {
        detailList,
        loadingStatus,
        page
      } = this;

      loadingFun(getAccountLog, page, detailList, loadingStatus, { bizType: 'POINTS', source: 'POINTS', type: 'POINTS' }).then(res => {
          if(res) {
              this.page = res.page;
              this.detailList = res.dataList
              this.loadingStatus = res.status
          }
      })
    }

  }
};
</script>
<style lang="scss">
/* pages/sign_detail/sign_detail.wxss */

.sign-detail-container {
  min-height: 100vh;
  padding: 18rpx 24rpx 40rpx;
  background: #f5f7fb;
  box-sizing: border-box;
}

.points-summary {
  margin: 12rpx 0 22rpx;
  padding: 28rpx 30rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b39 0%, #ff2c3c 100%);
  border-radius: 24rpx;
  box-shadow: 0 14rpx 32rpx rgba(255, 44, 60, 0.16);
}

.points-summary__label {
  font-size: 36rpx;
  font-weight: 600;
  line-height: 48rpx;
}

.points-summary__desc {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.78);
  font-size: 24rpx;
  line-height: 34rpx;
}

.sign-list {
  overflow: hidden;
  background: #ffffff;
  border-radius: 24rpx;
}

.sign-item {
  display: flex;
  padding: 26rpx 24rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.sign-item:last-child {
  border-bottom: 0;
}

.sign-item__icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  margin-right: 18rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  border-radius: 50%;
}

.sign-item__main {
  flex: 1;
  min-width: 0;
}

.sign-item__top,
.sign-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sign-type {
  flex: 1;
  min-width: 0;
  color: #222222;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 42rpx;
}

.sign-amount {
  margin-left: 20rpx;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.sign-item__meta {
  margin-top: 10rpx;
  color: #9aa1ad;
  font-size: 22rpx;
  line-height: 32rpx;
}

.sign-status {
  margin-left: 16rpx;
  padding: 2rpx 12rpx;
  color: #2378ff;
  background: rgba(35, 120, 255, 0.08);
  border-radius: 16rpx;
}

.sign-remark,
.sign-order {
  margin-top: 12rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 34rpx;
}

.sign-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx 12rpx;
  margin-top: 14rpx;
}

.sign-extra__item {
  display: flex;
  align-items: center;
  max-width: 100%;
  padding: 6rpx 14rpx;
  background: #f6f8fb;
  border-radius: 18rpx;
  box-sizing: border-box;
}

.sign-extra__label {
  flex: none;
  margin-right: 8rpx;
  color: #9aa1ad;
  font-size: 22rpx;
}

.sign-extra__value {
  min-width: 0;
  color: #333333;
  font-size: 22rpx;
  word-break: break-all;
}

@media screen and (max-width: 360px) {
  .sign-detail-container {
    padding-left: 18rpx;
    padding-right: 18rpx;
  }

  .sign-item {
    padding-left: 18rpx;
    padding-right: 18rpx;
  }
}

.is-plus {
  color: #ff2c3c;
}

.sign-item__icon.is-plus {
  color: #ffffff;
  background: #ff2c3c;
}

.is-minus {
  color: #222222;
}

.sign-item__icon.is-minus {
  color: #ffffff;
  background: #8f9aaf;
}

.data-null {
  padding-top: 120rpx;
}
</style>
