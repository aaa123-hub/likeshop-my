<template>
    <view
        :class="[
            'business-scene',
            scene === 'user-kyc' ? 'business-scene--user-kyc' : '',
            scene === 'feedback' ? 'business-scene--feedback' : ''
        ]"
    >
        <navbar v-if="!isFullScene" :title="sceneConfig.title"></navbar>
        <scroll-view scroll-y :class="['business-scene__scroll', isFullScene ? 'business-scene__scroll--full' : '']">
            <template v-if="scene === 'user-kyc'">
                <view class="user-kyc-page">
                    <view class="user-kyc-page__hero">
                        <image class="user-kyc-page__status" :src="kycStatusBar" mode="widthFix"></image>
                        <view class="user-kyc-page__topbar">
                            <view class="user-kyc-page__back" @tap="goBack">
                                <u-icon name="arrow-left" size="34" color="#222222"></u-icon>
                            </view>
                            <image class="user-kyc-page__capsule" :src="kycMenuCapsule" mode="aspectFit"></image>
                        </view>

                        <view class="user-kyc-page__hero-body">
                            <view class="user-kyc-page__copy">
                                <view class="user-kyc-page__title">用户KYC</view>
                                <view class="user-kyc-page__subtitle">副标题副标题副标题副标题副标题</view>
                            </view>

                            <view class="user-kyc-page__illustration">
                                <view class="user-kyc-page__illustration-back"></view>
                                <view class="user-kyc-page__illustration-sheet">
                                    <view class="user-kyc-page__illustration-sheet-tab">★★★★</view>
                                    <view class="user-kyc-page__illustration-line user-kyc-page__illustration-line--one"></view>
                                    <view class="user-kyc-page__illustration-line user-kyc-page__illustration-line--two"></view>
                                    <view class="user-kyc-page__illustration-line user-kyc-page__illustration-line--three"></view>
                                </view>
                                <view class="user-kyc-page__illustration-front"></view>
                                <view class="user-kyc-page__illustration-arrow">
                                    <u-icon name="arrow-right" size="28" color="#49b27d"></u-icon>
                                </view>
                                <view class="user-kyc-page__illustration-cloud user-kyc-page__illustration-cloud--left"></view>
                                <view class="user-kyc-page__illustration-cloud user-kyc-page__illustration-cloud--right"></view>
                            </view>
                        </view>
                    </view>

                    <view class="user-kyc-page__sheet">
                        <view class="user-kyc-page__field">
                            <text class="user-kyc-page__label">姓名</text>
                            <input class="user-kyc-page__input" placeholder="请输入真实姓名" placeholder-class="user-kyc-page__placeholder"></input>
                        </view>
                        <view class="user-kyc-page__field">
                            <text class="user-kyc-page__label">证件类型</text>
                            <text class="user-kyc-page__value">ID卡</text>
                        </view>
                        <view class="user-kyc-page__field">
                            <text class="user-kyc-page__label">证件号码</text>
                            <input class="user-kyc-page__input" placeholder="请输入证件号码" placeholder-class="user-kyc-page__placeholder"></input>
                        </view>

                        <view class="user-kyc-page__section-title">证件照片</view>
                        <view class="user-kyc-page__photo-row">
                            <view class="user-kyc-page__photo-card user-kyc-page__photo-card--front">
                                <view class="user-kyc-page__photo-preview">
                                    <view class="user-kyc-page__photo-preview-line user-kyc-page__photo-preview-line--long"></view>
                                    <view class="user-kyc-page__photo-preview-line"></view>
                                    <view class="user-kyc-page__photo-preview-line"></view>
                                    <view class="user-kyc-page__photo-avatar"></view>
                                    <view class="user-kyc-page__photo-avatar-body"></view>
                                </view>
                                <view class="user-kyc-page__photo-action">
                                    <u-icon name="camera-fill" size="30" color="#ffffff"></u-icon>
                                </view>
                            </view>
                            <view class="user-kyc-page__photo-card user-kyc-page__photo-card--back">
                                <view class="user-kyc-page__photo-preview user-kyc-page__photo-preview--certificate">
                                    <view class="user-kyc-page__photo-badge"></view>
                                    <view class="user-kyc-page__photo-preview-line user-kyc-page__photo-preview-line--full"></view>
                                    <view class="user-kyc-page__photo-preview-line user-kyc-page__photo-preview-line--full"></view>
                                    <view class="user-kyc-page__photo-preview-line user-kyc-page__photo-preview-line--short"></view>
                                </view>
                                <view class="user-kyc-page__photo-action">
                                    <u-icon name="camera-fill" size="30" color="#ffffff"></u-icon>
                                </view>
                            </view>
                        </view>

                        <view class="user-kyc-page__submit">提交申请</view>
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
                            <image class="feedback-menu" :src="designAssets.myMenuCapsule" mode="aspectFit"></image>
                        </view>

                        <view class="feedback-hero__body">
                            <view class="feedback-hero__text">
                                <view class="feedback-hero__title">意见反馈</view>
                                <view class="feedback-hero__subtitle">我们认真聆听您的心声</view>
                            </view>
                            <view class="feedback-hero__illustration">
                                <view class="feedback-hero__smile"></view>
                                <view class="feedback-hero__eye feedback-hero__eye--left"></view>
                                <view class="feedback-hero__eye feedback-hero__eye--right"></view>
                            </view>
                        </view>
                    </view>

                    <view class="feedback-body">
                        <view class="feedback-card">
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

                        <view class="feedback-card">
                            <view class="feedback-card__title">请输入您想说的话</view>
                            <view class="feedback-textarea-shell">
                                <textarea
                                    v-model="feedbackContent"
                                    class="feedback-textarea"
                                    maxlength="300"
                                    placeholder=" "
                                    :placeholder-style="'color: transparent;'"
                                ></textarea>
                                <view class="feedback-upload">
                                    <u-icon name="image" size="40" color="#5f5f5f"></u-icon>
                                    <view class="feedback-upload__plus">+</view>
                                </view>
                                <view class="feedback-textarea__count">{{ feedbackContent.length }}/300</view>
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

                        <view class="feedback-submit">提交</view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'face-pay'">
                <view class="face-pay-page">
                    <view class="face-pay-tips">
                        <view class="face-pay-tips__icon">
                            <u-icon name="bell-fill" color="#ffb221" size="46"></u-icon>
                        </view>
                        <view class="face-pay-tips__text">
                            温馨提示：文案填充文案填充文案填充文案填充文案填充文案填充
                        </view>
                    </view>
                    <view class="face-pay-shell">
                        <view class="face-pay-shell__field">
                            <text class="face-pay-shell__label">付款单号</text>
                            <input class="face-pay-shell__input" placeholder="请输入付款单号" />
                        </view>
                        <view class="face-pay-shell__scan">
                            <u-icon name="scan" color="#222222" size="54"></u-icon>
                            <text>扫一扫</text>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'store-detail'">
                <view class="store-detail-page">
                    <view class="store-detail-hero">
                        <image class="store-detail-hero__image" :src="storeDetailHeroImage" mode="aspectFill"></image>
                        <view class="store-detail-hero__mask"></view>

                        <view class="store-detail-hero__top">
                            <view class="store-detail-hero__back" @tap="goBack">
                                <u-icon name="arrow-left" size="34" color="#ffffff"></u-icon>
                            </view>
                            <view class="store-detail-hero__title">店铺详情</view>
                            <image class="store-detail-hero__capsule" :src="storeDetailCapsuleImage" mode="aspectFit"></image>
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

                    <view class="store-detail-address-card">
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
                            :key="item.id || item.goods_id || index"
                            class="store-detail-group-card"
                            @tap="goStoreDetailGroupItem(item)"
                        >
                            <view class="store-detail-group-card__image-shell">
                                <image class="store-detail-group-card__image" :src="item.image" mode="aspectFill"></image>
                            </view>
                            <view class="store-detail-group-card__body">
                                <view class="store-detail-group-card__title line1">{{ item.name }}</view>
                                <view class="store-detail-group-card__meta">{{ item.meta }}</view>
                                <view class="store-detail-group-card__foot">
                                    <view class="store-detail-group-card__price">
                                        <text class="store-detail-group-card__price-symbol">¥</text>
                                        <text class="store-detail-group-card__price-value">{{ item.priceText }}</text>
                                    </view>
                                    <view class="store-detail-group-card__action">去拼团</view>
                                </view>
                            </view>
                        </view>
                    </view>

                    <view v-else-if="storeDetailActiveTab === 'album'" class="store-detail-album-wrap">
                        <view v-if="storeDetailAlbumImages.length" class="store-detail-album-grid">
                            <view
                                v-for="(item, index) in storeDetailAlbumImages"
                                :key="item.id || index"
                                class="store-detail-album-card"
                                @tap="previewStoreDetailAlbum(index)"
                            >
                                <image class="store-detail-album-card__image" :src="item.url" mode="aspectFill"></image>
                            </view>
                        </view>
                        <view v-else class="store-detail-album-empty">
                            <image
                                class="store-detail-album-empty__image"
                                :src="storeDetailAlbumEmptyImage"
                                mode="aspectFit"
                            ></image>
                            <view class="store-detail-album-empty__text">暂无数据</view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'store-qr' || scene === 'goods-qr'">
                <view class="qr-wrap">
                    <view class="qr-card">
                        <view class="qr-card__title">
                            {{ scene === 'store-qr' ? '店铺二维码' : '商品二维码' }}
                        </view>
                        <tki-qrcode
                            ref="qrcode"
                            :val="scene === 'store-qr' ? 'store-demo-001' : 'goods-demo-001'"
                            :size="420"
                            unit="upx"
                            :showLoading="false"
                        />
                        <view class="qr-card__desc">
                            {{ scene === 'store-qr' ? '扫码进入店铺主页' : '扫码查看商品详情' }}
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'store-group'">
                <view class="card">
                    <view class="section-title">团购专区</view>
                    <view class="group-item" v-for="(item, index) in groupList" :key="index">
                        <image class="group-item__image" :src="item.image" mode="aspectFill"></image>
                        <view class="group-item__content">
                            <view class="group-item__title line2">{{ item.name }}</view>
                            <view class="group-item__meta">{{ item.people }}人团 · 已拼{{ item.joined }}件</view>
                            <view class="group-item__foot">
                                <view class="group-item__price">¥{{ item.price }}</view>
                                <view class="mini-btn" @tap="goPage('/pages/goods_details/goods_details?id=1')">去拼团</view>
                            </view>
                        </view>
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
                            <image class="street-header__capsule" :src="streetCapsuleImage" mode="aspectFit"></image>
                        </view>

                        <view class="street-search">
                            <view class="street-search__placeholder">{{ streetSearchText }}</view>
                            <view class="street-search__icon">
                                <image class="street-search__icon-image" :src="streetSearchIcon" mode="aspectFit"></image>
                            </view>
                        </view>
                    </view>

                    <view class="street-sheet">
                        <view class="street-service-grid">
                            <view
                                v-for="item in streetCategories"
                                :key="item.key || item.name"
                                class="street-service-item"
                                @tap="goPage(item.url)"
                            >
                                <view class="street-service-item__icon-shell">
                                    <image class="street-service-item__image" :src="item.image" mode="aspectFit"></image>
                                </view>
                                <text class="street-service-item__text">{{ item.name }}</text>
                            </view>
                        </view>
 
                        <view class="street-merchant-list">
                            <view
                                v-for="(item, index) in streetMerchants"
                                :key="item.shopId || index"
                                class="street-merchant-card"
                                @tap="goPage(item.url)"
                            >
                                <view class="street-merchant-card__image-shell">
                                    <image class="street-merchant-card__image" :src="item.image" mode="aspectFill"></image>
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
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'street-goods' || scene === 'recent-visits'">
                <view class="list-page">
                    <view class="search-shell">
                        <u-search
                            :value="''"
                            :disabled="true"
                            :show-action="false"
                            bg-color="#ffffff"
                            placeholder="输入关键词"
                        ></u-search>
                    </view>
                    <view class="merchant-list">
                        <view
                            class="merchant-list__item"
                            v-for="(item, index) in merchantList"
                            :key="index"
                            @tap="goPage(index === 0 ? '/bundle/pages/business_pages/store_detail' : '/bundle/pages/business_pages/street_goods')"
                        >
                            <image class="merchant-list__image" :src="item.image" mode="aspectFill"></image>
                            <view class="merchant-list__body">
                                <view class="merchant-list__title line1">{{ item.name }}</view>
                                <view class="merchant-list__stars">★★★★★ 5.0</view>
                                <view class="merchant-list__time">营业时间：8:00-16:00</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'payment-record'">
                <view class="payment-record-page">
                    <view class="payment-summary-card">
                        <view class="payment-summary-card__head">
                            <view class="payment-summary-card__title">付款合计</view>
                            <view class="payment-summary-card__filter" @tap="goPage('/bundle/pages/business_pages/payment_filter')">
                                <view class="payment-summary-card__filter-icon">
                                    <view class="payment-summary-card__filter-icon-top"></view>
                                    <view class="payment-summary-card__filter-icon-bottom"></view>
                                </view>
                                <view class="payment-summary-card__filter-lines">
                                    <view></view>
                                    <view></view>
                                    <view></view>
                                </view>
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
                            <text>法币合计（HK$）:</text>
                            <text>{{ paymentRecordSummary.fiatAmount }}</text>
                        </view>
                        <view class="payment-summary-card__line"></view>
                        <view class="payment-summary-card__row">
                            <text>数字币（HK$）:</text>
                            <text>{{ paymentRecordSummary.digitalAmount }}</text>
                        </view>
                    </view>

                    <view class="payment-record-empty">
                        <image class="payment-record-empty__image" :src="paymentRecordEmptyImage" mode="aspectFit"></image>
                        <view class="payment-record-empty__text">暂无数据</view>
                    </view>
                </view>
            </template>

            <template v-else-if="scene === 'payment-filter'">
                <view class="payment-filter-page">
                    <view class="payment-filter-page__backdrop">
                        <view class="wallet-mode wallet-mode--ghost">
                            <view class="wallet-card wallet-card--solid">
                                <view class="wallet-card__label">法币账户(HK$)</view>
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
                            <view class="payment-filter-sheet__section-title">付款方式</view>
                            <view class="payment-filter-sheet__option-row payment-filter-sheet__option-row--two">
                                <view
                                    v-for="item in paymentMethodOptions"
                                    :key="item.label"
                                    :class="['payment-filter-sheet__option', item.active ? 'payment-filter-sheet__option--active' : '']"
                                >
                                    {{ item.label }}
                                </view>
                            </view>
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
                            <view class="payment-filter-sheet__action payment-filter-sheet__action--ghost">重置</view>
                            <view class="payment-filter-sheet__action">确定</view>
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
                        <view class="wallet-card__label">法币账户(HK$)</view>
                        <view class="wallet-card__amount">¥123.34</view>
                        <view class="wallet-card__line"></view>
                        <view class="wallet-card__row">
                            <text>可提现金额</text>
                            <text>¥123.34</text>
                        </view>
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

            <template
                v-else-if="
                    scene === 'about-us' ||
                    scene === 'intro-card' ||
                    scene === 'my-service' ||
                    scene === 'eco-app' ||
                    scene === 'activity-center' ||
                    scene === 'activity-exchange' ||
                    scene === 'auto-points'
                "
            >
                <view class="card">
                    <view class="section-title">{{ sceneConfig.subtitle }}</view>
                    <view class="info-block" v-for="(item, index) in sceneConfig.items" :key="index">
                        <view class="info-block__title">{{ item.title }}</view>
                        <view class="info-block__desc">{{ item.desc }}</view>
                    </view>
                    <template v-if="scene === 'auto-points'">
                        <view class="switch-row">
                            <text>自动领取积分</text>
                            <u-switch v-model="autoPoints"></u-switch>
                        </view>
                    </template>
                </view>
                <view class="primary-btn">{{ sceneConfig.buttonText }}</view>
            </template>

            <template v-else-if="scene === 'pending-payment'">
                <view class="card">
                    <view class="section-title">待付款订单</view>
                    <view class="pending-card" v-for="(item, index) in demoGoods" :key="index">
                        <image class="pending-card__image" :src="item.image"></image>
                        <view class="pending-card__body">
                            <view class="pending-card__title line2">{{ item.name }}</view>
                            <view class="pending-card__meta">订单编号：2026051000{{ index + 1 }}</view>
                            <view class="pending-card__foot">
                                <view class="pending-card__price">¥{{ item.price }}</view>
                                <view class="mini-btn" @tap="goPage('/pages/payment/payment?from=order&order_id=1')">立即付款</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>
        </scroll-view>
    </view>
