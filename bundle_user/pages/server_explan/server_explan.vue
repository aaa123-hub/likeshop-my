<template>
<view>
<!--pages/server_explan/server_explan.wxml-->
<view class="main">
  <view v-if="articleRows.length" class="legal-doc">
    <view v-if="articleMetaRows.length" class="legal-doc__meta-card">
      <view v-for="item in articleMetaRows" :key="item.label + item.value" class="legal-doc__meta-row">
        <text class="legal-doc__meta-label">{{ item.label }}</text>
        <text class="legal-doc__meta-value">{{ item.value }}</text>
      </view>
    </view>
    <view
      v-for="(row, index) in articleRows"
      :key="index"
      :class="['legal-doc__row', 'legal-doc__row--' + row.type]"
    >{{ row.text }}</view>
  </view>
  <rich-text v-else-if="article_content" :nodes="article_content"></rich-text>
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
import { getServerProto, getPrivatePolicy } from '@/api/app';
import { getLegalDocument } from '@/utils/legal-documents'

export default {
  data() {
    return {
      article_content: "",
      articleRows: [],
      articleMetaRows: [],
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
    type = parseInt(type); // 0 用户服务协议 1 隐私政策 2 交易纠纷处理 3 平台服务协议 4 入驻经营规范
    this.type = Number.isNaN(type) ? 0 : type;
    const doc = getLegalDocument(this.type)

    uni.setNavigationBarTitle({
      title: this.displayDocumentTitle(doc.title)
    });

    switch (this.type) {
      case 0:
        this.getServerProtoFun();
        break;

      case 1:
        this.getPrivatePolicyFun();
        break;

      case 2:
      case 3:
      case 4:
      case 5:
        this.applyArticleContent('');
        break;

      default:
        this.getServerProtoFun();
        break;
    }
  },
  methods: {
    localDocument() {
      return getLegalDocument(this.type)
    },
    fallbackContent() {
      const doc = this.localDocument()
      return doc && doc.text ? doc.text : ''
    },
    cleanLegalLine(value) {
      return String(value || '')
        .replace(/\u0007/g, '')
        .replace(/[\t ]*[•][\t ]*/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/ ，/g, '，')
        .replace(/ ：/g, '：')
        .trim()
    },
    displayDocumentTitle(title = '') {
      return String(title || '')
        .replace(/^钥岫商城/, '')
        .replace(/^平台服务协议$/, '平台服务协议')
        .trim() || '协议说明'
    },
    splitInlineMeta(line = '') {
      const text = this.cleanLegalLine(line)
      const matched = text.match(/^(运营主体：.+?)(版本日期\s*[:：]\s*.+)$/)
      return matched ? [matched[1], matched[2]] : [text]
    },
    metaPairFromLines(lines = []) {
      const metaRows = []
      const contentLines = []
      const labels = ['运营主体', '版本日期', '甲方', '乙方', '统一社会信用代码', '住所/联系地址', '联系人及电话', '电子邮箱', '平台名称', '证照/身份证号', '签署日期', '协议编号']
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const colonMatch = line.match(/^(.+?)[:：]\s*(.+)$/)
        if (colonMatch && labels.includes(colonMatch[1].trim())) {
          metaRows.push({ label: colonMatch[1].trim(), value: colonMatch[2].trim() })
          continue
        }
        if (labels.includes(line)) {
          const next = lines[index + 1] || ''
          if (next && !labels.includes(next) && !/^(第[一二三四五六七八九十百]+条|[一二三四五六七八九十]+、)/.test(next)) {
            metaRows.push({ label: line, value: next })
            index += 1
            continue
          }
          continue
        }
        contentLines.push(line)
      }
      return { metaRows, contentLines }
    },
    rowType(text, index) {
      if (index === 0) return 'lead'
      if (/^(第[一二三四五六七八九十百]+条|[一二三四五六七八九十]+、|主要法律依据与合规参考)/.test(text)) return 'heading'
      if (/^\d+(\.\d+)*[.、]/.test(text)) return 'clause'
      return 'paragraph'
    },
    buildRows(content) {
      const doc = this.localDocument()
      const rawLines = String(content || '')
        .replace(/\r/g, '\n')
        .split('\n')
        .flatMap(this.splitInlineMeta)
        .map(this.cleanLegalLine)
        .filter(Boolean)
      const titleSet = new Set([doc.title, this.displayDocumentTitle(doc.title)])
      const withoutDuplicateTitle = titleSet.has(rawLines[0]) ? rawLines.slice(1) : rawLines
      const { metaRows, contentLines } = this.metaPairFromLines(withoutDuplicateTitle)
      this.articleMetaRows = metaRows.filter(row => row.value && !/^_+$/.test(row.value))
      return contentLines.map((text, index) => ({ text, type: this.rowType(text, index) }))
    },
    applyArticleContent(content) {
      const value = String(content || '').trim()
      const placeholderMap = {
        0: '<p>服务协议内容待平台完善。</p>',
        1: '<p>隐私政策内容待平台完善。</p>',
        2: '<p>售后保障内容待平台完善。</p>'
      }
      const doc = this.localDocument()
      const isPlaceholder = !value || value === placeholderMap[this.type] || /^<p>.*待平台完善。<\/p>$/.test(value)
      this.article_content = ''
      this.articleRows = this.buildRows(isPlaceholder ? this.fallbackContent() : value)
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

  }
};
</script>
<style lang="scss">
/* pages/server_explan/server_explan.wxss */

.main {
  min-height: 100vh;
  padding: 22rpx 22rpx 48rpx;
  box-sizing: border-box;
  color: #333333;
  font-size: 26rpx;
  line-height: 1.8;
  background: #f6f8fb;
  /* min-height: 100vh; */
}

.legal-doc {
  padding: 24rpx 24rpx 38rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 34rpx rgba(31, 44, 71, .06);
  box-sizing: border-box;
}

.legal-doc__meta-card {
  margin-bottom: 24rpx;
  padding: 18rpx 20rpx;
  border: 1rpx solid #e8edf5;
  border-radius: 16rpx;
  background: #f8fafd;
  box-sizing: border-box;
}

.legal-doc__meta-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}

