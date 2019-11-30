import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

export default {
  authenticate(username, password) {
    return NoteApiClient.authenticate(username, password)
      .then(isAuthenticated => {
        dispatch({ type: 'login/authenticate', isAuthenticated });
      });
  },
  signout(username) {
    return NoteApiClient.signout(username)
      .then(isAuthenticated => {
        dispatch({ type: 'login/authenticate', isAuthenticated });
      });
  },
  registration(username, password) {
    return NoteApiClient.registration(username, password)
      .then(() => {
        dispatch({ type: 'login/registration', username });
      });
  },
  rehydrate(state) {
    dispatch({ type: 'login/rehydrate/my', state: state.loginStore });
  }
};
