<template>
  <u-popup v-model="innerValue" mode="bottom" :safe-area-inset-bottom="safeAreaInsetBottom" @close="close">
    <view class="u-select-root">
      <view class="u-select-root__header">
        <view class="u-select-root__btn" @tap="cancel">{{ cancelText }}</view>
        <view class="u-select-root__title">{{ title }}</view>
        <view class="u-select-root__btn is-confirm" @tap="confirm">{{ confirmText }}</view>
      </view>
      <view class="u-select-root__columns">
        <scroll-view
          v-for="(column, columnIndex) in columns"
          :key="columnIndex"
          class="u-select-root__list"
          scroll-y
        >
          <view
            v-for="(item, index) in column"
            :key="index"
            :class="['u-select-root__item', index === current[columnIndex] ? 'is-active' : '']"
            @tap="selectItem(columnIndex, index)"
          >{{ getLabel(item) }}</view>
        </scroll-view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import UPopup from '@/components/uview-ui/components/u-popup/u-popup.vue'

export default {
  name: 'u-select',
  components: { UPopup },
  props: {
    value: Boolean,
    list: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    labelName: {
      type: String,
      default: 'label'
    },
    valueName: {
      type: String,
      default: 'value'
    },
    mode: {
      type: String,
      default: 'single-column'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    safeAreaInsetBottom: Boolean
  },
  data() { return { current: [0, 0, 0] } },
  computed: {
    innerValue: {
      get() { return this.value },
      set(v) { this.$emit('input', v) }
    },
    columns() {
      if (this.mode === 'mutil-column-auto') {
        const first = this.list || []
        const second = (first[this.current[0]] && first[this.current[0]].children) || []
        const third = (second[this.current[1]] && second[this.current[1]].children) || []
        return [first, second, third].filter(item => item.length)
      }
      if (this.mode === 'mutil-column' && Array.isArray(this.list[0])) return this.list
      return [this.list || []]
    }
  },
  methods: {
    getLabel(item) {
      if (!item || typeof item !== 'object') return item
      return item[this.labelName] || item.label || item.name || item[this.valueName] || ''
    },
    selectItem(columnIndex, index) {
      this.$set(this.current, columnIndex, index)
      for (let i = columnIndex + 1; i < this.current.length; i += 1) {
        this.$set(this.current, i, 0)
      }
    },
    close() { this.$emit('input', false) },
    cancel() { this.$emit('cancel'); this.close() },
    confirm() {
      const result = this.columns.map((column, index) => column[this.current[index]]).filter(Boolean)
      this.$emit('confirm', result)
      this.close()
    }
  }
}
</script>

<style scoped>
.u-select-root { background:#fff; }
.u-select-root__header { display:flex; align-items:center; justify-content:space-between; height:88rpx; padding:0 30rpx; border-bottom:1rpx solid #eee; }
.u-select-root__title { font-size:30rpx; font-weight:600; color:#222; }
.u-select-root__btn { font-size:28rpx; color:#666; }
.u-select-root__btn.is-confirm { color:#1688ff; }
.u-select-root__columns { display:flex; max-height:520rpx; }
.u-select-root__list { flex:1; height:520rpx; }
.u-select-root__item { height:88rpx; line-height:88rpx; text-align:center; font-size:30rpx; color:#333; }
.u-select-root__item.is-active { color:#1688ff; font-weight:700; }
</style>
