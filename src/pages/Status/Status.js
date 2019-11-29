import React from 'react';
import { Route } from 'react-router-dom';

export default class NotFound extends React.Component {
  render() {
    const { code, children } = this.props;
    return (<Route render={({ staticContext }) => {
      if (staticContext) staticContext.status = code;
      return children;
    }} />);
  }
}
