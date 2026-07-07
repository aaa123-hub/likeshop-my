<template>
    <view class="user-profile-container mt10">
        <navbar title="个人资料"></navbar>
        <view class="user-profile">
            <view class="user-avatar-box column-center" @tap="chooseAvatarImage">
                <view class="column column-center">
                    <image
                        class="user-avatar"
                        :src="
                            userInfo.avatar != ''
                                ? userInfo.avatar
                                : 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/default_avatar.png'
                        "
                    >
                    </image>
                    <view class="muted xs">点击修改头像</view>
                </view>
            </view>
            <view class="row-info row bdb-line">
                <view class="label md">ID</view>
                <view class="md row" style="flex: 1">{{ userInfo.sn }}</view>
            </view>
            <view class="row-info row bdb-line" @tap="changeName">
                <view class="label md">昵称</view>
                <view class="md row" style="flex: 1">{{ userInfo.nickname }}</view>
                <u-icon name="arrow-right" />
            </view>
            <view class="row-info row bdb-line" @tap="changeSex()">
                <view class="label md">性别</view>
                <view class="md row" :class="userInfo.sex == 0 ? 'muted' : ''" style="flex: 1">
                    {{ userInfo.sex == 0 ? '未设置' : userInfo.sex == 1 ? '男' : '女' }}
                </view>
                <u-icon name="arrow-right" />
            </view>
            <view class="row-info row bdb-line">
                <view class="label md">手机</view>
                <view class="md row" :class="{ muted: !userInfo.mobile }" style="flex: 1">
                    {{ userInfo.mobile ? userInfo.mobile : '未绑定' }}
                </view>
                <!-- #ifdef H5 || APP-PLUS -->
                <view class="bd-btn br60 row-center" @tap="showModifyMobile">
                    {{ userInfo.mobile ? '更换手机号' : '绑定手机号' }}
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                    class="bd-btn br60 row-center"
                    size="sm"
                    open-type="getPhoneNumber"
                    @getphonenumber="getPhoneNumber"
                >
                    {{ userInfo.mobile ? '更换手机号' : '绑定手机号' }}
                </button>
                <!-- #endif -->
            </view>
            <view class="row-info row bdb-line">
                <view class="label md">注册时间 </view>
                <view class="md row" style="flex: 1">{{ userInfo.create_time || '暂未记录' }}</view>
            </view>
        </view>
        <u-popup type="center" closeable v-model="showMobile" mode="center" border-radius="14">
            <view class="modify-container column-center bg-white" v-show="showMobile">
                <view class="title xl">{{ userInfo.mobile ? '更换手机号' : '绑定手机号' }}</view>
                <view class="modify-row row" v-if="userInfo.mobile">
                    <view style="width: 112rpx; border-right: 1rpx solid #e5e5e5">+86</view>
                    <view style="margin-left: 30rpx">{{ userInfo.mobile }}</view>
                </view>
                <view class="modify-row row">
                    <view style="width: 142rpx">新手机号</view>
                    <input v-model="new_mobile" placeholder="请输入新的手机号" type="number" maxlength="11" />
                </view>
                <view class="modify-row row">
                    <view style="width: 142rpx">验证码</view>
                    <input
                        v-model="smsCode"
                        style="padding-left: 10rpx; width: 260rpx"
                        placeholder="请输入验证码"
                    />
                    <view class="send-code-btn nr row-center" @tap="$sendSms">
                        <view
                            :keep-running="true"
                            ref="uCode"
                            @change="codeChange"
                            unique-key="page-b"
                        >
                        </view>
                        <view class="xs">{{ tips || '发送验证码' }}</view>
                    </view>
                </view>
                <view class="primary mt10">手机号更换成功后，将用于账号登录和通知。</view>
                <view class="btn bg-primary white row-center" @tap="$changeUserMobile">确定</view>
            </view>
        </u-popup>

        <!-- 昵称修改组件 -->
        <u-popup
            v-model="showNickName"
            :closeable="true"
            :maskCloseAble="false"
            mode="center"
            border-radius="14"
        >
            <view
                class="modify-container column-center bg-white"
                style="width: 70vw; padding: 24rpx"
            >
                <view class="title xl">修改用户名</view>
                <view class="nickname-field">
                    <input
                        v-model="newNickname"
                        class="nickname-input nr"
                        type="nickname"
                        maxlength="20"
                        placeholder="请输入新的昵称"
                        placeholder-class="nickname-placeholder"
                    />
                </view>
                <view class="btn bg-primary white row-center" @tap="changeNameConfirm">确定</view>
            </view>
        </u-popup>
        <u-popup v-model="showPwd" closeable mode="center" border-radius="14">
            <view class="modify-container column-center bg-white" v-show="showPwd">
                <view class="title xl">设置密码</view>
                <view class="modify-row row">
                    <view style="width: 112rpx; border-right: 1rpx solid #e5e5e5">+86</view>
                    <view style="margin-left: 30rpx">{{ userInfo.mobile }}</view>
                </view>
                <view class="modify-row row">
                    <view style="width: 142rpx">验证码</view>
                    <input
                        v-model="smsCode"
                        style="padding-left: 10rpx; width: 260rpx"
                        placeholder="请输入验证码"
                    />
                    <view class="send-code-btn nr row-center" @tap="$sendSms">
                        <view
                            :keep-running="true"
                            ref="uCode"
                            @change="codeChange"
                            unique-key="page-a"
                        >
                        </view>
                        <view class="xs">{{ tips }}</view>
                    </view>
                </view>
                <view class="modify-row row">
                    <view style="width: 142rpx">设置密码</view>
                    <input type="password" v-model="pwd" placeholder="请输入新密码" />
                </view>
                <view class="modify-row row">
                    <view style="width: 142rpx">确认密码</view>
                    <input type="password" v-model="comfirmPwd" placeholder="再次输入新密码确认" />
                </view>
                <view class="btn bg-primary white row-center" @tap="$forgetPwd">确定</view>
            </view>
        </u-popup>
        <u-picker
            mode="selector"
            v-model="showPicker"
            :default-selector="[0]"
            :range="sexList"
            @confirm="onConfirm"
         />
    </view>
