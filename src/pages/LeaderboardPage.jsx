import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchMembers, 
  fetchDailyLogs, 
  fetchAllQuizAttempts,
  getTodayDateStr 
} from '../lib/supabase';
import TextPressure from '../components/TextPressure';
import Footer from '../components/Footer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LeaderboardPage.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WEIGHTS = {
  streak: 10,
  quiz: 5,
  hours: 2
};

export default function LeaderboardPage() {
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overall'); // 'overall', 'streak', 'quiz'
  
  const containerRef = useRef();
  const heroRef = useRef();

  useEffect(() => {
    async function loadData() {
      const [m, l, q] = await Promise.all([
        fetchMembers(),
        fetchDailyLogs(),
        fetchAllQuizAttempts()
      ]);
      setMembers(m);
      setLogs(l);
      setQuizAttempts(q);
      if (m.length > 0) {
        const savedId = localStorage.getItem('testingUserId');
        const found = savedId ? m.find(mem => mem.id === parseInt(savedId)) : null;
        setCurrentUser(found || m[0]);
      }
    }
    loadData();
  }, []);

  useGSAP(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      ".lb-anim",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".lb-content-wrapper",
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  if (!currentUser || members.length === 0) return <LoadingSkeleton />;

  // Helper: Get Streak
  const getStreak = (memberId) => {
    const mLogs = logs.filter(l => l.member_id === memberId).sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const today = getTodayDateStr();
    const logMap = {};
    mLogs.forEach(l => logMap[l.date] = l);

    let currentDate = new Date(today);
    if (!logMap[today] || !logMap[today].goal_met) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while(true) {
      const dStr = currentDate.toISOString().split('T')[0];
      if (logMap[dStr] && logMap[dStr].goal_met) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Helper: Get Weekly Hours
  const getWeeklyHours = (memberId) => {
    const today = new Date(getTodayDateStr());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const mLogs = logs.filter(l => {
      if (l.member_id !== memberId) return false;
      const logDate = new Date(l.date);
      return logDate > weekAgo && logDate <= today;
    });
    return mLogs.reduce((acc, curr) => acc + curr.hours, 0);
  };

  // Helper: Get Best Quiz Score
  const getBestQuizScore = (memberId) => {
    const mAttempts = quizAttempts.filter(q => q.member_id === memberId);
    if (mAttempts.length === 0) return 0;
    return Math.max(...mAttempts.map(q => q.score));
  };

  // Compute stats for all members
  const computedData = members.map(m => {
    const streak = getStreak(m.id);
    const hours = getWeeklyHours(m.id);
    const quiz = getBestQuizScore(m.id);
    
    const overallScore = (streak * WEIGHTS.streak) + (quiz * WEIGHTS.quiz) + (hours * WEIGHTS.hours);
    
    return {
      ...m,
      streak,
      hours,
      quiz,
      overallScore
    };
  });

  // Sort based on active tab
  const sortedData = [...computedData].sort((a, b) => {
    if (activeTab === 'streak') return b.streak - a.streak;
    if (activeTab === 'quiz') return b.quiz - a.quiz;
    return b.overallScore - a.overallScore;
  });

  const getScoreDisplay = (member) => {
    if (activeTab === 'streak') return `${member.streak} Days`;
    if (activeTab === 'quiz') return `${member.quiz} / 10`;
    return `${Math.round(member.overallScore)} pts`;
  };

  const top3 = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);
  
  // Find current user rank
  const currentUserIndex = sortedData.findIndex(m => m.id === currentUser.id);
  const currentUserRank = currentUserIndex + 1;
  const showStickyFooter = currentUserRank > 3;

  return (
    <div ref={containerRef} className="lb-page-container">
      <main className="lb-hero" id="hero" ref={heroRef}>
        <div className="hero-text-container">
          <TextPressure 
            text="L E A D E R B O A R D"
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
        <div className="subtitle">See who is leading the pack.</div>
      </main>

      <div className="lb-content-wrapper">
        <section className="lb-section-padding">
          
          <div className="challenge-identity-bar lb-anim">
            <select 
              className="qz-identity-select"
              value={currentUser.id}
              onChange={(e) => {
                const newId = parseInt(e.target.value);
                setCurrentUser(members.find(m => m.id === newId));
                localStorage.setItem('testingUserId', newId);
              }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>Testing as: {m.name}</option>
              ))}
            </select>
          </div>

          <div className="lb-tabs lb-anim">
            <button className={`lb-tab ${activeTab === 'overall' ? 'active' : ''}`} onClick={() => setActiveTab('overall')}>Overall</button>
            <button className={`lb-tab ${activeTab === 'streak' ? 'active' : ''}`} onClick={() => setActiveTab('streak')}>By Streak</button>
            <button className={`lb-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>By Quiz Score</button>
          </div>

          <div className="lb-podium lb-anim">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="podium-card rank-2">
                <div className="podium-badge">#2</div>
                <img src={`/assets/member/${top3[1].image_filename}`} alt={top3[1].name} className="podium-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
                <h3 className="podium-name"><Link to={`/member/${top3[1].id}`} className="profile-link">{top3[1].name}</Link></h3>
                <div className="podium-score">{getScoreDisplay(top3[1])}</div>
              </div>
            )}
            
            {/* Rank 1 */}
            {top3[0] && (
              <div className="podium-card rank-1">
                <div className="podium-badge">#1</div>
                <img src={`/assets/member/${top3[0].image_filename}`} alt={top3[0].name} className="podium-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
                <h3 className="podium-name"><Link to={`/member/${top3[0].id}`} className="profile-link">{top3[0].name}</Link></h3>
                <div className="podium-score">{getScoreDisplay(top3[0])}</div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="podium-card rank-3">
                <div className="podium-badge">#3</div>
                <img src={`/assets/member/${top3[2].image_filename}`} alt={top3[2].name} className="podium-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
                <h3 className="podium-name"><Link to={`/member/${top3[2].id}`} className="profile-link">{top3[2].name}</Link></h3>
                <div className="podium-score">{getScoreDisplay(top3[2])}</div>
              </div>
            )}
          </div>

          {rest.length > 0 && (
            <div className="lb-list lb-anim">
              {rest.map((member, idx) => (
                <div key={member.id} className="lb-row">
                  <div className="row-rank">#{idx + 4}</div>
                  <img src={`/assets/member/${member.image_filename}`} alt={member.name} className="row-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
                  <Link to={`/member/${member.id}`} className="row-name profile-link">{member.name}</Link>
                  <div className="row-score">{getScoreDisplay(member)}</div>
                </div>
              ))}
            </div>
          )}

        </section>
      </div>

      {showStickyFooter && (
        <div className="lb-sticky-footer">
          <div className="lb-footer-content">
            <div className="sf-left">
              <span className="sf-label">Your Rank</span>
              <span className="sf-rank">#{currentUserRank}</span>
              <span className="sf-name">{currentUser.name}</span>
            </div>
            <div className="sf-score">{getScoreDisplay(sortedData[currentUserIndex])}</div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
