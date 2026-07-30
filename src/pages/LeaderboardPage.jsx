import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchMembers, 
  fetchDailyLogs, 
  fetchAllQuizAttempts,
  getTodayDateStr,
  VISITOR_USER 
} from '../lib/supabase';
import TextPressure from '../components/TextPressure';
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
        if (savedId === '9999') {
          setCurrentUser(VISITOR_USER);
        } else {
          const found = savedId ? m.find(mem => mem.id === parseInt(savedId)) : null;
          setCurrentUser(found || m[0]);
        }
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

  // Find current user rank
  const currentUserIndex = sortedData.findIndex(m => m.id === currentUser.id);
  const currentUserRank = currentUserIndex + 1;

  return (
    <div ref={containerRef} className="lb-page-container">
      <div className="lb-bento-grid">
        
        {/* Top Header - Left (Tabs) */}
        <div className="bento-header-tabs bento-box">
          <div className="lb-tabs">
            <button className={`lb-tab ${activeTab === 'overall' ? 'active' : ''}`} onClick={() => setActiveTab('overall')}>Overall</button>
            <button className={`lb-tab ${activeTab === 'streak' ? 'active' : ''}`} onClick={() => setActiveTab('streak')}>By Streak</button>
            <button className={`lb-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>By Quiz Score</button>
          </div>
        </div>

        {/* Top Header - Right (Title) */}
        <div className="bento-header-title bento-box" id="hero" ref={heroRef}>
          <TextPressure 
            text="L E A D E R B O A R D"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            sizeFactor={1.2}
            textColor="#000000"
            strokeColor="#000000"
            minFontSize={24}
          />
        </div>

        {/* Left Column: Personal Rank */}
        <div className="bento-lb-personal bento-box lb-anim">
          <div className="personal-rank-badge">Your Standing</div>
          <div className="personal-rank-num">#{currentUserRank === 0 ? '-' : currentUserRank}</div>
          <img 
            src={`/assets/member/${currentUser.image_filename}`} 
            alt={currentUser.name} 
            className="podium-avatar" 
            style={{ width: '120px', height: '120px', border: '4px solid #f5eedb', margin: '20px 0' }}
            onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} 
          />
          <h2 className="pq-name">{currentUser.name}</h2>
          <div className="personal-score">{currentUserIndex !== -1 ? getScoreDisplay(sortedData[currentUserIndex]) : '-'}</div>

        </div>

        {/* Right Column: Full Leaderboard List */}
        <div className="bento-lb-list bento-box lb-anim">
          {sortedData.length > 0 ? (
            sortedData.map((member, idx) => {
              const rank = idx + 1;
              return (
                <div key={member.id} className={`lb-row rank-${rank}`}>
                  <div className="row-rank">#{rank}</div>
                  <img src={`/assets/member/${member.image_filename}`} alt={member.name} className="row-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
                  <Link to={`/members#member-${member.id}`} className="row-name profile-link">{member.name}</Link>
                  <div className="row-score">{getScoreDisplay(member)}</div>
                </div>
              );
            })
          ) : (
            <div style={{textAlign: 'center', opacity: 0.5, marginTop: '2rem'}}>No more members</div>
          )}
        </div>

      </div>
    </div>
  );
}
