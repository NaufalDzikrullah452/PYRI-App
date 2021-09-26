/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("loginbtn","/app/web/src/components/loginbtn",{});
  return eval(_component.render)
}