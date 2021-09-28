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
  ficon: () => [import("./components/FluentIcon"), { c: "", s: "", h: "" }],
  faicon: () => [import("./components/FAIcon"), { c: "", s: "", h: "" }],
  qrcode: () => [import("./components/qrcode"), { c: "", s: "", h: "" }],
  dtable: () => [import("./components/DataTable"), { c: "", s: "", h: "" }],
  "sample-component": () => [
    import("./components/sample-component"),
    { c: "", s: "", h: "" },
  ],
  test: () => [import("./components/test"), { c: "", s: "", h: "" }],
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
};
