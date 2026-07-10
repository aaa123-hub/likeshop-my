<template>
    <view class="comments-page">
        <view class="all_comments">
            <view class="header" v-if="!isEmpty">
                <view class="summary-card">
                    <view class="summary-main">
                        <view class="summary-card__label">商品评价</view>
                        <view class="summary-card__sub">共 {{ formatCount(totalCount || commentList.length) }} 条</view>
                    </view>
                    <view class="summary-rate" v-if="percent">
                        <view class="summary-card__percent">{{ formatPercent(percent) }}</view>
                        <view class="summary-rate__label">好评率</view>
                    </view>
                </view>
                <scroll-view v-if="categoryList.length" scroll-x class="tab-scroll">
                    <view class="tab">
                    <block v-for="(item, index) in categoryList" :key="index">
                        <view
                            :class="['tab-item', type == item.id ? 'is-active' : '']"
                            :key="index"
                            :data-id="item.id"
                            @tap="onChangType"
                            v-if="item.count"
                        >
                            {{ item.name }}({{ item.count }})
                        </view>
                    </block>
                    </view>
                </scroll-view>
            </view>
            <view class="main">
                <view class="evaluation-list">
                    <view v-for="(item, index) in commentList" :key="index" class="evaluation-item">
                        <view class="user-info">
                            <view :class="['avatar-wrap', item.is_anonymous ? 'is-anonymous' : '']">
                                <image v-if="!item.is_anonymous && item.avatar" class="avatar" :src="item.avatar" mode="aspectFill"></image>
                                <text v-else class="avatar-text">匿</text>
                            </view>
                            <view class="user-main">
                                <view class="user-row">
                                    <view class="user-name line1">{{ displayNickname(item) }}</view>
                                    <view v-if="item.is_anonymous" class="anonymous-tag">匿名</view>
                                </view>
                                <view class="user-sub-row">
                                    <view class="rate-row">
                                        <text
                                            v-for="star in 5"
                                            :key="star"
                                            :class="['comment-star', star <= displayScore(item) ? 'is-active' : '']"
                                        >★</text>
                                    </view>
                                    <text class="score-label">{{ displayScore(item) }}分</text>
                                </view>
                            </view>
                        </view>
                        <view class="meta-row" v-if="item.create_time || displaySpecText(item)">
                            <text>{{ item.create_time || '刚刚' }}</text>
                            <text v-if="displaySpecText(item)">{{ displaySpecText(item) }}</text>
                        </view>
                        <view class="tag-row" v-if="item.tags && item.tags.length">
                            <text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="comment-tag">{{ tag }}</text>
                        </view>
                        <view v-if="item.comment" class="dec">{{ item.comment }}</view>
                        <view v-else class="dec dec--empty">用户未填写文字评价</view>
                        <view class="img-grid" v-if="item.image && item.image.length">
                            <view
                                v-for="(imgitem, imgindex) in item.image"
                                :key="imgindex"
                                class="img-item"
                                :data-current="imgitem"
                                :data-uri="item.image"
                                @tap="previewImage"
                            >
                                <custom-image
                                    width="100%"
                                    fit="cover"
                                    height="100%"
                                    radius="16rpx"
                                    lazy-load
                                    class="goods-img"
                                    :src="imgitem"
                                />
                            </view>
                        </view>
                        <view class="append-box" v-if="item.append_comment || (item.append_image && item.append_image.length)">
                            <view class="append-title">
                                <text>追评</text>
                                <text v-if="item.append_time" class="append-time">{{ item.append_time }}</text>
                            </view>
                            <view class="append-content" v-if="item.append_comment">{{ item.append_comment }}</view>
                            <view class="img-grid img-grid--small" v-if="item.append_image && item.append_image.length">
                                <view
                                    v-for="(imgitem, imgindex) in item.append_image"
                                    :key="imgindex"
                                    class="img-item"
                                    :data-current="imgitem"
                                    :data-uri="item.append_image"
                                    @tap="previewImage"
                                >
                                    <custom-image width="100%" fit="cover" height="100%" radius="14rpx" lazy-load :src="imgitem" />
                                </view>
                            </view>
                        </view>
                        <view class="score-detail" v-if="hasScoreDetail(item)">
                            <view v-if="item.description_comment" class="score-detail__item">
                                <text>描述相符</text>
                                <text class="score-detail__value">{{ item.description_comment }}分</text>
                            </view>
                            <view v-if="item.service_comment" class="score-detail__item">
                                <text>服务态度</text>
                                <text class="score-detail__value">{{ item.service_comment }}分</text>
                            </view>
                            <view v-if="item.express_comment" class="score-detail__item">
                                <text>配送服务</text>
                                <text class="score-detail__value">{{ item.express_comment }}分</text>
                            </view>
                        </view>
                        <view class="seller-recall-container" v-if="item.reply">
                            <view class="seller-recall-title">{{ item.reply_user || '商家回复' }}</view>
                            <view class="seller-recall-text">{{ item.reply }}</view>
                            <view class="seller-recall-time" v-if="item.reply_time">{{ item.reply_time }}</view>
                        </view>
                        <view class="comment-footer" v-if="hasFooterMeta(item)">
                            <text v-if="item.like_count">赞 {{ formatCount(item.like_count) }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <loading-footer :status="status" slotEmpty>
            <view slot="empty" class="column-center" style="padding-top: 200rpx">
                <text class="lighter">暂无评价</text>
            </view>
        </loading-footer>
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
import { getCommentList } from '../../../api/store'
import { loadingType } from '../../../utils/type'
import CustomImage from '@/components/custom-image/custom-image.vue'
import LoadingFooter from '@/components/loading-footer/loading-footer.vue'

export default {
    data() {
        return {
            status: loadingType.LOADING,
            page: 1,
            type: '',
            commentList: [],
            categoryList: [],
            percent: '',
            totalCount: 0,
            isEmpty: true,
            isLoading: false
        }
    },

    components: {
			CustomImage,
			LoadingFooter
		},
    props: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.id = options.id
        this.getCommentListFun()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.reloadComments()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.getCommentListFun()
    },

    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {},
    methods: {
        onChangType(e) {
            let { id } = e.currentTarget.dataset
            let { type } = this
            if (id == type) return
            this.type = id
            this.page = 1
            this.commentList = []
            this.status = loadingType.LOADING
            this.$nextTick(() => this.getCommentListFun())
        },

        getCommentListFun() {
            let { page, status, commentList, type } = this
            if (this.isLoading || status == loadingType.FINISHED) return
            this.isLoading = true
            getCommentList({
                id: type,
                goods_id: this.id,
                page_no: page
            }).then((res) => {
                if (res.code == 1) {
                    let { list, more, total, percent, comment } = res.data
                    if (page === 1) {
                        this.categoryList = this.normalizeCategoryList(comment || [])
                    }
                    commentList.push(...list)
                    this.commentList = commentList
                    this.totalCount = total || this.totalCount
                    this.percent = percent || this.percent
                    this.page++
                    this.$nextTick(() => {
                        if (!more) {
                            this.status = loadingType.FINISHED
                        }

                        if (commentList.length <= 0) {
                            this.status = loadingType.EMPTY
                        } else {
                            this.isEmpty = false
                        }
                    })
                }
            }).finally(() => {
                this.isLoading = false
                uni.stopPullDownRefresh()
            })
        },

        reloadComments() {
            this.page = 1
            this.commentList = []
            this.isEmpty = true
            this.status = loadingType.LOADING
            this.getCommentListFun()
        },

        hasScoreDetail(item = {}) {
            return Boolean(item.description_comment || item.service_comment || item.express_comment)
        },

        hasFooterMeta(item = {}) {
            return Boolean(item.like_count)
        },

        normalizeCategoryList(list = []) {
            return list
                .filter((item) => item && item.count !== 0)
                .map((item) => ({
                    ...item,
                    name: item.name || item.title || item.label || '评价',
                    id: item.id !== undefined && item.id !== null ? item.id : (item.type !== undefined && item.type !== null ? item.type : (item.value !== undefined && item.value !== null ? item.value : ''))
                }))
        },

        displayNickname(item = {}) {
            return item.is_anonymous ? '匿名用户' : (item.nickname || '匿名用户')
        },

        displayScore(item = {}) {
            const score = Number(item.goods_comment || item.goods_rate || item.score || 5)
            if (!score || score < 1) return 5
            return Math.max(1, Math.min(5, Math.round(score)))
        },

        displaySpecText(item = {}) {
            const text = String(item.spec_value_str || '').trim()
            if (!text || /^\d+$/.test(text)) return ''
            return text
        },

        formatCount(value) {
            const number = Number(value)
            if (!number) return value || 0
            if (number >= 10000) return (number / 10000).toFixed(number >= 100000 ? 0 : 1).replace(/\.0$/, '') + '万'
            return number
        },

        formatPercent(value) {
            if (value === undefined || value === null || value === '') return ''
            const text = String(value)
            return text.includes('%') ? text : text + '%'
        },

        previewImage(e) {
            const { current, uri } = e.currentTarget.dataset
            let urls = Array.isArray(uri) ? uri : String(uri || '').split(',').filter(Boolean)
            uni.previewImage({
                current,
                // 当前显示图片的http链接
                urls // 需要预览的图片http链接列表
            })
        }
    }
}
</script>
<style lang="scss">
.comments-page {
    min-height: 100vh;
    padding: 18rpx 0 48rpx;
    background: #f7f7f7;
    box-sizing: border-box;
}

