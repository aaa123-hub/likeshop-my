<template>
  <view class="u-sticky-root"><slot></slot></view>
</template>

<script>
export default {
  name: 'u-sticky',
  props: {
    offsetTop: [String, Number],
    h5NavHeight: [String, Number],
    bgColor: String,
    zIndex: [String, Number],
    enable: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.u-sticky-root { width: 100%; }
</style>
