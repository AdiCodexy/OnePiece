import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import feather from 'feather-icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/menu.css';

const SideMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const panelRef = useRef(null);
  const btnIconRef = useRef(null);
  const textInnerRef = useRef(null);

  useEffect(() => {
    feather.replace();
  }, []);

  const toggleMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);

    const menuContainer = containerRef.current;
    const layer1 = layer1Ref.current;
    const layer2 = layer2Ref.current;
    const menuPanel = panelRef.current;
    const btnIcon = btnIconRef.current;
    const textInner = textInnerRef.current;
    const menuTexts = menuPanel.querySelectorAll('.menu-text');

    if (nextState) {
      menuContainer.style.pointerEvents = 'auto';

      gsap.to(btnIcon, { rotation: 225, duration: 0.5, ease: "power3.inOut" });

      gsap.to(textInner, {
        yPercent: -(5 / 6) * 100,
        duration: 0.8,
        ease: "power4.inOut"
      });

      const tl = gsap.timeline();

      tl.to([layer1, layer2], {
        x: "0%",
        duration: 0.5,
        ease: "power4.out",
        stagger: 0.07
      }, 0);

      tl.to(menuPanel, {
        x: "0%",
        duration: 0.65,
        ease: "power4.out"
      }, 0.1);

      tl.fromTo(menuTexts,
        { yPercent: 140, rotation: 10 },
        { yPercent: 0, rotation: 0, duration: 1, ease: "power4.out", stagger: 0.1 },
        0.2
      );

    } else {
      menuContainer.style.pointerEvents = 'none';

      gsap.to(btnIcon, { rotation: 0, duration: 0.5, ease: "power3.inOut" });

      gsap.to(textInner, {
        yPercent: 0,
        duration: 0.8,
        ease: "power4.inOut"
      });

      const tl = gsap.timeline();

      tl.to([layer1, layer2, menuPanel], {
        x: "100%",
        duration: 0.32,
        ease: "power3.in"
      }, 0);
    }
  };

  const handleContainerClick = (e) => {
    if (isMenuOpen && (e.target === layer1Ref.current || e.target === layer2Ref.current || e.target === containerRef.current)) {
      toggleMenu();
    }
  };

  return (
    <>
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        <div className="menu-btn-icon" ref={btnIconRef}>
          <i data-feather="plus"></i>
        </div>
        <div className="menu-btn-text">
          <div className="menu-text-inner" ref={textInnerRef}>
            <span className="m-text">Menu</span>
            <span className="m-text">Close</span>
            <span className="m-text">Menu</span>
            <span className="m-text">Close</span>
            <span className="m-text">Menu</span>
            <span className="m-text">Close</span>
          </div>
        </div>
      </button>

      <div className="mobile-menu" ref={containerRef} onClick={handleContainerClick}>
        <div className="menu-underlay layer-1" ref={layer1Ref}></div>
        <div className="menu-underlay layer-2" ref={layer2Ref}></div>
        <div className="menu-panel" ref={panelRef}>
          <nav className="menu-nav">
            <Link to="/" className="menu-item" onClick={toggleMenu}>
              <div className="menu-text-wrap">
                <span className="menu-text">ONEPIECE</span>
              </div>
            </Link>
            <Link to="/challenge" className="menu-item" onClick={toggleMenu}>
              <div className="menu-text-wrap">
                <span className="menu-text">Challenge</span>
              </div>
            </Link>
            <Link to="/quiz" className="menu-item" onClick={toggleMenu}>
              <div className="menu-text-wrap">
                <span className="menu-text">Quiz</span>
              </div>
            </Link>
            <Link to="/leaderboard" className="menu-item" onClick={toggleMenu}>
              <div className="menu-text-wrap">
                <span className="menu-text">Leaderboard</span>
              </div>
            </Link>
            <Link to="/members" className="menu-item" onClick={toggleMenu}>
              <div className="menu-text-wrap">
                <span className="menu-text">PROFILES</span>
              </div>
            </Link>
            <Link to="/ships" className="menu-item" onClick={toggleMenu}>
              <div className="menu-text-wrap">
                <span className="menu-text">Ships</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
