import { createContext, startTransition, useCallback, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { ensureUserProfile, getUserProfile, updateUserProfile } from "../services/firestore";
import { deleteAccountData } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const isFirstLoad = !initializedRef.current;

      startTransition(() => {
        setUser(currentUser);
        if (isFirstLoad) {
          setLoading(true);
        }
      });

      (async () => {
        try {
          if (!currentUser) {
            startTransition(() => {
              setProfile(null);
              setLoading(false);
            });
            initializedRef.current = true;
            return;
          }

          await ensureUserProfile(currentUser);
          const nextProfile = await getUserProfile(currentUser);

          startTransition(() => {
            setProfile(nextProfile);
            setLoading(false);
          });
          initializedRef.current = true;
        } catch (error) {
          console.error("Failed to load profile", error);
          startTransition(() => {
            if (!initializedRef.current) {
              setProfile(null);
            }
            setLoading(false);
          });
          initializedRef.current = true;
        }
      })();
    });

    return unsubscribe;
  }, []);

  // Stable identities: pages use these in effect dependencies, so a new function per
  // render would re-run those effects in a loop (e.g. the billing status refresh).
  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    const nextProfile = await getUserProfile(auth.currentUser);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const saveProfile = useCallback(async (patch) => {
    if (!auth.currentUser) return;
    await updateUserProfile(auth.currentUser.uid, patch);
    await refreshProfile();
  }, [refreshProfile]);

  async function signOutUser() {
    await signOut(auth);
  }

  async function deleteAccount() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not signed in.");
    // The server cancels billing and removes all data, files, and the login itself.
    await deleteAccountData(currentUser);
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        saveProfile,
        signOutUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
