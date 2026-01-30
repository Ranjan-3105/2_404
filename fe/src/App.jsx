// import React, { useState, useRef, useEffect } from 'react';
// import { Search, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

// export default function App() {
//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState('');
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [imageUploaded, setImageUploaded] = useState(false);
//   const [scanProgress, setScanProgress] = useState(0);
//   const [scanStatus, setScanStatus] = useState('');
//   const fileInputRef = useRef(null);

//   const scanStatuses = [
//     '> INITIALIZING OSINT PROTOCOL...',
//     '> CONNECTING TO DATA REPOSITORIES...',
//     '> SCANNING EMAIL DATABASES...',
//     '> CHECKING USERNAME ACROSS PLATFORMS...',
//     '> ANALYZING BREACH PATTERNS...',
//     '> CROSS-REFERENCING SOCIAL PROFILES...',
//     '> VERIFYING COMPROMISED DATA...',
//     '> COMPILING THREAT ASSESSMENT...'
//   ];

//   useEffect(() => {
//     if (loading) {
//       setScanProgress(0);
//       setScanStatus(scanStatuses[0]);
      
//       const interval = setInterval(() => {
//         setScanProgress(prev => {
//           const newProgress = prev + Math.random() * 12;
//           if (newProgress >= 90) {
//             clearInterval(interval);
//             return 90;
//           }
//           const statusIndex = Math.floor((newProgress / 100) * scanStatuses.length);
//           setScanStatus(scanStatuses[Math.min(statusIndex, scanStatuses.length - 1)]);
//           return newProgress;
//         });
//       }, 500);

//       return () => clearInterval(interval);
//     }
//   }, [loading]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageUploaded(true);
//     }
//   };

//   const checkOSINT = async (emailToCheck, usernameToCheck) => {
//     if (!emailToCheck && !usernameToCheck) {
//       setError('Please enter either an email or username');
//       return;
//     }

//     if (emailToCheck && !emailToCheck.includes('@')) {
//       setError('Please enter a valid email address');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setResults(null);

//     try {
//       const response = await fetch('http://localhost:8000/osint/scan', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: emailToCheck || null,
//           username: usernameToCheck || null
//         })
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.detail || data.error || 'Failed to perform OSINT scan');
//       }

//       setScanProgress(100);
//       setScanStatus('> SCAN COMPLETE: ANALYSIS FINISHED');
      
//       setTimeout(() => {
//         setResults({
//           email: emailToCheck || null,
//           username: usernameToCheck || null,
//           breach_data: data.breach_data || {},
//           maigret_results: data.maigret_results || {},
//           holehe_results: data.holehe_results || {},
//           summary: data.summary || {}
//         });
//         setLoading(false);
//       }, 500);
//     } catch (err) {
//       setError(err.message || 'Failed to perform OSINT scan. Make sure backend is running on localhost:8000');
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     checkOSINT(email, username);
//   };

//   return (
//     <div className="min-h-screen bg-black font-mono">
//       {/* Main content */}
//       <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
//         {/* Header */}
//         <div className="mb-12 text-center">
//           <div className="mb-4">
//             <h1 className="text-5xl md:text-6xl font-black text-lime-500 tracking-tighter">
//               OSINT.SCAN
//             </h1>
//           </div>
//           <p className="text-lime-500 text-lg tracking-widest uppercase font-bold">
//             {'>'} Advanced OSINT Intelligence System
//           </p>
//           <p className="text-lime-600 text-sm mt-2">Email & Username Reconnaissance with Maigret & Holehe</p>
//         </div>

//         {/* Main search card */}
//         <div className="w-full max-w-2xl mb-8">
//           <form onSubmit={handleSubmit} className="bg-black border border-lime-500 border-opacity-60 rounded-lg p-8">
              
//             {/* Email input */}
//             <div className="mb-6">
//               <label className="block text-lime-500 text-sm font-bold mb-3 uppercase tracking-widest">
//                 {'>'} TARGET EMAIL ADDRESS (OPTIONAL)
//               </label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="enter email@domain.com"
//                   className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300 font-mono caret-lime-500"
//                 />
//                 <Search className="absolute right-3 top-3 text-lime-600" size={20} />
//               </div>
//             </div>

//             {/* Username input */}
//             <div className="mb-6">
//               <label className="block text-lime-500 text-sm font-bold mb-3 uppercase tracking-widest">
//                 {'>'} TARGET USERNAME (OPTIONAL)
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   placeholder="enter username"
//                   className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300 font-mono caret-lime-500"
//                 />
//                 <Search className="absolute right-3 top-3 text-lime-600" size={20} />
//               </div>
//             </div>

