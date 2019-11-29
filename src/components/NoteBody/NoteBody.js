import React from 'react';
import marked from 'marked';

export default class NoteBody extends React.Component {
  render() {
    return (<div
      className="NoteBody"
      dangerouslySetInnerHTML={{ __html: marked(this.props.body) }}
    />);
  }
}
