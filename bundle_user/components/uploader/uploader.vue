<template>
    <view class="uploader-container row wrap">
        <view class="upload-image-box" v-for="(item, index) in fileList" :key="index" :style="{width: previewSize, height: previewSize}">
            <custom-image mode="aspectFit" class="img-preview" radius="10rpx" :src="item.url" :width="previewSize" :height="previewSize" />
            <view v-if="deletable" class="close-icon row-center" @tap="deleteImage($event, index)">
                <u-icon name="close" size="30" color="white" />
            </view>
        </view>
        <view
            class="uplader-upload row-center"
            :style="{width: previewSize, height: previewSize}"
            @tap="handleImage"
            v-show="(fileList.length == 0 || mutiple) && fileList.length < maxUpload"
            v-if="!useSlot"
        >
            <u-icon size="48" color="#dcdee0" name="camera" />
            <view type="image" accept="image/*" class="uploader-input" />
        </view>
        <view
            class="uplader-upload-slot row-center"
            @tap="handleImage"
            v-show="(fileList.length == 0 || mutiple) && fileList.length < maxUpload"
            v-else
        >
            <slot></slot>
        </view>
    </view>
</template>

<script>
import UIcon from '@/bundle_user/components/uview-ui/components/u-icon/u-icon.vue'
import CustomImage from '@/components/custom-image/custom-image.vue'

export default {
    name: 'uploader',
    components: {
        UIcon,
        CustomImage
    },
    props: {
        fileList: {
            type: Array,
            default: () => []
        },
        mutiple: {
            type: Boolean,
            default: false
        },
        maxUpload: {
            type: Number,
            default: 1
        },
        previewSize: {
            type: String,
            default: '160rpx'
        },
        deletable: {
            type: Boolean,
            default: false,
        },
        useSlot: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleImage() {
            const remaining = this.maxUpload - this.fileList.length
            if (remaining <= 0) return
            uni.chooseImage({
                count: this.mutiple ? remaining : 1,
                success: (res) => {
                    this.$emit('after-read', res.tempFiles)
                }
            })
        },
        deleteImage(e, index) {
            this.$emit('delete', index)
        }
    }
}
</script>

<style lang="scss">
.uploader-container {
    .upload-image-box {
        position: relative;
        margin-right: 8rpx;
        margin-bottom: 8rpx;

        .close-icon {
            position: absolute;
            right: -20rpx;
            top: -15rpx;
            width: 40rpx;
            height: 40rpx;
            background-color: red;
            border-radius: 50%;
            z-index: 20;
        }
    }

    .uplader-upload {
        position: relative;
        width: 160rpx;
        height: 160rpx;
        background-color: #fff8ed;
    }

    .uplader-upload-slot {
        position: relative;
        min-width: 160rpx;
        min-height: 160rpx;
    }

    .uploader-input {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        opacity: 0;
        top: 0;
        left: 0;
        z-index: 10;
        cursor: pointer;
    }
}
</style>
