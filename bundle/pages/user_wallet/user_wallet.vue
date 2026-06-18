<template>
<view class="user-wallet">
    <navbar
        title="法币余额"
        :background="{ background: '#f7f8fa' }"
        :border-bottom="false"
    ></navbar>
    <view class="wallet-page">
        <view class="wallet-card">
            <view class="wallet-card__head">
                <view>
                    <view class="wallet-card__label">我的余额(HK$)</view>
                    <view class="wallet-card__amount">
                        <text>¥</text>{{ formatMoney(wallet.user_money) }}
                    </view>
                </view>
                <image class="wallet-card__image" :src="walletIconUrl" mode="aspectFit"></image>
            </view>
            <view class="wallet-card__foot">
                <view class="wallet-card__desc">
                    可提现金额
                    <text class="wallet-card__question">?</text>
                </view>
                <view class="wallet-card__value">¥{{ formatMoney(wallet.user_money) }}</view>
            </view>
        </view>
        <navigator
            v-if="wallet.open_racharge !== 0"
            class="wallet-btn"
            hover-class="none"
            url="/bundle/pages/user_payment/user_payment"
        >
            礼品卡充值
        </navigator>
        <view class="wallet-tabs">
            <view
                :class="['wallet-tab', activeTab === 0 ? 'wallet-tab--active' : '']"
                @tap="activeTab = 0"
            >
                余额明细
            </view>
            <view
                :class="['wallet-tab', activeTab === 1 ? 'wallet-tab--active' : '']"
                @tap="activeTab = 1"
            >
                提现记录
            </view>
        </view>
        <view class="wallet-panel">
            <template v-if="activeRecords.length">
                <navigator
                    v-for="(item, index) in activeRecords"
                    :key="index"
                    class="wallet-record"
                    hover-class="none"
                    :url="item.url"
                >
                    <view :class="['wallet-record__icon', item.iconClass]">
                        <text class="wallet-record__icon-text">{{ item.iconText }}</text>
                    </view>
                    <view class="wallet-record__main">
                        <view class="wallet-record__title">{{ item.title }}</view>
                        <view class="wallet-record__time">{{ item.time }}</view>
                    </view>
                    <view class="wallet-record__side">
                        <view :class="['wallet-record__amount', item.amountClass]">
                            {{ item.amount }}
                        </view>
                        <view class="wallet-record__balance">余额：{{ item.balance }}</view>
                    </view>
                </navigator>
            </template>
            <template v-else>
                <view class="empty-panel">
                    <view class="empty-illustration">
                        <view class="empty-cloud"></view>
                        <view class="empty-card"></view>
                        <view class="empty-search"></view>
                        <view class="empty-leaf empty-leaf--left"></view>
                        <view class="empty-leaf empty-leaf--right"></view>
                    </view>
                    <view class="empty-text">暂无数据</view>
                </view>
            </template>
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
import { getWallet, getAccountLog, getWithdrawRecords } from '@/api/user';
import { getDesignAsset } from '@/utils/design-assets';
export default {
  data() {
    return {
      wallet: {},
      walletIconUrl: getDesignAsset('/static/lanhu/assets/home/home2_balance_bill@2x.png'),
      activeTab: 0,
      billList: [],
      withdrawList: []
    };
  },

  components: {},
  props: {},

  onShow: function () {
    this.getWalletFun();
  },

  methods: {
    formatMoney(value) {
      const amount = Number(value || 0)
      return Number.isNaN(amount) ? (value || '0.00') : amount.toFixed(2)
    },
    normalizeAmount(value, positive) {
      const amount = Number(value || 0)
      const display = Number.isNaN(amount) ? value || '0.00' : Math.abs(amount).toFixed(2)
      return `${positive ? '+' : '-'}${display}`
    },
    normalizeBalance(value) {
      const amount = Number(value || 0)
      return Number.isNaN(amount) ? (value || '0.00') : amount.toFixed(2)
    },
    normalizeBillRecord(item) {
      const isIncome = Number(item.change_type) === 1 || Number(item.change_amount) > 0
      const rawTitle = item.source_type || item.type_desc || item.action || ''
      const title = rawTitle || (isIncome ? '充值金额' : '购买商品')
      return {
        title,
        time: item.create_time || item.change_time || '--',
        amount: this.normalizeAmount(item.change_amount, isIncome),
        amountClass: isIncome ? 'is-plus' : 'is-minus',
        balance: this.normalizeBalance(item.left_amount || item.left_money || item.balance || 0),
        iconClass: isIncome ? 'wallet-record__icon--income' : 'wallet-record__icon--expense',
        iconText: isIncome ? '+' : '-',
        url: '/bundle/pages/user_bill/user_bill?type=0'
      }
    },
    normalizeWithdrawRecord(item) {
      return {
        title: item.desc || item.status_desc || '提现',
        time: item.create_time || '--',
        amount: this.normalizeAmount(item.money || item.left_money || item.amount, false),
        amountClass: 'is-minus',
        balance: this.normalizeBalance(item.left_money || item.balance || 0),
        iconClass: 'wallet-record__icon--withdraw',
        iconText: '↥',
        url: `/bundle/pages/widthdraw_result/widthdraw_result?id=${item.id}&type=1`
      }
    },

    getWalletFun() {
      getWallet().then(res => {
        if (res.code == 1) {
          this.wallet = res.data
        }
      });
    },
    getBillListFun() {
      getAccountLog({
        source: 1,
        type: 0,
        page_no: 1
      }).then((res) => {
        if (res.code == 1) {
          this.billList = res.data.lists || res.data || []
        }
      })
    },
    getWithdrawListFun() {
      getWithdrawRecords({
        page_no: 1
      }).then((res) => {
        if (res.code == 1) {
          this.withdrawList = res.data.lists || res.data || []
        }
      })
    }

  },
  onLoad() {
    this.getBillListFun()
    this.getWithdrawListFun()
  },
  computed: {
    activeRecords() {
      return this.activeTab === 0 ? this.billRecords : this.withdrawRecords
    },
    billRecords() {
      return this.billList.map((item) => this.normalizeBillRecord(item))
    },
    withdrawRecords() {
      return this.withdrawList.map((item) => this.normalizeWithdrawRecord(item))
    }
  }
};
</script>
<style lang="scss">
.user-wallet {
    min-height: 100vh;
    background: #f7f8fa;
}

