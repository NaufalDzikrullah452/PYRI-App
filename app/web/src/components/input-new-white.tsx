/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({
  children,
  label,
  type,
  value,
  onChange,
  condition,
}) => {
  const _component = useComponent("input-new-white","/app/web/src/components/input-new-white",{
    label,
    type,
    value,
    onChange,
    condition,
  });
  return eval(_component.render)
}