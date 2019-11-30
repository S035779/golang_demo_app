import NoteAction from 'Actions/NoteAction';
import StarAction from 'Actions/StarAction';
import LoginAction from 'Actions/LoginAction';

export function rehydrateState(state) {
  NoteAction.rehydrate(state);
  StarAction.rehydrate(state);
  LoginAction.rehydrate(state);
}
