/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("titlebar-back","/app/web/src/components/titlebar-back",{ onClick });
  return eval(_component.render)
}