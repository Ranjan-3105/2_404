import React, { useState, useRef, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploaded, setImageUploaded] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const fileInputRef = useRef(null);

  const scanStatuses = [
    '> INITIALIZING SCAN PROTOCOL...',
    '> CONNECTING TO BREACH DATABASES...',
    '> QUERYING COMPROMISED DATABASE...',
    '> ANALYZING EMAIL PATTERNS...',
    '> CROSS-REFERENCING DATA CLUSTERS...',
    '> SCANNING DARK WEB ARCHIVES...',
    '> VERIFYING BREACH SIGNATURES...',
    '> FINALIZING THREAT ASSESSMENT...'
  ];

  useEffect(() => {
    if (loading) {
      setScanProgress(0);
      setScanStatus(scanStatuses[0]);
      
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          const statusIndex = Math.floor((newProgress / 100) * scanStatuses.length);
          setScanStatus(scanStatuses[Math.min(statusIndex, scanStatuses.length - 1)]);
          return newProgress;
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploaded(true);
    }
  };

  const checkEmail = async (emailToCheck) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Call your Express backend instead of direct API
      const response = await fetch(`http://localhost:3000/check-breach?email=${encodeURIComponent(emailToCheck)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check email');
      }

      setScanProgress(100);
      
      if (data.count > 0) {
        setScanStatus('> SCAN COMPLETE: THREATS IDENTIFIED');
        setTimeout(() => {
          setResults({
            breached: true,
            email: emailToCheck,
            breaches: data.breaches,
            count: data.count
          });
          setLoading(false);
        }, 500);
      } else {
        setScanStatus('> SCAN COMPLETE: NO THREATS DETECTED');
        setTimeout(() => {
          setResults({
            breached: false,
            email: emailToCheck,
            breaches: []
          });
          setLoading(false);
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Failed to check email. Make sure backend is running on localhost:3000');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkEmail(email);
  };

  return (
    <div className="min-h-screen bg-black font-mono">
      {/* Main content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <h1 className="text-5xl md:text-6xl font-black text-lime-500 tracking-tighter">
              BREACH.SCAN
            </h1>
          </div>
          <p className="text-lime-500 text-lg tracking-widest uppercase font-bold">
            {'>'} Email Compromise Detection System
          </p>
          <p className="text-lime-600 text-sm mt-2">Check if your email has been exposed in known data breaches</p>
        </div>

        {/* Main search card */}
        <div className="w-full max-w-2xl mb-8">
          <form onSubmit={handleSubmit} className="bg-black border border-lime-500 border-opacity-60 rounded-lg p-8">
              
            {/* Email input */}
            <div className="mb-6">
              <label className="block text-lime-500 text-sm font-bold mb-3 uppercase tracking-widest">
                {'>'} TARGET EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email@domain.com"
                  className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300 font-mono caret-lime-500"
                />
                <Search className="absolute right-3 top-3 text-lime-600" size={20} />
              </div>
            </div>

            {/* Image upload section */}
            <div className="mb-6">
              <label className="block text-lime-600 text-sm font-bold mb-3 uppercase tracking-widest">
                {'>'} OR UPLOAD SCREENSHOT
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-lime-600 border-opacity-40 rounded p-6 cursor-pointer transition-all duration-300 bg-black"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Lock className="mx-auto mb-2 text-lime-700" size={24} />
                  <p className="text-lime-600 text-sm">drag & drop or click to upload</p>
                  {imageUploaded && <p className="text-lime-400 text-xs mt-2">✓ image ready for scan</p>}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-950 bg-opacity-50 border border-red-600 border-opacity-70 rounded">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span>!</span> ERROR: {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-lime-500 hover:bg-lime-400 disabled:bg-lime-700 disabled:opacity-50 text-black font-black uppercase tracking-widest rounded transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                  SCANNING...
                </>
              ) : (
                <>
                  <span>▶</span> SCAN EMAIL
                </>
              )}
            </button>

            {/* Scan progress bar */}
            {loading && (
              <div className="mt-8 space-y-3">
                {/* Status text */}
                <div className="p-4 bg-black border border-lime-500 border-opacity-40 rounded">
                  <p className="text-lime-500 text-sm min-h-6">
                    {scanStatus}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lime-500 text-xs uppercase tracking-widest">PROGRESS</span>
                    <span className="text-lime-600 text-xs">{Math.floor(scanProgress)}%</span>
                  </div>
                  <div className="w-full h-8 bg-black border border-lime-500 border-opacity-40 rounded overflow-hidden">
                    {/* Animated progress bar */}
                    <div
                      className="h-full bg-lime-500 transition-all duration-200"
                      style={{width: `${scanProgress}%`}}
                    />
                  </div>
                </div>

                {/* Scanning indicators */}
                <div className="flex gap-2 justify-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-6 bg-lime-600 rounded-full animate-pulse"
                      style={{animationDelay: `${i * 0.15}s`}}
                    />
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results section */}
        {results && (
          <div className="w-full max-w-2xl">
            <div className={`relative border rounded-lg overflow-hidden ${
              results.breached 
                ? 'border-red-600 border-opacity-60 bg-black'
                : 'border-lime-500 border-opacity-60 bg-black'
            }`}>
              
              {/* Header */}
              <div className={`p-6 border-b ${
                results.breached 
                  ? 'border-red-600 border-opacity-40'
                  : 'border-lime-500 border-opacity-40'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {results.breached ? (
                    <AlertTriangle className="text-red-500" size={28} />
                  ) : (
                    <CheckCircle className="text-lime-500" size={28} />
                  )}
                  <h2 className={`text-2xl font-black uppercase tracking-widest ${
                    results.breached ? 'text-red-500' : 'text-lime-500'
                  }`}>
                    {results.breached ? '> COMPROMISED' : '> SECURE'}
                  </h2>
                </div>
                <p className="text-lime-400 text-sm break-all">
                  {results.email}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {results.breached ? (
                  <div>
                    <div className="mb-6 p-4 bg-red-950 bg-opacity-50 border border-red-600 border-opacity-50 rounded">
                      <p className="text-red-400 font-bold mb-2">
                        ⚠️ FOUND IN {results.count} BREACH{results.count !== 1 ? 'ES' : ''}
                      </p>
                      <p className="text-red-300 text-sm">
                        This email address appears in publicly disclosed data breaches. Immediate action recommended.
                      </p>
                    </div>

                    {/* Breach list */}
                    <div className="space-y-4">
                      <h3 className="text-lime-500 font-bold text-sm uppercase tracking-widest mb-4">{'>'} Exposed In:</h3>
                      {results.breaches.map((breach, idx) => (
                        <div key={idx} className="p-4 bg-black border border-red-600 border-opacity-40 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-red-500 font-bold text-lg">{breach.Name}</h4>
                              <p className="text-lime-700 text-xs uppercase tracking-widest mt-1">
                                Domain: {breach.Domain}
                              </p>
                              <p className="text-lime-700 text-xs uppercase tracking-widest">
                                {new Date(breach.BreachDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-red-900 bg-opacity-60 border border-red-600 border-opacity-60 rounded text-red-400 text-xs font-bold">
                              {breach.DataClasses?.length || 0} TYPES
                            </span>
                          </div>
                          
                          {breach.DataClasses && breach.DataClasses.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-600 border-opacity-30">
                              <p className="text-lime-700 text-xs font-bold mb-2 uppercase">Data Exposed:</p>
                              <div className="flex flex-wrap gap-2">
                                {breach.DataClasses.map((dc, i) => (
                                  <span key={i} className="px-2 py-1 bg-red-950 bg-opacity-70 border border-red-600 border-opacity-40 rounded text-red-400 text-xs">
                                    {dc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {breach.Title && (
                            <p className="text-lime-700 text-xs mt-3 italic">{breach.Title}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div className="mt-6 p-4 bg-yellow-950 bg-opacity-40 border border-yellow-700 border-opacity-50 rounded-lg">
                      <h4 className="text-yellow-500 font-bold mb-2 uppercase text-sm">⚡ Recommended Actions:</h4>
                      <ul className="text-yellow-400 text-sm space-y-1 list-disc list-inside">
                        <li>change password immediately</li>
                        <li>enable two-factor authentication</li>
                        <li>monitor account for suspicious activity</li>
                        <li>use password manager for unique passwords</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="text-lime-500" size={48} />
                    </div>
                    <h3 className="text-lime-500 font-bold text-center text-lg mb-3">
                      {'>'} NO BREACHES DETECTED
                    </h3>
                    <p className="text-lime-400 text-center text-sm">
                      This email address was not found in any known public data breaches. Continue to monitor for threats and maintain strong security practices.
                    </p>
                    <p className="text-lime-700 text-center text-xs mt-4">
                      Last checked: {new Date().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reset button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setResults(null);
                  setEmail('');
                  setError('');
                }}
                className="text-lime-600 hover:text-lime-400 text-sm uppercase tracking-widest font-bold transition-colors duration-300"
              >
                {'← '} RUN ANOTHER SCAN
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center text-lime-700 text-xs uppercase tracking-widest max-w-2xl">
          <p>{'> '} data sourced from have i been pwned api</p>
          <p className="mt-2 text-lime-800">educational and security awareness purposes only</p>
        </div>
      </div>
    </div>
  );
}