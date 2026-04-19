import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Map, Code, Users } from 'lucide-react';

const Careers = () => {
  const openPositions = [
    { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', icon: Code },
    { title: 'Product Designer', department: 'Design', location: 'New York / Remote', icon: Map },
    { title: 'Community Manager', department: 'Marketing', location: 'Remote', icon: Users },
  ];

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Briefcase size={48} color="var(--color-primary)" style={{ margin: '0 auto var(--space-4)' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>Join Our Journey</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            Help us build the future of immersive travel planning.
          </p>
        </div>
        
        <div style={{ marginBottom: 'var(--space-8)', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          <p>
            At TravelSync, we are a passionate team of travelers, designers, and engineers dedicated to making trip planning a collaborative and beautiful experience. We value creativity, autonomy, and a love for exploration. If you want to build tools that help people see the world, we'd love to hear from you.
          </p>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)' }}>Open Positions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {openPositions.map((job, index) => {
            const Icon = job.icon;
            return (
              <div key={index} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '50%' }}>
                    <Icon size={24} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{job.title}</h3>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <span>{job.department}</span>
                      <span>&bull;</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>
                <button style={{ 
                  background: 'transparent', 
                  color: 'var(--color-primary)', 
                  border: '1px solid var(--color-primary)', 
                  padding: '6px 16px', 
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Apply
                </button>
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Don't see a perfect fit? Send your resume to <a href="mailto:careers@travelsync.app" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>careers@travelsync.app</a>
        </div>
      </motion.div>
    </div>
  );
};

export default Careers;
