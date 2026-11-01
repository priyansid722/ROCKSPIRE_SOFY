/*
 * Landing/Landing.tsx — Public landing page
 *
 * Structure:
 *  1. Navbar (sticky, cream bg)
 *  2. Hero section
 *     - Brand logo (clear spacing, never overlapping)
 *     - RocketIllustration (floats, nose opens on scroll)
 *     - Typewriter tagline
 *     - Intro paragraph
 *     - Get Started + Login CTA buttons
 *  3. About section (rises into view on scroll)
 *  4. Rocky.ai teaser (Coming Later)
 *  5. Space facts (rotating, 4 s)
 *  6. Language selector (Coming Later)
 *  7. "Find your crew" placeholder
 *  8. Footer
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { TypewriterText } from '@/components/TypewriterText';
import { Button } from '@/components/Button';
import { Footer } from '@/components/Footer';
import { RockyMascot } from '@/components/RockyMascot';
import { RocketIllustration } from '@/components/RocketIllustration';
import { DevMockBanner } from '@/components/DevMockBanner';
import { useAuth } from '@/context/AuthContext';
import styles from './Landing.module.css';

/* ── Space / Rocket facts that rotate ────────────────────────────────── */
const FACTS = [
  'The ISS orbits Earth at ~7.66 km/s — 16 sunrises every day.',
  'Rocket fuel is 85% oxidiser. Without oxygen, nothing burns in space.',
  'The Saturn V produced 34.5 million Newtons of thrust at liftoff.',
  "Space begins at the Kármán line: 100 km above Earth's surface.",
  'A rocket must reach 11.2 km/s to escape Earth\'s gravity entirely.',
  'The Voyager 1 probe is now more than 23 billion km from Earth.',
  'Black holes have gravity so strong, not even light can escape.',
  'On Mars, a year is 687 Earth days long — two of our summers.',
];

/* ── Language options (UI only, Coming Later) ─────────────────────────── */
const LANGUAGES = ['English', 'हिन्दी', 'Español', 'Français', 'Deutsch', 'العربية', '中文', 'Português'];

