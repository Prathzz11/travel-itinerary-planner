const { controllerError } = require('../utils/controllerError');
const { validateExpense } = require('../utils/expenseValidation');
const Expense = require('../models/Expense');
const fields = ['description','amount','currency','splitType','category','paidBy','splitAmong','date','notes','receipt'];
const pick = input => Object.fromEntries(fields.filter(k => input[k] !== undefined).map(k => [k,input[k]]));
const getExpenses = async (req,res) => {
  try { res.json(await Expense.find({trip:req.params.id}).sort({date:-1})); }
  catch(error) { controllerError(res,error,'Could not load expenses'); }
};
const createExpense = async (req,res) => {
  try {
    const data=validateExpense({ splitType:'equal', ...pick(req.body), paidBy:req.body.paidBy || {userId:req.user._id} },req.trip);
    res.status(201).json(await Expense.create({...data,trip:req.params.id}));
  } catch(error) { controllerError(res,error,'Could not create expense'); }
};
const updateExpense = async (req,res) => {
  try {
    const filter={_id:req.params.expenseId,trip:req.params.id};
    const current=await Expense.findOne(filter);
    if(!current) return res.status(404).json({message:'Expense not found'});
    if(!Number.isInteger(req.body.__v) || req.body.__v !== current.__v) return res.status(409).json({message:'This expense has changed. Reload it before saving again.'});
    const data=validateExpense({...pick(current.toObject()),...pick(req.body)},req.trip);
    const updated=await Expense.findOneAndUpdate({...filter,__v:current.__v},{$set:data,$inc:{__v:1}},{new:true,runValidators:true});
    if(!updated) return res.status(409).json({message:'This expense changed while you were editing. Reload and try again.'});
    res.json(updated);
  } catch(error) { controllerError(res,error,'Could not update expense'); }
};
const deleteExpense = async (req,res) => {
  try {
    const expense=await Expense.findOneAndDelete({_id:req.params.expenseId,trip:req.params.id});
    if(!expense) return res.status(404).json({message:'Expense not found'});
    res.json({message:'Expense deleted'});
  } catch(error) { controllerError(res,error,'Could not delete expense'); }
};
module.exports={getExpenses,createExpense,updateExpense,deleteExpense};
