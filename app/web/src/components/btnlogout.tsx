/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("btnlogout","/app/web/src/components/btnlogout",{});
  return eval(_component.render)
}