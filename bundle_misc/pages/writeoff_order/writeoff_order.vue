<template>
	<view class="writeoff-order">
		<u-tabs :list="order" :active-color="primaryColor" inactive-color="#333" :is-scroll="false" :current="current"
			@change="changeCurrent"></u-tabs>
		<view class="list">
			<view class="item bg-white" v-for="(item, index) in orderList" :key="index">
				<view class="row-between title">
					<view>联系人：{{ displayText(item.consignee, '联系人待确认') }}</view>
					<view :class="[item.verification_status == 0 ? 'primary' : 'muted']">{{ displayText(item.verification_status_desc, '状态待确认') }}</view>
				</view>
				<order-goods :list="orderGoodsList(item)"></order-goods>
			</view>
		</view>
		<loading-footer :status="status" :slot-empty="true" @refresh="reflesh">
			<view slot="empty" class="column-center" style="padding-top: 200rpx">
				<text class="lighter">暂无订单</text>
			</view>
		</loading-footer>
		<view class="btns row-between">
			<button class="bg-primary br60 white btn" size="lg" @tap="onScanCode">扫码核销</button>
			<button class="bg-primary br60 white btn ml20" size="lg" @tap="showModal=true">手动核销</button>
		</view>
		<u-modal ref="uModalInput" v-model="showModal" show-cancel-button :confirm-color="primaryColor"
			confirm-text="确定" @confirm="onConfirm" title="手动核销">
			<view class="slot-content row-center" style="padding: 40rpx;">
				<input type="number" v-model="code" :border="true" placeholder="请输入核销码" style="width: 100%" />
			</view>
		</u-modal>
	</view>
</template>

<script>
import UModal from '@/bundle_misc/components/uview-ui/components/u-modal/u-modal.vue'
import UTabs from '@/bundle_misc/components/uview-ui/components/u-tabs/u-tabs.vue'
	import {
		getVerifyLists
	} from '@/api/order'
	import {
		loadingType
	} from '@/utils/type';
	import {
		loadingFun,
		isWeixinClient
	} from '@/utils/tools';
	import wechath5 from '@/utils/wechath5'
	export default {
	components: {
			UModal,
			UTabs
		},
		data() {
			return {
				page: 1,
				orderList: [],
				status: loadingType.LOADING,
				current: 0,
				showModal: false,
				code: '',
				order: [{
					name: '待核销',
					type: 0
				}, {
					name: '已核销',
					type: 1
				}]
			}
		},
		methods: {
			reflesh() {
				this.page = 1
				this.orderList = []
				this.status = loadingType.LOADING
				this.getVerifyListsFun();
			},
			changeCurrent(current) {
				this.current = current
				this.reflesh()
			},
			onScanCode() {
				// #ifdef H5
					if(!isWeixinClient()) return this.$toast({title: 'h5暂不支持扫码'})
					wechath5.scanQRCode().then(res => {
						this.toDetail(res)
					})
				// #endif
				// #ifndef H5
				uni.scanCode({
					scanType: ['qrCode'],
					success: (res) => {
						this.toDetail(res.result)
					},
					fail: () => this.$toast({ title: '扫码未完成' })
				});
				// #endif

			},
			async getVerifyListsFun() {
				let {
					page,
					orderList,
					status,
					current,
					order
				} = this;
				const currentOrder = order[current] || order[0] || {}
				const type = currentOrder.type
				const data = await loadingFun(getVerifyLists, page, orderList, status, {
					type
				})
				if (!data) return
				this.page = data.page
				this.orderList = data.dataList
				this.status = data.status
			},
			onConfirm() {
				const code = String(this.code || '').trim()
				if(!code) return this.$toast({title: '请输入核销码'})
				this.toDetail(code)
			},
			toDetail(code) {
				const verifyCode = String(code || '').trim()
				if (!verifyCode) return this.$toast({ title: '核销码待确认' })
				this.code = ''
				uni.navigateTo({
					url: `/bundle_misc/pages/writeoff_detail/writeoff_detail?code=${encodeURIComponent(verifyCode)}`,
				})
			},
			hasKnownValue(value) {
				return value !== undefined && value !== null && value !== ''
			},
			displayText(value, fallback) {
				return this.hasKnownValue(value) ? value : fallback
			},
			orderGoodsList(item = {}) {
				return Array.isArray(item.order_goods) ? item.order_goods : []
			}
		},
		async onLoad() {
			uni.$on("refreshverify", () => {
				this.reflesh()
			})
			this.getVerifyListsFun()
		},
		onUnload() {
			uni.$off('refreshverify')
		},
		onPullDownRefresh: function() {
			this.reflesh()
		},

		onReachBottom: function() {
			this.getVerifyListsFun()
		},
	}
</script>

<style lang="scss">
	.writeoff-order {
		padding-bottom: 120rpx;
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
			position: fixed;
			bottom: env(safe-area-inset-bottom);
			width: 100%;
			padding: 20rpx 25rpx;

			.btn {
				flex: 1;
			}
		}
	}
</style>