</template>

<script>
import { getShopDetail, getStreetIndex } from '@/api/store'
import { getDesignAsset, designAssetList, designAssets } from '@/utils/design-assets'

export default {
    props: {
        scene: {
            type: String,
            default: 'feedback'
        },
        storeDetailDefaultTab: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            designAssets,
            selectedTag: '其他',
            feedbackContent: '',
            feedbackContact: '',
            feedbackTags: ['下载/加载问题', '体验功能', '平台问题', '新功能建议', '其他', '违规举报'],
            autoPoints: true,
            demoGoods: [
                {
                    name: '黑白灰色运动鞋',
                    price: '2300',
                    image: '/static/images/goods_null.png'
                },
                {
                    name: '轻便舒适跑步鞋',
                    price: '1899',
                    image: '/static/images/goods_null.png'
                }
            ],
            groupList: [
                {
                    name: '双人精品套餐',
                    people: 2,
                    joined: 129,
                    price: '128',
                    image: '/static/images/goods_null.png'
                },
                {
                    name: '家庭超值套餐',
                    people: 4,
                    joined: 76,
                    price: '268',
                    image: '/static/images/goods_null.png'
                }
            ],
            albumImages: [
                ...designAssetList.sceneAlbum
            ],
            merchantList: [
                {
                    name: '广州市越秀区斌记面家',
                    image: getDesignAsset('/static/lanhu/designs/27-search-list.png')
                },
                {
                    name: '广州市越秀区斌记面家',
                    image: getDesignAsset('/static/lanhu/designs/27-search-list.png')
                },
                {
                    name: '广州市越秀区斌记面家',
                    image: getDesignAsset('/static/lanhu/designs/27-search-list.png')
                }
            ],
            storeDetailCapsuleImage: getDesignAsset('/static/lanhu/slices/street/image_2.png'),
            storeDetailAddressIcon: getDesignAsset('/static/lanhu/slices/street/label_1.png'),
            storeDetailStarIcon: getDesignAsset('/static/lanhu/slices/street/searchlist_star.png'),
            storeDetailTimeIcon: getDesignAsset('/static/lanhu/slices/street/label_3.png'),
            storeDetailAlbumEmptyImage: getDesignAsset('/static/lanhu/assets/store/store_album_empty.png'),
            storeDetailLoadedShopId: '',
            storeDetailActiveTab: 'detail',
            storeDetailData: {
                shopBase: {
                    shopId: '',
                    shopName: '广州市越秀区斌记面家',
                    shopLogo: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                    shopScore: '5.0',
                    businessHours: '8:00-16:00',
                    detailAddress: '广东省东莞市厚街镇12号123街区',
                    openStatus: 'OPEN',
                    avatarUrl: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                    contactPhone: ''
                },
                albums: [],
                videos: [],
                coupons: [],
                groupBuyProducts: [
                    {
                        id: 'group-default-1',
                        goods_id: 1,
                        name: '双人精品套餐',
                        image: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                        price: '128',
                        sales_sum: 129
                    },
                    {
                        id: 'group-default-2',
                        goods_id: 2,
                        name: '家庭超值套餐',
                        image: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                        price: '268',
                        sales_sum: 76
                    }
                ],
                qrcodeInfo: {}
            },
            streetCapsuleImage: getDesignAsset('/static/lanhu/slices/street/image_2.png'),
            streetSearchIcon: getDesignAsset('/static/lanhu/slices/street/searchlist_menu_capsule.png'),
            streetStarIcon: getDesignAsset('/static/lanhu/slices/street/searchlist_star.png'),
            streetTimeIcon: getDesignAsset('/static/lanhu/slices/street/searchlist_time.png'),
            streetSearchText: '输入关键词',
            streetKeyword: '',
            streetLoaded: false,
            streetMerchants: [
                {
                    name: '广州市越秀区斌记面家',
                    score: '5.0',
                    meta: '营业中 · 越秀区北京路 120 号',
                    image: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                    url: '/bundle/pages/business_pages/store_detail'
                },
                {
                    name: '广州市越秀区斌记面家',
                    score: '5.0',
                    meta: '营业中 · 越秀区北京路 120 号',
                    image: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                    url: '/bundle/pages/business_pages/store_detail'
                },
                {
                    name: '广州市越秀区斌记面家',
                    score: '5.0',
                    meta: '营业中 · 越秀区北京路 120 号',
                    image: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                    url: '/bundle/pages/business_pages/store_detail'
                },
                {
                    name: '广州市越秀区斌记面家',
                    score: '5.0',
                    meta: '营业中 · 越秀区北京路 120 号',
                    image: getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                    url: '/bundle/pages/business_pages/store_detail'
                }
            ],
            kycStatusBar: getDesignAsset('/static/lanhu/assets/my/my_status_bar@2x.png'),
            kycMenuCapsule: getDesignAsset('/static/lanhu/assets/my/my_menu_capsule@2x.png'),
            streetCategories: [
                { name: '美食餐饮', image: getDesignAsset('/static/lanhu/slices/street/image_4.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '休闲娱乐', image: getDesignAsset('/static/lanhu/slices/street/image_4_2.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '美容美发', image: getDesignAsset('/static/lanhu/slices/street/image_4_3.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '体育运动', image: getDesignAsset('/static/lanhu/slices/street/image_4_4.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '酒店住宿', image: getDesignAsset('/static/lanhu/slices/street/image_4_5.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '生活服务', image: getDesignAsset('/static/lanhu/slices/street/image_4_6.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '百货日用', image: getDesignAsset('/static/lanhu/slices/street/image_4_7.png'), url: '/bundle/pages/business_pages/street_goods' },
                { name: '养生保健', image: getDesignAsset('/static/lanhu/slices/street/image_4_8.png'), url: '/bundle/pages/business_pages/street_goods' }
            ],
            walletRecords: [
                {
                    title: '订单支付',
                    time: '2026-05-10 10:23:00',
                    amount: '123.00',
                    type: 0
                },
                {
                    title: '账户充值',
                    time: '2026-05-08 18:10:00',
                    amount: '200.00',
                    type: 1
                }
            ],
            paymentRecordSummary: {
                totalAmount: '¥123.34',
                totalCount: '213',
                fiatAmount: '¥123.34',
                digitalAmount: '¥123.34'
            },
            paymentRecordEmptyImage: getDesignAsset('/static/lanhu/designs/28-address-empty.png'),
            paymentMethodOptions: [
                { label: '全部', active: true },
                { label: '法币', active: false }
            ],
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
                    title: '法币余额2'
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
                    title: '法币余额3'
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
                'auto-points': {
                    title: '自动领取积分设置',
                    subtitle: '积分设置',
                    buttonText: '保存设置',
                    items: [
                        { title: '自动领取规则', desc: '订单完成后自动到账，避免漏领。' }
                    ]
                },
                'my-service': {
                    title: '我的-客服',
                    subtitle: '客服服务',
                    buttonText: '联系在线客服',
                    items: [
                        { title: '在线客服', desc: '7x12 小时人工响应。' },
                        { title: '电话支持', desc: '支持电话咨询与问题回访。' }
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
            return this.scene === 'street' || this.scene === 'store-detail' || this.scene === 'user-kyc' || this.scene === 'feedback'
        },
        sceneConfig() {
            return this.sceneMap[this.scene] || this.sceneMap.feedback
        },
        storeDetailView() {
            const shopBase = this.storeDetailData.shopBase || {}
            return {
                shopId: shopBase.shopId || '',
                shopName: shopBase.shopName || '广州市越秀区斌记面家',
                shopScore: this.formatStreetScore(shopBase.shopScore),
                businessHours: shopBase.businessHours || '',
                detailAddress: shopBase.detailAddress || '地址待补充',
                openStatus: shopBase.openStatus || '',
                shopLogo: shopBase.shopLogo || shopBase.avatarUrl || getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                contactPhone: shopBase.contactPhone || ''
            }
        },
        storeDetailHeroImage() {
            return this.storeDetailData.albums?.[0]?.url || this.storeDetailView.shopLogo
        },
        storeDetailCardImage() {
            return this.storeDetailView.shopLogo || this.storeDetailHeroImage
        },
        storeDetailContentImage() {
            return this.storeDetailData.albums?.[0]?.cover || this.storeDetailData.albums?.[0]?.url || this.storeDetailHeroImage
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
        storeDetailBusinessHoursText() {
            if (this.storeDetailView.businessHours) {
                return `营业时间：${this.storeDetailView.businessHours}`
            }
            return this.getStreetOpenStatusLabel(this.storeDetailView.openStatus) || '营业时间待更新'
        },
        storeDetailTabs() {
            const groupCount = this.storeDetailData.groupBuyProducts?.length || 0
            const albumCount = this.storeDetailData.albums?.length || 0
            const videoCount = this.storeDetailData.videos?.length || 0
            return [
                { key: 'detail', label: '商家详情', active: this.storeDetailActiveTab === 'detail' },
                { key: 'group', label: '团购', active: this.storeDetailActiveTab === 'group' },
                { key: 'album', label: '相册', active: this.storeDetailActiveTab === 'album', count: albumCount },
                { key: 'video', label: '视频', active: this.storeDetailActiveTab === 'video', count: videoCount },
                { key: 'comment', label: '评价(0)', active: this.storeDetailActiveTab === 'comment' }
            ]
        },
        storeDetailGroupProducts() {
            const source = (this.storeDetailData.groupBuyProducts || []).length
                ? this.storeDetailData.groupBuyProducts
                : this.groupList
            return source.map((item, index) => ({
                ...item,
                id: item.id || item.goods_id || index,
                name: item.name || item.goods_name || '团购套餐',
                image: item.image || item.goods_image || getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                meta: this.getStoreDetailGroupMeta(item),
                priceText: this.formatStoreDetailPrice(item.price)
            }))
        },
        storeDetailPayUrl() {
            return this.appendShopId('/bundle/pages/business_pages/face_pay')
        }
    },
    watch: {
        scene: {
            immediate: true,
            handler(value) {
                if (value === 'street') {
                    this.loadStreetIndex()
                }
                if (value === 'store-detail') {
                    this.loadStoreDetail()
                }
            }
        }
    },
    mounted() {
        if (this.scene === 'store-detail') {
            this.loadStoreDetail()
        }
    },
    methods: {
        getCurrentPageOptions() {
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1] || {}
            return currentPage.options || currentPage.$page?.options || {}
        },
        appendShopId(url) {
            const shopId = this.storeDetailView.shopId
            if (!shopId) return url
            return `${url}${url.includes('?') ? '&' : '?'}shopId=${shopId}`
        },
        syncStoreDetailActiveTab() {
            const options = this.getCurrentPageOptions()
            const tab = options.tab || options.activeTab || this.storeDetailDefaultTab || ''
            const validTabs = ['detail', 'group', 'album']
            this.storeDetailActiveTab = validTabs.includes(tab) ? tab : 'detail'
        },
        async loadStoreDetail() {
            const options = this.getCurrentPageOptions()
            const shopId = options.shopId || options.shop_id || ''
            this.syncStoreDetailActiveTab()
            if (!shopId || this.storeDetailLoadedShopId === String(shopId)) return
            try {
                const res = await getShopDetail({
                    shopId
                })
                if (res.code != 1 || !res.data) return
                this.storeDetailData = {
                    ...this.storeDetailData,
                    ...res.data
                }
                this.storeDetailLoadedShopId = String(shopId)
            } catch (error) {}
        },
        getStoreDetailGroupMeta(item = {}) {
            if (item.people && item.joined !== undefined) {
                return `${item.people}人团 · 已拼${item.joined}件`
            }
            if (item.sales_sum !== undefined) {
                return `团购商品 · 已拼${item.sales_sum}件`
            }
            return '团购商品'
        },
        formatStoreDetailPrice(value) {
            if (value === '' || value === null || value === undefined) return '0.00'
            const price = Number(value)
            if (Number.isNaN(price)) return String(value)
            return Number.isInteger(price) ? String(price) : price.toFixed(2)
        },
        goStoreDetailGroupItem(item = {}) {
            const goodsId = item.goods_id || item.id || ''
            if (!goodsId) return
            this.goPage(`/pages/goods_details/goods_details?id=${goodsId}`)
        },
        previewStoreDetailAlbum(index = 0) {
            if (!this.storeDetailAlbumImages.length) return
            uni.previewImage({
                current: this.storeDetailAlbumImages[index]?.url || this.storeDetailAlbumImages[0].url,
                urls: this.storeDetailAlbumImages.map(item => item.url)
            })
        },
        onStoreDetailTab(tab) {
            if (!tab || tab.active) return
            if (tab.key === 'detail' || tab.key === 'group' || tab.key === 'album') {
                this.storeDetailActiveTab = tab.key
                return
            }
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
                image: item.image || fallback.image || '',
                categoryId,
                url: categoryId
                    ? `/bundle/pages/business_pages/street_goods?categoryId=${categoryId}`
                    : (fallback.url || '/bundle/pages/business_pages/street_goods'),
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
                image: item.shopLogo || item.image || fallback.image || getDesignAsset('/static/lanhu/slices/street/merchant_thumb.png'),
                meta: metaParts.join(' · ') || fallback.meta || '营业状态待更新',
                url: shopId
                    ? `/bundle/pages/business_pages/store_detail?shopId=${shopId}`
                    : (fallback.url || '/bundle/pages/business_pages/store_detail')
            }
        },
        formatStreetScore(value) {
            if (value === '' || value === null || value === undefined) return '5.0'
            const score = Number(value)
            if (Number.isNaN(score)) return String(value)
            return score.toFixed(1)
        },
        getStreetOpenStatusLabel(status) {
            if (!status) return ''
            if (status === 'OPEN') return '营业中'
            if (status === 'CLOSED') return '未营业'
            if (status === 'REST') return '休息中'
            return status
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

.business-scene__scroll {
    height: calc(100vh - 88rpx - var(--status-bar-height));
}

.business-scene__scroll--full {
    height: 100vh;
}

.feedback-page {
    min-height: 100vh;
    background: #f2f2f2;
}

.feedback-hero {
    padding: calc(var(--status-bar-height) + 10rpx) 30rpx 40rpx;
    background: #ffffff;
}

.feedback-hero__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58rpx;
}

.feedback-back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 58rpx;
    height: 58rpx;
}

.feedback-menu {
    width: 159rpx;
    height: 58rpx;
}

.feedback-hero__body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 78rpx;
}

.feedback-hero__text {
    width: 390rpx;
    padding-top: 14rpx;
}

.feedback-hero__title {
    color: #222222;
    font-size: 58rpx;
    font-weight: 600;
    line-height: 1.08;
}

.feedback-hero__subtitle {
    margin-top: 18rpx;
    color: #222222;
    font-size: 29rpx;
    line-height: 1.3;
}

.feedback-hero__illustration {
    position: relative;
    width: 208rpx;
    height: 174rpx;
    margin-top: 8rpx;
}

.feedback-hero__smile {
    position: absolute;
    left: 8rpx;
    top: 40rpx;
    width: 156rpx;
    height: 156rpx;
    border: 10rpx solid #0f7cf7;
    border-top-color: transparent;
    border-left-color: #0f7cf7;
    border-right-color: #0f7cf7;
    border-radius: 50%;
    transform: rotate(180deg);
    box-sizing: border-box;
}

.feedback-hero__eye {
    position: absolute;
    top: 4rpx;
    width: 22rpx;
    height: 54rpx;
    background: #0f7cf7;
    border-radius: 14rpx;
}

.feedback-hero__eye--left {
    left: 52rpx;
}

.feedback-hero__eye--right {
    left: 110rpx;
}

.feedback-body {
    padding: 22rpx 24rpx 0;
}

.feedback-card {
    padding: 32rpx 28rpx 28rpx;
    margin-bottom: 18rpx;
    background: #ffffff;
    border-radius: 32rpx;
}

.feedback-card__title,
.feedback-contact__title {
    color: #222222;
    font-size: 32rpx;
    font-weight: 700;
    line-height: 1.2;
}

.feedback-tag-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 32rpx;
}

.feedback-tag {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc((100% - 36rpx) / 3);
    height: 62rpx;
    margin-bottom: 20rpx;
    background: #ffffff;
    border: 1rpx solid #d4d4d4;
    border-radius: 6rpx;
    overflow: hidden;
    box-sizing: border-box;
}

.feedback-tag--active {
    border-width: 2rpx;
    border-color: #222222;
}

.feedback-tag__text {
    color: #222222;
    font-size: 28rpx;
    line-height: 1;
}

.feedback-tag__check {
    position: absolute;
    right: -2rpx;
    bottom: -2rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 36rpx;
    background: #222222;
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
    min-height: 376rpx;
    margin-top: 24rpx;
    padding: 18rpx 18rpx 20rpx;
    background: #f4f4f4;
    border-radius: 24rpx;
    box-sizing: border-box;
}

.feedback-textarea {
    width: 100%;
    height: 290rpx;
    padding: 0;
    color: #222222;
    font-size: 28rpx;
    line-height: 38rpx;
    background: transparent;
    box-sizing: border-box;
}

.feedback-upload {
    position: absolute;
    left: 18rpx;
    bottom: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120rpx;
    height: 120rpx;
    background: #ffffff;
    border: 1rpx dashed #d7d7d7;
    border-radius: 16rpx;
    box-sizing: border-box;
}

.feedback-upload__plus {
    position: absolute;
    right: 20rpx;
    bottom: 18rpx;
    color: #666666;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 1;
}

.feedback-textarea__count {
    position: absolute;
    right: 20rpx;
    bottom: 18rpx;
    color: #9d9d9d;
    font-size: 26rpx;
    line-height: 1;
}

.feedback-contact__title {
    margin-top: 40rpx;
}

.feedback-contact-shell {
    height: 96rpx;
    margin-top: 24rpx;
    padding: 0 22rpx;
    background: #f4f4f4;
    border-radius: 24rpx;
    box-sizing: border-box;
}

.feedback-contact {
    width: 100%;
    height: 96rpx;
    color: #222222;
    font-size: 28rpx;
    background: transparent;
}

.feedback-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 540rpx;
    height: 88rpx;
    margin: 40rpx auto 54rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    background: #0f7cf7;
    border-radius: 44rpx;
    box-shadow: 0 10rpx 22rpx rgba(15, 124, 247, 0.18);
}

.card,
.merchant-panel,
.qr-card,
.wallet-mode,
.list-page {
    margin: 24rpx;
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

.group-item,
.merchant-list__item,
.pending-card {
    display: flex;
    padding: 20rpx 24rpx;
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
    width: 180rpx;
    height: 180rpx;
    border-radius: 16rpx;
    background: #eef1f5;
}

.group-item__content,
.pending-card__body {
    flex: 1;
    padding-left: 20rpx;
}

.group-item__title,
.pending-card__title,
.merchant-list__title {
    font-size: 30rpx;
    color: #222222;
    font-weight: 600;
    line-height: 42rpx;
}

.group-item__meta,
.pending-card__meta,
.merchant-list__time,
.record-row__time,
.info-block__desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999999;
    line-height: 36rpx;
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
.merchant-list__stars {
    font-size: 28rpx;
    color: #1f7af4;
    font-weight: 600;
}

.street-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #377df2 0%, #68a3f7 266rpx, #f8f8f8 266rpx, #f8f8f8 100%);
    padding-bottom: 128rpx;
}

.street-header {
    padding: calc(var(--status-bar-height) + 18rpx) 24rpx 22rpx;
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
    padding: 0 29rpx 0 39rpx;
    background: #ffffff;
    border: 2rpx solid rgba(255, 255, 255, 1);
    border-radius: 32rpx 0 32rpx 32rpx;
}

.street-search__placeholder {
    font-size: 22rpx;
    color: #b7b7b7;
    line-height: 22rpx;
}

.street-search__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34rpx;
    height: 34rpx;
}

