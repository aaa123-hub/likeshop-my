<template>
	<view class="goods-details">
		<navbar title="商品详情" :background="{background: `rgba(256,256,256,${percent})`}" :titleColor="`rgba(0,0,0,${percent})`" :immersive="true"></navbar>
		<!-- #ifdef H5 -->
		<download-nav v-if="showDownload" :top="44"></download-nav>
		<!-- #endif -->
		<loading-view v-if="isFirstLoading"></loading-view>
		<view class="contain" v-if="!isNull">
			<bubble-tips top="180rpx"></bubble-tips>
			<view class="hero-stage">
				<product-swiper :imgUrls="swiperList" :video="goodsDetail.video"></product-swiper>
			</view>
			<!-- 秒杀 -->
			<view class="seckill row-between" v-if="goodsType == 1">
				<view class="price row">
					<view class="row white info">
						<view style="align-items: baseline;" class="row ml20">
							<view class="mr10">秒杀价</view>
							<price-format :first-size="46" :second-size="32" :subscript-size="32"
								:price="goodsDetail.min_price" :weight="500"></price-format>
							<template v-if="goodsDetail.min_price != goodsDetail.max_price">
								<text style="font-size: 46rpx;">-</text>
								<price-format :first-size="46" :second-size="32" :subscript-size="32"
									:show-subscript="false" :price="goodsDetail.max_price" :weight="500"></price-format>
							</template>
							<view class="ml10">
								<price-format :subscript-size="30" :line-through="true" :first-size="30"
									:second-size="30" :price="goodsDetail.market_price">
								</price-format>
							</view>
						</view>
					</view>
				</view>
				<view class="down column-center">
					<view class="xxs primary mb10">距活动结束仅剩</view>
					<u-count-down :timestamp="countTime" @end="getGoodsDetailFun" color="#fff" bg-color="#FF2C3C"
						separator-color="#FF2C3C" font-size="24" height="36" separator-size="26"></u-count-down>
				</view>
			</view>
			<!-- 拼团 -->
			<view class="group" v-show="goodsType == 2">
				<view class="row info" style="height: 100%">
					<view class="row-between ml20 white" style="flex: 1;">
						<view style="align-items: baseline;" class="row">
							<view class="mr10">拼团价</view>
							<price-format :subscript-size="32" :first-size="46" :second-size="32"
								:price="team.team_min_price" :weight="500"></price-format>
							<text class="xs">起</text>
						</view>
						<view class="mr20 row group-num">
							<view class="group-icon">
								<image src="/static/images/icon_group.png" class="icon-sm"></image>
							</view>
							<view class="xxs ml10 mr10">{{ team.people_num }}人团</view>
						</view>
					</view>
					<view class="down column-center">
						<view class="xxs primary mb10">距活动结束仅剩</view>
						<u-count-down :timestamp="countTime" color="#fff" bg-color="#FF2C3C" separator-color="#FF2C3C"
							font-size="24" height="36" separator-size="26" @end="getGoodsDetailFun"></u-count-down>
					</view>
				</view>
			</view>
			<view class="merchant-card">
				<view class="merchant-card__head">
					<view class="merchant-card__shop">
						<view class="merchant-card__avatar"></view>
						<view class="merchant-card__name line1">{{ goodsDetail.shop_name || '萨洛蒙官方旗舰店' }}</view>
						<u-icon name="arrow-right" size="22" color="#ffffff"></u-icon>
					</view>
					<view class="merchant-card__follow">+订阅</view>
				</view>
				<view class="merchant-card__body">
					<view class="merchant-card__price-row row-between">
						<view class="merchant-card__price">
							<price-format :first-size="46" :second-size="32" :subscript-size="32"
								:price="goodsType == 2 ? (team.team_min_price || goodsDetail.min_price) : goodsDetail.min_price"
								:weight="500"></price-format>
							<text class="merchant-card__price-tag">{{ goodsType == 2 ? '拼团价' : '到手价' }}</text>
						</view>
						<view class="merchant-card__share" @tap="showShareBtn = true">
							<u-icon name="share-fill" size="28" color="#ffffff"></u-icon>
							<text>分享</text>
						</view>
					</view>
					<view class="merchant-card__title">{{ goodsDetail.name }}</view>
					<view class="merchant-card__sales">{{ goodsDetail.sales_sum || 0 }}人抢购</view>
				</view>
			</view>
			<view class="option-panel bg-white">
				<view class="option-panel__thumbs">
					<view class="option-panel__menu">
						<u-icon name="grid-fill" size="40" color="#222222"></u-icon>
					</view>
					<image
						v-for="(item, index) in previewImages"
						:key="index"
						:class="['option-panel__thumb', index === 0 ? 'is-active' : '']"
						:src="item"
						mode="aspectFill"
					></image>
					<view class="option-panel__count">
						<text>共{{ swiperList.length || 0 }}款</text>
						<u-icon name="arrow-right" size="20" color="#999999"></u-icon>
					</view>
				</view>
				<view class="option-panel__line"></view>
				<view class="option-row">
					<u-icon name="car" size="36" color="#222222"></u-icon>
					<text class="option-row__text">免运费</text>
				</view>
				<view class="option-panel__line"></view>
				<view class="option-row option-row--between" @tap="showCouponFun">
					<view class="option-row__left">
						<u-icon name="coupon-fill" size="36" color="#222222"></u-icon>
						<view class="coupon-badge">{{ primaryCouponText }}</view>
					</view>
					<view class="option-row__action">
						<text>{{ couponList.length ? '立即领取' : '查看优惠' }}</text>
						<u-icon name="arrow-right" size="20" color="#222222"></u-icon>
					</view>
				</view>
			</view>
			<view class="group-play bg-white mt20" v-if="goodsType == 2">
				<view class="title">拼团玩法</view>
				<view class="steps row">
					<view class="row step">
						<view class="number xxs">1</view>
						<view class="sm">开团/参团</view>
					</view>
					<view class="line"></view>
					<view class="row step">
						<view class="number xxs">2</view>
						<view class="sm">团满即成新团</view>
					</view>
					<view class="line"></view>
					<view class="row step">
						<view class="number xxs">3</view>
						<view class="sm">满员发货</view>
					</view>
				</view>
			</view>
			<view class="discount mt20 bg-white" v-if="false && (couponList.length || goodsDetail.order_give_integral)">
				<view class="row" style="align-items: flex-start;">
					<view class="text muted">优惠</view>
					<view style="flex: 1">
						<view :class="['row coupons', {mb30: goodsDetail.order_give_integral > 0}]"
							v-if="couponList.length" @tap="showCouponFun">
							<view class="flexnone">
								<u-tag text="领券" size="mini" type="primary" mode="plain" />
							</view>
							<view class="con row ml20" style="flex: 1">
								<view v-for="(item, index) in couponList" :key="index" class="coupons-item  mr20">
									<view v-if="index < 2" class="row xs">
										<view class="line1">
											{{ item.use_condition }}
										</view>
									</view>
								</view>
							</view>
							<image class="icon-sm" src="/static/images/arrow_right.png"></image>
						</view>
						<view class="row integral" style="align-items: flex-start;"
							v-if="goodsDetail.order_give_integral">
							<view class="flexnone">
								<u-tag text="积分" size="mini" type="primary" mode="plain" />
							</view>
							<view class="ml20">下单最多可获得{{goodsDetail.order_give_integral}}积分</view>
						</view>
					</view>
				</view>
			</view>
			<swiper v-if="teamFound.length" class="mt20 bg-white" autoplay="true" style="height: 240rpx;"
				vertical="true" circular="true" :interval="5000">
				<swiper-item v-for="(sitem, index) in teamFound" :key="index">
					<view class="group-list">
						<view v-for="(item, index2) in sitem" :key="index2" class="group-item bg-white row-between">
							<view class="row" style="max-width: 280rpx;">
								<custom-image :src="item.avatar" width="80rpx" height="80rpx" radius="50%">
								</custom-image>
								<view class="ml20 line1 normal">{{ item.nickname }}</view>
							</view>
							<view class="row ml20" style="flex: none;">
								<view class="column-center">
									<text class="sm normal">
										还差
										<text class="primary">{{ item.need - item.join }}</text>
										人成团
									</text>
									<view class="muted xs">
										剩余
										<u-count-down :timestamp="getTeamCountTime(item.found_end_time)"
											separator-color="#999" color="#999" :separator-size="24" :font-size="24"
											bg-color="transparent" @end="getGoodsDetailFun"></u-count-down>
									</view>
								</view>
								<view class="group-btn br60 white row-center" @tap="showSpecFun(3, item.id)">去参团</view>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
			<view v-if="!goodsType" class="spec row bg-white mt20" @tap="showSpecFun(0)">
				<view class="text lighter">已选</view>
				<view class="line1 mr20" style="flex: 1;">{{ checkedGoods.spec_value_str || '默认' }}</view>
				<image class="icon-sm" src="/static/images/arrow_right.png"></image>
			</view>
			<navigator class="mt20" hover-class="none" url="/bundle/pages/server_explan/server_explan?type=2">
				<view class="row bg-white" style="padding: 24rpx 24rpx;">
					<view class="text lighter flex1">售后保障</view>
					<image class="icon-sm" src="/static/images/arrow_right.png"></image>
				</view>
			</navigator>
			<view class="evaluation bg-white mt20">
				<navigator hover-class="none" :url="'/pages/all_comments/all_comments?id=' + goodsDetail.id"
					class="title row-between">
					<view>
						<text class="balck md mr10">商品评价({{ comment.total || 123 }})</text>
					</view>
					<view class="row">
						<text class="lighter">查看全部</text>
						<image class="icon-sm" src="/static/images/arrow_right.png"></image>
					</view>
				</navigator>
				<view class="con" v-if="comment.goods_rate">
					<view class="user-info row">
						<image class="avatar mr20" :src="comment.avatar"></image>
						<view class="user-name md mr10">{{ comment.nickname }}</view>
					</view>
					<view class="muted xs mt10">
						<text class="mr20">{{ comment.create_time }}</text>
					</view>
					<view v-if="comment.comment" class="dec mt20">{{ comment.comment }}</view>
				</view>
				<view class="con row-center muted" v-else>暂无评价</view>
			</view>

			<view class="group-record bg-white mt20" v-if="teamFound.length">
				<view class="group-record__title">跟团记录</view>
				<view v-for="(sitem, index) in teamFound" :key="index">
					<view v-for="(item, index2) in sitem" :key="index2" class="group-record__item">
						<custom-image :src="item.avatar" width="80rpx" height="80rpx" radius="50%"></custom-image>
						<view class="group-record__content">
							<view class="group-record__name">{{ item.nickname }}</view>
							<view class="group-record__time">{{ item.create_time || '2026-01-01' }}</view>
						</view>
						<view class="group-record__plus">+1</view>
					</view>
				</view>
			</view>

			<view class="goods-like mt20 bg-white" v-if="goodsLike.length">
				<goods-like :list="goodsLike"></goods-like>
			</view>
			<view class="details mt20 bg-white">
				<view class="title lg">商品详情</view>
				<view class="content">
					<u-parse :html="goodsDetail.content" :lazy-load="true" :show-with-animation="true"></u-parse>
				</view>
			</view>
			<view class="footer row bg-white fixed">
				<navigator class="btn column-center" hover-class="none"
					url="/bundle/pages/contact_offical/contact_offical">
					<image class="icon-md" src="/static/images/icon_contact.png"></image>
					<text class="xxs lighter">客服</text>
				</navigator>
				<button class="btn column-center" hover-class="none" @tap="collectGoodsFun">
					<image class="icon-md"
						:src="goodsDetail.is_collect == 1 ? '/static/images/icon_collection_s.png' : '/static/images/icon_collection.png'">
					</image>
					<text class="xxs lighter">收藏</text>
				</button>
				<navigator class="btn cart column-center" hover-class="none" open-type="switchTab"
					url="/pages/shop_cart/shop_cart">
					<image class="icon-md" src="/static/images/icon_cart.png"></image>
					<text class="xxs lighter">购物车</text>
					<u-badge v-if="cartNum" bgColor="#FF2C3C" :offset="[8, 10]" :count="cartNum"></u-badge>
				</navigator>
				<view class="footer-action" @tap="showSpecFun(2)">
					<template v-if="goodsType == 2">
						<view class="footer-action__avatars">
							<view class="footer-action__avatar"></view>
							<view class="footer-action__avatar footer-action__avatar--middle"></view>
							<view class="footer-action__avatar"></view>
						</view>
						<view class="footer-action__count">{{ team.people_num || 155 }}人已跟团</view>
						<view class="footer-action__divider"></view>
					</template>
					<view class="footer-action__text">{{ goodsType == 2 ? '跟团买' : btnText.red }}</view>
				</view>
			</view>
		</view>
		<view v-else>
			<view class="details-null column-center">
				<image class="img-null" src="/static/images/goods_null.png"></image>
				<view class="xs muted">该商品已下架或不存在，去逛逛别的吧~</view>
			</view>
			<recommend></recommend>
		</view>
		<spec-popup :show="showSpec" :goods="goodsDetail" :is-seckill="goodsType == 1" @close="showSpec = false"
			:show-add="popupType == 1 || popupType == 0" :show-buy="popupType == 2 || popupType == 0"
			:showConfirm="popupType == 3" @buynow="onBuy" @addcart="onAddCart" @change="onChangeGoods"
			:group="Boolean(isGroup)" :red-btn-text="btnText.red" :yellow-btn-text="btnText.yellow"
			@confirm="onConfirm"></spec-popup>
			
		<share-popup v-model="showShareBtn" 
			:share-id="id" 
			pagePath="pages/goods_details/goods_details" 
			:type="1" 
			:config="{
				avatar: userInfo.avatar,
				nickname: userInfo.nickname,
				image: goodsDetail.poster || goodsDetail.image,
				price: goodsDetail.min_price,
				marketPrice: goodsDetail.market_price,
				name: goodsDetail.name
		}">
		</share-popup>
		<!-- 领券 -->
		<u-popup v-model="showCoupon" mode="bottom" border-radius="14">
			<view>
				<view class="row-between" style="padding: 30rpx">
					<view class="title md bold">领券</view>
					<view class="close" @tap="showCoupon = false">
						<image class="icon-lg" src="/static/images/icon_close.png"></image>
					</view>
				</view>
				<view class="content bg-body">
					<scroll-view scroll-y="true" style="height: 700rpx">
						<coupon-list :list="couponList" @reflash="getGoodsCouponFun" :btn-type="3"></coupon-list>
					</scroll-view>
				</view>
			</view>
		</u-popup>

		<view class="share-money" :class="{ show: showCommission && enableCommission}">
			<view class="row-end">
				<view class="share-close row-center" @tap="showCommission=false">
					<u-icon name="close" size="16" color="#fff"></u-icon>
				</view>
			</view>
			<view class="share-con mt10" @tap="showShareBtn=true">
				<view class="primary" style="font-size: 45rpx;">
					{{distribution.earnings}}<text class="xs">元</text>
				</view>
				<view class="lighter xxs">
					好友下单最高可赚
				</view>
			</view>
		</view>
		
		<u-back-top :scroll-top="scrollTop" :top="1000" :customStyle="{ backgroundColor: '#FFF', color: '#000', boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'}"></u-back-top>
		
	</view>
