import loadable from '@loadable/component';
import React from 'react';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

const StarredNoteList = loadable(() => import('Components/StarredNoteList/StarredNoteList'));

class Starred extends React.Component {
  static getStores() {
    return getStores(['starredNotesStore']);
  }

  static calculateState() {
    return getState('starredNotesStore');
  }

  static prefetch() {
    return NoteAction.fetchStarred();
  }

  componentDidMount() {
    Starred.prefetch();
  }

  render() {
    return <div className="page-Stars">
      <h1>Starred Notes</h1>
      <StarredNoteList notes={this.state.notes} />
    </div>;
  }
}

export default Container.create(Starred);
