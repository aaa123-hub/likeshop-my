<template>
  <view class="u-tabs-lite"><view v-for="(item,index) in list" :key="index" :class="['u-tabs-lite__item', index === current ? 'active' : '']" @tap="$emit('change', index)">{{ item.name || item }}</view></view>
</template>

<script>
export default { name: 'u-tabs', props: { list: { type: Array, default: () => [] }, current: { type: Number, default: 0 } } }
</script>

<style scoped>
.u-tabs-lite{display:flex;align-items:center}.u-tabs-lite__item{flex:1;text-align:center;padding:20rpx 0;color:#666;font-size:28rpx}.u-tabs-lite__item.active{color:#a0610d;font-weight:600}
</style>
