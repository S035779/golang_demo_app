import loadable from '@loadable/component';
import React from 'react';
import { hydrade } from 'react-dom';
import { loadableReady } from '@loadable/component';
import { createDispatcher } from 'Main/dispatcher';
import { rehydrateState } from 'Main/actions';
import { createStores } from 'Main/stores';

const Root = loadable(() => import('Pages/Root/Root'));
import Icon from 'Main/img/favicon.ico';

const favicon = (src, size) => {
  const dst = document.querySelector("link[rel*='icon']");
  if (dst && dst.size === size) return;
  const lnk = document.createElement('link');
  lnk.type = 'image/x-icon';
  lnk.rel = 'shortcut icon';
  lnk.href = src;
  if (size) lnk.sizes = size;
  document.getElementsByTagName('head')[0].appendChild(lnk);
};
favicon(Icon);

loadableReady(() => {
  const dispatcher = createDispatcher();
  createStores(dispatcher);

  const rootNode = document.getElementById('app');
  const dataNode = document.getElementById('initial-data');
  rehydrateState(JSON.parse(dataNode.getAttribute('data-init')));

  hydrade(<Root />, rootNode);
});
