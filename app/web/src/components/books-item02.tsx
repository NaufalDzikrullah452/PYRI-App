/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("books-item02","/app/web/src/components/books-item02",{});
return eval(_component.render);
}