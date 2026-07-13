<template>
<!--pages/input_express_info/input_express_info.wxml-->
<view class="input-express-info">
  <form @submit="formSubmit">
    <view class="input-contain mt20">
      <view class="input-item row">
        <view class="nr label">物流公司</view>
        <input class="input" placeholder="请输入物流公司名称" :value="formInfo.express" name="express"></input>
      </view>
      <view class="input-item row">
        <view class="nr label">快递单号</view>
        <input class="input" placeholder="请输入快递单号" :value="formInfo.number" name="number"></input>
      </view>
      <view class="input-item row">
        <view class="nr label">备注说明</view>
        <input class="input" placeholder="选填" :value="formInfo.remark" name="remark"></input>
      </view>
    </view>
    <view class="upload-contain mt20">
      <view class="header row">
        <view class="nr normal">上传凭证</view>
        <view class="sm muted ml20">(请上传快递单号凭证）</view>
      </view>
      <view class="upload">
        <uploader :deletable="true" @delete="handleImage" preview-size="160rpx" max-count="1" :file-list="fileList" @after-read="afterRead" />
      </view>
    </view>
    <view class="submit-btn">
      <button size="lg" class=" br60 bg-primary white lg" form-type="submit">提交</button>
    </view>
  </form>
</view>
</template>

<script>
import Uploader from '@/bundle_order/components/uploader/uploader.vue'
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
import { inputExpressInfo } from '@/api/user';
import { uploadFile } from '@/utils/tools';



export default {
  data() {
    return {
      fileList: [],
      formInfo: {
        express: '',
        number: '',
        remark: ''
      }
    };
  },

  components: {
			Uploader
		},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      id
    } = options; // 售后id

    this.afterSalesId = id || '';
  },


  methods: {
    afterRead(e) {
      const file = this.normalizeFiles(e)
      if (!file.length) return
      uni.showLoading({
        title: '正在上传中...',
        mask: true
      });
      let finished = 0
      file.forEach(item => {
        uploadFile(item.path)
          .then(res => {
            this.fileList = [res]
          })
          .catch(() => {
            this.$toast({ title: '上传失败' })
          })
          .finally(() => {
            finished += 1
            if (finished >= file.length) uni.hideLoading()
          })
      })
    },

    formSubmit(e) {
      let {
        value
      } = e.detail;
      let {
        fileList
      } = this;
      const express = String(value.express || '').trim()
      const number = String(value.number || '').trim()
      const remark = String(value.remark || '').trim()
      if (!this.afterSalesId) return this.$toast({
        title: '售后编号待确认'
      });
      if (!express) return this.$toast({
        title: '请填写物流公司名称'
      });
      if (!number) return this.$toast({
        title: '请填写快递单号'
      });
      let data = {
        id: this.afterSalesId,
        express_name: express,
        invoice_no: number,
        express_remark: remark,
        express_image: fileList.length <= 0 ? '' : (fileList[0].url || fileList[0].base_url)
      };
      this.inputExpressInfoFun(data);
    },

    inputExpressInfoFun(data) {
      inputExpressInfo(data).then(res => {
        if (res.code == 1) {
          this.$toast({
            title: '提交成功'
          }, () => {
            uni.navigateBack();
          });
          uni.$emit("refreshsale")
        }
      });
    },

    normalizeFiles(e) {
      if (Array.isArray(e)) return e
      if (Array.isArray(e && e.file)) return e.file
      if (Array.isArray(e && e.detail && e.detail.file)) return e.detail.file
      return []
    },

    handleImage(event) {
        const index = typeof event === 'number' ? event : (event && event.index !== undefined ? event.index : (event && event.detail ? event.detail.index : undefined))
        if (index === undefined || index === null) return
        this.fileList.splice(Number(index), 1)
    }

  }
};
</script>
<style>
/* pages/input_express_info/input_express_info.wxss */
.input-express-info {
  min-height: 100vh;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 20rpx 24rpx 48rpx;
  box-sizing: border-box;
  overflow-x: hidden;
  background: #fff9f0;
}

.input-contain {
  background-color: white;
  border-radius: 22rpx;
  overflow: hidden;
}

.input-contain .input-item {
  padding: 24rpx;
  align-items: center;
  box-sizing: border-box;
}

.input-item .label{
  flex: none;
  width: 152rpx;
}

.input-item .input {
  flex: 1;
  min-width: 0;
}

.upload-contain {
  background-color: white;
  padding: 24rpx 20rpx 44rpx;
  border-radius: 22rpx;
  box-sizing: border-box;
}

.upload-contain .header {
  flex-wrap: wrap;
  gap: 8rpx 0;
  margin-bottom: 30rpx;
  word-break: break-all;
}

.submit-btn {
  margin-top: 50rpx;
  margin-left: 0;
  margin-right: 0;
}

.submit-btn button {
  width: 100%;
  box-sizing: border-box;
}
</style>
