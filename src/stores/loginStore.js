import { ReduceStore } from 'flux/utils';
import * as R from 'ramda';

export default class LoginStore extends ReduceStore {
  getInitialState() {
    return {
      isAuthenticated: false,
      username: ''
    };
  }

  reduce(state, action) {
    switch (action.type) {
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      case 'login/registration':
        return R.merge(state, { username: action.username });
      case 'login/rehydrate/my':
        return action.state;
      default:
        return state;
    }
  }
}
