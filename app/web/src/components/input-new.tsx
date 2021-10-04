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
  disabled,
}) => {
  const _component = useComponent("input-new", "/app/web/src/components/input-new", {
    label,
    type,
    value,
    onChange,
    condition,
    disabled,
  });
  return eval(_component.render)
}