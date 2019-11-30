import React from 'react';
import { Container } from 'flux/utils';
import { getStores, getState } from 'Stores';
import LoginAction from 'Actions/LoginAction';

class SignIn extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch() {
    return null;
  }

  from() {
    const { location } = this.props;
    const { from } = location.state || { from: { pathname: '/' } };
    return from;
  }

  handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();

    const from = this.from();
    LoginAction.authenticate('mamoru_hashimoto', 'mamo1114')
      .then(() => this.props.history.replace(from));
  }

  render() {
    const { pathname } = this.from();
    return (
      <p>
        You moust log in to view the page at {pathname}.
        <button onClick={this.handleLogin.bind(this)}>LOGIN</button>
      </p>
    );
  }
}
export default Container.create(SignIn);
