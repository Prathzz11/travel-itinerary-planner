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
    res.status(500).json({ message: 'Server error fetching settlements' });
  }
};

const createSettlement = async (req, res) => {
  try {
    const result = await getAccessCheckedTrip(req.params.id, req.user._id);
    if (!result.trip) return res.status(result.status).json({ message: result.message });

    const { payerId, payeeId, amount, date, method, notes } = req.body;
    const normalizedPayerId = resolveMemberId(payerId);
    const normalizedPayeeId = resolveMemberId(payeeId);

    if (!normalizedPayerId || !normalizedPayeeId) {
      return res.status(400).json({ message: 'Payer and payee are required' });
    }

    if (normalizedPayerId === normalizedPayeeId) {
      return res.status(400).json({ message: 'Payer and payee cannot be the same person' });
    }

    const payerMember = result.trip.members.find((member) => resolveMemberId(member) === normalizedPayerId);
    const payeeMember = result.trip.members.find((member) => resolveMemberId(member) === normalizedPayeeId);

    const settlement = {
      payerId: normalizedPayerId,
      payeeId: normalizedPayeeId,
      payerName: payerMember?.name || req.body.payerName || 'Unknown',
      payeeName: payeeMember?.name || req.body.payeeName || 'Unknown',
      amount: Number(amount || 0),
      date: date || new Date(),
      method: method || 'Cash',
      notes: notes || ''
    };

    result.trip.settlements.push(settlement);
    const updated = await result.trip.save();
    res.status(201).json(updated.settlements[updated.settlements.length - 1]);
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(500).json({ message: 'Server error creating settlement' });
  }
};

const deleteSettlement = async (req, res) => {
  try {
    const result = await getAccessCheckedTrip(req.params.id, req.user._id);
    if (!result.trip) return res.status(result.status).json({ message: result.message });

    const settlement = result.trip.settlements.id(req.params.settlementId);
    if (!settlement) return res.status(404).json({ message: 'Settlement not found' });

    settlement.deleteOne();
    await result.trip.save();
    res.json({ message: 'Settlement deleted' });
  } catch (error) {
    console.error('Delete settlement error:', error);
    res.status(500).json({ message: 'Server error deleting settlement' });
  }
};

module.exports = { getSettlements, createSettlement, deleteSettlement };