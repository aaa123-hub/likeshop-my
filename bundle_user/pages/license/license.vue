<template>
    <view :class="['license-page', isClaimVisualStep ? 'license-page--claim-intro' : '', `license-page--claim-${claimStep}`]">
        <view class="license-bg"></view>
        <view :class="['license-nav', isClaimVisualStep ? 'license-nav--claim' : '']">
            <view class="license-nav__back" @tap="goBack">
                <view class="license-nav__arrow"></view>
            </view>
            <view class="license-nav__title">{{ licenseNavTitle }}</view>
            <view class="license-nav__capsule">
                <view class="license-nav__dot"></view>
                <view class="license-nav__divider"></view>
                <view class="license-nav__circle"></view>
            </view>
        </view>

        <view v-if="claimStep === 'intro'" class="claim-intro">
            <view class="claim-intro__hero">
                <view class="claim-intro__lead">仅需<text>2</text>步，<text>免费</text>认领店铺</view>
                <view class="claim-intro__art"></view>
            </view>

            <view class="claim-intro__body">
                <view class="claim-intro__desc">认领成功后即可管理店铺，丰富内容</view>
                <view class="claim-step claim-step--active">
                    <view class="claim-step__num">1</view>
                    <view class="claim-step__title">添加店铺</view>
                </view>
                <view class="claim-step__line"></view>
                <view class="claim-step">
                    <view class="claim-step__num">2</view>
                    <view class="claim-step__title">上传认证材料</view>
                </view>

                <button class="claim-intro__button" @tap="startClaimShop">去添加店铺</button>

                <view v-if="merchantEntryCountText" class="claim-intro__count">{{ merchantEntryCountText }}</view>

                <view class="claim-rule-card">
                    <view class="claim-rule-card__title">商户权益</view>
                    <view class="claim-rule-card__content">
                        <text>1 线上订单在确认收货后立即到账，未及时确认收货的订单，</text>
                        <text>将在15天后自动确认收货，并且积分自动到账。</text>
                        <text>2 线下成功消费的订单，积分立即自动到账</text>
                    </view>
                </view>

                <view class="claim-advantage-card">
                    <view class="claim-advantage-card__badge">入驻优势</view>
                    <view class="claim-advantage-card__content">
                        <text>1 线上订单在确认收货后立即到账，未及时确认收货的订单，</text>
                        <text>将在15天后自动确认收货，并且积分自动到账。</text>
                        <text>2 线下成功消费的订单，积分立即自动到账</text>
                    </view>
                </view>
            </view>
        </view>

        <view v-if="claimStep === 'shop'" class="claim-shop">
            <view class="claim-shop__hero">
                <view class="claim-shop__title-row">
                    <view class="claim-shop__title">选择你的店铺</view>
                    <view v-if="currentCityText" class="claim-shop__city">{{ currentCityText }}<text></text></view>
                </view>
            </view>
            <view class="claim-shop__body">
                <view class="claim-shop__input-row">
                    <input
                        v-model="form.shopName"
                        class="claim-shop__input"
                        placeholder="请输入店铺名称（与招牌一致）"
                        placeholder-class="claim-shop__placeholder"
                        @input="saveDraft"
                    />
                    <view class="claim-shop__search-icon"></view>
                </view>
                <button class="claim-shop__button" @tap="submitClaimShopName">提交我的店铺</button>
            </view>
        </view>

        <view v-if="claimStep === 'details'" class="claim-flow">
            <view class="claim-flow__head">
                <view class="claim-progress">
                    <view class="claim-progress__item claim-progress__item--active"><text>1</text><view>添加店铺</view></view>
                    <view class="claim-progress__line"></view>
                    <view class="claim-progress__item"><text>2</text><view>上传认证材料</view></view>
                </view>
            </view>

            <view class="claim-card claim-card--shop-info">
                <view class="claim-card__title">选择店铺（必填）</view>
                <view class="claim-card__value">{{ form.shopName || '请先填写店铺名称' }}</view>
                <view class="claim-divider"></view>
                <view class="claim-card__title">店铺分类（必填）</view>
                <view class="claim-card__hint">分类错误会影响审核结果，请仔细确认</view>
                <picker mode="selector" :range="industryOptions" range-key="label" :value="industryIndex" @change="onIndustryChange">
                    <view :class="['claim-picker', form.industryId ? '' : 'claim-picker--placeholder']">
                        <text>{{ form.industryId ? industryLabel : '请选择店铺真实分类' }}</text>
                        <text class="claim-picker__arrow">›</text>
                    </view>
                </picker>
                <view class="claim-suggest">
                    <text>你可能想选</text>
                    <view v-if="form.industryId && industryLabel" class="claim-suggest__tag">{{ industryLabel }}</view>
                </view>
            </view>

            <view class="claim-card claim-card--location">
                <view class="claim-card__title">店铺位置（必填）</view>
                <view class="claim-card__hint">地图上的位置和详细地址至少填一项</view>
                <view class="claim-map" @tap="chooseShopLocation">
                    <view class="claim-map__pin"></view>
                    <view class="claim-map__text">{{ hasShopLocation ? '已选择商户位置' : '点击选择商户位置' }}</view>
                </view>
                <view class="claim-card__title claim-card__title--sub">详细地址</view>
                <picker
                    mode="multiSelector"
                    :range="regionPickerColumns"
                    range-key="label"
                    :value="regionPickerValue"
                    @columnchange="onRegionColumnChange"
                    @change="onRegionConfirm"
                >
                    <view :class="['claim-picker', selectedRegionText ? '' : 'claim-picker--placeholder']">
                        <text>{{ selectedRegionText || '选择城市' }}</text>
                        <text class="claim-picker__arrow">›</text>
                    </view>
                </picker>
                <input
                    v-model="form.detailAddress"
                    class="claim-address-input"
                    placeholder="请输入详细地址"
                    placeholder-class="claim-input-placeholder"
                    @input="saveDraft"
                />
            </view>

            <view class="claim-action-block">
                <button class="claim-primary-btn" @tap="submitClaimDetails">信息无误，下一步</button>
                <view class="claim-free-badge">免费</view>
            </view>
        </view>

        <view v-if="claimStep === 'realname'" class="claim-flow">
            <view class="claim-flow__head">
                <view class="claim-progress claim-progress--done">
                    <view class="claim-progress__item claim-progress__item--active"><text>1</text><view>添加店铺</view></view>
                    <view class="claim-progress__line"></view>
                    <view class="claim-progress__item claim-progress__item--active"><text>2</text><view>上传认证材料</view></view>
                </view>
            </view>

            <view class="claim-realname-title">
                解锁 <text>{{ form.shopName || form.merchantName || '当前店铺' }}</text> 的管理权益，请上传您的实名信息
            </view>

            <view class="claim-card claim-card--realname">
                <view class="claim-kyc-panel">
                    <view>
                        <view class="claim-kyc-panel__title">{{ kycApproved ? '检测到您的账号已关联实名信息' : '当前账号暂未完成实名认证' }}</view>
                        <view class="claim-kyc-panel__value">{{ kycApproved ? maskedContactMobile : kycStatusText }}</view>
                    </view>
                    <button class="claim-kyc-panel__btn" @tap="goKyc">{{ kycApproved ? '查看实名' : '点击授权' }}</button>
                </view>
                <view class="claim-form-line">
                    <text>姓名</text>
                    <input v-model="form.contactName" placeholder="请输入本人姓名" placeholder-class="claim-input-placeholder" @input="saveDraft" />
                </view>
                <view class="claim-form-line">
                    <text>身份证号</text>
                    <view class="claim-form-line__value">{{ kycApproved ? '已通过实名校验' : '请前往实名认证填写' }}</view>
                </view>
            </view>

            <view class="claim-card claim-card--phone">
                <view class="claim-form-line">
                    <text>手机号</text>
                    <input v-model="form.contactMobile" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="claim-input-placeholder" @input="saveDraft" />
                </view>
                <view class="claim-form-line claim-form-line--code">
                    <text>验证码</text>
                    <input disabled placeholder="请输入验证码" placeholder-class="claim-input-placeholder" />
                    <button @tap="showCodeDisabledTip">获取验证码</button>
                </view>
                <view class="claim-check-row">
                    <view class="claim-check-row__box"></view>
                    <text>该号码可作为营业电话，方便顾客咨询</text>
                    <text class="claim-check-row__help">?</text>
                </view>
                <view class="claim-face-link" @tap="goKyc">切换人脸识别认证</view>
            </view>

            <view class="claim-bottom-actions">
                <view class="claim-help">帮助</view>
                <view class="claim-button-row">
                    <button class="claim-secondary-btn" @tap="claimStep = 'details'">上一步</button>
                    <button class="claim-primary-btn claim-primary-btn--wide" @tap="submitClaimRealname">提交实名信息，进入下一步</button>
                </view>
                <view class="claim-agreement">
                    <view class="claim-check-row__box"></view>
                    <text>同意</text><text class="claim-agreement__link">《门店认领协议》</text><text>并授权手机号注册商家账号</text>
                </view>
            </view>
        </view>

        <view v-if="claimStep === 'materials'" class="claim-flow">
            <view class="claim-flow__head">
                <view class="claim-progress claim-progress--done">
                    <view class="claim-progress__item claim-progress__item--active"><text>1</text><view>添加店铺</view></view>
                    <view class="claim-progress__line"></view>
                    <view class="claim-progress__item claim-progress__item--active"><text>2</text><view>上传认证材料</view></view>
                </view>
            </view>

            <view class="claim-card claim-card--materials">
                <view class="claim-card__title">上传营业执照</view>
                <view class="claim-card__hint">请上传 <text>{{ form.shopName || form.merchantName || '当前店铺' }}</text> 最新营业执照</view>
                <view class="claim-license-upload" @tap="chooseImage('licenseImageUrl')">
                    <image v-if="form.licenseImageUrl" :src="form.licenseImageUrl" mode="aspectFit"></image>
                    <view v-else class="claim-upload-empty">
                        <view>+</view>
                        <text>上传营业执照</text>
                    </view>
                </view>

                <view class="claim-card__title claim-card__title--sub">上传{{ form.legalPerson || form.contactName || '经营者' }}的身份证明</view>
                <view class="claim-id-upload-row">
                    <view class="claim-id-upload" @tap="chooseImage('legalIdFrontUrl')">
                        <image v-if="form.legalIdFrontUrl" :src="form.legalIdFrontUrl" mode="aspectFit"></image>
                        <view v-else class="claim-upload-empty"><view>+</view><text>上传身份证人像面</text></view>
                    </view>
                    <view class="claim-id-upload" @tap="chooseImage('legalIdBackUrl')">
                        <image v-if="form.legalIdBackUrl" :src="form.legalIdBackUrl" mode="aspectFit"></image>
                        <view v-else class="claim-upload-empty"><view>+</view><text>上传身份证国徽面</text></view>
                    </view>
                </view>
                <view class="claim-safe-tip">所有图片仅用于审核，平台确保你的信息安全</view>
            </view>

            <view class="claim-bottom-actions claim-bottom-actions--materials">
                <view class="claim-material-tip" @tap="submitClaimMaterialsWithoutAll">资料不全? <text>以实名提交审核</text></view>
                <view class="claim-help">帮助</view>
                <view class="claim-button-row">
                    <button class="claim-secondary-btn" @tap="claimStep = 'realname'">上一步</button>
                    <button class="claim-primary-btn claim-primary-btn--wide" @tap="submitClaimMaterials">提交资质信息</button>
                </view>
                <view class="claim-agreement claim-agreement--short">
                    <view class="claim-check-row__box"></view>
                    <text>同意</text><text class="claim-agreement__link">《门户服务合同》</text>
                </view>
            </view>
        </view>

        <view v-if="claimStep === 'form'" class="license-hero">
            <view class="license-hero__title">商家入驻申请</view>
            <view class="license-hero__desc">提交主体、证照、店铺和微信商户号，审核通过后开通商家后台权限。</view>
        </view>

        <view class="status-card" v-if="claimStep === 'form' && !kycApproved && !kycRedirecting">
            <view class="status-card__head">
                <view>
                    <view class="status-card__label">实名认证</view>
                    <view class="status-card__value status-card__value--danger">{{ kycStatusText }}</view>
                </view>
                <view class="status-pill status-pill--danger">需先实名</view>
            </view>
            <view class="status-card__remark">只有实名认证审核通过后，才能提交商家入驻申请。</view>
            <view class="kyc-action" @tap="goKyc">去实名认证</view>
        </view>

        <view class="status-card" v-if="claimStep === 'form' && auditStatus">
            <view class="status-card__head">
                <view>
                    <view class="status-card__label">当前状态</view>
                    <view :class="['status-card__value', 'status-card__value--' + statusClass]">{{ statusText }}</view>
                </view>
                <view :class="['status-pill', 'status-pill--' + statusClass]">{{ statusPillText }}</view>
            </view>
            <view class="status-card__meta" v-if="status.applicationNo">申请编号：{{ status.applicationNo }}</view>
            <view class="status-card__remark" v-if="statusRemark">{{ statusRemark }}</view>
            <view class="status-card__time" v-if="statusTime">更新时间：{{ statusTime }}</view>
        </view>

        <view class="approved-card" v-if="claimStep === 'form' && isApproved">
            <view class="approved-card__title">商家入驻已通过</view>
            <view class="approved-card__row"><text>商户名称</text><text>{{ form.merchantName || '-' }}</text></view>
            <view class="approved-card__row"><text>店铺名称</text><text>{{ form.shopName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系人</text><text>{{ form.contactName || '-' }}</text></view>
            <view class="approved-card__row"><text>联系电话</text><text>{{ form.contactMobile || '-' }}</text></view>
            <view class="approved-card__row"><text>经营类型</text><text>{{ merchantTypeLabel }}</text></view>
            <view class="approved-card__row"><text>微信商户号</text><text>{{ maskedWechatMerchantNo }}</text></view>
            <view class="approved-card__row approved-card__row--address"><text>经营地址</text><text>{{ fullAddressText || '-' }}</text></view>
        </view>

        <view v-if="claimStep === 'form' && !isApproved && kycApproved" class="license-form">
            <view class="form-section" v-if="requiresAccountCredentials || readonlyBackendUsername">
                <view class="form-section__title">后台账号</view>
                <view class="form-section__desc">
                    {{ readonlyBackendUsername ? '当前小程序账号已绑定后台账号，本次申请将复用已有账号。' : '首次申请商家需要设置后台管理系统登录账号。' }}
                </view>
                <view class="account-fields">
                    <view :class="['form-row', readonlyBackendUsername ? 'form-row--readonly' : '']">
                        <text class="form-label required">登录账号</text>
                        <input class="form-input" v-model="form.username" :disabled="readonlyBackendUsername" placeholder="例如 merchant_51" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row" v-if="requiresBackendPassword">
                        <text class="form-label required">登录密码</text>
                        <input class="form-input" v-model="form.password" password placeholder="请设置至少 6 位密码" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="account-tip" v-else>当前账号已绑定后台账号，本次申请将复用已有账号，无需重新填写登录账号和密码。</view>

            <view class="form-section">
                <view class="form-section__title">主体信息</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">商户名称</text>
                        <input class="form-input" v-model="form.merchantName" placeholder="请输入营业执照主体名称" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--picker">
                        <text class="form-label required">商户类型</text>
                        <picker class="form-picker-wrap" mode="selector" :range="merchantTypeOptions" range-key="label" :value="merchantTypeIndex" @change="onMerchantTypeChange">
                            <view class="form-picker">{{ merchantTypeLabel }}</view>
                        </picker>
                    </view>
                    <view class="form-row">
                        <text class="form-label required">联系人</text>
                        <input class="form-input" v-model="form.contactName" placeholder="请输入联系人姓名" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row">
                        <text class="form-label required">联系电话</text>
                        <input class="form-input" v-model="form.contactMobile" type="number" maxlength="11" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">法人及证照</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">法人姓名</text>
                        <input class="form-input" v-model="form.legalPerson" placeholder="请输入法人或经营者姓名" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide">
                        <text class="form-label form-label--long required">统一社会信用代码</text>
                        <input class="form-input" v-model="form.licenseNo" placeholder="请输入营业执照编号" placeholder-class="form-placeholder" />
                    </view>
                </view>
                <view class="upload-grid">
                    <view v-for="item in requiredUploadItems" :key="item.field" class="upload-item">
                        <view class="upload-item__title"><text class="upload-item__required">*</text>{{ item.title }}</view>
                        <view class="upload-item__box" @tap="chooseImage(item.field)">
                            <image v-if="form[item.field]" class="upload-item__image" :src="form[item.field]" mode="aspectFit"></image>
                            <view v-else class="upload-item__empty">
                                <view class="upload-item__plus">+</view>
                                <view class="upload-item__tip">上传图片</view>
                            </view>
                            <view v-if="form[item.field]" class="upload-item__remove" @tap.stop="removeImage(item.field)">×</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">店铺与收款</view>
                <view class="form-section__desc">请补充店铺展示资料，平台审核通过后会同步到后台店铺详情。</view>
                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">店铺名称</text>
                        <input class="form-input" v-model="form.shopName" placeholder="请输入店铺展示名称" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--picker">
                        <text class="form-label required">行业分类</text>
                        <picker class="form-picker-wrap" mode="selector" :range="industryOptions" range-key="label" :value="industryIndex" @change="onIndustryChange">
                            <view class="form-picker">{{ industryLabel }}</view>
                        </picker>
                    </view>
                    <view class="form-row">
                        <text class="form-label">营业时间</text>
                        <input class="form-input" v-model="form.businessHours" placeholder="例如 09:00-22:00" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide form-row--textarea">
                        <text class="form-label">店铺简介</text>
                        <textarea class="form-textarea" v-model="form.shopDescription" placeholder="请输入店铺介绍、主营业务或服务特色" placeholder-class="form-placeholder" />
                    </view>
                </view>

                <view class="shop-media-card">
                    <view class="shop-media-card__head">
                        <view>
                            <view class="shop-media-card__title">店铺展示资料</view>
                            <view class="shop-media-card__desc">店铺 Logo 和门店照片为必填，审核端会用这些资料查看店铺详情。</view>
                        </view>
                        <view class="shop-media-card__badge">必填</view>
                    </view>
                    <view class="upload-grid upload-grid--shop">
                        <view class="upload-item">
                            <view class="upload-item__title"><text class="upload-item__required">*</text>店铺 Logo</view>
                            <view class="upload-item__box" @tap="chooseImage('shopLogoUrl')">
                                <image v-if="form.shopLogoUrl" class="upload-item__image" :src="form.shopLogoUrl" mode="aspectFit"></image>
                                <view v-else class="upload-item__empty"><view class="upload-item__plus">+</view><view class="upload-item__tip">上传 Logo</view></view>
                                <view v-if="form.shopLogoUrl" class="upload-item__remove" @tap.stop="removeImage('shopLogoUrl')">×</view>
                            </view>
                        </view>
                        <view v-for="(url, index) in form.shopImageUrls" :key="url + index" class="upload-item">
                            <view class="upload-item__title">门店照片 {{ index + 1 }}</view>
                            <view class="upload-item__box">
                                <image class="upload-item__image" :src="url" mode="aspectFit"></image>
                                <view class="upload-item__remove" @tap.stop="removeShopImage(index)">×</view>
                            </view>
                        </view>
                        <view class="qualification-add qualification-add--shop" v-if="form.shopImageUrls.length < 6" @tap="chooseShopImages">
                            <view class="qualification-add__inner"><view class="qualification-add__plus">+</view><view class="qualification-add__text">上传门店照片</view></view>
                        </view>
                    </view>
                    <view class="shop-media-card__tip">至少上传 1 张门店照片，最多 6 张。</view>
                </view>

                <view class="form-grid">
                    <view class="form-row">
                        <text class="form-label required">微信商户号</text>
                        <input class="form-input" v-model="form.wechatMerchantNo" type="number" placeholder="请输入微信支付商户号" placeholder-class="form-placeholder" />
                    </view>
                    <picker
                        class="form-row form-row--wide form-row--picker"
                        mode="multiSelector"
                        :range="regionPickerColumns"
                        range-key="label"
                        :value="regionPickerValue"
                        @columnchange="onRegionColumnChange"
                        @change="onRegionConfirm"
                    >
                        <view>
                            <text class="form-label required">经营区域</text>
                            <view :class="['form-picker', selectedRegionText ? '' : 'form-picker--placeholder']">
                                {{ selectedRegionText || (regionOptions.length ? '请选择省 / 市 / 区' : '区域数据加载中') }}
                            </view>
                        </view>
                    </picker>
                    <view class="form-row form-row--wide">
                        <text class="form-label required">详细地址</text>
                        <input class="form-input" v-model="form.detailAddress" placeholder="请输入省市区及详细地址" placeholder-class="form-placeholder" />
                    </view>
                    <view class="form-row form-row--wide">
                        <view class="map-picker">
                            <view class="map-picker__main">
                                <text class="form-label required">店铺地图位置</text>
                                <view :class="['map-picker__value', hasShopLocation ? '' : 'map-picker__value--placeholder']">
                                    {{ shopLocationText || '请选择店铺所在位置' }}
                                </view>
                                <view class="map-picker__coord" v-if="hasShopLocation">
                                    经度 {{ form.longitude }} / 纬度 {{ form.latitude }}
                                </view>
                            </view>
                            <view class="map-picker__btn" @tap="chooseShopLocation">{{ hasShopLocation ? '重新选择' : '地图选点' }}</view>
                        </view>
                    </view>
                </view>

                <view class="form-section__subtitle">店铺视频</view>
                <view class="video-list">
                    <view v-for="(url, index) in form.shopVideoUrls" :key="url + index" class="video-item">
                        <text class="video-item__text">{{ url }}</text>
                        <text class="video-item__remove" @tap="removeShopVideo(index)">删除</text>
                    </view>
                    <view class="video-add" v-if="form.shopVideoUrls.length < 3" @tap="chooseShopVideos">上传店铺视频</view>
                </view>
            </view>

            <view class="form-section">
                <view class="form-section__title">行业资质</view>
                <view class="form-section__desc">食品经营许可证、行业许可或其他补充材料，可上传多张。</view>
                <view class="qualification-list">
                    <view v-for="(url, index) in form.qualificationUrls" :key="url + index" class="qualification-item">
                        <image class="qualification-item__image" :src="url" mode="aspectFit"></image>
                        <view class="qualification-item__remove" @tap="removeQualification(index)">×</view>
                    </view>
                    <view class="qualification-add" @tap="chooseQualification">
                        <view class="qualification-add__inner"><view class="qualification-add__plus">+</view><view class="qualification-add__text">上传资质</view></view>
                    </view>
                </view>
            </view>
        </view>

        <view v-if="claimStep === 'form' && !isApproved && kycApproved" class="submit-bar">
            <view class="submit-btn" :class="{ 'submit-btn--disabled': submitting || isPending }" @tap="submitApply">
                {{ submitting ? '提交中...' : submitButtonText }}
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { localizeBackendText, normalizeBackendCode } from '@/utils/backend-text'
import { uploadFile } from '@/utils/tools'
import {
    getKycStatus,
    getOnboardingContext,
    getMerchantIndustries,
    getMiniappRegions,
    getMerchantApplicationStatus,
    resubmitMerchantApplication,
    submitMerchantApplication
} from '@/api/user'

const merchantTypeOptions = [
    { label: '企业/公司', value: 'COMPANY' },
    { label: '个体工商户', value: 'INDIVIDUAL' },
    { label: '个人经营者', value: 'PERSONAL' }
]

const defaultIndustryOptions = [
    { label: '请选择行业分类', value: '' }
]

function firstValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '') || ''
}