</template>

<script>
	import {
		getGoodsDetail,
		addCart,
		getPoster,
		getCartNum as fetchCartNum
	} from '@/api/store';
	import {
		collectGoods
	} from '@/api/user';
	import {
		getGoodsCoupon,
		teamCheck
	} from '@/api/activity';
	import {
		mapActions,
		mapGetters
	} from 'vuex';
	import {
		arraySlice,
		trottle
	} from '@/utils/tools';
	import {
		toLogin
	} from '@/utils/login';
	import {
		getUser,
		inputInviteCode
	} from '@/api/user';
	import Cache from '@/utils/cache';
	import {
		strToParams
	} from '@/utils/tools'
	export default {
		data() {
			return {
				scrollTop: 0,
				percent: 0,
				isFirstLoading: true,
				isNull: false,
				showSpec: false,
				showCoupon: false,
				showShareBtn: false,
				showCommission: true,
				popupType: '',
				swiperList: [],
				goodsDetail: {},
				goodsLike: [],
				goodsType: 0,
				checkedGoods: {},
				couponList: [],
				comment: {},
				countTime: 0,
				tagStyle: {
					img: 'width:100%;'
				},
				team: {},
				teamFound: [],
				isGroup: 0,
				id: '',
				showDownload: false,
				distribution: {}
			};
		},
		onLoad(options) {
			this.onPageScroll = trottle(this.onPageScroll, 500, this)
			if (options && options.scene) {
				let scene = strToParams(decodeURIComponent(options.scene));
				console.log(scene, decodeURIComponent(options.scene))
				options.id = scene.id;
			}
			// #ifdef H5
			if (options && options.isapp == 1) {
				this.showDownload = true;
			}
			// #endif
			if (!options.id) {
				return this.$toast({
					title: '缺少参数，无法查看商品'
				}, {
					tab: 3
				});
			} else {
				this.id = options.id;
			}
			this.getGoodsCouponFun();
			this.getCartNum();
		},
		onShow() {
			this.getGoodsDetailFun();
		},
		onPageScroll(e) {
			const top = uni.upx2px(100)
			const {
				scrollTop
			} = e
			this.percent = scrollTop / top > 1 ? 1 : scrollTop / top
			this.scrollTop = scrollTop
		},
		methods: {
			...mapActions(['getCartNum']),
			async getGoodsDetailFun() {
				const {
					data,
					code
				} = await getGoodsDetail({
					id: this.id
				});
				if (code == 1) {
					let {
						goods_image,
						content,
						comment,
						like,
						activity,
						distribution
					} = data;
					let {
						info,
						team,
						team_found
					} = activity; //秒杀时间
					let time = info ?
						info.end_time - Date.now() / 1000 //拼团时间
						:
						team ?
						team.end_time - Date.now() / 1000 :
						0;

					if (team_found) {
						team_found = arraySlice(team_found, [], 2);
					}
					this.distribution = distribution || {}
					this.goodsDetail = data;
					this.swiperList = goods_image;
					this.comment = comment;
					this.goodsLike = like;
					this.countTime = time;
					this.goodsType = activity.type || 0;
					this.team = team ? team : {};
					this.teamFound = team_found ? team_found : [];

					this.$nextTick(() => {
						this.isFirstLoading = false;
					});
					// #ifdef H5
					let options = {
						shareTitle: data.name,
						shareLink: location.href + '&invite_code=' + this.userInfo.distribution_code,
						shareImage: data.image,
						shareDesc: data.remark
					};
					this.wxShare(options);
					// #endif
				} else {
					this.isNull = true
					this.isFirstLoading = false;
				}
			},
			async getGoodsCouponFun() {
				const {
					data,
					code
				} = await getGoodsCoupon({
					id: this.id
				});
				if (code == 1) {
					this.couponList = data;
				}
			},
			async collectGoodsFun() {
				if (!this.isLogin) return toLogin();
				const {
					goodsDetail: {
						is_collect
					}
				} = this;
				const {
					data,
					code
				} = await collectGoods({
					is_collect: is_collect == 0 ? 1 : 0,
					goods_id: this.id
				});
				if (code == 1) {
					if (is_collect == 0) {
						this.$toast({
							title: '收藏成功'
						});
					} else {
						this.$toast({
							title: '取消收藏'
						});
					}
					this.getGoodsDetailFun();
				}
			},
			showCouponFun() {
				if (!this.isLogin) return toLogin();
				this.showCoupon = true;
			},
			onChangeGoods(e) {
				console.log(e);
				this.checkedGoods = e.detail;
			},
			showSpecFun(type, id) {
				if (!this.isLogin) return toLogin();
				if (this.goodsType == 2 && [2, 3].includes(type)) {
					this.isGroup = 1;
					this.foundId = id;
				} else {
					this.isGroup = 0;
					this.foundId = '';
				}
				this.popupType = type;
				this.showSpec = true;
			},
			onBuy(e) {
				let {
					id,
					goodsNum
				} = e.detail;
				const {
					goodsType,
					team
				} = this;
				let goods = [{
					item_id: id,
					num: goodsNum
				}];
				const params = {
					goods,
				};
				this.showSpec = false;
				goodsType == 2 ? (params.teamId = team.team_id) : '';
				this.foundId ? (params.foundId = this.foundId) : '';
				uni.navigateTo({
					url: '/pages/confirm_order/confirm_order?data=' + encodeURIComponent((JSON.stringify(params)))
				})
				console.log(1111)
			},
			onConfirm(e) {
				const {
					team: {
						team_id
					}
				} = this;
				teamCheck({
					team_id,
					found_id: this.foundId
				}).then(res => {
					if (res.code == 1) {
						this.onBuy(e);
					}
				});
			},
			async onAddCart(e) {
				let {
					id,
					goodsNum
				} = e.detail;

				if (this.goodsType == 2) {
					// 拼团单独购买
					let goods = [{
						item_id: id,
						num: goodsNum
					}];
					uni.navigateTo({
						url: '/pages/confirm_order/confirm_order?data=' + encodeURIComponent((JSON.stringify({
							goods
						})))
					})
					return
				}
				const {
					code,
					data,
					msg
				} = await addCart({
					item_id: id,
					goods_num: goodsNum
				});
				if (code == 1) {
					const cartCount = data?.cartCount ?? data?.count ?? data?.num ?? data?.total;
					if (cartCount !== undefined && cartCount !== null) {
						this.getCartNum(cartCount);
					} else {
						const cartRes = await fetchCartNum();
						if (cartRes.code == 1) {
							this.getCartNum(cartRes.data?.cartCount ?? cartRes.data?.count ?? cartRes.data?.num ?? cartRes.data?.total ?? 0);
						}
					}
					this.$toast({
						title: msg,
						icon: 'success'
					});
					this.showSpec = false;
				}
			}
		},
		async onShareAppMessage() {
			const {
				goodsDetail,
				team,
				userInfo
			} = this;
			return {
				title: team.share_title || goodsDetail.name,
				imageUrl: goodsDetail.image,
				path: '/pages/goods_details/goods_details?id=' + this.id + "&invite_code=" + userInfo.distribution_code
			};
		},
		computed: {
			...mapGetters(['cartNum', 'userInfo']),
			btnText() {
				const {
					goodsType
				} = this;
				switch (goodsType) {
					case 1:
						return {
							red: '立即抢购',
								yellow: ''
						};
					case 2:
						return {
							red: '立即开团',
								yellow: '单独购买'
						};
					default:
						return {
							red: '立即购买',
								yellow: '加入购物车'
						};
				}
			},
			getTeamCountTime() {
				return time => time - Date.now() / 1000;
			},
			enableCommission() {
				const {
					goodsType,
					distribution: {
						earnings,
						is_show
					}
				} = this
				return goodsType == 0 && earnings > 0 && is_show == 1
			},
			previewImages() {
				return (this.swiperList || []).slice(0, 4)
			},
			primaryCouponText() {
				if (this.couponList.length) {
					return this.couponList[0].use_condition || '50元优惠券'
				}
				if (this.goodsDetail.order_give_integral) {
					return `下单送${this.goodsDetail.order_give_integral}积分`
				}
				return '50元优惠券'
			}
		}
	};
