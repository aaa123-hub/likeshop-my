<template>
	<view class="payment-pages">
		<navbar :title="isFacePay ? '面对面付款' : '支付订单'"></navbar>
		<view class="payment u-skeleton">
			<template v-if="isFacePay">
				<view class="payment-tips">
					<u-icon name="bell-fill" color="#ffb221" size="52"></u-icon>
					<text>温馨提示：文案填充文案填充文案填充文案填充文案填充文案填充</text>
				</view>
				<view class="face-pay-card">
					<view class="face-pay-card__field">
						<text class="face-pay-card__label">付款单号</text>
						<input class="face-pay-card__input" placeholder="请输入付款单号" />
					</view>
					<view class="face-pay-card__scan">
						<u-icon name="scan" color="#222222" size="52"></u-icon>
						<text>扫一扫</text>
					</view>
				</view>
			</template>
			<view v-if="!isFacePay" class="payment-header">
				<view class="payment-header__label">订单支付金额</view>
				<price-format class="u-skeleton-fillet" :subscript-size="40" :first-size="64" :second-size="40"
					:price="amount" :weight="600" />
				<view class="payment-count-down" v-if="timeout > 0">
					<text>剩余支付时间</text>
					<text class="payment-count-down__time">{{ formattedTimeout }}</text>
				</view>
				<view class="payment-count-down payment-count-down--expired" v-else>
					<text>订单支付时间已结束</text>
				</view>
			</view>

			<view class="payment-main">
				<view class="payway-container u-skeleton-fillet">
					<view class="payway-title">选择支付方式</view>
					<view class="payway">
						<view
							v-for="item in normalizedPaywayList"
							:key="item.key"
							:class="['payway-item', payway === item.value ? 'payway-item--active' : '']"
							@tap="changePayway(item.value)"
						>
							<image v-if="item.icon" class="payway-item-icon" :src="item.icon" mode="aspectFit" />
							<view v-else class="payway-item-icon payway-item-icon--empty">{{ getPaywayInitial(item.name) }}</view>
							<view class="payway-item-content">
								<text class="payway-item-content-name">{{ item.name }}</text>
								<text v-if="item.extra" class="payway-item-content-tips">{{ item.extra }}</text>
							</view>
							<view :class="['payway-radio', payway === item.value ? 'payway-radio--active' : '']"></view>
						</view>
					</view>
					<template v-if="!paywayList.length">
						<view class="payway-empty">暂无支付方式</view>
					</template>
				</view>
			</view>

			<view class="payment-footer u-skeleton-fillet">
				<view :class="['payment-submit', {'payment-submit--disabled': submitDisabled}]" @tap="handlePrepay">
					<u-loading mode="circle" :show="loadingPay" />
					<text v-show="!loadingPay">{{ submitText }}</text>
				</view>
			</view>

		</view>

		<u-skeleton :loading="loadingSkeleton" :animation="true" bgColor="#FFF" />
	</view>

</template>


