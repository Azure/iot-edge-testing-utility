'use strict';

var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;
var logger = require('./logger').log;
var printer = require('./logger').printer;

var client = undefined;

async function createClient() {
  return await new Promise((resolve, reject) => {
    Client.fromEnvironment(Mqtt, (err, client) => {
      if (err) {
        logger.error(`Cannot create client: ${err.message}`);
        return reject(new Error(err.toString()));
      } else {
        return resolve(client);
      }
    });
  })
}

async function openConnection(client) {
  if (!client) {
    return new Error('client was not created');
  }

  return await new Promise((resolve, reject) => {
    client.open((err) => {
      if (err) {
        logger.error(`Cannot open connection: ${err.message}`);
        return reject(new Error(err.toString()));
      } else {
        logger.info('Client connected');
        return resolve();
      }
    });
  });
}

function printInput(inputName, msg) {
  if (inputName === 'print') {
    const message = msg.getBytes().toString('utf-8');
    printer.info(message);
  }
}

async function initModule() {
  client = await createClient();
  client.on('error', (err) => {
    logger.error(err.message);
  });
  await openConnection(client);
  client.on('inputMessage', (inputName, msg) => {
    client.complete(msg, (err) => {
      if (err) {
        logger.error(`Complete message fail with error: ${err.message}`);
      }
    });
    printInput(inputName, msg);
  });
}

async function sendOutputEvent(channel, message) {
  if (!client) {
    throw new Error('Module has not been initialized');
  }

  return await new Promise((resolve, reject) => {
    client.sendOutputEvent(channel, message, (err) => {
      if(err) {
        logger.error(`Send message fail: ${err.message}`);
        return reject(new Error(err.toString()));
      } else {
        logger.info('Send message successfully');
        return resolve();
      }
    });
  });
}

function getValidateMessage(requestBody) {
  if (!requestBody) {
    throw new Error('No request body provided');
  }

  const channel = requestBody.inputName;
  if (!channel) {
    throw new Error('Cannot get inputName in request body.');
  }

  const data = requestBody.data;
  if (!data) {
    throw new Error('Cannot find message data in request body');
  }

  const message = new Message(data);
  if(requestBody.properties && typeof requestBody.properties === 'object') {
    const properties = requestBody.properties;
    for(const property in properties) {
      if (properties.hasOwnProperty(property)) {
        message.properties.add(property, properties[property]);
      }
    }
  }

  if (requestBody.messageId) {
    message.messageId = requestBody.messageId;
  }

  if (requestBody.correlationId) {
    message.correlationId = requestBody.correlationId;
  }

  if (requestBody.userId) {
    message.userId = requestBody.userId;
  }

  return {channel, message};
}

async function sendMessage(requestBody) {
  const {channel, message} = getValidateMessage(requestBody);
  await this.sendOutputEvent(channel, message);
}

module.exports = {
  initModule: initModule,
  sendMessage: sendMessage,
  getValidateMessage: getValidateMessage,
  sendOutputEvent: sendOutputEvent
};
