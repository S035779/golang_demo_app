import stream from 'stream';
import React from 'react';
import { renderToStaticNodeStream } from 'react-dom/server';
import { matchRoutes } from 'react-router-config';
import { dehydrateState, createStores } from 'Stores';
import { createDispatcher } from 'Main/dispatcher';
import getRoutes from 'Routes';

import Html from 'Pages/Html/Html';

class ReactSSRenderer {
  constructor(options) {
    this.options = options;
  }

  static of(options) {
    return new ReactSSRenderer(options);
  }

  request() {
    return (req, res, next) => {
      const session = req.session;
      const location = req.originalUrl;
      createStores(createDispatcher());
      const routes = getRoutes();
      const matchs = matchRoutes(routes, location);
      const pass = new stream.PassThrough();
      pass.write('<!DOCTYPE html>');
      this.getUserData(matchs, session)
        .then(objs => this.prefetchData(matchs, objs))
        .then(() => this.setInitialData(location).pipe(pass).pipe(res))
        .then(() => next())
        .catch(err => res.status(500)
          .send({ error: { name: err.name, message: err.message, stack: err.stack } })
        );
    };
  }

  setInitialData(location) {
    const initialData = JSON.stringify(dehydrateState());
    return renderToStaticNodeStream(
      <Html initialData={initialData} location={location} />
    );
  }

  prefetchData(matchs, objs) {
    const promises = matchs.map(({ route, match }, index) => {
      return route.component.prefetch
        ? route.component.prefetch({ match, params: objs[index] })
        : Promise.resolve(null);
    });
    return Promise.all(promises);
  }

  getUserData(matchs, session) {
    const promises = matchs.map(({ route, match }) => {
      return route.loadData
        ? route.loadData({ match, session })
        : Promise.resolve(null);
    });
    return Promise.all(promises);
  }
}
ReactSSRenderer.displayName = 'ReactSSRenderer';
export default ReactSSRenderer;
