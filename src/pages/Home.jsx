import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import TextPressure from '../components/TextPressure';
import FeatureAccordion from '../components/FeatureAccordion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const containerRef = useRef();

  useGSAP(() => {
    // Animate bento boxes sliding up
    gsap.fromTo(
      ".bento-box",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".home-bento-grid",
          start: "top 90%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="home-page-container">
      <div className="home-bento-grid">
        
        {/* Row 1: Hero */}
        <div className="bento-home-hero bento-box">
          <div className="hero-text-container">
            <TextPressure 
              text="ONE PIECE"
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
        </div>

        {/* Row 2: Why (Left Column) */}
        <div className="bento-home-why bento-box">
          <span className="why-eyebrow">01 — WHY THIS EXISTS</span>
          <h2 className="why-heading">Why OnePiece Portal Exists</h2>
          <p className="why-body">
            We built this portal as a dedicated study accountability system for the group. 
            It's designed to keep us on track, visualize our collective progress, and 
            turn daily learning into a shared journey.
          </p>
        </div>

        {/* Row 2: Accordion Features (Right Column) */}
        <div className="bento-home-accordion bento-box">
          <FeatureAccordion />
        </div>

        {/* Row 3: Call to Action */}
        <div className="bento-home-cta bento-box">
          <h2 className="cta-heading">Ready to dive in?</h2>
          <div className="cta-buttons">
            <a href="#leaderboard" className="cta-button">View Leaderboard</a>
            <a href="#challenge" className="cta-button">Weekly Challenge</a>
            <a href="#quiz" className="cta-button">Take a Quiz</a>
          </div>
        </div>

      </div>
    </div>
  );
}
