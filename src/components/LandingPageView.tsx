import React, { useEffect } from 'react';

export const LandingPageView: React.FC<any> = () => {
  useEffect(() => {
    // Listen for messages from the iframe if they decide to add postMessage navigation later
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigate-home') {
        window.location.hash = '#home';
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe 
      src="/landing.html" 
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }} 
      title="Ribble Landing Page" 
    />
  );
};
