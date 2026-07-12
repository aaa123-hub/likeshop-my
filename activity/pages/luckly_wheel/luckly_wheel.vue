<template>
	<view class="luckly-wheel-container">
		<view class="header">
			<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/choujiang_bg.png"></image>
		</view>
		<view class="main">
			<view class="row-end">
				<navigator class="user-prize row-center" url="/activity/pages/prize_record/prize_record"
					hover-class="none">
					<text class="md" style="color: #7D350C;font-weight: 600;">我的奖品</text>
				</navigator>
			</view>
			<view class="wheel-box">
				<view class="wheel-container">
					<view class="row-center">
						<view class="notice-container row">
							<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_notice.png" class="icon"></image>
							<!-- <view class="xs ml20 marquee-box" style="color: #F9EDDD" wx:if="{{record.length > 0}}">
                <text class="xs marquee_text" style="color: #F9EDDD;" wx:for="{{record}}" wx:key="id">{{item.text}}</text>
            </view> -->
							<view class="marquee-box ml20" v-if="record.length > 0">
								<swiper autoplay vertical style="height: 33rpx">
									<swiper-item v-for="(item, index) in record" :key="index" class="row">
										<text class="xs marquee_text" style="color: #F9EDDD;">{{item.text}}</text>
									</swiper-item>
								</swiper>
							</view>
							<view class="xs ml20" style="color: #F9EDDD" v-else>
								<text class="xs" style="color: #F9EDDD;">暂无通知</text>
							</view>
						</view>
					</view>
					<!-- 抽奖信息 -->
					<view class="message row-between nr">
						<view>我的积分: {{ displayText(user_integral, '待确认') }}</view>
						<template v-if="config.show_win">
							<navigator class="row" url="/activity/pages/win_prize_code/win_prize_code"
								hover-class="none">
								<image class="mr10" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/choujiang_name_list.png"></image>
								中奖名单
							</navigator>
						</template>
					</view>

					<view class="wheel">
						<my-lottery :lotteryData="lists" :status="config.status" :luckyOrder="3" :circleTimes="30"
							@begin="startLottery" @finish="lotteryFinish"></my-lottery>
					</view>
					<!-- 次数提示 -->
					<view class="num-tips nr">
						{{ drawLimitText }}
					</view>
					<view class="rules-box">
						<view class="lg" style="color: #FCD7D2;margin-bottom: 30rpx;">活动规则</view>
						<text class="sm" style="color: #FCD7D2;">{{ displayText(config.rule, '活动规则待确认') }}
						</text>
					</view>
				</view>
			</view>
			<view class="xs row-center" style="color: #FFF2D9;margin-top: 30rpx">本活动的所有奖品，均由商城提供</view>
		</view>
		<u-popup v-model="showResult" mode="center">
			<view class="result-popup column-center">
				<view class="result-container column-between">
					<view class="row-center" style="padding:0 118rpx;margin-top: 90rpx">
						<text style="color: #d79a43;font-size: 62rpx;text-align: center;">{{resultText}}</text>
					</view>
					<view class="mb20">
						<view class="get-btn row-center md br60" @tap="onClose">
							点击收下
						</view>
					</view>
				</view>
				<view style="margin-top: 50rpx" @tap="onClose">
					<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_close.png" style="width: 62rpx;height: 62rpx;"></image>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import UPopup from '@/activity/components/uview-ui/components/u-popup/u-popup.vue'
	import MyLottery from '@/activity/components/my-lottery/my-lottery.vue'
