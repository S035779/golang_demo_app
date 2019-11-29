import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import React from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import dotenv from 'dotenv';

import { ServerStyleSheets } from '@material-ui/styles';
import Static from 'Pages/Static/Static';

const config = dotenv.config();
if (config.error) throw new Error(config.error);

const APP_NAME = process.env.APP_NAME;
const loadable_stats_of_bundle_file =
  path.resolve(__dirname, '..', '..', 'dist', 'loadable-stats.json');

class Html extends React.Component {
  renderAsync() {
    const { initialData, location } = this.props;
    const extractor = new ChunkExtractor({
      statsFile: loadable_stats_of_bundle_file,
      entrypoints: ['app']
    });
    const sheets = new ServerStyleSheets();
    const content = sheets.collect(
      <ChunkExtractorManager extractor={extractor}>
        <Static location={location} />
      </ChunkExtractorManager>
    );
    const initialStyles = sheets.toString();
    const initialLinks  = extractor.getLinkElements();
    const bundleStyles  = extractor.getStyleElements();
    const bundleScripts = extractor.getScriptElements();
    return (<html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <title>{APP_NAME}</title>
        {initialLinks}
        {bundleStyles}
      </head>
      <body>
        <div id="app">{content}</div>
        <style id="jss-server-side">{initialStyles}</style>
        <script id="initial-data" type="text/plain" data-init={initialData} />
        {bundleScripts}
      </body>
    </html>);
  }

  render() {
    return this.renderAsync();
  }
}
Html.displayName = 'Html';
Html.defaultProps = {};
Html.propTypes = {
  initialData: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired
};
export default Html;
