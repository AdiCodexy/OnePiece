import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchMembers, 
  fetchMemberGoals, 
  fetchDailyLogs, 
  updateMemberGoal, 
  logDailyHours, 
  getTodayDateStr 
} from '../lib/supabase';
import TextPressure from '../components/TextPressure';
import Footer from '../components/Footer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ChallengePage.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ChallengePage() {
  const [members, setMembers] = useState([]);
  const [goals, setGoals] = useState({});
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [logInput, setLogInput] = useState('');

  const containerRef = useRef();
  const heroRef = useRef();

  useEffect(() => {
    async function loadData() {
      const [m, g, l] = await Promise.all([
        fetchMembers(),
        fetchMemberGoals(),
        fetchDailyLogs()
      ]);
      setMembers(m);
      setGoals(g);
      setLogs(l);
      if (m.length > 0) {
        const savedId = localStorage.getItem('testingUserId');
        const found = savedId ? m.find(mem => mem.id === parseInt(savedId)) : null;
        setCurrentUser(found || m[0]);
      }
    }
    loadData();
  }, []);

  useGSAP(() => {
    // Hero text anim
    gsap.fromTo(
      ".chal-anim",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".challenge-content-wrapper",
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  if (!currentUser) return <LoadingSkeleton />;

  // Helper: Get Streak
  const getStreak = (memberId) => {
    const mLogs = logs.filter(l => l.member_id === memberId).sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const today = getTodayDateStr();
    
    // Create map for easy lookup
    const logMap = {};
    mLogs.forEach(l => logMap[l.date] = l);

    let currentDate = new Date(today);
    // If no log for today or goal missed, start checking from yesterday
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

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logInput) return;
    const hours = parseFloat(logInput);
    if (isNaN(hours)) return;
    
    const todayStr = getTodayDateStr();
    const goal = goals[currentUser.id] || 5;
    
    await logDailyHours(currentUser.id, todayStr, hours, goal);
    const newLogs = await fetchDailyLogs();
    setLogs(newLogs);
    setLogInput('');
  };

  const handleGoalChange = async (e) => {
    const newGoal = parseFloat(e.target.value);
    if (!isNaN(newGoal)) {
      await updateMemberGoal(currentUser.id, newGoal);
      const newGoals = await fetchMemberGoals();
      setGoals(newGoals);
    }
  };

  // Derive current user data
  const currentUserGoal = goals[currentUser.id] || 0;
  const todayStr = getTodayDateStr();
  const currentUserTodayLog = logs.find(l => l.member_id === currentUser.id && l.date === todayStr);
  const currentUserTodayHours = currentUserTodayLog ? currentUserTodayLog.hours : 0;
  const currentUserStreak = getStreak(currentUser.id);

  // Generate heatmap (last 35 days, perfectly aligned)
  const todayDate = new Date();
  const dayOfWeek = todayDate.getDay(); // 0 = Sun, 1 = Mon ...
  const numDaysToGenerate = 4 * 7 + (dayOfWeek + 1); // 4 full previous weeks + this week's days
  
  const heatmapDays = [];
  for (let i = numDaysToGenerate - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.member_id === currentUser.id && l.date === dStr);
    
    let level = 0; // 0 = none, 1 = some, 2 = met goal, 3 = exceeded
    if (log) {
       if (log.hours >= log.goal * 2) level = 4;
       else if (log.hours > log.goal) level = 3;
       else if (log.goal_met) level = 2;
       else if (log.hours > 0) level = 1;
    }
    
    heatmapDays.push({
      dateStr: dStr,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level,
      isToday: dStr === todayStr
    });
  }

  // Sort crew by streak desc
  const crewStats = members.map(m => {
    const tLog = logs.find(l => l.member_id === m.id && l.date === todayStr);
    return {
      ...m,
      streak: getStreak(m.id),
      todayHours: tLog ? tLog.hours : 0,
      goal: goals[m.id] || 0
    };
  }).sort((a, b) => b.streak - a.streak);

  return (
    <div ref={containerRef} className="challenge-page-container">
      <main className="challenge-hero" id="hero" ref={heroRef}>
        <div className="hero-text-container">
          <TextPressure 
            text="T H E  C H A L L E N G E"
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
        <div className="subtitle">Track daily progress and conquer goals together.</div>
      </main>

      <div className="challenge-content-wrapper">
        <section className="challenge-section-padding">
          
          <div className="challenge-identity-bar chal-anim">
            <select 
              className="identity-select"
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

          <div className="personal-card chal-anim">
            <img src={`/assets/member/${currentUser.image_filename}`} alt={currentUser.name} className="pc-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
            <div className="pc-info">
              <h2 className="pc-name">{currentUser.name}</h2>
              <div className="pc-progress">
                Today's Progress: {currentUserTodayHours} / {currentUserGoal} hrs
                <div className="pc-progress-bar-bg">
                  <div className="pc-progress-bar-fill" style={{ width: `${Math.min((currentUserTodayHours / (currentUserGoal || 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div className="pc-goal-edit">
                Daily Goal: 
                <input 
                  type="number" 
                  className="goal-input" 
                  value={currentUserGoal} 
                  onChange={handleGoalChange}
                  step="0.5"
                  min="0"
                /> hrs
              </div>
              <form className="log-form" onSubmit={handleLogSubmit}>
                <input 
                  type="number" 
                  className="log-input" 
                  placeholder="Log hours..."
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  step="0.5"
                  min="0"
                />
                <button type="submit" className="log-btn">Log Hours</button>
              </form>
            </div>
            <div className="pc-streak-box">
              <div className="streak-number">{currentUserStreak}</div>
              <div className="streak-label">Day Streak</div>
            </div>
          </div>

          <div className="weekly-strip chal-anim">
            <div className="weekly-title">Last 30 Days</div>
            <div className="heatmap-container">
              {heatmapDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`heatmap-cell level-${day.level} ${day.isToday ? 'today-ring' : ''}`}
                  title={`${day.label}: Level ${day.level}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="crew-progress chal-anim">
            <span className="eyebrow" style={{marginBottom: '2rem'}}>02 — CREW PROGRESS</span>
            <div className="crew-grid">
              {crewStats.map(member => (
                <div key={member.id} className="crew-card">
                  <img src={`/assets/member/${member.image_filename}`} alt={member.name} className="crew-card-avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
                  <div className="crew-card-info">
                    <h3 className="crew-card-name"><Link to={`/member/${member.id}`} className="profile-link">{member.name}</Link></h3>
                    <div className="crew-card-progress">
                      <div className="cc-progress-text">{member.todayHours} / {member.goal} hrs today</div>
                      <div className="cc-progress-bar-bg">
                        <div className="cc-progress-bar-fill" style={{ width: `${Math.min((member.todayHours / (member.goal || 1)) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="crew-card-streak">
                    <div className="cc-streak-num">{member.streak}</div>
                    <div className="cc-streak-label">STREAK</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      <Footer />
    </div>
  );
}
