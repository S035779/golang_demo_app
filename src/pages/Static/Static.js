import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Routes';

import { StylesProvider, createGenerateClassName, ThemeProvider } from '@material-ui/styles';
import theme from 'Main/theme';
import CssBaseline from '@material-ui/core/CssBaseline';

class Static extends React.Component {
  render() {
    const context = {};
    return (
      <StylesProvider generateClassName={createGenerateClassName()}>
        <ThemeProvider theme={theme}>
          <StaticRouter location={this.props.location} context={context}>
            <CssBaseline />
            {renderRoutes(getRoutes())}
          </StaticRouter>
        </ThemeProvider>
      </StylesProvider>
    );
  }
}
export default Static;
