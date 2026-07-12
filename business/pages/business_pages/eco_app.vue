<template>
    <view class="eco-page">
        <view class="eco-shell">
            <view class="eco-header">
                <view class="eco-back" @tap="goBack"></view>
                <text class="eco-title">生态应用</text>
            </view>

            <view class="eco-grid" v-if="loopData0.length">
                <view
                    v-for="(item, index) in loopData0"
                    :key="item.id || index"
                    :class="['eco-card', `eco-card--${index % 4}`]"
                    @tap="openApp(item)"
                >
                    <view class="eco-card__head">
                        <view class="eco-card__icon-wrap">
                            <image v-if="item.icon" class="eco-card__icon" :src="item.icon" mode="aspectFill"></image>
                        </view>
                        <text class="eco-card__title line1">{{ item.title }}</text>
                    </view>
                    <view class="eco-card__foot">
                        <text class="eco-card__url line1">{{ item.entryText }}</text>
                        <view class="eco-card__arrow"></view>
                    </view>
                </view>
            </view>

            <view v-if="!loading && !loopData0.length" class="eco-empty">
                <view class="eco-empty__title">暂无生态应用</view>
                <view class="eco-empty__desc">平台暂未开放生态应用，请稍后查看</view>
            </view>
        </view>
    </view>
</template>

<script>
import { getEcoApplications } from '@/api/app'
import { resolveImage } from '@/utils/image-placeholder'
import { baseURL } from '@/config/app'

export default {
    data() {
        return {
            loading: false,
            loopData0: []
        }
    },
    onLoad() {
        this.getEcoApplications()
    },
    methods: {
        getEcoApplications() {
            this.loading = true
            getEcoApplications().then(res => {
                if (res.code != 1) return
                const data = res.data || {}
                const list = this.extractEcoList(data)
                this.loopData0 = list.map(item => ({
                    ...item,
                    title: item.title || item.appName || item.app_name || item.name || '生态应用',
                    icon: this.resolveEcoImage(item.icon || item.iconUrl || item.icon_url || item.logoUrl || item.logo_url || item.image || item.cover || item.imageUrl || item.image_url),
                    entryText: this.getEntryText(item),
                    entryUrl: item.entryUrl || item.entry_url || item.linkUrl || item.link_url || item.url || item.appUrl || item.app_url || item.jumpUrl || item.jump_url || '',
                    pagePath: item.pagePath || item.page_path || item.path || '',
                    appId: item.appId || item.app_id || item.appid || item.targetAppId || item.target_app_id || ''
                }))
            }).finally(() => {
                this.loading = false
            })
        },
        extractEcoList(data = {}) {
            if (Array.isArray(data)) return data
            return data.list || data.records || data.items || data.rows || data.content || []
        },
        getEntryText(item = {}) {
            const text = item.urlText || item.entryName || item.entry_name || item.linkUrl || item.link_url || item.entryUrl || item.entry_url || item.url || item.appCode || item.app_code || ''
            return text || '暂未开放'
        },
        resolveEcoImage(src) {
            if (!src) return ''
            const value = String(src).trim()
            if (/^https?:\/\//i.test(value)) return resolveImage(value, 'goods')
            if (value.startsWith('/')) return `${baseURL}${value}`
            return resolveImage(value, 'goods')
        },
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack({ delta: 1 })
                return
            }
            uni.switchTab({ url: '/pages/index/index' })
        },
        openApp(item) {
            const targetUrl = item.entryUrl || item.pagePath || item.linkUrl || item.url || ''
            if (item.appId) {
                uni.navigateToMiniProgram({
                    appId: item.appId,
                    path: item.pagePath || targetUrl || '',
                    fail: () => uni.showToast({ title: '暂无法打开该应用', icon: 'none' })
                })
                return
            }
            if (targetUrl && /^\//.test(targetUrl)) {
                uni.navigateTo({ url: targetUrl })
                return
            }
            if (targetUrl && /^https?:\/\//i.test(targetUrl)) {
                uni.setClipboardData({ data: targetUrl })
                uni.showToast({ title: '链接已复制', icon: 'none' })
                return
            }
            uni.showToast({ title: item.entryText || '应用暂未开放', icon: 'none' })
        }
    }
}
</script>

<style lang="scss">
.eco-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    background: #fff9f0;
}

.eco-page::before {
    content: '';
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    height: 100vh;
    background: linear-gradient(180deg, #fff1dc 0%, #fff9f0 38%, #fff9f0 100%);
    pointer-events: none;
}

.eco-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    padding: calc(var(--app-safe-top) + 45rpx) 24rpx 80rpx;
    box-sizing: border-box;
}

.eco-header {
    position: relative;
    display: flex;
    align-items: center;
    height: 64rpx;
}

.eco-back {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 64rpx;
}

.eco-back::after {
    content: '';
    width: 18rpx;
    height: 18rpx;
    border-left: 4rpx solid #222222;
    border-bottom: 4rpx solid #222222;
    transform: rotate(45deg);
}

.eco-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #222222;
    font-size: 36rpx;
    font-family: PingFangSC-Medium, PingFang SC, sans-serif;
    font-weight: 500;
    line-height: 36rpx;
    white-space: nowrap;
}

.eco-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 28rpx;
}

.eco-card {
    width: 338rpx;
    height: 141rpx;
    margin-bottom: 18rpx;
    padding: 19rpx 20rpx 23rpx 17rpx;
    box-sizing: border-box;
    border-radius: 18rpx;
    overflow: hidden;
}

.eco-card--0 {
    background: linear-gradient(135deg, #fff1dc 0%, #ffffff 58%, #fff8ed 100%);
}

.eco-card--1 {
    background: linear-gradient(135deg, #fff4ed 0%, #ffffff 58%, #fff8f0 100%);
}

.eco-card--2 {
    background: linear-gradient(135deg, #fff1dc 0%, #ffffff 58%, #fff8ed 100%);
}

.eco-card--3 {
    background: linear-gradient(135deg, #f0fff6 0%, #ffffff 58%, #f7fff9 100%);
}

.eco-card__head {
    display: flex;
    align-items: center;
    height: 52rpx;
}

.eco-card__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 52rpx;
    margin-right: 14rpx;
    border-radius: 50%;
    background: #eeeeee;
    overflow: hidden;
}

.eco-card__icon {
    width: 52rpx;
    height: 52rpx;
}

.eco-card__title {
    flex: 1;
    color: #222222;
    font-size: 28rpx;
    font-family: PingFangSC-Medium, PingFang SC, sans-serif;
    font-weight: 500;
    line-height: 28rpx;
}

.eco-card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 22rpx;
    margin-top: 25rpx;
}

.eco-card__url {
    width: 250rpx;
    color: #999999;
    font-size: 22rpx;
    line-height: 22rpx;
}

.eco-card__arrow {
    width: 14rpx;
    height: 14rpx;
    border-top: 3rpx solid #b8b8b8;
    border-right: 3rpx solid #b8b8b8;
    transform: rotate(45deg);
}

.eco-empty {
    margin: 160rpx 24rpx 0;
    padding: 58rpx 30rpx;
    text-align: center;
    border-radius: 24rpx;
    background: rgba(255, 255, 255, 0.86);
}

.eco-empty__title {
    color: #222222;
    font-size: 30rpx;
    font-weight: 500;
}

.eco-empty__desc {
    margin-top: 14rpx;
    color: #999999;
    font-size: 24rpx;
}
</style>
