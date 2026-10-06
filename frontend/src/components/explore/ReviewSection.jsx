import React, { useState, useContext, useMemo } from 'react';
import { Star, ThumbsUp, MessageSquare, Edit2, Trash2, X } from 'lucide-react';
import { ExploreContext } from '../../contexts/ExploreContext';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../ui/ConfirmDialog';

const ReviewSection = ({ tripId }) => {
  const { getTripReviews, addReview, editReview, deleteReview, toggleHelpful } = useContext(ExploreContext);
  const { user } = useAuth();
  const reviews = getTripReviews(tripId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState(null);

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => ratingCounts[r.rating]++);

  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
    if (sortBy === 'rating_desc') return b.rating - a.rating;
    if (sortBy === 'rating_asc') return a.rating - b.rating;
    return 0;
  }), [reviews, sortBy]);

  const handleOpenModal = (review = null) => {
    if (review) { setEditingReviewId(review._id || review.id); setRating(review.rating); setComment(review.comment); }
    else { setEditingReviewId(null); setRating(0); setComment(''); }
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!rating) { setError('Select a star rating'); return; }
    setSaving(true); setError('');
    try {
      if (editingReviewId) await editReview(editingReviewId, tripId, { rating, comment });
      else await addReview(tripId, { rating, comment });
      setIsModalOpen(false);
    } catch (err) { setError(err.userMessage || err.message); }
    finally { setSaving(false); }
  };
  const handleDeleteClick = (_event, id) => setConfirmDeleteReviewId(id);
  const userExistingReview = reviews.find(r => String(r.author?._id || r.author?.id || r.author) === String(user?.id || user?._id));

  return (
    <div className="mt-5">
      <h2 className="fs-3 mb-4 d-flex align-items-center gap-2"><MessageSquare size={24} color="var(--color-primary)" /> Reviews & Ratings</h2>

      {/* Aggregate Stats */}
      <div className="card mb-4"><div className="card-body d-flex flex-wrap gap-4 align-items-center">
        <div className="text-center" style={{ minWidth: 120 }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 'bold', lineHeight: 1 }}>{avgRating}</div>
          <div className="d-flex gap-1 justify-content-center my-2" style={{ color: '#fbbf24' }}>{[1,2,3,4,5].map(i => <Star key={i} size={18} fill={i <= Math.round(avgRating) ? '#fbbf24' : 'transparent'} />)}</div>
          <div className="text-muted small">{reviews.length} reviews</div>
        </div>
        <div className="flex-grow-1 d-flex flex-column gap-1" style={{ minWidth: 200 }}>
          {[5,4,3,2,1].map(star => { const pct = reviews.length > 0 ? Math.round((ratingCounts[star] / reviews.length) * 100) : 0; return (
            <div key={star} className="d-flex align-items-center gap-2"><span className="text-muted small d-flex align-items-center gap-1" style={{ width: 32 }}>{star} <Star size={10} fill="currentColor" /></span><div className="progress flex-grow-1" style={{ height: 6 }}><div className="progress-bar" style={{ width: `${pct}%`, background: '#fbbf24' }} /></div><span className="text-muted small" style={{ width: 32, textAlign: 'right' }}>{pct}%</span></div>
          ); })}
        </div>
        <div className="text-center border-start ps-4" style={{ minWidth: 150 }}>
          {userExistingReview ? (
            <div><p className="text-muted small mb-2">You've already reviewed.</p><button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenModal(userExistingReview)}>Edit Your Review</button></div>
          ) : (
            <button className="btn btn-primary" disabled={!user} onClick={() => handleOpenModal()}>{user ? 'Write a Review' : 'Sign in to review'}</button>
          )}
        </div>
      </div></div>

      {/* Sorting */}
      {reviews.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fs-5 mb-0">All Reviews ({reviews.length})</h3>
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option><option value="helpful">Most Helpful</option><option value="rating_desc">Highest</option><option value="rating_asc">Lowest</option>
          </select>
        </div>
      )}

      {/* Review List */}
      <div className="d-flex flex-column gap-3">
        {reviews.length === 0 ? (
          <div className="text-center py-5 rounded-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <Star size={48} color="var(--color-border)" style={{ opacity: 0.5 }} className="mb-3" />
            <h3 className="text-muted">No reviews yet</h3><p className="text-muted">Be the first to share your experience!</p>
          </div>
        ) : sortedReviews.map(review => {
          const reviewId = review._id || review.id;
          const authorId = review.author?._id || review.author?.id || review.author;
          const authorName = review.authorName || review.author?.name || 'Unknown';
          const authorAvatar = review.authorAvatar || review.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1e3a5f&color=38bdf8`;
          const date = review.createdAt || review.date;

          const isMine = authorId === (user?._id || user?.id || 'm1');

          return (
            <div key={reviewId} className="card animate-fade-in">
              <div className="card-body d-flex gap-3">
                <img src={authorAvatar} alt={authorName} className="rounded-circle" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <span className="fw-bold">{authorName}</span>{isMine && <span className="badge bg-primary ms-2 small">You</span>}
                      <div className="text-muted small">{date ? new Date(date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div className="d-flex gap-1" style={{ color: '#fbbf24' }}>{[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= review.rating ? '#fbbf24' : 'transparent'} />)}</div>
                  </div>
                  <p className="mb-2" style={{ lineHeight: 1.6 }}>{review.comment}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" disabled={!user} onClick={() => toggleHelpful(reviewId, tripId)}><ThumbsUp size={14} /> Helpful ({review.helpfulCount || 0})</button>
                    {isMine && <div className="d-flex gap-2">
                      <button className="btn btn-link btn-sm text-muted p-0" onClick={() => handleOpenModal(review)}><Edit2 size={14} /> Edit</button>
                      <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleDeleteClick(null, reviewId)}><Trash2 size={14} /> Delete</button>
                    </div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog isOpen={!!confirmDeleteReviewId} title="Delete Review?" message="This review will be permanently removed." confirmLabel="Delete" onConfirm={async () => { await deleteReview(confirmDeleteReviewId, tripId); setConfirmDeleteReviewId(null); }} onCancel={() => { setConfirmDeleteReviewId(null); }} />

      {/* Review Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content animate-scale-in">
                <div className="modal-header">
                  <h5 className="modal-title">{editingReviewId ? 'Edit Review' : 'Write a Review'}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <div className="modal-body">{error && <p className="text-danger" role="alert">{error}</p>}
                  <form id="reviewForm" onSubmit={handleSubmitReview}>
                    <div className="text-center mb-4">
                      <div className="text-muted mb-2">Tap to Rate</div>
                      <div className="d-flex justify-content-center gap-2">{[1,2,3,4,5].map(star => (
                        <Star role="button" tabIndex={0} aria-label={`${star} stars`} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setRating(star); }} key={star} size={40} fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'} color={(hoverRating || rating) >= star ? '#fbbf24' : 'var(--color-border)'} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} />
                      ))}</div>
                    </div>
                    <div className="mb-3"><label className="form-label text-muted">Your Experience</label><textarea className="form-control" value={comment} onChange={e => setComment(e.target.value)} rows="4" placeholder="Tell us what you thought..." required /></div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button disabled={saving} type="submit" form="reviewForm" className="btn btn-primary">{editingReviewId ? 'Save Changes' : 'Post Review'}</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSection;
