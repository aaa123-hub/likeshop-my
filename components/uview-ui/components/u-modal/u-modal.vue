<template>
  <view v-if="value" class="u-modal-wrap"><view class="u-modal-mask"></view><view class="u-modal"><slot>{{ content }}</slot><view class="u-modal-footer"><view v-if="showCancelButton" class="u-modal-btn" @tap="cancel">取消</view><view class="u-modal-btn" @tap="confirm">{{ confirmText || '确认' }}</view></view></view></view>
</template>

<script>
export default {
  name: 'u-modal',
  props: { value: Boolean, content: String, confirmText: String, showCancelButton: Boolean },
  methods: { confirm(){ this.$emit('confirm') }, cancel(){ this.$emit('input', false); this.$emit('cancel') } }
}
</script>

<style scoped>
.u-modal-wrap{position:fixed;inset:0;z-index:999}.u-modal-mask{position:absolute;inset:0;background:rgba(0,0,0,.45)}.u-modal{position:absolute;left:75rpx;right:75rpx;top:40%;transform:translateY(-50%);background:#fff;border-radius:20rpx;overflow:hidden;padding-top:20rpx}.u-modal-footer{display:flex;border-top:1rpx solid #eee;margin-top:20rpx}.u-modal-btn{flex:1;text-align:center;height:88rpx;line-height:88rpx}
</style>
