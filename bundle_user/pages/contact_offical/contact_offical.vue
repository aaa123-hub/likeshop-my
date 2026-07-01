<template>
    <view class="contact-page">
        <view class="contact-hero">
            <view class="contact-hero__eyebrow">官方客服</view>
            <view class="contact-hero__title">需要帮助吗</view>
            <view class="contact-hero__desc">商品咨询、订单售后、支付问题都可以联系平台客服处理</view>
        </view>

        <view class="contact-card">
            <view class="contact-card__head">
                <image v-if="server.image || server.qrcode" class="contact-card__avatar" :src="server.image || server.qrcode" mode="aspectFill"></image>
                <view v-else class="contact-card__avatar contact-card__avatar--empty">客</view>
                <view class="contact-card__info">
                    <view class="contact-card__name">{{ server.name || '平台客服' }}</view>
                    <view class="contact-card__time">{{ server.time || '服务时间待配置' }}</view>
                </view>
                <view class="contact-card__status">在线咨询</view>
            </view>

            <view class="context-card" v-if="goodsName || shopName">
                <image v-if="goodsImage" class="context-card__image" :src="goodsImage" mode="aspectFill"></image>
                <view class="context-card__main">
                    <view class="context-card__label">当前咨询</view>
                    <view class="context-card__text line1">{{ goodsName || shopName }}</view>
                    <view class="context-card__meta line1">
                        <text v-if="price">¥{{ price }}</text>
                        <text v-if="shopName">{{ price ? ' · ' : '' }}{{ shopName }}</text>
                    </view>
                </view>
            </view>

            <view v-if="server.qrcode" class="qrcode-box" @tap="previewQrcode">
                <image v-if="server.qrcode || server.image" class="qrcode-box__image" :src="server.qrcode || server.image" mode="aspectFit"></image>
            </view>
            <view v-if="server.qrcode" class="qrcode-tip">长按识别或点击预览二维码添加客服</view>
            <view v-else class="qrcode-box qrcode-box--empty">客服二维码待配置</view>

            <view class="contact-row" v-if="server.wechat">
                <view class="contact-row__main">
                    <view class="contact-row__label">客服微信</view>
                    <view class="contact-row__value">{{ server.wechat }}</view>
                </view>
                <view class="contact-row__btn" @tap="onCopy(server.wechat)">复制</view>
            </view>

            <view class="contact-row" v-if="server.qq">
                <view class="contact-row__main">
                    <view class="contact-row__label">客服QQ</view>
                    <view class="contact-row__value">{{ server.qq }}</view>
                </view>
                <view class="contact-row__btn" @tap="onCopy(server.qq)">复制</view>
            </view>

            <view class="contact-row" v-if="server.phone">
                <view class="contact-row__main">
                    <view class="contact-row__label">客服电话</view>
                    <view class="contact-row__value">{{ server.phone }}</view>
                </view>
                <view class="contact-row__btn" @tap="showTelTips">拨打</view>
            </view>

            <view v-if="!hasServiceContact" class="contact-empty">客服联系方式暂未配置，请稍后再试</view>

            <view class="contact-actions">
                <!-- #ifdef MP-WEIXIN -->
                <button open-type="contact" class="contact-action contact-action--primary">在线客服</button>
                <!-- #endif -->
                <!-- #ifndef MP-WEIXIN -->
                <view class="contact-action contact-action--primary" @tap="openOnlineService">在线客服</view>
                <!-- #endif -->
                <view class="contact-action" @tap="copyServiceSummary">复制信息</view>
            </view>
        </view>

        <view class="contact-tips">
            <view class="contact-tips__title">温馨提示</view>
            <view class="contact-tips__item">1. 从商品详情进入时，客服会优先按当前商品协助处理。</view>
            <view class="contact-tips__item">2. 如二维码、微信、电话为空，说明后台客服资料未配置。</view>
            <view class="contact-tips__item">3. 客服服务时间以页面实际展示为准。</view>
        </view>

        <u-modal
            :content="content"
            v-model="showPhoneCall"
            show-cancel-button
            confirm-text="呼叫"
            confirm-color="#037DFA"
            @confirm="onCall"
        ></u-modal>
    </view>
</template>

<script>
import UModal from '@/bundle_user/components/uview-ui/components/u-modal/u-modal.vue'
import { getService } from '@/api/app'
import { copy } from '@/utils/tools'

