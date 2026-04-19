import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Last updated: October 2025</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          <p>
            At TravelSync, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and profile picture that you voluntarily give to us when you register.</li>
            <li><strong>Trip Data:</strong> Information regarding the itineraries, budgets, and destinations you plan using our service.</li>
            <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the application, such as your IP address, browser type, and access times.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:</p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>Create and manage your account.</li>
            <li>Facilitate collaborative trip planning features.</li>
            <li>Improve our 3D map and routing algorithms.</li>
            <li>Send you administrative information, such as updates to our terms or policy.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>3. Disclosure of Your Information</h2>
          <p>
            We will not share your personal data with third parties without your consent, except as required by law or to protect our rights. Public itineraries will be visible to other users in the Explore section, but your private trips remain strictly confidential.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@travelsync.app" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>privacy@travelsync.app</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
