import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'Main/img/user.svg';

export default class GlobalHeader extends React.Component {
  render() {
    return <div className="GlobalHeader">
      <div className="GlobalHeader-inner">
        <h1 className="GlobalHeader-title"><Link to="/">SPA Note</Link></h1>
        <div className="GlobalHeader-menu">
          <span className="GlobalHeader-user">
            <img src={Icon} width="16" height="16" />
            <span>MyUserName</span>
          </span>
          <Link to="/starred" className="GlobalHeader-menuItem">Starred</Link>
        </div>
      </div>
    </div>;
  }
}