.legal-doc__meta-row:last-child {
  border-bottom: 0;
}

.legal-doc__meta-label {
  flex: none;
  width: 142rpx;
  color: #7a8494;
  font-size: 23rpx;
  line-height: 34rpx;
}

.legal-doc__meta-value {
  flex: 1;
  min-width: 0;
  color: #273142;
  font-size: 24rpx;
  line-height: 36rpx;
  word-break: break-word;
}

.legal-doc__row {
  color: #3f4652;
  font-size: 26rpx;
  line-height: 44rpx;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.legal-doc__row + .legal-doc__row {
  margin-top: 8rpx;
}

.legal-doc__row--lead {
  color: #222936;
  font-size: 26rpx;
  line-height: 44rpx;
  padding: 16rpx 18rpx;
  border-radius: 14rpx;
  background: #f8fafd;
  box-sizing: border-box;
}

.legal-doc__row--heading {
  margin-top: 26rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #edf1f6;
  color: #182232;
  font-size: 29rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.legal-doc__row--clause {
  color: #273142;
  font-weight: 600;
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

@media screen and (max-width: 360px) {
  .main {
    padding-left: 16rpx;
    padding-right: 16rpx;
  }

  .legal-doc {
    padding-left: 18rpx;
    padding-right: 18rpx;
  }

  .legal-doc__row {
    font-size: 25rpx;
    line-height: 42rpx;
  }

  .legal-doc__meta-row {
    flex-direction: column;
    gap: 4rpx;
  }

  .legal-doc__meta-label {
    width: auto;
  }
}
</style>
