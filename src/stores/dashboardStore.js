import { ReduceStore } from 'flux/utils';

class DashboardStore extends ReduceStore {
  getInitialState() {
    return { notes: [] };
  }

  reduce(state, action) {
    switch (action.type) {
      case 'note/fetch/my':
        return Object.assign({}, state, {
          notes: action.notes,
        });
      case 'note/create':
        return Object.assign({}, state, {
          notes: [action.note, ...state.notes],
        });
      case 'note/update':
        return Object.assign({}, state, {
          notes: state.notes.map(note => {
            return action.id === note.id ? Object.assign({}, note, action.note) : note;
          }),
        });
      case 'note/delete':
        return Object.assign({}, state, {
          notes: state.notes.filter(note => note.id !== action.id),
        });
      case 'note/rehydrate/my':
        return action.state;
      default:
        return state;
    }
  }
}
export default DashboardStore;
