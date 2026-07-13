<template>
    <view class="user-address">
        <view class="address-list-nav">
            <view class="address-list-nav__back" @tap="goBack">
                <view class="address-list-nav__arrow"></view>
            </view>
            <view class="address-list-nav__title">添加地址</view>
            <view class="address-list-nav__capsule">
                <view class="address-list-nav__dot"></view>
                <view class="address-list-nav__divider"></view>
                <view class="address-list-nav__circle"></view>
            </view>
        </view>
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
                                <view v-if="item.gender" class="address-card__gender">{{ item.gender }}</view>
                                <view class="address-card__phone">{{ item.telephone }}</view>
                                <view v-if="item.is_default == '1'" class="address-card__default">默认</view>
                            </view>
                            <view class="address-card__detail">
                                {{ item.province }} {{ item.city }} {{ item.district }}
                                {{ item.address }}
                            </view>
                        </view>
                        <view class="address-card__footer">
                            <label class="default-wrap">
                                <radio
                                    color="#a0610d"
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
                    <image class="address-empty__image" :src="emptyAddressImage" mode="aspectFit"></image>
                    <view class="address-empty__text">暂无数据</view>
                </view>
            </template>
        </view>
        <u-modal
            v-model="deleteSure"
            :showCancelButton="true"
            confirm-text="删除"
            confirm-color="#a0610d"
            :show-title="false"
            @confirm="delAddressFun"
            @cancel="hidePop"
        >
            <view class="tips-dialog">确认删除该地址吗？</view>
        </u-modal>
        <view class="footer">
            <!-- #ifdef H5 || MP-WEIXIN -->
            <view v-if="isWeixin" class="footer__ghost" @tap="getWxAddressFun">
                微信导入
            </view>
            <!-- #endif -->
            <view class="footer__btn" @tap="addAddress">
                {{ hasAddress ? '新增收货地址' : '+添加地址' }}
            </view>
        </view>
    </view>
</template>

