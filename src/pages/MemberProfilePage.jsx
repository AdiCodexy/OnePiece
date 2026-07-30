import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMembers } from '../lib/supabase';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './MemberProfilePage.css';

export default function MemberProfilePage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      const allMembers = await fetchMembers();
      const found = allMembers.find(m => m.id === parseInt(id));
      setMember(found);
      setLoading(false);
    }
    loadMember();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!member) return <div className="profile-error">Member not found. <Link to="/">Go back</Link></div>;

  return (
    <div className="mpp-page-container">
      <div className="mpp-bento-grid">
        
        {/* Banner */}
        <div className="mpp-banner bento-box">
          {member.banner_filename ? (
            <img src={`/assets/banners/${member.banner_filename}`} alt={`${member.name} banner`} />
          ) : (
            <div className="mpp-banner-placeholder"></div>
          )}
        </div>

        {/* Identity */}
        <div className="mpp-identity bento-box">
          <img 
            src={`/assets/member/${member.image_filename}`} 
            alt={member.name} 
            className="mpp-avatar-large"
            onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'}
          />
          <h1 className="mpp-name">{member.name}</h1>
          <Link to="/" className="back-btn">← Back to Dashboard</Link>
        </div>

        {/* Info */}
        <div className="mpp-info bento-box">
          <h2>Biography</h2>
          <p>{member.bio || 'No biography available.'}</p>
          
          <div className="mpp-tags-section">
            <div className="tags-group">
              <h3>Hobbies</h3>
              <div className="tags-list">
                {member.hobbies ? member.hobbies.split(',').map((h, i) => (
                  <span key={i} className="mpp-tag">{h.trim()}</span>
                )) : <span>None</span>}
              </div>
            </div>
            <div className="tags-group">
              <h3>Subjects</h3>
              <div className="tags-list">
                {member.subjects ? member.subjects.split(',').map((s, i) => (
                  <span key={i} className="mpp-tag">{s.trim()}</span>
                )) : <span>None</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats placeholder */}
        <div className="mpp-stats bento-box">
          <h2>Stats Overview</h2>
          <p>Coming soon: Individual stats and achievements will be displayed here.</p>
        </div>

      </div>
    </div>
  );
}
