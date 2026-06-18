<template>
	<view class="goods-search">
		<view class="search-top">
			<navbar title="搜索" :background="{ background: '#bcd1f3' }"></navbar>
			<view class="search-box">
				<u-search
					v-model="keyword"
					@focus="showHistory = true"
					:focus="showHistory"
					@search="onSearch"
					:bg-color="'#ffffff'"
					:show-action="false"
					border-color="transparent"
					search-icon-color="#222222"
					placeholder="输入关键词"
					height="64"
				></u-search>
			</view>
		</view>
		<u-sticky offset-top="0" h5-nav-height="0">
			<view v-show="!showHistory" class="filter-bar">
				<view class="filter-item" @tap="onNormal">
					<text :class="comprehensive ? 'is-active' : ''">位置距离</text>
					<u-icon name="arrow-down-fill" size="16" color="#222222"></u-icon>
				</view>
				<view class="filter-item" @tap="onPriceSort">
					<text :class="priceSort ? 'is-active' : ''">行业分类</text>
					<u-icon name="arrow-down-fill" size="16" color="#222222"></u-icon>
				</view>
				<view class="filter-item" @tap="onSaleSort">
					<text :class="saleSort ? 'is-active' : ''">推荐排序</text>
					<u-icon name="arrow-down-fill" size="16" color="#222222"></u-icon>
				</view>
				<view class="filter-item" @tap="changeType">
					<text>更多筛选</text>
					<u-icon name="arrow-down-fill" size="16" color="#222222"></u-icon>
				</view>
			</view>
		</u-sticky>
		<view v-show="showHistory" class="history-panel">
			<view v-if="hotList.length" class="word-block">
				<view class="word-title">热门搜索</view>
				<view class="word-list">
					<view v-for="(item, index) in hotList" :key="index" class="word-item" @tap="onChangeKeyword(item)">
						{{ item }}
					</view>
				</view>
			</view>
			<view v-if="historyList.length" class="word-block">
				<view class="word-title row-between">
					<text>历史搜索</text>
					<text class="clear-text" @tap="clearSearchFun">清空</text>
				</view>
				<view class="word-list">
					<view v-for="(item, index) in historyList" :key="index" class="word-item" @tap="onChangeKeyword(item)">
						{{ item }}
					</view>
				</view>
			</view>
		</view>
		<view v-show="!showHistory" class="result-panel">
			<template v-if="goodsList.length">
				<view v-for="(item, index) in goodsList" :key="index" class="merchant-card">
					<image class="merchant-card__image" :src="getGoodsImage(item)" mode="aspectFill"></image>
					<view class="merchant-card__content">
						<view class="merchant-card__header">
							<view class="merchant-card__title line1">
								{{ getMerchantTitle(item) }}
							</view>
							<view v-if="index === 0" class="merchant-card__badge">推荐</view>
						</view>
						<view class="merchant-card__score">
							<text class="stars">★★★★★</text>
							<text class="score">{{ getGoodsScore(item) }}</text>
						</view>
						<view class="merchant-card__meta">
							<u-icon name="clock" size="28" color="#777777"></u-icon>
							<text>营业时间：{{ getGoodsTime(item) }}</text>
						</view>
						<view class="merchant-card__distance">{{ getGoodsDistance(item) }}</view>
					</view>
				</view>
			</template>
			<loading-footer :status="status" :slot-empty="true">
				<view slot="empty" class="empty-slot">
					<u-empty
						mode="search"
						text="暂无数据"
						:icon-size="220"
						:font-size="56"
						color="#666666"
					></u-empty>
				</view>
			</loading-footer>
		</view>
	</view>
</template>

