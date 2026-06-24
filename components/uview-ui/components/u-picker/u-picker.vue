<template>
  <u-popup v-model="innerValue" mode="bottom" :safe-area-inset-bottom="safeAreaInsetBottom" @close="close">
    <view class="u-picker-root">
      <view class="u-picker-root__header">
        <view class="u-picker-root__btn" @tap="cancel">{{ cancelText }}</view>
        <view class="u-picker-root__title">{{ title }}</view>
        <view class="u-picker-root__btn is-confirm" @tap="confirm">{{ confirmText }}</view>
      </view>
      <view class="u-picker-root__list">
        <view
          v-for="(item, index) in range"
          :key="index"
          :class="['u-picker-root__item', index === current ? 'is-active' : '']"
          @tap="current = index"
        >{{ getLabel(item) }}</view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import UPopup from '@/components/uview-ui/components/u-popup/u-popup.vue'

export default {
  name: 'u-picker',
  components: { UPopup },
  props: {
    value: Boolean,
    range: {
      type: Array,
      default: () => []
    },
    rangeKey: String,
    title: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    safeAreaInsetBottom: Boolean,
    defaultSelector: Array
  },
  data() {
    return { current: 0 }
  },
  computed: {
    innerValue: {
      get() { return this.value },
      set(v) { this.$emit('input', v) }
    }
  },
  watch: {
    defaultSelector: {
      immediate: true,
      handler(value) { this.current = Array.isArray(value) ? Number(value[0] || 0) : 0 }
    }
  },
  methods: {
    getLabel(item) { return this.rangeKey && item ? item[this.rangeKey] : item },
    close() { this.$emit('input', false) },
    cancel() { this.$emit('cancel', [this.current]); this.close() },
    confirm() { this.$emit('confirm', [this.current]); this.close() }
  }
}
</script>

<style scoped>
.u-picker-root { background:#fff; }
.u-picker-root__header { display:flex; align-items:center; justify-content:space-between; height:88rpx; padding:0 30rpx; border-bottom:1rpx solid #eee; }
.u-picker-root__title { font-size:30rpx; font-weight:600; color:#222; }
.u-picker-root__btn { font-size:28rpx; color:#666; }
.u-picker-root__btn.is-confirm { color:#1688ff; }
.u-picker-root__list { max-height:520rpx; overflow:auto; }
.u-picker-root__item { height:88rpx; line-height:88rpx; text-align:center; font-size:30rpx; color:#333; }
.u-picker-root__item.is-active { color:#1688ff; font-weight:700; }
</style>
