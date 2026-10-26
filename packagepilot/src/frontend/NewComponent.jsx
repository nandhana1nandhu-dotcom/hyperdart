import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";

function NewComponent(props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    props?.messageHandlers?.componentLoaded?.();
  }, []);

  async function getPackage(name) {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`
    );

    if (!response.ok) {
      throw new Error(`Package "${name}" was not found.`);
    }

    const data = await response.json();

    return {
      name: data.name,
      version: data.version,
      description: data.description || "No description available.",
      license: data.license || "Not specified",
      homepage: data.homepage || "",
    };
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const input = query.trim();
      let packages = [];

      if (/^alternatives to /i.test(input)) {
        const keyword = input.replace(/^alternatives to /i, "").trim();

        const response = await fetch(
          `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(keyword)}&size=6`
        );

        if (!response.ok) {
          throw new Error("Could not find alternatives.");
        }

        const data = await response.json();

        packages = data.objects.map((item) => ({
          name: item.package.name,
          version: item.package.version || "Unknown",
          description:
            item.package.description || "No description available.",
          license: item.package.license || "Not specified",
          homepage: item.package.links?.homepage || "",
        }));
      } else if (/^compare /i.test(input)) {
        const names = input
          .replace(/^compare /i, "")
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);

        if (names.length < 2) {
          throw new Error("Enter two packages, e.g. compare react, vue");
        }

        packages = await Promise.all(names.map(getPackage));
      } else {
        const name = input
          .replace(/^(npm package|package details)\s+/i, "")
          .trim();

        packages = [await getPackage(name)];
      }

      setResults(packages);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "20px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <Typography variant="h4" style={{ fontWeight: "bold" }}>
        📦 PackagePilot
      </Typography>

      <p>Discover, explore, and compare npm packages.</p>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "10px", marginTop: "20px" }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try react, compare react, vue, or alternatives to moment"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "13px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#3157d5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {loading ? "Searching..." : "Explore"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", marginTop: "16px" }}>{error}</p>
      )}

      {results.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          {results.map((pkg) => (
            <div
              key={pkg.name}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "18px",
                overflowWrap: "anywhere",
              }}
            >
              <h3>{pkg.name}</h3>
              <p>{pkg.description}</p>
              <p><strong>Version:</strong> {pkg.version}</p>
              <p><strong>License:</strong> {pkg.license}</p>

              {pkg.homepage && (
                <a
                  href={pkg.homepage}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official Website ↗
                </a>
              )}

              <p>
                <a
                  href={`https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on npm ↗
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewComponent;