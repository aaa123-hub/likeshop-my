<template>
    <view class="auto-points-page">
        <view class="auto-points-topbar">
            <view class="auto-points-back" @tap="goBack"></view>
            <view class="auto-points-title">自动领取积分设置</view>
        </view>

        <view class="auto-points-section-title">
            <view class="auto-points-section-title__bar"></view>
            <text>线上订单</text>
        </view>

        <view class="auto-points-card">
            <view class="auto-points-row">
                <text>支付后</text>
                <view :class="['auto-points-switch', onlinePay ? 'is-active' : '']" @tap="onlinePay = !onlinePay">
                    <view class="auto-points-switch__thumb"></view>
                </view>
            </view>
            <image class="auto-points-divider" src="https://shengyuan.store/api/miniapp/files/miniapp/b8dfe9dcba7644ef89bbf62c4230aba3/auto-points-divider.png" mode="scaleToFill"></image>
            <view class="auto-points-row">
                <text>确认收货后</text>
                <view :class="['auto-points-switch', onlineReceive ? 'is-active' : '']" @tap="onlineReceive = !onlineReceive">
                    <view class="auto-points-switch__thumb"></view>
                </view>
            </view>
        </view>

        <view class="auto-points-section-title auto-points-section-title--offline">
            <view class="auto-points-section-title__bar"></view>
            <text>线下订单</text>
        </view>

        <view class="auto-points-card auto-points-card--single">
            <view class="auto-points-row">
                <text>支付后</text>
                <view :class="['auto-points-switch', offlinePay ? 'is-active' : '']" @tap="offlinePay = !offlinePay">
                    <view class="auto-points-switch__thumb"></view>
                </view>
            </view>
        </view>
        <image class="auto-points-divider auto-points-divider--standalone" src="https://shengyuan.store/api/miniapp/files/miniapp/b8dfe9dcba7644ef89bbf62c4230aba3/auto-points-divider.png" mode="scaleToFill"></image>

        <view :class="['auto-points-save', saving ? 'is-disabled' : '']" @tap="saveSettings">{{ saving ? '保存中...' : '保存' }}</view>
    </view>
</template>

<script>
import { getAutoReceivePoints, setAutoReceivePoints } from '@/api/user'

const AUTO_POINTS_CACHE_KEY = 'auto_receive_points_settings'

export default {
    data() {
        return {
            onlinePay: true,
            onlineReceive: false,
            offlinePay: true,
            saving: false
        }
    },
    onLoad() {
        this.loadCachedSettings()
        this.loadSettings()
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
        parseSwitchValue(value, fallback) {
            if (value === undefined || value === null || value === '') return fallback
            if (value === true || value === 1 || value === '1') return true
            if (value === false || value === 0 || value === '0') return false
            const text = String(value).toLowerCase()
            if (text === 'true' || text === 'yes' || text === 'on') return true
            if (text === 'false' || text === 'no' || text === 'off') return false
            return fallback
        },
        currentSettings() {
            return {
                onlinePay: Boolean(this.onlinePay),
                onlineReceive: Boolean(this.onlineReceive),
                offlinePay: Boolean(this.offlinePay)
            }
        },
        buildSettingsPayload(settings = this.currentSettings()) {
            const enabled = settings.onlinePay || settings.onlineReceive || settings.offlinePay
            return {
                onlinePay: settings.onlinePay,
                online_pay: settings.onlinePay,
                onlineAfterPay: settings.onlinePay,
                online_after_pay: settings.onlinePay,
                onlineReceive: settings.onlineReceive,
                online_receive: settings.onlineReceive,
                onlineAfterReceive: settings.onlineReceive,
                online_after_receive: settings.onlineReceive,
                offlinePay: settings.offlinePay,
                offline_pay: settings.offlinePay,
                offlineAfterPay: settings.offlinePay,
                offline_after_pay: settings.offlinePay,
                autoReceiveFlag: enabled,
                auto_receive_flag: enabled,
                enabled,
                value: enabled
            }
        },
        normalizeSettings(raw = {}, fallback = this.currentSettings()) {
            const data = raw.settings || raw.config || raw.autoReceive || raw.auto_receive || raw
            const hasOnlinePay = data.onlinePay !== undefined || data.online_pay !== undefined || data.onlineAfterPay !== undefined || data.online_after_pay !== undefined
            const hasOnlineReceive = data.onlineReceive !== undefined || data.online_receive !== undefined || data.onlineAfterReceive !== undefined || data.online_after_receive !== undefined
            const hasOfflinePay = data.offlinePay !== undefined || data.offline_pay !== undefined || data.offlineAfterPay !== undefined || data.offline_after_pay !== undefined
            const autoReceiveFlag = this.parseSwitchValue(data.autoReceiveFlag ?? data.auto_receive_flag ?? data.value ?? data.enabled, true)
            return {
                onlinePay: hasOnlinePay
                    ? this.parseSwitchValue(data.onlinePay ?? data.online_pay ?? data.onlineAfterPay ?? data.online_after_pay, fallback.onlinePay)
                    : fallback.onlinePay,
                onlineReceive: hasOnlineReceive
                    ? this.parseSwitchValue(data.onlineReceive ?? data.online_receive ?? data.onlineAfterReceive ?? data.online_after_receive, fallback.onlineReceive)
                    : fallback.onlineReceive,
                offlinePay: hasOfflinePay
                    ? this.parseSwitchValue(data.offlinePay ?? data.offline_pay ?? data.offlineAfterPay ?? data.offline_after_pay, fallback.offlinePay)
                    : fallback.offlinePay,
                hasDetailedFields: hasOnlinePay || hasOnlineReceive || hasOfflinePay,
                autoReceiveFlag
            }
        },
        applySettings(settings = {}) {
            this.onlinePay = Boolean(settings.onlinePay)
            this.onlineReceive = Boolean(settings.onlineReceive)
            this.offlinePay = Boolean(settings.offlinePay)
        },
        loadCachedSettings() {
            try {
                const cache = uni.getStorageSync(AUTO_POINTS_CACHE_KEY)
                if (!cache) return
                this.applySettings(this.normalizeSettings(cache, this.currentSettings()))
            } catch (error) {}
        },
        saveCachedSettings(settings = this.currentSettings()) {
            try {
                uni.setStorageSync(AUTO_POINTS_CACHE_KEY, {
                    ...this.buildSettingsPayload(settings),
                    updatedAt: Date.now()
                })
            } catch (error) {}
        },
        async loadSettings() {
            try {
                const res = await getAutoReceivePoints()
                if (res.code != 1) return
                const fallback = this.currentSettings()
                const settings = this.normalizeSettings(res.data || {}, fallback)
                if (settings.hasDetailedFields) {
                    this.applySettings(settings)
                    this.saveCachedSettings(settings)
                    return
                }
                if (!uni.getStorageSync(AUTO_POINTS_CACHE_KEY)) {
                    this.applySettings({
                        onlinePay: settings.autoReceiveFlag,
                        onlineReceive: false,
                        offlinePay: settings.autoReceiveFlag
                    })
                }
            } catch (error) {
            }
        },
        async saveSettings() {
            if (this.saving) return
            this.saving = true
            try {
                const settings = this.currentSettings()
                const res = await setAutoReceivePoints(this.buildSettingsPayload(settings))
                if (res.code == 1) {
                    this.saveCachedSettings(settings)
                    const responseSettings = this.normalizeSettings(res.data || {}, settings)
                    if (responseSettings.hasDetailedFields) {
                        this.applySettings(responseSettings)
                        this.saveCachedSettings(responseSettings)
                    }
                    uni.showToast({ title: '保存成功', icon: 'success' })
                    return
                }
                uni.showToast({ title: res.msg || '保存失败，请重试', icon: 'none' })
            } catch (error) {
                uni.showToast({ title: '保存失败，请重试', icon: 'none' })
            } finally {
                this.saving = false
            }
        }
    }
}
</script>

