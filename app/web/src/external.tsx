// make sure to export default component not export const
export default {
  "render-html": () => [
    import("web.utils/components/RenderHTML"),
    { c: "", s: "", h: "" },
  ],
  "html-head": () => [
    import("web.utils/components/HtmlHead"),
    { c: "", s: "", h: "" },
  ],
  "hello-world": () => [
    import("web.utils/components/HelloWorld"),
    { c: "", s: "", h: "" },
  ],
  loading: () => [
    import("web.crud/src/legacy/Loading"),
    { c: "", s: "", h: "" },
  ],
  admin: () => [import("web.crud/src/CRUD"), { c: "", s: "", h: "" }],
  qform: () => [import("web.crud/src/form/BaseForm"), { c: "", s: "", h: "" }],
  qlist: () => [import("web.crud/src/list/QBaseList"), { c: "", s: "", h: "" }],
  "loginbtn-splash": () => [
    import("./components/loginbtn-splash"),
    { c: "", s: "", h: "" },
  ],
  "mini-btn": () => [import("./components/mini-btn"), { c: "", s: "", h: "" }],
  "btn-primary": () => [
    import("./components/btn-primary"),
    { c: "", s: "", h: "" },
  ],
  "button-test": () => [
    import("./components/button-test"),
    { c: "", s: "", h: "" },
  ],
  "input-code": () => [
    import("./components/input-code"),
    { c: "", s: "", h: "" },
  ],
  "m-input": () => [import("./components/m-input"), { c: "", s: "", h: "" }],
  "input-field": () => [
    import("./components/input-field"),
    { c: "", s: "", h: "" },
  ],
  "btn-rounded": () => [
    import("./components/btn-rounded"),
    { c: "", s: "", h: "" },
  ],
  navbottom: () => [import("./components/navbottom"), { c: "", s: "", h: "" }],
  btnlogout: () => [import("./components/btnlogout"), { c: "", s: "", h: "" }],
  "input-dropdown": () => [
    import("./components/input-dropdown"),
    { c: "", s: "", h: "" },
  ],
  "input-datepicker": () => [
    import("./components/input-datepicker"),
    { c: "", s: "", h: "" },
  ],
  "input-new": () => [
    import("./components/input-new"),
    { c: "", s: "", h: "" },
  ],
  "titlebar-back": () => [
    import("./components/titlebar-back"),
    { c: "", s: "", h: "" },
  ],
  "input-new-white": () => [
    import("./components/input-new-white"),
    { c: "", s: "", h: "" },
  ],
  "input-dropdown-white": () => [
    import("./components/input-dropdown-white"),
    { c: "", s: "", h: "" },
  ],
  "input-datepicker-white": () => [
    import("./components/input-datepicker-white"),
    { c: "", s: "", h: "" },
  ],
  "span-genres": () => [
    import("./components/span-genres"),
    { c: "", s: "", h: "" },
  ],
  "titlebar-left": () => [
    import("./components/titlebar-left"),
    { c: "", s: "", h: "" },
  ],
  "input-comment": () => [
    import("./components/input-comment"),
    { c: "", s: "", h: "" },
  ],
  "item-comment-active": () => [
    import("./components/item-comment-active"),
    { c: "", s: "", h: "" },
  ],
  "item-comment": () => [
    import("./components/item-comment"),
    { c: "", s: "", h: "" },
  ],
};
