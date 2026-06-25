<template>
  <view v-if="show" class="u-back-top-lite" @tap="backTop"><slot>顶部</slot></view>
</template>

<script>
export default {
  name: 'u-back-top',
  props: { show: Boolean },
  methods: { backTop() { uni.pageScrollTo({ scrollTop: 0, duration: 150 }) } }
}
</script>

<style scoped>
.u-back-top-lite{position:fixed;right:24rpx;bottom:160rpx;z-index:980;padding:12rpx 18rpx;border-radius:24rpx;background:rgba(0,0,0,.55);color:#fff;font-size:22rpx}
</style>
