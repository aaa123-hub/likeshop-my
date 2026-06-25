<template>
  <view v-if="show" class="u-mask-lite" @tap="$emit('click')"></view>
</template>

<script>
export default { name: 'u-mask', props: { show: Boolean } }
</script>

<style scoped>
.u-mask-lite{position:fixed;inset:0;z-index:10070;background:rgba(0,0,0,.45)}
</style>
