import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, MessageSquare, Edit2, Trash2, X } from 'lucide-react';
import { ExploreContext } from '../../contexts/ExploreContext';
import { useAuth } from '../../hooks/useAuth';

const ReviewSection = ({ tripId }) => {
  const { getTripReviews, addReview, editReview, deleteReview, toggleHelpful } = useContext(ExploreContext);
  const { user } = useAuth();
  
  const reviews = getTripReviews(tripId);
  const [sortBy, setSortBy] = useState('newest'); // newest, helpful, rating_desc, rating_asc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  
  // Review Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Derived Stats
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => ratingCounts[r.rating]++);
  
  // Sorted Reviews
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'rating_asc') return a.rating - b.rating;
      return 0;
    });
  }, [reviews, sortBy]);

  const handleOpenModal = (review = null) => {
    if (review) {
      setEditingReviewId(review.id);
      setRating(review.rating);
      setComment(review.comment);
    } else {
      setEditingReviewId(null);
      setRating(0);
      setComment('');
    }
    setIsModalOpen(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
    
    if (editingReviewId) {
      editReview(editingReviewId, { rating, comment });
    } else {
      addReview({
        tripId,
        author: { id: user?.id || 'm1', name: user?.name || 'Current User', avatar: user?.avatar || 'https://i.pravatar.cc/150?u=m1' },
        rating,
        comment
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      deleteReview(id);
    }
  };

  // Prevent multiple reviews from same user? Let's just check if user already reviewed
  const userExistingReview = reviews.find(r => r.author.id === (user?.id || 'm1'));

  return (
    <div style={{ marginTop: 'var(--space-8)' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MessageSquare size={24} color="var(--color-primary)" /> Reviews & Ratings
      </h2>

      {/* Aggregate Stats Section */}
      <div className="glass-panel" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        
        {/* Average Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', lineHeight: 1 }}>{avgRating}</div>
          <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={20} fill={i <= Math.round(avgRating) ? '#fbbf24' : 'transparent'} />
            ))}
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Based on {reviews.length} reviews</div>
        </div>

        {/* Breakdown Bars */}
        <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star];
            const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {star} <Star size={12} fill="currentColor" />
                </div>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, background: '#fbbf24', borderRadius: '4px' }} />
                </div>
                <div style={{ width: '40px', fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Action / Write Review */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 'var(--space-6)' }}>
          {userExistingReview ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>You have already reviewed this trip.</p>
              <button onClick={() => handleOpenModal(userExistingReview)} style={{ background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 'bold', cursor: 'pointer' }}>
                Edit Your Review
              </button>
            </div>
          ) : (
            <button onClick={() => handleOpenModal()} style={{ background: 'var(--color-primary)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56,189,248,0.3)' }}>
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review List Controls */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>All Reviews ({reviews.length})</h3>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', outline: 'none', cursor: 'pointer' }}>
            <option value="newest">Newest First</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
          </select>
        </div>
      )}

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
            <Star size={48} color="var(--color-border)" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--color-text-muted)' }}>No reviews yet</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Be the first to share your experience!</p>
          </div>
        ) : (
          <AnimatePresence>
            {sortedReviews.map(review => {
              const isMine = review.author.id === (user?.id || 'm1');
              return (
                <motion.div key={review.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
                  
                  {/* Avatar */}
                  <img src={review.author.avatar} alt={review.author.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{review.author.name} {isMine && <span style={{ fontSize: '0.75rem', background: 'var(--color-primary)', padding: '2px 6px', borderRadius: '8px', marginLeft: '8px' }}>You</span>}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(review.date).toLocaleDateString()}</div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={16} fill={i <= review.rating ? '#fbbf24' : 'transparent'} />
                        ))}
                      </div>
                    </div>
                    
                    <p style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0' }}>
                      {review.comment}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={() => toggleHelpful(review.id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: 'var(--radius-full)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }}>
                        <ThumbsUp size={14} /> Helpful ({review.helpfulCount})
                      </button>

                      {isMine && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenModal(review)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <Edit2 size={14} /> Edit
                          </button>
                          <button onClick={() => handleDelete(review.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-8)', position: 'relative', zIndex: 1001 }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              
              <h2 style={{ margin: '0 0 var(--space-6) 0' }}>{editingReviewId ? 'Edit Review' : 'Write a Review'}</h2>
              
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                
                {/* Star Selector */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '8px', color: 'var(--color-text-muted)' }}>Tap to Rate</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={40} 
                        fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'} 
                        color={(hoverRating || rating) >= star ? '#fbbf24' : 'var(--color-border)'}
                        style={{ cursor: 'pointer', transition: '0.1s' }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Your Experience</label>
                  <textarea 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    placeholder="Tell us what you thought about this itinerary..."
                    style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', minHeight: '120px', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 32px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                    {editingReviewId ? 'Save Changes' : 'Post Review'}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ReviewSection;
