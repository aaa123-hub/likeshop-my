<template>
    <view
        :class="[
            'business-scene',
            scene === 'user-kyc' ? 'business-scene--user-kyc' : '',
            scene === 'feedback' ? 'business-scene--feedback' : '',
            scene === 'about-us' ? 'business-scene--about-us' : '',
            scene === 'activity-center' ? 'business-scene--activity-center' : '',
            scene === 'intro-card' ? 'business-scene--intro-card' : '',
            scene === 'recent-visits' ? 'business-scene--recent-visits' : ''
        ]"
    >
        <navbar v-if="!isFullScene" :title="sceneConfig.title"></navbar>
        <scroll-view scroll-y :class="['business-scene__scroll', isFullScene ? 'business-scene__scroll--full' : '']" @scrolltolower="onSceneScrollLower">
            <template v-if="scene === 'user-kyc'">
                <view class="user-kyc-page">
                    <view class="user-kyc-page__hero">
                        <view class="user-kyc-page__topbar">
                            <view class="user-kyc-page__back" @tap="goBack">
                                <u-icon name="arrow-left" size="34" color="#222222"></u-icon>
                            </view>
                            <view class="user-kyc-page__topbar-space"></view>
                        </view>

                        <view class="user-kyc-page__hero-body">
                            <view class="user-kyc-page__copy">
                                <view class="user-kyc-page__title">用户KYC</view>
                                <view class="user-kyc-page__subtitle">完成实名信息后可使用更多服务</view>
                                <view v-if="kycStatusText" :class="['user-kyc-page__status-pill', kycStatusClass]">{{ kycStatusText }}</view>
                            </view>

                            <view class="user-kyc-page__illustration">
                                <image class="user-kyc-page__illustration-image" :src="user_kyc" mode="aspectFit"></image>
                            </view>
                        </view>
                    </view>

                    <view class="user-kyc-page__sheet">
                        <view v-if="showKycAuditCard" class="user-kyc-page__audit-card">
                            <view class="user-kyc-page__audit-title">认证状态：{{ kycStatusText }}</view>
                            <view v-if="kycAuditMessage" class="user-kyc-page__audit-desc">{{ kycAuditMessage }}</view>
                            <view v-if="kycSubmitTimeText" class="user-kyc-page__audit-time">提交时间：{{ kycSubmitTimeText }}</view>
                        </view>
                        <view v-if="kycDisplayRows.length" class="user-kyc-page__info-grid">
                            <view v-for="item in kycDisplayRows" :key="item.label" class="user-kyc-page__info-item">
                                <view class="user-kyc-page__info-label">{{ item.label }}</view>
                                <view class="user-kyc-page__info-value line1">{{ item.value }}</view>
                            </view>
                        </view>
                        <template v-if="canEditKyc">
                        <view class="user-kyc-page__field">
                            <text class="user-kyc-page__label">姓名</text>
                                <input v-model="kycForm.realName" class="user-kyc-page__input" :disabled="!canEditKyc" placeholder="请输入真实姓名" placeholder-class="user-kyc-page__placeholder"></input>
                        </view>
                        <view class="user-kyc-page__field">
                            <text class="user-kyc-page__label">证件类型</text>
                            <text class="user-kyc-page__value">身份证</text>
                        </view>
                        <view class="user-kyc-page__field">
                            <text class="user-kyc-page__label">证件号码</text>
                                <input v-model="kycForm.certNo" class="user-kyc-page__input" :disabled="!canEditKyc" placeholder="请输入证件号码" placeholder-class="user-kyc-page__placeholder"></input>
                        </view>

                        <view class="user-kyc-page__section-title">证件照片</view>
                        <view class="user-kyc-page__photo-row">
                            <view class="user-kyc-page__photo-card user-kyc-page__photo-card--front" @tap="chooseKycImage('front')">
                                <image class="user-kyc-page__photo-image" :src="kycForm.certFrontPreview || left_icon" mode="aspectFill"></image>
                                <image v-if="!kycForm.certFrontPreview" class="user-kyc-page__photo-add" :src="icon_conter" mode="aspectFit"></image>
                            </view>
                            <view class="user-kyc-page__photo-card user-kyc-page__photo-card--back" @tap="chooseKycImage('back')">
                                <image class="user-kyc-page__photo-image" :src="kycForm.certBackPreview || right_icon" mode="aspectFill"></image>
                                <image v-if="!kycForm.certBackPreview" class="user-kyc-page__photo-add" :src="icon_conter" mode="aspectFit"></image>
                            </view>
                        </view>

                        <view class="user-kyc-page__contract" @tap="openKycContract">
                            <view class="user-kyc-page__contract-copy">
                                <view class="user-kyc-page__contract-title">合同签署</view>
                                <view class="user-kyc-page__contract-desc">{{ contractSigned ? '已阅读并签署申请合同' : '提交前需滑动阅读完整合同并签署' }}</view>
                            </view>
                            <view :class="['user-kyc-page__contract-status', contractSigned ? 'is-signed' : '']">{{ contractSigned ? '已签署' : '去签署' }}</view>
                        </view>

                        <view :class="['user-kyc-page__submit', kycSubmitting || !canEditKyc ? 'is-disabled' : '']" @tap="submitKycForm">{{ kycSubmitText }}</view>
                        </template>
                    </view>
                </view>
            </template>

            <template v-if="scene === 'feedback'">
                <view class="feedback-page">
                    <view class="feedback-hero">
                        <view class="feedback-hero__top">
                            <view class="feedback-back" @tap="goBack">
                                <u-icon name="arrow-left" size="36" color="#222222"></u-icon>
                            </view>
                            <view class="feedback-menu-space"></view>
                        </view>

                        <view class="feedback-hero__body">
                            <view class="feedback-hero__text">
                                <view class="feedback-hero__title">意见反馈</view>
                                <view class="feedback-hero__subtitle">我们认真聆听您的心声</view>
                            </view>
                            <image class="feedback-hero__illustration" :src="feedbackHeroImage" mode="aspectFit"></image>
                        </view>
                    </view>

                    <view class="feedback-body">
                        <view class="feedback-card feedback-card--types">
                            <view class="feedback-card__title">选择问题类型</view>
                            <view class="feedback-tag-grid">
                                <view
                                    v-for="(item, index) in feedbackTags"
                                    :key="index"
                                    :class="['feedback-tag', selectedTag === item ? 'feedback-tag--active' : '']"
                                    @tap="selectedTag = item"
                                >
                                    <text class="feedback-tag__text">{{ item }}</text>
                                    <view v-if="selectedTag === item" class="feedback-tag__check">
                                        <text class="feedback-tag__check-mark">✓</text>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <view class="feedback-card feedback-card--form">
                            <view class="feedback-card__title">请输入您想说的话</view>
                            <view class="feedback-textarea-shell">
                                <textarea
                                    v-model="feedbackContent"
                                    class="feedback-textarea"
                                    maxlength="300"
                                    placeholder=" "
                                    :placeholder-style="'color: transparent;'"
                                ></textarea>
                                <view class="feedback-upload" @tap="chooseFeedbackImage">
                                    <image class="feedback-upload__icon" :src="feedbackUploadIcon" mode="aspectFit"></image>
                                </view>
                                <view class="feedback-textarea__count">{{ feedbackContent.length }}/300</view>
                            </view>
                            <view v-if="feedbackImages.length" class="feedback-preview-row">
                                <view v-for="(item, index) in feedbackImages" :key="index" class="feedback-preview">
                                    <image class="feedback-preview__image" :src="item.preview || item.url" mode="aspectFill"></image>
                                    <view class="feedback-preview__close" @tap="removeFeedbackImage(index)">×</view>
                                </view>
                            </view>

                            <view class="feedback-contact__title">联系方式</view>
                            <view class="feedback-contact-shell">
                                <input
                                    v-model="feedbackContact"
                                    class="feedback-contact"
                                    placeholder=" "
                                    :placeholder-style="'color: transparent;'"
                                />
                            </view>
                        </view>

                        <view class="feedback-submit" @tap="submitFeedbackForm">提交</view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'face-pay'">
                <view class="face-pay-page">
                    <view class="face-pay-tips">
                        <view class="face-pay-tips__icon">
                            <u-icon name="bell-fill" color="#ffb221" size="46"></u-icon>
                        </view>
                        <view class="face-pay-tips__text">请核对付款单号后完成付款</view>
                    </view>
                    <view class="face-pay-shell">
                        <view class="face-pay-shell__field">
                            <text class="face-pay-shell__label">付款单号</text>
                            <input v-model="facePayCode" class="face-pay-shell__input" placeholder="请输入付款单号" />
                        </view>
                        <view class="face-pay-shell__scan" @tap="scanFacePayCode">
                            <u-icon name="scan" color="#222222" size="54"></u-icon>
                            <text>扫一扫</text>
                        </view>
                    </view>
                    <view class="face-pay-calculator">
                        <view class="face-pay-calculator__title">线下核销积分预览</view>
                        <view class="face-pay-calc-row">
                            <text>商品原价</text>
                            <input v-model="facePayOriginalPrice" type="digit" placeholder="请输入金额" />
                        </view>
                        <view class="face-pay-calc-row">
                            <text>让利比例</text>
                            <input v-model="facePayBenefitRatio" type="digit" placeholder="例如 0.1" />
                        </view>
                        <view class="face-pay-calc-result">
                            消费者预计可获得 <text>{{ facePayRewardPoints }}</text> 积分
                        </view>
                    </view>
                    <view class="face-pay-submit" @tap="submitFacePay">确认付款</view>
                </view>
            </template>

            <template v-else-if="scene === 'store-detail'">
                <view class="store-detail-page">
                    <view class="store-detail-hero">
                        <image class="store-detail-hero__image" :src="storeDetailHeroImage" mode="aspectFill"></image>
                        <view class="store-detail-hero__mask"></view>

                        <view class="store-detail-hero__top">
                            <view class="store-detail-hero__back" @tap="goBack">
                                <view class="store-detail-hero__back-icon"></view>
                            </view>
                            <view class="store-detail-hero__title">店铺详情</view>
                            <view class="store-detail-hero__share" @tap="showStoreSharePopup = true">分享</view>
                        </view>
                    </view>

                    <view class="store-detail-summary-card">
                        <view class="store-detail-summary-card__image-shell">
                            <image class="store-detail-summary-card__image" :src="storeDetailCardImage" mode="aspectFill"></image>
                        </view>
                        <view class="store-detail-summary-card__body">
                            <view class="store-detail-summary-card__title line1">{{ storeDetailView.shopName }}</view>
                            <view class="store-detail-summary-card__rating">
                                <view class="store-detail-summary-card__stars">
                                    <image
                                        v-for="starIndex in 5"
                                        :key="starIndex"
                                        class="store-detail-summary-card__star"
                                        :src="storeDetailStarIcon"
                                        mode="aspectFit"
                                    ></image>
                                </view>
                                <text class="store-detail-summary-card__score">{{ storeDetailView.shopScore }}</text>
                            </view>
                            <view class="store-detail-summary-card__time-row">
                                <image class="store-detail-summary-card__time-icon" :src="storeDetailTimeIcon" mode="aspectFit"></image>
                                <text class="store-detail-summary-card__time line1">{{ storeDetailBusinessHoursText }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="store-detail-address-card" @tap="openStoreDetailMap">
                        <image class="store-detail-address-card__icon" :src="storeDetailAddressIcon" mode="aspectFit"></image>
                        <text class="store-detail-address-card__text line1">{{ storeDetailView.detailAddress }}</text>
                    </view>

                    <view class="store-detail-tabs">
                        <view
                            v-for="tab in storeDetailTabs"
                            :key="tab.key"
                            :class="['store-detail-tab', tab.active ? 'store-detail-tab--active' : '']"
                            @tap="onStoreDetailTab(tab)"
                        >
                            <text class="store-detail-tab__label">{{ tab.label }}</text>
                            <view v-if="tab.active" class="store-detail-tab__indicator"></view>
                        </view>
                    </view>

                    <view v-if="storeDetailActiveTab === 'detail'" class="store-detail-content-card">
                        <image class="store-detail-content-card__image" :src="storeDetailContentImage" mode="aspectFill"></image>
                        <view class="store-detail-content-card__fade"></view>
                        <view class="store-detail-pay-btn" @tap="goPage(storeDetailPayUrl)">到店付款</view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'group'" class="store-detail-group-list">
                        <view
                            v-for="(item, index) in storeDetailGroupProducts"
                            :key="item.key"
                            class="store-detail-group-card"
                            @tap="goStoreDetailGroupItem(item)"
                        >
                            <view class="store-detail-group-card__image-shell">
                                <view v-if="isEmptyImage(item.image)" class="store-detail-group-card__image image-placeholder">无</view>
                                <image v-else class="store-detail-group-card__image" :src="item.image" mode="aspectFill"></image>
                            </view>
                            <view class="store-detail-group-card__body">
                                <view class="store-detail-group-card__title line1">{{ item.name }}</view>
                                <view v-if="item.tagText || item.meta" class="store-detail-group-card__meta line1">
                                    <text v-if="item.tagText" class="store-detail-group-card__tag">{{ item.tagText }}</text>
                                    <text v-if="item.meta">{{ item.meta }}</text>
                                </view>
                                <view v-if="item.infoText" class="store-detail-group-card__info line1">{{ item.infoText }}</view>
                                <view v-if="item.scoreText" class="store-detail-group-card__rating">
                                    <view class="store-detail-group-card__stars">
                                        <image
                                            v-for="starIndex in 5"
                                            :key="starIndex"
                                            class="store-detail-group-card__star"
                                            :src="storeDetailStarIcon"
                                            mode="aspectFit"
                                        ></image>
                                    </view>
                                    <text class="store-detail-group-card__score">{{ item.scoreText }}</text>
                                </view>
                                <view class="store-detail-group-card__price">
                                    <text class="store-detail-group-card__price-value">{{ item.priceText }}</text>
                                    <text v-if="item.marketPriceText" class="store-detail-group-card__market-price">{{ item.marketPriceText }}</text>
                                </view>
                            </view>
                            <view class="store-detail-group-card__action-wrap" @tap.stop.prevent="goStoreDetailGroupItem(item)">
                                <view class="store-detail-group-card__action">立即抢</view>
                            </view>
                        </view>
                        <view v-if="!storeDetailGroupProducts.length" class="store-detail-media-empty">
                            <image
                                class="store-detail-media-empty__image"
                                :src="storeDetailAlbumEmptyImage"
                                mode="aspectFit"
                            ></image>
                            <view class="store-detail-media-empty__title">暂无团购</view>
                            <view class="store-detail-media-empty__desc">商家暂未上架团购商品</view>
                        </view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'album'" class="store-detail-media-wrap">
                        <view v-if="storeDetailAlbumImages.length" class="store-detail-album-grid">
                            <view
                                v-for="(item, index) in storeDetailAlbumImages"
                                :key="index"
                                class="store-detail-album-card"
                                @tap="previewStoreDetailAlbum(index)"
                            >
                                <image class="store-detail-album-card__image" :src="item.url" mode="aspectFill"></image>
                            </view>
                        </view>
                        <view v-else class="store-detail-media-empty">
                            <image
                                class="store-detail-media-empty__image"
                                :src="storeDetailAlbumEmptyImage"
                                mode="aspectFit"
                            ></image>
                            <view class="store-detail-media-empty__title">暂无相册</view>
                            <view class="store-detail-media-empty__desc">商家暂未上传门店照片</view>
                        </view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'video'" class="store-detail-media-wrap">
                        <view v-if="storeDetailVideos.length" class="store-detail-video-grid">
                            <view
                                v-for="(item, index) in storeDetailVideos"
                                :key="index"
                                class="store-detail-video-card"
                                @tap="previewStoreDetailVideo(item)"
                            >
                                <image class="store-detail-video-card__cover" :src="item.cover" mode="aspectFill"></image>
                                <view class="store-detail-video-card__mask">
                                    <view class="store-detail-video-card__play"></view>
                                </view>
                                <view class="store-detail-video-card__title line1">{{ item.title }}</view>
                            </view>
                        </view>
                        <view v-else class="store-detail-media-empty">
                            <image
                                class="store-detail-media-empty__image"
                                :src="storeDetailAlbumEmptyImage"
                                mode="aspectFit"
                            ></image>
                            <view class="store-detail-media-empty__title">暂无视频</view>
                            <view class="store-detail-media-empty__desc">商家暂未上传门店视频</view>
                        </view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'comment'" class="store-detail-comment-list">
                        <view
                            v-for="(item, index) in storeDetailDisplayComments"
                            :key="index"
                            class="store-detail-comment-card"
                        >
                            <view class="store-detail-comment-card__head">
                                <image
                                    v-if="item.avatar"
                                    class="store-detail-comment-card__avatar-image"
                                    :src="item.avatar"
                                    mode="aspectFill"
                                ></image>
                                <view v-else class="store-detail-comment-card__avatar"></view>
                                <view class="store-detail-comment-card__meta">
                                    <view class="store-detail-comment-card__name line1">{{ item.name }}</view>
                                    <view class="store-detail-comment-card__date">{{ item.date }}</view>
                                </view>
                            </view>
                            <view class="store-detail-comment-card__content line2">{{ item.content }}</view>
                        </view>
                        <view v-if="!storeDetailDisplayComments.length" class="store-detail-media-empty">
                            <image
                                class="store-detail-media-empty__image"
                                :src="storeDetailAlbumEmptyImage"
                                mode="aspectFit"
                            ></image>
                            <view class="store-detail-media-empty__title">暂无评价</view>
                            <view class="store-detail-media-empty__desc">商家暂无用户评价</view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'store-qr' || scene === 'goods-qr'">
                <view :class="['qr-page', scene === 'goods-qr' ? 'qr-page--goods' : 'qr-page--store']">
                    <view class="qr-shop-card">
                        <image class="qr-shop-card__logo" :src="qrShopInfo.logo" mode="aspectFill"></image>
                        <view class="qr-shop-card__body">
                            <view class="qr-shop-card__name">{{ qrShopInfo.name }}</view>
                            <view class="qr-shop-card__rating">
                                <image v-for="item in 3" :key="item" class="qr-shop-card__star" :src="streetStarIcon" mode="aspectFit"></image>
                                <text class="qr-shop-card__score">{{ qrShopInfo.score }}</text>
                            </view>
                            <view class="qr-shop-card__time">
                                <image class="qr-shop-card__time-icon" :src="streetTimeIcon" mode="aspectFit"></image>
                                <text>{{ qrShopInfo.timeText }}</text>
                            </view>
                        </view>
                    </view>

                    <image
                        class="qr-page__mark"
                        :src="scene === 'goods-qr' ? qrGoodsMarkIcon : qrStoreMarkIcon"
                        mode="aspectFit"
                    ></image>

                    <view v-if="scene === 'store-qr'" class="qr-store-panel">
                        <view class="qr-code-box qr-code-box--store">
                            <tki-qrcode cid="store-page-qrcode" :val="qrStoreValue" :size="275" :onval="true" :load-make="true" :show-loading="false" @result="onStoreShareQrcodeResult"></tki-qrcode>
                        </view>
                    </view>

                    <view v-else class="qr-goods-panel">
                        <image class="qr-goods-main" :src="qrGoodsInfo.image" mode="aspectFill"></image>
                        <view class="qr-goods-info">
                            <view class="qr-goods-copy">
                                <view class="qr-goods-price">
                                    <text class="qr-goods-price__symbol">¥</text><text class="qr-goods-price__main">{{ qrGoodsInfo.priceMain }}</text><text class="qr-goods-price__decimal">{{ qrGoodsInfo.priceDecimal }}</text>
                                </view>
                                <view class="qr-goods-tip">长按保存二维码</view>
                            </view>
                            <view class="qr-code-box qr-code-box--goods">
                                <tki-qrcode cid="goods-page-qrcode" :val="qrGoodsValue" :size="152" :onval="true" :load-make="true" :show-loading="false"></tki-qrcode>
                            </view>
                        </view>
                        <view class="qr-action-row qr-action-row--goods">
                            <view class="qr-action qr-action--cyan">保存图片</view>
                            <view class="qr-action">分享商品</view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'store-group'">
                <view class="card">
                    <view class="section-title">团购专区</view>
                            <view class="group-item" v-for="item in storeDetailGroupProducts" :key="item.key" @tap="goStoreDetailGroupItem(item)">
                        <view v-if="isEmptyImage(item.image)" class="group-item__image image-placeholder">无</view>
                        <image v-else class="group-item__image" :src="item.image" mode="aspectFill"></image>
                        <view class="group-item__content">
                            <view class="group-item__title line2">{{ item.name }}</view>
                            <view v-if="item.tagText || item.meta" class="group-item__meta line2">
                                <text v-if="item.tagText" class="group-item__tag">{{ item.tagText }}</text>
                                <text v-if="item.meta">{{ item.meta }}</text>
                            </view>
                            <view v-if="item.infoText" class="group-item__info line1">{{ item.infoText }}</view>
                            <view class="group-item__foot">
                                <view class="group-item__price-wrap">
                                    <text class="group-item__price">{{ item.priceText }}</text>
                                    <text v-if="item.marketPriceText" class="group-item__market-price">{{ item.marketPriceText }}</text>
                                </view>
                                <view class="mini-btn" @tap.stop.prevent="goStoreDetailGroupItem(item)">去拼团</view>
                            </view>
                        </view>
                    </view>
                    <view v-if="!storeDetailGroupProducts.length" class="store-detail-media-empty">
                        <image class="store-detail-media-empty__image" :src="storeDetailAlbumEmptyImage" mode="aspectFit"></image>
                        <view class="store-detail-media-empty__title">暂无团购</view>
                        <view class="store-detail-media-empty__desc">商家暂未上架团购商品</view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'store-album'">
                <view class="card">
                    <view class="section-title">店铺相册</view>
                    <view class="album-grid">
                        <image
                            v-for="(item, index) in albumImages"
                            :key="index"
                            class="album-grid__item"
                            :src="item"
                            mode="aspectFill"
                        ></image>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'street'">
                <view class="street-page">
                    <view class="street-header">
                        <view class="street-header__top">
                            <view class="street-header__title">商街</view>
                        </view>

                        <view class="street-search">
                            <input
                                v-model="streetKeyword"
                                class="street-search__input"
                                confirm-type="search"
                                :placeholder="streetSearchText"
                                placeholder-class="street-search__placeholder"
                                @confirm="onStreetSearch"
                            />
                            <view class="street-search__icon" @tap="onStreetSearch">
                                <image class="street-search__icon-image" :src="streetSearchIcon" mode="aspectFit"></image>
                            </view>
                        </view>
                    </view>

                    <view class="street-sheet">
                        <view class="street-service-grid">
                            <view
                                v-for="item in streetCategories"
                                :key="index"
                                class="street-service-item"
                                @tap="goPage(item.url)"
                            >
                                <view class="street-service-item__icon-shell">
                                    <view v-if="isEmptyImage(item.image)" class="street-service-item__image image-placeholder">无</view>
                                    <image v-else class="street-service-item__image" :src="item.image" mode="aspectFit"></image>
                                </view>
                                <text class="street-service-item__text">{{ item.name }}</text>
                            </view>
                        </view>

                        <view class="street-merchant-list">
                            <view
                                v-for="(item, index) in streetMerchants"
                                :key="index"
                                class="street-merchant-card"
                                @tap="goPage(item.url)"
                            >
                                <view class="street-merchant-card__image-shell">
                                    <view v-if="isEmptyImage(item.image)" class="street-merchant-card__image image-placeholder">无</view>
                                    <image v-else class="street-merchant-card__image" :src="item.image" mode="aspectFill"></image>
                                </view>
                                <view class="street-merchant-card__body">
                                    <view class="street-merchant-card__title line1">{{ item.name }}</view>
                                    <view class="street-merchant-card__rating">
                                        <view class="street-merchant-card__stars">
                                            <image
                                                v-for="starIndex in 5"
                                                :key="starIndex"
                                                class="street-merchant-card__star"
                                                :src="streetStarIcon"
                                                mode="aspectFit"
                                            ></image>
                                        </view>
                                        <text class="street-merchant-card__score">{{ item.score }}</text>
                                    </view>
                                    <view class="street-merchant-card__time-row">
                                        <image class="street-merchant-card__time-icon" :src="streetTimeIcon" mode="aspectFit"></image>
                                        <text class="street-merchant-card__time line1">{{ item.meta }}</text>
                                    </view>
                                </view>
                            </view>
                            <view v-if="!streetMerchants.length" class="store-detail-media-empty">
                                <image class="store-detail-media-empty__image" :src="storeDetailAlbumEmptyImage" mode="aspectFit"></image>
                                <view class="store-detail-media-empty__title">暂无商家</view>
                                <view class="store-detail-media-empty__desc">商家信息更新中</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'street-goods'">
                <view class="list-page">
                    <view class="search-shell">
                        <input
                            v-model="listKeyword"
                            class="search-shell__input"
                            confirm-type="search"
                            placeholder="输入关键词"
                            placeholder-class="search-shell__placeholder"
                            @confirm="onListSearch"
                        />
                        <view class="search-shell__icon" @tap="onListSearch">
                            <image class="search-shell__icon-image" :src="streetSearchIcon" mode="aspectFit"></image>
                        </view>
                    </view>
                    <view class="merchant-list">
                        <view
                            class="merchant-list__item"
                            v-for="(item, index) in filteredMerchantList"
                            :key="index"
                            @tap="openStreetGoodsItem(item)"
                        >
                            <view v-if="isEmptyImage(item.image || item.shopLogo)" class="merchant-list__image image-placeholder">无</view>
                            <image v-else class="merchant-list__image" :src="item.image || item.shopLogo" mode="aspectFill"></image>
                            <view class="merchant-list__body">
                                <view class="merchant-list__title line2">{{ item.name }}</view>
                                <view v-if="item.subtitle" class="merchant-list__desc line2">{{ item.subtitle }}</view>
                                <view class="merchant-list__price-row">
                                    <text class="merchant-list__price">{{ item.priceText }}</text>
                                    <text v-if="item.marketPriceText" class="merchant-list__market">{{ item.marketPriceText }}</text>
                                    <view v-if="item.scoreText" class="merchant-list__score">
                                        <text class="merchant-list__score-star">★</text>
                                        <text>{{ item.scoreText }}分</text>
                                    </view>
                                </view>
                                <view class="merchant-list__time line1">{{ item.meta || item.shopName || '商街精选' }}</view>
                                <view class="merchant-list__tags">
                                    <text v-if="item.salesText" class="merchant-list__tag">{{ item.salesText }}</text>
                                    <text v-if="item.stockText" class="merchant-list__tag">{{ item.stockText }}</text>
                                    <text v-if="item.distanceText" class="merchant-list__tag">{{ item.distanceText }}</text>
                                </view>
                            </view>
                        </view>
                        <view v-if="!filteredMerchantList.length" class="store-detail-media-empty">
                            <image class="store-detail-media-empty__image" :src="storeDetailAlbumEmptyImage" mode="aspectFit"></image>
                            <view class="store-detail-media-empty__title">暂无数据</view>
                            <view class="store-detail-media-empty__desc">换个关键词试试</view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'intro-card'">
                <view class="intro-card-page">
                    <image class="intro-card-page-bg" src="https://shengyuan.store/api/miniapp/files/miniapp/8997886b278e4233a0184d4001823b24/intro-card-page-bg.png" mode="scaleToFill"></image>
                    <view class="intro-card-topbar">
                        <view class="intro-card-back" @tap="goBack"></view>
                        <view class="intro-card-title">联盟码</view>
                    </view>

                    <view class="intro-card-panel">
                        <image class="intro-card-panel-bg" src="https://shengyuan.store/api/miniapp/files/miniapp/4a6ec42c3ad54de8a47300fb1a79d820/intro-card-panel-bg.png" mode="scaleToFill"></image>
                        <view class="intro-card-user">
                            <image class="intro-card-avatar" :src="introCardInfo.avatar" mode="aspectFill"></image>
                            <view class="intro-card-info">
                                <view class="intro-card-name">{{ introCardInfo.nickname }}</view>
                                <view class="intro-card-line">
                                    <text class="intro-card-line__text">ID:{{ introCardInfo.userNo }}</text>
                                    <image class="intro-card-copy" :src="introCardCopyIcon" mode="aspectFit" @tap="copyIntroCardText(introCardInfo.userNo)"></image>
                                </view>
                                <view class="intro-card-line intro-card-line--account">
                                    <text class="intro-card-line__text">联盟码:{{ introCardInfo.code }}</text>
                                    <image class="intro-card-copy" :src="introCardCopyIconAlt" mode="aspectFit" @tap="copyIntroCardText(introCardInfo.code)"></image>
                                </view>
                            </view>
                        </view>
                        <image v-if="introCardInfo.qrImage" class="intro-card-qr" :src="introCardInfo.qrImage" mode="aspectFit"></image>
                        <view v-else class="intro-card-qr intro-card-qr--code">
                            <tki-qrcode cid="intro-card-qrcode" :val="introCardQrValue" :size="360" :onval="true" :load-make="true" :show-loading="false"></tki-qrcode>
                        </view>
                        <view class="intro-card-stats">
                            <view v-for="item in introCardStats" :key="item.label" class="intro-card-stat">
                                <view class="intro-card-stat__value">{{ item.value }}</view>
                                <view class="intro-card-stat__label">{{ item.label }}</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'recent-visits'">
                <view class="recent-visits-page">
                    <view class="recent-visits-topbar">
                        <view class="recent-visits-back" @tap="goBack"></view>
                        <view class="recent-visits-title">最近访问</view>
                    </view>

                    <view class="recent-visits-list">
                        <view v-if="!recentVisitItems.length" class="recent-visits-empty">暂无最近访问记录</view>
                        <block v-else>
                            <view
                                v-for="(item, index) in recentVisitItems"
                                :key="index"
                                class="recent-visits-item"
                                @tap="openRecentVisitShop(item)"
                            >
                                <view v-if="isEmptyImage(item.image)" class="recent-visits-thumb image-placeholder">无</view>
                                <image v-else class="recent-visits-thumb" :src="item.image" mode="aspectFill"></image>
                                <view class="recent-visits-info">
                                    <view class="recent-visits-name">{{ item.name }}</view>
                                    <view class="recent-visits-time">{{ item.time }} 访问过的商家</view>
                                </view>
                                <view :class="['recent-visits-btn', item.subscribed ? 'recent-visits-btn--subscribed' : '']" @tap.stop="toggleRecentVisitSubscribe(item)">
                                    {{ item.subscribed ? '已订阅' : '+订阅' }}
                                </view>
                            </view>
                        </block>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'payment-record'">
                <view class="payment-record-page">
                    <view class="payment-summary-card">
                        <view class="payment-summary-card__head">
                            <view class="payment-summary-card__title">付款合计</view>
                            <view class="payment-summary-card__filter" @tap="openPaymentFilter">
                                <image class="payment-summary-card__filter-image" :src="paymentRecordFilterIcon" mode="aspectFit"></image>
                            </view>
                        </view>

                        <view class="payment-summary-card__stats">
                            <view class="payment-summary-card__stat">
                                <view class="payment-summary-card__stat-label">总金额(元)</view>
                                <view class="payment-summary-card__stat-value">{{ paymentRecordSummary.totalAmount }}</view>
                            </view>
                            <view class="payment-summary-card__divider"></view>
                            <view class="payment-summary-card__stat payment-summary-card__stat--right">
                                <view class="payment-summary-card__stat-label">总数量(笔)</view>
                                <view class="payment-summary-card__stat-value">{{ paymentRecordSummary.totalCount }}</view>
                            </view>
                        </view>

                        <view class="payment-summary-card__line"></view>

                        <view class="payment-summary-card__row">
                            <text>人民币合计（元）:</text>
                            <text>{{ paymentRecordSummary.fiatAmount }}</text>
                        </view>
                    </view>

                    <view v-if="!paymentRecordList.length" class="payment-record-empty">
                        <view class="payment-record-empty__icon">
                            <view class="payment-record-empty__card"></view>
                        </view>
                        <view class="payment-record-empty__text">暂无数据</view>
                    </view>

                    <view v-else class="payment-record-list">
                        <view v-for="(item, index) in paymentRecordList" :key="index" class="payment-record-item">
                            <view class="payment-record-item__main">
                                <view class="payment-record-item__title">{{ item.type_desc || item.source_type || '付款记录' }}</view>
                                <view class="payment-record-item__time">{{ item.create_time || item.change_time || '' }}</view>
                            </view>
                            <view :class="['payment-record-item__amount', item.change_type == 1 ? 'is-plus' : '']">
                                {{ item.change_type == 1 ? '+' : '-' }}{{ formatPaymentRecordAmount(item.change_amount) }}
                            </view>
                        </view>
                    </view>

                    <view v-if="showPaymentFilter" class="payment-filter-modal">
                        <view class="payment-filter-modal__mask" @tap="closePaymentFilter"></view>
                        <view class="payment-filter-sheet">
                            <view class="payment-filter-sheet__head">
                                <text class="payment-filter-sheet__title">筛选</text>
                                <view class="payment-filter-sheet__close" @tap="closePaymentFilter">
                                    <u-icon name="close" size="48" color="#111111"></u-icon>
                                </view>
                            </view>

                            <view class="payment-filter-sheet__search">
                                <view class="payment-filter-sheet__search-icon">
                                    <u-icon name="search" size="34" color="#111111"></u-icon>
                                </view>
                                <text class="payment-filter-sheet__search-placeholder">输入关键词</text>
                            </view>

                            <view class="payment-filter-sheet__section">
                                <view class="payment-filter-sheet__section-title">付款状态</view>
                                <view class="payment-filter-sheet__status-row payment-filter-sheet__option-row--three">
                                    <view
                                        v-for="item in paymentStatusOptions"
                                        :key="item.label"
                                        :class="['payment-filter-sheet__option', item.active ? 'payment-filter-sheet__option--active' : '']"
                                        @tap="selectPaymentFilterOption(paymentStatusOptions, item)"
                                    >
                                        {{ item.label }}
                                    </view>
                                </view>
                            </view>

                            <view class="payment-filter-sheet__section">
                                <view class="payment-filter-sheet__section-title">自定义时间</view>
                                <view class="payment-filter-sheet__date-row">
                                    <view class="payment-filter-sheet__date-field">开始时间</view>
                                    <text class="payment-filter-sheet__date-separator">—</text>
                                    <view class="payment-filter-sheet__date-field">结束时间</view>
                                </view>
                                <view class="payment-filter-sheet__picker">
                                    <view class="payment-filter-sheet__picker-col">
                                        <text
                                            v-for="item in paymentDateColumns.years"
                                            :key="item.label"
                                            :class="['payment-filter-sheet__picker-item', item.active ? 'payment-filter-sheet__picker-item--active' : '']"
                                        >
                                            {{ item.label }}
                                        </text>
                                    </view>
                                    <view class="payment-filter-sheet__picker-col">
                                        <text
                                            v-for="item in paymentDateColumns.months"
                                            :key="item.label"
                                            :class="['payment-filter-sheet__picker-item', item.active ? 'payment-filter-sheet__picker-item--active' : '']"
                                        >
                                            {{ item.label }}
                                        </text>
                                    </view>
                                    <view class="payment-filter-sheet__picker-col">
                                        <text
                                            v-for="item in paymentDateColumns.days"
                                            :key="item.label"
                                            :class="['payment-filter-sheet__picker-item', item.active ? 'payment-filter-sheet__picker-item--active' : '']"
                                        >
                                            {{ item.label }}
                                        </text>
                                    </view>
                                </view>
                            </view>

                            <view class="payment-filter-sheet__actions">
                                <view class="payment-filter-sheet__action payment-filter-sheet__action--ghost" @tap="resetPaymentFilter">重置</view>
                                <view class="payment-filter-sheet__action" @tap="applyPaymentFilter">确定</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'payment-filter'">
                <view class="payment-filter-page">
                    <view class="payment-filter-page__backdrop">
                        <view class="wallet-mode wallet-mode--ghost">
                            <view class="wallet-card wallet-card--solid">
                                <view class="wallet-card__label">人民币账户（元）</view>
                                <view class="wallet-card__amount">¥123.34</view>
                                <view class="wallet-card__line"></view>
                                <view class="wallet-card__row">
                                    <text>可提现金额</text>
                                    <text>¥123.34</text>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="payment-filter-sheet">
                        <view class="payment-filter-sheet__head">
                            <text class="payment-filter-sheet__title">筛选</text>
                            <view class="payment-filter-sheet__close" @tap="goBack">
                                <u-icon name="close" size="48" color="#111111"></u-icon>
                            </view>
                        </view>

                        <view class="payment-filter-sheet__search">
                            <view class="payment-filter-sheet__search-icon">
                                <u-icon name="search" size="34" color="#111111"></u-icon>
                            </view>
                            <text class="payment-filter-sheet__search-placeholder">输入关键词</text>
                        </view>

                        <view class="payment-filter-sheet__section">
                            <view class="payment-filter-sheet__section-title">付款状态</view>
                            <view class="payment-filter-sheet__status-row payment-filter-sheet__option-row--three">
                                <view
                                    v-for="item in paymentStatusOptions"
                                    :key="item.label"
                                    :class="['payment-filter-sheet__option', item.active ? 'payment-filter-sheet__option--active' : '']"
                                >
                                    {{ item.label }}
                                </view>
                            </view>
                        </view>

                        <view class="payment-filter-sheet__section">
                            <view class="payment-filter-sheet__section-title">自定义时间</view>
                            <view class="payment-filter-sheet__date-row">
                                <view class="payment-filter-sheet__date-field">开始时间</view>
                                <text class="payment-filter-sheet__date-separator">—</text>
                                <view class="payment-filter-sheet__date-field">结束时间</view>
                            </view>
                            <view class="payment-filter-sheet__picker">
                                <view class="payment-filter-sheet__picker-col">
                                    <text
                                        v-for="item in paymentDateColumns.years"
                                        :key="item.label"
                                        :class="['payment-filter-sheet__picker-item', item.active ? 'payment-filter-sheet__picker-item--active' : '']"
                                    >
                                        {{ item.label }}
                                    </text>
                                </view>
                                <view class="payment-filter-sheet__picker-col">
                                    <text
                                        v-for="item in paymentDateColumns.months"
                                        :key="item.label"
                                        :class="['payment-filter-sheet__picker-item', item.active ? 'payment-filter-sheet__picker-item--active' : '']"
                                    >
                                        {{ item.label }}
                                    </text>
                                </view>
                                <view class="payment-filter-sheet__picker-col">
                                    <text
                                        v-for="item in paymentDateColumns.days"
                                        :key="item.label"
                                        :class="['payment-filter-sheet__picker-item', item.active ? 'payment-filter-sheet__picker-item--active' : '']"
                                    >
                                        {{ item.label }}
                                    </text>
                                </view>
                            </view>
                        </view>

                        <view class="payment-filter-sheet__actions">
                            <view class="payment-filter-sheet__action payment-filter-sheet__action--ghost" @tap="resetPaymentFilter">重置</view>
                            <view class="payment-filter-sheet__action" @tap="applyPaymentFilter">确定</view>
                        </view>
                    </view>
                </view>
            </template>

            <template
                v-else-if="
                    scene === 'fiat-balance2' ||
                    scene === 'fiat-balance3'
                "
            >
                <view class="wallet-mode">
                    <view class="wallet-card wallet-card--solid">
                        <view class="wallet-card__label">人民币账户（元）</view>
                        <view class="wallet-card__amount">¥123.34</view>
                        <view class="wallet-card__line"></view>
                        <view class="wallet-card__row">
                            <text>可提现金额</text>
                            <text>¥123.34</text>
                        </view>
                        <view class="wallet-card__withdraw" @tap="goPage('/bundle_user/pages/user_withdraw/user_withdraw?type=1&source=fiat_balance')">微信提现到余额</view>
                    </view>
                    <view class="card">
                        <view class="section-title">
                            账户记录
                        </view>
                        <view class="record-row" v-for="(item, index) in walletRecords" :key="index">
                            <view>
                                <view class="record-row__title">{{ item.title }}</view>
                                <view class="record-row__time">{{ item.time }}</view>
                            </view>
                            <view :class="['record-row__amount', item.type === 1 ? 'is-plus' : '']">
                                {{ item.type === 1 ? '+' : '-' }}{{ item.amount }}
                            </view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'activity-center'">
                <view class="activity-center-page">
                    <image class="activity-center-bg" src="https://shengyuan.store/api/miniapp/files/miniapp/5d41b07208f5494697f46875f9eb5aaa/activity-center-bg.png" mode="scaleToFill"></image>
                    <view class="activity-center-hero">
                        <view class="activity-center-topbar">
                            <view class="activity-center-back" @tap="goBack"></view>
                        </view>

                        <view class="activity-center-list">
                            <view v-if="!activityCenterItems.length" class="activity-center-empty">活动暂未开放</view>
                            <block v-else>
                                <view
                                    v-for="(item, index) in activityCenterItems"
                                    :key="index"
                                    class="activity-center-card"
                                >
                                    <image class="activity-center-card__image" :src="item.image" mode="aspectFit"></image>
                                    <view class="activity-center-card__body">
                                        <view class="activity-center-card__title">{{ item.title }}</view>
                                        <view class="activity-center-card__desc">{{ item.desc }}</view>
                                        <view class="activity-center-card__bottom">
                                            <text class="activity-center-card__date">{{ item.date }}</text>
                                            <view class="activity-center-card__btn" @tap="openActivityExchange(item)">{{ item.buttonText }}</view>
                                        </view>
                                    </view>
                                </view>
                            </block>
                        </view>
                    </view>

                </view>
            </template>

            <template v-else-if="scene === 'about-us'">
                <view class="about-us-page">
                    <view class="about-us-hero">
                        <view class="about-us-topbar">
                            <view class="about-us-back" @tap="goBack"></view>
                        </view>
                        <view class="about-us-logo">{{ aboutAppLogoText }}</view>
                        <view class="about-us-version">V{{ aboutAppVersion }}</view>
                    </view>

                    <view class="about-us-card">
                        <view
                            v-for="(item, index) in aboutMenuItems"
                            :key="item.title"
                            class="about-us-row"
                            @tap="handleAboutMenuItem(item)"
                        >
                            <text class="about-us-row__title">{{ item.title }}</text>
                            <image class="about-us-row__arrow" :src="aboutArrowIcon" mode="aspectFit"></image>
                            <view v-if="index < aboutMenuItems.length - 1" class="about-us-row__line"></view>
                        </view>
                    </view>
                </view>
            </template>

            <template
                v-else-if="
                    scene === 'eco-app' ||
                    scene === 'activity-exchange'
                "
            >
                <view class="card">
                    <view class="section-title">{{ sceneConfig.subtitle }}</view>
                    <view class="info-block" v-for="(item, index) in sceneConfig.items" :key="index">
                        <view class="info-block__title">{{ item.title }}</view>
                        <view class="info-block__desc">{{ item.desc }}</view>
                    </view>
                </view>
                <view class="primary-btn">{{ sceneConfig.buttonText }}</view>
            </template>

            <template v-else-if="scene === 'pending-payment'">
                <view class="card">
                    <view class="section-title">待付款订单</view>
                    <view v-if="!pendingPaymentItems.length" class="empty-text">暂无待付款订单</view>
                    <block v-else>
                        <view class="pending-card" v-for="(item, index) in pendingPaymentItems" :key="index">
                            <view v-if="isEmptyImage(item.image)" class="pending-card__image image-placeholder">无</view>
                            <image v-else class="pending-card__image" :src="item.image"></image>
                            <view class="pending-card__body">
                                <view class="pending-card__title line2">{{ item.name }}</view>
                                <view class="pending-card__meta">订单编号：{{ item.orderNo || item.orderSn || item.order_id || item.id }}</view>
                                <view class="pending-card__foot">
                                    <view class="pending-card__price">¥{{ item.price }}</view>
                                    <view class="mini-btn" @tap="goPage('/bundle/pages/payment/payment?from=order&order_id=' + (item.id || item.order_id || ''))">立即付款</view>
                                </view>
                            </view>
                        </view>
                    </block>
                </view>
            </template>
        </scroll-view>
        <u-popup v-model="showStoreSharePopup" mode="center" border-radius="0" :mask-close-able="true" :custom-style="{ background: 'transparent' }" @open="prepareStoreShareQrcode">
            <view class="store-share-popup">
                <scroll-view scroll-y class="store-share-popup__scroll">
                    <view class="store-share-shop-card">
                        <view v-if="isEmptyImage(storeDetailView.shopLogo)" class="store-share-shop-card__logo store-share-shop-card__logo--empty">无</view>
                        <image v-else class="store-share-shop-card__logo" :src="storeDetailView.shopLogo" mode="aspectFill"></image>
                        <view class="store-share-shop-card__body">
                            <view class="store-share-shop-card__name line1">{{ storeDetailView.shopName }}</view>
                            <view class="store-share-shop-card__rating">
                                <image v-for="item in 5" :key="item" class="store-share-shop-card__star" :src="shareStarIcon" mode="aspectFit"></image>
                                <text class="store-share-shop-card__score">{{ storeDetailView.shopScore }}</text>
                            </view>
                            <view class="store-share-shop-card__time">
                                <image class="store-share-shop-card__time-icon" :src="shareTimeIcon" mode="aspectFit"></image>
                                <text :class="['store-share-shop-card__time-text', storeShareTimeTextClass]">{{ storeDetailBusinessHoursText }}</text>
                            </view>
                        </view>
                    </view>
                    <view class="store-share-panel">
                        <view class="store-share-qrcode">
                            <image v-if="storeShareQrcodeIsImage" class="store-share-qrcode__image" :src="storeShareQrcode" mode="aspectFit"></image>
                            <tki-qrcode
                                v-else-if="storeShareQrcode"
                                cid="store-share-qrcode"
                                :val="storeShareQrcode"
                                :size="275"
                                :onval="true"
                                :load-make="true"
                                :show-loading="false"
                                @result="onStoreShareQrcodeResult"
                            ></tki-qrcode>
                            <view v-else class="store-share-qrcode__empty">二维码</view>
                        </view>
                        <view class="store-share-actions">
                            <view class="store-share-action store-share-action--cyan" @tap="toastStoreShareSave">保存图片</view>
                            <button class="store-share-action" open-type="share">分享店铺</button>
                        </view>
                    </view>
                    <image class="store-share-mark" :src="shareCloseIcon" mode="aspectFit" @tap="showStoreSharePopup = false"></image>
                </scroll-view>
            </view>
        </u-popup>
        <canvas canvas-id="storeShareCanvas" id="storeShareCanvas" class="store-share-canvas"></canvas>
        <u-popup v-model="showKycContractPopup" mode="bottom" border-radius="28" :mask-close-able="false">
            <view class="kyc-contract-popup">
                <view class="kyc-contract-popup__header">
                    <view class="kyc-contract-popup__title">{{ kycContractTitle }}</view>
                    <view class="kyc-contract-popup__close" @tap="closeKycContract">×</view>
                </view>
                <scroll-view scroll-y class="kyc-contract-popup__scroll" @scrolltolower="handleKycContractBottom">
                    <view class="kyc-contract-popup__section" v-for="(item, index) in kycContractSections" :key="index">
                        <view class="kyc-contract-popup__section-title">{{ item.title }}</view>
                        <view class="kyc-contract-popup__paragraph" v-for="(paragraph, paragraphIndex) in item.paragraphs" :key="paragraphIndex">{{ paragraph }}</view>
                    </view>
                    <view class="kyc-contract-popup__bottom-tip">已阅读至合同底部</view>
                </scroll-view>
                <view class="kyc-contract-popup__notice">{{ contractReadDone ? '已阅读完毕，可确认签署。' : '请滑动到底部以确保阅读完毕，再签署。' }}</view>
                <view :class="['kyc-contract-popup__button', contractReadDone ? '' : 'is-disabled']" @tap="confirmKycContract">确认签署并提交</view>
            </view>
        </u-popup>
    </view>
</template>

<script>
import TkiQrcode from '@/business/components/tki-qrcode/tki-qrcode.vue'
import { getShopDetail, getShopGroupBuy, getStreetGoods, getStreetIndex } from '@/api/store'
import { getRecentVisitShops, subscribeShop } from '@/api/app'
import { version, baseURL, basePath } from '@/config/app'
import { getAccountLog, getInviteInfo, getKycStatus, getPaymentRecords, scanOfflinePayment, submitFeedback, submitKyc } from '@/api/user'
import { getDesignAsset, designAssetList } from '@/utils/design-assets'
import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder'
import { copy, uploadFile } from '@/utils/tools'
import { guardRoute, showFeatureDisabledToast } from '@/utils/feature-flags'
import { formatKycStatusText as formatSharedKycStatusText, localizeBackendText, normalizeKycStatus } from '@/utils/backend-text'
import Navbar from '@/components/navbar/navbar.vue'
import UPopup from '@/business/components/uview-ui/components/u-popup/u-popup.vue'
import UIcon from '@/business/components/uview-ui/components/u-icon/u-icon.vue'

const STORE_SHARE_CARD_BG = 'https://shengyuan.store/api/miniapp/files/miniapp/bc28ff3e89a640a2b7b9c94fe99be721/264731ffd33531cb16f5c72f042fe14b.png'
const STORE_SHARE_PANEL_BG = 'https://shengyuan.store/api/miniapp/files/miniapp/b804285c02584e1f81deaae98321c28c/2f63b8336e9bcbd0397b8bc4f7b1eba0.png'

export default {
	components: {
			TkiQrcode,
			Navbar,
			UPopup,
			UIcon
		},
    props: {
        scene: {
            type: String,
            default: 'feedback'
        },
        storeDetailDefaultTab: {
            type: String,
            default: ''
        },
        pageOptions: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            selectedTag: '其他',
            feedbackContent: '',
            feedbackContact: '',
			feedbackImages: [],
			showStoreSharePopup: false,
			storeShareQrcode: '',
			storeShareQrcodeIsImage: false,
			storeShareQrcodeLoading: false,
			shareCloseIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/87c0300dafb0450ea11fc2bc5b76c91b/676d68646053824b88f084648bfc6594.png',
			shareStarIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/418affabb42a4f2692e1d894a8f6411c/6ab9b0b9917a09a6d5fdab80e40bf103.png',
			shareTimeIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/81a56cbe3aee49449a4f1014a8a90109/4a0776d08638585f2aaac7f04bf1a07d.png',
			facePayCode: '',
            facePayOriginalPrice: '',
            facePayBenefitRatio: '',
			feedbackHeroImage: 'https://shengyuan.store/api/miniapp/files/miniapp/c860e9e880ac44709ba98fb0844390c9/17e52b5f7f7af0e92c09f57bd56f679e.png',
			feedbackUploadIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/e5d8d8724ebd49afbb6a747ff66f8d09/feedback-upload-icon.png',
			paymentRecordFilterIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/bc6f6d87035c4c24923a1b29379ab7c7/b2636d4f8db726053805211c9457c120.png',
			aboutArrowIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/6dcc63c37e6943bdbcf59e36cbe1ec28/d35bb9407ef16b8d704effe295ad7e27.png',
			introCardCopyIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/62f0790376274645b017cc64e7cae6b8/intro-card-copy-icon.png',
			introCardCopyIconAlt: 'https://shengyuan.store/api/miniapp/files/miniapp/0d49e91085034160aa0280bd63f498cb/intro-card-copy-alt-icon.png',
			introCardInfo: {
                nickname: '用户',
                userNo: '--',
                code: '--',
                avatar: resolveImage('', 'avatar'),
                qrImage: ''
            },
			user_kyc:'https://shengyuan.store/api/miniapp/files/miniapp/205ef63eca8a4ecc9d880e2102394945/kyc-page-bg.png',
			right_icon:'https://shengyuan.store/api/miniapp/files/miniapp/14ea8fb481864dbc9cf9bdea659d4734/kyc-cert-back-placeholder.png',
			left_icon:'https://shengyuan.store/api/miniapp/files/miniapp/17cda3ae31a6439fbb0dbda78313bc3e/kyc-cert-front-placeholder.png',
			icon_conter:'https://shengyuan.store/api/miniapp/files/miniapp/eb2969d2231047739685055b1762b936/center-icon.png',
            kycForm: {
                realName: '',
                certNo: '',
                certFrontUrl: '',
                certBackUrl: '',
                certFrontPreview: '',
                certBackPreview: ''
            },
            kycStatusInfo: {},
            kycSubmitting: false,
            showKycContractPopup: false,
            contractReadDone: false,
            contractSigned: false,
            qrStoreMarkIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/ddc12d20f1064f9c949327f88bea0498/3180ae811deadda0dbd6b79667bc5bb1.png',
            qrGoodsMarkIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/87c0300dafb0450ea11fc2bc5b76c91b/676d68646053824b88f084648bfc6594.png',
            feedbackTags: ['下载/加载问题', '体验功能', '平台问题', '新功能建议', '其他', '违规举报'],
            aboutMenuItems: [
                { title: '服务协议', url: '/bundle_user/pages/server_explan/server_explan?type=0' },
                { title: '隐私政策', url: '/bundle_user/pages/server_explan/server_explan?type=1' },
                { title: '售后保障', url: '/bundle_user/pages/server_explan/server_explan?type=2' },
                { title: '联系我们', action: 'contact' },
                { title: '版本信息', action: 'version' }
            ],
            activityCenterItems: [],
            recentVisitItems: [],
            pendingPaymentItems: [],
            albumImages: [
                ...designAssetList.sceneAlbum
            ],
            merchantList: [],
            storeDetailAddressIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp/78a66305c5c34a91bc0c6b60f8198b6f/store-address-icon.png'),
            storeDetailStarIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/searchlist_star.png'),
            storeDetailTimeIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/searchlist_time.png'),
            storeDetailAlbumEmptyImage: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp/78d88fcd23604d4ca9c5e3b1df0108d4/store-media-empty.png'),
            storeDetailLoadedShopId: '',
            storeDetailApiLoaded: false,
            storeDetailLoading: false,
            storeDetailGroupPageNo: 1,
            storeDetailGroupPageSize: 10,
            storeDetailGroupHasNext: true,
            storeDetailGroupLoading: false,
            storeShareQrcodeTempImage: '',
            storeDetailActiveTab: 'detail',
            storeDetailData: {
                shopBase: {
                    shopId: '',
                    shopName: '',
                    shopLogo: '',
                    shopScore: '',
                    businessHours: '',
                    detailAddress: '',
                    openStatus: '',
                    avatarUrl: '',
                    contactPhone: ''
                },
                albums: [],
                videos: [],
                coupons: [],
                groupBuyProducts: [],
                comments: [],
                qrcodeInfo: {}
            },
            streetSearchIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/searchlist_menu_capsule.png'),
            streetStarIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/searchlist_star.png'),
            streetTimeIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/searchlist_time.png'),
            streetSearchText: '输入关键词',
            streetKeyword: '',
            listKeyword: '',
            streetGoodsLoadKey: '',
            streetGoodsLoading: false,
            streetLoaded: false,
            navigating: false,
            streetMerchants: [],
            streetCategories: [
                { name: '美食餐饮', image: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/image_4.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '休闲娱乐', image: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/image_4_2.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '美容美发', image: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/image_4_3.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '体育运动', image: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/image_4_4.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '酒店住宿', image: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/image_4_5.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '本地生活', image: '', url: '/business/pages/business_pages/street_goods' },
                { name: '百货日用', image: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/image_4_7.png'), url: '/business/pages/business_pages/street_goods' },
                { name: '粮油饮品', image: '', url: '/business/pages/business_pages/street_goods' }
            ],
            walletRecords: [],
            paymentRecordSummary: {
                totalAmount: '¥0.00',
                totalCount: '0',
                fiatAmount: '¥0.00'
            },
            paymentRecordList: [],
            showPaymentFilter: false,
            paymentStatusOptions: [
                { label: '全部', active: false },
                { label: '未支付', active: false },
                { label: '已支付', active: true }
            ],
            paymentDateColumns: {
                years: [
                    { label: '2024年', active: false },
                    { label: '2025年', active: false },
                    { label: '2026年', active: true }
                ],
                months: [
                    { label: '2月', active: false },
                    { label: '3月', active: false },
                    { label: '4月', active: true },
                    { label: '5月', active: false },
                    { label: '6月', active: false }
                ],
                days: [
                    { label: '20日', active: false },
                    { label: '21日', active: false },
                    { label: '22日', active: true },
                    { label: '23日', active: false },
                    { label: '24日', active: false }
                ]
            },
            sceneMap: {
                feedback: {
                    title: '意见反馈',
                    subtitle: '请告诉我们遇到的问题',
                    buttonText: '提交'
                },
                'face-pay': {
                    title: '面对面付款'
                },
                'store-detail': {
                    title: '店铺详情'
                },
                'fiat-balance2': {
                    title: '人民币余额2'
                },
                street: {
                    title: '商街'
                },
                'pending-payment': {
                    title: '待付款'
                },
                'store-qr': {
                    title: '店铺二维码'
                },
                'goods-qr': {
                    title: '商品二维码'
                },
                'store-group': {
                    title: '店铺详情-团购'
                },
                'store-album': {
                    title: '店铺详情-相册'
                },
                'fiat-balance3': {
                    title: '人民币余额3'
                },
                'payment-filter': {
                    title: '付款记录-筛选'
                },
                'payment-record': {
                    title: '付款记录'
                },
                'about-us': {
                    title: '关于我们',
                    subtitle: '品牌介绍',
                    buttonText: '联系团队',
                    items: [
                        { title: '品牌愿景', desc: '专注打造更轻量的商城与商街体验。' },
                        { title: '服务能力', desc: '支持零售、团购、支付、会员积分等业务模块。' }
                    ]
                },
                'activity-exchange': {
                    title: '活动中心-兑换',
                    subtitle: '积分兑换',
                    buttonText: '立即兑换',
                    items: [
                        { title: '礼品卡', desc: '100积分可兑换5元礼品卡。' },
                        { title: '商城优惠券', desc: '支持满减券、折扣券、运费券。' }
                    ]
                },
                'activity-center': {
                    title: '活动中心',
                    subtitle: '热门活动',
                    buttonText: '立即参与',
                    items: [
                        { title: '签到赢积分', desc: '每日签到领取成长值与积分。' },
                        { title: '邀请奖励', desc: '邀请好友下单可得活动奖励。' }
                    ]
                },
                'intro-card': {
                    title: '介绍名片',
                    subtitle: '商家名片',
                    buttonText: '保存名片',
                    items: [
                        { title: '商家名称', desc: 'XXXX 商业服务中心' },
                        { title: '联系方式', desc: '188-8888-8888 / service@example.com' }
                    ]
                },
                'recent-visits': {
                    title: '最近访问'
                },
                'street-goods': {
                    title: '商街-商品'
                },
                'eco-app': {
                    title: '生态应用',
                    subtitle: '应用矩阵',
                    buttonText: '立即启用',
                    items: [
                        { title: '商家入驻', desc: '支持门店申请与资质审核。' },
                        { title: '面对面支付', desc: '支持线下付款单号核销。' }
                    ]
                },
                'user-kyc': {
                    title: '用户KYC',
                    subtitle: '副标题副标题副标题副标题副标题',
                    buttonText: '提交申请',
                    items: [
                        { title: '认证说明', desc: '提交真实资料后，预计 1-3 个工作日完成审核。' }
                    ]
                }
            }
        }
    },
    computed: {
        isFullScene() {
            return this.scene === 'street' || this.scene === 'store-detail' || this.scene === 'store-qr' || this.scene === 'goods-qr' || this.scene === 'user-kyc' || this.scene === 'feedback' || this.scene === 'about-us' || this.scene === 'activity-center' || this.scene === 'intro-card' || this.scene === 'recent-visits'
        },
        sceneConfig() {
            return this.sceneMap[this.scene] || this.sceneMap.feedback
        },
        aboutAppVersion() {
            return version || '1.0.0'
        },
        aboutAppLogoText() {
            return (this.sceneConfig.title || '关于我们').slice(0, 4)
        },
        kycStatusText() {
            if (this.isKycEmpty) return ''
            return this.formatKycStatusText(this.kycStatusInfo.kycStatus || this.kycStatusInfo.kyc_status)
        },
        isKycEmpty() {
            const data = this.kycStatusInfo || {}
            const status = normalizeKycStatus(data.kycStatus || data.kyc_status || '')
            const hasBusinessData = data.realName || data.real_name || data.certNo || data.cert_no || data.lastSubmitTime || data.last_submit_time || data.applyNo || data.applicationNo || data.id
            return Boolean(this.pageOptions && this.pageOptions.showFormWhenEmpty && (!status || status === 'NOT_SUBMITTED') && !hasBusinessData)
        },
        showKycAuditCard() {
            return Boolean(this.kycStatusText && !this.isKycEmpty)
        },
        kycStatusClass() {
            const status = normalizeKycStatus(this.kycStatusInfo.kycStatus || this.kycStatusInfo.kyc_status || '')
            if (status === 'APPROVED') return 'is-success'
            if (status === 'REJECTED') return 'is-error'
            if (status === 'PENDING_AUDIT') return 'is-pending'
            return ''
        },
        kycAuditMessage() {
            const message = this.kycStatusInfo.rejectReasonMessage || this.kycStatusInfo.reject_reason_message || this.kycStatusInfo.rejectReasonCode || this.kycStatusInfo.reject_reason_code || this.kycStatusInfo.auditMessage || this.kycStatusInfo.audit_message || ''
            return localizeBackendText(message, this.kycStatusClass === 'is-error' ? '实名审核未通过，请重新提交资料' : '')
        },
        kycSubmitTimeText() {
            const data = this.kycStatusInfo || {}
            return this.formatSceneTime(data.lastSubmitTime || data.last_submit_time || data.submitTime || data.submit_time || data.createdAt || data.createTime || data.created_at)
        },
        kycDisplayRows() {
            if (this.isKycEmpty) return []
            const data = this.kycStatusInfo || {}
            return [
                { label: '认证姓名', value: data.realName || data.real_name || this.kycForm.realName },
                { label: '证件类型', value: this.formatCertType(data.certTypeName || data.cert_type_name || data.certType || data.cert_type || 'ID_CARD') },
                { label: '证件号码', value: data.certNo || data.cert_no || this.kycForm.certNo },
                { label: '提交时间', value: this.kycSubmitTimeText },
                { label: '审核时间', value: this.formatSceneTime(data.auditTime || data.audit_time || data.updatedAt || data.updateTime || data.updated_at) },
                { label: '认证类型', value: localizeBackendText(data.kycTypeName || data.kyc_type_name || data.kycType || data.kyc_type, '') },
                { label: '手机号', value: data.mobile || data.phone || data.contactMobile || data.contact_mobile },
                { label: '申请编号', value: data.applyNo || data.apply_no || data.applicationNo || data.id }
            ].filter(item => item.value !== undefined && item.value !== null && item.value !== '')
        },
        canEditKyc() {
            const status = normalizeKycStatus(this.kycStatusInfo.kycStatus || this.kycStatusInfo.kyc_status || '')
            return !status || status === 'NOT_SUBMITTED' || status === 'REJECTED' || status === 'FAILED'
        },
        kycSubmitText() {
            if (this.kycSubmitting) return '提交中...'
            if (!this.canEditKyc) return this.kycStatusText || '已提交'
            return this.kycStatusClass === 'is-error' ? '重新提交' : '提交申请'
        },
        kycContractTitle() {
            return '角色申请合同'
        },
        kycContractSections() {
            return [
                {
                    title: '一、适用范围',
                    paragraphs: [
                        '本合同适用于申请成为商家、区级运营中心、市级子公司、推广者及居间服务角色的用户。申请人提交资料前，应完整阅读并理解本合同内容。',
                        '申请成为商家需签署商家入驻合同并提交相关资料；申请成为运营中心或子公司需签署对应合同、提交相关资料并按平台规则缴纳保证金；申请成为推广者需签署推广者合同、提交相关资料并按平台规则缴纳保证金；涉及居间服务的，还需签署居间合同。'
                    ]
                },
                {
                    title: '二、资料与审核',
                    paragraphs: [
                        '申请人承诺提交的姓名、证件、资质、联系方式及其他资料真实、准确、完整、合法。平台有权对资料进行人工审核，并根据审核结果通过、驳回或要求补充资料。',
                        '申请资料提交后进入审核流程，审核期间申请人应保持联系方式畅通。因资料不完整、不真实或不符合平台要求造成的审核延迟或失败，由申请人自行承担。'
                    ]
                },
                {
                    title: '三、保证金与权益',
                    paragraphs: [
                        '如申请角色需要缴纳保证金，申请人应按平台页面、后台审核或另行通知的金额与方式缴纳。保证金用于保障申请角色在平台经营、推广、运营或服务过程中的履约责任。',
                        '申请人申请退还押金或保证金时，平台将弹窗提醒：退款后，当前账号的权益、收益视为自动放弃。申请人确认退款申请即代表已知悉并同意该后果。',
                        '押金或保证金支持无理由退款，提交申请后进入人工审核。退款到账时间、审核资料及处理方式以平台实际审核结果为准。'
                    ]
                },
                {
                    title: '四、签署确认',
                    paragraphs: [
                        '申请人滑动阅读至合同底部并点击确认签署，即表示已充分阅读、理解并同意本合同全部条款，愿意按照平台规则提交申请并接受后续审核。',
                        '如申请人不同意本合同任一条款，应立即停止签署和提交申请。'
                    ]
                }
            ]
        },
        storeDetailView() {
            const shopBase = this.storeDetailData.shopBase || {}
            return {
                shopId: shopBase.shopId || '',
                shopName: shopBase.shopName || '店铺信息待更新',
                shopScore: this.formatStreetScore(shopBase.shopScore, '暂无评分'),
                businessHours: shopBase.businessHours || '',
                detailAddress: shopBase.detailAddress || '门店信息更新中',
                latitude: shopBase.latitude || shopBase.lat || shopBase.shopLatitude || shopBase.shop_latitude || '',
                longitude: shopBase.longitude || shopBase.lng || shopBase.shopLongitude || shopBase.shop_longitude || '',
                openStatus: shopBase.openStatus || '',
                shopLogo: shopBase.shopLogo || shopBase.avatarUrl || resolveImage('', 'shop'),
                contactPhone: shopBase.contactPhone || ''
            }
        },
        qrShopInfo() {
            return {
                name: this.storeDetailView.shopName,
                logo: this.storeDetailView.shopLogo,
                score: this.storeDetailView.shopScore,
                timeText: this.storeDetailBusinessHoursText
            }
        },
        qrGoodsInfo() {
            const options = this.getCurrentPageOptions()
            const firstGroup = this.storeDetailGroupProducts[0] || {}
            const price = this.stripStoreDetailPriceSymbol(this.formatStoreDetailPriceText(options.price || options.minPrice || this.getStoreDetailGroupPriceValue(firstGroup) || 0))
            const [main, decimal = '00'] = String(price).split('.')
            return {
                id: options.goodsId || options.goods_id || options.id || this.storeDetailGroupProducts[0]?.goods_id || '',
                image: resolveImage(options.image || this.storeDetailGroupProducts[0]?.image || '', 'goods'),
                priceMain: main || '0',
                priceDecimal: `.${decimal}`
            }
        },
        qrStoreValue() {
            return this.storeShareUrl()
        },
        qrGoodsValue() {
            return `${baseURL}${this.goodsQrLink()}`
        },
        storeDetailHeroImage() {
            const image = this.storeDetailData.albums?.[0]?.url || this.storeDetailData.cover || this.storeDetailData.image || this.storeDetailData.mainImageUrl || ''
            return image ? resolveImage(image, 'goods') : this.storeDetailView.shopLogo
        },
        storeDetailCardImage() {
            return this.storeDetailView.shopLogo || this.storeDetailHeroImage
        },
        storeDetailContentImage() {
            const image = this.storeDetailData.detailImage || this.storeDetailData.detail_image || this.storeDetailData.cover || this.storeDetailData.image || this.storeDetailData.mainImageUrl || this.storeDetailData.albums?.[0]?.cover || this.storeDetailData.albums?.[0]?.url || ''
            return image ? resolveImage(image, 'shop') : this.storeDetailView.shopLogo
        },
        storeDetailAlbumImages() {
            return (this.storeDetailData.albums || [])
                .map((item, index) => ({
                    ...item,
                    id: item.id || index,
                    url: item.url || item.cover || item.image || '',
                    cover: item.cover || item.url || item.image || ''
                }))
                .filter(item => item.url)
        },
        storeDetailVideos() {
            return (this.storeDetailData.videos || [])
                .map((item, index) => ({
                    ...item,
                    id: item.id || index,
                    title: item.title || item.name || '门店视频',
                    cover: item.cover || item.image || this.storeDetailHeroImage,
                    url: item.url || item.videoUrl || item.video || ''
                }))
                .filter(item => item.cover || item.url)
        },
        storeDetailDisplayComments() {
            const comments = this.storeDetailData.comments || this.storeDetailData.commentList || this.storeDetailData.reviews || []
            return comments.map((item, index) => ({
                ...item,
                id: item.id || item.commentId || item.reviewId || index,
                name: item.name || item.nickname || item.userName || item.memberName || '匿名用户',
                date: item.date || item.create_time || item.createdAt || item.createTime || '',
                content: item.content || item.comment || item.reviewContent || item.remark || '暂无评价内容',
                avatar: item.avatar || item.userAvatar || item.headimgurl || ''
            }))
        },
        storeDetailBusinessHoursText() {
            if (this.storeDetailView.businessHours) {
                return `营业时间：${this.storeDetailView.businessHours}`
            }
            return this.getStreetOpenStatusLabel(this.storeDetailView.openStatus) || '营业时间待更新'
        },
        storeShareTimeTextClass() {
            return String(this.storeDetailBusinessHoursText || '').length > 16 ? 'is-long' : ''
        },
        storeDetailTabs() {
            const albumCount = this.storeDetailData.albums?.length || 0
            const videoCount = this.storeDetailVideos.length
            return [
                { key: 'detail', label: '商家详情', active: this.storeDetailActiveTab === 'detail' },
                { key: 'group', label: '团购', active: this.storeDetailActiveTab === 'group', count: this.storeDetailGroupProducts.length },
                { key: 'album', label: '相册', active: this.storeDetailActiveTab === 'album', count: albumCount },
                { key: 'video', label: '视频', active: this.storeDetailActiveTab === 'video', count: videoCount },
                { key: 'comment', label: `评价(${this.storeDetailDisplayComments.length})`, active: this.storeDetailActiveTab === 'comment' }
            ]
        },
        storeDetailGroupProducts() {
            const groupProducts = this.storeDetailData.groupBuyProducts || []
            return groupProducts.filter(Boolean).map((item, index) => ({
                ...item,
                key: String(item.id || item.goods_id || item.goodsId || item.spuId || item.productId || index),
                id: item.id || item.goods_id || item.goodsId || item.spuId || item.productId || index,
                goods_id: item.goods_id || item.goodsId || item.spuId || item.productId || item.id || '',
                activity_id: item.activity_id || item.activityId || item.groupActivityId || item.groupBuyActivityId || item.team_id || item.teamId || '',
                name: item.name || item.goods_name || item.goodsName || item.spuName || item.productName || item.title || item.activityName || item.activity_name || '团购套餐',
                image: resolveImage(item.image || item.goods_image || item.cover || item.mainImageUrl, 'goods'),
                meta: item.meta || item.subTitle || item.subtitle || item.summary || item.desc || item.description || item.goods_desc || item.goodsDesc || item.activityDesc || item.activity_desc || '',
                tagText: item.tagText || item.tag_text || item.activityTag || item.activity_tag || item.label || item.labelText || '',
                infoText: this.getStoreDetailGroupInfoText(item),
                scoreText: this.getStoreDetailGroupScoreText(item),
                priceText: this.formatStoreDetailPriceText(this.getStoreDetailGroupPriceValue(item)),
                marketPriceText: this.formatStoreDetailMarketPriceText(item.marketPriceText || item.market_price_text || item.originPriceText || item.origin_price_text || item.originalPriceText || item.original_price_text || item.marketPrice || item.market_price || item.originPrice || item.origin_price || item.originalPrice || item.original_price)
            }))
        },
        storeDetailPayUrl() {
            return this.appendShopId('/business/pages/business_pages/face_pay')
        },
        introCardQrValue() {
            const code = this.introCardInfo.code && this.introCardInfo.code !== '--' ? this.introCardInfo.code : 'DEFAULT_ALLIANCE_CODE'
            return `/business/pages/business_pages/intro_card?inviteCode=${encodeURIComponent(code)}`
        },
        introCardStats() {
            const info = this.introCardInfo || {}
            return [
                { label: '邀请人数', value: info.inviteCount || info.invite_count || info.order_count || 0 },
                { label: '联盟收益', value: info.totalCommission || info.total_commission || '0.00' },
                { label: '团队人数', value: info.teamCount || info.team_count || info.fansCount || info.fans_count || 0 }
            ]
        },
        filteredMerchantList() {
            const keyword = (this.listKeyword || '').trim().toLowerCase()
            if (!keyword) return this.merchantList
            return this.merchantList.filter(item => {
                const name = (item.name || item.shopName || item.goods_name || '').toLowerCase()
                return name.includes(keyword)
            })
        },
        facePayRewardPoints() {
            const price = Number(this.facePayOriginalPrice || 0)
            const ratio = Number(this.facePayBenefitRatio || 0)
            if (Number.isNaN(price) || Number.isNaN(ratio) || price <= 0 || ratio <= 0) return '0'
            return ((4 + 1) * ratio * price).toFixed(2)
        }
    },
    watch: {
        pageOptions: {
            deep: true,
            handler() {
                if (this.scene === 'street-goods') {
                    this.loadStreetGoods()
                }
                if (this.scene === 'store-detail' || this.scene === 'store-group' || this.scene === 'store-qr' || this.scene === 'goods-qr') {
                    this.loadStoreDetail()
                }
            }
        },
        scene: {
            immediate: true,
            handler(value) {
                if (!this.guardScene(value)) return
                if (value === 'street') {
                    this.loadStreetIndex()
                }
                if (value === 'user-kyc') {
                    this.loadKycStatus()
                }
                if (value === 'street-goods') return
                if (value === 'store-detail' || value === 'store-group' || value === 'store-qr' || value === 'goods-qr') {
                    this.loadStoreDetail()
                }
                if (value === 'payment-record') {
                    this.loadPaymentRecords()
                }
                if (value === 'intro-card') {
                    this.loadIntroCard()
                }
                if (value === 'recent-visits') {
                    this.loadRecentVisitShops()
                }
            }
        }
    },
    methods: {
        resolveServerImage(image, type = 'goods') {
            const value = String(image || '').trim()
            if (!value) return ''
            if (/^https?:\/\//i.test(value)) return resolveImage(value, type)
            return `${baseURL}${value.startsWith('/') ? value : `/${value}`}`
        },
        formatSceneTime(value) {
            if (!value) return ''
            if (typeof value === 'string' && /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) return value.replace(/-/g, '/').slice(0, 16)
            const time = Number(value)
            const date = Number.isNaN(time) ? new Date(value) : new Date(time > 10000000000 ? time : time * 1000)
            if (Number.isNaN(date.getTime())) return String(value)
            const pad = (num) => String(num).padStart(2, '0')
            return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        },
        formatCertType(value) {
            const map = {
                ID_CARD: '身份证',
                IDCARD: '身份证',
                PASSPORT: '护照',
                HK_MACAO: '港澳通行证',
                TAIWAN: '台湾居民通行证'
            }
            return map[String(value || '').toUpperCase()] || value || ''
        },
        formatKycStatusText(value) {
            return formatSharedKycStatusText(value)
        },
        guardScene(scene) {
            const sceneRouteMap = {
                'activity-center': '/business/pages/business_pages/activity_center',
                'activity-exchange': '/business/pages/business_pages/activity_exchange'
            }
            const route = sceneRouteMap[scene]
            if (!route || guardRoute(route)) return true
            setTimeout(() => this.goBack(), 800)
            return false
        },
        handleAboutMenuItem(item = {}) {
            if (item.url) {
                this.goPage(item.url)
                return
            }
            if (item.action === 'contact') {
                uni.showModal({
                    title: '联系我们',
                    content: '如需帮助，请通过客服入口联系平台。',
                    showCancel: false
                })
                return
            }
            if (item.action === 'version') {
                uni.showToast({ title: `当前版本 V${this.aboutAppVersion}`, icon: 'none' })
            }
        },
        chooseUploadedImage() {
            return new Promise((resolve, reject) => {
                uni.chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    success: async (res) => {
                        try {
                            const localPath = res.tempFilePaths[0]
                            const result = await uploadFile(localPath)
                            resolve({
                                localPath,
                                fileUrl: result.file_url || result.url || result.uri
                            })
                        } catch (error) {
                            reject(error)
                        }
                    },
                    fail: reject
                })
            })
        },
        async chooseKycImage(type) {
            if (!this.canEditKyc) return
            let result = null
            try {
                result = await this.chooseUploadedImage()
            } catch (error) {
                uni.showToast({ title: '图片选择或上传失败', icon: 'none' })
                return
            }
            if (!result || !result.fileUrl) {
                uni.showToast({ title: '图片上传失败，请重试', icon: 'none' })
                return
            }
            if (type === 'front') {
                this.kycForm.certFrontUrl = result.fileUrl
                this.kycForm.certFrontPreview = result.localPath
                return
            }
            this.kycForm.certBackUrl = result.fileUrl
            this.kycForm.certBackPreview = result.localPath
        },
        async loadKycStatus() {
            const res = await getKycStatus()
            if (res.code == 1) {
                this.kycStatusInfo = res.data || {}
                this.kycForm.realName = res.data.realName || res.data.real_name || this.kycForm.realName
                this.kycForm.certNo = res.data.certNo || res.data.cert_no || this.kycForm.certNo
                this.kycForm.certFrontUrl = res.data.certFrontUrl || res.data.cert_front_url || this.kycForm.certFrontUrl
                this.kycForm.certFrontPreview = res.data.certFrontUrl || res.data.cert_front_url || this.kycForm.certFrontPreview
                this.kycForm.certBackUrl = res.data.certBackUrl || res.data.cert_back_url || this.kycForm.certBackUrl
                this.kycForm.certBackPreview = res.data.certBackUrl || res.data.cert_back_url || this.kycForm.certBackPreview
            }
        },
        async submitKycForm() {
            if (this.kycSubmitting) return
            if (!this.canEditKyc) return
            if (!this.kycForm.realName || !this.kycForm.certNo || !this.kycForm.certFrontUrl || !this.kycForm.certBackUrl) {
                uni.showToast({ title: '请填写完整认证信息', icon: 'none' })
                return
            }
            if (!this.contractSigned) {
                this.openKycContract()
                return
            }
            this.performSubmitKyc()
        },
        openKycContract() {
            if (!this.canEditKyc) return
            this.contractReadDone = false
            this.showKycContractPopup = true
        },
        closeKycContract() {
            this.showKycContractPopup = false
        },
        handleKycContractBottom() {
            this.contractReadDone = true
        },
        confirmKycContract() {
            if (!this.contractReadDone) {
                uni.showToast({ title: '请先滑动到底部阅读完整合同', icon: 'none' })
                return
            }
            this.contractSigned = true
            this.showKycContractPopup = false
            this.submitKycForm()
        },
        async performSubmitKyc() {
            if (this.kycSubmitting) return
            this.kycSubmitting = true
            try {
                const res = await submitKyc({
                    ...this.kycForm,
                    certType: 'ID_CARD',
                    contractSigned: 1,
                    contractTitle: this.kycContractTitle
                })
                if (res.code == 1) {
                    this.kycStatusInfo = {
                        ...(res.data || {}),
                        kycStatus: res.data?.kycStatus || 'PENDING',
                        auditMessage: res.data?.auditMessage || '资料已提交，请等待审核'
                    }
                    this.contractSigned = false
                    uni.showToast({ title: '提交成功', icon: 'success' })
                    this.loadKycStatus()
                    return
                }
                uni.showToast({ title: res.msg || '提交失败', icon: 'none' })
            } finally {
                this.kycSubmitting = false
            }
        },
        async chooseFeedbackImage() {
            const result = await this.chooseUploadedImage()
            this.feedbackImages = [{ url: result.fileUrl, preview: result.localPath }]
            uni.showToast({ title: '图片上传成功', icon: 'success' })
        },
        removeFeedbackImage(index) {
            this.feedbackImages.splice(index, 1)
        },
        async submitFeedbackForm() {
            const content = (this.feedbackContent || '').trim()
            if (!content) {
                uni.showToast({ title: '请输入反馈内容', icon: 'none' })
                return
            }
            const res = await submitFeedback({
                feedbackType: this.selectedTag,
                content,
                contact: this.feedbackContact,
                imageUrls: this.feedbackImages.map(item => item.url)
            })
            if (res.code == 1) {
                uni.showToast({ title: '提交成功', icon: 'success' })
                this.feedbackContent = ''
                this.feedbackContact = ''
                this.feedbackImages = []
            }
        },
        scanFacePayCode() {
            uni.scanCode({
                onlyFromCamera: false,
                success: (res) => {
                    this.facePayCode = res.result || res.path || ''
                    if (this.facePayCode) {
                        this.submitFacePay()
                    }
                },
                fail: () => {
                    uni.showToast({ title: '扫一扫未完成', icon: 'none' })
                }
            })
        },
        async submitFacePay() {
            const qrCode = (this.facePayCode || '').trim()
            if (!qrCode) {
                uni.showToast({ title: '请扫码或输入付款单号', icon: 'none' })
                return
            }
            const options = this.getCurrentPageOptions()
            const res = await scanOfflinePayment({
                shopId: options.shopId || options.shop_id || this.storeDetailView.shopId,
                qrCode
            })
            if (res.code == 1) {
                uni.showToast({ title: res.msg || '付款成功', icon: 'success' })
                return
            }
            uni.showToast({ title: res.msg || '付款失败', icon: 'none' })
        },
        async loadIntroCard() {
            const res = await getInviteInfo()
            if (res.code != 1) return
            const data = res.data || {}
            this.introCardInfo = {
                ...this.introCardInfo,
                ...data,
                nickname: data.nickname || data.nickName || data.userName || data.name || this.introCardInfo.nickname,
                userNo: data.userNo || data.user_no || data.sn || data.userId || data.user_id || '--',
                code: data.code || data.invite_code || data.allianceCode || '--',
                avatar: resolveImage(data.avatar || data.avatarUrl || data.headimgurl, 'avatar'),
                qrImage: data.qrImage || data.qrCodeUrl || data.qr_code_url || data.qrcode ? resolveImage(data.qrImage || data.qrCodeUrl || data.qr_code_url || data.qrcode) : ''
            }
        },
        async loadRecentVisitShops() {
            const res = await getRecentVisitShops({ pageNo: 1, pageSize: 20 })
            if (res.code == 1 && Array.isArray(res.data)) {
                this.recentVisitItems = res.data
            }
        },
        openRecentVisitShop(item = {}) {
            const shopId = item.shopId || item.shop_id || item.id || ''
            if (!shopId) return
            this.goPage(`/business/pages/business_pages/store_detail?shopId=${shopId}`)
        },
        toggleRecentVisitSubscribe(item = {}) {
            const shopId = item.shopId || item.shop_id || item.id || ''
            if (!shopId) {
                uni.showToast({ title: '暂无门店ID', icon: 'none' })
                return
            }
            const nextSubscribed = !item.subscribed
            subscribeShop({ shopId, subscribed: nextSubscribed }).then(res => {
                if (res.code != 1) {
                    uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
                    return
                }
                item.subscribed = nextSubscribed
                uni.showToast({ title: nextSubscribed ? '订阅成功' : '已取消订阅', icon: 'none' })
            }).catch(() => {
                uni.showToast({ title: '操作失败', icon: 'none' })
            })
        },
        copyIntroCardText(text) {
            copy(text)
        },
        openPaymentFilter() {
            this.showPaymentFilter = true
        },
        closePaymentFilter() {
            this.showPaymentFilter = false
        },
        openActivityExchange() {
            showFeatureDisabledToast('activityExchange')
        },
        selectPaymentFilterOption(options, selected) {
            options.forEach(item => {
                item.active = item.label === selected.label
            })
        },
        resetPaymentFilter() {
            this.paymentStatusOptions.forEach((item, index) => {
                item.active = index === 0
            })
        },
        applyPaymentFilter() {
            this.showPaymentFilter = false
            return this.loadPaymentRecords()
        },
        async loadPaymentRecords() {
            try {
                const status = this.paymentStatusOptions.find(item => item.active)?.label || '全部'
                const payStatusMap = {
                    '未支付': 'CREATED',
                    '待支付': 'CREATED',
                    '已支付': 'SUCCESS',
                    '支付失败': 'FAILED'
                }
                const res = await getPaymentRecords({
                    payStatus: status === '全部' ? '' : (payStatusMap[status] || ''),
                    pageNo: 1,
                    pageSize: 20
                })
                if (res.code != 1) return
                const list = res.data?.lists || res.data?.records || res.data?.list || []
                const expectedStatus = status === '全部' ? '' : (payStatusMap[status] || '')
                this.paymentRecordList = (Array.isArray(list) ? list : []).filter(item => {
                    if (!expectedStatus) return true
                    return this.normalizePaymentRecordStatus(item) === expectedStatus
                })
                const totalAmount = this.paymentRecordList.reduce((sum, item) => {
                    const amount = Number(item.change_amount ?? item.amount ?? item.changeAmount ?? item.money ?? 0)
                    return Number.isNaN(amount) ? sum : sum + Math.abs(amount)
                }, 0)
                this.paymentRecordSummary = {
                    totalAmount: `¥${totalAmount.toFixed(2)}`,
                    totalCount: String(res.data?.count || res.data?.total || this.paymentRecordList.length || 0),
                    fiatAmount: `¥${totalAmount.toFixed(2)}`
                }
            } catch (error) {
                console.error('[payment-record] load failed:', error)
            }
        },        formatPaymentRecordAmount(value) {
            const amount = Number(value || 0)
            if (Number.isNaN(amount)) return value || '0.00'
            return Math.abs(amount).toFixed(2)
        },
        normalizePaymentRecordStatus(item = {}) {
            const raw = String(item.payStatus || item.pay_status || item.status || item.paymentStatus || item.payment_status || '').toUpperCase()
            const text = String(item.status_text || item.pay_status_text || item.type_desc || '').toUpperCase()
            if (['SUCCESS', 'PAID', 'PAY_SUCCESS', '1'].includes(raw) || /已支付|支付成功/.test(text)) return 'SUCCESS'
            if (['FAILED', 'FAIL', 'PAY_FAILED', '2'].includes(raw) || /失败/.test(text)) return 'FAILED'
            if (['CREATED', 'PENDING', 'WAIT_PAY', 'UNPAID', 'NOT_PAID', 'PROCESSING', '0'].includes(raw) || /未支付|待支付|支付中/.test(text)) return 'CREATED'
            return raw
        },
        getCurrentPageOptions() {
            if (this.pageOptions && Object.keys(this.pageOptions).length) return this.pageOptions
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1] || {}
            return currentPage.options || currentPage.$page?.options || {}
        },
        normalizePageOptions(options = {}) {
            const normalized = { ...options }
            const scene = normalized.scene ? decodeURIComponent(String(normalized.scene)) : ''
            if (scene) {
                scene.split(/[&;]/).forEach((part) => {
                    const [key, value] = part.split('=')
                    if (key && value !== undefined && normalized[key] === undefined) {
                        normalized[key] = value
                    }
                })
            }
            if (!normalized.shopId && normalized.shop_id) normalized.shopId = normalized.shop_id
            return normalized
        },
        appendShopId(url) {
            const shopId = this.storeDetailView.shopId
            if (!shopId) return url
            return `${url}${url.includes('?') ? '&' : '?'}shopId=${shopId}`
        },
        syncStoreDetailActiveTab() {
            const options = this.getCurrentPageOptions()
            const tab = options.tab || options.activeTab || this.storeDetailDefaultTab || ''
            const validTabs = ['detail', 'group', 'album', 'video', 'comment']
            this.storeDetailActiveTab = validTabs.includes(tab) ? tab : 'detail'
        },
        resetStoreDetailData(shopId = '') {
            this.storeDetailGroupPageNo = 1
            this.storeDetailGroupHasNext = true
            this.storeDetailGroupLoading = false
            this.storeDetailData = {
                shopBase: {
                    shopId,
                    shopName: '',
                    shopLogo: '',
                    shopScore: '',
                    businessHours: '',
                    detailAddress: '',
                    openStatus: '',
                    avatarUrl: '',
                    contactPhone: ''
                },
                albums: [],
                videos: [],
                coupons: [],
                groupBuyProducts: [],
                comments: [],
                qrcodeInfo: {}
            }
        },
        async loadStoreDetail() {
            const options = this.normalizePageOptions(this.getCurrentPageOptions())
            const shopId = options.shopId || options.shop_id || options.merchantShopId || options.merchant_shop_id || (this.scene === 'goods-qr' ? '' : options.id) || ''
            this.syncStoreDetailActiveTab()
            if (!shopId) {
                if (!Object.keys(options).length) return
                this.resetStoreDetailData('')
                this.storeDetailLoadedShopId = ''
                this.storeDetailApiLoaded = true
                uni.showToast({ title: '缺少门店ID，无法加载详情', icon: 'none' })
                return
            }
            if (this.storeDetailLoadedShopId === String(shopId)) return
            if (this.storeDetailLoading) return
            this.storeDetailLoading = true
            this.storeDetailApiLoaded = false
            this.resetStoreDetailData(String(shopId))
            try {
                const res = await getShopDetail({
                    shopId
                })
                if (res.code != 1 || !res.data) {
                    this.storeDetailApiLoaded = true
                    return
                }
                this.storeDetailData = {
                    ...this.storeDetailData,
                    ...res.data
                }
                this.storeDetailGroupPageNo = 2
                this.storeDetailGroupHasNext = true
                this.storeDetailApiLoaded = true
                this.storeDetailLoadedShopId = String(shopId)
                if (this.storeDetailActiveTab === 'group') {
                    await this.loadStoreDetailGroupProducts(true)
                }
            } catch (error) {
                this.storeDetailApiLoaded = true
                console.error('[store-detail] load failed:', error)
            } finally {
                this.storeDetailLoading = false
            }
        },
        async loadStoreDetailGroupProducts(reset = false) {
            const shopId = this.storeDetailView.shopId || this.storeDetailLoadedShopId
            if (!shopId || this.storeDetailGroupLoading) return
            if (!reset && !this.storeDetailGroupHasNext) return
            this.storeDetailGroupLoading = true
            const pageNo = reset ? 1 : this.storeDetailGroupPageNo
            try {
                const res = await getShopGroupBuy({
                    shopId,
                    pageNo,
                    pageSize: this.storeDetailGroupPageSize
                })
                if (res.code != 1 || !res.data) return
                const list = res.data.list || []
                this.storeDetailData = {
                    ...this.storeDetailData,
                    groupBuyProducts: reset ? list : [...(this.storeDetailData.groupBuyProducts || []), ...list]
                }
                this.storeDetailGroupPageNo = pageNo + 1
                this.storeDetailGroupHasNext = Boolean(res.data.hasNext)
            } catch (error) {
                console.error('[store-detail] group buy load failed:', error)
            } finally {
                this.storeDetailGroupLoading = false
            }
        },
        onSceneScrollLower() {
            if ((this.scene === 'store-detail' || this.scene === 'store-group') && this.storeDetailActiveTab === 'group') {
                this.loadStoreDetailGroupProducts(false)
            }
        },
        getStoreDetailGroupMeta(item = {}) {
            if (item.people && item.joined !== undefined) {
                return `${item.people}人团 · 已拼${item.joined}件`
            }
            const people = item.peopleNum || item.people_num || item.groupNum || item.group_num
            const joined = item.joinedCount || item.join_num || item.joinNum || item.sales_sum || item.salesCount
            if (people || joined !== undefined) {
                return `${people || '多人'}人团 · 已拼${joined || 0}件`
            }
            if (item.sales_sum !== undefined) {
                return `团购商品 · 已拼${item.sales_sum}件`
            }
            return '团购商品'
        },
        getStoreDetailGroupInfoText(item = {}) {
            const people = item.people || item.peopleNum || item.people_num || item.groupNum || item.group_num
            const joined = item.joined || item.joinedCount || item.join_num || item.joinNum
            const sales = item.sales_sum || item.salesCount || item.sales_count
            const stock = item.stock || item.stockQty || item.stock_quantity
            return [
                people ? `${people}人团` : '',
                joined !== '' && joined !== null && joined !== undefined ? `已拼${joined}件` : '',
                sales !== '' && sales !== null && sales !== undefined ? `销量${sales}` : '',
                stock !== '' && stock !== null && stock !== undefined ? `库存${stock}` : ''
            ].filter(Boolean).join(' · ')
        },
        getStoreDetailGroupScoreText(item = {}) {
            const score = item.score ?? item.shopScore ?? item.commentScore ?? item.rating
            return score === '' || score === null || score === undefined ? '' : this.formatStreetScore(score, '')
        },
        formatStoreDetailPrice(value) {
            if (value === '' || value === null || value === undefined) return '0.00'
            const price = Number(value)
            if (Number.isNaN(price)) return String(value)
            return Number.isInteger(price) ? String(price) : price.toFixed(2)
        },
        formatStoreDetailPriceText(value) {
            if (value === '' || value === null || value === undefined) return '¥0.00'
            const text = String(value).trim()
            if (/^[¥￥]/.test(text)) return text
            return `¥${this.formatStoreDetailPrice(value)}`
        },
        stripStoreDetailPriceSymbol(value) {
            return String(value || '0.00').replace(/^[¥￥]\s*/, '')
        },
        formatStoreDetailMarketPriceText(value) {
            if (value === '' || value === null || value === undefined) return ''
            return this.formatStoreDetailPriceText(value)
        },
        getStoreDetailGroupPriceValue(item = {}) {
            const values = [
                item.priceText,
                item.price_text,
                item.groupPriceText,
                item.group_price_text,
                item.groupMinPriceText,
                item.group_min_price_text,
                item.teamPriceText,
                item.team_price_text,
                item.teamMinPriceText,
                item.team_min_price_text,
                item.activityPriceText,
                item.activity_price_text,
                item.salePriceText,
                item.sale_price_text,
                item.groupPrice,
                item.group_price,
                item.groupMinPrice,
                item.group_min_price,
                item.teamPrice,
                item.team_price,
                item.teamMinPrice,
                item.team_min_price,
                item.activityPrice,
                item.activity_price,
                item.salePrice,
                item.sale_price,
                item.minPrice,
                item.min_price,
                item.price
            ]
            return values.find(value => value !== '' && value !== null && value !== undefined)
        },
        goStoreDetailGroupItem(item = {}) {
            if (!item) return
            const goodsId = item.goods_id || item.goodsId || item.spuId || item.productId || item.id || ''
            if (!goodsId) return
            const params = [`id=${goodsId}`]
            if (item.activity_id) params.push(`activityId=${item.activity_id}`)
            if (item.price !== '' && item.price !== null && item.price !== undefined) params.push(`price=${item.price}`)
            uni.navigateTo({ url: `/bundle/pages/goods_details/goods_details?${params.join('&')}` })
        },
        previewStoreDetailAlbum(index = 0) {
            if (!this.storeDetailAlbumImages.length) return
            uni.previewImage({
                current: this.storeDetailAlbumImages[index]?.url || this.storeDetailAlbumImages[0].url,
                urls: this.storeDetailAlbumImages.map(item => item.url)
            })
        },
        previewStoreDetailVideo(item = {}) {
            if (!item.url) return
            this.goPage(item.url)
        },
        onStoreDetailTab(tab) {
            if (!tab || tab.active) return
            if (tab.key === 'detail' || tab.key === 'group' || tab.key === 'album' || tab.key === 'video' || tab.key === 'comment') {
                this.storeDetailActiveTab = tab.key
                if (tab.key === 'group') {
                    this.loadStoreDetailGroupProducts(this.storeDetailGroupPageNo <= 1)
                }
                return
            }
        },
        openStoreDetailMap() {
            const latitude = Number(this.storeDetailView.latitude)
            const longitude = Number(this.storeDetailView.longitude)
            if (!latitude || !longitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
                uni.showToast({ title: '暂无门店定位', icon: 'none' })
                return
            }
            uni.openLocation({
                latitude,
                longitude,
                name: this.storeDetailView.shopName,
                address: this.storeDetailView.detailAddress || this.storeDetailView.shopName,
                scale: 16
            })
        },
        async toastStoreShareSave() {
            await this.prepareStoreShareQrcode()
            await this.waitForStoreShareQrcodeImage()
            // #ifdef H5
            uni.showToast({ title: '请长按图片保存', icon: 'none' })
            // #endif
            // #ifndef H5
            try {
                const filePath = await this.drawStoreSharePoster()
                this.saveImageToAlbum(filePath)
            } catch (error) {
                uni.hideLoading()
                uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
            }
            // #endif
        },
        saveImageToAlbum(filePath) {
            uni.saveImageToPhotosAlbum({
                filePath,
                success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
                fail: () => uni.showToast({ title: '请授权相册权限后重试', icon: 'none' })
            })
        },
        getShareImageInfo(src) {
            return new Promise((resolve, reject) => {
                if (!src || this.isEmptyImage(src)) return reject(new Error('empty image'))
                uni.getImageInfo({
                    src,
                    success: (res) => {
                        if (!res || Number(res.width || 0) <= 0 || Number(res.height || 0) <= 0 || !res.path) {
                            reject(new Error('invalid image size'))
                            return
                        }
                        resolve(res)
                    },
                    fail: reject
                })
            })
        },
        async prepareStoreShareQrcode() {
            if (this.storeShareQrcode || this.storeShareQrcodeLoading) return
            this.storeShareQrcodeLoading = true
            const qrcodeValue = this.storeShareUrl()
            this.storeShareQrcodeTempImage = ''
            this.storeShareQrcode = qrcodeValue
            this.storeShareQrcodeIsImage = false
            this.storeShareQrcodeLoading = false
        },
        onStoreShareQrcodeResult(result) {
            this.storeShareQrcodeTempImage = typeof result === 'string' ? result : ''
        },
        waitForStoreShareQrcodeImage() {
            if (this.storeShareQrcodeIsImage || this.storeShareQrcodeTempImage) return Promise.resolve()
            return new Promise((resolve) => {
                let count = 0
                const timer = setInterval(() => {
                    count += 1
                    if (this.storeShareQrcodeTempImage || count >= 8) {
                        clearInterval(timer)
                        resolve()
                    }
                }, 100)
            })
        },
        isDrawableImage(image) {
            return image && image.path && Number(image.width || 0) > 0 && Number(image.height || 0) > 0
        },
        drawCanvasRoundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + width - radius, y)
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
            ctx.lineTo(x + width, y + height - radius)
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
            ctx.lineTo(x + radius, y + height)
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()
        },
        drawCanvasTextLine(ctx, text, x, y, maxWidth) {
            let line = ''
            const value = String(text || '')
            for (let i = 0; i < value.length; i++) {
                const next = line + value[i]
                if (ctx.measureText(next).width > maxWidth) break
                line = next
            }
            ctx.fillText(line, x, y)
        },
        storeShareLink() {
            const options = this.getCurrentPageOptions()
            const shopId = options.shopId || options.shop_id || this.storeDetailView.shopId || ''
            return shopId ? `/business/pages/business_pages/store_detail?shopId=${encodeURIComponent(shopId)}` : '/business/pages/business_pages/street'
        },
        goodsQrLink() {
            const options = this.getCurrentPageOptions()
            const goodsId = options.id || options.goodsId || options.goods_id || this.qrGoodsInfo.id || ''
            const params = []
            if (goodsId) params.push(`id=${encodeURIComponent(goodsId)}`)
            const skuId = options.skuId || options.itemId || options.item_id || ''
            if (skuId) params.push(`skuId=${encodeURIComponent(skuId)}`)
            return params.length ? `/bundle/pages/goods_details/goods_details?${params.join('&')}` : '/pages/index/index'
        },
        storeShareUrl() {
            return `${baseURL}${this.storeShareLink()}`
        },
        async drawStoreSharePoster() {
            uni.showLoading({ title: '保存中...', mask: true })
            const ctx = uni.createCanvasContext('storeShareCanvas', this)
            const shopLogo = await this.getShareImageInfo(this.storeDetailView.shopLogo).catch(() => null)
            const cardBg = await this.getShareImageInfo(STORE_SHARE_CARD_BG).catch(() => null)
            const panelBg = await this.getShareImageInfo(STORE_SHARE_PANEL_BG).catch(() => null)
            const starIcon = await this.getShareImageInfo(this.shareStarIcon).catch(() => null)
            const timeIcon = await this.getShareImageInfo(this.shareTimeIcon).catch(() => null)
            const qrcodeSource = this.storeShareQrcodeIsImage ? this.storeShareQrcode : this.storeShareQrcodeTempImage
            const qrcode = qrcodeSource ? await this.getShareImageInfo(qrcodeSource).catch(() => null) : null
            ctx.setFillStyle('#f4fbff')
            ctx.fillRect(0, 0, 320, 385)

            if (this.isDrawableImage(cardBg)) {
                ctx.drawImage(cardBg.path, 25, 29, 270, 94)
            } else {
                ctx.setFillStyle('#037dfa')
                this.drawCanvasRoundRect(ctx, 25, 29, 270, 94, 12)
                ctx.fill()
            }

            ctx.setFillStyle('#ffffff')
            this.drawCanvasRoundRect(ctx, 40, 40, 74, 74, 5)
            ctx.fill()
            if (this.isDrawableImage(shopLogo)) ctx.drawImage(shopLogo.path, 40, 40, 74, 74)
            ctx.setFillStyle('#ffffff')
            ctx.setFontSize(14)
            this.drawCanvasTextLine(ctx, this.storeDetailView.shopName || '店铺详情', 128, 58, 138)
            for (let index = 0; index < 5; index += 1) {
                if (this.isDrawableImage(starIcon)) ctx.drawImage(starIcon.path, 128 + index * 13, 71, 12, 12)
            }
            ctx.setFontSize(12)
            ctx.fillText(this.storeDetailView.shopScore || '', 198, 82)
            if (this.isDrawableImage(timeIcon)) ctx.drawImage(timeIcon.path, 128, 96, 13, 13)
            ctx.setFontSize(String(this.storeDetailBusinessHoursText || '').length > 16 ? 11 : 13)
            this.drawCanvasTextLine(ctx, this.storeDetailBusinessHoursText, 144, 108, 126)

            if (this.isDrawableImage(panelBg)) {
                ctx.drawImage(panelBg.path, 25, 116, 270, 259)
            } else {
                ctx.setFillStyle('#ffffff')
                this.drawCanvasRoundRect(ctx, 25, 116, 270, 259, 16)
                ctx.fill()
            }

            ctx.setFillStyle('#d5d5d5')
            this.drawCanvasRoundRect(ctx, 91, 145, 138, 138, 12)
            ctx.fill()
            if (this.isDrawableImage(qrcode)) {
                ctx.drawImage(qrcode.path, 91, 145, 138, 138)
            } else {
                ctx.setFillStyle('#666666')
                ctx.setFontSize(14)
                ctx.fillText('二维码', 140, 218)
            }
            ctx.setFillStyle('#222222')
            ctx.setFontSize(13)
            ctx.fillText('扫码查看店铺', 121, 320)
            return new Promise((resolve, reject) => {
                ctx.draw(false, () => {
                    uni.canvasToTempFilePath({
                        canvasId: 'storeShareCanvas',
                        width: 320,
                        height: 385,
                        destWidth: 640,
                        destHeight: 770,
                        success: (res) => {
                            uni.hideLoading()
                            resolve(res.tempFilePath)
                        },
                        fail: (err) => {
                            uni.hideLoading()
                            reject(err)
                        }
                    }, this)
                })
            })
        },
        async loadStreetIndex() {
            if (this.streetLoaded) return
            this.streetLoaded = true
            try {
                const res = await getStreetIndex({
                    keyword: this.streetKeyword
                })
                if (res.code != 1 || !res.data) {
                    this.streetLoaded = false
                    return
                }
                const data = res.data
                const defaultCategories = this.streetCategories.slice()
                const defaultMerchants = this.streetMerchants.slice()
                this.streetSearchText = data.searchBox?.keyword || data.searchBox?.placeholder || this.streetSearchText
                this.streetCategories = (data.recommendedCategories || []).length
                    ? data.recommendedCategories.map((item, index) => this.mapStreetCategory(item, defaultCategories[index], index))
                    : defaultCategories
                this.streetMerchants = (data.recommendedShops || []).length
                    ? data.recommendedShops.map((item, index) => this.mapStreetMerchant(item, defaultMerchants[index]))
                    : defaultMerchants
            } catch (error) {
                this.streetLoaded = false
            }
        },
        mapStreetCategory(item = {}, fallback = {}, index = 0) {
            const categoryId = item.categoryId || item.id || fallback.categoryId || fallback.id || ''
            return {
                ...fallback,
                ...item,
                name: item.name || fallback.name || '',
                image: this.shouldUseEmptyServiceImage(item.name || fallback.name) ? '' : (item.image || fallback.image || ''),
                categoryId,
                url: categoryId
                    ? `/business/pages/business_pages/street_goods?categoryId=${categoryId}`
                    : (fallback.url || '/business/pages/business_pages/street_goods'),
                key: categoryId || item.name || fallback.name || index
            }
        },
        mapStreetMerchant(item = {}, fallback = {}) {
            const shopId = item.shopId || item.id || fallback.shopId || ''
            const statusLabel = this.getStreetOpenStatusLabel(item.openStatus)
            const address = item.detailAddress || fallback.detailAddress || ''
            const metaParts = [statusLabel, address].filter(Boolean)
            return {
                ...fallback,
                ...item,
                shopId,
                name: item.shopName || item.name || fallback.name || '',
                score: this.formatStreetScore(item.shopScore ?? item.score ?? fallback.score),
                image: item.shopLogo || item.image || fallback.image || '',
                meta: metaParts.join(' · ') || fallback.meta || '营业状态待更新',
                url: shopId
                    ? `/business/pages/business_pages/store_detail?shopId=${shopId}`
                    : (fallback.url || '/business/pages/business_pages/store_detail')
            }
        },
        isEmptyImage(src) {
            return isPlaceholderImage(src)
        },
        shouldUseEmptyServiceImage(name = '') {
            return ['服装', '本地生活', '粮油饮品'].some(item => String(name).includes(item))
        },
        formatStreetScore(value, fallback = '5.0') {
            if (value === '' || value === null || value === undefined) return fallback
            const score = Number(value)
            if (Number.isNaN(score)) return String(value)
            const safeScore = Math.max(0, Math.min(score, 5))
            return safeScore.toFixed(1)
        },
        formatStreetTimeText(value) {
            if (!value) return ''
            const text = String(value).trim()
            if (/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(text)) return `营业时间 ${text}`
            if (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(text)) {
                const normalized = text.replace('T', ' ').replace(/-/g, '/')
                const [date = '', time = ''] = normalized.split(' ')
                const [year, month, day] = date.split('/')
                return `${year}年${month}月${day}日${time.slice(0, 5)}`.trim()
            }
            const time = Number(value)
            if (!Number.isNaN(time) && time > 0) {
                const date = new Date(time > 10000000000 ? time : time * 1000)
                if (!Number.isNaN(date.getTime())) {
                    const pad = (num) => String(num).padStart(2, '0')
                    return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
                }
            }
            return text
        },
        getStreetOpenStatusLabel(status) {
            if (!status) return ''
            if (status === 'OPEN') return '营业中'
            if (status === 'CLOSED') return '未营业'
            if (status === 'REST') return '休息中'
            return status
        },
        onStreetSearch() {
            const keyword = (this.streetKeyword || '').trim()
            this.streetKeyword = keyword
            this.streetLoaded = false
            uni.hideKeyboard()
            this.loadStreetIndex()
        },
        onListSearch() {
            const keyword = (this.listKeyword || '').trim()
            this.listKeyword = keyword
            uni.hideKeyboard()
            this.loadStreetGoods()
        },
        async loadStreetGoods() {
            const options = this.getCurrentPageOptions()
            const loadKey = JSON.stringify({
                keyword: this.listKeyword || '',
                categoryId: options.categoryId || options.category_id || '',
                shopId: options.shopId || options.shop_id || ''
            })
            if (this.streetGoodsLoading && this.streetGoodsLoadKey === loadKey) return
            this.streetGoodsLoadKey = loadKey
            this.streetGoodsLoading = true
            try {
                const res = await getStreetGoods({
                    keyword: this.listKeyword,
                    categoryId: options.categoryId || options.category_id,
                    shopId: options.shopId || options.shop_id,
                    pageNo: 1,
                    pageSize: 30
                })
                if (res.code != 1) return
                const list = res.data?.list || res.data?.records || res.data?.items || []
                this.merchantList = list.map((item, index) => this.mapStreetGoodsItem(item, index))
            } catch (error) {
                console.error('[street-goods] load failed:', error)
                uni.showToast({ title: '商街商品加载失败', icon: 'none' })
            } finally {
                this.streetGoodsLoading = false
            }
        },
        mapStreetGoodsItem(item = {}, index = 0) {
            const goodsId = item.goods_id || item.goodsId || item.spuId || item.productId || ''
            const shopId = item.shop_id || item.shopId || item.merchantShopId || item.merchant_shop_id || item.id || ''
            const price = item.price || item.salePrice || item.sale_price || item.minPrice || item.min_price || item.groupPrice || item.group_price || item.teamPrice || item.team_price || 0
            const marketPrice = item.marketPrice || item.market_price || item.originPrice || item.origin_price || item.originalPrice || item.original_price || ''
            const sales = item.sales_sum || item.salesCount || item.sales_count || item.virtualSales || 0
            const stock = item.stock ?? item.stockQty ?? item.stock_quantity ?? ''
            const score = item.score ?? item.shopScore ?? item.shop_score ?? item.commentScore ?? item.rating ?? ''
            const shopName = item.shop_name || item.shopName || item.storeName || item.shopInfo?.shopName || ''
            const distance = item.distance_desc || item.distanceDesc || item.distance || ''
            const businessTime = this.formatStreetTimeText(item.business_time || item.businessTime || item.time_desc || item.businessHours || item.createTime || item.createdAt || '')
            const statusLabel = this.getStreetOpenStatusLabel(item.openStatus || item.open_status || item.status)
            return {
                ...item,
                id: goodsId || shopId || index,
                goods_id: goodsId,
                shopId,
                name: item.name || item.goods_name || item.goodsName || item.spuName || item.productName || item.title || '商街商品',
                subtitle: item.subtitle || item.subTitle || item.sellingPoint || item.shortDesc || item.description || '',
                image: resolveImage(item.image || item.goods_image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl, 'goods'),
                priceText: `¥${this.formatStoreDetailPrice(price)}`,
                marketPriceText: marketPrice ? `¥${this.formatStoreDetailPrice(marketPrice)}` : '',
                scoreText: score === '' || score === null || score === undefined ? '' : String(this.formatStreetScore(score, '')).replace(/分$/, ''),
                salesText: sales ? `${sales}人购买` : '',
                stockText: stock !== '' && stock !== null && stock !== undefined ? `库存${stock}` : '',
                distanceText: distance ? String(distance) : '',
                meta: [shopName, statusLabel, businessTime].filter(Boolean).join(' · ') || '商街精选',
                shopName,
                url: goodsId
                    ? `/bundle/pages/goods_details/goods_details?id=${goodsId}${shopId ? `&shopId=${shopId}` : ''}`
                    : (shopId ? `/business/pages/business_pages/store_detail?shopId=${shopId}` : '')
            }
        },
        openStreetGoodsItem(item = {}) {
            if (!item.url) return
            this.goPage(item.url)
        },
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack({
                    delta: 1
                })
                return
            }
            uni.switchTab({
                url: '/pages/index/index'
            })
        },
        goPage(url) {
            uni.navigateTo({
                url
            })
        }
    }
}
</script>

