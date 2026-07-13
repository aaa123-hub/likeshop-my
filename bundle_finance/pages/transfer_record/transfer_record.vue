<template>
	<!--pages/user_bill/user_bill.wxml-->
	<view class="transfer-record">
		<tabs :active="active" line-width="40" @change="onChange">
			<tab title="全部">
				<view class="list mt20">
					<view v-for="(item, index) in lists" :key="index" class="item bg-white row">
						<view class="flexnone mr20">
							<image class="avatar" :src="displayAvatar(item.avatar)"></image>
						</view>
						<view class="transfer-record__info flex1 mr20">
							<view class="transfer-record__name black mb10">{{ displayText(item.nickname, '收款人待确认') }}</view>
							<view class="transfer-record__meta xs muted">会员ID:{{ displayText(item.sn, '待确认') }}</view>
							<view class="transfer-record__meta xs muted">{{ displayText(item.create_time, '时间待确认') }}</view>
						</view>
						<view :class="'transfer-record__amount lg flexnone ' + (isIncome(item) ? 'primary' : '')">
							{{ transferAmountText(item) }}
						</view>
					</view>
				</view>
				<loading-footer :status="loadingStatus" slotEmpty>
					<view class="data-null column-center" slot="empty">
						<text class="nr muted">暂无记录～</text>
					</view>
				</loading-footer>
			</tab>
			<tab title="转出">
				<view class="list mt20">
					<view v-for="(item, index) in lists" :key="index" class="item bg-white row">
						<view class="flexnone mr20">
							<image class="avatar" :src="displayAvatar(item.avatar)"></image>
						</view>
						<view class="transfer-record__info flex1 mr20">
							<view class="transfer-record__name black mb10">{{ displayText(item.nickname, '收款人待确认') }}</view>
							<view class="transfer-record__meta xs muted">会员ID:{{ displayText(item.sn, '待确认') }}</view>
							<view class="transfer-record__meta xs muted">{{ displayText(item.create_time, '时间待确认') }}</view>
						</view>
						<view :class="'transfer-record__amount lg flexnone ' + (isIncome(item) ? 'primary' : '')">
							{{ transferAmountText(item) }}
						</view>
					</view>
				</view>
				<loading-footer :status="loadingStatus" slotEmpty>
					<view class="data-null column-center" slot="empty">
						<text class="nr muted">暂无转出记录～</text>
					</view>
				</loading-footer>
			</tab>
			<tab title="转入">
				<view class="list mt20">
					<view v-for="(item, index) in lists" :key="index" class="item bg-white row">
						<view class="flexnone mr20">
							<image class="avatar" :src="displayAvatar(item.avatar)"></image>
						</view>
						<view class="transfer-record__info flex1 mr20">
							<view class="transfer-record__name black mb10">{{ displayText(item.nickname, '收款人待确认') }}</view>
							<view class="transfer-record__meta xs muted">会员ID:{{ displayText(item.sn, '待确认') }}</view>
							<view class="transfer-record__meta xs muted">{{ displayText(item.create_time, '时间待确认') }}</view>
						</view>
						<view :class="'transfer-record__amount lg flexnone ' + (isIncome(item) ? 'primary' : '')">
							{{ transferAmountText(item) }}
						</view>
					</view>
				</view>
				<loading-footer :status="loadingStatus" slotEmpty>
					<view class="data-null column-center" slot="empty">
						<text class="nr muted">暂无转入记录～</text>
					</view>
				</loading-footer>
			</tab>
		</tabs>
	</view>
</template>

<script>
	import {
		transferRecord
	} from "@/api/user";
	import {
		loadingType
	} from "@/utils/type";
	import {
		loadingFun
	} from "@/utils/tools"
	import { resolveImage } from "@/utils/image-placeholder"

	export default {
		data() {
			return {
				active: 0,
				lists: [],
				page: 1,
				loadingStatus: loadingType.LOADING
			};
		},

		components: {},
		props: {},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.active = parseInt(options.type || 0);
			this.transferRecordFun(this.active);
		},


		onReachBottom: function() {
			this.transferRecordFun(this.active);
		},

		methods: {
			onChange(e) {
				this.active = e;
				this.cleanStatus();
				this.transferRecordFun(e);
			},

			cleanStatus() {
				// 清理状态
				this.page = 1;
				this.lists = [];
				this.loadingStatus = loadingType.LOADING
			},

			transferRecordFun(type) {
				let changeType = 'all';
				type == 0 ? changeType = 'all' : type == 1 ? changeType = 'out' : changeType = 'in';
				let {
					lists,
					loadingStatus,
					page
				} = this;
				loadingFun(transferRecord, page, lists, loadingStatus, {
					type: changeType
				}).then(res => {
					if (res) {
						this.page = res.page;
						this.lists = res.dataList
						this.loadingStatus = res.status
					}
				})
			},

			hasKnownValue(value) {
				return value !== undefined && value !== null && value !== ''
			},

			displayText(value, fallback) {
				return this.hasKnownValue(value) ? value : fallback
			},

			displayAvatar(value) {
				return resolveImage(value, 'avatar')
			},

			transferAmountText(item = {}) {
				const amount = item.money ?? item.change_amount ?? item.amount
				if (!this.hasKnownValue(amount)) return '金额待确认'
				const amountText = String(amount)
				const normalizedAmount = amountText.replace(/^[+-]/, '')
				return `${this.isIncome(item) ? '+' : '-'}${normalizedAmount}`
			},

			isIncome(item = {}) {
				const value = item.direction ?? item.transferDirection ?? item.transfer_direction ?? item.change_type ?? item.changeType ?? item.type
				const text = String(value).toLowerCase()
				return value == 1 || text === 'in' || text === 'income'
			}

		}
	};
</script>
<style lang="scss">
	.transfer-record {
		.list {
			.item {
				padding: 20rpx 30rpx;
				border-bottom: $solid-border;
				align-items: flex-start;
				max-width: 100%;
				box-sizing: border-box;
				.avatar {
					width: 68rpx;
					height: 68rpx;
					border-radius: 50%;

				}
			}
		}

		&__info {
			min-width: 0;
		}

		&__name,
		&__meta {
			max-width: 100%;
			word-break: break-all;
			line-height: 1.4;
		}

		&__amount {
			max-width: 220rpx;
			text-align: right;
			word-break: break-all;
			line-height: 1.4;
		}
	}

	.data-null {
		padding-top: 150rpx;
	}
</style>
