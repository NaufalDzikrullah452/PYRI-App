/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("item-comment-active","/app/web/src/components/item-comment-active",{});
return eval(_component.render);
}