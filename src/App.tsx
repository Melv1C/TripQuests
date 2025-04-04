import React from 'react';
import './styles/App.css';
import FirebaseStatus from './components/FirebaseStatus';

function App() {
  return (
    <div className="app-container">
      <h1>Trip Quest App</h1>
      <p>Welcome to Trip Quest - Your gamified travel companion!</p>
      
      {/* Only show Firebase status in development */}
      {import.meta.env.DEV && (
        <div className="dev-tools">
          <FirebaseStatus />
        </div>
      )}
    </div>
  );
}

export default App;