function normalizeUrlList(value) {
    if (!value) return []
    let list = value
    if (typeof list === 'string') {
        const text = list.trim()
        if (!text) return []
        try {
            list = JSON.parse(text)
        } catch (error) {
            list = text.split(/[,，]/)
        }
    }
    if (!Array.isArray(list)) list = [list]
    return list.map(item => typeof item === 'string' ? item.trim() : firstValue(item.url, item.fileUrl, item.file_url, item.imageUrl, item.image_url, item.path, item.uri)).filter(Boolean)
}

function normalizeUploadUrl(res = {}) {
    return firstValue(res.url, res.fileUrl, res.file_url, res.uri, res.path, res.data && res.data.url, res.data && res.data.fileUrl, res.data && res.data.file_url, res.data && res.data.path)
}

function cloneForm(form = {}) {
    return JSON.parse(JSON.stringify(form))
}

function hasSubmittedMerchantApplication(data = {}) {
    const status = normalizeBackendCode(data.auditStatus || data.audit_status || data.applyStatus || data.apply_status || data.applicationStatus || data.application_status || data.status || '')
    return Boolean(
        data.applicationNo
        || data.application_no
        || data.merchantId
        || data.merchant_id
        || data.merchantName
        || data.merchant_name
        || data.shopName
        || data.shop_name
        || (status && status !== 'NOT_SUBMITTED')
    )
}

