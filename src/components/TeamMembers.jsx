import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchMembers, fetchDailyLogs, fetchAllQuizAttempts, getTodayDateStr } from '../lib/supabase';
import './TeamMembers.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [data, l, q] = await Promise.all([
        fetchMembers(),
        fetchDailyLogs(),
        fetchAllQuizAttempts()
      ]);
      setMembers(data);
      setLogs(l);
      setQuizAttempts(q);
    }
    load();
  }, []);

  // Compute honor stars for a member:
  // 1 star per 7-day streak milestone, 1 star per quiz score >= 8, max 5
  const getHonorStars = (memberId) => {
    // Streak calculation
    const mLogs = logs.filter(l => l.member_id === memberId).sort((a, b) => new Date(b.date) - new Date(a.date));
    const logMap = {};
    mLogs.forEach(l => logMap[l.date] = l);
    const today = getTodayDateStr();
    let currentDate = new Date(today);
    if (!logMap[today] || !logMap[today].goal_met) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    let streak = 0;
    while (true) {
      const dStr = currentDate.toISOString().split('T')[0];
      if (logMap[dStr] && logMap[dStr].goal_met) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }
    const streakStars = Math.floor(streak / 7); // 1 star per 7-day milestone

    // Quiz stars: 1 per attempt with score >= 8
    const quizStars = quizAttempts.filter(q => q.member_id === memberId && q.score >= 8).length;

    return Math.min(streakStars + quizStars, 5);
  };

  useGSAP(() => {
    const rows = gsap.utils.toArray('.tm-row');
    rows.forEach((row) => {
      gsap.fromTo(row,
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            end: "top 60%",
            scrub: 1.5
          }
        }
      );
    });
  }, { scope: containerRef, dependencies: [members] });

  return (
    <section id="team" className="team-members-section" ref={containerRef}>
      <div className="tm-container">
        {members.map((member, index) => {
          const isEven = index % 2 !== 0;
          const numStr = String(index + 1).padStart(2, '0');
          const stars = getHonorStars(member.id);
          
          return (
            <Link to={`/member/${member.id}`} key={member.id} className={`tm-row ${isEven ? 'tm-row-reverse' : ''}`}>
              <div className="tm-image-col">
                <div className="tm-image-wrapper">
                  <img src={`/assets/member/${member.image_filename}`} alt={member.name} className="tm-image" />
                </div>
              </div>
              
              <div className="tm-info-col">
                <div className="tm-eyebrow tm-name-link">{numStr} — {member.name}</div>
                <h3 className="tm-bio">{member.bio}</h3>
                
                <div className="tm-meta">
                  <div className="tm-meta-item">
                    <strong>Hobbies:</strong> {member.hobbies}
                  </div>
                  <div className="tm-meta-item">
                    <strong>Subjects:</strong> {member.subjects}
                  </div>
                </div>
                
                <div className="tm-stars-container">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="tm-star">{i < stars ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

