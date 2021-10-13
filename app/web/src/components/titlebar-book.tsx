/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("titlebar-book","/app/web/src/components/titlebar-book",{});
return eval(_component.render);
}