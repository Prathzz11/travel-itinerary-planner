import React from 'react';
import { LayoutTemplate } from 'lucide-react';

const MyTemplates = () => (
  <div className="page-container animate-fade-in">
    <h1 className="display-6 fw-bold mb-1">My Templates</h1>
    <p className="text-muted mb-4">Manage itineraries you've published for others to fork.</p>
    
    <div className="card text-center py-5">
      <div className="card-body">
        <LayoutTemplate size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
        <h3 className="fw-semibold mb-2">No templates yet</h3>
        <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>Publish your past trips to the community to see them here.</p>
      </div>
    </div>
  </div>
);

export default MyTemplates;