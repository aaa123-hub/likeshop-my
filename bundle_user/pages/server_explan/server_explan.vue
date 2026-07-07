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
      const render = (title, intro, sections) => `<h2>${title}</h2><p>${intro}</p>${sections.map(item => `<h3>${item.title}</h3>${item.content.map(text => `<p>${text}</p>`).join('')}`).join('')}`
      if (this.type == 1) {
        return render('隐私政策', '我们重视并保护您的个人信息安全。本政策适用于注册登录、商品浏览、店铺关注、团购下单、订单履约、售后客服、积分权益和消息通知等服务。', [
          { title: '一、信息收集', content: ['为完成账号识别、交易履约和客户服务，我们可能收集手机号、昵称、头像、收货地址、定位门店、订单信息、支付状态、设备信息、操作日志、客服沟通记录及您主动提交的认证资料。', '当您使用分享、保存海报、扫码核销、门店导航等功能时，可能需要相册、相机或位置信息权限。您可以在系统设置中管理授权。'] },
          { title: '二、使用范围', content: ['收集的信息仅用于身份核验、订单处理、配送售后、门店自提、风险控制、客服响应、权益发放、服务优化及法律法规要求的场景。', '平台不会将个人信息用于与当前服务无关的用途，也不会在未取得授权的情况下进行无关营销。'] },
          { title: '三、信息共享', content: ['为完成交易履约，我们可能向商家、物流、支付机构、门店服务人员或依法有权机关提供必要信息。共享范围以实现具体服务为限。', '平台要求合作方履行安全保护义务，不得超出约定目的处理您的个人信息。'] },
          { title: '四、信息保护', content: ['平台将采用访问控制、数据脱敏、安全审计等合理措施保护信息安全。', '您可通过个人中心查看、更正资料，或联系客服申请处理个人信息相关请求。'] },
          { title: '五、政策更新', content: ['如隐私政策发生调整，我们将在页面展示最新版本。继续使用平台服务即表示您已阅读并理解更新后的内容。'] }
        ])
      }
      if (this.type == 2) {
        return render('售后保障', '平台为用户提供清晰、可追踪的售后处理通道。商品或服务售后以商品页面说明、订单约定、商家承诺及平台规则为准。', [
          { title: '一、售后范围', content: ['支持未发货退款、已发货退货退款、商品质量问题、错发漏发、配送异常、核销异常、服务无法履约等场景。', '生鲜、定制、虚拟权益、已核销服务等特殊商品，以商品页面说明和商家售后规则为准。'] },
          { title: '二、申请入口', content: ['用户可在我的订单、订单详情、客服入口或平台指定方式提交售后申请。', '申请时请准确选择售后类型、问题原因、退款金额，并上传必要凭证。'] },
          { title: '三、处理流程', content: ['提交申请后，平台将根据订单状态、支付记录、商品属性、物流信息、核销记录和用户凭证进行核验。', '商家会在合理时间内完成审核。审核通过后，未发货订单优先原路退款；需退货订单请按页面提示寄回商品。'] },
          { title: '四、凭证要求', content: ['建议保留商品照片、开箱视频、物流单号、支付凭证、沟通记录等材料。材料越完整，越有助于平台和商家快速判断并处理。', '如涉及商品质量或错发漏发，请拍摄商品外观、包装、面单和问题细节。'] },
          { title: '五、退款说明', content: ['符合退款条件的订单将按原支付方式或平台支持方式退回，实际到账时间以支付机构和银行处理时效为准。', '优惠券、积分、团购权益等随订单规则返还或失效，具体以页面展示为准。'] },
          { title: '六、客服协助', content: ['如售后处理存在争议，用户可联系平台客服。平台将依据订单信息、平台规则和有效凭证进行协调，保障合理合法权益。'] }
        ])
      }
      return render('服务协议', '欢迎使用本平台服务。本协议是用户与平台之间关于注册、登录、浏览、下单、支付、参与团购、线下门店服务、积分权益、联系商家及售后服务等事项的约定。', [
        { title: '一、服务内容', content: ['平台提供商品展示、交易撮合、订单管理、支付结算、线下门店服务、会员积分、活动参与、客服咨询、分享海报及售后协助等功能。', '具体服务以页面实际展示为准，平台可根据运营情况调整服务内容。'] },
        { title: '二、用户义务', content: ['用户应遵守法律法规和平台规则，提交真实、准确、完整的信息，妥善保管账号、验证码及支付凭证。', '不得利用平台从事虚假交易、恶意退款、刷单套利、侵犯他人权益或其他违法违规行为。'] },
        { title: '三、订单与支付', content: ['用户下单后应按页面提示完成支付。订单状态、商品价格、配送方式、核销规则、售后条件等以订单页面和商家说明为准。', '因库存、活动、系统、支付或风控原因导致订单变化的，平台将按规则处理并尽量及时通知用户。'] },
        { title: '四、门店与团购', content: ['线下门店商品、服务核销、营业时间、门店地址和团购成团条件以页面展示和商家实际服务能力为准。', '参与拼团、秒杀、优惠活动时，请关注活动时间、人数要求、退款规则和商品库存。'] },
        { title: '五、积分与权益', content: ['积分、优惠券、会员权益、分享奖励等应在有效期和适用范围内使用，不得转让、套现或用于违规交易。', '权益发放、使用和失效规则以页面展示及平台规则为准。'] },
        { title: '六、协议变更', content: ['平台可根据业务和法律法规要求更新本协议，并在相关页面展示。更新后继续使用服务，视为您已阅读并接受调整后的协议。'] }
      ])
    },
    applyArticleContent(content) {
      const value = String(content || '').trim()
      const placeholderMap = {
        0: '<p>服务协议内容待平台完善。</p>',
        1: '<p>隐私政策内容待平台完善。</p>',
        2: '<p>售后保障内容待平台完善。</p>'
      }
      this.article_content = !value || value === placeholderMap[this.type] ? this.fallbackContent() : value
    },
    // 服务协议
    getServerProtoFun() {
      getServerProto().then(res => {
        if (res.code == 1) {
          //wxParse.wxParse('content', 'html', res.data, this, 15)
          setTimeout(() => {
            this.applyArticleContent(res.data);
          }, 200);
        } else {
          this.applyArticleContent('');
        }
      }).catch(() => this.applyArticleContent(''));
    },

    // 隐私协议
    getPrivatePolicyFun() {
      getPrivatePolicy().then(res => {
        if (res.code == 1) {
          //wxParse.wxParse('content', 'html', res.data, this, 15)
          setTimeout(() => {
            this.applyArticleContent(res.data);
          }, 200);
        } else {
          this.applyArticleContent('');
        }
      }).catch(() => this.applyArticleContent(''));
    },

    // 售后保障
    getAfterSaleGuarFun() {
      getAfterSaleGuar().then(res => {
        if (res.code == 1) {
          //wxParse.wxParse('content', 'html', res.data, this, 15)
          setTimeout(() => {
            this.applyArticleContent(res.data);
          }, 200);
        } else {
          this.applyArticleContent('');
        }
      }).catch(() => this.applyArticleContent(''));
    }

  }
};
</script>
<style lang="scss">
/* pages/server_explan/server_explan.wxss */

.main {
  min-height: 100vh;
  padding: 32rpx 28rpx 56rpx;
  box-sizing: border-box;
  color: #333333;
  font-size: 28rpx;
  line-height: 1.8;
  background: #ffffff;
  /* min-height: 100vh; */
}

.main ::v-deep h2,
.main ::v-deep h3 {
  margin: 28rpx 0 12rpx;
  color: #202020;
  font-weight: 700;
}

.main ::v-deep h2 {
  font-size: 40rpx;
}

.main ::v-deep h3 {
  font-size: 31rpx;
}

.main ::v-deep p {
  margin: 0 0 18rpx;
}

.server-empty {
  padding-top: 160rpx;
  color: #999999;
  font-size: 28rpx;
  text-align: center;
}
</style>
