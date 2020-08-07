/* eslint-disable unicorn/no-process-exit */
require('dotenv').config();

const express = require('express');
const next = require('next');
const routes = require('./routes');
const helmet = require('helmet');

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV !== 'production';
const app = next({ dev });
const handler = routes.getRequestHandler(app);
const disableCache = process.env.DISABLE_CACHE === 'true';

const setCacheHeader = (_req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=300, stale-while-revalidate=600');
  next();
};

const port = parseInt(PORT || '3000', 10);
if (Number.isNaN(port)) {
  throw new TypeError('Invalid PORT.');
}

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(
      [
        '/apple-app-site-association',
        '/.well-known/apple-app-site-association',
      ],
      (_req, res) => {
        res.json({
          applinks: {
            apps: [],
            details: [
              {
                appID: 'A8XZ5C62P6.com.hk01.news-app',
                paths: ['*'],
              },
              {
                appID: 'B9FCC7VU7J.com.hk01.news-app.prd',
                paths: ['*'],
              },
              {
                appID: 'B9FCC7VU7J.com.hk01.news-app.stg',
                paths: ['*'],
              },
            ],
          },
        });
      }
    );

    server.use(helmet());
    server.use(disableCache ? helmet.noCache() : setCacheHeader);

    server.use(require('./redirect')(app));
    server.use(handler);
    server.listen(port, '0.0.0.0', err => {
      if (err) throw err;
      console.log(`> Ready on http://0.0.0.0:${port}`);
    });
  })
  .catch(err => {
    console.log(err.stack);
    process.exit(1);
  });