import loadable from '@loadable/component';
import React from 'react';
import NoteAction from 'Actions/NoteAction';

const Button   = loadable(() => import('Components/Button/Button'));
const NoteBody = loadable(() => import('Components/NoteBody/NoteBody'));

class NoteEdit extends React.Component {
  constructor(props) {
    super(props);
    // 編集中のNoteのデータは永続化する必要ないし外でも使わないのでstateで持つ
    this.state = { note: Object.assign({}, props.note) };
  }

  static getDerivedStateFromProps(nextProps) {
    return { note: Object.assign({}, nextProps.note) };
  }

  handleSave() {
    const { id, title, body } = this.state.note;
    NoteAction.update(id, { title, body });
  }

  handleDelete() {
    if (window.confirm('Are you sure?')) {
      NoteAction.delete(this.state.note.id);
    }
  }

  handleShow() {
    this.props.history.push(`/notes/${this.state.note.id}`);
  }

  onChangeTitle(e) {
    this.setState({ note: Object.assign({}, this.state.note, { title: e.target.value }) });
  }

  onChangeBody(e) {
    this.setState({ note: Object.assign({}, this.state.note, { body: e.target.value }) });
  }

  render() {
    const note = this.state.note;
    if (!note.id) return null;

    // 変更があったらSaveボタンのところに編集中マークを出す。
    const isChanged = this.props.note.title !== note.title || this.props.note.body !== note.body;

    return <div className="page-NoteEdit">
      <div className="page-NoteEdit-header">
        <input aria-label="タイトル" ref="title" type="text" value={note.title} onChange={this.onChangeTitle.bind(this)} data-page-title={true} />
        <div className="page-NoteEdit-buttons">
          <Button onClick={this.handleSave.bind(this)}>{isChanged ? '* ' : ''}Save</Button>
          <Button onClick={this.handleDelete.bind(this)}>Delete</Button>
          <Button onClick={this.handleShow.bind(this)}>Show</Button>
        </div>
      </div>
      <div className="page-NoteEdit-body">
        <label htmlFor="note-body" className="u-for-at">本文</label>
        <textarea id="note-body" value={note.body} onChange={this.onChangeBody.bind(this)} />
      </div>
      <div className="page-NoteEdit-preview">
        <NoteBody body={note.body} />
      </div>
    </div>;
  }
}

export default NoteEdit;
