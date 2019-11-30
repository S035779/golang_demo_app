import React from 'react';
import { renderRoutes } from 'react-router-config';
import { Redirect, Route } from 'react-router-dom';
import { Container } from 'flux/utils';
import { getStores, getState } from 'Stores';

class Auth extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch() {
    return null;
  }

  render() {
    const { route, ...rest } = this.props;
    return (
      <Route {...rest} render={({ location }) => {
        return this.state.isAuthenticated ? (
          renderRoutes(route.routes)
        ) : (
          <Redirect to={{ pathname: '/signin', state: { from: location } }} />
        );
      }} />
    );
  }
}
export default Container.create(Auth);
