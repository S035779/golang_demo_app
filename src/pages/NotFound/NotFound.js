import React from 'react';
import Status from 'Pages/Status/Status';

export default class NotFound extends React.Component {
  render() {
    return <Status code={404}>
      <div>
        <h1>Sorry, can't find that.</h1>
      </div>
    </Status>;
  }
}

