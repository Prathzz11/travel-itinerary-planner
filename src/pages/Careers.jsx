import React from 'react';
import { Briefcase, Code, Map, Users } from 'lucide-react';

const Careers = () => {
  const openPositions = [
    { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', icon: Code },
    { title: 'Product Designer', department: 'Design', location: 'New York / Remote', icon: Map },
    { title: 'Community Manager', department: 'Marketing', location: 'Remote', icon: Users },
  ];

  return (
    <div className="page-container">
      <div className="card animate-fade-in mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-5">
            <Briefcase size={48} color="var(--color-primary)" className="mb-3" />
            <h1 className="display-5 fw-bold mb-2">Join Our Journey</h1>
            <p className="text-muted fs-5">Help us build the future of immersive travel planning.</p>
          </div>
          
          <p className="mb-5" style={{ lineHeight: 1.7 }}>
            At TravelSync, we are a passionate team of travelers, designers, and engineers dedicated to making trip planning a collaborative and beautiful experience. We value creativity, autonomy, and a love for exploration.
          </p>

          <h2 className="fs-4 mb-3">Open Positions</h2>
          
          <div className="d-flex flex-column gap-3 mb-5">
            {openPositions.map((job, index) => {
              const Icon = job.icon;
              return (
                <div key={index} className="card hover-lift">
                  <div className="card-body d-flex align-items-center justify-content-between py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'rgba(56, 189, 248, 0.1)' }}>
                        <Icon size={24} color="var(--color-primary)" />
                      </div>
                      <div>
                        <h3 className="fs-6 fw-semibold mb-1">{job.title}</h3>
                        <div className="d-flex gap-2 text-muted small">
                          <span>{job.department}</span>
                          <span>&bull;</span>
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-outline-primary btn-sm">Apply</button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center text-muted small">
            Don't see a perfect fit? Send your resume to <a href="mailto:careers@travelsync.app" style={{ color: 'var(--color-primary)' }}>careers@travelsync.app</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
