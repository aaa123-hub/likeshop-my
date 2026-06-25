<template>
  <view class="u-numberbox"><view class="u-btn" @tap="change(-1)">-</view><input class="u-num" type="number" :value="inputVal" @input="onInput" @blur="onBlur" /><view class="u-btn" @tap="change(1)">+</view></view>
</template>

<script>
export default {
  name: 'u-number-box',
  props: { value: { default: 1 }, min: { default: 0 }, max: { default: 99999 }, disabled: Boolean },
  data: function(){ return { inputVal: this.value } },
  watch:{ value: function(v){ this.inputVal=v } },
  methods:{ normalize: function(v){ var n=parseInt(v,10); if(!n||Number.isNaN(n)) n=Number(this.min)||1; return Math.max(Number(this.min)||0,Math.min(Number(this.max)||99999,n)) }, emit: function(v,t){ var n=this.normalize(v); this.inputVal=n; this.$emit('input',n); this.$emit(t,{value:n}) }, change: function(s){ if(!this.disabled)this.emit(Number(this.inputVal||0)+s,s>0?'plus':'minus') }, onInput: function(e){ this.emit(e.detail.value,'change') }, onBlur: function(e){ this.emit(e.detail.value,'blur') } }
}
</script>

<style scoped>
.u-numberbox{display:flex;align-items:center}.u-btn{width:50rpx;height:50rpx;line-height:50rpx;text-align:center;background:#f2f3f5}.u-num{width:70rpx;height:50rpx;text-align:center;background:#f2f3f5;margin:0 4rpx}
</style>
