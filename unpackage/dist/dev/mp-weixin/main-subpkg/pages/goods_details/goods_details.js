(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/goods_details/goods_details"],{

/***/ 169:
/*!****************************************************************************************************!*\
  !*** /Users/pc/nodejs/likeshop-my-former/main.js?{"page":"pages%2Fgoods_details%2Fgoods_details"} ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _goods_details = _interopRequireDefault(__webpack_require__(/*! ./pages/goods_details/goods_details.vue */ 170));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_goods_details.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 170:
/*!*********************************************************************************!*\
  !*** /Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./goods_details.vue?vue&type=template&id=439d7c8c&scoped=true& */ 171);
/* harmony import */ var _goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./goods_details.vue?vue&type=script&lang=js& */ 173);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./goods_details.vue?vue&type=style&index=0&id=439d7c8c&lang=scss&scoped=true& */ 177);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 58);

var renderjs





/* normalize component */

var component = Object(_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "439d7c8c",
  null,
  false,
  _goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/goods_details/goods_details.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 171:
/*!****************************************************************************************************************************!*\
  !*** /Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue?vue&type=template&id=439d7c8c&scoped=true& ***!
  \****************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./goods_details.vue?vue&type=template&id=439d7c8c&scoped=true& */ 172);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_template_id_439d7c8c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 172:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!/Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue?vue&type=template&id=439d7c8c&scoped=true& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    navbar: function () {
      return __webpack_require__.e(/*! import() | components/navbar/navbar */ "components/navbar/navbar").then(__webpack_require__.bind(null, /*! @/components/navbar/navbar.vue */ 861))
    },
    loadingView: function () {
      return __webpack_require__.e(/*! import() | components/loading-view/loading-view */ "components/loading-view/loading-view").then(__webpack_require__.bind(null, /*! @/components/loading-view/loading-view.vue */ 927))
    },
    bubbleTips: function () {
      return __webpack_require__.e(/*! import() | components/bubble-tips/bubble-tips */ "components/bubble-tips/bubble-tips").then(__webpack_require__.bind(null, /*! @/components/bubble-tips/bubble-tips.vue */ 969))
    },
    productSwiper: function () {
      return __webpack_require__.e(/*! import() | components/product-swiper/product-swiper */ "components/product-swiper/product-swiper").then(__webpack_require__.bind(null, /*! @/components/product-swiper/product-swiper.vue */ 976))
    },
    priceFormat: function () {
      return __webpack_require__.e(/*! import() | components/price-format/price-format */ "components/price-format/price-format").then(__webpack_require__.bind(null, /*! @/components/price-format/price-format.vue */ 934))
    },
    uCountDown: function () {
      return __webpack_require__.e(/*! import() | components/uview-ui/components/u-count-down/u-count-down */ "components/uview-ui/components/u-count-down/u-count-down").then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-count-down/u-count-down.vue */ 983))
    },
    uIcon: function () {
      return __webpack_require__.e(/*! import() | components/uview-ui/components/u-icon/u-icon */ "components/uview-ui/components/u-icon/u-icon").then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-icon/u-icon.vue */ 854))
    },
    uTag: function () {
      return __webpack_require__.e(/*! import() | components/uview-ui/components/u-tag/u-tag */ "components/uview-ui/components/u-tag/u-tag").then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-tag/u-tag.vue */ 990))
    },
    customImage: function () {
      return __webpack_require__.e(/*! import() | components/custom-image/custom-image */ "components/custom-image/custom-image").then(__webpack_require__.bind(null, /*! @/components/custom-image/custom-image.vue */ 997))
    },
    goodsLike: function () {
      return __webpack_require__.e(/*! import() | components/goods-like/goods-like */ "components/goods-like/goods-like").then(__webpack_require__.bind(null, /*! @/components/goods-like/goods-like.vue */ 1004))
    },
    uParse: function () {
      return Promise.all(/*! import() | components/uview-ui/components/u-parse/u-parse */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/uview-ui/components/u-parse/u-parse")]).then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-parse/u-parse.vue */ 917))
    },
    uBadge: function () {
      return __webpack_require__.e(/*! import() | components/uview-ui/components/u-badge/u-badge */ "components/uview-ui/components/u-badge/u-badge").then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-badge/u-badge.vue */ 1011))
    },
    recommend: function () {
      return Promise.all(/*! import() | components/recommend/recommend */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/recommend/recommend")]).then(__webpack_require__.bind(null, /*! @/components/recommend/recommend.vue */ 1018))
    },
    specPopup: function () {
      return __webpack_require__.e(/*! import() | components/spec-popup/spec-popup */ "components/spec-popup/spec-popup").then(__webpack_require__.bind(null, /*! @/components/spec-popup/spec-popup.vue */ 1025))
    },
    sharePopup: function () {
      return __webpack_require__.e(/*! import() | components/share-popup/share-popup */ "components/share-popup/share-popup").then(__webpack_require__.bind(null, /*! @/components/share-popup/share-popup.vue */ 1032))
    },
    uPopup: function () {
      return __webpack_require__.e(/*! import() | components/uview-ui/components/u-popup/u-popup */ "components/uview-ui/components/u-popup/u-popup").then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-popup/u-popup.vue */ 962))
    },
    couponList: function () {
      return __webpack_require__.e(/*! import() | components/coupon-list/coupon-list */ "components/coupon-list/coupon-list").then(__webpack_require__.bind(null, /*! @/components/coupon-list/coupon-list.vue */ 1039))
    },
    uBackTop: function () {
      return __webpack_require__.e(/*! import() | components/uview-ui/components/u-back-top/u-back-top */ "components/uview-ui/components/u-back-top/u-back-top").then(__webpack_require__.bind(null, /*! @/components/uview-ui/components/u-back-top/u-back-top.vue */ 1046))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var a0 = {
    background: "rgba(256,256,256," + _vm.percent + ")",
  }
  var g0 = !_vm.isNull ? _vm.swiperList.length || 0 : null
  var g1 = !_vm.isNull ? _vm.couponList.length : null
  var g2 = !_vm.isNull
    ?  false && (false)
    : null
  var g3 = !_vm.isNull && g2 ? _vm.couponList.length : null
  var g4 = !_vm.isNull ? _vm.teamFound.length : null
  var l1 =
    !_vm.isNull && g4
      ? _vm.__map(_vm.teamFound, function (sitem, index) {
          var $orig = _vm.__get_orig(sitem)
          var l0 = _vm.__map(sitem, function (item, index2) {
            var $orig = _vm.__get_orig(item)
            var m0 = _vm.getTeamCountTime(item.found_end_time)
            return {
              $orig: $orig,
              m0: m0,
            }
          })
          return {
            $orig: $orig,
            l0: l0,
          }
        })
      : null
  var g5 = !_vm.isNull ? _vm.teamFound.length : null
  var g6 = !_vm.isNull ? _vm.goodsLike.length : null
  var m1 = Boolean(_vm.isGroup)
  var a1 = {
    avatar: _vm.resolveAvatar(_vm.userInfo.avatar),
    nickname: _vm.userInfo.nickname,
    image: _vm.resolveGoodsImage(
      _vm.goodsDetail.poster || _vm.goodsDetail.image
    ),
    price: _vm.goodsDetail.min_price,
    marketPrice: _vm.goodsDetail.market_price,
    name: _vm.goodsDetail.name,
  }
  if (!_vm._isMounted) {
    _vm.e0 = function ($event) {
      _vm.showShareBtn = true
    }
    _vm.e1 = function ($event) {
      _vm.showSpec = false
    }
    _vm.e2 = function ($event) {
      _vm.showCoupon = false
    }
    _vm.e3 = function ($event) {
      _vm.showCommission = false
    }
    _vm.e4 = function ($event) {
      _vm.showShareBtn = true
    }
  }
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        a0: a0,
        g0: g0,
        g1: g1,
        g2: g2,
        g3: g3,
        g4: g4,
        l1: l1,
        g5: g5,
        g6: g6,
        m1: m1,
        a1: a1,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 173:
/*!**********************************************************************************************************!*\
  !*** /Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./goods_details.vue?vue&type=script&lang=js& */ 174);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 174:
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!/Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 34));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 36));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _store = __webpack_require__(/*! @/api/store */ 92);
var _user = __webpack_require__(/*! @/api/user */ 38);
var _activity = __webpack_require__(/*! @/api/activity */ 175);
var _vuex = __webpack_require__(/*! vuex */ 37);
var _tools = __webpack_require__(/*! @/utils/tools */ 47);
var _login = __webpack_require__(/*! @/utils/login */ 50);
var _cache = _interopRequireDefault(__webpack_require__(/*! @/utils/cache */ 45));
var _imagePlaceholder = __webpack_require__(/*! @/utils/image-placeholder */ 53);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _default = {
  data: function data() {
    return {
      scrollTop: 0,
      percent: 0,
      isFirstLoading: true,
      isNull: false,
      showSpec: false,
      showCoupon: false,
      showShareBtn: false,
      showCommission: true,
      popupType: '',
      swiperList: [],
      goodsDetail: {},
      goodsLike: [],
      goodsType: 0,
      checkedGoods: {},
      couponList: [],
      comment: {},
      countTime: 0,
      tagStyle: {
        img: 'width:100%;'
      },
      team: {},
      teamFound: [],
      isGroup: 0,
      id: '',
      showDownload: false,
      distribution: {},
      fetchingDetail: false
    };
  },
  onLoad: function onLoad(options) {
    this.onPageScroll = (0, _tools.trottle)(this.onPageScroll, 500, this);
    if (options && options.scene) {
      var scene = (0, _tools.strToParams)(decodeURIComponent(options.scene));
      console.log(scene, decodeURIComponent(options.scene));
      options.id = scene.id;
    }
    if (!options || !options.id) {
      this.id = '1';
      this.applyDefaultGoodsDetail();
    } else {
      this.id = options.id;
    }
    this.getCartNum();
  },
  onShow: function onShow() {
    if (!this.id) return;
    this.getGoodsDetailFun();
  },
  onPageScroll: function onPageScroll(e) {
    var top = uni.upx2px(100);
    var scrollTop = e.scrollTop;
    this.percent = scrollTop / top > 1 ? 1 : scrollTop / top;
    this.scrollTop = scrollTop;
  },
  methods: _objectSpread(_objectSpread({}, (0, _vuex.mapActions)(['getCartNum'])), {}, {
    resolveAvatar: function resolveAvatar(avatar) {
      return (0, _imagePlaceholder.resolveImage)(avatar, 'avatar');
    },
    resolveGoodsImage: function resolveGoodsImage(image) {
      return (0, _imagePlaceholder.resolveImage)(image, 'goods');
    },
    goShopDetail: function goShopDetail() {
      var shopId = this.goodsDetail.shop_id || this.goodsDetail.shopId;
      if (!shopId) return;
      uni.navigateTo({
        url: "/bundle/pages/business_pages/store_detail?shopId=".concat(shopId)
      });
    },
    applyDefaultGoodsDetail: function applyDefaultGoodsDetail() {
      var _this = this;
      var image = 'https://shengyuan.store/api/miniapp/files/miniapp-static/static/lanhu/designs/24-goods-detail.png';
      this.isNull = false;
      this.goodsType = 0;
      this.countTime = 0;
      this.team = {};
      this.teamFound = [];
      this.comment = {};
      this.couponList = [];
      this.goodsLike = [{
        id: 1,
        name: '轻便舒适跑步鞋',
        image: image,
        min_price: '1899.00'
      }, {
        id: 2,
        name: '黑白灰色运动鞋',
        image: image,
        min_price: '2300.00'
      }];
      this.swiperList = [image];
      this.goodsDetail = {
        id: this.id || '1',
        name: '超清智慧投影居家使用高清高分辨率',
        shop_name: '叮咚生活家',
        image: image,
        poster: image,
        video: '',
        remark: '默认商品展示数据',
        min_price: '299.00',
        max_price: '299.00',
        market_price: '399.00',
        sales_sum: 213,
        stock: 999,
        is_collect: 0,
        order_give_integral: 200,
        content: '<p>商品详情默认展示内容，适用于接口暂无数据时的静态预览。</p>'
      };
      this.$nextTick(function () {
        _this.isFirstLoading = false;
      });
    },
    getGoodsDetailFun: function getGoodsDetailFun() {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var _data$goods_item, _data$goods_item2, _yield$getGoodsDetail, data, code, goods_image, content, comment, like, activity, distribution, _ref, info, team, team_found, time;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (_this2.id) {
                  _context.next = 3;
                  break;
                }
                _this2.applyDefaultGoodsDetail();
                return _context.abrupt("return");
              case 3:
                if (!_this2.fetchingDetail) {
                  _context.next = 5;
                  break;
                }
                return _context.abrupt("return");
              case 5:
                _this2.fetchingDetail = true;
                _context.prev = 6;
                _context.next = 9;
                return (0, _store.getGoodsDetail)({
                  id: _this2.id
                });
              case 9:
                _yield$getGoodsDetail = _context.sent;
                data = _yield$getGoodsDetail.data;
                code = _yield$getGoodsDetail.code;
                if (!(code != 1 || !data)) {
                  _context.next = 15;
                  break;
                }
                _this2.applyDefaultGoodsDetail();
                return _context.abrupt("return");
              case 15:
                goods_image = data.goods_image, content = data.content, comment = data.comment, like = data.like, activity = data.activity, distribution = data.distribution;
                _ref = activity || {}, info = _ref.info, team = _ref.team, team_found = _ref.team_found; //秒杀时间
                time = info ? info.end_time - Date.now() / 1000 //拼团时间
                : team ? team.end_time - Date.now() / 1000 : 0;
                if (Array.isArray(team_found)) {
                  team_found = (0, _tools.arraySlice)(team_found, [], 2);
                } else {
                  team_found = [];
                }
                _this2.distribution = distribution || {};
                _this2.isNull = false;
                _this2.goodsDetail = data;
                _this2.swiperList = Array.isArray(goods_image) && goods_image.length ? goods_image : [data.image].filter(Boolean);
                _this2.comment = comment || {};
                _this2.goodsLike = Array.isArray(like) ? like : [];
                _this2.couponList = Array.isArray(data.coupon_list) ? data.coupon_list : [];
                _this2.checkedGoods = ((_data$goods_item = data.goods_item) === null || _data$goods_item === void 0 ? void 0 : _data$goods_item.find(function (item) {
                  return Number(item.stock || 0) > 0;
                })) || ((_data$goods_item2 = data.goods_item) === null || _data$goods_item2 === void 0 ? void 0 : _data$goods_item2[0]) || {};
                _this2.countTime = time;
                _this2.goodsType = (activity === null || activity === void 0 ? void 0 : activity.type) || 0;
                _this2.team = team ? team : {};
                _this2.teamFound = team_found ? team_found : [];
                _context.next = 37;
                break;
              case 33:
                _context.prev = 33;
                _context.t0 = _context["catch"](6);
                console.error('[goods-details] getGoodsDetailFun failed:', _context.t0);
                _this2.applyDefaultGoodsDetail();
              case 37:
                _context.prev = 37;
                _this2.fetchingDetail = false;
                _this2.$nextTick(function () {
                  _this2.isFirstLoading = false;
                });
                return _context.finish(37);
              case 41:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[6, 33, 37, 41]]);
      }))();
    },
    getGoodsCouponFun: function getGoodsCouponFun() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var _yield$getGoodsCoupon, data, code;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (_this3.id) {
                  _context2.next = 2;
                  break;
                }
                return _context2.abrupt("return");
              case 2:
                _context2.next = 4;
                return (0, _activity.getGoodsCoupon)({
                  id: _this3.id
                });
              case 4:
                _yield$getGoodsCoupon = _context2.sent;
                data = _yield$getGoodsCoupon.data;
                code = _yield$getGoodsCoupon.code;
                if (code == 1) {
                  _this3.couponList = data;
                }
              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    collectGoodsFun: function collectGoodsFun() {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var is_collect, _yield$collectGoods, data, code;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (_this4.isLogin) {
                  _context3.next = 2;
                  break;
                }
                return _context3.abrupt("return", (0, _login.toLogin)());
              case 2:
                is_collect = _this4.goodsDetail.is_collect;
                _context3.next = 5;
                return (0, _user.collectGoods)({
                  is_collect: is_collect == 0 ? 1 : 0,
                  goods_id: _this4.id
                });
              case 5:
                _yield$collectGoods = _context3.sent;
                data = _yield$collectGoods.data;
                code = _yield$collectGoods.code;
                if (code == 1) {
                  if (is_collect == 0) {
                    _this4.$toast({
                      title: '收藏成功'
                    });
                  } else {
                    _this4.$toast({
                      title: '取消收藏'
                    });
                  }
                  _this4.getGoodsDetailFun();
                }
              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    showCouponFun: function showCouponFun() {
      if (!this.isLogin) return (0, _login.toLogin)();
      this.showCoupon = true;
    },
    onChangeGoods: function onChangeGoods(e) {
      console.log(e);
      this.checkedGoods = e.detail;
    },
    showSpecFun: function showSpecFun(type, id) {
      if (!this.isLogin) return (0, _login.toLogin)();
      if (this.goodsType == 2 && [2, 3].includes(type)) {
        this.isGroup = 1;
        this.foundId = id;
      } else {
        this.isGroup = 0;
        this.foundId = '';
      }
      this.popupType = type;
      this.showSpec = true;
    },
    onBuy: function onBuy(e) {
      var _e$detail = e.detail,
        id = _e$detail.id,
        sku_id = _e$detail.sku_id,
        skuId = _e$detail.skuId,
        item_id = _e$detail.item_id,
        goodsNum = _e$detail.goodsNum;
      var itemId = item_id || sku_id || skuId || id;
      var goodsType = this.goodsType,
        team = this.team;
      var goods = [{
        item_id: itemId,
        skuId: itemId,
        num: goodsNum
      }];
      var params = {
        goods: goods
      };
      this.showSpec = false;
      goodsType == 2 ? params.teamId = team.team_id : '';
      this.foundId ? params.foundId = this.foundId : '';
      uni.navigateTo({
        url: '/pages/confirm_order/confirm_order?data=' + encodeURIComponent(JSON.stringify(params))
      });
      console.log(1111);
    },
    onConfirm: function onConfirm(e) {
      var _this5 = this;
      var team_id = this.team.team_id;
      (0, _activity.teamCheck)({
        team_id: team_id,
        found_id: this.foundId
      }).then(function (res) {
        if (res.code == 1) {
          _this5.onBuy(e);
        }
      });
    },
    onAddCart: function onAddCart(e) {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var _e$detail2, id, sku_id, skuId, item_id, goodsNum, itemId, goods, _yield$addCart, code, data, msg, _ref2, _ref3, _data$cartCount, cartCount, cartRes, _ref4, _ref5, _ref6, _cartRes$data$cartCou, _cartRes$data, _cartRes$data2, _cartRes$data3, _cartRes$data4;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _e$detail2 = e.detail, id = _e$detail2.id, sku_id = _e$detail2.sku_id, skuId = _e$detail2.skuId, item_id = _e$detail2.item_id, goodsNum = _e$detail2.goodsNum;
                itemId = item_id || sku_id || skuId || id;
                if (!(_this6.goodsType == 2)) {
                  _context4.next = 6;
                  break;
                }
                // 拼团单独购买
                goods = [{
                  item_id: itemId,
                  skuId: itemId,
                  num: goodsNum
                }];
                uni.navigateTo({
                  url: '/pages/confirm_order/confirm_order?data=' + encodeURIComponent(JSON.stringify({
                    goods: goods
                  }))
                });
                return _context4.abrupt("return");
              case 6:
                _context4.next = 8;
                return (0, _store.addCart)({
                  item_id: itemId,
                  skuId: itemId,
                  goods_num: goodsNum
                });
              case 8:
                _yield$addCart = _context4.sent;
                code = _yield$addCart.code;
                data = _yield$addCart.data;
                msg = _yield$addCart.msg;
                if (!(code == 1)) {
                  _context4.next = 24;
                  break;
                }
                cartCount = (_ref2 = (_ref3 = (_data$cartCount = data === null || data === void 0 ? void 0 : data.cartCount) !== null && _data$cartCount !== void 0 ? _data$cartCount : data === null || data === void 0 ? void 0 : data.count) !== null && _ref3 !== void 0 ? _ref3 : data === null || data === void 0 ? void 0 : data.num) !== null && _ref2 !== void 0 ? _ref2 : data === null || data === void 0 ? void 0 : data.total;
                if (!(cartCount !== undefined && cartCount !== null)) {
                  _context4.next = 18;
                  break;
                }
                _this6.getCartNum(cartCount);
                _context4.next = 22;
                break;
              case 18:
                _context4.next = 20;
                return (0, _store.getCartNum)();
              case 20:
                cartRes = _context4.sent;
                if (cartRes.code == 1) {
                  _this6.getCartNum((_ref4 = (_ref5 = (_ref6 = (_cartRes$data$cartCou = (_cartRes$data = cartRes.data) === null || _cartRes$data === void 0 ? void 0 : _cartRes$data.cartCount) !== null && _cartRes$data$cartCou !== void 0 ? _cartRes$data$cartCou : (_cartRes$data2 = cartRes.data) === null || _cartRes$data2 === void 0 ? void 0 : _cartRes$data2.count) !== null && _ref6 !== void 0 ? _ref6 : (_cartRes$data3 = cartRes.data) === null || _cartRes$data3 === void 0 ? void 0 : _cartRes$data3.num) !== null && _ref5 !== void 0 ? _ref5 : (_cartRes$data4 = cartRes.data) === null || _cartRes$data4 === void 0 ? void 0 : _cartRes$data4.total) !== null && _ref4 !== void 0 ? _ref4 : 0);
                }
              case 22:
                _this6.$toast({
                  title: msg,
                  icon: 'success'
                });
                _this6.showSpec = false;
              case 24:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    }
  }),
  onShareAppMessage: function onShareAppMessage() {
    var _this7 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
      var goodsDetail, team, userInfo;
      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              goodsDetail = _this7.goodsDetail, team = _this7.team, userInfo = _this7.userInfo;
              return _context5.abrupt("return", {
                title: team.share_title || goodsDetail.name,
                imageUrl: goodsDetail.image,
                path: '/pages/goods_details/goods_details?id=' + _this7.id + "&invite_code=" + userInfo.distribution_code
              });
            case 2:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
  },
  computed: _objectSpread(_objectSpread({}, (0, _vuex.mapGetters)(['cartNum', 'userInfo'])), {}, {
    btnText: function btnText() {
      var goodsType = this.goodsType;
      switch (goodsType) {
        case 1:
          return {
            red: '立即抢购',
            yellow: ''
          };
        case 2:
          return {
            red: '立即开团',
            yellow: '单独购买'
          };
        default:
          return {
            red: '立即购买',
            yellow: '加入购物车'
          };
      }
    },
    getTeamCountTime: function getTeamCountTime() {
      return function (time) {
        return time - Date.now() / 1000;
      };
    },
    enableCommission: function enableCommission() {
      var goodsType = this.goodsType,
        _this$distribution = this.distribution,
        earnings = _this$distribution.earnings,
        is_show = _this$distribution.is_show;
      return goodsType == 0 && earnings > 0 && is_show == 1;
    },
    previewImages: function previewImages() {
      return (this.swiperList || []).slice(0, 4);
    },
    primaryCouponText: function primaryCouponText() {
      if (this.couponList.length) {
        return this.couponList[0].use_condition || '50元优惠券';
      }
      if (this.goodsDetail.order_give_integral) {
        return "\u4E0B\u5355\u9001".concat(this.goodsDetail.order_give_integral, "\u79EF\u5206");
      }
      return '50元优惠券';
    },
    selectedSpecText: function selectedSpecText() {
      return this.checkedGoods.spec_value_str || this.checkedGoods.skuName || this.checkedGoods.name || '默认';
    },
    freightText: function freightText() {
      var _ref7, _this$goodsDetail$fre;
      var type = this.goodsDetail.freight_type || this.goodsDetail.freightType;
      var amount = Number((_ref7 = (_this$goodsDetail$fre = this.goodsDetail.freight_amount) !== null && _this$goodsDetail$fre !== void 0 ? _this$goodsDetail$fre : this.goodsDetail.freightAmount) !== null && _ref7 !== void 0 ? _ref7 : 0);
      if (type === 'PICKUP') return '线下自提';
      if (type === 'TEMPLATE') return amount > 0 ? "\u8FD0\u8D39 \xA5".concat(amount) : '按运费模板计算';
      if (type === 'FIXED') return amount > 0 ? "\u8FD0\u8D39 \xA5".concat(amount) : '固定运费';
      return '免运费';
    }
  })
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 177:
/*!*******************************************************************************************************************************************!*\
  !*** /Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue?vue&type=style&index=0&id=439d7c8c&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./goods_details.vue?vue&type=style&index=0&id=439d7c8c&lang=scss&scoped=true& */ 178);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_goods_details_vue_vue_type_style_index_0_id_439d7c8c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 178:
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!/Users/pc/nodejs/likeshop-my-former/pages/goods_details/goods_details.vue?vue&type=style&index=0&id=439d7c8c&lang=scss&scoped=true& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[169,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/goods_details/goods_details.js.map