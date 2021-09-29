/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("btnlogout","/app/web/src/components/btnlogout",{onClick});
  return eval(_component.render)
}