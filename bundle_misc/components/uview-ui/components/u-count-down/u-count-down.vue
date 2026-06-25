<template>
  <text>{{ time || timestamp || 0 }}</text>
</template>

<script>
export default {
  name: 'u-count-down',
  props: { time: [String, Number], timestamp: [String, Number] }
}
</script>
