import React, { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import TextPressure from '../components/TextPressure';
import { fetchFleets, fetchMembers, joinFleet } from '../lib/supabase';
import './PirateShipsPage.css';

const PirateShipsPage = () => {
  const [fleets, setFleets] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const containerRef = useRef();
  const heroRef = useRef();

  useEffect(() => {
    async function loadData() {
      const [f, m] = await Promise.all([
        fetchFleets(),
        fetchMembers()
      ]);
      setFleets(f);
      setMembers(m);
      if (m.length > 0) setCurrentUser(m[0]); // Mocking current user as LUFFY
    }
    loadData();
  }, []);

  useGSAP(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      ".ship-anim",
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power3.out",
        delay: 0.2
      }
    );
  }, [fleets]);

  const handleJoinFleet = async (fleetId) => {
    if (!currentUser) return;
    
    try {
      await joinFleet(currentUser.id, fleetId);
      
      // Update local state to reflect change immediately
      setCurrentUser(prev => ({ ...prev, fleet_id: fleetId }));
      setMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, fleet_id: fleetId } : m));
      
      // Fun little animation on the card
      gsap.fromTo(`.ship-card-${fleetId}`, 
        { scale: 0.95 },
        { scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    } catch (err) {
      console.error("Error joining ship", err);
    }
  };

  return (
    <div ref={containerRef} className="ships-page-container">
      <main className="ships-hero" id="hero" ref={heroRef}>
        <div className="hero-text-container">
          <TextPressure 
            text="F L E E T S"
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
        <div className="subtitle">Choose your flag. Sail the seas.</div>
      </main>

      <div className="ships-content-wrapper">
        <section className="ships-section-padding">
          <div className="ships-grid">
            {fleets.map((fleet, idx) => {
              const crewMembers = members.filter(m => m.fleet_id === fleet.id);
              const isMyFleet = currentUser?.fleet_id === fleet.id;

              return (
                <div 
                  key={fleet.id} 
                  className={`ship-card ship-card-${fleet.id} ship-anim ${isMyFleet ? 'active-ship' : ''}`}
                >
                  <div className="ship-logo-wrapper">
                    <img 
                      src={`/assets/ships/${fleet.image_filename}`} 
                      alt={fleet.name} 
                      className="ship-logo"
                    />
                    {isMyFleet && <div className="ship-badge">Your Crew</div>}
                  </div>
                  
                  <div className="ship-info">
                    <h2 className="ship-name">{fleet.name}</h2>
                    <p className="ship-desc">{fleet.description}</p>
                    
                    <div className="ship-stats">
                      <div className="stat-item">
                        <span className="stat-value">{crewMembers.length}</span>
                        <span className="stat-label">Members</span>
                      </div>
                    </div>

                    <button 
                      className={`join-btn ${isMyFleet ? 'joined' : ''}`}
                      onClick={() => handleJoinFleet(fleet.id)}
                      disabled={isMyFleet}
                    >
                      {isMyFleet ? 'Joined' : 'Join Fleet'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PirateShipsPage;
