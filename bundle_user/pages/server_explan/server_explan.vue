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
    <view v-if="showSignRows && articleSignRows.length" class="legal-doc__sign-card">
      <view class="legal-doc__sign-title">签署信息</view>
      <view v-for="item in articleSignRows" :key="item.label + item.value" class="legal-doc__sign-row">
        <text class="legal-doc__sign-label">{{ item.label }}</text>
        <text class="legal-doc__sign-value">{{ item.value }}</text>
      </view>
    </view>
    <view v-if="showReadDoneCheck" class="legal-doc__read-check">
      <view :class="['legal-doc__read-checkbox', readMarked ? 'is-checked' : '']">
        <text v-if="readMarked">✓</text>
      </view>
      <text class="legal-doc__read-text">{{ readMarked ? '已阅读完' : '滑动到底部后自动确认已阅读完' }}</text>
    </view>
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

const LOGIN_AGREEMENT_READ_PREFIX = 'LOGIN_AGREEMENT_READ_'
const LOGIN_AGREEMENT_TYPES = [0, 1]

export default {
  data() {
    return {
      article_content: "",
      articleRows: [],
      articleMetaRows: [],
      articleSignRows: [],
      type: 0,
      readMarked: false
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
  onReachBottom() {
    this.markDocumentRead()
  },
  computed: {
    showSignRows() {
      return !LOGIN_AGREEMENT_TYPES.includes(this.type)
    },
    showReadDoneCheck() {
      return LOGIN_AGREEMENT_TYPES.includes(this.type)
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
      if (this.type === 0) return '服务协议'
      if (this.type === 1) return '隐私政策'
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
    mergeBrokenLines(lines = []) {
      const merged = []
      lines.forEach((line) => {
        const prev = merged[merged.length - 1] || ''
        if (/\/$/.test(prev) && /^1\d{10}$/.test(line)) {
          merged[merged.length - 1] = `${prev} ${line}`
          return
        }
        if (/[,，、]$/.test(prev) && line && !/^(第[一二三四五六七八九十百]+条|[一二三四五六七八九十]+、|\d+(\.\d+)*[.、]|甲方|乙方|日期|签署方式)/.test(line)) {
          merged[merged.length - 1] = `${prev}${line}`
          return
        }
        merged.push(line)
      })
      return merged
    },
    extractSignRows(lines = []) {
      const signRows = []
      const contentLines = []
      const signLabels = ['甲方（盖章）', '乙方（签字/盖章）', '法定代表人/授权代表', '法定代表人/经营者/授权代表', '日期', '签署方式']
      const normalizeSignLabel = (line) => signLabels.find(label => line.startsWith(`${label}：`) || line.startsWith(`${label}:`))
      lines.forEach((line) => {
        const label = normalizeSignLabel(line)
        if (!label) {
          contentLines.push(line)
          return
        }
        const value = line.replace(new RegExp(`^${label}[：:]?`), '').trim() || '待签署'
        signRows.push({ label, value })
      })
      return { signRows, contentLines }
    },
    metaPairFromLines(lines = []) {
      const metaRows = []
      const contentLines = []
      const labels = ['运营主体', '版本日期', '甲方', '乙方', '统一社会信用代码', '住所/联系地址', '联系人及电话', '电子邮箱', '平台名称', '证照/身份证号', '签署日期', '协议编号']
      const hiddenLabels = LOGIN_AGREEMENT_TYPES.includes(this.type) ? ['签署日期'] : []
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const colonMatch = line.match(/^(.+?)[:：]\s*(.+)$/)
        if (colonMatch && labels.includes(colonMatch[1].trim())) {
          if (hiddenLabels.includes(colonMatch[1].trim())) continue
          metaRows.push({ label: colonMatch[1].trim(), value: colonMatch[2].trim() })
          continue
        }
        if (labels.includes(line)) {
          const next = lines[index + 1] || ''
          if (hiddenLabels.includes(line)) {
            if (next && !labels.includes(next) && !/^(第[一二三四五六七八九十百]+条|[一二三四五六七八九十]+、)/.test(next)) index += 1
            continue
          }
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
      const mergedLines = this.mergeBrokenLines(withoutDuplicateTitle)
      const { signRows, contentLines: linesBeforeMeta } = this.extractSignRows(mergedLines)
      const { metaRows, contentLines } = this.metaPairFromLines(linesBeforeMeta)
      this.articleMetaRows = metaRows.filter(row => row.value && !/^_+$/.test(row.value))
      this.articleSignRows = this.showSignRows ? signRows.filter(row => row.value) : []
      return contentLines.map((text, index) => ({ text, type: this.rowType(text, index) }))
    },
    markDocumentRead() {
      if (this.readMarked || !LOGIN_AGREEMENT_TYPES.includes(this.type) || !this.articleRows.length) return
      this.readMarked = true
      try {
        uni.setStorageSync(`${LOGIN_AGREEMENT_READ_PREFIX}${this.type}`, true)
      } catch (error) {}
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
      this.checkShortDocumentRead()
    },
    checkShortDocumentRead() {
      if (!LOGIN_AGREEMENT_TYPES.includes(this.type)) return
      this.$nextTick(() => {
        setTimeout(() => {
          uni.createSelectorQuery()
            .in(this)
            .select('.main')
            .boundingClientRect((rect) => {
              const windowHeight = uni.getSystemInfoSync().windowHeight || 0
              if (rect && windowHeight && rect.height <= windowHeight + 4) this.markDocumentRead()
            })
            .exec()
        }, 80)
      })
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

    // 隐私政策
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

.legal-doc__sign-card {
  margin-top: 32rpx;
  padding: 20rpx 22rpx;
  border: 1rpx solid #e8edf5;
  border-radius: 16rpx;
  background: #fffdf8;
  box-sizing: border-box;
}

.legal-doc__sign-title {
  margin-bottom: 10rpx;
  color: #182232;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.legal-doc__sign-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 9rpx 0;
  border-top: 1rpx solid #f1eadc;
}

.legal-doc__sign-label {
  flex: none;
  width: 210rpx;
  color: #8a6a30;
  font-size: 23rpx;
  line-height: 34rpx;
}

.legal-doc__sign-value {
  flex: 1;
  min-width: 0;
  color: #273142;
  font-size: 24rpx;
  line-height: 36rpx;
  word-break: break-word;
}

.legal-doc__read-check {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 34rpx;
  padding: 22rpx 20rpx;
  border-radius: 18rpx;
  background: #f8fafd;
  border: 1rpx solid #e8edf5;
  box-sizing: border-box;
}

.legal-doc__read-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  border: 2rpx solid #c6ccd8;
  color: #ffffff;
  font-size: 23rpx;
  line-height: 1;
  box-sizing: border-box;
}

.legal-doc__read-checkbox.is-checked {
  border-color: #ff4d3d;
  background: #ff4d3d;
}

.legal-doc__read-text {
  color: #4b5563;
  font-size: 25rpx;
  line-height: 36rpx;
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

  .legal-doc__sign-row {
    flex-direction: column;
    gap: 4rpx;
  }

  .legal-doc__sign-label {
    width: auto;
  }
}
</style>