function normalizeRegionOptions(source = []) {
    const list = Array.isArray(source)
        ? source
        : source.tree || source.list || source.records || source.items || source.regions || source.regionOptions || source.region_options || source.children || []
    const normalized = (Array.isArray(list) ? list : []).map(item => normalizeRegionOption(item)).filter(item => item.label && item.value)
    if (normalized.length === 1 && String(normalized[0].value).toUpperCase() === 'CN' && normalized[0].children && normalized[0].children.length) {
        return normalized[0].children
    }
    return normalized
}

function normalizeRegionOption(item = {}) {
    if (typeof item === 'string') return { label: item, value: item, children: [] }
    const label = item.label || item.name || item.regionName || item.region_name || item.areaName || item.area_name || item.provinceName || item.province_name || item.cityName || item.city_name || item.districtName || item.district_name || ''
    const value = item.value || item.code || item.regionCode || item.region_code || item.areaCode || item.area_code || item.provinceCode || item.province_code || item.cityCode || item.city_code || item.districtCode || item.district_code || item.id || label
    const children = item.children || item.childList || item.child_list || item.list || item.cities || item.cityList || item.city_list || item.districts || item.districtList || item.district_list || []
    return {
        ...item,
        label,
        value,
        children: normalizeRegionOptions(children)
    }
}

