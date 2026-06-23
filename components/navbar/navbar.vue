<template>
	<view class="navbar">
		<u-navbar :background="background" :title="title" :title-color="titleColor" :border-bottom="borderBottom"
			:immersive="immersive" :title-bold="true" :is-back="false">
			<view class="navbar-left" slot="left">
				<u-icon :name="backIcon" :size="36" @click="goBack"></u-icon>
			</view>
		</u-navbar>
	</view>
</template>

<script>
	export default {
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
				if (!this.isIndex) {
					uni.navigateBack()
					return
				}
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		},
		computed: {
			backIcon() {
				const iconName = this.isIndex ? 'icon_home' : 'icon_back'
				return `https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/${iconName}.png`
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
	}
</style>
