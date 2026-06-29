<template>
	<view class="goods-details">
		<navbar title="商品详情" :background="{background: `rgba(256,256,256,${percent})`}" :titleColor="`rgba(0,0,0,${percent})`" :immersive="true"></navbar>
		<!-- #ifdef H5 -->
		<download-nav v-if="showDownload" :top="44"></download-nav>
		<!-- #endif -->
		<view v-if="isFirstLoading" class="goods-loading">加载中...</view>
		<view class="contain" v-if="!isNull">
			<view class="hero-stage">
				<swiper class="goods-hero-swiper" :current="activePreviewIndex" circular @change="onHeroSwiperChange">
					<swiper-item v-for="(item, index) in swiperList" :key="index">
						<image class="goods-hero-image" :src="item" mode="aspectFill"></image>
					</swiper-item>
				</swiper>
			</view>
			<!-- 秒杀 -->
			<view class="seckill row-between" v-if="goodsType == 1">
				<view class="price row">
					<view class="row white info">
						<view style="align-items: baseline;" class="row ml20">
							<view class="mr10">秒杀价</view>
							<price-format :first-size="46" :second-size="32" :subscript-size="32"
								:price="displayMinPrice" :weight="500"></price-format>
							<template v-if="displayMinPrice != displayMaxPrice">
								<text style="font-size: 46rpx;">-</text>
								<price-format :first-size="46" :second-size="32" :subscript-size="32"
									:show-subscript="false" :price="displayMaxPrice" :weight="500"></price-format>
							</template>
							<view class="ml10">
								<price-format :subscript-size="30" :line-through="true" :first-size="30"
									:second-size="30" :price="displayMarketPrice">
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
								:price="displayTeamPrice" :weight="500"></price-format>
							<text class="xs">起</text>
						</view>
						<view class="mr20 row group-num">
							<view class="group-icon">
								<image src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_group.png" class="icon-sm"></image>
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
			<view class="merchant-card" @tap="goShopDetail">
				<view class="merchant-card__head">
					<view class="merchant-card__shop">
						<view class="merchant-card__avatar"></view>
						<view class="merchant-card__name line1">{{ goodsDetail.shop_name || '萨洛蒙官方旗舰店' }}</view>
						<u-icon name="arrow-right" size="22" color="#ffffff"></u-icon>
					</view>
					<view class="merchant-card__follow" @tap.stop="toggleShopSubscribe">{{ shopSubscribed ? '已订阅' : '+订阅' }}</view>
				</view>
				<view class="merchant-card__body">
					<view class="merchant-card__price-row row-between">
						<view class="merchant-card__price">
							<price-format :first-size="46" :second-size="32" :subscript-size="32"
								:price="goodsType == 2 ? displayTeamPrice : displayMinPrice"
								:weight="500"></price-format>
							<text class="merchant-card__price-tag">{{ goodsType == 2 ? '拼团价' : '到手价' }}</text>
						</view>
						<view class="merchant-card__share" @tap.stop="showShareBtn = true">
							<image class="merchant-card__share-icon" src="https://shengyuan.store/api/miniapp/files/miniapp/d8f8eba765024dd7ad1bf7ced9c0ea8c/c2187248f261c091ca3024ebe0b55c41.png" mode="aspectFit"></image>
							<text>分享</text>
						</view>
					</view>
					<view class="merchant-card__title">{{ goodsDetail.name }}</view>
					<view class="merchant-card__sales">{{ goodsDetail.sales_sum || 0 }}人抢购</view>
				</view>
			</view>
			<view class="option-panel bg-white">
				<view class="option-panel__style-head">
					<view class="option-panel__menu" @tap="toggleStyleViewMode">
						<image class="option-panel__icon" src="https://shengyuan.store/api/miniapp/files/miniapp/bba8c68921db42d4a52b6999f1309b4d/56950104d92fe6e3e45ac4657e744731.png" mode="aspectFit"></image>
						<text>{{ styleViewMode === 'list' ? '列表' : '大图' }}</text>
					</view>
					<view class="option-panel__count">
						<text>共{{ swiperList.length || 0 }}款</text>
						<u-icon name="arrow-right" size="20" color="#999999"></u-icon>
					</view>
				</view>
				<scroll-view v-if="styleViewMode === 'list'" scroll-x="true" class="option-panel__scroll" show-scrollbar="false">
					<view class="option-panel__thumbs">
						<image
							v-for="(item, index) in previewImages"
							:key="index"
							:class="['option-panel__thumb', index === activePreviewIndex ? 'is-active' : '']"
							:src="item"
							mode="aspectFill"
							@tap="selectPreviewImage(index)"
						></image>
					</view>
				</scroll-view>
				<view v-else class="option-panel__grid">
					<view
						v-for="(item, index) in previewImages"
						:key="index"
						:class="['option-panel__grid-item', index === activePreviewIndex ? 'is-active' : '']"
						@tap="selectPreviewImage(index)"
					>
						<image class="option-panel__grid-image" :src="item" mode="aspectFill"></image>
						<view class="option-panel__grid-text">款式{{ index + 1 }}</view>
					</view>
				</view>
				<view class="option-panel__line"></view>
				<view class="option-row">
					<image class="option-row__icon" src="https://shengyuan.store/api/miniapp/files/miniapp/7a9d1bcad0d34f018ff8859f514e160a/54a41e25c94ab8c39497ccfe5bb91ece.png" mode="aspectFit"></image>
					<text class="option-row__text">{{ freightText }}</text>
				</view>
				<view class="option-panel__line"></view>
				<view class="option-row option-row--between" @tap="showCouponFun">
					<view class="option-row__left">
						<image class="option-row__icon" src="https://shengyuan.store/api/miniapp/files/miniapp/7f051b4aa3eb450c834bd06f53586c5d/26037f64b6984ded794031edbc6161b7.png" mode="aspectFit"></image>
						<view v-if="couponList.length" class="coupon-badge">
							<text class="coupon-badge__amount">{{ primaryCouponAmountText }}</text>
							<text class="coupon-badge__condition">{{ primaryCouponConditionText }}</text>
						</view>
						<view v-else class="coupon-none">暂无优惠券</view>
					</view>
					<view class="option-row__action">
						<text>{{ couponList.length ? '立即领取' : '暂无可领' }}</text>
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
							<image class="icon-sm" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"></image>
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
								<image v-if="item.avatar" class="team-avatar" :src="resolveAvatar(item.avatar)" mode="aspectFill"></image>
								<view v-else class="team-avatar team-avatar--empty"></view>
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
				<view class="line1 mr20" style="flex: 1;">{{ selectedSpecText }}</view>
				<image class="icon-sm" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"></image>
			</view>
			<view class="mt20 service-row" @tap="showGuidePending">
				<view class="row bg-white" style="padding: 24rpx 24rpx;">
					<view class="text lighter flex1">使用攻略</view>
					<image class="icon-sm" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"></image>
				</view>
			</view>
			<view class="evaluation bg-white mt20">
				<navigator hover-class="none" :url="'/bundle_order/pages/all_comments/all_comments?id=' + goodsDetail.id"
					class="title row-between">
					<view>
						<text class="balck md mr10">商品评价({{ comment.total || 0 }})</text>
					</view>
					<view class="row">
						<text class="lighter">查看全部</text>
						<image class="icon-sm" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"></image>
					</view>
				</navigator>
				<view class="con" v-if="comment.comment">
					<view class="user-info row">
						<image class="avatar mr20" :src="comment.avatar"></image>
						<view class="user-name md mr10">{{ comment.nickname }}</view>
					</view>
					<view class="muted xs mt10">
						<text class="mr20">{{ comment.create_time }}</text>
					</view>
					<view v-if="comment.comment" class="dec mt20">{{ comment.comment }}</view>
				</view>
				<view class="con empty-state" v-else>暂无评价</view>
			</view>

			<view class="group-record bg-white mt20" v-if="groupRecords.length">
				<view class="group-record__title">跟团记录</view>
				<view v-for="(item, index) in groupRecords" :key="index" class="group-record__item">
					<image v-if="item.avatar" class="group-record__avatar-image" :src="resolveAvatar(item.avatar)" mode="aspectFill"></image>
					<view v-else class="group-record__avatar"></view>
					<view class="group-record__content">
						<view class="group-record__name">{{ item.name }}</view>
						<view class="group-record__time">{{ item.time || '刚刚跟团' }}</view>
					</view>
					<view class="group-record__plus">+{{ item.join || 1 }}</view>
				</view>
			</view>

			<view class="group-record bg-white mt20" v-else>
				<view class="group-record__title">跟团记录</view>
				<view class="group-record__empty">
					<view class="group-record__empty-icon"></view>
					<view>暂无跟团记录</view>
					<view class="group-record__empty-desc">成为第一个跟团的人吧</view>
				</view>
			</view>
			<view class="goods-like mt20 bg-white" v-if="goodsLike.length">
				<goods-like :list="goodsLike"></goods-like>
			</view>
			<view class="footer row bg-white fixed">
				<view class="btn column-center" @tap="goContactService">
					<image class="icon-md" src="https://shengyuan.store/api/miniapp/files/miniapp/5f50e710a7024d99a4ddef3544d73eaf/8b846285dc82397ecc5ec550e2c6a507.png"></image>
					<text class="xxs lighter">客服</text>
				</view>
				<navigator class="btn column-center" hover-class="none" url="/bundle_order/pages/user_order/user_order">
					<image class="icon-md" src="https://shengyuan.store/api/miniapp/files/miniapp/70ce92ac24bc45d6be6abc68a2a357af/6f6ac9799b01d21b02e90602db0dcb34.png"></image>
					<text class="xxs lighter">订单</text>
				</navigator>
				<view class="btn cart column-center" @tap="goCartPage">
					<image class="icon-md" src="https://shengyuan.store/api/miniapp/files/miniapp/4f8db4b7921d4f819d8053ba1c3baee4/08d3b1d2deda71069a912ba2d2cc9435.png"></image>
					<text class="xxs lighter">购物车</text>
				</view>
				<view class="footer-action" @tap="showSpecFun(0)">
					<view class="footer-action__avatars">
						<view class="footer-action__avatar"></view>
						<view class="footer-action__avatar footer-action__avatar--middle"></view>
						<view class="footer-action__avatar"></view>
					</view>
					<view class="footer-action__count">{{ groupFooterCount }}人已跟团</view>
					<image class="footer-action__divider" src="https://shengyuan.store/api/miniapp/files/miniapp/a36a466bcdf04ae6890741d408cf03fc/e7a941da9a41662f3ee7019ebf17adc5.png" mode="scaleToFill"></image>
					<view class="footer-action__text">跟团买</view>
				</view>
			</view>
		</view>
		<view v-else>
			<view class="details-null column-center">
				<view class="xs muted">该商品已下架或不存在，去逛逛别的吧~</view>
			</view>
			<recommend></recommend>
		</view>
		<spec-popup :show="showSpec" :goods="goodsDetail" :is-seckill="goodsType == 1" @close="showSpec = false"
			:show-add="popupType == 1 || popupType == 0" :show-buy="popupType == 2 || popupType == 0"
			:showConfirm="popupType == 3" @buynow="onBuy" @addcart="onAddCart" @change="onChangeGoods"
			:group="Boolean(isGroup)" :red-btn-text="btnText.red" :yellow-btn-text="btnText.yellow"
			@confirm="onConfirm"></spec-popup>

		<u-popup v-model="showShareBtn" mode="center" :border-radius="0" :mask-close-able="true" @open="prepareGoodsShareQrcode">
			<view class="goods-share-scene">
				<view class="goods-share-shop">
					<image class="goods-share-shop__logo" :src="shareShopLogo" mode="aspectFill"></image>
					<view class="goods-share-shop__body">
						<view class="goods-share-shop__name line1">{{ shareShopName }}</view>
						<view class="goods-share-shop__rating">
							<image v-for="item in 5" :key="item" class="goods-share-shop__star" :src="shareStarIcon" mode="aspectFit"></image>
							<text class="goods-share-shop__score">{{ shareShopScore }}</text>
						</view>
						<view class="goods-share-shop__time line1">
							<image class="goods-share-shop__time-icon" :src="shareTimeIcon" mode="aspectFit"></image>
							<text class="goods-share-shop__time-text">营业时间：{{ shareBusinessTime }}</text>
						</view>
					</view>
				</view>
				<view class="goods-share-panel">
					<image class="goods-share-main" :src="resolveGoodsImage(goodsDetail.poster || goodsDetail.image)" mode="aspectFill"></image>
					<view class="goods-share-info">
						<view class="goods-share-price">
							<text class="goods-share-price__symbol">¥</text><text class="goods-share-price__main">{{ sharePriceMain }}</text><text class="goods-share-price__decimal">{{ sharePriceDecimal }}</text>
							<view class="goods-share-tip">长按保存二维码</view>
						</view>
						<view class="goods-share-qrcode">
							<image v-if="shareQrcodeIsImage" class="goods-share-qrcode__image" :src="shareQrcode" mode="aspectFit"></image>
							<tki-qrcode
								v-else-if="shareQrcode"
								cid="goods-share-qrcode"
								:val="shareQrcode"
								:size="206"
								:onval="true"
								:load-make="true"
								:show-loading="false"
							></tki-qrcode>
							<view v-else class="goods-share-qrcode__loading">二维码</view>
						</view>
					</view>
					<view class="goods-share-actions">
						<view class="goods-share-action goods-share-action--save" @tap="toastShareSave">保存图片</view>
						<button class="goods-share-action" open-type="share">分享商品</button>
					</view>
				</view>
				<image class="goods-share-close" :src="shareCloseIcon" mode="aspectFit" @tap="showShareBtn = false"></image>
			</view>
		</u-popup>
		<!-- 领券 -->
		<u-popup v-model="showCoupon" mode="bottom" border-radius="14">
			<view>
				<view class="row-between" style="padding: 30rpx">
					<view class="title md bold">领券</view>
					<view class="close" @tap="showCoupon = false">
						<image class="icon-lg" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_close.png"></image>
					</view>
				</view>
				<view class="content bg-body">
					<scroll-view scroll-y="true" style="height: 700rpx">
						<view v-if="couponList.length" class="coupon-popup-list">
							<view class="coupon-popup-ticket" v-for="(item, index) in couponList" :key="index">
								<view class="coupon-popup-ticket__main">
									<view class="coupon-popup-ticket__amount">{{ formatCouponAmount(item) }}</view>
									<view class="coupon-popup-ticket__condition">{{ formatCouponCondition(item) }}</view>
								</view>
								<view class="coupon-popup-ticket__action" @tap="receiveCoupon(item)">{{ item.is_get ? '已领' : '领取' }}</view>
							</view>
						</view>
						<view v-else class="coupon-empty">
							<view class="coupon-empty__title">暂无可领取优惠券</view>
							<view class="coupon-empty__desc">下单优惠会自动展示在结算页</view>
						</view>
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
import Navbar from '@/components/navbar/navbar.vue'
import UPopup from '@/bundle/components/uview-ui/components/u-popup/u-popup.vue'
import UCountDown from '@/bundle/components/uview-ui/components/u-count-down/u-count-down.vue'
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
import UTag from '@/bundle/components/uview-ui/components/u-tag/u-tag.vue'
import UBackTop from '@/bundle/components/uview-ui/components/u-back-top/u-back-top.vue'
import GoodsLike from '@/components/goods-like/goods-like.vue'
	import SpecPopup from '@/bundle/components/spec-popup/spec-popup.vue'
	import TkiQrcode from '@/bundle/components/tki-qrcode/tki-qrcode.vue'
	import {
		getGoodsDetail,
		addCart,
		getPoster,
		getCartNum as fetchCartNum
	} from '@/api/store';
	import {
		collectGoods,
		getCoupon
	} from '@/api/user';
	import {
		teamCheck
	} from '@/api/activity';
	import {
		getShareMnQrcode
		, subscribeShop
	} from '@/api/app';
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
	import { resolveImage } from '@/utils/image-placeholder'
