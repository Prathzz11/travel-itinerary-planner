import React from 'react';

const TermsOfService = () => {
  return (
    <div className="page-container">
      <div className="card animate-fade-in mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="display-5 fw-bold mb-1">Terms of Service</h1>
          <p className="text-muted mb-4">Last updated: October 2025</p>
          
          <div className="d-flex flex-column gap-3" style={{ lineHeight: 1.7 }}>
            <p>Welcome to TravelSync. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>

            <h2 className="fs-4 mt-3 mb-1">1. Acceptance of Terms</h2>
            <p>By creating an account, or by using or accessing the TravelSync application, you agree to these Terms.</p>

            <h2 className="fs-4 mt-3 mb-1">2. User Accounts</h2>
            <p>When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your password.</p>

            <h2 className="fs-4 mt-3 mb-1">3. User Content</h2>
            <p>Our service allows you to post, share and make available certain Content. You are responsible for the Content you post.</p>
            <p>By posting Content, you grant us the right to use, modify, perform, display, reproduce, and distribute such Content through the Service. You retain your rights to any Content you submit.</p>

            <h2 className="fs-4 mt-3 mb-1">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Post or transmit illegal, threatening, defamatory content.</li>
              <li>Attempt to gain unauthorized access to our systems.</li>
              <li>Distribute spam or malicious software.</li>
            </ul>

            <h2 className="fs-4 mt-3 mb-1">5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice, for any breach of the Terms.</p>

            <h2 className="fs-4 mt-3 mb-1">6. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will try to provide at least 30 days notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
