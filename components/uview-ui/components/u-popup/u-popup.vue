<template>
  <view v-if="value" class="u-popup-root" :style="{ zIndex: zIndex || 1075 }">
    <view v-if="mask" class="u-popup-root__mask" @tap="maskClick"></view>
    <view :class="['u-popup-root__content', 'is-' + mode]" :style="contentStyle" @tap.stop>
      <view v-if="closeable" class="u-popup-root__close" @tap="close">×</view>
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'u-popup',
  props: {
    value: Boolean,
    mode: {
      type: String,
      default: 'center'
    },
    mask: {
      type: Boolean,
      default: true
    },
    maskCloseAble: {
      type: Boolean,
      default: true
    },
    closeable: Boolean,
    borderRadius: [String, Number],
    safeAreaInsetBottom: Boolean,
    customStyle: Object,
    zIndex: [String, Number]
  },
  computed: {
    contentStyle() {
      const style = Object.assign({}, this.customStyle || {})
      if (this.borderRadius) {
        const radius = `${this.borderRadius}rpx`
        style.borderRadius = this.mode === 'bottom' ? `${radius} ${radius} 0 0` : radius
        style.overflow = 'hidden'
      }
      if (this.safeAreaInsetBottom) style.paddingBottom = 'env(safe-area-inset-bottom)'
      return style
    }
  },
  methods: {
    maskClick() {
      if (this.maskCloseAble) this.close()
    },
    close() {
      this.$emit('input', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.u-popup-root {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.u-popup-root__mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
}
.u-popup-root__content {
  position: absolute;
  background: #ffffff;
}
.u-popup-root__content.is-bottom {
  left: 0;
  right: 0;
  bottom: 0;
}
.u-popup-root__content.is-top {
  left: 0;
  right: 0;
  top: 0;
}
.u-popup-root__content.is-center {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.u-popup-root__close {
  position: absolute;
  right: 24rpx;
  top: 20rpx;
  z-index: 2;
  color: #999999;
  font-size: 40rpx;
  line-height: 40rpx;
}
</style>
