import NoteAction from 'Actions/NoteAction';
import StarAction from 'Actions/StarAction';

export function rehydrateState(state) {
  NoteAction.rehydrate(state);
  StarAction.rehygrate(state);
}
