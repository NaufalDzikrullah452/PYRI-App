/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
  const _component = useComponent("profpic","/app/web/src/components/profpic",{});
  return eval(_component.render)
}