const CONTACT_LOGO_URL = 'https://shengyuan.store/api/miniapp/files/miniapp/9a00ed2e7a714b19ab4e1cfc4b825665/____________LOGO_2.png'
const CONTACT_QRCODE_URL = 'https://shengyuan.store/api/miniapp/files/miniapp/5ace95d131b045d09668afcd4933e117/_________.png'

export default {
    name: 'contactOffical',
    components: {
        UModal
    },
    data() {
        return {
            server: {
                name: '平台客服',
                image: CONTACT_LOGO_URL,
                qrcode: CONTACT_QRCODE_URL,
                wechat: '',
                qq: '',
                phone: '',
                time: '',
                onlineUrl: ''
            },
            goodsName: '',
            goodsImage: '',
            shopName: '',
            price: '',
            showPhoneCall: false,
            content: '即将拨打客服电话'
        }
    },
    onLoad(options = {}) {
        this.goodsName = decodeURIComponent(options.goodsName || '')
        this.goodsImage = decodeURIComponent(options.goodsImage || '')
        this.shopName = decodeURIComponent(options.shopName || '')
        this.price = decodeURIComponent(options.price || '')
        this.$getService()
    },
    computed: {
        hasServiceContact() {
            return Boolean(this.server.qrcode || this.server.wechat || this.server.qq || this.server.phone || this.server.onlineUrl)
        }
    },
    methods: {
        $getService() {
            getService().then(res => {
                if (res.code == 1) {
                    const data = res.data || {}
                    this.server = {
                        ...this.server,
                        ...data,
                        name: data.name || data.appName || data.title || this.server.name,
                        image: CONTACT_LOGO_URL,
                        qrcode: CONTACT_QRCODE_URL,
                        onlineUrl: data.onlineUrl || data.online_url || ''
                    }
                }
            })
        },
        openOnlineService() {
            if (this.server.onlineUrl) {
                if (this.server.onlineUrl.indexOf('/') === 0) {
                    uni.navigateTo({ url: this.server.onlineUrl })
                    return
                }
                this.onCopy(this.server.onlineUrl)
                return
            }
            if (this.server.wechat) {
                this.onCopy(this.server.wechat)
                return
            }
            if (this.server.qrcode) {
                this.previewQrcode()
                return
            }
            uni.showToast({ title: '客服入口待配置', icon: 'none' })
        },
        onCopy(str) {
            if (!str) {
                uni.showToast({ title: '暂无可复制内容', icon: 'none' })
                return
            }
            copy(str)
        },
        copyServiceSummary() {
            const list = [
                this.server.wechat ? `客服微信：${this.server.wechat}` : '',
                this.server.qq ? `客服QQ：${this.server.qq}` : '',
                this.server.phone ? `客服电话：${this.server.phone}` : '',
                this.server.time ? `服务时间：${this.server.time}` : '',
                this.server.onlineUrl ? `在线客服：${this.server.onlineUrl}` : '',
                this.goodsName ? `咨询商品：${this.goodsName}` : '',
                this.shopName ? `店铺：${this.shopName}` : ''
            ].filter(Boolean)
            if (!list.length) {
                uni.showToast({ title: '暂无可复制内容', icon: 'none' })
                return
            }
            this.onCopy(list.join('\n'))
        },
        showTelTips() {
            if (!this.server.phone) {
                uni.showToast({ title: '暂无客服电话', icon: 'none' })
                return
            }
            this.showPhoneCall = true
            this.content = `即将拨打客服电话 ${this.server.phone}`
        },
        onCall() {
            uni.makePhoneCall({
                phoneNumber: String(this.server.phone)
            })
        },
        previewQrcode() {
            const url = this.server.qrcode || this.server.image
            if (!url) {
                uni.showToast({ title: '暂无客服二维码', icon: 'none' })
                return
            }
            uni.previewImage({
                urls: [url],
                current: url
            })
        }
    }
}
</script>

