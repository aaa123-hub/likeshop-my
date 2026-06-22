<template>
    <scene-shell :scene="scene" :store-detail-default-tab="storeDetailDefaultTab"></scene-shell>
</template>

<script>
import sceneShell from './scene-shell.vue'

export default {
    components: {
        sceneShell
    },
    props: {
        scene: {
            type: String,
            default: 'feedback'
        },
        storeDetailDefaultTab: {
            type: String,
            default: ''
        }
    }
}
</script>
