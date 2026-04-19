import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="page-container">
      <div className="card animate-fade-in mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="display-5 fw-bold mb-1">Privacy Policy</h1>
          <p className="text-muted mb-4">Last updated: October 2025</p>
          
          <div className="d-flex flex-column gap-3" style={{ lineHeight: 1.7 }}>
            <p>At TravelSync, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application.</p>

            <h2 className="fs-4 mt-3 mb-1">1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways:</p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, and profile picture that you voluntarily give to us when you register.</li>
              <li><strong>Trip Data:</strong> Information regarding the itineraries, budgets, and destinations you plan using our service.</li>
              <li><strong>Usage Data:</strong> Information our servers automatically collect, such as your IP address, browser type, and access times.</li>
            </ul>

            <h2 className="fs-4 mt-3 mb-1">2. Use of Your Information</h2>
            <p>We may use information collected about you to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Facilitate collaborative trip planning features.</li>
              <li>Improve our map and routing algorithms.</li>
              <li>Send you administrative information, such as updates to our terms or policy.</li>
            </ul>

            <h2 className="fs-4 mt-3 mb-1">3. Disclosure of Your Information</h2>
            <p>We will not share your personal data with third parties without your consent, except as required by law. Public itineraries will be visible to other users in the Explore section.</p>

            <h2 className="fs-4 mt-3 mb-1">4. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information.</p>

            <h2 className="fs-4 mt-3 mb-1">5. Contact Us</h2>
            <p>If you have questions, contact us at: <a href="mailto:privacy@travelsync.app" style={{ color: 'var(--color-primary)' }}>privacy@travelsync.app</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
