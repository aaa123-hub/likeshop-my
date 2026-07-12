<template>
	<view class="writeoff-order">

		<template v-if="detail.id">
			<view class="list">
				<view class="item bg-white">
					<view class="row-between title">
						<view>联系人：{{ displayText(detail.consignee, '联系人待确认') }}</view>
						<view :class="[detail.verification_status == 0 ? 'primary' : 'muted']">{{ displayText(detail.verification_status_desc, '状态待确认') }}</view>
					</view>
					<order-goods :list="orderGoodsList(detail)"></order-goods>
				</view>
			</view>
			<view class="btns">
				<button class="bg-primary br60 white btn" size="lg" @tap="showModal=true">已提货</button>
				<navigator class="mt20" open-type="navigateBack" :delta="1" hover-class="none">
					<button class="bg-white br60 btn" size="lg">返回核销列表</button>
				</navigator>
			</view>
		</template>
		<template v-else>
			<view  class="column-center" style="padding-top: 200rpx">
				<text class="lighter">{{ emptyText }}</text>
				<view class="btns" style="margin-top: 100rpx;">
					<navigator style="width: 100%;" open-type="navigateBack" :delta="1" hover-class="none">
						<button class="bg-primary br60 white" size="lg">返回核销列表</button>
					</navigator>
				</view>
			</view>
		</template>
		<u-modal ref="uModalInput" v-model="showModal" show-cancel-button :confirm-color="primaryColor"
			confirm-text="确定" @confirm="handleVerificationConfirm" title="确认核销" content="是否确认核销？">
		</u-modal>

		<loading-view v-if="isFirstLoading"></loading-view>
	</view>
</template>

<script>
import UModal from '@/bundle_misc/components/uview-ui/components/u-modal/u-modal.vue'
	import {
		verificationConfirm,
		verification
	} from '@/api/order'
	export default {
	components: {
			UModal
		},
		data() {
			return {
				detail: {},
				showModal: false,
				isFirstLoading: true,
				code: '',
				emptyText: '核销订单信息待确认'
			}
		},
		methods: {
			verificationFun() {
				if (!this.code) {
					this.isFirstLoading = false
					this.emptyText = '核销码待确认'
					return
				}
				verification({
					pickup_code: this.code
				}).then(res => {
					this.isFirstLoading = false
					if(res.code == 1) {
						this.detail = res.data || {}
					} else {
						this.emptyText = res.msg || res.message || '核销订单信息待确认'
					}
				}).catch(() => {
					this.isFirstLoading = false
					this.emptyText = '核销订单信息待确认'
				})
			},
			handleVerificationConfirm() {
				if (!this.detail.id) return this.$toast({ title: '核销订单待确认' })
				verificationConfirm({
					id: this.detail.id
				}).then(res => {
					if(res.code == 1) {
						uni.$emit('refreshverify')
						this.$toast({
							title: res.msg
						}, {
							tab: 3,
							url: 1
						})
					}
				})
			},
			hasKnownValue(value) {
				return value !== undefined && value !== null && value !== ''
			},
			displayText(value, fallback) {
				return this.hasKnownValue(value) ? value : fallback
			},
			orderGoodsList(detail = {}) {
				return Array.isArray(detail.order_goods) ? detail.order_goods : []
			}
		},
		async onLoad(options) {
			const code = String((options && options.code) || '').trim()
			try {
				this.code = decodeURIComponent(code)
			} catch (error) {
				this.code = code
			}
			this.verificationFun()
		},
	}
</script>

<style lang="scss">
	.writeoff-order {
		.list {
			padding: 20rpx;
			.item {
				border-radius: 10rpx;
				&:not(:last-of-type) {
					margin-bottom: 20rpx;
				}
				.title {
					padding: 20rpx;
				}
			}
		}
		.btns {
			width: 100%;
			padding: 0 40rpx 50rpx;
		}
	}
</style>
