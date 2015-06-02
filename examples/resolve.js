var fingro = require('..');

var resolver = new fingro.Resolver();

resolver.use(require('../../fingro-webfinger')());
resolver.use(require('../../fingro-mx')());


//resolver.resolve('foo@bar.com');
// https://konklone.com/post/webfinger-gets-a-final-chance
resolver.resolve('acct:eric@konklone.com');
