<template>
<view class="sign-page">
<navbar title="签到"></navbar>
<!-- pages/user_sgin/user_sgin.wxml -->
<view class="user-sgin">
    <view class="header">
        <view class="sign-header-card">
            <image class="sign-header-card__avatar" :src="avatar || defaultAvatar" mode="aspectFill" />
            <view class="sign-header-card__content">
                <view class="sign-header-card__main">
                    <view class="sign-header-card__points">{{integralText}}</view>
                    <navigator class="sign-header-card__rule" hover-class="none" url="/bundle_misc/pages/sign_rule/sign_rule">
                        <text>我的积分</text>
                        <view class="sign-header-card__help">?</view>
                    </navigator>
                </view>
                <navigator class="sign-header-card__detail" url="/bundle_misc/pages/sign_detail/sign_detail" hover-class="none">
                    <view class="sign-header-card__detail-icon"></view>
                    <text>积分明细</text>
                </navigator>
            </view>
        </view>
    </view>
    <view class="main">
        <view class="contain bg-white">
            <view class="title">{{signDaysTitle}}</view>
            <view class="day-list row wrap">
                <view v-for="(item, index) in signList" :key="index" class="item column-center">
                    <view :class="['circle row-center', item.signed ? 'active-circle' : '', item.prevSigned ? 'active-line' : '']">
                        <view class="num xs lighter" v-if="!item.signed">{{formatRewardText(item.integral)}}</view>
                        <view class="num sign-check" v-if="item.signed"></view>
                    </view>
                    <view class="day mt10 lighter sm">{{item.days}}天</view>
                </view>
            </view>
            <view class="right-sgin">
                <button hover-class="none" :class="'sign-button white br60 ' + (canSign == 1 ? 'gray' : 'primary-button')" @tap.stop="userSignFun" size="md">{{canSign == 1 ? '已签到' : '立即签到' }}</button>
            </view>
        </view>
        <view class="contain bg-white mt20" v-if="makeInegral.length > 0">
            <view class="title row">
                <view class="line br60 mr20"></view>
                <view class="bold  xl">赚积分</view>
            </view>
            <view class="task">
                <view v-for="(item, index) in makeInegral" :key="index" class="item row">
                    <view :class="['task-icon', 'mr20', 'task-icon--' + (item.type || 0)]">{{ taskIconText(item.type) }}</view>
                    <view class="con">
                        <view class="md">{{item.name}}</view>
                        <view class="xs">
                            <text class="num mb20">{{formatRewardText(item.integral)}}</text>
                            <text>积分</text>
                        </view>
                    </view>
                    <button hover-class="none" :class="'btn br60 ' + (item.status ? 'muted' : 'primary' )" :style="'border-color: ' + (item.status ? '#999999' : '#a0610d') + ';'" size="xs">{{item.status ? '已完成' : '未完成'}}</button>
                </view>
            </view>
        </view>
    </view>
</view>

    <u-popup v-model="showPop" mode="center">
        <view class="sign-success-pop">
            <view class="sign-success-pop__halo"></view>
            <view class="sign-success-pop__badge">签</view>
            <view class="sign-success-pop__score">{{addIntegralText}}</view>
            <view class="sign-success-pop__title">签到成功</view>
            <view class="sign-success-pop__reward">
                <view class="sign-success-pop__reward-icon">分</view>
                <text>{{signRewardText}}</text>
            </view>
            <view class="sign-success-pop__days">
                {{signDaysPopPrefix}}<text>{{signDaysPopValue}}</text>{{signDaysPopSuffix}}
            </view>
            <view class="sign-success-pop__button" @tap="onClose">确定</view>
        </view>
    </u-popup>
