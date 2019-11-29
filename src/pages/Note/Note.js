import loadable from '@loadable/component';
import React from 'react';
import { withRouter } from 'react-router';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import StarAction from 'Actions/StarAction';
import { getStores, getState } from 'Stores';

const NoteHeader = loadable(() => import('Components/NoteHeader/NoteHeader'));
const NoteBody   = loadable(() => import('Components/NoteBody/NoteBody'));

class Note extends React.Component {
  static getStores() {
    return getStores(['noteStore']);
  }

  static calculateState() {
    return getState('noteStore');
  }

  static prefetch(props) {
    if (!props) return null;
    const { match } = props;
    const id = Object.keys(match.params).length === 0 ? 0 : Number(match.params.id);
    return NoteAction.fetch(id);
  }

  componentDidMount() {
    Note.prefetch(this.props);
  }

  handleChangeStar(starred) {
    const note = Object.assign({}, this.state.note, { starred });
    this.setState({ note });

    if (starred) {
      StarAction.create(note.id);
    }
    else {
      StarAction.delete(note.id);
    }
  }

  render() {
    const note = this.state.note;
    if (!note || !note.id) return null;

    return <div className="page-Note">
      <NoteHeader note={note} onChangeStar={this.handleChangeStar.bind(this)} />
      <NoteBody body={note.body} />
    </div>;
  }
}

export default withRouter(Container.create(Note));
