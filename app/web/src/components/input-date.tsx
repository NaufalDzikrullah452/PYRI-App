/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, placeholder }) => {
  const _component = useComponent("input-date","/app/web/src/components/input-date",{
    placeholder
  });
  return eval(_component.render)
}