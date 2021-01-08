/* eslint-env mocha */

process.env.NODE_ENV = 'test';
const utilityModule = require('../src/utilityModule');

const chai = require('chai');
const chaiHttp = require('chai-http');
// eslint-disable-next-line no-unused-vars
const should = chai.should();
const expect = chai.expect;
const sinon = require('sinon');
const assert = require('assert');
chai.use(chaiHttp);

describe('server', () => {
  sinon.stub(utilityModule, 'initModule').callsFake(() => {});

  const server = require('../src/server');

  describe('/POST message', () => {
    it('it should invoke the sendOutputEvent', (done) => {
      const stub = sinon.stub(utilityModule, 'sendOutputEvent').callsFake(() => {});
      chai.request(server)
        .post('/api/v1/messages')
        .set('Content-Type', 'application/json')
        .send({
          'inputName': 'input1',
          'data': 'Hello World',
          'properties': {
            'test': true
          },
          'messageId': '0',
          'correlationId': '1'
        })
        .end((err, res) => {
          assert(stub.calledOnce);
          assert.equal(stub.args[0][0], 'input1');
          assert.equal(stub.args[0][1]['data'], JSON.stringify('Hello World'));
          assert.equal(stub.args[0][1]['messageId'], '0');
          assert.equal(stub.args[0][1]['correlationId'], '1');
          res.should.have.status(202);
          stub.restore();
          done();
        });
    });

    it('it should invoke the sendOutputEvent when valid JSON message is passed', (done) => {
      const stub = sinon.stub(utilityModule, 'sendOutputEvent').callsFake(() => {});
      chai.request(server)
        .post('/api/v1/messages')
        .set('Content-Type', 'application/json')
        .send({
          'inputName': 'input1',
          'data': [{'created_at':'2018-01-30 10:26:2 -0500','field1':'1.0','field2':'2.0'},{'created_at':'2018-02-02 11:27:27 -0500','field1':'1.1','field2':'2.2','status':'well done'}],
          'properties': {
            'test': true
          },
          'messageId': '0',
          'correlationId': '1'
        })
        .end((err, res) => {
          assert(stub.calledOnce);
          assert.equal(stub.args[0][0], 'input1');
          assert.equal(stub.args[0][1]['data'], JSON.stringify([{'created_at':'2018-01-30 10:26:2 -0500','field1':'1.0','field2':'2.0'},{'created_at':'2018-02-02 11:27:27 -0500','field1':'1.1','field2':'2.2','status':'well done'}]));
          assert.equal(stub.args[0][1]['messageId'], '0');
          assert.equal(stub.args[0][1]['correlationId'], '1');
          res.should.have.status(202);
          stub.restore();
          done();
        });
    });

    it('it should show correct error if inputName is missing', (done) => {
      const stub = sinon.stub(utilityModule, 'sendOutputEvent').callsFake(() => {});
      chai.request(server)
        .post('/api/v1/messages')
        .set('Content-Type', 'application/json')
        .send({
          'channel': 'input1',
          'data': 'Hello World',
          'properties': {
            'test': true
          },
          'messageId': '0',
          'correlationId': '1'
        })
        .end((err, res) => {
          assert(!stub.called);
          res.should.have.status(500);
          expect(res).to.be.json;
          assert(res.body['error'].includes('Cannot get inputName'));
          stub.restore();
          done();
        });
    });

    it('it should return 500 if error happen', (done) => {
      chai.request(server)
        .post('/api/v1/messages')
        .set('Content-Type', 'application/json')
        .send({
          'inputName': 'input1',
          'data': 'Hello World',
          'properties': {
            'test': true
          },
          'messageId': '0',
          'correlationId': '1'
        })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it('it should return 404 if no resource', (done) => {
      sinon.restore();
      chai.request(server)
        .post('/api/v1/test')
        .set('Content-Type', 'application/json')
        .send({
          'inputName': 'input1',
          'data': 'Hello World',
          'properties': {
            'test': true
          },
          'messageId': '0',
          'correlationId': '1'
        })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
