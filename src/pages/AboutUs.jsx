import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-6)', textAlign: 'center' }}>About TravelSync</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          <p>
            Welcome to <strong>TravelSync</strong>, where we believe that planning your dream vacation should be just as exciting as the trip itself. We started this platform with a simple mission: to transform the chaotic, multi-tab process of travel planning into a seamless, immersive, and collaborative experience.
          </p>
          
          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Our Vision</h2>
          <p>
            We envision a world where anyone can effortlessly explore, organize, and experience their next adventure using state-of-the-art interactive tools. By combining a sleek, modern interface with a powerful 3D interactive map, we help you visualize your journey before you even pack your bags.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>What We Do</h2>
          <p>
            Whether you are planning a solo backpacking trip across Europe or a family vacation in Bali, TravelSync provides the essential tools:
          </p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Interactive Itineraries:</strong> Build day-by-day schedules visually.</li>
            <li><strong>Budget Management:</strong> Keep track of expenses, currencies, and settle up with friends.</li>
            <li><strong>Real-time Collaboration:</strong> Plan together with your travel buddies in real-time.</li>
            <li><strong>Community Exploration:</strong> Fork and remix public trips shared by experienced travelers.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Join Us</h2>
          <p>
            We are constantly growing and adding new features to make your travel planning experience even better. Thank you for choosing TravelSync to map out your next great adventure!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