<script>
import PriceFormat from '@/bundle/components/price-format/price-format.vue'
import Navbar from '@/components/navbar/navbar.vue'
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
import UCountDown from '@/bundle/components/uview-ui/components/u-count-down/u-count-down.vue'
import ULoading from '@/bundle/components/uview-ui/components/u-loading/u-loading.vue'
import USkeleton from '@/bundle/components/uview-ui/components/u-skeleton/u-skeleton.vue'
	/**
	 * @description 支付页面
	 * @query {String} from 订单来源: order-商品订单; recharge-充值订单;
	 * @query {Number} order_id	订单ID
	 */
	import {
		prepay,
		getPayway,
		queryPayment
	} from '@/api/app'
	import {
		wxpay
	} from '@/utils/pay'

	export default {
	components: {
			PriceFormat,
			Navbar,
			UIcon,
			UCountDown,
			ULoading,
			USkeleton
		},
		name: 'Payment',

		data() {
			return {
				from: '', // 订单来源
				order_id: '', // 订单ID
				amount: 0, // 支付金额
				timeout: 0, // 倒计时间戳
				payway: '', // 支付方式
				paywayList: [], // 支付方式列表
				desiredPayway: '',
				pageMode: '',

				loadingSkeleton: true, // 骨架屏Loading
				loadingPay: false, // 支付处理中Loading
				hasPayResult: false,
				payOrderNo: '',
				isExpired: false,
				countdownTimer: null,
			}
		},

		methods: {
			startCountdown(seconds) {
				this.stopCountdown()
				this.timeout = Math.max(Math.floor(Number(seconds) || 0), 0)
				this.isExpired = !this.isFacePay && this.timeout <= 0
				if (this.isExpired) return
				this.countdownTimer = setInterval(() => {
					if (this.timeout <= 1) {
						this.handleTimeout()
						return
					}
					this.timeout -= 1
				}, 1000)
			},
			stopCountdown() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer)
					this.countdownTimer = null
				}
			},
			// 更改支付方式
			changePayway(value) {
				if (this.isExpired || this.loadingPay || !value) return
				this.payway = 'WECHAT_JSAPI'
			},
			getPaywayValue(item) {
				return item && (item.pay_way || item.payMethod || item.payWay) ? (item.pay_way || item.payMethod || item.payWay) : item
			},
			normalizePaywayValue(value) {
				const text = String(value || '').toUpperCase()
				if (['WECHAT', 'WECHAT_PAY', 'WX', 'WX_PAY', 'WEIXIN', 'WECHAT_JSAPI', 'JSAPI'].includes(text)) return 'WECHAT_JSAPI'
				return ''
			},
			normalizePaywayItem(item = {}, index = 0) {
				const value = this.normalizePaywayValue(this.getPaywayValue(item))
				return {
					key: item.id || value || index,
					value,
					name: item.name || item.payName || item.pay_name || value || '支付方式',
					extra: item.extra || item.description || item.desc || '',
					icon: item.icon || item.iconUrl || item.logo || ''
				}
			},
			getPaywayInitial(name) {
				return String(name || '付').slice(0, 1)
			},
			getPayErrorText(code, message) {
				if (code === 'A0101' || String(message || '').includes('CreatePayOrderCommand.openId')) return '缺少微信支付授权信息，请重新登录后再使用微信支付'
				return message || '支付失败，请稍后重试'
			},

			// 初始化页面数据
			initPageData() {
				// 获取支付方式
				getPayway({
					from: this.from,
					order_id: this.order_id,
				}).then(res => {
					if (res.code != 1) throw new Error(res.msg)
					return res.data
				}).then(data => {
					this.loadingSkeleton = false
					data = data || {}
					this.amount = this.amount || data.order_amount || data.payAmount || 0
					const wechatPayway = (data.pay || []).map((item, index) => this.normalizePaywayItem(item, index)).find(item => item.value === 'WECHAT_JSAPI')
					this.paywayList = [wechatPayway || this.normalizePaywayItem({ id: 'WECHAT_JSAPI', name: '微信支付', pay_way: 'WECHAT_JSAPI', extra: '使用微信支付' })]
					this.payway = 'WECHAT_JSAPI'
					// 倒计时
					const startTimestamp = new Date().getTime() / 1000
					const rawEndTimestamp = data.cancel_time || data.cancelTime || data.expireTime || data.expire_time
					const parsedEndTimestamp = typeof rawEndTimestamp === 'string' && rawEndTimestamp.includes('-') ? new Date(rawEndTimestamp).getTime() / 1000 : Number(rawEndTimestamp)
					const endTimestamp = Number.isNaN(parsedEndTimestamp) || !parsedEndTimestamp ? startTimestamp + 30 * 60 : parsedEndTimestamp
					this.startCountdown(Math.max(endTimestamp ? endTimestamp - startTimestamp : 0, 0))
				}).catch(err => {
					this.loadingSkeleton = false
					this.$toast({ title: err.message || '支付信息加载失败' })
				})
			},

			// 预支付处理
			handlePrepay() {
				if (this.submitDisabled) return
				if (this.isExpired) {
					this.$toast({ title: '订单已超时，请重新下单' })
					return
				}
				if (!this.payway) {
					this.$toast({ title: '暂无可用支付方式' })
					return
				}
				this.loadingPay = true
				prepay({
					from: this.from,
					order_id: this.order_id,
					pay_way: 'WECHAT_JSAPI',
					payMethod: 'WECHAT_JSAPI',
					bizOrderNo: this.order_id,
					bizType: this.from === 'recharge' ? 'RECHARGE' : 'ORDER',
					amount: this.amount
				}).then((res) => {
					const { code, data, rawCode, msg, message } = res || {}
					if (code != 1 && code != 10001 && code != 20001) {
						this.$toast({ title: this.getPayErrorText(rawCode || code, msg || message) })
						return
					}
					this.payOrderNo = data?.payOrderNo || data?.pay_order_no || this.payOrderNo
					switch (code) {
						case 1:
							this.handleWechatPay(data);
							break;
						default:
							this.$toast({ title: '支付处理中，请稍后查看订单' })
							break;
					}
				}).catch(err => {
					this.$toast({ title: err && err.message ? err.message : '支付失败，请稍后重试' })
				}).finally(() => {
					setTimeout(() => {
						this.loadingPay = false
					}, 500)
				})
			},

			// 微信支付
			handleWechatPay(data) {
				if (!data || !data.timeStamp || !data.nonceStr || !data.package || !data.paySign) {
					this.$toast({ title: '微信支付参数不完整，请重新选择支付方式' })
					return
				}
				wxpay(data).then(res => {
					this.handPayResult(res)
				})
			},

			// 支付后处理
			async handPayResult(result) {
				this.hasPayResult = true
				if (result === 'success' && this.payOrderNo) {
					const confirmed = await this.confirmPaymentResult()
					if (!confirmed) return
				}
				switch (result) {
					case 'success':
						uni.$emit('payment', {
							result: true,
							order_id: this.order_id
						});
						break;
					case 'fail':
					default:
						uni.$emit('payment', {
							result: false,
							order_id: this.order_id
						})
				}
				this.goPayResult(result === 'success')
			},
			goPayResult(success) {
				if (success && this.from === 'order' && this.order_id) {
					uni.redirectTo({
						url: `/bundle_user/pages/pay_result/pay_result?id=${this.order_id}`
					})
					return
				}
				uni.navigateBack()
			},
			handleTimeout() {
				this.stopCountdown()
				this.timeout = 0
				this.isExpired = true
			},
			async confirmPaymentResult() {
				try {
					const res = await queryPayment({ payOrderNo: this.payOrderNo })
					const status = String(res.data?.payStatus || res.data?.pay_status || '').toUpperCase()
					if (res.code == 20001 || status === 'PAID' || status === 'SUCCESS') return true
					this.$toast({ title: res.msg || '支付状态确认中，请稍后查看订单' })
					uni.$emit('payment', { result: false, order_id: this.order_id })
					return false
				} catch (error) {
					this.$toast({ title: '支付状态确认失败，请稍后查看订单' })
					uni.$emit('payment', { result: false, order_id: this.order_id })
					return false
				}
			}
		},

		onLoad(options) {
			const from = options.from
			const order_id = options.order_id
			this.pageMode = options.mode || ''
			this.desiredPayway = options.pay_way || options.payWay || options.payMethod || ''

			try {
				if (!from && !order_id) throw new Error('页面参数有误')
				this.from = from
				this.order_id = order_id
				this.amount = Number(options.amount || 0)
				this.initPageData()
			} catch (err) {
				uni.navigateBack()
			}
		},

		onUnload() {
			this.hasPayResult = true
			this.stopCountdown()
		},
		computed: {
			formattedTimeout() {
				const total = Math.max(Math.floor(Number(this.timeout) || 0), 0)
				const hours = Math.floor(total / 3600)
				const minutes = Math.floor((total % 3600) / 60)
				const seconds = total % 60
				const pad = value => String(value).padStart(2, '0')
				return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
			},
			normalizedPaywayList() {
				return this.paywayList
			},
			isFacePay() {
				return this.pageMode === 'facepay' || this.from === 'facepay'
			},
			submitDisabled() {
				return this.loadingPay || this.loadingSkeleton || !this.payway || this.isExpired
			},
			submitText() {
				if (this.isExpired) return '支付已超时'
				if (!this.payway) return '暂无可用支付方式'
				return '立即支付'
			}
		}
	}
