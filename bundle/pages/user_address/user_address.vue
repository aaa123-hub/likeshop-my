<template>
    <view class="user-address">
        <navbar title="添加地址"></navbar>
        <view class="address-body">
            <template v-if="hasAddress">
                <radio-group class="address-list" @change="radioChange">
                    <view
                        v-for="(item, index) in addressList"
                        :key="index"
                        class="address-card"
                        :data-id="item.id"
                        @tap="onSelect"
                    >
                        <view class="address-card__main">
                            <view class="address-card__header">
                                <view class="address-card__name">
                                    {{ item.contact }}
                                </view>
                                <view class="address-card__phone">{{ item.telephone }}</view>
                            </view>
                            <view class="address-card__detail">
                                {{ item.province }} {{ item.city }} {{ item.district }}
                                {{ item.address }}
                            </view>
                        </view>
                        <view class="address-card__footer">
                            <label class="default-wrap">
                                <radio
                                    color="#1F7AF4"
                                    :value="item.id + ''"
                                    :checked="item.is_default == '1'"
                                />
                                <text>设为默认地址</text>
                            </label>
                            <view class="address-card__actions">
                                <view class="action-item" @tap.stop="editAddress(item.id)">
                                    <u-icon name="edit-pen" size="28" color="#222222"></u-icon>
                                    <text>编辑</text>
                                </view>
                                <view
                                    class="action-item action-item--danger"
                                    :data-id="item.id"
                                    @tap.stop="showSurePop"
                                >
                                    <u-icon name="trash" size="28" color="#909399"></u-icon>
                                    <text>删除</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </radio-group>
            </template>
            <template v-else>
                <view class="empty-wrap">
                    <view class="address-empty__text">暂无数据</view>
                </view>
            </template>
        </view>
        <u-modal
            v-model="deleteSure"
            :showCancelButton="true"
            confirm-text="删除"
            confirm-color="#1F7AF4"
            :show-title="false"
            @confirm="delAddressFun"
            @cancel="hidePop"
        >
            <view class="tips-dialog">确认删除该地址吗？</view>
        </u-modal>
        <view class="footer">
            <!-- #ifdef H5 || MP-WEIXIN -->
            <view v-if="isWeixin" class="footer__ghost" @click="getWxAddressFun">
                微信导入
            </view>
            <!-- #endif -->
            <view class="footer__btn" @click="addAddress">
                {{ hasAddress ? '新增收货地址' : '+添加地址' }}
            </view>
        </view>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import UModal from '@/components/uview-ui/components/u-modal/u-modal.vue'
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
import { getAddressLists, delAddress, setDefaultAddress } from '@/api/user'
import wechath5 from '@/utils/wechath5'
import { isWeixinClient } from '@/utils/tools'
export default {
	components: {
		Navbar,
		UModal
	},
    data() {
        return {
            addressList: [],
            hasAddress: true,
            deleteSure: false,
            currentId: 0,
            isWeixin: true
        }
    },

    props: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.type = options.type
        //#ifdef H5
        this.isWeixin = isWeixinClient()
        //#endif
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getAddressListsFun()
    },

    methods: {
        onSelect(e) {
            if (this.type) {
                let { id } = e.currentTarget.dataset
                uni.$emit('selectaddress', {
                    id
                })
                uni.navigateBack()
            }
        },

        addAddress() {
            uni.navigateTo({
                url: '/bundle/pages/address_edit/address_edit'
            })
        },

        editAddress(id) {
            uni.navigateTo({
                url: `/bundle/pages/address_edit/address_edit?id=${id}`
            })
        },

        getAddressListsFun() {
            getAddressLists().then((res) => {
                if (res.code == 1) {
                    if (res.data.length) {
                        this.addressList = res.data
                        this.hasAddress = true
                    } else {
                        this.hasAddress = false
                    }
                } else {
                    this.hasAddress = false
                }
            })
        },

        radioChange(e) {
            let id = e.detail.value
            console.log(e)
            setDefaultAddress(id).then((res) => {
                if (res.code == 1) this.getAddressListsFun()
            })
        },

        onLoadFun() {
            this.getAddressListsFun()
        },

        delAddressFun(e) {
            let id = this.currentId
            delAddress(id).then((res) => {
                if (res.code == 1) {
                    this.$toast({
                        title: res.msg
                    })
                    this.deleteSure = false
                    this.getAddressListsFun()
                }
            })
        },

        getWxAddressFun() {
            // #ifdef H5
            wechath5.getWxAddress().then((res) => {
                uni.setStorageSync('wxAddress', JSON.stringify(res))
                setTimeout(() => {
                    uni.navigateTo({
                        url: `/bundle/pages/address_edit/address_edit`
                    })
                }, 200)
            })
            // #endif
            // #ifdef MP-WEIXIN
            uni.authorize({
                scope: 'scope.address',
                success: function (res) {
                    uni.chooseAddress({
                        success: function (res) {
                            uni.setStorageSync('wxAddress', JSON.stringify(res))
                            setTimeout(() => {
                                uni.navigateTo({
                                    url: `/bundle/pages/address_edit/address_edit`
                                })
                            }, 200)
                        },
                        fail: function (res) {
                            if (res.errMsg == 'chooseAddress:cancel')
                                return this.$toast({
                                    title: '取消选择'
                                })
                        }
                    })
                },
                fail: function (res) {
                    uni.showModal({
                        title: '您已拒绝导入微信地址权限',
                        content: '是否进入权限管理，调整授权？',

                        success(res) {
                            if (res.confirm) {
                                uni.openSetting({
                                    success: function (res) {}
                                })
                            } else if (res.cancel) {
                                return this.$toast({
                                    title: '已取消！'
                                })
                            }
                        }
                    })
                }
            })
            // #endif
        },

        showSurePop: function (e) {
            this.deleteSure = true
            this.currentId = e.currentTarget.dataset.id
        },
        hidePop: function (e) {
            this.deleteSure = false
        }
    }
}
</script>
<style lang="scss">
.user-address {
    min-height: 100vh;
    padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
    background: #f7f8fa;


    .address-body {
        min-height: calc(100vh - 220rpx);
    }

    .address-list {
        padding: 24rpx 24rpx 0;
    }

    .address-card {
        overflow: hidden;
        margin-bottom: 24rpx;
        background: #ffffff;
        border-radius: 24rpx;
        box-shadow: 0 10rpx 30rpx rgba(31, 122, 244, 0.06);
    }

    .address-card__main {
        padding: 30rpx 28rpx 24rpx;
    }

    .address-card__header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        color: #222222;
    }

    .address-card__name {
        font-size: 34rpx;
        font-weight: 600;
    }

    .address-card__phone {
        margin-left: 18rpx;
        font-size: 28rpx;
    }

    .address-card__detail {
        font-size: 26rpx;
        line-height: 40rpx;
        color: #666666;
    }

    .address-card__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24rpx 28rpx;
        border-top: 1rpx solid #f1f2f5;
    }

    .default-wrap {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #222222;
    }

    .address-card__actions {
        display: flex;
        align-items: center;
    }

    .action-item {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #222222;

        text {
            margin-left: 8rpx;
        }

        & + .action-item {
            margin-left: 28rpx;
        }
    }

    .action-item--danger {
        color: #909399;
    }

    .empty-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 360rpx);
        padding-bottom: 120rpx;
        box-sizing: border-box;
    }

    .address-empty__image {
        width: 320rpx;
        height: 260rpx;
    }

    .address-empty__text {
        margin-top: 22rpx;
        color: #666666;
        font-size: 28rpx;
        font-weight: 500;
        line-height: 36rpx;
    }

    .footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
        background: #f7f8fa;
    }

    .footer__ghost,
    .footer__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 88rpx;
        border-radius: 44rpx;
        font-size: 32rpx;
        font-weight: 600;
    }

    .footer__ghost {
        flex: 1;
        margin-right: 20rpx;
        color: #1f7af4;
        background: #ffffff;
    }

    .footer__btn {
        flex: 1;
        color: #ffffff;
        background: #1f7af4;
        box-shadow: 0 14rpx 30rpx rgba(31, 122, 244, 0.18);
    }
}

.tips-dialog {
    padding: 48rpx 0 24rpx;
    text-align: center;
    font-size: 30rpx;
    color: #222222;
}
</style>
