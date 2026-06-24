<template>
	<view class="navbar">
		<u-navbar :background="background" :title="title" :title-color="titleColor" :border-bottom="borderBottom"
			:immersive="immersive" :title-bold="true" :is-back="false">
			<view class="navbar-left" slot="left">
				<view :class="['navbar-back-icon', isHome ? 'is-home' : 'is-back']" @tap="goBack"></view>
			</view>
		</u-navbar>
	</view>
</template>

<script>
	import UNavbar from '@/bundle_shared_components/components/uview-ui/components/u-navbar/u-navbar.vue'
	import UIcon from '@/bundle_shared_components/components/uview-ui/components/u-icon/u-icon.vue'

	export default {
		components: {
			UNavbar,
			UIcon
		},
		props: {
			// 导航内容
			title: String,
			titleColor: {
				type: String,
				default: '#000000'
			},
			// 导航的背景颜色
			background: {
				type: Object,
				default: () => ({
					background: '#ffffff'
				})
			},
			// 是否显示底部边框
			borderBottom: {
				type: Boolean,
				default: false
			},
			immersive: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isIndex: false
			};
		},
		methods: {
			goBack() {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack()
					return
				}
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		},
		computed: {
			isHome() {
				const pages = getCurrentPages()
				return this.isIndex || pages.length <= 1
			}
		},
		created() {
			setTimeout(() => {
				let pages = getCurrentPages();
				if (pages.length == 1) {
					this.isIndex = true
				}
			})

		}
	}
</script>

<style lang="scss">
	.navbar {
		.navbar-left {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 64rpx;
			height: 64rpx;
		}

		.navbar-back-icon {
			position: relative;
			width: 48rpx;
			height: 48rpx;
			color: #222222;
		}

		.navbar-back-icon.is-back::before {
			content: '';
			position: absolute;
			left: 16rpx;
			top: 12rpx;
			width: 20rpx;
			height: 20rpx;
			border-left: 4rpx solid currentColor;
			border-bottom: 4rpx solid currentColor;
			transform: rotate(45deg);
		}

		.navbar-back-icon.is-home::before {
			content: '';
			position: absolute;
			left: 8rpx;
			top: 18rpx;
			width: 30rpx;
			height: 24rpx;
			border: 4rpx solid currentColor;
			border-top: 0;
			border-radius: 3rpx;
			box-sizing: border-box;
		}

		.navbar-back-icon.is-home::after {
			content: '';
			position: absolute;
			left: 11rpx;
			top: 8rpx;
			width: 24rpx;
			height: 24rpx;
			border-left: 4rpx solid currentColor;
			border-top: 4rpx solid currentColor;
			transform: rotate(45deg);
			box-sizing: border-box;
		}
	}
</style>
