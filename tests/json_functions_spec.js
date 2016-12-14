var request      = require('supertest-as-promised'),
    expect       = require('chai').expect,
    should       = require('chai').should(),
    mongoose     = require('mongoose'),
    assert       = require('assert'),
    helpers      = require('./helpers'),
    server;

mongoose.createConnection('mongodb://localhost/restful-booker');

var payload  = helpers.generatePayload('Sally', 'Brown', 111, true, 'Breakfast', '2013-02-01', '2013-02-04'),
    payload2 = helpers.generatePayload('Geoff', 'White', 111, true, 'Breakfast', '2013-02-02', '2013-02-05'),
    payload3 = helpers.generatePayload('Bob', 'Brown', 111, true, 'Breakfast', '2013-02-03', '2013-02-06');

describe('restful-booker', function () {

  beforeEach(function(){
    process.env['payload'] = 'json';
    delete require.cache[require.resolve('../app')];
    server = require('../app');

    mongoose.connection.db.dropDatabase();
  });

  it('responds to /ping', function testPing(done){
    request(server)
      .get('/ping')
      .expect(201, done);
  });

  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });

});

describe('restful-booker - GET /booking - JSON feature switch', function () {

  beforeEach(function(){
    process.env['payload'] = 'json';
    delete require.cache[require.resolve('../app')];
    server = require('../app');

    mongoose.connection.db.dropDatabase();
  });

  it('responds with all booking ids when GET /booking', function testGetAllBookings(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        request(server)
          .get('/booking')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.match(/[0-9]/);
            res.body[1].should.have.property('bookingid').and.match(/[0-9]/);
          })
          .end(done);
      });
  });

  it('responds with a subset of booking ids when searching by firstname date', function testQueryString(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        request(server)
          .get('/booking?firstname=Geoff')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.equal(2);
          })
          .end(done)
      })
  });

  it('responds with a subset of booking ids when searching by lastname date', function testQueryString(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        request(server)
          .get('/booking?lastname=White')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.equal(2);
          })
          .end(done)
      })
  });

  it('responds with a subset of booking ids when searching for checkin date', function testQueryString(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        request(server)
          .get('/booking?checkin=2013-02-01')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.equal(2);
          })
          .end(done)
      })
  });

  it('responds with a subset of booking ids when searching for checkout date', function testQueryString(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        request(server)
          .get('/booking?checkout=2013-02-05')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.equal(1);
          })
          .end(done)
      })
  });

  it('responds with a subset of booking ids when searching for checkin and checkout date', function testQueryString(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        return request(server)
          .post('/booking')
          .send(payload3)
      }).then(function(){
        request(server)
          .get('/booking?checkin=2013-02-01&checkout=2013-02-06')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.equal(2);
          })
          .end(done)
      });
  });

  it('responds with a subset of booking ids when searching for name, checkin and checkout date', function testQueryString(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/booking')
          .send(payload2)
      }).then(function(){
        return request(server)
          .post('/booking')
          .send(payload3)
      }).then(function(){
        request(server)
          .get('/booking?firstname=Geoff&lastname=White&checkin=2013-02-01&checkout=2013-02-06')
          .expect(200)
          .expect(function(res){
            res.body[0].should.have.property('bookingid').and.equal(2);
          })
          .end(done)
      })
  });

  it('responds with a 500 error when GET /booking with a bad date query string', function testGetWithBadDate(done){
    request(server)
      .get('/booking?checkout=2013-02-0')
      .expect(500, done)
  });

  it('responds with a payload when GET /booking/{id}', function testGetOneBooking(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(res){
        request(server)
          .get('/booking/1')
          .set('Accept', 'application/json')
          .expect(200)
          .expect(payload, done)
      });
  });

});

describe('restful-booker - POST /booking - JSON feature switch', function () {

  beforeEach(function(){
    process.env['payload'] = 'json';
    delete require.cache[require.resolve('../app')];
    server = require('../app');

    mongoose.connection.db.dropDatabase();
  });

  it('responds with the created booking and assigned booking id', function testCreateBooking(done){
    request(server)
      .post('/booking')
      .set('Accept', 'application/json')
      .send(payload)
      .expect(200)
      .expect(function(res){
        res.body.bookingid.should.equal(1);
        res.body.booking.should.deep.equal(payload);
      })
      .end(done)
  });

  it('responds with a 500 error when a bad payload is sent', function testCreateBadBooking(done){
    badpayload = { 'lastname': 'Brown', 'totalprice': 111, 'depositpaid': true, 'additionalneeds': 'Breakfast'}

    request(server)
      .post('/booking')
      .send(badpayload)
      .expect(500, done);
  });

  it('responds with the correct assigned booking id when multiple payloads are sent', function testBookingId(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        request(server)
          .post('/booking')
          .send(payload2)
          .set('Accept', 'application/json')
          .expect(200)
          .expect(function(res) {
            res.body.bookingid.should.equal(2);
          })
          .end(done)
      })
  });

  it('responds with a 200 when a payload with too many params are sent', function testCreateExtraPayload(done){
    var extraPayload = payload
    extraPayload.extra = 'bad'

    request(server)
      .post('/booking')
      .set('Accept', 'application/json')
      .send(extraPayload)
      .expect(200, done);
  });

});

