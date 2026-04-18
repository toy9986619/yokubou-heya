'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { getFirebaseDb } from '@/firebase';
import { getDayKey } from '@/lib/dayKey';

export const useMatches = (roomId) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setMatches([]);
      setLoading(false);
      return undefined;
    }
    const db = getFirebaseDb();
    const q = query(
      collection(db, 'rooms', roomId, 'matches'),
      orderBy('matchedAt', 'desc'),
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ dayKey: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsubscribe;
  }, [roomId]);

  const today = getDayKey();
  const matchedToday = matches.some((m) => m.dayKey === today);

  return { matches, matchedToday, loading };
};
