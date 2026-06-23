<template>

<view class="coupon-list">
    <view v-for="(item, index) in list" :key="index" class="coupon-list__row">
        <view :class="'coupon-item ' + (btnType == 1 || btnType == 2 ? 'gray': '')">
            <view class="price white column-center">
                <view class="xl">
                    <price-format :first-size="60" :second-size="50" :subscript-size="34" :price="item.money" :weight="500" />
                </view>
                <view class="sm coupon-condition">{{item.use_condition}}</view>
            </view>
            <view class="info">
                <view class="coupon-name">{{item.name || '优惠券'}}</view>
                <view class="coupon-time">{{item.use_time_tips || '有效期以实际使用规则为准'}}</view>
                <view class="coupon-type">{{item.coupon_type || item.use_condition}}</view>
            </view>
            <button type="primary" :class="'btn br60 white xs ' + (btnType != 3 ? 'plain': '')" @tap="onHandle(item.id)">
                {{getBtn}}
            </button>
            <image v-if="item.is_get" class="receive" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/coupon_receive.png"></image>
        </view>
        <view class="coupon-tips bg-white" v-if="item.tips" @tap="onShowTips(index)">
            <view class="row-between">
                <view class="xs">使用说明</view>
                 <u-icon :class="showTips[index] ? 'rotate' : ''" name="arrow-down" />
            </view>
            <view v-show="showTips[index]" class="mt10 xs">{{item.tips}}</view>
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
import { getCoupon } from '@/api/user';

export default {
  data() {
    return {
      showTips: []
    };
  },

  components: {
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    btnType: {
      // 0 去使用  1已使用 2已过期 3领取
      type: Number
    }
  },
  watch: {
    list: {
      handler: function (val) {
        let arr = val.map(item => {
          return 0;
        });
        this.showTips = arr
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    getBtn() {
        var text = ''
        switch (this.btnType) {

            case 0:
                text = '去使用';
                break;
            case 1:
                text = '已使用';
                break;
            case 2:
                text = '已过期';
                 break;
            case 3:
                text = '领取';
                break;
        }
        return text
    }
  },
  methods: {
    onHandle(id) {
      this.id = id;
      const {
        btnType
      } = this;

      switch (btnType) {
        case 0:
          uni.switchTab({
            url: '/pages/index/index'
          });
          break;

        case 1:
          // text = '去使用';
          break;

        case 2:
          // text = '已使用';
          break;

        case 3:
          this.getCouponFun();
          break;
      }
    },

    onShowTips(index) {
      const {
        showTips
      } = this;

      this.showTips[index] = showTips[index] ? 0 : 1
      // 拷贝数组
      this.showTips = Object.assign([], this.showTips);
    },

    getCouponFun() {
      getCoupon(this.id).then(res => {
        if (res.code == 1) {
          this.$toast({title: res.msg})
          this.$emit('reflash');
        }
      });
    }

  }
};
</script>
<style lang="scss" >
/* components/coupon-list/coupon-list.wxss */
.coupon-list {
    padding: 20rpx 24rpx;
    box-sizing: border-box;

    .coupon-list__row {
        margin-bottom: 20rpx;
        border-radius: 18rpx;
        overflow: hidden;
        box-shadow: 0 10rpx 30rpx rgba(24, 40, 80, 0.04);
    }

    .coupon-item {
        position: relative;
        display: flex;
        align-items: stretch;
        width: 100%;
        height: 200rpx;
        background-image: url(https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/coupon_bg.png);
        background-size: 100% 100%;
        overflow: hidden;
        box-sizing: border-box;
        &.gray {
            background-image: url(https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/coupon_bg_grey.png);
            .btn{
                &.plain {
                    color: #CCCCCC;
                }
            }
        }
        .price {
            flex: none;
            width: 200rpx;
            padding: 0 12rpx;
            box-sizing: border-box;
            overflow: hidden;
        }

        .coupon-condition {
            width: 100%;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .info {
            flex: 1;
            min-width: 0;
            padding: 30rpx 156rpx 24rpx 22rpx;
            box-sizing: border-box;
        }

        .coupon-name {
            color: #222222;
            font-size: 30rpx;
            font-weight: 600;
            line-height: 40rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .coupon-time,
        .coupon-type {
            margin-top: 12rpx;
            color: #999999;
            font-size: 22rpx;
            line-height: 30rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .btn {
            line-height: 52rpx;
            height: 52rpx;
            position: absolute;
            right: 20rpx;
            bottom: 20rpx;
            width: 120rpx;
            text-align: center;
            padding: 0;
            text-align: center;
            box-sizing: border-box;
            &.plain {
                background-color: #fff;
                color: var(--primary-color);
                border: 1px solid currentColor;
            }
        }
        .receive  {
            position: absolute;
            right: 30rpx;
            top: 0rpx;
            width: 99rpx;
            height: 77rpx;
        }
    }

    .coupon-tips {
        padding: 16rpx 22rpx;
        color: #666666;
        line-height: 34rpx;
    }
    .icon {
        transition: all 0.4s;
    }
    .rotate {
        transform: rotateZ(-180deg);
    }
}

</style>