.street-search__icon-image {
    width: 34rpx;
    height: 34rpx;
}

.street-sheet {
    margin-top: 25rpx;
    background: #f8f8f8;
    border-top-left-radius: 21rpx;
    border-top-right-radius: 21rpx;
    box-shadow: 0 -3rpx 16rpx rgba(224, 224, 224, 0.67);
}

.street-service-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 35rpx 84rpx;
    padding: 56rpx 45rpx 0;
}

.street-service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 102rpx;
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
    padding: 40rpx 24rpx 14rpx;
}

.street-merchant-card {
    display: flex;
    align-items: flex-start;
    min-height: 226rpx;
    margin-bottom: 26rpx;
    background: #ffffff;
    border-radius: 15rpx;
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
    top: calc(var(--status-bar-height) + 18rpx);
    left: 24rpx;
    right: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64rpx;
}

.store-detail-hero__back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 60rpx;
    height: 64rpx;
}

.store-detail-hero__title {
    color: #ffffff;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
}

.store-detail-hero__capsule {
    width: 168rpx;
    height: 64rpx;
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
    margin-right: 3rpx;
}

.store-detail-summary-card__score {
    margin-left: 9rpx;
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

.store-detail-album-wrap {
    min-height: 900rpx;
    padding: 24rpx 24rpx 40rpx;
}

.store-detail-album-grid {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -9rpx;
}

.store-detail-album-card {
    width: calc(50% - 18rpx);
    height: 220rpx;
    margin: 0 9rpx 18rpx;
    overflow: hidden;
    border-radius: 15rpx;
    background: #ffffff;
    box-shadow: 0 10rpx 24rpx rgba(34, 34, 34, 0.05);
}

.store-detail-album-card__image {
    width: 100%;
    height: 100%;
}

.store-detail-album-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 160rpx;
}

