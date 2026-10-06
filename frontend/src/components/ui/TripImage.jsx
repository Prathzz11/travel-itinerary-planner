import { useState } from 'react';

export default function TripImage({ src, alt, ...props }) {
  const [failed, setFailed] = useState('');
  return <img {...props} src={!src || failed === src ? '/navigation.png' : src} alt={alt} onError={() => setFailed(src)} />;
}