<style lang="scss">
.business-scene {
    min-height: 100vh;
    background: #f7f8fa;
}

.business-scene--user-kyc {
    background: #ffffff;
}

.business-scene--feedback {
    background: #f2f2f2;
}

.business-scene--about-us {
    background: #f7f8fb;
}

.business-scene--activity-center {
    background: #f7f8fb url('https://shengyuan.store/api/miniapp/files/miniapp/5d41b07208f5494697f46875f9eb5aaa/activity-center-bg.png') no-repeat center top;
    background-size: 100% 100%;
}

.business-scene--intro-card,
.business-scene--recent-visits {
    background: #ffffff;
}

.business-scene__scroll {
    height: calc(100vh - 88rpx - var(--app-safe-top));
}

.business-scene__scroll--full {
    height: calc(100vh - env(safe-area-inset-bottom));
}

.qr-page {
    position: relative;
    width: 100%;
    max-width: 750rpx;
    min-height: 1626rpx;
    margin: -10rpx auto 0;
    overflow: hidden;
    background-repeat: no-repeat;
    background-position: center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.qr-page--store {
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/7a33d041916e4203ad047d734bf13ede/0ccc30c9033828fd3e3723f5e43765e1.png');
}

.qr-page--goods {
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/a560b109a63c4a4a8c9d490767674e13/1812900c299d281cdd4adcd80e9d02fd.png');
}

.qr-page__mark {
    position: absolute;
    left: 351rpx;
    width: 48rpx;
    height: 48rpx;
}

.qr-page--store .qr-page__mark {
    top: 1175rpx;
}

.qr-page--goods .qr-page__mark {
    top: 1398rpx;
}

.qr-shop-card {
    position: relative;
    z-index: 1;
    display: flex;
    width: 540rpx;
    height: 373rpx;
    margin-left: 106rpx;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.qr-page--store .qr-shop-card {
    margin-top: 436rpx;
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/bc28ff3e89a640a2b7b9c94fe99be721/264731ffd33531cb16f5c72f042fe14b.png');
}

.qr-page--goods .qr-shop-card {
    margin-top: 329rpx;
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/628c24770b344dceb4cec34a9688e8b2/03b1646c905f30fb5cc4b12a3a1df372.png');
}

.qr-shop-card__logo {
    flex: none;
    width: 147rpx;
    height: 147rpx;
    margin: 23rpx 0 0 29rpx;
    background: #ffffff;
    border-radius: 10rpx;
}

.qr-shop-card__body {
    flex: 1;
    min-width: 0;
    margin: 38rpx 43rpx 0 27rpx;
}

.qr-shop-card__name {
    color: #ffffff;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 28rpx;
    white-space: nowrap;
}

.qr-shop-card__rating {
    display: flex;
    align-items: center;
    height: 23rpx;
    margin-top: 16rpx;
}

.qr-shop-card__star {
    width: 52rpx;
    height: 23rpx;
    margin-right: 3rpx;
}

.qr-shop-card__star:nth-child(3) {
    width: 24rpx;
}

.qr-shop-card__score {
    margin: 3rpx 0 0 6rpx;
    color: #ffffff;
    font-size: 24rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 24rpx;
    white-space: nowrap;
}

.qr-shop-card__time {
    display: flex;
    align-items: center;
    margin-top: 31rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 26rpx;
    white-space: nowrap;
}

.qr-shop-card__time-icon {
    flex: none;
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
}

.qr-store-panel,
.qr-goods-panel {
    position: absolute;
    z-index: 2;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.qr-store-panel {
    left: 106rpx;
    top: 628rpx;
    width: 540rpx;
    height: 518rpx;
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/b804285c02584e1f81deaae98321c28c/2f63b8336e9bcbd0397b8bc4f7b1eba0.png');
}

.qr-code-box {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #d5d5d5;
}

.qr-test-image {
    width: 100%;
    height: 100%;
}

.qr-code-box--store {
    width: 275rpx;
    height: 275rpx;
    margin: 58rpx 0 0 128rpx;
    border-radius: 23rpx;
}

.qr-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.qr-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 243rpx;
    height: 81rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 28rpx;
    background: #037dfa;
    border-radius: 40rpx;
    white-space: nowrap;
    padding: 0;
    border: 0;
    box-sizing: border-box;
}

.qr-action::after {
    border: 0;
}

.qr-action--cyan {
    background: #03acfa;
}

.qr-goods-panel {
    left: 66rpx;
    top: 521rpx;
    width: 620rpx;
    height: 838rpx;
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/58765558c49f4c23a88db8d20b12e071/f32ca2939042b3472f400311bd2edccd.png');
}

.qr-goods-main {
    width: 562rpx;
    height: 510rpx;
    margin: 35rpx 0 0 29rpx;
    background: #d5d5d5;
    border-radius: 23rpx;
}

.qr-goods-info {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 559rpx;
    height: 124rpx;
    margin: 19rpx 0 0 31rpx;
}

.qr-goods-copy {
    margin-top: 28rpx;
}

.qr-goods-price {
    display: flex;
    align-items: baseline;
    height: 39rpx;
    color: #ff1919;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    white-space: nowrap;
}

.qr-goods-price__symbol,
.qr-goods-price__decimal {
    font-size: 26rpx;
    line-height: 26rpx;
}

.qr-goods-price__main {
    font-size: 51rpx;
    line-height: 51rpx;
}

.qr-goods-tip {
    margin-top: 21rpx;
    color: #666666;
    font-size: 24rpx;
    line-height: 24rpx;
    white-space: nowrap;
}

.qr-code-box--goods {
    width: 124rpx;
    height: 124rpx;
    border-radius: 6rpx;
}

.qr-action-row--goods {
    width: 531rpx;
    margin: 33rpx 0 0 45rpx;
}

.about-us-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow: hidden;
    background: #f7f8fb;
    box-sizing: border-box;
}

.about-us-hero {
    position: relative;
    height: 750rpx;
    padding-top: calc(var(--app-safe-top) + 24rpx);
    background: linear-gradient(180deg, #1688ff 0%, #037dfa 54%, #f7f8fb 100%);
    box-sizing: border-box;
}

.about-us-topbar {
    display: flex;
    align-items: center;
    width: calc(100% - 48rpx);
    height: 64rpx;
    margin: 0 24rpx;
}

.about-us-back {
    position: relative;
    width: 48rpx;
    height: 64rpx;
}

.about-us-back::after {
    content: '';
    position: absolute;
    left: 8rpx;
    top: 20rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid #ffffff;
    border-bottom: 4rpx solid #ffffff;
    transform: rotate(45deg);
}

.about-us-logo {
    margin-top: 80rpx;
    color: #ffffff;
    font-size: 55rpx;
    font-weight: 600;
    line-height: 60rpx;
    text-align: center;
    white-space: nowrap;
}

.about-us-version {
    margin-top: 25rpx;
    color: #ffffff;
    font-size: 26rpx;
    line-height: 30rpx;
    text-align: center;
    white-space: nowrap;
}

.about-us-card {
    position: absolute;
    left: 24rpx;
    right: 23rpx;
    top: 393rpx;
    overflow: hidden;
    background: #ffffff;
    border-radius: 15rpx;
    box-shadow: 0 14rpx 34rpx rgba(20, 63, 107, 0.06);
}

.about-us-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 97rpx;
    padding: 0 33rpx 0 29rpx;
    box-sizing: border-box;
}

.about-us-row__title {
    flex: 1;
    min-width: 0;
    color: #222222;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 30rpx;
    white-space: nowrap;
}

.about-us-row__arrow {
    flex: none;
    width: 10rpx;
    height: 17rpx;
    margin-left: 24rpx;
}

.about-us-row__line {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1rpx;
    background: #f0f0f0;
}

.activity-center-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow: hidden;
    background: #f7f8fb url('https://shengyuan.store/api/miniapp/files/miniapp/5d41b07208f5494697f46875f9eb5aaa/activity-center-bg.png') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.activity-center-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.activity-center-hero {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    padding-top: calc(var(--app-safe-top) + 24rpx);
    background: transparent;
    box-sizing: border-box;
}

