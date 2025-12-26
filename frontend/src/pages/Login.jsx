import { useState } from "react";
import axios from "axios";

export default function Login({ setUser }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    userPin: "",
  });

  const [error, setError] = useState("");

  const submitHandler = async () => {
    try {
      const res = await axios.post(
        "http://172.20.10.10:5000/api/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      setUser(res.data.name);
    } catch (err) {
      setError("Invalid login details");
    }
  };

  return (
    <div style={styles.container}>
      <h2>VaidyaCure Admin Login</h2>

      <input
        style={styles.input}
        placeholder="Email Address"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="User Pin"
        onChange={(e) =>
          setForm({ ...form, userPin: e.target.value })
        }
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button style={styles.button} onClick={submitHandler}>
        Login
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: "300px",
    margin: "100px auto",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
