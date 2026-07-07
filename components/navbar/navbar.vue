<template>
  <view class="navbar-root">
    <view class="navbar-root__inner" :style="background">
      <view class="navbar-root__status"></view>
      <view class="navbar-root__bar">
        <view class="navbar-root__left" @tap="goBack">
          <view :class="['navbar-root__icon', isHome ? 'is-home' : 'is-back']"></view>
        </view>
        <view class="navbar-root__title" :style="{ color: titleColor }">{{ title }}</view>
        <view class="navbar-root__right"></view>
      </view>
    </view>
    <view v-if="!immersive" class="navbar-root__placeholder"></view>
  </view>
</template>

<script>
export default {
  name: 'navbar',
  props: {
    title: String,
    titleColor: {
      type: String,
      default: '#000000'
    },
    background: {
      type: Object,
      default: () => ({ background: '#ffffff' })
    },
    borderBottom: {
      type: Boolean,
      default: false
    },
    immersive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isHome() {
      const pages = getCurrentPages()
      return pages.length <= 1
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar-root__inner {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 980;
}
.navbar-root__status {
  height: var(--app-safe-top);
}
.navbar-root__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.navbar-root__left,
.navbar-root__right {
  display: flex;
  align-items: center;
  width: 80rpx;
  height: 80rpx;
}
.navbar-root__icon {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  color: #222222;
}
.navbar-root__icon.is-back::before {
  content: '';
  position: absolute;
  left: 16rpx;
  top: 12rpx;
  width: 20rpx;
  height: 20rpx;
  border-left: 4rpx solid currentColor;
  border-bottom: 4rpx solid currentColor;
  transform: rotate(45deg);
}
.navbar-root__icon.is-home::before {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 18rpx;
  width: 30rpx;
  height: 24rpx;
  border: 4rpx solid currentColor;
  border-top: 0;
  border-radius: 3rpx;
  box-sizing: border-box;
}
.navbar-root__icon.is-home::after {
  content: '';
  position: absolute;
  left: 11rpx;
  top: 8rpx;
  width: 24rpx;
  height: 24rpx;
  border-left: 4rpx solid currentColor;
  border-top: 4rpx solid currentColor;
  transform: rotate(45deg);
  box-sizing: border-box;
}
.navbar-root__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 44rpx;
}
.navbar-root__placeholder {
  height: calc(var(--app-safe-top) + 88rpx);
}
</style>
