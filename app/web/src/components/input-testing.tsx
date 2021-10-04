/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, label, type }) => {
  const _component = useComponent("input-testing","/app/web/src/components/input-testing",{
    label,
    type,
  });
  return eval(_component.render)
}