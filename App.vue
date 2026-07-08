<script>
import { mapMutations, mapActions } from "vuex";
import { inputInviteCode } from "@/api/user";
import { userShare, getConfig } from "@/api/app";
import Cache from "@/utils/cache";
import { strToParams, setTabbar } from "@/utils/tools";
export default {
  globalData: {
    navHeight: "",
  },
  onLaunch: async function (options) {
    uni.showTabBar();
    // 获取配置
    this.getConfigFun();

    this.getUser();
    // 获取分享
    this.getShareInfo();
    //获取系统信息
    this.getSystemInfo();
  },
  onShow: function (options) {
    //绑定邀请码
    this.bindCode(options);
  },
  methods: {
    ...mapMutations(["SETCONFIG"]),
    ...mapActions(["getUser"]),
    getSystemInfo() {
      uni.getSystemInfo({
        success: (res) => {
          let { statusBarHeight, platform } = res;
          let navHeight;

          if (platform == "ios" || platform == "devtools") {
            navHeight = statusBarHeight + 44;
          } else {
            navHeight = statusBarHeight + 48;
          }
          this.globalData.navHeight = navHeight;
        }
      });
    },
    async getShareInfo() {
      const { code, data } = await userShare();
      if (code == 1) {
        Cache.set("shareInfo", data);
      }
    },
    async getConfigFun() {
      try {
        const { code, data } = await getConfig();
        if (code == 1) {
          this.SETCONFIG(data);
          setTabbar();
        }
      } catch (e) {
        uni.showTabBar();
      }
    },
    bindCode(options) {
      if (!options.query) return;
      const scene = options.query.scene;
      let invite_code = options.query.invite_code;
      let promoterUserId = options.query.promoterUserId || options.query.uid || "";
      let roleCode = options.query.role || options.query.roleCode || "";
      if (!invite_code && scene) {
        try {
          const decodedScene = decodeURIComponent(scene);
          const sceneParams = strToParams(decodedScene);
          invite_code = sceneParams.invite_code || sceneParams.inviteCode || sceneParams.code || sceneParams.allianceCode || "";
          const uidMatch = decodedScene.match(/(?:^|&)uid_([^&]+)/);
          promoterUserId = promoterUserId || String(sceneParams.promoterUserId || sceneParams.promoter_user_id || sceneParams.uid || sceneParams.userId || "").replace(/^uid_/, "") || (uidMatch && uidMatch[1]) || "";
          roleCode = roleCode || sceneParams.role || sceneParams.roleCode || sceneParams.role_type || sceneParams.roleType || "";
        } catch (e) {
          return;
        }
      }
      if (invite_code || promoterUserId) {
        inputInviteCode({
          code: invite_code,
          promoterUserId,
          roleCode,
          scene,
        }).then((res) => {
          if (res.code == -1) {
            Cache.set("INVITE_CODE", { invite_code, promoterUserId, roleCode, scene });
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import "styles/base.scss";
/* #ifdef H5 */
uni-tabbar .uni-tabbar {
  left: 0 !important;
  right: 0 !important;
  max-width: var(--app-max-width, 750rpx) !important;
  margin-left: auto !important;
  margin-right: auto !important;
  height: calc(112rpx + constant(safe-area-inset-bottom)) !important;
  height: calc(112rpx + env(safe-area-inset-bottom)) !important;
  padding-bottom: constant(safe-area-inset-bottom) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
  box-sizing: border-box !important;
}

uni-tabbar .uni-tabbar__bd,
uni-tabbar .uni-tabbar__item,
uni-tabbar .uni-tabbar__icon {
  overflow: visible !important;
}

uni-tabbar .uni-tabbar__bd {
  height: 112rpx !important;
}

uni-tabbar .uni-tabbar__item {
  padding-top: 10rpx !important;
  padding-bottom: 8rpx !important;
  box-sizing: border-box !important;
}

uni-tabbar .uni-tabbar__icon {
  width: 47rpx !important;
  height: 42rpx !important;
  margin-bottom: 6rpx !important;
}

uni-tabbar .uni-tabbar__icon img {
  display: block !important;
  width: 47rpx !important;
  height: 42rpx !important;
  object-fit: contain !important;
  object-position: center center !important;
}

uni-tabbar .uni-tabbar__label {
  line-height: 24rpx !important;
}
/* #endif */

.empty-image-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220rpx;
  height: 160rpx;
  color: #999999;
  font-size: 24rpx;
  background: #f1f2f5;
  border-radius: 16rpx;
}
</style>