.activity-center-topbar {
    display: flex;
    align-items: center;
    width: calc(100% - 48rpx);
    height: 64rpx;
    margin: 0 24rpx;
}

.activity-center-back {
    position: relative;
    width: 42rpx;
    height: 64rpx;
}

.activity-center-back::after {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 20rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.activity-center-list {
    display: flex;
    flex-direction: column;
    gap: 25rpx;
    margin: 439rpx 24rpx 0;
}

.activity-center-card {
    display: flex;
    min-height: 271rpx;
    padding: 30rpx 24rpx 30rpx 30rpx;
    background: #ffffff;
    border: 3rpx solid #ffffff;
    border-radius: 20rpx;
    box-sizing: border-box;
}

.activity-center-empty {
    margin-top: 240rpx;
    color: #ffffff;
    font-size: 28rpx;
    text-align: center;
}

.activity-center-card__image {
    flex: none;
    width: 170rpx;
    height: 204rpx;
    border-radius: 12rpx;
    object-fit: cover;
}

.activity-center-card__body {
    flex: 1;
    min-width: 0;
    margin: 21rpx 0 0 34rpx;
}

.activity-center-card__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 34rpx;
    white-space: nowrap;
}

.activity-center-card__desc {
    margin-top: 22rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 28rpx;
    white-space: nowrap;
}

