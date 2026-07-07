<template>
<!--pages/sign_rule/sign_rule.wxml-->
<view class="sign-rule-page">
  <view class="rule-card">
    <view class="rule-title">积分有效期</view>
    <view class="rule-content">已领取积分自领取当日起计算，有效期为24个月。有效期届满仍未使用的积分将自动清零。</view>
  </view>

  <view class="rule-card">
    <view class="rule-title">积分提醒规则</view>
    <view class="rule-content">
      自积分领取当日起倒计时24个月为有效期，到期前一个月通过短信提醒用户即将失效的积分数量及失效时间。
    </view>
    <view class="rule-example">
      例如：用户在2026年1月1日领取100积分，有效期至2028年1月1日，将在2027年12月1日短信提醒用户：“XX用户，您有XX积分将在X月X日23点前过期。”（短信内容待定）
    </view>
    <view class="rule-example">
      用户在2026年1月2日领取100积分，有效期至2028年1月2日，将在2027年12月1日短信提醒用户：“XX用户，您有XX积分将在X月X日23点前过期。”（短信内容待定）
    </view>
  </view>
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
import { getSignRule } from "@/api/user.js";

export default {
  data() {
    return {
      rule: ""
    };
  },

  components: {},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSignRuleFun();
  },


  methods: {
    getSignRuleFun() {
      getSignRule().then(res => {
        if (res.code == 1) {
          this.rule = res.data
        }
      });
    }

  }
};
</script>
<style>
/* pages/sign_rule/sign_rule.wxss */
.sign-rule-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f7f7f7;
  box-sizing: border-box;
}

.rule-card {
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.rule-title {
  margin-bottom: 16rpx;
  color: #222222;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
}

.rule-content,
.rule-example {
  color: #666666;
  font-size: 28rpx;
  line-height: 44rpx;
}

.rule-example {
  margin-top: 16rpx;
  padding: 18rpx 20rpx;
  background: #fafafa;
  border-radius: 12rpx;
}
</style>