</template>

<script>
import { userLogout, getUserInfo, changeUserMobile, setUserInfo, setWechatInfo } from '@/api/user'
import { version } from '@/config/app'
import { sendSms, forgetPwd } from '@/api/app'
import { SMSType } from '@/utils/type'
import { mapState, mapGetters } from 'vuex'
import { uploadFile, isWeixinClient, trottle } from '@/utils/tools'
import { getWxCode, getUserProfile } from '@/utils/login'
import Navbar from '@/components/navbar/navbar.vue'
import UPopup from '@/bundle_user/components/uview-ui/components/u-popup/u-popup.vue'
import UPicker from '@/bundle_user/components/uview-ui/components/u-picker/u-picker.vue'
import UIcon from '@/bundle_user/components/uview-ui/components/u-icon/u-icon.vue'

const FieldType = {
    NONE: '',
    SEX: 'sex',
    NICKNAME: 'nickname',
    AVATAR: 'avatar',
    MOBILE: 'mobile'
}
export default {
    name: 'userProfile',
    components: {
			Navbar,
			UPopup,
			UPicker,
			UIcon
		},
    data() {
        return {
            version: version,
            fileList: [],
            userInfo: {},
            new_mobile: '',
            smsCode: '',
            newNickname: '',
            sexList: ['男', '女'],
            fieldType: FieldType.NONE,
            showPicker: false,
            showMobile: false,
            showPwd: false,
            showNickName: false,
            tips: '',
            canSendSms: true,
            pwd: '',
            comfirmPwd: '',
            smsType: SMSType.FINDPWD,
            code: ''
        }
    },
    methods: {
        codeChange(text) {
            this.tips = text
        },
        chooseAvatarImage() {
            this.fieldType = FieldType.AVATAR
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const path = res.tempFilePaths && res.tempFilePaths[0]
                    if (path) this.uploadImage(path)
                }
            })
        },
        onChooseAvatar(e) {
            this.fieldType = FieldType.AVATAR
            // #ifndef MP-WEIXIN
            // 此为uView的跳转方法，详见"文档-JS"部分，也可以用uni的uni.navigateTo
            uni.$u.route({
                // 关于此路径，请见下方"注意事项"
                url: '/bundle_user/components/uview-ui/components/u-avatar-cropper/u-avatar-cropper',
                // 内部已设置以下默认参数值，可不传这些参数
                params: {
                    // 输出图片宽度，高等于宽，单位px
                    destWidth: 300,
                    // 裁剪框宽度，高等于宽，单位px
                    rectWidth: 200,
                    // 输出的图片类型，如果'png'类型发现裁剪的图片太大，改成"jpg"即可
                    fileType: 'jpg'
                }
            })
            // #endif
            // #ifdef MP-WEIXIN
            if (e && e.detail && e.detail.avatarUrl) {
                this.uploadImage(e.detail.avatarUrl)
            } else {
                this.chooseAvatarImage()
            }
            // #endif
        },
        // 修改用户昵称
        async changeNameConfirm() {
            this.fieldType = FieldType.NICKNAME
            this.newNickname = (this.newNickname || '').trim()
            if (!this.newNickname)
                return this.$toast({
                    title: '请输入新的昵称'
                })
            await this.$setUserInfo(this.newNickname)
            this.showNickName = false
        },

        // end
        logout() {
            //  退出登录
            userLogout({
                token: this.token
            }).then((res) => {
                if (res.code == 1) {
                    this.$store.commit('LOGOUT')
                    this.$toast({
                        title: '退出成功'
                    })
                    setTimeout(() => {
                        uni.redirectTo({
                            url: '/bundle/pages/login/login'
                        })
                    }, 500)
                }
            })
        },
        goToExplain(value) {
            uni.navigateTo({
                url: '/bundle_user/pages/server_explan/server_explan?type=' + value
            })
        },
        toSetPayPwd() {
            if (!this.userInfo.mobile)
                return this.$toast({
                    title: '请先设置手机号'
                })
            uni.navigateTo({
                url: '/bundle_finance/pages/set_pay_pwd/set_pay_pwd'
            })
        },
        $sendSms() {
            if (!this.canSendSms) return
            const mobile = this.showMobile ? this.new_mobile : this.userInfo.mobile
            if (!/^1\d{10}$/.test(String(mobile || ''))) return this.$toast({ title: '请输入正确的手机号' })
            sendSms({
                mobile,
                key: this.smsType,
                scene: this.smsType
            }).then((res) => {
                if (res.code == 1) {
                    this.$toast({
                        title: res.msg || '验证码已发送'
                    })
                    if (this.$refs.uCode && this.$refs.uCode.start) this.$refs.uCode.start()
                }
            })
        },
        $getUserInfo() {
            getUserInfo().then((res) => {
                if (res.code == 1) {
                    this.userInfo = res.data
                }
            })
        },
        // 更换手机号
        showModifyMobile() {
            this.smsCode = ''
            this.new_mobile = ''
            this.showMobile = true
            this.smsType = this.userInfo.mobile ? SMSType.CHANGE_MOBILE : SMSType.BIND
        },
        $changeUserMobile() {
            if (!/^1\d{10}$/.test(String(this.new_mobile || ''))) return this.$toast({ title: '请输入正确的新手机号' })
            if (!this.smsCode) return this.$toast({ title: '请输入验证码' })
            changeUserMobile({
                mobile: this.userInfo.mobile,
                oldMobile: this.userInfo.mobile,
                new_mobile: this.new_mobile,
                newMobile: this.new_mobile,
                phone: this.new_mobile,
                code: this.smsCode,
                smsCode: this.smsCode,
                verifyCode: this.smsCode,
                scene: this.smsType,
                action: this.userInfo.mobile ? 'change' : 'bind'
            }).then((res) => {
                if (res.code == 1) {
                    this.showMobile = false
                    this.$toast({
                        title: this.userInfo.mobile ? '手机号更换成功' : '手机号绑定成功'
                    })
                    this.$getUserInfo()
                } else {
                    this.$toast({ title: res.msg || '手机号更换失败，请检查验证码' })
                }
            })
        },
        // end
        // 修改用户信息
        async $setUserInfo(value) {
            const res = await setUserInfo({
                field: this.fieldType,
                value: value
            })
            if (res.code == 1) {
                if (this.fieldType === FieldType.NICKNAME) this.userInfo.nickname = value
                if (this.fieldType === FieldType.AVATAR) this.userInfo.avatar = value
                if (this.fieldType === FieldType.SEX) this.userInfo.sex = value
                this.$store.commit('SETUSERINFO', this.userInfo)
                this.$toast({
                    title: res.msg
                })
                this.$getUserInfo()
            }
        },
        // end
        timeChange(timestamp) {
        },
        onConfirm(value) {
            this.$setUserInfo(value[0] + 1)
            this.showPicker = false
        },
        changeSex(e) {
            this.showPicker = true
            this.fieldType = FieldType.SEX
        },

        // 定时器完成
        countDownFinish() {
            this.canSendSms = true
        },
        // 修改密码
        showPwdPop() {
            if (!this.userInfo.mobile) {
                this.$toast({
                    title: '请绑定手机后再设置密码'
                })
                return
            }
            this.smsCode = ''
            this.smsType = SMSType.FINDPWD
            this.showPwd = true
        },
        $forgetPwd() {
            let { smsCode, pwd, comfirmPwd } = this
            if (!smsCode) {
                this.$toast({
                    title: '请填写短信验证码'
                })
                return
            }
            if (!pwd) {
                this.$toast({
                    title: '请输入新密码'
                })
                return
            }
            if (!comfirmPwd) {
                this.$toast({
                    title: '再次输入新密码确认'
                })
                return
            }
            if (pwd != comfirmPwd) {
                this.$toast({
                    title: '两次密码输入不一致'
                })
                return
            }
            let data = {
                mobile: this.userInfo.mobile,
                code: smsCode,
                password: pwd,
                repassword: comfirmPwd
            }
            forgetPwd(data).then((res) => {
                if (res.code == 1) {
                    this.showPwd = false
                    this.$toast({
                        title: '设置密码成功'
                    })
                    this.$getUserInfo()
                }
            })
        },
        // end
        // 修改昵称
        changeName() {
            this.fieldType = FieldType.NICKNAME
            this.newNickname = this.userInfo.nickname || ''
            this.showNickName = true
        },
        // end

        async getPhoneNumber(e) {
            const { encryptedData, iv } = e.detail
                let data = {
                code: this.code,
                smsCode: this.code,
                jsCode: this.code,
                loginCode: this.code,
                wxCode: this.code,
                encrypted_data: encryptedData,
                encryptedData,
                iv
            }
            this.fieldType = FieldType.MOBILE
            if (encryptedData) {
                this.$changeUserMobileMP(data)
            }
        },
        $changeUserMobileMP(data) {
            changeUserMobile(data).then((res) => {
                if (res.code == 1) {
                    this.$toast({
                        title: '手机号绑定成功'
                    })
                    this.$getUserInfo()
                } else {
                    this.$toast({ title: res.msg || '手机号绑定失败，请重新授权' })
                }
                // #ifdef MP-WEIXIN
                getWxCode().then((res) => {
                    this.code = res
                })
                // #endif
            })
        },
        uploadImage(path) {
            uni.showLoading({
                title: '正在上传中...',
                mask: true
            })
            uploadFile(path)
                .then((res) => {
                    uni.hideLoading()
                    this.$setUserInfo(res.url)
                })
                .catch(() => {
                    uni.hideLoading()
                    this.$toast({
                        title: '上传失败'
                    })
                })
        }
    },
    onLoad() {
        this.$getUserInfo()
        // #ifdef MP-WEIXIN
        getWxCode().then((res) => {
            this.code = res
        })
        // #endif
        // 监听从裁剪页发布的事件，获得裁剪结果
        uni.$on('uAvatarCropper', (path) => {
            this.uploadImage(path)
        })
        this.getUserProfile = trottle(this.getUserProfile, 500, this)
    },
    onUnload() {
        uni.$off('uAvatarCropper')
    },
    computed: {
        ...mapState(['token']),
        ...mapGetters(['appConfig'])
    }
}
</script>

