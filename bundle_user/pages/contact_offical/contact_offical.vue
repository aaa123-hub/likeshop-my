<template>
     <view class="contact-offical">
        <view class="header">

        </view>
        <view class="content column-center">
            <view class="content-view column-center bg-white">
                <image v-if="server.qrcode || server.image" class="content-img" :src="server.qrcode || server.image" mode="aspectFit" @tap="previewQrcode" />
                <view v-else class="content-img content-img--empty">客服二维码</view>
                <view class="primary wechat-num lg">{{ server.wechat ? '客服微信：' + server.wechat : '客服微信' }}</view>
                <view class="row-center copy-btn xxl white" @click="onCopy(server.wechat)">
                    <image class="mr5" style="width: 32px;height: 25px;" src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/wechat-btn-icon.png" />
                    微信扫码添加
                </view>
                <view class="mt20 normal xs" style="line-height: 35px">{{server.time}}</view>
                <!-- #ifdef MP-WEIXIN -->
                <button open-type="contact" class="sm row-center br60">
                    <text style="line-height: 50px;">在线客服</text>
                </button>
                <!-- #endif -->
                <!-- #ifndef MP-WEIXIN -->
                <view class="sm row-center br60" @click="tipsShow()">
                    <text style="line-height: 50px;">在线客服</text>
                </view>
                <!-- #endif -->
            </view>
            <view class="xs white" style="margin-top: 40px;line-height: 49px;">
                无法添加或疑难问题请联系工作人员
            </view>
            <view class="row white">
                <view class="xs" style="line-height: 49px;">{{server.phone}}</view>
                <!-- #ifdef H5 -->
                <a class="ml10 phone-btn xs row-center white" :href="'tel:' + server.phone">拨打</a>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <a class="ml10 phone-btn xs row-center white" @click="showTelTips">拨打</a>
                <!-- #endif -->
                <view class="ml5 copy-phone-btn xs row-center" @click="onCopy(server.phone)">复制</view>
            </view>
        </view>
        <u-modal
        :content="content"
        v-model="showPhoneCall"
        show-cancel-button
        confirm-text='呼叫'
        confirm-color="#F62318"
        @confirm="onCall"
        >
        </u-modal>
    </view>
</template>

<script>
    import {getService} from "@/api/app"
    import {copy} from '@/utils/tools'
    export default {
        name: 'contactOffical',
        data() {
            return {
                server: {
                    image: '',
                    qrcode: '',
                    wechat: '',
                    phone: '',
                    time: '工作日 09:00-18:00'
                },
                showPhoneCall: false,
                content: '即将打电话给'
            }
        },

        onLoad() {
            this.$getService()
        },

        methods: {
            $getService() {
                getService().then(res => {
                    if(res.code == 1) {
                        this.server = {
                            ...this.server,
                            ...(res.data || {})
                        }
                    }
                })
            },
            tipsShow() {
                if (this.server.wechat) {
                    this.onCopy(this.server.wechat)
                    return
                }
                this.$toast({title: "请扫码添加客服"})
            },
            onCopy(str) {
                if (!str) {
                    this.$toast({ title: '暂无可复制内容' })
                    return
                }
                copy(str);
            },
            showTelTips() {
                if (!this.server.phone) {
                    this.$toast({ title: '暂无客服电话' })
                    return
                }
                this.showPhoneCall = true;
                this.content = '即将打电话给' + this.server.phone
            },
            onCall() {
                uni.makePhoneCall({
                    phoneNumber: this.server.phone.toString(),
                    success(e) {
                        console.log('成功', e)
                    },
                    fail(err) {
                        console.log('失败', err)
                    }
                })
            },
            previewQrcode() {
                const url = this.server.qrcode || this.server.image
                if (!url) return
                uni.previewImage({
                    urls: [url],
                    current: url
                })
            }
        }
    }
</script>

<style lang="scss">

    .contact-offical {
        min-height: 100vh;
        background: linear-gradient(180deg, #F62318 0%, #F20407 100%);
        .header {
            height: 383px;
            width: 100%;
        }
        .content {


            .content-view {
                border: 5px solid #FA7949;
                width: 310px;
                border-radius: 10px;
                margin-top: -350px;
                .content-img {
                    margin-top: 20px;
                    height: 192px;
                    width: 192px;
                }
                .content-img--empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999999;
                    font-size: 14px;
                    background: #f5f5f5;
                }
                .wechat-num {
                    line-height: 45px;
                }
                .copy-btn {
                    background: linear-gradient(180deg, #FFA200 0%, #FF5E44 100%);
                    width: 230px;
                    height: 50px;
                    border-radius: 50px;
                    line-height: 49px;
                    margin-top: 30px;
                }
                .contact-btn {
                    width: 300rpx;
                    height: 60rpx;
                    margin-bottom: 20rpx;
                }
            }
            .phone-btn {
                background: linear-gradient(180deg, #FFA200 0%, #FF5E44 100%);
                height: 24px;
                width: 60px;
                line-height: 33px;
                border-radius: 50px;
            }
            .copy-phone-btn {
                background-color: rgba($color: #fff, $alpha: 0.5);
                height: 24px;
                width: 60px;
                line-height: 33px;
                border-radius: 50px;
            }
        }
    }
</style>
