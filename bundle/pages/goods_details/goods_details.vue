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
						<image class="goods-hero-image" :src="item" mode="aspectFit"></image>
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
			<!-- 鎷煎洟 -->
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
						<image class="merchant-card__avatar" :src="shareShopLogo" mode="aspectFill"></image>
						<view class="merchant-card__name line1">{{ goodsDetail.shop_name || '店铺名称' }}</view>
						<u-icon name="arrow-right" size="22" color="#ffffff"></u-icon>
					</view>
					<view class="merchant-card__follow" @tap.stop="toggleShopSubscribe">{{ shopSubscribed ? '已订阅' : '+订阅' }}</view>
				</view>
				<view class="merchant-card__body">
					<view class="merchant-card__price-row row-between">
						<view class="merchant-card__price-box">
							<view class="merchant-card__price">
								<price-format :first-size="46" :second-size="32" :subscript-size="32"
									:price="goodsType == 2 ? displayTeamPrice : displayMinPrice"
									:weight="500"></price-format>
								<text class="merchant-card__price-tag">{{ goodsType == 2 ? '拼团价' : '售价' }}</text>
							</view>
						</view>
						<view class="merchant-card__share" @tap.stop="showShareBtn = true">
							<image class="merchant-card__share-icon" src="https://shengyuan.store/api/miniapp/files/miniapp/d8f8eba765024dd7ad1bf7ced9c0ea8c/c2187248f261c091ca3024ebe0b55c41.png" mode="aspectFit"></image>
							<text>分享</text>
						</view>
					</view>
					<view class="merchant-card__price-meta">
						<view class="merchant-card__meta-item">
							<text class="merchant-card__meta-label">到手价</text>
							<text class="merchant-card__meta-value">¥{{ displayMinPrice }}</text>
						</view>
						<view v-if="Number(displayMarketPrice) > Number(displayMinPrice)" class="merchant-card__meta-item">
							<text class="merchant-card__meta-label">原价</text>
							<text class="merchant-card__meta-market">¥{{ displayMarketPrice }}</text>
						</view>
						<view class="merchant-card__meta-item">
							<text class="merchant-card__meta-label">抢购</text>
							<text class="merchant-card__meta-value">{{ goodsDetail.sales_sum || 0 }}人</text>
						</view>
					</view>
					<view class="merchant-card__title">{{ goodsDetail.name }}</view>
					<view v-if="goodsDetail.subtitle || goodsDetail.remark" class="merchant-card__desc">{{ goodsDetail.subtitle || goodsDetail.remark }}</view>
					<view v-if="goodsDisplayTags.length" class="merchant-card__tags">
						<text v-for="tag in goodsDisplayTags" :key="tag" class="merchant-card__tag">{{ tag }}</text>
					</view>
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
				<view v-if="styleViewMode === 'list'" class="option-panel__scroll">
					<view class="option-panel__thumbs">
						<image
							v-for="(item, index) in previewImages"
							:key="index"
							:class="['option-panel__thumb', index === activePreviewIndex ? 'is-active' : '']"
							:src="item"
							mode="aspectFit"
							@tap="selectPreviewImage(index)"
						></image>
					</view>
				</view>
				<view v-else class="option-panel__grid">
					<view
						v-for="(item, index) in previewImages"
						:key="index"
						:class="['option-panel__grid-item', index === activePreviewIndex ? 'is-active' : '']"
						@tap="selectPreviewImage(index)"
					>
						<image class="option-panel__grid-image" :src="item" mode="aspectFit"></image>
						<view class="option-panel__grid-text">款式{{ index + 1 }}</view>
					</view>
				</view>
				<view class="option-panel__line"></view>
				<view class="option-row">
					<image class="option-row__icon" src="https://shengyuan.store/api/miniapp/files/miniapp/7a9d1bcad0d34f018ff8859f514e160a/54a41e25c94ab8c39497ccfe5bb91ece.png" mode="aspectFit"></image>
					<text class="option-row__text">{{ freightText }}</text>
				</view>
				<view v-if="showGoodsCouponEntry || showGoodsPointsEntry" class="option-panel__line option-panel__line--thin"></view>
				<view v-if="showGoodsCouponEntry" class="option-row option-row--coupon" @tap="showGoodsCoupon = true">
					<view class="option-row__coupon-icon">券</view>
					<view class="option-row__coupon-content">
						<view class="option-row__coupon-title">优惠券</view>
						<view class="option-row__coupon-text line1">{{ goodsCouponSummary }}</view>
					</view>
					<view class="option-row__coupon-action">领取</view>
				</view>
				<view v-if="showGoodsCouponEntry && showGoodsPointsEntry" class="option-panel__line option-panel__line--thin"></view>
				<view v-if="showGoodsPointsEntry" class="option-row option-row--benefit" @tap="showGoodsPoints = true">
					<view class="option-row__benefit-icon">积</view>
					<view class="option-row__coupon-content">
						<view class="option-row__coupon-title">积分</view>
						<view class="option-row__benefit-text line1">{{ optionPointsBenefit.text }}</view>
					</view>
					<view class="option-row__more"></view>
				</view>
			</view>
			<view v-if="visibleMarketingBenefits.length" class="marketing-panel bg-white mt20">
				<view class="marketing-panel__title">营销优惠</view>
				<view v-for="item in visibleMarketingBenefits" :key="item.key" class="marketing-panel__row">
					<text class="marketing-panel__tag">{{ item.tag }}</text>
					<text class="marketing-panel__text line1">{{ item.text }}</text>
				</view>
			</view>
			<view v-if="!goodsType" class="spec row bg-white mt20" @tap="showSpecFun(0)">
				<view class="text lighter">已选</view>
				<view class="line1 mr20" style="flex: 1;">{{ selectedSpecText }}</view>
				<image class="icon-sm" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"></image>
			</view>
			<view class="evaluation bg-white mt20">
				<navigator hover-class="none" :url="'/bundle_order/pages/all_comments/all_comments?id=' + goodsDetail.id" class="title row-between">
					<view class="evaluation-title">
						<text class="evaluation-title__main">商品评价({{ comment.total || 0 }})</text>
						<text v-if="comment.percent" class="evaluation-title__rate">好评率 {{ comment.percent }}</text>
					</view>
					<view class="row">
						<text class="lighter">查看全部</text>
						<image class="icon-sm" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/arrow_right.png"></image>
					</view>
				</navigator>
				<view class="con" v-if="hasCommentContent">
					<view class="user-info">
						<view :class="['comment-avatar-wrap', comment.is_anonymous ? 'is-anonymous' : '']">
							<image v-if="!comment.is_anonymous && comment.avatar" class="avatar" :src="resolveAvatar(comment.avatar)" mode="aspectFill"></image>
							<text v-else class="comment-avatar-text">匿</text>
						</view>
						<view class="comment-user-main">
							<view class="comment-user-row">
								<view class="user-name line1">{{ comment.is_anonymous ? '匿名用户' : (comment.nickname || '匿名用户') }}</view>
								<view v-if="comment.is_anonymous" class="comment-anonymous-tag">匿名</view>
							</view>
							<view class="comment-stars">
								<text
									v-for="star in 5"
									:key="star"
									:class="['comment-star', star <= commentScore(comment) ? 'is-active' : '']"
								>★</text>
								<text class="comment-score">{{ commentScore(comment) }}分</text>
							</view>
						</view>
					</view>
					<view class="comment-meta" v-if="comment.create_time || displayCommentSpec(comment)">
						<text>{{ formatDisplayTime(comment.create_time) || '刚刚' }}</text>
						<text v-if="displayCommentSpec(comment)">{{ displayCommentSpec(comment) }}</text>
					</view>
					<view class="comment-tag-row" v-if="comment.tags && comment.tags.length">
						<text v-for="(tag, index) in comment.tags" :key="index" class="comment-tag">{{ tag }}</text>
					</view>
					<view v-if="comment.comment" class="dec">{{ comment.comment }}</view>
					<view v-else class="dec dec--empty">用户未填写文字评价</view>
					<view class="comment-images" v-if="comment.image && comment.image.length">
						<view
							v-for="(img, index) in comment.image"
							:key="index"
							class="comment-image"
							@tap="previewCommentImage(img, comment.image)"
						>
							<image :src="resolveGoodsImage(img)" mode="aspectFill"></image>
						</view>
					</view>
					<view class="comment-append" v-if="comment.append_comment || (comment.append_image && comment.append_image.length)">
						<view class="comment-append__title">
							<text>追评</text>
							<text v-if="comment.append_time" class="comment-append__time">{{ formatDisplayTime(comment.append_time) }}</text>
						</view>
						<view class="comment-append__text" v-if="comment.append_comment">{{ comment.append_comment }}</view>
						<view class="comment-images comment-images--append" v-if="comment.append_image && comment.append_image.length">
							<view
								v-for="(img, index) in comment.append_image"
								:key="index"
								class="comment-image"
								@tap="previewCommentImage(img, comment.append_image)"
							>
								<image :src="resolveGoodsImage(img)" mode="aspectFill"></image>
							</view>
						</view>
					</view>
					<view class="comment-score-tags" v-if="comment.description_comment || comment.service_comment || comment.express_comment">
						<view v-if="comment.description_comment" class="comment-score-tag">描述相符 {{ comment.description_comment }}分</view>
						<view v-if="comment.service_comment" class="comment-score-tag">服务态度 {{ comment.service_comment }}分</view>
						<view v-if="comment.express_comment" class="comment-score-tag">配送服务 {{ comment.express_comment }}分</view>
					</view>
					<view class="comment-reply" v-if="comment.reply">
						<view class="comment-reply__title">{{ comment.reply_user || '商家回复' }}</view>
						<view class="comment-reply__text">{{ comment.reply }}</view>
						<view class="comment-reply__time" v-if="comment.reply_time">{{ formatDisplayTime(comment.reply_time) }}</view>
					</view>
					<view class="comment-like" v-if="comment.like_count">赞 {{ comment.like_count }}</view>
				</view>
				<view class="con empty-state" v-else>暂无评价</view>
			</view>

			<view class="group-record bg-white mt20" v-if="groupRecords.length">
				<view class="group-record__head">
					<view class="group-record__title">跟团记录</view>
					<view class="group-record__summary">{{ groupFooterCount || groupRecords.length }}人已跟团</view>
				</view>
				<view v-for="(item, index) in groupRecords" :key="index" class="group-record__item">
					<image v-if="item.avatar" class="group-record__avatar-image" :src="resolveAvatar(item.avatar)" mode="aspectFill"></image>
					<view v-else class="group-record__avatar">{{ item.initial }}</view>
					<view class="group-record__content">
						<view class="group-record__name">{{ item.name }}</view>
						<view class="group-record__time">{{ item.time ? formatDisplayTime(item.time) : '刚刚跟团' }}</view>
						<view class="group-record__meta" v-if="item.statusText || item.needText">{{ item.statusText || item.needText }}</view>
					</view>
					<view class="group-record__side">
						<view class="group-record__plus">+{{ item.join || 1 }}</view>
						<view class="group-record__side-text">参团</view>
					</view>
				</view>
			</view>

			<view class="group-record bg-white mt20" v-else>
				<view class="group-record__head">
					<view class="group-record__title">跟团记录</view>
				</view>
				<view class="group-record__empty">
					<view class="group-record__empty-icon"></view>
					<view>暂无跟团记录</view>
					<view class="group-record__empty-desc">成为第一个跟团的人吧</view>
				</view>
			</view>
			<view class="goods-extra bg-white mt20" v-if="goodsInfoRows.length">
				<view class="goods-extra__title">商品信息</view>
				<view class="goods-extra__grid">
					<view v-for="row in goodsInfoRows" :key="row.label" class="goods-extra__item">
						<view class="goods-extra__label">{{ row.label }}</view>
						<view class="goods-extra__value">{{ row.value }}</view>
					</view>
				</view>
			</view>
			<view class="details bg-white mt20" v-if="goodsDetailContent">
				<view class="title md normal">商品详情</view>
				<view class="content">
					<rich-text :nodes="goodsDetailContent"></rich-text>
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
						<view class="sm">团满即成团</view>
					</view>
					<view class="line"></view>
					<view class="row step">
						<view class="number xxs">3</view>
						<view class="sm">满员发货</view>
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
										人成团</text>
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
						<image
							v-for="(avatar, index) in groupFooterAvatars"
							:key="index"
							:class="['footer-action__avatar', index === 1 ? 'footer-action__avatar--middle' : '']"
							:src="avatar"
							mode="aspectFill"
						></image>
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
			:selected-sku-id="checkedGoods.item_id || checkedGoods.sku_id || checkedGoods.skuId || checkedGoods.id"
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
					<view class="goods-share-title line2">{{ goodsDetail.name || '商品详情' }}</view>
					<view class="goods-share-meta line1">{{ shareShopName }} · 已售{{ goodsDetail.sales_sum || 0 }}</view>
					<view class="goods-share-info">
						<view class="goods-share-price">
							<text class="goods-share-price__symbol">¥</text><text class="goods-share-price__main">{{ sharePriceMain }}</text><text class="goods-share-price__decimal">{{ sharePriceDecimal }}</text>
							<view class="goods-share-tip">扫码查看商品</view>
						</view>
						<view class="goods-share-qrcode">
							<image v-if="shareQrcodeIsImage" class="goods-share-qrcode__image" :src="shareQrcode" mode="aspectFit"></image>
							<tki-qrcode
								v-else-if="shareQrcode"
								cid="goods-share-qrcode"
								:val="shareQrcode"
								:size="180"
								:onval="true"
								:load-make="true"
								:show-loading="false"
								@result="onGoodsShareQrcodeResult"
							></tki-qrcode>
							<view v-else class="goods-share-qrcode__loading">二维码</view>
						</view>
					</view>
                    <view class="goods-share-actions">
                        <view class="goods-share-action goods-share-action--save" @tap="saveShareImage">保存图片</view>
                        <button class="goods-share-action" open-type="share">分享商品</button>
                    </view>
				</view>
				<image class="goods-share-close" :src="shareCloseIcon" mode="aspectFit" @tap="showShareBtn = false"></image>
			</view>
		</u-popup>
		<u-popup v-model="showGoodsCoupon" border-radius="14" mode="bottom" closeable>
			<view class="pop-title row-between">
				<view class="title">优惠券</view>
			</view>
			<view v-if="showGoodsCoupon">
				<view class="coupon-tabs">
					<view :class="['coupon-tab', goodsCouponTabIndex === 0 ? 'is-active' : '']" @tap="goodsCouponTabIndex = 0">可领取优惠券 ({{ claimableGoodsCoupons.length }})</view>
					<view :class="['coupon-tab', goodsCouponTabIndex === 1 ? 'is-active' : '']" @tap="goodsCouponTabIndex = 1">已领取优惠券 ({{ receivedGoodsCoupons.length }})</view>
				</view>
				<scroll-view class="coupon-scroll" scroll-y>
					<view class="coupon-obj">
						<view
							v-for="(item, index) in currentGoodsCouponList"
							:key="couponKey(item) || `goods-coupon-${goodsCouponTabIndex}-${index}`"
							class="coupon-card"
							:class="{'coupon-card--received': goodsCouponTabIndex === 1}"
						>
							<view class="coupon-item row">
								<view class="price white column-center">
									<price-format :subscript-size="34" :first-size="60" :second-size="50" :price="couponAmountValue(item)" :weight="500"></price-format>
									<view class="nr">{{ couponConditionText(item) }}</view>
								</view>
								<view class="row-between coupon-info-wrap">
									<view class="info ml20">
										<view class="bold md mb10 line1">{{ couponName(item) }}</view>
										<view class="xxs lighter mb10">{{ couponTypeText(item) }}</view>
										<view class="xxs lighter">{{ couponTimeText(item) }}</view>
									</view>
									<view
										v-if="goodsCouponTabIndex === 0"
										:class="['coupon-receive-btn', couponButtonDisabled(item) ? 'coupon-receive-btn--disabled' : '']"
										:data-coupon-index="index"
										:data-coupon-key="couponStableKey(item, index, 'claimable')"
										data-coupon-list="claimable"
										@tap.stop="receiveGoodsCouponByEvent"
									>{{ couponButtonText(item) }}</view>
									<view v-else class="coupon-receive-btn coupon-receive-btn--disabled">已领取</view>
								</view>
							</view>
							<view class="coupon-tips xs" v-if="item.tips">{{ localizeCouponText(item.tips) }}</view>
						</view>
					</view>
					<view v-if="!currentGoodsCouponList.length" class="coupon-empty column-center">
						<text class="muted">暂无优惠券</text>
					</view>
				</scroll-view>
				<view class="column-center">
					<view class="coupon-confirm bg-primary white row-center br60 mb10 lg" @tap="showGoodsCoupon = false">确定</view>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showGoodsPoints" border-radius="14" mode="bottom" closeable>
			<view class="pop-title row-between">
				<view class="title">积分说明</view>
			</view>
			<view class="points-pop">
				<view v-for="item in pointsBenefitRows" :key="item.label" class="points-pop__row">
					<view class="points-pop__label">{{ item.label }}</view>
					<view class="points-pop__value">{{ item.value }}</view>
				</view>
				<view class="points-pop__confirm bg-primary white row-center br60 lg" @tap="showGoodsPoints = false">确定</view>
			</view>
		</u-popup>
		<canvas canvas-id="goodsShareCanvas" id="goodsShareCanvas" class="share-canvas"></canvas>
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
					好友下单最高可赚</view>
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
import UBackTop from '@/bundle/components/uview-ui/components/u-back-top/u-back-top.vue'
import GoodsLike from '@/components/goods-like/goods-like.vue'
	import SpecPopup from '@/bundle/components/spec-popup/spec-popup.vue'
	import TkiQrcode from '@/bundle/components/tki-qrcode/tki-qrcode.vue'
	import {
		getGoodsDetail,
		getCommentList,
		addCart
	} from '@/api/store';
	import {
		collectGoods,
		getCoupon,
		} from '@/api/user';
	import {
		teamCheck
	} from '@/api/activity';
	import {
		subscribeShop
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
	import { baseURL } from '@/config/app'
	import PriceFormat from '@/bundle/components/price-format/price-format.vue'
	import { formatCouponText } from '@/utils/backend-text'
	export default {
		components: {
			GoodsLike,
			PriceFormat,
			Navbar,
			UPopup,
			UCountDown,
			UIcon,
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
				showGoodsCoupon: false,
				goodsCouponTabIndex: 0,
				showGoodsPoints: false,
				showShareBtn: false,
				shareQrcode: '',
				shareQrcodeIsImage: false,
				shareQrcodeTempImage: '',
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
				comment: {},
				countTime: 0,
				tagStyle: {
					img: 'width:100%;'
				},
				team: {},
				teamFound: [],
				isGroup: 0,
				id: '',
				targetSkuId: '',
				showDownload: false,
				distribution: {},
				groupRecords: [],
				fetchingDetail: false,
				receivingCouponId: '',
				receivedCouponIds: [],
				shareCloseIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/87c0300dafb0450ea11fc2bc5b76c91b/676d68646053824b88f084648bfc6594.png',
				shareStarIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/418affabb42a4f2692e1d894a8f6411c/6ab9b0b9917a09a6d5fdab80e40bf103.png',
				shareTimeIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/81a56cbe3aee49449a4f1014a8a90109/4a0776d08638585f2aaac7f04bf1a07d.png'
			};
		},
			onLoad(options) {
			this.onPageScroll = trottle(this.onPageScroll, 500, this)
			if (options && options.q) {
				options = Object.assign({}, options, this.parseGoodsShareQrcodeOptions(decodeURIComponent(options.q)));
			}
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
			this.targetSkuId = options.skuId || options.itemId || options.item_id || '';
			this.loadReceivedCouponCache();
		},
		onShow() {
			if (!this.id) return;
			this.loadReceivedCouponCache();
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
			goodsShareLink() {
				const inviteCode = this.userInfo.distribution_code || this.$store.getters.inviteCode || '';
				const params = [`id=${encodeURIComponent(this.id || '')}`];
				if (inviteCode) params.push(`invite_code=${encodeURIComponent(inviteCode)}`);
				if (this.targetSkuId) params.push(`skuId=${encodeURIComponent(this.targetSkuId)}`);
				return `/bundle/pages/goods_details/goods_details?${params.join('&')}`;
			},
			goodsShareUrl() {
				return `${baseURL}${this.goodsShareLink()}`;
			},
			parseGoodsShareQrcodeOptions(url) {
				const query = String(url || '').split('?')[1];
				if (!query) return {};
				return query.split('#')[0].split('&').reduce((params, item) => {
					const [key, value = ''] = item.split('=');
					if (key) params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
					return params;
				}, {});
			},
			async prepareGoodsShareQrcode() {
				const qrcodeValue = this.shareQrcode || this.goodsShareUrl();
				if (this.shareQrcode) return;
				this.shareQrcodeTempImage = '';
				this.shareQrcode = qrcodeValue;
				this.shareQrcodeIsImage = false;
			},
			onGoodsShareQrcodeResult(result) {
				this.shareQrcodeTempImage = typeof result === 'string' ? result : '';
			},
			waitForGoodsShareQrcodeImage() {
				if (this.shareQrcodeIsImage || this.shareQrcodeTempImage) return Promise.resolve();
				return new Promise((resolve) => {
					let count = 0;
					const timer = setInterval(() => {
						count += 1;
						if (this.shareQrcodeTempImage || count >= 8) {
							clearInterval(timer);
							resolve();
						}
					}, 100);
				});
			},
			commentScore(item = {}) {
				const score = Number(item.goods_rate || item.goods_comment || item.score || 5)
				if (!score || score < 1) return 5
				return Math.max(1, Math.min(5, Math.round(score)))
			},
			displayCommentSpec(item = {}) {
				const text = String(item.spec_value_str || '').trim()
				if (!text || /^\d+$/.test(text)) return ''
				return text
			},
			resolveAvatar(avatar) {
				return resolveImage(avatar, 'avatar')
			},
			resolveGoodsImage(image) {
				return resolveImage(image, 'goods')
			},
			previewCommentImage(current, urls = []) {
				const imageUrls = (urls || []).filter(Boolean).map(image => this.resolveGoodsImage(image))
				if (!imageUrls.length) return
				uni.previewImage({
					current: this.resolveGoodsImage(current),
					urls: imageUrls
				})
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
					`goodsImage=${encodeURIComponent(this.goodsDetail.image || '')}`,
					`shopId=${encodeURIComponent(this.goodsDetail.shop_id || this.goodsDetail.shopId || '')}`,
					`shopName=${encodeURIComponent(this.shareShopName || '')}`,
					`price=${encodeURIComponent(this.sharePriceText || '')}`
				].join('&')
				uni.navigateTo({ url: `/bundle_user/pages/contact_offical/contact_offical?${params}` })
			},
			isImportSourceField(label, value) {
				const text = `${label || ''}${value || ''}`.toLowerCase()
				return /1688|阿里巴巴|alibaba|导入|采集|货源|供应商|supplier|source|external|third/.test(text)
			},
			getShopSubscribeCacheKey(shopId) {
				return `shop_subscribed_${shopId}`
			},
			getCachedShopSubscribed(shopId) {
				if (!shopId) return undefined
				const value = uni.getStorageSync(this.getShopSubscribeCacheKey(shopId))
				return value === '' || value === undefined || value === null ? undefined : Boolean(value)
			},
			async saveShareImage() {
				await this.prepareGoodsShareQrcode();
				await this.waitForGoodsShareQrcodeImage();
				// #ifdef H5
				uni.showToast({ title: '请长按图片保存', icon: 'none' });
				// #endif
				// #ifndef H5
				try {
					const posterPath = await this.drawGoodsSharePoster();
					this.saveImageToAlbum(posterPath);
					return;
				} catch (error) {
					uni.hideLoading();
				}
				const candidates = [
					this.shareQrcodeIsImage ? this.shareQrcode : '',
					this.goodsDetail.poster,
					this.goodsDetail.shareImage,
					this.goodsDetail.share_image,
					this.goodsDetail.image,
					this.previewImages[0]
				].filter(Boolean).map(item => this.resolveGoodsImage(item));
				this.saveImageCandidates([...new Set(candidates)]);
				// #endif
			},
			saveImageToAlbum(filePath) {
				uni.saveImageToPhotosAlbum({
					filePath,
					success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
					fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
				});
			},
			getImageInfo(src) {
				return new Promise((resolve, reject) => {
					if (!src) return reject(new Error('empty image'));
					uni.getImageInfo({
						src,
						success: (res) => {
							if (!res || Number(res.width || 0) <= 0 || Number(res.height || 0) <= 0 || !res.path) {
								reject(new Error('invalid image size'));
								return;
							}
							resolve(res);
						},
						fail: reject
					});
				});
			},
			isDrawableImage(image) {
				return image && image.path && Number(image.width || 0) > 0 && Number(image.height || 0) > 0;
			},
			drawRoundRect(ctx, x, y, width, height, radius) {
				ctx.beginPath();
				ctx.moveTo(x + radius, y);
				ctx.lineTo(x + width - radius, y);
				ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
				ctx.lineTo(x + width, y + height - radius);
				ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
				ctx.lineTo(x + radius, y + height);
				ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
				ctx.lineTo(x, y + radius);
				ctx.quadraticCurveTo(x, y, x + radius, y);
				ctx.closePath();
			},
			drawTextLine(ctx, text, x, y, maxWidth) {
				let line = '';
				const value = String(text || '');
				for (let i = 0; i < value.length; i++) {
					const testLine = line + value[i];
					if (ctx.measureText(testLine).width > maxWidth) break;
					line = testLine;
				}
				ctx.fillText(line, x, y);
			},
			drawTextLines(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
				let line = '';
				let lineCount = 0;
				const value = String(text || '');
				for (let i = 0; i < value.length; i++) {
					const char = value[i];
					const testLine = line + char;
					if (ctx.measureText(testLine).width > maxWidth && line) {
						ctx.fillText(line, x, y + lineCount * lineHeight);
						lineCount += 1;
						if (lineCount >= maxLines) return lineCount;
						line = char;
					} else {
						line = testLine;
					}
				}
				if (line && lineCount < maxLines) {
					ctx.fillText(line, x, y + lineCount * lineHeight);
					lineCount += 1;
				}
				return lineCount;
			},
			async drawGoodsSharePoster() {
				uni.showLoading({ title: '保存中...', mask: true });
				const ctx = uni.createCanvasContext('goodsShareCanvas', this);
				const goodsImage = await this.getImageInfo(this.resolveGoodsImage(this.goodsDetail.poster || this.goodsDetail.image || this.previewImages[0]));
				const shopLogo = await this.getImageInfo(this.shareShopLogo).catch(() => null);
				const qrcodeSource = this.shareQrcodeIsImage ? this.shareQrcode : this.shareQrcodeTempImage;
				const qrcode = qrcodeSource ? await this.getImageInfo(qrcodeSource).catch(() => null) : null;
				ctx.setFillStyle('#f3f8ff');
				ctx.fillRect(0, 0, 320, 570);
				ctx.setFillStyle('#037dfa');
				this.drawRoundRect(ctx, 16, 18, 288, 76, 14);
				ctx.fill();
				if (this.isDrawableImage(shopLogo)) ctx.drawImage(shopLogo.path, 30, 34, 40, 40);
				ctx.setFillStyle('#ffffff');
				ctx.setFontSize(15);
				this.drawTextLine(ctx, this.shareShopName, 80, 49, 178);
				ctx.setFontSize(11);
				this.drawTextLine(ctx, `营业时间：${this.shareBusinessTime}`, 80, 70, 190);
				ctx.setFillStyle('#ffffff');
				this.drawRoundRect(ctx, 16, 82, 288, 454, 14);
				ctx.fill();
				ctx.drawImage(goodsImage.path, 30, 102, 260, 220);
				ctx.setFillStyle('#202124');
				ctx.setFontSize(16);
				const titleLines = this.drawTextLines(ctx, this.goodsDetail.name || '商品详情', 30, 350, 260, 22, 3);
				const infoTop = 350 + titleLines * 22 + 12;
				ctx.setFillStyle('#8b95a5');
				ctx.setFontSize(12);
				this.drawTextLine(ctx, `${this.shareShopName} · 已售${this.goodsDetail.sales_sum || 0}`, 30, infoTop, 260);
				ctx.setFillStyle('#ff2e2e');
				ctx.setFontSize(14);
				ctx.fillText('¥', 30, 494);
				ctx.setFontSize(30);
				ctx.fillText(this.sharePriceMain, 46, 495);
				ctx.setFontSize(14);
				ctx.fillText(this.sharePriceDecimal, 46 + String(this.sharePriceMain).length * 18, 494);
				ctx.setFillStyle('#8b95a5');
				ctx.setFontSize(11);
				ctx.fillText('扫码查看商品', 30, 518);
				ctx.setFillStyle('#f7f9fc');
				this.drawRoundRect(ctx, 174, 404, 116, 116, 8);
				ctx.fill();
				if (this.isDrawableImage(qrcode)) {
					ctx.drawImage(qrcode.path, 181, 411, 102, 102);
				} else {
					ctx.setFillStyle('#037dfa');
					ctx.setFontSize(12);
					ctx.fillText('二维码', 218, 468);
				}
				return new Promise((resolve, reject) => {
					ctx.draw(false, () => {
						uni.canvasToTempFilePath({
							canvasId: 'goodsShareCanvas',
							width: 320,
							height: 570,
							destWidth: 640,
							destHeight: 1140,
							success: (res) => {
								uni.hideLoading();
								resolve(res.tempFilePath);
							},
							fail: (err) => {
								uni.hideLoading();
								reject(err);
							}
						}, this);
					});
				});
			},
			saveImageCandidates(list) {
				const [imageUrl, ...rest] = list;
				if (!imageUrl) return uni.showToast({ title: '暂无可保存图片', icon: 'none' });
				const saveFile = (filePath) => this.saveImageToAlbum(filePath);
				if (/^(wxfile|file):\/\//i.test(imageUrl) || imageUrl.indexOf('/') === 0) {
					saveFile(imageUrl);
					return;
				}
				if (!/^https?:\/\//i.test(imageUrl)) {
					this.saveImageCandidates(rest);
					return;
				}
				uni.downloadFile({
					url: imageUrl,
					success: (res) => {
						if (res.statusCode === 200 && res.tempFilePath) saveFile(res.tempFilePath);
						else this.saveImageCandidates(rest);
					},
					fail: () => this.saveImageCandidates(rest)
				});
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
			formatPlainTags(value) {
				if (value && typeof value === 'object' && !Array.isArray(value)) {
					const list = value.list || value.items || value.tags || value.labels || value.services || value.serviceList || value.service_list
					if (Array.isArray(list)) return this.formatPlainTags(list)
					return [value.name || value.title || value.label || value.tagName || value.tag_name || value.serviceName || value.service_name || value.value || ''].filter(Boolean)
				}
				const tags = Array.isArray(value) ? value : String(value || '').split(',');
				return tags.map(item => typeof item === 'string' ? item.trim() : (item.name || item.title || item.label || item.tagName || item.tag_name || item.serviceName || item.service_name || '')).filter(Boolean);
			},
			formatInfoValue(value) {
				if (Array.isArray(value)) return this.formatPlainTags(value).join('、')
				if (value && typeof value === 'object') return value.name || value.title || value.label || value.tagName || value.tag_name || value.serviceName || value.service_name || value.value || ''
				return value
			},
			firstDefined(...values) {
				return values.find(value => value !== undefined && value !== null && value !== '')
			},
			moneyValue(value) {
				const amount = Number(value)
				return Number.isNaN(amount) ? 0 : amount
			},
			couponAmountRaw(item = {}) {
				return this.firstDefined(
					item.money,
					item.amount,
					item.discountAmount,
					item.discount_amount,
					item.discountValue,
					item.discount_value,
					item.couponAmount,
					item.coupon_amount,
					item.reduceAmount,
					item.reduce_amount,
					item.deductAmount,
					item.deduct_amount,
					item.faceValue,
					item.face_value,
					item.value,
					item.coupon && (item.coupon.money || item.coupon.amount || item.coupon.discountAmount || item.coupon.discount_amount),
					item.couponInfo && (item.couponInfo.money || item.couponInfo.amount || item.couponInfo.discountAmount || item.couponInfo.discount_amount),
					0
				)
			},
			couponName(item = {}) {
				return this.localizeCouponText(item.name || item.couponName || item.coupon_name || item.title || '优惠券')
			},
			couponConditionText(item = {}) {
				const threshold = this.firstDefined(item.thresholdAmount, item.threshold_amount, item.minAmount, item.min_amount, item.useThreshold, item.use_threshold)
				return this.localizeCouponText(item.use_condition || item.useCondition || item.conditionText || item.condition || (Number(threshold) > 0 ? `满${threshold}可用` : '无门槛'))
			},
			couponTypeText(item = {}) {
				const type = String(item.coupon_type || item.couponType || item.typeText || item.type || '').toUpperCase()
				const map = {
					COUPON: '优惠券',
					FULL: '满减券',
					FULL_REDUCE: '满减券',
					DISCOUNT: '折扣券',
					FIXED_DISCOUNT: '折扣券',
					REDUCE: '满减券',
					MONEY: '现金券',
					CASH_COUPON: '现金券',
					FULL_REDUCTION: '满减券',
					FULL_DISCOUNT: '满减券',
					CASH: '现金券',
					VOUCHER: '代金券',
					FREIGHT: '运费券',
					FREE_SHIPPING: '包邮券',
					PLATFORM: '平台券',
					MERCHANT: '商家券',
					SHOP: '商家券',
					STORE: '商家券'
				}
				return map[type] || this.localizeCouponText(item.coupon_type || item.couponType || item.typeText || '优惠券')
			},
			couponTimeText(item = {}) {
				return this.localizeCouponText(item.use_time_tips || item.useTimeTips || item.validTimeText || item.valid_time_text || [item.startTime || item.start_time, item.endTime || item.end_time].filter(Boolean).join(' 至 ') || '有效期以实际规则为准')
			},
			localizeCouponText(value) {
				const text = String(value || '')
				const exactMap = {
					AVAILABLE: '可使用',
					UNAVAILABLE: '不可用',
					RECEIVABLE: '可领取',
					ORDER_CONFIRM_RECEIVABLE: '',
					ORDER_CONFIRM_AVAILABLE: '',
					ORDER_CONFIRM_UNAVAILABLE: '',
					CLAIMABLE: '可领取',
					RECEIVED: '已领取',
					USED: '已使用',
					EXPIRED: '已过期',
					UNUSED: '未使用',
					PLATFORM: '平台券',
					MERCHANT: '商家券',
					SHOP: '商家券',
					STORE: '商家券',
					DISCOUNT: '折扣券',
					REDUCE: '满减券',
					FULL_REDUCTION: '满减券',
					FREE_SHIPPING: '包邮券'
				}
				const upper = text.toUpperCase()
				if (Object.prototype.hasOwnProperty.call(exactMap, upper)) return exactMap[upper]
				return formatCouponText(text, '')
					.replace(/\bORDER_CONFIRM_RECEIVABLE\b/gi, '')
					.replace(/\bORDER_CONFIRM_AVAILABLE\b/gi, '')
					.replace(/\bORDER_CONFIRM_UNAVAILABLE\b/gi, '')
					.replace(/\bAVAILABLE\b/gi, '可使用')
					.replace(/\bUNAVAILABLE\b/gi, '不可用')
					.replace(/\bRECEIVABLE\b/gi, '可领取')
					.replace(/\bCLAIMABLE\b/gi, '可领取')
					.replace(/\bRECEIVED\b/gi, '已领取')
					.replace(/\bUSED\b/gi, '已使用')
					.replace(/\bEXPIRED\b/gi, '已过期')
					.replace(/\bUNUSED\b/gi, '未使用')
					.replace(/\bPLATFORM\b/gi, '平台')
					.replace(/\bMERCHANT\b/gi, '商家')
					.replace(/\bSHOP\b/gi, '商家')
			},
			formatCouponBenefit(item = {}) {
				const amount = this.couponAmountValue(item)
				const name = this.couponName(item)
				const condition = this.couponConditionText(item)
				return `${name}${amount > 0 ? `减¥${amount.toFixed(2)}` : ''}${condition ? `（${condition}）` : ''}`
			},
			formatCouponAmount(item = {}) {
				const amount = this.couponAmountValue(item)
				return amount.toFixed(amount % 1 === 0 ? 0 : 2)
			},
			couponAmountValue(item = {}) {
				return this.moneyValue(this.couponAmountRaw(item))
			},
			arrayPayload(value) {
				if (Array.isArray(value)) return value
				if (value && Array.isArray(value.list)) return value.list
				if (value && Array.isArray(value.items)) return value.items
				if (value && Array.isArray(value.records)) return value.records
				if (value && Array.isArray(value.rows)) return value.rows
				return []
			},
			findCouponId(source, depth = 0) {
				if (!source || depth > 4) return ''
				const directKeys = ['couponId', 'coupon_id', 'couponTemplateId', 'coupon_template_id', 'couponTplId', 'coupon_tpl_id', 'templateId', 'template_id', 'couponTemplateNo', 'coupon_template_no']
				for (const key of directKeys) {
					if (source[key] !== undefined && source[key] !== null && source[key] !== '') return source[key]
				}
				const objectKeys = ['couponTemplate', 'coupon_template', 'couponTemplateDTO', 'coupon_template_dto', 'template', 'templateInfo', 'template_info', 'templateDTO', 'template_dto', 'couponTemplateInfo', 'coupon_template_info', 'coupon', 'couponInfo', 'coupon_info', 'couponDTO', 'coupon_dto']
				for (const key of objectKeys) {
					const value = source[key]
					if (value && typeof value === 'object') {
						const id = this.findCouponId(value, depth + 1)
						if (id) return id
					}
				}
				return source.id || ''
			},
			couponKey(item = {}) {
				return this.findCouponId(item)
			},
			couponStableKey(item = {}, index = 0, prefix = 'coupon') {
				return String(this.couponKey(item) || this.couponReceiveId(item) || `${prefix}-${index}`)
			},
			couponReceiveId(item = {}) {
				const template = item.couponTemplate || item.coupon_template || item.couponTemplateDTO || item.coupon_template_dto || item.template || item.templateInfo || item.template_info || item.templateDTO || item.template_dto || item.couponTemplateInfo || item.coupon_template_info || {}
				return item.couponTemplateId || item.coupon_template_id || item.couponTplId || item.coupon_tpl_id || item.templateId || item.template_id || template.couponTemplateId || template.coupon_template_id || template.couponTplId || template.coupon_tpl_id || template.templateId || template.template_id || template.id || item.couponId || item.coupon_id || this.couponKey(item)
			},
			goodsCouponCacheKey() {
				const userId = this.userInfo.id || this.userInfo.userId || this.userInfo.user_id || 'guest'
				return `goods_received_coupons_${userId}_${this.id || 'unknown'}`
			},
			loadReceivedCouponCache() {
				const value = uni.getStorageSync(this.goodsCouponCacheKey())
				this.receivedCouponIds = Array.isArray(value) ? value.map(item => String(item)) : []
			},
			saveReceivedCouponCache(id) {
				if (!id) return
				const ids = new Set(this.receivedCouponIds.map(item => String(item)))
				ids.add(String(id))
				const list = Array.from(ids)
				this.receivedCouponIds = list
				uni.setStorageSync(this.goodsCouponCacheKey(), list)
			},
			isCouponReceivedLocally(item = {}) {
				const ids = [this.couponKey(item), this.couponReceiveId(item)].filter(Boolean).map(value => String(value))
				return ids.some(id => this.receivedCouponIds.includes(id))
			},
			couponReceivePayload(item = {}) {
				const id = this.couponKey(item)
				const templateId = this.couponReceiveId(item)
				const productId = this.goodsDetail.spuId || this.goodsDetail.spu_id || this.goodsDetail.goods_id || this.goodsDetail.goodsId || this.goodsDetail.id
				return {
					couponId: item.couponId || item.coupon_id || id,
					coupon_id: item.couponId || item.coupon_id || id,
					couponTemplateId: templateId,
					coupon_template_id: templateId,
					couponTplId: templateId,
					coupon_tpl_id: templateId,
					templateId,
					template_id: templateId,
					receiveScene: 'PRODUCT_DETAIL',
					receive_scene: 'PRODUCT_DETAIL',
					spuId: productId,
					spu_id: productId,
					productId,
					product_id: productId,
					goodsId: productId,
					goods_id: productId
				}
			},
			couponButtonText(item = {}) {
				if (item.is_get || item.isGet || this.isCouponReceivedLocally(item)) return '已领取'
				if (!this.couponReceiveId(item)) return '暂不可领'
				return this.receivingCouponId == this.couponReceiveId(item) ? '领取中' : '领取'
			},
			couponButtonDisabled(item = {}) {
				return Boolean(item.is_get || item.isGet || this.isCouponReceivedLocally(item) || !this.couponReceiveId(item) || this.receivingCouponId == this.couponReceiveId(item))
			},
			resolveCouponFromEvent(event = {}) {
				const dataset = event.currentTarget && event.currentTarget.dataset ? event.currentTarget.dataset : {}
				const listName = dataset.couponList || dataset.coupon_list || 'claimable'
				const index = Number(dataset.couponIndex ?? dataset.coupon_index)
				const key = String(dataset.couponKey || dataset.coupon_key || '')
				const list = listName === 'received' ? this.receivedGoodsCoupons : this.claimableGoodsCoupons
				if (!Number.isNaN(index) && list[index]) {
					const item = list[index]
					if (!key || this.couponStableKey(item, index, listName) === key) return item
				}
				return list.find((item, itemIndex) => this.couponStableKey(item, itemIndex, listName) === key) || {}
			},
			markCouponReceived(target = {}) {
				if (!target || typeof target !== 'object') return
				this.$set(target, 'is_get', 1)
				this.$set(target, 'isGet', 1)
				const targetKey = this.couponKey(target) || this.couponReceiveId(target)
				if (!targetKey) return
				this.goodsCoupons.forEach(item => {
					const itemKey = this.couponKey(item) || this.couponReceiveId(item)
					if (String(itemKey) === String(targetKey)) {
						this.$set(item, 'is_get', 1)
						this.$set(item, 'isGet', 1)
					}
				})
			},
			receiveGoodsCouponByEvent(event = {}) {
				const item = this.resolveCouponFromEvent(event)
				return this.receiveGoodsCoupon(item)
			},
			receiveGoodsCoupon(item = {}) {
				if (!item || typeof item !== 'object' || !Object.keys(item).length) {
					console.log('receiveGoodsCoupon empty item', item)
					return uni.showToast({ title: '优惠券信息异常', icon: 'none' })
				}
				if (item.is_get || item.isGet) return
				if (!this.isLogin) return toLogin()
				if (this.receivingCouponId) return
				const id = this.couponReceiveId(item)
				if (!id) return uni.showToast({ title: '优惠券信息异常', icon: 'none' })
				this.receivingCouponId = id || `pending-${Date.now()}`
				getCoupon(id, this.couponReceivePayload(item)).then(res => {
					if (res.code == 1) {
						this.saveReceivedCouponCache(id)
						this.markCouponReceived(item)
						this.goodsCouponTabIndex = 1
						uni.showToast({ title: '领取成功', icon: 'success' })
						return
					}
					uni.showToast({ title: res.msg || '领取失败', icon: 'none' })
				}).catch(() => {
					uni.showToast({ title: '领取失败，请稍后重试', icon: 'none' })
				}).finally(() => {
					this.receivingCouponId = ''
				})
			},
			formatDisplayTime(value) {
				if (!value) return ''
				if (typeof value === 'string' && /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(value.trim())) return value.trim()
				const time = Number(value)
				const normalized = typeof value === 'string' ? value.replace(/(\.\d{3})\d+/, '$1') : value
				const date = Number.isNaN(time) ? new Date(normalized) : new Date(time > 10000000000 ? time : time * 1000)
				if (Number.isNaN(date.getTime())) return String(value)
				const pad = (num) => String(num).padStart(2, '0')
				return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
			},
			isEnabledValue(value) {
				return value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE' || value === 'Y' || value === 'YES'
			},
			pickFirstValue(source, keys) {
				for (const key of keys) {
					const value = source ? source[key] : undefined
					if (value !== undefined && value !== null && value !== '') return value
				}
				return ''
			},
			formatRichContent(value) {
				if (Array.isArray(value)) {
					return value.map(item => {
						if (typeof item === 'string') return item
						const image = item.image || item.url || item.src || item.imageUrl || item.image_url
						const text = item.content || item.text || item.desc || item.description || ''
						return image ? `<img src="${this.resolveGoodsImage(image)}" style="max-width:100%;height:auto;display:block;" />` : text
					}).join('')
				}
				if (value && typeof value === 'object') return value.content || value.detail || value.html || value.richText || value.rich_text || ''
				return value || ''
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
			resolveCheckoutPrice(detail = this.checkedGoods) {
				const sku = detail || {};
				const salePrice = this.normalizePrice(
					sku.price
					?? sku.goods_price
					?? sku.goodsPrice
					?? sku.sale_price
					?? sku.salePrice
					?? sku.min_price
					?? sku.minPrice
					?? (this.goodsType == 2 ? this.displayTeamPrice : this.displayMinPrice)
				);
				const marketPrice = this.normalizePrice(
					sku.original_price
					?? sku.originalPrice
					?? sku.market_price
					?? sku.marketPrice
					?? sku.linePrice
					?? this.marketDisplayText
					?? salePrice,
					salePrice
				);
				return {
					salePrice,
					marketPrice
				};
			},
			isSameSku(item = {}, skuId) {
				if (!skuId) return false;
				return [item.item_id, item.sku_id, item.skuId, item.id, item.itemSkuId].some(value => String(value || '') === String(skuId));
			},
			findSkuDetail(item = {}) {
				const goodsItem = this.goodsDetail.goods_item || this.goodsDetail.goodsItem || [];
				const itemId = item.item_id || item.sku_id || item.skuId || item.id || item.itemSkuId;
				return goodsItem.find(sku => this.isSameSku(sku, itemId)) || item;
			},
			normalizeCheckedSku(item = {}) {
				const sku = this.findSkuDetail(item);
				const specIds = item.spec_value_ids || item.specValueIds || item.spec_value_ids_str || '';
				return Object.assign({}, item, sku, {
					spec_value_ids: specIds,
					spec_value_ids_arr: Array.isArray(item.spec_value_ids_arr) ? item.spec_value_ids_arr : String(specIds || '').split(',')
				});
			},
			getDefaultCheckedGoods(goodsItem = []) {
				const target = goodsItem.find(item => this.isSameSku(item, this.targetSkuId));
				const available = goodsItem.find(item => Number(item.stock || 0) > 0);
				return this.normalizeCheckedSku(target || available || goodsItem[0] || {});
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
				}, []).map((item, index) => {
					const name = item.nickname || item.user_name || item.userName || item.name || item.memberName || item.member_name || '匿名用户'
					const people = Number(item.people_num || item.peopleNum || item.group_num || item.groupNum || this.team.people_num || this.team.peopleNum || 0)
					const joined = Number(item.join || item.join_num || item.joinNum || item.joinedCount || item.joined_count || item.currentNum || item.current_num || 1)
					const need = Number(item.need_num || item.needNum || item.lackNum || item.lack_num || item.leftNum || item.left_num || 0)
					const statusText = item.status_text || item.statusText || item.team_status_text || item.teamStatusText || ''
					return {
						id: item.id || item.found_id || item.foundId || item.team_id || item.teamId || index,
						avatar: item.avatar || item.user_avatar || item.userAvatar || item.headimgurl || '',
						name,
						initial: String(name).slice(0, 1),
						time: item.create_time || item.createTime || item.found_time || item.foundTime || item.join_time || item.joinTime || '',
						join: joined || 1,
						people,
						need,
						needText: need > 0 ? `还差${need}人成团` : (people > joined ? `还差${people - joined}人成团` : ''),
						statusText
					}
				});
			},
			async loadGoodsCommentFallback(goodsId) {
				if (!goodsId || this.hasCommentContent) return;
				try {
					const res = await getCommentList({ goods_id: goodsId, page_no: 1, pageSize: 1 });
					if (res.code != 1 || !res.data) return;
					const first = (res.data.list || [])[0] || {};
					if (!Object.keys(first).length && !res.data.total) return;
					this.comment = Object.assign({}, this.comment, first, {
						total: res.data.total || this.comment.total || 0,
						percent: res.data.percent || this.comment.percent || ''
					});
				} catch (error) {}
			},
			toggleShopSubscribe() {
				if (!this.isLogin) return toLogin();
				const shopId = this.goodsDetail.shop_id || this.goodsDetail.shopId || this.goodsDetail.shop?.shopId || '';
				if (!shopId) return uni.showToast({ title: '暂无店铺信息', icon: 'none' });
				const nextSubscribed = !this.shopSubscribed;
				subscribeShop({ shopId, subscribed: nextSubscribed }).then(res => {
					if (res.code != 1) {
						uni.showToast({ title: '订阅功能暂不可用，请稍后再试', icon: 'none' });
						return;
					}
					this.shopSubscribed = nextSubscribed;
					uni.setStorageSync(this.getShopSubscribeCacheKey(shopId), nextSubscribed ? 1 : 0)
					uni.showToast({
						title: this.shopSubscribed ? '订阅成功' : '已取消订阅',
						icon: 'none'
					});
				}).catch(() => {
					uni.showToast({ title: '订阅功能暂不可用，请稍后再试', icon: 'none' });
				});
			},
			applyDefaultGoodsDetail() {
				this.isNull = true;
				this.goodsType = 0;
				this.countTime = 0;
				this.team = {};
				this.teamFound = [];
				this.groupRecords = [];
				this.comment = {};
				this.activePreviewIndex = 0;
				this.goodsLike = [];
				this.swiperList = [];
				this.goodsDetail = {};
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
					} = activity || {}; // 秒杀时间
					team_found = team_found || data.team_found || data.teamFound || data.group_records || data.groupRecords || [];
					let time = info ?
						info.end_time - Date.now() / 1000 // 拼团时间
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
					const shopId = data.shop_id || data.shopId || data.shop?.shopId || ''
					const cachedSubscribed = this.getCachedShopSubscribed(shopId)
					this.shopSubscribed = cachedSubscribed !== undefined ? cachedSubscribed : Boolean(data.shopSubscribed || data.isShopSubscribed || data.shop?.subscribed || data.shop?.isSubscribed);
					this.swiperList = Array.isArray(goods_image) && goods_image.length ? goods_image : [data.image].filter(Boolean);
					this.activePreviewIndex = 0;
					this.comment = comment || {};
					this.loadGoodsCommentFallback(data.id || data.goods_id || data.spuId || this.id);
					this.goodsLike = Array.isArray(like) ? like : [];
					this.checkedGoods = this.getDefaultCheckedGoods(data.goods_item || []);
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
			onChangeGoods(e) {
				this.checkedGoods = this.normalizeCheckedSku(e.detail || {});
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
				const skuDetail = e.detail || {};
				let {
					id,
					sku_id,
					skuId,
					item_id,
					goodsNum
				} = skuDetail;
				const resolved = this.resolveSkuPayload(skuDetail);
				const itemId = item_id || sku_id || skuId || id || resolved.itemId;
				const quantity = goodsNum || resolved.goodsNum || 1;
				if (!itemId) return this.$toast({ title: '请选择商品规格' });
				const {
					goodsType,
					team
				} = this;
				const checkoutPrice = this.resolveCheckoutPrice(skuDetail);
				let goods = [{
					item_id: itemId,
					skuId: itemId,
					goods_id: this.goodsDetail.goods_id || this.goodsDetail.goodsId || this.goodsDetail.id,
					goods_name: this.goodsDetail.goods_name || this.goodsDetail.name,
					name: this.goodsDetail.name,
					image: skuDetail.image || skuDetail.imageUrl || skuDetail.skuImage || skuDetail.skuImageUrl || this.goodsDetail.image || this.previewImages[0] || '',
					image_str: skuDetail.image || skuDetail.imageUrl || skuDetail.skuImage || skuDetail.skuImageUrl || this.goodsDetail.image || this.previewImages[0] || '',
					goods_price: checkoutPrice.salePrice,
					goodsPrice: checkoutPrice.salePrice,
					price: checkoutPrice.salePrice,
					sale_price: checkoutPrice.salePrice,
					salePrice: checkoutPrice.salePrice,
					original_price: checkoutPrice.marketPrice,
					originalPrice: checkoutPrice.marketPrice,
					market_price: checkoutPrice.marketPrice,
					marketPrice: checkoutPrice.marketPrice,
					shop_id: this.goodsDetail.shop_id || this.goodsDetail.shopId || this.goodsDetail.shop?.shopId || '',
					shop_name: this.shareShopName,
					shop_logo: this.shareShopLogo,
					shopLogo: this.shareShopLogo,
					pointsEnabled: this.pointsSwitchEnabled,
					points_enabled: this.pointsSwitchEnabled,
					pointsAmount: this.pointsBenefitData.points,
					points_amount: this.pointsBenefitData.points,
					pointsDeductAmount: this.pointsBenefitData.amount,
					points_deduct_amount: this.pointsBenefitData.amount,
					maxDeductAmount: this.pointsBenefitData.amount,
					max_deduct_amount: this.pointsBenefitData.amount,
					singleMaxDeductAmount: this.pointsBenefitData.amount,
					single_max_deduct_amount: this.pointsBenefitData.amount,
					giveIntegral: this.pointsBenefitData.giveIntegral,
					give_integral: this.pointsBenefitData.giveIntegral,
					order_give_integral: this.pointsBenefitData.giveIntegral,
					spec_value_str: skuDetail.spec_value_str || skuDetail.skuName || skuDetail.name || this.selectedSpecText,
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
					}
					this.$toast({ title: '已加入购物车', icon: 'success' });
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
				} = await addCart({
					item_id: itemId,
					skuId: itemId,
					goods_num: quantity
				});
				if (code == 1) {
					const cartCount = data?.cartCount ?? data?.count ?? data?.num ?? data?.total;
					if (cartCount !== undefined && cartCount !== null) {
						this.getCartNum(cartCount);
					}
					this.$toast({
						title: '已加入购物车',
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
				path: this.goodsShareLink()
			};
		},
		computed: {
			...mapGetters(['cartNum', 'userInfo', 'isLogin']),
			hasCommentContent() {
				const item = this.comment || {}
				return Boolean(
					item.comment ||
					(item.image && item.image.length) ||
					item.reply ||
					item.append_comment ||
					(item.append_image && item.append_image.length)
				)
			},
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
				return (this.swiperList || []).filter(Boolean)
			},
			showGroupFooter() {
				return true
			},
			groupFooterCount() {
				return this.team.joinedCount || this.team.joined_count || this.team.join_num || this.team.joinNum || this.team.salesCount || this.team.sales_count || this.goodsDetail.group_join_num || this.goodsDetail.groupJoinNum || this.goodsDetail.joinedCount || this.goodsDetail.joined_count || this.goodsDetail.sales_sum || this.goodsDetail.salesCount || 0
			},
			displayMinPrice() {
				return this.normalizePrice(this.checkedGoods.price ?? this.checkedGoods.sale_price ?? this.checkedGoods.salePrice ?? this.goodsDetail.price ?? this.goodsDetail.salePrice ?? this.goodsDetail.sale_price ?? this.goodsDetail.min_price ?? this.goodsDetail.minPrice)
			},
			displayMaxPrice() {
				return this.normalizePrice(this.checkedGoods.sale_price ?? this.checkedGoods.salePrice ?? this.goodsDetail.max_price ?? this.goodsDetail.maxPrice ?? this.goodsDetail.salePrice ?? this.goodsDetail.sale_price ?? this.checkedGoods.price ?? this.goodsDetail.price, this.displayMinPrice)
			},
			displayMarketPrice() {
				const salePrice = Number(this.displayMinPrice || 0)
				const skuMarketPrice = Number(this.checkedGoods.market_price ?? this.checkedGoods.marketPrice ?? this.checkedGoods.originPrice ?? 0)
				if (skuMarketPrice > salePrice) return this.normalizePrice(skuMarketPrice)
				return this.normalizePrice(this.goodsDetail.market_price ?? this.goodsDetail.marketPrice ?? this.goodsDetail.originPrice ?? this.goodsDetail.originalPrice, this.displayMaxPrice)
			},
			marketDisplayText() {
				return this.normalizePrice(this.checkedGoods.market_price ?? this.checkedGoods.marketPrice ?? this.checkedGoods.originPrice ?? this.goodsDetail.market_price ?? this.goodsDetail.marketPrice ?? this.goodsDetail.originPrice ?? this.goodsDetail.originalPrice ?? this.goodsDetail.linePrice ?? this.displayMarketPrice)
			},
			displayTeamPrice() {
				return this.normalizePrice(this.checkedGoods.team_price ?? this.checkedGoods.teamPrice ?? this.team.team_min_price ?? this.team.teamMinPrice ?? this.team.groupPrice ?? this.displayMinPrice, this.displayMinPrice)
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
				return this.goodsDetail.shop_name || this.goodsDetail.shopName || this.goodsDetail.storeName || this.goodsDetail.shop?.shopName || '叮咚生活馆'
			},
			shareShopLogo() {
				const shop = this.goodsDetail.shop || this.goodsDetail.shopInfo || this.goodsDetail.shop_info || {}
				return this.resolveAvatar(this.goodsDetail.shop_logo || this.goodsDetail.shopLogo || this.goodsDetail.shopLogoUrl || this.goodsDetail.shop_logo_url || this.goodsDetail.storeLogo || this.goodsDetail.store_logo || shop.shopLogo || shop.shop_logo || shop.logo || shop.logoUrl || shop.image || shop.cover || '')
			},
			groupFooterAvatars() {
				const records = this.groupRecords.length ? this.groupRecords : this.flattenTeamRecords(this.teamFound)
				const avatars = records.map(item => item.avatar).filter(Boolean).slice(0, 3)
				while (avatars.length < 3) avatars.push('')
				return avatars.map(avatar => this.resolveAvatar(avatar))
			},
			shareShopScore() {
				const score = this.goodsDetail.shop_score ?? this.goodsDetail.shopScore ?? this.goodsDetail.shop?.shopScore ?? this.goodsDetail.shop?.score ?? ''
				if (score === '' || score === null || score === undefined) return ''
				const value = Number(score)
				return Number.isNaN(value) ? String(score) : value.toFixed(1)
			},
			shareBusinessTime() {
				return this.formatDisplayTime(this.goodsDetail.businessHours || this.goodsDetail.business_hours || this.goodsDetail.shop?.businessHours || this.goodsDetail.shop?.business_hours || '')
			},
			goodsTagList() {
				return this.formatPlainTags(this.goodsDetail.tags || this.goodsDetail.labels || this.goodsDetail.goods_tags || this.goodsDetail.goodsTags || this.goodsServiceList).filter(tag => !this.isImportSourceField('标签', tag)).slice(0, 4)
			},
			goodsDisplayTags() {
				const tags = [this.freightText].concat(this.goodsServiceList, this.goodsTagList).filter(Boolean)
				return [...new Set(tags)].filter(tag => !this.isImportSourceField('标签', tag)).slice(0, 8)
			},
			goodsCoupons() {
				const detail = this.goodsDetail || {}
				const list = this.arrayPayload(detail.coupon_list).concat(
					this.arrayPayload(detail.couponList),
					this.arrayPayload(detail.coupons),
					this.arrayPayload(detail.availableCoupons),
					this.arrayPayload(detail.available_coupons),
					this.arrayPayload(detail.couponInfo || detail.coupon_info || detail.coupon)
				)
				const seen = {}
				return list.filter(item => {
					const key = this.couponKey(item) || `${item.name || item.couponName || ''}-${item.money || item.amount || ''}`
					if (seen[key]) return false
					seen[key] = true
					return true
				}).map(item => {
					if (!this.isCouponReceivedLocally(item)) return item
					return {
						...item,
						is_get: 1,
						isGet: 1
					}
				})
			},
			claimableGoodsCoupons() {
				return this.goodsCoupons.filter(item => !(item.is_get || item.isGet))
			},
			receivedGoodsCoupons() {
				return this.goodsCoupons.filter(item => item.is_get || item.isGet)
			},
			currentGoodsCouponList() {
				return this.goodsCouponTabIndex === 1 ? this.receivedGoodsCoupons : this.claimableGoodsCoupons
			},
			goodsCouponSummary() {
				if (this.claimableGoodsCoupons.length) return this.claimableGoodsCoupons.slice(0, 2).map(item => this.formatCouponBenefit(item)).join('、')
				if (this.receivedGoodsCoupons.length) return `已领取${this.receivedGoodsCoupons.length}张优惠券`
				return '点击查看可领取优惠券'
			},
			showGoodsCouponEntry() {
				return this.goodsCoupons.length > 0
			},
			showGoodsPointsEntry() {
				return this.showPointsBenefit || this.pointsSwitchEnabled
			},
			pointsMarketingConfig() {
				const detail = this.goodsDetail || {}
				const pointsInfo = detail.pointsInfo || detail.points_info || detail.integralInfo || detail.integral_info || {}
				return Object.assign({}, detail.marketingConfig || detail.marketing_config || detail.pointsMarketing || detail.pointsConfig || {}, pointsInfo)
			},
			pointsSwitchExplicitlyDisabled() {
				const detail = this.goodsDetail || {}
				const marketing = this.pointsMarketingConfig
				const switchValue = this.firstDefined(marketing.integralSwitch, marketing.integral_switch, marketing.pointsEnabled, marketing.points_enabled, marketing.supportPoints, marketing.support_points, marketing.canUsePoints, marketing.can_use_points, detail.integralSwitch, detail.integral_switch, detail.pointsEnabled, detail.points_enabled)
				return switchValue === false || switchValue === 0 || switchValue === '0'
			},
			pointsSwitchEnabled() {
				const detail = this.goodsDetail || {}
				const marketing = this.pointsMarketingConfig
				const switchValue = this.firstDefined(marketing.integralSwitch, marketing.integral_switch, marketing.pointsEnabled, marketing.points_enabled, marketing.supportPoints, marketing.support_points, marketing.canUsePoints, marketing.can_use_points, detail.integralSwitch, detail.integral_switch, detail.pointsEnabled, detail.points_enabled)
				if (switchValue === false || switchValue === 0 || switchValue === '0') return false
				if (switchValue === true || switchValue === 1 || switchValue === '1') return true
				const data = this.pointsBenefitData
				return data.amount > 0 || data.points > 0 || data.giveIntegral > 0
			},
			pointsBenefitData() {
				const detail = this.goodsDetail || {}
				const marketing = this.pointsMarketingConfig
				const amount = this.moneyValue(this.firstDefined(marketing.pointsDeductAmount, marketing.points_deduct_amount, marketing.maxDiscountAmount, marketing.max_discount_amount, marketing.deductAmount, marketing.deduct_amount, detail.pointsDeductAmount, detail.points_deduct_amount, detail.integralDeductAmount, detail.integral_deduct_amount, 0))
				const points = this.moneyValue(this.firstDefined(marketing.pointsAmount, marketing.points_amount, marketing.maxUsablePoints, marketing.max_usable_points, marketing.deductPoints, marketing.deduct_points, detail.pointsAmount, detail.points_amount, detail.integralNum, detail.integral_num, 0))
				const giveIntegral = this.moneyValue(this.firstDefined(marketing.giveIntegral, marketing.give_integral, marketing.rewardPoints, marketing.reward_points, detail.order_give_integral, detail.giveIntegral, detail.give_integral, detail.rewardPoints, detail.reward_points, detail.integral, 0))
				return { amount, points, giveIntegral }
			},
			showPointsBenefit() {
				const data = this.pointsBenefitData
				if (this.pointsSwitchExplicitlyDisabled) return false
				return data.amount > 0 || data.points > 0 || data.giveIntegral > 0
			},
			pointsBenefitText() {
				if (!this.showPointsBenefit && !this.pointsSwitchEnabled) return ''
				const { amount, points, giveIntegral } = this.pointsBenefitData
				const texts = []
				if (giveIntegral > 0) texts.push(`下单可得${giveIntegral}积分`)
				if (amount > 0) texts.push(`${points > 0 ? `${points}积分` : '积分'}最多可抵¥${amount.toFixed(2)}`)
				return texts.join('，') || '确认订单页按当前订单规则计算可用积分'
			},
			pointsBenefitRows() {
				const { amount, points, giveIntegral } = this.pointsBenefitData
				const rows = []
				if (giveIntegral > 0) rows.push({ label: '下单奖励', value: `预计可得${giveIntegral}积分` })
				if (amount > 0 || points > 0) rows.push({ label: '积分抵扣', value: amount > 0 ? `${points > 0 ? `${points}积分` : '可用积分'}最多可抵¥${amount.toFixed(2)}` : `最多可使用${points}积分` })
				if (!rows.length) rows.push({ label: '积分规则', value: '确认订单页按当前订单规则计算可用积分' })
				rows.push({ label: '使用说明', value: '最终可用积分和抵扣金额以下单页结算结果为准' })
				return rows
			},
            marketingBenefits() {
                const detail = this.goodsDetail || {}
                const list = []
                const sourceText = item => (item && (item.ownerType === 'PLATFORM' || item.owner_type === 'PLATFORM' || item.subsidyEligible || item.subsidy_eligible)) ? '平台' : '商家'
                const coupons = this.goodsCoupons
                if (coupons.length) {
                    list.push({
                        key: 'coupon',
                        tag: '优惠券',
                        text: coupons.slice(0, 3).map(item => `${sourceText(item)}-${this.formatCouponBenefit(item)}`).join('、')
                    })
                }
                const activities = Array.isArray(detail.activityList) ? detail.activityList : (Array.isArray(detail.activity_list) ? detail.activity_list : [])
                if (activities.length) {
                    list.push({
                        key: 'activity',
                        tag: '活动',
                        text: activities.slice(0, 3).map(item => `${sourceText(item)}-${item.activityName || item.name || item.title || '营销活动'}`).join('、')
                    })
                }
                if (this.showPointsBenefit || this.pointsSwitchEnabled) {
                    list.push({
                        key: 'points',
                        tag: '积分',
                        text: this.pointsBenefitText
                    })
                }
                return list
            },
			optionBenefits() {
				return [this.goodsCoupons.length ? { key: 'coupon' } : null, this.optionPointsBenefit].filter(Boolean)
			},
			optionPointsBenefit() {
				return this.marketingBenefits.find(item => item.key === 'points') || null
			},
			visibleMarketingBenefits() {
				return this.otherMarketingBenefits.filter(item => item.key !== 'coupon' && item.key !== 'points')
			},
			otherMarketingBenefits() {
				return this.marketingBenefits.filter(item => item.key !== 'coupon' && item.key !== 'points')
			},
			goodsServiceList() {
				const detail = this.goodsDetail || {}
				const tags = this.formatPlainTags(detail.service_tags || detail.serviceTags || detail.services || detail.serviceList || detail.service_list)
				const serviceMap = [
					{ text: '七天无理由', keys: ['seven_day_return', 'sevenDayReturn', 'seven_days_return', 'sevenDaysReturn', 'is_seven_day_return', 'isSevenDayReturn', 'no_reason_return', 'noReasonReturn', 'support_refund', 'supportRefund'] },
					{ text: '极速发货', keys: ['fast_delivery', 'fastDelivery', 'quick_delivery', 'quickDelivery', 'speed_delivery', 'speedDelivery', 'is_fast_delivery', 'isFastDelivery'] },
					{ text: '运费险', keys: ['freight_insurance', 'freightInsurance', 'shipping_insurance', 'shippingInsurance', 'freight_risk', 'freightRisk', 'is_freight_insurance', 'isFreightInsurance'] }
				]
				serviceMap.forEach(item => {
					const value = this.pickFirstValue(detail, item.keys)
					if ((this.isEnabledValue(value) || value === '是' || value === '支持') && !tags.includes(item.text)) tags.push(item.text)
				})
				return tags.filter(tag => !this.isImportSourceField('服务', tag))
			},
			goodsInfoRows() {
				const detail = this.goodsDetail || {}
				const template = detail.freight_template || detail.freightTemplate || {}
				const rows = [
					{ label: '库存', value: detail.stock || detail.stockQty },
					{ label: '销量', value: detail.sales_sum || detail.salesCount },
					{ label: '跟团', value: this.groupFooterCount ? `${this.groupFooterCount}人已跟团` : '' },
					{ label: '评价', value: this.comment.total || detail.comment_count || detail.commentCount },
					{ label: '运费', value: this.freightText },
					{ label: '服务标签', value: this.goodsServiceList },
					{ label: '商品标签', value: this.goodsTagList },
					{ label: '积分', value: this.showGoodsPointsEntry ? this.pointsBenefitText : '' },
					{ label: '售后', value: detail.after_sale || detail.afterSale || detail.after_sale_desc || detail.afterSaleDesc },
					{ label: '提示', value: detail.usage_hint || detail.usageHint || detail.highlight },
					{ label: '发货', value: detail.delivery_desc || detail.deliveryDesc || detail.shipping_desc || detail.shippingDesc || detail.freight_desc || this.freightText },
					{ label: '运费设置', value: template.name || template.title || detail.freight_template_name || detail.freightTemplateName || detail.delivery_template_name || detail.deliveryTemplateName },
					{ label: '分类', value: detail.category_name || detail.categoryName },
					{ label: '品牌', value: detail.brand_name || detail.brandName || detail.brand },
					{ label: '单位', value: detail.unit || detail.unitName },
					{ label: '重量', value: detail.weight || detail.goodsWeight || detail.netWeight },
					{ label: '商品编码', value: detail.code || detail.goodsCode || detail.spuCode },
					{ label: '上架时间', value: this.formatDisplayTime(detail.on_sale_time || detail.onSaleTime || detail.saleTime) },
					{ label: '创建时间', value: this.formatDisplayTime(detail.create_time || detail.createTime || detail.createdAt) },
					{ label: '更新时间', value: this.formatDisplayTime(detail.update_time || detail.updateTime || detail.updatedAt) }
				]
				return rows.map(row => ({
					label: row.label,
					value: this.formatInfoValue(row.value)
				})).filter(row => row.value !== undefined && row.value !== null && row.value !== '' && !this.isImportSourceField(row.label, row.value)).map(row => ({
					label: row.label,
					value: row.value
				}))
			},
			goodsDetailContent() {
				return this.formatRichContent(this.goodsDetail.goods_detail || this.goodsDetail.goodsDetail || this.goodsDetail.content || this.goodsDetail.detail || this.goodsDetail.detailJson || this.goodsDetail.detail_json || this.goodsDetail.richText || this.goodsDetail.rich_text || this.goodsDetail.description || this.goodsDetail.desc || '')
			},
			selectedSpecText() {
				return this.checkedGoods.spec_value_str || this.checkedGoods.skuName || this.checkedGoods.name || '默认'
			},
			freightText() {
				const detail = this.goodsDetail || {}
				if (detail.freight_desc || detail.freightDesc || detail.shipping_desc || detail.shippingDesc) return detail.freight_desc || detail.freightDesc || detail.shipping_desc || detail.shippingDesc
				const template = detail.freight_template || detail.freightTemplate || detail.shipping_template || detail.shippingTemplate || {}
				const type = String(detail.freight_type || detail.freightType || detail.shippingType || detail.shipping_type || detail.postage_type || detail.postageType || template.freightType || template.freight_type || template.type || '').toUpperCase()
				const deliveryType = String(detail.delivery_type || detail.deliveryType || detail.shippingMethod || detail.shipping_method || template.deliveryType || template.delivery_type || '').toUpperCase()
				const pickupAddress = detail.pickup_address || detail.pickupAddress || template.pickupAddress || template.pickup_address
				const amount = Number(detail.freight_amount ?? detail.freightAmount ?? detail.shippingFee ?? detail.shipping_fee ?? detail.postage ?? detail.express_fee ?? detail.expressFee ?? template.freightAmount ?? template.freight_amount ?? template.firstPrice ?? template.first_price ?? 0)
				const freeShipping = detail.freeShipping || detail.free_shipping || detail.isFreeShipping || detail.is_free_shipping || detail.postageFree || detail.postage_free || detail.is_free_express || detail.isFreeExpress || template.freeShipping || template.free_shipping
				const deliveryText = deliveryType === 'PICKUP' ? '线下自提' : deliveryType === 'MIXED' ? '配送/自提' : deliveryType === 'DELIVERY' ? '快递配送' : ''
				if (deliveryType === 'PICKUP') return pickupAddress ? `${deliveryText}：${pickupAddress}` : deliveryText
				if (type === 'FREE' || type === 'FREE_SHIPPING' || type === '0' || this.isEnabledValue(freeShipping) || amount === 0) return deliveryText ? `${deliveryText} · 包邮` : '包邮'
				if (type === 'FIXED') return `${deliveryText ? `${deliveryText} · ` : ''}${amount > 0 ? `运费 ¥${amount.toFixed(2)}` : '固定运费'}`
				if (type === 'TEMPLATE' || template.id || template.name) return `${deliveryText ? `${deliveryText} · ` : ''}${amount > 0 ? `运费 ¥${amount.toFixed(2)}` : '按运费模板计算'}`
				if (amount > 0) return `${deliveryText ? `${deliveryText} · ` : ''}运费 ¥${amount.toFixed(2)}`
				return deliveryText || '包邮'
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

		.share-canvas {
			position: fixed;
			left: -9999px;
			top: -9999px;
			width: 320px;
			height: 570px;
		}

		.hero-stage {
			position: relative;
			height: 720rpx;
			background: #ffffff;
		}

		.goods-hero-swiper,
		.goods-hero-image {
			width: 100%;
			height: 720rpx;
		}

		.goods-hero-image {
			display: block;
			background: #ffffff;
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
			padding: 0 14rpx 18rpx;
			background: #037dfa;
			border-radius: 24rpx;
			box-shadow: 0 14rpx 32rpx rgba(31, 122, 244, 0.16);
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
			padding: 28rpx 24rpx 30rpx;
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

		.merchant-card__price-box {
			min-width: 0;
		}

		.merchant-card__price-tag {
			margin-left: 12rpx;
			font-size: 24rpx;
			line-height: 1;
		}

		.merchant-card__market-line {
			display: flex;
			align-items: center;
			margin-top: 6rpx;
			color: #8b95a5;
			font-size: 24rpx;
			line-height: 34rpx;
		}

		.merchant-card__market-price {
			margin-left: 10rpx;
			color: #9aa2af;
			text-decoration: line-through;
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

		.merchant-card__price-meta {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
			margin-top: 18rpx;
		}

		.merchant-card__meta-item {
			display: flex;
			align-items: baseline;
			min-width: 0;
			padding: 8rpx 14rpx;
			border-radius: 18rpx;
			background: #f6f9ff;
		}

		.merchant-card__meta-label {
			flex: none;
			margin-right: 8rpx;
			color: #8b95a5;
			font-size: 22rpx;
			line-height: 30rpx;
		}

		.merchant-card__meta-value {
			color: #ff2e2e;
			font-size: 24rpx;
			font-weight: 600;
			line-height: 32rpx;
		}

		.merchant-card__meta-market {
			color: #9aa2af;
			font-size: 24rpx;
			line-height: 32rpx;
			text-decoration: line-through;
		}

		.merchant-card__title {
			margin-top: 18rpx;
			color: #172033;
			font-size: 32rpx;
			font-weight: 700;
			line-height: 46rpx;
			word-break: break-all;
		}

		.merchant-card__sales {
			margin-top: 14rpx;
			color: #999999;
			font-size: 22rpx;
		}

		.merchant-card__desc {
			margin-top: 10rpx;
			color: #666666;
			font-size: 24rpx;
			line-height: 36rpx;
			word-break: break-all;
		}

		.merchant-card__tags {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-top: 14rpx;
		}

		.merchant-card__tag {
			max-width: 100%;
			padding: 5rpx 12rpx;
			color: #037dfa;
			font-size: 22rpx;
			line-height: 30rpx;
			border-radius: 18rpx;
			background: #edf6ff;
			box-sizing: border-box;
			white-space: normal;
			word-break: break-all;
		}

		.option-panel {
			margin: 26rpx 26rpx 0;
			padding: 18rpx 24rpx;
			border-radius: 24rpx;
			box-shadow: 0 10rpx 28rpx rgba(24, 44, 84, .05);
		}

		.goods-extra {
			margin: 24rpx 26rpx 0;
			padding: 26rpx 24rpx 28rpx;
			border-radius: 24rpx;
			box-sizing: border-box;
		}

		.goods-extra__title {
			color: #222222;
			font-size: 30rpx;
			font-weight: 600;
			line-height: 42rpx;
		}

		.goods-extra__grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(260rpx, 1fr));
			gap: 18rpx;
			margin-top: 22rpx;
		}

		.goods-extra__item {
			min-width: 0;
			padding: 18rpx;
			border-radius: 18rpx;
			background: #f7f9fc;
			box-sizing: border-box;
		}

		.goods-extra__label {
			color: #8b95a5;
			font-size: 22rpx;
			line-height: 30rpx;
			word-break: break-all;
		}

		.goods-extra__value {
			margin-top: 8rpx;
			color: #222222;
			font-size: 26rpx;
			font-weight: 500;
			line-height: 36rpx;
			white-space: normal;
			word-break: break-all;
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
		}

		.option-panel__thumbs {
			align-items: flex-start;
			flex-wrap: wrap;
			gap: 14rpx;
		}

		.option-panel__thumb {
			display: block;
			flex: 0 0 92rpx;
			width: 92rpx;
			height: 92rpx;
			border-radius: 14rpx;
			border: 2rpx solid transparent;
			background: #f7f9fc;
			box-sizing: border-box;

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
			background: #ffffff;
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

		.option-panel__line--thin {
			margin: 20rpx 0 18rpx;
			background: #f0f3f8;
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

		.option-row--coupon {
			min-height: 84rpx;
			padding: 4rpx 0 0;
		}

		.option-row__coupon-icon {
			flex: none;
			width: 38rpx;
			height: 38rpx;
			border-radius: 8rpx;
			background: linear-gradient(135deg, #ff563d 0%, #ff8a45 100%);
			font-size: 22rpx;
			font-weight: 600;
			line-height: 38rpx;
			text-align: center;
			color: #ffffff;
		}

		.option-row__benefit-icon {
			flex: none;
			width: 38rpx;
			height: 38rpx;
			border-radius: 8rpx;
			background: linear-gradient(135deg, #ff8a00 0%, #ffc24b 100%);
			font-size: 22rpx;
			font-weight: 600;
			line-height: 38rpx;
			text-align: center;
			color: #ffffff;
		}

		.option-row__coupon-content {
			flex: 1;
			min-width: 0;
			margin-left: 18rpx;
		}

		.option-row__coupon-title {
			font-size: 24rpx;
			font-weight: 600;
			line-height: 32rpx;
			color: #222222;
		}

		.option-row__coupon-text {
			margin-top: 8rpx;
			font-size: 23rpx;
			line-height: 30rpx;
			color: #ff4d2e;
		}

		.option-row__benefit-text {
			margin-top: 8rpx;
			font-size: 23rpx;
			line-height: 30rpx;
			color: #ff7417;
		}

		.option-row__coupon-action {
			flex: none;
			height: 44rpx;
			padding: 0 20rpx;
			margin-left: 16rpx;
			border-radius: 22rpx;
			background: #037dfa;
			font-size: 22rpx;
			line-height: 44rpx;
			color: #ffffff;
		}

		.option-row__more {
			flex: none;
			width: 14rpx;
			height: 14rpx;
			margin-left: 18rpx;
			border-top: 2rpx solid #b9bec8;
			border-right: 2rpx solid #b9bec8;
			transform: rotate(45deg);
		}

		.option-row--tags {
			align-items: flex-start;
			margin-top: 18rpx;
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

		.marketing-panel {
			padding: 24rpx 28rpx;
		}

		.marketing-panel__title {
			margin-bottom: 16rpx;
			color: #222222;
			font-size: 28rpx;
			font-weight: 600;
		}

		.marketing-panel__row {
			display: flex;
			align-items: center;
			min-height: 44rpx;
			margin-top: 10rpx;
		}

		.marketing-panel__tag {
			flex: none;
			min-width: 56rpx;
			height: 32rpx;
			padding: 0 10rpx;
			border-radius: 4rpx;
			background: #fff1f0;
			color: #ff2c3c;
			font-size: 22rpx;
			line-height: 32rpx;
			text-align: center;
		}

		.marketing-panel__text {
			flex: 1;
			margin-left: 16rpx;
			color: #333333;
			font-size: 24rpx;
		}

		.pop-title {
			height: 100rpx;
			border-bottom: 1rpx solid #f2f2f2;
		}

		.pop-title .title {
			margin-left: 30rpx;
			font-size: 34rpx;
			font-weight: bold;
			line-height: 36rpx;
		}

		.coupon-tabs {
			display: flex;
			align-items: center;
			height: 88rpx;
			padding: 0 24rpx;
			box-sizing: border-box;
			background: #ffffff;
		}

		.coupon-tab {
			position: relative;
			flex: 1;
			color: #606266;
			font-size: 28rpx;
			line-height: 88rpx;
			text-align: center;
		}

		.coupon-tab.is-active {
			color: #037dfa;
			font-weight: 600;
		}

		.coupon-tab.is-active::after {
			position: absolute;
			left: 50%;
			bottom: 8rpx;
			width: 76rpx;
			height: 5rpx;
			border-radius: 999rpx;
			background: #037dfa;
			transform: translateX(-50%);
			content: '';
		}

		.coupon-tab--muted {
			color: #909399;
			font-size: 25rpx;
		}

		.coupon-scroll {
			height: 640rpx;
			background: #f6f6f6;
		}

		.coupon-obj {
			padding: 20rpx 24rpx;
		}

		.coupon-card {
			margin-bottom: 20rpx;
			background: #ffffff;
		}

		.coupon-card--received {
			opacity: .78;
		}

		.coupon-section-title {
			margin: 4rpx 0 18rpx;
			color: #606266;
			font-size: 26rpx;
			font-weight: 600;
		}

		.coupon-item {
			position: relative;
			display: flex;
			height: 160rpx;
			background-image: url(https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/coupon_bg.png);
			background-size: 100% 100%;
		}

		.coupon-item .price {
			flex: none;
			width: 200rpx;
			min-width: 180rpx;
			box-sizing: border-box;
		}

		.coupon-info-wrap {
			flex: 1;
			min-width: 0;
		}

		.coupon-info-wrap .info {
			flex: 1;
			min-width: 0;
		}

		.coupon-receive-btn {
			flex: none;
			min-width: 104rpx;
			height: 52rpx;
			margin-right: 20rpx;
			padding: 0 18rpx;
			border-radius: 26rpx;
			background: #037dfa;
			color: #ffffff;
			font-size: 24rpx;
			line-height: 52rpx;
			text-align: center;
			box-sizing: border-box;
		}

		.coupon-receive-btn--disabled {
			background: #d6d9df;
		}

		.coupon-tips {
			padding: 14rpx 20rpx;
		}

		.coupon-empty {
			padding-top: 50rpx;
		}

		.coupon-confirm {
			width: 710rpx;
			height: 74rpx;
			margin-top: 12rpx;
		}

		.points-pop {
			padding: 10rpx 30rpx 30rpx;
			background: #ffffff;
		}

		.points-pop__row {
			display: flex;
			align-items: flex-start;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #f1f2f5;
		}

		.points-pop__label {
			flex: none;
			width: 150rpx;
			color: #606266;
			font-size: 26rpx;
			line-height: 38rpx;
		}

		.points-pop__value {
			flex: 1;
			color: #222222;
			font-size: 26rpx;
			line-height: 38rpx;
		}

		.points-pop__confirm {
			height: 74rpx;
			margin-top: 28rpx;
		}

		.option-row__tags {
			display: flex;
			flex: 1;
			flex-wrap: wrap;
			gap: 10rpx;
			min-width: 0;
			margin-left: 18rpx;
		}

		.option-row__tag {
			max-width: 220rpx;
			padding: 0 14rpx;
			overflow: hidden;
			color: #037dfa;
			font-size: 22rpx;
			line-height: 36rpx;
			white-space: nowrap;
			text-overflow: ellipsis;
			background: #edf6ff;
			border-radius: 18rpx;
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
			margin: 24rpx 26rpx 0;
			padding: 24rpx;
			border-radius: 24rpx;
			box-sizing: border-box;

			.text {
				width: 100rpx;
			}
		}

		.evaluation {
			margin: 24rpx 26rpx 0;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 10rpx 28rpx rgba(24, 44, 84, .05);

			.title {
				min-height: 104rpx;
				border-bottom: 1rpx solid #f0f2f5;
				padding: 0 26rpx;
			}

			.evaluation-title {
				display: flex;
				align-items: baseline;
				min-width: 0;
			}

			.evaluation-title__main {
				color: #172033;
				font-size: 30rpx;
				font-weight: 800;
				line-height: 42rpx;
			}

			.evaluation-title__rate {
				margin-left: 14rpx;
				color: #ff8a00;
				font-size: 23rpx;
				line-height: 32rpx;
			}

			.con {
				padding: 30rpx 26rpx;
			}

			.empty-state {
				color: #98a2b3;
				font-size: 26rpx;
				text-align: center;
				background: #ffffff;
			}

			.user-info {
				display: flex;
				align-items: flex-start;
			}

			.comment-avatar-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				flex: none;
				width: 68rpx;
				height: 68rpx;
				border-radius: 50%;
				background: #eef0f3;
				overflow: hidden;
			}

			.comment-avatar-wrap.is-anonymous {
				color: #ffffff;
				background: linear-gradient(135deg, #9aa4b2 0%, #667085 100%);
			}

			.user-info .avatar {
				flex: none;
				width: 68rpx;
				height: 68rpx;
				border-radius: 50%;
				background: #eef2f7;
			}

			.comment-avatar-text {
				color: #ffffff;
				font-size: 27rpx;
				font-weight: 800;
			}

			.comment-user-main {
				flex: 1;
				min-width: 0;
				margin-left: 18rpx;
			}

			.comment-user-row {
				display: flex;
				align-items: center;
				margin-bottom: 6rpx;
			}

			.comment-stars {
				display: flex;
				align-items: center;
			}

			.comment-star {
				width: 24rpx;
				height: 24rpx;
				margin-right: 4rpx;
				color: #d0d5dd;
				font-size: 24rpx;
				line-height: 24rpx;
			}

			.comment-star.is-active {
				color: #ffad1f;
			}

			.user-name {
				flex: 1;
				min-width: 0;
				color: #172033;
				font-size: 28rpx;
				font-weight: 700;
				line-height: 38rpx;
			}

			.comment-score {
				flex: none;
				margin-left: 10rpx;
				color: #8a8f99;
				font-size: 22rpx;
				line-height: 26rpx;
			}

			.comment-anonymous-tag {
				flex: none;
				height: 32rpx;
				margin-left: 12rpx;
				padding: 0 12rpx;
				border-radius: 999rpx;
				color: #858b96;
				font-size: 21rpx;
				line-height: 32rpx;
				background: #f4f4f5;
			}

			.comment-meta {
				display: flex;
				flex-wrap: wrap;
				gap: 10rpx 16rpx;
				margin-top: 16rpx;
				color: #8c8c8c;
				font-size: 23rpx;
				line-height: 32rpx;
			}

			.comment-tag-row {
				display: flex;
				flex-wrap: wrap;
				gap: 10rpx;
				margin-top: 16rpx;
			}

			.comment-tag {
				max-width: 100%;
				padding: 6rpx 14rpx;
				border-radius: 999rpx;
				color: #ff5000;
				font-size: 22rpx;
				line-height: 28rpx;
				background: #fff3ea;
				box-sizing: border-box;
			}

			.dec {
				margin-top: 18rpx;
				color: #30343b;
				font-size: 28rpx;
				line-height: 42rpx;
				word-break: break-all;
			}

			.dec--empty {
				color: #98a2b3;
			}

			.comment-images {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 10rpx;
				margin-top: 18rpx;
				max-width: 520rpx;
			}

			.comment-images--append {
				margin-top: 14rpx;
			}

			.comment-image {
				aspect-ratio: 1 / 1;
				border-radius: 12rpx;
				overflow: hidden;
				background: #f2f4f7;

				image {
					width: 100%;
					height: 100%;
				}
			}

			.comment-reply {
				margin-top: 18rpx;
				padding: 18rpx 20rpx;
				border-radius: 14rpx;
				background: #f7f8fa;
			}

			.comment-append {
				margin-top: 18rpx;
				padding: 18rpx 20rpx;
				border-radius: 14rpx;
				background: #f7f8fa;
			}

			.comment-reply__title,
			.comment-append__title {
				color: #172033;
				font-size: 25rpx;
				font-weight: 700;
				line-height: 34rpx;
			}

			.comment-append__title {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 16rpx;
			}

			.comment-append__time,
			.comment-reply__time {
				color: #999999;
				font-size: 22rpx;
				font-weight: 400;
				line-height: 30rpx;
			}

			.comment-reply__time {
				margin-top: 8rpx;
			}

			.comment-reply__text,
			.comment-append__text {
				margin-top: 8rpx;
				color: #475467;
				font-size: 25rpx;
				line-height: 38rpx;
				word-break: break-all;
			}

			.comment-score-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 12rpx;
				margin-top: 18rpx;
			}

			.comment-score-tag {
				height: 42rpx;
				padding: 0 16rpx;
				border-radius: 999rpx;
				color: #f97316;
				font-size: 22rpx;
				line-height: 42rpx;
				background: #fff3e0;
			}

			.comment-like {
				margin-top: 18rpx;
				color: #98a2b3;
				font-size: 23rpx;
				line-height: 32rpx;
				text-align: right;
			}
		}

		.group-record {
			margin: 24rpx 26rpx 0;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 10rpx 28rpx rgba(24, 44, 84, .05);
		}

		.group-record__head {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 32rpx 28rpx 16rpx;
		}

		.group-record__title {
			color: #172033;
			font-size: 30rpx;
			font-weight: 800;
			line-height: 42rpx;
		}

		.group-record__summary {
			color: #ff7a00;
			font-size: 24rpx;
			line-height: 34rpx;
		}

		.group-record__item {
			display: flex;
			align-items: center;
			margin: 0 26rpx;
			padding: 22rpx 0;
			border-top: 1rpx solid #f0f2f5;
		}

		.group-record__avatar {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 80rpx;
			height: 80rpx;
			flex: none;
			border-radius: 50%;
			color: #2f6db6;
			font-size: 28rpx;
			font-weight: 800;
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
			min-width: 0;
			padding-left: 18rpx;
		}

		.group-record__name {
			color: #172033;
			font-size: 27rpx;
			font-weight: 700;
			line-height: 36rpx;
		}

		.group-record__time {
			margin-top: 8rpx;
			color: #8b95a5;
			font-size: 23rpx;
			line-height: 32rpx;
		}

		.group-record__meta {
			margin-top: 6rpx;
			color: #ff7a00;
			font-size: 22rpx;
			line-height: 30rpx;
		}

		.group-record__side {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			flex: none;
			margin-left: 18rpx;
		}

		.group-record__plus {
			color: #1677ff;
			font-size: 28rpx;
			font-weight: 800;
			line-height: 38rpx;
		}

		.group-record__side-text {
			margin-top: 4rpx;
			color: #98a2b3;
			font-size: 21rpx;
			line-height: 30rpx;
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
				padding: 0 20rpx 24rpx;
				overflow: hidden;
				color: #333333;
				font-size: 26rpx;
				line-height: 1.7;

				::v-deep image {
					max-width: 100%;
					height: auto;
					border-radius: 12rpx;
					vertical-align: middle;
				}

				// #ifdef H5
				::v-deep img {
					max-width: 100%;
					height: auto;
					border-radius: 12rpx;
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
				flex: 1;
				min-width: 0;
				height: 80rpx;
				margin-left: 28rpx;
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
			width: 700rpx;
			max-width: calc(100vw - 32rpx);
			max-height: calc(100vh - 56rpx);
			padding: 24rpx 0 22rpx;
			box-sizing: border-box;
			overflow-y: auto;
		}

		.goods-share-shop {
			display: flex;
			width: 540rpx;
			max-width: calc(100vw - 96rpx);
			min-height: 168rpx;
			margin: 0 auto;
			padding: 20rpx 24rpx;
			box-sizing: border-box;
			border-radius: 28rpx;
			background: linear-gradient(135deg, rgba(3, 125, 250, 0.96), rgba(3, 172, 250, 0.9));
			box-shadow: 0 20rpx 44rpx rgba(0, 84, 184, 0.24);
		}

		.goods-share-shop__logo {
			flex: none;
			width: 120rpx;
			height: 120rpx;
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
			margin: 0 auto;
			padding: 24rpx 22rpx 24rpx;
			box-sizing: border-box;
			border-radius: 30rpx;
			background: #ffffff;
			box-shadow: 0 24rpx 70rpx rgba(0, 82, 176, 0.22);
		}

		.goods-share-main {
			width: 100%;
			height: 34vh;
			max-height: 400rpx;
			min-height: 280rpx;
			border-radius: 23rpx;
			background: #d5d5d5;
		}

		.goods-share-title {
			margin-top: 14rpx;
			color: #222222;
			font-size: 30rpx;
			font-weight: 600;
			line-height: 40rpx;
		}

		.goods-share-meta {
			margin-top: 8rpx;
			color: #8b95a5;
			font-size: 24rpx;
			line-height: 34rpx;
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
			flex: none;
			width: 105px;
			height: 105px;
			padding: 0px;
			border-radius: 18rpx;
			background: #f3f3f3;
			box-sizing: border-box;
		}

		.goods-share-qrcode__image {
			width: 180px;
			height: 180px;
		}

		.goods-share-qrcode__loading {
			color: #999999;
			font-size: 22rpx;
		}

		.goods-share-actions {
			display: flex;
			justify-content: space-between;
			gap: 20rpx;
			margin: 22rpx 8rpx 0;
		}

		.goods-share-action {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			min-width: 0;
			height: 76rpx;
			padding: 0;
			border-radius: 40rpx;
			background: #037dfa;
			color: #ffffff;
			font-size: 28rpx;
			font-weight: 500;
			line-height: 76rpx;
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
