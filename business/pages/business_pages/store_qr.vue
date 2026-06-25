<template>
    <business-wrapper-page scene="store-qr" :page-options="pageOptions"></business-wrapper-page>
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
        this.pageOptions = options || {}
    },
    components: {
        businessWrapperPage
    }
}
</script>
