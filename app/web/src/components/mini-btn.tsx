/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("mini-btn", "/app/web/src/components/mini-btn", { onClick });
  return eval(_component.render)
}