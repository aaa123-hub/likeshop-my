<template>
  <view>
    <!-- #ifndef  H5 -->
    <u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent">
      <navbar
        :is-back="true"
        title="注册账号"
        :title-bold="true"
        :is-fixed="false"
        :border-bottom="false"
        :background="{ background: 'rgba(256,256, 256,0)' }"
      ></navbar>
    </u-sticky>
    <!-- #endif -->
    <view class="register-container">
      <view class="input-container">
        <view class="xxl bold">注册新账号</view>

        <view class="input row" style="padding: 15rpx">
          <input
            v-model="mobile"
            placeholder="请输入手机号码"
            type="number"
          />
        </view>

        <view
          class="input row"
          style="padding: 15rpx"
          v-if="appConfig.register_setting"
        >
          <input
            v-model="smsCode"
            style="flex: 1"
            placeholder="请输入验证码"
            :input-border="false"
          />
          <view class="row">
            <view
              class="row-center sms-btn sm br60"
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

          <!-- <view class="input-label row md normal">短信验证码 </view>
          <input v-model="smsCode" style="width: 3.8rem" placeholder="请输入" />
          <button
            class="bd-primary sm primary br60 row-center"
            @click="sendSmsFun()"
          >

            <view v-show="canSendSms" class="sm">获取验证码</view>
            <view
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
          </button> -->
        </view>
        <view class="input row" style="padding: 15rpx">
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
          />
        </view>
        <view class="input row" style="padding: 15rpx">
          <input
            type="password"
            v-model="passwordConfirm"
            placeholder="请再次输入密码"
          />
        </view>
      </view>
      <u-checkbox v-model="isAgree" shape="circle" class="mt20">
        <view class="sm row">
          已阅读并同意
          <navigator
            @tap.stop=""
            class="primary"
            hover-class="none"
            url="/bundle_user/pages/server_explan/server_explan?type=0"
            >《服务协议》</navigator
          >
          和
          <navigator
            @tap.stop=""
            class="primary"
            hover-class="none"
            url="/bundle_user/pages/server_explan/server_explan?type=1"
            >《隐私协议》</navigator
          >
        </view>
      </u-checkbox>
      <button
        class="btn white bg-primary row-center"
        @tap="registerFun"
        :class="{ inactive }"
      >
        注册
      </button>
    </view>
    <!-- 阅读协议弹框 -->
    <u-modal
      :value="showModel"
      show-cancel-button
      :show-title="false"
      @confirm="(isAgree = true), (showModel = false)"
      @cancel="showModel = false"
      confirm-color="#a0610d"
    >
      <view class="comfirm-box">
        <view> 请先阅读并同意 </view>
        <view class="flex row-center">
          <navigator
            class="primary"
            hover-class="none"
            url="/bundle_user/pages/server_explan/server_explan?type=0"
          >
            <view class="agreement">《服务协议》</view>
          </navigator>
          和
          <navigator
            class="primary"
            hover-class="none"
            url="/bundle_user/pages/server_explan/server_explan?type=1"
          >
            <view class="agreement">《隐私协议》</view>
          </navigator>
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import UModal from '@/bundle/components/uview-ui/components/u-modal/u-modal.vue'
import USticky from '@/bundle/components/uview-ui/components/u-sticky/u-sticky.vue'
import { register, sendSms } from "@/api/app.js";
import { ACCESS_TOKEN } from "@/config/app.js";
import { SMSType } from "@/utils/type.js";
import { mapMutations, mapGetters } from "vuex";
import UCountDown from '@/bundle/components/uview-ui/components/u-count-down/u-count-down.vue'
import UCheckbox from '@/bundle/components/uview-ui/components/u-checkbox/u-checkbox.vue'

export default {
	components: {
			Navbar,
			UModal,
			USticky,
			UCountDown,
			UCheckbox
		},
  name: "register",
  created() {},
  data() {
    return {
      isAgree: false,
      mobile: "",
      smsCode: "",
      password: "",
      passwordConfirm: "",
      canSendSms: true,
      time: 59,
      primaryColor: "#a0610d",
      showModel: false,
    };
  },
  onLoad() {
  },
  computed: {
    ...mapGetters(["appConfig"]),

    inactive() {
      if (this.appConfig.register_setting) {
        if (
          this.mobile.length !== 11 ||
          !this.smsCode ||
          !this.password ||
          !this.passwordConfirm
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        if (
          this.mobile.length !== 11 ||
          !this.password ||
          !this.passwordConfirm
        ) {
          return true;
        } else {
          return false;
        }
      }
    },
  },
  methods: {
    changeChecked() {
      this.isAgree = !this.isAgree;
    },
    registerFun() {
      let { isAgree, mobile, password, smsCode, passwordConfirm } = this;
      if (!mobile) {
        this.$toast({ title: "请填写手机号" });
        return;
      }
      if (!password) {
        this.$toast({ title: "请设置密码" });
        return;
      }
      if (password != passwordConfirm) {
        this.$toast({ title: "两次密码输入不一致" });
        return;
      }
      if (!isAgree) {
        // this.$toast({ title: "请阅读并同意《服务协议》《隐私协议》" });
        this.showModel = true;
        return;
      }
      let data = {
        mobile: mobile,
        password: password,
        code: smsCode,
        client: 2,
      };
      register(data).then((res) => {
        if (res.code == 1) {
          this.$toast({ title: res.msg });
          //  跳转到登录页
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          this.$toast({ title: res.msg || '注册失败' });
        }
      }).catch((err) => {
        this.$toast({ title: err?.msg || err?.message || '注册失败' });
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

      sendSms({ mobile: this.mobile, key: SMSType.REGISTER }).then((res) => {
        if (res.code == 1) {
          this.canSendSms = false;
          this.$toast(res.msg);
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
  background: linear-gradient(180deg, #fff7f4 0%, #ffffff 360rpx, #ffffff 100%);
}
.register-container {
  min-height: 100vh;
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 80rpx 40rpx 0;
  box-sizing: border-box;
  .input-container {
    .input {
      height: 100rpx;
      border-radius: 10rpx;
      width: 100%;
      border: $solid-border;
      margin-top: 30rpx;
      box-sizing: border-box;
    }
    .input-item {
      padding: 0 20rpx;
      height: 88rpx;
      margin-bottom: 30rpx;
      border-bottom: 1rpx solid #d7d7d7;
      .input-label {
        width: 180rpx;
        font-size: 30rpx;
        flex: none;
      }
      input {
        flex: 1;
        font-size: 30rpx;
      }
      .bd-primary {
        height: 58rpx;
        width: 176rpx;
        flex: none;
        border: 1rpx solid $color-primary;
        cursor: pointer;
        .seconds {
          color: $color-primary;
        }
      }
    }
  }
  .btn {
    background-color: #a0610d;
    width: 100%;
    margin-top: 80rpx;
    height: 100rpx;
  }
}
.comfirm-box {
  text-align: center;
  padding: 60rpx 0 70rpx 0;
}
.agreement {
  color: $color-primary;
}
.inactive {
  opacity: 0.5;
}
</style>
