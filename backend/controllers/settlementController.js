const { money } = require('../utils/expenseValidation');
const { controllerError } = require('../utils/controllerError');
const Trip = require('../models/Trip');

const resolveMemberId = (value) => {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') return String(value);

  const candidate = value.userId || value.memberId || value._id || value.id || value.user;
  if (!candidate) return null;

  return String(candidate._id || candidate.id || candidate.userId || candidate.memberId || candidate);
};

const getAccessCheckedTrip = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { trip: null, status: 404, message: 'Trip not found' };

  const isMember = trip.members.some((member) => member.user?.toString() === userId.toString());
  if (!isMember && trip.owner.toString() !== userId.toString()) {
    return { trip: null, status: 403, message: 'Access denied' };
  }

  return { trip };
};

const getSettlements = async (req, res) => {
  try {
    const result = await getAccessCheckedTrip(req.params.id, req.user._id);
    if (!result.trip) return res.status(result.status).json({ message: result.message });

    res.json(result.trip.settlements || []);
  } catch (error) {
    console.error('Get settlements error:', error);
    controllerError(res, error, 'Server error fetching settlements');
  }
};

const createSettlement = async (req, res) => {
  try {
    const result = await getAccessCheckedTrip(req.params.id, req.user._id);
    if (!result.trip) return res.status(result.status).json({ message: result.message });

    const { payerId, payeeId, amount, date, method, notes, requestId } = req.body;
    if (requestId !== undefined && (typeof requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId))) return res.status(400).json({message:'Invalid payment request ID'});
    const normalizedPayerId = resolveMemberId(payerId);
    const normalizedPayeeId = resolveMemberId(payeeId);

    if (!normalizedPayerId || !normalizedPayeeId) {
      return res.status(400).json({ message: 'Payer and payee are required' });
    }

    if (normalizedPayerId === normalizedPayeeId) {
      return res.status(400).json({ message: 'Payer and payee cannot be the same person' });
    }

    const memberMatchesId = (member, id) =>
      member._id?.toString() === id ||
      member.user?.toString() === id;

    const payerMember = result.trip.members.find((m) => memberMatchesId(m, normalizedPayerId));
    const payeeMember = result.trip.members.find((m) => memberMatchesId(m, normalizedPayeeId));

    if (!payerMember || !payeeMember) return res.status(400).json({ message: 'Payer and payee must belong to this trip' });
    if (payerMember._id.toString() === payeeMember._id.toString()) return res.status(400).json({ message: 'Payer and payee cannot be the same person' });
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ message: 'Amount must be a positive number' });

    const settlement = {
      payerId: payerMember._id.toString(),
      payeeId: payeeMember._id.toString(),
      payerName: payerMember?.name || req.body.payerName || 'Unknown',
      payeeName: payeeMember?.name || req.body.payeeName || 'Unknown',
      amount: money(amount, 'Amount', true) / 100,
      requestId,
      date: date || new Date(),
      method: method || '',
      notes: notes || ''
    };

    const record = result.trip.settlements.create(settlement);
    await record.validate();
    const updated = await Trip.findOneAndUpdate(
      { _id:req.params.id, ...(requestId ? {'settlements.requestId':{$ne:requestId},settlementRequestIds:{$ne:requestId}} : {}) },
      { $push:{settlements:record}, ...(requestId ? {$addToSet:{settlementRequestIds:requestId}} : {}), $inc:{__v:1} },
      { new:true,runValidators:true }
    );
    if (!updated) {
      const current = await Trip.findById(req.params.id);
      const existing = current?.settlements.find(s=>s.requestId===requestId);
      if (!current) return res.status(404).json({message:'Trip not found'});
      if (!existing) return res.status(409).json({message:'This payment was already undone. Start a new payment instead.'});
      if (['payerId','payeeId','amount','method','notes'].some(k=>existing[k]!==settlement[k]) || (date && +new Date(date)!==+existing.date)) return res.status(409).json({message:'This payment request was already used for different details.'});
      return res.status(200).json(existing);
    }
    res.status(201).json(updated.settlements.id(record._id));
  } catch (error) {
    console.error('Create settlement error:', error);
    controllerError(res, error, 'Server error creating settlement');
  }
};

// Correct a legacy payment without deleting it or guessing participants.
const updateSettlement = async (req,res) => {
  try {
    const trip = req.trip;
    const existing = trip.settlements.id(req.params.settlementId);
    if (!existing) return res.status(404).json({message:'Payment not found'});
    const find = id => trip.members.find(m => [String(m._id),String(m.user || '')].includes(String(id)));
    const payer = find(req.body.payerId), payee = find(req.body.payeeId);
    if (!payer || !payee || String(payer._id)===String(payee._id)) return res.status(400).json({message:'Choose two different trip members'});
    const fields = {payerId:String(payer._id),payeeId:String(payee._id),payerName:payer.name,payeeName:payee.name,amount:money(req.body.amount,'Amount',true)/100,date:new Date(req.body.date),method:req.body.method || '',notes:req.body.notes || '',updatedAt:new Date()};
    if (!Number.isFinite(+fields.date)) return res.status(400).json({message:'Choose a valid payment date'});
    const expected = req.body.expectedUpdatedAt;
    if (String(expected || '') !== String(existing.updatedAt?.toISOString() || '')) return res.status(409).json({message:'Payment changed. Reload before editing.'});
    const match = {_id:existing._id,...(existing.updatedAt ? {updatedAt:existing.updatedAt} : {updatedAt:{$exists:false}})};
    const set = Object.fromEntries(Object.entries(fields).map(([key,value])=>[`settlements.$.${key}`,value]));
    const updated = await Trip.findOneAndUpdate({_id:trip._id,settlements:{$elemMatch:match}},{$set:set,$inc:{__v:1}},{new:true,runValidators:true});
    if (!updated) return res.status(409).json({message:'Payment changed. Reload before editing.'});
    res.json(updated.settlements.id(existing._id));
  } catch(error) { controllerError(res,error,'Could not update payment'); }
};

const deleteSettlement = async (req, res) => {
  try {
    const result = await getAccessCheckedTrip(req.params.id, req.user._id);
    if (!result.trip) return res.status(result.status).json({ message: result.message });

    const settlement = result.trip.settlements.id(req.params.settlementId);
    if (!settlement) return res.status(404).json({ message: 'Settlement not found' });

    await Trip.updateOne({_id:req.params.id},{$pull:{settlements:{_id:settlement._id}},$inc:{__v:1}});
    res.json({ message: 'Settlement deleted' });
  } catch (error) {
    console.error('Delete settlement error:', error);
    controllerError(res, error, 'Server error deleting settlement');
  }
};

module.exports = { getSettlements, createSettlement, updateSettlement, deleteSettlement };