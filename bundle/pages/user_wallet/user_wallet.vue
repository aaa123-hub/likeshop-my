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
                    <view class="wallet-card__label">我的余额(HK$）</view>
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
        <view class="wallet-records-card">
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
            <view :class="['wallet-panel', activeTab === 1 ? 'wallet-panel--withdraw' : '']">
                <template v-if="activeRecords.length">
                    <navigator
                        v-for="(item, index) in activeRecords"
                        :key="index"
                        class="wallet-record"
                        hover-class="none"
                        :url="item.url"
                    >
                        <image class="wallet-record__icon" :src="item.icon" mode="aspectFit"></image>
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
                            <image style="width: 100%;height: 100%;" :src="user_wallet"></image>
                        </view>
                        <view class="empty-text">暂无数据</view>
                    </view>
                </template>
            </view>
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
export default {
  data() {
    return {
      wallet: {
        user_money: 0,
        open_racharge: 1
      },
      walletIconUrl: '/static/lanhu/assets/home/wallet_balance_icon.png',
      user_wallet: '/static/lanhu/assets/home/user_wallet.png',
      recordIcons: {
        billIncome: 'https://lanhu-oss-proxy.lanhuapp.com/1eb0627a5caca505c66f5d2494ec65f3',
        billExpense: 'https://lanhu-oss-proxy.lanhuapp.com/f712888273ee1a4831a3478ccbf43931',
        withdraw: 'https://lanhu-oss-proxy.lanhuapp.com/d0d334412f0bfc4ea6a16aa55bd61e62'
      },
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
        icon: isIncome ? this.recordIcons.billIncome : this.recordIcons.billExpense,
        url: '/bundle/pages/user_bill/user_bill?type=0'
      }
    },
    normalizeWithdrawRecord(item) {
      return {
        title: item.desc || item.status_desc || item.type_desc || item.source_type || '提现',
        time: item.create_time || '--',
        amount: this.normalizeAmount(item.money || item.change_amount || item.amount, false),
        amountClass: 'is-minus',
        balance: this.normalizeBalance(item.left_amount || item.left_money || item.balance || 0),
        icon: this.recordIcons.withdraw,
        url: `/bundle/pages/widthdraw_result/widthdraw_result?id=${item.id}&type=1`
      }
    },

    getWalletFun() {
      getWallet().then(res => {
        if (res.code == 1) {
          this.wallet = Object.assign({}, this.wallet, res.data)
        }
      });
    },
    getBillListFun() {
      getAccountLog({
        page_no: 1
      }).then((res) => {
        if (res.code == 1) {
          this.billList = res.data.lists || res.data || []
        }
      })
    },
    getWithdrawListFun() {
      getWithdrawRecords({
        bizType: 'WITHDRAW',
        page_no: 1
      }).then((res) => {
        if (res.code == 1) {
          this.withdrawList = res.data.lists || res.data || []
        }
      })
    }

  },
  onLoad(options) {
    if (options && (options.tab === 'withdraw' || options.mode === 'withdraw')) {
      this.activeTab = 1
    }
    this.getBillListFun()
    this.getWithdrawListFun()
  },
  computed: {
    activeRecords() {
      return this.activeTab === 0 ? this.billRecords : this.withdrawRecords
    },
    billRecords() {
      if (this.billList.length) {
        return this.billList.map((item) => this.normalizeBillRecord(item))
      }
      return []
    },
    withdrawRecords() {
      if (this.withdrawList.length) {
        return this.withdrawList.map((item) => this.normalizeWithdrawRecord(item))
      }
      return []
    }
  }
};
</script>
<style lang="scss">
.user-wallet {
    min-height: 100vh;
    background: #f5f7fb;
}

.wallet-page {
    min-height: calc(100vh - 88rpx);
    padding: 18rpx 24rpx 0;
}

