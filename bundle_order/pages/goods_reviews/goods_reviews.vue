<template>
    <view class="goods-reviews">
        <view class="review-hero">
            <view class="review-hero__title">评价晒图</view>
            <view class="review-hero__desc">真实评价能帮助其他用户，也能让商家持续改进服务。</view>
        </view>
        <view class="review-card review-card--goods">
            <order-goods :list="goods"></order-goods>
        </view>
        <view class="review-card score-card">
            <view class="score-card__head">
                <view class="score-card__title">评分</view>
                <view class="score-card__hint">轻点星星完成打分</view>
            </view>
            <view
                v-for="item in scoreRows"
                :key="item.key"
                class="score-row"
            >
                <view class="score-row__main">
                    <view class="score-row__label">{{ item.label }}</view>
                    <view :class="['score-row__desc', item.value <= 2 ? 'is-muted' : 'is-primary']">
                        {{ rateDesc(item.value) }}
                    </view>
                </view>
                <view class="score-stars" :aria-label="item.label">
                    <view
                        v-for="(star, starIndex) in 5"
                        :key="starIndex"
                        :class="['score-star', starIndex < item.value ? 'score-star--selected' : '']"
                        @tap.stop="setRate(item.key, starIndex + 1)"
                    >
                        <image class="score-star__icon" :src="starIcon" mode="aspectFit"></image>
                    </view>
                </view>
            </view>
        </view>
        <view class="goods-dec bg-white">
            <view class="review-section-head">
                <view class="title md bold">评价内容</view>
                <view class="review-count">{{ comment.length }}/500</view>
            </view>
            <view class="textarea mb20">
                <textarea
                    v-model="comment"
                    placeholder="商品体验怎么样？说说使用感受，帮助其他用户参考。"
                    maxlength="500"
                ></textarea>
            </view>
            <view class="upload-head">
                <view class="upload-title">上传图片</view>
                <view class="upload-tip">最多 5 张，可选</view>
            </view>
            <uploader
                preview-size="180rpx"
                :mutiple="true"
                :maxUpload="5"
                :file-list="fileList"
                @after-read="afterRead"
                :deletable="true"
                @delete="onDelete"
            />
            <view class="anonymous-row" @tap="anonymous = !anonymous">
                <view>
                    <view class="anonymous-title">匿名评价</view>
                    <view class="anonymous-desc">开启后将不展示你的昵称</view>
                </view>
                <view :class="['review-switch', anonymous ? 'is-active' : '']">
                    <view class="review-switch__thumb"></view>
                </view>
            </view>
        </view>
        <button form-type="submit" class="btn br60" type="primary" size="lg" @tap="onSubmit">
            立即评价
        </button>
    </view>
</template>