.store-detail-album-empty__image {
    width: 430rpx;
    height: 548rpx;
}

.store-detail-album-empty__text {
    margin-top: 28rpx;
    color: #6f6f6f;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
}

.store-detail-group-card {
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
    width: 200rpx;
    height: 200rpx;
}

.store-detail-group-card__body {
    flex: 1;
    min-width: 0;
    padding: 32rpx 20rpx 0 21rpx;
}

.store-detail-group-card__title {
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 28rpx;
}

.store-detail-group-card__meta {
    margin-top: 21rpx;
    color: #999999;
    font-size: 24rpx;
    line-height: 24rpx;
}

.store-detail-group-card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 56rpx;
}

.store-detail-group-card__price {
    display: flex;
    align-items: flex-end;
    color: rgba(245, 34, 34, 1);
    line-height: 1;
}

.store-detail-group-card__price-symbol {
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
}

.store-detail-group-card__price-value {
    margin-left: 4rpx;
    font-size: 35rpx;
    font-weight: 500;
    line-height: 35rpx;
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

.user-kyc-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #cbdaf0 0%, #e3ebf7 23%, #ffffff 43%, #ffffff 100%);
}

.user-kyc-page__hero {
    position: relative;
    min-height: 420rpx;
    padding: 0 24rpx 0;
}

