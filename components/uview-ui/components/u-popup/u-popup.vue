<template>
  <view v-if="value || show" class="u-popup-lite" @tap.stop><slot /></view>
</template>

<script>
export default {
  name: 'u-popup',
  props: { value: Boolean, show: Boolean },
  methods: {
    close() { this.$emit('input', false); this.$emit('close') }
  }
}
</script>

<style scoped>
.u-popup-lite{position:fixed;left:0;right:0;bottom:0;z-index:10075;background:#fff}
</style>
