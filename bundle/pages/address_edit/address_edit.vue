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
                        placeholder-class="address-placeholder"
                    />
                    <view class="gender-group">
                        <view
                            :class="['gender-item', gender === '先生' ? 'gender-item--active' : '']"
                            @tap="gender = '先生'"
                        >
                            <view :class="['gender-radio', gender === '先生' ? 'gender-radio--active' : '']">
                                <view v-if="gender === '先生'" class="gender-radio__mark"></view>
                            </view>
                            <text>先生</text>
                        </view>
                        <view
                            :class="['gender-item', gender === '女士' ? 'gender-item--active' : '']"
                            @tap="gender = '女士'"
                        >
                            <view :class="['gender-radio', gender === '女士' ? 'gender-radio--active' : '']">
                                <view v-if="gender === '女士'" class="gender-radio__mark"></view>
                            </view>
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
                        type="text"
                        maxlength="20"
                        placeholder="请输入手机号或座机"
                        placeholder-class="address-placeholder"
                    />
                </view>
                <view class="form-row" @tap="openRegionPicker">
                    <view class="form-row__label">所在地址</view>
                    <input
                        name="region"
                        v-model="region"
                        class="form-row__input"
                        disabled
                        type="text"
                        placeholder="请选择省市区"
                        placeholder-class="address-placeholder"
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
                        placeholder-class="address-placeholder"
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
            :z-index="10090"
            title="请选择省市区"
            :safe-area-inset-bottom="true"
        ></u-select>
    </view>
</template>

<script>
import Navbar from '@/components/navbar/navbar.vue'
import USelect from '@/bundle/components/uview-ui/components/u-select/u-select.vue'
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
import UIcon from '@/bundle/components/uview-ui/components/u-icon/u-icon.vue'
import USwitch from '@/bundle/components/uview-ui/components/u-switch/u-switch.vue'
export default {
	components: {
			Navbar,
			USelect,
			UIcon,
			USwitch
		},
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
            lists: area,
            gender: '先生'
        }
    },
    props: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.addressId = options.id || options.addressId || ''
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
        openRegionPicker() {
            if (!this.lists.length) {
                this.lists = area
            }
            this.showRegion = true
        },
        onSwitchChange(value) {
            this.addressObj.is_default = value ? 1 : 0
        },
        isValidPhone(value) {
            const phone = String(value || '').replace(/\s/g, '')
            return /^1\d{10}$/.test(phone) || /^0\d{2,3}-?\d{7,8}$/.test(phone) || /^\d{7,8}$/.test(phone)
        },
        formSubmit(e) {
            let { value } = e.detail
            let {
                addressObj: { province_id, city_id, district_id, is_default, address },
                addressId
            } = this
            value.address = address
            value.region = this.region
            value.telephone = String(value.telephone || '').trim()
            if (!value.contact)
                return this.$toast({
                    title: '请填写收货人姓名'
                })
            if (!value.telephone)
                return this.$toast({
                    title: '请填写手机号码'
                })
            if (!this.isValidPhone(value.telephone))
                return this.$toast({
                    title: '请输入正确的手机号或座机号'
                })
            if (!value.region || !province_id || !city_id || !district_id)
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
            value.gender = this.gender
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
            if (!Array.isArray(region) || region.length < 3 || !region[0] || !region[1] || !region[2]) {
                this.$toast({ title: '请选择完整省市区' })
                return
            }
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
                    const data = res.data || {}
                    let { city, province, district } = data
                    this.addressObj = Object.assign({}, this.addressObj, data, {
                        id: data.id || data.addressId || this.addressId,
                        is_default: data.is_default || data.isDefault ? 1 : 0
                    })
                    this.gender = data.gender || '先生'
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
                    const data = res.data || {}
                    if (data.province && data.city && data.district) {
                        this.addressObj.province_id = data.province
                        this.addressObj.city_id = data.city
                        this.addressObj.district_id = data.district
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
    background: #edf6ff;

    .form-card,
    .default-card {
        background: #ffffff;
        border-radius: 15rpx;
        overflow: hidden;
    }

    .form-card {
        margin-top: 24rpx;
        min-height: 619rpx;
    }

    .form-row {
        display: flex;
        align-items: center;
        min-height: 100rpx;
        padding: 0 29rpx;

        & + .form-row {
            border-top: 1rpx solid #f0f0f0;
        }
    }

    .form-row--textarea {
        align-items: flex-start;
        min-height: 318rpx;
        padding-top: 31rpx;
    }

    .form-row__label {
        flex: none;
        width: 150rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #222222;
    }

    .form-row__input {
        flex: 1;
        min-width: 0;
        height: 100rpx;
        font-size: 28rpx;
        color: #222222;
    }

    .form-row__input::placeholder,
    .detail-textarea::placeholder {
        color: #c9c9c9;
    }

    .gender-group {
        flex: none;
        display: flex;
        align-items: center;
        margin-left: 24rpx;
    }

    .gender-item {
        display: flex;
        align-items: center;
        padding: 0;
        border: 0;
        font-size: 24rpx;
        font-weight: 500;
        color: #222222;

        &.gender-item--active {
            color: #1f7af4;
        }

        text {
            margin-left: 8rpx;
        }

        & + .gender-item {
            margin-left: 38rpx;
        }
    }

    .gender-radio {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30rpx;
        height: 30rpx;
        border-radius: 50%;
        border: 2rpx solid #c9c9c9;
        background: #ffffff;
        box-sizing: border-box;
    }

    .gender-radio--active {
        border-color: #037dfa;
        background: #037dfa;
    }

    .gender-radio__mark {
        width: 14rpx;
        height: 8rpx;
        border-left: 3rpx solid #ffffff;
        border-bottom: 3rpx solid #ffffff;
        transform: rotate(-45deg) translate(1rpx, -1rpx);
    }

    .detail-textarea {
        flex: 1;
        min-height: 220rpx;
        font-size: 28rpx;
        line-height: 44rpx;
        color: #222222;
        padding-top: 0;
    }

    .default-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 24rpx;
        padding: 0 29rpx;
        height: 115rpx;
    }

    .default-card__label {
        font-size: 28rpx;
        font-weight: 500;
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
        height: 81rpx;
        color: #ffffff;
        font-size: 28rpx;
        font-weight: 500;
        background: #037dfa;
        border-radius: 40rpx;
        box-shadow: none;
    }

    .submit-btn::after {
        border: 0;
    }
}
</style>
