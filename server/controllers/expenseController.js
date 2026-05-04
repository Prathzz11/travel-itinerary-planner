const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

// Helper to recalculate total spent for a trip
const updateTripSpentTotal = async (tripId) => {
  try {
    const expenses = await Expense.find({ trip: tripId });
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    await Trip.findByIdAndUpdate(tripId, { spent: totalSpent });
  } catch (err) {
    console.error('Failed to update trip spent total:', err);
  }
};

// @desc    Get all expenses for a trip
// @route   GET /api/trips/:id/expenses
// @access  Protected
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// @desc    Create an expense
// @route   POST /api/trips/:id/expenses
// @access  Protected
const createExpense = async (req, res) => {
  try {
    const { description, amount, currency, category, paidBy, splits, date, receipt } = req.body;
    
    // Fetch trip to get member details
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Map paidBy (memberId or userId string) to object
    const payerMember = trip.members.find(m => 
      m._id?.toString() === paidBy || 
      m.id === paidBy || 
      m.user?.toString() === paidBy
    );
    const paidByObj = payerMember ? {
      memberId: payerMember._id?.toString(),
      userId: payerMember.user,
      name: payerMember.name
    } : { userId: req.user._id, name: req.user.name };

    // Map splits to splitAmong
    const splitAmong = (splits || []).map(s => {
      const member = trip.members.find(m => 
        m._id?.toString() === s.memberId || 
        m.id === s.memberId ||
        m.user?.toString() === s.memberId
      );
      return {
        memberId: member?._id?.toString() || s.memberId,
        userId: member?.user,
        name: member?.name || 'Unknown',
        share: s.amountOwed
      };
    });

    const expense = await Expense.create({
      trip: req.params.id,
      description,
      amount,
      currency,
      category,
      paidBy: paidByObj,
      splitAmong,
      date: date || new Date(),
      receipt: receipt || ''
    });

    await updateTripSpentTotal(req.params.id);

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

// @desc    Update an expense
// @route   PUT /api/trips/:id/expenses/:expenseId
// @access  Protected
const updateExpense = async (req, res) => {
  try {
    const { description, amount, currency, category, paidBy, splits, date, receipt } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    let updateData = { ...req.body };

    // If paidBy is a string, it's a memberId or userId that needs mapping
    if (typeof paidBy === 'string') {
      const payerMember = trip.members.find(m => 
        m._id?.toString() === paidBy || 
        m.id === paidBy || 
        m.user?.toString() === paidBy
      );
      if (payerMember) {
        updateData.paidBy = {
          memberId: payerMember._id?.toString(),
          userId: payerMember.user,
          name: payerMember.name
        };
      }
    }

    // If splits are provided, map to splitAmong
    if (splits) {
      updateData.splitAmong = splits.map(s => {
        const member = trip.members.find(m => 
          m._id?.toString() === s.memberId || 
          m.id === s.memberId ||
          m.user?.toString() === s.memberId
        );
        return {
          memberId: member?._id?.toString() || s.memberId,
          userId: member?.user,
          name: member?.name || 'Unknown',
          share: s.amountOwed
        };
      });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    await updateTripSpentTotal(req.params.id);
    
    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/trips/:id/expenses/:expenseId
// @access  Protected
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    await updateTripSpentTotal(req.params.id);
    
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
