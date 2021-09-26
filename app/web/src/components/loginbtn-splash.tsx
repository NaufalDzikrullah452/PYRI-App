/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("loginbtn-splash","/app/web/src/components/loginbtn-splash",{ onClick});
  return eval(_component.render)
}