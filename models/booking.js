var mongoose = require('mongoose'),
    dateFormat = require('dateformat'),
    counter = require('./counters');

mongoose.connect('mongodb://localhost/restful-booker');

mongoose.Promise = global.Promise;

var bookingSchema = mongoose.Schema({
    bookingid: {type: Number},
    firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    totalprice: { type: Number, required: true},
    depositpaid: { type: Boolean, required: true},
    dob: { type: mongoose.Schema.Types.Mixed, required: false},
    bookingdates: {
      checkin: { type: Date, required: true},
      checkout: { type: Date, required: true}
    },
    additionalneeds: { type: String, required: false}
  }, { versionKey: false });

var Booking = mongoose.model('Booking', bookingSchema);

bookingSchema.pre('save', function(next) {
    var doc = this;

    counter.bumpId(doc, function(id){
      doc.bookingid = id;
      next();
    });
});

exports.getIDsLimit = function(query, skipCount, callback){
  Booking.find(query).select('bookingid -_id').sort({'bookingid': 1}).limit(10).skip(skipCount).exec(function(err, booking){
    if(err){
      callback(err);
    } else {
      callback(null, booking);
    }
  });
},

exports.getIDs = function(query, callback){
  Booking.find(query).select('bookingid -_id').sort({'bookingid': 1}).exec(function(err, booking){
    if(err){
      callback(err);
    } else {
      callback(null, booking);
    }
  });
},

exports.get = function(id, callback){
  Booking.find({'bookingid': id}, function(err, booking){
    if(err){
      callback(err, null)
    } else {
      callback(null, booking[0]);
    }
  })
},

exports.create = function(payload, callback){
  var newBooking = new Booking(payload);

  newBooking.save(function(err, booking){
    if(err){
      callback(err);
    } else {
      callback(null, booking);
    }
  });
},

exports.update = function(id, updatedBooking, callback){
  Booking.find({'bookingid': id}).update(updatedBooking, function(err){
    callback(err);
  });
},

exports.delete = function(id, callback){
  Booking.remove({'bookingid': id}, function(err){
    callback(null);
  })
}

exports.deleteAll = function(callback){
  Booking.remove({}, function(err){
    callback(null);
  })
}
