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
	<view class="goods-logistics-page">
		<view class="goods-logistics mb20">
			<view class="logistics-hero">
				<view class="logistics-hero__badge">运</view>
				<view class="logistics-hero__body">
					<view class="logistics-hero__title">{{ order.tips || currentStatusText }}</view>
					<view class="logistics-hero__desc">{{ currentDesc }}</view>
				</view>
			</view>

			<view class="parcel-card">
				<view class="goods">
					<image v-if="parcelImage" class="goods-img" :src="parcelImage" mode="aspectFill" @error="onGoodsImageError"></image>
					<view v-else class="goods-placeholder">商品</view>
					<view class="count">共{{ order.count || 1 }}件</view>
				</view>
				<view class="parcel-card__body">
					<view class="parcel-card__name line1">{{ shippingCompanyName }}</view>
					<view class="parcel-card__meta line1">订单编号：{{ order.order_sn || id || '-' }}</view>
					<view class="parcel-card__number">
						<text class="line1">快递单号：{{ order.invoice_no || '暂无物流单号' }}</text>
						<view class="copy-btn" @tap="onCopy">复制</view>
					</view>
				</view>
			</view>

			<view class="info-card" v-if="hasSummaryRows">
				<view class="section-head">
					<view class="section-head__bar"></view>
					<view class="section-head__title">运单信息</view>
				</view>
				<view class="info-grid">
					<view class="info-row" v-for="row in summaryRows" :key="row.label">
						<text class="info-row__label">{{ row.label }}</text>
						<text class="info-row__value">{{ row.value }}</text>
					</view>
				</view>
			</view>

			<view class="timeline-card">
				<view class="section-head">
					<view class="section-head__bar"></view>
					<view class="section-head__title">物流轨迹</view>
				</view>
				<view v-if="!hasLogisticsInfo" class="logistics-empty">
					<view class="logistics-empty__title">暂无物流轨迹</view>
					<view class="logistics-empty__desc">商家已发货后，物流信息可能会稍后同步。</view>
				</view>
				<view v-else class="timeline">
					<view
						v-for="(item, index) in timelineItems"
						:key="index"
						:class="['timeline-item', item.active ? 'is-active' : '']"
					>
						<view class="timeline-node">
							<view class="timeline-node__dot"></view>
							<view class="timeline-node__line"></view>
						</view>
						<view class="timeline-content">
							<view class="timeline-title">{{ item.title }}</view>
							<view class="timeline-desc" v-if="item.desc">{{ item.desc }}</view>
							<view class="timeline-time" v-if="item.time">{{ item.time }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<loading-view v-if="isFirstLoading"></loading-view>
	</view>
</template>

<script>
	import {
		orderTraces
	} from '@/api/order';
	import {copy} from '@/utils/tools'
	import { getStaticAssetUrl } from '@/utils/design-assets'
	import LoadingView from '@/components/loading-view/loading-view.vue'
	export default {
		data() {
			return {
				shipment: {},
				buy: {},
				delivery: {},
				finish: {},
				order: {},
				take: {},
				id: '',
				isFirstLoading: true,
				goodsImageErrored: false
			};
		},
		computed: {
			parcelImage() {
				if (this.goodsImageErrored || !this.order.image) return ''
				return getStaticAssetUrl(this.order.image)
			},
			traceList() {
				return Array.isArray(this.delivery.traces) ? this.delivery.traces : []
			},
			firstTrace() {
				return this.traceList[0] || []
			},
			hasLogisticsInfo() {
				return Boolean(
					this.finish.tips ||
					this.firstTrace.length ||
					this.shipment.tips ||
					this.buy.tips
				)
			},
			summaryRows() {
				const rows = [
					{ label: '收货人', value: [this.take.contacts, this.take.mobile].filter(Boolean).join(' ') },
					{ label: '收货地址', value: this.take.address },
					{ label: '物流公司', value: this.shippingCompanyName && this.shippingCompanyName !== '暂无物流公司' ? this.shippingCompanyName : '' },
					{ label: '物流单号', value: this.order.invoice_no && this.order.invoice_no !== '暂无物流单号' ? this.order.invoice_no : '' },
					{ label: '发货时间', value: this.order.shipped_time },
					{ label: '签收时间', value: this.order.finish_time }
				]
				return rows.filter((row) => row.value)
			},
			hasSummaryRows() {
				return this.summaryRows.length > 0
			},
			shippingCompanyName() {
				return this.companyName(this.order.shipping_name || this.order.express_name || this.order.shipping_code || this.order.express_code || this.order.delivery_code || '')
			},
			currentStatusText() {
				if (this.finish.tips) return '订单已完成'
				if (this.firstTrace.length) return '运输中'
				if (this.shipment.tips) return '已发货'
				if (this.buy.tips) return '已支付'
				return '物流详情'
			},
			currentDesc() {
				const first = this.timelineItems[0] || {}
				return first.desc || this.shipment.tips || this.buy.tips || '物流信息同步后会展示最新轨迹'
			},
			timelineItems() {
				const list = []
				if (this.finish.tips) {
					list.push({ title: this.finish.title || '确认收货', desc: this.finish.tips, time: this.finish.time, active: true })
				}
				this.traceList.forEach((trace, index) => {
					const parts = Array.isArray(trace) ? trace.filter(Boolean) : [String(trace || '')].filter(Boolean)
					if (!parts.length) return
					const time = parts.find((item) => /\d{2,4}[-/.年]\d{1,2}|:\d{2}/.test(String(item))) || ''
					const desc = parts.filter((item) => item !== time).join(' ')
					list.push({
						title: index === 0 ? (this.delivery.title || '物流运输中') : '物流更新',
						desc: desc || parts.join(' '),
						time,
						active: !list.length
					})
				})
				if (this.shipment.tips) {
					list.push({ title: this.shipment.title || '商家已发货', desc: this.shipment.tips, time: this.shipment.time, active: !list.length })
				}
				if (this.buy.tips) {
					list.push({ title: this.buy.title || '订单已支付', desc: this.buy.tips, time: this.buy.time, active: !list.length })
				}
				return list
			}
		},

		components: {
			LoadingView
		},
		props: {},

		onLoad: function(options) {
			this.id = options.id;
			this.orderTracesFun();
		},

		methods: {
			companyName(value = '') {
				const raw = String(value || '').trim()
				if (!raw || raw === '暂无物流公司') return '暂无物流公司'
				const key = raw.replace(/[\s_-]/g, '').toUpperCase()
				const map = {
					SF: '顺丰速运',
					SFEXPRESS: '顺丰速运',
					STO: '申通快递',
					STOEXPRESS: '申通快递',
					YTO: '圆通速递',
					YTOEXPRESS: '圆通速递',
					ZTO: '中通快递',
					ZTOEXPRESS: '中通快递',
					YUNDA: '韵达快递',
					YD: '韵达快递',
					YZPY: '邮政快递包裹',
					EMS: 'EMS',
					HTKY: '百世快递',
					BEST: '百世快递',
					JD: '京东物流',
					JDL: '京东物流',
					JT: '极兔速递',
					JTSD: '极兔速递',
					JTEXPRESS: '极兔速递',
					DBL: '德邦快递',
					DEPPON: '德邦快递',
					ZJS: '宅急送',
					ANE: '安能物流',
					UC: '优速快递',
					FAST: '快捷快递',
					TTKDEX: '天天快递',
					UNKNOWN: '暂无物流公司'
				}
				return map[key] || raw
			},
			async orderTracesFun() {
				try {
					this.goodsImageErrored = false
					const res = await orderTraces(this.id)
					const data = res && res.data ? res.data : {}
					if (res && res.code == 1) {
						this.shipment = data.shipment || {}
						this.buy = data.buy || {}
						this.delivery = data.delivery || {}
						this.finish = data.finish || {}
						this.order = data.order || { tips: '物流详情', shipping_name: '暂无物流公司', invoice_no: '暂无物流单号', count: 1 }
						this.order.shipping_name = this.companyName(this.order.shipping_name || this.order.express_name || this.order.shipping_code || this.order.express_code)
						this.take = data.take || {}
						return
					}
					this.$toast({ title: (res && res.msg) || '物流信息加载失败' })
					this.order = { tips: '物流详情', shipping_name: '暂无物流公司', invoice_no: '暂无物流单号', count: 1 }
				} catch (error) {
					console.error('[goods-logistics] orderTraces failed:', error)
					this.$toast({ title: '物流信息加载失败' })
					this.order = { tips: '物流详情', shipping_name: '暂无物流公司', invoice_no: '暂无物流单号', count: 1 }
				} finally {
					this.isFirstLoading = false
				}
			},

			onCopy() {
				if (!this.order.invoice_no || this.order.invoice_no === '暂无物流单号') {
					this.$toast({ title: '暂无可复制的物流单号' })
					return
				}
				copy(this.order.invoice_no)
			},

			onGoodsImageError() {
				this.goodsImageErrored = true
			}

		}
	};
</script>
<style lang="scss">
.goods-logistics-page {
	min-height: 100vh;
	padding: 28rpx 24rpx 56rpx;
	background: linear-gradient(180deg, #e9f4ff 0%, #f7f8fb 330rpx, #f7f8fb 100%);
	box-sizing: border-box;
}

.goods-logistics {
	padding-top: 0;
}

.logistics-hero,
.parcel-card,
.info-card,
.timeline-card {
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 16rpx 40rpx rgba(24, 72, 132, .08);
	box-sizing: border-box;
}

.logistics-hero {
	display: flex;
	align-items: center;
	padding: 34rpx 30rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #1677ff 0%, #35b7ff 100%);
	box-shadow: 0 20rpx 48rpx rgba(22, 119, 255, .22);
}

.logistics-hero__badge {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 78rpx;
	height: 78rpx;
	border-radius: 24rpx;
	color: #1677ff;
	font-size: 36rpx;
	font-weight: 800;
	background: rgba(255, 255, 255, .95);
}

.logistics-hero__body {
	flex: 1;
	min-width: 0;
	margin-left: 24rpx;
}

.logistics-hero__title {
	font-size: 36rpx;
	font-weight: 800;
	line-height: 46rpx;
}

.logistics-hero__desc {
	margin-top: 10rpx;
	color: rgba(255, 255, 255, .86);
	font-size: 25rpx;
	line-height: 36rpx;
	word-break: break-all;
}

.parcel-card {
	display: flex;
	align-items: center;
	margin-top: 22rpx;
	padding: 24rpx;
}

.goods {
	position: relative;
	flex: none;
	width: 152rpx;
	height: 152rpx;
	border-radius: 22rpx;
	overflow: hidden;
	background: linear-gradient(135deg, #edf4ff, #f6f8fb);
}

.goods-img,
.goods-placeholder {
	width: 152rpx;
	height: 152rpx;
}

.goods-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #6b7a90;
	font-size: 26rpx;
	font-weight: 700;
}

.count {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 36rpx;
	color: #ffffff;
	font-size: 21rpx;
	line-height: 36rpx;
	text-align: center;
	background: rgba(17, 24, 39, .62);
}

.parcel-card__body {
	flex: 1;
	min-width: 0;
	margin-left: 24rpx;
}

.parcel-card__name {
	color: #172033;
	font-size: 31rpx;
	font-weight: 800;
	line-height: 40rpx;
}

.parcel-card__meta {
	margin-top: 12rpx;
	color: #8b95a5;
	font-size: 24rpx;
	line-height: 34rpx;
}

.parcel-card__number {
	display: flex;
	align-items: center;
	margin-top: 14rpx;
	color: #344054;
	font-size: 24rpx;
	line-height: 34rpx;
}

.parcel-card__number text {
	flex: 1;
	min-width: 0;
}

.copy-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 86rpx;
	height: 44rpx;
	margin-left: 16rpx;
	border-radius: 999rpx;
	color: #1677ff;
	font-size: 23rpx;
	background: #eef6ff;
}

.info-card,
.timeline-card {
	margin-top: 22rpx;
	padding: 28rpx 28rpx 30rpx;
}

.section-head {
	display: flex;
	align-items: center;
	margin-bottom: 22rpx;
}

.section-head__bar {
	width: 8rpx;
	height: 30rpx;
	border-radius: 999rpx;
	background: #1677ff;
}

.section-head__title {
	margin-left: 14rpx;
	color: #172033;
	font-size: 30rpx;
	font-weight: 800;
}

.info-row {
	display: flex;
	align-items: flex-start;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f0f3f7;
}

.info-row:last-child {
	border-bottom: 0;
}

.info-row__label {
	flex: none;
	width: 132rpx;
	color: #8b95a5;
	font-size: 25rpx;
	line-height: 36rpx;
}

.info-row__value {
	flex: 1;
	min-width: 0;
	color: #30343b;
	font-size: 25rpx;
	line-height: 36rpx;
	text-align: right;
	word-break: break-all;
}

.logistics-empty {
	padding: 58rpx 20rpx 64rpx;
	text-align: center;
	background: #f8fafc;
	border-radius: 22rpx;
}

.logistics-empty__title {
	color: #172033;
	font-size: 30rpx;
	font-weight: 800;
	line-height: 42rpx;
}

.logistics-empty__desc {
	margin-top: 12rpx;
	color: #8b95a5;
	font-size: 25rpx;
	line-height: 38rpx;
}

.timeline {
	padding-top: 2rpx;
}

.timeline-item {
	position: relative;
	display: flex;
	align-items: flex-start;
}

.timeline-node {
	position: relative;
	display: flex;
	align-items: center;
	flex-direction: column;
	flex: none;
	width: 44rpx;
	min-height: 132rpx;
}

.timeline-node__dot {
	z-index: 1;
	width: 18rpx;
	height: 18rpx;
	margin-top: 30rpx;
	border-radius: 50%;
	background: #c8d4e3;
}

.timeline-node__line {
	flex: 1;
	width: 2rpx;
	background: #e7edf5;
}

.timeline-item:last-child .timeline-node__line {
	display: none;
}

.timeline-content {
	flex: 1;
	min-width: 0;
	margin: 0 0 22rpx 18rpx;
	padding: 22rpx 24rpx;
	border-radius: 22rpx;
	background: #f8fafc;
}

.timeline-item.is-active .timeline-node__dot {
	width: 26rpx;
	height: 26rpx;
	margin-top: 26rpx;
	background: #1677ff;
	box-shadow: 0 0 0 10rpx rgba(22, 119, 255, .12);
}

.timeline-item.is-active .timeline-content {
	background: #eef6ff;
}

.timeline-title {
	color: #172033;
	font-size: 28rpx;
	font-weight: 800;
	line-height: 38rpx;
}

.timeline-desc {
	margin-top: 8rpx;
	color: #475467;
	font-size: 25rpx;
	line-height: 38rpx;
	word-break: break-all;
}

.timeline-time {
	margin-top: 10rpx;
	color: #98a2b3;
	font-size: 23rpx;
	line-height: 32rpx;
}
</style>
