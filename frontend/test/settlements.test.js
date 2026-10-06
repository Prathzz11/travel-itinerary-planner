import test from 'node:test';
import assert from 'node:assert/strict';
import { getSettlementSummary as summary } from '../src/utils/settlements.js';
const members = [{_id:'a',user:'user-a',name:'A'}, {_id:'b',name:'B'}, {_id:'c',name:'C'}];
const expense = {amount:120,paidBy:{userId:'user-a'},splitAmong:[{userId:'a',share:40},{userId:'b',share:40},{userId:'c',share:40}]};
const payment = {payerId:'b',payeeId:'user-a',amount:40};
const nets = s => Object.fromEntries(s.balances.map(b=>[b.id,b.net]));
test('shared expenses, partial payments, full payments and undo use the same ledger',()=>{
 assert.deepEqual(nets(summary(members,[expense],[])),{a:80,b:-40,c:-40});
 assert.equal(summary(members,[expense],[]).balances.find(b=>b.id==='a').paid,120);
 assert.deepEqual(nets(summary(members,[expense],[{...payment,amount:15}])),{a:65,b:-25,c:-40});
 const settled=summary(members,[expense],[payment,{payerId:'c',payeeId:'a',amount:40}]);
 assert.ok(settled.balances.every(b=>b.net===0)); assert.deepEqual(settled.transactions,[]);
 assert.equal(summary(members,[expense],[payment]).transactions[0].amount,40);
 assert.equal(summary(members,[expense],[]).transactions.length,2);
});
test('legacy equal thirds allocate every cent and fully settle',()=>{
 const e={...expense,amount:100,splitAmong:members.map(m=>({userId:m._id,share:100/3}))};
 const s=summary(members,[e],[]);assert.deepEqual(s.issues,[]);
 assert.equal(s.balances.reduce((n,b)=>n+Math.round(b.net*100),0),0);
 const ps=s.transactions.map(tx=>({payerId:tx.from.id,payeeId:tx.to.id,amount:tx.amount}));
 assert.ok(summary(members,[e],ps).balances.every(b=>b.net===0));
});
test('one-cent debt is payable and overpayment reverses the balance',()=>{
 const e={amount:0.01,paidBy:{userId:'a'},splitAmong:[{userId:'b',share:0.01}]};
 assert.equal(summary(members,[e],[]).transactions[0].amount,0.01);
 assert.equal(summary(members,[e],[{...payment,amount:0.02}]).transactions[0].from.id,'a');
});
test('invalid splits and missing members prevent misleading suggestions',()=>{
 for(const e of [{...expense,splitAmong:[]},{...expense,paidBy:{userId:'missing'}},{...expense,splitAmong:[{userId:'missing',share:120}]}]) {
  const s=summary(members,[e],[]);assert.ok(s.issues.length);assert.deepEqual(s.transactions,[]);
 }
});
test('duplicate names cannot silently merge two people',()=>{
 const ms=[{_id:'a',name:'Same'},{_id:'b',name:'Same'}];
 const s=summary(ms,[{amount:10,paidBy:{name:'Same'},splitAmong:[{userId:'b',share:10}]}],[]);
 assert.ok(s.issues.length);assert.equal(s.balances.length,2);
});
test('editing and deleting an expense after payment recalculates balances',()=>{
 assert.deepEqual(nets(summary(members,[{...expense,amount:60,splitAmong:[{userId:'b',share:60}]}],[payment])),{a:20,c:0,b:-20});
 assert.deepEqual(nets(summary(members,[],[payment])),{b:40,c:0,a:-40});
});

test('stale payment IDs require repair even when stored names match current members',()=>{
 const s=summary(members,[expense],[{payerId:'old-b',payeeId:'old-a',payerName:'B',payeeName:'A',amount:40}]);
 assert.ok(s.issues.length);assert.deepEqual(s.transactions,[]);
 assert.deepEqual(nets(s),nets(summary(members,[expense],[])));
});
