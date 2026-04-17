import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, GitFork, MapPin, Calendar, DollarSign, Users, Star, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicItinerary, addReview, getReviews } from '../services/itineraryService.js';
import { useAuth } from '../context/AuthContext.jsx';
import ActivityTimeline from '../components/browse/ActivityTimeline.jsx';
import AccommodationSection from '../components/browse/AccommodationSection.jsx';
import RelatedItineraries from '../components/browse/RelatedItineraries.jsx';
import RatingsDisplay from '../components/browse/RatingsDisplay.jsx';
import ReviewsList from '../components/browse/ReviewsList.jsx';
import ForkModal from '../components/browse/ForkModal.jsx';
import { formatDate, formatBudget, formatDuration, getAvatarInitials } from '../utils/itineraryHelpers.js';

export default function ExistingItineraryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFork, setShowFork] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [itinRes, revRes] = await Promise.all([
          getPublicItinerary(id),
          getReviews(id).catch(() => ({ data: [] })),
        ]);
        setItinerary(itinRes.data.itinerary || itinRes.data);
        setReviews(revRes.data.reviews || revRes.data || []);
      } catch {
        toast.error('Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleForkClick = () => {
    if (!user) { navigate('/login'); return; }
    setShowFork(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      const res = await addReview(id, reviewForm);
      const newReview = res.data.review || res.data;
      setReviews((prev) => [newReview, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!itinerary) return (
    <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h2>Itinerary not found</h2>
      <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}><ArrowLeft size={14} /> Back to Browse</Link>
    </div>
  );

  const creator = itinerary.createdBy || itinerary.createdBy || {};
  const creatorName = creator.username || creator.name || 'Unknown';
  const days = itinerary.days || [];

  const CategoryBreakdown = () => {
    const breakdown = {};
    days.forEach((d) => (d.activities || []).forEach((a) => {
      if (a.cost > 0) breakdown[a.type || 'other'] = (breakdown[a.type || 'other'] || 0) + a.cost;
    }));
    const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
    const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#f97316','#ec4899','#64748b'];
    return (
      <div className="budget-chart">
        {Object.entries(breakdown).sort((a,b) => b[1]-a[1]).map(([cat, amt], i) => (
          <div key={cat} className="budget-category-row">
            <span className="budget-category-label">{cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
            <div className="budget-category-bar">
              <div className="budget-category-fill" style={{ width: `${total > 0 ? Math.round(amt/total*100) : 0}%`, background: colors[i % colors.length] }} />
            </div>
            <span className="budget-category-amount">{formatBudget(amt)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ background: '#f8fafc' }}>
      <div className="itinerary-detail-header">
        <div className="container">
          <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={14} /> Back to Browse
          </Link>
          <h1>{itinerary.name}</h1>
          <div className="itinerary-detail-meta">
            {itinerary.destination && <span><MapPin size={14} />{itinerary.destination}</span>}
            {itinerary.startDate && <span><Calendar size={14} />{formatDate(itinerary.startDate)}{itinerary.endDate ? ` – ${formatDate(itinerary.endDate)}` : ''}</span>}
            {itinerary.startDate && itinerary.endDate && <span>⏱ {formatDuration(itinerary.startDate, itinerary.endDate)}</span>}
            {itinerary.budget?.total > 0 && <span><DollarSign size={14} />{formatBudget(itinerary.budget?.total, itinerary.budget?.currency)}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{getAvatarInitials(creatorName)}</div>
              {creatorName}
            </span>
            <span><GitFork size={14} />{itinerary.forkCount || 0} forks</span>
          </div>
          <div className="itinerary-detail-actions">
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={handleShare}>
              {copied ? <Check size={14} /> : <Share2 size={14} />} {copied ? 'Copied!' : 'Share'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleForkClick}>
              <GitFork size={14} /> Fork This Trip
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="tabs">
          {['overview', 'day-by-day', 'reviews'].map((tab) => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'day-by-day' ? 'Day-by-Day' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div>
              {itinerary.description && (
                <div className="card card-body" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>About this Trip</h3>
                  <p style={{ color: '#374151', lineHeight: 1.7 }}>{itinerary.description}</p>
                </div>
              )}
              {itinerary.tags?.length > 0 && (
                <div className="card card-body" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Tags</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {itinerary.tags.map((tag) => <span key={tag} className="badge badge-primary">{tag}</span>)}
                  </div>
                </div>
              )}
              <div className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Accommodation & Transport</h3>
                <AccommodationSection days={days} />
              </div>
            </div>
            <div>
              <div className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Rating</h3>
                <RatingsDisplay rating={itinerary.averageRating || 0} reviewCount={itinerary.reviewCount || 0} size="lg" />
              </div>
              {itinerary.budget?.total > 0 && (
                <div className="card card-body">
                  <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Budget Breakdown</h3>
                  <div style={{ marginBottom: '0.75rem', fontWeight: 700, color: '#10b981', fontSize: '1.15rem' }}>{formatBudget(itinerary.budget?.total, itinerary.budget?.currency)}</div>
                  <CategoryBreakdown />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'day-by-day' && (
          <div>
            {days.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No day-by-day itinerary available.</p>
            ) : days.map((day, di) => (
              <div key={day._id || di} className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, color: '#2563eb', marginBottom: '0.75rem', fontSize: '1rem' }}>
                  Day {day.dayNumber || di + 1} {day.date ? `· ${formatDate(day.date)}` : ''}
                </h3>
                <ActivityTimeline activities={day.activities || []} currency={itinerary.budget?.currency} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{(itinerary.averageRating || 0).toFixed(1)}</div>
                  <RatingsDisplay rating={itinerary.averageRating || 0} size="sm" />
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {user && (
              <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Write a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} type="button" onClick={() => setReviewForm((p) => ({ ...p, rating: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', fontSize: '1.4rem', color: n <= reviewForm.rating ? '#f59e0b' : '#e2e8f0' }}>★</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea className="input textarea" rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} placeholder="Share your experience with this itinerary..." />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                    <Star size={14} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            <ReviewsList reviews={reviews} />
          </div>
        )}

        <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
          <RelatedItineraries id={id} />
        </div>
      </div>

      {showFork && <ForkModal itinerary={itinerary} onClose={() => setShowFork(false)} onSuccess={() => setShowFork(false)} />}
    </div>
  );
}
