import React, { useState, useEffect, useRef } from 'react';
import { fetchMembers } from '../lib/supabase';
import TextPressure from '../components/TextPressure';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './MembersPage.css';

const MemberBento = ({ member }) => {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const hobbiesList = member.hobbies ? member.hobbies.split(',').map(s => s.trim()) : [];
  const subjectsList = member.subjects ? member.subjects.split(',').map(s => s.trim()) : [];
  const combinedTags = [...hobbiesList, ...subjectsList].slice(0, 6);
  
  const baseName = member.image_filename ? member.image_filename.split('.')[0] : member.name;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.volume = 0.3; // Lower volume for background ambience
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(e => {
                  console.warn("Autoplay prevented on scroll:", e);
                });
              }
            }
          } else {
            if (audioRef.current && !audioRef.current.paused) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.6 } // Needs to be 60% visible to play
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <div className="profile-bento-grid" ref={containerRef} id={`member-${member.id}`}>
      {/* Top Header */}
      <div className="bento-profile-header bento-box">
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <TextPressure 
            text={`${member.name.toUpperCase()} PROFILE`}
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
      </div>

      {/* Left Column: Identity */}
      <div className="bento-profile-identity bento-box">
        <img 
          src={`/assets/member/${member.image_filename}`} 
          alt={member.name} 
          className="profile-avatar-large"
          onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'}
        />
        <h1 className="profile-name">{member.name}</h1>
        <h2 className="profile-title">Grand Line Challenger</h2>
        <div className="profile-bio">
          {member.bio || "No biography available. This mysterious pirate hasn't left much of a trail."}
        </div>
      </div>

      {/* Right Column Top: Stats */}
      <div className="bento-profile-stats bento-box">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{member.total_streak || 0}</div>
            <div className="stat-label">Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{member.highest_quiz_score || 0}</div>
            <div className="stat-label">Best Quiz</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{(member.total_score || 0) * 2}</div>
            <div className="stat-label">Hours</div>
          </div>
        </div>
      </div>

      {/* Right Column Bottom: Media */}
      <div className="bento-profile-media bento-box">
        <div>
          <h3 className="media-section-title">Interests & Specialities</h3>
          <div className="hobbies-list">
            {combinedTags.map((tag, i) => (
              <span key={i}>
                {tag}
                {i < combinedTags.length - 1 && <span className="hobby-dot">•</span>}
              </span>
            ))}
          </div>
        </div>

        <audio 
          ref={audioRef}
          src={`/assets/Theme%20Songs/${baseName}.mp3`}
          loop
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMembers();
        setMembers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle hash scrolling on load
  useEffect(() => {
    if (!loading && members.length > 0 && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [loading, members]);

  if (loading) {
    return (
      <div className="members-feed-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <div style={{width: '400px'}}><LoadingSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="members-feed-container">
      <div className="members-feed-scroll" ref={scrollContainerRef}>
        {members.map(member => (
          <MemberBento key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
