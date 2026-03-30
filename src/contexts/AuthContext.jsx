import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { ensureUserProfile, getUserProfile, updateUserProfile } from "../services/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      startTransition(() => {
        setUser(currentUser);
        setLoading(true);
      });

      (async () => {
        try {
          if (!currentUser) {
            startTransition(() => {
              setProfile(null);
              setLoading(false);
            });
            return;
          }

          await ensureUserProfile(currentUser);
          const nextProfile = await getUserProfile(currentUser);

          startTransition(() => {
            setProfile(nextProfile);
            setLoading(false);
          });
        } catch (error) {
          console.error("Failed to load profile", error);
          startTransition(() => {
            setProfile(null);
            setLoading(false);
          });
        }
      })();
    });

    return unsubscribe;
  }, []);

  async function refreshProfile() {
    if (!auth.currentUser) return null;
    const nextProfile = await getUserProfile(auth.currentUser);
    setProfile(nextProfile);
    return nextProfile;
  }

  async function saveProfile(patch) {
    if (!auth.currentUser) return;
    await updateUserProfile(auth.currentUser.uid, patch);
    await refreshProfile();
  }

  async function signOutUser() {
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
