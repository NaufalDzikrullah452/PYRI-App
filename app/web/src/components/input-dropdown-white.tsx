/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, label, value, onChange, inputStyle, style }) => {
  const _component = useComponent("input-dropdown-white","/app/web/src/components/input-dropdown-white",{
    label,
    value,
    onChange,
    inputStyle,
    style,
  });
  return eval(_component.render)
}