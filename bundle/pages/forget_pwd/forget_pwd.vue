<template>
  <view>
    <!-- #ifndef  H5 -->
    <u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent">
      <navbar
        :is-back="true"
        title="忘记密码"
        :title-bold="true"
        :is-fixed="false"
        :border-bottom="false"
        :background="{ background: 'rgba(256,256, 256,0)' }"
      ></navbar>
    </u-sticky>
    <!-- #endif -->
    <view class="forget-pwd-container">
      <view class="forget-input-container">
        <view class="xxl bold">忘记登录密码</view>
        <view class="input row" style="padding: 15rpx">
          <input
            v-model="mobile"
            placeholder="请输入手机号码"
            type="number"
          />
        </view>
        <view class="input row" style="padding: 15rpx">
          <input
            v-model="smsCode"
            style="flex: 1"
            placeholder="请输入验证码"
            :input-border="false"
          />
          <view class="row">
            <view
              class="sms-btn sm row-center br60"
              :style="{ color: mobile.length == 11 ? 'red' : 'gray' }"
              @tap="sendSmsFun()"
            >
              <view v-show="canSendSms">获取验证码</view>
              <u-count-down
                ref="countDown"
                :show-days="false"
                :timestamp="time"
                separator="zh"
                color="#a0610d"
                separatorColor="#a0610d"
                bg-color="rgba(0, 0, 0, 0)"
                :show-hours="false"
                :show-minutes="false"
                :autoplay="false"
                v-show="!canSendSms"
                @end="countDownFinish()"
              />
            </view>
          </view>
        </view>

        <view class="input row" style="padding: 15rpx">
          <input
            type="password"
            v-model="resetPwd"
            placeholder="请输入新密码"
            :input-border="false"
          />
        </view>
        <!-- <view class="input-item row">
        <input
          type="password"
          v-model="comfirmPwd"
          placeholder="再次输入新密码确认"
        />
      </view> -->
      </view>
      <button
        class="btn bg-primary white row-center"
        :class="{ inactive }"
        @tap="forgetPwdFun"
      >
        立即重置密码
      </button>
    </view>
  </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import USticky from '@/bundle/components/uview-ui/components/u-sticky/u-sticky.vue'
import { forgetPwd, sendSms } from "@/api/app.js";
import { ACCESS_TOKEN } from "@/config/app.js";
import { SMSType } from "@/utils/type.js";
import { mapMutations } from "vuex";
import UCountDown from '@/bundle/components/uview-ui/components/u-count-down/u-count-down.vue'
export default {
	components: {
			Navbar,
			USticky,
			UCountDown
		},
  name: "forgetPwd",
  data() {
    return {
      mobile: "",
      smsCode: "",
      resetPwd: "",
      //   comfirmPwd: "",
      time: 59,
      canSendSms: true,
    };
  },
  onLoad() {},
  computed: {
    inactive() {
      if (this.mobile.length !== 11 || !this.smsCode || !this.resetPwd) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    ...mapMutations(["LOGIN"]),
    goPage(name) {
      uni.navigateTo({
        url: name,
      });
    },
    forgetPwdFun() {
      let { mobile, smsCode, resetPwd, comfirmPwd } = this;
      if (!mobile) {
        this.$toast({
          title: "请填写手机号",
        });
        return;
      }
      if (!smsCode) {
        this.$toast({
          title: "请填写短信验证码",
        });
        return;
      }
      if (!resetPwd) {
        this.$toast({
          title: "请填写重置密码",
        });
        return;
      }
      //   if (!comfirmPwd) {
      //     this.$toast({
      //       title: "请填写确认密码",
      //     });
      //     return;
      //   }
      //   if (resetPwd != comfirmPwd) {
      //     this.$toast({
      //       title: "两次密码输入不一致",
      //     });
      //     return;
      //   }
      let data = {
        mobile: mobile,
        code: smsCode,
        password: resetPwd,
        // repassword: comfirmPwd,
      };
      forgetPwd(data).then((res) => {
        if (res.code == 1) {
          this.$toast({
            title: res.msg,
          });
          //  跳转到登录页
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          this.$toast({ title: res.msg || '密码重置失败' });
        }
      }).catch((err) => {
        this.$toast({ title: err?.msg || err?.message || '密码重置失败' });
      });
    },
    countDownFinish() {
      this.canSendSms = true;
    },
    sendSmsFun() {
      if (this.mobile.length !== 11) {
        this.$toast({
          title: "请填写正确的手机号信息",
        });
        return;
      }
      if (this.canSendSms == false) {
        return;
      }
      // if (!this.mobile) {
      //   return;
      // }
      sendSms({
        mobile: this.mobile,
        key: SMSType.FINDPWD,
      }).then((res) => {
        if (res.code == 1) {
          this.canSendSms = false;
          this.$toast({
            title: res.msg,
          });
          if (this.$refs.countDown && this.$refs.countDown.start) this.$refs.countDown.start();
        } else {
          this.$toast({ title: res.msg || '验证码发送失败' });
        }
      }).catch((err) => {
        this.$toast({ title: err?.msg || err?.message || '验证码发送失败' });
      });
    },
  },
};
</script>

<style lang="scss">
page {
  min-height: 100%;
  background: linear-gradient(135deg, #a0610d 0%, #d79a43 58%, #ffe7bd 100%);
}
.forget-pwd-container {
  min-height: 100vh;
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 80rpx 40rpx 0;
  box-sizing: border-box;

  .forget-input-container {
    .input {
      height: 100rpx;
      border-radius: 10rpx;
      width: 100%;
      border: $solid-border;
      margin-top: 30rpx;
      box-sizing: border-box;
    }
  }
}

.btn {
  background-color: #a0610d;
  width: 100%;
  margin-top: 80rpx;
  height: 100rpx;
  //   }
}
.inactive {
  opacity: 0.5;
}
</style>
