<template>
    <view class="withdraw-page">
        <navbar title="提现" :is-back="true" :border-bottom="false"></navbar>

        <view class="withdraw-hero">
            <view class="withdraw-hero__label">可提现金额</view>
            <view class="withdraw-hero__amount">{{ availableAmountWithSymbol }}</view>
            <view class="withdraw-hero__meta">
                <text>手续费 {{ feePercentText }}</text>
                <text class="withdraw-hero__dot"></text>
                <text>预计到账 {{ arriveAmountWithSymbol }}</text>
            </view>
        </view>

        <view class="withdraw-card">
            <view class="withdraw-section-title">提现方式</view>
            <view v-if="withdrawWays.length" class="withdraw-way-grid">
                <view
                    v-for="item in withdrawWays"
                    :key="item.value"
                    :class="['withdraw-way', currentType == item.value ? 'withdraw-way--active' : '']"
                    @tap="selectWithdrawWay(item.value)"
                >
                    <view class="withdraw-way__name">{{ item.name }}</view>
                    <view class="withdraw-way__desc">{{ wayDesc(item.value) }}</view>
                </view>
            </view>
            <view v-else class="withdraw-empty">暂无可用提现方式</view>
        </view>

        <view class="withdraw-card withdraw-amount-card">
            <view class="withdraw-section-title">提现金额</view>
            <view class="withdraw-amount-input">
                <text class="withdraw-amount-input__symbol">¥</text>
                <input v-model="money" type="digit" placeholder="0.00" placeholder-class="withdraw-placeholder" confirm-type="done" always-embed :cursor-spacing="180" @blur="normalizeMoneyInput" />
                <view class="withdraw-all" @tap="allWithdraw">全部</view>
            </view>
            <view class="withdraw-balance-row">
                <text>可提现 {{ availableAmountWithSymbol }}</text>
                <text>服务费 {{ feeAmountWithSymbol }}</text>
            </view>
        </view>

        <view v-if="needAccountInfo" class="withdraw-card">
            <view class="withdraw-section-title">收款信息</view>
            <view class="withdraw-field">
                <view class="withdraw-field__label">{{ accountLabel }}</view>
                <input v-model="account" class="withdraw-field__input" :placeholder="accountPlaceholder" placeholder-class="withdraw-placeholder" confirm-type="done" always-embed :cursor-spacing="180" />
            </view>
            <view class="withdraw-field">
                <view class="withdraw-field__label">真实姓名</view>
                <input v-model="realName" class="withdraw-field__input" placeholder="请输入真实姓名" placeholder-class="withdraw-placeholder" confirm-type="done" always-embed :cursor-spacing="180" />
            </view>
            <template v-if="isBankWithdraw">
                <view class="withdraw-field">
                    <view class="withdraw-field__label">提现银行</view>
                    <input v-model="bank" class="withdraw-field__input" placeholder="请输入开户银行" placeholder-class="withdraw-placeholder" confirm-type="done" always-embed :cursor-spacing="180" />
                </view>
                <view class="withdraw-field">
                    <view class="withdraw-field__label">银行支行</view>
                    <input v-model="subbank" class="withdraw-field__input" placeholder="请输入银行支行" placeholder-class="withdraw-placeholder" confirm-type="done" always-embed :cursor-spacing="180" />
                </view>
            </template>
            <view class="withdraw-field">
                <view class="withdraw-field__label">备注</view>
                <input v-model="remark" class="withdraw-field__input" placeholder="选填" placeholder-class="withdraw-placeholder" confirm-type="done" always-embed :cursor-spacing="180" />
            </view>
            <view v-if="needQrCode" class="withdraw-upload">
                <view class="withdraw-upload__title">{{ qrCodeLabel }}</view>
                <uploader @after-read="afterRead" :file-list="[]" :max-upload="1" :deletable="false" useSlot>
                    <view class="withdraw-upload__box">
                        <image v-if="qrCode" class="withdraw-upload__image" :src="qrCode" mode="aspectFill"></image>
                        <view v-else class="withdraw-upload__empty">
                            <image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/uploader_icon.png" mode="aspectFit"></image>
                            <text>上传收款码</text>
                        </view>
                    </view>
                </uploader>
                <view v-if="qrCode" class="withdraw-upload__delete" @tap="handleDelete">重新上传</view>
            </view>
        </view>

        <view class="withdraw-tips">
            <view>提现申请提交后进入平台审核，到账时间以平台审核结果为准。</view>
            <view>提现可能扣除服务费，请自行承担并申报相关税费。</view>
        </view>

        <view class="withdraw-footer">
            <view :class="['withdraw-submit', submitting || !canSubmit ? 'withdraw-submit--disabled' : '']" @tap="applyWithdrawFun">
                {{ submitting ? '提交中...' : '确认提现' }}
            </view>
            <navigator url="/bundle_finance/pages/user_withdraw_code/user_withdraw_code" hover-class="none" class="withdraw-record">查看提现记录</navigator>
        </view>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import Uploader from '@/bundle_user/components/uploader/uploader.vue'
