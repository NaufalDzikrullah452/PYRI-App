/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("m-input","/app/web/src/components/m-input",{});
  return eval(_component.render)
}