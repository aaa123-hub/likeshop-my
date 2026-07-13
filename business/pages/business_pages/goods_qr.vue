<template>
    <business-wrapper-page scene="goods-qr" :page-options="pageOptions"></business-wrapper-page>
</template>

<script>
import businessWrapperPage from '../business_scene/business-wrapper-page.vue'

export default {
    data() {
        return {
            pageOptions: {}
        }
    },
    onLoad(options) {
        uni.showToast({ title: '商品二维码功能已下线', icon: 'none' })
        setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
        this.pageOptions = options || {}
    },
    components: {
        businessWrapperPage
    }
}
</script>
