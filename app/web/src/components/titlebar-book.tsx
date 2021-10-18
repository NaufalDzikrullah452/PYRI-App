/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children , onClick}) => {
  const _component = useComponent("titlebar-book","/app/web/src/components/titlebar-book",{onClick});
  return eval(_component.render)
}