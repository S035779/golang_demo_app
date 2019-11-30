import React from 'react';
import { Container } from 'flux/utils';
import { getStores, getState } from 'Stores';
import LoginAction from 'Actions/LoginAction';

class SignUp extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch() {
    return null;
  }

  handleRegist(e) {
    e.preventDefault();
    e.stopPropagation();

    LoginAction.regist('mamoru_hashimoto', 'mamo1114')
      .then(() => this.props.history.replace({ pathname: '/' }));
  }

  render() {
    return (
      <p>
        Do you want to register as a user?
        <button onClick={this.handleRegist.bind(this)}>REGIST</button>
      </p>
    );
  }
}
export default Container.create(SignUp);
