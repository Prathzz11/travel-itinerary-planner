// Illustrative sample plans, not live travel quotes.
const plans = [
 ['Jaipur: Forts and Old City', 'Jaipur, India', 'INR', 18000, ['Culture','History','Food'], [
  ['Old City Walk','Hawa Mahal exterior','City Palace visit','Rajasthani dinner'],
  ['Fort Day','Amber Fort','Panna Meena stepwell','Nahargarh sunset'],
  ['Markets and Gardens','Albert Hall Museum','Local craft markets','Cafe afternoon']]],
 ['Kyoto: Temples and Neighborhoods', 'Kyoto, Japan', 'JPY', 65000, ['Culture','Walking','Food'], [
  ['Eastern Kyoto','Kiyomizu-dera area','Higashiyama lanes','Gion evening walk'],
  ['Western Kyoto','Arashiyama riverside','Bamboo grove walk','Tea break'],
  ['Southern Kyoto','Fushimi Inari walk','Nishiki Market','Kamogawa riverside']]],
 ['Lisbon: Hills and Waterfront', 'Lisbon, Portugal', 'EUR', 420, ['City','Walking','Food'], [
  ['Historic Center','Alfama walk','Viewpoint stop','Portuguese dinner'],
  ['Belem Waterfront','Belem neighborhood','Riverside walk','Pastry tasting'],
  ['Parks and Neighborhoods','City garden morning','Chiado exploration','Sunset by the river']]],
 ['Kerala: Kochi and Backwaters', 'Kochi and Alappuzha, India', 'INR', 22000, ['Nature','Relaxation','Culture'], [
  ['Fort Kochi','Heritage neighborhood walk','Waterfront visit','Kerala cuisine dinner'],
  ['Backwaters','Transfer to Alappuzha','Backwater boat outing','Lakeside evening'],
  ['Slow Morning','Village walk','Local lunch','Return to Kochi']]],
];
plans.push(
 ['Kyoto: Higashiyama at Dawn', 'Kyoto, Japan', 'JPY', 9000, ['Culture','Walking','Early start'], [
  ['Morning in Higashiyama','Kiyomizu-dera','Sannenzaka and Ninenzaka walk','Coffee near Kodai-ji','Yasaka Shrine and Gion']]],
 ['Lisbon and Sintra: Three Days', 'Lisbon and Sintra, Portugal', 'EUR', 480, ['City','History','Walking'], [
  ['Old Lisbon','Baixa and Chiado','Alfama and castle area','Viewpoint evening'],
  ['Western Waterfront','Jeronimos Monastery area','Belem riverside and pastries','LX Factory'],
  ['Sintra Day Trip','Train to Sintra','Pena Palace','Quinta da Regaleira']]]
);
const pexels = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
const destinations = {
 Jaipur: {
  image: pexels('15344918'),
  imageCredit: {name:'Rohan Dewangan / Pexels',url:'https://www.pexels.com/photo/hawa-mahal-in-india-15344918/',license:'Pexels License'},
  sources:[{title:'Rajasthan Tourism: Jaipur',url:'https://www.tourism.rajasthan.gov.in/jaipur.html'}],
  planningTips:['Group Old City sights together and allow a separate day for the forts.','Check current entry hours and book transport before heading outside the city.']
 },
 Kyoto: {
  image:pexels('7526805'),
  imageCredit:{name:'Satoshi Hirayama / Pexels',url:'https://www.pexels.com/photo/yasaka-pagoda-in-kyoto-7526805/',license:'Pexels License'},
  sources:[{title:'Kyoto Travel: Higashiyama at dawn',url:'https://kyoto.travel/en/itineraries/higashiyama-at-dawn/'},{title:'JNTO: Gion and Higashiyama',url:'https://www.japan.travel/en/destinations/kansai/kyoto/gion-and-higashiyama/'}],
  planningTips:['Start the Higashiyama walk early; check temple opening hours for your date.','Keep quiet in residential lanes and leave paths clear for residents.']
 },
 Lisbon: {
  image:pexels('30152356'),
  imageCredit:{name:'Théo Cold / Pexels',url:'https://www.pexels.com/photo/charming-lisbon-tram-in-historic-city-center-30152356/',license:'Pexels License'},
  sources:[{title:'Visitus: Three days in Lisbon',url:'https://www.visitus.pt/three-days-in-lisbon/'}],
  planningTips:['Allow extra walking time on hills and wear shoes with grip.','For Sintra, reserve timed palace tickets and allow time for station-to-palace transport.']
 },
 Kerala: {
  image:'https://images.pexels.com/photos/30487745/pexels-photo-30487745.jpeg?auto=compress&cs=tinysrgb&w=1200',
  imageCredit:{name:'Aravind P.S / Pexels',url:'https://www.pexels.com/photo/scenic-kerala-backwaters-with-boat-and-palms-30487745/',license:'Pexels License'},
  sources:[{title:'Kerala Tourism: Alappuzha',url:'https://www.keralatourism.org/districts/alappuzha/'}],
  planningTips:['Confirm the boat route, boarding point and return time with your operator.','Leave transfer time between Kochi and Alappuzha and check weather before a boat outing.']
 }
};
module.exports = plans.map(([title,destination,currency,estimatedBudget,tags,days]) => ({
 title,destination,currency,estimatedBudget,tags,duration:days.length,difficulty:'Easy',
 description:'An editable starting plan inspired by the linked destination guides. Durations and budgets are illustrative, not live quotes; check opening hours, transport and reservations before travel.',
 authorName:'TravelSync Curated',isPublic:true,...destinations[title.split(':')[0].split(' and ')[0]],
 days:days.map(([title,...activities],index)=>({dayNumber:index+1,title,
  activities:activities.map((name,order)=>({name,category:/coffee|pastr|dinner|lunch|tea|cafe/i.test(name)?'Dining':/train|transfer|return to/i.test(name)?'Transport':'Sightseeing',duration:/coffee|tea|pastr/i.test(name)?45:90,order,notes:'Suggested visit duration only. Add travel time and confirm opening hours before finalizing your day.'}))}))
}));
