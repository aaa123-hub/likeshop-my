<template>
	<view class="u-icon" :class="['u-icon--' + name, 'u-icon--' + labelPos]" :style="customStyle" @tap="click">
		<text class="u-icon__shape"></text>
		<text v-if="label !== ''" class="u-icon__label">{{ label }}</text>
	</view>
</template>

<script>
export default {
	name: 'u-icon',
	props: {
		name: String,
		color: String,
		size: [String, Number],
		label: {
			type: [String, Number],
			default: ''
		},
		index: [String, Number],
		labelPos: {
			type: String,
			default: 'right'
		},
		customStyle: Object
	},
	methods: {
		click: function(e) {
			this.$emit('click', this.index)
			this.$emit('tap', e)
		}
	}
}
</script>

<style scoped lang="scss">
.u-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	vertical-align: middle;
	color: inherit;
}
.u-icon--bottom { flex-direction: column; }
.u-icon__shape {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1em;
	height: 1em;
	font-size: inherit;
	color: currentColor;
}
.u-icon__label {
	margin-left: 6rpx;
	line-height: 1;
}
.u-icon--search .u-icon__shape::before {
	content: '';
	position: absolute;
	left: 18%;
	top: 17%;
	width: 48%;
	height: 48%;
	border: 3rpx solid currentColor;
	border-radius: 50%;
	box-sizing: border-box;
}
.u-icon--search .u-icon__shape::after {
	content: '';
	position: absolute;
	right: 17%;
	bottom: 18%;
	width: 34%;
	height: 3rpx;
	background: currentColor;
	border-radius: 3rpx;
	transform: rotate(45deg);
	transform-origin: right center;
}
.u-icon--arrow-left .u-icon__shape::before,
.u-icon--nav-back .u-icon__shape::before,
.u-icon--nav-back-arrow .u-icon__shape::before,
.u-icon--arrow-right .u-icon__shape::before,
.u-icon--arrow-up .u-icon__shape::before,
.u-icon--arrow-up-fill .u-icon__shape::before,
.u-icon--arrow-down .u-icon__shape::before,
.u-icon--arrow-down-fill .u-icon__shape::before {
	content: '';
	position: absolute;
	width: 42%;
	height: 42%;
	border-left: 3rpx solid currentColor;
	border-bottom: 3rpx solid currentColor;
	box-sizing: border-box;
}
.u-icon--arrow-left .u-icon__shape::before,
.u-icon--nav-back .u-icon__shape::before,
.u-icon--nav-back-arrow .u-icon__shape::before { transform: rotate(45deg); }
.u-icon--arrow-right .u-icon__shape::before { transform: rotate(-135deg); }
.u-icon--arrow-up .u-icon__shape::before,
.u-icon--arrow-up-fill .u-icon__shape::before { transform: rotate(135deg); }
.u-icon--arrow-down .u-icon__shape::before,
.u-icon--arrow-down-fill .u-icon__shape::before { transform: rotate(-45deg); }
.u-icon--close-circle .u-icon__shape,
.u-icon--close-circle-fill .u-icon__shape {
	border: 3rpx solid currentColor;
	border-radius: 50%;
	box-sizing: border-box;
}
.u-icon--close .u-icon__shape::before,
.u-icon--close .u-icon__shape::after,
.u-icon--close-circle .u-icon__shape::before,
.u-icon--close-circle .u-icon__shape::after,
.u-icon--close-circle-fill .u-icon__shape::before,
.u-icon--close-circle-fill .u-icon__shape::after {
	content: '';
	position: absolute;
	width: 62%;
	height: 3rpx;
	background: currentColor;
	border-radius: 3rpx;
}
.u-icon--close .u-icon__shape::before,
.u-icon--close-circle .u-icon__shape::before,
.u-icon--close-circle-fill .u-icon__shape::before { transform: rotate(45deg); }
.u-icon--close .u-icon__shape::after,
.u-icon--close-circle .u-icon__shape::after,
.u-icon--close-circle-fill .u-icon__shape::after { transform: rotate(-45deg); }
.u-icon--plus .u-icon__shape::before { content: '+'; }
.u-icon--minus .u-icon__shape::before { content: '-'; }
.u-icon--checkbox-mark .u-icon__shape::before { content: 'v'; }
.u-icon--arrow-left-double .u-icon__shape::before { content: '<<'; }
.u-icon--arrow-right-double .u-icon__shape::before { content: '>>'; }
.u-icon--trash .u-icon__shape::before,
.u-icon--backspace .u-icon__shape::before { content: 'x'; }
.u-icon--play-right-fill .u-icon__shape::before { content: '>'; }
</style>