.activity-center-card__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 45rpx;
}

.activity-center-card__date {
    color: #999999;
    font-size: 24rpx;
    line-height: 30rpx;
    white-space: nowrap;
}

.activity-center-card__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 199rpx;
    height: 64rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 30rpx;
    background: #037dfa;
    border-radius: 32rpx;
    white-space: nowrap;
}

.activity-exchange-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
}

.activity-exchange-modal__mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.58);
}

.activity-exchange-dialog {
    position: relative;
    z-index: 1;
    width: 553rpx;
    min-height: 727rpx;
    padding: 208rpx 11rpx 32rpx;
    background: #ffffff url('https://shengyuan.store/api/miniapp/files/miniapp/b754a48bca11497987f401487e44e3cf/activity-exchange-dialog-bg.png') no-repeat center top;
    background-size: 100% 100%;
    border-radius: 24rpx;
    box-sizing: border-box;
    box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.18);
}

.activity-exchange-dialog__title {
    color: #222222;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 38rpx;
    text-align: center;
    white-space: nowrap;
}

.activity-exchange-dialog__points {
    margin-top: 41rpx;
    color: #ff0d0d;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 38rpx;
    text-align: center;
    white-space: nowrap;
}

.activity-exchange-dialog__label {
    margin-top: 24rpx;
    color: #666666;
    font-size: 24rpx;
    line-height: 28rpx;
    text-align: center;
    white-space: nowrap;
}

