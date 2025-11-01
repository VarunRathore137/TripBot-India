import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'User avatar', fallback }) => {
  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar;