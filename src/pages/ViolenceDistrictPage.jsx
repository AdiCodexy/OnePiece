import React, { useState, useEffect } from 'react';
import './ViolenceDistrictPage.css';
import { fetchMembers, VISITOR_USER } from '../lib/supabase';

export default function ViolenceDistrictPage() {
  const [isDayPhase, setIsDayPhase] = useState(true);
  const [forcePhase, setForcePhase] = useState('auto'); // 'auto', 'day', 'night'
  const [userRole, setUserRole] = useState('Villager');
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState("00:00:00");
  const [notification, setNotification] = useState(null);
  const [hasWitchRevealed, setHasWitchRevealed] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameHistory, setGameHistory] = useState([]);

  const isAdmin = currentUser?.name?.toUpperCase() === 'CARROT';

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hour = now.getHours();
      
      let nextPhaseHour = 18; // default to 6 PM (Night)
      let currentIsDay = false;

      if (forcePhase === 'auto') {
        if (hour >= 6 && hour < 18) {
          currentIsDay = true;
          nextPhaseHour = 18;
        } else {
          currentIsDay = false;
          nextPhaseHour = 6;
        }
      } else {
        currentIsDay = forcePhase === 'day';
      }

      setIsDayPhase(currentIsDay);

      // Calculate time until next phase
      const target = new Date(now);
      target.setHours(nextPhaseHour, 0, 0, 0);
      if (nextPhaseHour === 6 && hour >= 18) {
        // Target is tomorrow at 6 AM
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target - now;
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (forcePhase === 'auto') {
        setTimeLeftStr(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      } else {
        setTimeLeftStr("--:--:--");
      }
    };
    
    tick(); // check on load
    const interval = setInterval(tick, 1000); // tick every second

    return () => clearInterval(interval);
  }, [forcePhase]);

  useEffect(() => {
    // Reset witch ability when phase changes to Day
    if (isDayPhase) {
      localStorage.removeItem('witch_revealed_this_night');
      setHasWitchRevealed(false);
    } else {
      const revealed = localStorage.getItem('witch_revealed_this_night') === 'true';
      setHasWitchRevealed(revealed);
    }
  }, [isDayPhase]);

  const prevPhaseRef = React.useRef(isDayPhase);
  useEffect(() => {
    if (prevPhaseRef.current === false && isDayPhase === true) {
      setRoundNumber(prev => prev + 1);
    }
    prevPhaseRef.current = isDayPhase;
  }, [isDayPhase]);

  useEffect(() => {
    async function loadUser() {
      const m = await fetchMembers();
      if (m.length > 0) {
        const savedId = localStorage.getItem('testingUserId');
        let user;
        if (savedId === '9999') {
          user = VISITOR_USER;
        } else {
          const found = savedId ? m.find(mem => mem.id === parseInt(savedId)) : null;
          user = found || m[0];
        }
        setCurrentUser(user);
        if (user.name?.toUpperCase() === 'CARROT') {
          setUserRole('Admin');
        }
      }
    }
    loadUser();
  }, []);
  
  const memberNames = [
    "Arlong", "Beckman", "Carrot", "Doflamingo",
    "Dragon", "GAIMON", "Gunko", "Koby",
    "Luffy", "Shanks", "Yamato", "Zoro"
  ];
  
  const defaultRolesPool = ['Killer', 'Witch', 'Jester', 'Jester', 'Queen', 'Royal Guard', 'Royal Archer', 'Villager', 'Villager', 'Villager', 'Villager'];
  
  const [activePlayers, setActivePlayers] = useState(() => {
    const pool = [...defaultRolesPool];
    return memberNames.filter(name => name !== "Carrot").map((name, i) => {
      return {
        id: i + 1,
        name: name,
        avatar: `/assets/member/${name}.jpg`,
        isAlive: true,
        gameRole: pool.pop() || 'Villager'
      };
    });
  });

  const resetGame = () => {
    const pool = [...defaultRolesPool];
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    const newPlayers = memberNames.filter(name => name !== "Carrot").map((name, i) => {
      return {
        id: i + 1,
        name: name,
        avatar: `/assets/member/${name}.jpg`,
        isAlive: true,
        gameRole: pool.pop() || 'Villager'
      };
    });
    
    setActivePlayers(newPlayers);
    setGameHistory([{ phase: "System", event: "Game has been reset. Roles randomized." }]);
    setRoundNumber(1);
    showNotification("Game reset successfully!");
  };

  const handleAction = (actionName, playerName) => {
    const phaseName = isDayPhase ? `Day ${roundNumber}` : `Night ${roundNumber}`;
    const targetPlayer = activePlayers.find(p => p.name === playerName);

    if (actionName === 'Assassinate' || actionName === 'Vote Kick') {
      setActivePlayers(prev => prev.map(p => 
        p.name === playerName ? { ...p, isAlive: false } : p
      ));
      
      const actorName = currentUser?.name || 'Unknown';
      let actorRole = 'Villager';
      if (isAdmin) actorRole = 'Admin';
      else {
        const pNode = activePlayers.find(p => p.name === actorName);
        if (pNode) actorRole = pNode.gameRole;
      }
      
      const logMsg = actionName === 'Assassinate' 
        ? `Killer assassinated ${playerName}` 
        : `${actorName} (${actorRole}) voted out ${playerName}`;
        
      setGameHistory(prev => [{ phase: phaseName, event: logMsg }, ...prev]);
      showNotification(`${playerName} has been ${actionName === 'Assassinate' ? 'assassinated in the night' : 'voted out by the council'}!`);
      
    } else if (actionName === 'Reveal Role of') {
      if (hasWitchRevealed) return; // Prevent double clicks
      
      const role = targetPlayer?.gameRole || 'Unknown';
      showNotification(`Witch's Vision: ${playerName} is a ${role}!`);
      
      setGameHistory(prev => [{ phase: phaseName, event: `Witch checked ${playerName}'s role` }, ...prev]);
      
      setHasWitchRevealed(true);
      localStorage.setItem('witch_revealed_this_night', 'true');
    }
  };

  // Render Player Action Button based on Role and Phase
  const renderActionButton = (player) => {
    if (currentUser?.is_visitor) {
      return <button className="vd-vote-btn vd-btn-disabled" disabled>Visitor</button>;
    }
    if (userRole === 'Admin') {
      return <button className="vd-vote-btn vd-btn-disabled" disabled>Admin</button>;
    }
    if (!player.isAlive) {
      return <button className="vd-vote-btn vd-btn-disabled" disabled>Dead</button>;
    }
    
    if (isDayPhase) {
      return <button className="vd-vote-btn" onClick={() => handleAction('Vote Kick', player.name)}>Vote Kick</button>;
    }
    
    // Night Phase Logic
    if (userRole === 'Killer') {
      return <button className="vd-vote-btn vd-btn-assassinate" onClick={() => handleAction('Assassinate', player.name)}>Assassinate</button>;
    } else if (userRole === 'Witch') {
      if (hasWitchRevealed) {
        return <button className="vd-vote-btn vd-btn-disabled" disabled>Used Ability</button>;
      }
      return <button className="vd-vote-btn vd-btn-reveal" onClick={() => handleAction('Reveal Role of', player.name)}>Reveal Role</button>;
    } else {
      return <button className="vd-vote-btn vd-btn-disabled" disabled>Sleeping...</button>;
    }
  };
  
  return (
    <div className={`vd-container ${!isDayPhase ? 'vd-night-mode' : ''}`}>
      
      {/* --- ADMIN CONTROLS --- */}
      {isAdmin && (
        <div className="vd-dev-controls">
          <span style={{ fontWeight: 800, color: '#d35400' }}>ADMIN</span>
          <label>
            Phase:
            <select value={forcePhase} onChange={(e) => setForcePhase(e.target.value)}>
              <option value="auto">Auto (Real Time)</option>
              <option value="day">Force Day</option>
              <option value="night">Force Night</option>
            </select>
          </label>
          <label>
            Test Role:
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="Villager">Villager</option>
              <option value="Killer">Killer</option>
              <option value="Witch">Witch</option>
            </select>
          </label>
          <button className="vd-reset-btn" onClick={resetGame}>Reset Game</button>
        </div>
      )}
      {/* ------------------------------------------ */}

      {/* In-Game Notification Toast */}
      {notification && (
        <div className="vd-notification">
          {notification}
        </div>
      )}

      <div className="vd-content-wrapper">
        {/* Header Section */}
        <header className="vd-header">
          <h1>V I O L E N C E &nbsp; D I S T R I C T</h1>
        </header>

        {/* Game Status Banner */}
        <section className={`vd-card vd-banner ${isDayPhase ? 'vd-banner-day' : 'vd-banner-night'}`}>
          <div className="vd-banner-info">
            <h2>{isDayPhase ? 'Day Phase' : 'Night Phase'}</h2>
            <p>{isDayPhase ? 'Council is in session. Discuss and Vote.' : 'The Killer is awake...'}</p>
          </div>
          <div className="vd-banner-timer">
            <span className={isDayPhase ? 'vd-text-dark' : 'vd-text-light'}>{timeLeftStr}</span>
          </div>
        </section>

        {/* Player Dashboard (Bento Grid) */}
        <main className="vd-bento-grid">
          
          {/* My Role Card */}
          <section className="vd-card vd-my-role">
            <h3>My Role</h3>
            <div className="vd-role-details">
              <div className="vd-avatar-placeholder">
                <img src={currentUser ? `/assets/member/${currentUser.image_filename}` : `/assets/member/Luffy.jpg`} alt="Role Avatar" onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} />
              </div>
              <div className="vd-role-text">
                <h4>{userRole}</h4>
                <p>
                  {userRole === 'Admin' && "You are the Game Master. You oversee the violence, control the phases, and ensure fairness."}
                  {userRole === 'Villager' && "You are just a chillguy, you are good not evil. Be happy and vote for the killer."}
                  {userRole === 'Killer' && "Will decide whom to kill. Killed player will be out for the round. If only killer remains, the killer wins."}
                  {userRole === 'Witch' && "Will be able to see any player's role in between rounds. Vote kicking the witch grants +2 Points to the council."}
                </p>
              </div>
            </div>
          </section>

          {/* Active Players / Council Grid */}
          <section className="vd-card vd-council">
            <h3>{isDayPhase ? 'The Council (Active Players)' : 'Players'}</h3>
            <div className="vd-players-grid">
              {activePlayers.map(player => (
                <div key={player.id} className={`vd-player-card ${!player.isAlive ? 'vd-player-dead' : ''}`}>
                  <img src={player.avatar} alt={player.name} className="vd-player-avatar" />
                  <span className="vd-player-name">{player.name}</span>
                  {isAdmin && player.gameRole && (
                    <span className="vd-admin-role-badge">{player.gameRole}</span>
                  )}
                  {renderActionButton(player)}
                </div>
              ))}
            </div>
          </section>

          {/* Role Reference Guide */}
          <section className="vd-card vd-role-guide">
            <h3>Role Reference Guide</h3>
            <div className="vd-dropdowns">
              <details className="vd-dropdown">
                <summary>Queen</summary>
                <div className="vd-dropdown-content">Your vote counts as 3 (be safe lady).</div>
              </details>
              <details className="vd-dropdown">
                <summary>Royal Archer</summary>
                <div className="vd-dropdown-content">Your vote counts as 2 (be careful whom you vote out).</div>
              </details>
              <details className="vd-dropdown">
                <summary>Royal Guard</summary>
                <div className="vd-dropdown-content">Can protect 1 random guy, he can be anything but guard don't know that.</div>
              </details>
              <details className="vd-dropdown">
                <summary>Witch</summary>
                <div className="vd-dropdown-content">Will be able to see any player's role in between rounds. Vote kicking the witch grants +2 Points to the council. (Witch can hide that she is a witch to protect herself or she can help the council).</div>
              </details>
              <details className="vd-dropdown">
                <summary>Killer</summary>
                <div className="vd-dropdown-content">Will decide whom to kill. Killed player will be out for the round. If only killer remains, the killer wins.</div>
              </details>
              <details className="vd-dropdown">
                <summary>Jesters (x2)</summary>
                <div className="vd-dropdown-content">If Council decides to vote kick jester, jester will win directly. Jester manipulates others to think that he's the killer. Only one jester can win, so 2 jesters will have a manipulation battle.</div>
              </details>
              <details className="vd-dropdown">
                <summary>Villagers (3-7)</summary>
                <div className="vd-dropdown-content">You are just a chillguy, you are good not evil. Be happy and vote for the killer.</div>
              </details>
            </div>
          </section>

        </main>
        
        {/* Game History Action Log */}
        {gameHistory.length > 0 && (
          <section className="vd-card vd-history-log">
            <h3>Game Action Log</h3>
            <div className="vd-history-list">
              {gameHistory.map((log, index) => (
                <div key={index} className="vd-history-item">
                  <span className={`vd-history-phase ${log.phase.includes('Night') ? 'vd-night-phase-badge' : 'vd-day-phase-badge'}`}>
                    {log.phase}
                  </span>
                  <span className="vd-history-event">{log.event}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
