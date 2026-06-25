<template>
  <view v-if="value" class="u-select-lite"><slot /></view>
</template>

<script>
export default {
  name: 'u-select',
  props: { value: Boolean, list: { type: Array, default: () => [] } },
  methods: {
    close() { this.$emit('input', false); this.$emit('close') },
    confirm() { this.$emit('confirm', this.list[0] || {}) }
  }
}
</script>
