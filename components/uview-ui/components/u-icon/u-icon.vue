<template>
  <text class="u-icon" :style="iconStyle" @tap="click">{{ iconText }}</text>
</template>

<script>
export default {
  name: 'u-icon',
  props: { name: String, color: String, size: [String, Number], label: String, index: [String, Number] },
  computed: {
    iconText() { const map={search:'⌕',camera:'▣','checkbox-mark':'✓',minus:'-',plus:'+',car:'购物车',data:'暂无'}; return this.label || map[this.name] || '' },
    iconStyle() { const s=this.size?this.size+'rpx':'32rpx'; return { color:this.color||'inherit', fontSize:s, lineHeight:s } }
  },
  methods: { click(e){ this.$emit('click', this.index); this.$emit('tap', e) } }
}
</script>

<style scoped>
.u-icon{display:inline-flex;align-items:center;justify-content:center}
</style>
