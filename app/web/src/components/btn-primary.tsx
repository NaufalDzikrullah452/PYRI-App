/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("btn-primary","/app/web/src/components/btn-primary",{onClick});
  return eval(_component.render)
}