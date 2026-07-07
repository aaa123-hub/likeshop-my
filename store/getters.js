export default {
  userInfo: state => state.app.userInfo || {},
  token: state => state.app.token,
  isLogin: state => !!state.app.token,
  cartNum: state => state.app.cartNum,
  inviteCode: state => state.app.userInfo.distribution_code || state.app.userInfo.promoter_code || "",
  appConfig: state => state.app.config
};
