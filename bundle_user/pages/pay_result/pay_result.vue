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

<template>
	<view class="pay-result column-center">
		<view class="contain bg-white">
			<view class="header  column-center">
				<view>
					<image class="tips-icon" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_paySuccess.png"></image>
				</view>
				<view class="xl mt20">订单支付成功</view>
			</view>
			<view style="height:181rpx"></view>
			<view class="info">
				<view class="order-num row-between mt20">
					<view class="ml20">订单编号</view>
					<view class="mr20">
						{{payInfo.order_sn}}
					</view>
				</view>
				<view v-if="payInfo.pay_time" class="order-time row-between mt20">
					<view class="ml20">付款时间</view>
					<view class="mr20">{{payInfo.pay_time}}</view>
				</view>
				<view class="order-pay-type row-between mt20">
					<view class="ml20">支付方式</view>
					<view class="mr20">{{payInfo.pay_way_text || '待确认'}}</view>
				</view>
				<view class="order-pay-money row-between mt20">
					<view class="ml20">支付金额</view>
					<view class="mr20">
						<price-format v-if="hasPayAmount" :price="displayPayAmount"></price-format>
						<text v-else>金额待确认</text>
					</view>
				</view>
			</view>
			<view class="line ml20"></view>
			<view class="opt-btn-contain row-center wrap">
				<navigator open-type="redirect" hover-class="none" class="check-order-btn row-center bg-primary br60 mt20" url="/bundle_order/pages/user_order/user_order">
					<view class="white bg-primary lg">查看订单</view>
				</navigator>
				<navigator hover-class="none" class="go-back-btn row-center br60 mt20" open-type="switchTab" url="/pages/index/index">
					<view class="primary br60 lg">返回首页</view>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script>
import PriceFormat from '@/bundle_user/components/price-format/price-format.vue'

	import {
getOrderDetail
	} from '@/api/order';
	export default {
		data() {
			return {
				payInfo: {}
			};
		},

		components: {
			PriceFormat,

		},
		props: {},
		onLoad: function(options) {
			this.id = options.id;
			this.getOrderResultFun();
		},


		methods: {
			getOrderResultFun() {
				getOrderDetail(this.id).then(res => {
					if (res.code == 1) {
						this.payInfo = res.data || {}
						return
					}
					this.payInfo = {
						order_sn: this.id
					}
				}).catch(() => {
					this.payInfo = {
						order_sn: this.id
					}
				});
			},

		},
		computed: {
			displayPayAmount() {
				return this.payInfo.order_amount ?? this.payInfo.orderAmount ?? this.payInfo.pay_amount ?? this.payInfo.payAmount
			},
			hasPayAmount() {
				const value = this.displayPayAmount
				return value !== undefined && value !== null && value !== ''
			}
		}
	};
</script>
<style lang="scss">
	.pay-result {
		min-height: 100vh;
		padding: 1rpx 0 40rpx;
		box-sizing: border-box;

		.contain {
			width: calc(100% - 40rpx);
			max-width: 682rpx;
			margin-left: auto;
			margin-right: auto;
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
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				top: -50rpx;
			}

			.order-num {
				align-items: flex-start;
			}

			.info {
				margin-bottom: 40rpx;
			}

			.opt-btn-contain {
				margin-top: 40rpx;

				.check-order-btn {
					width: 100%;
					height: 84rpx;
				}

				.go-back-btn {
					width: 100%;
					height: 84rpx;
					border:1px solid  $color-primary;
					box-sizing: border-box;
				}
			}

			.line {
				width: 100%;
				border-top: 1px solid rgba(229, 229, 229, 1);
			}
		}
	}
</style>
