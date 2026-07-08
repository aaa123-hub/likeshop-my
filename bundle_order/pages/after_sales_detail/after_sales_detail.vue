<template>
	<view>
		<!--pages/after_sales_detail/after_sales_detail.wxml-->
		<view class="after-sales-detail">
			<view class="after-sales-header">
				<view class="after-sales-status white lg">
					{{ refundStatusText(lists.status_text || lists.status) }}
				</view>
				<!-- <view class="after-sales-explain bg-white" hidden="{{lists.status == 2 || lists.status == 5 || lists == 6}}">
			<text class="xs muted" style="line-height: 40rpx" wx:if="{{lists.status == 0 || lists.status == 1 || lists == 4}}">如果商家拒绝，您可重新发起申请
				如果商家同意，将通过申请原路退款至您的账户中
				如果商家逾期未处理，平台将自动通过申请并退款给您
			</text>
			<text class="xs muted" style="line-height: 40rpx" wx:if="{{lists.status == 3}}">如果商家确认收到货后将会退款给您
				如果商家拒绝收货，该次退款将会关闭，您可以重新发起退款
			</text>
		</view> -->
			</view>
			<!-- <view class="negotiation-record row-between bg-white mt20">
		<view class="nr">协商记录</view>
		<view class="arrow">
			<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png" />
		</view>
	</view> -->
			<view class="return-address-contain row bg-white mt20" v-show="!(lists.refund_type == 0)">
				<view class="nr normal address-title">退货地址：</view>
				<view class="sm normal address">{{lists.shop && lists.shop.address}}
					{{lists.shop && lists.shop.contact}} {{lists.shop && lists.shop.mobile}}</view>
				<view class="xs copy-btn row-center flex-none" @tap="onCopy">复制</view>
			</view>
			<view class="goods-container bg-white mt20">
				<!-- <view class="goods-header row">
			<view class="store-img mr10">
				<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_shop.png" />
			</view>
			<view class="store-name nr bold">
				{{lists.shop.name}}
			</view>
		</view> -->
				<view class="goods-item row">
					<view class="goods-img">
						<custom-image width="100%" height="100%" radius="10rpx" lazy-load
							:src="detailGoods.image" />
					</view>
					<view class="goods-info">
						<view class="two-txt-cut nr">{{detailGoods.goods_name}}</view>
						<view class="row-between mt20">
							<!-- <view class="md">￥999.00</view> -->
							<price-format :price="detailGoods.goods_price" :firstSize="30"
								:secondSize="30" :showSubscript="true" :subscriptSize="30" color="#101010" />
							<view class="nr">x{{detailGoods.goods_num}}</view>
						</view>
					</view>
				</view>
			</view>
			<view class="return-goods-container bg-white mt20">
				<view class="return-goods-row row sm">
					<view class="return-title">退款方式：</view>
					<view class="return-explain">{{lists.refund_type == 0 ? '仅退款' : '退款退货'}}</view>
				</view>
				<view class="return-goods-row row sm mt20" v-if="refundReason">
					<view class="return-title">退款原因：</view>
					<view class="return-explain">{{refundReasonText(refundReason)}}</view>
				</view>
				<view class="return-goods-row row sm mt20">
					<view class="return-title">退款金额：</view>
					<view class="return-explain primary">¥{{lists.refund_price}}</view>
				</view>
				<view class="return-goods-row row sm mt20">
					<view class="return-title">退款编号：</view>
					<view class="return-explain">{{lists.sn}}</view>
				</view>
				<view class="return-goods-row row sm mt20">
					<view class="return-title">申请时间：</view>
					<view class="return-explain">{{lists.create_time}}</view>
				</view>
				<view class="return-goods-row row sm mt20" v-if="lists.refund_remark">
					<view class="return-title">备注说明：</view>
					<view class="return-explain">{{lists.refund_remark}}</view>
				</view>
				<view class="return-goods-row row sm mt20" v-if="lists.refund_image">
					<view class="return-title">图片凭证：</view>
					<view class="return-explain">
						<custom-image mode="aspectFit" class="img-preview" radius="10rpx" :src="lists.refund_image" width="160rpx" height="160rpx" />
					</view>
				</view>
			</view>
			<view class="btn-group fixed bg-white row-end" v-show="lists.status != 6">
				<view class="mr20 btn br60" @tap="showDialog">撤销申请</view>
				<view class="mr20 btn br60" @tap="goRefund" v-show="lists.status == 4 || lists.status == 1">重新申请</view>
				<navigator hover-class="none"
					:url="'/bundle_order/pages/input_express_info/input_express_info?id=' + lists.id" class="mr20 btn br60"
					v-show="lists.status == 2">填写快递单号</navigator>
				<view class="btn br60" v-show="false">平台退款</view>
			</view>
		</view>
		<u-modal v-model="confirmDialog" confirm-text="确定" :showCancelButton="true" :show-title="false"
			confirm-color="#FF2C3C" @confirm="cancelApplyFun" @cancel="hideDialog">
			<view class="column-center tips-dialog" style="padding: 20rpx 0;">
				<image class="icon-lg" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_warning.png"></image>
				<view style="margin-top:30rpx">是否要撤销申请？</view>
			</view>
		</u-modal>
	</view>