export function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const aboutRef = useRef<HTMLDivElement>(null);

  const [noseOpen, setNoseOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  /* ── Rotate facts every 4 seconds ─────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(
      () => setFactIndex((i) => (i + 1) % FACTS.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  /* ── Intersection Observer: reveal About section on scroll ───────── */
  useEffect(() => {
    const el = aboutRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNoseOpen(true); },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <DevMockBanner />

      {/* ── Minimal landing nav ─────────────────────────────────────── */}
      <header className={styles.landingNav}>
        <div className={`${styles.navInner} container`}>
          <Brand size="md" />
          <nav className={styles.navActions} aria-label="Landing navigation">
            <Link to="/login" className={styles.navLink}>
              Login
            </Link>
            {session ? (
              <Button
                size="sm"
                onClick={() => navigate('/profile')}
                aria-label="Go to your profile"
              >
                My Profile
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                aria-label="Create a new account"
              >
                Create Account
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          HERO — logo → rocket → tagline → CTA
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.hero} aria-label="Hero">
        {/* 1. Brand logo — always at top, clear of everything */}
        <div className={styles.heroLogo}>
          <Brand size="lg" />
        </div>

        {/* 2. Rocket illustration — floats, nose cone lifts on scroll */}
        <div
          className={[
            styles.rocketWrap,
            noseOpen ? styles['rocketWrap--lifted'] : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <RocketIllustration size="md" animated />
        </div>

        {/* 3. Tagline */}
        <TypewriterText
          text="Your rocket. Your team. Your mission."
          duration={3.5}
          as="p"
          className={styles.heroTagline}
        />

        {/* 4. Intro */}
        <p className={styles.heroSub}>
          ROCKSPIRE SOFY is a private project-collaboration platform
          built like a rocket laboratory. Each project is its own
          rocket — from nose cone to launch system. Invite your crew,
          claim your department, and build something that matters.
        </p>

        {/* 5. CTAs */}
        <div className={styles.heroCTAs}>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            aria-label="Get started — create a free account"
          >
            Get Started
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/login')}
            aria-label="Login to your account"
          >
            Login
          </Button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ABOUT — rises as nose cone opens
          ══════════════════════════════════════════════════════════ */}
      <section
        ref={aboutRef}
        className={`${styles.about} ${noseOpen ? styles['about--visible'] : ''}`}
        aria-labelledby="about-heading"
      >
        <div className="container container--narrow">
          <h2 id="about-heading" className={styles.sectionEyebrow}>
            What is ROCKSPIRE SOFY?
          </h2>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutCard}>
              <span className={styles.aboutIcon} aria-hidden="true">🔭</span>
              <h3 className={styles.aboutCardTitle}>Your Nose Cone</h3>
              <p className={styles.aboutCardText}>
                Every rocket has a nose cone — the guiding tip that determines
                direction. In SOFY, your project's nose cone shows you your tasks,
                where you left off, and leads you only to the parts you're
                supposed to work on.
              </p>
            </div>

            <div className={styles.aboutCard}>
              <span className={styles.aboutIcon} aria-hidden="true">🔒</span>
              <h3 className={styles.aboutCardTitle}>Privacy by Design</h3>
              <p className={styles.aboutCardText}>
                Every project workspace is private. You only see projects you
                belong to. Department members see only their own team. The team
                lead controls who joins. No uninvited eyes, ever.
              </p>
            </div>

            <div className={styles.aboutCard}>
              <span className={styles.aboutIcon} aria-hidden="true">🚀</span>
              <h3 className={styles.aboutCardTitle}>9 Departments</h3>
              <p className={styles.aboutCardText}>
                From Nose Cone (vision) to Launch System (deployment), every
                rocket has 9 departments. Claim yours, track progress, and
                watch the whole rocket come together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ROCKY.AI TEASER (mascot only — feature not built)
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.rockySection} aria-labelledby="rocky-heading">
        <div className={`${styles.rockyInner} container container--narrow`}>
          <div className={styles.rockyContent}>
            <span className={styles.comingLaterBadge}>Coming Later</span>
            <h2 id="rocky-heading" className={styles.rockyTitle}>
              Meet Rocky.ai
            </h2>
            <p className={styles.rockyText}>
              Rocky is your AI lab assistant, powered by Gemini. He'll analyse
              your GitHub repository, suggest tasks per department, and help
              your rocket reach orbit faster. Rocky is not yet active — but
              he's watching the countdown.
            </p>
            <p className={styles.rockyDisclaimer}>
              ⚠️ The Rocky.ai feature is not currently built. This section is a
              preview. No AI analysis is performed yet.
            </p>
          </div>
          <div className={styles.rockyMascotWrap}>
            <RockyMascot size="xl" animate className={styles.rockyMascot} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SPACE FACTS (labelled sample / rotating)
          ══════════════════════════════════════════════════════════ */}
      <section
        className={styles.factsSection}
        aria-labelledby="facts-heading"
      >
        <div className="container container--narrow">
          <div className={styles.factsBadge} aria-hidden="true">
            SAMPLE CONTENT · MISSION INTELLIGENCE
          </div>
          <h2 id="facts-heading" className="visually-hidden">
            Space and Rocket Facts
          </h2>
          <div
            className={styles.factCard}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={styles.factIcon} aria-hidden="true">🌌</span>
            <p className={styles.factText}>{FACTS[factIndex]}</p>
          </div>
          <p className={styles.factsNote}>
            Facts rotate automatically every 4 seconds. Sample content only.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LANGUAGE SELECTOR (UI only — labelled Coming Later)
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.langSection} aria-labelledby="lang-heading">
        <div className="container container--narrow">
          <span className={styles.comingLaterBadge}>Coming Later</span>
          <h2 id="lang-heading" className={styles.langTitle}>
            Available in your language
          </h2>
          <p className={styles.langSub}>
            Multi-language support is planned. UI preview only — no translation
            is active.
          </p>
          <div className={styles.langGrid} role="list" aria-label="Planned language options">
            {LANGUAGES.map((lang) => (
              <span
                key={lang}
                className={styles.langChip}
                role="listitem"
                aria-disabled="true"
                title="Coming later — not yet available"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CONNECT WITH FRIENDS (placeholder)
          ══════════════════════════════════════════════════════════ */}
      <section
        className={styles.connectSection}
        aria-labelledby="connect-heading"
      >
        <div className="container container--narrow">
          <span className={styles.placeholderBadge}>Placeholder — not yet built</span>
          <h2 id="connect-heading" className={styles.connectTitle}>
            Find your crew
          </h2>
          <p className={styles.connectText}>
            Connect with friends, find collaborators, and build your team.
            This feature is planned for a future update. Rocket science is
            always better with a crew.
          </p>
          <Button
            variant="secondary"
            disabled
            aria-label="Find collaborators — coming later"
          >
            Find Collaborators (Coming Later)
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