<script>
	import {
		getGoodsSearch,
		getSearchpage,
		clearSearch
	} from '@/api/store';
	import {
		trottle,
		loadingFun,
		getRect
	} from '@/utils/tools';
	import {
		loadingType
	} from '@/utils/type';

	export default {
		data() {
			return {
				keyword: '',
				status: loadingType.LOADING,
				page: 1,
				goodsType: 'double',
				goodsList: [],
				priceSort: '',
				saleSort: '',
				showHistory: false,
				hotList: [],
				historyList: []
			};
		},

		components: {},
		props: {},
		watch: {
			// 监听属性
			keyword(value, old) {
				if (!value && !this.id) {
					this.showHistory = true
				}
			},
			showHistory(value) {
				if (value) {
					this.getSearchpageFun();
				}
			}

		},
		computed: {
			comprehensive() {
				const {
					priceSort,
					saleSort
				} = this
				if (priceSort == '' && saleSort == '') {
					return true;
				}

				return false;
			}

		},




		onLoad(options) {
			this.onNormal = trottle(this.onNormal, 500, this);
			this.onPriceSort = trottle(this.onPriceSort, 500, this);
			this.onSaleSort = trottle(this.onSaleSort, 500, this);
			this.onSearch = trottle(this.onSearch, 500, this);
			this.init(options);
		},


		onReachBottom: function() {
			this.getGoodsSearchFun();
		},
		methods: {
			getMerchantTitle(item) {
				return item.name || item.goods_name || item.shop_name || '广州市越秀区斌记面家'
			},
			getGoodsImage(item) {
				return item.image || item.goods_image || item.cover || '/static/images/goods_null.png'
			},
			getGoodsScore(item) {
				return item.score || item.star || '5.0'
			},
			getGoodsTime(item) {
				return item.business_time || item.time_desc || '8:00-16:00'
			},
			getGoodsDistance(item) {
				return item.distance_desc || item.distance || '距离 1.2km'
			},
			onChange(e) {
				this.keyword = e.value
			},

			changeType() {
				this.goodsType = this.goodsType === 'one' ? 'double' : 'one'
			},

			clearSearchFun() {
				clearSearch().then(res => {
					if (res.code == 1) {
						this.getSearchpageFun();
					}
				});
			},

			onNormal() {
				this.priceSort = ''
				this.saleSort = ''
				this.onRefresh();
			},

			onPriceSort() {
				let {
					priceSort
				} = this;
				this.saleSort = ''
				this.priceSort = priceSort == 'asc' ? 'desc' : 'asc'
				this.onRefresh();
			},

			onSaleSort() {
				let {
					saleSort
				} = this;
				this.priceSort = ''
				this.saleSort = saleSort == 'desc' ? 'asc' : 'desc'
				this.onSearch();
			},

			init(option) {
				let {
					id,
					name,
					type
				} = option;
				this.type = type;
				if (id) {
					uni.setNavigationBarTitle({
						title: name
					});
					this.id = id;
					this.getGoodsSearchFun();
				} else {
					uni.setNavigationBarTitle({
						title: '搜索'
					});
					this.showHistory = true
				}
			},

			getSearchpageFun() {
				getSearchpage().then(res => {
					if (res.code == 1) {
						let {
							history_lists,
							hot_lists
						} = res.data;
						this.hotList = hot_lists
						this.historyList = history_lists
					}
				});
			},

			onClear() {
				if (this.id) {
					this.onSearch();
				}
			},
			onSearch() {
				this.onRefresh()
			},
			onRefresh() {
				this.showHistory = false
				this.page = 1
				this.goodsList = []
				this.status = loadingType.LOADING
				this.$nextTick(() => {
					this.getGoodsSearchFun();
				});
			},

			onChangeKeyword(item) {
				this.keyword = item
				this.showHistory = false
				this.onRefresh();
			},

			async getGoodsSearchFun() {
				let {
					page,
					goodsList,
					keyword,
					priceSort,
					saleSort,
					status
				} = this;
				if (status == loadingType.FINISHED) return;
				const params = {
					category_id: this.type == 1 ? this.id : '',
					brand_id: this.type == 0 ? this.id : '',
					page_no: page,
					keyword,
					price: priceSort,
					sales_sum: saleSort
				}
				const data = await loadingFun(getGoodsSearch, page, goodsList, status, params)
				if (!data) return
				this.page = data.page
				this.goodsList = data.dataList
				this.status = data.status
			},
		}
	};
</script>
<style lang="scss">
	.goods-search {
		min-height: 100vh;
		background: #f4f6fb;

		.search-top {
			background: #bcd1f3;
			padding-bottom: 16rpx;
		}

		.search-box {
			padding: 0 24rpx 12rpx;
		}

		.filter-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 88rpx;
			padding: 0 24rpx;
			background: #f4f6fb;
		}

		.filter-item {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			font-weight: 600;
			color: #222222;

			.u-icon {
				margin-left: 8rpx;
			}
		}

		.is-active {
			color: #1f7af4;
		}

		.history-panel {
			padding: 24rpx;
		}

		.word-block {
			padding: 30rpx 0 12rpx;
		}

		.word-title {
			padding-bottom: 24rpx;
			font-size: 28rpx;
			font-weight: 600;
			color: #222222;
		}

		.word-list {
			display: flex;
			flex-wrap: wrap;
		}

		.word-item {
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			padding: 0 26rpx;
			line-height: 56rpx;
			font-size: 24rpx;
			color: #666666;
			background: #ffffff;
			border-radius: 28rpx;
		}

		.clear-text {
			font-size: 24rpx;
			color: #999999;
		}

		.result-panel {
			padding: 18rpx 24rpx 40rpx;
		}

		.merchant-card {
			display: flex;
			align-items: stretch;
			padding: 20rpx;
			margin-bottom: 24rpx;
			background: #ffffff;
			border-radius: 24rpx;
			box-shadow: 0 10rpx 26rpx rgba(52, 72, 109, 0.04);
		}

		.merchant-card__image {
			flex: none;
			width: 192rpx;
			height: 192rpx;
			border-radius: 16rpx;
			background: #f0f2f5;
		}

		.merchant-card__content {
			flex: 1;
			min-width: 0;
			padding: 4rpx 0 4rpx 28rpx;
		}

		.merchant-card__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.merchant-card__title {
			font-size: 32rpx;
			font-weight: 600;
			color: #222222;
			line-height: 44rpx;
		}

		.merchant-card__badge {
			flex: none;
			margin-left: 16rpx;
			padding: 0 14rpx;
			line-height: 40rpx;
			font-size: 22rpx;
			font-weight: 600;
			color: #f59d00;
			background: #fff7dc;
			border-radius: 20rpx;
		}

		.merchant-card__score {
			display: flex;
			align-items: center;
			margin-top: 18rpx;
		}

		.stars {
			font-size: 28rpx;
			color: #ff6d2d;
			letter-spacing: 0;
		}

		.score {
			margin-left: 10rpx;
			font-size: 28rpx;
			color: #ff6d2d;
		}

		.merchant-card__meta {
			display: flex;
			align-items: center;
			margin-top: 22rpx;
			font-size: 26rpx;
			color: #777777;

			text {
				margin-left: 10rpx;
			}
		}

		.merchant-card__distance {
			margin-top: 10rpx;
			font-size: 24rpx;
			color: #a0a7b4;
		}

		.empty-slot {
			min-height: 760rpx;
		}
	}
</style>
