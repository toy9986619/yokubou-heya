const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

const { getDayKey } = require('./lib/dayKey');

initializeApp();
const db = getFirestore();

/**
 * Fires when any wants/{uid} doc is written.
 * Computes whether all room members are currently "wanting today" and
 * upserts (or deletes) the matches/{today} doc accordingly.
 *
 * This is the only place matches are created — clients cannot.
 * Double-blind is preserved because clients never read other users' wants.
 */
exports.onWantWrite = onDocumentWritten(
  'rooms/{roomId}/wants/{uid}',
  async (event) => {
    const { roomId } = event.params;
    const roomRef = db.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists) return;

    const room = roomSnap.data();
    const memberUids = room.memberUids || [];
    if (memberUids.length < 2) return;

    const today = getDayKey();

    const wantsSnaps = await Promise.all(
      memberUids.map((uid) => roomRef.collection('wants').doc(uid).get()),
    );

    const allWantingToday = wantsSnaps.every((snap) => {
      if (!snap.exists) return false;
      const data = snap.data();
      if (!data.wanting) return false;
      if (!data.updatedAt || !data.updatedAt.toDate) return false;
      return getDayKey(data.updatedAt.toDate()) === today;
    });

    const matchRef = roomRef.collection('matches').doc(today);

    if (allWantingToday) {
      await matchRef.set(
        {
          matchedAt: FieldValue.serverTimestamp(),
          participants: memberUids,
        },
        { merge: true },
      );
      return;
    }

    const existing = await matchRef.get();
    if (existing.exists) {
      await matchRef.delete();
    }
  },
);
