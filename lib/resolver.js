var sort = require('stable');
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
  this._stages = [];
  this._prio = 0;
}

Resolver.prototype.use = function(mech, options) {
  options = options || {};
  
  var prio = options.priority;
  if (prio !== undefined) {
    this._prio = options.priority + 1;
  } else {
    prio = this._prio++;
  }
  this._mechanisms.push({ fn: mech, prio: prio });
  
  // Sort, in a stable manner, the mechanisms by priority.
  var sorted = sort(this._mechanisms, function(lhs, rhs) {
    return rhs.prio < lhs.prio;
  });
  
  // Group the mechanisms into a 2-dimensional array of stages.  Each stage
  // contains an array of mechanisms of equal priority.  When resolving, all
  // mehanisms within a stage will be run in parallel.  If resolution succeeds
  // at that stage, lower priority mechanisms will not be attempted.  If
  // resolution fails at thet stage, the mechanisms in the next highest priority
  // stage will be attempted.
  var stages = []
    , mechs = []
    , sp = sorted[0].prio
    , mech, i, len;
  for (i = 0, len = sorted.length; i < len; ++i) {
    mech = sorted[i];
    if (mech.prio == sp) {
      mechs.push(mech);
    } else {
      stages.push(mechs);
      mechs = [ mech ];
      sp = mech.prio;
    }
    
  }
  stages.push(mechs);
  
  this._stages = stages;
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
      self._mechanisms[0].mech(identifier, function(err, results) {
        console.log('GOT RESULTS 0');
        console.log(results);
        done(null, results);
      })
    })
    .add(function(done) {
      self._mechanisms[1].mech(identifier, function(err, results) {
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
