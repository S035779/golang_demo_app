import loadable from '@loadable/component';
import React from 'react';
import Icon from "Main/img/user.svg";

const Button     = loadable(() => import('Components/Button/Button'));
const StarButton = loadable(() => import('Components/StarButton/StarButton'));

export default class NoteHeader extends React.Component {
  isOwn() {
    return this.props.note.user === 'MyUserName';
  }

  handleClickEdit() {
    this.props.history.push(`/notes/${this.props.note.id}/edit`);
  }

  handleClickDelete() {
    if (window.confirm('Are you sure?')) {
      this.props.onDeleteNote();
    }
  }

  render() {
    const note = this.props.note;

    return <div className="NoteHeader">
      <h1 className="NoteHeader-title">
        {note.title}
      </h1>
      <div className="NoteHeader-meta">
        <span className="NoteHeader-author"><img src={Icon} width="24" height="24" /> {note.user}</span>
        <span className="NoteHeader-updated">{note.updated}</span>
      </div>
      <div className="NoteHeader-buttons">
        <Button hidden={!this.isOwn()} onClick={() => this.handleClickEdit()}>Edit</Button>
        <StarButton starred={note.starred} onChange={this.props.onChangeStar} />
      </div>
    </div>;
  }
}
