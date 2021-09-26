/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick, type }) => {
  const _component = useComponent("btn-primary", "/app/web/src/components/btn-primary", { onClick, type });
  return eval(_component.render)
}