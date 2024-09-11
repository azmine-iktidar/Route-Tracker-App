import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabaseClient";
import * as crypto from "expo-crypto";
import { useUserStore } from "../contexts/userStore";

export type User = {
  id: string;
  email: string;
  username: string;
  isAuthenticated: boolean;
  avatarUrl: string;
  groupId: string;
  token: string;
};

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const setUserInStore = useUserStore((state) => state.setUser);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setIsLoading(true);
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setUser(user);
        setUserInStore(user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserInStore(null);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setIsLoggedIn(false);
      setUserInStore(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const hashedPassword = await crypto.digestStringAsync(
        crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .eq("password", hashedPassword)
        .single();

      if (error) throw error;

      if (data) {
        const user: User = {
          id: data.id,
          email: data.email,
          username: data.username,
          isAuthenticated: data.isauthenticated,
          avatarUrl: data.avatarurl,
          groupId: data.groupid,
          token: data.token,
        };

        await AsyncStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        setUserInStore(user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      setUserInStore(null);
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoggedIn, isLoading, user, login, logout };
}
