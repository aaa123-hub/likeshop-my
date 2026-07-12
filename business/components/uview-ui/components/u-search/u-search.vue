<template>
  <view class="u-search-lite"><input :value="value" :placeholder="placeholder" @input="$emit('input', $event.detail.value)" @confirm="$emit('search', $event.detail.value)" /></view>
</template>

<script>
export default { name: 'u-search', props: { value: String, placeholder: String } }
</script>

<style scoped>
.u-search-lite{display:flex;align-items:center;height:64rpx;padding:0 24rpx;border-radius:32rpx;background:#fff9f0}.u-search-lite input{flex:1;height:64rpx;font-size:26rpx}
</style>
