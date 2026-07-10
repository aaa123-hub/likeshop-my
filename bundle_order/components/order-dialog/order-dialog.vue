<template>
    <u-modal
        v-model="show"
        :show-cancel-button="true"
        :content="getTipsText"
        @confirm="onConfirm"
        confirm-color="#ff2c3c"
    ></u-modal>
</template>

<script>
import { cancelOrder, delOrder, confirmOrder } from '@/api/order'
import UModal from '@/bundle_order/components/uview-ui/components/u-modal/u-modal.vue'

export default {
    components: {
        UModal
    },
    props: {
        type: Number,
        orderId: [Number, String]
    },
    data() {
        return {
            show: false,
            submitting: false
        }
    },
    computed: {
        getTipsText() {
            const map = {
                0: '确认取消订单吗？',
                1: '确认删除订单吗？删除后订单将不再显示。',
                2: '确认收货吗？'
            }
            return map[this.type] || '确认操作吗？'
        }
    },
    methods: {
        open() {
            this.show = true
        },
        close() {
            this.show = false
        },
        async onConfirm() {
            if (this.submitting) return
            this.submitting = true
            let res = null
            try {
                if (this.type === 0) res = await cancelOrder(this.orderId)
                if (this.type === 1) res = await delOrder(this.orderId)
                if (this.type === 2) res = await confirmOrder(this.orderId)

                if (res && res.code == 1) {
                    this.close()
                    this.$emit('refresh', { type: this.type, orderId: this.orderId })
                    this.$toast({ title: res.msg || '操作成功' })
                    return
                }
                this.$toast({ title: (res && res.msg) || '操作失败，请重试' })
            } catch (error) {
                console.error('[order-dialog] confirm failed:', error)
                this.$toast({ title: '操作失败，请重试' })
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>
