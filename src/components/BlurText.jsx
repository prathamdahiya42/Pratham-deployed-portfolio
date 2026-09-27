import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

/**
 * BlurText — React Bits Text Animation
 * Word-by-word or letter-by-letter stagger reveal with focal blur and smooth deceleration.
 */
export default function BlurText({
  text = '',
  delay = 80,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.15,
  rootMargin = '0px',
  stepDuration = 0.45,
  style = {},
}) {
  const elements = useMemo(() => {
    return animateBy === 'words' ? text.split(' ') : text.split('');
  }, [text, animateBy]);

  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      setInView(true);
      return;
    }
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, prefersReduced]);

  if (prefersReduced) {
    return <span className={className} style={style}>{text}</span>;
  }

  const initialVariant = {
    filter: 'blur(10px)',
    opacity: 0,
    y: direction === 'top' ? -20 : 20,
  };

  const targetVariant = {
    filter: 'blur(0px)',
    opacity: 1,
    y: 0,
  };

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        ...style,
      }}
    >
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          initial={initialVariant}
          animate={inView ? targetVariant : initialVariant}
          transition={{
            duration: stepDuration,
            delay: (index * delay) / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </span>
  );
}
