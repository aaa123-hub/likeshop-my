<template>
  <view class="notice-page">
    <navbar
      title="消息通知"
      :borderBottom="false"
      :background="{ background: '#dce9ff' }"
    ></navbar>

    <view class="notice-body">
      <view
        v-for="(item, index) in lists"
        :key="index"
        class="notice-item"
        @tap="openDetail(item)"
      >
        <view class="notice-icon">
          <u-icon name="bell-fill" color="#ffffff" size="54"></u-icon>
        </view>
        <view class="notice-content">
          <view class="notice-head">
            <text class="notice-title line1">{{ item.title }}</text>
            <text class="notice-time">{{ item.create_time }}</text>
          </view>
          <view class="notice-desc line1">{{ item.content }}</view>
        </view>
        <view v-if="index === 0" class="notice-dot"></view>
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
import navbar from "@/components/navbar/navbar.vue";

export default {
  components: {
    navbar,
  },
  data() {
    return {
      page: 1,
      loadingStatus: loadingType.LOADING,
      loadingType,
      lists: [],
      type: "system",
    };
  },
  onLoad(options) {
    this.type = options.type || "system";
    this.getNoticeListsFun();
  },
  onReachBottom() {
    this.getNoticeListsFun();
  },
  methods: {
    openDetail(item) {
      const title = encodeURIComponent(item.title || "");
      const content = encodeURIComponent(item.content || "");
      const time = encodeURIComponent(item.create_time || "");
      uni.navigateTo({
        url: `/bundle/pages/notice_detail/notice_detail?title=${title}&content=${content}&time=${time}`,
      });
    },
    getNoticeListsFun() {
      if (this.loadingStatus == loadingType.FINISHED) return;
      getNoticeLists({
        type: this.type,
        page_no: this.page,
      }).then((res) => {
        if (res.code == 1) {
          const { list, more } = res.data;
          this.lists.push(...list);
          this.page++;
          if (!more) {
            this.loadingStatus = loadingType.FINISHED;
          }
          if (!this.lists.length) {
            this.loadingStatus = loadingType.EMPTY;
          }
        } else {
          this.loadingStatus = loadingType.ERROR;
        }
      });
    },
  },
};
</script>

<style lang="scss">
.notice-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #dce9ff 0, #ffffff 220rpx);
}

.notice-body {
  min-height: calc(100vh - 176rpx);
  padding: 12rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.notice-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 26rpx 0;
  border-bottom: 1rpx solid #ececec;
}

.notice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 52rpx;
  background: #4c8dff;
  flex: none;
}

.notice-content {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.notice-head {
  display: flex;
  align-items: center;
}

.notice-title {
  flex: 1;
  color: #222222;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
}

.notice-time {
  margin-left: 20rpx;
  color: #999999;
  font-size: 22rpx;
  line-height: 30rpx;
}

.notice-desc {
  margin-top: 10rpx;
  color: #b0b0b0;
  font-size: 22rpx;
  line-height: 30rpx;
}

.notice-dot {
  position: absolute;
  right: 0;
  top: 50%;
  width: 18rpx;
  height: 18rpx;
  margin-top: 18rpx;
  border-radius: 50%;
  background: #ff3131;
}

.empty-box {
  padding-top: 220rpx;
}
</style>
