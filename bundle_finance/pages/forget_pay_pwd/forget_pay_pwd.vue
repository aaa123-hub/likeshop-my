<template>
    <view class="set-pwd">
        <view class="input-container bg-white">
            <view class="input-item row">
                <view class="input-label md normal">手机号</view>
                <view class="input-value flex1">{{ mobileText }}</view>
            </view>
            <view class="input-item row">
                <view class="input-label md normal">验证码</view>
                <input class="flex1" v-model="code" placeholder="请输入验证码" />
                <view class="get-code xs br60 row-center primary" @tap="sendSms">
                    <view v-show="!showCount">获取验证码</view>
                    <u-count-down
                        v-show="showCount"
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
                        @end="showCount = false"
                    />
                </view>
            </view>
            <view class="input-item row">
                <view class="input-label md normal">转账密码</view>
                <input
                    class="flex1"
                    type="password"
                    v-model="setPwd"
                    placeholder="请输入新的转账密码"
                />
            </view>
            <view class="input-item row">
                <view class="input-label md normal">确认密码</view>
                <input
                    class="flex1"
                    type="password"
                    v-model="comfirmPwd"
                    placeholder="请再次确认密码"
                />
            </view>
            <button
                size="lg"
                type="primary"
                class="btn bg-primary white br60 row-center"
                @tap="retrievePayPasswordFun"
            >
                确认
            </button>
        </view>
    </view>
</template>

<script>
import { retrievePayPassword, send } from '@/api/user'
import { mapGetters } from 'vuex'
import UCountDown from '@/bundle_finance/components/uview-ui/components/u-count-down/u-count-down.vue'
export default {
  components: {
			UCountDown
		},
    data() {
        return {
            time: 59,
            showCount: false,
            setPwd: '',
            comfirmPwd: '',
            code: ''
        }
    },
    methods: {
        hasBoundMobile() {
            return Boolean(this.userInfo && this.userInfo.mobile)
        },
        retrievePayPasswordFun() {
            let { setPwd, comfirmPwd, code } = this
            if (!this.hasBoundMobile()) {
                this.$toast({
                    title: '绑定手机号待确认'
                })
                return
            }
            if (!code) {
                this.$toast({
                    title: '请输入验证码'
                })
                return
            }
            if (!setPwd) {
                this.$toast({
                    title: '请输入新的转账密码'
                })
                return
            }
            if (!comfirmPwd) {
                this.$toast({
                    title: '请输入确认密码'
                })
                return
            }

            if (setPwd != comfirmPwd) {
                this.$toast({
                    title: '两次密码输入不一致'
                })
                return
            }
            if (setPwd.length < 4 || setPwd.length > 8) {
                this.$toast({
                    title: '请输入长度为4-8位的密码'
                })
                return
            }

            let data = {
                new_pay_password: setPwd,
                mobile: this.userInfo.mobile,
                code: code
            }

            retrievePayPassword(data).then((res) => {
                if (res.code == 1) {
                    this.$toast(
                        {
                            title: res.msg
                        },
                        { tab: 3 }
                    )
                }
            })
        },
        sendSms() {
            if (this.showCount) return
            if (!this.hasBoundMobile()) {
                this.$toast({
                    title: '绑定手机号待确认'
                })
                return
            }
            let data = {
                mobile: this.userInfo.mobile
            }
            send(data).then((res) => {
                if (res.code == 1) {
                    this.$toast({
                        title: res.msg
                    })
                    this.showCount = true
                    if (this.$refs.countDown && this.$refs.countDown.start) this.$refs.countDown.start()
                }
            })
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        mobileText() {
            if (this.userInfo.mobile) {
                return this.userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
            }
            return '手机号待确认'
        }
    }
}
</script>

<style lang="scss">
.set-pwd {
    padding-top: 20rpx;

    .input-container {
        padding: 20rpx 0 100rpx;
        border-radius: 20rpx;

        .input-item {
            margin: 0 30rpx;
            height: 88rpx;
            margin-bottom: 30rpx;
            border-bottom: 1px solid #d7d7d7;

            .input-label {
                width: 180rpx;
                flex: none;
            }

            .input-value {
                min-width: 0;
                color: #333333;
                font-size: 28rpx;
                line-height: 88rpx;
                word-break: break-all;
            }

            .get-code {
                width: 176rpx;
                height: 58rpx;
                flex: none;
                border: 1px solid $color-primary;
                box-sizing: border-box;
            }
        }

        .btn {
            margin: 80rpx 30rpx 0;
        }
    }
}
</style>
