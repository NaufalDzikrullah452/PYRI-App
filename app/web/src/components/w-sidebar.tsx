/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("w-sidebar","/app/web/src/components/w-sidebar",{});
return eval(_component.render);
}