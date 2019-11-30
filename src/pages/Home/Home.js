import loadable from '@loadable/component';
import React from 'react';
import { NavLink } from 'react-router-dom';

const SignOut = loadable(() => import('Components/SignOut/SignOut'));

class Home extends React.Component {
  render() {
    return (
      <div>
        <SignOut />
        <ul>
          <li><NavLink to="/home">Home</NavLink></li>
          <li><NavLink to="/signup">Regist</NavLink></li>
          <li><NavLink to="/signin">Login</NavLink></li>
        </ul>
      </div>
    );
  }
}
export default Home;
