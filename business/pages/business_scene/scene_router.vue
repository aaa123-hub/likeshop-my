<template>
    <scene-shell :scene="scene"></scene-shell>
</template>

<script>
import sceneShell from './scene-shell.vue'

export default {
    components: {
        sceneShell
    },
    data() {
        return {
            scene: 'feedback'
        }
    },
    onLoad(options) {
        this.scene = options.scene || 'feedback'
    }
}
</script>