.activity-exchange-dialog__balance {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    margin-top: 33rpx;
    padding: 0 34rpx 0 29rpx;
    color: #666666;
    font-size: 24rpx;
    line-height: 28rpx;
    background: #ffffff;
    border-radius: 5rpx;
    box-sizing: border-box;
}

.activity-exchange-dialog__balance text:last-child {
    color: #222222;
    font-weight: 600;
}

.activity-exchange-dialog__email-label {
    margin: 35rpx 0 0 28rpx;
    color: #666666;
    font-size: 24rpx;
    line-height: 28rpx;
    white-space: nowrap;
}

.activity-exchange-dialog__email {
    margin: 26rpx 0 0 27rpx;
    color: #222222;
    font-size: 24rpx;
    font-weight: 600;
    line-height: 28rpx;
    white-space: nowrap;
}

.activity-exchange-dialog__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 510rpx;
    height: 81rpx;
    margin: 33rpx auto 0;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 32rpx;
    background: rgba(3, 125, 250, 0.3);
    border-radius: 40rpx;
    white-space: nowrap;
}

.intro-card-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding-top: calc(var(--app-safe-top) + 24rpx);
    background: #0d83ff url('https://shengyuan.store/api/miniapp/files/miniapp/8997886b278e4233a0184d4001823b24/intro-card-page-bg.png') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.intro-card-page-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.intro-card-topbar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    height: 64rpx;
    margin: 0 24rpx;
}

