import { useEffect, useRef, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { db, firebaseEnabled } from '../lib/firebase'
import { useLocalStorage } from './useLocalStorage'

interface WithId {
  id: string
}

/**
 * Firestore rejects any document containing an `undefined` value, which would
 * fail the whole write. Optional fields are simply omitted instead.
 */
function forFirestore<T extends WithId>(item: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(item)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

/**
 * A list of records that lives in Firestore (per signed-in user) when Firebase is
 * configured and a uid is available, and falls back to localStorage otherwise —
 * so the app works standalone with zero setup, and syncs across devices once
 * Firebase credentials are supplied.
 */
export function useSyncedList<T extends WithId>(
  storageKey: string,
  collectionName: string,
  uid: string | null,
  seed: T[],
) {
  const [localItems, setLocalItems] = useLocalStorage<T[]>(storageKey, seed)
  const [remoteItems, setRemoteItems] = useState<T[] | null>(null)
  const [remoteReady, setRemoteReady] = useState(false)
  const seededRef = useRef(false)

  const useRemote = firebaseEnabled && Boolean(uid) && Boolean(db)

  useEffect(() => {
    const database = db
    if (!useRemote || !database || !uid) {
      setRemoteItems(null)
      setRemoteReady(false)
      return
    }
    seededRef.current = false
    const colRef = collection(database, 'users', uid, collectionName)
    const unsub = onSnapshot(colRef, (snap) => {
      if (snap.empty && !seededRef.current && seed.length > 0) {
        seededRef.current = true
        const batch = writeBatch(database)
        seed.forEach((item) => batch.set(doc(colRef, item.id), forFirestore(item)))
        batch.commit().catch((err) => {
          // Surface the failure rather than leaving the collection silently empty.
          console.error(`Failed to seed "${collectionName}" in Firestore:`, err)
          seededRef.current = false
        })
        setRemoteItems(seed)
        setRemoteReady(true)
        return
      }
      setRemoteItems(snap.docs.map((d) => d.data() as T))
      setRemoteReady(true)
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRemote, uid, collectionName])

  const items = useRemote ? remoteItems ?? [] : localItems
  const ready = useRemote ? remoteReady : true

  const set = async (item: T) => {
    if (useRemote && db && uid) {
      await setDoc(doc(db, 'users', uid, collectionName, item.id), forFirestore(item))
    } else {
      setLocalItems((prev) => {
        const exists = prev.some((p) => p.id === item.id)
        return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [...prev, item]
      })
    }
  }

  const setMany = async (newItems: T[]) => {
    if (useRemote && db && uid) {
      const colRef = collection(db, 'users', uid, collectionName)
      const batch = writeBatch(db)
      newItems.forEach((item) => batch.set(doc(colRef, item.id), forFirestore(item)))
      await batch.commit()
    } else {
      setLocalItems((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]))
        newItems.forEach((item) => byId.set(item.id, item))
        return Array.from(byId.values())
      })
    }
  }

  const remove = async (id: string) => {
    if (useRemote && db && uid) {
      await deleteDoc(doc(db, 'users', uid, collectionName, id))
    } else {
      setLocalItems((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const replaceAll = async (newItems: T[]) => {
    if (useRemote && db && uid) {
      const colRef = collection(db, 'users', uid, collectionName)
      const batch = writeBatch(db)
      newItems.forEach((item) => batch.set(doc(colRef, item.id), forFirestore(item)))
      await batch.commit()
    } else {
      setLocalItems(newItems)
    }
  }

  return { items, ready, set, setMany, remove, replaceAll }
}
