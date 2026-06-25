<template>
  <view><slot /></view>
</template>

<script>
export default { name: 'u-radio-group', props: { value: [String, Number, Boolean] } }
</script>
