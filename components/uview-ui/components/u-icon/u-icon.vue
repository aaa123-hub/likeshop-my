<template>
  <view class="u-icon" :class="'u-icon--' + name" :style="iconStyle" @tap="$emit('click')">
    <text v-if="label">{{ label }}</text>
  </view>
</template>

<script>
export default {
  name: 'u-icon',
  props: { name: String, color: String, size: [String, Number], label: [String, Number] },
  computed: {
    iconStyle() {
      const size = this.size ? `${this.size}rpx` : '32rpx'
      return { width: size, height: size, color: this.color || 'currentColor' }
    }
  }
}
</script>

<style scoped>
.u-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box}
.u-icon--minus::before,.u-icon--plus::before{content:'';position:absolute;width:60%;height:3rpx;background:currentColor;border-radius:3rpx}
.u-icon--plus::after{content:'';position:absolute;width:3rpx;height:60%;background:currentColor;border-radius:3rpx}
.u-icon--checkbox-mark::before{content:'';position:absolute;width:55%;height:30%;border-left:3rpx solid currentColor;border-bottom:3rpx solid currentColor;transform:rotate(-45deg)}
.u-icon--camera{border:3rpx solid currentColor;border-radius:8rpx}
.u-icon--camera::before{content:'';position:absolute;top:-7rpx;width:34%;height:8rpx;background:currentColor;border-radius:4rpx}
.u-icon--camera::after{content:'';position:absolute;width:38%;height:38%;border:3rpx solid currentColor;border-radius:50%}
</style>
