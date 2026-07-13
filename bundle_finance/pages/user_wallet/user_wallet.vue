<template>
<view class="user-wallet">
    <navbar
        title="余额"
        :background="{ background: '#fff9f0' }"
        :border-bottom="false"
    ></navbar>
    <view class="wallet-page">
        <view class="wallet-card">
            <view class="wallet-card__head">
                <view>
                    <view class="wallet-card__label">我的余额（元）</view>
                    <view class="wallet-card__amount">
                        {{ formatMoneyWithSymbol(wallet.user_money) }}
                    </view>
                </view>
                <image class="wallet-card__image" :src="walletIconUrl" mode="aspectFit"></image>
            </view>
            <view class="wallet-card__foot">
                <view class="wallet-card__desc">
                    可提现金额
                    <text class="wallet-card__question" @tap.stop="showWithdrawableTip">?</text>
                </view>
                <view class="wallet-card__value">{{ formatMoneyWithSymbol(withdrawableAmount) }}</view>
            </view>
        </view>
        <view
            v-if="canWithdrawToBalance"
            class="wallet-btn"
            @tap="handleWithdrawTap"
        >
            微信提现到余额
        </view>
        <view class="wallet-action-card">
            <view
                v-for="item in walletActions"
                :key="item.name"
                class="wallet-action"
                @tap="goFinancePage(item.url)"
            >
                <view :class="['wallet-action__icon', 'wallet-action__icon--' + item.type]"></view>
                <view class="wallet-action__text">{{ item.name }}</view>
            </view>
        </view>
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
                    <view
                        v-for="(item, index) in activeRecords"
                        :key="index"
                        class="wallet-record"
                        hover-class="none"
                        @tap="openRecord(item)"
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
                    </view>
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
import { getWallet, getAccountLog, getWithdrawRecords, applyWithdraw } from '@/api/user';
export default {
  data() {
    return {
      wallet: {
        user_money: '',
        open_racharge: 0,
        open_recharge: 0,
        open_withdraw: 0
      },
      walletIconUrl: 'https://shengyuan.store/api/miniapp/files/miniapp/ce28a354dbb5412f9f776a748d865aa1/wallet-balance-icon.png',
      user_wallet: 'https://shengyuan.store/api/miniapp/files/miniapp/eb819a12b29d43be91001eb8e65f397d/wallet-card-bg.png',
      recordIcons: {
        billIncome: 'https://shengyuan.store/api/miniapp/files/miniapp/035992f38c874b088a24afeda2cb4a80/1eb0627a5caca505c66f5d2494ec65f3.png',
        billExpense: 'https://shengyuan.store/api/miniapp/files/miniapp/15c0909b36884ff99f8710d4c57c9a79/f712888273ee1a4831a3478ccbf43931.png',
        withdraw: 'https://shengyuan.store/api/miniapp/files/miniapp/ae84d734d2664603bd3c67798786800e/d0d334412f0bfc4ea6a16aa55bd61e62.png'
      },
      activeTab: 0,
      billList: [],
      withdrawList: []
    };
  },

  components: {
			Navbar
		},
  props: {},

  onShow: function () {
    this.getWalletFun();
  },

  methods: {
    formatMoney(value) {
      if (value === '' || value === null || value === undefined) return '待确认'
      const amount = Number(value)
      return Number.isNaN(amount) ? '待确认' : amount.toFixed(2)
    },
    formatMoneyWithSymbol(value) {
      const text = this.formatMoney(value)
      return text === '待确认' ? text : `¥${text}`
    },
    normalizeAmount(value, positive) {
      if (value === '' || value === null || value === undefined) return positive ? '+金额待确认' : '-金额待确认'
      const amount = Number(value)
      const display = Number.isNaN(amount) ? '金额待确认' : Math.abs(amount).toFixed(2)
      return `${positive ? '+' : '-'}${display}`
    },
    normalizeBalance(value) {
      if (value === '' || value === null || value === undefined) return '待确认'
      const amount = Number(value)
      return Number.isNaN(amount) ? '待确认' : amount.toFixed(2)
    },
    hasKnownValue(value) {
      return value !== undefined && value !== null && value !== ''
    },
    displayText(value, fallback) {
      return this.hasKnownValue(value) ? value : fallback
    },
    isIncomeRecord(item = {}) {
      const value = item.direction ?? item.change_type ?? item.changeType ?? item.type
      const text = String(value).toLowerCase()
      if (value == 1 || text === 'in' || text === 'income') return true
      if (value == 2 || text === 'out' || text === 'expense') return false
      const amount = Number(item.change_amount ?? item.money ?? item.amount)
      return !Number.isNaN(amount) && amount > 0
    },
    normalizeBillRecord(item) {
      const isIncome = this.isIncomeRecord(item)
      const rawTitle = item.source_type || item.type_desc || item.action || ''
      const amount = item.change_amount ?? item.money ?? item.amount
      return {
        title: this.displayText(rawTitle, '账单类型待确认'),
        time: this.displayText(item.create_time || item.change_time, '时间待确认'),
        amount: this.normalizeAmount(amount, isIncome),
        amountClass: isIncome ? 'is-plus' : 'is-minus',
        balance: this.normalizeBalance(item.left_amount ?? item.left_money ?? item.balance ?? ''),
        icon: isIncome ? this.recordIcons.billIncome : this.recordIcons.billExpense,
        url: '/bundle_finance/pages/user_bill/user_bill?type=0'
      }
    },
    normalizeWithdrawRecord(item) {
      const id = item.id || item.sn || ''
      return {
        title: this.displayText(item.desc || item.status_desc || item.type_desc || item.source_type, '提现记录待确认'),
        time: this.displayText(item.create_time, '时间待确认'),
        amount: this.normalizeAmount(item.money ?? item.change_amount ?? item.amount, false),
        amountClass: 'is-minus',
        balance: this.normalizeBalance(item.left_amount ?? item.left_money ?? item.balance ?? ''),
        icon: this.recordIcons.withdraw,
        url: id ? `/bundle_finance/pages/widthdraw_result/widthdraw_result?id=${encodeURIComponent(id)}&type=1` : '',
        missingUrlTip: '提现记录信息待确认'
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
          const data = res.data || {}
          this.billList = Array.isArray(data.lists) ? data.lists : (Array.isArray(data) ? data : [])
        }
      })
    },
    getWithdrawListFun() {
      getWithdrawRecords({
        bizType: 'WITHDRAW',
        page_no: 1
      }).then((res) => {
        if (res.code == 1) {
          const data = res.data || {}
          this.withdrawList = Array.isArray(data.lists) ? data.lists : (Array.isArray(data) ? data : [])
        }
      })
    },
    handleWithdrawTap() {
      uni.showModal({
        title: '微信提现到余额',
        placeholderText: '请输入提现金额',
        editable: true,
        confirmText: '确认提现',
        success: async ({ confirm, content }) => {
          if (!confirm) return
          const amount = Number(content || 0)
          if (!amount || amount <= 0) {
            uni.showToast({ title: '请输入正确金额', icon: 'none' })
            return
          }
          uni.showLoading({ title: '正在提交', mask: true })
          try {
            const withdrawNo = `wechat-to-balance-${Date.now()}`
            const res = await applyWithdraw({
              amount,
              accountType: 'BALANCE',
              accountNo: this.wallet.accountNo || this.wallet.account_no || this.wallet.userNo || this.wallet.user_no || 'BALANCE',
              accountName: this.wallet.accountName || this.wallet.account_name || this.wallet.nickname || '',
              idempotentKey: withdrawNo
            })
            if (res.code != 1) throw new Error(res.msg || '提现申请失败')
            uni.showToast({ title: '已提交入账申请', icon: 'none' })
            this.activeTab = 1
            this.getWalletFun()
            this.getWithdrawListFun()
          } catch (error) {
            uni.showToast({ title: error.message || '提现申请失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },
    showWithdrawableTip() {
      uni.showModal({
        title: '可提现金额说明',
        content: '这里的提现表示将微信侧资金转入当前小程序“我的余额”，不受当前页可提现金额限制，实际处理结果以平台审核为准。',
        showCancel: false,
        confirmText: '知道了'
      })
    },
    goFinancePage(url) {
      if (!url) return
      uni.navigateTo({ url })
    },
    openRecord(item = {}) {
      if (!item.url) {
        uni.showToast({ title: item.missingUrlTip || '记录信息待确认', icon: 'none' })
        return
      }
      uni.navigateTo({ url: item.url })
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
    withdrawableAmount() {
      return this.wallet.withdrawable_amount ?? this.wallet.able_withdraw ?? this.wallet.withdrawableAmount ?? this.wallet.user_money ?? ''
    },
    activeRecords() {
      return this.activeTab === 0 ? this.billRecords : this.withdrawRecords
    },
    walletActions() {
      const actions = []
      if (this.canRecharge) {
        actions.push({ name: '余额充值', type: 'recharge', url: '/bundle_finance/pages/user_payment/user_payment' })
      }
      actions.push(
        { name: '钱包明细', type: 'bill', url: '/bundle_finance/pages/user_bill/user_bill?type=0' },
        { name: '提现记录', type: 'withdraw', url: '/bundle_finance/pages/user_withdraw_code/user_withdraw_code' },
        { name: '余额转账', type: 'transfer', url: '/bundle_finance/pages/balance_transfer/balance_transfer' },
        { name: '转账记录', type: 'record', url: '/bundle_finance/pages/transfer_record/transfer_record?type=0' },
        { name: '转账密码', type: 'password', url: '/bundle_finance/pages/set_pay_pwd/set_pay_pwd' }
      )
      return actions
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
    },
    canRecharge() {
      return Number(this.wallet.open_racharge ?? this.wallet.open_recharge ?? 0) !== 0
    },
    canWithdrawToBalance() {
      return Number(this.wallet.open_withdraw ?? 0) !== 0
    }
  }
};
</script>
<style lang="scss">
.user-wallet {
    min-height: 100vh;
    background: #fff9f0;
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
    background: linear-gradient(108deg, #b26c10 0%, #a0610d 52%, #d79a43 100%);
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

.wallet-action-card {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18rpx 12rpx;
    margin: 0 0 24rpx;
    padding: 24rpx 18rpx 20rpx;
    background: #ffffff;
    border-radius: 18rpx;
    box-sizing: border-box;
}

.wallet-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
}

.wallet-action__icon {
    position: relative;
    width: 62rpx;
    height: 62rpx;
    border-radius: 50%;
    background: #fff1dc;
    box-sizing: border-box;
}

.wallet-action__icon::before,
.wallet-action__icon::after {
    content: '';
    position: absolute;
    box-sizing: border-box;
}

.wallet-action__icon--recharge::before,
.wallet-action__icon--bill::before,
.wallet-action__icon--withdraw::before {
    left: 16rpx;
    top: 18rpx;
    width: 30rpx;
    height: 24rpx;
    border: 4rpx solid #0785ff;
    border-radius: 6rpx;
}

.wallet-action__icon--recharge::after {
    left: 29rpx;
    top: 10rpx;
    width: 4rpx;
    height: 42rpx;
    background: #0785ff;
    box-shadow: -10rpx 10rpx 0 -8rpx #0785ff, 10rpx 10rpx 0 -8rpx #0785ff;
}

.wallet-action__icon--bill::after {
    left: 21rpx;
    top: 25rpx;
    width: 20rpx;
    height: 4rpx;
    background: #0785ff;
    box-shadow: 0 10rpx 0 #0785ff;
}

.wallet-action__icon--withdraw::after {
    left: 25rpx;
    top: 12rpx;
    width: 12rpx;
    height: 28rpx;
    border-right: 4rpx solid #0785ff;
    border-bottom: 4rpx solid #0785ff;
    transform: rotate(45deg);
}

.wallet-action__icon--transfer::before,
.wallet-action__icon--record::before {
    left: 14rpx;
    top: 19rpx;
    width: 34rpx;
    height: 22rpx;
    border-top: 4rpx solid #0785ff;
    border-bottom: 4rpx solid #0785ff;
}

.wallet-action__icon--transfer::after {
    left: 19rpx;
    top: 15rpx;
    width: 24rpx;
    height: 24rpx;
    border-top: 4rpx solid #0785ff;
    border-right: 4rpx solid #0785ff;
    transform: rotate(45deg);
}

.wallet-action__icon--record::after {
    left: 19rpx;
    top: 14rpx;
    width: 24rpx;
    height: 34rpx;
    border-left: 4rpx solid #0785ff;
    border-bottom: 4rpx solid #0785ff;
    transform: skewY(-15deg);
}

.wallet-action__icon--password::before {
    left: 17rpx;
    top: 26rpx;
    width: 28rpx;
    height: 20rpx;
    border: 4rpx solid #0785ff;
    border-radius: 6rpx;
}

.wallet-action__icon--password::after {
    left: 22rpx;
    top: 14rpx;
    width: 18rpx;
    height: 20rpx;
    border: 4rpx solid #0785ff;
    border-bottom: 0;
    border-radius: 18rpx 18rpx 0 0;
}

.wallet-action__text {
    max-width: 100%;
    margin-top: 10rpx;
    color: #222222;
    font-size: 24rpx;
    line-height: 30rpx;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    word-break: break-all;
}

.wallet-record__time {
    margin-top: 18rpx;
    font-size: 20rpx;
    color: #999999;
    line-height: 28rpx;
    word-break: break-all;
}

.wallet-record__side {
    flex: none;
    width: 180rpx;
    max-width: 38%;
    text-align: right;
    word-break: break-all;
}

.wallet-record__amount {
    font-size: 30rpx;
    font-weight: 600;
    color: #222222;
    line-height: 36rpx;
    word-break: break-all;
}

.wallet-record__balance {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #999999;
    line-height: 30rpx;
    word-break: break-all;
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
        background: #fff8ed;
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
        content: '';
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
        left: 50rpx;
        bottom: -24rpx;
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
