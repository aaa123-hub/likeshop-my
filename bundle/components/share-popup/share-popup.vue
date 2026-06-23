<template>
	<view class="">
		<view class="share-popup" v-model="showshare" mode="center" border-radius="24" :closeable="true"
			:safe-area-inset-bottom="true" :mask-close-able="false">
			<view class="share-card">
				<view class="share-card__title">商品二维码</view>
				<view class="share-card__goods">
					<image class="share-card__image" :src="config.image" mode="aspectFill"></image>
					<view class="share-card__info">
						<view class="share-card__name">{{ config.name || '商品详情' }}</view>
						<view class="share-card__price">¥{{ config.price || '0.00' }}</view>
						<view v-if="config.marketPrice" class="share-card__market">原价 ¥{{ config.marketPrice }}</view>
					</view>
				</view>
				<view class="share-card__qr-wrap">
					<image v-if="isQrcodeImage" class="share-card__qr" :src="mnpQrcode" mode="aspectFit"></image>
					<tki-qrcode v-else-if="mnpQrcode" cid="goods-share-qrcode" :val="mnpQrcode" :size="282" unit="upx" :showLoading="false" />
					<view v-else class="share-card__qr-loading">二维码生成中</view>
				</view>
				<view class="share-card__tip">长按识别二维码查看商品</view>
				<view class="share-card__actions">
					<view class="share-card__action" @tap="getPoster">生成海报</view>
				<!-- #ifdef MP-WEIXIN-->
				<button open-type="share" class="share-card__action share-card__action--primary" hover-class="none" @tap="closeSharePopup">
					微信好友
				</button>
				<!-- #endif -->
				<!-- #ifdef H5 || APP-PLUS -->
				<view class="share-card__action share-card__action--primary" @tap="shareWx">
					微信好友
				</view>
				<!-- #endif -->
				</view>
			</view>
		</view>
		<view class="share-poster" v-model="showPoster" mode="center" :closeable="true"
			:safe-area-inset-bottom="true">
			<!-- #ifndef H5 -->
			<image style="width: 640rpx;" mode="widthFix" :src="poster"></image>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<img style="width: 640rpx;" :src="poster" />
			<!-- #endif -->
			<button class="row row-center save-btn" size="lg" @tap="savePoster">
				<!-- #ifndef H5 -->
				保存图片到相册
				<!-- #endif -->
				<!-- #ifdef H5 -->
				长按保存图片到相册
				<!-- #endif -->
			</button>
		</view>
		<!-- #ifdef H5 -->
		<view :custom-style="{'background': 'none'}"  class="share-tips" v-model="showTips" mode="top">
			<view style="overflow: hidden;">
				<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/share_arrow.png" class="share-arrow" />
				<view class="white" style="text-align: center;margin-top: 280rpx;">
					<view class="bold lg">立即分享给好友吧</view>
					<view class="sm m-t-10">点击屏幕右上角将本页面分享给好友</view>
				</view>
			</view>
		</view>
		<!-- #endif -->
		<poster v-if="enablePoster" :type="type" :share-id="shareId" :config="config"
			:qrcode="mnpQrcode" :link="getLink" @success="handleSuccess" @fail="handleFail"
			:b-share-title="bargainShare.share_title" :b-share-intro="bargainShare.share_intro"/>
	</view>
</template>

