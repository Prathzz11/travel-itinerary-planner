const Expense = require('../models/Expense');

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
    const { description, amount, currency, category, paidBy, splitAmong, date, receipt } = req.body;

    const expense = await Expense.create({
      trip: req.params.id,
      description,
      amount,
      currency,
      category,
      paidBy: paidBy || { userId: req.user._id, name: req.user.name },
      splitAmong: splitAmong || [],
      date: date || new Date(),
      receipt: receipt || ''
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

// @desc    Update an expense
// @route   PUT /api/trips/:id/expenses/:expenseId
// @access  Protected
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
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
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
