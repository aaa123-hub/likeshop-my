<template>
  <view class="u-checkbox-lite" @tap="toggle">
    <view class="u-checkbox-lite__icon" :class="{ active: checked }"></view>
    <slot />
  </view>
</template>

<script>
export default {
  name: 'u-checkbox',
  props: { value: Boolean, name: [String, Number], disabled: Boolean },
  computed: { checked() { return !!this.value } },
  methods: { toggle() { if (!this.disabled) this.$emit('input', !this.value); this.$emit('change', !this.value) } }
}
</script>

<style scoped>
.u-checkbox-lite{display:inline-flex;align-items:center}.u-checkbox-lite__icon{width:32rpx;height:32rpx;margin-right:10rpx;border:2rpx solid #ddd;border-radius:50%;box-sizing:border-box}.u-checkbox-lite__icon.active{border-color:#2979ff;background:#2979ff}
</style>
