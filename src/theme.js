import { createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ffa726', light: '#ffd95b', dark: '#c77800', contrastText: '#fff'
    },
    secondary: {
      main: '#e65100', light: '#ff833a', dark: '#ac1900', contrastText: '#fff'
    }
  },
  error: {
    main: red.A400
  },
  typography: {
    useNextVariants: true
  },
  background: {
    default: '#eee'
  }
});

export default theme;