</view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import UPopup from '@/bundle_misc/components/uview-ui/components/u-popup/u-popup.vue'
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
import { getSignList, userSign, getSignRule } from "@/api/user";
import {trottle} from '@/utils/tools.js'
import { mapActions } from 'vuex'
export default {
	components: {
			Navbar,
			UPopup
		},
  data() {
    return {
      // 成长值
      growth: 0,
      // 积分
      integral: '',
      avatar: "",
      signList: [],
      showPop: false,
      canSign: '',
      addIntegral: '',
      addGrowth: '',
      signDays: '',
      makeInegral: [],
      defaultAvatar: 'https://shengyuan.store/api/miniapp/files/miniapp/23fbcc3e9fa1450bb088262b36bace08/user-avatar-default.png'
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.userSignFun = trottle(this.userSignFun, 1000, this)
  },


  onShow: function () {
    this.getSignListFun();
  },

  computed: {
    integralText() {
      return this.formatKnownNumber(this.integral, '积分待确认')
    },
    signDaysTitle() {
      return this.hasKnownNumber(this.signDays) ? `已连续签到 ${this.signDays}天` : '连续签到天数待确认'
    },
    signRewardText() {
      const integral = this.hasKnownNumber(this.addIntegral) ? `${Number(this.addIntegral)}积分` : '积分待确认'
      const growth = this.hasKnownNumber(this.addGrowth) ? `${Number(this.addGrowth)}成长值` : '成长值待确认'
      return `${integral} + ${growth}`
    },
    addIntegralText() {
      return this.hasKnownNumber(this.addIntegral) ? `+${Number(this.addIntegral)}` : '积分待确认'
    },
    signDaysPopPrefix() {
      return this.hasKnownNumber(this.signDays) ? '您已连续签到 ' : '连续签到天数'
    },
    signDaysPopValue() {
      return this.hasKnownNumber(this.signDays) ? this.signDays : '待确认'
    },
    signDaysPopSuffix() {
      return this.hasKnownNumber(this.signDays) ? ' 天' : ''
    }
  },

  methods: {
    ...mapActions(['getUser']),
    onClose() {
      this.showPop = false
    },

    taskIconText(type) {
      if (type == 1) return '签'
      if (type == 2) return '购'
      return '邀'
    },

    hasKnownNumber(value) {
      if (value === undefined || value === null || value === '') return false
      const number = Number(value)
      return !Number.isNaN(number) && Number.isFinite(number)
    },

    formatKnownNumber(value, fallback = '待确认') {
      return this.hasKnownNumber(value) ? String(Number(value)) : fallback
    },

    formatRewardText(value) {
      return this.hasKnownNumber(value) ? `+${Number(value)}` : '待确认'
    },

    normalizeSignList(list, signDays) {
      const signedDays = this.hasKnownNumber(signDays) ? Math.max(Number(signDays), 0) : 0
      const normalizedList = list.map((item, index) => Object.assign({}, item, {
        signed: item.status == 1 || index < signedDays
      }))
      return normalizedList.map((item, index) => Object.assign({}, item, {
        prevSigned: item.signed && index > 0 && normalizedList[index - 1].signed
      }))
    },

    getSignListFun() {
      getSignList().then(res => {
        if (res.code == 1) {
          const data = res.data || {}
          const user = data.user || {}
          let {
            sign_list
          } = data;
          this.integral = user.user_integral ?? '';
		  this.avatar = user.avatar || ''
          this.canSign = user.today_sign ?? '';
          this.signDays = user.days ?? '';
          this.signList = this.normalizeSignList(Array.isArray(sign_list) ? sign_list : [], this.signDays);
          this.makeInegral = Array.isArray(data.make_inegral) ? data.make_inegral : []
        }
      });
    },

    userSignFun() {
      if (this.canSign == 1) {
        return;
      }

      userSign().then(res => {
        if (res.code == 1) {
          const result = res.data || {}
          let {
            days,
            growth,
            integral
          } = result;

          this.showPop = true;
          this.addGrowth = growth ?? '';
          this.addIntegral = integral ?? '';
          this.signDays = days ?? ''
          this.canSign = 1
          if (this.hasKnownNumber(this.integral) && this.hasKnownNumber(integral)) {
            this.integral = Number(this.integral) + Number(integral)
          } else if (this.hasKnownNumber(result.totalPoints)) {
            this.integral = Number(result.totalPoints)
          }
          this.getUser()
          this.signList = this.normalizeSignList(this.signList, days)

          if (!res.data || !res.data.fallback) {
            this.getSignListFun();
          }
          return
        }
        uni.showToast({ title: res.msg || '签到失败', icon: 'none' })
      }).catch(() => {
        uni.showToast({ title: '签到失败，请稍后重试', icon: 'none' })
      });
    }

  }
};
</script>
<style lang="scss">
.user-sgin {
    padding-bottom: 100rpx;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    overflow-x: hidden;
    box-sizing: border-box;
}
.user-sgin .header {
    background: linear-gradient(135deg, #d79a43 0%, #a0610d 58%, #d79a43 100%);
    background-repeat: no-repeat;
    background-size: 100%;
    height: 400rpx;
    padding-top: 40rpx;
    box-sizing: border-box;
}

.user-sgin .header .avatar {
    margin-left: 40rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
}

.user-sgin .main {
    z-index: 100;
    margin-top: -200rpx;
    width: 100%;
    top: 186rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
}

.user-sgin .main .contain {
    border-radius: 10rpx;
}

.user-sgin .main .contain .title {
    padding: 24rpx 30rpx;
}

.user-sgin .main .contain .title .line {
    width: 8rpx;
    height: 34rpx;
    background-color: $color-primary;
}

.user-sgin .main .day-list {
    width: 100%;
}

.user-sgin .main .day-list .item {
    width: 14.2%;
    margin-bottom: 10rpx;
}

.user-sgin .main .day-list .item .num {
    width: 68rpx;
    height: 68rpx;
    line-height: 58rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f2f2f2;
}

.user-sgin .main .day-list .item .circle {
    position: relative;
}

.user-sgin .main .day-list .item .circle::before {
    content: "";
    width: 34rpx;
    height: 6rpx;
    position: absolute;
    background-color: #f2f2f2;
    right: 68rpx;
}

.user-sgin .main .day-list .item:nth-of-type(7n+1) .circle::before {
    content: "";
    background-color: rgba(0, 0, 0, 0);
}

.user-sgin .main .day-list .item .active-line::before {
    content: "";
    width: 34rpx;
    height: 4rpx;
    position: absolute;
    background-color: #FFBD40;
    right: 68rpx;
}


.user-sgin .main .right-sgin {
    padding: 35rpx 40rpx;
}

.user-sgin .main .right-sgin .sign-button {
    width: 100%;
    max-width: 460rpx;
    height: 84rpx;
    margin: 0 auto;
    line-height: 84rpx;
    border: 0;
    font-size: 30rpx;
    font-weight: 600;
    box-shadow: 0 12rpx 24rpx rgba(160, 97, 13, 0.2);
}

.user-sgin .main .right-sgin .sign-button::after {
    border: 0;
}

.user-sgin .main .right-sgin .primary-button {
    background: linear-gradient(270deg, #d79a43 0%, #c8872e 55%, #a0610d 100%);
}
.user-sgin .main .contain .task {
    border-top: $solid-border;
}
.user-sgin .main .contain .task .item {
    padding: 23rpx 30rpx;
}
.user-sgin .main .contain .task .item .img {
    width:74rpx;
    height:74rpx;
    border-radius:22rpx;
}
.user-sgin .main .contain .task .item .con {
    flex: 1;
}
.user-sgin .main .contain .task .item .btn {
    width: 154rpx;
    border: 1px solid $color-primary;
}
.user-sgin .main .contain .task .item .con .num {
    color: $color-primary;
}

.score-detail-entry {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius:100rpx 0rpx 0rpx 100rpx;
    padding: 12rpx 19rpx 12rpx 16rpx;
    align-self: flex-end;
}

.van-popup {
    background-color: rgba(0, 0, 0, 0) !important;
}

.pop-container {
    background-repeat: no-repeat;
    background-size: 100%;
    height: 626rpx;
    width: 560rpx;
    position: relative;
}

.u-mode-center-box {
    background-color: rgba(0, 0, 0, 0) !important;
}

.header-score {
    font-size: 46rpx;
    line-height: 36rpx;
    font-weight: bold;
    padding-top: 90rpx;
    padding-bottom: 150rpx;
    color: $color-primary;
}

.desc {
    color: white;
    background: linear-gradient(82deg, #d79a43 0%, #c8872e 49%, #a0610d 100%);
    padding: 16rpx 22rpx 16rpx 42rpx;
}

.box {

}

.bottom-box {
    margin-top: 84rpx;
}

.primary-btn {
    padding: 16rpx 190rpx;
}

.gray {
    background-color: #CCCCCC !important;
}

.sign-page {
    min-height: 100vh;
    background: #fff9f0;
    overflow-x: hidden;
    box-sizing: border-box;
}

.sign-page .user-sgin .header {
    height: 360rpx;
    background: linear-gradient(135deg, #d79a43 0%, #a0610d 100%) !important;
    border-radius: 0 0 42rpx 42rpx;
    padding: 42rpx 32rpx 0;
    box-sizing: border-box;
}

.sign-header-card {
    display: flex;
    align-items: center;
    min-height: 132rpx;
    padding: 24rpx 28rpx 24rpx 24rpx;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.28), 0 12rpx 28rpx rgba(182, 42, 32, 0.12);
    box-sizing: border-box;
}

.sign-header-card__avatar {
    flex: none;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.9);
    background: #ffffff;
    box-shadow: 0 8rpx 18rpx rgba(119, 29, 18, 0.14);
}

.sign-header-card__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
}

.sign-header-card__main {
    min-width: 0;
}

.sign-header-card__points {
    color: #ffffff;
    font-size: 58rpx;
    font-weight: 700;
    line-height: 66rpx;
    letter-spacing: 1rpx;
}

.sign-header-card__rule {
    display: inline-flex;
    align-items: center;
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.92);
    font-size: 24rpx;
    line-height: 32rpx;
}

.sign-header-card__help {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26rpx;
    height: 26rpx;
    margin-left: 8rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    box-sizing: border-box;
    color: #ffffff;
    font-size: 20rpx;
    line-height: 26rpx;
}

.sign-header-card__detail {
    flex: none;
    display: flex;
    align-items: center;
    height: 54rpx;
    padding: 0 20rpx;
    border-radius: 27rpx 0 0 27rpx;
    color: #ffffff;
    font-size: 24rpx;
    background: rgba(255, 255, 255, 0.2);
}

.sign-header-card__detail-icon {
    flex: none;
    width: 26rpx;
    height: 26rpx;
    margin-right: 8rpx;
    border-radius: 7rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.92);
    box-sizing: border-box;
}