<script>
	import {
		mapGetters,
	} from 'vuex'
	import {
		// apiMnpQrCode,
		getShareMnQrcode
	} from "@/api/app"
	import {
		baseURL,
		basePath
	} from '@/config/app'
	import poster from './poster.vue'
	import TkiQrcode from '@/bundle/components/tki-qrcode/tki-qrcode.vue'
	// import {TtAppNameEnum} from '@/utils/enum'
	export default {
		components: {
			poster,
			TkiQrcode
		},
		props: {
			value: {
				type: Boolean     // 是否开启此弹窗
			},
			shareId: {
				type: [String, Number],  // 商品id或其他活动id
				default: ''
			},
			config: {                    // 各种配置
				type: Object,
				default: () => ({})
			},
			pagePath: {                  // 跳转路径
				type: String,
				default: ''
			},
			type: {                      // 生成海报需使用 0-会员分享海报 1-商品详情 2-砍价活动
				type: [String, Number],
				default: 1
			}
		},
		data() {
			return {
				poster: "",
				enablePoster: false,
				showPoster: false,
				showTips: false,
				mnpQrcode: '',
				qrcodeIsImage: false,
				bargainShare: { // 砍价分享title和intro
					share_title: '',
					share_intro: '',
				},
			};
		},
		computed: {
			getLink() {
				return `${baseURL}${basePath}/${this.pagePath}?id=${this.shareId}&invite_code=${this.$store.getters.inviteCode}`
			},
			isQrcodeImage() {
				return this.qrcodeIsImage
			},
			showshare: {
				get() {
					return this.value
				},
				set(val) {
					this.$emit('input', val)
				}
			}
		},
		watch: {
			showshare(val) {
				if (val) this.prepareQrcode()
			},
			showPoster(val) {
				if (!val) {
					this.enablePoster = false
				}
			}
		},
		methods: {
			async prepareQrcode() {
				if (this.mnpQrcode) return
				const res = await this.getMnpQrcode()
				const qrCode = res && res.data && (res.data.qr_code || res.data.qrCode || res.data.qrcode || res.data.image || res.data.url)
				this.setQrcodeValue(qrCode)
			},
			setQrcodeValue(qrCode) {
				if (qrCode) {
					this.mnpQrcode = String(qrCode).replace(/\r\n/g, "")
					this.qrcodeIsImage = true
					return
				}
				this.mnpQrcode = this.getLink
				this.qrcodeIsImage = false
			},
			async getPoster() {
				if (!this.isLogin) {
					return uni.navigateTo({
						url: '/bundle/pages/login/login'
					});
				}
				uni.showLoading({
					title: '正在生成中'
				})
				// #ifdef MP-WEIXIN
				if (!this.mnpQrcode) {
					const res = await this.getMnpQrcode()
					const qrCode = res && res.data && (res.data.qr_code || res.data.qrCode || res.data.qrcode || res.data.image || res.data.url)
					this.setQrcodeValue(qrCode)
					if(this.type == 2 && res.data) this.bargainShare = res.data.extra
				}
				this.enablePoster = true
				// #endif

				// #ifdef APP-PLUS || H5
				this.enablePoster = true
				// #endif
			},
			// 获取商品页面二维码数据
			getMnpQrcode() {
				return new Promise((resolve, reject) => {
					getShareMnQrcode({
						id: this.shareId,  // 商品id或其他活动id
						url: this.pagePath, // 跳转页面路径
						type: this.type,         // 0-会员分享海报 1-商品详情 2-砍价活动
					}).then((res) => {
						console.log('shareRes', res)
						resolve(res)
				}).catch(() => {
					resolve({ code: 1, data: {} })
				})
				})
				// return new Promise((resolve, reject) => {
				// 	resolve({qr_code: 'https://likeshop.yixiangonline.com/uploads/images/background/20201209/17ca8666f3122f0ea83801a7c333b58f.png'})
				// })
			},

			handleSuccess(val) {
				this.poster = val
				uni.hideLoading()
				this.showPoster = true
				this.showshare = false
			},
			handleFail() {
				uni.hideLoading({
					success: () => {
						this.$toast({
							title: '生成失败'
						})
					}
				})
			},
			shareWx() {
				// #ifdef H5
				this.showTips = true
				this.showshare = false
				// #endif
				// #ifdef APP-PLUS
				uni.share({
					provider: "weixin",
					scene: "WXSceneSession",
					type: 0,
					href: this.getLink,
					title: this.config.name,
					summary: '',
					imageUrl: this.config.image,
					success: (res) => {
						console.log('分享成功');
						this.showshare = false
					},
					fail: (err) => {
						this.$toast({
							title: err.errMsg
						})
					}
				});
				// #endif
			},
			closeSharePopup() {
				this.showshare = false
			},

			async savePoster() {
				uni.saveImageToPhotosAlbum({
					filePath: this.poster,
					success: res => {
						this.showPoster = false
						this.$toast({
							title: '保存成功',
							icon: 'success'
						});
					},
					fail: (err) => {
						this.$toast({
							title: '保存失败'
						});
						console.log(err)
					}
				})

			}
		}
	}
</script>

<style lang="scss">
	.share-popup {
		.share-card {
			width: 620rpx;
			padding: 34rpx 30rpx 30rpx;
			background: #ffffff;
			border-radius: 24rpx;
			box-sizing: border-box;
		}

		.share-card__title {
			color: #101010;
			font-size: 32rpx;
			font-weight: 600;
			text-align: center;
		}

		.share-card__goods {
			display: flex;
			align-items: center;
			margin-top: 30rpx;
			padding: 18rpx;
			background: #f7f8fb;
			border-radius: 18rpx;
		}

		.share-card__image {
			flex: none;
			width: 128rpx;
			height: 128rpx;
			border-radius: 14rpx;
			background: #edf1f5;
		}

		.share-card__info {
			min-width: 0;
			margin-left: 18rpx;
		}

		.share-card__name {
			color: #222222;
			font-size: 28rpx;
			font-weight: 500;
			line-height: 38rpx;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.share-card__price {
			margin-top: 12rpx;
			color: #ff2c3c;
			font-size: 34rpx;
			font-weight: 700;
		}

		.share-card__market {
			margin-top: 4rpx;
			color: #999999;
			font-size: 22rpx;
			text-decoration: line-through;
		}

		.share-card__qr-wrap {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 320rpx;
			height: 320rpx;
			margin: 34rpx auto 0;
			background: #ffffff;
			border: 2rpx solid #eef1f6;
			border-radius: 20rpx;
		}

		.share-card__qr {
			width: 282rpx;
			height: 282rpx;
		}

		.share-card__qr-loading {
			color: #999999;
			font-size: 24rpx;
		}

		.share-card__tip {
			margin-top: 18rpx;
			color: #7a7a7a;
			font-size: 24rpx;
			text-align: center;
		}

		.share-card__actions {
			display: flex;
			align-items: center;
			margin-top: 30rpx;
		}

		.share-card__action {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			height: 76rpx;
			margin: 0 8rpx;
			padding: 0;
			color: #037dfa;
			font-size: 26rpx;
			line-height: 76rpx;
			background: #eef7ff;
			border: 0;
			border-radius: 38rpx;
		}

		.share-card__action--primary {
			color: #ffffff;
			background: #037dfa;
		}

		.share-card__action::after {
			border: 0;
		}
	}

	.share-poster {
		.share-img {
			width: 640rpx;
			border-radius: 12rpx;
		}

		.save-btn {
			// @include background_color();
			background-color: $color-primary;
			color: #fff;
			margin-top: 20rpx;
		}
	}

	.share-tips .share-arrow {
		width: 140rpx;
		height: 250rpx;
		float: right;
		margin: 15rpx 31rpx 0 0;
	}
</style>