</script>

<style lang="scss" scoped>
	.goods-details {
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		background: #f5f6f8;

		.hero-stage {
			position: relative;
		}

		.seckill {
			height: 100rpx;
			background: #ffd4d8;

			.price {
				width: 504rpx;
				height: 100%;
				background: url(../../static/images/bg_seckill.png) no-repeat;
				background-size: 100%;
			}

			.down {
				flex: 1;
			}
		}

		.group {
			height: 100rpx;
			width: 100%;
			background-image: url(../../static/images/pintuan_bg.png);
			background-size: 100%;

			.group-num {
				border: 1px solid #ffffff;
				border-radius: 4rpx;

				.group-icon {
					background: #fff;
					padding: 3rpx 7rpx;
				}
			}

			.down {
				height: 100%;
				background-color: #fff5e1;
				padding: 0 20rpx;
			}
		}

		.merchant-card {
			position: relative;
			z-index: 2;
			margin: -32rpx 26rpx 0;
			padding: 0 14rpx 16rpx;
			background: #037dfa;
			border-radius: 24rpx;
			box-shadow: 0 -6rpx 14rpx rgba(128, 128, 128, 0.15);
		}

		.merchant-card__head {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 80rpx;
		}

		.merchant-card__shop {
			display: flex;
			align-items: center;
			color: #ffffff;
		}

		.merchant-card__avatar {
			width: 48rpx;
			height: 48rpx;
			margin-right: 14rpx;
			background: #ffffff;
			border-radius: 50%;
		}

		.merchant-card__name {
			max-width: 330rpx;
			margin-right: 8rpx;
			font-size: 24rpx;
			font-weight: 500;
		}

		.merchant-card__follow {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 116rpx;
			height: 44rpx;
			color: #037dfa;
			font-size: 22rpx;
			font-weight: 500;
			background: #ffffff;
			border-radius: 22rpx;
		}

		.merchant-card__body {
			padding: 26rpx 24rpx 28rpx;
			background: #ffffff;
			border-radius: 20rpx;
		}

		.merchant-card__price-row {
			align-items: center;
		}

		.merchant-card__price {
			display: flex;
			align-items: baseline;
			color: #ff2e2e;
		}

		.merchant-card__price-tag {
			margin-left: 12rpx;
			font-size: 24rpx;
			line-height: 1;
		}

		.merchant-card__share {
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 120rpx;
			height: 46rpx;
			color: #ffffff;
			font-size: 24rpx;
			background: #037dfa;
			border-radius: 12rpx;

			text {
				margin-left: 8rpx;
			}
		}

		.merchant-card__title {
			margin-top: 18rpx;
			color: #222222;
			font-size: 30rpx;
			font-weight: 500;
			line-height: 42rpx;
		}

		.merchant-card__sales {
			margin-top: 14rpx;
			color: #999999;
			font-size: 22rpx;
		}

		.option-panel {
			margin: 26rpx;
			padding: 18rpx 24rpx;
			border-radius: 26rpx;
		}

		.option-panel__thumbs {
			display: flex;
			align-items: center;
		}

		.option-panel__menu {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 52rpx;
			height: 52rpx;
			margin-right: 22rpx;
		}

		.option-panel__thumb {
			width: 78rpx;
			height: 78rpx;
			margin-right: 14rpx;
			border-radius: 8rpx;
			border: 2rpx solid transparent;

			&.is-active {
				border-color: #037dfa;
			}
		}

		.option-panel__count {
			display: flex;
			align-items: center;
			margin-left: auto;
			color: #999999;
			font-size: 22rpx;

			text {
				margin-right: 8rpx;
			}
		}

		.option-panel__line {
			height: 1rpx;
			margin: 18rpx 0;
			background: #ececec;
		}

		.option-row,
		.option-row__left,
		.option-row__action {
			display: flex;
			align-items: center;
		}

		.option-row {
			min-height: 50rpx;
		}

		.option-row--between {
			justify-content: space-between;
		}

		.option-row__text {
			margin-left: 18rpx;
			color: #222222;
			font-size: 24rpx;
		}

		.coupon-badge {
			height: 46rpx;
			margin-left: 18rpx;
			padding: 0 24rpx;
			color: #ffffff;
			font-size: 22rpx;
			font-weight: 500;
			line-height: 46rpx;
			background: linear-gradient(90deg, #ff6666 0%, #ff4b4b 100%);
			border-radius: 10rpx;
		}

		.option-row__action {
			color: #999999;
			font-size: 22rpx;

			text {
				margin-right: 8rpx;
			}
		}

		.goods-info {
			position: relative;

			.info-header {
				padding: 20rpx 0 0rpx 24rpx;

				.price {
					align-items: baseline;
				}
			}

			.vip-price {
				margin: 0 24rpx;
				background-color: #FFE9BA;
				color: #FFD4B7;
				line-height: 36rpx;
				border-radius: 6rpx;
				overflow: hidden;

				.price-name {
					background-color: #101010;
					padding: 3rpx 12rpx;
					position: relative;
					overflow: hidden;

					&::after {
						content: '';
						display: block;
						width: 20rpx;
						height: 20rpx;
						position: absolute;
						right: -15rpx;
						background-color: #FFE9BA;
						border-radius: 50%;
						top: 50%;
						transform: translateY(-50%);
						box-sizing: border-box;
					}
				}
			}

			.name {
				padding: 20rpx 24rpx;
				flex: 1;
			}

			.icon-share {
				width: 134rpx;
				height: 60rpx;
			}
		}

		.discount {
			padding: 24rpx;

			.text {
				width: 100rpx;
				flex: none;
			}

			.con {
				width: 400rpx;
			}

			.coupons-item {
				overflow: hidden;

				&>view {
					position: relative;
					height: 40rpx;
					line-height: 40rpx;
					padding: 0 18rpx;
					border-radius: 6rpx;
					box-sizing: border-box;
					background-color: $color-primary;
					color: #fff;
					white-space: nowrap;
					overflow: hidden;

					&::after,
					&::before {
						content: '';
						display: block;
						width: 20rpx;
						height: 20rpx;
						position: absolute;
						left: -14rpx;
						background-color: #fff;
						border-radius: 50%;
						border: 1px solid currentColor;
						box-sizing: border-box;
					}

					&::after {
						right: -14rpx;
						left: auto;
					}
				}
			}
		}

		.details-null {
			padding-top: 140rpx;
			margin-bottom: 100rpx;
		}

		.spec {
			padding: 24rpx;

			.text {
				width: 100rpx;
			}
		}

		.evaluation {
			margin: 24rpx 26rpx 0;
			border-radius: 24rpx;
			overflow: hidden;

			.title {
				height: 100rpx;
				border-bottom: $solid-border;
				padding: 0 24rpx;
			}

			.con {
				padding: 30rpx 24rpx;
			}

			.user-info .avatar {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
			}
		}

		.group-record {
			margin: 24rpx 26rpx 0;
			border-radius: 24rpx;
			overflow: hidden;
		}

		.group-record__title {
			padding: 34rpx 28rpx 18rpx;
			color: #222222;
			font-size: 30rpx;
			font-weight: 500;
		}

		.group-record__item {
			display: flex;
			align-items: center;
			padding: 20rpx 26rpx 24rpx;
		}

		.group-record__content {
			flex: 1;
			padding-left: 18rpx;
		}

		.group-record__name {
			color: #222222;
			font-size: 24rpx;
			font-weight: 500;
		}

		.group-record__time {
			margin-top: 12rpx;
			color: #999999;
			font-size: 20rpx;
		}

		.group-record__plus {
			color: #037dfa;
			font-size: 26rpx;
			font-weight: 500;
		}

		.details {
			margin: 24rpx 26rpx 0;
			border-radius: 24rpx;
			overflow: hidden;

			.title {
				line-height: 88rpx;
				text-align: center;
			}

			&>.content {
				padding: 0 20rpx 20rpx;
				overflow: hidden;

				::v-deep image {
					vertical-align: middle;
				}

				// #ifdef H5
				::v-deep img {
					vertical-align: middle;
				}

				// #endif
				// #ifdef MP-WEIXIN || APP-PLUS
				::v-deep ._img {
					display: block;
				}

				// #endif
			}
		}

		.footer {
			height: 110rpx;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			box-sizing: content-box;
			padding: 16rpx 26rpx env(safe-area-inset-bottom);
			align-items: center;
			box-shadow: 0 -6rpx 14rpx rgba(128, 128, 128, 0.08);
			border-top-left-radius: 20rpx;
			border-top-right-radius: 20rpx;

			.btn {
				width: 80rpx;
				height: 80rpx;
				margin-right: 10rpx;
				position: relative;
				line-height: 1.3;
			}

			.cart-num {
				position: absolute;
				left: 60rpx;
				top: 6rpx;
			}

			.footer-action {
				display: flex;
				align-items: center;
				flex: 1;
				height: 80rpx;
				padding: 0 18rpx;
				color: #ffffff;
				background: #037dfa;
				border-radius: 40rpx;
			}

			.footer-action__avatars {
				display: flex;
				align-items: center;
				margin-right: 14rpx;
			}

			.footer-action__avatar {
				width: 42rpx;
				height: 42rpx;
				background: #ffffff;
				border-radius: 50%;
				opacity: 0.95;
			}

			.footer-action__avatar--middle {
				margin: 0 -8rpx;
				background: #d1e6ff;
			}

			.footer-action__count {
				font-size: 24rpx;
				font-weight: 500;
			}

			.footer-action__divider {
				width: 1rpx;
				height: 24rpx;
				margin: 0 20rpx;
				background: rgba(255, 255, 255, 0.5);
			}

			.footer-action__text {
				margin-left: auto;
				font-size: 28rpx;
				font-weight: 500;
			}
		}

		.group-play {
			.title {
				padding: 20rpx 28rpx;
				border-bottom: $solid-border;
			}

			.steps {
				padding: 20rpx 28rpx;

				.step {
					flex: none;
				}

				.line {
					flex: 1;
					border: 1px dashed #999999;
					margin: 0 20rpx;
				}

				.number {
					border: 1rpx solid #707070;
					width: 28rpx;
					height: 28rpx;
					border-radius: 50%;
					line-height: 28rpx;
					text-align: center;
					margin-right: 6rpx;
				}
			}
		}

		.group-list {
			.group-item {
				padding: 20rpx 24rpx;

				&:not(:last-of-type) {
					border-bottom: $solid-border;
				}

				.group-btn {
					background: linear-gradient(90deg, #f95f2f 0%, #ff2c3c 100%);
					height: 58rpx;
					padding-left: 28rpx;
					padding-right: 28rpx;
					margin-left: 30rpx;
					box-shadow: 0px 6rpx 12rpx rgba(249, 47, 138, 0.4);
				}
			}
		}

		.share-money {
			position: fixed;
			left: 20rpx;
			bottom: calc(130rpx + env(safe-area-inset-bottom));
			transform: scale(0);
			transition: all .3s;

			&.show {
				transform: scale(1);
			}

			.share-close {
				width: 34rpx;
				height: 34rpx;
				background: #a7a7a7;
				border-radius: 50%;
			}

			.share-con {
				background: url('../../static/images/bg_packet_img.png');
				width: 241rpx;
				height: 208rpx;
				background-size: 100%;
				padding-top: 20rpx;
				text-align: center;
			}
		}
	}
</style>
