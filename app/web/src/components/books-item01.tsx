/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children, onClick }) => {
  const _component = useComponent("books-item01","/app/web/src/components/books-item01",{onClick});
  return eval(_component.render);
}