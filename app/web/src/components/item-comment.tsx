/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("item-comment","/app/web/src/components/item-comment",{});
return eval(_component.render);
}