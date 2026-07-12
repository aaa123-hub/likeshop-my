<template>
	<view class="pay-result">
		<view class="contain bg-white">
			<view style="border-top: 1rpx solid transparent;">
				<view class="header  column-center">
					<view>
						<image class="tips-icon" :src="getStatusImg"></image>
					</view>
					<view class="withdraw-status-title xl mt20">{{ displayText(widthdrawInfo.statusDesc, '提现状态待确认') }}</view>
				</view>
				<view class="column-center mt10">
					<price-format v-if="hasKnownValue(widthdrawInfo.money)" :price="widthdrawInfo.money" color="#a0610d" showSubscript subscriptSize="30"
						firstSize="46" secondSize="46" weight="500" />
					<view v-else class="withdraw-money-empty">金额待确认</view>
				</view>
				<view class="info">
					<view class="order-num row-between mt20">
						<view class="ml20">流水号</view>
						<view class="mr20 info-value">
							{{ displayText(widthdrawInfo.sn, '流水号待确认') }}
						</view>
					</view>
					<view class="order-time row-between mt20">
						<view class="ml20">提交时间</view>
						<view class="mr20 info-value">{{ displayText(widthdrawInfo.create_time, '时间待确认') }}</view>
					</view>
					<view class="order-pay-type row-between mt20">
						<view class="ml20">提现至</view>
						<view class="mr20 info-value">{{ displayText(widthdrawInfo.typeDesc, '提现方式待确认') }}</view>
					</view>
					<view class="order-pay-money row-between mt20">
						<view class="ml20">服务费</view>
						<view class="mr20 info-value">
							<price-format v-if="hasKnownValue(widthdrawInfo.poundage)" :price="widthdrawInfo.poundage" />
							<text v-else>金额待确认</text>
						</view>
					</view>
					<view class="order-pay-money row-between mt20">
						<view class="ml20">实际到账</view>
						<view class="mr20 info-value">
							<price-format v-if="hasKnownValue(widthdrawInfo.left_money)" :price="widthdrawInfo.left_money" />
							<text v-else>金额待确认</text>
						</view>
					</view>
				</view>
				<view class="line ml20" v-if="!type"></view>
				<view class="opt-btn-contain row-center wrap" v-if="!type">
					<navigator hover-class="none" class="check-order-btn row-center bg-primary br60 mt20"
						url="/bundle_finance/pages/user_withdraw_code/user_withdraw_code">
						<view class="white bg-primary lg">查看历史提现记录</view>
					</navigator>
					<navigator hover-class="none" class="go-back-btn row-center br60 mt20" open-type="switchTab"
						url="/pages/index/index">
						<view class="primary br60 lg">返回首页</view>
					</navigator>
				</view>
			</view>
		</view>
		<view class="muted mt20 row-center xs">* 审核通过后约72小时内到账，请留意账户明细</view>
	</view>
</template>

<script>
import PriceFormat from '@/bundle_finance/components/price-format/price-format.vue'

	// +----------------------------------------------------------------------
	// | LikeShop100%开源免费商用电商系统
	// +----------------------------------------------------------------------
	// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
	// | 开源版本可自由商用，保留版权即可
	// | 商业版本务必购买商业授权，以免引起法律纠纷
	// | 禁止对系统程序代码以任何目的，任何形式的再发布
	// | Gitee下载：https://gitee.com/likeshop_gitee/likeshop
	// | 访问官网：https://www.likemarket.net
	// | 访问社区：https://home.likemarket.net
	// | 访问手册：http://doc.likemarket.net
	// | 微信公众号：好象科技
	// | 好象科技开发团队 版权所有 拥有最终解释权
	// +----------------------------------------------------------------------
	// | Author: LikeShopTeam
	// +----------------------------------------------------------------------
	import {
getWithdrawDetail
	} from '@/api/user';

	export default {
		data() {
			return {
				widthdrawInfo: {},
				type: ""
			};
		},

		components: {
			PriceFormat,},
		props: {},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.id = options.id;
			this.type = options.type
			this.getWithdrawDetailFun();
		},


		methods: {
			hasKnownValue(value) {
				return value !== undefined && value !== null && value !== ''
			},

			displayText(value, fallback) {
				return this.hasKnownValue(value) ? value : fallback
			},

			getWithdrawDetailFun() {
				if (!this.id) {
					this.widthdrawInfo = {}
					return
				}
				getWithdrawDetail({
					id: this.id
				}).then(res => {
					if (res.code == 1) {
						this.widthdrawInfo = res.data || {}
					}
				});
			}

		},
		computed: {
			getStatusImg() {
				switch (this.widthdrawInfo.status) {
					case 1:
						"";
					case 2:
						return 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_cashOut_wait.png';
					case 3:
						return 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_paySuccess.png';
					case 4:
						return 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_payFail.png';
				}
				return 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_cashOut_wait.png';
			}
		}
	};
</script>
<style lang="scss">
	.pay-result {
		overflow: hidden;

		.contain {
			/* height: 732rpx; */
			margin-left: 20rpx;
			margin-right: 20rpx;
			border-radius: 10rpx;
			margin-top: 78rpx;
			padding-left: 20rpx;
			padding-right: 20rpx;
			padding-bottom: 40rpx;
			position: relative;
			box-sizing: border-box;

			.tips-icon {
				width: 112rpx;
				height: 112rpx;
			}

			.header {
				margin-top: -56rpx;
			}

			.info {
				margin-bottom: 40rpx;

				.order-num {
					align-items: flex-start;
				}

				.row-between {
					gap: 20rpx;
				}

				.info-value {
					min-width: 0;
					flex: 1;
					text-align: right;
					word-break: break-all;
					line-height: 1.5;
				}
			}

			.opt-btn-contain {
				margin-top: 40rpx;

				.check-order-btn {
					width: 100%;
					max-width: 650rpx;
					height: 84rpx;
				}

				.go-back-btn {
					width: 100%;
					max-width: 650rpx;
					height: 84rpx;
					border: solid 1rpx $color-primary;
					box-sizing: border-box;
				}
			}
		}
	}

	.line {
		width: calc(100% - 40rpx);
		max-width: 650rpx;
		border-top: 1px solid rgba(229, 229, 229, 1);
	}

	.withdraw-status-title {
		max-width: 100%;
		text-align: center;
		word-break: break-all;
		line-height: 1.4;
	}

	.withdraw-money-empty {
		color: #a0610d;
		font-size: 32rpx;
		font-weight: 500;
	}
</style>
