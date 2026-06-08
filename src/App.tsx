function App() {
  return (
    <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'system-ui' }}>
      <h1>dotMage</h1>
      <p>Admin panel — coming soon.</p>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Device token" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%', padding: 8 }}>Login</button>
      </form>
    </div>
  );
}

export default App;
