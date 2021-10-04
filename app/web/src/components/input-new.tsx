/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, label, type }) => {
  const _component = useComponent("input-new","/app/web/src/components/input-new",{
    label,
    type,
  });
  return eval(_component.render)
}