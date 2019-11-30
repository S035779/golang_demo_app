import loadable from '@loadable/component';

const Home      = loadable(() => import('Pages/Home/Home'));
const SignIn    = loadable(() => import('Pages/SignIn/SignIn'));
const SignUp    = loadable(() => import('Pages/SignUp/SignUp'));
const Auth      = loadable(() => import('Pages/Auth/Auth'));
const App       = loadable(() => import('Pages/App/App'));
const Dashboard = loadable(() => import('Pages/Dashboard/Dashboard'));
const Note      = loadable(() => import('Pages/Note/Note'));
const NoteEdit  = loadable(() => import('Pages/Dashboard/NoteEdit/NoteEdit'));
const Starred   = loadable(() => import('Pages/Starred/Starred'));
const NotFound  = loadable(() => import('Pages/NotFound/NotFound'));

export default function getRoutes() {
  return [
    { component: App, routes: [
      { path: '/home', component: Home },
      { path: '/signin', component: SignIn },
      { path: '/signup', component: SignUp },
      { component: Auth, routes: [
        { exact: true, path: '/', component: Dashboard },
        { exact: true, path: '/notes/:id', component: Note },
        { exact: true, path: '/notes/:id/edit', component: Dashboard, routes: [
          { component: NoteEdit }
        ] },
        { path: '/starred', component: Starred },
        { path: '**', component: NotFound }
      ] }
    ] }
  ];
}