<style lang="scss">
.auto-points-page {
    position: relative;
    min-height: 100vh;
    padding-top: calc(var(--app-safe-top) + 24rpx);
    overflow: hidden;
    background: #fff9f0 url('https://shengyuan.store/api/miniapp/files/miniapp/d436eea929e84f17a7bbc5f609cc7188/auto-points-bg.png') no-repeat center top;
    background-size: 100% 100%;
    box-sizing: border-box;
}

.auto-points-page,
.auto-points-page * {
    box-sizing: border-box;
}

.auto-points-topbar {
    position: relative;
    display: flex;
    align-items: center;
    height: 64rpx;
    margin: 0 24rpx;
}

/* #ifdef MP-WEIXIN */
.auto-points-topbar {
    margin-right: 220rpx;
}
/* #endif */

.auto-points-back {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    color: #222222;
}

.auto-points-back::after {
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

.auto-points-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #222222;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 36rpx;
    white-space: nowrap;
}

.auto-points-section-title {
    display: flex;
    align-items: center;
    width: calc(100% - 48rpx);
    max-width: 703rpx;
    margin: 45rpx auto 0;
    color: #222222;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 32rpx;
}

.auto-points-section-title--offline {
    margin-top: 59rpx;
}

.auto-points-section-title__bar {
    width: 11rpx;
    height: 26rpx;
    margin-right: 18rpx;
    background: #a0610d;
}

.auto-points-card {
    width: calc(100% - 48rpx);
    max-width: 703rpx;
    height: 201rpx;
    margin: 34rpx auto 0;
    overflow: hidden;
    background: #ffffff;
    border-radius: 15rpx;
}

.auto-points-card--single {
    height: 99rpx;
}

.auto-points-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 99rpx;
    padding: 0 35rpx 0 29rpx;
    color: #222222;
    font-size: 28rpx;
    font-weight: 500;
    box-sizing: border-box;
}

.auto-points-switch {
    position: relative;
    width: 83rpx;
    height: 42rpx;
    background: #c7c7c7;
    border-radius: 21rpx;
    transition: background 0.2s;
}

.auto-points-switch.is-active {
    background: #a0610d;
}

.auto-points-switch__thumb {
    position: absolute;
    left: 4rpx;
    top: 4rpx;
    width: 34rpx;
    height: 34rpx;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.18);
    transition: transform 0.2s;
}

.auto-points-switch.is-active .auto-points-switch__thumb {
    transform: translateX(41rpx);
}

.auto-points-divider {
    display: block;
    width: 100%;
    height: 1rpx;
}

.auto-points-divider--standalone {
    width: calc(100% - 48rpx);
    max-width: 703rpx;
    margin: 0 auto;
}

.auto-points-save {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: calc(113rpx + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 168rpx);
    max-width: 582rpx;
    height: 81rpx;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
    background: #a0610d;
    border-radius: 40rpx;
    transform: translateX(-50%);
}

.auto-points-save.is-disabled {
    opacity: 0.65;
}
</style>