describe('restful-booker POST /auth - JSON feature switch', function(){

  beforeEach(function(){
    process.env['payload'] = 'json';
    delete require.cache[require.resolve('../app')];
    server = require('../app');

    mongoose.connection.db.dropDatabase();
  });

  it('responds with a 200 and a token to use when POSTing a valid credential', function testAuthReturnsToken(done){
    request(server)
      .post('/auth')
      .send({'username': 'admin', 'password': 'password123'})
      .expect(200)
      .expect(function(res){
        res.body.should.have.property('token').and.to.match(/[a-zA-Z0-9]{15,}/);
      })
      .end(done)
  })

  it('responds with a 200 and a message informing of login failed when POSTing invalid credential', function testAuthReturnsError(done){
    request(server)
      .post('/auth')
      .send({'username': 'nimda', 'password': '321drowssap'})
      .expect(200)
      .expect(function(res){
        res.body.should.have.property('reason').and.to.equal('Bad credentials');
      })
      .end(done)
  })

});

describe('restful-booker - PUT /booking - JSON feature switch', function () {

  beforeEach(function(){
    process.env['payload'] = 'json';
    delete require.cache[require.resolve('../app')];
    server = require('../app');

    mongoose.connection.db.dropDatabase();
  });

  it('responds with a 403 when no token is sent', function testNoLoginForPut(done){
    request(server)
      .put('/booking/1')
      .expect(403, done);
  });

  it('responds with a 403 when not authorised', function testBadLoginForPut(done){
      request(server)
        .post('/auth')
        .send({'username': 'nmida', 'password': '321drowssap'})
        .expect(200)
        .then(function(res){
          request(server)
            .put('/booking/1')
            .set('Accept', 'application/json')
            .set('Cookie', 'token=' + res.body.token)
            .send(payload2)
            .expect(403, done)
        })
  });

  it('responds with a 200 and an updated payload', function testUpdatingABooking(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/auth')
          .send({'username': 'admin', 'password': 'password123'})
      })
      .then(function(res){
        request(server)
          .put('/booking/1')
          .set('Accept', 'application/json')
          .set('Cookie', 'token=' + res.body.token)
          .send(payload2)
          .expect(200)
          .expect(payload2, done);
      })
  });

  it('responds with a 200 and an updated payload using auth', function testUpdatingABooking(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(res){
        request(server)
          .put('/booking/1')
          .set('Accept', 'application/json')
          .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQxMjM=')
          .send(payload2)
          .expect(200)
          .expect(payload2, done);
      })
  });

  it('responsds with a 405 when attempting to update a booking that does not exist', function testUpdatingNonExistantBooking(done){
      request(server)
      .post('/auth')
      .send({'username': 'admin', 'password': 'password123'})
      .then(function(res){
        request(server)
          .put('/booking/100000')
          .set('Accept', 'application/json')
          .set('Cookie', 'token=' + res.body.token)
          .send(payload2)
          .expect(405, done);
      })
  });

});

describe('restful-booker DELETE /booking - JSON feature switch', function(){

  beforeEach(function(){
    process.env['payload'] = 'json';
    delete require.cache[require.resolve('../app')];
    server = require('../app');

    mongoose.connection.db.dropDatabase();
  });

  it('responds with a 403 when not authorised', function testNoLoginForDelete(done){
    request(server)
      .delete('/booking/1')
      .expect(403, done);
  });

  it('responds with a 403 when not authorised', function testBadLoginForDelete(done){
      request(server)
        .post('/auth')
        .send({'username': 'nmida', 'password': '321drowssap'})
        .expect(200)
        .then(function(res){
          request(server)
            .delete('/booking/1')
            .set('Cookie', 'token=' + res.body.token)
            .expect(403, done)
        })
  })

  it('responds with a 201 when deleting an existing booking', function testDeletingAValidBooking(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        return request(server)
          .post('/auth')
          .send({'username': 'admin', 'password': 'password123'})
      })
      .then(function(res){
        return request(server)
          .delete('/booking/1')
          .set('Cookie', 'token=' + res.body.token)
          .expect(201)
      }).then(function(){
        request(server)
          .get('/booking/1')
          .expect(404, done)
      });
  });

  it('responds with a 201 when deleting an existing booking with a basic auth header', function testDeletingAValidBookingWithAuth(done){
    request(server)
      .post('/booking')
      .send(payload)
      .then(function(res){
        return request(server)
          .delete('/booking/1')
          .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQxMjM=')
          .expect(201)
      }).then(function(){
        request(server)
          .get('/booking/1')
          .expect(404, done)
      });
  });

  it('responds with a 405 when deleting a non existing booking', function testDeletingNonExistantBooking(done){
    request(server)
      .post('/auth')
      .send({'username': 'admin', 'password': 'password123'})
      .then(function(res){
        request(server)
          .delete('/booking/1')
          .set('Cookie', 'token=' + res.body.token)
          .expect(405, done)
      })
  })

});
