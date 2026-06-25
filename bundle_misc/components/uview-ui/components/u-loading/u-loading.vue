<template>
  <view v-if="show" class="u-loading-lite" :style="{ color: color || 'currentColor' }"></view>
</template>

<script>
export default { name: 'u-loading', props: { show: { type: Boolean, default: true }, color: String, mode: String } }
</script>

<style scoped>
.u-loading-lite{display:inline-block;width:28rpx;height:28rpx;border:3rpx solid currentColor;border-right-color:transparent;border-radius:50%;animation:u-loading-rotate .8s linear infinite}@keyframes u-loading-rotate{to{transform:rotate(360deg)}}
</style>