.user-kyc-page__status {
    display: block;
    width: 100%;
    height: 44rpx;
}

.user-kyc-page__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    margin-top: 18rpx;
}

.user-kyc-page__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
}

.user-kyc-page__capsule {
    width: 190rpx;
    height: 82rpx;
}

.user-kyc-page__hero-body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 28rpx;
}

.user-kyc-page__copy {
    width: 372rpx;
    padding-top: 44rpx;
}

.user-kyc-page__title {
    color: #202020;
    font-size: 60rpx;
    line-height: 72rpx;
    font-weight: 800;
}

.user-kyc-page__subtitle {
    margin-top: 18rpx;
    color: #2f2f2f;
    font-size: 28rpx;
    line-height: 40rpx;
}

.user-kyc-page__illustration {
    position: relative;
    width: 270rpx;
    height: 228rpx;
    margin-right: -4rpx;
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
    margin-top: 6rpx;
    padding: 24rpx 28rpx 72rpx;
    background: #ffffff;
    border-radius: 34rpx 34rpx 0 0;
    box-shadow: 0 -8rpx 30rpx rgba(131, 145, 176, 0.08);
}

.user-kyc-page__field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 104rpx;
    border-bottom: 1rpx solid #eef0f4;
}

.user-kyc-page__label,
.user-kyc-page__value {
    color: #202020;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
}

