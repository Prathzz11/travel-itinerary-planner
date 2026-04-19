import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Map, Users, Compass, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        className="glass-panel"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          maxWidth: '800px',
          padding: 'var(--space-8)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)'
        }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Compass size={64} color="var(--color-primary)" />
        </motion.div>
        
        <h1 style={{ fontSize: '3.5rem', margin: 0 }}>
          Plan Your Next <span className="text-gradient">Adventure</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '600px' }}>
          Experience the future of travel planning. Build interactive itineraries, collaborate in real-time, and explore destinations in stunning 3D.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <Link to="/create-trip">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--color-primary-glow)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: 'white',
                padding: 'var(--space-3) var(--space-8)',
                borderRadius: 'var(--radius-full)',
                fontSize: '1.1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <Map size={20} />
              Start Planning
            </motion.button>
          </Link>
          
          <Link to="/explore">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: 'var(--color-surface-hover)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-3) var(--space-8)',
                borderRadius: 'var(--radius-full)',
                fontSize: '1.1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <Users size={20} />
              Explore Public Trips
            </motion.button>
          </Link>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
            }
          }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 'var(--space-6)', 
            marginTop: 'var(--space-8)',
            width: '100%',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-8)'
          }}
        >
          <Feature icon={<Map color="var(--color-primary)" size={28} />} title="Interactive Maps" desc="Plot your journey on 3D globes" />
          <Feature icon={<Users color="var(--color-secondary)" size={28} />} title="Real-time Collab" desc="Plan together instantly" />
          <Feature icon={<Calendar color="var(--color-accent)" size={28} />} title="Smart Itineraries" desc="Day-by-day visualizations" />
        </motion.div>
      </motion.div>
    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -5 }}
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 'var(--space-2)',
      cursor: 'default'
    }}
  >
    <motion.div 
      whileHover={{ scale: 1.15, rotate: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
      style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: 'var(--space-3)', 
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease'
      }}
    >
      {icon}
    </motion.div>
    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{title}</h3>
    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>{desc}</p>
  </motion.div>
);

export default Home;