.intro-card-back {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    color: #ffffff;
}

.intro-card-back::after {
    content: '';
    position: absolute;
    left: 16rpx;
    top: 20rpx;
    width: 20rpx;
    height: 20rpx;
    border-left: 4rpx solid currentColor;
    border-bottom: 4rpx solid currentColor;
    transform: rotate(45deg);
}

.intro-card-title {
    position: absolute;
    left: 50%;
    top: 50%;
    color: #ffffff;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 40rpx;
    white-space: nowrap;
    transform: translate(-50%, -50%);
}

.intro-card-panel {
    position: relative;
    z-index: 1;
    width: 650rpx;
    min-height: 860rpx;
    margin: 196rpx auto 0;
    padding: 45rpx 36rpx 56rpx;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/4a6ec42c3ad54de8a47300fb1a79d820/intro-card-panel-bg.png') no-repeat center top;
    background-size: 100% 100%;
    border-radius: 0;
    box-sizing: border-box;
    box-shadow: 0 24rpx 70rpx rgba(18, 98, 200, 0.18);
    overflow: hidden;
}

.intro-card-panel-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.intro-card-user {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    margin-left: 0;
}

.intro-card-avatar {
    flex: none;
    width: 126rpx;
    height: 126rpx;
    background: #ffffff;
    border: 2rpx solid #ffffff;
    border-radius: 50%;
    box-sizing: border-box;
}

.intro-card-info {
    flex: 1;
    min-width: 0;
    margin: 18rpx 0 0 33rpx;
}

.intro-card-name {
    color: #ffffff;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 36rpx;
    white-space: nowrap;
}

.intro-card-line {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    max-width: 100%;
    margin-top: 25rpx;
    color: #ffffff;
    font-size: 26rpx;
    line-height: 28rpx;
    white-space: nowrap;
}

.intro-card-line--account {
    width: 100%;
    margin-top: 24rpx;
}

.intro-card-line__text {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.intro-card-copy {
    flex: none;
    width: 24rpx;
    height: 23rpx;
    margin-left: 16rpx;
}

.intro-card-qr {
    position: relative;
    z-index: 1;
    display: block;
    width: 372rpx;
    height: 372rpx;
    margin: 156rpx auto 0;
    background: #ffffff;
    border-radius: 18rpx;
}

.intro-card-qr--code {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    color: #0d83ff;
    font-size: 34rpx;
    font-weight: 600;
    text-align: center;
    word-break: break-all;
    box-sizing: border-box;
}

.intro-card-stats {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    width: 540rpx;
    margin: 28rpx auto 0;
}

.intro-card-stat {
    width: 168rpx;
    padding: 14rpx 8rpx;
    text-align: center;
    background: rgba(255, 255, 255, 0.82);
    border-radius: 18rpx;
    box-sizing: border-box;
}

.intro-card-stat__value {
    color: #037dfa;
    font-size: 28rpx;
    font-weight: 700;
    line-height: 36rpx;
}

.intro-card-stat__label {
    margin-top: 6rpx;
    color: #666666;
    font-size: 22rpx;
    line-height: 30rpx;
}

.recent-visits-page {
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding-top: calc(var(--app-safe-top) + 24rpx);
    background: #ffffff url('https://shengyuan.store/api/miniapp/files/miniapp/2faee69a62c34ddab3bc464bc7b57d22/d8467d9a62a60ccdbb6908777aebe692.png') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.recent-visits-topbar {
    position: relative;
    display: flex;
    align-items: center;
    width: calc(100% - 48rpx);
    height: 64rpx;
    margin: 0 24rpx;
}

.recent-visits-back {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    color: #222222;
}

.recent-visits-back::after {
    content: '';
    position: absolute;
    left: 16rpx;
    top: 20rpx;
    width: 20rpx;
    height: 20rpx;
    border-left: 4rpx solid currentColor;
    border-bottom: 4rpx solid currentColor;
    transform: rotate(45deg);
}

.recent-visits-title {
    position: absolute;
    left: 50%;
    top: 50%;
    color: #222222;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 40rpx;
    white-space: nowrap;
    transform: translate(-50%, -50%);
}

.recent-visits-list {
    margin: 36rpx 24rpx 0 23rpx;
}

.recent-visits-empty {
    padding-top: 180rpx;
    color: #9ca3af;
    font-size: 28rpx;
    text-align: center;
}

.recent-visits-item {
    position: relative;
    display: flex;
    align-items: center;
    height: 181rpx;
    border-bottom: 1rpx solid #f0f0f0;
    box-sizing: border-box;
}

.recent-visits-item:first-child {
    height: 157rpx;
    align-items: flex-start;
}

.recent-visits-thumb {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 128rpx;
    height: 128rpx;
    background: #d5d5d5;
    border-radius: 8rpx;
    color: #9ca3af;
    font-size: 26rpx;
    line-height: 32rpx;
}

.recent-visits-info {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
}

.recent-visits-name {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 34rpx;
    white-space: nowrap;
}

.recent-visits-time {
    margin-top: 30rpx;
    color: #999999;
    font-size: 26rpx;
    line-height: 30rpx;
    white-space: nowrap;
}

.recent-visits-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 150rpx;
    height: 58rpx;
    margin-left: 24rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 30rpx;
    background: #037dfa;
    border-radius: 29rpx;
    white-space: nowrap;
}

.recent-visits-btn--subscribed {
    color: #037dfa;
    background: #d0e7ff;
}

.feedback-page {
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow-x: hidden;
    background: #f2f2f2;
    background-image: url('https://shengyuan.store/api/miniapp/files/miniapp/8cecc2f0ed3a4187a8803a2039ae7a05/e9e114d902b93769e318427edddce2a8.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.feedback-hero {
    min-height: 300rpx;
    padding: calc(var(--app-safe-top) + 20rpx) 26rpx 20rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.feedback-hero__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52rpx;
}

.feedback-back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 64rpx;
    height: 52rpx;
}

.feedback-menu-space {
    width: 144rpx;
    height: 52rpx;
    flex: none;
}

.feedback-hero__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 72rpx;
    padding: 0 30rpx 0 15rpx;
    box-sizing: border-box;
}

.feedback-hero__text {
    flex: 1;
    min-width: 0;
    padding-right: 24rpx;
}

.feedback-hero__title {
    color: #1d1d1d;
    font-size: 49rpx;
    font-family: AlimamaShuHeiTi-Bold, PingFangSC-Medium, sans-serif;
    font-weight: 700;
    line-height: 49rpx;
    white-space: nowrap;
}

.feedback-hero__subtitle {
    margin-top: 30rpx;
    color: #1d1d1d;
    font-size: 26rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 26rpx;
    white-space: nowrap;
}

.feedback-hero__illustration {
    flex: none;
    width: 164rpx;
    height: 124rpx;
}

.feedback-body {
    padding: 39rpx 21rpx 0;
    box-sizing: border-box;
}

.feedback-card {
    width: 100%;
    padding: 32rpx 37rpx;
    margin-bottom: 18rpx;
    background: #ffffff;
    border-radius: 24rpx;
    box-sizing: border-box;
}

.feedback-card--types {
    min-height: 274rpx;
}

.feedback-card--form {
    min-height: 699rpx;
}

.feedback-card__title,
.feedback-contact__title {
    color: #1d1d1d;
    font-size: 26rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 26rpx;
    white-space: nowrap;
}

.feedback-tag-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    row-gap: 18rpx;
    margin-top: 38rpx;
}

.feedback-tag {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc((100% - 48rpx) / 3);
    height: 62rpx;
    background: #ffffff;
    border: 2rpx solid #cfcfcf;
    border-radius: 7rpx;
    overflow: hidden;
    box-sizing: border-box;
}

.feedback-tag--active {
    border-color: #037dfa;
    background: rgba(3, 125, 250, 0.08);
}

.feedback-tag__text {
    color: #1d1d1d;
    font-size: 24rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 1;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.feedback-tag__check {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 36rpx;
    background: #037dfa;
    border-radius: 8rpx 0 8rpx 0;
}

.feedback-tag__check-mark {
    color: #ffffff;
    font-size: 22rpx;
    line-height: 1;
    transform: translateY(-1rpx);
}

.feedback-textarea-shell {
    position: relative;
    height: 379rpx;
    margin-top: 27rpx;
    padding: 18rpx 21rpx 20rpx;
    background: #f3f3f3;
    border-radius: 16rpx;
    box-sizing: border-box;
}

.feedback-textarea {
    width: 100%;
    height: 214rpx;
    padding: 0;
    color: #1d1d1d;
    font-size: 26rpx;
    line-height: 38rpx;
    background: transparent;
    box-sizing: border-box;
}

.feedback-upload {
    position: absolute;
    left: 21rpx;
    bottom: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 113rpx;
    height: 113rpx;
    background: #ffffff;
    border: 1rpx dashed #c1c1c1;
    border-radius: 9rpx;
    box-sizing: border-box;
}

.feedback-upload__icon {
    width: 41rpx;
    height: 35rpx;
}

.feedback-textarea__count {
    position: absolute;
    right: 23rpx;
    bottom: 23rpx;
    color: #999999;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    line-height: 28rpx;
}

.feedback-preview-row {
    display: flex;
    flex-wrap: wrap;
    margin-top: 18rpx;
}

.feedback-preview {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    margin-right: 18rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f3f3f3;
}

.feedback-preview__image {
    width: 100%;
    height: 100%;
}

.feedback-preview__close {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34rpx;
    height: 34rpx;
    color: #ffffff;
    font-size: 28rpx;
    line-height: 34rpx;
    background: rgba(0, 0, 0, 0.48);
}

.feedback-contact__title {
    margin-top: 56rpx;
}

.feedback-contact-shell {
    height: 99rpx;
    margin-top: 23rpx;
    padding: 0 22rpx;
    background: #f3f3f3;
    border-radius: 16rpx;
    box-sizing: border-box;
}

.feedback-contact {
    width: 100%;
    height: 99rpx;
    color: #1d1d1d;
    font-size: 26rpx;
    background: transparent;
}

.feedback-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 515rpx;
    max-width: calc(100vw - 120rpx);
    height: 78rpx;
    margin: 43rpx auto 79rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 600;
    line-height: 28rpx;
    background: #037dfa;
    border-radius: 39rpx;
}

@media screen and (max-width: 360px) {
    .feedback-card {
        padding-left: 28rpx;
        padding-right: 28rpx;
    }

    .feedback-tag {
        width: calc((100% - 24rpx) / 3);
    }

    .feedback-tag__text {
        font-size: 22rpx;
    }
}

.card,
.merchant-panel,
.qr-card,
.wallet-mode,
.list-page {
    margin: 24rpx;
}

.list-page {
    min-height: calc(100vh - 48rpx - 88rpx - var(--app-safe-top));
    padding-bottom: calc(36rpx + env(safe-area-inset-bottom));
}

.search-shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    height: 65rpx;
    padding: 0 18rpx 0 34rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
    border-radius: 33rpx;
    box-shadow: 0 12rpx 30rpx rgba(31, 122, 244, 0.12);
    box-sizing: border-box;
}

.search-shell__input {
    flex: 1;
    min-width: 0;
    height: 61rpx;
    padding-right: 18rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 61rpx;
}

.search-shell__placeholder {
    color: #b7b7b7;
    font-size: 26rpx;
}

.search-shell__icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
}

.search-shell__icon-image {
    width: 34rpx;
    height: 34rpx;
}

.card,
.merchant-panel,
.qr-card,
.filter-box {
    background: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
}

.section-title {
    padding: 28rpx 28rpx 20rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #222222;
}

.tag-row {
    display: flex;
    flex-wrap: wrap;
    padding: 0 28rpx 12rpx;
}

.tag-item {
    margin-right: 20rpx;
    margin-bottom: 18rpx;
    padding: 0 24rpx;
    line-height: 56rpx;
    font-size: 24rpx;
    color: #666666;
    background: #f4f6f9;
    border-radius: 28rpx;
}

.tag-item--active {
    color: #1f7af4;
    background: rgba(31, 122, 244, 0.12);
}

.textarea {
    width: auto;
    height: 220rpx;
    margin: 0 28rpx;
    padding: 24rpx;
    font-size: 28rpx;
    background: #f7f8fa;
    border-radius: 18rpx;
}

.upload-row {
    display: flex;
    padding: 24rpx 28rpx 30rpx;
}

.upload-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140rpx;
    height: 140rpx;
    margin-right: 20rpx;
    background: #f7f8fa;
    border: 1rpx dashed #d9dce2;
    border-radius: 16rpx;
}

.primary-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 540rpx;
    height: 88rpx;
    margin: 48rpx auto 60rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    background: #1f7af4;
    border-radius: 44rpx;
}

.hero-banner {
    height: 320rpx;
    margin: 24rpx 24rpx 0;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #d9e7ff 0%, #b2cbff 100%);
}

.face-pay-page {
    padding-top: 14rpx;
}

.face-pay-tips {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    padding: 14rpx 24rpx;
    background: #ffebd8;
}

.face-pay-tips__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
    margin-right: 16rpx;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 34rpx;
}

.face-pay-tips__text {
    flex: 1;
    color: #f1790e;
    font-size: 24rpx;
    line-height: 34rpx;
}

.face-pay-shell {
    display: flex;
    align-items: flex-start;
    padding: 30rpx 24rpx 0;
}

.face-pay-shell__field {
    flex: 1;
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 24rpx;
    margin-right: 24rpx;
    background: #f3f6ff;
    border: 1rpx solid #e8edf9;
    border-radius: 16rpx;
}

.face-pay-shell__label {
    flex: none;
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
}

.face-pay-shell__input {
    flex: 1;
    margin-left: 24rpx;
    color: #222222;
    font-size: 26rpx;
}

.face-pay-shell__scan {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 66rpx;
    color: #222222;
    font-size: 22rpx;
    line-height: 32rpx;
}

.face-pay-shell__scan text {
    margin-top: 10rpx;
}

.face-pay-calculator {
    margin: 30rpx 24rpx 0;
    padding: 26rpx 24rpx;
    border-radius: 20rpx;
    background: #ffffff;
    box-shadow: 0 10rpx 24rpx rgba(31, 122, 244, 0.08);
}

.face-pay-calculator__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.face-pay-calc-row {
    display: flex;
    align-items: center;
    min-height: 82rpx;
    border-bottom: 1rpx solid #edf0f5;
    color: #333333;
    font-size: 26rpx;
}

.face-pay-calc-row text {
    flex: none;
    width: 150rpx;
}

.face-pay-calc-row input {
    flex: 1;
    min-width: 0;
    color: #222222;
    font-size: 26rpx;
    text-align: right;
}

.face-pay-calc-result {
    margin-top: 22rpx;
    padding: 18rpx 20rpx;
    border-radius: 16rpx;
    color: #5a6678;
    background: #f3f8ff;
    font-size: 25rpx;
    line-height: 36rpx;
}

.face-pay-calc-result text {
    color: #1f7af4;
    font-size: 32rpx;
    font-weight: 700;
}

.face-pay-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 86rpx;
    margin: 42rpx 24rpx 0;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
    background: #1f7af4;
    border-radius: 43rpx;
}

.merchant-panel {
    margin-top: -36rpx;
    padding-bottom: 24rpx;
}

.merchant-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 28rpx 18rpx;
}

.merchant-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #222222;
}

.merchant-sub {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #999999;
}

.follow-btn,
.mini-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 132rpx;
    height: 58rpx;
    padding: 0 24rpx;
    color: #ffffff;
    font-size: 24rpx;
    background: #1f7af4;
    border-radius: 29rpx;
}

.merchant-tabs {
    display: flex;
    padding: 0 28rpx 24rpx;
}

.merchant-tab {
    margin-right: 34rpx;
    font-size: 28rpx;
    color: #999999;
}

.merchant-tab--active {
    color: #1f7af4;
    font-weight: 600;
}

.goods-grid {
    display: flex;
    flex-wrap: wrap;
    padding: 0 16rpx;
}

.goods-card {
    width: calc(50% - 24rpx);
    margin: 0 12rpx 24rpx;
    background: #f8f9fb;
    border-radius: 18rpx;
    overflow: hidden;
}

.goods-card__image {
    width: 100%;
    height: 220rpx;
}

.goods-card__title {
    padding: 18rpx 18rpx 8rpx;
    font-size: 26rpx;
    color: #222222;
}