</template>

<script>
import PriceFormat from '@/bundle_order/components/price-format/price-format.vue'
import UModal from '@/bundle_order/components/uview-ui/components/u-modal/u-modal.vue'
import CustomImage from '@/components/custom-image/custom-image.vue'
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
		afterSaleDetail,
		cancelApply
	} from "@/api/user";
	import {
trottle,
		copy
	} from "@/utils/tools.js";

	export default {
		data() {
			return {
				goods: {},
				reason: [],
				lists: {},
				refundReason: "",
				copyContent: "",
				confirmDialog: false
			};
		},

		components: {
			PriceFormat,
			UModal,
			CustomImage
		},
		props: {},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			let {
				afterSaleId,
				order_id,
				refundReason
			} = options;
			this.afterSaleId = afterSaleId;
			this.orderId = order_id;
			this.refundReason = decodeURIComponent(refundReason || "");
		},


		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: function() {
			this.afterSaleDetailFun();
		},

		methods: {
			onCopy() {
				let {
					lists,
					copyContent
				} = this;
				let {
					address,
					contact,
					mobile
				} = lists.shop || {};
				if (!address && !contact && !mobile) {
					this.$toast({ title: '暂无退货地址' })
					return
				}
				copyContent = address + " " + contact + " " + mobile;
				copy(copyContent)
			},

			goRefund(e) {
				let {
					lists
				} = this;
				if (!this.detailGoods.item_id) {
					this.$toast({ title: '缺少售后商品信息' })
					return
				}
				uni.navigateTo({
					url: '/bundle_order/pages/apply_refund/apply_refund?order_id=' + (this.orderId || lists.order_id || lists.order_sn) + '&afterSaleId=' +
						this.afterSaleId + '&item_id=' + this.detailGoods.item_id
				});
			},

			showDialog() {
				this.confirmDialog = true
			},

			hideDialog() {
				this.confirmDialog = false;
			},

			confirmCancel() {},

			cancelApplyFun() {
				cancelApply({
					id: this.afterSaleId
				}).then(res => {
					if (res.code == 1) {
						this.$toast({
							title: res.msg
						}, {
							tab: 3
						});
						uni.$emit("refreshsale")
					}
				});
			},

			afterSaleDetailFun() {
				afterSaleDetail({
					id: this.afterSaleId
				}).then(res => {
					if (res.code == 1) {
						this.lists = res.data || {}
					}
				});
			},
			refundStatusText(status) {
				const text = String(status || '')
				const map = {
					APPLIED: '待商家处理',
					PENDING: '待商家处理',
					PROCESSING: '处理中',
					REFUNDING: '退款中',
					APPROVED: '商家已同意',
					RETURNING: '待买家退货',
					REJECTED: '商家已拒绝',
					CANCELLED: '已撤销',
					CANCELED: '已撤销',
					REFUNDED: '退款成功',
					SUCCESS: '退款成功',
					FAILED: '退款失败',
					0: '待商家处理',
					1: '处理中',
					2: '商家已同意',
					3: '商家已同意',
					4: '商家已拒绝',
					5: '退款成功',
					6: '已撤销'
				}
				return map[text.toUpperCase()] || map[status] || (/^[A-Z0-9_-]+$/.test(text) ? '售后处理中' : text)
			},
			refundReasonText(reason) {
				const text = String(reason || '')
				const map = {
					QUALITY_PROBLEM: '商品质量问题',
					WRONG_GOODS: '商品错发/漏发',
					NOT_RECEIVED: '未收到货',
					NO_REASON: '七天无理由',
					DO_NOT_WANT: '拍错/多拍/不想要',
					NOT_AS_DESCRIBED: '商品与描述不符',
					DELAY_SHIPMENT: '未按约定时间发货',
					OTHER: '其他'
				}
				return text.split(/[,，、]/).map(item => map[item.toUpperCase()] || item).join('、')
			}

		},
		computed: {
			detailGoods() {
				const goods = this.lists.order_goods || this.lists.goods_lists || {}
				return Array.isArray(goods) ? goods[0] || {} : goods
			}
		}
	};
