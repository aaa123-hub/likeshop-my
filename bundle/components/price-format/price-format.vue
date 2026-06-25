<template>
  <text class="price-format" :class="{ 'line-through': lineThrough }" :style="{ color, 'font-weight': weight }">
    <text v-if="showSubscript" :style="{ 'font-size': subscriptSize + 'rpx' }">¥</text>
    <text :style="{ 'font-size': firstSize + 'rpx' }">{{ priceParts[0] }}</text>
    <text v-if="priceParts[1]" :style="{ 'font-size': secondSize + 'rpx' }">.{{ priceParts[1] }}</text>
  </text>
</template>

<script>
export default {
  name: 'price-format',
  props: {
    price: { type: [String, Number], default: 0 },
    firstSize: { type: [String, Number], default: 28 },
    secondSize: { type: [String, Number], default: 28 },
    subscriptSize: { type: [String, Number], default: 28 },
    color: String,
    weight: { type: [String, Number], default: 400 },
    showSubscript: { type: Boolean, default: true },
    lineThrough: Boolean
  },
  computed: {
    priceParts() {
      const value = Number(this.price || 0).toFixed(2)
      return value.split('.')
    }
  }
}
</script>

<style scoped>
.price-format{font-family:Avenir,PingFang SC,Arial,sans-serif}.line-through{text-decoration:line-through}
</style>
