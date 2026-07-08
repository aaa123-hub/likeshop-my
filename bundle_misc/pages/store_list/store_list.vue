<template>
  <view class="store-list">
    <view class="page-head">
      <view class="page-title">选择自提地址</view>
      <view class="page-subtitle">在地图中选择地址后，会回填到待付款页面</view>
    </view>

    <view class="selector-panel">
      <view class="search-bar">
        <input class="search-input" v-model="keyword" confirm-type="search" placeholder="搜索小区、街道、地址" @confirm="onSearch" />
        <view class="search-btn" @tap="onSearch">选择</view>
      </view>
      <view class="selector-tip">输入关键词后点击选择，或直接点击选择打开地图。</view>
    </view>

    <!-- #ifndef APP-PLUS -->
    <map
      v-if="location.latitude"
      class="preview-map"
      show-location
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
    />
    <!-- #endif -->

    <view class="selected-panel">
      <view v-if="selectedStore" class="selected-card">
        <view class="selected-main">
          <view class="selected-address">{{ selectedAddressText }}</view>
        </view>
      </view>
      <view v-else class="empty-card">
        <image
          src="https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/address_null.png"
          class="img-null"
        ></image>
        <view class="empty-title">还没有选择地址</view>
        <view class="empty-desc">请在地图中选择自提地址</view>
      </view>
    </view>

    <view class="confirm-bar">
      <button class="confirm-btn" :class="{ 'confirm-btn--disabled': !selectedStore }" @tap="confirmStore">确定</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      location: {},
      markers: [],
      selectedLocationName: '',
      selectedStore: null,
      keyword: '',
      orderId: '',
    };
  },
  computed: {
    selectedAddressText() {
      if (!this.selectedStore) return '';
      return this.selectedStore.map_address
        || this.selectedStore.mapAddress
        || this.selectedStore.shop_address
        || this.selectedStore.address
        || this.selectedStore.detailAddress
        || this.selectedStore.detail_address
        || this.selectedStore.poiAddress
        || this.selectedStore.poiaddress
        || '';
    },
  },
  methods: {
    async getLocation() {
      try {
        const res = await this.callWechatApi('getLocation', { type: 'gcj02' });
        return {
          latitude: res.latitude,
          longitude: res.longitude,
        };
      } catch (error) {
        // #ifdef MP-WEIXIN
        this.getAuthorize();
        // #endif
        return null;
      }
    },
    async chooseWechatLocation() {
      try {
        const params = {
          latitude: this.location.latitude,
          longitude: this.location.longitude,
        };
        if (this.keyword) params.keyword = this.keyword;
        const res = await this.callWechatApi('chooseLocation', params);
        if (!res || !res.latitude || !res.longitude) return;
        this.location = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        this.selectedLocationName = res.name || res.address || '';
        this.selectedStore = this.normalizeStore(this.createMapStore(res));
        this.updateMarkers();
      } catch (error) {
        this.$toast({ title: '未选择地图位置' });
      }
    },
    callWechatApi(name, params = {}) {
      return new Promise((resolve, reject) => {
        const normalize = (result) => resolve(Array.isArray(result) ? result[1] : result);
        // #ifdef MP-WEIXIN
        const wxApi = typeof wx !== 'undefined' && wx && wx[name];
        if (wxApi) {
          wxApi({
            ...params,
            success: normalize,
            fail: reject,
            cancel: reject
          });
          return;
        }
        // #endif
        const uniApi = uni && uni[name];
        if (!uniApi) {
          reject(new Error(`${name} is unavailable`));
          return;
        }
        uniApi(params).then(normalize).catch(reject);
      });
    },
    async getAuthorize() {
      const [error, res] = await uni.showModal({
        title: "您已拒绝地理位置权限",
        content: "是否进入权限管理，调整授权？",
      });
      if (res.confirm) {
		// #ifdef MP
        const [error, res] = await uni.openSetting();
        if (res) this.getLocation();
		// #endif
		// #ifdef APP-PLUS
		// #ifdef APP-PLUS
		// android平台
		if (uni.getSystemInfoSync().platform == 'android') {
		  var Intent = plus.android.importClass('android.content.Intent');
		  var Settings = plus.android.importClass('android.provider.Settings');
		  var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
		  var main = plus.android.runtimeMainActivity();
		  main.startActivity(intent); // 打开系统设置GPS服务页面
		}

		// ios平台
		if (uni.getSystemInfoSync().platform == 'ios') {
		  var UIApplication = plus.ios.import("UIApplication");
		  var application2 = UIApplication.sharedApplication();
		  var NSURL2 = plus.ios.import("NSURL");
		  var setting2 = NSURL2.URLWithString("App-Prefs:root=Privacy&path=LOCATION");
		  application2.openURL(setting2);
		  plus.ios.deleteObject(setting2);
		  plus.ios.deleteObject(NSURL2);
		  plus.ios.deleteObject(application2);
		}
		// #endif
		// #endif
      } else if (res.cancel) {
        this.$Router.go(-1);
      }
    },
    onSearch() {
      this.chooseWechatLocation();
    },
    createMapStore(res = {}) {
      const id = `map_${res.latitude}_${res.longitude}`;
      const address = res.address || res.name || this.keyword || '';
      const name = address || '地图选点地址';
      return {
        id,
        shop_id: id,
        shopId: id,
        selffetch_shop_id: id,
        selffetchShopId: id,
        name,
        shop_name: name,
        shopName: name,
        map_address: address,
        mapAddress: address,
        shop_address: address,
        address,
        detailAddress: address,
        detail_address: address,
        poiAddress: address,
        poiaddress: address,
        latitude: res.latitude,
        longitude: res.longitude,
        lat: res.latitude,
        lng: res.longitude,
        business_status: 1,
        map_selected: true
      };
    },
    updateMarkers() {
      if (!this.selectedStore || !this.selectedStore.latitude || !this.selectedStore.longitude) {
        this.markers = [];
        return;
      }
      this.markers = [{
        id: 1,
        latitude: this.selectedStore.latitude,
        longitude: this.selectedStore.longitude,
        iconPath: "https://shengyuan.store/api/miniapp/files/miniapp-static/static/images/icon_marker.png",
        width: 34,
        height: 34,
        callout: {
          content: this.selectedAddressText,
          padding: 5,
          borderRadius: 4,
          fontSize: 13,
          display: "ALWAYS",
        },
      }];
    },
    storeId(item = {}) {
      return item.id || item.shop_id || item.shopId || item.selffetch_shop_id || item.selffetchShopId || "";
    },
    normalizeStore(item = {}) {
      const id = this.storeId(item);
      return {
        ...item,
        id,
        shop_id: item.shop_id || id,
        shopId: item.shopId || id,
        selffetch_shop_id: item.selffetch_shop_id || id,
        selffetchShopId: item.selffetchShopId || id,
        name: item.name || item.shop_name || item.shopName || item.storeName || "自提门店",
        shop_name: item.shop_name || item.name || item.shopName || item.storeName || "自提门店",
        shopName: item.shopName || item.shop_name || item.name || item.storeName || "自提门店",
        map_address: item.map_address || item.mapAddress || item.shop_address || item.address || item.detailAddress || item.detail_address || item.poiAddress || item.poiaddress || "",
        mapAddress: item.mapAddress || item.map_address || item.shop_address || item.address || item.detailAddress || item.detail_address || item.poiAddress || item.poiaddress || "",
        shop_address: item.map_address || item.mapAddress || item.shop_address || item.address || item.detailAddress || item.detail_address || item.poiAddress || item.poiaddress || "",
        address: item.map_address || item.mapAddress || item.address || item.shop_address || item.detailAddress || item.detail_address || "",
        mobile: item.mobile || item.phone || item.telephone || "",
        latitude: item.latitude ?? item.lat ?? "",
        longitude: item.longitude ?? item.lng ?? ""
      };
    },
    isSelectedStore(item = {}) {
      if (!this.selectedStore) return false;
      return String(this.storeId(this.selectedStore)) === String(this.storeId(item));
    },
    onSelect(info) {
      this.selectedStore = this.normalizeStore(info);
      this.updateMarkers();
    },
    confirmStore() {
      if (!this.selectedStore) {
        return this.$toast({ title: "请选择地图地址" });
      }
      const store = this.normalizeStore(this.selectedStore);
      if (this.orderId) store.pending_order_id = this.orderId;
      uni.setStorageSync("selected_self_fetch_store", store);
      if (this.orderId) uni.setStorageSync(`selected_self_fetch_store_${this.orderId}`, store);
      uni.$emit("store", store);
      uni.$emit("store:selected", store);
      uni.navigateBack();
    },
  },
  async onLoad(options = {}) {
    this.orderId = options.order_id || options.orderId || "";
    const selected = options.selected ? decodeURIComponent(options.selected) : "";
    if (selected) {
      try {
        this.selectedStore = this.normalizeStore(JSON.parse(selected));
        if (this.selectedStore.latitude && this.selectedStore.longitude) {
          this.location = {
            latitude: this.selectedStore.latitude,
            longitude: this.selectedStore.longitude
          };
          this.selectedLocationName = this.selectedStore.name || this.selectedStore.shop_address || '';
          this.updateMarkers();
        }
      } catch (error) {}
    } else {
      const cached = (this.orderId && uni.getStorageSync(`selected_self_fetch_store_${this.orderId}`)) || uni.getStorageSync("selected_self_fetch_store");
      if (cached) {
        this.selectedStore = this.normalizeStore(cached);
        if (this.selectedStore.latitude && this.selectedStore.longitude) {
          this.location = {
            latitude: this.selectedStore.latitude,
            longitude: this.selectedStore.longitude
          };
          this.selectedLocationName = this.selectedStore.name || this.selectedStore.shop_address || '';
          this.updateMarkers();
        }
      }
    }
    const res = await this.getLocation();

    if (res && !this.location.latitude) {
      this.location = res;
    } else if (!this.location.latitude) {
      this.location = { latitude: 39.908823, longitude: 116.39747 };
      this.$toast({ title: "获取定位失败，可搜索选择位置" });
    }
  },
};
</script>

