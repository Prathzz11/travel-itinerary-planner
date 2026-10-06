const mongoose = require('mongoose');
const Trip = require('../models/Trip');

// Mongoose binds every model operation in the callback to the same session.
mongoose.set('transactionAsyncLocalStorage', true);

const tripTransaction = (permission, handler) => async (req, res, next) => {
  if (process.env.MONGO_TRANSACTIONS !== 'required') return handler(req, res, next);
  let response;
  try {
    await mongoose.connection.transaction(async () => {
      response = { status: 200, body: undefined };
      // Every trip mutation writes this fence first. Concurrent mutations retry
      // against fresh membership and financial records, rather than stale reads.
      const trip = await Trip.findOneAndUpdate({_id:req.params.id},{$inc:{transactionRevision:1}},{new:true});
      if (!trip) throw Object.assign(new Error('Trip not found'),{status:404});
      const owner = String(trip.owner) === String(req.user._id);
      const member = trip.members.find(m=>String(m.user)===String(req.user._id));
      if (!owner && !(member && (permission === 'admin' ? member.role === 'admin' : ['admin','editor'].includes(member.role)))) throw Object.assign(new Error('Access denied'),{status:403});
      req.trip = trip;
      const staged = {
        status(code) { response.status=code;return this; },
        json(body) { response.body=body;return this; }
      };
      await handler(req,staged,next);
      if (response.status >= 400) throw Object.assign(new Error(response.body?.message || 'Write rejected'),{status:response.status,body:response.body});
      if (response.body === undefined) throw new Error('Transaction handler did not return a response');
    },{readConcern:{level:'snapshot'},writeConcern:{w:'majority'},readPreference:'primary'});
    // Never report success before the database confirms commit.
    return res.status(response.status).json(response.body);
  } catch(error) {
    const unsupported = error.code === 20 || error.codeName === 'IllegalOperation';
    const status = unsupported ? 503 : error.status || 500;
    return res.status(status).json(error.body || {message:unsupported ? 'MongoDB transactions require a replica set. Configure the database before enabling transaction mode.' : status < 500 ? error.message : 'Could not commit changes. Please retry.'});
  }
};
module.exports={tripTransaction};