</script>
<style lang="scss">
	/* pages/after_sales_detail/after_sales_detail.wxss */

	.after-sales-detail {
		min-height: 100vh;
		background: #f7f8fa;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));

		.after-sales-header {
			.after-sales-status {
				padding: 54rpx 30rpx 64rpx;
				background: linear-gradient(135deg, #ff5864 0%, #ff8a55 100%);
				font-weight: 600;
			}

			.after-sales-explain {
				padding: 20rpx 30rpx 24rpx;
			}
		}

		.negotiation-record {
			padding: 24rpx 30rpx;

			.arrow {
				width: 28rpx;
				height: 28rpx;
			}
		}

		.return-goods-container {
			margin: 20rpx 24rpx 0;
			padding: 26rpx 24rpx 34rpx;
			border-radius: 22rpx;
			box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);

			.return-goods-row {
				line-height: 40rpx;
				font-weight: 400;

				.return-title {
					width: 150rpx;
					color: #888;
					flex: none;
				}

				.return-explain {
					flex: 1;
					color: #333;
					word-break: break-all;
				}
			}
		}

		.btn-group {
			padding: 0rpx 24rpx env(safe-area-inset-bottom);
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			height: calc(104rpx + env(safe-area-inset-bottom));
			box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);

			.btn {
				height: 58rpx;
				padding: 0 34rpx;
				border: 1px solid #dddddd;
				color: #444;
				background: #fff;
			}
		}

		.goods-container {
			margin: -24rpx 24rpx 0;
			border-radius: 22rpx;
			overflow: hidden;
			box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);

			.goods-header {
				padding: 20rpx 24rpx;

				.store-img {
					width: 40rpx;
					height: 40rpx;
				}

				.store-name {
					line-height: 40rpx;
					align-self: flex-end;
					font-family: PingFang SC;
				}
			}

			.goods-item {
				padding: 25rpx 24rpx;

				.goods-img {
					width: 180rpx;
					height: 180rpx;
					flex: none;
				}

				.goods-info {
					margin-left: 24rpx;
					flex: 1;
				}
			}
		}
	}

	.return-address-contain {
		margin: 20rpx 24rpx 0;
		padding: 24rpx;
		border-radius: 22rpx;
		box-shadow: 0 12rpx 34rpx rgba(35, 37, 45, 0.06);

		.address {
			flex: 1;
			line-height: 38rpx;
		}

		.address-title {
			width: 150rpx;
			align-self: flex-start;
			line-height: 40rpx;
		}

		.copy-btn {
			flex: 0 0 13%;
			background-color: #fff3f4;
			color: #ff2c3c;
			align-self: flex-start;
			padding: 6rpx 16rpx;
			margin-left: 12rpx;
			border-radius: 999rpx;
		}
	}

	.tips-dialog {
		height: 230rpx;
		width: 100%;
	}
</style>
