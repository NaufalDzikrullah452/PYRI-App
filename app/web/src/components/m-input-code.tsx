/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("m-input-code","/app/web/src/components/m-input-code",{});
return eval(_component.render);
}