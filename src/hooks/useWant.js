'use client';

import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import { getFirebaseDb } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getDayKey } from '@/lib/dayKey';

/**
 * Tracks the current user's own "wanting" state for a room.
 * Only reads and writes wants/{currentUserUid} — never another user's doc.
 * "Today wanting" means: wanting === true AND updatedAt's dayKey is today's dayKey.
 */
export const useWant = (roomId) => {
  const { user } = useAuth();
  const [rawState, setRawState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !user) {
      setRawState(null);
      setLoading(false);
      return undefined;
    }
    const db = getFirebaseDb();
    const ref = doc(db, 'rooms', roomId, 'wants', user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setRawState(
        snap.exists()
          ? snap.data({ serverTimestamps: 'estimate' })
          : { wanting: false, updatedAt: null },
      );
      setLoading(false);
    });
    return unsubscribe;
  }, [roomId, user]);

  const today = getDayKey();
  const updatedAtDayKey = rawState?.updatedAt?.toDate
    ? getDayKey(rawState.updatedAt.toDate())
    : null;
  const isWantingToday = !!rawState?.wanting && updatedAtDayKey === today;

  const setWanting = useCallback(
    async (wanting) => {
      if (!roomId || !user) return;
      const db = getFirebaseDb();
      const ref = doc(db, 'rooms', roomId, 'wants', user.uid);
      await setDoc(ref, { wanting, updatedAt: serverTimestamp() }, { merge: true });
    },
    [roomId, user],
  );

  const toggle = useCallback(() => setWanting(!isWantingToday), [setWanting, isWantingToday]);

  return { isWantingToday, loading, toggle, setWanting };
};
