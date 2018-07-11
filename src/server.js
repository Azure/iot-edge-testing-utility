'use strict';

const express  = require('express');
const utilityModule  = require('./utilityModule');
const logger = require('./logger').log;
const http  = require('http');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const router = express.Router();

router.use(function log(req, res, next) {
  logger.info(`Time: ${Date.now()} ${req.method} ${req.path}`);
  next();
});

router.post('/api/v1/messages', async(req, res, next) => {
  try {
    await utilityModule.sendMessage(req.body);
    res.status(202).json({'message': 'accepted'});
  } catch(err) {
    next(err);
  }
});

app.use('/', router);

app.use('*', (req, res) => {
  res.status(404).json({'error': 'I don\'t have that'});
});

app.use('*', (err, req, res, next) => {
  if (err) {
    res.status(500).json({'error': err.toString()});
  } else {
    res.status(404).json({'error': 'I don\'t have that'});
  }
});

const server = http.createServer(app);
const port = process.env['PORT'] || 3000;
async function startServer() {
  try {
    await utilityModule.initModule();
    server.listen(port);
    server.on('listening', async () => {
      if (process.send) {
        process.send('online');
      }
      logger.info(`app listening on ${port}`);
    });
  } catch (err) {
    logger.error(`Initialize module fail: ${err.message}`);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  process.exit(1);
});

startServer();
module.exports = server;