.all_comments {
    .header {
        padding: 0 24rpx;
        margin-bottom: 14rpx;
    }
}

.summary-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 26rpx 28rpx;
    border-radius: 18rpx;
    color: #1f2933;
    background: #ffffff;
    box-shadow: 0 8rpx 24rpx rgba(16, 24, 40, .04);
}

.summary-main {
    min-width: 0;
}

.summary-card__label {
    color: #111827;
    font-size: 34rpx;
    font-weight: 800;
    line-height: 44rpx;
}

.summary-card__percent {
    color: #ff5000;
    font-size: 40rpx;
    font-weight: 800;
    line-height: 46rpx;
}

.summary-card__sub {
    margin-top: 4rpx;
    color: #7b8794;
    font-size: 24rpx;
    line-height: 34rpx;
}

.summary-rate {
    flex: none;
    margin-left: 24rpx;
    text-align: right;
}

.summary-rate__label {
    margin-top: 2rpx;
    color: #8c8c8c;
    font-size: 22rpx;
    line-height: 30rpx;
}

.tab-scroll {
    margin-top: 16rpx;
    white-space: nowrap;
}

.tab {
    display: inline-flex;
    align-items: center;
    padding-bottom: 2rpx;
}

.tab-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 52rpx;
    margin-right: 12rpx;
    padding: 0 22rpx;
    border-radius: 999rpx;
    color: #606266;
    font-size: 24rpx;
    background: #f0f1f3;
}

