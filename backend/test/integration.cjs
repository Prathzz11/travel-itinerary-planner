require('dotenv').config();
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { once } = require('node:events');
const User=require('../models/User'), Trip=require('../models/Trip'), Template=require('../models/Template');
const Itinerary=require('../models/Itinerary'), Expense=require('../models/Expense'), Booking=require('../models/Booking'), Review=require('../models/Review');
const name=`sync-check-${Date.now()}`,email=`${name}@example.test`,password=`Test-only-${Date.now()}!`;
let server,uid,tid,cid,token,count=0;
async function main(){
 await mongoose.connect(process.env.MONGO_URI);process.env.NODE_ENV='test';
 server=require('../app').listen(0,'127.0.0.1');await once(server,'listening');
 async function req(path,method='GET',body,status=200){
  const r=await fetch(`http://127.0.0.1:${server.address().port}/api${path}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await r.json();assert.ok((Array.isArray(status)?status:[status]).includes(r.status),`${method} ${path}: ${r.status} ${JSON.stringify(data)}`);count++;return data;
 }
 try{
  const auth=await req('/auth/signup','POST',{name,email,password},201);token=auth.token;uid=auth.user.id;
  const t=await req('/trips','POST',{title:name,destination:'Local test',startDate:'2027-01-01',endDate:'2027-01-03',budget:1000,currency:'INR'},201);tid=t._id;const base=`/trips/${tid}`;
  let days=(await req(base+'/itinerary')).days;assert.equal(days.length,3);
  days[0].activities.push({title:'Walk',duration:'1h 30m',lat:12.3,lng:45.6,images:['https://example.test/a.png'],completed:true});
  await req(base+'/itinerary','PUT',{days});days=(await req(base+'/itinerary')).days;
  assert.equal(days[0].activities[0].name,'Walk');assert.equal(days[0].activities[0].duration,90);assert.equal(days[0].activities[0].lat,12.3);assert.equal(days[0].activities[0].completed,true);
  days[0].activities[0].title='Edited walk';await req(base+'/itinerary','PUT',{days});assert.equal((await req(base+'/itinerary')).days[0].activities[0].name,'Edited walk');
  const b=await req(base+'/bookings','POST',{type:'hotel',title:'Test hotel',amount:100,currency:'INR',checkIn:'2027-01-01',checkOut:'2027-01-02'},201);
  await req(base+'/bookings/'+b._id,'PUT',{title:'Edited hotel'});assert.equal((await req(base+'/bookings'))[0].title,'Edited hotel');
  const updated=await req(base+'/members','POST',{name:'Planning member',email:`${name}-member@example.test`,role:'viewer'});const member=updated.members.find(m=>m.name==='Planning member');
  await req(base+'/members/'+member._id,'PUT',{role:'editor'});
  const e=await req(base+'/expenses','POST',{description:'Lunch',amount:100,paidBy:{userId:uid,name},splitType:'custom',notes:'Saved note',splitAmong:[{userId:member._id,name:'Planning member',share:100}]},201);
  await req(base+'/expenses/'+e._id,'PUT',{__v:0,description:'Edited lunch',amount:120,splitAmong:[{userId:member._id,name:'Planning member',share:120}]});assert.equal((await req(base+'/expenses'))[0].notes,'Saved note');assert.equal((await req(base)).spent,120);
  for (const patch of [{currency:'USD'},{splitAmong:[]},{paidBy:{userId:new mongoose.Types.ObjectId()}},{splitAmong:[{userId:member._id,share:119}]}]) {
    await req(base+'/expenses/'+e._id,'PUT',{__v:1,...patch},400);
  }
  const edits=await Promise.all([
    req(base+'/expenses/'+e._id,'PUT',{__v:1,description:'Concurrent A'},[200,409]),
    req(base+'/expenses/'+e._id,'PUT',{__v:1,description:'Concurrent B'},[200,409])
  ]);
  assert.equal(edits.filter(x=>x._id).length,1);
  assert.equal((await req(base+'/expenses'))[0].__v,2);
  await req(base,'PUT',{currency:'USD'},400);
  const paymentData={payerId:member._id,payeeId:uid,amount:10,requestId:`retry-${Date.now()}-same-payment`};
  const repeated=await Promise.all([req(base+'/settlements','POST',paymentData,[200,201]),req(base+'/settlements','POST',paymentData,[200,201])]);
  assert.equal(repeated[0]._id,repeated[1]._id);
  assert.equal((await req(base+'/settlements')).length,1);
  await req(base+'/settlements','POST',{...paymentData,amount:11},409);
  const other=await req(base+'/settlements','POST',{...paymentData,amount:5,requestId:`other-${Date.now()}-payment`},201);
  await Promise.all([req(base+'/settlements/'+repeated[0]._id,'DELETE'),req(base+'/settlements/'+other._id,'DELETE')]);
  assert.equal((await req(base+'/settlements')).length,0);
  await req(base+'/settlements','POST',paymentData,409);
  await req(base+'/members/'+member._id,'DELETE',undefined,409);
  assert.equal((await req(base+'/expenses'))[0].splitAmong[0].share,120);
  const { getSettlementSummary } = await import('../../frontend/src/utils/settlements.js');
  const ledger = async () => getSettlementSummary((await req(base)).members, await req(base+'/expenses'), await req(base+'/settlements'));
  assert.equal((await ledger()).transactions[0].amount,120);
  // Reproduce imported legacy records with unknown IDs and no timestamps.
  const legacyId = new mongoose.Types.ObjectId();
  await Trip.collection.updateOne({_id:new mongoose.Types.ObjectId(tid)},{$push:{settlements:{_id:legacyId,payerId:'unknown-a',payeeId:'unknown-b',payerName:'Unknown',payeeName:'Unknown',amount:20,date:new Date('2027-01-01'),method:'Venmo'}}});
  assert.ok((await ledger()).issues.length);
  const repair={payerId:member._id,payeeId:uid,amount:20,date:'2027-01-01T10:00:00.000Z',method:'Venmo'};
  await req(base+'/settlements/'+legacyId,'PUT',{...repair,payerId:'missing'},400);
  await req(base+'/settlements/'+legacyId,'PUT',{...repair,amount:0},400);
  const repaired=await req(base+'/settlements/'+legacyId,'PUT',repair);
  assert.equal(repaired.payerName,'Planning member');assert.equal(repaired.payeeName,name);
  assert.equal((await ledger()).issues.length,0);assert.equal((await ledger()).transactions[0].amount,100);
  await req(base+'/settlements/'+legacyId,'PUT',repair,409);
  const paymentEdits=await Promise.all([30,40].map(amount=>req(base+'/settlements/'+legacyId,'PUT',{...repair,amount,expectedUpdatedAt:repaired.updatedAt},[200,409])));
  assert.equal(paymentEdits.filter(x=>x._id).length,1);
  assert.equal((await req(base)).spent,120);
  await req(base+'/settlements/'+legacyId,'DELETE');
  assert.equal((await ledger()).transactions[0].amount,120);
  const settlement=await req(base+'/settlements','POST',{payerId:member._id,payeeId:uid,amount:50},201);
  assert.equal((await ledger()).transactions[0].amount,70);
  await req(base+'/members/'+member._id,'DELETE',undefined,409);
  assert.equal((await req(base)).spent,120);
  const remainder=await req(base+'/settlements','POST',{payerId:member._id,payeeId:uid,amount:70},201);
  assert.ok((await ledger()).balances.every(b=>b.net===0));
  assert.equal((await req(base)).spent,120);
  await req(base+'/settlements/'+remainder._id,'DELETE');
  assert.equal((await ledger()).transactions[0].amount,70);
  await req(base+'/settlements/'+settlement._id,'DELETE');
  assert.equal((await ledger()).transactions[0].amount,120);
  await req(base,'PUT',{visibility:'public'});const templates=(await req('/itineraries?author='+uid)).templates;assert.equal(templates.length,1);
  const published=await req('/itineraries/'+templates[0]._id);assert.equal(published.days[0].activities[0].name,'Edited walk');
  const copy=await req('/trips/import','POST',{title:name+' copy',destination:'Copy',startDate:'2027-02-01',endDate:'2027-02-03',days:published.days,image:'https://example.test/photo.jpg',imageCredit:{name:'Test photographer',url:'https://example.test/photo',license:'Test'},sources:[{title:'Test guide',url:'https://example.test/guide'}],planningTips:['Plan transfers'],publishToExplore:false},201);cid=copy._id;assert.equal(copy.image,'https://example.test/photo.jpg');assert.equal(copy.sources[0].title,'Test guide');assert.equal(copy.planningTips[0],'Plan transfers');assert.equal((await req(`/trips/${cid}/itinerary`)).days[0].date,'2027-02-01');
  const review=await req('/reviews/template/'+published._id,'POST',{rating:4,comment:'Test review'},201);await req('/reviews/'+review._id,'PUT',{rating:5,comment:'Edited review'});assert.equal((await req('/reviews/'+review._id+'/helpful','PUT',{})).helpfulCount,1);await req('/reviews/'+review._id,'DELETE');
  await req(base,'PUT',{visibility:'private'});await req('/itineraries/'+published._id,'GET',undefined,404);
  if(process.env.MONGO_TRANSACTIONS==='required') {
    const {tripTransaction}=require('../middleware/tripTransaction');
    let status,body;
    const response={status(code){status=code;return this;},json(value){body=value;}};
    const beforeTitle=(await Trip.findById(tid)).title;
    await tripTransaction('admin',async(req,res)=>{
      await Trip.updateOne({_id:tid},{$set:{title:'must rollback'}});
      await Expense.create({trip:tid,description:'must rollback',amount:1});
      res.status(400).json({message:'Injected rejection'});
    })({params:{id:tid},user:{_id:uid}},response);
    assert.equal(status,400);assert.equal(body.message,'Injected rejection');
    assert.equal((await Trip.findById(tid)).title,beforeTitle);
    assert.equal(await Expense.countDocuments({trip:tid,description:'must rollback'}),0);
    for(const resource of ['expenses','settlements']) {
      const added=await req(base+'/members','POST',{name:'Race member',email:`race-${resource}-${name}@example.test`,role:'viewer'});
      const race=added.members.find(m=>m.email===`race-${resource}-${name}@example.test`);
      const payload=resource==='expenses'?{description:'Race expense',amount:1,currency:'INR',splitType:'custom',paidBy:{userId:uid},splitAmong:[{userId:race._id,share:1}]}:{payerId:race._id,payeeId:uid,amount:1};
      const [write]=await Promise.all([req(base+'/'+resource,'POST',payload,[201,400]),req(base+'/members/'+race._id,'DELETE',undefined,[200,409])]);
      const current=await req(base);
      const exists=current.members.some(m=>m._id===race._id);
      assert.equal(Boolean(write._id),exists,'financial write and member removal must not both commit');
      if(write._id){await req(base+'/'+resource+'/'+write._id,'DELETE');await req(base+'/members/'+race._id,'DELETE');}
    }
    console.log('PASS: transaction rollback across collections and member-removal races for expenses/payments.');
  }
  await req('/auth/me','PUT',{bio:'Saved bio',preferences:{currency:'EUR'}});assert.equal((await req('/auth/me')).user.preferences.currency,'EUR');assert.equal((await req('/auth/users/'+uid)).email,undefined);
  await req('/auth/me/password','PUT',{currentPassword:'wrong',newPassword:password+'new'},400);await req('/auth/me/password','PUT',{currentPassword:password,newPassword:password+'new'});await req('/auth/login','POST',{email,password:password+'new'});
  await req(base+'/expenses/'+e._id,'DELETE');assert.equal((await req(base)).spent,0);await req(base+'/bookings/'+b._id,'DELETE');await req(base+'/members/'+member._id,'DELETE');await req('/trips/'+cid,'DELETE');await req(base,'DELETE');assert.equal(await Itinerary.countDocuments({trip:tid}),0);
  console.log(`PASS: ${count} HTTP/MongoDB checks: CRUD, persistence, publishing, copy, reviews, profile and password.`);
 }finally{
  if(uid){const trips=await Trip.find({owner:uid}).select('_id');const ids=[...trips.map(t=>t._id),tid,cid].filter(Boolean);await Promise.all([Expense.deleteMany({trip:{$in:ids}}),Booking.deleteMany({trip:{$in:ids}}),Itinerary.deleteMany({trip:{$in:ids}}),Trip.deleteMany({owner:uid}),Template.deleteMany({author:uid}),Review.deleteMany({author:uid})]);await User.deleteOne({_id:uid});}
  if(server)await new Promise(resolve=>server.close(resolve));await mongoose.disconnect();
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
