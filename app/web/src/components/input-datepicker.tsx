/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, label }) => {
  const _component = useComponent("input-datepicker","/app/web/src/components/input-datepicker",{
    label,
  });
  return eval(_component.render)
}