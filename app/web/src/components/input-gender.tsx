/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, disabled, selected }) => {
  const _component = useComponent("input-gender","/app/web/src/components/input-gender",{ disabled, selected });
  return eval(_component.render)
}