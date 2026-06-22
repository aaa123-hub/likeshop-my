<template>
	<view class="lime-painter-qrcode"></view>
</template>

<script>
	import {parent, children} from '../common/relation';
	export default {
		name: 'lime-painter-qrcode',
		mixins:[children('painter')],
		props: {
			css: [String, Object],
			text: String
		},
		data() {
			return {
				type: 'qrcode',
				el: {
					css: {},
					text: null
				},
			}
		}
	}
</script>

<style>
.lime-painter-qrcode {
	width: auto;
}
</style>
