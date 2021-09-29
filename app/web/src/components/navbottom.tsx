/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("navbottom","/app/web/src/components/navbottom",{});
  return eval(_component.render)
}