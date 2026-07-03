import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal wrapper: fades/slides its content in the first time it
 * enters the viewport. Respects prefers-reduced-motion (renders visible
 * immediately, no transition).
 */
const Reveal = ({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} reveal ${visible ? 'reveal--visible' : ''}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
