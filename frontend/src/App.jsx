import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRoast(event) {
    event.preventDefault();

    if (!username.trim()) {
      setError("Enter a GitHub username first.");
      return;
    }

    setLoading(true);
    setError("");
    setRoast("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/roast/${encodeURIComponent(username.trim())}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      setRoast(data.roast);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>GitShamed.</h2>
        <span>GitHub Profile Roaster</span>
      </nav>

      <main className="hero">
        <p className="tagline">YOUR CODE. OUR JUDGMENT.</p>

        <h1>
          Your GitHub deserves
          <br />
          <span>some honesty.</span>
        </h1>

        <p className="subtitle">
          Drop your GitHub username. Let AI inspect your repositories
          and roast your developer personality.
        </p>

        <form onSubmit={handleRoast} className="search-form">
          <input
            type="text"
            placeholder="Enter GitHub username..."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Roasting..." : "Roast Me"}
          </button>
        </form>

        {loading && (
          <p className="loading">
            Analyzing your questionable coding decisions...
          </p>
        )}

        {error && <p className="error">{error}</p>}

        {roast && (
          <section className="roast-card">
            <h2>Your GitHub Roast</h2>
            <p>{roast}</p>
          </section>
        )}
      </main>

      <footer>
        Built for developers who can handle the truth.
      </footer>
    </div>
  );
}

export default App;