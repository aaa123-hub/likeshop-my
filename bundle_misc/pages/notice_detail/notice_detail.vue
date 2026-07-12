<template>
  <view class="notice-detail-page">
    <view class="notice-detail-shell">
      <view class="notice-detail-hero">
        <view class="notice-detail-nav">
          <view class="notice-detail-back" @tap="goBack"></view>
          <view class="notice-detail-nav__title">消息详情</view>
          <view class="notice-detail-nav__capsule">
            <view class="notice-detail-nav__capsule-dot"></view>
            <view class="notice-detail-nav__capsule-divider"></view>
            <view class="notice-detail-nav__capsule-circle"></view>
          </view>
        </view>
        <view class="notice-detail-title">{{ detailTitle }}</view>
        <view class="notice-detail-time">{{ detailTime }}</view>
      </view>

      <text class="notice-detail-content">{{ detailContent }}</text>
    </view>
  </view>
</template>

<script>
import { getMessageDetail, readMessage } from '@/api/user'

export default {
  data() {
    return {
      detail: {
        id: "",
        title: "",
        time: "",
        content: "",
      },
    };
  },
  onLoad(options) {
    this.detail = {
      id: options.id || "",
      title: decodeURIComponent(options.title || ""),
      time: decodeURIComponent(options.time || ""),
      content: decodeURIComponent(options.content || ""),
    };
    if (this.detail.id) this.loadMessageDetail(this.detail.id);
  },
  computed: {
    detailTitle() {
      return this.detail.title || "公告详情";
    },
    detailTime() {
      return this.detail.time || "";
    },
    detailContent() {
      return this.detail.content || "暂无公告内容";
    },
  },
  methods: {
    loadMessageDetail(id) {
      getMessageDetail(id).then((res) => {
        if (res.code == 1 && res.data) {
          const data = res.data;
          this.detail = {
            id,
            title: data.title || this.detail.title,
            time: data.create_time || data.createTime || data.sendTime || this.detail.time,
            content: data.content || this.detail.content,
          };
          readMessage(id);
        }
      });
    },
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
        return;
      }
      uni.navigateTo({ url: "/bundle_misc/pages/notice/notice" });
    },
  },
};
</script>

<style lang="scss">
.notice-detail-page {
  min-height: 100vh;
  background: #fff9f0;
}

.notice-detail-shell {
  position: relative;
  width: 100%;
  max-width: 750rpx;
  min-height: 1626rpx;
  margin: 0 auto;
  overflow-x: hidden;
  background: #fff9f0;
  box-sizing: border-box;
}

.notice-detail-hero {
  width: 100%;
  height: calc(729rpx + var(--status-bar-height));
  padding: calc(var(--status-bar-height) + 45rpx) 24rpx 0;
  background: linear-gradient(180deg, #fff0dc 0%, #fff7ed 48%, rgba(255, 249, 240, 0) 100%);
  box-sizing: border-box;
}

.notice-detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64rpx;
}

.notice-detail-back {
  position: relative;
  display: flex;
  align-items: center;
  width: 80rpx;
  height: 64rpx;
  flex: none;
}

.notice-detail-back {
  justify-content: flex-start;
}

.notice-detail-nav__capsule {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168rpx;
  height: 64rpx;
  border: 1rpx solid transparent;
  border-radius: 34rpx;
  background: transparent;
  box-sizing: border-box;
  flex: none;
  opacity: 0;
}

.notice-detail-nav__capsule-dot {
  width: 8rpx;
  height: 8rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #222222;
  box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
}

.notice-detail-nav__capsule-divider {
  width: 1rpx;
  height: 36rpx;
  margin: 0 22rpx 0 42rpx;
  background: rgba(34, 34, 34, .18);
}

.notice-detail-nav__capsule-circle {
  width: 34rpx;
  height: 34rpx;
  border: 4rpx solid #222222;
  border-radius: 50%;
  box-sizing: border-box;
}

.notice-detail-back::after {
  content: '';
  position: absolute;
  left: 0;
  top: 20rpx;
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #222222;
  border-bottom: 4rpx solid #222222;
  transform: rotate(45deg);
}

.notice-detail-nav__title {
  color: #222222;
  font-size: 36rpx;
  font-family: PingFangSC-Medium, sans-serif;
  font-weight: 500;
  line-height: 36rpx;
  white-space: nowrap;
}

.notice-detail-title {
  width: 100%;
  margin-top: 57rpx;
  padding-right: 64rpx;
  color: #222222;
  font-size: 40rpx;
  font-family: PingFangSC-Medium, sans-serif;
  font-weight: 500;
  line-height: 40rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.notice-detail-time {
  margin-top: 32rpx;
  color: #222222;
  font-size: 28rpx;
  font-family: PingFangSC-Medium, sans-serif;
  font-weight: 500;
  line-height: 28rpx;
  white-space: nowrap;
}

.notice-detail-content {
  position: absolute;
  left: 25rpx;
  right: 37rpx;
  top: calc(var(--status-bar-height) + 383rpx);
  color: #666666;
  font-size: 30rpx;
  font-weight: normal;
  line-height: 53rpx;
  white-space: pre-wrap;
  word-break: break-all;
}

@media screen and (min-width: 768px) {
  .notice-detail-shell {
    box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.04);
  }
}
</style>