<script>
import UModal from '@/bundle/components/uview-ui/components/u-modal/u-modal.vue'
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
import { getPlaceholderImage } from '@/utils/image-placeholder'
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
export default {
	components: {
			UModal,
			UIcon
		},
    data() {
        return {
            addressList: [],
            hasAddress: true,
            deleteSure: false,
            currentId: 0,
            isWeixin: true,
            emptyAddressImage: getPlaceholderImage('address')
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
        goBack() {
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
                return
            }
            uni.switchTab({ url: '/pages/user/user' })
        },
        onSelect(e) {
            if (this.type) {
                let { id } = e.currentTarget.dataset
                const current = this.addressList.find(item => String(item.id) === String(id)) || {}
                uni.$emit('selectaddress', {
                    id,
                    address: current
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
                    const list = Array.isArray(res.data) ? res.data : []
                    this.addressList = list
                    if (list.length) {
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
            this.addressList = this.addressList.map(item => ({
                ...item,
                is_default: String(item.id) === String(id) ? 1 : 0,
                isDefault: String(item.id) === String(id) ? 1 : 0
            }))
            const current = this.addressList.find(item => String(item.id) === String(id)) || {}
            setDefaultAddress(id, current).then((res) => {
                if (res.code == 1) {
                    this.getAddressListsFun()
                    return
                }
                this.$toast({ title: res.msg || '设置默认地址失败' })
                this.getAddressListsFun()
            }).catch((err) => {
                this.$toast({ title: err?.msg || err?.message || '设置默认地址失败' })
                this.getAddressListsFun()
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
                success: () => {
                    uni.chooseAddress({
                        success: (res) => {
                            uni.setStorageSync('wxAddress', JSON.stringify(res))
                            setTimeout(() => {
                                uni.navigateTo({
                                    url: `/bundle/pages/address_edit/address_edit`
                                })
                            }, 200)
                        },
                        fail: (res) => {
                            if (res.errMsg == 'chooseAddress:cancel')
                                return this.$toast({
                                    title: '取消选择'
                                })
                        }
                    })
                },
                fail: () => {
                    uni.showModal({
                        title: '您已拒绝导入微信地址权限',
                        content: '是否进入权限管理，调整授权？',

                        success: (res) => {
                            if (res.confirm) {
                                uni.openSetting({
                                    success: () => {}
                                })
                            } else if (res.cancel) {
                                return this.$toast({
                                    title: '已取消'
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
    position: relative;
    min-height: 100vh;
    padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
    overflow-x: hidden;
    background: linear-gradient(180deg, #fff7eb 0%, #fff8ef 46%, #fffdf8 100%);

    &::before {
        content: '';
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        z-index: 0;
        height: 430rpx;
        background:
            radial-gradient(circle at 16% 8%, rgba(255, 232, 186, 0.82) 0, rgba(255, 232, 186, 0) 170rpx),
            linear-gradient(180deg, #fff0d4 0%, rgba(255, 248, 239, 0) 100%);
        pointer-events: none;
    }

    .address-body {
        position: relative;
        z-index: 1;
        min-height: calc(100vh - 220rpx);
    }

    .address-list-nav {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        height: calc(var(--status-bar-height) + 124rpx);
        padding: calc(var(--status-bar-height) + 45rpx) 24rpx 0;
        box-sizing: border-box;
    }

    .address-list-nav__back {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 72rpx;
        height: 64rpx;
    }

    .address-list-nav__arrow {
        width: 18rpx;
        height: 18rpx;
        margin-left: 3rpx;
        border-left: 3rpx solid #222222;
        border-bottom: 3rpx solid #222222;
        transform: rotate(45deg);
    }

    .address-list-nav__title {
        position: absolute;
        left: 50%;
        top: calc(var(--status-bar-height) + 62rpx);
        transform: translateX(-50%);
        color: #222222;
        font-size: 36rpx;
        font-weight: 500;
        line-height: 36rpx;
        white-space: nowrap;
    }

    .address-list-nav__capsule {
        position: absolute;
        right: 24rpx;
        top: calc(var(--status-bar-height) + 45rpx);
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 168rpx;
        height: 64rpx;
        padding: 0 25rpx;
        box-sizing: border-box;
        border: 1rpx solid transparent;
        border-radius: 32rpx;
        background: transparent;
    }

    .address-list-nav__dot {
        width: 9rpx;
        height: 9rpx;
        border-radius: 50%;
        background: #222222;
        box-shadow: 20rpx 0 0 #222222, 40rpx 0 0 #222222;
    }

    .address-list-nav__divider {
        width: 1rpx;
        height: 34rpx;
        margin-left: 36rpx;
        background: rgba(0, 0, 0, 0.12);
    }

    .address-list-nav__circle {
        width: 30rpx;
        height: 30rpx;
        border: 3rpx solid #222222;
        border-radius: 50%;
        box-sizing: border-box;
    }

    .address-list {
        padding: 21rpx 24rpx 0;
    }

    .address-card {
        overflow: hidden;
        margin-bottom: 24rpx;
        background: #fff9f0;
        border-radius: 15rpx;
        box-shadow: none;
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

    .address-card__gender,
    .address-card__default {
        margin-left: 12rpx;
        padding: 4rpx 12rpx;
        color: #a0610d;
        font-size: 22rpx;
        background: #fff2df;
        border-radius: 999rpx;
    }

    .address-card__default {
        color: #ffffff;
        background: #a0610d;
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
        min-height: calc(100vh - 360rpx);
        padding: 351rpx 0 120rpx;
        box-sizing: border-box;
    }

    .address-empty__image {
        width: 502rpx;
        height: 293rpx;
    }

    .address-empty__text {
        margin-top: 20rpx;
        color: #666666;
        font-size: 32rpx;
        font-weight: 500;
        line-height: 40rpx;
    }

    .footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        padding: 24rpx 84rpx calc(56rpx + env(safe-area-inset-bottom));
        background: linear-gradient(180deg, rgba(255, 253, 248, 0) 0%, #fffdf8 28%, #fffdf8 100%);
    }

    .footer__ghost,
    .footer__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 81rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        font-weight: 500;
    }

    .footer__ghost {
        flex: 1;
        margin-right: 20rpx;
        color: #a0610d;
        background: #fff9f0;
    }

    .footer__btn {
        flex: 1;
        color: #ffffff;
        background: linear-gradient(90deg, #d79a43 0%, #a0610d 100%);
        box-shadow: none;
    }
}

.tips-dialog {
    padding: 48rpx 0 24rpx;
    text-align: center;
    font-size: 30rpx;
    color: #222222;
}
</style>
