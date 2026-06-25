<template>
  <view class="u-switch-lite" :class="{ active: value }" @tap="toggle"><view></view></view>
</template>

<script>
export default { name: 'u-switch', props: { value: Boolean, disabled: Boolean }, methods: { toggle() { if (!this.disabled) this.$emit('input', !this.value) } } }
</script>

<style scoped>
.u-switch-lite{position:relative;width:84rpx;height:46rpx;border-radius:23rpx;background:#dcdfe6;transition:.2s}.u-switch-lite view{position:absolute;left:4rpx;top:4rpx;width:38rpx;height:38rpx;border-radius:50%;background:#fff;transition:.2s}.u-switch-lite.active{background:#2979ff}.u-switch-lite.active view{left:42rpx}
</style>
