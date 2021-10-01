/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("sample-component","/app/web/src/components/sample-component",{});
  return eval(_component.render)
}