<style lang="scss">
.contact-page {
    min-height: 100vh;
    padding-bottom: 54rpx;
    background: linear-gradient(180deg, #037dfa 0%, #59b4ff 310rpx, #f6f8fb 310rpx, #f6f8fb 100%);
}

.contact-hero {
    padding: 96rpx 46rpx 42rpx;
    color: #ffffff;
}

.contact-hero__eyebrow {
    display: inline-flex;
    padding: 8rpx 18rpx;
    margin-bottom: 18rpx;
    font-size: 22rpx;
    border-radius: 24rpx;
    background: rgba(255, 255, 255, 0.18);
}

.contact-hero__title {
    font-size: 44rpx;
    font-weight: 600;
    line-height: 56rpx;
}

.contact-hero__desc {
    margin-top: 18rpx;
    font-size: 26rpx;
    line-height: 38rpx;
    opacity: 0.9;
}

.contact-card,
.contact-tips {
    margin: 0 28rpx;
    background: #ffffff;
    border-radius: 28rpx;
    box-shadow: 0 16rpx 40rpx rgba(17, 89, 171, 0.1);
}

.contact-card {
    padding: 34rpx 30rpx 36rpx;
}

.contact-card__head {
    display: flex;
    align-items: center;
}

.contact-card__avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 24rpx;
    background: #eef4ff;
}

.contact-card__avatar--empty {
    color: #037dfa;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 96rpx;
    text-align: center;
}

.contact-card__info {
    flex: 1;
    min-width: 0;
    margin-left: 20rpx;
}

.contact-card__status {
    padding: 10rpx 18rpx;
    color: #037dfa;
    font-size: 22rpx;
    border-radius: 22rpx;
    background: #eaf5ff;
}

.contact-card__name {
    color: #222222;
    font-size: 32rpx;
    font-weight: 600;
}

.contact-card__time {
    margin-top: 12rpx;
    color: #777777;
    font-size: 24rpx;
}

.context-card {
    display: flex;
    align-items: center;
    margin-top: 28rpx;
    padding: 18rpx 22rpx;
    background: #f5f9ff;
    border-radius: 18rpx;
}

.context-card__image {
    width: 92rpx;
    height: 92rpx;
    margin-right: 18rpx;
    border-radius: 16rpx;
    background: #eef4ff;
}

.context-card__main {
    flex: 1;
    min-width: 0;
}

.context-card__label {
    color: #037dfa;
    font-size: 22rpx;
}

.context-card__text {
    margin-top: 8rpx;
    color: #222222;
    font-size: 26rpx;
}

.context-card__meta {
    margin-top: 8rpx;
    color: #777777;
    font-size: 22rpx;
}

.qrcode-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 360rpx;
    height: 360rpx;
    margin: 36rpx auto 0;
    border-radius: 28rpx;
    background: #f2f5f8;
}

.qrcode-box__image {
    width: 320rpx;
    height: 320rpx;
}

.qrcode-box__empty {
    color: #999999;
    font-size: 26rpx;
}

.qrcode-box--empty {
    color: #8b96a8;
    font-size: 26rpx;
    border: 2rpx dashed #dbe6f2;
    background: #f7faff;
}

.qrcode-tip {
    margin-top: 18rpx;
    color: #999999;
    font-size: 24rpx;
    text-align: center;
}

.contact-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24rpx;
    padding: 22rpx 24rpx;
    background: #f8f9fb;
    border-radius: 18rpx;
}

.contact-row__label {
    color: #888888;
    font-size: 22rpx;
}

.contact-row__value {
    margin-top: 8rpx;
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
}

.contact-row__btn {
    width: 104rpx;
    height: 52rpx;
    color: #ffffff;
    font-size: 24rpx;
    line-height: 52rpx;
    text-align: center;
    border-radius: 26rpx;
    background: #037dfa;
}

.contact-empty {
    margin-top: 28rpx;
    padding: 22rpx 24rpx;
    color: #8b6b2e;
    font-size: 24rpx;
    line-height: 36rpx;
    border-radius: 18rpx;
    background: #fff7e8;
}

.contact-actions {
    display: flex;
    gap: 18rpx;
    margin-top: 34rpx;
}

.contact-action {
    flex: 1;
    height: 76rpx;
    padding: 0;
    color: #037dfa;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 76rpx;
    text-align: center;
    border-radius: 38rpx;
    background: #eaf5ff;
}

.contact-action--primary {
    color: #ffffff;
    background: #037dfa;
}

.contact-action::after {
    border: 0;
}

.contact-tips {
    margin-top: 24rpx;
    padding: 30rpx 30rpx 34rpx;
}

.contact-tips__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 600;
}

.contact-tips__item {
    margin-top: 16rpx;
    color: #777777;
    font-size: 24rpx;
    line-height: 36rpx;
}
</style>
