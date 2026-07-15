import React, { useRef } from 'react';
import TextPressure from '../components/TextPressure';
import TeamMembers from '../components/TeamMembers';
import Footer from '../components/Footer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MembersPage.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MembersPage() {
  const containerRef = useRef();
  const heroRef = useRef();

  useGSAP(() => {
    // No animations needed for hero background anymore
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="members-page-container">
      <main className="main-content members-hero" id="hero" ref={heroRef}>
        <div className="hero-text-container">
          <TextPressure 
            text="T H E  C R E W"
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
        <div className="subtitle">Meet the members driving the journey forward.</div>
      </main>

      <div className="members-content-wrapper">
        <TeamMembers />
      </div>

      <Footer />
    </div>
  );
}
