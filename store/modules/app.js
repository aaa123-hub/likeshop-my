import {
	getUser
} from '@/api/user'
import {
	USER_INFO,
	TOKEN,
	CONFIG,
	CART_NUM
} from '@/config/cachekey';
import Cache from '@/utils/cache'
const CART_TAB_INDEX = 3
const state = {
	config: Cache.get(CONFIG) || {
		app_agreement: 0,
		center_setting: {},
		index_setting: {},
		navigation_menu: [],
		navigation_setting: {}
	},
	userInfo: Cache.get(USER_INFO) || {
		user_money: 0,
		user_integral: 0,
		coupon: 0
	},
	token: Cache.get(TOKEN) || null,
	cartNum: Cache.get(CART_NUM) || 0,
};

const mutations = {
	LOGIN(state, opt = {}) {
		const userId = opt.userId || opt.user_id || opt.id || state.userInfo.userId || state.userInfo.user_id || state.userInfo.id
		state.token = opt.token;
		state.userInfo = {
			...state.userInfo,
			...(userId ? { userId, user_id: userId, id: userId } : {})
		}
		Cache.set(TOKEN, opt.token, 59 * 24 * 60 * 60);
		Cache.set(USER_INFO, state.userInfo)
		this.dispatch('getUser')
	},
	LOGOUT(state) {
		state.token = undefined;
		state.userInfo = {
			user_money: 0,
			user_integral: 0,
			coupon: 0
		}
		state.cartNum = 0
		Cache.remove(TOKEN);
		Cache.remove(USER_INFO);
		Cache.remove(CART_NUM);
		uni.removeTabBarBadge({
			index: CART_TAB_INDEX
		})
	},
	SETCARTNUM(state, num) {
		state.cartNum = Number(num) || 0
		Cache.set(CART_NUM, state.cartNum)
	},
	SETUSERINFO(state, user) {
		state.userInfo = {
			...state.userInfo,
			...user
		}
		Cache.set(USER_INFO, state.userInfo)
	},
	SETCONFIG(state, data) {
		state.config = Object.assign(state.config, data)
		Cache.set(CONFIG, state.config);
	}
};

const actions = {
	getCartNum({ state, commit }, payload) {
		return new Promise(resolve => {
			if (!state.token) {
				commit('SETCARTNUM', 0)
				uni.removeTabBarBadge({
					index: CART_TAB_INDEX
				})
				return resolve(0)
			}

			const num = Number(
				payload === undefined
					? state.cartNum || Cache.get(CART_NUM) || 0
					: typeof payload === 'number'
						? payload
						: payload?.cartCount ?? payload?.count ?? payload?.num ?? payload?.total ?? 0
			)
			commit('SETCARTNUM', num)
			if (!num) {
				uni.removeTabBarBadge({
					index: CART_TAB_INDEX
				})
			} else {
				uni.setTabBarBadge({
					index: CART_TAB_INDEX,
					text: String(num)
				})
			}
			resolve(num)
		})
	},

	getUser({ state, commit }) {
		return new Promise(resolve => {
			const userId = state.userInfo.userId || state.userInfo.user_id || state.userInfo.id
			if (!state.token || !userId) return resolve()
			getUser().then(res => {
				if (res.code == 1) {
					commit('SETUSERINFO', res.data || {})
				}
				resolve()
			})
		})
	},
};

export default {
	state,
	mutations,
	actions
};
