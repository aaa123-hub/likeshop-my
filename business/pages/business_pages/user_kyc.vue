<template>
    <business-wrapper-page scene="user-kyc" :page-options="{ showFormWhenEmpty: true }"></business-wrapper-page>
</template>

<script>
import businessWrapperPage from '../business_scene/business-wrapper-page.vue'

export default {
    components: {
        businessWrapperPage
    }
}
</script>
