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
  const [page, setPage] = useState(1);
  const searchValue = useDebounce(search, 300);
  const destinationValue = useDebounce(destination, 300);
  useEffect(() => {
    fetchPublicTrips({ search: searchValue, destination: destinationValue, sort, page, limit: 12 });
  }, [searchValue, destinationValue, sort, page, fetchPublicTrips]);
  function reset() { setSearch(''); setDestination(''); setSort('-createdAt'); setPage(1); }
  return <div className="page-container">
    <h1>The Atlas</h1><p className="text-muted">Browse public itineraries and copy one into your trips.</p>
    <div className="row g-3 mb-4">
      <div className="col-md-4"><label className="form-label w-100">Search<input type="search" className="form-control" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Title or tag" /></label></div>
      <div className="col-md-4"><label className="form-label w-100">Destination<input className="form-control" value={destination} onChange={e => { setDestination(e.target.value); setPage(1); }} placeholder="City or country" /></label></div>
      <div className="col-md-3"><label className="form-label w-100">Sort<select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="-createdAt">Newest</option><option value="-rating">Highest rated</option><option value="-views">Most viewed</option><option value="duration">Shortest trips</option></select></label></div>
      <div className="col-md-1 d-flex align-items-center"><button className="btn btn-outline-secondary" onClick={reset}>Reset</button></div>
    </div>
    {exploreLoading ? <p role="status">Loading itineraries...</p> : exploreError ? <div role="alert">{exploreError}<button className="btn btn-link" onClick={() => fetchPublicTrips({ search: searchValue, destination: destinationValue, sort, page, limit: 12 })}>Retry</button></div> : <>
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
