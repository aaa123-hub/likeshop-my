<template>
    <view class="service-page"></view>
</template>

<script>
export default {
    onLoad(options = {}) {
        const query = Object.keys(options).map(key => `${key}=${encodeURIComponent(options[key])}`).join('&')
        uni.redirectTo({
            url: `/bundle_user/pages/contact_offical/contact_offical${query ? `?${query}` : ''}`
        })
    }
}
</script>

<style lang="scss">
.service-page {
    min-height: 100vh;
    background: #fff9f0;
}
</style>