//             {/* Image upload section */}
//             <div className="mb-6">
//               <label className="block text-lime-600 text-sm font-bold mb-3 uppercase tracking-widest">
//                 {'>'} OR UPLOAD SCREENSHOT
//               </label>
//               <div 
//                 onClick={() => fileInputRef.current?.click()}
//                 className="border-2 border-dashed border-lime-600 border-opacity-40 rounded p-6 cursor-pointer transition-all duration-300 bg-black"
//               >
//                 <input 
//                   ref={fileInputRef}
//                   type="file" 
//                   accept="image/*" 
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//                 <div className="text-center">
//                   <Lock className="mx-auto mb-2 text-lime-700" size={24} />
//                   <p className="text-lime-600 text-sm">drag & drop or click to upload</p>
//                   {imageUploaded && <p className="text-lime-400 text-xs mt-2">✓ image ready for scan</p>}
//                 </div>
//               </div>
//             </div>

//             {/* Error message */}
//             {error && (
//               <div className="mb-6 p-4 bg-red-950 bg-opacity-50 border border-red-600 border-opacity-70 rounded">
//                 <p className="text-red-400 text-sm flex items-center gap-2">
//                   <span>!</span> ERROR: {error}
//                 </p>
//               </div>
//             )}

//             {/* Submit button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-lime-500 hover:bg-lime-400 disabled:bg-lime-700 disabled:opacity-50 text-black font-black uppercase tracking-widest rounded transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
//                   SCANNING...
//                 </>
//               ) : (
//                 <>
//                   <span>▶</span> START OSINT SCAN
//                 </>
//               )}
//             </button>

//             {/* Scan progress bar */}
//             {loading && (
//               <div className="mt-8 space-y-3">
//                 {/* Status text */}
//                 <div className="p-4 bg-black border border-lime-500 border-opacity-40 rounded">
//                   <p className="text-lime-500 text-sm min-h-6">
//                     {scanStatus}
//                   </p>
//                 </div>

//                 {/* Progress bar */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-lime-500 text-xs uppercase tracking-widest">PROGRESS</span>
//                     <span className="text-lime-600 text-xs">{Math.floor(scanProgress)}%</span>
//                   </div>
//                   <div className="w-full h-8 bg-black border border-lime-500 border-opacity-40 rounded overflow-hidden">
//                     {/* Animated progress bar */}
//                     <div
//                       className="h-full bg-lime-500 transition-all duration-200"
//                       style={{width: `${scanProgress}%`}}
//                     />
//                   </div>
//                 </div>

//                 {/* Scanning indicators */}
//                 <div className="flex gap-2 justify-center mt-4">
//                   {[...Array(5)].map((_, i) => (
//                     <div
//                       key={i}
//                       className="w-2 h-6 bg-lime-600 rounded-full animate-pulse"
//                       style={{animationDelay: `${i * 0.15}s`}}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </form>
//         </div>

//         {/* Results section */}
//         {results && (
//           <div className="w-full max-w-4xl">
//             <div className="relative border border-lime-500 border-opacity-60 rounded-lg overflow-hidden bg-black">
              
//               {/* Header */}
//               <div className="p-6 border-b border-lime-500 border-opacity-40">
//                 <div className="flex items-center gap-3 mb-2">
//                   <CheckCircle className="text-lime-500" size={28} />
//                   <h2 className="text-2xl font-black uppercase tracking-widest text-lime-500">
//                     {'>'} OSINT SCAN COMPLETE
//                   </h2>
//                 </div>
//                 <p className="text-lime-400 text-sm break-all">
//                   {results.email || results.username}
//                 </p>
//               </div>

//               {/* Content */}
//               <div className="p-6 space-y-6">
                
