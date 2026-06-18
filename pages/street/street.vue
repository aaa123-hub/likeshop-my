<template>
    <view class="street-tab">
        <business-wrapper-page scene="street"></business-wrapper-page>
    </view>
</template>

<script>
import businessWrapperPage from '@/bundle/pages/business_scene/business-wrapper-page.vue'
import { setTabbar } from '@/utils/tools'

export default {
    components: {
        businessWrapperPage
    },
    onLoad() {
        setTabbar()
    }
}
</script>

<style lang="scss">
.street-tab {
    min-height: 100vh;
    background: #f8f8f8;
}
</style>
