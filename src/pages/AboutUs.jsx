import React from 'react';

const AboutUs = () => {
  return (
    <div className="page-container">
      <div className="card animate-fade-in mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="display-5 fw-bold text-center mb-4">About TravelSync</h1>
          
          <div className="d-flex flex-column gap-3" style={{ lineHeight: 1.7 }}>
            <p>
              Welcome to <strong>TravelSync</strong>, where we believe that planning your dream vacation should be just as exciting as the trip itself. We started this platform with a simple mission: to transform the chaotic, multi-tab process of travel planning into a seamless, immersive, and collaborative experience.
            </p>
            
            <h2 className="fs-4 mt-3 mb-1">Our Vision</h2>
            <p>
              We envision a world where anyone can effortlessly explore, organize, and experience their next adventure using state-of-the-art interactive tools. By combining a sleek, modern interface with powerful collaborative features, we help you visualize your journey before you even pack your bags.
            </p>

            <h2 className="fs-4 mt-3 mb-1">What We Do</h2>
            <p>Whether you are planning a solo backpacking trip across Europe or a family vacation in Bali, TravelSync provides the essential tools:</p>
            <ul className="list-group list-group-flush">
              <li className="list-group-item bg-transparent border-secondary"><strong>Interactive Itineraries:</strong> Build day-by-day schedules visually.</li>
              <li className="list-group-item bg-transparent border-secondary"><strong>Budget Management:</strong> Keep track of expenses, currencies, and settle up with friends.</li>
              <li className="list-group-item bg-transparent border-secondary"><strong>Collaboration:</strong> Plan together with your travel buddies seamlessly.</li>
              <li className="list-group-item bg-transparent border-secondary"><strong>Community Exploration:</strong> Fork and remix public trips shared by experienced travelers.</li>
            </ul>

            <h2 className="fs-4 mt-3 mb-1">Join Us</h2>
            <p>
              We are constantly growing and adding new features to make your travel planning experience even better. Thank you for choosing TravelSync to map out your next great adventure!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
