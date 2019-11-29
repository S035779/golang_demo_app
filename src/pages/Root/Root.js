import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Routes';

import { StylesProvider, createGenerateClassName, ThemeProvider } from '@material-ui/styles';
import theme from 'Main/theme';
import CssBaseline from '@material-ui/core/CssBaseline';

class Root extends React.Component {
  componentDidMount() {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }

  componentDidUpdate() {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }

  render() {
    return (
      <StylesProvider generateClassName={createGenerateClassName()}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <CssBaseline />
            {renderRoutes(getRoutes())}
          </BrowserRouter>
        </ThemeProvider>
      </StylesProvider>
    );
  }
}

export default Root;