import PriceFormat from '@/bundle/components/price-format/price-format.vue'
	export default {
		components: {
			GoodsLike,
			PriceFormat,
			Navbar,
			UPopup,
			UCountDown,
			UIcon,
			UTag,
			UBackTop,
			SpecPopup,
			TkiQrcode
		},
		data() {
			return {
				scrollTop: 0,
				percent: 0,
				isFirstLoading: true,
				isNull: false,
				showSpec: false,
				showCoupon: false,
				showShareBtn: false,
				shareQrcode: '',
				shareQrcodeIsImage: false,
				showCommission: true,
				shopSubscribed: false,
				popupType: '',
				activePreviewIndex: 0,
				styleViewMode: 'list',
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
				distribution: {},
				groupRecords: [],
				fetchingDetail: false,
				shareCloseIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/87c0300dafb0450ea11fc2bc5b76c91b/676d68646053824b88f084648bfc6594.png',
				shareStarIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/418affabb42a4f2692e1d894a8f6411c/6ab9b0b9917a09a6d5fdab80e40bf103.png',
				shareTimeIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/81a56cbe3aee49449a4f1014a8a90109/4a0776d08638585f2aaac7f04bf1a07d.png'
			};
		},
			onLoad(options) {
			this.onPageScroll = trottle(this.onPageScroll, 500, this)
			if (options && options.scene) {
				let scene = strToParams(decodeURIComponent(options.scene));
				options.id = scene.id;
			}
			// #ifdef H5
			if (options && options.isapp == 1) {
				this.showDownload = true;
			}
			// #endif
			if (!options || !options.id) {
				this.id = '1';
				this.applyDefaultGoodsDetail();
			} else {
				this.id = options.id;
			}
			this.refreshCartNum();
		},
		onShow() {
			if (!this.id) return;
			this.getGoodsDetailFun();
			this.refreshCartNum();
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
			async refreshCartNum() {
				try {
					const cartRes = await fetchCartNum();
					if (cartRes.code == 1) {
						this.getCartNum(cartRes.data?.cartCount ?? cartRes.data?.count ?? cartRes.data?.num ?? cartRes.data?.total ?? 0);
					}
				} catch (error) {}
			},
			goodsShareLink() {
				const inviteCode = this.userInfo.distribution_code || this.$store.getters.inviteCode || '';
				return `/bundle/pages/goods_details/goods_details?id=${this.id}&invite_code=${inviteCode}`;
			},
			async prepareGoodsShareQrcode() {
				if (this.shareQrcode) return;
				try {
					const res = await getShareMnQrcode({
						id: this.id,
						url: 'bundle/pages/goods_details/goods_details',
						type: 1
					});
					const data = res && res.data ? res.data : {};
					const qrcode = data.qr_code || data.qrCode || data.qrcode || data.image || data.url;
					if (qrcode) {
						this.shareQrcode = String(qrcode).replace(/\r\n/g, '');
						this.shareQrcodeIsImage = true;
						return;
					}
				} catch (e) {}
				this.shareQrcode = this.goodsShareLink();
				this.shareQrcodeIsImage = false;
			},
			resolveAvatar(avatar) {
				return resolveImage(avatar, 'avatar')
			},
			resolveGoodsImage(image) {
				return resolveImage(image, 'goods')
			},
			goShopDetail() {
				const shopId = this.goodsDetail.shop_id || this.goodsDetail.shopId
				if (!shopId) return
				uni.navigateTo({ url: `/business/pages/business_pages/store_detail?shopId=${shopId}` })
			},
			goCartPage() {
				uni.switchTab({ url: '/pages/shop_cart/shop_cart' })
			},
			goContactService() {
				const params = [
					`goodsId=${encodeURIComponent(this.id || '')}`,
					`goodsName=${encodeURIComponent(this.goodsDetail.name || '')}`,
					`shopId=${encodeURIComponent(this.goodsDetail.shop_id || this.goodsDetail.shopId || '')}`,
					`shopName=${encodeURIComponent(this.shareShopName || '')}`
				].join('&')
				uni.navigateTo({ url: `/bundle_user/pages/contact_offical/contact_offical?${params}` })
			},
			showGuidePending() {
				uni.navigateTo({ url: '/bundle_user/pages/server_explan/server_explan?type=2' })
			},
			toastShareSave() {
				uni.showToast({ title: '请长按二维码或图片保存', icon: 'none' })
			},
			selectPreviewImage(index) {
				this.activePreviewIndex = index;
			},
			toggleStyleViewMode() {
				this.styleViewMode = this.styleViewMode === 'list' ? 'grid' : 'list';
			},
			onHeroSwiperChange(e) {
				this.activePreviewIndex = e.detail.current || 0;
			},
			formatCouponAmount(item = {}) {
				const amount = item.money || item.amount || item.discountAmount || item.couponAmount || item.value;
				return amount ? `${amount}元` : (item.name || item.couponName || '优惠券');
			},
			formatCouponCondition(item = {}) {
				return item.use_condition || item.useCondition || item.conditionText || item.condition || '下单可用';
			},
			normalizePrice(value, fallback = 0) {
				const next = Number(value ?? fallback ?? 0);
				return Number.isNaN(next) ? '0.00' : next.toFixed(2);
			},
			normalizeGoodsDetailForView(data = {}) {
				const minPrice = data.min_price ?? data.minPrice ?? data.salePrice ?? data.price ?? data.skuMinPrice ?? data.priceMin;
				const maxPrice = data.max_price ?? data.maxPrice ?? data.salePrice ?? data.price ?? data.skuMaxPrice ?? minPrice;
				const marketPrice = data.market_price ?? data.marketPrice ?? data.originPrice ?? data.originalPrice ?? data.linePrice ?? maxPrice;
				return Object.assign({}, data, {
					min_price: this.normalizePrice(minPrice),
					max_price: this.normalizePrice(maxPrice, minPrice),
					market_price: this.normalizePrice(marketPrice, maxPrice)
				});
			},
			resolveSkuPayload(detail = this.checkedGoods) {
				const sku = detail || {};
				const fallback = (this.goodsDetail.goods_item || [])[0] || {};
				const itemId = sku.item_id || sku.sku_id || sku.skuId || sku.id || fallback.item_id || fallback.sku_id || fallback.skuId || fallback.id;
				return {
					itemId,
					goodsNum: sku.goodsNum || sku.goods_num || sku.quantity || 1
				};
			},
			validTeamId() {
				return this.team.team_id || this.team.teamId || this.team.id || '';
			},
			flattenTeamRecords(teamFound = []) {
				const source = Array.isArray(teamFound) ? teamFound : [];
				return source.reduce((records, item) => {
					if (Array.isArray(item)) return records.concat(item);
					if (item && typeof item === 'object') records.push(item);
					return records;
				}, []).map((item, index) => ({
					id: item.id || item.found_id || item.foundId || index,
					avatar: item.avatar || item.user_avatar || item.userAvatar || '',
					name: item.nickname || item.user_name || item.userName || item.name || '匿名用户',
					time: item.create_time || item.createTime || item.found_time || item.foundTime || '',
					join: item.join || item.join_num || item.joinNum || 1
				}));
			},
			toggleShopSubscribe() {
				if (!this.isLogin) return toLogin();
				const shopId = this.goodsDetail.shop_id || this.goodsDetail.shopId || this.goodsDetail.shop?.shopId || '';
				if (!shopId) return uni.showToast({ title: '暂无店铺信息', icon: 'none' });
				const nextSubscribed = !this.shopSubscribed;
				subscribeShop({ shopId, subscribed: nextSubscribed }).then(res => {
					if (res.code != 1) {
						uni.showToast({ title: res.msg || '订阅失败', icon: 'none' });
						return;
					}
					this.shopSubscribed = nextSubscribed;
					uni.showToast({
						title: this.shopSubscribed ? '订阅成功' : '已取消订阅',
						icon: 'none'
					});
				}).catch(() => {
					uni.showToast({ title: '订阅失败', icon: 'none' });
				});
			},
			applyDefaultGoodsDetail() {
				const image = 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/designs/24-goods-detail.png';
				this.isNull = false;
				this.goodsType = 2;
				this.countTime = 0;
				this.team = { people_num: 155, team_min_price: '299.00', team_id: '' };
				this.teamFound = [];
				this.groupRecords = [];
				this.comment = {};
				this.couponList = [];
				this.activePreviewIndex = 0;
				this.goodsLike = [
					{ id: 1, name: '轻便舒适跑步鞋', image, min_price: '1899.00' },
					{ id: 2, name: '黑白灰色运动鞋', image, min_price: '2300.00' }
				];
				this.swiperList = [image];
				this.goodsDetail = {
					id: this.id || '1',
					name: '超清智慧投影居家使用高清高分辨率',
					shop_name: '叮咚生活家',
					image,
					poster: image,
					video: '',
					remark: '默认商品展示数据',
					min_price: '299.00',
					max_price: '299.00',
					market_price: '399.00',
					sales_sum: 213,
					stock: 999,
					is_collect: 0,
					order_give_integral: 200,
					group_people_num: 155,
					content: '<p>商品详情默认展示内容，适用于接口暂无数据时的静态预览。</p>'
				};
				this.$nextTick(() => {
					this.isFirstLoading = false;
				});
			},
			async getGoodsDetailFun() {
				if (!this.id) {
					this.applyDefaultGoodsDetail();
					return;
				}
				if (this.fetchingDetail) return;
				this.fetchingDetail = true;
				try {
					const {
						data,
						code
					} = await getGoodsDetail({
						id: this.id
					});
					if (code != 1 || !data) {
						this.applyDefaultGoodsDetail();
						return;
					}
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
					} = activity || {}; //秒杀时间
					team_found = team_found || data.team_found || data.teamFound || data.group_records || data.groupRecords || [];
					let time = info ?
						info.end_time - Date.now() / 1000 //拼团时间
						:
						team ?
						team.end_time - Date.now() / 1000 :
						0;

					if (Array.isArray(team_found)) {
						team_found = arraySlice(team_found, [], 2);
					} else {
						team_found = [];
					}
					this.distribution = distribution || {}
					this.isNull = false;
					this.goodsDetail = this.normalizeGoodsDetailForView(data);
					this.shopSubscribed = Boolean(data.shopSubscribed || data.isShopSubscribed || data.shop?.subscribed || data.shop?.isSubscribed);
					this.swiperList = Array.isArray(goods_image) && goods_image.length ? goods_image : [data.image].filter(Boolean);
					this.activePreviewIndex = 0;
					this.comment = comment || {};
					this.goodsLike = Array.isArray(like) ? like : [];
					this.couponList = Array.isArray(data.coupon_list) ? data.coupon_list : [];
					this.checkedGoods = data.goods_item?.find(item => Number(item.stock || 0) > 0) || data.goods_item?.[0] || {};
					this.countTime = time;
					this.goodsType = activity?.type || 0;
					this.team = team ? team : {};
					this.teamFound = team_found ? team_found : [];
					this.groupRecords = this.flattenTeamRecords(team_found);

					// #ifdef H5
					let options = {
						shareTitle: data.name,
						shareLink: location.href + '&invite_code=' + this.userInfo.distribution_code,
						shareImage: data.image,
						shareDesc: data.remark
					};
					this.wxShare(options);
					// #endif
				} catch (error) {
					this.applyDefaultGoodsDetail();
				} finally {
					this.fetchingDetail = false;
					this.$nextTick(() => {
						this.isFirstLoading = false;
					});
				}
			},
			async receiveCoupon(item) {
				if (!item || item.is_get) return;
				const couponId = item.id || item.couponId;
				if (!couponId) return;
				const res = await getCoupon(couponId);
				if (res.code == 1) {
					this.$toast({ title: res.msg || '领取成功' });
					item.is_get = true;
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
				this.checkedGoods = e.detail;
			},
			showSpecFun(type, id) {
				if (!this.isLogin) return toLogin();
				if (this.goodsType == 2 && this.validTeamId() && [2, 3].includes(type)) {
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
					sku_id,
					skuId,
					item_id,
					goodsNum
				} = e.detail;
				const resolved = this.resolveSkuPayload(e.detail);
				const itemId = item_id || sku_id || skuId || id || resolved.itemId;
				const quantity = goodsNum || resolved.goodsNum || 1;
				if (!itemId) return this.$toast({ title: '请选择商品规格' });
				const {
					goodsType,
					team
				} = this;
				let goods = [{
					item_id: itemId,
					skuId: itemId,
					quantity,
					num: quantity
				}];
				const params = {
					goods,
				};
				this.showSpec = false;
				const teamId = this.validTeamId();
				goodsType == 2 && teamId ? (params.teamId = teamId) : '';
				this.foundId ? (params.foundId = this.foundId) : '';
				uni.navigateTo({
					url: '/bundle/pages/confirm_order/confirm_order?data=' + encodeURIComponent((JSON.stringify(params)))
				})
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
					} else {
						this.$toast({ title: res.msg || '拼团暂不可用' });
					}
				}).catch((err) => {
					this.$toast({ title: err?.msg || err?.message || '拼团暂不可用' });
				});
			},
			async addSelectedGoodsToCart() {
				if (!this.isLogin) return toLogin();
				const { itemId, goodsNum } = this.resolveSkuPayload();
				if (!itemId) return this.$toast({ title: '请选择商品规格' });
				const { code, data, msg } = await addCart({
					item_id: itemId,
					skuId: itemId,
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
					this.$toast({ title: msg || '已加入购物车', icon: 'success' });
				}
			},
			async onAddCart(e) {
				let {
					id,
					sku_id,
					skuId,
					item_id,
					goodsNum
				} = e.detail;
				const resolved = this.resolveSkuPayload(e.detail);
				const itemId = item_id || sku_id || skuId || id || resolved.itemId;
				const quantity = goodsNum || resolved.goodsNum || 1;
				if (!itemId) return this.$toast({ title: '请选择商品规格' });

				const {
					code,
					data,
					msg
				} = await addCart({
					item_id: itemId,
					skuId: itemId,
					goods_num: quantity
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
				path: '/bundle/pages/goods_details/goods_details?id=' + this.id + "&invite_code=" + userInfo.distribution_code
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
							red: '立即购买',
								yellow: '加入购物车'
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
				return this.swiperList || []
			},
			showGroupFooter() {
				return true
			},
			groupFooterCount() {
				return this.team.people_num || this.team.join_num || this.team.joinNum || this.goodsDetail.group_people_num || this.goodsDetail.groupPeopleNum || this.goodsDetail.group_join_num || this.goodsDetail.groupJoinNum || 0
			},
			displayMinPrice() {
				return this.normalizePrice(this.goodsDetail.min_price ?? this.goodsDetail.minPrice ?? this.goodsDetail.salePrice ?? this.goodsDetail.price)
			},
			displayMaxPrice() {
				return this.normalizePrice(this.goodsDetail.max_price ?? this.goodsDetail.maxPrice ?? this.goodsDetail.salePrice ?? this.goodsDetail.price, this.displayMinPrice)
			},
			displayMarketPrice() {
				return this.normalizePrice(this.goodsDetail.market_price ?? this.goodsDetail.marketPrice ?? this.goodsDetail.originPrice ?? this.goodsDetail.originalPrice, this.displayMaxPrice)
			},
			displayTeamPrice() {
				return this.normalizePrice(this.team.team_min_price ?? this.team.teamMinPrice ?? this.team.groupPrice ?? this.displayMinPrice, this.displayMinPrice)
			},
			sharePriceText() {
				return this.normalizePrice(this.goodsType == 2 ? this.displayTeamPrice : this.displayMinPrice)
			},
			sharePriceMain() {
				return String(this.sharePriceText || '0.00').split('.')[0] || '0'
			},
			sharePriceDecimal() {
				const decimal = String(this.sharePriceText || '0.00').split('.')[1]
				return `.${decimal || '00'}`
			},
			shareShopName() {
				return this.goodsDetail.shop_name || this.goodsDetail.shopName || this.goodsDetail.storeName || this.goodsDetail.shop?.shopName || '叮咚生活家'
			},
			shareShopLogo() {
				const shop = this.goodsDetail.shop || this.goodsDetail.shopInfo || this.goodsDetail.shop_info || {}
				return this.resolveAvatar(this.goodsDetail.shop_logo || this.goodsDetail.shopLogo || this.goodsDetail.shopLogoUrl || this.goodsDetail.shop_logo_url || this.goodsDetail.storeLogo || this.goodsDetail.store_logo || shop.shopLogo || shop.shop_logo || shop.logo || shop.logoUrl || shop.image || shop.cover || '')
			},
			shareShopScore() {
				const score = this.goodsDetail.shop_score ?? this.goodsDetail.shopScore ?? this.goodsDetail.shop?.shopScore ?? this.goodsDetail.shop?.score ?? 5
				const value = Number(score)
				return Number.isNaN(value) ? String(score || '5.0') : value.toFixed(1)
			},
			shareBusinessTime() {
				return this.goodsDetail.businessHours || this.goodsDetail.business_hours || this.goodsDetail.shop?.businessHours || this.goodsDetail.shop?.business_hours || '8:00-16:00'
			},
			primaryCouponAmountText() {
				return this.formatCouponAmount(this.couponList[0] || {})
			},
			primaryCouponConditionText() {
				return this.formatCouponCondition(this.couponList[0] || {})
			},
			selectedSpecText() {
				return this.checkedGoods.spec_value_str || this.checkedGoods.skuName || this.checkedGoods.name || '默认'
			},
			freightText() {
				const type = this.goodsDetail.freight_type || this.goodsDetail.freightType
				const amount = Number(this.goodsDetail.freight_amount ?? this.goodsDetail.freightAmount ?? 0)
				if (type === 'PICKUP') return '线下自提'
				if (type === 'TEMPLATE') return amount > 0 ? `运费 ¥${amount}` : '按运费模板计算'
				if (type === 'FIXED') return amount > 0 ? `运费 ¥${amount}` : '固定运费'
				return '免运费'
			}
		}
	};
</script>

<style lang="scss" scoped>
	.goods-details {
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		background: #f5f6f8;

		.goods-loading {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 240rpx;
			color: #999999;
			font-size: 26rpx;
		}

		.hero-stage {
			position: relative;
			height: 750rpx;
			background: #eef4ff;
		}

		.goods-hero-swiper,
		.goods-hero-image {
			width: 100%;
			height: 750rpx;
		}

		.goods-hero-image {
			display: block;
			background: #eef4ff;
		}

		.seckill {
			height: 100rpx;
			background: #ffd4d8;

			.price {
				width: 504rpx;
				height: 100%;
				background: url(https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/bg_seckill.png) no-repeat;
				background-size: 100%;
			}

			.down {
				flex: 1;
			}
		}

		.group {
			height: 100rpx;
			width: 100%;
			background-image: url(https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/pintuan_bg.png);
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
			margin: -64rpx 26rpx 0;
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

		.merchant-card__share-icon {
			width: 26rpx;
			height: 26rpx;
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
			margin: 26rpx 26rpx 0;
			padding: 18rpx 24rpx;
			border-radius: 26rpx;
		}

		.option-panel__style-head,
		.option-panel__thumbs {
			display: flex;
			align-items: center;
		}

		.option-panel__style-head {
			justify-content: space-between;
			margin-bottom: 16rpx;
		}

		.option-panel__menu {
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 112rpx;
			height: 48rpx;
			padding: 0 12rpx;
			margin-right: 22rpx;
			color: #222222;
			font-size: 22rpx;
			background: #f3f7ff;
			border-radius: 24rpx;

			text {
				margin-left: 6rpx;
			}
		}

		.option-panel__icon {
			width: 28rpx;
			height: 28rpx;
		}

		.option-panel__scroll {
			width: 100%;
			white-space: nowrap;
		}

		.option-panel__thumb {
			display: inline-block;
			width: 92rpx;
			height: 92rpx;
			margin-right: 14rpx;
			border-radius: 14rpx;
			border: 2rpx solid transparent;

			&.is-active {
				border-color: #037dfa;
			}
		}

		.option-panel__grid {
			display: flex;
			flex-wrap: wrap;
			margin: -8rpx;
		}

		.option-panel__grid-item {
			width: calc(50% - 16rpx);
			margin: 8rpx;
			padding: 8rpx;
			background: #f7f9fc;
			border: 2rpx solid transparent;
			border-radius: 18rpx;
			box-sizing: border-box;

			&.is-active {
				border-color: #037dfa;
				background: #eef6ff;
			}
		}

		.option-panel__grid-image {
			width: 100%;
			height: 220rpx;
			border-radius: 14rpx;
		}

		.option-panel__grid-text {
			margin-top: 10rpx;
			color: #333333;
			font-size: 22rpx;
			text-align: center;
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

		.option-row__left {
			min-width: 0;
		}

		.option-row {
			min-height: 50rpx;
		}

		.option-row__icon {
			width: 38rpx;
			height: 38rpx;
			flex: none;
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
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 210rpx;
			height: 64rpx;
			margin-left: 18rpx;
			padding: 0 22rpx 0 18rpx;
			color: #ffffff;
			background: url('https://shengyuan.store/api/miniapp/files/miniapp/2ea924839ffd492da81800a02655c339/c922c5cecffb59ce657b550342816bf3.png') center/100% 100% no-repeat;
			box-sizing: border-box;
		}

		.coupon-badge__amount {
			max-width: 96rpx;
			font-size: 26rpx;
			font-weight: 700;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.coupon-badge__condition {
			max-width: 72rpx;
			font-size: 18rpx;
			line-height: 22rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.coupon-none {
			margin-left: 18rpx;
			color: #999999;
			font-size: 24rpx;
		}

		.coupon-popup-list {
			padding: 18rpx 24rpx 34rpx;
		}

		.coupon-popup-ticket {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 150rpx;
			margin-bottom: 18rpx;
			padding: 0 34rpx 0 36rpx;
			color: #ffffff;
			background: url('https://shengyuan.store/api/miniapp/files/miniapp/2ea924839ffd492da81800a02655c339/c922c5cecffb59ce657b550342816bf3.png') center/100% 100% no-repeat;
			box-sizing: border-box;
		}

		.coupon-popup-ticket__main {
			min-width: 0;
		}

		.coupon-popup-ticket__amount {
			font-size: 44rpx;
			font-weight: 700;
			line-height: 54rpx;
		}

		.coupon-popup-ticket__condition {
			max-width: 360rpx;
			margin-top: 8rpx;
			font-size: 22rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.coupon-popup-ticket__action {
			flex: none;
			width: 104rpx;
			height: 48rpx;
			color: #ff4b4b;
			font-size: 24rpx;
			font-weight: 600;
			line-height: 48rpx;
			text-align: center;
			background: #ffffff;
			border-radius: 24rpx;
		}

		.coupon-empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 700rpx;
			padding: 0 48rpx;
			text-align: center;
		}

		.coupon-empty__title {
			color: #222222;
			font-size: 30rpx;
			font-weight: 500;
		}

		.coupon-empty__desc {
			margin-top: 16rpx;
			color: #999999;
			font-size: 24rpx;
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

		.group-record__avatar {
			width: 80rpx;
			height: 80rpx;
			flex: none;
			border-radius: 50%;
			background: linear-gradient(135deg, #e8f2ff 0%, #c7defc 100%);
		}

		.group-record__avatar-image,
		.team-avatar {
			width: 80rpx;
			height: 80rpx;
			flex: none;
			border-radius: 50%;
			background: #eef4ff;
		}

		.team-avatar--empty {
			background: linear-gradient(135deg, #e8f2ff 0%, #c7defc 100%);
		}

		.empty-state {
			color: #999999;
			font-size: 26rpx;
			text-align: center;
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

		.group-record__empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 34rpx 24rpx 44rpx;
			color: #999999;
			font-size: 26rpx;
		}

		.group-record__empty-icon {
			width: 88rpx;
			height: 88rpx;
			margin-bottom: 18rpx;
			border-radius: 50%;
			background: linear-gradient(135deg, #edf5ff 0%, #d7e7fb 100%);
		}

		.group-record__empty-desc {
			margin-top: 8rpx;
			font-size: 22rpx;
			color: #c0c4cc;
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
			height: 142rpx;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			box-sizing: content-box;
			padding: 0 26rpx env(safe-area-inset-bottom);
			align-items: center;
			box-shadow: 0 -6rpx 14rpx rgba(128, 128, 128, 0.08);
			border-top-left-radius: 20rpx;
			border-top-right-radius: 20rpx;

			.btn {
				width: 64rpx;
				height: 100%;
				margin-right: 8rpx;
				position: relative;
				line-height: 1.3;
				white-space: nowrap;

				.icon-md {
					width: 40rpx;
					height: 40rpx;
				}

				text {
					margin-top: 6rpx;
					font-size: 20rpx;
				}
			}

			.goods-cart-badge {
				position: absolute;
				top: 18rpx;
				right: -10rpx;
				z-index: 2;
				display: flex;
				align-items: center;
				justify-content: center;
				min-width: 28rpx;
				height: 28rpx;
				padding: 0 8rpx;
				box-sizing: border-box;
				border-radius: 14rpx;
				background: #ff2c3c;
				color: #ffffff;
				font-size: 20rpx;
				line-height: 28rpx;
			}

			.footer-action {
				display: flex;
				align-items: center;
				flex: none;
				width: 425rpx;
				height: 80rpx;
				margin-left: 46rpx;
				padding: 0;
				color: #ffffff;
				background: #037dfa;
				border-radius: 40rpx;
			}

			.footer-action__avatars {
				display: flex;
				align-items: center;
				flex: none;
				margin-left: 17rpx;
			}

			.footer-action__avatar {
				width: 42rpx;
				height: 42rpx;
				background: #ffffff;
				border-radius: 50%;
			}

			.footer-action__avatar--middle {
				margin: 0 -42rpx;
				background: #c7e3ff;
			}

			.footer-action__count {
				width: 132rpx;
				margin-left: 46rpx;
				font-size: 24rpx;
				font-weight: 500;
				line-height: 24rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.footer-action__divider {
				width: 1rpx;
				height: 20rpx;
				flex: none;
				margin-left: 35rpx;
				background: rgba(255, 255, 255, 0.5);
			}

			.footer-action__text {
				flex: none;
				margin-left: 30rpx;
				font-size: 28rpx;
				font-weight: 500;
				line-height: 28rpx;
				white-space: nowrap;
			}

		}

		.goods-share-scene {
			width: 750rpx;
			max-height: calc(100vh - 80rpx);
			padding: 40rpx 0 28rpx;
			box-sizing: border-box;
			overflow-y: auto;
		}

		.goods-share-shop {
			display: flex;
			width: 540rpx;
			max-width: calc(100vw - 96rpx);
			min-height: 190rpx;
			margin: 0 auto;
			padding: 23rpx 29rpx;
			box-sizing: border-box;
			border-radius: 28rpx;
			background: linear-gradient(135deg, rgba(3, 125, 250, 0.96), rgba(3, 172, 250, 0.9));
			box-shadow: 0 20rpx 44rpx rgba(0, 84, 184, 0.24);
		}

		.goods-share-shop__logo {
			flex: none;
			width: 132rpx;
			height: 132rpx;
			border-radius: 10rpx;
			background: #ffffff;
			border: 4rpx solid rgba(255, 255, 255, 0.82);
		}

		.goods-share-shop__body {
			flex: 1;
			min-width: 0;
			margin-left: 27rpx;
			padding-top: 14rpx;
			color: #ffffff;
		}

		.goods-share-shop__name {
			font-size: 28rpx;
			font-weight: 500;
			line-height: 28rpx;
		}

		.goods-share-shop__rating,
		.goods-share-shop__time {
			display: flex;
			align-items: center;
			min-width: 0;
			font-size: 24rpx;
			font-weight: 500;
			white-space: nowrap;
		}

		.goods-share-shop__rating {
			margin-top: 16rpx;
		}

		.goods-share-shop__time-icon {
			flex: none;
			width: 25rpx;
			height: 25rpx;
			margin-right: 8rpx;
		}

		.goods-share-shop__time {
			margin-top: 10rpx;
			font-size: 26rpx;
		}

		.goods-share-shop__star {
			flex: none;
			display: block;
			width: 24rpx;
			height: 23rpx;
			margin-right: 3rpx;
		}

		.goods-share-shop__score {
			flex: none;
			margin-left: 6rpx;
			line-height: 1;
		}

		.goods-share-shop__time-text {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.goods-share-close {
			display: block;
			width: 48rpx;
			height: 48rpx;
			margin: 24rpx auto 0;
		}

		.goods-share-panel {
			width: 620rpx;
			max-width: calc(100vw - 64rpx);
			margin: 18rpx auto 0;
			padding: 28rpx 24rpx 28rpx;
			box-sizing: border-box;
			border-radius: 30rpx;
			background: #ffffff;
			box-shadow: 0 24rpx 70rpx rgba(0, 82, 176, 0.22);
		}

		.goods-share-main {
			width: 100%;
			height: 46vh;
			max-height: 510rpx;
			min-height: 320rpx;
			border-radius: 23rpx;
			background: #d5d5d5;
		}

		.goods-share-info {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 19rpx;
			padding: 0 2rpx;
		}

		.goods-share-price {
			color: #ff1919;
			font-weight: 500;
			line-height: 1;
		}

		.goods-share-price__symbol,
		.goods-share-price__decimal {
			font-size: 26rpx;
		}

		.goods-share-price__main {
			font-size: 51rpx;
		}

		.goods-share-tip {
			margin-top: 21rpx;
			color: #666666;
			font-size: 24rpx;
			font-weight: 400;
		}

		.goods-share-qrcode {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 124rpx;
			height: 124rpx;
			border-radius: 6rpx;
			background: #f3f3f3;
			overflow: hidden;
		}

		.goods-share-qrcode__image {
			width: 124rpx;
			height: 124rpx;
		}

		.goods-share-qrcode__loading {
			color: #999999;
			font-size: 22rpx;
		}

		.goods-share-actions {
			display: flex;
			justify-content: space-between;
			gap: 20rpx;
			margin: 28rpx 16rpx 0;
		}

		.goods-share-action {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			min-width: 0;
			height: 81rpx;
			padding: 0;
			border-radius: 40rpx;
			background: #037dfa;
			color: #ffffff;
			font-size: 28rpx;
			font-weight: 500;
			line-height: 81rpx;
		}

		.goods-share-action--save {
			background: #03acfa;
		}

		.goods-share-action::after {
			border: 0;
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
				background: url('https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/bg_packet_img.png');
				width: 241rpx;
				height: 208rpx;
				background-size: 100%;
				padding-top: 20rpx;
				text-align: center;
			}
		}
	}
</style>