<style lang="scss">
.user-profile-container {
    .user-profile {
        border-top-left-radius: 28rpx;
        border-top-right-radius: 28rpx;

        .user-avatar-box {
            padding: 30rpx;
            background-color: white;
            border-top-left-radius: 28rpx;
            border-top-right-radius: 28rpx;

            .user-avatar {
                width: 120rpx;
                height: 120rpx;
                border-radius: 50%;
            }
        }

        .row-info {
            padding: 30rpx 20rpx;
            background-color: white;

            .label {
                width: 180rpx;
            }

            .bd-btn {
                padding: 8rpx 24rpx;
                border: 1px solid $color-primary;
                color: $color-primary;
            }
        }

        .license {
            margin-top: 80rpx;
            color: #a7a7a7;
            text-align: center;
        }

        .bdb-line {
            border-bottom: 1rpx solid #e5e5e5;
        }

        .save-btn {
            margin-top: 40rpx;
            height: 88rpx;
            margin-left: 54rpx;
            margin-right: 54rpx;
            border-radius: 10rpx;
            box-sizing: border-box;
        }

        .updata-btn {
            margin: 0 30rpx;
            margin-top: 40rpx;
            background-color: #0cc267;
        }
    }

    .modify-container {
        padding-left: 30rpx;
        padding-right: 30rpx;
        padding-bottom: 30rpx;
        width: 580rpx;
        border-radius: 30rpx;
        background-color: $color-white;

        .title {
            padding: 26rpx 0rpx;
        }

        .modify-row {
            padding: 32rpx 0rpx;
            width: 100%;
            border-bottom: 1rpx solid #e5e5e5;

            .send-code-btn {
                border: 1px solid $color-primary;
                width: 184rpx;
                height: 62rpx;
                color: $color-primary;
            }
        }

        .btn {
            height: 80rpx;
            padding: 0 180rpx;
            border-radius: 20rpx;
            margin-top: 60rpx;
        }

        .nickname-field {
            width: 100%;
            padding: 18rpx 22rpx;
            box-sizing: border-box;
            border: 1rpx solid #e5e5e5;
            border-radius: 16rpx;
            background: #f7f8fa;
        }

        .nickname-input {
            width: 100%;
            height: 64rpx;
            line-height: 64rpx;
            color: #222222;
        }

        .nickname-placeholder {
            color: #999999;
        }
    }
}
</style>
