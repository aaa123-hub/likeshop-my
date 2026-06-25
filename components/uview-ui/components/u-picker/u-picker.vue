<template>
  <view v-if="value" class="u-picker-lite"><slot /></view>
</template>

<script>
export default {
  name: 'u-picker',
  props: { value: Boolean },
  methods: {
    close() { this.$emit('input', false); this.$emit('close') },
    getResult(type) { this.$emit(type, {}) }
  }
}
</script>
