const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validateExpense,money}=require('../utils/expenseValidation');
const trip={currency:'INR',members:[{_id:'a',user:'user-a',name:'A'},{_id:'b',name:'B'},{_id:'c',name:'C'}]};
const input={amount:100,currency:'INR',paidBy:{userId:'user-a'},splitType:'equal',splitAmong:trip.members.map(m=>({userId:m._id,share:100/3}))};
test('equal thirds conserve cents and canonicalize member IDs and names',()=>{
 const e=validateExpense(input,trip);assert.deepEqual(e.splitAmong.map(s=>s.share),[33.34,33.33,33.33]);assert.deepEqual(e.paidBy,{userId:'a',name:'A'});
});
test('invalid currency, payer, duplicate aliases, shares and totals are rejected',()=>{
 for(const patch of [{currency:'USD'},{amount:0},{amount:Infinity},{amount:1.001},{paidBy:{userId:'missing'}},{splitAmong:[]},{splitAmong:[{userId:'a',share:50},{userId:'user-a',share:50}]},{splitType:'custom',splitAmong:[{userId:'b',share:99}]},{splitAmong:[{userId:'b',share:-10},{userId:'c',share:110}]},{splitType:'equal',splitAmong:[{userId:'b',share:90},{userId:'c',share:10}]}]) assert.throws(()=>validateExpense({...input,...patch},trip),e=>e.status===400);
});
test('custom shares and money precision are strict',()=>{
 assert.equal(validateExpense({...input,splitType:'custom',splitAmong:[{memberId:'b',share:100}]},trip).splitAmong[0].share,100);
 for(const value of ['',null,true,{},0.001,NaN,-1])assert.throws(()=>money(value,'Amount',true));
 assert.equal(money('0.01','Amount',true),1);
});
