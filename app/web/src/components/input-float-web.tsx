/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, type, placeholder, value, onChange }) => {
  const _component = useComponent("input-float-web","/app/web/src/components/input-float-web",{
    type,
    placeholder,
    value, onChange
  });
  return eval(_component.render)
}