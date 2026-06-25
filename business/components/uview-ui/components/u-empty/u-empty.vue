<template>
  <view class="u-empty"><view>{{ text || '暂无内容' }}</view><slot name="bottom"></slot></view>
</template>

<script>
export default {
  name: 'u-empty',
  props: { text: String, mode: String }
}
</script>

<style scoped>
.u-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80rpx 0;color:#999}
</style>
