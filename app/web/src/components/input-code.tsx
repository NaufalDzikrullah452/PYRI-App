/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("input-code","/app/web/src/components/input-code",{});
  return eval(_component.render)
}