<template>
  <view class="u-icon" :class="['u-icon--' + labelPos]" @tap="click">
    <image v-if="isImage" class="u-icon__image" :src="name" :mode="imgMode" :style="imageStyle"></image>
    <view v-else-if="cssIconName" :class="['u-icon__css', 'u-icon__css--' + cssIconName]" :style="cssIconStyle"></view>
    <text v-else class="u-icon__text" :style="iconStyle">{{ iconText }}</text>
    <text v-if="label !== '' && label !== undefined" class="u-icon__label" :style="labelStyle">{{ label }}</text>
  </view>
</template>

<script>
const ICON_TEXT = {
  search: '⌕',
  scan: '▣',
  camera: '▣',
  photo: '▣',
  'photo-fill': '▣',
  plus: '+',
  minus: '-',
  close: '×',
  'close-circle': '×',
  'close-circle-fill': '×',
  'arrow-left': '‹',
  'arrow-right': '›',
  'arrow-up': '⌃',
  'arrow-down': '⌄',
  'arrow-up-fill': '⌃',
  'arrow-down-fill': '⌄',
  'arrow-left-double': '≪',
  'arrow-right-double': '≫',
  'nav-back': '‹',
  'nav-back-arrow': '‹',
  'checkbox-mark': '✓',
  'checkmark-circle': '○',
  'checkmark-circle-fill': '●',
  'bell-fill': '●',
  clock: '◷',
  trash: '⌫',
  'edit-pen': '✎',
  backspace: '⌫',
  'play-right-fill': '▶',
  'volume-fill': '●',
  'error-circle-fill': '!',
  question: '?',
  icon: '•',
  'column-line': '┃',
  car: '购物车',
  data: '暂无',
  'empty-data': '暂无'
}

export default {
  name: 'u-icon',
  props: {
    name: {
      type: String,
      default: ''
    },
    color: String,
    size: [String, Number],
    label: {
      type: [String, Number],
      default: ''
    },
    index: [String, Number],
    width: [String, Number],
    height: [String, Number],
    imgMode: {
      type: String,
      default: 'aspectFit'
    },
    labelPos: {
      type: String,
      default: 'right'
    },
    labelColor: String,
    labelSize: [String, Number],
    marginLeft: {
      type: [String, Number],
      default: 6
    },
    marginTop: {
      type: [String, Number],
      default: 6
    },
    customStyle: Object
  },
  computed: {
    isImage() {
      return /^https?:\/\//i.test(this.name) || this.name.indexOf('/') !== -1
    },
    iconText() {
      if (!this.name) return ''
      return ICON_TEXT[this.name] || ICON_TEXT[this.name.replace(/^uicon-/, '')] || ''
    },
    cssIconName() {
      const names = {
        search: 'search',
        'arrow-left': 'arrow-left',
        'nav-back': 'arrow-left',
        'nav-back-arrow': 'arrow-left',
        'arrow-right': 'arrow-right',
        'arrow-up': 'arrow-up',
        'arrow-down': 'arrow-down',
        'arrow-up-fill': 'arrow-up',
        'arrow-down-fill': 'arrow-down',
        close: 'close',
        'close-circle': 'close-circle',
        'close-circle-fill': 'close-circle'
      }
      return names[this.name] || ''
    },
    unitSize() {
      const value = this.size || 32
      return /px|rpx|%$/.test(String(value)) ? String(value) : `${value}rpx`
    },
    iconStyle() {
      return Object.assign({}, this.customStyle || {}, {
        color: this.color || 'inherit',
        fontSize: this.unitSize,
        lineHeight: this.unitSize
      })
    },
    cssIconStyle() {
      return Object.assign({}, this.customStyle || {}, {
        color: this.color || 'inherit',
        width: this.unitSize,
        height: this.unitSize
      })
    },
    imageStyle() {
      const width = this.width || this.size || 32
      const height = this.height || this.size || 32
      const addUnit = value => (/px|rpx|%$/.test(String(value)) ? String(value) : `${value}rpx`)
      return Object.assign({}, this.customStyle || {}, {
        width: addUnit(width),
        height: addUnit(height)
      })
    },
    labelStyle() {
      const size = this.labelSize || 28
      return {
        color: this.labelColor || this.color || 'inherit',
        fontSize: /px|rpx|%$/.test(String(size)) ? String(size) : `${size}rpx`,
        marginLeft: this.labelPos === 'right' ? `${this.marginLeft}rpx` : 0,
        marginTop: this.labelPos === 'bottom' ? `${this.marginTop}rpx` : 0
      }
    }
  },
  methods: {
    click(e) {
      this.$emit('click', this.index)
      this.$emit('tap', e)
    }
  }
}
</script>

<style scoped>
.u-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
.u-icon--bottom {
  flex-direction: column;
}
.u-icon__text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 500;
}
.u-icon__css {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  flex: none;
}
.u-icon__css--search::before {
  content: '';
  position: absolute;
  left: 18%;
  top: 18%;
  width: 48%;
  height: 48%;
  border: 3rpx solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
}
.u-icon__css--search::after {
  content: '';
  position: absolute;
  right: 18%;
  bottom: 20%;
  width: 34%;
  height: 3rpx;
  background: currentColor;
  border-radius: 2px;
  transform: rotate(45deg);
  transform-origin: right center;
}
.u-icon__css--arrow-left::before,
.u-icon__css--arrow-right::before,
.u-icon__css--arrow-up::before,
.u-icon__css--arrow-down::before {
  content: '';
  position: absolute;
  width: 42%;
  height: 42%;
  border-left: 3rpx solid currentColor;
  border-bottom: 3rpx solid currentColor;
  box-sizing: border-box;
}
.u-icon__css--arrow-left::before { transform: rotate(45deg); }
.u-icon__css--arrow-right::before { transform: rotate(-135deg); }
.u-icon__css--arrow-up::before { transform: rotate(135deg); }
.u-icon__css--arrow-down::before { transform: rotate(-45deg); }
.u-icon__css--close::before,
.u-icon__css--close::after,
.u-icon__css--close-circle::before,
.u-icon__css--close-circle::after {
  content: '';
  position: absolute;
  width: 62%;
  height: 3rpx;
  background: currentColor;
  border-radius: 2px;
}
.u-icon__css--close::before,
.u-icon__css--close-circle::before { transform: rotate(45deg); }
.u-icon__css--close::after,
.u-icon__css--close-circle::after { transform: rotate(-45deg); }
.u-icon__css--close-circle { border: 3rpx solid currentColor; border-radius: 50%; box-sizing: border-box; }
.u-icon__image {
  display: block;
}
.u-icon__label {
  line-height: 1.2;
}
</style>