.wallet-page {
    padding: 16rpx 26rpx 0;
}

.wallet-card {
    position: relative;
    overflow: hidden;
    min-height: 288rpx;
    border-radius: 12rpx;
    background: linear-gradient(100deg, #0b84ff 0%, #176ff4 52%, #5a8af2 100%);
    color: #ffffff;
}

.wallet-card__head {
    display: flex;
    justify-content: space-between;
    padding: 40rpx 26rpx 30rpx;
}

.wallet-card__label {
    font-size: 28rpx;
    line-height: 40rpx;
}

.wallet-card__amount {
    margin-top: 22rpx;
    font-size: 46rpx;
    font-weight: 600;
    line-height: 56rpx;

    text {
        margin-right: 2rpx;
        font-size: 32rpx;
    }
}

.wallet-card__image {
    width: 180rpx;
    height: 142rpx;
    margin-top: -10rpx;
    margin-right: -6rpx;
    opacity: 0.78;
}

.wallet-card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 26rpx;
    padding: 28rpx 0 30rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.28);
}

.wallet-card__desc {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    line-height: 40rpx;
}

.wallet-card__question {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28rpx;
    height: 28rpx;
    margin-left: 10rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.92);
    border-radius: 50%;
    color: #ffffff;
    font-size: 22rpx;
    font-weight: 600;
    line-height: 28rpx;
}

.wallet-card__value {
    font-size: 28rpx;
    font-weight: 600;
}

.wallet-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 510rpx;
    height: 80rpx;
    margin: 24rpx auto 44rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    background: #0785ff;
    border-radius: 42rpx;
}

.wallet-tabs {
    position: relative;
    display: flex;
    overflow: hidden;
    height: 70rpx;
    border-radius: 10rpx 10rpx 0 0;
    background: #e5e8ec;
}

.wallet-tab {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #222222;
}

.wallet-tab--active {
    background: #ffffff;
    border-radius: 10rpx 30rpx 0 0;

    &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        width: 36rpx;
        height: 6rpx;
        background: #2f73ff;
        border-radius: 4rpx;
        transform: translateX(-50%);
    }
}

.wallet-tab:nth-child(2).wallet-tab--active {
    border-radius: 30rpx 10rpx 0 0;
}

.wallet-panel {
    min-height: 910rpx;
    padding: 8rpx 24rpx 24rpx;
    background: #ffffff;
    border-radius: 0 12rpx 0 0;
}

