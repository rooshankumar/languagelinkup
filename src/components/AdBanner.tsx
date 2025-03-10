
import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({
  adSlot = '1234567890',
  adFormat = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This would normally initialize the ad, but for now it's just a placeholder
    // In a real implementation, we would check if window.adsbygoogle exists
    // and push the ad initialization
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container my-4 text-center ${className}`}>
      <div className="text-xs text-muted-foreground mb-1">Advertisement</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', overflow: 'hidden' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
