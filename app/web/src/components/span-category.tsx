/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("span-category","/app/web/src/components/span-category",{});
return eval(_component.render);
}