.sign-header-card__detail-icon::after {
    content: '';
    display: block;
    width: 10rpx;
    height: 3rpx;
    margin: 7rpx auto 0;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 3rpx;
}

.sign-page .user-sgin .main {
    margin-top: -160rpx;
}

.sign-page .user-sgin .main .contain {
    border-radius: 24rpx;
    box-shadow: 0 12rpx 36rpx rgba(24, 40, 80, 0.06);
    overflow: hidden;
}

.sign-page .user-sgin .main .day-list .item .num {
    width: 68rpx;
    height: 68rpx;
    max-width: 68rpx;
    max-height: 68rpx;
}

.sign-check {
    position: relative;
    background: linear-gradient(135deg, #ffcd60 0%, #d79a43 100%) !important;
}

.sign-check::after {
    content: '';
    position: absolute;
    left: 22rpx;
    top: 17rpx;
    width: 22rpx;
    height: 12rpx;
    border-left: 5rpx solid #ffffff;
    border-bottom: 5rpx solid #ffffff;
    transform: rotate(-45deg);
}

.task-icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 74rpx;
    height: 74rpx;
    border-radius: 22rpx;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 700;
    background: linear-gradient(135deg, #f4c36e 0%, #a0610d 100%);
    box-shadow: 0 8rpx 18rpx rgba(160, 97, 13, 0.16);
}

.task-icon--2 {
    background: linear-gradient(135deg, #d79a43 0%, #a0610d 100%);
}

.task-icon--3,
.task-icon--0 {
    background: linear-gradient(135deg, #8edb92 0%, #18a058 100%);
}

.sign-page .pop-container {
    max-width: 80vw;
    background-size: 100% 100%;
}

.sign-page .u-mode-center-box {
    background: transparent !important;
}

.sign-success-pop {
    position: relative;
    width: 600rpx;
    max-width: 86vw;
    padding: 96rpx 42rpx 42rpx;
    border-radius: 36rpx;
    background: linear-gradient(180deg, #fff8ef 0%, #ffffff 42%, #ffffff 100%);
    box-shadow: 0 24rpx 60rpx rgba(92, 38, 12, 0.22);
    box-sizing: border-box;
    overflow: hidden;
    text-align: center;
}

.sign-success-pop__halo {
    position: absolute;
    left: 50%;
    top: -96rpx;
    width: 360rpx;
    height: 220rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 178, 69, 0.34) 0%, rgba(255, 178, 69, 0.04) 70%);
    transform: translateX(-50%);
}

.sign-success-pop__badge {
    position: absolute;
    left: 50%;
    top: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 84rpx;
    height: 84rpx;
    border-radius: 50%;
    color: #ffffff;
    font-size: 38rpx;
    font-weight: 700;
    background: linear-gradient(135deg, #f4c36e 0%, #a0610d 100%);
    box-shadow: 0 12rpx 28rpx rgba(160, 97, 13, 0.24);
    transform: translateX(-50%);
}

.sign-success-pop__score {
    position: relative;
    color: #a0610d;
    font-size: 58rpx;
    font-weight: 800;
    line-height: 68rpx;
}

.sign-success-pop__title {
    margin-top: 10rpx;
    color: #222222;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 46rpx;
}

.sign-success-pop__reward {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 28rpx;
    max-width: 100%;
    padding: 14rpx 24rpx;
    border-radius: 34rpx;
    color: #ffffff;
    font-size: 24rpx;
    line-height: 34rpx;
    background: linear-gradient(90deg, #d79a43 0%, #a0610d 100%);
}

.sign-success-pop__reward-icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    color: #ff713b;
    font-size: 18rpx;
    font-weight: 700;
    background: #ffffff;
}

.sign-success-pop__days {
    margin-top: 36rpx;
    color: #555555;
    font-size: 28rpx;
    line-height: 42rpx;
}

.sign-success-pop__days text {
    color: #ff4b35;
    font-size: 42rpx;
    font-weight: 700;
}

.sign-success-pop__button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 78rpx;
    margin-top: 38rpx;
    border-radius: 39rpx;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
    background: linear-gradient(90deg, #d79a43 0%, #a0610d 100%);
    box-shadow: 0 12rpx 24rpx rgba(255, 76, 54, 0.22);
}
</style>
