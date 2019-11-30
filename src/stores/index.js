import DashboardStore from 'Stores/dashboardStore';
import NoteStore from 'Stores/noteStore';
import StarredNotesStore from 'Stores/starredNotesStore';
import LoginStore from 'Stores/loginStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore: new DashboardStore(dispatcher),
    noteStore: new NoteStore(dispatcher),
    starredNotesStore: new StarredNotesStore(dispatcher),
    loginStore: new LoginStore(dispatcher)
  };
}

export function getStore(name) {
  return stores[name];
}

export function getStores(names) {
  return names.map(name => getStore(name));
}

export function getState(name) {
  return getStore(name).getState();
}

export function dehydrateState() {
  return {
    dashboardStore: getState('dashboardStore'),
    noteStore: getState('noteStore'),
    starredNotesStore: getState('starredNotesStore'),
    loginStore: getState('loginStore')
  };
}