//                 {/* Summary section */}
//                 {results.summary && Object.keys(results.summary).length > 0 && (
//                   <div>
//                     <h3 className="text-lime-500 font-bold text-lg uppercase tracking-widest mb-4">{'>'} Summary</h3>
//                     <div className="bg-black border border-lime-500 border-opacity-40 rounded-lg p-4 space-y-2">
//                       {Object.entries(results.summary).map(([key, value]) => (
//                         <div key={key} className="flex justify-between items-center text-sm">
//                           <span className="text-lime-600">{key}:</span>
//                           <span className="text-lime-400">{String(value)}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Breach Data */}
//                 {results.breach_data && Object.keys(results.breach_data).length > 0 && (
//                   <div>
//                     <h3 className="text-red-500 font-bold text-lg uppercase tracking-widest mb-4">{'>'} Breach Data (HIBP)</h3>
//                     <div className="space-y-3">
//                       {Object.entries(results.breach_data).map(([source, data]) => (
//                         <div key={source} className="bg-black border border-red-600 border-opacity-40 rounded-lg p-4">
//                           <h4 className="text-red-500 font-bold text-sm uppercase mb-2">{source}</h4>
//                           <p className="text-red-300 text-xs">{JSON.stringify(data)}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Maigret Results */}
//                 {results.maigret_results && Object.keys(results.maigret_results).length > 0 && (
//                   <div>
//                     <h3 className="text-cyan-500 font-bold text-lg uppercase tracking-widest mb-4">{'>'} Maigret Results (Username Search)</h3>
//                     <div className="space-y-3">
//                       {Object.entries(results.maigret_results).map(([site, data]) => (
//                         <div key={site} className="bg-black border border-cyan-600 border-opacity-40 rounded-lg p-4">
//                           <div className="flex items-start justify-between mb-2">
//                             <h4 className="text-cyan-500 font-bold text-sm uppercase">{site}</h4>
//                             <span className={`text-xs font-bold px-2 py-1 rounded ${
//                               data.found ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
//                             }`}>
//                               {data.found ? 'FOUND' : 'NOT FOUND'}
//                             </span>
//                           </div>
//                           {data.url && (
//                             <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs hover:text-cyan-300 break-all">
//                               {data.url}
//                             </a>
//                           )}
//                           {data.errors && (
//                             <p className="text-red-300 text-xs mt-2">Error: {data.errors}</p>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Holehe Results */}
//                 {results.holehe_results && Object.keys(results.holehe_results).length > 0 && (
//                   <div>
//                     <h3 className="text-yellow-500 font-bold text-lg uppercase tracking-widest mb-4">{'>'} Holehe Results (Email Search)</h3>
//                     <div className="space-y-3">
//                       {Object.entries(results.holehe_results).map(([platform, found]) => (
//                         <div key={platform} className="bg-black border border-yellow-600 border-opacity-40 rounded-lg p-4 flex items-center justify-between">
//                           <span className="text-yellow-500 font-bold text-sm uppercase">{platform}</span>
//                           <span className={`text-sm font-bold px-3 py-1 rounded ${
//                             found ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
//                           }`}>
//                             {found ? '⚠️ REGISTERED' : '✓ NOT REGISTERED'}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* No results message */}
//                 {(!results.breach_data || Object.keys(results.breach_data).length === 0) &&
//                  (!results.maigret_results || Object.keys(results.maigret_results).length === 0) &&
//                  (!results.holehe_results || Object.keys(results.holehe_results).length === 0) && (
//                   <div className="py-4 text-center">
//                     <p className="text-lime-400 text-sm">No significant OSINT findings detected.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Reset button */}
//             <div className="mt-6 text-center">
//               <button
//                 onClick={() => {
//                   setResults(null);
//                   setEmail('');
//                   setUsername('');
//                   setError('');
//                 }}
//                 className="text-lime-600 hover:text-lime-400 text-sm uppercase tracking-widest font-bold transition-colors duration-300"
//               >
//                 {'← '} RUN ANOTHER SCAN
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Footer info */}
//         <div className="mt-12 text-center text-lime-700 text-xs uppercase tracking-widest max-w-2xl">
//           <p>{'> '} powered by maigret, holehe & have i been pwned</p>
//           <p className="mt-2 text-lime-800">educational and osint research purposes only</p>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useRef, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Lock, ShieldAlert, ShieldCheck, Globe } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploaded, setImageUploaded] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const fileInputRef = useRef(null);

  const scanStatuses = [
    '> INITIALIZING OSINT PROTOCOL...',
    '> CONNECTING TO DATA REPOSITORIES...',
    '> SCANNING XPOSEDORNOT DATABASE...',
    '> CHECKING USERNAME ACROSS PLATFORMS...',
    '> ANALYZING BREACH PATTERNS...',
    '> CROSS-REFERENCING SOCIAL PROFILES...',
    '> VERIFYING COMPROMISED DATA...',
    '> COMPILING THREAT ASSESSMENT...'
  ];

  useEffect(() => {
    if (loading) {
      setScanProgress(0);
      setScanStatus(scanStatuses[0]);
      
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + Math.random() * 8; // Slower progress to account for backend delays
          if (newProgress >= 95) {
            clearInterval(interval);
            return 95;
          }
          const statusIndex = Math.floor((newProgress / 100) * scanStatuses.length);
          setScanStatus(scanStatuses[Math.min(statusIndex, scanStatuses.length - 1)]);
          return newProgress;
        });
      }, 600);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploaded(true);
    }
  };

  const checkOSINT = async (emailToCheck, usernameToCheck) => {
    if (!emailToCheck && !usernameToCheck) {
      setError('Please enter either an email or username');
      return;
    }

    if (emailToCheck && !emailToCheck.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/osint/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToCheck || null,
          username: usernameToCheck || null
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to perform OSINT scan');
      }

      setScanProgress(100);
      setScanStatus('> SCAN COMPLETE: ANALYSIS FINISHED');
      
      setTimeout(() => {
        setResults({
          email: emailToCheck || null,
          username: usernameToCheck || null,
          // Fallback empty objects/arrays to prevent map() errors
          breach_data: data.breach_data || { status: 'error' },
          maigret_results: data.maigret_results || {},
          holehe_results: data.holehe_results || {},
          summary: data.summary || {}
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message || 'Connection lost. Check if backend is running.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkOSINT(email, username);
  };

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <h1 className="text-5xl md:text-6xl font-black text-lime-500 tracking-tighter">
              OSINT.SCAN
            </h1>
          </div>
          <p className="text-lime-500 text-lg tracking-widest uppercase font-bold">
            {'>'} Advanced OSINT Intelligence System
          </p>
          <p className="text-lime-600 text-sm mt-2">Powered by Maigret, Holehe & XposedOrNot</p>
        </div>

        {/* Search form */}
        {!results && !loading && (
          <div className="w-full max-w-2xl mb-8">
            <form onSubmit={handleSubmit} className="bg-black border border-lime-500 border-opacity-60 rounded-lg p-8 shadow-[0_0_15px_rgba(101,163,13,0.2)]">
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
                    className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300"
                  />
                  <Search className="absolute right-3 top-3 text-lime-600" size={20} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-lime-500 text-sm font-bold mb-3 uppercase tracking-widest">
                  {'>'} TARGET USERNAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="enter username"
                    className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300"
                  />
                  <Search className="absolute right-3 top-3 text-lime-600" size={20} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-lime-600 text-sm font-bold mb-3 uppercase tracking-widest">
                  {'>'} OR UPLOAD SCREENSHOT
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-lime-600 border-opacity-40 rounded p-6 cursor-pointer transition-all duration-300 hover:border-opacity-100 bg-black"
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="text-center">
                    <Lock className="mx-auto mb-2 text-lime-700" size={24} />
                    <p className="text-lime-600 text-sm">drag & drop or click to upload</p>
                    {imageUploaded && <p className="text-lime-400 text-xs mt-2 font-bold animate-pulse">✓ FILE ATTACHED</p>}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-950 bg-opacity-50 border border-red-600 border-opacity-70 rounded">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} /> ERROR: {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-black uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>▶</span> START RECON SCAN
              </button>
            </form>
          </div>
        )}

        {/* Loading UI */}
        {loading && (
          <div className="w-full max-w-2xl bg-black border border-lime-500 p-8 rounded-lg">
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900 border border-lime-900 rounded">
                <p className="text-lime-500 text-sm font-bold animate-pulse">{scanStatus}</p>
              </div>
              <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-lime-900">
                <div className="h-full bg-lime-500 transition-all duration-300" style={{width: `${scanProgress}%`}} />
              </div>
              <p className="text-center text-lime-600 text-xs tracking-widest uppercase">Encryption Check in Progress...</p>
            </div>
          </div>
        )}

        {/* Results section */}
        {results && (
          <div className="w-full max-w-4xl animate-in fade-in duration-700">
            <div className="border border-lime-500 border-opacity-60 rounded-lg overflow-hidden bg-black shadow-[0_0_30px_rgba(101,163,13,0.15)]">
              
              <div className="p-6 border-b border-lime-500 border-opacity-40 bg-zinc-900 bg-opacity-30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-lime-500" size={28} />
                    <h2 className="text-2xl font-black uppercase tracking-widest text-lime-500">
                      SCAN COMPLETE
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-lime-700 text-[10px] block uppercase">Target ID:</span>
                    <span className="text-lime-400 text-sm break-all">{results.email || results.username}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                
                {/* 1. Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-lime-900 rounded bg-zinc-900 bg-opacity-20">
                    <p className="text-lime-700 text-[10px] uppercase font-bold">Breaches Found</p>
                    <p className={`text-2xl font-black ${results.summary?.hibp_breaches > 0 ? 'text-red-500' : 'text-lime-500'}`}>
                      {results.summary?.hibp_breaches || 0}
                    </p>
                  </div>
                  <div className="p-4 border border-lime-900 rounded bg-zinc-900 bg-opacity-20">
                    <p className="text-lime-700 text-[10px] uppercase font-bold">Social Platforms</p>
                    <p className="text-2xl font-black text-lime-500">
                      {results.summary?.maigret_platforms_found || 0}
                    </p>
                  </div>
                  <div className="p-4 border border-lime-900 rounded bg-zinc-900 bg-opacity-20">
                    <p className="text-lime-700 text-[10px] uppercase font-bold">Registered Accounts</p>
                    <p className="text-2xl font-black text-lime-500">
                      {results.summary?.holehe_platforms_registered || 0}
                    </p>
                  </div>
                </div>

                {/* 2. Breach Data - GRACEFUL ERROR HANDLING ADDED HERE */}
                <div>
                  <h3 className="text-lime-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} /> Breach Analysis (XposedOrNot)
                  </h3>
                  
                  {results.breach_data?.status === "error" ? (
                    <div className="p-4 border border-yellow-700 bg-yellow-950 bg-opacity-20 rounded flex items-center gap-3">
                      <AlertTriangle className="text-yellow-500" size={20} />
                      <p className="text-yellow-200 text-xs">
                        Breach lookup service temporarily unavailable. Please try again later.
                      </p>
                    </div>
                  ) : results.breach_data?.count > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.breach_data.breaches.map((b, idx) => (
                        <div key={idx} className="p-3 border border-red-900 bg-red-950 bg-opacity-10 rounded flex items-center justify-between">
                          <span className="text-red-400 text-xs font-bold uppercase">{b.name}</span>
                          <span className="text-[10px] text-red-700 font-bold">EXPOSED</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-lime-900 bg-lime-950 bg-opacity-10 rounded flex items-center gap-3">
                      <ShieldCheck className="text-lime-500" size={20} />
                      <p className="text-lime-400 text-xs uppercase font-bold tracking-widest">
                        No known data breaches found for this email.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Maigret Results */}
                {Object.keys(results.maigret_results).length > 0 && (
                  <div>
                    <h3 className="text-cyan-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Globe size={18} /> Digital Presence (Maigret)
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(results.maigret_results).map(([site, data]) => (
                        <div key={site} className="p-3 bg-zinc-900 border border-cyan-900 rounded flex justify-between items-center group">
                          <div>
                            <span className="text-cyan-500 text-xs font-bold uppercase mr-2">{site}</span>
                            {data.url && (
                              <a href={data.url} target="_blank" rel="noreferrer" className="text-cyan-700 text-[10px] hover:text-cyan-300 transition-colors">
                                {data.url}
                              </a>
                            )}
                          </div>
                          <span className="text-cyan-950 font-black text-[10px] group-hover:text-cyan-500 transition-colors">VERIFIED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Holehe Results */}
                {Object.keys(results.holehe_results).length > 0 && (
                  <div>
                    <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-[0.2em] mb-4">{'>'} Registration Check (Holehe)</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(results.holehe_results).map(([platform, found]) => (
                        found && (
                          <div key={platform} className="px-3 py-1 border border-yellow-900 bg-yellow-950 bg-opacity-20 rounded">
                            <span className="text-yellow-500 text-[10px] font-bold uppercase">{platform}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setResults(null);
                  setEmail('');
                  setUsername('');
                  setError('');
                }}
                className="px-8 py-2 border border-lime-500 text-lime-500 text-xs font-bold uppercase tracking-[0.3em] hover:bg-lime-500 hover:text-black transition-all duration-300"
              >
                Reset & New Scan
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-lime-900 text-[10px] uppercase tracking-[0.4em] max-w-2xl opacity-50">
          <p>OSINT RECONNAISSANCE SYSTEM // V.2026.01</p>
          <p className="mt-1">Authorized educational research access only</p>
        </div>
      </div>
    </div>
  );
}