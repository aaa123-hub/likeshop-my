<template>
    <view class="address-edit">
        <navbar :title="pageTitle"></navbar>
        <form @submit="formSubmit" report-submit="true">
            <view class="form-card">
                <view class="form-row">
                    <view class="form-row__label">姓名</view>
                    <input
                        v-model="addressObj.contact"
                        name="contact"
                        class="form-row__input"
                        type="text"
                        placeholder="请输入姓名"
                    />
                    <view class="gender-group">
                        <view
                            :class="['gender-item', gender === '先生' ? 'gender-item--active' : '']"
                            @tap="gender = '先生'"
                        >
                            <u-icon
                                :name="gender === '先生' ? 'checkmark-circle-fill' : 'checkmark-circle'"
                                :color="gender === '先生' ? '#1F7AF4' : '#d4d7de'"
                                size="42"
                            ></u-icon>
                            <text>先生</text>
                        </view>
                        <view
                            :class="['gender-item', gender === '女士' ? 'gender-item--active' : '']"
                            @tap="gender = '女士'"
                        >
                            <u-icon
                                :name="gender === '女士' ? 'checkmark-circle-fill' : 'checkmark-circle'"
                                :color="gender === '女士' ? '#1F7AF4' : '#d4d7de'"
                                size="42"
                            ></u-icon>
                            <text>女士</text>
                        </view>
                    </view>
                </view>
                <view class="form-row">
                    <view class="form-row__label">联系电话</view>
                    <input
                        name="telephone"
                        v-model="addressObj.telephone"
                        class="form-row__input"
                        type="number"
                        maxlength="11"
                        placeholder="请输入电话"
                    />
                </view>
                <view class="form-row" @click="showRegion = true">
                    <view class="form-row__label">所在地址</view>
                    <input
                        name="region"
                        v-model="region"
                        class="form-row__input"
                        disabled
                        type="text"
                        placeholder="请选择省市区"
                    />
                    <u-icon name="arrow-right" color="#222222" size="28"></u-icon>
                </view>
                <view class="form-row form-row--textarea">
                    <view class="form-row__label">详细地址</view>
                    <textarea
                        v-model="addressObj.address"
                        name="address"
                        class="detail-textarea"
                        placeholder="请选择详细地址"
                        auto-height
                    />
                </view>
            </view>
            <view class="default-card">
                <view class="default-card__label">设置为默认地址</view>
                <u-switch
                    v-model="isDefaultSwitch"
                    active-color="#1F7AF4"
                    inactive-color="#d2d4da"
                    @change="onSwitchChange"
                ></u-switch>
            </view>
            <button class="submit-btn" form-type="submit">
                {{ addressId ? '保存' : '保存' }}
            </button>
        </form>
        <u-select
            v-model="showRegion"
            mode="mutil-column-auto"
            @confirm="regionChange"
            :list="lists"
        ></u-select>
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
import { editAddress, getOneAddress, hasRegionCode, addAddress } from '@/api/user'
import area from '@/utils/area'
export default {
    data() {
        return {
            addressObj: {
                contact: '',
                telephone: '',
                province: '',
                city: '',
                district: '',
                address: '',
                is_default: 0
            },
            region: '',
            addressId: '',
            defaultRegion: ['广东省', '广州市', '番禺区'],
            defaultRegionCode: '440113',
            showRegion: false,
            lists: [],
            gender: '先生'
        }
    },
    props: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.addressId = parseInt(options.id)
        if (options.id) {
            uni.setNavigationBarTitle({
                title: '编辑地址'
            })
            this.getOneAddressFun()
        } else {
            uni.setNavigationBarTitle({
                title: '添加地址'
            })
            this.getWxAddressFun()
        }
        this.$nextTick(() => {
            this.lists = area
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        uni.removeStorageSync('wxAddress')
    },

    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {},
    methods: {
        onSwitchChange(value) {
            this.addressObj.is_default = value ? 1 : 0
        },
        formSubmit(e) {
            let { value } = e.detail
            let {
                addressObj: { province_id, city_id, district_id, is_default, address },
                addressId
            } = this
            value.address = address
            if (!value.contact)
                return this.$toast({
                    title: '请填写收货人姓名'
                })
            if (!value.telephone)
                return this.$toast({
                    title: '请填写手机号码'
                })
            if (!/^1\d{10}$/.test(String(value.telephone)))
                return this.$toast({
                    title: '请输入正确的11位手机号'
                })
            if (!value.region)
                return this.$toast({
                    title: '请选择省、市、区'
                })
            if (!value.address)
                return this.$toast({
                    title: '请填写小区、街道、门牌号等信息'
                })
            value.province_id = parseInt(province_id)
            value.city_id = parseInt(city_id)
            value.district_id = parseInt(district_id)
            value.is_default = is_default
            value.id = addressId
            delete value.region

            if (addressId) {
                editAddress(value)
                    .then((res) => {
                        if (res.code == 1) {
                            this.$toast(
                                {
                                    title: res.msg
                                },
                                {
                                    tab: 3,
                                    url: 1
                                }
                            )
                        } else {
                            this.$toast({ title: res.msg || '保存失败' })
                        }
                    })
                    .catch((err) => {
                        return this.$toast({
                            title: err?.msg || err?.message || '保存失败'
                        })
                    })
            } else {
                addAddress(value)
                    .then((res) => {
                        if (res.code == 1) {
                            this.$toast(
                                {
                                    title: res.msg || '添加成功'
                                },
                                {
                                    tab: 3,
                                    url: 1
                                }
                            )
                        } else {
                            this.$toast({ title: res.msg || '添加失败' })
                        }
                    })
                    .catch((err) => {
                        return this.$toast({
                            title: err?.msg || err?.message || '添加失败'
                        })
                    })
            }
        },
        regionChange(region) {
            this.addressObj.province_id = region[0].value
            this.addressObj.city_id = region[1].value
            this.addressObj.district_id = region[2].value
            this.region = region[0].label + ' ' + region[1].label + ' ' + region[2].label
        },

        ChangeIsDefault: function (e) {
            if (this.addressObj.is_default == 0) {
                this.addressObj.is_default = 1
            } else {
                this.addressObj.is_default = 0
            }
        },

        textareaChange: function (e) {
            this.addressObj.address = e.detail.value
        },

        getOneAddressFun() {
            getOneAddress(this.addressId).then((res) => {
                if (res.code == 1) {
                    let { city, province, district } = res.data
                    this.addressObj = res.data
                    this.gender = '先生'
                    this.region = `${province} ${city} ${district}`
                }
            })
        },

        getWxAddressFun() {
            let wxAddress = uni.getStorageSync('wxAddress')
            if (!wxAddress) return
            wxAddress = JSON.parse(wxAddress)
            let {
                userName: contact,
                telNumber: telephone,
                provinceName: province,
                cityName: city,
                detailInfo: address
            } = wxAddress
            let district = wxAddress.countryName || wxAddress.countyName
            hasRegionCode({
                province,
                city,
                district
            }).then((res) => {
                if (res.code == 1) {
                    if (res.data.province && res.data.city && res.data.district) {
                        this.addressObj.province_id = res.data.province
                        this.addressObj.city_id = res.data.city
                        this.addressObj.district_id = res.data.district
                        this.region = `${province} ${city} ${district}`
                    }
                    this.addressObj.contact = contact
                    this.addressObj.telephone = telephone
                    this.addressObj.address = address
                }
            })
        }
    },
    computed: {
        isDefaultSwitch: {
            get() {
                return Boolean(this.addressObj.is_default)
            },
            set(value) {
                this.addressObj.is_default = value ? 1 : 0
            }
        },
        pageTitle() {
            return this.addressId ? '编辑地址' : '添加地址'
        }
    }
}
</script>
<style lang="scss">
.address-edit {
    min-height: 100vh;
    padding: 0 24rpx calc(180rpx + env(safe-area-inset-bottom));
    background: #f7f8fa;

    .form-card,
    .default-card {
        background: #ffffff;
        border-radius: 24rpx;
        overflow: hidden;
    }

    .form-card {
        margin-top: 26rpx;
    }

    .form-row {
        display: flex;
        align-items: center;
        min-height: 96rpx;
        padding: 0 28rpx;

        & + .form-row {
            border-top: 1rpx solid #eef0f3;
        }
    }

    .form-row--textarea {
        align-items: flex-start;
        min-height: 320rpx;
        padding-top: 26rpx;
    }

    .form-row__label {
        flex: none;
        width: 150rpx;
        font-size: 32rpx;
        font-weight: 600;
        color: #222222;
    }

    .form-row__input {
        flex: 1;
        height: 96rpx;
        font-size: 32rpx;
        color: #222222;
    }

    .gender-group {
        display: flex;
        align-items: center;
        margin-left: 12rpx;
    }

    .gender-item {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        color: #222222;

        text {
            margin-left: 8rpx;
        }

        & + .gender-item {
            margin-left: 32rpx;
        }
    }

    .detail-textarea {
        flex: 1;
        min-height: 220rpx;
        font-size: 32rpx;
        line-height: 44rpx;
        color: #222222;
        padding-top: 0;
    }

    .default-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 24rpx;
        padding: 0 28rpx;
        height: 112rpx;
    }

    .default-card__label {
        font-size: 32rpx;
        font-weight: 600;
        color: #222222;
    }

    .submit-btn {
        position: fixed;
        left: 84rpx;
        right: 84rpx;
        bottom: calc(56rpx + env(safe-area-inset-bottom));
        display: flex;
        align-items: center;
        justify-content: center;
        height: 88rpx;
        color: #ffffff;
        font-size: 32rpx;
        font-weight: 600;
        background: #1f7af4;
        border-radius: 44rpx;
        box-shadow: 0 14rpx 30rpx rgba(31, 122, 244, 0.18);
    }
}
</style>
