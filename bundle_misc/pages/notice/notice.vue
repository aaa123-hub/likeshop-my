<template>
  <view class="notice-page">
    <view class="notice-hero">
      <view class="notice-nav">
        <view class="notice-back" @tap="goBack"></view>
        <view class="notice-nav__title">消息通知</view>
        <view class="notice-nav__capsule">
          <view class="notice-nav__capsule-dot"></view>
          <view class="notice-nav__capsule-divider"></view>
          <view class="notice-nav__capsule-circle"></view>
        </view>
      </view>

      <view
        v-if="firstNotice"
        class="notice-feature"
        @tap="openDetail(firstNotice)"
      >
        <image class="notice-icon" :src="noticeIconUrl" mode="aspectFit"></image>
        <view class="notice-content">
          <view class="notice-title line1">{{ firstNotice.title }}</view>
          <view class="notice-desc line1">{{ firstNotice.content }}</view>
        </view>
        <view class="notice-side">
          <view class="notice-time">{{ firstNotice.create_time }}</view>
          <view v-if="isUnread(firstNotice)" class="notice-dot"></view>
        </view>
      </view>
      <view v-if="firstNotice" class="notice-hero-divider"></view>
    </view>

    <view class="notice-body">
      <view
        v-for="(item, index) in restNotices"
        :key="index"
        class="notice-item"
        @tap="openDetail(item)"
      >
        <image class="notice-icon" :src="noticeIconUrl" mode="aspectFit"></image>
        <view class="notice-content">
          <view class="notice-title line1">{{ item.title }}</view>
          <view class="notice-desc line1">{{ item.content }}</view>
        </view>
        <view class="notice-side">
          <view class="notice-time">{{ item.create_time }}</view>
          <view v-if="isUnread(item)" class="notice-dot"></view>
        </view>
      </view>

      <view v-if="loadingStatus === loadingType.EMPTY" class="empty-box">
        <u-empty
          mode="message"
          text="暂无消息通知"
          :iconSize="160"
          color="#999999"
        ></u-empty>
      </view>

      <loading-footer
        v-if="lists.length"
        :status="loadingStatus"
      ></loading-footer>
    </view>
  </view>
</template>

<script>
import { getNoticeLists } from "@/api/store";
import { loadingType } from "@/utils/type";
import { getDesignAsset } from "@/utils/design-assets";
import UEmpty from '@/bundle_misc/components/uview-ui/components/u-empty/u-empty.vue'

export default {
  components: {
			UEmpty
		},
  data() {
    return {
      page: 1,
      loadingStatus: loadingType.LOADING,
      loadingType,
      lists: [],
      noticeIconUrl: getDesignAsset('https://shengyuan.store/api/miniapp/files/miniapp/64a7a4fa945a4dfaa27ca15ad949045b/notice-message-icon.png'),
      type: "system",
    };
  },
  computed: {
    firstNotice() {
      return this.lists[0] || null
    },
    restNotices() {
      return this.lists.slice(1)
    }
  },
  onLoad(options) {
    this.type = options.type || "system";
    this.getNoticeListsFun();
  },
  onReachBottom() {
    this.getNoticeListsFun();
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      uni.switchTab({ url: '/pages/user/user' })
    },
    isUnread(item = {}) {
      return !item.read_flag && !item.readFlag
    },
    openDetail(item) {
      var id = item.id || item.messageId || item.message_id || "";
      var title = encodeURIComponent(item.title || "");
      var content = encodeURIComponent(item.content || "");
      var time = encodeURIComponent(item.create_time || "");
      uni.navigateTo({
        url: "/bundle_misc/pages/notice_detail/notice_detail?id=" + id + "&title=" + title + "&content=" + content + "&time=" + time,
      });
    },
    getNoticeListsFun() {
      if (this.loadingStatus == loadingType.FINISHED) return;
      var that = this;
      getNoticeLists({
        type: this.type,
        page_no: this.page,
      }).then(function(res) {
        if (res.code == 1) {
          var data = res.data || {};
          var list = Array.isArray(data.list) ? data.list : [];
          var more = data.more;
          that.lists = that.lists.concat(list);
          that.page++;
          if (!more) {
            that.loadingStatus = loadingType.FINISHED;
          }
          if (!that.lists.length) {
            that.loadingStatus = loadingType.EMPTY;
          }
        } else {
          that.loadingStatus = loadingType.ERROR;
        }
      });
    },
  },
};
</script>