import { applyWithdraw, getWithdrawConfig } from '@/api/user'
import { uploadFile } from '@/utils/tools'
import { withdrawType } from '@/utils/type'
import { mapGetters } from 'vuex'

export default {
    components: {
        Navbar,
        Uploader
    },
    data() {
        return {
            currentType: '',
            money: '',
            account: '',
            realName: '',
            bank: '',
            subbank: '',
            qrCode: '',
            remark: '',
            fileList: [],
            widthDrawConfig: {},
            withdrawWays: [],
            presetType: '',
            submitting: false
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        availableAmount() {
            return this.pickNumber(
                this.widthDrawConfig.able_withdraw,
                this.widthDrawConfig.withdrawable_amount,
                this.widthDrawConfig.withdrawableAmount,
                this.widthDrawConfig.balance,
                this.widthDrawConfig.user_money
            )
        },
        availableAmountText() {
            return this.formatMoney(this.availableAmount)
        },
        availableAmountWithSymbol() {
            return this.formatMoneyWithSymbol(this.availableAmount)
        },
        feePercent() {
            return this.pickNumber(this.widthDrawConfig.poundage_percent, this.widthDrawConfig.poundagePercent)
        },
        feePercentText() {
            return this.hasRealValue(this.feePercent) ? `${this.formatPercent(this.feePercent)}%` : '待确认'
        },
        isWithdrawOpen() {
            return Number(this.widthDrawConfig.open_withdraw ?? this.widthDrawConfig.openWithdraw ?? 0) !== 0
        },
        minWithdrawAmount() {
            return this.pickNumber(this.widthDrawConfig.min_withdraw, this.widthDrawConfig.minWithdraw, this.widthDrawConfig.min_withdraw_amount)
        },
        maxWithdrawAmount() {
            return this.pickNumber(this.widthDrawConfig.max_withdraw, this.widthDrawConfig.maxWithdraw, this.widthDrawConfig.max_withdraw_amount)
        },
        moneyAmount() {
            const amount = Number(this.money)
            return this.money === '' || Number.isNaN(amount) ? null : amount
        },
        feeAmount() {
            return this.moneyAmount > 0 && this.hasRealValue(this.feePercent) ? this.moneyAmount * this.feePercent / 100 : null
        },
        feeAmountText() {
            return this.formatMoney(this.feeAmount)
        },
        feeAmountWithSymbol() {
            return this.formatMoneyWithSymbol(this.feeAmount)
        },
        arriveAmountText() {
            return this.moneyAmount > 0 && this.hasRealValue(this.feeAmount)
                ? this.formatMoney(Math.max(this.moneyAmount - this.feeAmount, 0))
                : '待确认'
        },
        arriveAmountWithSymbol() {
            return this.moneyAmount > 0 && this.hasRealValue(this.feeAmount)
                ? this.formatMoneyWithSymbol(Math.max(this.moneyAmount - this.feeAmount, 0))
                : '待确认'
        },
        currentWay() {
            return this.withdrawWays.find(item => String(item.value) === String(this.currentType)) || {}
        },
        needAccountInfo() {
            return [withdrawType.PAY_WECHAT, withdrawType.PAY_ALIPAY, withdrawType.BANK].includes(Number(this.currentType))
        },
        needQrCode() {
            return [withdrawType.PAY_WECHAT, withdrawType.PAY_ALIPAY].includes(Number(this.currentType))
        },
        isBankWithdraw() {
            return Number(this.currentType) === withdrawType.BANK
        },
        accountLabel() {
            if (Number(this.currentType) === withdrawType.PAY_WECHAT) return '微信账号'
            if (Number(this.currentType) === withdrawType.PAY_ALIPAY) return '支付宝账号'
            if (this.isBankWithdraw) return '银行卡号'
            return '收款账号'
        },
        accountPlaceholder() {
            return `请输入${this.accountLabel}`
        },
        qrCodeLabel() {
            return Number(this.currentType) === withdrawType.PAY_ALIPAY ? '支付宝收款码' : '微信收款码'
        },
        canSubmit() {
            return Boolean(this.isWithdrawOpen && this.currentWay.value && this.moneyAmount > 0 && this.hasRealValue(this.availableAmount) && this.moneyAmount <= this.availableAmount)
        }
    },
    onLoad(options = {}) {
        this.presetType = options.type || options.accountType || ''
        this.getWithdrawConfigFun()
    },
    methods: {
        hasRealValue(value) {
            if (value === undefined || value === null || value === '') return false
            const amount = Number(value)
            return !Number.isNaN(amount) && Number.isFinite(amount)
        },
        pickNumber(...values) {
            for (const value of values) {
                if (this.hasRealValue(value)) return Number(value)
            }
            return null
        },
        formatMoney(value) {
            return this.hasRealValue(value) ? Number(value).toFixed(2) : '待确认'
        },
        formatMoneyWithSymbol(value) {
            return this.hasRealValue(value) ? `¥${this.formatMoney(value)}` : '待确认'
        },
        formatPercent(value) {
            if (!this.hasRealValue(value)) return ''
            const percent = Number(value)
            return Number.isInteger(percent) ? String(percent) : percent.toFixed(2).replace(/\.?0+$/, '')
        },
        wayDesc(type) {
            const descMap = {
                [withdrawType.ACCOUNT]: '转入账户余额',
                [withdrawType.WECHAT]: '转入微信零钱',
                [withdrawType.PAY_WECHAT]: '通过微信收款码审核打款',
                [withdrawType.PAY_ALIPAY]: '通过支付宝收款码审核打款',
                [withdrawType.BANK]: '审核后打款至银行卡'
            }
            return descMap[type] || '提交后平台审核'
        },
        selectWithdrawWay(value) {
            if (String(this.currentType) === String(value)) return
            this.currentType = value
            this.account = ''
            this.realName = ''
            this.bank = ''
            this.subbank = ''
            this.qrCode = ''
            this.remark = ''
            this.fileList = []
        },
        allWithdraw() {
            this.money = this.hasRealValue(this.availableAmount) && this.availableAmount > 0 ? this.formatMoney(this.availableAmount) : ''
        },
        normalizeMoneyInput() {
            if (!this.money) return
            const amount = Number(this.money)
            this.money = Number.isNaN(amount) || amount <= 0 ? '' : this.formatMoney(amount)
        },
        getWithdrawConfigFun() {
            getWithdrawConfig().then(res => {
                if (res.code == 1) {
                    const data = res.data || {}
                    const ways = Array.isArray(data.type) ? data.type : []
                    this.widthDrawConfig = data
                    this.withdrawWays = ways.filter(item => item && item.value)
                    this.currentType = this.resolveInitialWithdrawType()
                } else {
                    this.widthDrawConfig = { open_withdraw: 0 }
                    this.withdrawWays = []
                    this.currentType = this.resolveInitialWithdrawType()
                    this.$toast({ title: res.msg || '提现配置获取失败' })
                }
            }).catch((err) => {
                this.widthDrawConfig = { open_withdraw: 0 }
                this.withdrawWays = []
                this.currentType = this.resolveInitialWithdrawType()
                this.$toast({ title: err?.msg || err?.message || '提现配置获取失败' })
            })
        },
        resolveInitialWithdrawType() {
            const preset = this.withdrawWays.find(item => String(item.value) === String(this.presetType))
            return preset?.value || this.withdrawWays[0]?.value || ''
        },
        afterRead(files) {
            const list = Array.isArray(files) ? files : [files]
            if (!list.length) return
            uni.showLoading({ title: '正在上传中...', mask: true })
            uploadFile(list[0].path).then(res => {
                this.fileList = [res]
                this.qrCode = res.url
            }).catch((err) => {
                this.$toast({ title: err?.msg || err?.message || '上传失败' })
            }).finally(() => {
                uni.hideLoading()
            })
        },
        handleDelete(index) {
            if (typeof index === 'number') this.fileList.splice(index, 1)
            else this.fileList = []
            this.qrCode = ''
        },
        validateForm() {
            this.normalizeMoneyInput()
            if (!this.isWithdrawOpen) return '提现功能暂未开放'
            if (!this.currentWay.value) return '暂无可用提现方式'
            if (!this.money) return '请输入提现金额'
            if (this.moneyAmount <= 0) return '提现金额必须大于0'
            if (!this.hasRealValue(this.availableAmount)) return '可提现金额待确认'
            if (this.moneyAmount > this.availableAmount) return '提现金额不能超过可提现金额'
            if (this.hasRealValue(this.minWithdrawAmount) && this.minWithdrawAmount > 0 && this.moneyAmount < this.minWithdrawAmount) return `提现金额不能低于${this.formatMoney(this.minWithdrawAmount)}元`
            if (this.hasRealValue(this.maxWithdrawAmount) && this.maxWithdrawAmount > 0 && this.moneyAmount > this.maxWithdrawAmount) return `提现金额不能高于${this.formatMoney(this.maxWithdrawAmount)}元`
            if (this.needAccountInfo && !this.account.trim()) return `请输入${this.accountLabel}`
            if (this.needAccountInfo && !this.realName.trim()) return '请输入真实姓名'
            if (this.needQrCode && !this.qrCode) return `请上传${this.qrCodeLabel}`
            if (this.isBankWithdraw && !this.bank.trim()) return '请输入提现银行'
            if (this.isBankWithdraw && !this.subbank.trim()) return '请输入银行支行'
            return ''
        },
        applyWithdrawFun() {
            if (this.submitting) return
            const message = this.validateForm()
            if (message) {
                this.$toast({ title: message })
                return
            }
            this.submitting = true
            const withdrawNo = `withdraw-${Date.now()}`
            applyWithdraw({
                type: this.currentWay.value,
                money: this.moneyAmount,
                account: this.account.trim(),
                real_name: this.realName.trim(),
                money_qr_code: this.qrCode,
                remark: this.remark.trim(),
                bank: this.bank.trim(),
                subbank: this.subbank.trim(),
                idempotentKey: withdrawNo
            }).then(res => {
                if (res.code == 1) {
                    const result = res.data || {}
                    const resultId = result.id || result.withdrawId || result.withdrawNo || result.withdraw_no || withdrawNo
                    this.$toast({ title: '提交成功' }, {
                        tab: 2,
                        url: `/bundle_finance/pages/widthdraw_result/widthdraw_result?id=${resultId}`
                    })
                } else {
                    this.$toast({ title: res.msg || '提现申请失败' })
                }
            }).catch((err) => {
                this.$toast({ title: err?.msg || err?.message || '提现申请失败' })
            }).finally(() => {
                this.submitting = false
            })
        }
    }
}
</script>

<style lang="scss">
page {
    background: #fff9f0;
}

.withdraw-page {
    min-height: 100vh;
    padding: 0 24rpx calc(260rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: linear-gradient(180deg, #fff1dc 0%, #fff9f0 420rpx, #fff9f0 100%);
}

.withdraw-hero {
    margin-top: 24rpx;
    padding: 36rpx 32rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #a0610d 0%, #d79a43 100%);
    border-radius: 28rpx;
    box-shadow: 0 18rpx 46rpx rgba(160, 97, 13, 0.22);
}

.withdraw-hero__label {
    font-size: 26rpx;
    line-height: 36rpx;
    opacity: 0.86;
}

.withdraw-hero__amount {
    margin-top: 12rpx;
    font-size: 60rpx;
    line-height: 78rpx;
    font-weight: 800;
}

.withdraw-hero__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 18rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    opacity: 0.92;
}

.withdraw-hero__dot {
    width: 8rpx;
    height: 8rpx;
    margin: 0 14rpx;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
}

.withdraw-card {
    margin-top: 22rpx;
    padding: 28rpx 24rpx;
    background: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 12rpx 36rpx rgba(31, 55, 88, 0.06);
}

.withdraw-section-title {
    color: #1f2937;
    font-size: 30rpx;
    line-height: 42rpx;
    font-weight: 700;
}

.withdraw-way-grid {
    display: flex;
    flex-wrap: wrap;
    margin: 20rpx -8rpx -12rpx;
}

.withdraw-way {
    width: calc(50% - 16rpx);
    min-height: 118rpx;
    margin: 0 8rpx 16rpx;
    padding: 20rpx;
    box-sizing: border-box;
    background: #fff8ed;
    border: 2rpx solid transparent;
    border-radius: 20rpx;
}

.withdraw-way--active {
    background: #fff1dc;
    border-color: #d79a43;
}

.withdraw-way__name {
    color: #111827;
    font-size: 28rpx;
    line-height: 38rpx;
    font-weight: 700;
}

.withdraw-way__desc {
    margin-top: 8rpx;
    color: #667085;
    font-size: 22rpx;
    line-height: 32rpx;
}

.withdraw-empty {
    margin-top: 20rpx;
    color: #98a2b3;
    font-size: 26rpx;
    line-height: 38rpx;
}

.withdraw-amount-card {
    padding-bottom: 22rpx;
}

.withdraw-amount-input {
    display: flex;
    align-items: center;
    margin-top: 24rpx;
    padding-bottom: 22rpx;
    border-bottom: 1rpx solid #edf0f5;
}

.withdraw-amount-input__symbol {
    color: #1f2937;
    font-size: 42rpx;
    font-weight: 700;
}

.withdraw-amount-input input {
    flex: 1;
    min-width: 0;
    height: 84rpx;
    margin-left: 18rpx;
    color: #111827;
    font-size: 58rpx;
    font-weight: 700;
}

.withdraw-all {
    flex: none;
    padding: 12rpx 22rpx;
    color: #a0610d;
    font-size: 26rpx;
    line-height: 36rpx;
    background: #fff1dc;
    border-radius: 999rpx;
}

.withdraw-balance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 34rpx;
}

.withdraw-field {
    display: flex;
    align-items: center;
    min-height: 92rpx;
    border-bottom: 1rpx solid #edf0f5;
}

.withdraw-field__label {
    flex: none;
    width: 170rpx;
    color: #344054;
    font-size: 27rpx;
    line-height: 38rpx;
}

.withdraw-field__input {
    flex: 1;
    min-width: 0;
    height: 92rpx;
    color: #111827;
    font-size: 27rpx;
    text-align: right;
}

.withdraw-placeholder {
    color: #b4bbc8;
}

.withdraw-upload {
    margin-top: 24rpx;
}

.withdraw-upload__title {
    color: #344054;
    font-size: 27rpx;
    line-height: 38rpx;
}

.withdraw-upload__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 176rpx;
    height: 176rpx;
    margin-top: 18rpx;
    overflow: hidden;
    background: #fff8ed;
    border: 2rpx dashed #ead5b8;
    border-radius: 20rpx;
}

.withdraw-upload__image {
    width: 100%;
    height: 100%;
}

.withdraw-upload__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #98a2b3;
    font-size: 22rpx;
    line-height: 32rpx;
}

.withdraw-upload__empty image {
    width: 54rpx;
    height: 44rpx;
    margin-bottom: 12rpx;
}

.withdraw-tips {
    margin: 22rpx 6rpx 0;
    color: #8a94a6;
    font-size: 24rpx;
    line-height: 40rpx;
}

.withdraw-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    padding: 18rpx 32rpx calc(22rpx + env(safe-area-inset-bottom));
    background: rgba(255, 249, 240, 0.96);
    box-shadow: 0 -12rpx 30rpx rgba(31, 55, 88, 0.06);
}

.withdraw-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 700;
    background: linear-gradient(135deg, #a0610d 0%, #d79a43 100%);
    border-radius: 44rpx;
    box-shadow: 0 14rpx 30rpx rgba(160, 97, 13, 0.2);
}

.withdraw-submit--disabled {
    opacity: 0.56;
}

.withdraw-record {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 16rpx;
    color: #667085;
    font-size: 26rpx;
    line-height: 36rpx;
}
</style>
