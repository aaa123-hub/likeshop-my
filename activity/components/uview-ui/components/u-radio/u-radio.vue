<template>
  <view class="u-radio-lite" @tap="select">
    <view class="u-radio-lite__icon" :class="{ active: checked }"></view>
    <slot />
  </view>
</template>

<script>
export default {
  name: 'u-radio',
  props: { value: [String, Number, Boolean], name: [String, Number, Boolean], disabled: Boolean },
  computed: { checked() { return this.value === this.name || this.value === true } },
  methods: { select() { if (!this.disabled) this.$emit('input', this.name); this.$emit('change', this.name) } }
}
</script>

<style scoped>
.u-radio-lite{display:inline-flex;align-items:center}.u-radio-lite__icon{width:32rpx;height:32rpx;margin-right:10rpx;border:2rpx solid #ddd;border-radius:50%;box-sizing:border-box}.u-radio-lite__icon.active{border:10rpx solid #a0610d}
</style>
