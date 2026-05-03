const mongoose = require('mongoose');
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://localhost:27017/travelsync').then(async () => {
  console.log('Connected to MongoDB');
  const trips = await Trip.find();
  const tripMap = {};
  trips.forEach(t => { tripMap[t.title] = t; });

  // ─── GOA BEACH GETAWAY ───────────────────────────────────────────────
  const goa = tripMap['Goa Beach Getaway'];
  if (goa) {
    await Expense.deleteMany({ trip: goa._id });
    await Booking.deleteMany({ trip: goa._id });

    const goaExpenses = await Expense.insertMany([
      { trip: goa._id, description: 'Flight BOM → GOI (return)', amount: 8500, currency: 'INR', category: 'Transport', paidBy: { userId: goa.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-05-15'), splits: [] },
      { trip: goa._id, description: 'Beach Resort (5 nights)', amount: 14000, currency: 'INR', category: 'Accommodation', paidBy: { userId: goa.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-05-15'), splits: [] },
      { trip: goa._id, description: 'Water Sports Package - Baga Beach', amount: 3200, currency: 'INR', category: 'Activities', paidBy: { userId: goa.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-05-16'), splits: [] },
      { trip: goa._id, description: 'Seafood dinner at Thalassa', amount: 2800, currency: 'INR', category: 'Food', paidBy: { userId: goa.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-05-16'), splits: [] },
      { trip: goa._id, description: 'Flea market shopping - Anjuna', amount: 1500, currency: 'INR', category: 'Shopping', paidBy: { userId: goa.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-05-17'), splits: [] },
      { trip: goa._id, description: 'Scooter rental (4 days)', amount: 1200, currency: 'INR', category: 'Transport', paidBy: { userId: goa.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-05-16'), splits: [] },
    ]);
    const goaTotal = goaExpenses.reduce((s, e) => s + e.amount, 0);
    await Trip.findByIdAndUpdate(goa._id, { spent: goaTotal });

    await Booking.insertMany([
      { trip: goa._id, type: 'flight', title: 'IndiGo 6E-412 Mumbai → Goa', provider: 'IndiGo', confirmationNumber: '6E-GFT291', amount: 4250, currency: 'INR', checkIn: new Date('2026-05-15T07:30:00'), checkOut: new Date('2026-05-15T09:05:00'), status: 'confirmed', notes: 'Window seat booked' },
      { trip: goa._id, type: 'hotel', title: 'La Calypso Beach Resort', provider: 'La Calypso', confirmationNumber: 'LCR-88201', amount: 14000, currency: 'INR', checkIn: new Date('2026-05-15T14:00:00'), checkOut: new Date('2026-05-20T11:00:00'), status: 'confirmed', notes: 'Sea-facing room, breakfast included' },
    ]);
    console.log(`✅ Goa: ${goaExpenses.length} expenses (₹${goaTotal}), 2 bookings`);
  }

  // ─── TOKYO ADVENTURE ─────────────────────────────────────────────────
  const tokyo = tripMap['Tokyo Adventure'];
  if (tokyo) {
    await Expense.deleteMany({ trip: tokyo._id });
    await Booking.deleteMany({ trip: tokyo._id });

    const tokyoExpenses = await Expense.insertMany([
      { trip: tokyo._id, description: 'Flight BOM → NRT (return)', amount: 52000, currency: 'INR', category: 'Transport', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-10'), splits: [] },
      { trip: tokyo._id, description: 'Shinjuku Hotel (7 nights)', amount: 45000, currency: 'INR', category: 'Accommodation', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-10'), splits: [] },
      { trip: tokyo._id, description: 'Ramen & Sushi meals', amount: 12000, currency: 'INR', category: 'Food', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-11'), splits: [] },
      { trip: tokyo._id, description: 'teamLab Planets tickets', amount: 4500, currency: 'INR', category: 'Activities', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-12'), splits: [] },
      { trip: tokyo._id, description: 'Tokyo Skytree entry', amount: 3000, currency: 'INR', category: 'Activities', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-13'), splits: [] },
      { trip: tokyo._id, description: 'Akihabara shopping', amount: 18000, currency: 'INR', category: 'Shopping', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-14'), splits: [] },
      { trip: tokyo._id, description: 'JR Pass (7 days)', amount: 22000, currency: 'INR', category: 'Transport', paidBy: { userId: tokyo.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-06-10'), splits: [] },
    ]);
    const tokyoTotal = tokyoExpenses.reduce((s, e) => s + e.amount, 0);
    await Trip.findByIdAndUpdate(tokyo._id, { spent: tokyoTotal });

    await Booking.insertMany([
      { trip: tokyo._id, type: 'flight', title: 'Air India AI-307 Mumbai → Tokyo Narita', provider: 'Air India', confirmationNumber: 'AI307-XKTP9', amount: 52000, currency: 'INR', checkIn: new Date('2026-06-10T02:15:00'), checkOut: new Date('2026-06-10T13:45:00'), status: 'confirmed', notes: 'Direct flight, 9h 30m' },
      { trip: tokyo._id, type: 'hotel', title: 'Shinjuku Granbell Hotel', provider: 'Granbell Hotels', confirmationNumber: 'GBH-TKY77431', amount: 45000, currency: 'INR', checkIn: new Date('2026-06-10T15:00:00'), checkOut: new Date('2026-06-17T11:00:00'), status: 'confirmed', notes: 'Superior double room, near station' },
      { trip: tokyo._id, type: 'activity', title: 'teamLab Planets Tickets', provider: 'teamLab', confirmationNumber: 'TLP-20260612', amount: 4500, currency: 'INR', checkIn: new Date('2026-06-12T11:00:00'), status: 'confirmed', notes: '2 tickets, 11:00 AM slot' },
    ]);
    console.log(`✅ Tokyo: ${tokyoExpenses.length} expenses (₹${tokyoTotal}), 3 bookings`);
  }

  // ─── MANALI BACKPACKING ───────────────────────────────────────────────
  const manali = tripMap['Manali Backpacking Trip'];
  if (manali) {
    await Expense.deleteMany({ trip: manali._id });
    await Booking.deleteMany({ trip: manali._id });

    const manaliExpenses = await Expense.insertMany([
      { trip: manali._id, description: 'Bus Delhi → Manali (Volvo AC)', amount: 2800, currency: 'INR', category: 'Transport', paidBy: { userId: manali.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-07-05'), splits: [] },
      { trip: manali._id, description: 'Zostel Manali (7 nights dorm)', amount: 5600, currency: 'INR', category: 'Accommodation', paidBy: { userId: manali.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-07-05'), splits: [] },
      { trip: manali._id, description: 'Rohtang Pass permit & taxi', amount: 2500, currency: 'INR', category: 'Activities', paidBy: { userId: manali.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-07-07'), splits: [] },
      { trip: manali._id, description: 'Solang Valley paragliding', amount: 2200, currency: 'INR', category: 'Activities', paidBy: { userId: manali.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-07-06'), splits: [] },
      { trip: manali._id, description: 'Local food & Old Manali cafes', amount: 3500, currency: 'INR', category: 'Food', paidBy: { userId: manali.owner, name: 'Pratham Shah' }, splitAmong: [], date: new Date('2026-07-06'), splits: [] },
    ]);
    const manaliTotal = manaliExpenses.reduce((s, e) => s + e.amount, 0);
    await Trip.findByIdAndUpdate(manali._id, { spent: manaliTotal });

    await Booking.insertMany([
      { trip: manali._id, type: 'bus', title: 'HRTC Volvo Delhi → Manali', provider: 'HRTC', confirmationNumber: 'HRTC-290716', amount: 1400, currency: 'INR', checkIn: new Date('2026-07-04T18:00:00'), checkOut: new Date('2026-07-05T08:00:00'), status: 'confirmed', notes: 'Overnight bus, seat 14' },
      { trip: manali._id, type: 'hotel', title: 'Zostel Manali', provider: 'Zostel', confirmationNumber: 'ZST-MNL88123', amount: 5600, currency: 'INR', checkIn: new Date('2026-07-05T12:00:00'), checkOut: new Date('2026-07-12T11:00:00'), status: 'confirmed', notes: 'Mixed dorm, 7 nights' },
    ]);
    console.log(`✅ Manali: ${manaliExpenses.length} expenses (₹${manaliTotal}), 2 bookings`);
  }

  console.log('\n🎉 All expenses and bookings seeded successfully!');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
