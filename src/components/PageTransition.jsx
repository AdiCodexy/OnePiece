import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1, 
    transition: { duration: 0.2, ease: "easeOut" } 
  },
  out: { 
    opacity: 0, 
    transition: { duration: 0.15, ease: "easeIn" } 
  }
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