export default {
    data() {
        return {
            merchantTypeOptions,
            form: {
                username: '',
                password: '',
                merchantName: '',
                merchantType: 'COMPANY',
                contactName: '',
                contactMobile: '',
                legalPerson: '',
                licenseNo: '',
                licenseUrl: '',
                licenseImageUrl: '',
                legalIdFrontUrl: '',
                legalIdBackUrl: '',
                qualificationUrls: [],
                shopName: '',
                shopLogoUrl: '',
                shopImageUrls: [],
                shopVideoUrls: [],
                shopDescription: '',
                businessHours: '',
                industryId: '',
                wechatMerchantNo: '',
                provinceCode: '',
                provinceName: '',
                cityCode: '',
                cityName: '',
                districtCode: '',
                districtName: '',
                detailAddress: '',
                longitude: '',
                latitude: ''
            },
            regionCodeText: '',
            regionOptions: [],
            regionPickerValue: [0, 0, 0],
            regionPickerColumns: [[], [], []],
            industryOptions: defaultIndustryOptions.map(item => ({ ...item })),
            status: {},
            kycStatus: {},
            onboardingContext: {},
            kycRedirecting: false,
            submitting: false,
            statusLoading: false,
            applyingRemoteStatus: false,
            dirtyForm: false,
            claimStep: 'form',
            suppressNextShowReload: false,
            requiredUploadItems: [
                { title: '营业执照', field: 'licenseImageUrl' },
                { title: '身份证人像面', field: 'legalIdFrontUrl' },
                { title: '身份证国徽面', field: 'legalIdBackUrl' }
            ]
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        isClaimVisualStep() {
            return ['intro', 'shop', 'details', 'realname', 'materials'].includes(this.claimStep)
        },
        licenseNavTitle() {
            return this.isClaimVisualStep ? '认领店铺' : '商家入驻'
        },
        userId() {
            const info = this.userInfo || {}
            return info.user_id || info.userId || info.id
        },
        kycStatusCode() {
            return normalizeBackendCode(this.kycStatus.kycStatus || this.kycStatus.kyc_status || this.kycStatus.auditStatus || this.kycStatus.status || '')
        },
        kycApproved() {
            return ['APPROVED', 'SUCCESS', 'VERIFIED', 'PASS', 'PASSED'].includes(this.kycStatusCode)
        },
        kycStatusText() {
            const map = { PENDING_AUDIT: '审核中', PENDING: '审核中', REJECTED: '未通过', NOT_SUBMITTED: '未提交', INIT: '未提交' }
            return this.kycApproved ? '已通过' : (map[this.kycStatusCode] || '未提交')
        },
        merchantTypeIndex() {
            const index = this.merchantTypeOptions.findIndex(item => item.value === this.form.merchantType)
            return index === -1 ? 0 : index
        },
        merchantTypeLabel() {
            return (this.merchantTypeOptions[this.merchantTypeIndex] || this.merchantTypeOptions[0]).label
        },
        industryIndex() {
            const industryId = String(this.form.industryId || '')
            const index = this.industryOptions.findIndex(item => String(item.value) === industryId)
            return index === -1 ? 0 : index
        },
        industryLabel() {
            return (this.industryOptions[this.industryIndex] || this.industryOptions[0]).label
        },
        merchantEntryCountText() {
            const context = this.onboardingContext || {}
            const count = firstValue(
                context.merchantCount,
                context.merchant_count,
                context.settledMerchantCount,
                context.settled_merchant_count,
                context.shopCount,
                context.shop_count
            )
            if (count === '') return ''
            return `当前已有${count}商户入驻`
        },
        currentCityText() {
            return firstValue(
                this.form.cityName,
                this.form.provinceName,
                this.onboardingContext.cityName,
                this.onboardingContext.city_name,
                this.onboardingContext.currentCity,
                this.onboardingContext.current_city,
                ''
            )
        },
        auditStatus() {
            return normalizeBackendCode(this.status.auditStatus || this.status.audit_status || this.status.applyStatus || this.status.apply_status || this.status.status || '')
        },
        statusRemark() {
            return localizeBackendText(this.status.auditRemark || this.status.audit_remark || this.status.remark || '', '')
        },
        statusTime() {
            return this.formatDisplayTime(this.status.updatedAt || this.status.updated_at || this.status.updateTime || this.status.createTime || this.status.createdAt || '')
        },
        statusText() {
            const map = {
                NOT_SUBMITTED: '未提交',
                PENDING: '审核中',
                PENDING_AUDIT: '审核中',
                WAIT_AUDIT: '审核中',
                AUDITING: '审核中',
                APPROVED: '已通过',
                SUCCESS: '已通过',
                REJECTED: '未通过',
                FAILED: '未通过'
            }
            return map[this.auditStatus] || '未提交'
        },
        statusPillText() {
            if (this.isApproved) return '审核通过'
            if (this.isRejected) return '请修改后重提'
            if (this.isPending) return '平台审核中'
            return '待提交'
        },
        statusClass() {
            if (this.isApproved) return 'success'
            if (this.isRejected) return 'danger'
            if (this.isPending) return 'pending'
            return 'default'
        },
        isApproved() {
            return ['APPROVED', 'PASS', 'PASSED', 'SUCCESS'].includes(this.auditStatus)
        },
        isRejected() {
            return ['REJECTED', 'REJECT', 'FAILED', 'FAIL'].includes(this.auditStatus)
        },
        isPending() {
            return ['SUBMITTED', 'PENDING', 'PENDING_AUDIT', 'WAIT_AUDIT', 'AUDITING'].includes(this.auditStatus)
        },
        submitButtonText() {
            if (this.isPending) return '审核中'
            if (this.isRejected) return '重新提交'
            return this.auditStatus && this.auditStatus !== 'NOT_SUBMITTED' ? '重新提交' : '提交入驻申请'
        },
        hasExistingPlatformAccount() {
            const context = this.onboardingContext || {}
            const account = context.backendAccount || context.backend_account || {}
            return Boolean(context.hasBackendAccount || context.has_backend_account || account.username || context.backendUsername || context.backend_username || this.status.username || this.status.backendUsername)
        },
        requiresAccountCredentials() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            if (hints.showBackendAccountFields === false) return false
            return !this.hasExistingPlatformAccount
        },
        requiresBackendUsername() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            if (hints.requireBackendUsername === false) return false
            return this.requiresAccountCredentials
        },
        requiresBackendPassword() {
            const hints = (this.onboardingContext && (this.onboardingContext.uiHints || this.onboardingContext.ui_hints)) || {}
            if (hints.requireBackendPassword === false) return false
            return this.requiresAccountCredentials
        },
        readonlyBackendUsername() {
            return !this.requiresBackendUsername && Boolean(this.form.username)
        },
        maskedWechatMerchantNo() {
            const value = String(this.form.wechatMerchantNo || '')
            if (!value) return '-'
            if (value.length <= 8) return value
            return `${value.slice(0, 4)} **** ${value.slice(-4)}`
        },
        fullAddressText() {
            return [this.form.provinceName || this.form.provinceCode, this.form.cityName || this.form.cityCode, this.form.districtName || this.form.districtCode, this.form.detailAddress].filter(Boolean).join(' ')
        },
        hasShopLocation() {
            return Boolean(this.form.longitude && this.form.latitude)
        },
        shopLocationText() {
            return this.hasShopLocation ? (this.fullAddressText || '已选择店铺位置') : ''
        },
        selectedRegionText() {
            return [this.form.provinceName, this.form.cityName, this.form.districtName].filter(Boolean).join(' / ')
        },
        maskedContactMobile() {
            const value = String(this.form.contactMobile || this.userInfo.mobile || this.userInfo.phone || '')
            if (!value) return '已关联实名信息'
            if (value.length < 7) return value
            return `${value.slice(0, 2)}******${value.slice(-2)}`
        }
    },
    onLoad(options = {}) {
        this.applyClaimStepOption(options.step || options.claimStep || '')
        Promise.resolve(this.$store.dispatch('getUser')).finally(() => {
            this.restoreDraft()
            this.prefillFromUser()
            this.loadInitialData()
        })
    },
    onShow() {
        if (this.kycRedirecting) return
        if (this.suppressNextShowReload) {
            this.suppressNextShowReload = false
            return
        }
        this.prefillFromUser()
        if (this.userId) this.loadInitialData()
    },
    onPullDownRefresh() {
        Promise.resolve(this.loadInitialData()).finally(() => uni.stopPullDownRefresh())
    },
    methods: {
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
                return
            }
            uni.switchTab({ url: '/pages/user/user' })
        },
        loadInitialData() {
            if (!this.userId) return Promise.resolve()
            return Promise.all([this.getKyc(), this.getOnboardingContext(), this.getIndustries(), this.getRegions(), this.getStatus()])
        },
        getKyc() {
            return getKycStatus({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) {
                    this.kycStatus = res.data
                    this.applyKycToForm(res.data)
                }
            }).catch(() => {})
        },
        getOnboardingContext() {
            return getOnboardingContext({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) {
                    this.onboardingContext = res.data
                    const account = res.data.backendAccount || res.data.backend_account || {}
                    this.form.username = firstValue(res.data.backendUsername, res.data.backend_username, account.username, this.form.username)
                    this.applyKycToForm(res.data.reusableProfile || res.data.reusable_profile || res.data)
                    this.applyRegionOptions(res.data)
                }
            }).catch(() => {})
        },
        applyKycToForm(data = {}) {
            this.form.contactName = firstValue(this.form.contactName, data.realName, data.real_name, data.applicantName, data.applicant_name)
            this.form.legalPerson = firstValue(this.form.legalPerson, data.realName, data.real_name, data.applicantName, data.applicant_name)
            this.form.legalIdFrontUrl = firstValue(this.form.legalIdFrontUrl, data.certFrontUrl, data.cert_front_url)
            this.form.legalIdBackUrl = firstValue(this.form.legalIdBackUrl, data.certBackUrl, data.cert_back_url)
        },
        getIndustries() {
            return getMerchantIndustries({ show: false }).then(res => {
                const list = res.code == 1 && res.data ? (res.data.list || []) : []
                if (list.length) {
                    this.industryOptions = [
                        { label: '请选择行业分类', value: '' },
                        ...list.map(item => ({
                            label: item.label || item.name || item.industryName || item.industry_name,
                            value: item.value || item.id || item.industryId || item.industry_id || item.code || item.industryCode || item.industry_code
                        })).filter(item => item.label && item.value !== undefined && item.value !== null && item.value !== '')
                    ]
                }
            }).catch(() => {})
        },
        getRegions() {
            return getMiniappRegions({ tree: true, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyRegionOptions(res.data)
            }).catch(() => {
                this.refreshRegionColumns()
            })
        },
        applyRegionOptions(source = {}) {
            const tree = normalizeRegionOptions(source.areaOptions || source.area_options || source.regionOptions || source.region_options || source.tree || source.list || source.regions || source)
            if (tree.length) this.regionOptions = tree
            this.syncRegionPickerValueByForm()
        },
        getStatus() {
            if (this.statusLoading) return Promise.resolve()
            this.statusLoading = true
            return getMerchantApplicationStatus({ userId: this.userId, show: false }).then(res => {
                if (res.code == 1 && res.data) this.applyStatusToForm(res.data)
            }).catch(() => {}).finally(() => {
                this.statusLoading = false
            })
        },
        applyStatusToForm(data = {}) {
            this.status = data
            if (!hasSubmittedMerchantApplication(data)) {
                this.restoreDraft()
                return
            }
            this.applyingRemoteStatus = true
            this.form.username = firstValue(data.backendUsername, data.backend_username, data.username, this.form.username)
            this.form.merchantName = firstValue(data.merchantName, data.merchant_name, this.form.merchantName)
            this.form.merchantType = firstValue(data.merchantType, data.merchant_type, this.form.merchantType)
            this.form.contactName = firstValue(data.contactName, data.contact_name, this.form.contactName)
            this.form.contactMobile = firstValue(data.contactMobile, data.contact_mobile, data.mobile, this.form.contactMobile)
            this.form.legalPerson = firstValue(data.legalPerson, data.legal_person, this.form.legalPerson)
            this.form.licenseNo = firstValue(data.licenseNo, data.license_no, this.form.licenseNo)
            this.form.licenseUrl = firstValue(data.licenseUrl, data.license_url, this.form.licenseUrl)
            this.form.licenseImageUrl = firstValue(data.licenseImageUrl, data.license_image_url, this.form.licenseImageUrl)
            this.form.legalIdFrontUrl = firstValue(data.legalIdFrontUrl, data.legal_id_front_url, this.form.legalIdFrontUrl)
            this.form.legalIdBackUrl = firstValue(data.legalIdBackUrl, data.legal_id_back_url, this.form.legalIdBackUrl)
            this.form.qualificationUrls = normalizeUrlList(firstValue(data.qualificationUrls, data.qualification_urls, this.form.qualificationUrls))
            this.form.shopName = firstValue(data.shopName, data.shop_name, this.form.shopName)
            this.form.shopLogoUrl = firstValue(data.shopLogoUrl, data.shop_logo_url, data.shopLogo, data.shop_logo, this.form.shopLogoUrl)
            this.form.shopImageUrls = normalizeUrlList(firstValue(data.shopImageUrls, data.shop_image_urls, this.form.shopImageUrls))
            this.form.shopVideoUrls = normalizeUrlList(firstValue(data.shopVideoUrls, data.shop_video_urls, this.form.shopVideoUrls))
            this.form.shopDescription = firstValue(data.shopDescription, data.shop_description, data.storeDescription, data.store_description, data.remark, this.form.shopDescription)
            this.form.businessHours = firstValue(data.businessHours, data.business_hours, this.form.businessHours)
            this.form.industryId = firstValue(data.industryId, data.industry_id, this.form.industryId)
            this.form.wechatMerchantNo = firstValue(data.wechatMerchantNo, data.wechat_merchant_no, data.subMchId, data.sub_mch_id, data.settlementAccountNo, data.settlement_account_no, this.form.wechatMerchantNo)
            this.form.provinceCode = firstValue(data.provinceCode, data.province_code, this.form.provinceCode)
            this.form.provinceName = firstValue(data.provinceName, data.province_name, data.province, this.form.provinceName)
            this.form.cityCode = firstValue(data.cityCode, data.city_code, this.form.cityCode)
            this.form.cityName = firstValue(data.cityName, data.city_name, data.city, this.form.cityName)
            this.form.districtCode = firstValue(data.districtCode, data.district_code, this.form.districtCode)
            this.form.districtName = firstValue(data.districtName, data.district_name, data.district, data.areaName, data.area_name, this.form.districtName)
            this.form.detailAddress = firstValue(data.detailAddress, data.detail_address, data.address, this.form.detailAddress)
            this.form.longitude = firstValue(data.longitude, data.lng, this.form.longitude)
            this.form.latitude = firstValue(data.latitude, data.lat, this.form.latitude)
            this.regionCodeText = [this.form.provinceCode, this.form.cityCode, this.form.districtCode].filter(Boolean).join('/')
            this.syncRegionPickerValueByForm()
            this.applyingRemoteStatus = false
            this.dirtyForm = false
            this.clearDraft()
        },
        draftKey() {
            return this.userId ? `merchant_application_draft_${this.userId}` : ''
        },
        saveDraft() {
            const key = this.draftKey()
            if (!key || this.isApproved || this.applyingRemoteStatus) return
            try {
                uni.setStorageSync(key, cloneForm(this.form))
                this.dirtyForm = true
            } catch (error) {}
        },
        restoreDraft() {
            const key = this.draftKey()
            if (!key || this.isApproved) return
            try {
                const draft = uni.getStorageSync(key)
                if (draft && typeof draft === 'object') {
                    this.form = {
                        ...this.form,
                        ...draft,
                        qualificationUrls: normalizeUrlList(draft.qualificationUrls),
                        shopImageUrls: normalizeUrlList(draft.shopImageUrls),
                        shopVideoUrls: normalizeUrlList(draft.shopVideoUrls)
                    }
                    this.regionCodeText = [this.form.provinceCode, this.form.cityCode, this.form.districtCode].filter(Boolean).join('/')
                    this.syncRegionPickerValueByForm()
                    this.dirtyForm = true
                }
            } catch (error) {}
        },
        clearDraft() {
            const key = this.draftKey()
            if (!key) return
            try {
                uni.removeStorageSync(key)
            } catch (error) {}
            this.dirtyForm = false
        },
        markFormDirty() {
            if (this.applyingRemoteStatus || this.isApproved) return
            this.dirtyForm = true
        },
        prefillFromUser() {
            const info = this.userInfo || {}
            this.form.contactMobile = this.form.contactMobile || info.mobile || info.phone || ''
            this.form.contactName = this.form.contactName || info.realName || info.real_name || info.nickname || ''
            this.form.legalPerson = this.form.legalPerson || info.realName || info.real_name || ''
            this.form.username = this.form.username || (this.userId ? `merchant_${this.userId}` : '')
        },
        onMerchantTypeChange(e) {
            this.form.merchantType = (this.merchantTypeOptions[Number(e.detail.value || 0)] || this.merchantTypeOptions[0]).value
            this.saveDraft()
        },
        onIndustryChange(e) {
            this.form.industryId = (this.industryOptions[Number(e.detail.value || 0)] || this.industryOptions[0]).value
            this.saveDraft()
        },
        syncRegionCodeText() {
            const parts = String(this.regionCodeText || '').split(/[\/,\s，]+/).filter(Boolean)
            this.form.provinceCode = parts[0] || this.form.provinceCode
            this.form.cityCode = parts[1] || this.form.cityCode
            this.form.districtCode = parts[2] || this.form.districtCode
            this.syncRegionPickerValueByForm()
        },
        refreshRegionColumns() {
            const provinces = this.regionOptions
            const provinceIndex = Math.min(this.regionPickerValue[0] || 0, Math.max(provinces.length - 1, 0))
            const cities = provinces[provinceIndex] && provinces[provinceIndex].children ? provinces[provinceIndex].children : []
            const cityIndex = Math.min(this.regionPickerValue[1] || 0, Math.max(cities.length - 1, 0))
            const districts = cities[cityIndex] && cities[cityIndex].children ? cities[cityIndex].children : []
            const districtIndex = Math.min(this.regionPickerValue[2] || 0, Math.max(districts.length - 1, 0))
            this.regionPickerValue = [provinceIndex, cityIndex, districtIndex]
            this.regionPickerColumns = [provinces, cities, districts]
        },
        onRegionColumnChange(e) {
            const column = Number(e.detail.column || 0)
            const value = Number(e.detail.value || 0)
            const next = this.regionPickerValue.slice()
            next[column] = value
            if (column === 0) {
                next[1] = 0
                next[2] = 0
            } else if (column === 1) {
                next[2] = 0
            }
            this.regionPickerValue = next
            this.refreshRegionColumns()
        },
        onRegionConfirm(e) {
            const value = Array.isArray(e.detail.value) ? e.detail.value : this.regionPickerValue
            this.regionPickerValue = value
            this.refreshRegionColumns()
            const province = this.regionPickerColumns[0][this.regionPickerValue[0]] || {}
            const city = this.regionPickerColumns[1][this.regionPickerValue[1]] || {}
            const district = this.regionPickerColumns[2][this.regionPickerValue[2]] || {}
            this.form.provinceCode = province.value || ''
            this.form.provinceName = province.label || ''
            this.form.cityCode = city.value || ''
            this.form.cityName = city.label || ''
            this.form.districtCode = district.value || ''
            this.form.districtName = district.label || ''
            this.regionCodeText = [this.form.provinceCode, this.form.cityCode, this.form.districtCode].filter(Boolean).join('/')
            this.saveDraft()
        },
        syncRegionPickerValueByForm() {
            const provinces = this.regionOptions
            if (!provinces.length) {
                this.refreshRegionColumns()
                return
            }
            const provinceIndex = Math.max(provinces.findIndex(item => this.regionOptionMatched(item, this.form.provinceCode, this.form.provinceName)), 0)
            const cities = provinces[provinceIndex] && provinces[provinceIndex].children ? provinces[provinceIndex].children : []
            const cityIndex = Math.max(cities.findIndex(item => this.regionOptionMatched(item, this.form.cityCode, this.form.cityName)), 0)
            const districts = cities[cityIndex] && cities[cityIndex].children ? cities[cityIndex].children : []
            const districtIndex = Math.max(districts.findIndex(item => this.regionOptionMatched(item, this.form.districtCode, this.form.districtName)), 0)
            this.regionPickerValue = [provinceIndex, cityIndex, districtIndex]
            this.refreshRegionColumns()
        },
        regionOptionMatched(item = {}, code, name) {
            return Boolean((code && String(item.value) === String(code)) || (name && item.label === name))
        },
        chooseShopLocation() {
            const params = {}
            const latitude = Number(this.form.latitude)
            const longitude = Number(this.form.longitude)
            if (!Number.isNaN(latitude) && !Number.isNaN(longitude) && latitude && longitude) {
                params.latitude = latitude
                params.longitude = longitude
            }
            uni.chooseLocation({
                ...params,
                success: (res) => {
                    this.form.longitude = res.longitude || ''
                    this.form.latitude = res.latitude || ''
                    const address = [res.address, res.name].filter(Boolean).join(' ')
                    if (address && !this.form.detailAddress) this.form.detailAddress = address
                    this.saveDraft()
                },
                fail: (error) => {
                    const message = String((error && (error.errMsg || error.message)) || '')
                    if (/cancel/i.test(message)) return
                    this.$toast({ title: '地图选点失败，请检查定位权限' })
                }
            })
        },
        formatDisplayTime(value) {
            if (!value) return ''
            if (typeof value === 'string' && /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value)) return value.replace(/-/g, '/').slice(0, 16)
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return String(value)
            const pad = num => String(num).padStart(2, '0')
            return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        },
        validateForm() {
            if (!this.userId) return '请先登录'
            if (!this.kycApproved) return '请先完成实名认证审核'
            if (this.requiresBackendUsername && !this.form.username.trim()) return '请填写登录账号'
            if (this.requiresBackendPassword && (!this.form.password || this.form.password.length < 6)) return '请设置至少 6 位密码'
            if (!this.form.merchantName.trim()) return '请输入商户名称'
            if (!this.form.contactName.trim()) return '请输入联系人'
            if (!/^1\d{10}$/.test(String(this.form.contactMobile || ''))) return '请输入正确联系电话'
            if (!this.form.legalPerson.trim()) return '请输入法人姓名'
            if (!this.form.licenseNo.trim()) return '请输入营业执照编号'
            if (!this.form.licenseImageUrl) return '请上传营业执照'
            if (!this.form.legalIdFrontUrl || !this.form.legalIdBackUrl) return '请上传法人身份证正反面'
            if (!this.form.shopName.trim()) return '请输入店铺名称'
            if (!this.form.industryId) return '请选择行业分类'
            if (!this.form.wechatMerchantNo.trim()) return '请输入微信商户号'
            if (!/^\d{8,32}$/.test(String(this.form.wechatMerchantNo || '').trim())) return '请输入正确的微信商户号'
            if (!this.form.shopLogoUrl) return '请上传店铺 Logo'
            if (!this.form.shopImageUrls.length) return '请至少上传一张门店照片'
            if (!this.form.provinceCode || !this.form.cityCode || !this.form.districtCode) return '请选择经营区域'
            if (!this.form.detailAddress.trim()) return '请输入详细地址'
            if (!this.form.longitude || !this.form.latitude) return '请选择店铺地图位置'
            return ''
        },
        buildPayload() {
            const industryId = this.form.industryId === '' ? '' : Number(this.form.industryId)
            return {
                ...this.form,
                userId: this.userId,
                username: this.requiresBackendUsername ? this.form.username.trim() : this.form.username,
                password: this.requiresBackendPassword ? this.form.password : '',
                merchantName: this.form.merchantName.trim(),
                contactName: this.form.contactName.trim(),
                contactMobile: this.form.contactMobile.trim(),
                legalPerson: this.form.legalPerson.trim(),
                licenseNo: this.form.licenseNo.trim(),
                shopName: this.form.shopName.trim(),
                shopDescription: this.form.shopDescription.trim(),
                industryId: Number.isNaN(industryId) ? this.form.industryId : industryId,
                wechatMerchantNo: this.form.wechatMerchantNo.trim(),
                settlementAccountNo: this.form.wechatMerchantNo.trim(),
                detailAddress: this.form.detailAddress.trim(),
                longitude: this.form.longitude,
                latitude: this.form.latitude,
                applicationNo: this.status.applicationNo || this.status.application_no || ''
            }
        },
        submitApply() {
            if (this.submitting || this.isPending || this.isApproved) {
                if (this.isPending) this.$toast({ title: '申请正在审核中' })
                return
            }
            const message = this.validateForm()
            if (message) {
                this.$toast({ title: message })
                if (!this.kycApproved) this.goKyc()
                return
            }
            this.submitting = true
            const payload = this.buildPayload()
            const request = payload.applicationNo && this.auditStatus !== 'NOT_SUBMITTED'
                ? resubmitMerchantApplication(payload)
                : submitMerchantApplication(payload)
            request.then(res => {
                if (res.code == 1) {
                    this.$toast({ title: '提交成功' })
                    if (res.data) this.applyStatusToForm(res.data)
                    this.getStatus()
                    this.clearDraft()
                } else {
                    this.$toast({ title: localizeBackendText(res.msg || res.message || '提交失败') })
                }
            }).catch(() => {
                this.$toast({ title: '提交失败，请稍后再试' })
            }).finally(() => {
                this.submitting = false
            })
        },
        chooseImage(field) {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseImage({
                count: 1,
                success: res => {
                    const file = (res.tempFiles || [])[0]
                    const path = file && (file.path || file.tempFilePath)
                    if (path) this.uploadAndSet(field, path)
                }
            })
        },
        chooseShopImages() {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseImage({
                count: Math.max(1, 6 - this.form.shopImageUrls.length),
                success: res => (res.tempFiles || []).forEach(file => {
                    const path = file.path || file.tempFilePath
                    if (path) this.uploadToList('shopImageUrls', path)
                })
            })
        },
        chooseShopVideos() {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseVideo({
                success: res => {
                    const path = res.tempFilePath || res.path
                    if (path) this.uploadToList('shopVideoUrls', path)
                },
                fail: () => {
                    this.restoreDraft()
                }
            })
        },
        chooseQualification() {
            this.saveDraft()
            this.suppressNextShowReload = true
            uni.chooseImage({
                count: Math.max(1, 9 - this.form.qualificationUrls.length),
                success: res => (res.tempFiles || []).forEach(file => {
                    const path = file.path || file.tempFilePath
                    if (path) this.uploadToList('qualificationUrls', path)
                })
            })
        },
        uploadAndSet(field, path) {
            this.saveDraft()
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path).then(res => {
                this.form[field] = normalizeUploadUrl(res)
                if (!this.form[field]) {
                    this.restoreDraft()
                    this.$toast({ title: '上传失败' })
                    return
                }
                this.saveDraft()
            }).catch(() => {
                this.restoreDraft()
                this.$toast({ title: '上传失败' })
            }).finally(() => uni.hideLoading())
        },
        uploadToList(field, path) {
            this.saveDraft()
            uni.showLoading({ title: '上传中...', mask: true })
            uploadFile(path, { fileType: field === 'shopVideoUrls' ? 'video' : 'image' }).then(res => {
                const url = normalizeUploadUrl(res)
                if (!url) {
                    this.restoreDraft()
                    this.$toast({ title: '上传失败' })
                    return
                }
                this.form[field].push(url)
                this.saveDraft()
            }).catch(() => {
                this.restoreDraft()
                this.$toast({ title: '上传失败' })
            }).finally(() => uni.hideLoading())
        },
        removeImage(field) {
            this.form[field] = ''
            this.saveDraft()
        },
        removeShopImage(index) {
            this.form.shopImageUrls.splice(index, 1)
            this.saveDraft()
        },
        removeShopVideo(index) {
            this.form.shopVideoUrls.splice(index, 1)
            this.saveDraft()
        },
        removeQualification(index) {
            this.form.qualificationUrls.splice(index, 1)
            this.saveDraft()
        },
        goKyc() {
            if (this.kycRedirecting) return
            this.kycRedirecting = true
            uni.redirectTo({
                url: '/business/pages/business_pages/user_kyc',
                fail: () => {
                    this.kycRedirecting = false
                    uni.navigateTo({ url: '/business/pages/business_pages/user_kyc' })
                }
            })
        },
        startClaimShop() {
            this.claimStep = 'shop'
        },
        applyClaimStepOption(step) {
            const value = String(step || '').trim()
            if (!value) return
            if (['intro', 'shop', 'details', 'realname', 'materials', 'form'].includes(value)) {
                this.claimStep = value
            }
        },
        submitClaimShopName() {
            if (!String(this.form.shopName || '').trim()) {
                this.$toast({ title: '请输入店铺名称' })
                return
            }
            this.form.merchantName = this.form.merchantName || this.form.shopName
            this.saveDraft()
            this.claimStep = 'details'
        },
        submitClaimDetails() {
            if (!String(this.form.shopName || '').trim()) {
                this.$toast({ title: '请输入店铺名称' })
                this.claimStep = 'shop'
                return
            }
            if (!this.form.industryId) {
                this.$toast({ title: '请选择店铺真实分类' })
                return
            }
            if (!this.form.detailAddress && !this.hasShopLocation) {
                this.$toast({ title: '请选择店铺位置或填写详细地址' })
                return
            }
            this.saveDraft()
            this.claimStep = 'realname'
        },
        submitClaimRealname() {
            if (!String(this.form.contactName || '').trim()) {
                this.$toast({ title: '请输入本人姓名' })
                return
            }
            if (!/^1\d{10}$/.test(String(this.form.contactMobile || ''))) {
                this.$toast({ title: '请输入正确手机号' })
                return
            }
            if (!this.kycApproved) {
                this.$toast({ title: '请先完成实名认证审核' })
                this.goKyc()
                return
            }
            this.form.legalPerson = this.form.legalPerson || this.form.contactName
            this.saveDraft()
            this.claimStep = 'materials'
        },
        submitClaimMaterials() {
            if (!this.form.licenseImageUrl) {
                this.$toast({ title: '请上传营业执照' })
                return
            }
            if (!this.form.legalIdFrontUrl || !this.form.legalIdBackUrl) {
                this.$toast({ title: '请上传身份证正反面' })
                return
            }
            this.saveDraft()
            this.claimStep = 'form'
            this.$nextTick(() => this.submitApply())
        },
        submitClaimMaterialsWithoutAll() {
            this.saveDraft()
            this.claimStep = 'form'
            this.$nextTick(() => {
                if (!this.kycApproved) this.$toast({ title: '请先完成实名认证审核' })
            })
        },
        showCodeDisabledTip() {
            this.$toast({ title: '当前认证使用项目实名认证流程' })
        }
    }
}
</script>

