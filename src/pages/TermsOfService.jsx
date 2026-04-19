import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Last updated: October 2025</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          <p>
            Welcome to TravelSync. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>1. Acceptance of Terms</h2>
          <p>
            By creating an account, or by using or accessing the TravelSync application, you agree to these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>3. User Content</h2>
          <p>
            Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>Post or transmit any content that is illegal, threatening, defamatory, or infringes on intellectual property rights.</li>
            <li>Attempt to gain unauthorized access to our systems or user accounts.</li>
            <li>Use the service to distribute spam or malicious software.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
