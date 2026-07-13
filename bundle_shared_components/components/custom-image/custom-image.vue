<template>
    <view
        :style="[viewStyle]"
        :class="{ 'custom-image': true, 'image-round': round }"
        @click="onClick"
    >
        <view v-if="isGoodsPlaceholder" class="placeholder-wrap image">
            <text>无</text>
        </view>
        <image
            v-else-if="!error"
            :src="displaySrc"
            :mode="mode"
            :lazy-load="lazyLoad"
            class="image"
            :show-menu-by-longpress="showMenuByLongpress"
            @load="onLoaded"
            @error="onErrored"
        ></image>
        <view v-if="loading && showLoading" class="loading-wrap image">
            <slot v-if="useLoadingSlot" name="loading"></slot>
            <u-icon color="#aaa" v-else name="photo-fill" size="45"></u-icon>
        </view>
        <view v-if="error && showError" class="error-wrap image">
            <slot v-if="useErrorSlot" name="error"></slot>
            <u-icon color="#aaa" v-else name="error-circle-fill" size="45"></u-icon>
            <text class="sm">加载失败</text>
        </view>
    </view>
</template>

<script>
import { isPlaceholderImage, resolveImage } from '@/utils/image-placeholder'

export default {
    props: {
        src: {
            type: String
        },
        round: Boolean,
        width: {
            type: null
        },
        height: {
            type: null
        },
        radius: null,
        lazyLoad: {
            type: Boolean,
            default: true
        },
        useErrorSlot: Boolean,
        useLoadingSlot: Boolean,
        showMenuByLongpress: Boolean,
        mode: {
            type: String,
            default: 'scaleToFill'
        },
        showError: {
            type: Boolean,
            default: true
        },
        showLoading: {
            type: Boolean,
            default: true
        },
        customStyle: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            error: false,
            loading: true,
            fallbackSrc: '',
            viewStyle: {}
        }
    },
    computed: {
        displaySrc() {
            return this.fallbackSrc || resolveImage(this.src)
        },
        isGoodsPlaceholder() {
            return isPlaceholderImage(this.src) || isPlaceholderImage(this.displaySrc)
        }
    },
    created() {
        this.setStyle()
    },
    methods: {
        setStyle() {
            const { width, height, radius } = this
            let style = {}

            if (width) {
                style.width = width
            }

            if (height) {
                style.height = height
            }

            if (radius) {
                style['overflow'] = 'hidden'
                style['border-radius'] = radius
            }
            this.viewStyle = style
            if (this.customStyle) {
                this.viewStyle = Object.assign(this.viewStyle, this.customStyle)
            }
        },
        onLoaded(event) {
            this.loading = false
            this.$emit('load', event.detail)
        },
        onErrored(event) {
            if (!this.fallbackSrc) {
                this.fallbackSrc = resolveImage('')
                this.error = false
            } else {
                this.error = true
            }
            this.loading = false
            this.$emit('error', event.detail)
        },
        onClick(event) {
            this.$emit('click', event.detail)
        }
    },
    watch: {
        src() {
            this.error = false
            this.loading = true
            this.fallbackSrc = ''
        },
        width() {
            this.setStyle()
        },
        height() {
            this.setStyle()
        }
    }
}
</script>

<style lang="scss">
.custom-image {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    &.image-round {
        overflow: hidden;
        border-radius: 50%;
    }
    .image {
        display: block;
        width: 100%;
        height: 100%;
    }

    .loading-wrap,
    .error-wrap,
    .placeholder-wrap {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #969799;
        font-size: 28rpx;
        background-color: #fff8ed;
    }

    .placeholder-wrap {
        color: #999999;
        font-size: 24rpx;
        background: #f1f2f5;
    }
}
</style>
