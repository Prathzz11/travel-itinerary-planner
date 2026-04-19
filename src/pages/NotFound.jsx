import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Compass size={100} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: 'var(--space-6)' }} />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.1 }}
        style={{ fontSize: '4rem', margin: '0 0 var(--space-2) 0', color: 'var(--color-primary)' }}
      >
        404
      </motion.h1>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.2 }}
        style={{ margin: '0 0 var(--space-6) 0' }}
      >
        Off the Beaten Path
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.3 }}
        style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: 'var(--space-8)' }}
      >
        It looks like you've ventured into uncharted territory. The page you are looking for does not exist or has been moved.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.4 }}
      >
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: 'var(--radius-full)', 
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          <Home size={18} />
          Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
