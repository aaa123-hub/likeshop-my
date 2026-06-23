<template>
	<view class="lime-painter-image"></view>
</template>

<script>
	import {parent, children} from '../common/relation';
	export default {
		name: 'lime-painter-image',
		mixins:[children('painter')],
		props: {
			css: [String, Object],
			src: String
		},
		data() {
			return {
				type: 'image',
				el: {
					css: {},
					src: null
				},
			}
		}
	}
</script>

<style>
.lime-painter-image {
	width: auto;
}
</style>
