import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchMembers, getBestQuizAttempt, saveQuizAttempt, generateQuiz, fetchDailyLogs } from '../lib/supabase';
import TextPressure from '../components/TextPressure';
import LoadingSkeleton from '../components/LoadingSkeleton';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './QuizPage.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function QuizPage() {
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [bestAttempt, setBestAttempt] = useState(null);
  
  // State: 'pre', 'loading', 'active', 'results'
  const [quizState, setQuizState] = useState('pre');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const containerRef = useRef();
  const heroRef = useRef();
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    async function loadData() {
      const m = await fetchMembers();
      setMembers(m);
      if (m.length > 0) {
        const savedId = localStorage.getItem('testingUserId');
        const found = savedId ? m.find(mem => mem.id === parseInt(savedId)) : null;
        setCurrentUser(found || m[0]);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser && quizState === 'pre') {
      getBestQuizAttempt(currentUser.id).then(setBestAttempt);
    }
  }, [currentUser, quizState]);

  // Timer Logic
  useEffect(() => {
    if (quizState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizState]);

  useGSAP(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      ".qz-anim",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".quiz-content-wrapper",
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  if (!currentUser) return <LoadingSkeleton />;

  const handleStart = async () => {
    setQuizState('loading');

    // Compile recent study notes
    const logs = await fetchDailyLogs();
    const recentNotes = logs
      .filter(l => l.member_id === currentUser.id && l.notes)
      .map(l => l.notes.replace(/-/g, '').trim())
      .join(', ');
    const studyNotes = recentNotes || "General programming and Grand Line navigation";

    const qs = await generateQuiz(currentUser.subjects, currentUser.hobbies, studyNotes);
    setQuestions(qs);
    setCurrentQIndex(0);
    setScore(0);
    setTimeLeft(60);
    setSelectedOption(null);
    setQuizState('active');
  };

  const finishQuiz = async (finalScore) => {
    setQuizState('results');
    const timeTaken = 60 - (timeLeft <= 0 ? 0 : timeLeft);
    await saveQuizAttempt(currentUser.id, finalScore, timeTaken);
  };

  const handleTimeUp = () => {
    finishQuiz(scoreRef.current);
  };

  const handleOptionSelect = (idx) => {
    if (selectedOption !== null) return; // Prevent double click
    setSelectedOption(idx);
    
    const isCorrect = idx === questions[currentQIndex].correctIndex;
    let newScore = score;
    if (isCorrect) newScore += 1;
    setScore(newScore);
    scoreRef.current = newScore;

    // Auto advance after showing feedback
    setTimeout(() => {
      setSelectedOption(null);
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        clearInterval(timerRef.current);
        finishQuiz(newScore);
      }
    }, 800);
  };

  const getTags = () => {
    const subs = currentUser.subjects ? currentUser.subjects.split(',').map(s => s.trim()) : [];
    const hobs = currentUser.hobbies ? currentUser.hobbies.split(',').map(h => h.trim()) : [];
    return [...subs, ...hobs].filter(Boolean);
  };

  return (
    <div ref={containerRef} className="quiz-page-container">
      <div className="quiz-bento-grid">
        
        {/* Header spanning 2 columns */}
        <div className="bento-header bento-box" id="hero" ref={heroRef}>
          <TextPressure 
            text="T H E  Q U I Z"
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

        {/* Left Column: Persistent Profile Box */}
        <div className="bento-quiz-profile bento-box qz-anim">
          <img 
            src={`/assets/member/${currentUser.image_filename}`} 
            alt={currentUser.name} 
            className="pq-avatar" 
            onError={(e) => e.target.src='/assets/Mainimg/hero-bg.jpg'} 
          />
          <h2 className="pq-name">{currentUser.name}</h2>
          
          <div className="pq-tags">
            {getTags().map((tag, i) => (
              <span key={i} className="pq-tag">{tag}</span>
            ))}
          </div>

          <div className="pq-stats">
            Best Score
            <span>{bestAttempt ? `${bestAttempt.score}/10` : '-'}</span>
          </div>
        </div>

        {/* Right Column: Dynamic Quiz State */}
        <div className="bento-quiz-main bento-box qz-anim">
          {quizState === 'pre' && (
            <div className="pre-quiz-state">
              <h1 className="pre-quiz-title">Ready for the challenge?</h1>
              <p style={{fontFamily: 'Inter', color: '#555', fontSize: '18px'}}>Test your knowledge on your selected subjects and hobbies.</p>
              <button className="pq-btn" onClick={handleStart}>Start Quiz</button>
            </div>
          )}

          {quizState === 'loading' && (
            <div className="loading-state" style={{ textAlign: 'center', margin: 'auto', fontFamily: 'JetBrains Mono', fontSize: '20px', fontWeight: 'bold' }}>
              Generating AI questions...
            </div>
          )}

          {quizState === 'active' && questions.length > 0 && (
            <div className="active-quiz-state">
              <div className="aq-header">
                <div className="aq-progress">Question {currentQIndex + 1} / 10</div>
                <div className={`aq-timer ${timeLeft <= 10 ? 'urgent' : ''}`}>0:{timeLeft.toString().padStart(2, '0')}</div>
              </div>
              <div className="aq-question">
                {questions[currentQIndex].question}
              </div>
              <div className="aq-options">
                {questions[currentQIndex].options.map((opt, i) => {
                  let optClass = 'aq-option';
                  if (selectedOption !== null) {
                    if (i === questions[currentQIndex].correctIndex) optClass += ' correct';
                    else if (i === selectedOption) optClass += ' wrong';
                  }
                  return (
                    <button 
                      key={i} 
                      className={optClass}
                      onClick={() => handleOptionSelect(i)}
                      disabled={selectedOption !== null}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {quizState === 'results' && (
            <div className="results-state">
              <div className="res-title">Quiz Complete</div>
              <div className="res-score">{score} / 10</div>
              <div className="res-time">Time taken: {60 - (timeLeft <= 0 ? 0 : timeLeft)}s</div>
              
              <div className="res-actions">
                <button className="res-btn primary" onClick={() => setQuizState('pre')}>Try Again</button>
                <Link to="/challenge" className="res-btn">Back to Challenge</Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
