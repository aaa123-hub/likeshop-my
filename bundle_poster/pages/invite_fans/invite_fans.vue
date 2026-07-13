<template>
	<view class="pages">
		<view class="invite-fans column column-center">
			<image v-if="path" :src="path" mode="widthFix" class="poster"></image>
			<view v-else-if="!loading" class="poster-empty">暂无邀请海报</view>
			<!-- #ifndef MP-WEIXIN -->
			<invite-poster v-if="showPoster" :config="{
				avatar: userInfo.avatar,
				nickname: userInfo.nickname,
				code:inviteCode,
				link: link,
				qrCode: qrCode,
				poster: poster
			}" @success="handleSuccess" />
			<!-- #endif -->
			<view class="bg-white footer flex1">
				<view class="" style="margin-bottom: 40rpx;">
					<view class="mb10 sm lighter">我的邀请码</view>
					<view class="row row-between">
						<view class="font-size-44">{{inviteCode}}</view>
						<view class="sm mr30 copy-btn" @tap="$copy(inviteCode || '')">点击复制</view>
					</view>
				</view>
				<!-- #ifndef H5  -->
				<button class="save-btn br60" size="lg" @tap="saveImageToAlbum">保存到相册</button>
				<!-- #endif -->
				<!-- #ifdef H5 -->
				<button class="save-btn br60" size="lg">长按保存到相册</button>
				<!-- #endif -->
			</view>
		</view>
		<loading-view v-show="loading"></loading-view>
	</view>
</template>

<script>
// #ifndef MP-WEIXIN
import InvitePoster from '@/bundle_poster/components/invite-poster/invite-poster.vue'
// #endif
import {
	// apiMnpQrCode,
	getShareMnQrcode
} from '@/api/app'
import {
	baseURL,
	basePath
} from '@/config/app'
import { apiDistributionPoster } from '@/api/user'
import { mapGetters } from 'vuex'

export default {
	components: {
		// #ifndef MP-WEIXIN
		InvitePoster
		// #endif
	},
	data() {
		return {
			path: '',
			qrCode: '',
			loading: true,
			showPoster: false,
			poster: ''
		}
	},

	async onLoad() {
		await this.getPoster()
		// #ifdef MP-WEIXIN
		this.getMnpQrCode()
		// #endif

		// #ifdef APP-PLUS || H5
		this.showPoster = true
		// #endif
	},

	methods: {
		async getPoster() {
			const res = await apiDistributionPoster()
			this.poster = res.code == 1 ? (res.data && res.data.poster) || '' : ''
		},
		getMnpQrCode() {
			// apiMnpQrCode().then(res => {
			// 	this.qrCode = res.qr_code
			// 	this.showPoster = true
			// })

			getShareMnQrcode({
				id: '',  // 商品id或其他活动id
				url: 'pages/index/index', // 跳转页面路径
				type: 0,         // 0-会员分享海报 1-商品详情 2-砍价活动
			})
				.then((res) => {
					const data = res && res.data ? res.data : {}
					const qrCode = data.qr_code || data.qrCode || data.qrcode || data.qrcodeUrl || ''
					const posterImage = data.posterUrl || data.poster_url || data.poster || data.imageUrl || data.image || ''
					this.qrCode = qrCode
					this.path = posterImage || this.poster || qrCode
					this.showPoster = false
					this.loading = false
				})
				.catch(() => {
					this.path = this.poster || ''
					this.loading = false
				})
		},
		saveImageToAlbum() {
			// #ifndef H5
			if (!this.path) {
				this.$toast({
					title: '暂无可保存图片'
				})
				return
			}
			const saveFile = (filePath) => {
				uni.saveImageToPhotosAlbum({
					filePath,
					success: res => {
						this.$toast({
							title: "保存成功"
						});
					},
					fail: err => {
						this.$toast({
							title: '保存失败'
						});
					}
				});
			}
			if (/^https?:\/\//.test(this.path)) {
				uni.downloadFile({
					url: this.path,
					success: (res) => {
						if (res.statusCode === 200 && res.tempFilePath) {
							saveFile(res.tempFilePath)
							return
						}
						this.$toast({
							title: '下载失败'
						})
					},
					fail: () => {
						this.$toast({
							title: '下载失败'
						})
					}
				})
				return
			}
			saveFile(this.path)
			// #endif
			// #ifdef H5
			this.$toast({
				title: '请长按图片保存'
			})
			// #endif
		},
		handleSuccess(val) {
			this.path = val
			this.loading = false
		}
		},
		computed: {
			...mapGetters(['inviteCode','userInfo']),

			link() {
				return `${baseURL}${basePath}?invite_code=${this.inviteCode}`
			}
		}
	};
</script>
<style lang="scss">
	page {
		padding: 0
	}

	.invite-fans {
		min-height: 100vh;
		overflow: hidden;

		.poster {
			width: 600rpx;
			margin: 40rpx 0;
		}

		.poster-empty {
			width: 600rpx;
			min-height: 720rpx;
			margin: 40rpx 0;
			border-radius: 20rpx;
			background: #f7f7f7;
			color: #999;
			font-size: 28rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.footer {
			padding: 30rpx;
			width: 100%;
		}

		.copy-btn {
			color: $color-primary;
		}

		.save-btn {
			color: #fff;
			background-color: $color-primary;
		}
	}
</style>
