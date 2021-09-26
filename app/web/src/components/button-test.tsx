/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("button-test","/app/web/src/components/button-test",{});
return eval(_component.render);
}