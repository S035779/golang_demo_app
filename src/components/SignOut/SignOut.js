import React from 'react';
import { Container } from 'flux/utils';
import { getStores, getState } from 'Stores';
import LoginAction from 'Actions/LoginAction';

class SignOut extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch() {
    return null;
  }

  handleLogout(e) {
    e.preventDefault();
    e.stopPropagation();

    LoginAction.signout('mamoru_hashimoto')
      .then(() => this.props.history.push('/'));
  }

  render() {
    return this.state.isAuthenticated ? (
      <p>
        Welcome, {this.state.username} !!
        <button onClick={this.handleLogout.bind(this)}>LOGOUT</button>
      </p>
    ) : (
      <p>You are not logged in.</p>
    );
  }
}
export default Container.create(SignOut);
