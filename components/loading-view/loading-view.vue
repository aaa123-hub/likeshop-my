<template>
<view :class="'loading ' + ( type == 'flex' ? 'flex' : '' )" :style="{backgroundColor, }">
    <view class="loading-spinner" :style="spinnerStyle"></view>
</view>
</template>

<script>

export default {
  data() {
    return {};
  },
  props: {
    type: {
      type: String,
      default: 'fixed'
    },

	backgroundColor: {
		type: String,
		default: '#fff'
	},
	color: {
		type: String,
	},
	size: {
		type: Number,
		default: 40
	}
  },
  computed: {
    spinnerStyle() {
      return {
        width: this.size + 'rpx',
        height: this.size + 'rpx',
        borderTopColor: this.color || '#666'
      }
    }
  },
  methods: {}
};
</script>
<style>
.loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading.flex {
    position: static;
    flex: 1;
    width: 100%;
}

.loading-spinner {
    border: 4rpx solid #e5e5e5;
    border-top-color: #666;
    border-radius: 50%;
    animation: loading-rotate .8s linear infinite;
}

@keyframes loading-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