// pages/luckly_wheel/luckly_wheel.js
	import {
		getPrize
	} from "@/api/user";

	export default {
	components: {
			UPopup,
			MyLottery
		},
		data() {
			return {
				user_integral: '',
				// 抽奖配置
				config: {},
				// 抽奖列表
				lists: [],
				// 通知信息
				record: [],
				// 今天剩余抽奖
				surplus: '',
				showResult: false,
				// 抽奖结果
				resultText: ""
			};
		},
		props: {},

		computed: {
			drawLimitText() {
				return this.hasKnownValue(this.config.limit)
					? `每日可抽奖${this.config.limit}次，具体请查看活动规则`
					: '每日抽奖次数待确认，具体请查看活动规则'
			}
		},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.getPrizeFun();
		},
		methods: {
			hasKnownValue(value) {
				return value !== undefined && value !== null && value !== ''
			},
			displayText(value, fallback) {
				return this.hasKnownValue(value) ? value : fallback
			},
			getPrizeFun() {
				getPrize().then(res => {
					if (res.code == 1) {
						let {
							config,
							list,
							record,
							surplus,
							user_integral
						} = res.data;

						this.config = config;
						this.lists = list;
						this.record = record
						this.surplus = surplus
						this.user_integral = user_integral
					}
				});
			},

			onClose() {
				this.showResult = false
			},

			startLottery(e) {
				this.getPrizeFun();
			},

			lotteryFinish(e) {
				this.showResult = true;
				this.resultText = e.detail
			}

		}
	};
</script>

<style lang="scss">
	/* pages/luckly_wheel/luckly_wheel.wxss */

	.luckly-wheel-container {
		background-color: $color-primary;
		padding-bottom: 20rpx;
		width: 100%;
		max-width: 750rpx;
		min-height: 100vh;
		margin: 0 auto;
		overflow-x: hidden;

		.header {
			width: 100%;
			height: 1108rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.main {
			margin-top: -810rpx;
			position: relative;

			.user-prize {
				padding: 20rpx;
				background-color: #FEF0B5;
				border-radius: 100rpx 0rpx 0rpx 100rpx;
				box-shadow: 0px 3px 0px #d79a43;
			}

			.wheel-box {
				padding: 0 30rpx;
				box-sizing: border-box;

				.wheel-container {
					padding: 27rpx 15rpx 36rpx;
					background-color: #a0610d;
					border: 12rpx solid #d79a43;
					margin-top: 20rpx;
					border-radius: 30rpx;
					box-sizing: border-box;

					.notice-container {
						background-color: #7f4c0a;
						border: 2rpx solid #EDB17D;
						padding: 13rpx 28rpx;
						border-radius: 100rpx;
						width: 586rpx;
						max-width: 100%;
						box-sizing: border-box;

						.marquee-box {
							width: 500rpx;
							max-width: calc(100% - 60rpx);
							height: 33rpx;
						}
					}

					.wheel {
						margin-top: 20rpx;

						.lottery-box {
							background: radial-gradient(circle at 50% 50%, #fff3bf 0%, #ffd85b 48%, #d79a43 72%, #7f4c0a 100%);
							box-shadow: inset 0 0 0 12rpx #d79a43;
							width: 560rpx;
							height: 560rpx;
							background-size: 100% 100%;
							padding: 35rpx 40rpx;
							box-sizing: border-box;
						}
					}

					.rules-box {
						margin-top: 24rpx;
						background-color: #7f4c0a;
						padding: 20rpx 16rpx 20rpx 28rpx;
						border-radius: 20rpx;
					}
					.message {
						margin: 30rpx 10rpx;
						color: #FEF0B5;

						image {
						    width: 28rpx;
						    height: 30rpx;
						}
					}
					// 每日抽奖次数提示
					.num-tips {
					    color: #fbccc7;
					    margin: 16rpx 0;
					    text-align: center;
					}
				}
			}
		}
	}

	.luckly-wheel-container .van-popup {
		background-color: rgba(0, 0, 0, 0);
	}

	.result-popup {
		width: 545rpx;
		max-width: 90vw;
		height: 626rpx;

		.result-container {
			width: 545rpx;
			max-width: 100%;
			height: 514rpx;
			background-size: 100% 100%;
			background: linear-gradient(180deg, #fff8ed 0%, #fff1dc 100%);
		}
	}

	.get-btn {
		width: 320rpx;
		height: 70rpx;
		color: #7B3200;
		background: linear-gradient(180deg, #FEF0B0 0%, #FFA92E 100%);
	}
</style>
