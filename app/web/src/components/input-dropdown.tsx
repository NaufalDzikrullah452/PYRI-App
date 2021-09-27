/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("input-dropdown","/app/web/src/components/input-dropdown",{});
return eval(_component.render);
}