import loadable from '@loadable/component';
const App       = loadable(() => import('Pages/App/App'));
const Dashboard = loadable(() => import('Pages/Dashboard/Dashboard'));
const Note      = loadable(() => import('Pages/Note/Note'));
const NoteEdit  = loadable(() => import('Pages/Dashboard/NoteEdit/NoteEdit'));
const Starred   = loadable(() => import('Pages/Starred/Starred'));
const NotFound  = loadable(() => import('Pages/NotFound/NotFound'));

const getRoutes = () => {
  return [
    { component: App, routes: [
      { exact: true, path: '/notes/:id', component: Note },
      { path: '/starred', component: Starred },
      { path: '/notes/:id/edit', component: Dashboard, routes: [
        { component: NoteEdit }
      ] },
      { path: '/', component: Dashboard },
      { path: '**', component: NotFound }
    ] }
  ];
};

export default getRoutes;
