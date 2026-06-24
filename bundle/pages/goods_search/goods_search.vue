<template>
	<view class="goods-search">
		<view class="search-top">
			<view class="search-nav">
				<view class="search-nav__back" @tap="goBack"></view>
				<view class="search-nav__title">搜索</view>
				<view class="search-nav__space"></view>
			</view>
			<view class="search-box">
				<view class="search-input-wrap">
					<input
						class="search-input"
						v-model="keyword"
						:focus="showHistory"
						confirm-type="search"
						placeholder="输入关键词"
						placeholder-class="search-input__placeholder"
						@focus="showHistory = true"
						@confirm="onSearch"
					/>
					<view class="search-submit" @tap="onSearch">
						<text class="search-submit__text">搜索</text>
						<u-icon name="search" size="32" color="#ffffff"></u-icon>
					</view>
				</view>
			</view>
		</view>
		<view>
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
		</view>
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
				<view v-for="(item, index) in goodsList" :key="index" class="merchant-card" @tap="goResultDetail(item)">
					<view v-if="isEmptyImage(item)" class="merchant-card__image image-placeholder">无</view>
					<image v-else class="merchant-card__image" :src="getGoodsImage(item)" mode="aspectFill"></image>
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
		<view v-if="showFilter" class="filter-mask" @tap="showFilter = false">
			<view class="filter-panel" @tap.stop>
				<view class="filter-panel__title">更多筛选</view>
				<view class="filter-group">
					<view class="filter-group__label">价格区间</view>
					<view class="filter-price-row">
						<input class="filter-price-input" v-model="minPrice" type="digit" placeholder="最低价" />
						<view class="filter-price-line"></view>
						<input class="filter-price-input" v-model="maxPrice" type="digit" placeholder="最高价" />
					</view>
				</view>
				<view class="filter-group">
					<view class="filter-group__label">排序方式</view>
					<view class="filter-chip-row">
						<view :class="['filter-chip', sortType === '' ? 'active' : '']" @tap="sortType = ''">综合</view>
						<view :class="['filter-chip', sortType === 'PRICE_ASC' ? 'active' : '']" @tap="sortType = 'PRICE_ASC'">价格低到高</view>
						<view :class="['filter-chip', sortType === 'PRICE_DESC' ? 'active' : '']" @tap="sortType = 'PRICE_DESC'">价格高到低</view>
						<view :class="['filter-chip', sortType === 'SALES_DESC' ? 'active' : '']" @tap="sortType = 'SALES_DESC'">销量优先</view>
					</view>
				</view>
				<view class="filter-actions">
					<view class="filter-action reset" @tap="resetFilter">重置</view>
					<view class="filter-action confirm" @tap="applyFilter">确定</view>
				</view>
			</view>
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
	import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder';

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
				showFilter: false,
				hotList: [],
				historyList: [],
				minPrice: '',
				maxPrice: '',
				sortType: ''
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
			goBack() {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack()
					return
				}
				uni.switchTab({ url: '/pages/street/street' })
			},
			isEmptyImage(item) {
				return isPlaceholderImage(item.image || item.goods_image || item.cover)
			},
			getMerchantTitle(item) {
				return item.name || item.goods_name || item.shop_name || '广州市越秀区斌记面家'
			},
			getGoodsImage(item) {
				return resolveImage(item.image || item.goods_image || item.cover, 'goods')
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
			goResultDetail(item) {
				const shopId = item.shop_id || item.shopId || item.merchantShopId
				const goodsId = item.id || item.goods_id || item.spuId || item.productId
				if (shopId) {
					uni.navigateTo({ url: `/business/pages/business_pages/store_detail?shopId=${shopId}` })
					return
				}
				if (goodsId) {
					uni.navigateTo({ url: `/bundle/pages/goods_details/goods_details?id=${goodsId}` })
					return
				}
				this.$toast({ title: '暂无详情' })
			},
			onChange(e) {
				this.keyword = e.value
			},

			changeType() {
				this.showFilter = true
			},
			resetFilter() {
				this.minPrice = ''
				this.maxPrice = ''
				this.sortType = ''
			},
			applyFilter() {
				this.showFilter = false
				this.onRefresh()
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
				this.sortType = this.priceSort === 'asc' ? 'PRICE_ASC' : 'PRICE_DESC'
				this.onRefresh();
			},

			onSaleSort() {
				let {
					saleSort
				} = this;
				this.priceSort = ''
				this.saleSort = saleSort == 'desc' ? 'asc' : 'desc'
				this.sortType = 'SALES_DESC'
				this.onSearch();
			},

			init(option) {
				let {
					id,
					name,
					type,
					keyword
				} = option;
				this.type = type;
				this.keyword = keyword ? decodeURIComponent(keyword) : '';
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
					if (this.keyword) {
						this.showHistory = false;
						this.getGoodsSearchFun();
					} else {
						this.showHistory = false;
						this.getGoodsSearchFun();
						this.getSearchpageFun();
					}
				}
			},

			getSearchpageFun() {
				getSearchpage().then(res => {
					if (res.code == 1) {
						const data = res.data || {};
						this.hotList = data.hot_lists || data.hotList || data.hot || []
						this.historyList = data.history_lists || data.historyList || data.history || []
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
					sales_sum: saleSort,
					sortType: this.sortType,
					minPrice: this.minPrice,
					maxPrice: this.maxPrice
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
			padding-bottom: 20rpx;
		}

		.search-nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 88rpx;
			padding: calc(var(--status-bar-height) + 8rpx) 24rpx 0;
			box-sizing: content-box;
		}

		.search-nav__back,
		.search-nav__space {
			width: 72rpx;
			height: 72rpx;
		}

		.search-nav__back {
			position: relative;
			color: #222222;
		}

		.search-nav__back::after {
			content: '';
			position: absolute;
			left: 18rpx;
			top: 22rpx;
			width: 22rpx;
			height: 22rpx;
			border-left: 4rpx solid currentColor;
			border-bottom: 4rpx solid currentColor;
			transform: rotate(45deg);
		}

		.search-nav__title {
			color: #222222;
			font-size: 36rpx;
			font-weight: 600;
			line-height: 44rpx;
		}

		.search-box {
			padding: 0 36rpx 14rpx;
		}

		.search-input-wrap {
			display: flex;
			align-items: center;
			width: 100%;
			height: 78rpx;
			padding: 0 8rpx 0 30rpx;
			box-sizing: border-box;
			background: #ffffff;
			border-radius: 42rpx;
			box-shadow: 0 8rpx 20rpx rgba(69, 101, 154, 0.08);
		}

		.search-input {
			flex: 1;
			min-width: 0;
			height: 78rpx;
			color: #222222;
			font-size: 28rpx;
			font-weight: 500;
		}

		.search-input__placeholder {
			color: #9aa4b5;
			font-size: 28rpx;
			font-weight: 400;
		}

		.search-submit {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 126rpx;
			height: 62rpx;
			margin-left: 16rpx;
			border-radius: 34rpx;
			background: #1688ff;
			font-weight: 700;
		}

		.search-submit__text {
			margin-right: 6rpx;
			color: #ffffff;
			font-size: 26rpx;
			font-weight: 700;
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
			display: flex;
			align-items: center;
			justify-content: center;
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

		.filter-mask {
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			z-index: 10080;
			display: flex;
			align-items: flex-end;
			background: rgba(0, 0, 0, 0.45);
		}

		.filter-panel {
			width: 100%;
			padding: 32rpx 30rpx 40rpx;
			background: #ffffff;
			border-radius: 24rpx 24rpx 0 0;
			box-sizing: border-box;
			padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
		}

		.filter-panel__title {
			font-size: 34rpx;
			font-weight: 700;
			color: #222222;
			line-height: 48rpx;
		}

		.filter-group {
			margin-top: 32rpx;
		}

		.filter-group__label {
			margin-bottom: 20rpx;
			font-size: 28rpx;
			font-weight: 600;
			color: #222222;
		}

		.filter-price-row {
			display: flex;
			align-items: center;
		}

		.filter-price-input {
			flex: 1;
			height: 76rpx;
			padding: 0 24rpx;
			border-radius: 38rpx;
			background: #f5f7fb;
			font-size: 26rpx;
			color: #222222;
			text-align: center;
		}

		.filter-price-line {
			width: 34rpx;
			height: 2rpx;
			margin: 0 18rpx;
			background: #ccd3df;
		}

		.filter-chip-row {
			display: flex;
			flex-wrap: wrap;
			margin-right: -16rpx;
		}

		.filter-chip {
			margin-right: 16rpx;
			margin-bottom: 18rpx;
			padding: 0 28rpx;
			line-height: 66rpx;
			border-radius: 34rpx;
			background: #f5f7fb;
			font-size: 26rpx;
			color: #4b5565;
		}

		.filter-chip.active {
			background: #e8f2ff;
			color: #1688ff;
			font-weight: 600;
		}

		.filter-actions {
			display: flex;
			align-items: center;
			margin-top: 36rpx;
		}

		.filter-action {
			flex: 1;
			height: 78rpx;
			line-height: 78rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			font-weight: 700;
			text-align: center;
		}

		.filter-action.reset {
			margin-right: 18rpx;
			background: #f5f7fb;
			color: #4b5565;
		}

		.filter-action.confirm {
			background: #1688ff;
			color: #ffffff;
		}
	}
</style>