.tab-item.is-active {
    color: #ff5000;
    font-weight: 700;
    background: #fff1e8;
}

.main {
    background: #ffffff;
}

.evaluation-item {
    padding: 28rpx 24rpx;
    margin-bottom: 0;
    border-radius: 0;
    border-bottom: 1rpx solid #f0f0f0;
    background: #ffffff;
    box-shadow: none;
    box-sizing: border-box;
}

.evaluation-item:last-child {
    border-bottom: none;
}

.user-info {
    display: flex;
    align-items: flex-start;
}

.avatar-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 68rpx;
    height: 68rpx;
    border-radius: 50%;
    background: #eef0f3;
    overflow: hidden;
}

.avatar-wrap.is-anonymous {
    color: #ffffff;
    background: linear-gradient(135deg, #9aa4b2 0%, #667085 100%);
}

.avatar {
    width: 68rpx;
    height: 68rpx;
}

.avatar-text {
    color: #ffffff;
    font-size: 27rpx;
    font-weight: 800;
}

.user-main {
    flex: 1;
    min-width: 0;
    margin-left: 18rpx;
}

.user-row,
.rate-row,
.user-sub-row,
.meta-row,
.tag-row,
.score-detail {
    display: flex;
    align-items: center;
}

.user-name {
    flex: 1;
    min-width: 0;
    color: #242424;
    font-size: 27rpx;
    font-weight: 700;
    line-height: 36rpx;
}

.anonymous-tag {
    flex: none;
    height: 32rpx;
    margin-left: 12rpx;
    padding: 0 12rpx;
    border-radius: 999rpx;
    color: #858b96;
    font-size: 21rpx;
    line-height: 32rpx;
    background: #f4f4f5;
}

.user-sub-row {
    flex-wrap: wrap;
    margin-top: 8rpx;
}

.rate-row {
    flex: none;
}

.comment-star {
    width: 24rpx;
    height: 24rpx;
    margin-right: 4rpx;
    color: #d7d9de;
    font-size: 24rpx;
    line-height: 24rpx;
}

.comment-star.is-active {
    color: #ffb000;
}

.score-label {
    margin-left: 10rpx;
    color: #8a8f99;
    font-size: 22rpx;
    line-height: 26rpx;
}

.meta-row {
    flex-wrap: wrap;
    gap: 10rpx 16rpx;
    margin-top: 16rpx;
    color: #8c8c8c;
    font-size: 23rpx;
    line-height: 32rpx;
}

.tag-row {
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 16rpx;
}

.comment-tag {
    max-width: 100%;
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    color: #ff5000;
    font-size: 22rpx;
    line-height: 28rpx;
    background: #fff3ea;
    box-sizing: border-box;
}

.dec {
    margin-top: 16rpx;
    color: #222222;
    font-size: 29rpx;
    line-height: 44rpx;
    word-break: break-all;
}

.dec--empty {
    color: #9a9a9a;
}

.img-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10rpx;
    margin-top: 18rpx;
    max-width: 520rpx;
}

