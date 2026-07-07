<template>
	<view :class="{ active, inactive: !active, tab: true }" :style="shouldShow ? '' : 'display: none;'">
		<slot v-if="shouldRender"></slot>
	</view>
</template>

<script>
	export default {
		props: {
			dot: {
				type: Boolean,
			},
			info: {
				type: null,
			},
			title: {
				type: String,
			},
			titleStyle: {
				type: String,
			},
			name: {
				type: [Number, String],
				default: ''
			}
		},
		inject: ['tabs'],
		data() {
			return {
				active: false,
				shouldShow: false,
				shouldRender: false
			}
		},
		created() {
			this.tabs.childrens.push(this)
		},
		mounted() {
			this.update()
		},
		methods: {
			updateRender(active) {
				this.inited = this.inited || active;
				this.active = active
				this.shouldRender = this.inited
				this.shouldShow = active
			},
			update() {
				if (this.tabs) {
					this.tabs.updateTabs();
				}
			}
		},
		computed: {
			changeData() {
				const { dot, info, title, titleStyle } = this
				return { dot, info, title, titleStyle }
			}
		},
		watch: {
			changeData() {
				this.update()
			},
		},
	}
</script>

<style>
	.tab.active {
		height: auto;
	}

	.tab.inactive {
		height: 0;
		overflow: visible;
	}
</style>
