/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("titlebar-left","/app/web/src/components/titlebar-left",{ onClick });
  return eval(_component.render)
}