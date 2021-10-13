/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useComponent } from "web.utils/component";

export default ({ children }) => {
const _component = useComponent("w-profile-admin","/app/web/src/components/w-profile-admin",{});
return eval(_component.render);
}