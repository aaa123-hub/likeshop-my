<template>
<view class="loading-footer row-center" :style="'color: ' + color">
    <view v-if="status === 'loading' " class="loading row">
		<view class="loading-spinner mr20" :style="'border-top-color: ' + color"></view>
        <text :style="'color: ' + color">{{loadingText}}</text>
    </view>
    <view v-if="status === 'finished'" class="finished">{{ finishedText }}</view>
    <view v-if="status === 'error'" @tap="onRefresh">{{ errorText }}</view>
    <view v-if="status === 'empty'" class="empty">
        <text v-if="!slotEmpty">暂无数据</text>
        <slot name="empty" v-else></slot>
    </view>
</view>
</template>

<script>

export default {
  data() {
    return {};
  },

  components: {
  },
  props: {
    status: {
      type: String,
      default: 'loading'
    },
    errorText: {
      type: String,
      default: '加载失败，点击重新加载'
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    finishedText: {
      type: String,
      default: '我可是有底线的～'
    },
    slotEmpty: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "#666"
    }
  },
  methods: {
    onRefresh() {
      this.$emit('refresh');
    }

  }
};
</script>
<style>
.loading-footer {
    padding: 30rpx 0;
    color: #666;
}

.loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 4rpx solid #e5e5e5;
    border-top-color: #666;
    border-radius: 50%;
    animation: loading-rotate .8s linear infinite;
}

@keyframes loading-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
