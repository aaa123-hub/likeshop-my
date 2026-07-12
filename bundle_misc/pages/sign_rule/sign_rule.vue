<template>
<!--pages/sign_rule/sign_rule.wxml-->
<view class="sign-rule-page">
  <view v-if="ruleSections.length">
    <view v-for="section in ruleSections" :key="section.title" class="rule-card">
      <view class="rule-title">{{ section.title }}</view>
      <view v-for="(line, index) in section.lines" :key="index" class="rule-content">{{ line }}</view>
    </view>
  </view>
  <view v-else class="rule-empty">
    <view class="rule-empty__title">暂无积分规则</view>
    <view class="rule-empty__desc">积分规则暂未开放，请稍后查看。</view>
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
      ruleSections: []
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
          this.ruleSections = this.normalizeRuleSections(res.data)
        }
      });
    },

    normalizeRuleSections(data) {
      if (Array.isArray(data)) {
        return data.map((item, index) => this.normalizeRuleSection(item, `规则${index + 1}`)).filter(item => item.lines.length)
      }
      if (typeof data === 'string') {
        return this.normalizeRuleText(data, '积分规则')
      }
      if (!data || typeof data !== 'object') return []

      const rawRules = data.rules || data.ruleList || data.list || []
      if (Array.isArray(rawRules) && rawRules.length) {
        return rawRules.map((item, index) => this.normalizeRuleSection(item, `规则${index + 1}`)).filter(item => item.lines.length)
      }

      const sections = []
      const knownSections = [
        ['积分规则', data.rule || data.signRule || data.sign_rule],
        ['积分有效期', data.validityRule || data.validity_rule || data.expireRule || data.expire_rule],
        ['积分提醒规则', data.noticeRule || data.notice_rule || data.remindRule || data.remind_rule]
      ]
      knownSections.forEach(([title, value]) => {
        const normalized = this.normalizeRuleText(value, title)
        if (normalized.length) sections.push(...normalized)
      })
      if (sections.length) return sections

      return this.normalizeRuleSection(data, data.title || data.name || '积分规则').lines.length
        ? [this.normalizeRuleSection(data, data.title || data.name || '积分规则')]
        : []
    },

    normalizeRuleSection(item, fallbackTitle) {
      if (typeof item === 'string') {
        return {
          title: fallbackTitle,
          lines: this.splitRuleLines(item)
        }
      }
      const title = item.title || item.name || item.label || fallbackTitle
      const text = item.content || item.desc || item.description || item.rule || item.value || ''
      return {
        title,
        lines: this.splitRuleLines(text)
      }
    },

    normalizeRuleText(text, title) {
      const lines = this.splitRuleLines(text)
      return lines.length ? [{ title, lines }] : []
    },

    splitRuleLines(text) {
      return String(text || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split(/\n+/)
        .map(item => item.trim())
        .filter(Boolean)
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

.rule-content {
  color: #666666;
  font-size: 28rpx;
  line-height: 44rpx;
}

.rule-content + .rule-content {
  margin-top: 12rpx;
}

.rule-empty {
  padding: 72rpx 32rpx;
  border-radius: 16rpx;
  background: #ffffff;
  text-align: center;
}

.rule-empty__title {
  color: #222222;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
}

.rule-empty__desc {
  margin-top: 12rpx;
  color: #888888;
  font-size: 26rpx;
  line-height: 38rpx;
}
</style>
