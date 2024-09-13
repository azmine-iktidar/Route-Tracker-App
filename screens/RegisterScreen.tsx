import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { supabase } from "../supabaseClient";
import * as crypto from "expo-crypto";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);
  const signUp = async (): Promise<void> => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsPasswordMatch(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsPasswordMatch(false);
      return;
    }
    if (!email || !password || !username || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const hashedPassword = await crypto.digestStringAsync(
        crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUser) {
        Alert.alert("Error", "An account with this email already exists");
        return;
      }

      const { error: insertError } = await supabase
        .from("users")
        .insert({
          username,
          email,
          password: hashedPassword,
          id: crypto.randomUUID(),
          isauthenticated: false,
          avatarurl: "#", // Add proper image URL or avatar later
          token: crypto.randomUUID(),
        })
        .single();

      if (insertError) throw insertError;

      Alert.alert("Success", "Registration successful! You can now log in.");
      navigation.navigate("Login");
    } catch (error) {
      const errorObj = error as Error;
      setError(errorObj.message || "An unexpected error occurred.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>Create an Account</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          placeholder="Display Name"
          autoCapitalize="none"
          autoComplete="name"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholderTextColor="#aaa"
        />
        <View
          style={{
            position: "relative",
          }}
        >
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={showPassword ? false : true}
            placeholder="Password"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={{ position: "absolute", right: "3%", top: "20%" }}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <MaterialCommunityIcons
                name="eye-outline"
                size={24}
                color="#aaa"
              />
            ) : (
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={24}
                color="#aaa"
              />
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            position: "relative",
          }}
        >
          <TextInput
            style={styles.input}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTextEntry={showConfirmPassword ? false : true}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={{ position: "absolute", right: "3%", top: "20%" }}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <MaterialCommunityIcons
                name="eye-outline"
                size={24}
                color="#aaa"
              />
            ) : (
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={24}
                color="#aaa"
              />
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={signUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.signInText}>
          Already Registered?{" "}
          <Text
            style={styles.signInLink}
            onPress={() => navigation.navigate("Login")}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  error: {
    color: "#d9534f",
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    height: 50,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signInText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
  signInLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
