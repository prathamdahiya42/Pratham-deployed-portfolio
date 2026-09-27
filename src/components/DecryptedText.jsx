import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * DecryptedText — React Bits Text Animation
 * Scrambles and decrypts characters into view with cyber glyphs.
 */
export default function DecryptedText({
  text = '',
  speed = 45,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~<>?',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view', // 'view' | 'hover' | 'inViewHover'
  style = {},
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(true);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);

  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const getRandomChar = useCallback(() => {
    if (useOriginalCharsOnly) {
      const distinctChars = Array.from(new Set(text.split('').filter(c => c !== ' ')));
      return distinctChars[Math.floor(Math.random() * distinctChars.length)] || '?';
    }
    return characters[Math.floor(Math.random() * characters.length)];
  }, [characters, text, useOriginalCharsOnly]);

  const shuffleText = useCallback(
    (originalText, revealedSet) => {
      return originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (revealedSet.has(index)) return originalText[index];
          return getRandomChar();
        })
        .join('');
    },
    [getRandomChar]
  );

  const triggerDecrypt = useCallback(() => {
    if (prefersReduced) {
      setDisplayText(text);
      setIsDecrypted(true);
      return;
    }
    setRevealedIndices(new Set());
    setIsAnimating(true);
    setIsDecrypted(false);
  }, [prefersReduced, text]);

  useEffect(() => {
    if (!isAnimating || prefersReduced) return;

    let currentIdx = 0;
    const len = text.length;

    intervalRef.current = setInterval(() => {
      setRevealedIndices(prev => {
        const next = new Set(prev);
        if (next.size < len) {
          next.add(currentIdx);
          currentIdx += 1;
          setDisplayText(shuffleText(text, next));
          return next;
        } else {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          setIsDecrypted(true);
          setDisplayText(text);
          return next;
        }
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [isAnimating, text, speed, shuffleText, prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    if (animateOn !== 'view' && animateOn !== 'inViewHover') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          triggerDecrypt();
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, triggerDecrypt, prefersReduced]);

  if (prefersReduced) {
    return <span className={parentClassName} style={style}>{text}</span>;
  }

  return (
    <motion.span
      ref={containerRef}
      className={parentClassName}
      style={{ display: 'inline-block', ...style }}
      onMouseEnter={animateOn === 'inViewHover' ? triggerDecrypt : undefined}
      {...props}
    >
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealed = revealedIndices.has(index) || isDecrypted;
          return (
            <span
              key={index}
              className={isRevealed ? className : encryptedClassName}
              style={{
                display: 'inline-block',
                opacity: isRevealed ? 1 : 0.75,
                transition: 'opacity 0.15s ease',
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