.wallet-card {
    position: relative;
    overflow: hidden;
    height: 298rpx;
    border-radius: 18rpx;
    background: linear-gradient(108deg, #0187ff 0%, #037dfa 52%, #2f75ff 100%);
    color: #ffffff;
    box-shadow: 0 14rpx 34rpx rgba(3, 125, 250, 0.18);
}

.wallet-card__head {
    display: flex;
    justify-content: space-between;
    padding: 29rpx 32rpx 0 26rpx;
}

.wallet-card__label {
    font-size: 27rpx;
    line-height: 32rpx;
    white-space: nowrap;
}

.wallet-card__amount {
    margin-top: 34rpx;
    font-size: 49rpx;
    font-weight: 600;
    line-height: 52rpx;

    text {
        margin-right: 2rpx;
        font-size: 31rpx;
    }
}

.wallet-card__image {
    flex: none;
    width: 138rpx;
    height: 133rpx;
    margin-top: 0;
    opacity: 1;
}

.wallet-card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 30rpx 16rpx 0;
    padding: 31rpx 27rpx 0 11rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.28);
}

.wallet-card__desc {
    display: flex;
    align-items: center;
    color: #d5e0e6;
    font-size: 24rpx;
    line-height: 30rpx;
}

.wallet-card__question {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30rpx;
    height: 30rpx;
    margin-left: 10rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.92);
    border-radius: 50%;
    color: #ffffff;
    font-size: 22rpx;
    font-weight: 600;
    line-height: 28rpx;
}

.wallet-card__value {
    font-size: 31rpx;
    font-weight: 600;
    line-height: 34rpx;
}

.wallet-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 510rpx;
    height: 81rpx;
    margin: 16rpx auto 45rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    background: #0785ff;
    border-radius: 40rpx;
}

.wallet-records-card {
    overflow: hidden;
    min-height: calc(100vh - 611rpx);
    background: #ffffff;
    border-radius: 18rpx 18rpx 0 0;
}

.wallet-tabs {
    position: relative;
    display: flex;
    overflow: hidden;
    width: 100%;
    height: 78rpx;
    margin: 0;
    padding: 0;
    background: linear-gradient(180deg, #eef1f4 0%, #e3e7eb 100%);
    border-radius: 18rpx 18rpx 0 0;
}

.wallet-tab {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    height: 78rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #222222;
    white-space: nowrap;
}

.wallet-tab--active {
    background: #ffffff;

    &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 8rpx;
        width: 35rpx;
        height: 7rpx;
        background: #2a7aff;
        border-radius: 6rpx;
        transform: translateX(-50%);
    }
}

.wallet-tab:first-child.wallet-tab--active {
    border-radius: 18rpx 34rpx 0 0;
}

.wallet-tab:nth-child(2).wallet-tab--active {
    border-radius: 34rpx 18rpx 0 0;
}

.wallet-panel {
    min-height: calc(100vh - 692rpx);
    padding: 18rpx 16rpx 24rpx;
    background: #ffffff;
}

.wallet-record {
    display: flex;
    align-items: center;
    min-height: 117rpx;
    padding: 10rpx 0;

    & + .wallet-record {
        border-top: 1rpx solid #f0f1f4;
    }
}

.wallet-record__icon {
    flex: none;
    width: 117rpx;
    height: 117rpx;
}

.wallet-record__main {
    flex: 1;
    min-width: 0;
    padding: 0 18rpx 0 6rpx;
}

.wallet-record__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #222222;
    line-height: 38rpx;
}

.wallet-record__time {
    margin-top: 18rpx;
    font-size: 20rpx;
    color: #999999;
    line-height: 28rpx;
}

.wallet-record__side {
    flex: none;
    width: 150rpx;
    text-align: right;
}

.wallet-record__amount {
    font-size: 30rpx;
    font-weight: 600;
    color: #222222;
    line-height: 34rpx;
}

.wallet-record__balance {
    margin-top: 16rpx;
    font-size: 24rpx;
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
