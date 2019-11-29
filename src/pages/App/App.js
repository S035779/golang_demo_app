import loadable from '@loadable/component';
import React from 'react';
import { renderRoutes } from "react-router-config";
import { announcePageTitle } from 'Main/announcer';

const GlobalHeader = loadable(() => import('Components/GlobalHeader/GlobalHeader'));

export default class App extends React.Component {
  componentDidUpdate(prevProps) {
    const prevPath = prevProps.location.pathname;
    const curtPath = this.props.location.pathname;
    if (prevPath !== curtPath) announcePageTitle();
  }

  render() {
    const { route } = this.props;
    const routes = renderRoutes(route.routes);
    return <div className="page-App">
      <div className="page-App-header" role="header">
        <GlobalHeader />
      </div>
      <div className="page-App-main" role="main">
        {routes}
      </div>
    </div>;
  }
}