.img-grid--small {
    margin-top: 14rpx;
    max-width: 420rpx;
}

.img-item {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f2f2f2;
}

.append-box,
.seller-recall-container {
    margin-top: 18rpx;
    padding: 18rpx 20rpx;
    border-radius: 14rpx;
    background: #f7f8fa;
}

.append-title,
.seller-recall-title {
    color: #333333;
    font-size: 24rpx;
    font-weight: 700;
    line-height: 32rpx;
}

.append-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
}

.append-time {
    flex: none;
    color: #999999;
    font-size: 22rpx;
    font-weight: 400;
}

.append-content,
.seller-recall-text {
    margin-top: 10rpx;
    color: #555555;
    font-size: 25rpx;
    line-height: 40rpx;
    word-break: break-all;
}

.seller-recall-time {
    margin-top: 8rpx;
    color: #9a9a9a;
    font-size: 22rpx;
    line-height: 30rpx;
}

.score-detail {
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 18rpx;
}

.score-detail__item {
    display: inline-flex;
    align-items: center;
    height: 46rpx;
    padding: 0 14rpx;
    border-radius: 10rpx;
    color: #777777;
    font-size: 22rpx;
    line-height: 46rpx;
    background: #fafafa;
}

.score-detail__value {
    margin-left: 8rpx;
    color: #ff5000;
    font-weight: 700;
}

.comment-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 18rpx;
    margin-top: 18rpx;
    color: #9a9a9a;
    font-size: 23rpx;
    line-height: 32rpx;
}
</style>
