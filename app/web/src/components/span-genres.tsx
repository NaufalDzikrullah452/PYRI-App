/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("span-genres","/app/web/src/components/span-genres",{});
return eval(_component.render);
}