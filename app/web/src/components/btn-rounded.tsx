/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("btn-rounded","/app/web/src/components/btn-rounded",{onClick});
  return eval(_component.render)
}