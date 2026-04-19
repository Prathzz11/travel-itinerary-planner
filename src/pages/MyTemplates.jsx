import React from 'react';
import { motion } from 'framer-motion';
import { LayoutTemplate } from 'lucide-react';

const MyTemplates = () => (
  <div className="page-container" style={{ padding: 'var(--space-8)' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>My Templates</h1>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Manage itineraries you've published for others to fork.</p>
    
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
      <LayoutTemplate size={48} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
      <h3 style={{ margin: '0 0 var(--space-2) 0' }}>No templates yet</h3>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>Publish your past trips to the community to see them here.</p>
    </motion.div>
  </div>
);
export default MyTemplates;