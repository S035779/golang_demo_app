import loadable from '@loadable/component';
import React from 'react';
import { withRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

const Button   = loadable(() => import('Components/Button/Button'));
const NoteList = loadable(() => import('Components/NoteList/NoteList'));

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(props) {
    console.log(props);
    return NoteAction.fetchMyNotes();
  }

  componentDidMount() {
    Dashboard.prefetch();
  }

  handleClickNew() {
    NoteAction.create();
  }

  render() {
    const { route, match } = this.props;
    const id = Object.keys(match.params).length === 0 ? 0 : Number(match.params.id);
    const note = this.state.notes.find(note => note.id === id);
    return <div className="page-Dashboard">
      <div className="page-Dashboard-list">
        <div className="page-Dashboard-listHeader">
          <Button onClick={() => this.handleClickNew()}>New Note</Button>
        </div>
        <div role="navigation">
          <NoteList notes={this.state.notes} selectedNoteId={id} />
        </div>
      </div>
      <div className="page-Dashboard-main" role="form">
        {renderRoutes(route.routes, { note: note })}
      </div>
    </div>;
  }
}

export default withRouter(Container.create(Dashboard));
