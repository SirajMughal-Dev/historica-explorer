import React, { useEffect, useRef, useState } from 'react';

/**
 * Wraps children and adds a smooth fade-in/slide-up animation the first time
 * the element scrolls into view. Uses IntersectionObserver (not scroll event
 * listeners) so it's cheap and doesn't run on every scroll frame.
 *
 * Props:
 *  - delay: ms to stagger the animation (useful for grids of cards)
 *  - y: starting vertical offset in px (default 24)
 *  - as: element tag to render (default 'div')
 */
const ScrollReveal = ({ children, delay = 0, y = 24, className = '', as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If the browser doesn't support IntersectionObserver, or the user prefers
    // reduced motion, just show content immediately with no animation.
    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(node); // animate once, then stop observing (cheap + no re-trigger flicker)
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        willChange: 'opacity, transform'
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default ScrollReveal;
