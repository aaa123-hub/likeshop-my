<template>
<view>
<!-- bundle/pages/news_details/news_details.wxml -->
<view class="news-details">
    <view class="header">
        <view class="title xxl mb20">{{ displayText(articleDetail.title, '资讯标题待确认') }}</view>
        <view class="row-between">
            <view class="xs lighter">{{ publishTimeText(articleDetail.create_time) }}</view>
            <view class="row">
                <view class="ml10 xs muted">{{ visitText(articleDetail.visit) }}</view>
            </view>
        </view>
    </view>
    <view class="main">
        <view v-if="article_content" :html="article_content" :tag-style="tagStyle" />
        <view v-else class="content-empty">正文内容待确认</view>
    </view>
</view>
<loading-view v-if="showLoading"></loading-view>
<!--<import src="/wxParse/wxParse.wxml"></import>-->
</view>
</template>

<script>
// +----------------------------------------------------------------------
// | likeshop开源商城系统
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | gitee下载：https://gitee.com/likeshop_gitee
// | github下载：https://github.com/likeshop-github
// | 访问官网：https://www.likeshop.cn
// | 访问社区：https://home.likeshop.cn
// | 访问手册：http://doc.likeshop.cn
// | 微信公众号：likeshop技术社区
// | likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识
// |  likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识
// | 禁止对系统程序代码以任何目的，任何形式的再发布
// | likeshop团队版权所有并拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeshop.cn.team
// +----------------------------------------------------------------------
import { getArticleDetail } from '../../../api/new';

export default {
  data() {
    return {
      showLoading: true,
      articleDetail: {},
      article_content: "",
      tagStyle: {
          img: 'width:100%;'
      }
    };
  },

  components: {
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.type = options.type || '';
    this.id = options.id;

    if (this.type) {
      uni.setNavigationBarTitle({
        title: '帮助详情'
      });
    } else {
      uni.setNavigationBarTitle({
        title: '资讯详情'
      });
    }

    this.getArticleDetailFun();
  },


  methods: {
    hasKnownValue(value) {
      return value !== undefined && value !== null && value !== ''
    },
    displayText(value, fallback) {
      return this.hasKnownValue(value) ? value : fallback
    },
    publishTimeText(value) {
      return this.hasKnownValue(value) ? `发布时间：${value}` : '发布时间待确认'
    },
    visitText(value) {
      return this.hasKnownValue(value) ? `${value}人浏览` : '浏览数待确认'
    },
    getArticleDetailFun() {
      if (!this.hasKnownValue(this.id)) {
        this.showLoading = false
        this.articleDetail = {}
        this.article_content = ''
        return
      }
      getArticleDetail({
        type: this.type,
        id: this.id
      }).then(res => {
        if (res.code == 1) {
          const data = res.data || {}
          this.articleDetail = data
          //wxParse.wxParse('content', 'html', data.content, this, 15)
          setTimeout(() => {
            this.article_content = data.content || '';
          }, 200);
          setTimeout(() => {
              this.showLoading = false
          }, 300);
        }
      });
    }

  }
};
</script>
<style>
/* bundle/pages/news_details/news_details.wxss */
page {
    background-color: #fff;
}
.news-details .header{
    padding: 20rpx 15px;
    border-bottom: var(--border);
}
.news-details .main {
    padding: 40rpx 15px;
}
.news-details .content-empty {
    color: #8b95a5;
    font-size: 28rpx;
    line-height: 44rpx;
}
.wxParse-p image {
    width: 100%;
}
</style>
