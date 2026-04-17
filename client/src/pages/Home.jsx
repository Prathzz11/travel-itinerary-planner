import { Link } from 'react-router-dom';
import { MapPin, Users, DollarSign, Compass, Star, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: <Users size={28} color="#2563eb" />, title: 'Collaborative Planning', desc: 'Invite friends and family to plan together in real time. Everyone stays on the same page.' },
  { icon: <DollarSign size={28} color="#10b981" />, title: 'Smart Budgeting', desc: 'Track expenses by category, see remaining budget, and plan without overspending.' },
  { icon: <Compass size={28} color="#7c3aed" />, title: 'Share & Discover', desc: 'Browse thousands of community itineraries. Fork any trip and customize it for yourself.' },
];

const DESTINATIONS = [
  { name: 'Paris, France', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', emoji: '🗼' },
  { name: 'Tokyo, Japan', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', emoji: '🗾' },
  { name: 'Bali, Indonesia', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', emoji: '🌺' },
  { name: 'New York, USA', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', emoji: '🗽' },
  { name: 'Rome, Italy', gradient: 'linear-gradient(135deg,#fa709a,#fee140)', emoji: '🏛️' },
  { name: 'Santorini, Greece', gradient: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', emoji: '🏖️' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#7c3aed 100%)', color: '#fff', padding: '5rem 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '50px', padding: '0.35rem 1rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <Star size={14} fill="currentColor" /> Trusted by 10,000+ travelers
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Plan Your Perfect Trip,<br />Together
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '580px', margin: '0 auto 2rem' }}>
            Create detailed itineraries, track budgets, collaborate with your group, and discover amazing trips from the community.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: '#2563eb', fontWeight: 700 }}>
              Start Planning Free <ArrowRight size={16} />
            </Link>
            <Link to="/browse" className="btn btn-lg btn-outline" style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
              <Compass size={16} /> Browse Itineraries
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Everything you need to travel better</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' }}>All your trip planning tools in one place</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section style={{ padding: '4rem 0', background: '#f8fafc' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Popular Destinations</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' }}>Explore itineraries from top destinations around the world</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {DESTINATIONS.map((d) => (
              <Link key={d.name} to={`/browse?q=${encodeURIComponent(d.name.split(',')[0])}`} style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', background: d.gradient, padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', color: '#fff', fontWeight: 600, minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <span style={{ fontSize: '2rem' }}>{d.emoji}</span>
                  <span style={{ fontSize: '0.9rem' }}>{d.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to start your adventure?</h2>
          <p style={{ opacity: 0.9, marginBottom: '1.75rem', fontSize: '1.05rem' }}>Join thousands of travelers planning their perfect trips.</p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: '#2563eb', fontWeight: 700 }}>
            Get Started for Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.88rem' }}>
        © {new Date().getFullYear()} TripPlanner. Built with ❤️ for travelers.
      </footer>
    </div>
  );
}
