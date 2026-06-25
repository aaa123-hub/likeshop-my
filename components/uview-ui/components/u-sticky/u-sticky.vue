<template>
  <view class="u-sticky-lite"><slot /></view>
</template>

<script>
export default { name: 'u-sticky' }
</script>

<style scoped>
.u-sticky-lite{position:sticky;top:0;z-index:970}
</style>
