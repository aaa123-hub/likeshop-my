<template>
<view>
<!--pages/server_explan/server_explan.wxml-->
<view class="main">
  <rich-text v-if="article_content" :nodes="article_content"></rich-text>
  <view v-else class="server-empty">暂无内容</view>
</view>

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
import { getServerProto, getPrivatePolicy, getAfterSaleGuar } from '@/api/app';

export default {
  data() {
    return {
      article_content: "",
      type: 0
    };
  },

  components: {},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      type
    } = options;
    type = parseInt(type); // 0 ==> 服务协议 1 ==> 隐私政策 2 ==> 售后保障
    this.type = Number.isNaN(type) ? 0 : type;

    uni.setNavigationBarTitle({
      title: this.type == 0 ? '服务协议' : this.type == 1 ? '隐私政策' : '售后保障'
    });

    switch (this.type) {
      case 0:
        this.getServerProtoFun();
        break;

      case 1:
        this.getPrivatePolicyFun();
        break;

      case 2:
        this.getAfterSaleGuarFun();
        break;

      default:
        this.getServerProtoFun();
        break;
    }
  },
  methods: {
    fallbackContent() {
      if (this.type == 1) {
        return '<h3>隐私政策</h3><p>我们会在提供账号登录、订单履约、支付结算、客户服务、消息通知等功能时，依法收集必要的账号信息、设备信息、交易信息和服务记录。</p><p>我们仅在实现服务目的、履行法定义务或获得授权的范围内使用个人信息，并采取合理安全措施保护数据安全。您可通过个人设置查看、更正或申请删除相关信息。</p><p>如政策更新，我们将在页面内展示最新版本并按法律法规要求进行提示。</p>'
      }
      if (this.type == 2) {
        return '<h3>售后保障</h3><p>商品或服务售后以商家页面说明、订单约定及平台规则为准。若发生退款、退货、服务异常等问题，可通过订单详情或客服入口提交处理。</p><p>平台将协助用户与商家沟通，并依据订单状态、商品属性、核销记录和相关凭证处理售后申请。</p>'
      }
      return '<h3>服务协议</h3><p>欢迎使用本平台服务。用户在注册、登录、浏览、下单、支付、参与活动及使用商家服务时，应遵守法律法规、平台规则和页面提示。</p><p>平台提供商品展示、交易撮合、会员积分、线下门店、支付及售后协助等服务。用户应确保提交的信息真实、准确、合法，并妥善保管账号及支付凭证。</p><p>如服务规则发生调整，平台将在相关页面展示更新内容，更新后继续使用即视为接受调整后的规则。</p>'
    },
    applyArticleContent(content) {
      this.article_content = content || this.fallbackContent()
    },
    // 服务协议
    getServerProtoFun() {
      getServerProto().then(res => {
        if (res.code == 1) {
          //wxParse.wxParse('content', 'html', res.data, this, 15)
          setTimeout(() => {
            this.applyArticleContent(res.data);
          }, 200);
        }
      });
    },

    // 隐私协议
    getPrivatePolicyFun() {
      getPrivatePolicy().then(res => {
        if (res.code == 1) {
          //wxParse.wxParse('content', 'html', res.data, this, 15)
          setTimeout(() => {
            this.applyArticleContent(res.data);
          }, 200);
        }
      });
    },

    // 售后保障
    getAfterSaleGuarFun() {
      getAfterSaleGuar().then(res => {
        if (res.code == 1) {
          //wxParse.wxParse('content', 'html', res.data, this, 15)
          setTimeout(() => {
            this.applyArticleContent(res.data);
          }, 200);
        }
      });
    }

  }
};
</script>
<style lang="scss">
/* pages/server_explan/server_explan.wxss */

.main {
  padding: 20rpx;
  /* min-height: 100vh; */
}

.server-empty {
  padding-top: 160rpx;
  color: #999999;
  font-size: 28rpx;
  text-align: center;
}
</style>
