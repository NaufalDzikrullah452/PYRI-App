/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("input-comment","/app/web/src/components/input-comment",{});
return eval(_component.render);
}