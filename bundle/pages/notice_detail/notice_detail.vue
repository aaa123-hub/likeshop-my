<template>
  <view class="notice-detail-page">
    <navbar
      title="消息详情"
      :borderBottom="false"
      :background="{ background: '#dce9ff' }"
    ></navbar>

    <view class="detail-body">
      <view class="detail-title">{{ detail.title }}</view>
      <view class="detail-time">{{ detail.time }}</view>
      <view class="detail-content">{{ detail.content }}</view>
    </view>
  </view>
</template>

<script>
import navbar from "@/components/navbar/navbar.vue";

export default {
  components: {
    navbar,
  },
  data() {
    return {
      detail: {
        title: "",
        time: "",
        content: "",
      },
    };
  },
  onLoad(options) {
    this.detail = {
      title: decodeURIComponent(options.title || ""),
      time: decodeURIComponent(options.time || ""),
      content: decodeURIComponent(options.content || ""),
    };
  },
};
</script>

<style lang="scss">
.notice-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #dce9ff 0, #ffffff 220rpx);
}

.detail-body {
  padding: 28rpx 24rpx 48rpx;
}

.detail-title {
  color: #222222;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 56rpx;
}

.detail-time {
  margin-top: 24rpx;
  color: #555555;
  font-size: 28rpx;
  line-height: 40rpx;
}

.detail-content {
  margin-top: 44rpx;
  color: #666666;
  font-size: 30rpx;
  line-height: 54rpx;
  white-space: pre-wrap;
}
</style>
