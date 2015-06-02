var parallel = require('node-parallel');


function invoke(mech, identifier) {
  
  return function(done) {
    mech(identifier, function(err, results) {
      console.log('MECH DONE!');
    });
  }
}


function Resolver() {
  this.timeout = 5000;
  this._mechanisms = [];
}

Resolver.prototype.use = function(mech) {
  console.log('MECH');
  this._mechanisms.push(mech);
}

Resolver.prototype.resolve = function(identifier) {
  console.log('RESOLVING: ' + identifier);
  
  var self = this;
  
  parallel()
    .timeout(this.timeout)
    //.add(invoke(this._mechanisms[0], identifier)())
    .add(function(done) {
      console.log('RUN PARALLEL 1!');
      //done(new Error('E1'))
      done(null, '1')
    })
    .add(function(done) {
      console.log('RUN PARALLEL 2!');
      done(null, '2')
    })
    .add(function(done) {
      self._mechanisms[0](identifier, function(err, results) {
        console.log('GOT RESULTS 0');
        console.log(results);
        done(null, results);
      })
    })
    .add(function(done) {
      self._mechanisms[1](identifier, function(err, results) {
        console.log('GOT RESULTS 1');
        console.log(results);
        done(null, results);
      })
    })
    .done(function(err, results) {
      console.log('DONE!');
      console.log(err)
      console.log(results)
    });
  
}


/**
 * Expose `Resolver`.
 */
module.exports = Resolver;
