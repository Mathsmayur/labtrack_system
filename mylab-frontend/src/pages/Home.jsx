import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const goToLogin = () => navigate('/login');

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className="lp-navbar">
        <div className="lp-navbar-logo">
          <span className="lp-navbar-logo-icon">🔬</span>
          <span className="lp-navbar-logo-text">LabTrack</span>
        </div>
        <div className="lp-navbar-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How It Works</a>
          <a href="#testimonials" className="lp-nav-link">Testimonials</a>
        </div>
        <div className="lp-navbar-actions">
          <button className="lp-btn lp-btn-ghost" onClick={goToLogin}>
            Sign In
          </button>
          <button className="lp-btn lp-btn-primary" onClick={goToLogin}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-orb lp-hero-orb--1" />
          <div className="lp-hero-orb lp-hero-orb--2" />
          <div className="lp-hero-orb lp-hero-orb--3" />
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">✨ Smart Lab Management Platform</div>
            <h1 className="lp-hero-title">
              <span className="lp-hero-title-gradient">
                Manage Your Labs
                <br />
                Like Never Before
              </span>
            </h1>
            <p className="lp-hero-subtitle">
              LabTrack is the all-in-one platform that empowers institutions to
              track every workstation, schedule lab sessions without conflicts,
              handle complaints swiftly, and unlock data-driven insights — all
              from a single, intuitive dashboard.
            </p>
            <div className="lp-hero-cta">
              <button
                className="lp-btn lp-btn-primary lp-btn-large"
                onClick={goToLogin}
              >
                🚀 Get Started Free
              </button>
              <button
                className="lp-btn lp-btn-ghost lp-btn-large"
                onClick={() =>
                  document
                    .getElementById('features')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Explore Features ↓
              </button>
            </div>
            <div className="lp-hero-trust">
              <span className="lp-hero-trust-label">Trusted by</span>
              <div className="lp-hero-trust-avatars">
                <span className="lp-trust-avatar">🏫</span>
                <span className="lp-trust-avatar">🏛️</span>
                <span className="lp-trust-avatar">🎓</span>
              </div>
              <span className="lp-hero-trust-text">
                50+ institutions worldwide
              </span>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-hero-image-wrapper">
              <img
                src="/hero-illustration.png"
                alt="LabTrack Dashboard Preview"
                className="lp-hero-image"
              />
              <div className="lp-hero-image-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-header">
          <span className="lp-section-tag">⚡ Core Features</span>
          <h2 className="lp-section-title">
            Powerful Tools for Every Lab Need
          </h2>
          <p className="lp-section-subtitle">
            From real-time hardware monitoring to intelligent scheduling,
            LabTrack provides everything you need to run your labs at peak
            efficiency.
          </p>
        </div>

        {/* Feature 1 — PC Tracking */}
        <div className="lp-feature-row">
          <div className="lp-feature-row-content">
            <div className="lp-feature-icon lp-feature-icon--purple">🖥️</div>
            <h3 className="lp-feature-row-title">
              Real-Time PC &amp; Hardware Tracking
            </h3>
            <p className="lp-feature-row-desc">
              Monitor every workstation across all your labs in real time. Instantly
              see which machines are active, idle, or need attention. Track detailed
              hardware specs, software installations, warranty dates, and complete
              maintenance history — all from a single dashboard.
            </p>
            <ul className="lp-feature-bullets">
              <li>Live status monitoring for every workstation</li>
              <li>Full hardware &amp; software inventory per PC</li>
              <li>Maintenance history with defect tracking</li>
              <li>Instant alerts for hardware failures</li>
            </ul>
          </div>
          <div className="lp-feature-row-image">
            <img
              src="/feature-pc-tracking.png"
              alt="PC Tracking Dashboard"
              className="lp-feature-img"
            />
          </div>
        </div>

        {/* Feature 2 — Scheduling (reversed layout) */}
        <div className="lp-feature-row lp-feature-row--reverse">
          <div className="lp-feature-row-content">
            <div className="lp-feature-icon lp-feature-icon--cyan">📅</div>
            <h3 className="lp-feature-row-title">
              Smart Lab Scheduling
            </h3>
            <p className="lp-feature-row-desc">
              Say goodbye to scheduling conflicts. LabTrack&apos;s intelligent
              scheduling engine lets you book labs by time slot, subject, and
              faculty. View weekly timetables at a glance, auto-detect clashes,
              and ensure every lab hour is used efficiently.
            </p>
            <ul className="lp-feature-bullets">
              <li>Drag-and-drop weekly schedule builder</li>
              <li>Automatic conflict detection &amp; resolution</li>
              <li>Faculty and subject assignment per slot</li>
              <li>Export schedules as downloadable reports</li>
            </ul>
          </div>
          <div className="lp-feature-row-image">
            <img
              src="/feature-scheduling.png"
              alt="Lab Scheduling System"
              className="lp-feature-img"
            />
          </div>
        </div>

        {/* Feature 3 — Complaint Management */}
        <div className="lp-feature-row">
          <div className="lp-feature-row-content">
            <div className="lp-feature-icon lp-feature-icon--amber">🛠️</div>
            <h3 className="lp-feature-row-title">
              Streamlined Complaint Management
            </h3>
            <p className="lp-feature-row-desc">
              Empower your staff to report issues instantly and track every
              complaint from submission to resolution. Assign priorities, add
              notes, and monitor resolution times to keep your labs running
              smoothly without downtime.
            </p>
            <ul className="lp-feature-bullets">
              <li>One-click issue reporting from any device</li>
              <li>Priority levels: Low, Medium, High, Critical</li>
              <li>Full resolution timeline &amp; audit trail</li>
              <li>Auto-notifications when issues are resolved</li>
            </ul>
          </div>
          <div className="lp-feature-row-image">
            <img
              src="/feature-complaints.png"
              alt="Complaint Management System"
              className="lp-feature-img"
            />
          </div>
        </div>

        {/* Feature 4 — Analytics (reversed layout) */}
        <div className="lp-feature-row lp-feature-row--reverse">
          <div className="lp-feature-row-content">
            <div className="lp-feature-icon lp-feature-icon--green">📊</div>
            <h3 className="lp-feature-row-title">
              Rich Analytics &amp; Insights
            </h3>
            <p className="lp-feature-row-desc">
              Transform raw lab data into actionable insights. Interactive charts
              reveal usage patterns, equipment health trends, complaint hotspots,
              and peak utilization times — so you can make informed decisions to
              optimize your lab infrastructure.
            </p>
            <ul className="lp-feature-bullets">
              <li>Interactive bar, pie, and line charts</li>
              <li>Equipment health score tracking over time</li>
              <li>Peak usage analysis by lab and time slot</li>
              <li>Exportable reports for administration</li>
            </ul>
          </div>
          <div className="lp-feature-row-image">
            <img
              src="/feature-analytics.png"
              alt="Analytics Dashboard"
              className="lp-feature-img"
            />
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="lp-stats">
        <div className="lp-stats-grid">
          <div className="lp-stat-item">
            <div className="lp-stat-value lp-stat-value--purple">10+</div>
            <div className="lp-stat-label">Labs Managed</div>
            <div className="lp-stat-detail">Across multiple departments</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-value lp-stat-value--cyan">200+</div>
            <div className="lp-stat-label">PCs Tracked</div>
            <div className="lp-stat-detail">With real-time monitoring</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-value lp-stat-value--amber">99.9%</div>
            <div className="lp-stat-label">Uptime</div>
            <div className="lp-stat-detail">Reliable &amp; always available</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-value lp-stat-value--green">24/7</div>
            <div className="lp-stat-label">Support</div>
            <div className="lp-stat-detail">Dedicated assistance any time</div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="lp-how-it-works" id="how-it-works">
        <div className="lp-section-header">
          <span className="lp-section-tag">🔄 How It Works</span>
          <h2 className="lp-section-title">Get Up and Running in Minutes</h2>
          <p className="lp-section-subtitle">
            No complex setup needed. Three simple steps and your lab management
            is fully digitized.
          </p>
        </div>

        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-number lp-step-number--1">1</div>
            <div className="lp-step-content">
              <h3 className="lp-step-title">Sign In Securely</h3>
              <p className="lp-step-desc">
                Log in with your institutional credentials. LabTrack supports
                role-based access control — admins get a full management
                dashboard, while lab staff see a focused, streamlined interface
                tailored to their responsibilities.
              </p>
            </div>
          </div>

          <div className="lp-step">
            <div className="lp-step-number lp-step-number--2">2</div>
            <div className="lp-step-content">
              <h3 className="lp-step-title">Configure &amp; Manage</h3>
              <p className="lp-step-desc">
                Add your labs, register every PC with hardware details, create
                weekly schedules, and manage user roles. The intuitive interface
                makes it easy to onboard your entire lab infrastructure in
                minutes, not hours.
              </p>
            </div>
          </div>

          <div className="lp-step">
            <div className="lp-step-number lp-step-number--3">3</div>
            <div className="lp-step-content">
              <h3 className="lp-step-title">Analyze &amp; Optimize</h3>
              <p className="lp-step-desc">
                View rich analytics dashboards showing lab usage, equipment
                health trends, and complaint resolution metrics. Use these
                insights to allocate resources smarter, plan maintenance
                proactively, and maximize lab efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="lp-testimonials" id="testimonials">
        <div className="lp-section-header">
          <span className="lp-section-tag">💬 Testimonials</span>
          <h2 className="lp-section-title">What Our Users Say</h2>
          <p className="lp-section-subtitle">
            Hear from lab administrators and faculty who transformed their
            lab management with LabTrack.
          </p>
        </div>

        <div className="lp-testimonials-grid">
          <div className="lp-testimonial-card">
            <div className="lp-testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p className="lp-testimonial-quote">
              &ldquo;LabTrack completely transformed how we manage our computer
              labs. We went from juggling spreadsheets to having real-time
              visibility into every PC across 8 labs. Issue resolution time
              dropped by 60%!&rdquo;
            </p>
            <div className="lp-testimonial-author">
              <div className="lp-testimonial-avatar">👨‍💼</div>
              <div>
                <div className="lp-testimonial-name">Dr. Rajesh Kumar</div>
                <div className="lp-testimonial-role">
                  Head of IT, National Engineering College
                </div>
              </div>
            </div>
          </div>

          <div className="lp-testimonial-card">
            <div className="lp-testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p className="lp-testimonial-quote">
              &ldquo;The scheduling system alone saved us hours every week. No
              more double-bookings, no more confusion. Our faculty love the
              clean interface and the analytics help us plan budgets
              effectively.&rdquo;
            </p>
            <div className="lp-testimonial-author">
              <div className="lp-testimonial-avatar">👩‍🏫</div>
              <div>
                <div className="lp-testimonial-name">Prof. Anita Sharma</div>
                <div className="lp-testimonial-role">
                  Lab Coordinator, Delhi Technical University
                </div>
              </div>
            </div>
          </div>

          <div className="lp-testimonial-card">
            <div className="lp-testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p className="lp-testimonial-quote">
              &ldquo;We used to lose track of which machines needed repairs.
              With LabTrack&apos;s complaint management, every issue is logged
              and tracked. Our lab downtime has reduced by 40% since we
              adopted the platform.&rdquo;
            </p>
            <div className="lp-testimonial-author">
              <div className="lp-testimonial-avatar">👨‍🔧</div>
              <div>
                <div className="lp-testimonial-name">Mr. Suresh Patil</div>
                <div className="lp-testimonial-role">
                  Lab Technician, Pune Institute of Technology
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="lp-cta">
        <div className="lp-cta-box">
          <h2 className="lp-cta-title">Ready to Transform Your Labs?</h2>
          <p className="lp-cta-subtitle">
            Join 50+ institutions that rely on LabTrack for seamless lab
            management. Start tracking, scheduling, and optimizing today —
            it&apos;s free to get started.
          </p>
          <button
            className="lp-btn lp-btn-primary lp-btn-large"
            onClick={goToLogin}
          >
            🚀 Get Started Now
          </button>
          <p className="lp-cta-note">No credit card required · Free for institutions</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <span className="lp-navbar-logo-icon">🔬</span>
            <span className="lp-navbar-logo-text">LabTrack</span>
          </div>
          <div className="lp-footer-links">
            <a href="#features" className="lp-footer-link">Features</a>
            <a href="#how-it-works" className="lp-footer-link">How It Works</a>
            <a href="#testimonials" className="lp-footer-link">Testimonials</a>
          </div>
        </div>
        <div className="lp-footer-divider" />
        <p className="lp-footer-text">
          © 2026 LabTrack — Built with{' '}
          <span className="lp-footer-heart">♥</span> for better lab management.
        </p>
      </footer>
    </div>
  );
}

export default Home;
