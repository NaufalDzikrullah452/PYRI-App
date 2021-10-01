import { registerIcons } from '@fluentui/react/lib/Styling';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

registerIcons({
  icons: {
    Home: <FontAwesomeIcon icon={faHome} />
  }
});

import { Icon } from '@fluentui/react/lib/Icon';
export default Icon