</script>


<style lang="scss">
	page {
		height: 100%;
		padding: 0;
		background: #f6f7fb;
	}

	.payment-pages {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		height: 100%;
		background: #f6f7fb;

		.payment {
			display: flex;
			flex-direction: column;
			flex: 1;
			min-height: 0;

			&-tips {
				display: flex;
				align-items: center;
				padding: 18rpx 24rpx;
				font-size: 24rpx;
				line-height: 34rpx;
				color: #f1790e;
				background: #ffebd8;

				text {
					margin-left: 16rpx;
				}
			}

			&-header {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				min-height: 330rpx;
				padding: 34rpx 32rpx 72rpx;
				box-sizing: border-box;
				background: linear-gradient(135deg, #ff6a3c 0%, #ff2c3c 100%);
				color: #FFFFFF;

				&__label {
					margin-bottom: 12rpx;
					font-size: 26rpx;
					opacity: .86;
				}
			}


			&-main {
				flex: 1;
				min-height: 0;
				margin-top: -48rpx;
				padding: 0 24rpx 150rpx;
				overflow-y: auto;
				box-sizing: border-box;
			}


			&-footer {
				position: fixed;
				left: 0;
				right: 0;
				bottom: 0;
				z-index: 20;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 18rpx 32rpx calc(18rpx + constant(safe-area-inset-bottom));
				padding: 18rpx 32rpx calc(18rpx + env(safe-area-inset-bottom));
				box-sizing: border-box;
				background: rgba(255, 255, 255, .96);
				box-shadow: 0 -10rpx 34rpx rgba(23, 29, 42, .08);
			}

			.payway-container {
				padding: 28rpx 24rpx 8rpx;
				border-radius: 24rpx;
				background-color: #FFFFFF;
				box-shadow: 0 12rpx 34rpx rgba(28, 35, 54, .06);

				.payway-title {
					margin-bottom: 8rpx;
					font-size: 30rpx;
					font-weight: 600;
					color: #202124;
				}

				.payway-empty {
					display: flex;
					justify-content: center;
					padding: 70rpx 0 80rpx;
					font-size: 26rpx;
					color: $color-muted;
				}
			}

			.payway {
				display: flex;
				flex-direction: column;
				gap: 18rpx;
				width: 100%;
				padding-top: 18rpx;

				&-item {
					width: 100%;
					display: flex;
					align-items: center;
					min-height: 124rpx;
					padding: 22rpx 20rpx;
					border: 2rpx solid #f0f1f5;
					border-radius: 22rpx;
					box-sizing: border-box;
					background: #ffffff;
					transition: background-color .2s ease, border-color .2s ease;

					&--active {
						border-color: #ff6a3c;
						background: #fff8f6;
					}

					&-icon {
						display: flex;
						align-items: center;
						justify-content: center;
						flex: none;
						width: 58rpx;
						height: 58rpx;
						border-radius: 50%;

						&--empty {
							font-size: 26rpx;
							font-weight: 600;
							color: #ff2c3c;
							background: #ffe8e5;
						}
					}

					&-content {
						flex: 1;
						min-width: 0;
						display: flex;
						flex-direction: column;
						margin: 0 20rpx;

						&-name {
							font-size: 29rpx;
							font-weight: 500;
							color: #202124;
						}

						&-tips {
							margin-top: 8rpx;
							font-size: 22rpx;
							line-height: 30rpx;
							color: $color-muted;
							word-break: break-all;
						}
					}
				}

				.payway-radio {
					position: relative;
					flex: none;
					width: 40rpx;
					height: 40rpx;
					border: 2rpx solid #c9cdd4;
					border-radius: 50%;
					box-sizing: border-box;

					&--active {
						border-color: #ff3f33;
						background: #ff3f33;

						&::after {
							position: absolute;
							left: 10rpx;
							top: 5rpx;
							width: 12rpx;
							height: 20rpx;
							border: solid #ffffff;
							border-width: 0 4rpx 4rpx 0;
							transform: rotate(45deg);
							content: '';
						}
					}
				}
			}

			&-count-down {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 8rpx 24rpx;
				border-radius: 120rpx;
				margin-top: 18rpx;
				font-size: 22rpx;
				background-color: rgba(255, 255, 255, .92);
				color: #4b4f58;

				text {
					margin-right: 10rpx;
				}

				&__time {
					margin-right: 0;
					font-weight: 600;
					color: #ff2c3c;
				}

				&--expired text {
					margin-right: 0;
					color: #ff2c3c;
				}
			}

			&-submit {
				width: 100%;
				max-width: 686rpx;
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 96rpx;
				font-size: 32rpx;
				font-weight: 600;
				letter-spacing: 2rpx;
				border-radius: 999rpx;
				background: linear-gradient(90deg, #ff7a35 0%, #ff2c3c 100%);
				box-shadow: 0 16rpx 34rpx rgba(255, 65, 55, .28);
				color: #FFFFFF;
				overflow: hidden;

				&--disabled {
					background: #c9cdd4;
					box-shadow: none;
				}
			}

		}
	}

	.face-pay-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 26rpx 24rpx 0;
	}

	.face-pay-card__field {
		flex: 1;
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 24rpx;
		margin-right: 22rpx;
		background: #f5f8ff;
		border: 1rpx solid #e7edf9;
		border-radius: 16rpx;
	}

	.face-pay-card__label {
		flex: none;
		font-size: 28rpx;
		font-weight: 600;
		color: #222222;
	}

	.face-pay-card__input {
		flex: 1;
		margin-left: 24rpx;
		font-size: 28rpx;
	}

	.face-pay-card__scan {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 92rpx;
		font-size: 22rpx;
		color: #222222;

		text {
			margin-top: 8rpx;
		}
	}
</style>