.goods-card__price {
    padding: 0 18rpx 18rpx;
    font-size: 28rpx;
    color: #1f7af4;
    font-weight: 600;
}

.qr-wrap {
    padding-top: 80rpx;
}

.qr-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 24rpx;
}

.qr-card__title {
    font-size: 34rpx;
    font-weight: 600;
    color: #222222;
}

.qr-card__desc {
    margin-top: 34rpx;
    font-size: 26rpx;
    color: #666666;
}

.empty-text {
    padding: 32rpx 24rpx;
    color: #9ca3af;
    font-size: 26rpx;
    text-align: center;
}

.group-item,
.merchant-list__item,
.pending-card {
    display: flex;
    padding: 20rpx 24rpx;
}

.merchant-list {
    margin-top: 20rpx;
    background: transparent;
    border-radius: 0;
}

.merchant-list__item {
    align-items: stretch;
    margin-bottom: 18rpx;
    min-height: 220rpx;
    background: #ffffff;
    border: 1rpx solid rgba(31, 122, 244, 0.06);
    border-radius: 24rpx;
    box-shadow: 0 14rpx 36rpx rgba(24, 54, 104, 0.08);
}

.group-item + .group-item,
.record-row + .record-row,
.pending-card + .pending-card,
.info-block + .info-block,
.field-box + .field-box {
    border-top: 1rpx solid #eef0f3;
}

.group-item__image,
.merchant-list__image,
.pending-card__image,
.album-grid__item {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 188rpx;
    height: 188rpx;
    border-radius: 20rpx;
    background: #eef4ff;
}

.image-placeholder {
    color: #9ca3af;
    font-size: 24rpx;
    line-height: 32rpx;
    text-align: center;
    background: #eef1f5;
}

.group-item__content,
.pending-card__body {
    flex: 1;
    padding-left: 20rpx;
}

.merchant-list__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    padding-left: 22rpx;
}

.group-item__title,
.pending-card__title,
.merchant-list__title {
    font-size: 30rpx;
    color: #172033;
    font-weight: 700;
    line-height: 40rpx;
    word-break: break-all;
}

.merchant-list__desc {
    margin-top: 6rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 34rpx;
    word-break: break-all;
}

.group-item__meta,
.pending-card__meta,
.merchant-list__time,
.record-row__time,
.info-block__desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #7b8494;
    line-height: 36rpx;
}

.group-item__meta {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.group-item__foot,
.pending-card__foot,
.wallet-card__row,
.record-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
}

.group-item__price,
.pending-card__price,
.record-row__amount,
.merchant-list__price {
    font-size: 34rpx;
    color: #ff3b30;
    font-weight: 800;
}

.merchant-list__price-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6rpx 12rpx;
    margin-top: 10rpx;
}

.merchant-list__market {
    margin-left: 0;
    color: #b7b7b7;
    font-size: 22rpx;
    text-decoration: line-through;
}

.merchant-list__score {
    display: flex;
    align-items: center;
    margin-left: 0;
    padding: 5rpx 12rpx;
    color: #f59b00;
    font-size: 22rpx;
    font-weight: 700;
    background: rgba(255, 173, 31, 0.12);
    border-radius: 999rpx;
}

.merchant-list__score-star {
    margin-right: 4rpx;
    color: #ffb11f;
}

.merchant-list__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 10rpx;
}

.merchant-list__tag {
    max-width: 100%;
    margin: 0;
    padding: 3rpx 12rpx;
    color: #3570c7;
    font-size: 20rpx;
    line-height: 28rpx;
    background: #eef6ff;
    border-radius: 999rpx;
}

@media screen and (max-width: 360px) {
    .card,
    .merchant-panel,
    .qr-card,
    .wallet-mode,
    .list-page {
        margin-left: 16rpx;
        margin-right: 16rpx;
    }

    .merchant-list__item {
        padding: 18rpx;
        border-radius: 20rpx;
    }

    .merchant-list__image {
        width: 156rpx;
        height: 156rpx;
        border-radius: 18rpx;
    }

    .merchant-list__body {
        padding-left: 16rpx;
    }

    .merchant-list__title {
        font-size: 27rpx;
        line-height: 36rpx;
    }

    .merchant-list__price {
        font-size: 30rpx;
    }
}

.group-item__price-wrap {
    display: flex;
    align-items: flex-end;
    min-width: 0;
}

.street-page {
    width: 100%;
    max-width: 900rpx;
    min-height: 100vh;
    margin: 0 auto;
    background: linear-gradient(180deg, #377df2 0%, #68a3f7 266rpx, #f8f8f8 266rpx, #f8f8f8 100%);
    padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
}

.street-header {
    padding: calc(var(--app-safe-top) + 24rpx) 24rpx 20rpx;
}

.street-header__top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 64rpx;
}

.street-header__title {
    color: #ffffff;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
}

.street-header__capsule {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 168rpx;
    height: 64rpx;
}

.street-search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 65rpx;
    margin-top: 13rpx;
    padding: 0 18rpx 0 34rpx;
    background: #ffffff;
    border: 2rpx solid rgba(255, 255, 255, 1);
    border-radius: 33rpx;
    box-shadow: 0 8rpx 24rpx rgba(24, 91, 192, 0.12);
    box-sizing: border-box;
}

.street-search__input {
    flex: 1;
    min-width: 0;
    height: 61rpx;
    padding-right: 18rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 61rpx;
}

.street-search__placeholder {
    color: #b7b7b7;
    font-size: 26rpx;
}

.street-search__icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
}

.street-search__icon-image {
    width: 34rpx;
    height: 34rpx;
}

.street-sheet {
    min-height: calc(100vh - 266rpx);
    margin-top: 20rpx;
    background: #f8f8f8;
    border-top-left-radius: 21rpx;
    border-top-right-radius: 21rpx;
    box-shadow: 0 -3rpx 16rpx rgba(224, 224, 224, 0.67);
}

.street-service-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    row-gap: 34rpx;
    padding: 48rpx 42rpx 0;
}

.street-service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
    flex: 0 0 25%;
}

.street-service-item__icon-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 97rpx;
    height: 84rpx;
}

.street-service-item__image {
    width: 97rpx;
    height: 84rpx;
}

.street-service-item__text {
    margin-top: 18rpx;
    color: #222222;
    font-size: 26rpx;
    line-height: 26rpx;
    white-space: nowrap;
}

.street-merchant-list {
    padding: 40rpx 24rpx 24rpx;
}

.street-merchant-card {
    display: flex;
    align-items: flex-start;
    min-height: 226rpx;
    margin-bottom: 26rpx;
    background: #ffffff;
    border-radius: 15rpx;
    overflow: hidden;
}

.street-merchant-card__image-shell {
    flex: none;
    width: 189rpx;
    height: 189rpx;
    margin: 18rpx 0 0 19rpx;
    border-radius: 10rpx;
    background: rgba(255, 247, 241, 1);
    overflow: hidden;
}

.street-merchant-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 189rpx;
    height: 189rpx;
}

.street-merchant-card__body {
    flex: 1;
    min-width: 0;
    padding: 36rpx 24rpx 0 29rpx;
}

.street-merchant-card__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 500;
    line-height: 30rpx;
}

.street-merchant-card__rating {
    display: flex;
    align-items: center;
    margin-top: 22rpx;
}

.street-merchant-card__stars {
    display: flex;
    align-items: center;
}

.street-merchant-card__star {
    width: 24rpx;
    height: 23rpx;
    margin-right: 3rpx;
}

.street-merchant-card__score {
    margin-left: 9rpx;
    color: rgba(248, 104, 33, 1);
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.street-merchant-card__time-row {
    display: flex;
    align-items: center;
    margin-top: 46rpx;
}

.street-merchant-card__time-icon {
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
}

.street-merchant-card__time {
    color: rgba(102, 102, 102, 1);
    font-size: 26rpx;
    font-weight: 500;
    line-height: 26rpx;
}

@media screen and (min-width: 768px) {
    .street-service-grid {
        justify-content: flex-start;
        column-gap: 32rpx;
        padding-left: 48rpx;
        padding-right: 48rpx;
    }

    .street-service-item {
        width: calc((100% - 96rpx) / 4);
    }

    .street-merchant-list {
        padding-left: 32rpx;
        padding-right: 32rpx;
    }
}

.store-detail-page {
    min-height: 100vh;
    padding-bottom: 56rpx;
    background: #f8f8f8;
}

.store-detail-hero {
    position: relative;
    height: 411rpx;
    overflow: hidden;
}

.store-detail-hero__image,
.store-detail-content-card__image {
    width: 100%;
    height: 100%;
}

.store-detail-hero__mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
}

.store-detail-hero__top {
    position: absolute;
    top: calc(var(--app-safe-top) + 36rpx);
    left: 24rpx;
    right: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72rpx;
    z-index: 5;
}

/* #ifdef MP-WEIXIN */
.store-detail-hero__top {
    right: 220rpx;
}

.store-detail-hero__share {
    margin-right: 0;
}
/* #endif */

.store-detail-hero__back {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    flex: none;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.28);
    border-radius: 50%;
}

.store-detail-hero__back-icon {
    position: relative;
    width: 34rpx;
    height: 34rpx;
}

.store-detail-hero__back-icon::after {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 7rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid currentColor;
    border-bottom: 4rpx solid currentColor;
    transform: rotate(45deg);
}

.store-detail-hero__right-space {
    width: 60rpx;
    height: 64rpx;
    flex: none;
}

.store-detail-hero__share {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 104rpx;
    height: 58rpx;
    padding: 0 16rpx;
    flex: none;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.28);
    border: 1rpx solid rgba(255, 255, 255, 0.42);
    border-radius: 999rpx;
    box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(8px);
    box-sizing: border-box;
}

.store-detail-hero__share-icon {
    position: relative;
    width: 28rpx;
    height: 28rpx;
    margin-right: 8rpx;
}

.store-detail-hero__share-icon::before,
.store-detail-hero__share-icon::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: currentColor;
}

.store-detail-hero__share-icon::before {
    left: 2rpx;
    top: 10rpx;
    width: 8rpx;
    height: 8rpx;
    box-shadow: 17rpx -8rpx 0 currentColor, 17rpx 12rpx 0 currentColor;
}

.store-detail-hero__share-icon::after {
    left: 8rpx;
    top: 9rpx;
    width: 18rpx;
    height: 2rpx;
    border-radius: 2rpx;
    background: currentColor;
    box-shadow: 0 10rpx 0 currentColor;
    transform: rotate(-25deg);
    transform-origin: left center;
}

.store-detail-hero__title {
    position: absolute;
    left: 50%;
    top: 50%;
    max-width: calc(100% - 260rpx);
    overflow: hidden;
    text-overflow: ellipsis;
    transform: translate(-50%, -50%);
    color: #ffffff;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 44rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.35);
    white-space: nowrap;
}

.store-share-popup {
    position: relative;
    width: 680rpx;
    max-width: 92vw;
    max-height: calc(100vh - var(--app-safe-top) - 80rpx);
    padding: 0;
    background-size: 100% 100%;
    border-radius: 30rpx;
    box-sizing: border-box;
    overflow: hidden;
}

.store-share-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
    width: 320px;
    height: 385px;
}

.store-share-popup__scroll {
    max-height: calc(100vh - var(--app-safe-top) - 80rpx);
    padding: 58rpx 0 34rpx;
    box-sizing: border-box;
}

.store-share-shop-card {
    position: relative;
    display: flex;
    width: 540rpx;
    max-width: calc(100% - 64rpx);
    min-height: 188rpx;
    margin: 0 auto;
    padding: 23rpx 29rpx;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/bc28ff3e89a640a2b7b9c94fe99be721/264731ffd33531cb16f5c72f042fe14b.png') no-repeat center;
    background-size: 100% 100%;
    box-sizing: border-box;
    border-radius: 24rpx;
    box-shadow: 0 20rpx 44rpx rgba(0, 84, 184, 0.18);
    overflow: hidden;
}

.store-share-shop-card__logo {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 147rpx;
    height: 147rpx;
    margin: 0;
    background: #ffffff;
    border-radius: 10rpx;
}

.store-share-shop-card__logo--empty {
    color: #9ca3af;
    font-size: 28rpx;
    line-height: 34rpx;
}

.store-share-shop-card__body {
    flex: 1;
    min-width: 0;
    margin: 12rpx 0 0 27rpx;
}

.store-share-shop-card__name {
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
}

.store-share-shop-card__rating {
    display: flex;
    align-items: center;
    height: 26rpx;
    margin-top: 16rpx;
}

.store-share-shop-card__star {
    width: 24rpx;
    height: 23rpx;
    margin-right: 2rpx;
}

.store-share-shop-card__score {
    margin: 3rpx 0 0 6rpx;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.store-share-shop-card__time {
    display: flex;
    align-items: center;
    margin-top: 22rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 26rpx;
}

.store-share-shop-card__time-icon {
    flex: none;
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
}

.store-share-shop-card__time-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
}

.store-share-shop-card__time-text.is-long {
    font-size: 22rpx;
}

.store-share-mark {
    display: block;
    position: relative;
    width: 56rpx;
    height: 56rpx;
    margin: 22rpx auto 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 3;
}

.store-share-panel {
    position: relative;
    width: 540rpx;
    max-width: calc(100% - 64rpx);
    min-height: 518rpx;
    margin: 0 auto;
    padding: 58rpx 21rpx 17rpx;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/b804285c02584e1f81deaae98321c28c/2f63b8336e9bcbd0397b8bc4f7b1eba0.png') no-repeat center;
    background-size: 100% 100%;
    box-sizing: border-box;
    margin-top: -10px;
}

.store-share-qrcode {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 275rpx;
    height: 275rpx;
    margin: 0 auto;
    background: #d5d5d5;
    border-radius: 23rpx;
    overflow: hidden;
}

.store-share-qrcode__image {
    width: 100%;
    height: 100%;
}

.store-share-qrcode__empty {
    color: #666666;
    font-size: 28rpx;
}

.store-share-info {
    width: 100%;
    margin: 20rpx 0 0;
}

.store-share-price {
    display: flex;
    align-items: baseline;
    height: 39rpx;
    margin-top: 28rpx;
    color: #ff1919;
    font-weight: 500;
}

.store-share-price__symbol,
.store-share-price__decimal {
    font-size: 26rpx;
    line-height: 26rpx;
}

.store-share-price__main {
    font-size: 51rpx;
    line-height: 51rpx;
}

.store-share-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 81rpx;
    margin: 60rpx 0 0;
}

.store-share-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 243rpx;
    height: 81rpx;
    margin: 0;
    padding: 0;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 81rpx;
    background: #037dfa;
    border: 0;
    border-radius: 40rpx;
}

.store-share-action--cyan {
    background: #03acfa;
}

.store-share-action::after {
    border: 0;
}

.store-detail-summary-card,
.store-detail-address-card {
    display: flex;
    background: #ffffff;
    border-radius: 15rpx;
    margin: -82rpx 24rpx 0;
    position: relative;
    z-index: 2;
}

.store-detail-summary-card {
    align-items: flex-start;
    min-height: 226rpx;
}

.store-detail-summary-card__image-shell {
    flex: none;
    width: 189rpx;
    height: 189rpx;
    margin: 18rpx 0 0 19rpx;
    background: rgba(255, 247, 241, 1);
    border-radius: 10rpx;
    overflow: hidden;
}

.store-detail-summary-card__image {
    width: 189rpx;
    height: 189rpx;
}

.store-detail-summary-card__body {
    flex: 1;
    min-width: 0;
    padding: 36rpx 24rpx 0 29rpx;
}

.store-detail-summary-card__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 500;
    line-height: 30rpx;
}

.store-detail-summary-card__rating {
    display: flex;
    align-items: center;
    margin-top: 22rpx;
}

.store-detail-summary-card__stars {
    display: flex;
    align-items: center;
}

.store-detail-summary-card__star {
    width: 24rpx;
    height: 23rpx;
    margin-right: 2rpx;
}

.store-detail-summary-card__score {
    margin-left: 7rpx;
    color: rgba(248, 104, 33, 1);
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.store-detail-summary-card__time-row {
    display: flex;
    align-items: center;
    margin-top: 46rpx;
}

.store-detail-summary-card__time-icon {
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
}

.store-detail-summary-card__time {
    color: rgba(102, 102, 102, 1);
    font-size: 26rpx;
    font-weight: 500;
    line-height: 26rpx;
}

.store-detail-address-card {
    align-items: center;
    height: 105rpx;
    margin-top: 18rpx;
    padding: 0 23rpx;
}

.store-detail-address-card__icon {
    width: 38rpx;
    height: 44rpx;
    margin-right: 20rpx;
}

.store-detail-address-card__text {
    flex: 1;
    min-width: 0;
    color: #222222;
    font-size: 28rpx;
    line-height: 28rpx;
}

.store-detail-tabs {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 62rpx 24rpx 0;
}

.store-detail-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 86rpx;
    padding-bottom: 33rpx;
}

.store-detail-tab__label {
    color: #666666;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 32rpx;
    white-space: nowrap;
}

.store-detail-tab--active .store-detail-tab__label {
    color: rgba(42, 122, 255, 1);
}

.store-detail-tab__indicator {
    position: absolute;
    bottom: 0;
    width: 35rpx;
    height: 7rpx;
    background: rgba(42, 122, 255, 1);
    border-radius: 3rpx;
}

.store-detail-content-card {
    position: relative;
    height: 925rpx;
    margin: 0 24rpx;
    border-radius: 15rpx;
    overflow: hidden;
    background: #ffffff;
}

.store-detail-content-card__fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 340rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 248, 248, 0.94) 58%, #f8f8f8 100%);
}

.store-detail-pay-btn {
    position: absolute;
    left: 96rpx;
    right: 96rpx;
    bottom: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 81rpx;
    background: rgba(3, 125, 250, 1);
    border-radius: 40rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
}

.store-detail-group-list {
    padding: 31rpx 24rpx 40rpx;
}

.store-detail-media-wrap {
    min-height: 900rpx;
    padding: 24rpx 24rpx 40rpx;
}

.store-detail-album-grid,
.store-detail-video-grid {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -9rpx;
}

.store-detail-album-card,
.store-detail-video-card {
    position: relative;
    width: calc(50% - 18rpx);
    height: 246rpx;
    margin: 0 9rpx 18rpx;
    overflow: hidden;
    border-radius: 15rpx;
    background: #f6f8fb;
    box-shadow: 0 10rpx 24rpx rgba(34, 34, 34, 0.05);
}

.store-detail-album-card__image,
.store-detail-video-card__cover {
    width: 100%;
    height: 100%;
    display: block;
}

.store-detail-video-card__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.18);
}

.store-detail-video-card__play {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.92);
    position: relative;
}

.store-detail-video-card__play::after {
    content: '';
    position: absolute;
    left: 26rpx;
    top: 20rpx;
    width: 0;
    height: 0;
    border-top: 12rpx solid transparent;
    border-bottom: 12rpx solid transparent;
    border-left: 18rpx solid #2a7aff;
}

.store-detail-video-card__title {
    position: absolute;
    left: 18rpx;
    right: 18rpx;
    bottom: 16rpx;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 28rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.28);
}

.store-detail-media-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 620rpx;
    padding: 80rpx 30rpx;
    border-radius: 18rpx;
    box-sizing: border-box;
}

.store-detail-media-empty__image {
    display: block;
}

.store-detail-media-empty__title {
    margin-top: 10rpx;
    color: #222222;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
}

.store-detail-media-empty__desc {
    margin-top: 12rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}

.store-detail-comment-list {
    padding: 21rpx 24rpx 40rpx;
}

.store-detail-comment-card {
    min-height: 185rpx;
    margin-bottom: 18rpx;
    padding: 25rpx 24rpx 24rpx;
    background: #ffffff;
    border-radius: 13rpx;
    box-sizing: border-box;
}

.store-detail-comment-card__head {
    display: flex;
    align-items: flex-start;
}

.store-detail-comment-card__avatar,
.store-detail-comment-card__avatar-image {
    flex: none;
    width: 92rpx;
    height: 92rpx;
    border-radius: 7rpx;
    background: #666666;
}

.store-detail-comment-card__avatar-image {
    overflow: hidden;
}

.store-detail-comment-card__meta {
    flex: 1;
    min-width: 0;
    margin: 18rpx 0 0 18rpx;
}

.store-detail-comment-card__name {
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
}

.store-detail-comment-card__date {
    margin-top: 19rpx;
    color: #999999;
    font-size: 22rpx;
    font-weight: 300;
    line-height: 22rpx;
}

.store-detail-comment-card__content {
    margin-top: 19rpx;
    color: #666666;
    font-size: 22rpx;
    line-height: 30rpx;
}

.store-detail-group-card {
    position: relative;
    display: flex;
    min-height: 236rpx;
    margin-bottom: 20rpx;
    background: #ffffff;
    border-radius: 15rpx;
}

.store-detail-group-card__image-shell {
    flex: none;
    width: 200rpx;
    height: 200rpx;
    margin: 18rpx 0 0 18rpx;
    background: rgba(255, 247, 241, 1);
    border-radius: 10rpx;
    overflow: hidden;
}

.store-detail-group-card__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200rpx;
    height: 200rpx;
}

.store-detail-group-card__body {
    flex: 1;
    min-width: 0;
    padding: 32rpx 184rpx 0 21rpx;
}

.store-detail-group-card__title {
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
    text-align: left;
}

.store-detail-group-card__meta {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 21rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 24rpx;
    white-space: nowrap;
}

.store-detail-group-card__tag,
.group-item__tag {
    flex: none;
    display: inline-flex;
    align-items: center;
    height: 32rpx;
    padding: 0 10rpx;
    border-radius: 16rpx;
    background: rgba(245, 34, 34, 0.08);
    color: #f52222;
    font-size: 20rpx;
    line-height: 32rpx;
}

.store-detail-group-card__info,
.group-item__info {
    margin-top: 12rpx;
    color: #666666;
    font-size: 22rpx;
    line-height: 30rpx;
}

.store-detail-group-card__rating {
    display: flex;
    align-items: center;
    margin-top: 26rpx;
}

.store-detail-group-card__stars {
    display: flex;
    align-items: center;
}

.store-detail-group-card__star {
    width: 24rpx;
    height: 23rpx;
    margin-right: 2rpx;
}

.store-detail-group-card__score {
    margin-left: 7rpx;
    color: rgba(248, 104, 33, 1);
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.store-detail-group-card__price {
    display: flex;
    align-items: flex-end;
    margin-top: 27rpx;
    color: rgba(245, 34, 34, 1);
    line-height: 1;
}

.store-detail-group-card__price-value {
    font-size: 35rpx;
    font-weight: 500;
    line-height: 35rpx;
}

.store-detail-group-card__market-price,
.group-item__market-price {
    margin-left: 12rpx;
    color: #999999;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 28rpx;
    text-decoration: line-through;
}

.store-detail-group-card__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160rpx;
    height: 62rpx;
    background: rgba(3, 125, 250, 1);
    border-radius: 31rpx;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.store-detail-group-card__action-wrap {
    position: absolute;
    right: 20rpx;
    bottom: 18rpx;
}

.user-kyc-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #ddecff 0%, #f3f7ff 34%, #f7f9fc 100%);
}

.user-kyc-page__hero {
    position: relative;
    min-height: 336rpx;
    padding: var(--app-safe-top) 24rpx 22rpx;
    box-sizing: border-box;
}

.user-kyc-page__status {
    display: none;
    width: 100%;
    height: 44rpx;
}

.user-kyc-page__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
}

.user-kyc-page__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
}

