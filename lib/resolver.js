var sort = require('stable');
var Parallel = require('node-parallel');


function wrap(fn, identifier, type) {
  
  return function(done) {
    fn(identifier, type, function(err, results) {
      console.log('MECH DONE!');
      console.log(err);
      console.log(results);
      
      if (err) { return done(err); }
      
      return done(null, results);
      
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

Resolver.prototype.resolve = function(identifier, cb) {
  console.log('FINGRO RESOLVING: ' + identifier);
  
  // TODO: Better normalizations
  identifier = 'acct:' + identifier;
  
  
  var self = this
    , stages = this._stages
    , stage
    , i = 0;
    
  (function iter(err) {
    if (err) { return cb(err); }
  
    var stage = stages[i++];
    if (!stage) {
      // TODO: Make this mirror DNS module errors
      return cb(new Error('not found'));
    }
    
    var parallel = new Parallel();
    parallel.timeout(self.timeout);
    
    var mech
      , j, len;
    for (j = 0, len = stage.length; j < len; ++j) {
      mech = stage[j];
      parallel.add(wrap(mech.fn, identifier));
      
    }
    
    parallel.done(function(err, results) {
      console.log('PARALLEL DONE');
      console.log(err);
      console.log(results);
    })
  
  
  })();
}


/**
 * Expose `Resolver`.
 */
module.exports = Resolver;
