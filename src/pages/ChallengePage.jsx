import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMembers,
  fetchMemberGoals,
  fetchDailyLogs,
  updateMemberGoal,
  logDailyHours,
  getTodayDateStr,
  VISITOR_USER
} from '../lib/supabase';
import TextPressure from '../components/TextPressure';
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
  const [logNotes, setLogNotes] = useState('');
  const [selectedLogUserId, setSelectedLogUserId] = useState('CURRENT');

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
        if (savedId === '9999') {
          setCurrentUser(VISITOR_USER);
        } else {
          const found = savedId ? m.find(mem => mem.id === parseInt(savedId)) : null;
          setCurrentUser(found || m[0]);
        }
      } else {
        setCurrentUser('empty');
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

  // Compute today's date string early (needed by useMemo)
  const todayStr = getTodayDateStr();

  // Group ALL logs by date for the hours history section
  // Must be before early returns to respect React hooks rules
  const hoursHistory = useMemo(() => {
    const grouped = {};
    logs.forEach(log => {
      if (!grouped[log.date]) grouped[log.date] = [];
      grouped[log.date].push(log);
    });
    // Sort dates descending (most recent first), exclude today since it's shown above
    return Object.entries(grouped)
      .filter(([date]) => date !== todayStr)
      .sort(([a], [b]) => new Date(b) - new Date(a));
  }, [logs, todayStr]);

  if (currentUser === 'empty') return <div style={{padding: '5rem', textAlign: 'center', color: '#000', fontFamily: 'Inter'}}>Error: No members found in database. Please run the SQL INSERT statements!</div>;
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

    while (true) {
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

    await logDailyHours(currentUser.id, todayStr, hours, goal, logNotes);
    const newLogs = await fetchDailyLogs();
    setLogs(newLogs);
    setLogInput('');
    setLogNotes('');
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
  const currentUserTodayLog = logs.find(l => l.member_id === currentUser.id && l.date === todayStr);
  const currentUserTodayHours = currentUserTodayLog ? currentUserTodayLog.hours : 0;
  const currentUserStreak = getStreak(currentUser.id);

  // Heatmap removed, today's logs will be used instead

  const crewStats = members
    .filter(m => String(m.id) !== String(currentUser.id))
    .map(m => {
      const tLog = logs.find(l => l.member_id === m.id && l.date === todayStr);
      return {
        ...m,
        streak: getStreak(m.id),
        todayHours: tLog ? tLog.hours : 0,
        goal: goals[m.id] || 0
      };
    })
    .sort((a, b) => b.streak - a.streak);

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffDays = Math.round((today - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div ref={containerRef} className="challenge-page-container">
      <div className="bento-grid">

        {/* Bento Header */}
        <div className="bento-header bento-box chal-anim" id="hero" ref={heroRef}>
          <TextPressure
            text="T H E  C H A L L E N G E"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            sizeFactor={1.2}
            textColor="#000000"
            strokeColor="#000000"
            minFontSize={36}
          />
        </div>

        {/* Bento Identity */}
        <div className="bento-identity bento-box chal-anim">
        </div>

        {/* Bento Personal Card */}
        <div className="bento-personal bento-box chal-anim">
          <div className="pc-avatar-wrapper">
            <img src={`/assets/member/${currentUser.image_filename}`} alt={currentUser.name} className="pc-avatar" onError={(e) => e.target.src = '/assets/Mainimg/hero-bg.jpg'} />
          </div>
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
                disabled={currentUser?.is_visitor}
              /> hrs
            </div>
            <div className="pc-header">
              <h3>Log Today's Study Hours</h3>
              {currentUser?.is_visitor ? (
                <div style={{ color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>
                  Visitors cannot log study hours.
                </div>
              ) : (
                <form className="log-form" onSubmit={handleLogSubmit}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Hours (e.g. 2.5)"
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    required
                    className="log-input"
                  />
                  <textarea
                    placeholder="- Studied React context\n- Read Chapter 4"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="log-notes-input"
                  />
                  <button type="submit" className="log-btn">Log Study</button>
                </form>
              )}
            </div>
          </div>
          <div className="pc-streak-box">
            <div className="streak-number">{currentUserStreak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
        </div>

        {/* Center Column - scrollable container for study log + history */}
        <div className="bento-center-column">

          {/* Bento Study Log */}
          <div className="bento-study-log bento-box chal-anim">
            <div className="study-log-header">
              <span className="eyebrow">TODAY'S STUDY LOG</span>
              <select
                className="log-filter-select"
                value={selectedLogUserId}
                onChange={(e) => setSelectedLogUserId(e.target.value === 'ALL' ? 'ALL' : (e.target.value === 'CURRENT' ? 'CURRENT' : parseInt(e.target.value)))}
              >
                <option value="CURRENT">My Logs</option>
                <option value="ALL">All Members</option>
                {members.filter(m => m.id !== currentUser.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}'s Logs</option>
                ))}
              </select>
            </div>
            <div className="study-log-feed">
              {(() => {
                const activeLogUserId = selectedLogUserId === 'CURRENT' ? currentUser.id : selectedLogUserId;
                const filteredLogs = logs.filter(l => l.date === todayStr && (selectedLogUserId === 'ALL' || l.member_id === activeLogUserId));

                if (filteredLogs.length === 0) {
                  return <div className="sl-empty">No one has logged their study today yet. Be the first!</div>;
                }

                return filteredLogs.map((log, idx) => {
                  const mem = members.find(m => m.id === log.member_id);
                  if (!mem) return null;
                  return (
                    <div key={idx} className="study-log-item">
                      <img src={`/assets/member/${mem.image_filename}`} alt={mem.name} className="sl-avatar" onError={(e) => e.target.src = '/assets/Mainimg/hero-bg.jpg'} />
                      <div className="sl-content">
                        <div className="sl-header">
                          <span className="sl-name">{mem.name}</span>
                          <span className="sl-hours">{log.hours} hrs</span>
                        </div>
                        <div className="sl-notes">
                          {log.notes ? (
                            <ul className="sl-notes-list">
                              {log.notes.split('\n').map((note, i) => {
                                const cleanNote = note.replace(/^-/, '').trim();
                                if (!cleanNote) return null;
                                return <li key={i}>{cleanNote}</li>;
                              })}
                            </ul>
                          ) : (
                            "No notes provided"
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Hours History - Past Days */}
          <div className="bento-hours-history bento-box chal-anim">
            <div className="hh-header">
              <span className="eyebrow">HOURS HISTORY</span>
              <span className="hh-subtitle">{hoursHistory.length} past day{hoursHistory.length !== 1 ? 's' : ''} logged</span>
            </div>
            <div className="hh-timeline">
              {hoursHistory.length === 0 ? (
                <div className="sl-empty">No past logs yet. Start logging daily to build your history!</div>
              ) : (
                hoursHistory.map(([date, dayLogs]) => {
                  const totalHours = dayLogs.reduce((sum, l) => sum + l.hours, 0);
                  const goalMetCount = dayLogs.filter(l => l.goal_met).length;
                  return (
                    <div key={date} className="hh-day-block">
                      <div className="hh-day-header">
                        <div className="hh-day-date">
                          <span className="hh-date-label">{formatDateLabel(date)}</span>
                          <span className="hh-date-full">{date}</span>
                        </div>
                        <div className="hh-day-stats">
                          <span className="hh-stat">
                            <span className="hh-stat-num">{dayLogs.length}</span>
                            <span className="hh-stat-label">logged</span>
                          </span>
                          <span className="hh-stat">
                            <span className="hh-stat-num">{totalHours.toFixed(1)}h</span>
                            <span className="hh-stat-label">total</span>
                          </span>
                          <span className="hh-stat">
                            <span className={`hh-stat-num ${goalMetCount === dayLogs.length ? 'all-met' : ''}`}>{goalMetCount}/{dayLogs.length}</span>
                            <span className="hh-stat-label">goals met</span>
                          </span>
                        </div>
                      </div>
                      <div className="hh-day-members">
                        {dayLogs.map((log, idx) => {
                          const mem = members.find(m => m.id === log.member_id);
                          if (!mem) return null;
                          const memberGoal = goals[mem.id] || 0;
                          const pct = memberGoal > 0 ? Math.min((log.hours / memberGoal) * 100, 100) : 0;
                          return (
                            <div key={idx} className={`hh-member-row ${log.goal_met ? 'goal-met' : 'goal-missed'}`}>
                              <img src={`/assets/member/${mem.image_filename}`} alt={mem.name} className="hh-avatar" onError={(e) => e.target.src = '/assets/Mainimg/hero-bg.jpg'} />
                              <div className="hh-member-info">
                                <div className="hh-member-top">
                                  <span className="hh-member-name">{mem.name}</span>
                                  <span className="hh-member-hours">{log.hours}h / {memberGoal}h</span>
                                  <span className={`hh-badge ${log.goal_met ? 'met' : 'missed'}`}>{log.goal_met ? '✓ MET' : '✗ MISSED'}</span>
                                </div>
                                <div className="hh-progress-bar-bg">
                                  <div className={`hh-progress-bar-fill ${log.goal_met ? 'fill-met' : 'fill-missed'}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                {log.notes && (
                                  <div className="hh-member-notes">{log.notes}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Bento Crew Progress List */}
        <div className="bento-crew-list chal-anim">
          {crewStats.map(member => (
            <div key={member.id} className="crew-bento-card">
              <img src={`/assets/member/${member.image_filename}`} alt={member.name} className="crew-card-avatar" onError={(e) => e.target.src = '/assets/Mainimg/hero-bg.jpg'} />
              <div className="crew-card-info">
                <h3 className="crew-card-name"><Link to={`/member/${member.id}`} className="profile-link">{member.name}</Link></h3>
                <div className="crew-card-progress">
                  <div className="cc-progress-text">{member.todayHours} / {member.goal} hrs</div>
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
    </div>
  );
}
