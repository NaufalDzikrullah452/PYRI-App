/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, label, value, onChange, inputStyle, style }) => {
  const _component = useComponent("input-dropdown","/app/web/src/components/input-dropdown",{
    label,
    value,
    onChange,
    inputStyle,
    style,
  });
  return eval(_component.render)
}