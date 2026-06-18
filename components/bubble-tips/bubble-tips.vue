<template>
	<view class="bubble-tips-container" :style="{top: top, left: left}">
		<view class="bubble-content row" v-show="showBubble" v-for="item in currentList" :key="item.id">
			<image class="bubble-img" :src="item.user && item.user.avatar ? item.user.avatar : '/static/images/my_portrait_empty.png'" />
			<view class="xs">
				{{item.template}}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getBubbleLists
	} from "@/api/app";
	import Cache from "@/utils/cache"
	export default {
		name: "BubbleTips",
		props: {
			// 是否停止切换
			discharge: {
				type: Boolean,
				default: false
			},
			top: {
				type: String,
				default: "40rpx"
			},
			left: {
				type: String,
				default: "20rpx"
			},
			updateTime: {
				type: Number,
				default: 5 * 60 * 1000
			}
		},
		data() {
			return {
				index: Cache.get("currentIndex") || 0,
				list: [],
				currentList: [],
				timer: null,
				refreshing: false,
				showBubble: false,
			}
		},
		watch: {
			index(newValue, oldValue) {
				if (this.index - this.list.length >= 0) {
					this.showBubble = false;
					let timer = setTimeout(() => {
						Cache.set("currentIndex", 0)
						if (this.timer) {
							clearInterval(this.timer)
							this.timer = null
						}
						this.fadeUpBubble();
						clearTimeout(timer)
					}, 2000)
				} else {
					if (this.timer) {
						clearInterval(this.timer)
						this.timer = null
					}
					this.fadeUpBubble();
					return;
				}
			},
			discharge() {
				// 为了让活性的页面停止计时器
				if (this.discharge) {
					// 停止
					Cache.set("currentIndex", this.index);
					clearInterval(this.timer);
					this.timer = null;
					return false;
				} else {
					// 继续切换
					let currentInex = Cache.get("currentInex") || this.list.length;
					if (currentInex - this.list.length < 0) {
						if (this.timer) {
							setInterval(this.timer)
							this.timer = null;
						}
						this.fadeUpBubble()
					}
				}
			}
		},
		methods: {
			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			$getBubbleLists() {
				if (this.refreshing) return;
				this.refreshing = true;
				getBubbleLists().then(res => {
					if (res.code == 1) {
						const data = res.data || {};
						this.list = Array.isArray(data.lists) ? data.lists : [];
						const requestTime = (data.time || Math.floor(Date.now() / 1000)) * 1000;
						Cache.set("bubbleList", JSON.stringify(this.list), 300);
						Cache.set("requestTime", requestTime);
						this.clearTimer();
						this.fadeUpBubble()
					}
				}).finally(() => {
					this.refreshing = false;
				})
			},
			fadeUpBubble() {
				let requestTime = Cache.get("requestTime");
				let currentTime = new Date();
				this.index = Cache.get("currentIndex") || 0;
				this.list = Cache.get("bubbleList") ? JSON.parse(Cache.get("bubbleList")) : [];
				if (!this.list.length) {
					this.showBubble = false;
					this.currentList = [];
					this.clearTimer();
					return;
				}
				if (!requestTime || currentTime.getTime() - requestTime >= this.updateTime) {
					this.$getBubbleLists();
					Cache.set("currentIndex", 0, 300)
					return;
				}
				this.showBubble = true;
				this.clearTimer();
				this.timer = setInterval(() => {
					this.currentList = this.list.slice(this.index, this.index + 1);
					Cache.set("currentIndex", ++this.index);
				}, 4000);
			}
		},
		created() {
			var index = Cache.get("currentIndex") || 0;
			var requestTime = Cache.get("requestTime");
			var currentTime = new Date();
			var currentList = Cache.get("bubbleList") ? JSON.parse(Cache.get("bubbleList")) : [];
			if (currentList.length <= 0) {
				this.$getBubbleLists();
				Cache.set("currentIndex", 0)
			} else if (index - currentList.length >= 0) {
				Cache.set("currentIndex", 0);
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
				this.fadeUpBubble();
			} else if (currentTime.getTime() - requestTime >= this.updateTime) {
				this.$getBubbleLists();
				Cache.set("currentIndex", 0)
			} else {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
				this.fadeUpBubble()
			}
		},
		onLoad() {},
		beforeDestroy() {
			this.clearTimer();
		},
		destroyed() {
			this.clearTimer();
		}
	}
</script>

<style lang="scss">
	.bubble-tips-container {
		position: absolute;
		z-index: 98;

		.bubble-content {
			padding: 4rpx 20rpx 4rpx 10rpx;
			background-color: rgba(0, 0, 0, 0.7);
			color: white;
			border-radius: 120rpx;

			.bubble-img {
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				margin-right: 10rpx;
			}
		}
	}
</style>