.user-kyc-page__topbar-space {
    width: 190rpx;
    height: 82rpx;
    flex: none;
}

.user-kyc-page__hero-body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 28rpx;
    gap: 20rpx;
}

.user-kyc-page__copy {
    flex: 1;
    min-width: 0;
    padding-top: 44rpx;
}

.user-kyc-page__title {
    color: #172033;
    font-size: 50rpx;
    line-height: 64rpx;
    font-weight: 800;
    word-break: break-all;
}

.user-kyc-page__subtitle {
    margin-top: 18rpx;
    color: #5f6b7a;
    font-size: 26rpx;
    line-height: 38rpx;
}

.user-kyc-page__status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 116rpx;
    height: 44rpx;
    margin-top: 18rpx;
    padding: 0 20rpx;
    color: #666666;
    font-size: 24rpx;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.78);
    border-radius: 999rpx;
}

.user-kyc-page__status-pill.is-pending {
    color: #a46800;
    background: #fff3d8;
}

.user-kyc-page__status-pill.is-success {
    color: #0f8a42;
    background: #daf7e7;
}

.user-kyc-page__status-pill.is-error {
    color: #d93025;
    background: #ffe5e2;
}

.user-kyc-page__illustration {
    flex: none;
    position: relative;
    width: 252rpx;
    height: 210rpx;
    margin-right: -4rpx;
}

.user-kyc-page__illustration-image {
    width: 100%;
    height: 100%;
}

.user-kyc-page__illustration-back,
.user-kyc-page__illustration-front,
.user-kyc-page__illustration-sheet {
    position: absolute;
    border-radius: 24rpx;
    box-shadow: 0 16rpx 28rpx rgba(74, 123, 192, 0.14);
}

.user-kyc-page__illustration-back {
    right: 10rpx;
    top: 16rpx;
    width: 170rpx;
    height: 176rpx;
    background: linear-gradient(180deg, #f5f8ff 0%, #ffffff 100%);
    transform: rotate(8deg);
}

.user-kyc-page__illustration-front {
    right: 30rpx;
    top: 12rpx;
    width: 170rpx;
    height: 176rpx;
    background: linear-gradient(180deg, #5ca6ff 0%, #1281f7 100%);
    transform: rotate(8deg);
}

.user-kyc-page__illustration-sheet {
    left: 22rpx;
    top: 14rpx;
    width: 156rpx;
    height: 172rpx;
    background: linear-gradient(180deg, #f4f7ff 0%, #ffffff 100%);
    border: 1rpx solid rgba(187, 202, 234, 0.6);
    transform: rotate(-3deg);
}

.user-kyc-page__illustration-sheet-tab {
    position: absolute;
    left: -12rpx;
    top: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 126rpx;
    height: 38rpx;
    color: #ffffff;
    font-size: 20rpx;
    font-weight: 700;
    background: linear-gradient(180deg, #4da5ff 0%, #0b7bf6 100%);
    border-radius: 12rpx;
    box-shadow: 0 8rpx 20rpx rgba(35, 124, 239, 0.34);
}

.user-kyc-page__illustration-line {
    position: absolute;
    left: 38rpx;
    height: 10rpx;
    border-radius: 5rpx;
    background: rgba(177, 194, 229, 0.95);
}

.user-kyc-page__illustration-line--one {
    top: 84rpx;
    width: 62rpx;
}

.user-kyc-page__illustration-line--two {
    top: 107rpx;
    width: 78rpx;
}

.user-kyc-page__illustration-line--three {
    top: 130rpx;
    width: 42rpx;
}

.user-kyc-page__illustration-arrow {
    position: absolute;
    left: 10rpx;
    top: 108rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
    background: linear-gradient(180deg, #d7ffe8 0%, #b5f0cf 100%);
    border-radius: 34rpx;
    box-shadow: 0 10rpx 22rpx rgba(69, 179, 130, 0.28);
    transform: rotate(-12deg);
}

.user-kyc-page__illustration-cloud {
    position: absolute;
    width: 24rpx;
    height: 16rpx;
    background: rgba(92, 166, 255, 0.46);
    border-radius: 999rpx;
}

.user-kyc-page__illustration-cloud--left {
    left: 0;
    top: 92rpx;
}

.user-kyc-page__illustration-cloud--right {
    right: 2rpx;
    bottom: 16rpx;
}

.user-kyc-page__sheet {
    margin: 0 20rpx;
    padding: 24rpx 24rpx calc(72rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    border-radius: 30rpx;
    box-shadow: 0 18rpx 48rpx rgba(70, 104, 156, 0.12);
}

.user-kyc-page__info-grid {
    display: flex;
    flex-wrap: wrap;
    margin: 0 0 22rpx;
    padding: 20rpx;
    background: #f7faff;
    border: 1rpx solid #e8f0ff;
    border-radius: 24rpx;
}

.user-kyc-page__info-item {
    width: 50%;
    min-width: 0;
    padding: 10rpx 12rpx;
    box-sizing: border-box;
}

.user-kyc-page__info-label {
    color: #8f9aaf;
    font-size: 22rpx;
    line-height: 32rpx;
}

.user-kyc-page__info-value {
    margin-top: 6rpx;
    color: #222222;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 36rpx;
    word-break: break-all;
}

.user-kyc-page__audit-card {
    margin-bottom: 12rpx;
    padding: 22rpx 24rpx;
    color: #202020;
    background: #f5f8ff;
    border: 1rpx solid #e7eefc;
    border-radius: 18rpx;
}

.user-kyc-page__audit-title {
    font-size: 28rpx;
    font-weight: 700;
    line-height: 40rpx;
}

.user-kyc-page__audit-desc,
.user-kyc-page__audit-time {
    margin-top: 8rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 34rpx;
}

.user-kyc-page__field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 96rpx;
    padding: 0 4rpx;
    border-bottom: 1rpx solid #eef2f7;
    box-sizing: border-box;
}

.user-kyc-page__label,
.user-kyc-page__value {
    color: #172033;
    font-size: 30rpx;
    line-height: 44rpx;
    font-weight: 700;
}

.user-kyc-page__value {
    font-weight: 400;
}

.user-kyc-page__input {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
    color: #202020;
    font-size: 28rpx;
    text-align: right;
}

.user-kyc-page__placeholder {
    color: #c5c7cd;
}

.user-kyc-page__section-title {
    margin-top: 34rpx;
    color: #172033;
    font-size: 30rpx;
    line-height: 44rpx;
    font-weight: 700;
}

.user-kyc-page__photo-row {
    display: flex;
    justify-content: space-between;
    gap: 18rpx;
    margin-top: 22rpx;
}

.user-kyc-page__photo-card {
    position: relative;
    flex: 1;
    min-width: 0;
    width: auto;
    height: 214rpx;
    overflow: hidden;
    border-radius: 18rpx;
    background: linear-gradient(135deg, #eff4fb 0%, #f8f9fd 52%, #eef4ff 100%);
}

.user-kyc-page__photo-image {
    width: 100%;
    height: 100%;
}

.user-kyc-page__photo-add {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 2;
    width: 66rpx;
    height: 66rpx;
    transform: translate(-50%, -50%);
}

.user-kyc-page__photo-card--back {
    background: linear-gradient(135deg, #f3f6ff 0%, #f9faff 52%, #edf1ff 100%);
}

.user-kyc-page__photo-preview {
    position: absolute;
    left: 22rpx;
    right: 22rpx;
    top: 26rpx;
    bottom: 26rpx;
    border-radius: 16rpx;
}

.user-kyc-page__photo-preview-line {
    position: absolute;
    left: 0;
    height: 10rpx;
    background: rgba(189, 198, 213, 0.78);
    border-radius: 999rpx;
}

.user-kyc-page__photo-preview-line--long {
    top: 14rpx;
    width: 76rpx;
}

.user-kyc-page__photo-preview-line--full {
    left: 64rpx;
    right: 0;
    width: auto;
}

.user-kyc-page__photo-preview-line--short {
    top: 108rpx;
    width: 88rpx;
}

.user-kyc-page__photo-preview .user-kyc-page__photo-preview-line:nth-child(2) {
    top: 44rpx;
    width: 58rpx;
}

.user-kyc-page__photo-preview .user-kyc-page__photo-preview-line:nth-child(3) {
    top: 68rpx;
    width: 96rpx;
}

.user-kyc-page__photo-avatar {
    position: absolute;
    right: 16rpx;
    top: 8rpx;
    width: 54rpx;
    height: 54rpx;
    background: linear-gradient(180deg, #e5ebf6 0%, #cfd8e8 100%);
    border-radius: 50%;
}

.user-kyc-page__photo-avatar-body {
    position: absolute;
    right: 8rpx;
    top: 50rpx;
    width: 72rpx;
    height: 64rpx;
    background: linear-gradient(180deg, #eef2f8 0%, #d9e0ea 100%);
    border-radius: 30rpx 30rpx 20rpx 20rpx;
}

.user-kyc-page__photo-preview--certificate .user-kyc-page__photo-badge {
    position: absolute;
    left: 16rpx;
    top: 10rpx;
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #dbe8ff 0%, #b8cdfb 60%, #a8bcf6 100%);
}

.user-kyc-page__photo-preview--certificate .user-kyc-page__photo-badge::after {
    content: '';
    position: absolute;
    left: 12rpx;
    top: 12rpx;
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.8);
}

.user-kyc-page__photo-action {
    position: absolute;
    left: 50%;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;
    margin-left: -44rpx;
    margin-top: -44rpx;
    background: #0d7bf8;
    border-radius: 50%;
    box-shadow: 0 12rpx 28rpx rgba(13, 123, 248, 0.34);
}

.user-kyc-page__contract {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 34rpx;
    padding: 22rpx;
    background: linear-gradient(135deg, #f5f9ff 0%, #eef6ff 100%);
    border: 1rpx solid #e3edff;
    border-radius: 20rpx;
}

.user-kyc-page__contract-copy {
    flex: 1;
    min-width: 0;
}

.user-kyc-page__contract-title {
    color: #202020;
    font-size: 30rpx;
    line-height: 42rpx;
    font-weight: 700;
}

.user-kyc-page__contract-desc {
    margin-top: 8rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 34rpx;
}

.user-kyc-page__contract-status {
    flex: none;
    margin-left: 24rpx;
    padding: 10rpx 20rpx;
    color: #0d79f5;
    font-size: 24rpx;
    line-height: 34rpx;
    background: #ffffff;
    border-radius: 999rpx;
}

.user-kyc-page__contract-status.is-signed {
    color: #12a150;
    background: #eaf8f0;
}

.user-kyc-page__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 610rpx;
    height: 92rpx;
    margin: 32rpx auto 0;
    color: #ffffff;
    font-size: 34rpx;
    font-weight: 700;
    background: linear-gradient(180deg, #1986ff 0%, #0d79f5 100%);
    border-radius: 49rpx;
    box-shadow: 0 14rpx 30rpx rgba(17, 120, 239, 0.2);
}

@media screen and (max-width: 360px) {
    .user-kyc-page__hero-body {
        align-items: center;
    }

    .user-kyc-page__title {
        font-size: 44rpx;
        line-height: 56rpx;
    }

    .user-kyc-page__subtitle {
        font-size: 24rpx;
        line-height: 34rpx;
    }

    .user-kyc-page__illustration {
        width: 210rpx;
        height: 176rpx;
    }

    .user-kyc-page__sheet {
        margin-left: 16rpx;
        margin-right: 16rpx;
        padding-left: 20rpx;
        padding-right: 20rpx;
    }

    .user-kyc-page__photo-row {
        flex-direction: column;
    }

    .user-kyc-page__photo-card {
        height: 236rpx;
    }
}

.user-kyc-page__submit.is-disabled {
    opacity: 0.65;
}

.kyc-contract-popup {
    padding: 28rpx 28rpx calc(32rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    border-radius: 28rpx 28rpx 0 0;
}

.kyc-contract-popup__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 22rpx;
}

.kyc-contract-popup__title {
    color: #202020;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
}

.kyc-contract-popup__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54rpx;
    height: 54rpx;
    color: #667085;
    font-size: 44rpx;
    line-height: 54rpx;
}

.kyc-contract-popup__scroll {
    height: 640rpx;
    padding: 24rpx;
    box-sizing: border-box;
    background: #f8fafc;
    border-radius: 20rpx;
}

.kyc-contract-popup__section + .kyc-contract-popup__section {
    margin-top: 28rpx;
}

.kyc-contract-popup__section-title {
    color: #202020;
    font-size: 30rpx;
    line-height: 42rpx;
    font-weight: 700;
}

.kyc-contract-popup__paragraph {
    margin-top: 14rpx;
    color: #475467;
    font-size: 26rpx;
    line-height: 42rpx;
}

.kyc-contract-popup__bottom-tip {
    padding: 34rpx 0 10rpx;
    color: #98a2b3;
    font-size: 24rpx;
    line-height: 34rpx;
    text-align: center;
}

.kyc-contract-popup__notice {
    margin-top: 20rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 34rpx;
    text-align: center;
}

.kyc-contract-popup__button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 92rpx;
    margin-top: 18rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 700;
    background: linear-gradient(180deg, #1986ff 0%, #0d79f5 100%);
    border-radius: 46rpx;
    box-shadow: 0 14rpx 30rpx rgba(17, 120, 239, 0.2);
}

.kyc-contract-popup__button.is-disabled {
    color: #98a2b3;
    background: #edf1f7;
    box-shadow: none;
}

.wallet-mode {
    margin: 0;
}

.wallet-card--solid {
    margin: 24rpx;
    padding: 28rpx;
    color: #ffffff;
    background: linear-gradient(90deg, #1f7af4 0%, #5c8df1 100%);
    border-radius: 24rpx;
}

.wallet-card__label {
    font-size: 28rpx;
}

.wallet-card__amount {
    margin-top: 18rpx;
    font-size: 64rpx;
    font-weight: 600;
}

.wallet-card__line {
    height: 1rpx;
    margin: 24rpx 0;
    background: rgba(255, 255, 255, 0.26);
}

.wallet-card__withdraw {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 72rpx;
    margin-top: 24rpx;
    color: #1f7af4;
    font-size: 28rpx;
    font-weight: 600;
    border-radius: 36rpx;
    background: #ffffff;
}

.filter-box {
    margin: 0 24rpx 24rpx;
}

.is-plus {
    color: #1f7af4;
}

.info-block,
.field-box,
.switch-row {
    padding: 24rpx 28rpx;
}

.info-block__title,
.field-box__label {
    font-size: 28rpx;
    font-weight: 600;
    color: #222222;
}

.field-box__input {
    margin-top: 16rpx;
    height: 72rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    background: #f7f8fa;
    border-radius: 16rpx;
}

.switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 28rpx;
    color: #222222;
}

.album-grid {
    display: flex;
    flex-wrap: wrap;
    padding: 0 20rpx 20rpx;
}

.album-grid__item {
    width: calc(50% - 16rpx);
    margin: 0 8rpx 16rpx;
    height: 220rpx;
}

.record-row {
    padding: 24rpx 28rpx;
    margin-top: 0;
}

.record-row__title {
    font-size: 28rpx;
    font-weight: 600;
    color: #222222;
}

.payment-record-page {
    position: relative;
    min-height: 100vh;
    padding: 24rpx 24rpx 0;
}

.payment-filter-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99;
}

.payment-filter-modal__mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.48);
}

.payment-summary-card {
    overflow: hidden;
    padding: 28rpx 24rpx 20rpx;
    color: #ffffff;
    border-radius: 20rpx;
    background: linear-gradient(90deg, #0f83ff 0%, #6299ff 100%);
}

.payment-summary-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.payment-summary-card__title {
    font-size: 34rpx;
    font-weight: 600;
    line-height: 48rpx;
}

.payment-summary-card__filter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32rpx;
    height: 32rpx;
}

.payment-summary-card__filter-image {
    width: 32rpx;
    height: 32rpx;
}

.payment-summary-card__filter-icon {
    position: relative;
    width: 28rpx;
    height: 28rpx;
    margin-right: 4rpx;
}

.payment-summary-card__filter-icon-top {
    position: absolute;
    left: 2rpx;
    top: 0;
    width: 0;
    height: 0;
    border-left: 13rpx solid transparent;
    border-right: 13rpx solid transparent;
    border-bottom: 18rpx solid #d7e7ff;
}

.payment-summary-card__filter-icon-bottom {
    position: absolute;
    left: 11rpx;
    top: 16rpx;
    width: 6rpx;
    height: 12rpx;
    background: #d7e7ff;
    border-radius: 3rpx;
}

.payment-summary-card__filter-lines {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3rpx;
    width: 12rpx;
}

.payment-summary-card__filter-lines view {
    width: 100%;
    height: 2rpx;
    background: #d7e7ff;
    border-radius: 2rpx;
}

.payment-summary-card__stats {
    display: flex;
    align-items: stretch;
    margin-top: 34rpx;
}

.payment-summary-card__stat {
    flex: 1;
    min-width: 0;
}

.payment-summary-card__stat--right {
    text-align: right;
}

.payment-summary-card__stat-label {
    font-size: 24rpx;
    line-height: 34rpx;
    opacity: 0.95;
}

.payment-summary-card__stat-value {
    margin-top: 16rpx;
    font-size: 38rpx;
    font-weight: 600;
    line-height: 50rpx;
}

.payment-summary-card__divider {
    flex: none;
    width: 1rpx;
    margin: 8rpx 20rpx 0;
    background: rgba(255, 255, 255, 0.35);
}

.payment-summary-card__line {
    height: 1rpx;
    margin-top: 22rpx;
    background: rgba(255, 255, 255, 0.24);
}

.payment-summary-card__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
    font-size: 24rpx;
    line-height: 34rpx;
}

.payment-summary-card__row text:last-child {
    font-size: 32rpx;
    font-weight: 600;
}

.payment-record-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 180rpx;
}

.payment-record-empty__icon {
    position: relative;
    width: 260rpx;
    height: 220rpx;
}

.payment-record-empty__icon::before {
    content: '';
    position: absolute;
    left: 38rpx;
    top: 16rpx;
    width: 118rpx;
    height: 42rpx;
    background: #f1f3f7;
    border-radius: 42rpx;
    box-shadow: 54rpx 40rpx 0 -9rpx #eef1f6;
}

.payment-record-empty__card {
    position: absolute;
    left: 48rpx;
    top: 84rpx;
    width: 164rpx;
    height: 92rpx;
    background: linear-gradient(180deg, #eef1f5 0%, #dfe4eb 100%);
    border-radius: 16rpx;
    transform: rotate(-6deg);
}

.payment-record-empty__card::before {
    content: '';
    position: absolute;
    left: 24rpx;
    top: 24rpx;
    width: 92rpx;
    height: 10rpx;
    background: rgba(255, 255, 255, 0.86);
    border-radius: 10rpx;
    box-shadow: 0 24rpx 0 rgba(255, 255, 255, 0.68);
}

.payment-record-empty__card::after {
    content: '';
    position: absolute;
    right: -34rpx;
    bottom: -20rpx;
    width: 72rpx;
    height: 12rpx;
    background: #d7dde6;
    border-radius: 12rpx;
    transform: rotate(42deg);
}

.payment-record-empty__text {
    margin-top: 14rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #666666;
    line-height: 44rpx;
}

.payment-record-list {
    margin-top: 24rpx;
}

.payment-record-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 116rpx;
    padding: 24rpx;
    margin-bottom: 18rpx;
    background: #ffffff;
    border-radius: 20rpx;
    box-sizing: border-box;
}

.payment-record-item__main {
    flex: 1;
    min-width: 0;
}

.payment-record-item__title {
    color: #222222;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 40rpx;
}

.payment-record-item__time {
    margin-top: 10rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 34rpx;
}

.payment-record-item__amount {
    flex: none;
    margin-left: 24rpx;
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
}

.payment-filter-page {
    position: relative;
    min-height: 100vh;
    background: rgba(0, 0, 0, 0.48);
}

.payment-filter-page__backdrop {
    padding: 24rpx 24rpx 0;
}

.wallet-mode--ghost {
    margin: 0;
    opacity: 0.56;
    transform: scale(0.985);
    transform-origin: top center;
    pointer-events: none;
}

.payment-filter-sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 26rpx 28rpx 32rpx;
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
}

.payment-filter-sheet__head {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 84rpx;
}

.payment-filter-sheet__title {
    font-size: 34rpx;
    font-weight: 600;
    color: #222222;
    line-height: 48rpx;
}

.payment-filter-sheet__close {
    position: absolute;
    right: 0;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    transform: translateY(-50%);
}

.payment-filter-sheet__search {
    display: flex;
    align-items: center;
    height: 74rpx;
    padding: 0 24rpx;
    margin-top: 4rpx;
    background: #f4f4f4;
    border-radius: 37rpx;
}

.payment-filter-sheet__search-icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 40rpx;
    margin-right: 8rpx;
}

.payment-filter-sheet__search-placeholder {
    font-size: 26rpx;
    color: #b7b7b7;
    line-height: 36rpx;
}

.payment-filter-sheet__section {
    margin-top: 30rpx;
}

.payment-filter-sheet__section-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #222222;
    line-height: 48rpx;
}

.payment-filter-sheet__option-row,
.payment-filter-sheet__status-row {
    display: flex;
    flex-wrap: wrap;
    margin-top: 24rpx;
}

.payment-filter-sheet__option {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 92rpx;
    font-size: 30rpx;
    color: #222222;
    background: #f4f4f4;
    border-radius: 8rpx;
}

.payment-filter-sheet__option-row--two .payment-filter-sheet__option {
    width: calc((100% - 34rpx) / 2);
    margin-left: 34rpx;
}

.payment-filter-sheet__option-row--two .payment-filter-sheet__option:nth-child(2n + 1) {
    margin-left: 0;
}

.payment-filter-sheet__option-row--three .payment-filter-sheet__option {
    width: calc((100% - 68rpx) / 3);
    margin-left: 34rpx;
}

.payment-filter-sheet__option-row--three .payment-filter-sheet__option:nth-child(3n + 1) {
    margin-left: 0;
}

.payment-filter-sheet__option--active {
    color: #ffffff;
    background: #0f83ff;
}

.payment-filter-sheet__date-row {
    display: flex;
    align-items: center;
    margin-top: 24rpx;
}

.payment-filter-sheet__date-field {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90rpx;
    color: #c4c4c4;
    font-size: 28rpx;
    background: #f4f4f4;
    border-radius: 8rpx;
}

.payment-filter-sheet__date-separator {
    margin: 0 16rpx;
    color: #666666;
    font-size: 28rpx;
    line-height: 40rpx;
}

.payment-filter-sheet__picker {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
    padding-top: 18rpx;
    border-top: 1rpx solid #ededed;
}

.payment-filter-sheet__picker-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.payment-filter-sheet__picker-item {
    width: 100%;
    padding: 18rpx 0;
    text-align: center;
    font-size: 28rpx;
    color: #c6c6c6;
    line-height: 40rpx;
}

.payment-filter-sheet__picker-item--active {
    color: #222222;
    border-top: 1rpx solid #ededed;
    border-bottom: 1rpx solid #ededed;
}

.payment-filter-sheet__actions {
    display: flex;
    align-items: center;
    margin-top: 28rpx;
}

.payment-filter-sheet__action {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    flex: 1;
    margin-left: 26rpx;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
    background: #0f83ff;
    border-radius: 44rpx;
}

.payment-filter-sheet__action--ghost {
    color: #0f83ff;
    background: #edf5ff;
    border: 2rpx solid #0f83ff;
    margin-left: 0;
}
</style>
