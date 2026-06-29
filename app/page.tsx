'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'


export default function LandingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ background: '#fcf8fa', minHeight: '100dvh', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #c6c6cd', width: '100%', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 700, color: '#1b1b1d', textDecoration: 'none' }}>WebsiteGap</Link>
          <div style={{ display: 'flex', gap: 24, marginLeft: 32 }} className="hidden md:flex">
            <Link href="/dashboard" style={{ color: '#006591', borderBottom: '2px solid #006591', fontSize: 14, padding: '20px 0', textDecoration: 'none' }}>Dashboard</Link>
            <button onClick={() => scrollTo('features')} style={{ color: '#45464d', fontSize: 14, padding: '20px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>Features</button>
            <button onClick={() => scrollTo('pricing')} style={{ color: '#45464d', fontSize: 14, padding: '20px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>Pricing</button>
          </div>
        </div>


        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
  <SignedOut>
    <Link href="/sign-in" style={{ fontSize: 14, color: '#45464d', textDecoration: 'none' }}>Sign in</Link>
    <Link href="/sign-up" className="btn-primary" style={{ borderRadius: 8, padding: '8px 24px', textDecoration: 'none' }}>Get Started</Link>
  </SignedOut>
  <SignedIn>
    <Link href="/dashboard" className="btn-primary" style={{ borderRadius: 8, padding: '8px 24px', textDecoration: 'none' }}>Dashboard</Link>
    <UserButton />
  </SignedIn>
</div>


      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden', padding: '64px 24px 96px',
        backgroundImage: 'radial-gradient(circle at 2px 2px, #e4e2e4 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 320, textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#39b8fd', color: '#004666', borderRadius: 99, marginBottom: 24 }}>
              <span>✓</span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>NEW: V2 ENGINE NOW LIVE</span>
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 700, color: '#1b1b1d', marginBottom: 24, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Find Your Next Web Design Client in <span style={{ color: '#006591' }}>Seconds.</span>
            </h1>
            <p style={{ fontSize: 18, color: '#45464d', marginBottom: 40, maxWidth: 480, lineHeight: 1.5 }}>
              Scans local data to find businesses without websites. Precise leads, verified through Google CSE and Overpass API.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/dashboard" style={{ background: '#006591', color: 'white', padding: '16px 32px', borderRadius: 12, fontSize: 18, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,101,145,0.25)' }}>
                Start Scanning Free
              </Link>
              <button onClick={() => scrollTo('features')} style={{ border: '1px solid #76777d', color: '#1b1b1d', background: 'none', padding: '16px 32px', borderRadius: 12, fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero visual — animated map preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, minWidth: 320, position: 'relative' }}
          >
            <Link href="/dashboard" style={{ display: 'block', textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(0,0,0,0.16)' }}
                transition={{ duration: 0.25 }}
                style={{
                  background: '#eef1f3', border: '1px solid #c6c6cd', borderRadius: 20,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', overflow: 'hidden',
                  position: 'relative', aspectRatio: '16/10', cursor: 'pointer',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #e6eaed 0%, #dde2e6 45%, #d3d9de 100%)' }} />

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                  {[18, 38, 62, 84].map((x, i) => (
                    <line key={'v' + i} x1={x + '%'} y1="0%" x2={x + '%'} y2="100%" stroke="#c2c9ce" strokeWidth={i === 1 ? 2.5 : 1.4} />
                  ))}
                  {[22, 48, 70].map((y, i) => (
                    <line key={'h' + i} x1="0%" y1={y + '%'} x2="100%" y2={y + '%'} stroke="#c2c9ce" strokeWidth={i === 1 ? 2.5 : 1.4} />
                  ))}
                  <line x1="0%" y1="95%" x2="70%" y2="5%" stroke="#b9c5cc" strokeWidth="3" />
                </svg>

                <div style={{
                  position: 'absolute', top: '5%', left: '60%', width: '32%', height: '20%',
                  background: 'repeating-linear-gradient(45deg, rgba(0,150,104,0.08) 0px, rgba(0,150,104,0.08) 2px, transparent 2px, transparent 8px)',
                  borderRadius: 8,
                }} />

                <motion.div
                  initial={{ x: '-110%' }}
                  animate={{ x: '110%' }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
                  style={{
                    position: 'absolute', top: 0, bottom: 0, width: '35%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,101,145,0.14), transparent)',
                    pointerEvents: 'none',
                  }}
                />

                {[
                  { top: '32%', left: '28%', color: '#ba1a1a', delay: 0.7 },
                  { top: '58%', left: '46%', color: '#ba1a1a', delay: 0.85 },
                  { top: '40%', left: '68%', color: '#009668', delay: 1.0 },
                  { top: '70%', left: '20%', color: '#ba1a1a', delay: 1.15 },
                  { top: '22%', left: '52%', color: '#ba1a1a', delay: 1.3 },
                ].map((pin, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: pin.delay, duration: 0.35, type: 'spring', stiffness: 300, damping: 14 }}
                    style={{ position: 'absolute', top: pin.top, left: pin.left }}
                  >
                    <motion.div
                      animate={{ boxShadow: [`0 0 0 0 ${pin.color}55`, `0 0 0 8px ${pin.color}00`] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: pin.color, border: '2px solid white',
                      }}
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: 10, border: '1px solid #e4e2e4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#006591' }}>🔍</span>
                    <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#1b1b1d' }}>Scanning SF Bay Area...</span>
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ background: '#ba1a1a', color: 'white', padding: '5px 12px', borderRadius: 99, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  >
                    127 GAPS FOUND
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', bottom: 24, left: '5%', right: '5%', background: 'white', border: '1px solid #e4e2e4', padding: 16, borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 14 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e4e2e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏪</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1b1b1d' }}>Joe's Italian Grill</p>
                    <p style={{ fontSize: 11, color: '#45464d', fontFamily: 'JetBrains Mono, monospace' }}>No Website Found • Verified</p>
                  </div>
                  <span style={{ background: '#c9e6ff', color: '#004666', padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>CONTACT</span>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" style={{ padding: '96px 24px', background: '#ffffff', borderTop: '1px solid #e4e2e4' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <h2 style={{ fontSize: 32, fontWeight: 600, color: '#1b1b1d', marginBottom: 12 }}>Precision Workflow</h2>
            <p style={{ fontSize: 16, color: '#45464d' }}>Three steps to dominate your local market.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { icon: '🌐', title: '1. Global Search', desc: 'Connect to the Overpass API to query thousands of nodes across any geographic area for business meta-data.' },
              { icon: '✓', title: '2. Gap Verification', desc: 'Every result is cross-referenced with Google CSE to ensure the business truly lacks a professional web presence.' },
              { icon: '↗', title: '3. Rapid Export', desc: 'Export clean CSV or JSON data with direct contact information to fuel your outreach campaigns immediately.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, borderColor: '#006591', boxShadow: '0 12px 32px rgba(0,101,145,0.12)' }}
                style={{ padding: 32, background: 'white', borderRadius: 20, border: '1px solid #e4e2e4', cursor: 'default' }}
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.12 + 0.15, type: 'spring', stiffness: 200 }}
                  style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0edef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, fontSize: 24 }}
                >
                  {item.icon}
                </motion.div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1b1b1d', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ color: '#45464d', fontSize: 15, lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento features */}
      <section style={{ padding: '96px 24px', background: '#fcf8fa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#1b1b1d', marginBottom: 48 }}>Engineered for Reliability</h2>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ flex: '2 1 480px', background: '#131b2e', padding: 40, borderRadius: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
              <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#89ceff', border: '1px solid #89ceff', padding: '4px 12px', borderRadius: 99, marginBottom: 24 }}>GOOGLE CSE ENGINE</span>
              <h3 style={{ fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 16 }}>Zero Hallucination Verification</h3>
              <p style={{ color: 'rgba(124,131,155,0.9)', maxWidth: 420, fontSize: 15, lineHeight: 1.6 }}>Our custom search engine profiles verify 99.8% of business URLs, eliminating "false gap" leads that waste your precious outreach time.</p>
            </div>

            <div style={{ flex: '1 1 280px', background: '#eae7e9', padding: 40, borderRadius: 24, border: '1px solid #e4e2e4' }}>
              <div style={{ fontSize: 36, marginBottom: 24 }}>🗺️</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1b1b1d', marginBottom: 12 }}>Overpass API Data</h3>
              <p style={{ color: '#45464d', fontSize: 14, lineHeight: 1.6 }}>Tapping directly into OpenStreetMap's underlying database for structural accuracy and real-time updates.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', background: '#eae7e9', padding: 40, borderRadius: 24, border: '1px solid #e4e2e4' }}>
              <div style={{ fontSize: 36, marginBottom: 24 }}>🕐</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1b1b1d', marginBottom: 12 }}>Activity Tracking</h3>
              <p style={{ color: '#45464d', fontSize: 14, lineHeight: 1.6 }}>Log every lead you've contacted. Never double-dip or burn bridges in your local community.</p>
            </div>

            <div style={{ flex: '2 1 480px', background: 'white', border: '1px solid #e4e2e4', padding: 40, borderRadius: 24, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1b1b1d', marginBottom: 12 }}>Developer-Ready API</h3>
                <p style={{ color: '#45464d', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>Integrate WebsiteGap into your own CRM or automation workflow with our robust REST API documentation.</p>
                <Link href="/dashboard" style={{ color: '#006591', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textDecoration: 'none' }}>VIEW DOCS →</Link>
              </div>
              <div style={{ flex: 1, minWidth: 200, background: '#f0edef', padding: 20, borderRadius: 14 }}>
                <pre style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#1b1b1d', overflowX: 'auto', margin: 0 }}>
{`GET /api/v1/gaps?location=sf
{
  "status": "success",
  "data": [
    { "name": "Joe's Grill",
      "no_website": true }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '96px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600, color: '#1b1b1d', marginBottom: 12 }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: 16, color: '#45464d' }}>Choose the plan that fits your agency's scale.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>

            <div style={{ padding: 32, background: 'white', border: '1px solid #c6c6cd', borderRadius: 20, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 16, color: '#45464d', fontWeight: 600 }}>Community</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: '#1b1b1d' }}>$0</span>
                <span style={{ color: '#76777d', fontSize: 15 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> 10 Scans per Month</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> Map View Only</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#c6c6cd' }}><span>✕</span> No CSV Export</li>
              </ul>
              <Link href="/dashboard" style={{ width: '100%', padding: 14, border: '1px solid #76777d', borderRadius: 12, fontSize: 15, fontWeight: 600, background: 'none', cursor: 'pointer', color: '#1b1b1d', textDecoration: 'none', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>Get Started</Link>
            </div>

            <div style={{ padding: 32, background: 'white', border: '2px solid #006591', borderRadius: 20, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 12px 32px rgba(0,101,145,0.15)' }}>
              <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: '#006591', color: 'white', padding: '5px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Most Popular</div>
              <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 16, marginTop: 8, color: '#45464d', fontWeight: 600 }}>Professional</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: '#1b1b1d' }}>$49</span>
                <span style={{ color: '#76777d', fontSize: 15 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> Unlimited Scans</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> Advanced CSE Verification</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> CSV/JSON Export</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> Priority Support</li>
              </ul>
              <Link href="/dashboard" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, borderRadius: 12, fontSize: 15, textDecoration: 'none', boxSizing: 'border-box', textAlign: 'center' }}>Go Professional</Link>
            </div>

            <div style={{ padding: 32, background: 'white', border: '1px solid #c6c6cd', borderRadius: 20, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 16, color: '#45464d', fontWeight: 600 }}>Agency</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: '#1b1b1d' }}>$149</span>
                <span style={{ color: '#76777d', fontSize: 15 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> Team Access (5 Seats)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> API Access Key</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1b1b1d' }}><span style={{ color: '#009668' }}>✓</span> Custom White-labeling</li>
              </ul>
              <a href="mailto:sales@websitegap.org?subject=Agency%20Plan%20Inquiry" style={{ width: '100%', padding: 14, border: '1px solid #76777d', borderRadius: 12, fontSize: 15, fontWeight: 600, background: 'none', cursor: 'pointer', color: '#1b1b1d', textDecoration: 'none', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', background: '#131b2e', borderRadius: 40, padding: '64px 48px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: 36, fontWeight: 600, marginBottom: 20 }}>Stop searching, start selling.</h2>
          <p style={{ color: '#7c839b', maxWidth: 560, margin: '0 auto 40px', fontSize: 16, lineHeight: 1.6 }}>Join 1,200+ freelancers and agencies finding clients daily with WebsiteGap's scanning engine.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ background: '#006591', color: 'white', padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 600, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>Create Free Account</Link>
            <a href="mailto:demo@websitegap.org?subject=Schedule%20a%20Demo" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '16px 36px', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>Schedule a Demo</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#fcf8fa', borderTop: '1px solid #e4e2e4', padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1b1b1d', fontFamily: 'JetBrains Mono, monospace' }}>WebsiteGap Pro</span>
            <span style={{ fontSize: 12, color: '#45464d', fontFamily: 'JetBrains Mono, monospace' }}>© 2026 WebsiteGap Pro. All rights reserved.</span>
          </div>
          <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ fontSize: 12, color: '#45464d', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>API Docs</Link>
            <a href="mailto:support@websitegap.org" style={{ fontSize: 12, color: '#45464d', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>Support</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}