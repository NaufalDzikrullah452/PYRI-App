/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, placeholder }) => {
  const _component = useComponent("input-field","/app/web/src/components/input-field",{ placeholder });
  return eval(_component.render)
}