<template>
    <view
        :class="[
            'business-scene',
            scene === 'user-kyc' ? 'business-scene--user-kyc' : '',
            scene === 'feedback' ? 'business-scene--feedback' : '',
            scene === 'about-us' ? 'business-scene--about-us' : '',
            scene === 'activity-center' ? 'business-scene--activity-center' : '',
            scene === 'activity-exchange' ? 'business-scene--activity-exchange' : '',
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
                            <view :class="['user-kyc-page__photo-card', 'user-kyc-page__photo-card--front', kycForm.certFrontPreview ? 'is-filled' : '']" @tap="chooseKycImage('front')">
                                <image class="user-kyc-page__photo-image" :src="kycForm.certFrontPreview || left_icon" mode="aspectFit"></image>
                                <image v-if="!kycForm.certFrontPreview" class="user-kyc-page__photo-add" :src="icon_conter" mode="aspectFit"></image>
                            </view>
                            <view :class="['user-kyc-page__photo-card', 'user-kyc-page__photo-card--back', kycForm.certBackPreview ? 'is-filled' : '']" @tap="chooseKycImage('back')">
                                <image class="user-kyc-page__photo-image" :src="kycForm.certBackPreview || right_icon" mode="aspectFit"></image>
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

                        <view v-if="canShowKycSubmit" :class="['user-kyc-page__submit', kycSubmitting || !canEditKyc ? 'is-disabled' : '']" @tap="submitKycForm">{{ kycSubmitText }}</view>
                        </template>
                    </view>
                </view>
            </template>

            <template v-if="scene === 'feedback'">
                <view class="feedback-page">
                    <view class="feedback-hero">
                        <view class="feedback-hero__top">
                            <view class="feedback-back" @tap="goBack"></view>
                            <view class="feedback-capsule">
                                <view class="feedback-capsule__dot"></view>
                                <view class="feedback-capsule__divider"></view>
                                <view class="feedback-capsule__circle"></view>
                            </view>
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
                    <view class="face-pay-hero">
                        <view>
                            <view class="face-pay-hero__title">核销线下订单</view>
                            <view class="face-pay-hero__desc">仅支持已支付自提订单，请核对订单信息后操作。</view>
                        </view>
                        <view class="face-pay-hero__badge">自提核销</view>
                    </view>
                    <view class="face-pay-scan-card" @tap="scanFacePayCode">
                        <view class="face-pay-scan-card__icon">
                            <u-icon name="scan" color="#ffffff" size="66"></u-icon>
                        </view>
                        <view>
                            <view class="face-pay-scan-card__title">扫码核销</view>
                            <view class="face-pay-scan-card__desc">扫描用户订单详情中的核销二维码</view>
                        </view>
                    </view>
                    <view class="face-pay-code-card" v-if="facePayCode">
                        <view>
                            <view class="face-pay-code-card__label">当前核销码</view>
                            <view class="face-pay-code-card__value">{{ facePayCode }}</view>
                            <view class="face-pay-code-card__sub" v-if="facePaySubOrderNo">子订单号：{{ facePaySubOrderNo }}</view>
                        </view>
                        <view class="face-pay-code-card__clear" @tap="clearFacePayForm">清空</view>
                    </view>
                    <view class="face-pay-form">
                        <view class="face-pay-form__title">手动核销</view>
                        <view class="face-pay-field">
                            <text class="face-pay-field__label">核销码</text>
                            <input v-model="facePayCode" class="face-pay-field__input" placeholder="请输入用户订单核销码" />
                        </view>
                        <view class="face-pay-field">
                            <text class="face-pay-field__label">子订单号</text>
                            <input v-model="facePaySubOrderNo" class="face-pay-field__input" placeholder="二维码未包含时可不填" />
                        </view>
                    </view>
                    <view :class="['face-pay-submit', !facePayCode ? 'face-pay-submit--disabled' : '']" @tap="submitFacePay">{{ facePaySubmitting ? '核销中...' : '确认核销' }}</view>
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
                            <view class="store-detail-hero__share" @tap="showStoreSharePopup = true">
                                <view class="store-detail-hero__share-dot"></view>
                                <view class="store-detail-hero__share-divider"></view>
                                <view class="store-detail-hero__share-circle"></view>
                            </view>
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
                                    <text
                                        v-for="starIndex in 5"
                                        :key="starIndex"
                                        class="store-detail-summary-card__star"
                                    >★</text>
                                </view>
                                <text class="store-detail-summary-card__score">{{ storeDetailView.shopScore }}</text>
                            </view>
                            <view class="store-detail-summary-card__time-row">
                                <view class="store-detail-summary-card__time-icon"></view>
                                <text class="store-detail-summary-card__time line1">{{ storeDetailBusinessHoursText }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="store-detail-address-card" @tap="openStoreDetailMap">
                        <image class="store-detail-address-card__icon" :src="storeDetailAddressIcon" mode="aspectFit"></image>
                        <text class="store-detail-address-card__text line1">{{ storeDetailView.detailAddress }}</text>
                    </view>

                    <view :class="['store-detail-tabs', storeDetailActiveTab === 'group' ? 'store-detail-tabs--group' : '']">
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
                        <view class="store-detail-pay-btn" @tap="openStoreVerify">到店付款</view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'group'" class="store-detail-group-panel">
                        <view v-if="storeDetailGroupCategories.length" class="store-detail-category-card">
                            <view
                                v-for="(item, index) in storeDetailGroupCategories"
                                :key="item.key"
                                :class="['store-detail-category-item', index === 0 ? 'store-detail-category-item--active' : '']"
                            >
                                <view class="store-detail-category-item__thumb">
                                    <image v-if="!isEmptyImage(item.image)" class="store-detail-category-item__image" :src="item.image" mode="aspectFill"></image>
                                </view>
                                <view class="store-detail-category-item__name line1">{{ item.name }}</view>
                            </view>
                        </view>
                        <view class="store-detail-group-list">
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
                                            <text
                                                v-for="starIndex in 5"
                                                :key="starIndex"
                                                class="store-detail-group-card__star"
                                            >★</text>
                                        </view>
                                        <text class="store-detail-group-card__score">{{ item.scoreText }}</text>
                                    </view>
                                    <view class="store-detail-group-card__price">
                                        <text class="store-detail-group-card__price-value">{{ item.priceText }}</text>
                                        <text v-if="item.marketPriceText" class="store-detail-group-card__market-price">{{ item.marketPriceText }}</text>
                                    </view>
                                </view>
                                <view class="store-detail-quantity" @tap.stop.prevent>
                                    <view class="store-detail-quantity__btn store-detail-quantity__btn--minus"></view>
                                    <view class="store-detail-quantity__value">1</view>
                                    <view class="store-detail-quantity__btn store-detail-quantity__btn--plus"></view>
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
                        <view class="store-detail-order-bar">
                            <view class="store-detail-order-bar__label">合计金额：</view>
                            <view class="store-detail-order-bar__price">{{ storeDetailGroupTotalText }}</view>
                            <view class="store-detail-order-bar__button">确认下单</view>
                        </view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'album'" class="store-detail-album-panel">
                        <view class="store-detail-album-section">
                            <view class="store-detail-album-section__title">商家</view>
                            <view v-if="storeDetailDisplayAlbumImages.length" class="store-detail-album-grid">
                                <view
                                    v-for="(item, index) in storeDetailDisplayAlbumImages"
                                    :key="index"
                                    class="store-detail-album-card"
                                    @tap="previewStoreDetailAlbum(index)"
                                >
                                    <image class="store-detail-album-card__image" :src="item.url" mode="aspectFill"></image>
                                </view>
                            </view>
                        </view>
                        <view class="store-detail-album-section">
                            <view class="store-detail-album-section__title">营业执照</view>
                            <view
                                v-if="storeDetailLicenseImage"
                                class="store-detail-license-card"
                                @tap="previewStoreDetailLicense"
                            >
                                <image class="store-detail-license-card__image" :src="storeDetailLicenseImage" mode="aspectFill"></image>
                            </view>
                        </view>
                        <view v-if="!storeDetailDisplayAlbumImages.length && !storeDetailLicenseImage" class="store-detail-media-empty">
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
                                <view class="store-detail-video-card__duration">{{ item.durationText }}</view>
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
                                <text v-for="item in 3" :key="item" class="qr-shop-card__star">★</text>
                                <text class="qr-shop-card__score">{{ qrShopInfo.score }}</text>
                            </view>
                            <view class="qr-shop-card__time">
                                <view class="qr-shop-card__time-icon"></view>
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
                                <view class="street-search__icon-lens"></view>
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
                            <view v-if="!streetCategories.length" class="store-detail-media-empty">
                                <view class="store-detail-media-empty__title">暂无分类</view>
                                <view class="store-detail-media-empty__desc">分类信息更新中</view>
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
                                    <view class="street-merchant-card__rating" v-if="item.score">
                                        <view class="street-merchant-card__stars">
                                            <text
                                                v-for="starIndex in item.starCount"
                                                :key="starIndex"
                                                class="street-merchant-card__star"
                                            >★</text>
                                        </view>
                                        <text class="street-merchant-card__score">{{ item.score }}</text>
                                    </view>
                                    <view class="street-merchant-card__time-row">
                                        <view class="street-merchant-card__time-icon"></view>
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
                            <view class="search-shell__icon-lens"></view>
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
                                <view v-if="item.meta || item.shopName" class="merchant-list__time line1">{{ item.meta || item.shopName }}</view>
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
                        <view class="intro-card-title">推广二维码</view>
                        <view class="intro-card-capsule">
                            <view class="intro-card-capsule__dot"></view>
                            <view class="intro-card-capsule__divider"></view>
                            <view class="intro-card-capsule__circle"></view>
                        </view>
                    </view>

                    <view class="intro-card-panel">
                        <image class="intro-card-panel-bg" src="https://shengyuan.store/api/miniapp/files/miniapp/4a6ec42c3ad54de8a47300fb1a79d820/intro-card-panel-bg.png" mode="scaleToFill"></image>
                        <view class="intro-card-user">
                            <image class="intro-card-avatar" :src="introCardInfo.avatar" mode="aspectFill"></image>
                            <view class="intro-card-info">
                                <view class="intro-card-name">{{ introCardNicknameText }}</view>
                                <view class="intro-card-line">
                                    <text class="intro-card-line__text">ID:{{ introCardUserNoText }}</text>
                                    <image class="intro-card-copy" :src="introCardCopyIcon" mode="aspectFit" @tap="copyIntroCardText(introCardInfo.userNo)"></image>
                                </view>
                                <view class="intro-card-line intro-card-line--account">
                                    <text class="intro-card-line__text">账户:{{ introCardCodeText }}</text>
                                    <image class="intro-card-copy" :src="introCardCopyIconAlt" mode="aspectFit" @tap="copyIntroCardText(introCardInfo.code)"></image>
                                </view>
                            </view>
                        </view>
                        <view class="intro-card-qr intro-card-qr--code">
                            <tki-qrcode v-if="introCardQrValue" cid="intro-card-qrcode" :val="introCardQrValue" :size="360" :onval="true" :load-make="true" :show-loading="false"></tki-qrcode>
                            <view v-else class="intro-card-qr-empty">待生成</view>
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
                                <view
                                    :class="['recent-visits-btn', item.subscribed ? 'recent-visits-btn--subscribed' : '']"
                                    :data-visit-index="index"
                                    :data-shop-id="item.shopId || item.shop_id || item.id"
                                    @tap.stop="toggleRecentVisitSubscribeByEvent"
                                >
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
                                {{ formatPaymentRecordAmountWithSign(item) }}
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
                                <view class="wallet-card__amount">{{ walletAccountAmountText || '--' }}</view>
                                <view class="wallet-card__line"></view>
                                <view class="wallet-card__row">
                                    <text>可提现金额</text>
                                    <text>{{ walletWithdrawAmountText || '--' }}</text>
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
                        <view class="wallet-card__amount">{{ walletAccountAmountText || '--' }}</view>
                        <view class="wallet-card__line"></view>
                        <view class="wallet-card__row">
                            <text>可提现金额</text>
                            <text>{{ walletWithdrawAmountText || '--' }}</text>
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

            <template v-else-if="scene === 'activity-exchange'">
                <view class="activity-exchange-page">
                    <view class="activity-exchange-hero">
                        <view class="activity-exchange-status"></view>
                        <view class="activity-exchange-nav">
                            <view class="activity-exchange-back" @tap="goBack"></view>
                            <view class="activity-exchange-title">积分兑换能量</view>
                            <view class="activity-exchange-capsule">
                                <view class="activity-exchange-capsule__dot"></view>
                                <view class="activity-exchange-capsule__divider"></view>
                                <view class="activity-exchange-capsule__circle"></view>
                            </view>
                        </view>

                        <view class="activity-exchange-summary">
                            <view class="activity-exchange-label">积分总数</view>
                            <view class="activity-exchange-points">{{ activityExchangePoints }}</view>
                            <view class="activity-exchange-desc">积分使用说明：1积分=0.08元/0.125能量</view>
                        </view>

                        <view class="activity-exchange-form">
                            <view class="activity-exchange-input"></view>
                            <button class="activity-exchange-button" @tap="openActivityExchange">兑换能量</button>
                        </view>
                    </view>

                    <view class="activity-exchange-body">
                        <view class="activity-exchange-rule">
                            <view class="activity-exchange-rule__title">积分规则</view>
                            <view class="activity-exchange-rule__content">
                                <text>1 线上订单在确认收货后立即到账，未及时确认收货的订单，</text>
                                <text>将在15天后自动确认收货，并且积分自动到账。</text>
                                <text>2 线下成功消费的订单，积分立即自动到账</text>
                            </view>
                        </view>
                        <button class="activity-exchange-detail" @tap="goPage('/bundle_misc/pages/sign_detail/sign_detail')">积分明细</button>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'about-us'">
                <view class="about-us-page">
                    <view class="about-us-hero">
                        <view class="about-us-topbar">
                            <view class="about-us-back" @tap="goBack"></view>
                            <view class="about-us-capsule">
                                <view class="about-us-capsule__dot"></view>
                                <view class="about-us-capsule__divider"></view>
                                <view class="about-us-capsule__circle"></view>
                            </view>
                        </view>
                        <image class="about-us-logo" :src="aboutLogo" mode="aspectFit"></image>
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
                    scene === 'eco-app'
                "
            >
                <view class="card">
                    <view class="section-title">{{ sceneConfig.subtitle }}</view>
                    <view v-if="!sceneConfig.items.length" class="empty-text">暂无可展示内容</view>
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
import { mapGetters } from 'vuex'
import TkiQrcode from '@/business/components/tki-qrcode/tki-qrcode.vue'
import { getShopDetail, getShopGroupBuy, getStreetGoods, getStreetIndex } from '@/api/store'
import { getRecentVisitShops, subscribeShop } from '@/api/app'
import { version, baseURL, basePath } from '@/config/app'
import { getAccountLog, getInviteInfo, getKycStatus, getPaymentRecords, getPromotionInviteCode, submitFeedback, submitKyc } from '@/api/user'
import { merchantVerifyOrder } from '@/api/order'
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
            facePaySubOrderNo: '',
            facePaySubmitting: false,
			feedbackHeroImage: 'https://shengyuan.store/api/miniapp/files/miniapp/c860e9e880ac44709ba98fb0844390c9/17e52b5f7f7af0e92c09f57bd56f679e.png',
			feedbackUploadIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/e5d8d8724ebd49afbb6a747ff66f8d09/feedback-upload-icon.png',
			paymentRecordFilterIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/bc6f6d87035c4c24923a1b29379ab7c7/b2636d4f8db726053805211c9457c120.png',
			aboutArrowIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/6dcc63c37e6943bdbcf59e36cbe1ec28/d35bb9407ef16b8d704effe295ad7e27.png',
			aboutLogo: 'https://shengyuan.store/api/miniapp/files/miniapp/9a00ed2e7a714b19ab4e1cfc4b825665/____________LOGO_2.png',
			introCardCopyIcon: 'https://shengyuan.store/api/miniapp/files/miniapp/62f0790376274645b017cc64e7cae6b8/intro-card-copy-icon.png',
			introCardCopyIconAlt: 'https://shengyuan.store/api/miniapp/files/miniapp/0d49e91085034160aa0280bd63f498cb/intro-card-copy-alt-icon.png',
			introCardInfo: {
                nickname: '',
                userNo: '',
                code: '',
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
                { title: 'Cookie政策', url: '/bundle_user/pages/server_explan/server_explan?type=3' },
                { title: '反洗钱与反恐融资政策', url: '/bundle_user/pages/server_explan/server_explan?type=4' },
                { title: '服务条款', url: '/bundle_user/pages/server_explan/server_explan?type=0' },
                { title: '关于我们', action: 'version' },
                { title: '隐私政策', url: '/bundle_user/pages/server_explan/server_explan?type=1' },
                { title: '消费者常见问题', url: '/bundle_user/pages/server_explan/server_explan?type=2' },
                { title: '商家常见问题', action: 'contact' }
            ],
            activityCenterItems: [],
            recentVisitItems: [],
            pendingPaymentItems: [],
            albumImages: [
                ...designAssetList.sceneAlbum
            ],
            merchantList: [],
            storeDetailAddressIcon: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp/78a66305c5c34a91bc0c6b60f8198b6f/store-address-icon.png'),
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
            streetSearchText: '输入关键词',
            streetKeyword: '',
            listKeyword: '',
            streetGoodsLoadKey: '',
            streetGoodsLoading: false,
            streetLoaded: false,
            navigating: false,
            streetMerchants: [],
            streetCategories: [],
            walletRecords: [],
            paymentRecordSummary: {
                totalAmount: '',
                totalCount: '',
                fiatAmount: ''
            },
            paymentRecordList: [],
            showPaymentFilter: false,
            paymentStatusOptions: [
                { label: '全部', active: false },
                { label: '未支付', active: false },
                { label: '已支付', active: true }
            ],
            sceneMap: {
                feedback: {
                    title: '意见反馈',
                    subtitle: '请告诉我们遇到的问题',
                    buttonText: '提交'
                },
                'face-pay': {
                    title: '核销线下订单'
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
                    items: []
                },
                'activity-exchange': {
                    title: '活动中心-兑换',
                    subtitle: '积分兑换',
                    buttonText: '立即兑换',
                    items: []
                },
                'activity-center': {
                    title: '活动中心',
                    subtitle: '热门活动',
                    buttonText: '立即参与',
                    items: []
                },
                'intro-card': {
                    title: '介绍名片',
                    subtitle: '商家名片',
                    buttonText: '保存名片',
                    items: []
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
                    items: []
                },
                'user-kyc': {
                    title: '用户KYC',
                    subtitle: '实名认证',
                    buttonText: '提交申请',
                    items: []
                }
            }
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        isFullScene() {
            return this.scene === 'street' || this.scene === 'store-detail' || this.scene === 'store-qr' || this.scene === 'goods-qr' || this.scene === 'user-kyc' || this.scene === 'feedback' || this.scene === 'about-us' || this.scene === 'activity-center' || this.scene === 'activity-exchange' || this.scene === 'intro-card' || this.scene === 'recent-visits'
        },
        sceneConfig() {
            return this.sceneMap[this.scene] || this.sceneMap.feedback
        },
        activityExchangePoints() {
            const info = this.userInfo || {}
            const value = info.user_integral ?? info.userIntegral ?? info.availablePoints ?? info.available_points ?? info.points ?? ''
            if (value === undefined || value === null || value === '') return '待确认'
            const number = Number(value)
            if (Number.isNaN(number) || !Number.isFinite(number)) return '待确认'
            return number % 1 === 0 ? String(number) : number.toFixed(2)
        },
        walletAccountAmountText() {
            const info = this.userInfo || {}
            const value = this.firstValidValue([
                info.fiatAmount,
                info.fiat_amount,
                info.rmbAmount,
                info.rmb_amount,
                info.user_money,
                info.userMoney,
                info.money,
                info.balance
            ])
            return this.formatOptionalCurrency(value)
        },
        walletWithdrawAmountText() {
            const info = this.userInfo || {}
            const value = this.firstValidValue([
                info.withdrawAmount,
                info.withdraw_amount,
                info.availableWithdrawAmount,
                info.available_withdraw_amount,
                info.canWithdrawAmount,
                info.can_withdraw_amount,
                info.fiatWithdrawAmount,
                info.fiat_withdraw_amount,
                info.user_money,
                info.userMoney,
                info.money,
                info.balance
            ])
            return this.formatOptionalCurrency(value)
        },
        paymentDateColumns() {
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth() + 1
            const day = now.getDate()
            return {
                years: [year - 2, year - 1, year].map(item => ({
                    label: `${item}年`,
                    active: item === year
                })),
                months: this.makeCenteredDateColumn(month, 12, '月'),
                days: this.makeCenteredDateColumn(day, new Date(year, month, 0).getDate(), '日')
            }
        },
        aboutAppVersion() {
            return version || '1.0.0'
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
        canShowKycSubmit() {
            return this.canEditKyc || this.kycSubmitting
        },
        kycSubmitText() {
            if (this.kycSubmitting) return '提交中...'
            if (!this.canEditKyc) return this.kycStatusText || '已提交'
            return this.kycStatusClass === 'is-error' ? '重新提交' : '提交申请'
        },
        kycContractTitle() {
            return '钥岫商城入驻经营者审核要求及经营规范'
        },
        kycContractSections() {
            return [
                {
                    title: '一、审核目标与基本原则',
                    paragraphs: [
                        '真实主体：核验商家身份、营业执照、联系人、门店地址、收款账户及实际经营情况。',
                        '合法经营：特殊行业应依法取得许可证、备案证明或其他资质。',
                        '资料完整：商家展示信息、商品服务信息、价格活动、图片素材及售后规则应完整、准确、可追溯。',
                        '风险分级：对餐饮食品、美容养生、医疗健康、教育培训、金融相关、特种服务等行业实行更高审核标准。',
                        '动态管理：入驻不是一次性审核，平台有权定期或不定期复核商家资质和经营内容。'
                    ]
                },
                {
                    title: '二、入驻资料与审核流程',
                    paragraphs: [
                        '入驻主体应提交营业执照、法人或经营者身份证明、联系人姓名与电话、门店照片、门店地址、营业时间、商品或服务资料、行业资质许可、收款结算资料及平台要求的承诺文件。',
                        '平台将依次进行资料初审、行业风险识别、页面内容审核、签约确认、上线展示和动态复核。资料不完整的，平台可一次性告知补正；未签署或未确认平台规则的，不得上线经营。'
                    ]
                },
                {
                    title: '三、经营规范',
                    paragraphs: [
                        '商家应确保门店名称、地址、电话、营业时间、商品服务、价格、库存、有效期、预约规则、使用限制等信息真实、准确、及时更新。',
                        '促销、优惠、积分抵扣、套餐、团购、扫码点餐等活动，应清晰说明使用条件、有效期限、不可用情形、退款规则和特别限制。',
                        '商家不得发布违法违规商品、假冒伪劣商品、侵权商品、非法金融产品、博彩服务、传销相关内容、虚假医疗美容服务或其他平台禁止内容。',
                        '商家不得超出订单履约和售后服务所必需的范围收集、使用、保存或对外提供消费者个人信息。'
                    ]
                },
                {
                    title: '四、违规处理与签署确认',
                    paragraphs: [
                        '对于资料不完整、虚假宣传、服务争议频发、伪造资质、违法商品、食品安全重大风险、侵权、骗补、恶意交易等情形，平台可采取提醒、限期补正、下架内容、限制活动、暂停推广、延迟结算、暂停店铺、终止合作、冻结相关款项、扣回权益、移送有关机关等处理措施。',
                        '申请人滑动阅读至底部并点击确认签署，即表示已充分阅读、理解并同意《钥岫商城入驻经营者审核要求及经营规范》及平台相关规则，愿意按规则提交申请并接受后续审核。'
                    ]
                }
            ]
        },
        storeDetailView() {
            const shopBase = this.storeDetailData.shopBase || {}
            return {
                shopId: shopBase.shopId || '',
                merchantId: shopBase.merchantId || shopBase.merchant_id || this.storeDetailData.merchantId || this.storeDetailData.merchant_id || '',
                ownerUserId: shopBase.ownerUserId || shopBase.owner_user_id || shopBase.userId || shopBase.user_id || this.storeDetailData.ownerUserId || this.storeDetailData.owner_user_id || this.storeDetailData.userId || this.storeDetailData.user_id || '',
                inviteCode: shopBase.inviteCode || shopBase.invite_code || shopBase.promoterCode || shopBase.promoter_code || this.storeDetailData.inviteCode || this.storeDetailData.invite_code || this.storeDetailData.promoterCode || this.storeDetailData.promoter_code || '',
                shopName: shopBase.shopName || '店铺待确认',
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
        isStoreDetailPreview() {
            const options = this.getCurrentPageOptions()
            return options.preview === '1' || options.preview === 'true'
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
            const price = this.stripStoreDetailPriceSymbol(this.formatStoreDetailPriceText(options.price || options.minPrice || this.getStoreDetailGroupPriceValue(firstGroup)))
            const [main, decimal = '00'] = String(price).split('.')
            return {
                id: options.goodsId || options.goods_id || options.id || this.storeDetailGroupProducts[0]?.goods_id || '',
                image: resolveImage(options.image || this.storeDetailGroupProducts[0]?.image || '', 'goods'),
                priceMain: main || '',
                priceDecimal: main ? `.${decimal}` : ''
            }
        },
        qrStoreValue() {
            return this.storeShareUrl()
        },
        qrGoodsValue() {
            return `${baseURL}${this.goodsQrLink()}`
        },
        storeDetailHeroImage() {
            if (this.isStoreDetailPreview) return resolveImage('', 'shop')
            const image = this.storeDetailData.albums?.[0]?.url || this.storeDetailData.cover || this.storeDetailData.image || this.storeDetailData.mainImageUrl || ''
            return image ? resolveImage(image, 'goods') : this.storeDetailView.shopLogo
        },
        storeDetailCardImage() {
            return this.storeDetailView.shopLogo || this.storeDetailHeroImage
        },
        storeDetailContentImage() {
            if (this.isStoreDetailPreview) return resolveImage('', 'shop')
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
        storeDetailDisplayAlbumImages() {
            if (this.storeDetailAlbumImages.length) return this.storeDetailAlbumImages
            return this.albumImages.map((url, index) => ({
                id: `fallback-${index}`,
                url
            })).filter(item => item.url).slice(0, 3)
        },
        storeDetailLicenseImage() {
            const image = this.storeDetailData.licenseImage || this.storeDetailData.license_image || this.storeDetailData.businessLicense || this.storeDetailData.business_license || this.storeDetailData.businessLicenseImage || this.storeDetailData.licenseUrl || this.storeDetailData.license_url || ''
            return image ? resolveImage(image, 'shop') : ''
        },
        storeDetailVideos() {
            return (this.storeDetailData.videos || [])
                .map((item, index) => ({
                    ...item,
                    id: item.id || index,
                    title: item.title || item.name || '',
                    cover: item.cover || item.image || this.storeDetailHeroImage,
                    url: item.url || item.videoUrl || item.video || '',
                    durationText: this.formatStoreDetailVideoDuration(item.duration || item.durationText || item.duration_text || item.videoDuration || item.video_duration)
                }))
                .filter(item => item.cover || item.url)
        },
        storeDetailDisplayComments() {
            const comments = this.storeDetailData.comments || this.storeDetailData.commentList || this.storeDetailData.reviews || []
            return comments.map((item, index) => ({
                ...item,
                id: item.id || item.commentId || item.reviewId || index,
                name: item.name || item.nickname || item.userName || item.memberName || '',
                date: item.date || item.create_time || item.createdAt || item.createTime || '',
                content: item.content || item.comment || item.reviewContent || item.remark || '',
                avatar: item.avatar || item.userAvatar || item.headimgurl || ''
            })).filter(item => item.name || item.content || item.avatar)
        },
        storeDetailBusinessHoursText() {
            const statusText = this.getStreetOpenStatusLabel(this.storeDetailView.openStatus, this.storeDetailView.businessHours)
            if (this.storeDetailView.businessHours) {
                return `${statusText || '营业时间'}：${this.storeDetailView.businessHours}`
            }
            return statusText || '营业时间待更新'
        },
        storeShareTimeTextClass() {
            return String(this.storeDetailBusinessHoursText || '').length > 16 ? 'is-long' : ''
        },
        storeDetailTabs() {
            const albumCount = this.storeDetailData.albums?.length || 0
            const videoCount = this.storeDetailVideos.length
            return [
                { key: 'detail', label: '商家详情', active: this.storeDetailActiveTab === 'detail' },
                { key: 'group', label: '产品', active: this.storeDetailActiveTab === 'group', count: this.storeDetailGroupProducts.length },
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
                name: this.resolveStoreDetailGroupName(item),
                image: resolveImage(item.image || item.goods_image || item.cover || item.mainImageUrl, 'goods'),
                meta: item.meta || item.subTitle || item.subtitle || item.summary || item.desc || item.description || item.goods_desc || item.goodsDesc || item.activityDesc || item.activity_desc || '',
                tagText: item.tagText || item.tag_text || item.activityTag || item.activity_tag || item.label || item.labelText || '',
                infoText: this.getStoreDetailGroupInfoText(item),
                scoreText: this.getStoreDetailGroupScoreText(item),
                priceText: this.formatStoreDetailPriceText(this.getStoreDetailGroupPriceValue(item)),
                marketPriceText: this.formatStoreDetailMarketPriceText(item.marketPriceText || item.market_price_text || item.originPriceText || item.origin_price_text || item.originalPriceText || item.original_price_text || item.marketPrice || item.market_price || item.originPrice || item.origin_price || item.originalPrice || item.original_price)
            }))
        },
        storeDetailGroupCategories() {
            const categories = this.storeDetailData.groupCategories || this.storeDetailData.categories || this.storeDetailData.goodsCategories || []
            const source = categories.length ? categories : this.storeDetailGroupProducts.slice(0, 2)
            return source.map((item, index) => ({
                key: String(item.id || item.categoryId || item.category_id || item.key || index),
                name: item.name || item.categoryName || item.category_name || item.title || item.goods_name || item.goodsName || '',
                image: resolveImage(item.image || item.cover || item.icon || item.goods_image || item.mainImageUrl || '', 'goods')
            }))
        },
        storeDetailGroupTotalText() {
            const first = this.storeDetailGroupProducts[0]
            if (!first) return ''
            return first.priceText || this.formatStoreDetailPriceText(this.getStoreDetailGroupPriceValue(first))
        },
        storeDetailPayUrl() {
            return ''
        },
        introCardNicknameText() {
            return this.introCardInfo.nickname || '昵称待完善'
        },
        introCardUserNoText() {
            return this.introCardInfo.userNo || 'ID待生成'
        },
        introCardCodeText() {
            return this.introCardInfo.code || '推广码待生成'
        },
        introCardQrValue() {
            const code = this.introCardInfo.code || ''
            const ownerUserId = this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || this.introCardInfo.userId || this.introCardInfo.user_id || ''
            if (!code && !ownerUserId) return ''
            return JSON.stringify({
                type: 'PROMOTION_QR',
                scene: 'PROMOTION_QR',
                inviteCode: code,
                promoterUserId: ownerUserId,
                ownerUserId,
                roleCode: 'PROMOTER'
            })
        },
        introCardStats() {
            return []
        },
        filteredMerchantList() {
            const keyword = (this.listKeyword || '').trim().toLowerCase()
            if (!keyword) return this.merchantList
            return this.merchantList.filter(item => {
                const name = (item.name || item.shopName || item.goods_name || '').toLowerCase()
                return name.includes(keyword)
            })
        },
        merchantIdForVerify() {
            const options = this.getCurrentPageOptions()
            return options.merchantId || options.merchant_id || options.shopId || options.shop_id || this.storeDetailView.shopId || this.storeDetailData.merchantId || this.storeDetailData.merchant_id || this.userInfo.merchantId || this.userInfo.merchant_id || this.userInfo.shopId || this.userInfo.shop_id || ''
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
                    this.loadIntroCard()
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
        firstValidValue(values = []) {
            return values.find(value => value !== '' && value !== null && value !== undefined)
        },
        formatOptionalCurrency(value) {
            if (value === '' || value === null || value === undefined) return ''
            const text = String(value).trim()
            if (!text) return ''
            if (/^[¥￥]/.test(text)) return text.replace(/^￥/, '¥')
            const amount = Number(text)
            if (Number.isNaN(amount)) return text
            return `¥${Number.isInteger(amount) ? String(amount) : amount.toFixed(2)}`
        },
        makeCenteredDateColumn(value, max, suffix) {
            const start = Math.max(1, Math.min(value - 2, max - 4))
            return Array.from({ length: Math.min(5, max) }, (_, index) => {
                const current = start + index
                return {
                    label: `${current}${suffix}`,
                    active: current === value
                }
            })
        },
        resolveStoreDetailGroupName(item = {}) {
            const activity = item.activity || item.groupBuyActivity || item.groupActivity || {}
            const product = item.product || item.spu || item.goods || item.goodsInfo || item.productInfo || item.spuInfo || activity.product || activity.spu || activity.goods || {}
            const realName = product.goodsName || product.goods_name || product.spuName || product.spu_name || product.productName || product.product_name || product.name || product.title || item.goodsName || item.goods_name || item.spuName || item.spu_name || item.productName || item.product_name
            if (realName) return realName
            return item.name || item.title || item.activityName || item.activity_name || ''
        },
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
        parseVerifyCodePayload(raw = '') {
            const text = String(raw || '').trim()
            const result = { verifyCode: '', subOrderNo: '' }
            if (!text) return result
            const appendParams = (target, query = '') => {
                String(query || '').split(/[&;]/).forEach((pair) => {
                    if (!pair) return
                    const index = pair.indexOf('=')
                    if (index === -1) return
                    const key = pair.slice(0, index)
                    const value = pair.slice(index + 1)
                    if (key) target[key] = decodeURIComponent(value || '')
                })
            }
            const params = {}
            const queryIndex = text.indexOf('?')
            if (queryIndex !== -1) appendParams(params, text.slice(queryIndex + 1))
            else appendParams(params, text)
            try {
                const url = new URL(text)
                appendParams(params, url.search ? url.search.slice(1) : '')
            } catch (error) {}
            const scene = params.scene || params.qrScene || params.qr_scene || ''
            if (scene) {
                try {
                    appendParams(params, decodeURIComponent(scene))
                } catch (error) {}
            }
            result.verifyCode = params.verifyCode || params.verify_code || params.pickupCode || params.pickup_code || params.code || params.qrCode || params.qr_code || ''
            result.subOrderNo = params.subOrderNo || params.sub_order_no || params.orderNo || params.order_no || params.orderSn || params.order_sn || params.bizOrderNo || params.biz_order_no || ''
            if (!result.verifyCode) {
                const matched = text.match(/(?:verifyCode|verify_code|pickupCode|pickup_code|code)[:=]([^&?#;/]+)/i)
                result.verifyCode = matched ? decodeURIComponent(matched[1]) : ''
            }
            if (!result.subOrderNo) {
                const matched = text.match(/(?:subOrderNo|sub_order_no|orderNo|order_no|orderSn|order_sn|bizOrderNo|biz_order_no)[:=]([^&?#;/]+)/i)
                result.subOrderNo = matched ? decodeURIComponent(matched[1]) : ''
            }
            if (!result.verifyCode && /^[A-Za-z0-9_-]{4,64}$/.test(text)) result.verifyCode = text
            return result
        },
        applyVerifyScanResult(raw = '') {
            const payload = this.parseVerifyCodePayload(raw)
            if (payload.verifyCode) this.facePayCode = payload.verifyCode
            if (payload.subOrderNo) this.facePaySubOrderNo = payload.subOrderNo
            if (!payload.verifyCode && raw) this.facePayCode = String(raw).trim()
        },
        clearFacePayForm() {
            this.facePayCode = ''
            this.facePaySubOrderNo = ''
        },
        scanFacePayCode() {
            uni.scanCode({
                onlyFromCamera: false,
                success: (res) => {
                    this.applyVerifyScanResult(res.result || res.path || '')
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
            const verifyCode = (this.facePayCode || '').trim()
            if (!verifyCode) {
                uni.showToast({ title: '请扫码或输入核销码', icon: 'none' })
                return
            }
            if (this.facePaySubmitting) return
            this.facePaySubmitting = true
            try {
                const res = await merchantVerifyOrder({
                    merchantId: this.merchantIdForVerify,
                    subOrderNo: (this.facePaySubOrderNo || '').trim(),
                    verifyCode,
                    operatorId: this.userInfo.user_id || this.userInfo.userId || this.userInfo.id || ''
                })
                if (res.code == 1) {
                    uni.showToast({ title: res.msg || '核销成功', icon: 'success' })
                    this.facePayCode = ''
                    this.facePaySubOrderNo = ''
                    return
                }
                uni.showToast({ title: res.msg || res.message || '核销失败', icon: 'none' })
            } finally {
                this.facePaySubmitting = false
            }
        },
        async loadIntroCard() {
            const options = this.getCurrentPageOptions()
            if (options.preview === '1' || options.preview === 'true') {
                this.introCardInfo = {
                    ...this.introCardInfo,
                    nickname: '',
                    userNo: '',
                    code: '',
                    avatar: resolveImage('', 'avatar'),
                    qrImage: ''
                }
                return
            }
            const res = await getInviteInfo()
            if (res.code != 1) {
                await this.loadPromotionInviteCodeFallback()
                return
            }
            const data = res.data || {}
            this.introCardInfo = {
                ...this.introCardInfo,
                ...data,
                nickname: data.nickname || data.nickName || data.userName || data.name || this.introCardInfo.nickname,
                userNo: data.userNo || data.user_no || data.sn || data.userId || data.user_id || '',
                code: data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.promotionCode || data.promotion_code || data.code || data.allianceCode || '',
                avatar: resolveImage(data.avatar || data.avatarUrl || data.headimgurl, 'avatar'),
                qrImage: data.qrImage || data.qrCodeUrl || data.qr_code_url || data.qrcode ? resolveImage(data.qrImage || data.qrCodeUrl || data.qr_code_url || data.qrcode) : ''
            }
            await this.loadPromotionInviteCodeFallback()
        },
        async loadPromotionInviteCodeFallback() {
            const res = await getPromotionInviteCode({ roleCode: 'PROMOTER', show: false }).catch(() => null)
            if (!res || res.code != 1) return
            const data = res.data || {}
            const code = data.inviteCode || data.invite_code || data.promoterCode || data.promoter_code || data.code || ''
            if (!code) return
            this.introCardInfo = {
                ...this.introCardInfo,
                ...data,
                code,
                userNo: data.userNo || data.user_no || data.userId || data.user_id || this.introCardInfo.userNo,
                qrImage: ''
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
        resolveRecentVisitFromEvent(event = {}) {
            const dataset = event.currentTarget && event.currentTarget.dataset ? event.currentTarget.dataset : {}
            const index = Number(dataset.visitIndex ?? dataset.visit_index)
            const shopId = String(dataset.shopId || dataset.shop_id || '')
            if (!Number.isNaN(index) && this.recentVisitItems[index]) {
                const item = this.recentVisitItems[index]
                const itemShopId = item.shopId || item.shop_id || item.id || ''
                if (!shopId || String(itemShopId) === shopId) return item
            }
            return this.recentVisitItems.find((item) => String(item.shopId || item.shop_id || item.id || '') === shopId) || {}
        },
        toggleRecentVisitSubscribeByEvent(event = {}) {
            return this.toggleRecentVisitSubscribe(this.resolveRecentVisitFromEvent(event))
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
            if (!text) {
                uni.showToast({ title: '暂无可复制内容', icon: 'none' })
                return
            }
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
                const amountRecords = this.paymentRecordList.filter(item => this.hasPaymentRecordAmount(item.change_amount ?? item.amount ?? item.changeAmount ?? item.money))
                const totalAmount = amountRecords.reduce((sum, item) => {
                    const amount = Number(item.change_amount ?? item.amount ?? item.changeAmount ?? item.money)
                    return Number.isNaN(amount) ? sum : sum + Math.abs(amount)
                }, 0)
                const hasAmountData = amountRecords.length > 0 || res.data?.totalAmount !== undefined || res.data?.total_amount !== undefined || res.data?.fiatAmount !== undefined || res.data?.fiat_amount !== undefined
                const summaryAmount = hasAmountData ? `¥${totalAmount.toFixed(2)}` : ''
                this.paymentRecordSummary = {
                    totalAmount: summaryAmount,
                    totalCount: this.paymentRecordList.length || res.data?.count || res.data?.total ? String(res.data?.count || res.data?.total || this.paymentRecordList.length) : '',
                    fiatAmount: summaryAmount
                }
            } catch (error) {
            }
        },
        formatPaymentRecordAmount(value) {
            if (value === '' || value === null || value === undefined) return ''
            const amount = Number(value)
            if (Number.isNaN(amount)) return value || ''
            return Math.abs(amount).toFixed(2)
        },
        hasPaymentRecordAmount(value) {
            const amount = Number(value)
            return value !== '' && value !== null && value !== undefined && !Number.isNaN(amount)
        },
        hasKnownValue(value) {
            return value !== '' && value !== null && value !== undefined
        },
        firstKnownValue(...values) {
            return values.find(value => this.hasKnownValue(value))
        },
        formatPaymentRecordAmountWithSign(item = {}) {
            if (!this.hasPaymentRecordAmount(item.change_amount)) return '金额待确认'
            return `${item.change_type == 1 ? '+' : '-'}${this.formatPaymentRecordAmount(item.change_amount)}`
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
            const appendParams = (raw = '') => {
                String(raw || '').split(/[&;]/).forEach((part) => {
                    if (!part) return
                    const index = part.indexOf('=')
                    if (index === -1) return
                    const key = part.slice(0, index)
                    const value = part.slice(index + 1)
                    if (key && normalized[key] === undefined) {
                        try {
                            normalized[key] = decodeURIComponent(value || '')
                        } catch (error) {
                            normalized[key] = value || ''
                        }
                    }
                })
            }
            const appendUrl = (raw = '') => {
                const text = String(raw || '').trim()
                if (!text) return
                const queryIndex = text.indexOf('?')
                if (queryIndex !== -1) appendParams(text.slice(queryIndex + 1))
                const pathMatch = text.match(/\/miniapp\/shop\/([^/?#]+)/i)
                if (pathMatch && !normalized.shopId) normalized.shopId = decodeURIComponent(pathMatch[1])
                const compactMatch = text.match(/(?:shopId|shop_id|merchantShopId|merchant_shop_id|storeId|store_id|merchantId|merchant_id)[:=]([^&?#;/]+)/i)
                if (compactMatch && !normalized.shopId) normalized.shopId = decodeURIComponent(compactMatch[1])
            }
            const q = normalized.q ? String(normalized.q) : ''
            if (q) {
                try {
                    appendUrl(decodeURIComponent(q))
                } catch (error) {
                    appendUrl(q)
                }
            }
            const scene = normalized.scene ? decodeURIComponent(String(normalized.scene)) : ''
            if (scene) {
                appendParams(scene)
            }
            if (!normalized.shopId && normalized.shop_id) normalized.shopId = normalized.shop_id
            if (!normalized.shopId && normalized.merchantShopId) normalized.shopId = normalized.merchantShopId
            if (!normalized.shopId && normalized.merchant_shop_id) normalized.shopId = normalized.merchant_shop_id
            if (!normalized.shopId && normalized.storeId) normalized.shopId = normalized.storeId
            if (!normalized.shopId && normalized.store_id) normalized.shopId = normalized.store_id
            return normalized
        },
        appendShopId(url) {
            const shopId = this.storeDetailView.shopId
            if (!shopId) return url
            return `${url}${url.includes('?') ? '&' : '?'}shopId=${shopId}`
        },
        openStoreVerify() {
            const shopId = this.storeDetailView.shopId || this.getCurrentPageOptions().shopId || ''
            this.goPage(`/business/pages/business_pages/face_pay${shopId ? `?shopId=${encodeURIComponent(shopId)}&merchantId=${encodeURIComponent(shopId)}` : ''}`)
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
        applyStoreDetailPreviewData() {
            this.storeDetailData = {
                ...this.storeDetailData,
                shopBase: {
                    shopId: 'preview',
                    shopName: '',
                    shopLogo: resolveImage('', 'shop'),
                    shopScore: '',
                    businessHours: '',
                    detailAddress: '',
                    openStatus: '',
                    contactPhone: ''
                },
                comments: [],
                groupBuyProducts: this.storeDetailData.groupBuyProducts && this.storeDetailData.groupBuyProducts.length ? this.storeDetailData.groupBuyProducts : [
                    {
                        id: 'preview-group-1',
                        name: '',
                        image: '',
                        price: '',
                        score: '',
                        meta: ''
                    },
                    {
                        id: 'preview-group-2',
                        name: '',
                        image: '',
                        price: '',
                        score: '',
                        meta: ''
                    }
                ],
                groupCategories: this.storeDetailData.groupCategories && this.storeDetailData.groupCategories.length ? this.storeDetailData.groupCategories : [
                    { id: 'preview-category-1', name: '', image: '' },
                    { id: 'preview-category-2', name: '', image: '' }
                ],
                albums: this.storeDetailData.albums && this.storeDetailData.albums.length ? this.storeDetailData.albums : [
                    { id: 'preview-album-1', url: resolveImage('', 'shop') },
                    { id: 'preview-album-2', url: resolveImage('', 'shop') },
                    { id: 'preview-album-3', url: resolveImage('', 'shop') }
                ],
                videos: this.storeDetailData.videos && this.storeDetailData.videos.length ? this.storeDetailData.videos : [
                    { id: 'preview-video', title: '', cover: resolveImage('', 'shop'), duration: '' }
                ],
                licenseImage: this.storeDetailData.licenseImage || resolveImage('', 'shop')
            }
            this.storeDetailLoadedShopId = 'preview'
            this.storeDetailApiLoaded = true
        },
        async loadStoreDetail() {
            const options = this.normalizePageOptions(this.getCurrentPageOptions())
            const shopId = options.shopId || options.shop_id || options.merchantShopId || options.merchant_shop_id || (this.scene === 'goods-qr' ? '' : options.id) || ''
            this.syncStoreDetailActiveTab()
            if (!shopId) {
                if (options.preview === '1' || options.preview === 'true') {
                    this.resetStoreDetailData('preview')
                    this.applyStoreDetailPreviewData()
                    return
                }
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
                const joinedText = joined !== undefined && joined !== null && joined !== '' ? ` · 已拼${joined}件` : ''
                return `${people || '多人'}人团${joinedText}`
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
        formatStoreDetailVideoDuration(value) {
            if (value === '' || value === null || value === undefined) return ''
            const text = String(value).trim()
            if (!text) return ''
            if (text.includes(':')) return text
            const seconds = Number(text)
            if (Number.isNaN(seconds)) return text
            const minutes = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)
            return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        },
        formatStoreDetailPrice(value) {
            if (value === '' || value === null || value === undefined) return ''
            const price = Number(value)
            if (Number.isNaN(price)) return String(value)
            return Number.isInteger(price) ? String(price) : price.toFixed(2)
        },
        formatStoreDetailPriceText(value) {
            if (value === '' || value === null || value === undefined) return ''
            const text = String(value).trim()
            if (!text) return ''
            if (/^[¥￥]/.test(text)) return text
            return `¥${this.formatStoreDetailPrice(value)}`
        },
        stripStoreDetailPriceSymbol(value) {
            return String(value || '').replace(/^[¥￥]\s*/, '')
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
            const images = this.storeDetailDisplayAlbumImages
            if (!images.length) return
            uni.previewImage({
                current: images[index]?.url || images[0].url,
                urls: images.map(item => item.url)
            })
        },
        previewStoreDetailLicense() {
            if (!this.storeDetailLicenseImage) return
            uni.previewImage({
                current: this.storeDetailLicenseImage,
                urls: [this.storeDetailLicenseImage]
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
            if (!shopId) return '/business/pages/business_pages/street'
            return `/business/pages/business_pages/store_detail?shopId=${encodeURIComponent(shopId)}`
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
                ctx.setFillStyle('#a0610d')
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
                    this.streetCategories = []
                    this.streetMerchants = []
                    return
                }
                const data = res.data
                this.streetSearchText = data.searchBox?.keyword || data.searchBox?.placeholder || this.streetSearchText
                this.streetCategories = (data.recommendedCategories || []).length
                    ? data.recommendedCategories.map((item, index) => this.mapStreetCategory(item, {}, index))
                    : []
                this.streetMerchants = (data.recommendedShops || []).length
                    ? data.recommendedShops.map((item) => this.mapStreetMerchant(item, {}))
                    : []
            } catch (error) {
                this.streetLoaded = false
                this.streetCategories = []
                this.streetMerchants = []
            }
        },
        mapStreetCategory(item = {}, fallback = {}, index = 0) {
            const categoryId = item.categoryId || item.id || fallback.categoryId || fallback.id || ''
            return {
                ...fallback,
                ...item,
                name: item.name || fallback.name || '',
                image: item.image || fallback.image || '',
                categoryId,
                url: categoryId
                    ? `/business/pages/business_pages/street_goods?categoryId=${categoryId}`
                    : (fallback.url || '/business/pages/business_pages/street_goods'),
                key: categoryId || item.name || fallback.name || index
            }
        },
        mapStreetMerchant(item = {}, fallback = {}) {
            const shopId = item.shopId || item.id || fallback.shopId || ''
            const statusLabel = this.getStreetOpenStatusLabel(item.openStatus, item.businessHours || item.business_hours || item.openHours)
            const address = item.detailAddress || fallback.detailAddress || ''
            const metaParts = [statusLabel, address].filter(Boolean)
            return {
                ...fallback,
                ...item,
                shopId,
                name: item.shopName || item.name || fallback.name || '',
                score: this.formatStreetScore(item.shopScore ?? item.score ?? fallback.score),
                starCount: this.getStreetStarCount(item.shopScore ?? item.score ?? fallback.score),
                image: item.shopLogo || item.image || fallback.image || '',
                meta: metaParts.join(' · ') || fallback.meta || '',
                url: shopId
                    ? `/business/pages/business_pages/store_detail?shopId=${shopId}`
                    : (fallback.url || '/business/pages/business_pages/store_detail')
            }
        },
        isEmptyImage(src) {
            return isPlaceholderImage(src)
        },
        formatStreetScore(value, fallback = '') {
            if (value === '' || value === null || value === undefined) return fallback
            const score = Number(value)
            if (Number.isNaN(score)) return String(value)
            const safeScore = Math.max(0, Math.min(score, 5))
            return safeScore.toFixed(1)
        },
        getStreetStarCount(value) {
            const score = Number(value)
            if (Number.isNaN(score) || score <= 0) return 0
            return Math.max(1, Math.min(5, Math.round(score)))
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
        inferOpenStatusFromHours(hours, status = '') {
            const text = String(hours || '').trim()
            if (!text) return String(status || '').toUpperCase()
            if (/24\s*小时|全天|00[:：]00\s*[-~至到]\s*24[:：]00/i.test(text)) return 'OPEN'
            const match = text.match(/(\d{1,2})[:：](\d{2})\s*(?:-|~|至|到)\s*(\d{1,2})[:：](\d{2})/)
            if (!match) return String(status || '').toUpperCase()
            const start = Math.max(0, Math.min(23, Number(match[1]) || 0)) * 60 + Math.max(0, Math.min(59, Number(match[2]) || 0))
            const end = Math.max(0, Math.min(23, Number(match[3]) || 0)) * 60 + Math.max(0, Math.min(59, Number(match[4]) || 0))
            const now = new Date()
            const current = now.getHours() * 60 + now.getMinutes()
            if (start === end) return 'OPEN'
            return start < end
                ? (current >= start && current < end ? 'OPEN' : 'CLOSED')
                : (current >= start || current < end ? 'OPEN' : 'CLOSED')
        },
        getStreetOpenStatusLabel(status, hours = '') {
            const normalized = this.inferOpenStatusFromHours(hours, status)
            if (normalized === 'OPEN') return '营业中'
            if (normalized === 'CLOSED') return '未营业'
            if (normalized === 'REST') return '休息中'
            return normalized || ''
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
                uni.showToast({ title: '商街商品加载失败', icon: 'none' })
            } finally {
                this.streetGoodsLoading = false
            }
        },
        mapStreetGoodsItem(item = {}, index = 0) {
            const goodsId = item.goods_id || item.goodsId || item.spuId || item.productId || ''
            const shopId = item.shop_id || item.shopId || item.merchantShopId || item.merchant_shop_id || item.id || ''
            const price = this.firstKnownValue(item.price, item.salePrice, item.sale_price, item.minPrice, item.min_price, item.groupPrice, item.group_price, item.teamPrice, item.team_price)
            const marketPrice = item.marketPrice || item.market_price || item.originPrice || item.origin_price || item.originalPrice || item.original_price || ''
            const sales = this.firstKnownValue(item.sales_sum, item.salesCount, item.sales_count, item.virtualSales)
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
                name: item.name || item.goods_name || item.goodsName || item.spuName || item.productName || item.title || '',
                subtitle: item.subtitle || item.subTitle || item.sellingPoint || item.shortDesc || item.description || '',
                image: resolveImage(item.image || item.goods_image || item.cover || item.mainImageUrl || item.imageUrl || item.picUrl, 'goods'),
                priceText: this.hasKnownValue(price) ? `¥${this.formatStoreDetailPrice(price)}` : '价格待确认',
                marketPriceText: marketPrice ? `¥${this.formatStoreDetailPrice(marketPrice)}` : '',
                scoreText: score === '' || score === null || score === undefined ? '' : String(this.formatStreetScore(score, '')).replace(/分$/, ''),
                salesText: this.hasKnownValue(sales) ? `${sales}人购买` : '',
                stockText: stock !== '' && stock !== null && stock !== undefined ? `库存${stock}` : '',
                distanceText: distance ? String(distance) : '',
                meta: [shopName, statusLabel, businessTime].filter(Boolean).join(' · '),
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
    background: #fff9f0;
}

.business-scene--user-kyc {
    background: #ffffff;
}

.business-scene--feedback {
    background: #fff9f3;
}

.business-scene--about-us {
    background: #fff9f0;
}

.business-scene--activity-center {
    background: #fff9f0 url('https://shengyuan.store/api/miniapp/files/miniapp/5d41b07208f5494697f46875f9eb5aaa/activity-center-bg.png') no-repeat center top;
    background-size: 100% 100%;
}

.business-scene--activity-exchange {
    background: #fff8ee;
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
    width: 24rpx;
    height: 23rpx;
    margin-right: 3rpx;
    color: #ffcf4a;
    font-size: 22rpx;
    line-height: 23rpx;
    text-align: center;
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
    position: relative;
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
    border: 3rpx solid rgba(255, 255, 255, .9);
    border-radius: 50%;
    box-sizing: border-box;
}

.qr-shop-card__time-icon::before {
    content: '';
    position: absolute;
    left: 9rpx;
    top: 4rpx;
    width: 3rpx;
    height: 8rpx;
    background: rgba(255, 255, 255, .9);
    border-radius: 3rpx;
}

.qr-shop-card__time-icon::after {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    width: 7rpx;
    height: 3rpx;
    background: rgba(255, 255, 255, .9);
    border-radius: 3rpx;
    transform: rotate(25deg);
    transform-origin: left center;
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
    background: #a0610d;
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
    min-height: 1618rpx;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow: hidden;
    background: #fff9f0;
    box-sizing: border-box;
}

.about-us-hero {
    position: relative;
    height: 750rpx;
    padding-top: calc(var(--app-safe-top) + 25rpx);
    background: linear-gradient(180deg, #fff0dc 0%, #fff7ed 52%, rgba(255, 249, 240, 0) 100%);
    box-sizing: border-box;
}

.about-us-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 748rpx;
    height: 95rpx;
    margin: 0;
}

.about-us-back {
    position: relative;
    width: 40rpx;
    height: 95rpx;
    margin-left: 24rpx;
}

.about-us-back::after {
    content: '';
    position: absolute;
    left: 0;
    top: 44rpx;
    width: 19rpx;
    height: 19rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.about-us-capsule {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 168rpx;
    height: 64rpx;
    margin: 20rpx 22rpx 0 0;
    border: 1rpx solid transparent;
    border-radius: 32rpx;
    background: transparent;
    box-sizing: border-box;
    opacity: 0;
}

.about-us-capsule__dot {
    width: 8rpx;
    height: 8rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    background: #222222;
    box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
}

.about-us-capsule__divider {
    width: 1rpx;
    height: 36rpx;
    margin: 0 22rpx 0 42rpx;
    background: rgba(34, 34, 34, .18);
}

.about-us-capsule__circle {
    width: 34rpx;
    height: 34rpx;
    border: 4rpx solid #222222;
    border-radius: 50%;
    box-sizing: border-box;
}

.about-us-logo {
    position: absolute;
    left: 261rpx;
    top: 176rpx;
    width: 228rpx;
    height: 228rpx;
}

.about-us-card {
    position: absolute;
    left: 24rpx;
    right: 23rpx;
    top: 393rpx;
    height: 668rpx;
    overflow: hidden;
    background: #fff9f0;
    border-radius: 15rpx;
    box-shadow: none;
}

.about-us-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 95rpx;
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
    background: rgba(160, 97, 13, .14);
}

.activity-center-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow: hidden;
    background: #fff9f0 url('https://shengyuan.store/api/miniapp/files/miniapp/5d41b07208f5494697f46875f9eb5aaa/activity-center-bg.png') no-repeat center top;
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
    background: #a0610d;
    border-radius: 32rpx;
    white-space: nowrap;
}

.activity-exchange-page {
    position: relative;
    width: 100%;
    max-width: 750rpx;
    min-height: 1625rpx;
    margin: 0 auto;
    overflow: hidden;
    background: linear-gradient(180deg, #fff8ed 0%, #fff8ed 34%, #fff3df 100%);
}

.activity-exchange-hero {
    position: relative;
    width: 100%;
    max-width: 750rpx;
    height: 555rpx;
    overflow: hidden;
    background: linear-gradient(180deg, #fff8ee 0%, #fff0d9 100%);
}

.activity-exchange-hero::after {
    display: none;
}

.activity-exchange-status {
    width: 690rpx;
    height: 26rpx;
    margin: 28rpx 0 0 34rpx;
    border-radius: 13rpx;
}

.activity-exchange-nav {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 749rpx;
    height: 96rpx;
    margin-top: 24rpx;
}

.activity-exchange-back {
    position: relative;
    flex: none;
    width: 64rpx;
    height: 64rpx;
    margin-left: 4rpx;
}

.activity-exchange-back::before {
    content: '';
    position: absolute;
    left: 22rpx;
    top: 20rpx;
    width: 20rpx;
    height: 20rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
    box-sizing: border-box;
}

.activity-exchange-title {
    flex: 1;
    margin-left: 121rpx;
    color: #222222;
    font-size: 36rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 36rpx;
    text-align: left;
    white-space: nowrap;
}

.activity-exchange-capsule {
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex: none;
    width: 168rpx;
    height: 64rpx;
    margin-right: 23rpx;
    padding: 0 19rpx;
    border: 1rpx solid transparent;
    border-radius: 32rpx;
    background: transparent;
    box-sizing: border-box;
    opacity: 0;
}

.activity-exchange-capsule__dot {
    width: 46rpx;
    height: 12rpx;
    border-top: 6rpx dotted #222222;
    box-sizing: border-box;
}

.activity-exchange-capsule__divider {
    width: 1rpx;
    height: 35rpx;
    background: rgba(0, 0, 0, .16);
}

.activity-exchange-capsule__circle {
    width: 31rpx;
    height: 31rpx;
    border: 4rpx solid #222222;
    border-radius: 50%;
    box-sizing: border-box;
}

.activity-exchange-summary {
    position: relative;
    z-index: 1;
    margin: 33rpx 0 0 23rpx;
}

.activity-exchange-label {
    color: #666666;
    font-size: 26rpx;
    line-height: 26rpx;
    white-space: nowrap;
}

.activity-exchange-points {
    margin: 19rpx 0 0 3rpx;
    color: #222222;
    font-size: 55rpx;
    font-family: AlimamaShuHeiTi-Bold, PingFangSC-Medium, sans-serif;
    font-weight: 700;
    line-height: 55rpx;
    white-space: nowrap;
}

.activity-exchange-desc {
    margin-top: 22rpx;
    color: #4b4b4b;
    font-size: 22rpx;
    line-height: 22rpx;
    white-space: nowrap;
}

.activity-exchange-form {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 12rpx;
    justify-content: space-between;
    width: calc(100% - 48rpx);
    max-width: 702rpx;
    height: 79rpx;
    margin: 33rpx 0 0 24rpx;
    box-sizing: border-box;
}

.activity-exchange-input {
    flex: 1;
    min-width: 0;
    height: 79rpx;
    background: #ffffff;
    border-radius: 8rpx;
}

.activity-exchange-button,
.activity-exchange-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    color: #ffffff;
    font-weight: 400;
    background: #764213;
    border: 0;
    box-sizing: border-box;
}

.activity-exchange-button::after,
.activity-exchange-detail::after {
    display: none;
}

.activity-exchange-button {
    width: 170rpx;
    height: 79rpx;
    border-radius: 8rpx;
    font-size: 26rpx;
    line-height: 26rpx;
    white-space: nowrap;
}

.activity-exchange-body {
    position: relative;
    width: 100%;
    max-width: 750rpx;
    min-height: 1070rpx;
}

.activity-exchange-rule {
    position: absolute;
    left: 24rpx;
    right: 24rpx;
    top: -62rpx;
    width: auto;
    max-width: 703rpx;
    height: 245rpx;
    margin: 0 auto;
    padding-top: 14rpx;
    color: #764213;
    background: linear-gradient(180deg, rgba(255, 249, 238, .98) 0%, rgba(255, 232, 196, .98) 100%);
    border: 0;
    border-radius: 16rpx;
    box-shadow: none;
    box-sizing: border-box;
}

.activity-exchange-rule__title {
    color: #764213;
    font-size: 26rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 26rpx;
    text-align: center;
    white-space: nowrap;
}

.activity-exchange-rule__content {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 44rpx 0 0 17rpx;
    color: #764213;
    font-size: 26rpx;
    font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif;
    font-weight: 500;
    line-height: 49rpx;
}

.activity-exchange-rule__content text {
    display: block;
    white-space: nowrap;
}

.activity-exchange-detail {
    position: relative;
    top: 242rpx;
    width: calc(100% - 188rpx);
    max-width: 563rpx;
    height: 88rpx;
    margin: 0 auto;
    border-radius: 44rpx;
    font-size: 28rpx;
    line-height: 28rpx;
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
    min-height: 1624rpx;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding-top: calc(var(--app-safe-top) + 19rpx);
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
    justify-content: space-between;
    height: 93rpx;
    margin: 0 29rpx 0 33rpx;
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
    line-height: 36rpx;
    white-space: nowrap;
    transform: translate(-50%, -50%);
}

.intro-card-capsule {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 159rpx;
    height: 58rpx;
    margin-top: 3rpx;
    border: 1rpx solid transparent;
    border-radius: 29rpx;
    background: transparent;
    box-sizing: border-box;
    opacity: 0;
}

.intro-card-capsule__dot {
    width: 8rpx;
    height: 8rpx;
    margin-right: 7rpx;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 17rpx 0 0 #ffffff, 34rpx 0 0 #ffffff;
}

.intro-card-capsule__divider {
    width: 1rpx;
    height: 32rpx;
    margin: 0 20rpx 0 38rpx;
    background: rgba(255, 255, 255, .36);
}

.intro-card-capsule__circle {
    width: 32rpx;
    height: 32rpx;
    border: 4rpx solid #ffffff;
    border-radius: 50%;
    box-sizing: border-box;
}

.intro-card-panel {
    position: relative;
    z-index: 1;
    width: 696rpx;
    min-height: 933rpx;
    margin: 207rpx auto 0;
    padding: 45rpx 40rpx 50rpx;
    background: url('https://shengyuan.store/api/miniapp/files/miniapp/4a6ec42c3ad54de8a47300fb1a79d820/intro-card-panel-bg.png') no-repeat center top;
    background-size: 100% 100%;
    border-radius: 0;
    box-sizing: border-box;
    box-shadow: none;
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
    font-weight: 500;
    line-height: 34rpx;
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
    margin: 184rpx auto 0;
    background: #ffffff;
    border-radius: 0;
}

.intro-card-qr--code {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6rpx;
    color: #0d83ff;
    font-size: 34rpx;
    font-weight: 600;
    text-align: center;
    word-break: break-all;
    box-sizing: border-box;
}

.intro-card-qr-empty {
    color: #9aa3af;
    font-size: 28rpx;
    font-weight: 400;
    line-height: 40rpx;
}

.intro-card-tip {
    position: relative;
    z-index: 1;
    margin-top: 30rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 38rpx;
    text-align: center;
}

.intro-card-code-text {
    position: relative;
    z-index: 1;
    max-width: 480rpx;
    margin: 16rpx auto 0;
    padding: 12rpx 22rpx;
    color: #a0610d;
    font-size: 26rpx;
    line-height: 36rpx;
    text-align: center;
    background: rgba(255, 255, 255, .9);
    border-radius: 999rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
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
    background: #a0610d;
    border-radius: 29rpx;
    white-space: nowrap;
}

.recent-visits-btn--subscribed {
    color: #a0610d;
    background: #d0e7ff;
}

.feedback-page {
    min-height: 1625rpx;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow-x: hidden;
    background: #f5f1eb;
    box-sizing: border-box;
}

.feedback-hero {
    height: calc(396rpx + var(--app-safe-top));
    padding: calc(var(--app-safe-top) + 25rpx) 0 42rpx;
    background: #fff9f3;
    box-sizing: border-box;
}

.feedback-hero__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 750rpx;
    height: 94rpx;
}

.feedback-back {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 40rpx;
    height: 94rpx;
    margin-left: 26rpx;
}

.feedback-back::after {
    content: '';
    position: absolute;
    left: 0;
    top: 40rpx;
    width: 19rpx;
    height: 19rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.feedback-capsule {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 168rpx;
    height: 64rpx;
    margin: 22rpx 24rpx 0 0;
    border: 1rpx solid transparent;
    border-radius: 34rpx;
    background: transparent;
    box-sizing: border-box;
    flex: none;
    opacity: 0;
}

.feedback-capsule__dot {
    width: 8rpx;
    height: 8rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    background: #222222;
    box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
}

.feedback-capsule__divider {
    width: 1rpx;
    height: 36rpx;
    margin: 0 22rpx 0 42rpx;
    background: rgba(34, 34, 34, .18);
}

.feedback-capsule__circle {
    width: 34rpx;
    height: 34rpx;
    border: 4rpx solid #222222;
    border-radius: 50%;
    box-sizing: border-box;
}

.feedback-hero__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 638rpx;
    height: 124rpx;
    margin: 58rpx 0 0 41rpx;
    padding: 0;
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
    background: #fff9f3;
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
    border-color: #a0610d;
    background: #fff7ec;
}

.feedback-tag--active .feedback-tag__text {
    color: #a0610d;
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
    background: #a0610d;
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
    background: #ffffff;
    border: 1rpx solid #eac695;
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
    background: #ffffff;
    border: 1rpx solid #eac695;
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
    background: linear-gradient(90deg, #d79a43 0%, #a0610d 100%);
    border-radius: 39rpx;
    box-shadow: 0 12rpx 24rpx rgba(160, 97, 13, .18);
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
    background: linear-gradient(180deg, #ffffff 0%, #fff8ed 100%);
    border-radius: 33rpx;
    box-shadow: 0 12rpx 30rpx rgba(160, 97, 13, 0.12);
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

.search-shell__icon-lens {
    position: relative;
    width: 34rpx;
    height: 34rpx;
}

.search-shell__icon-lens::before {
    content: '';
    position: absolute;
    left: 4rpx;
    top: 3rpx;
    width: 20rpx;
    height: 20rpx;
    border: 4rpx solid #a0610d;
    border-radius: 50%;
    box-sizing: border-box;
}

.search-shell__icon-lens::after {
    content: '';
    position: absolute;
    right: 3rpx;
    bottom: 5rpx;
    width: 13rpx;
    height: 4rpx;
    background: #a0610d;
    border-radius: 4rpx;
    transform: rotate(45deg);
    transform-origin: right center;
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
    color: #a0610d;
    background: rgba(160, 97, 13, 0.12);
}

.textarea {
    width: auto;
    height: 220rpx;
    margin: 0 28rpx;
    padding: 24rpx;
    font-size: 28rpx;
    background: #fff9f0;
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
    background: #fff8ed;
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
    background: #a0610d;
    border-radius: 44rpx;
}

.hero-banner {
    height: 320rpx;
    margin: 24rpx 24rpx 0;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #d9e7ff 0%, #b2cbff 100%);
}

.face-pay-page {
    min-height: 100vh;
    padding: 24rpx;
    background: linear-gradient(180deg, #fff1dc 0%, #fff9f0 360rpx, #fff9f0 100%);
    box-sizing: border-box;
}

.face-pay-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
    padding: 34rpx 30rpx;
    border-radius: 28rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #a0610d 0%, #d79a43 100%);
    box-shadow: 0 16rpx 38rpx rgba(160, 97, 13, .16);
}

.face-pay-hero__title {
    font-size: 40rpx;
    font-weight: 700;
    line-height: 56rpx;
}

.face-pay-hero__desc {
    margin-top: 10rpx;
    font-size: 25rpx;
    line-height: 36rpx;
    opacity: .9;
}

.face-pay-hero__badge {
    flex: none;
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    color: #ffffff;
    background: rgba(255, 255, 255, .18);
    border: 1rpx solid rgba(255, 255, 255, .28);
    font-size: 23rpx;
    line-height: 30rpx;
}

.face-pay-tips {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    margin-top: 20rpx;
    padding: 14rpx 24rpx;
    border-radius: 20rpx;
    background: #fff7e8;
    border: 1rpx solid #ffe0ad;
    box-sizing: border-box;
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

.face-pay-scan-card {
    display: flex;
    align-items: center;
    gap: 22rpx;
    margin-top: 20rpx;
    padding: 30rpx 28rpx;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #ffffff 0%, #fff8ed 100%);
    border: 1rpx solid #f0dcc0;
    box-shadow: 0 12rpx 30rpx rgba(160, 97, 13, .09);
}

.face-pay-scan-card__icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 102rpx;
    height: 102rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #a0610d, #d79a43);
    box-shadow: 0 12rpx 24rpx rgba(160, 97, 13, .22);
}

.face-pay-scan-card__title {
    color: #222222;
    font-size: 32rpx;
    font-weight: 700;
    line-height: 44rpx;
}

.face-pay-scan-card__desc {
    margin-top: 6rpx;
    color: #7a8594;
    font-size: 24rpx;
    line-height: 34rpx;
}

.face-pay-code-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    margin-top: 20rpx;
    padding: 22rpx 24rpx;
    border-radius: 22rpx;
    background: #ffffff;
    border: 1rpx solid #dff3ea;
    box-shadow: 0 10rpx 28rpx rgba(31, 58, 94, .06);
}

.face-pay-code-card__label {
    color: #667085;
    font-size: 23rpx;
    line-height: 32rpx;
}

.face-pay-code-card__value {
    margin-top: 6rpx;
    color: #111827;
    font-size: 32rpx;
    font-weight: 700;
    line-height: 42rpx;
    word-break: break-all;
}

.face-pay-code-card__sub {
    margin-top: 4rpx;
    color: #8a96a6;
    font-size: 22rpx;
    line-height: 30rpx;
}

.face-pay-code-card__clear {
    flex: none;
    height: 56rpx;
    padding: 0 22rpx;
    border-radius: 28rpx;
    color: #0f766e;
    background: #e9fbf5;
    font-size: 24rpx;
    line-height: 56rpx;
}

.face-pay-form {
    margin-top: 20rpx;
    padding: 28rpx 24rpx;
    border-radius: 24rpx;
    background: #ffffff;
    border: 1rpx solid #edf1f6;
    box-shadow: 0 10rpx 28rpx rgba(31, 58, 94, .06);
    box-sizing: border-box;
}

.face-pay-form__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 42rpx;
}

.face-pay-field {
    display: flex;
    align-items: center;
    min-height: 92rpx;
    margin-top: 16rpx;
    padding: 0 20rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    border: 1rpx solid #edf1f6;
    box-sizing: border-box;
}

.face-pay-field__label {
    flex: none;
    width: 150rpx;
    color: #465366;
    font-size: 27rpx;
    font-weight: 500;
}

.face-pay-field__input {
    flex: 1;
    min-width: 0;
    color: #1f2937;
    font-size: 28rpx;
    text-align: right;
}

.face-pay-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    margin-top: 30rpx;
    border-radius: 44rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #a0610d, #d79a43);
    font-size: 30rpx;
    font-weight: 600;
    box-shadow: 0 14rpx 28rpx rgba(160, 97, 13, .22);
}

.face-pay-submit--disabled {
    background: #c9d4e5;
    box-shadow: none;
}

.face-pay-submit:active {
    opacity: .88;
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
    background: #a0610d;
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
    color: #a0610d;
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
    color: #a0610d;
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
    border: 1rpx solid rgba(160, 97, 13, 0.08);
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
    background: #fff1dc;
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
    background: #fff1dc;
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
    max-width: 750rpx;
    min-height: 100vh;
    margin: 0 auto;
    background: linear-gradient(180deg, #a0610d 0%, #d79a43 266rpx, #fff9f0 266rpx, #fff9f0 100%);
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
    opacity: 0;
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

.street-search__icon-lens {
    position: relative;
    width: 34rpx;
    height: 34rpx;
}

.street-search__icon-lens::before {
    content: '';
    position: absolute;
    left: 4rpx;
    top: 3rpx;
    width: 20rpx;
    height: 20rpx;
    border: 4rpx solid #a0610d;
    border-radius: 50%;
    box-sizing: border-box;
}

.street-search__icon-lens::after {
    content: '';
    position: absolute;
    right: 3rpx;
    bottom: 5rpx;
    width: 13rpx;
    height: 4rpx;
    background: #a0610d;
    border-radius: 4rpx;
    transform: rotate(45deg);
    transform-origin: right center;
}

.street-sheet {
    min-height: calc(100vh - 266rpx);
    margin-top: 20rpx;
    background: #fff9f0;
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
    color: #ffb02e;
    font-size: 22rpx;
    line-height: 23rpx;
    text-align: center;
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
    position: relative;
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
    border: 3rpx solid #9aa0a6;
    border-radius: 50%;
    box-sizing: border-box;
}

.street-merchant-card__time-icon::before {
    content: '';
    position: absolute;
    left: 9rpx;
    top: 4rpx;
    width: 3rpx;
    height: 8rpx;
    background: #9aa0a6;
    border-radius: 3rpx;
}

.street-merchant-card__time-icon::after {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    width: 7rpx;
    height: 3rpx;
    background: #9aa0a6;
    border-radius: 3rpx;
    transform: rotate(25deg);
    transform-origin: left center;
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
    padding-bottom: 84rpx;
    background: #fff9f0;
}

.store-detail-hero {
    position: relative;
    height: 291rpx;
    overflow: hidden;
    background: #000000;
}

.store-detail-hero__image,
.store-detail-content-card__image {
    width: 100%;
    height: 100%;
}

.store-detail-hero__mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.42);
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

.store-detail-hero__back {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    flex: none;
    color: #ffffff;
    background: transparent;
    border-radius: 0;
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
    justify-content: space-around;
    width: 168rpx;
    height: 64rpx;
    padding: 0 25rpx;
    flex: none;
    border: 1rpx solid rgba(255, 255, 255, 0.46);
    border-radius: 32rpx;
    background: rgba(0, 0, 0, 0.24);
    box-sizing: border-box;
    opacity: 0;
}

.store-detail-hero__share-dot {
    width: 9rpx;
    height: 9rpx;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 20rpx 0 0 #ffffff, 40rpx 0 0 #ffffff;
}

.store-detail-hero__share-divider {
    width: 1rpx;
    height: 34rpx;
    margin-left: 36rpx;
    background: rgba(255, 255, 255, 0.38);
}

.store-detail-hero__share-circle {
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid #ffffff;
    border-radius: 50%;
    box-sizing: border-box;
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
    background: #a0610d;
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
    background: #fff9f0;
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
    color: #ffb02e;
    font-size: 22rpx;
    line-height: 23rpx;
    text-align: center;
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
    position: relative;
    width: 25rpx;
    height: 25rpx;
    margin-right: 6rpx;
    border: 3rpx solid #9aa0a6;
    border-radius: 50%;
    box-sizing: border-box;
}

.store-detail-summary-card__time-icon::before {
    content: '';
    position: absolute;
    left: 9rpx;
    top: 4rpx;
    width: 3rpx;
    height: 8rpx;
    background: #9aa0a6;
    border-radius: 3rpx;
}

.store-detail-summary-card__time-icon::after {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    width: 7rpx;
    height: 3rpx;
    background: #9aa0a6;
    border-radius: 3rpx;
    transform: rotate(25deg);
    transform-origin: left center;
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

.store-detail-tabs--group {
    padding-top: 42rpx;
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
    color: #a0610d;
}

.store-detail-tab__indicator {
    position: absolute;
    bottom: 0;
    width: 35rpx;
    height: 7rpx;
    background: #a0610d;
    border-radius: 3rpx;
}

.store-detail-content-card {
    position: relative;
    height: 925rpx;
    margin: 0 24rpx;
    border-radius: 15rpx;
    overflow: hidden;
    background: #fff9f0;
}

.store-detail-content-card__fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 340rpx;
    background: linear-gradient(180deg, rgba(255, 249, 240, 0) 0%, rgba(255, 249, 240, 0.94) 58%, #fff9f0 100%);
}

.store-detail-pay-btn {
    position: absolute;
    left: 120rpx;
    right: auto;
    bottom: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 510rpx;
    height: 81rpx;
    background: linear-gradient(90deg, #c49355 0%, #a0610d 100%);
    border-radius: 40rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
}

.store-detail-group-panel {
    padding: 17rpx 0 186rpx;
}

.store-detail-group-list {
    padding: 0 24rpx 40rpx;
}

.store-detail-media-wrap,
.store-detail-album-panel {
    min-height: 900rpx;
    padding: 24rpx 24rpx 40rpx;
}

.store-detail-album-panel {
    padding: 46rpx 0 40rpx;
}

.store-detail-media-wrap {
    padding-top: 38rpx;
}

.store-detail-category-card {
    position: relative;
    min-height: 339rpx;
    margin: 0 24rpx 22rpx;
    padding: 83rpx 214rpx 24rpx 19rpx;
    background: #fff9f0;
    border-radius: 10rpx;
    box-sizing: border-box;
}

.store-detail-category-card::before {
    content: '';
    position: absolute;
    left: 6rpx;
    top: 10rpx;
    width: 237rpx;
    height: 68rpx;
    border-radius: 34rpx;
    background: linear-gradient(90deg, rgba(160, 97, 13, 0.18), rgba(160, 97, 13, 0));
}

.store-detail-category-card::after {
    content: '店内就餐';
    position: absolute;
    right: 20rpx;
    top: 17rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 206rpx;
    height: 63rpx;
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
    background: linear-gradient(90deg, #c49355 0%, #a0610d 100%);
    border-radius: 32rpx;
}

.store-detail-category-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 227rpx;
    margin-right: 19rpx;
    vertical-align: top;
}

.store-detail-category-item__thumb {
    width: 227rpx;
    height: 168rpx;
    background: #fff7f1;
    border-radius: 20rpx;
    overflow: hidden;
}

.store-detail-category-item__image {
    width: 100%;
    height: 100%;
}

.store-detail-category-item__name {
    max-width: 227rpx;
    margin-top: 23rpx;
    color: #a0610d;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 32rpx;
    text-align: center;
}

.store-detail-album-section {
    margin-bottom: 53rpx;
}

.store-detail-album-section__title {
    margin: 0 0 22rpx 25rpx;
    color: #a0610d;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 32rpx;
}

.store-detail-album-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    width: calc(100% - 48rpx);
    max-width: 719rpx;
    margin: 0 auto;
}

.store-detail-video-grid {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
}

.store-detail-album-card {
    position: relative;
    width: 241rpx;
    height: 189rpx;
    margin: 0 23rpx 18rpx 0;
    overflow: hidden;
    border-radius: 10rpx;
    background: #fff7f1;
}

.store-detail-album-card:nth-child(3n) {
    width: 191rpx;
    margin-right: 0;
}

.store-detail-video-card {
    position: relative;
    width: 100%;
    max-width: 703rpx;
    height: 359rpx;
    margin: 0 auto 18rpx;
    overflow: hidden;
    border-radius: 15rpx;
    background: #d5d5d5;
    box-shadow: none;
}

.store-detail-album-card__image,
.store-detail-video-card__cover {
    width: 100%;
    height: 100%;
    display: block;
}

.store-detail-license-card {
    margin-left: 28rpx;
    width: 374rpx;
    height: 272rpx;
    overflow: hidden;
    background: #fff8ed;
    border-radius: 8rpx;
}

.store-detail-license-card__image {
    width: 100%;
    height: 100%;
}

.store-detail-video-card__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.10);
}

.store-detail-video-card__play {
    width: 61rpx;
    height: 61rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    position: relative;
}

.store-detail-video-card__play::after {
    content: '';
    position: absolute;
    left: 25rpx;
    top: 19rpx;
    width: 0;
    height: 0;
    border-top: 12rpx solid transparent;
    border-bottom: 12rpx solid transparent;
    border-left: 18rpx solid #a0610d;
}

.store-detail-video-card__title {
    display: none;
}

.store-detail-video-card__duration {
    position: absolute;
    top: 12rpx;
    right: 13rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 91rpx;
    height: 45rpx;
    padding: 0 14rpx;
    color: #ffffff;
    font-size: 26rpx;
    line-height: 26rpx;
    background: rgba(0, 0, 0, 0.70);
    border-radius: 22rpx;
    box-sizing: border-box;
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
    background: #fff9f0;
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
    max-width: 527rpx;
    margin-top: 19rpx;
    color: #666666;
    font-size: 22rpx;
    line-height: 30rpx;
    word-break: break-word;
}

.store-detail-group-card {
    position: relative;
    display: flex;
    min-height: 236rpx;
    margin-bottom: 17rpx;
    background: #fff9f0;
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
    padding: 32rpx 164rpx 0 21rpx;
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
    background: rgba(160, 97, 13, 0.10);
    color: #a0610d;
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
    color: #ffb02e;
    font-size: 22rpx;
    line-height: 23rpx;
    text-align: center;
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
    color: #a0610d;
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
    background: linear-gradient(90deg, #c49355 0%, #a0610d 100%);
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

.store-detail-quantity {
    position: absolute;
    right: 22rpx;
    bottom: 23rpx;
    display: flex;
    align-items: center;
    height: 51rpx;
}

.store-detail-quantity__btn {
    position: relative;
    width: 39rpx;
    height: 39rpx;
    border-radius: 50%;
    background: #a0610d;
}

.store-detail-quantity__btn::before,
.store-detail-quantity__btn--plus::after {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 18rpx;
    width: 19rpx;
    height: 3rpx;
    background: #ffffff;
    border-radius: 3rpx;
}

.store-detail-quantity__btn--minus {
    background: #d8b98f;
}

.store-detail-quantity__btn--plus::after {
    transform: rotate(90deg);
}

.store-detail-quantity__value {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55rpx;
    height: 51rpx;
    margin: 0 17rpx;
    color: #222222;
    font-size: 30rpx;
    font-weight: 500;
    line-height: 30rpx;
    background: #ffffff;
    border-radius: 4rpx;
}

.store-detail-order-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: flex;
    align-items: flex-start;
    min-height: 178rpx;
    padding: 51rpx 23rpx calc(24rpx + env(safe-area-inset-bottom));
    background: #fdf4ea;
    border-radius: 34rpx 34rpx 0 0;
    box-shadow: 0 -2rpx 21rpx rgba(82, 82, 82, 0.08);
    box-sizing: border-box;
}

.store-detail-order-bar__label {
    margin-top: 11rpx;
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
    white-space: nowrap;
}

.store-detail-order-bar__price {
    flex: 1;
    min-width: 0;
    margin: 0 24rpx 0 17rpx;
    color: #a0610d;
    font-size: 50rpx;
    font-weight: 500;
    line-height: 50rpx;
    white-space: nowrap;
}

.store-detail-order-bar__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 283rpx;
    height: 81rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
    background: linear-gradient(90deg, #c49355 0%, #a0610d 100%);
    border-radius: 41rpx;
}

.user-kyc-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #fff1dc 0%, #fff8ed 34%, #fff9f0 100%);
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
    box-shadow: 0 16rpx 28rpx rgba(160, 97, 13, 0.14);
}

.user-kyc-page__illustration-back {
    right: 10rpx;
    top: 16rpx;
    width: 170rpx;
    height: 176rpx;
    background: linear-gradient(180deg, #fff8ed 0%, #ffffff 100%);
    transform: rotate(8deg);
}

.user-kyc-page__illustration-front {
    right: 30rpx;
    top: 12rpx;
    width: 170rpx;
    height: 176rpx;
    background: linear-gradient(180deg, #d79a43 0%, #a0610d 100%);
    transform: rotate(8deg);
}

.user-kyc-page__illustration-sheet {
    left: 22rpx;
    top: 14rpx;
    width: 156rpx;
    height: 172rpx;
    background: linear-gradient(180deg, #fff8ed 0%, #ffffff 100%);
    border: 1rpx solid rgba(234, 213, 184, 0.8);
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
    background: linear-gradient(180deg, #d79a43 0%, #a0610d 100%);
    border-radius: 12rpx;
    box-shadow: 0 8rpx 20rpx rgba(160, 97, 13, 0.28);
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
    background: #fff8ed;
    border: 1rpx solid #f0dcc0;
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
    background: #fff8ed;
    border: 1rpx solid #f0dcc0;
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
    aspect-ratio: 301 / 192;
    height: auto;
    min-height: 190rpx;
    overflow: hidden;
    border-radius: 18rpx;
    background: linear-gradient(135deg, #fff8ed 0%, #fffdf8 52%, #fff1dc 100%);
}

.user-kyc-page__photo-card.is-filled {
    border: 1rpx solid #e5e9f0;
    background: #f8fafc;
    box-sizing: border-box;
}

.user-kyc-page__photo-image {
    display: block;
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
    background: linear-gradient(135deg, #fff8ed 0%, #fffdf8 52%, #fff1dc 100%);
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
    background: radial-gradient(circle at 30% 30%, #fff1dc 0%, #f3d2a7 60%, #d79a43 100%);
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
    background: linear-gradient(135deg, #fff8ed 0%, #fff1dc 100%);
    border: 1rpx solid #f0dcc0;
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
    color: #a0610d;
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
    background: linear-gradient(180deg, #d79a43 0%, #a0610d 100%);
    border-radius: 49rpx;
    box-shadow: 0 14rpx 30rpx rgba(160, 97, 13, 0.2);
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
    background: linear-gradient(180deg, #d79a43 0%, #a0610d 100%);
    border-radius: 46rpx;
    box-shadow: 0 14rpx 30rpx rgba(160, 97, 13, 0.2);
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
    background: linear-gradient(90deg, #a0610d 0%, #d79a43 100%);
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
    color: #a0610d;
    font-size: 28rpx;
    font-weight: 600;
    border-radius: 36rpx;
    background: #ffffff;
}

.filter-box {
    margin: 0 24rpx 24rpx;
}

.is-plus {
    color: #a0610d;
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
    background: #fff9f0;
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
    background: linear-gradient(90deg, #a0610d 0%, #d79a43 100%);
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
    left: 126rpx;
    bottom: -14rpx;
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
    background: #a0610d;
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
    background: #a0610d;
    border-radius: 44rpx;
}

.payment-filter-sheet__action--ghost {
    color: #a0610d;
    background: #fff1dc;
    border: 2rpx solid #a0610d;
    margin-left: 0;
}
</style>
