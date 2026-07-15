import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  fetchMembers, 
  fetchDailyLogs, 
  fetchAllQuizAttempts, 
  fetchMemberGoals,
  fetchFleets,
  getTodayDateStr,
  updateMemberProfile
} from '../lib/supabase';
import { computeAchievements } from '../lib/achievements';
import TextPressure from '../components/TextPressure';
import Footer from '../components/Footer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MemberProfilePage.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MemberProfilePage() {
  const { id } = useParams();
  const memberId = parseInt(id);

  const [member, setMember] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [goals, setGoals] = useState({});
  const [fleets, setFleets] = useState([]);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editBanner, setEditBanner] = useState('');

  // Audio Player Ref
  const audioRef = useRef(null);

  const containerRef = useRef();
  const heroRef = useRef();

  useEffect(() => {
    async function loadData() {
      const [m, l, q, g, f] = await Promise.all([
        fetchMembers(),
        fetchDailyLogs(),
        fetchAllQuizAttempts(),
        fetchMemberGoals(),
        fetchFleets()
      ]);
      setAllMembers(m);
      setMember(m.find(mem => mem.id === memberId));
      setLogs(l);
      setQuizAttempts(q);
      setGoals(g);
      setFleets(f);
    }
    loadData();
  }, [memberId]);

  useGSAP(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      ".prof-anim",
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1, 
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          toggleActions: "play none none none"
        }
      }
    );
  }, [member]);

  const savedId = localStorage.getItem('testingUserId');
  const currentUser = savedId 
    ? allMembers.find(m => m.id === parseInt(savedId)) || allMembers[0]
    : allMembers[0]; // Mock logged-in user
  const isOwner = currentUser?.id === member?.id;

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      }
    };
    
    // Attempt playback when member loads
    if (member) {
      playAudio();
    }

    // Fallback for strict browser autoplay policies
    document.addEventListener('click', playAudio, { once: true });
    
    return () => document.removeEventListener('click', playAudio);
  }, [member]);

  const handleEditOpen = () => {
    setEditBio(member.bio || '');
    setEditBanner(member.banner_filename || 'Banner1.jpg');
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    try {
      await updateMemberProfile(member.id, editBio, editBanner);
      setMember({ ...member, bio: editBio, banner_filename: editBanner });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!member) return <LoadingSkeleton />;

  // --- Compute Stats ---
  const getStreak = () => {
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
    return streak;
  };

  const streak = getStreak();
  const totalHours = logs.filter(l => l.member_id === memberId).reduce((sum, l) => sum + l.hours, 0);
  const memberQuizzes = quizAttempts.filter(q => q.member_id === memberId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const bestQuiz = memberQuizzes.length > 0 ? Math.max(...memberQuizzes.map(q => q.score)) : 0;

  // Rank computation (same logic as LeaderboardPage)
  const WEIGHTS = { streak: 10, quiz: 5, hours: 2 };
  const getWeeklyHours = (mid) => {
    const today = new Date(getTodayDateStr());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return logs.filter(l => {
      if (l.member_id !== mid) return false;
      const d = new Date(l.date);
      return d > weekAgo && d <= today;
    }).reduce((a, c) => a + c.hours, 0);
  };
  const getMemberStreak = (mid) => {
    const mLogs = logs.filter(l => l.member_id === mid).sort((a, b) => new Date(b.date) - new Date(a.date));
    const logMap = {};
    mLogs.forEach(l => logMap[l.date] = l);
    const today = getTodayDateStr();
    let d = new Date(today);
    if (!logMap[today] || !logMap[today].goal_met) d.setDate(d.getDate() - 1);
    let s = 0;
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (logMap[ds] && logMap[ds].goal_met) { s++; d.setDate(d.getDate() - 1); } else break;
    }
    return s;
  };
  const getBestQuiz = (mid) => {
    const a = quizAttempts.filter(q => q.member_id === mid);
    return a.length > 0 ? Math.max(...a.map(q => q.score)) : 0;
  };

  const ranked = allMembers.map(m => {
    const s = getMemberStreak(m.id);
    const h = getWeeklyHours(m.id);
    const q = getBestQuiz(m.id);
    return { id: m.id, score: (s * WEIGHTS.streak) + (q * WEIGHTS.quiz) + (h * WEIGHTS.hours) };
  }).sort((a, b) => b.score - a.score);
  const rank = ranked.findIndex(r => r.id === memberId) + 1;

  // Achievements
  const achievements = computeAchievements(memberId, logs, quizAttempts, streak);

  // Activity: last 14 days
  const activityDays = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.member_id === memberId && l.date === dStr);
    activityDays.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      hours: log ? log.hours : 0,
      goalMet: log ? log.goal_met : false,
      hasLog: !!log
    });
  }

  return (
    <div ref={containerRef} className="profile-page-container">
      <header className="profile-header-container" id="hero" ref={heroRef}>
        <div className="profile-banner">
          <img 
            src={`/assets/banners/${member.banner_filename || 'default.png'}`} 
            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/banners/default.png'; }} 
            alt={`${member.name} banner`} 
            className="profile-banner-img"
          />
        </div>
        
        <div className="profile-header-content">
          <div className="profile-avatar-row">
            <img 
              src={`/assets/member/${member.image_filename}`} 
              alt={member.name} 
              className="profile-avatar-large" 
            />
          </div>
          
          <div className="profile-info-row">
            <h1 className="profile-name-text">{member.name.toUpperCase()}</h1>
            
            {isOwner && (
              <button className="edit-profile-btn" onClick={handleEditOpen}>Edit Profile</button>
            )}
            
            <div className="profile-fleet-badge-wrapper inline">
              {member.fleet_id ? (
                (() => {
                  const myFleet = fleets.find(f => f.id === member.fleet_id);
                  return myFleet ? (
                    <Link to="/ships" className="profile-fleet-badge has-fleet">
                      <img src={`/assets/ships/${myFleet.image_filename}`} alt={myFleet.name} className="pf-badge-icon" />
                      <span className="pf-badge-name">{myFleet.name}</span>
                    </Link>
                  ) : null;
                })()
              ) : (
                <div className="profile-fleet-badge no-fleet">
                  <span className="pf-badge-name">No Fleet</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="profile-bio-text">{member.bio}</p>

          {(() => {
            const capitalizedName = member.name.charAt(0).toUpperCase() + member.name.slice(1).toLowerCase();
            return (
              <audio 
                ref={audioRef} 
                src={`/assets/Theme Songs/${capitalizedName}.mp3`} 
                autoPlay 
                loop
                style={{ display: 'none' }}
              />
            );
          })()}

          {/* Stats Bar */}
          <div className="profile-stats-bar prof-anim">
            <div className="stat-item">
              <span className="stat-value">{streak}</span>
              <span className="stat-label">DAY STREAK</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{totalHours}</span>
              <span className="stat-label">TOTAL HOURS</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{bestQuiz}/10</span>
              <span className="stat-label">BEST QUIZ</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">#{rank}</span>
              <span className="stat-label">OVERALL RANK</span>
            </div>
          </div>
        </div>
      </header>

      <div className="profile-content-wrapper">
        <section className="profile-section-padding">

          <Link to="/members" className="profile-back prof-anim">← Back to Crew</Link>

          {/* Achievements */}
          <span className="profile-section-title prof-anim">Achievements</span>
          <div className="badges-grid prof-anim">
            {achievements.map(badge => (
              <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                <span className="badge-icon">{badge.icon}</span>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.description}</div>
              </div>
            ))}
          </div>

          {/* Activity Timeline */}
          <span className="profile-section-title prof-anim">Last 14 Days</span>
          {activityDays.some(d => d.hasLog) ? (
            <table className="activity-table prof-anim">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Goal</th>
                </tr>
              </thead>
              <tbody>
                {activityDays.map((day, i) => (
                  <tr key={i}>
                    <td>{day.date}</td>
                    <td>{day.hasLog ? `${day.hours} hrs` : '—'}</td>
                    <td>
                      {day.hasLog ? (
                        <span className={`goal-check ${day.goalMet ? 'met' : 'missed'}`}>
                          {day.goalMet ? '✓' : '✗'}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state prof-anim">No activity logged yet.</div>
          )}

          {/* Quiz History */}
          <span className="profile-section-title prof-anim">Quiz History</span>
          {memberQuizzes.length > 0 ? (
            <div className="quiz-history-list prof-anim">
              {memberQuizzes.map(q => (
                <div key={q.id} className="quiz-history-item">
                  <div className="qh-date">{new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className="qh-score">{q.score}/10</div>
                  <div className="qh-time">{q.time_taken_seconds}s</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state prof-anim">No quizzes attempted yet.</div>
          )}

        </section>
      </div>

      <Footer />

      {isEditing && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h2>Edit Profile</h2>
            <div className="edit-field">
              <label>Bio</label>
              <textarea 
                className="edit-bio-input" 
                value={editBio} 
                onChange={(e) => setEditBio(e.target.value)} 
              />
            </div>
            <div className="edit-field">
              <label>Banner</label>
              <div className="banner-picker">
                {['Banner1.jpg', 'banner2.jpg', 'banner3.jpg'].map(b => (
                  <div 
                    key={b} 
                    className={`banner-option ${editBanner === b ? 'selected' : ''}`}
                    onClick={() => setEditBanner(b)}
                  >
                    <img src={`/assets/banners/${b}`} alt={b} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="modal-btn save" onClick={handleEditSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