<style lang="scss">
.license-page { position: relative; min-height: 100vh; padding: 0 24rpx calc(142rpx + env(safe-area-inset-bottom)); box-sizing: border-box; background: #f8ede1; }
.license-bg { position: absolute; left: 0; right: 0; top: 0; height: 438rpx; background: linear-gradient(180deg, #fff7e7 0%, #ffe0aa 100%); }
.license-nav { position: relative; z-index: 5; display: flex; align-items: flex-start; height: calc(var(--status-bar-height) + 102rpx); margin: 0 -24rpx; padding: calc(var(--status-bar-height) + 38rpx) 24rpx 0; box-sizing: border-box; }
.license-nav--claim { position: absolute; left: 0; right: 0; top: 0; height: calc(var(--status-bar-height) + 112rpx); margin: 0; padding: calc(var(--status-bar-height) + 41rpx) 28rpx 0 42rpx; }
.license-nav__back { display: flex; align-items: center; justify-content: flex-start; width: 72rpx; height: 64rpx; }
.license-nav__arrow { width: 18rpx; height: 18rpx; margin-left: 3rpx; border-left: 3rpx solid #222222; border-bottom: 3rpx solid #222222; transform: rotate(45deg); }
.license-nav__title { position: absolute; left: 50%; top: calc(var(--status-bar-height) + 53rpx); transform: translateX(-50%); color: #ffffff; font-size: 36rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 36rpx; white-space: nowrap; }
.license-nav--claim .license-nav__title { top: calc(var(--status-bar-height) + 50rpx); color: #222222; }
.license-nav__capsule { position: absolute; right: 24rpx; top: calc(var(--status-bar-height) + 35rpx); display: flex; align-items: center; justify-content: space-around; width: 168rpx; height: 64rpx; padding: 0 25rpx; box-sizing: border-box; border: 1rpx solid transparent; border-radius: 32rpx; background: transparent; opacity: 0; }
.license-nav--claim .license-nav__capsule { right: 28rpx; top: calc(var(--status-bar-height) + 35rpx); width: 159rpx; height: 58rpx; border-radius: 29rpx; }
.license-nav__dot { width: 9rpx; height: 9rpx; border-radius: 50%; background: #222222; box-shadow: 20rpx 0 0 #222222, 40rpx 0 0 #222222; }
.license-nav__divider { width: 1rpx; height: 34rpx; margin-left: 36rpx; background: rgba(0, 0, 0, .12); }
.license-nav__circle { width: 30rpx; height: 30rpx; border: 3rpx solid #222222; border-radius: 50%; box-sizing: border-box; }
.license-page--claim-intro { padding: 0; background: #fff8ed; }
.license-page--claim-intro .license-bg { height: 277rpx; background: linear-gradient(180deg, #fff7e7 0%, #ffe7bd 100%); }
.claim-intro { position: relative; z-index: 1; width: 100%; max-width: 750rpx; min-height: 1625rpx; margin: 0 auto; overflow: hidden; background: linear-gradient(180deg, #fff8ed 0%, #fff4e5 100%); }
.claim-intro__hero { position: relative; height: 277rpx; padding-top: 157rpx; box-sizing: border-box; background: linear-gradient(180deg, #fff7e7 0%, #ffe8bd 100%); }
.claim-intro__lead { position: relative; z-index: 1; margin-left: 26rpx; color: #222222; font-size: 44rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 58rpx; white-space: nowrap; }
.claim-intro__lead text { color: #b26c10; }
.claim-intro__art { position: absolute; right: 23rpx; bottom: -14rpx; width: 245rpx; height: 186rpx; }
.claim-intro__art::before { content: ''; position: absolute; right: 8rpx; bottom: 0; width: 186rpx; height: 137rpx; border-radius: 68rpx 68rpx 20rpx 20rpx; background: linear-gradient(135deg, #f6cc85, #b26c10); box-shadow: -58rpx 27rpx 0 -12rpx rgba(178, 108, 16, .2); }
.claim-intro__art::after { content: ''; position: absolute; left: 7rpx; top: 5rpx; width: 118rpx; height: 118rpx; border-radius: 50%; background: #ffffff; border: 12rpx solid #b26c10; box-shadow: 92rpx 33rpx 0 -28rpx #fff1d9; }
.claim-intro__body { position: relative; height: 1348rpx; padding-top: 4rpx; box-sizing: border-box; }
.claim-intro__desc { margin-left: 26rpx; color: #666666; font-size: 28rpx; line-height: 28rpx; white-space: nowrap; }
.claim-step { display: flex; align-items: center; margin: 20rpx 0 0 26rpx; }
.claim-step--active { margin-top: 51rpx; margin-left: 26rpx; }
.claim-step__num { display: flex; align-items: center; justify-content: center; width: 39rpx; height: 39rpx; color: #ffffff; background: #999999; border-radius: 50%; font-size: 28rpx; line-height: 28rpx; }
.claim-step--active .claim-step__num { background: #b26c10; }
.claim-step__title { margin-left: 16rpx; color: #222222; font-size: 32rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 32rpx; white-space: nowrap; }
.claim-step__line { width: 2rpx; height: 29rpx; margin: 3rpx 0 0 46rpx; background: #d1d1d1; }
.claim-intro__button { display: flex; align-items: center; justify-content: center; width: calc(100% - 168rpx); max-width: 582rpx; height: 81rpx; margin: 51rpx auto 0; padding: 0; color: #ffffff; background: linear-gradient(90deg, #b26c10 0%, #764213 100%); border: 0; border-radius: 41rpx; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; white-space: nowrap; }
.claim-intro__button::after { display: none; }
.claim-intro__count { display: flex; align-items: center; justify-content: center; width: 586rpx; height: 135rpx; margin: 39rpx 0 0 26rpx; color: #1f1f1f; font-size: 33rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 33rpx; background: linear-gradient(180deg, #ffffff 0%, #fff2d9 100%); border-radius: 68rpx; box-shadow: 0 12rpx 28rpx rgba(178, 108, 16, .08); }
.claim-rule-card { width: calc(100% - 48rpx); max-width: 703rpx; height: 255rpx; margin: 8rpx auto 0; padding-top: 23rpx; color: #764213; background: linear-gradient(180deg, #fff8ef 0%, #ffe9c7 100%); border: 2rpx solid rgba(118, 66, 19, .16); border-radius: 18rpx; box-sizing: border-box; }
.claim-rule-card__title { color: #764213; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; text-align: center; white-space: nowrap; }
.claim-rule-card__content,
.claim-advantage-card__content { display: flex; flex-direction: column; margin: 43rpx 0 0 17rpx; color: #764213; font-size: 26rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 49rpx; }
.claim-rule-card__content text,
.claim-advantage-card__content text { display: block; white-space: nowrap; }
.claim-advantage-card { position: relative; width: calc(100% - 48rpx); max-width: 703rpx; height: 236rpx; margin: 45rpx auto 0; padding-top: 74rpx; background: #ffffff; border-radius: 20rpx; box-sizing: border-box; }
.claim-advantage-card__badge { position: absolute; left: 199rpx; top: -19rpx; display: flex; align-items: center; justify-content: center; width: 303rpx; height: 84rpx; color: #764213; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; background: linear-gradient(180deg, #fff8ed, #ffe6be); border-radius: 42rpx; }
.claim-advantage-card__content { margin-top: 0; }
.claim-shop { position: relative; z-index: 1; width: 100%; max-width: 750rpx; min-height: 1625rpx; margin: 0 auto; overflow: hidden; background: linear-gradient(180deg, #fff8ed 0%, #fff4e6 100%); }
.claim-shop__hero { position: relative; width: 100%; max-width: 750rpx; height: 277rpx; padding-top: 215rpx; background: linear-gradient(180deg, #fff7e7 0%, #ffe8bd 100%); box-sizing: border-box; }
.claim-shop__title-row { display: flex; align-items: center; justify-content: space-between; width: calc(100% - 50rpx); max-width: 688rpx; height: 42rpx; margin: 0 auto; }
.claim-shop__title { color: #222222; font-size: 44rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 44rpx; white-space: nowrap; }
.claim-shop__city { display: flex; align-items: center; color: #222222; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; white-space: nowrap; }
.claim-shop__city text { width: 0; height: 0; margin: 6rpx 0 0 12rpx; border-left: 12rpx solid transparent; border-right: 12rpx solid transparent; border-top: 14rpx solid #222222; }
.claim-shop__body { width: 100%; max-width: 750rpx; height: 1348rpx; padding-top: 40rpx; box-sizing: border-box; }
.claim-shop__input-row { display: flex; align-items: center; width: calc(100% - 74rpx); max-width: 687rpx; height: 94rpx; margin: 0 auto; background: #ffffff; border-radius: 8rpx; box-sizing: border-box; }
.claim-shop__input { flex: 1; min-width: 0; height: 94rpx; padding-left: 23rpx; color: #222222; font-size: 28rpx; line-height: 94rpx; box-sizing: border-box; }
.claim-shop__placeholder { color: #c1c1c1; font-size: 28rpx; }
.claim-shop__search-icon { position: relative; flex: none; width: 39rpx; height: 39rpx; margin: 0 28rpx 0 18rpx; border: 4rpx solid #b26c10; border-radius: 50%; box-sizing: border-box; }
.claim-shop__search-icon::after { content: ''; position: absolute; right: -9rpx; bottom: -6rpx; width: 16rpx; height: 4rpx; background: #b26c10; border-radius: 4rpx; transform: rotate(45deg); }
.claim-shop__button { display: flex; align-items: center; justify-content: center; width: calc(100% - 168rpx); max-width: 582rpx; height: 81rpx; margin: 121rpx auto 0; padding: 0; color: #ffffff; background: linear-gradient(90deg, #b26c10 0%, #764213 100%); border: 0; border-radius: 41rpx; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; white-space: nowrap; }
.claim-shop__button::after { display: none; }
.claim-flow { position: relative; z-index: 1; width: 100%; max-width: 750rpx; min-height: 1625rpx; margin: 0 auto; padding-bottom: 70rpx; overflow: hidden; background: linear-gradient(180deg, #fff8ed 0%, #fff4e6 100%); box-sizing: border-box; }
.claim-flow__head { width: 100%; max-width: 750rpx; height: 277rpx; padding-top: 197rpx; background: linear-gradient(180deg, #fff7e7 0%, #ffe8bd 100%); box-sizing: border-box; }
.claim-progress { display: flex; align-items: center; width: 585rpx; height: 40rpx; margin-left: 91rpx; }
.claim-progress__item { display: flex; align-items: center; flex: none; color: #222222; font-size: 32rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 32rpx; white-space: nowrap; }
.claim-progress__item text { display: flex; align-items: center; justify-content: center; width: 39rpx; height: 39rpx; margin-right: 16rpx; color: #ffffff; background: #999999; border-radius: 50%; font-size: 28rpx; line-height: 28rpx; }
.claim-progress__item--active text { background: #b26c10; }
.claim-progress__line { flex: none; width: 116rpx; height: 1rpx; margin: 0 19rpx 0 24rpx; background: #d1d1d1; }
.claim-progress--done .claim-progress__line { background: #b26c10; }
.claim-card { width: 698rpx; margin: 18rpx 0 0 26rpx; padding: 34rpx; background: #ffffff; border-radius: 20rpx; box-sizing: border-box; }
.claim-card--shop-info { min-height: 477rpx; margin-top: 40rpx; padding-top: 40rpx; }
.claim-card--location { min-height: 508rpx; padding-top: 39rpx; }
.claim-card__title { color: #222222; font-size: 34rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 34rpx; white-space: nowrap; }
.claim-card__title--sub { margin-top: 46rpx; }
.claim-card__value { margin-top: 28rpx; color: #222222; font-size: 28rpx; line-height: 28rpx; white-space: nowrap; }
.claim-card__hint { margin-top: 15rpx; color: #999999; font-size: 24rpx; line-height: 24rpx; }
.claim-card__hint text { color: #b26c10; font-weight: 500; }
.claim-divider { width: 657rpx; height: 1rpx; margin: 34rpx 0 38rpx -13rpx; background: #eeeeee; }
.claim-picker { display: flex; align-items: center; justify-content: space-between; width: 626rpx; min-height: 40rpx; margin-top: 39rpx; color: #222222; font-size: 28rpx; line-height: 34rpx; }
.claim-picker--placeholder { color: #999999; }
.claim-picker__arrow { flex: none; color: #999999; font-size: 44rpx; line-height: 34rpx; transform: translateY(-2rpx); }
.claim-suggest { display: flex; align-items: center; gap: 15rpx; margin-top: 34rpx; color: #999999; font-size: 24rpx; line-height: 24rpx; }
.claim-suggest__tag { display: flex; align-items: center; justify-content: center; min-width: 120rpx; height: 60rpx; padding: 0 24rpx; color: #222222; background: #f1f1f1; border-radius: 30rpx; box-sizing: border-box; }
.claim-map { position: relative; width: 633rpx; height: 166rpx; margin-top: 35rpx; border-radius: 10rpx; background: linear-gradient(135deg, #dfd6c7, #b7a795); overflow: hidden; }
.claim-map::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,.42); }
.claim-map__pin { position: absolute; left: 256rpx; top: 13rpx; z-index: 1; width: 88rpx; height: 88rpx; border-radius: 50% 50% 50% 0; background: #b26c10; transform: rotate(-45deg); }
.claim-map__pin::after { content: ''; position: absolute; left: 27rpx; top: 27rpx; width: 34rpx; height: 34rpx; border-radius: 50%; background: #ffffff; }
.claim-map__text { position: absolute; left: 0; right: 0; bottom: 18rpx; z-index: 1; color: #ffffff; font-size: 24rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 24rpx; text-align: center; }
.claim-address-input { width: 626rpx; height: 70rpx; margin-top: 18rpx; color: #222222; font-size: 28rpx; line-height: 70rpx; border-bottom: 1rpx solid #eeeeee; }
.claim-input-placeholder { color: #999999; font-size: 28rpx; }
.claim-action-block { position: relative; width: 100%; max-width: 750rpx; height: 180rpx; padding-top: 38rpx; box-sizing: border-box; }
.claim-primary-btn,
.claim-secondary-btn { display: flex; align-items: center; justify-content: center; height: 81rpx; margin: 0; padding: 0; border: 0; border-radius: 41rpx; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; white-space: nowrap; box-sizing: border-box; }
.claim-primary-btn { width: 582rpx; margin-left: 84rpx; color: #ffffff; background: linear-gradient(90deg, #b26c10 0%, #764213 100%); }
.claim-primary-btn::after,
.claim-secondary-btn::after { display: none; }
.claim-free-badge { position: absolute; left: 586rpx; top: 24rpx; display: flex; align-items: center; justify-content: center; width: 77rpx; height: 38rpx; color: #ffffff; background: #ff2d1d; border: 2rpx solid #f6f6f6; border-radius: 17rpx 0 17rpx 17rpx; font-size: 24rpx; line-height: 24rpx; box-sizing: border-box; }
.claim-realname-title { width: 696rpx; margin: 7rpx 0 0 27rpx; color: #222222; font-size: 29rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 44rpx; }
.claim-realname-title text { color: #b26c10; }
.claim-card--realname { min-height: 387rpx; margin-top: 38rpx; padding: 27rpx 21rpx 36rpx; }
.claim-card--phone { min-height: 410rpx; margin-top: 22rpx; padding: 20rpx 33rpx 37rpx; }
.claim-kyc-panel { display: flex; align-items: center; justify-content: space-between; width: 656rpx; min-height: 146rpx; padding: 34rpx 24rpx 35rpx; background: #fff7ee; border-radius: 11rpx; box-sizing: border-box; }
.claim-kyc-panel__title { color: #222222; font-size: 26rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 32rpx; }
.claim-kyc-panel__value { margin-top: 18rpx; color: #666666; font-size: 28rpx; line-height: 28rpx; }
.claim-kyc-panel__btn { flex: none; display: flex; align-items: center; justify-content: center; width: 168rpx; height: 71rpx; margin: 0; padding: 0; color: #ffffff; background: #b26c10; border: 0; border-radius: 35rpx; font-size: 28rpx; line-height: 28rpx; }
.claim-kyc-panel__btn::after { display: none; }
.claim-form-line { display: flex; align-items: center; min-height: 99rpx; border-bottom: 1rpx solid #eeeeee; }
.claim-card--realname .claim-form-line:first-of-type { margin-top: 25rpx; }
.claim-form-line text:first-child { flex: none; width: 145rpx; color: #222222; font-size: 30rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 30rpx; }
.claim-form-line input { flex: 1; min-width: 0; height: 88rpx; color: #222222; font-size: 28rpx; line-height: 88rpx; }
.claim-form-line__value { flex: 1; color: #999999; font-size: 28rpx; line-height: 34rpx; }
.claim-form-line--code { min-height: 101rpx; }
.claim-form-line--code input { width: 210rpx; flex: none; }
.claim-form-line--code button { flex: none; display: flex; align-items: center; justify-content: center; width: 160rpx; height: 64rpx; margin: 0 0 0 auto; padding: 0; color: #b26c10; background: #fff6eb; border: 0; border-radius: 32rpx; font-size: 24rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 24rpx; }
.claim-form-line--code button::after { display: none; }
.claim-check-row { display: flex; align-items: center; margin-top: 32rpx; color: #222222; font-size: 26rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; white-space: nowrap; }
.claim-check-row__box { flex: none; width: 34rpx; height: 34rpx; margin-right: 13rpx; border-radius: 50%; background: #b26c10; position: relative; }
.claim-check-row__box::after { content: ''; position: absolute; left: 10rpx; top: 7rpx; width: 12rpx; height: 18rpx; border: solid #ffffff; border-width: 0 4rpx 4rpx 0; transform: rotate(45deg); }
.claim-check-row__help { display: flex; align-items: center; justify-content: center; width: 28rpx; height: 28rpx; margin-left: 12rpx; color: #ffffff; background: #d6d6d6; border-radius: 50%; font-size: 20rpx; }
.claim-face-link { margin-top: 36rpx; color: #b26c10; font-size: 26rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; text-align: center; }
.claim-bottom-actions { position: relative; width: 100%; max-width: 750rpx; min-height: 423rpx; padding-top: 39rpx; box-sizing: border-box; }
.claim-help { display: flex; align-items: center; justify-content: center; width: 97rpx; height: 97rpx; margin-left: 611rpx; color: #666666; background: #ffffff; border-radius: 50%; box-shadow: 0 0 10rpx rgba(163,163,163,.22); font-size: 22rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 22rpx; }
.claim-button-row { display: flex; justify-content: space-between; width: 698rpx; margin: 62rpx 0 0 26rpx; }
.claim-secondary-btn { width: 223rpx; color: #666666; background: #ffffff; border: 1rpx solid #dfdfdf; }
.claim-primary-btn--wide { width: 444rpx; margin-left: 0; }
.claim-agreement { display: flex; align-items: center; width: 690rpx; margin: 39rpx 0 0 40rpx; color: #666666; font-size: 26rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 28rpx; white-space: nowrap; }
.claim-agreement .claim-check-row__box { margin-right: 13rpx; }
.claim-agreement__link { color: #b26c10; }
.claim-card--materials { height: 943rpx; margin-top: 6rpx; padding: 35rpx 33rpx 41rpx; }
.claim-card--materials .claim-card__title { font-size: 30rpx; line-height: 30rpx; }
.claim-card--materials .claim-card__hint { margin-top: 22rpx; font-size: 28rpx; line-height: 28rpx; white-space: nowrap; }
.claim-card--materials .claim-card__title--sub { margin-top: 28rpx; }
.claim-license-upload { display: flex; align-items: center; justify-content: center; width: 566rpx; height: 370rpx; margin: 17rpx 0 0 33rpx; border-radius: 12rpx; background: #fff6eb; overflow: hidden; }
.claim-license-upload image { width: 100%; height: 100%; }
.claim-upload-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; color: #b26c10; font-size: 24rpx; line-height: 32rpx; }
.claim-upload-empty view { display: flex; align-items: center; justify-content: center; width: 70rpx; height: 70rpx; margin-bottom: 14rpx; color: #ffffff; background: #b26c10; border-radius: 50%; font-size: 48rpx; line-height: 60rpx; }
.claim-id-upload-row { display: flex; justify-content: space-between; width: 603rpx; height: 214rpx; margin: 34rpx 0 0 2rpx; }
.claim-id-upload { position: relative; width: 273rpx; height: 214rpx; border-radius: 0; background: transparent; overflow: visible; }
.claim-id-upload image { width: 273rpx; height: 174rpx; border-radius: 12rpx; background: #fff6eb; }
.claim-id-upload .claim-upload-empty { position: relative; justify-content: flex-start; height: 214rpx; background: linear-gradient(180deg, #fff6eb 0, #fff6eb 174rpx, transparent 174rpx, transparent 100%); border-radius: 12rpx 12rpx 0 0; }
.claim-id-upload .claim-upload-empty view { width: 58rpx; height: 58rpx; margin: 58rpx 0 0; font-size: 40rpx; }
.claim-id-upload .claim-upload-empty text { margin-top: 32rpx; color: #222222; font-size: 22rpx; line-height: 22rpx; }
.claim-safe-tip { display: flex; align-items: center; justify-content: center; width: 506rpx; height: 23rpx; margin: 74rpx 0 0 60rpx; color: #666666; font-size: 22rpx; line-height: 22rpx; text-align: center; white-space: nowrap; }
.claim-bottom-actions--materials { min-height: 400rpx; padding-top: 16rpx; }
.claim-bottom-actions--materials .claim-button-row { margin-top: 62rpx; }
.claim-material-tip { position: absolute; left: 213rpx; top: 32rpx; color: #666666; font-size: 28rpx; font-family: PingFangSC-Medium, PingFangSC-Regular, sans-serif; font-weight: 500; line-height: 31rpx; }
.claim-material-tip text { color: #b26c10; }
.claim-bottom-actions--materials .claim-help { margin-left: 611rpx; }
.claim-agreement--short { width: 320rpx; }
.license-page--claim-form .license-nav__title { color: #222222; }
.license-hero { position: relative; z-index: 1; padding: 44rpx 0 34rpx; color: #222222; }
.license-hero__title { font-size: 40rpx; font-weight: 700; line-height: 56rpx; }
.license-hero__desc { margin-top: 10rpx; max-width: 620rpx; color: #7e5f4b; font-size: 25rpx; line-height: 38rpx; }
.status-card, .approved-card, .form-section, .account-tip { position: relative; z-index: 1; margin-bottom: 18rpx; border-radius: 22rpx; background: #fff9f0; box-shadow: 0 12rpx 34rpx rgba(118,66,19,.08); box-sizing: border-box; }
.status-card { padding: 26rpx 24rpx 24rpx; }
.status-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.status-card__label, .status-card__meta, .status-card__remark, .status-card__time { color: #8b7663; font-size: 23rpx; line-height: 34rpx; }
.status-card__value { margin-top: 6rpx; font-size: 34rpx; font-weight: 700; line-height: 46rpx; }
.status-pill { flex: none; max-width: 240rpx; padding: 8rpx 18rpx; border-radius: 999rpx; font-size: 23rpx; font-weight: 600; line-height: 32rpx; text-align: center; box-sizing: border-box; }
.status-pill--success { color: #7d4c0b; background: #fff1dc; }
.status-pill--danger { color: #d92d20; background: #fff1f1; }
.status-pill--pending { color: #a0610d; background: #fff1dc; }
.status-pill--default { color: #8b7663; background: #f3e7db; }
.status-card__value--success { color: #7d4c0b; }
.status-card__value--danger { color: #e5484d; }
.status-card__value--pending { color: #a0610d; }
.status-card__value--default { color: #8b7663; }
.status-card__meta, .status-card__remark, .status-card__time { margin-top: 10rpx; }
.kyc-action { display: inline-flex; align-items: center; justify-content: center; margin-top: 20rpx; height: 64rpx; padding: 0 28rpx; border-radius: 32rpx; color: #ffffff; background: #a0610d; font-size: 25rpx; font-weight: 700; }
.approved-card { padding: 26rpx 24rpx; }
.approved-card__title { margin-bottom: 16rpx; color: #7d4c0b; font-size: 31rpx; font-weight: 700; }
.approved-card__row { display: flex; justify-content: space-between; gap: 20rpx; padding: 12rpx 0; color: #222222; font-size: 25rpx; line-height: 36rpx; }
.approved-card__row text:first-child { flex: none; color: #8b7663; }
.approved-card__row text:last-child { flex: 1; min-width: 0; text-align: right; word-break: break-word; }
.approved-card__row--address { align-items: flex-start; }
.license-form { position: relative; z-index: 1; }
.account-tip { padding: 20rpx 22rpx; color: #764213; background: #fff1dc; border: 1rpx solid rgba(160,97,13,.18); font-size: 24rpx; line-height: 36rpx; }
.account-fields { display: grid; grid-template-columns: 1fr; gap: 16rpx; margin-top: 18rpx; }
.form-section { padding: 24rpx 22rpx; }
.form-section__title { color: #222222; font-size: 30rpx; font-weight: 700; line-height: 42rpx; }
.form-section__subtitle { margin-top: 24rpx; color: #222222; font-size: 26rpx; font-weight: 700; line-height: 38rpx; }
.form-section__desc { margin-top: 8rpx; color: #8b7663; font-size: 23rpx; line-height: 34rpx; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 16rpx; margin-top: 18rpx; }
.form-row { min-height: 86rpx; padding: 14rpx 18rpx; border: 1rpx solid rgba(160,97,13,.14); border-radius: 16rpx; background: #fffdf8; box-sizing: border-box; }
.form-row--readonly { background: #f3e7db; }
.form-label { display: block; color: #5f4a3a; font-size: 23rpx; line-height: 32rpx; }
.form-label.required::after, .form-label--long.required::after { content: ' *'; color: #e5484d; }
.form-input, .form-picker { width: 100%; min-height: 44rpx; margin-top: 8rpx; color: #222222; font-size: 27rpx; line-height: 44rpx; }
.form-picker--placeholder { color: #b5a18c; font-size: 25rpx; }
.form-placeholder { color: #b5a18c; font-size: 25rpx; }
.form-picker-wrap { display: block; }
.form-row--textarea { min-height: 184rpx; }
.form-textarea { width: 100%; min-height: 118rpx; margin-top: 8rpx; color: #222222; font-size: 26rpx; line-height: 38rpx; box-sizing: border-box; }
.map-picker { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.map-picker__main { flex: 1; min-width: 0; }
.map-picker__value { margin-top: 8rpx; color: #222222; font-size: 27rpx; line-height: 40rpx; word-break: break-all; }
.map-picker__value--placeholder { color: #b5a18c; font-size: 25rpx; }
.map-picker__coord { margin-top: 6rpx; color: #8b7663; font-size: 22rpx; line-height: 32rpx; }
.map-picker__btn { flex: none; min-width: 128rpx; height: 58rpx; padding: 0 20rpx; border-radius: 29rpx; color: #a0610d; background: #fff1dc; font-size: 24rpx; line-height: 58rpx; text-align: center; box-sizing: border-box; }
.shop-media-card { margin-top: 20rpx; padding: 20rpx; border: 1rpx solid rgba(160,97,13,.14); border-radius: 18rpx; background: linear-gradient(180deg, #fffdf8 0%, #fff4e5 100%); box-sizing: border-box; }
.shop-media-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.shop-media-card__title { color: #222222; font-size: 27rpx; font-weight: 700; line-height: 38rpx; }
.shop-media-card__desc { margin-top: 6rpx; color: #8b7663; font-size: 22rpx; line-height: 32rpx; }
.shop-media-card__badge { flex: none; padding: 6rpx 14rpx; border-radius: 999rpx; color: #764213; background: #fff1dc; font-size: 22rpx; font-weight: 700; line-height: 30rpx; }
.shop-media-card__tip { margin-top: 12rpx; color: #8b7663; font-size: 22rpx; line-height: 32rpx; }
.upload-grid--shop { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.upload-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; margin-top: 18rpx; }
.upload-item__title { min-height: 34rpx; color: #5f4a3a; font-size: 23rpx; line-height: 34rpx; }
.upload-item__required { color: #e5484d; margin-right: 4rpx; }
.upload-item__box { position: relative; display: flex; align-items: center; justify-content: center; height: 176rpx; margin-top: 8rpx; border: 1rpx dashed rgba(160,97,13,.28); border-radius: 16rpx; background: #fffdf8; overflow: hidden; }
.upload-item__image { width: 100%; height: 100%; }
.upload-item__empty { text-align: center; color: #8b7663; }
.upload-item__plus, .qualification-add__plus { font-size: 42rpx; line-height: 44rpx; }
.upload-item__tip, .qualification-add__text { margin-top: 6rpx; font-size: 23rpx; line-height: 32rpx; }
.upload-item__remove, .qualification-item__remove { position: absolute; right: 10rpx; top: 10rpx; display: flex; align-items: center; justify-content: center; width: 42rpx; height: 42rpx; border-radius: 50%; color: #ffffff; background: rgba(0,0,0,.55); font-size: 28rpx; line-height: 42rpx; }
.qualification-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14rpx; margin-top: 18rpx; }
.qualification-item, .qualification-add { position: relative; height: 150rpx; border-radius: 14rpx; overflow: hidden; background: #fffdf8; }
.qualification-add--shop { height: 176rpx; margin-top: 42rpx; }
.qualification-item__image { width: 100%; height: 100%; }
.qualification-add { border: 1rpx dashed rgba(160,97,13,.28); color: #8b7663; }
.qualification-add__inner { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.video-list { margin-top: 14rpx; }
.video-item { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; min-height: 64rpx; padding: 12rpx 14rpx; border: 1rpx solid rgba(160,97,13,.14); border-radius: 12rpx; background: #fffdf8; color: #5f4a3a; font-size: 23rpx; line-height: 34rpx; }
.video-item + .video-item { margin-top: 10rpx; }
.video-item__text { flex: 1; min-width: 0; word-break: break-all; }
.video-item__remove { flex: none; color: #e5484d; }
.video-add { display: inline-flex; align-items: center; justify-content: center; margin-top: 12rpx; min-height: 58rpx; padding: 0 22rpx; border-radius: 30rpx; color: #a0610d; background: #fff1dc; font-size: 24rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255,249,240,.96); box-shadow: 0 -8rpx 24rpx rgba(118,66,19,.08); }
.submit-btn { display: flex; align-items: center; justify-content: center; height: 88rpx; border-radius: 44rpx; color: #ffffff; background: linear-gradient(90deg, #b26c10 0%, #764213 100%); font-size: 30rpx; font-weight: 700; }
.submit-btn--disabled { opacity: .56; }
@media screen and (min-width: 768px) {
    .license-page { max-width: 750rpx; margin: 0 auto; }
    .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .form-row--wide { grid-column: span 2; }
    .upload-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.claim-intro,
.claim-shop,
.claim-flow,
.claim-shop__hero,
.claim-shop__body,
.claim-flow__head,
.claim-action-block,
.claim-bottom-actions {
    width: 100%;
    max-width: 750rpx;
}

.claim-rule-card,
.claim-advantage-card,
.claim-card,
.claim-button-row,
.claim-agreement,
.claim-realname-title {
    max-width: calc(100% - 48rpx);
    box-sizing: border-box;
}

.claim-rule-card__content text,
.claim-advantage-card__content text,
.claim-card__hint,
.claim-safe-tip,
.claim-agreement,
.claim-check-row {
    white-space: normal;
}

.claim-shop__title,
.claim-card__title,
.claim-card__value,
.claim-progress__item view {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
