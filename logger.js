'use strict';

const winston = require('winston');
const fse = require('fs-extra');

winston.loggers.add('log', {
  console: {
    level: 'info',
    handleExceptions: true,
    humanReadableUnhandledException: true
  }
});

const labelName = 'PrintInput';
const printer = 'printer';
const filePath = process.env.ModuleOutputFile;
if (filePath) {
  const exist = fse.existsSync(filePath);
  if (exist) {
    winston.loggers.add(printer, {
      console: {
        level: 'info',
        label: labelName
      },
      file: {
        filename: filePath,
        json: false,
        level: 'info',
        label: labelName
      }
    });
  }
} else {
  winston.loggers.add(printer, {
    console: {
      level: 'info',
      label: labelName
    }
  });
}

module.exports = {
  log: winston.loggers.get('log'),
  printer: winston.loggers.get(printer)
};
