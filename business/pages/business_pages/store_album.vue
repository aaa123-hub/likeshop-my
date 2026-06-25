<template>
    <business-wrapper-page scene="store-detail" store-detail-default-tab="album" :page-options="pageOptions"></business-wrapper-page>
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
