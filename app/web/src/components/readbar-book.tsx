/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("readbar-book","/app/web/src/components/readbar-book",{});
return eval(_component.render);
}