.wallet-record {
    display: flex;
    align-items: center;
    min-height: 104rpx;
    padding: 20rpx 0;

    & + .wallet-record {
        border-top: 1rpx solid #f0f1f4;
    }
}

.wallet-record__icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 54rpx;
    height: 54rpx;
    border-radius: 50%;
    box-shadow: 0 10rpx 24rpx rgba(57, 115, 255, 0.12);
}

.wallet-record__icon-text {
    font-size: 28rpx;
    font-weight: 600;
    line-height: 1;
}

.wallet-record__icon--income {
    background: linear-gradient(180deg, #eff5ff 0%, #dfeaff 100%);
    color: #4d7eff;
}

.wallet-record__icon--expense {
    background: linear-gradient(180deg, #f7ecff 0%, #efe1ff 100%);
    color: #8d4ff8;
}

.wallet-record__icon--withdraw {
    background: linear-gradient(180deg, #edf4ff 0%, #deebff 100%);
    color: #4f7eff;
}

.wallet-record__main {
    flex: 1;
    min-width: 0;
    padding: 0 18rpx 0 18rpx;
}

.wallet-record__title {
    font-size: 28rpx;
    font-weight: 600;
    color: #222222;
    line-height: 38rpx;
}

.wallet-record__time {
    margin-top: 4rpx;
    font-size: 18rpx;
    color: #999999;
    line-height: 28rpx;
}

.wallet-record__side {
    flex: none;
    text-align: right;
}

.wallet-record__amount {
    font-size: 24rpx;
    font-weight: 600;
    color: #222222;
    line-height: 34rpx;
}

.wallet-record__balance {
    margin-top: 4rpx;
    font-size: 18rpx;
    color: #999999;
    line-height: 28rpx;
}

.is-plus {
    color: #ff3131;
}

.is-minus {
    color: #222222;
}

.empty-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 720rpx;
    padding-bottom: 150rpx;
}

.empty-illustration {
    position: relative;
    width: 260rpx;
    height: 230rpx;
    opacity: 0.9;
}

.empty-cloud {
    position: absolute;
    left: 42rpx;
    top: 20rpx;
    width: 90rpx;
    height: 34rpx;
    border-radius: 34rpx;
    background: linear-gradient(180deg, #fbfbfc 0%, #f0f1f3 100%);

    &::before {
        content: '';
        position: absolute;
        left: 32rpx;
        bottom: 16rpx;
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: #f7f8fa;
    }
}

.empty-card {
    position: absolute;
    left: 78rpx;
    top: 100rpx;
    width: 162rpx;
    height: 82rpx;
    border-radius: 16rpx;
    background: linear-gradient(180deg, #eef0f2 0%, #dcdfe3 100%);
    box-shadow: -28rpx -28rpx 0 -10rpx #d9dce1;
    transform: rotate(1deg);

    &::before {
        content: 'XXXX XXXXX XX';
        position: absolute;
        left: 22rpx;
        top: 24rpx;
        color: rgba(255, 255, 255, 0.86);
        font-size: 18rpx;
        line-height: 24rpx;
    }

    &::after {
        content: '';
        position: absolute;
        right: 28rpx;
        bottom: 20rpx;
        width: 36rpx;
        height: 18rpx;
        border-radius: 18rpx;
        background: rgba(199, 203, 208, 0.86);
        box-shadow: 26rpx 0 0 rgba(211, 214, 218, 0.86);
    }
}

.empty-search {
    position: absolute;
    left: 54rpx;
    top: 128rpx;
    width: 66rpx;
    height: 66rpx;
    border: 12rpx solid #dfe2e6;
    border-radius: 50%;
    background: #eef0f3;

    &::after {
        content: '';
        position: absolute;
        right: -42rpx;
        bottom: -30rpx;
        width: 70rpx;
        height: 12rpx;
        border-radius: 10rpx;
        background: #dfe2e6;
        transform: rotate(-45deg);
    }
}

.empty-leaf {
    position: absolute;
    width: 18rpx;
    height: 50rpx;
    border-radius: 50%;
    background: linear-gradient(180deg, #e5e7eb 0%, #f4f5f7 100%);
}

.empty-leaf--left {
    left: 8rpx;
    top: 154rpx;
    transform: rotate(-24deg);
}

.empty-leaf--right {
    right: 8rpx;
    top: 174rpx;
    transform: rotate(28deg);
}

.empty-text {
    margin-top: 14rpx;
    color: #666666;
    font-size: 26rpx;
    line-height: 38rpx;
}

</style>