.user-kyc-page__value {
    font-weight: 400;
}

.user-kyc-page__input {
    flex: 1;
    margin-left: 32rpx;
    color: #202020;
    font-size: 30rpx;
    text-align: right;
}

.user-kyc-page__placeholder {
    color: #c5c7cd;
}

.user-kyc-page__section-title {
    margin-top: 34rpx;
    color: #202020;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
}

.user-kyc-page__photo-row {
    display: flex;
    justify-content: space-between;
    margin-top: 32rpx;
}

.user-kyc-page__photo-card {
    position: relative;
    width: 320rpx;
    height: 222rpx;
    overflow: hidden;
    border-radius: 18rpx;
    background: linear-gradient(135deg, #eff4fb 0%, #f8f9fd 52%, #eef4ff 100%);
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

.user-kyc-page__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 610rpx;
    height: 98rpx;
    margin: 290rpx auto 0;
    color: #ffffff;
    font-size: 34rpx;
    font-weight: 700;
    background: linear-gradient(180deg, #1986ff 0%, #0d79f5 100%);
    border-radius: 49rpx;
    box-shadow: 0 14rpx 30rpx rgba(17, 120, 239, 0.2);
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
    min-height: 100vh;
    padding: 24rpx 24rpx 0;
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
    width: 74rpx;
    height: 54rpx;
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

.payment-record-empty__image {
    width: 430rpx;
    height: 300rpx;
}

.payment-record-empty__text {
    margin-top: 14rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #666666;
    line-height: 44rpx;
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
