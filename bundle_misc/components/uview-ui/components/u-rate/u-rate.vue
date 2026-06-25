<template>
  <view class="u-rate-lite"><text v-for="i in count" :key="i">{{ i <= Number(value || 0) ? '★' : '☆' }}</text></view>
</template>

<script>
export default { name: 'u-rate', props: { value: [String, Number], count: { type: [String, Number], default: 5 } } }
</script>

<style scoped>
.u-rate-lite{display:inline-flex;color:#f6a623;font-size:28rpx}
</style>
