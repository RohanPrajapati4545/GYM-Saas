import React from 'react';
import { useSelector } from 'react-redux';
import { Dumbbell } from 'lucide-react';

const DynamicLogo = ({ size = 'medium', subtitle = 'FITNESS SAAS PLATFORM' }) => {
  const { settings } = useSelector((state) => state.settings);
  const siteName = settings?.siteName && settings.siteName !== 'RK PRAJAPATI' ? settings.siteName : 'Ro-Fitness';
  const logoUrl = settings?.logo && settings.logo !== '/rk-prajapati-logo.jpg' ? settings.logo : '/ro-logo.svg';

  const iconSizes = {
    small: 18,
    medium: 22,
    large: 28,
  };

  const imgSizes = {
    small: { w: 44, h: 28 },
    medium: { w: 58, h: 36 },
    large: { w: 74, h: 46 },
  };

  const titleSizes = {
    small: '1.15rem',
    medium: '1.38rem',
    large: '1.85rem',
  };

  return (
    <div className="d-flex align-items-center gap-2 text-decoration-none logo-brand-link">
      {logoUrl ? (
        <div
          className="logo-img-frame"
          style={{
            width: `${imgSizes[size]?.w || 42}px`,
            height: `${imgSizes[size]?.h || 42}px`,
            overflow: 'visible',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}
        >
          <img
            src={logoUrl}
            alt={siteName}
            style={{ width: '100%', height: '100%', objectFit: 'contain', border: 'none', outline: 'none' }}
          />
        </div>
      ) : (
        <div className="logo-symbol" style={{ width: size === 'large' ? '46px' : size === 'medium' ? '38px' : '30px', height: size === 'large' ? '46px' : size === 'medium' ? '38px' : '30px', border: 'none' }}>
          <Dumbbell size={iconSizes[size] || 22} />
        </div>
      )}
      <div className="d-flex flex-column text-start">
        <span className="logo-title font-hero" style={{ fontSize: titleSizes[size] || '1.38rem', color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.1 }}>
          {siteName.toLowerCase() === 'ro-fitness' ? (
            <>
              <span style={{ color: '#ffffff', fontWeight: 800 }}>Ro-</span>
              <span style={{ color: '#ff2a2a', fontWeight: 900 }}>Fitness</span>
            </>
          ) : (
            siteName
          )}
        </span>
        {subtitle && (
          <span className="logo-subtitle fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: settings?.primaryColor || '#ff2a2a' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default DynamicLogo;
