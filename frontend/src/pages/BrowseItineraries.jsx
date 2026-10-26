import TripImage from '../components/ui/TripImage';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExploreContext } from '../contexts/ExploreContext';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../utils/formatters';

export default function BrowseItineraries() {
  const { publicTrips, exploreLoading, exploreError, pagination, fetchPublicTrips } = useContext(ExploreContext);
  const [search, setSearch] = useState('');
  const [destination, setDestination] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [region, setRegion] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [page, setPage] = useState(1);
  const searchValue = useDebounce(search, 300);
  const destinationValue = useDebounce(destination, 300);
  useEffect(() => {
    fetchPublicTrips({ search: searchValue, destination: destinationValue, region, maxBudget, budgetCurrency, sort, page, limit: 12 });
  }, [searchValue, destinationValue, region, maxBudget, budgetCurrency, sort, page, fetchPublicTrips]);
  function reset() { setSearch(''); setDestination(''); setSort('-createdAt'); setRegion(''); setMaxBudget(''); setBudgetCurrency('INR'); setPage(1); }
  return <div className="page-container">
    <h1>The Atlas</h1><p className="text-muted">Browse public itineraries and copy one into your trips.</p>
    <div className="row g-3 mb-4">
      <div className="col-md-4"><label className="form-label w-100">Search<input type="search" className="form-control" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Title or tag" /></label></div>
      <div className="col-md-4"><label className="form-label w-100">Destination<input className="form-control" value={destination} onChange={e => { setDestination(e.target.value); setPage(1); }} placeholder="City or country" /></label></div>
      <div className="col-md-3"><label className="form-label w-100">Sort<select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="-createdAt">Newest</option><option value="-rating">Highest rated</option><option value="-views">Most viewed</option><option value="duration">Shortest trips</option><option value="estimatedBudget">Lowest budget</option></select></label></div>
      <div className="col-md-1 d-flex align-items-center"><button className="btn btn-outline-secondary" onClick={reset}>Reset</button></div>
    </div>
    <div className="row g-3 mb-2">
      <div className="col-md-4"><label className="form-label w-100">Trip region<select className="form-select" value={region} onChange={e => { setRegion(e.target.value); setPage(1); }}><option value="">All destinations</option><option value="domestic">National · India</option><option value="international">International · Outside India</option></select></label></div>
      <div className="col-md-4"><label className="form-label w-100">Trip budget<select className="form-select" value={maxBudget} onChange={e => { setMaxBudget(e.target.value); setPage(1); }}><option value="">Any budget</option>{(budgetCurrency === 'INR' ? [10000, 25000, 50000, 100000] : budgetCurrency === 'JPY' ? [10000, 30000, 70000, 150000] : [250, 500, 1000, 2500]).map(value => <option key={value} value={value}>Up to {formatCurrency(value, budgetCurrency)}</option>)}</select></label></div>
      <div className="col-md-4"><label className="form-label w-100">Budget currency<select className="form-select" value={budgetCurrency} onChange={e => { setBudgetCurrency(e.target.value); setMaxBudget(''); setPage(1); }}>{['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'THB', 'SGD', 'AED'].map(value => <option key={value}>{value}</option>)}</select></label></div>
    </div>
    <p className="small text-muted mb-4">National trips are within India. Budget limits apply to the total itinerary estimate, not per person. Budget filters and sorting use your selected currency; no currency conversion is applied.</p>
    {exploreLoading ? <p role="status">Loading itineraries...</p> : exploreError ? <div role="alert">{exploreError}<button className="btn btn-link" onClick={() => fetchPublicTrips({ search: searchValue, destination: destinationValue, region, maxBudget, budgetCurrency, sort, page, limit: 12 })}>Retry</button></div> : <>
      <p className="text-muted">{pagination.total} itineraries</p>
      <div className="row g-4">{publicTrips.map(trip => <div key={trip._id} className="col-md-6 col-lg-4"><article className="card h-100">
        {trip.image && <TripImage src={trip.image} alt={trip.destination} className="card-img-top" style={{ height: 180, objectFit: 'cover' }} />}
        <div className="card-body d-flex flex-column"><h2 className="h5">{trip.title}</h2><p>{trip.destination}</p><p className="text-muted">{trip.duration} {trip.duration === 1 ? 'day' : 'days'} · {formatCurrency(trip.estimatedBudget, trip.currency)}</p><p>{trip.difficulty} · {Number(trip.rating || 0).toFixed(1)} stars · {trip.views || 0} views</p><Link className="btn btn-primary mt-auto" to={`/itinerary/${trip._id}`}>View Itinerary</Link></div>
      </article></div>)}</div>
      {!publicTrips.length && <p>No matching itineraries. Try another search.</p>}
      <div className="d-flex gap-3 align-items-center mt-4"><button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.max(1, pagination.pages)}</span><button className="btn btn-outline-secondary" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button></div>
    </>}
  </div>;
}
