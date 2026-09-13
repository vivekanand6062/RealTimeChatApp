import React, { useState, useMemo } from 'react';

// Palette of modern gradients for default avatars
const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-fuchsia-600',
  'from-teal-500 to-cyan-600',
  'from-blue-600 to-indigo-700',
];

const SIZE_MAP = {
  xs: { box: 'w-7 h-7 min-w-7 min-h-7', text: 'text-xs', dot: 'w-2 h-2 -bottom-0.5 -right-0.5' },
  sm: { box: 'w-9 h-9 min-w-9 min-h-9', text: 'text-xs font-semibold', dot: 'w-2.5 h-2.5 bottom-0 right-0' },
  md: { box: 'w-11 h-11 min-w-11 min-h-11', text: 'text-sm font-semibold', dot: 'w-3 h-3 bottom-0 right-0' },
  lg: { box: 'w-14 h-14 min-w-14 min-h-14', text: 'text-lg font-bold', dot: 'w-3.5 h-3.5 bottom-0.5 right-0.5' },
  xl: { box: 'w-20 h-20 min-w-20 min-h-20', text: 'text-2xl font-bold', dot: 'w-4 h-4 bottom-1 right-1' },
  '2xl': { box: 'w-24 h-24 min-w-24 min-h-24', text: 'text-3xl font-bold', dot: 'w-5 h-5 bottom-1 right-1' },
};

const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim();
  if (!clean) return 'U';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const hashString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const Avatar = ({
  user,
  src,
  name,
  size = 'md',
  isOnline,
  showIndicator = false,
  className = '',
  alt = 'Avatar',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const displayName = name || user?.fullName || user?.username || 'User';
  const photoUrl = src || user?.avatar || user?.profilePhoto;

  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const gradientClass = useMemo(() => {
    const idx = hashString(displayName + (user?.username || '')) % GRADIENTS.length;
    return GRADIENTS[idx];
  }, [displayName, user?.username]);

  const sizeStyles = SIZE_MAP[size] || SIZE_MAP.md;
  const shouldShowIndicator = showIndicator || isOnline !== undefined;

  const hasValidPhoto = Boolean(photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '' && !imgFailed);

  return (
    <div className={`relative inline-block flex-shrink-0 select-none ${className}`}>
      <div
        className={`${sizeStyles.box} rounded-full overflow-hidden flex items-center justify-center shadow-sm border border-slate-200/40 dark:border-slate-700/50 bg-slate-200 dark:bg-slate-800 transition-transform duration-200`}
      >
        {hasValidPhoto ? (
          <img
            src={photoUrl}
            alt={alt || displayName}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center rounded-full block"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full rounded-full bg-gradient-to-tr ${gradientClass} flex items-center justify-center text-white font-medium shadow-inner`}
            title={displayName}
          >
            <span className={sizeStyles.text}>{initials}</span>
          </div>
        )}
      </div>

      {shouldShowIndicator && (
        <span
          className={`absolute ${sizeStyles.dot} rounded-full ring-2 ring-white dark:ring-slate-900 ${
            isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300 dark:bg-slate-500'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
