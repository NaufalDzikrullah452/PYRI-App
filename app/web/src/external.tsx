// make sure to export default component not export const
export default {
"render-html": () => import("web.utils/components/RenderHTML"),
  "html-head": () => import("web.utils/components/HtmlHead"),
  "hello-world": () => import("web.utils/components/HelloWorld"),
  "loading": () => import("web.crud/src/legacy/Loading"),
  "admin": () => import("web.crud/src/CRUD"),
  "qform": () => import("web.crud/src/form/BaseForm"),
  "qlist": () => import("web.crud/src/list/QBaseList"),
  "loginbtn-splash": () => import("./components/loginbtn-splash"),
  "mini-btn": () => import("./components/mini-btn"),
  "btn-primary": () => import("./components/btn-primary"),
  "button-test": () => import("./components/button-test"),
  "input-code": () => import("./components/input-code"),
  "m-input": () => import("./components/m-input"),
  "input-field": () => import("./components/input-field"),
  "btn-rounded": () => import("./components/btn-rounded"),
  "navbottom": () => import("./components/navbottom"),
  "btnlogout": () => import("./components/btnlogout"),
  "input-testing": () => import("./components/input-testing"),
  "input-dropdown": () => import("./components/input-dropdown"),
  "input-datepicker": () => import("./components/input-datepicker")
}