<style lang="scss">
.notice-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: #fff9f0;
}

.notice-hero {
  position: relative;
  height: calc(359rpx + var(--status-bar-height));
  padding-top: var(--status-bar-height);
  background: linear-gradient(180deg, #fff0dc 0%, #fff7ed 58%, #fff9f0 100%);
  box-sizing: border-box;
}

.notice-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 101rpx;
  padding: 0 23rpx 0 24rpx;
  box-sizing: border-box;
}

.notice-back {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  flex: none;
}

.notice-back::after {
  content: '';
  position: absolute;
  left: 2rpx;
  top: 15rpx;
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #222222;
  border-bottom: 4rpx solid #222222;
  transform: rotate(45deg);
}

.notice-nav__title {
  color: #222222;
  font-size: 36rpx;
  font-weight: 500;
  line-height: 36rpx;
  white-space: nowrap;
}

.notice-nav__capsule {
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

.notice-nav__capsule-dot {
  width: 8rpx;
  height: 8rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #222222;
  box-shadow: 18rpx 0 0 #222222, 36rpx 0 0 #222222;
}

.notice-nav__capsule-divider {
  width: 1rpx;
  height: 36rpx;
  margin: 0 22rpx 0 42rpx;
  background: rgba(34, 34, 34, .18);
}

.notice-nav__capsule-circle {
  width: 34rpx;
  height: 34rpx;
  border: 4rpx solid #222222;
  border-radius: 50%;
  box-sizing: border-box;
}

.notice-body {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 359rpx - var(--status-bar-height));
  padding: 0 24rpx 40rpx;
  box-sizing: border-box;
  background: #fff9f0;
}

.notice-feature {
  position: relative;
  display: flex;
  align-items: center;
  width: calc(100vw - 48rpx);
  max-width: 697rpx;
  height: 105rpx;
  margin: 12rpx auto 0;
  padding-right: 0;
  box-sizing: border-box;
}

.notice-hero-divider {
  width: calc(100vw - 48rpx);
  max-width: 702rpx;
  height: 1rpx;
  margin: 31rpx auto 0;
  background: rgba(214, 194, 170, .55);
}

.notice-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 154rpx;
  padding: 24rpx 0 24rpx 2rpx;
  border-bottom: 1rpx solid rgba(214, 194, 170, .55);
  box-sizing: border-box;
}

.notice-item:first-child {
  margin-top: -8rpx;
}

.notice-icon {
  width: 105rpx;
  height: 105rpx;
  flex: none;
}

.notice-content {
  flex: 1;
  min-width: 0;
  margin-left: 21rpx;
}

.notice-title {
  color: #222222;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 28rpx;
}

.notice-desc {
  margin-top: 22rpx;
  color: #999999;
  font-size: 25rpx;
  line-height: 25rpx;
}

.notice-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: none;
  width: 77rpx;
  min-height: 58rpx;
  margin: 19rpx 0 0 18rpx;
}

.notice-time {
  color: #999999;
  font-size: 22rpx;
  line-height: 22rpx;
  white-space: nowrap;
}

.notice-dot {
  width: 15rpx;
  height: 15rpx;
  margin-top: 21rpx;
  border-radius: 50%;
  background: #a0610d;
}

.empty-box {
  padding-top: 220rpx;
  background: #fff9f0;
}
</style>