<style lang="scss">
page {
  padding: 0;
  height: 100%;
  background: #f5f7fb;
}

.store-list {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0 24rpx calc(132rpx + env(safe-area-inset-bottom));
}

.page-head {
  margin: 0 -24rpx;
  padding: 34rpx 30rpx 28rpx;
  background: linear-gradient(180deg, #eaf4ff 0%, #f5f7fb 100%);
  box-sizing: border-box;
}

.page-title {
  color: #1f2937;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.page-subtitle {
  margin-top: 10rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 34rpx;
}

.selector-panel,
.selected-panel {
  width: 100%;
  margin: 0 0 22rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(31, 72, 120, 0.06);
  box-sizing: border-box;
}

.selector-panel {
  margin-top: 2rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: #f5f7fb;
  color: #222222;
  font-size: 26rpx;
  box-sizing: border-box;
}

.search-btn {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 132rpx;
  height: 72rpx;
  padding: 0 30rpx;
  border-radius: 36rpx;
  background: #037dfa;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 72rpx;
}

.selector-tip {
  margin-top: 16rpx;
  color: #64748b;
  font-size: 23rpx;
  line-height: 32rpx;
}

.preview-map {
  width: 100%;
  height: 300rpx;
  margin: 0 0 22rpx;
  border-radius: 18rpx;
  overflow: hidden;
}

.selected-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 18rpx;
  margin-top: 18rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(3, 125, 250, 0.22);
  border-radius: 16rpx;
  background: #f7fbff;
  box-sizing: border-box;
}

.selected-main {
  flex: 1;
  min-width: 0;
}

.selected-address {
  color: #475569;
  font-size: 28rpx;
  line-height: 40rpx;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 44rpx 20rpx 36rpx;
  color: #64748b;
}

.img-null {
  width: 156rpx;
  height: 156rpx;
}

.empty-title {
  margin-top: 18rpx;
  color: #1f2937;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 36rpx;
}

.empty-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 34rpx;
}

.confirm-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  flex: none;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -6rpx 20rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.confirm-btn {
  height: 82rpx;
  border-radius: 41rpx;
  background: #037dfa;
  color: #ffffff;
  font-size: 30rpx;
  line-height: 82rpx;
}

.confirm-btn--disabled {
  background: #c8d5e6;
}

.confirm-btn::after {
  border: none;
}
</style>
