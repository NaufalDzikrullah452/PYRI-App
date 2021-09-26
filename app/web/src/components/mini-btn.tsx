/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("mini-btn","/app/web/src/components/mini-btn",{});
return eval(_component.render);
}