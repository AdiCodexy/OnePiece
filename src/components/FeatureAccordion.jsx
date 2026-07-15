import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeatureAccordion.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const features = [
  {
    title: "Daily Study Goals",
    description: "Set and track daily objectives to maintain consistent progress."
  },
  {
    title: "Streak Tracking",
    description: "Build momentum by logging study sessions consecutively. Don't break the chain!"
  },
  {
    title: "60-Second Quiz",
    description: "Test your knowledge retention quickly with daily rapid-fire questions."
  },
  {
    title: "Leaderboard",
    description: "Compete with the crew and see who's dominating their study goals this week."
  },
  {
    title: "Honor Stars",
    description: "Earn stars for exceptional milestones and show them off on your profile."
  },
  {
    title: "Member Profiles",
    description: "View detailed stats, current focus areas, and honors of your fellow crew members."
  }
];

export default function FeatureAccordion() {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default
  const containerRef = useRef();

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  useGSAP(() => {
    // Left side sticky content fade in
    gsap.fromTo(
      ".fa-left-anim",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#how-it-works",
          start: "top 80%",
        }
      }
    );

    // Right side accordion items stagger fade in
    gsap.fromTo(
      ".accordion-item",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#how-it-works",
          start: "top 75%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section className="feature-accordion-section section-padding" id="how-it-works" ref={containerRef}>
      <div className="fa-container">
        {/* Left Column (Sticky) */}
        <div className="fa-left">
          <div className="fa-sticky-content">
            <span className="eyebrow fa-left-anim">02 — HOW IT WORKS</span>
            <h2 className="fa-heading fa-left-anim">What's Inside</h2>
            <p className="fa-body fa-left-anim">
              Everything you need to stay accountable, track progress, and conquer your goals together with the crew.
            </p>
          </div>
        </div>

        {/* Right Column (Accordion List) */}
        <div className="fa-right">
          <div className="accordion-list">
            {features.map((feature, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`accordion-item ${isOpen ? 'open' : ''}`}
                >
                  <button 
                    className="accordion-header" 
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="accordion-title">{feature.title}</span>
                    <span className="accordion-icon">+</span>
                  </button>
                  <div 
                    className="accordion-body-wrapper"
                    style={{ maxHeight: isOpen ? '200px' : '0px' }}
                  >
                    <div className="accordion-body">
                      {feature.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
