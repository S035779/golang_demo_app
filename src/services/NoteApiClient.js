const LATENCY = 200;

let notes = require('./data');
let starred = [1, 2, 3];
const users = [];
let loggedIn = [];

export default {
  request(response) {
    return new Promise(resolve => {
      setTimeout(() => resolve(response), LATENCY);
    });
  },

  wait() {
    return new Promise(resolve => setTimeout(resolve, LATENCY));
  },

  registration(username, password) {
    const id = users.length + 1;
    const user = { id, username, password, updated: this.getUpdated() };
    users.unshift(user);
    return this.request(user);
  },

  authenticate(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    loggedIn.unshift(user.id);
    return this.request(Object.assign({ isAuthenticated: loggedIn.includes(user.id) }, user));
  },

  signout(username) {
    const user = users.find(user => user.username === username);
    loggedIn = loggedIn.filter(id => id !== user.id);
    return this.request(null);
  },

  getUpdated() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.toTimeString().split(' ')[0]}`;
  },

  myNotes() {
    const response = notes.filter(note => note.user === 'MyUserName');
    return response;
  },

  fetchMyNotes() {
    const response = this.request(this.myNotes());
    return response;
  },

  fetchStarredNotes() {
    return this.request(notes.filter(note => starred.includes(note.id)));
  },

  fetchNote(id) {
    const note = notes.find(note => note.id === id);
    return this.request(Object.assign({ starred: starred.includes(note.id) }, note));
  },

  createNote() {
    const id = notes.length + 1;
    const note = { id, title: 'Untitled', body: '', user: 'MyUserName', updated: this.getUpdated() };
    notes.unshift(note);
    return this.request(note);
  },

  updateNote(id, { title, body }) {
    notes = notes.map(note => {
      if (note.id === id) {
        return Object.assign({}, note, { title, body, updated: this.getUpdated() });
      }
      else {
        return note;
      }
    });
    return this.request(null);
  },

  deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    return this.request(null);
  },

  createStar(id) {
    starred.push(id);
    return this.request(null);
  },

  deleteStar(id) {
    starred = starred.filter(_id => _id !== id);
    return this.request(null);
  },
};
