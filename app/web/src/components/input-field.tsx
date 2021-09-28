/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, placeholder, type, style }) => {
  const _component = useComponent("input-field","/app/web/src/components/input-field",{ placeholder, type, style });
  return eval(_component.render)
}