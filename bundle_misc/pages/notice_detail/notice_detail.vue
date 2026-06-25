<template>
  <view class="notice-detail-page">
    <view class="notice-detail-shell">
      <view class="notice-detail-hero">
        <view class="notice-detail-nav">
          <view class="notice-detail-back" @tap="goBack">
            <u-icon name="arrow-left" size="34" color="#222222"></u-icon>
          </view>
          <view class="notice-detail-nav__title">消息详情</view>
          <view class="notice-detail-nav__space"></view>
        </view>
        <view class="notice-detail-title">{{ detailTitle }}</view>
        <view class="notice-detail-time">{{ detailTime }}</view>
      </view>

      <text class="notice-detail-content">{{ detailContent }}</text>
    </view>
  </view>
</template>

<script>
import UIcon from '@/bundle_misc/components/uview-ui/components/u-icon/u-icon.vue'

export default {
  components: {
			UIcon
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
  computed: {
    detailTitle() {
      return this.detail.title || "标题标题标题标题标题标题标题标题";
    },
    detailTime() {
      return this.detail.time || "2026-01-01";
    },
    detailContent() {
      return this.detail.content || "详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充情内容填充详情内容填充详情\n\n内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填\n\n充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填充情内容填充详情内容填充详情内容填充详情内容填充详情内容填充详情内容填";
    },
  },
  methods: {
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
  background: #ffffff;
}

.notice-detail-shell {
  position: relative;
  width: 100%;
  max-width: 750rpx;
  min-height: 1626rpx;
  margin: 0 auto;
  overflow-x: hidden;
  background: #ffffff url("https://shengyuan.store/api/miniapp/files/miniapp/bd14250734db465294d15c5daebc3874/4f9c2d1beb6030110228fe31b5f1167f.png") 0 0 / 100% 100% no-repeat;
  box-sizing: border-box;
}

.notice-detail-hero {
  width: 100%;
  min-height: 729rpx;
  padding: calc(var(--status-bar-height) + 45rpx) 24rpx 0;
  background: url("https://shengyuan.store/api/miniapp/files/miniapp/edd7d531c2674468be3c7a339309d186/notice-detail-header-bg.png") 0 0 / 100% 100% no-repeat;
  box-sizing: border-box;
}

.notice-detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64rpx;
}

.notice-detail-back,
.notice-detail-nav__space {
  display: flex;
  align-items: center;
  width: 80rpx;
  height: 64rpx;
  flex: none;
}

.notice-detail-back {
  justify-content: flex-start;
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
  margin-top: 72rpx;
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
  top: 383rpx;
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
