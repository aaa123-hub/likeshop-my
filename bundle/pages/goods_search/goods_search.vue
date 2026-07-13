<template>
	<view class="goods-search">
		<view class="search-top">
			<view class="search-nav">
				<view class="search-nav__back" @tap="goBack"></view>
				<view class="search-nav__title">搜索</view>
				<view class="search-nav__capsule">
					<view class="search-nav__capsule-dot"></view>
					<view class="search-nav__capsule-divider"></view>
					<view class="search-nav__capsule-circle"></view>
				</view>
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
					<view class="search-submit" @tap="onSearch"></view>
				</view>
			</view>
		</view>
		<view>
			<view v-show="!showHistory" class="filter-bar">
				<view class="filter-item" @tap="onNormal">
					<text :class="comprehensive ? 'is-active' : ''">综合</text>
				</view>
				<view class="filter-item" @tap="onPriceSort">
					<text :class="priceSort ? 'is-active' : ''">{{ priceSortLabel }}</text>
					<u-icon name="arrow-down-fill" size="16" color="#222222"></u-icon>
				</view>
				<view class="filter-item" @tap="onSaleSort">
					<text :class="saleSort ? 'is-active' : ''">{{ saleSortLabel }}</text>
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
		<scroll-view v-show="!showHistory" class="result-panel" scroll-y @scrolltolower="getGoodsSearchFun">
			<view v-if="categoryName" class="category-source">
				<view class="category-source__label">当前分类</view>
				<view class="category-source__name line1">{{ categoryName }}</view>
			</view>
			<template v-if="goodsList.length">
				<view
					v-for="(item, index) in goodsList"
					:key="index"
					:class="['merchant-card', index === 0 && !categoryName ? 'merchant-card--first' : '']"
					@tap="goResultDetail(item)"
				>
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
							<view class="merchant-card__time-icon"></view>
							<text>营业时间：{{ getGoodsTime(item) }}</text>
						</view>
						<view class="merchant-card__distance">{{ getGoodsDistance(item) }}</view>
					</view>
				</view>
			</template>
			<view v-if="showSearchFooter" class="search-footer">
				<view v-if="footerStatus === 'loading'" class="search-footer__text">加载中...</view>
				<view v-else-if="footerStatus === 'error'" class="search-footer__text" @tap="onRefresh">加载失败，点击重新加载</view>
				<view v-else-if="footerStatus === 'empty'" class="empty-slot">
					<u-empty
						mode="search"
						text="暂无数据"
						:icon-size="220"
						:font-size="56"
						color="#666666"
					></u-empty>
				</view>
				<view v-else class="search-footer__text">我可是有底线的～</view>
			</view>
		</scroll-view>
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
						<view :class="['filter-chip', sortType === 'SALES_DESC' ? 'active' : '']" @tap="sortType = 'SALES_DESC'">销量高到低</view>
						<view :class="['filter-chip', sortType === 'SALES_ASC' ? 'active' : '']" @tap="sortType = 'SALES_ASC'">销量低到高</view>
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
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
import UEmpty from '@/bundle/components/uview-ui/components/u-empty/u-empty.vue'

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
				sortType: '',
				categoryName: '',
				fromCategory: false,
			};
		},

		components: {
			UIcon,
			UEmpty
		},
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
			showSearchFooter() {
				return !this.goodsList.length || this.status === loadingType.LOADING || this.status === loadingType.ERROR
			},
			footerStatus() {
				if (!this.goodsList.length && this.status === loadingType.FINISHED) return loadingType.EMPTY
				return this.goodsList.length ? loadingType.FINISHED : this.status
			},
			comprehensive() {
				const {
					priceSort,
					saleSort
				} = this
				if (priceSort == '' && saleSort == '') {
					return true;
				}

				return false;
			},
			priceSortLabel() {
				if (this.priceSort === 'asc') return '价格升序'
				if (this.priceSort === 'desc') return '价格降序'
				return '价格'
			},
			saleSortLabel() {
				if (this.saleSort === 'asc') return '销量升序'
				if (this.saleSort === 'desc') return '销量降序'
				return '销量'
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
				return item.name || item.goods_name || item.shop_name || ''
			},
			getGoodsImage(item) {
				return resolveImage(item.image || item.goods_image || item.cover, 'goods')
			},
			getGoodsScore(item) {
				const score = item.shopScore ?? item.shop_score ?? item.score ?? item.star ?? item.rating
				if (score === '' || score === null || score === undefined) return '暂无评分'
				const value = Number(score)
				return Number.isNaN(value) ? String(score) : value.toFixed(1)
			},
			getGoodsTime(item) {
				return item.business_time || item.time_desc || ''
			},
			getGoodsDistance(item) {
				return item.distance_desc || item.distance || ''
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
				this.priceSort = ''
				this.saleSort = ''
			},
			applyFilter() {
				this.syncSortState()
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
				this.sortType = ''
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
				this.sortType = this.saleSort === 'asc' ? 'SALES_ASC' : 'SALES_DESC'
				this.onSearch();
			},
			syncSortState() {
				const sortType = String(this.sortType || '').toUpperCase()
				this.priceSort = sortType === 'PRICE_ASC' ? 'asc' : (sortType === 'PRICE_DESC' ? 'desc' : '')
				this.saleSort = sortType === 'SALES_ASC' ? 'asc' : (sortType === 'SALES_DESC' ? 'desc' : '')
				this.sortType = sortType
			},

			init(option) {
				let {
					id,
					name,
					type,
					keyword,
					from
				} = option;
				this.type = type;
				this.keyword = keyword ? decodeURIComponent(keyword) : '';
				this.categoryName = name ? decodeURIComponent(name) : '';
				this.fromCategory = from === 'category' || type == 1;
				if (id) {
					uni.setNavigationBarTitle({
						title: this.categoryName || '分类商品'
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
					category_id: this.type == 1 || this.fromCategory ? this.id : '',
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
		height: 100vh;
		padding-top: calc(var(--status-bar-height) + 359rpx);
		box-sizing: border-box;
		overflow: hidden;
		min-height: 100vh;
		background: #fffaf5;

		.search-top {
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			z-index: 30;
			height: calc(var(--status-bar-height) + 359rpx);
			background:
				linear-gradient(180deg, rgba(188, 209, 243, 0.9) 0%, rgba(232, 239, 252, 0.74) 42%, rgba(255, 250, 245, 0.96) 100%),
				#bcd1f3;
			box-sizing: border-box;
		}

		.search-nav {
			position: relative;
			display: flex;
			align-items: center;
			height: 97rpx;
			padding: calc(var(--status-bar-height) + 23rpx) 0 0;
			box-sizing: content-box;
		}

		.search-nav__back {
			position: relative;
			flex: none;
			width: 40rpx;
			height: 97rpx;
			margin-left: 24rpx;
			color: #222222;
		}

		.search-nav__back::after {
			content: '';
			position: absolute;
			left: 0;
			top: 46rpx;
			width: 19rpx;
			height: 19rpx;
			border-left: 4rpx solid currentColor;
			border-bottom: 4rpx solid currentColor;
			transform: rotate(45deg);
		}

			.search-nav__title {
				position: absolute;
				left: 50%;
				top: calc(var(--status-bar-height) + 62rpx);
				max-width: calc(100% - 260rpx);
				color: #222222;
				font-size: 36rpx;
				font-weight: 500;
				line-height: 36rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				transform: translateX(-50%);
			}

		.search-nav__capsule {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: none;
				width: 168rpx;
				height: 64rpx;
				margin: 22rpx 24rpx 0 auto;
				border: 1rpx solid transparent;
				border-radius: 32rpx;
				background: transparent;
				box-sizing: border-box;
				opacity: 0;
			}

		.search-nav__capsule-dot {
			width: 8rpx;
			height: 8rpx;
			margin-right: 8rpx;
			border-radius: 50%;
			background: #222222;
			box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
		}

		.search-nav__capsule-divider {
			width: 1rpx;
			height: 36rpx;
			margin: 0 22rpx 0 42rpx;
			background: rgba(34, 34, 34, .18);
		}

		.search-nav__capsule-circle {
			width: 34rpx;
			height: 34rpx;
			border: 4rpx solid #222222;
			border-radius: 50%;
			box-sizing: border-box;
		}

		.search-box {
			padding: 16rpx 24rpx 0;
		}

		.search-input-wrap {
			display: flex;
			align-items: center;
			width: 100%;
			height: 65rpx;
			padding: 0 28rpx 0 39rpx;
			box-sizing: border-box;
			background: #ffffff;
			border: 2rpx solid #ffffff;
			border-radius: 32rpx 32rpx 32rpx 0;
			box-shadow: none;
		}

		.search-input {
			flex: 1;
			min-width: 0;
			height: 65rpx;
			color: #222222;
			font-size: 22rpx;
			font-weight: 400;
		}

		.search-input__placeholder {
			color: #b7b7b7;
			font-size: 22rpx;
			font-weight: 400;
		}

		.search-submit {
			position: relative;
			flex: none;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 34rpx;
			height: 34rpx;
			margin-left: 24rpx;
		}

		.search-submit::before {
			content: '';
			position: absolute;
			left: 2rpx;
			top: 2rpx;
			width: 20rpx;
			height: 20rpx;
			border: 4rpx solid #222222;
			border-radius: 50%;
			box-sizing: border-box;
		}

		.search-submit::after {
			content: '';
			position: absolute;
			right: 3rpx;
			bottom: 4rpx;
			width: 14rpx;
			height: 4rpx;
			background: #222222;
			border-radius: 2rpx;
			transform: rotate(45deg);
		}

		.filter-bar {
			position: fixed;
			left: 0;
			right: 0;
			top: calc(var(--status-bar-height) + 283rpx);
			z-index: 29;
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 76rpx;
			padding: 0 22rpx 50rpx;
			background: transparent;
			box-sizing: border-box;
		}

		.filter-item {
			display: flex;
			align-items: center;
			font-size: 26rpx;
			font-weight: 500;
			color: #222222;

			.u-icon {
				margin-left: 8rpx;
			}
		}

		.is-active {
			color: #a0610d;
		}

		.history-panel {
			height: calc(100vh - var(--status-bar-height) - 359rpx);
			padding: 24rpx;
			box-sizing: border-box;
			overflow-y: auto;
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
			height: calc(100vh - var(--status-bar-height) - 359rpx);
			padding: 0 24rpx 40rpx;
			box-sizing: border-box;
		}

		.category-source {
			display: flex;
			align-items: center;
			margin-bottom: 18rpx;
			padding: 18rpx 22rpx;
			border-radius: 18rpx;
			background: #ffffff;
			box-shadow: 0 8rpx 20rpx rgba(52, 72, 109, 0.04);
		}

		.category-source__label {
			flex: none;
			padding: 0 14rpx;
			color: #a0610d;
			font-size: 22rpx;
			line-height: 38rpx;
			border-radius: 20rpx;
			background: #fff2df;
		}

		.category-source__name {
			flex: 1;
			min-width: 0;
			margin-left: 14rpx;
			color: #222222;
			font-size: 28rpx;
			font-weight: 600;
			line-height: 40rpx;
		}

		.merchant-card {
			display: flex;
			align-items: stretch;
			width: 100%;
			min-height: 226rpx;
			padding: 18rpx 18rpx 19rpx;
			margin-bottom: 26rpx;
			background: #fffaf5;
			border-radius: 15rpx;
			box-shadow: none;
			box-sizing: border-box;
		}

		.merchant-card--first {
			margin-top: -14rpx;
		}

		.category-source + .merchant-card {
			margin-top: -14rpx;
		}

		.merchant-card__image {
			flex: none;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 189rpx;
			height: 189rpx;
			border-radius: 10rpx;
			background: #fff7f1;
		}

		.merchant-card__content {
			flex: 1;
			min-width: 0;
			padding: 10rpx 0 0 29rpx;
		}

		.merchant-card__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.merchant-card__title {
			font-size: 30rpx;
			font-weight: 500;
			color: #222222;
			line-height: 40rpx;
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
			margin-top: 17rpx;
		}

		.stars {
			font-size: 24rpx;
			color: #ff6d2d;
			letter-spacing: 0;
		}

		.score {
			margin-left: 10rpx;
			font-size: 24rpx;
			color: #ff6d2d;
		}

		.merchant-card__meta {
			display: flex;
			align-items: center;
			margin-top: 46rpx;
			font-size: 26rpx;
			color: #777777;

			text {
				margin-left: 10rpx;
			}
		}

		.merchant-card__time-icon {
			flex: none;
			position: relative;
			width: 28rpx;
			height: 28rpx;
			border: 3rpx solid #9aa0a6;
			border-radius: 50%;
			box-sizing: border-box;
		}

		.merchant-card__time-icon::before {
			content: '';
			position: absolute;
			left: 10rpx;
			top: 5rpx;
			width: 3rpx;
			height: 9rpx;
			background: #9aa0a6;
			border-radius: 3rpx;
		}

		.merchant-card__time-icon::after {
			content: '';
			position: absolute;
			left: 11rpx;
			top: 12rpx;
			width: 8rpx;
			height: 3rpx;
			background: #9aa0a6;
			border-radius: 3rpx;
			transform: rotate(25deg);
			transform-origin: left center;
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
			background: #fff8ed;
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
			background: #fff8ed;
			font-size: 26rpx;
			color: #4b5565;
		}

		.filter-chip.active {
			background: #fff2df;
			color: #a0610d;
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
			background: #fff8ed;
			color: #4b5565;
		}

		.filter-action.confirm {
			background: #a0610d;
			color: #ffffff;
		}
	}
</style>