<script>
import Uploader from '@/bundle_order/components/uploader/uploader.vue'
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
import { goodsComment, getCommentInfo } from '@/api/user'
import { uploadFile } from '@/utils/tools.js'
import OrderGoods from '@/bundle_order/components/order-goods/order-goods.vue'
export default {
	components: {
			Uploader,
			OrderGoods
		},
    data() {
        return {
            goodsRate: 0,
            descRate: 0,
            serverRate: 0,
            deliveryRate: 0,
            goodsRateDesc: '',
            fileList: [],
            goods: [],
            comment: '',
            anonymous: false,
            type: '',
            starIcon: 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/slices/street/searchlist_star.png'
        }
    },
    computed: {
        scoreRows() {
            return [
                { key: 'goodsRate', label: '商品评分', value: Number(this.goodsRate || 0) },
                { key: 'descRate', label: '描述相符', value: Number(this.descRate || 0) },
                { key: 'serverRate', label: '服务态度', value: Number(this.serverRate || 0) },
                { key: 'deliveryRate', label: '配送服务', value: Number(this.deliveryRate || 0) }
            ]
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.id = options.id
        this.orderId = options.order_id || options.orderId || ''
        this.getCommentInfoFun()
    },

    methods: {
        onChange(e) {
            this.type = e.value
        },

        setRate(key, value) {
            if (!['goodsRate', 'descRate', 'serverRate', 'deliveryRate'].includes(key)) return
            this[key] = value
            if (key === 'goodsRate') this.goodsRateDesc = this.rateDesc(value)
        },
        rateDesc(value) {
            const score = Number(value || 0)
            if (!score) return '请选择'
            if (score === 1) return '有待提升'
            if (score === 2) return '基本符合'
            if (score === 3) return '体验不错'
            if (score === 4) return '比较满意'
            return '非常满意'
        },

        onSubmit() {
            let { goodsRate, fileList, comment, deliveryRate, descRate, serverRate } = this
            let image = fileList.map((item) => item.base_url || item.url).filter(Boolean)
            if (!goodsRate)
                return this.$toast({
                    title: '请对商品进行评分'
                })
            if (!descRate)
                return this.$toast({
                    title: '请对描述相符进行评分'
                })
            if (!serverRate)
                return this.$toast({
                    title: '请对服务态度进行评分'
                })
            if (!deliveryRate)
                return this.$toast({
                    title: '请对配送服务进行评分'
                })
            goodsComment({
                id: this.id,
                orderItemId: this.id,
                order_id: this.orderId,
                goods_comment: goodsRate,
                score: goodsRate,
                service_comment: serverRate,
                express_comment: deliveryRate,
                description_comment: descRate,
                comment,
                content: comment,
                is_anonymous: this.anonymous ? 1 : 0,
                anonymous: this.anonymous ? 1 : 0,
                image,
                imageUrls: image
            }).then((res) => {
                if (res.code == 1) {
                    this.$toast(
                        {
                            title: '评价成功'
                        },
                        {
                            tab: 5,
                            url: '/bundle_order/pages/goods_comment_list/goods_comment_list?type=1'
                        }
                    )
                }
            })
        },

        onInput(e) {
            this.comment = e.detail.value
        },

        getCommentInfoFun() {
            getCommentInfo({
                id: this.id
            }).then((res) => {
                if (res.code == 1) {
                    const data = res.data || {}
                    const goods = data.goods || data.product || data.sku || data
                    this.goods = Object.keys(goods || {}).length ? [goods] : []
                } else {
                    this.goods = []
                }
            }).catch(() => {
                this.goods = []
            })
        },

        afterRead(e) {
            const file = Array.isArray(e) ? e : (Array.isArray(e && e.file) ? e.file : (Array.isArray(e && e.detail && e.detail.file) ? e.detail.file : []))
            if (!file.length) return
            uni.showLoading({
                title: '正在上传中...',
                mask: true
            })
            let finished = 0
            file.forEach((item) => {
                uploadFile(item.path)
                    .then((res) => {
                        this.fileList.push(res)
                    })
                    .catch(() => {
                        this.$toast({
                            title: '上传失败'
                        })
                    })
                    .finally(() => {
                        finished += 1
                        if (finished >= file.length) uni.hideLoading()
                    })
            })
        },

        onDelete(event) {
            const index = typeof event === 'number' ? event : (event && event.index !== undefined ? event.index : (event && event.detail ? event.detail.index : undefined))
            if (index === undefined || index === null) return
            this.fileList.splice(Number(index), 1)
        }
    }
}
</script>
<style lang="scss">
.goods-reviews {
    min-height: 100vh;
    padding: 24rpx 24rpx 48rpx;
    background: linear-gradient(180deg, #fff4f0 0%, #f7f8fb 300rpx, #f7f8fb 100%);
    box-sizing: border-box;
}
.review-hero {
    padding: 12rpx 4rpx 28rpx;
}
.review-hero__title {
    color: #1f2937;
    font-size: 42rpx;
    font-weight: 800;
    line-height: 52rpx;
}
.review-hero__desc {
    margin-top: 10rpx;
    color: #7a828e;
    font-size: 25rpx;
    line-height: 36rpx;
}
.review-card,
.goods-reviews .goods-dec {
    border-radius: 24rpx;
    background: #ffffff;
    box-shadow: 0 16rpx 38rpx rgba(24, 44, 84, .07);
    box-sizing: border-box;
}
.review-card--goods {
    overflow: hidden;
    margin-bottom: 20rpx;
}
.score-card {
    padding: 30rpx 28rpx 8rpx;
    margin-bottom: 20rpx;
}
.score-card__head,
.review-section-head,
.upload-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.score-card__title {
    color: #1f2937;
    font-size: 32rpx;
    font-weight: 800;
    line-height: 44rpx;
}
.score-card__hint,
.review-count,
.upload-tip {
    color: #98a2b3;
    font-size: 24rpx;
}
.score-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    min-height: 92rpx;
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f1f3f6;
}
.score-row:last-child {
    border-bottom: 0;
}
.score-row__main {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.score-row__label {
    flex: none;
    color: #344054;
    font-size: 27rpx;
    font-weight: 700;
    line-height: 36rpx;
}
.score-stars {
    flex: none;
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 0;
    border-radius: 999rpx;
    background: #ffffff;
}
.score-star {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46rpx;
    height: 46rpx;
    border-radius: 50%;
    opacity: .32;
    filter: grayscale(1);
    transition: opacity .16s ease, filter .16s ease, transform .16s ease;
}
.score-star__icon {
    width: 38rpx;
    height: 38rpx;
    display: block;
}
.score-star--selected {
    opacity: 1;
    filter: none;
    transform: scale(1.06);
}
.score-row__desc {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    min-width: 92rpx;
    height: 38rpx;
    padding: 0;
    border-radius: 999rpx;
    color: #667085;
    font-size: 22rpx;
    font-weight: 600;
    line-height: 38rpx;
    background: transparent;
    box-sizing: border-box;
}
.score-row__desc.is-muted {
    color: #98a2b3;
    background: transparent;
}
.score-row__desc.is-primary {
    color: #667085;
    background: transparent;
}
.goods-reviews .goods-dec {
    padding: 32rpx 30rpx;
}
.review-section-head {
    margin-bottom: 20rpx;
}
.goods-reviews .goods-dec .textarea {
    height: 240rpx;
    border-radius: 18rpx;
    background-color: #f6f8fb;
    border: 1rpx solid #edf1f6;
}
.goods-reviews .goods-dec .textarea textarea {
    width: 100%;
    height: 100%;
    padding: 20rpx;
    color: #222222;
    font-size: 28rpx;
    line-height: 40rpx;
    box-sizing: border-box;
}
.upload-head {
    margin: 28rpx 0 18rpx;
}
.upload-title,
.anonymous-title {
    color: #30343b;
    font-size: 27rpx;
    font-weight: 700;
}
.anonymous-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 30rpx;
    padding: 24rpx 0 2rpx;
    border-top: 1rpx solid #eef2f6;
}
.anonymous-desc {
    margin-top: 8rpx;
    color: #98a2b3;
    font-size: 23rpx;
}
.review-switch {
    position: relative;
    width: 92rpx;
    height: 52rpx;
    border-radius: 999rpx;
    background: #d9dee7;
    transition: background .18s ease;
}
.review-switch.is-active {
    background: #ff6b3d;
}
.review-switch__thumb {
    position: absolute;
    left: 4rpx;
    top: 4rpx;
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 4rpx 12rpx rgba(16, 24, 40, .18);
    transition: transform .18s ease;
}
.review-switch.is-active .review-switch__thumb {
    transform: translateX(40rpx);
}
.goods-reviews .btn {
    width: 100%;
    height: 88rpx;
    margin: 36rpx 0 0;
    border-radius: 44rpx;
    background: linear-gradient(135deg, #ff6b3d 0%, #ff2c3c 100%);
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 88rpx;
}

@media screen and (max-width: 360px) {
    .score-row {
        align-items: flex-start;
        flex-direction: column;
        gap: 14rpx;
    }
    .score-stars {
        width: 100%;
        justify-content: space-between;
        box-sizing: border-box;
    }
}

</style>
