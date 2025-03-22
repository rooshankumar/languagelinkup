
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'stagger';
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  element = 'p',
  animation = 'fade',
  delay = 0,
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
        return 'opacity-0 animate-fade-in';
      case 'slide-up':
        return 'opacity-0 translate-y-4 animate-slide-up';
      case 'slide-down':
        return 'opacity-0 -translate-y-4 animate-slide-down';
      case 'stagger':
        return '';
      default:
        return 'opacity-0 animate-fade-in';
    }
  };

  const renderStaggeredText = () => {
    return text.split(' ').map((word, wordIndex) => (
      <span 
        key={wordIndex} 
        className={`inline-block opacity-0 animate-slide-up`}
        style={{ animationDelay: `${delay + wordIndex * 0.1}s`, animationFillMode: 'forwards' }}
      >
        {word}{' '}
      </span>
    ));
  };

  const Tag = element;
  const style = delay > 0 ? { animationDelay: `${delay}s`, animationFillMode: 'forwards' } : {};

  return React.createElement(
    Tag,
    {
      className: cn(animation === 'stagger' ? '' : getAnimationClass(), className),
      style: animation === 'stagger' ? {} : style,
    },
    animation === 'stagger' ? renderStaggeredText() : text
  );
};

export default AnimatedText;
