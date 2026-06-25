<template>
  <text v-if="value || count" class="u-badge-lite">{{ value || count }}</text>
</template>

<script>
export default { name: 'u-badge', props: { value: [String, Number], count: [String, Number] } }
</script>

<style scoped>
.u-badge-lite{display:inline-flex;align-items:center;justify-content:center;min-width:28rpx;height:28rpx;padding:0 8rpx;border-radius:14rpx;background:#fa3534;color:#fff;font-size:20rpx}
</style>
