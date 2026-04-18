'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

import { getFirebaseDb } from '@/firebase';

export const useRoom = (roomId) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      return undefined;
    }
    const db = getFirebaseDb();
    const unsubscribe = onSnapshot(
      doc(db, 'rooms', roomId),
      (snap) => {
        setRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [roomId]);

  return { room, loading, error };
};
