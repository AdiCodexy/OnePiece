import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import TextPressure from '../components/TextPressure';
import FeatureAccordion from '../components/FeatureAccordion';
import Footer from '../components/Footer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const containerRef = useRef();
  const heroRef = useRef();

  useGSAP(() => {
    // Why section text animation
    gsap.fromTo(
      ".why-anim",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#why",
          start: "top 80%",
        }
      }
    );

    // CTA section animation
    gsap.fromTo(
      ".cta-anim",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#cta",
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="home-page-container">
      <main className="main-content home-hero" id="hero" ref={heroRef}>
        <div className="hero-text-container">
          <TextPressure 
            text="O N E P I E C E"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#111111"
            strokeColor="#111111"
            minFontSize={36}
          />
        </div>
        <div className="subtitle">The portal connects the crew — from daily logs to weekly challenges. Here's how we grow.</div>
      </main>

      <section className="why-section section-padding" id="why">
        <div className="why-container">
          <span className="eyebrow why-anim">01 — WHY THIS EXISTS</span>
          <h2 className="why-heading why-anim">Why OnePiece Portal Exists</h2>
          <p className="why-body why-anim">
            We built this portal as a dedicated study accountability system for the group. 
            It's designed to keep us on track, visualize our collective progress, and 
            turn daily learning into a shared journey.
          </p>
        </div>
      </section>
      
      <FeatureAccordion />

      <section className="cta-section section-padding" id="cta">
        <h2 className="cta-heading cta-anim">Ready to dive in?</h2>
        <div className="cta-buttons cta-anim">
          <Link to="/leaderboard" className="cta-button primary">View Leaderboard</Link>
          <Link to="/members" className="cta-button secondary">Meet the Crew</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
