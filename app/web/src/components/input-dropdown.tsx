/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, label }) => {
  const _component = useComponent("input-dropdown","/app/web/src/components/input-dropdown",{
    label,
  });
  return eval(_component.render)
}