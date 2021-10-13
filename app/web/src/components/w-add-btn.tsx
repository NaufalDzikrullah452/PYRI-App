/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("w-add-btn","/app/web/src/components/w-add-btn",{});
return eval(_component.render);
}