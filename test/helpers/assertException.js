const should = require('chai')
  .should();

async function assertException (promise) {
  try {
    await promise;
  } catch (error) {
    error.message.should.include('Exception', `Expected "Exception", got ${error} instead`);
    return;
  }
  should.fail('Expected revert not received');
}

module.exports = {
  assertException,
};
