/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("input-interest","/app/web/src/components/input-interest",{});
return eval(_component.render);
}