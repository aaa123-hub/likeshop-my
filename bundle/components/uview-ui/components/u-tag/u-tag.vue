<template>
  <text class="u-tag-lite"><slot>{{ text }}</slot></text>
</template>

<script>
export default { name: 'u-tag', props: { text: String } }
</script>

<style scoped>
.u-tag-lite{display:inline-flex;padding:4rpx 12rpx;border-radius:8rpx;background:#fff9f0;color:#666;font-size:24rpx}
</style>
