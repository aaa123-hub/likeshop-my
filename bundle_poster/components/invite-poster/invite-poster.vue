<template>
	<view>
		<image v-if="posterImage" class="poster-preview" :src="posterImage" mode="widthFix"></image>
		<view v-else class="poster-empty">暂无邀请海报</view>
	</view>
</template>

<script>
export default {
	name: 'share-poster',
	props: {
		config: {
			type: Object,
			default: () => ({})
		},
		goodsId: {
			type: [Number, String],
			default: ''
		},
		qrcode: {
			type: String,
			default: ''
		}
	},
	computed: {
		posterImage() {
			return this.config.poster || this.config.qrCode || this.qrcode || ''
		}
	},
	watch: {
		posterImage: {
			immediate: true,
			handler(value) {
				if (value) this.$emit('success', value)
			}
		}
	}
}
</script>

<style>
.poster-preview {
	width: 600rpx;
}

.poster-empty {
	width: 600rpx;
	min-height: 720rpx;
	border-radius: 20rpx;
	background: #f7f7f7;
	color: #999;
	font-size: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
