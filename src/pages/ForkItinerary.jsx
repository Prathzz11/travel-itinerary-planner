import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';

const ForkItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-8)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: 'var(--space-4)', background: 'rgba(192, 132, 252, 0.1)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
          <Copy size={32} color="var(--color-secondary)" />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>Fork Itinerary</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          You are about to copy "Ultimate Japan Route" into your own trips. You can modify dates, activities, and budget once copied.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <input type="text" placeholder="New Trip Title" defaultValue="My Japan Trip" style={{ width: '100%', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
          <input type="date" style={{ width: '100%', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white', colorScheme: 'dark' }} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          <button onClick={() => navigate(-1)} style={{ flex: 1, padding: 'var(--space-3)', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', color: 'white', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => navigate('/dashboard')} style={{ flex: 2, padding: 'var(--space-3)', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Create Copy</button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForkItinerary;