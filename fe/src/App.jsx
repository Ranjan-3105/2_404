// import React, { useState, useRef, useEffect } from 'react';
// import { Search, AlertTriangle, CheckCircle, Lock, ShieldAlert, ShieldCheck, Globe } from 'lucide-react';

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
//     '> SCANNING XPOSEDORNOT DATABASE...',
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
//           const newProgress = prev + Math.random() * 8; // Slower progress to account for backend delays
//           if (newProgress >= 95) {
//             clearInterval(interval);
//             return 95;
//           }
//           const statusIndex = Math.floor((newProgress / 100) * scanStatuses.length);
//           setScanStatus(scanStatuses[Math.min(statusIndex, scanStatuses.length - 1)]);
//           return newProgress;
//         });
//       }, 600);

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
//           // Fallback empty objects/arrays to prevent map() errors
//           breach_data: data.breach_data || { status: 'error' },
//           maigret_results: data.maigret_results || {},
//           holehe_results: data.holehe_results || {},
//           summary: data.summary || {}
//         });
//         setLoading(false);
//       }, 500);
//     } catch (err) {
//       setError(err.message || 'Connection lost. Check if backend is running.');
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     checkOSINT(email, username);
//   };

//   return (
//     <div className="min-h-screen bg-black font-mono">
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
//           <p className="text-lime-600 text-sm mt-2">Powered by Maigret, Holehe & XposedOrNot</p>
//         </div>

//         {/* Search form */}
//         {!results && !loading && (
//           <div className="w-full max-w-2xl mb-8">
//             <form onSubmit={handleSubmit} className="bg-black border border-lime-500 border-opacity-60 rounded-lg p-8 shadow-[0_0_15px_rgba(101,163,13,0.2)]">
//               <div className="mb-6">
//                 <label className="block text-lime-500 text-sm font-bold mb-3 uppercase tracking-widest">
//                   {'>'} TARGET EMAIL ADDRESS
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="enter email@domain.com"
//                     className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300"
//                   />
//                   <Search className="absolute right-3 top-3 text-lime-600" size={20} />
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-lime-500 text-sm font-bold mb-3 uppercase tracking-widest">
//                   {'>'} TARGET USERNAME
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     placeholder="enter username"
//                     className="w-full px-4 py-3 bg-black border border-lime-500 border-opacity-60 rounded text-lime-500 placeholder-lime-700 focus:outline-none focus:border-lime-400 transition-all duration-300"
//                   />
//                   <Search className="absolute right-3 top-3 text-lime-600" size={20} />
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-lime-600 text-sm font-bold mb-3 uppercase tracking-widest">
//                   {'>'} OR UPLOAD SCREENSHOT
//                 </label>
//                 <div 
//                   onClick={() => fileInputRef.current?.click()}
//                   className="border-2 border-dashed border-lime-600 border-opacity-40 rounded p-6 cursor-pointer transition-all duration-300 hover:border-opacity-100 bg-black"
//                 >
//                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                   <div className="text-center">
//                     <Lock className="mx-auto mb-2 text-lime-700" size={24} />
//                     <p className="text-lime-600 text-sm">drag & drop or click to upload</p>
//                     {imageUploaded && <p className="text-lime-400 text-xs mt-2 font-bold animate-pulse">✓ FILE ATTACHED</p>}
//                   </div>
//                 </div>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-950 bg-opacity-50 border border-red-600 border-opacity-70 rounded">
//                   <p className="text-red-400 text-sm flex items-center gap-2">
//                     <AlertTriangle size={16} /> ERROR: {error}
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-black uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2"
//               >
//                 <span>▶</span> START RECON SCAN
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Loading UI */}
//         {loading && (
//           <div className="w-full max-w-2xl bg-black border border-lime-500 p-8 rounded-lg">
//             <div className="space-y-4">
//               <div className="p-4 bg-zinc-900 border border-lime-900 rounded">
//                 <p className="text-lime-500 text-sm font-bold animate-pulse">{scanStatus}</p>
//               </div>
//               <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-lime-900">
//                 <div className="h-full bg-lime-500 transition-all duration-300" style={{width: `${scanProgress}%`}} />
//               </div>
//               <p className="text-center text-lime-600 text-xs tracking-widest uppercase">Encryption Check in Progress...</p>
//             </div>
//           </div>
//         )}

//         {/* Results section */}
//         {results && (
//           <div className="w-full max-w-4xl animate-in fade-in duration-700">
//             <div className="border border-lime-500 border-opacity-60 rounded-lg overflow-hidden bg-black shadow-[0_0_30px_rgba(101,163,13,0.15)]">
              
//               <div className="p-6 border-b border-lime-500 border-opacity-40 bg-zinc-900 bg-opacity-30">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <CheckCircle className="text-lime-500" size={28} />
//                     <h2 className="text-2xl font-black uppercase tracking-widest text-lime-500">
//                       SCAN COMPLETE
//                     </h2>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-lime-700 text-[10px] block uppercase">Target ID:</span>
//                     <span className="text-lime-400 text-sm break-all">{results.email || results.username}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-6 space-y-8">
                
//                 {/* 1. Summary Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="p-4 border border-lime-900 rounded bg-zinc-900 bg-opacity-20">
//                     <p className="text-lime-700 text-[10px] uppercase font-bold">Breaches Found</p>
//                     <p className={`text-2xl font-black ${results.summary?.hibp_breaches > 0 ? 'text-red-500' : 'text-lime-500'}`}>
//                       {results.summary?.hibp_breaches || 0}
//                     </p>
//                   </div>
//                   <div className="p-4 border border-lime-900 rounded bg-zinc-900 bg-opacity-20">
//                     <p className="text-lime-700 text-[10px] uppercase font-bold">Social Platforms</p>
//                     <p className="text-2xl font-black text-lime-500">
//                       {results.summary?.maigret_platforms_found || 0}
//                     </p>
//                   </div>
//                   <div className="p-4 border border-lime-900 rounded bg-zinc-900 bg-opacity-20">
//                     <p className="text-lime-700 text-[10px] uppercase font-bold">Registered Accounts</p>
//                     <p className="text-2xl font-black text-lime-500">
//                       {results.summary?.holehe_platforms_registered || 0}
//                     </p>
//                   </div>
//                 </div>

//                 {/* 2. Breach Data - GRACEFUL ERROR HANDLING ADDED HERE */}
//                 <div>
//                   <h3 className="text-lime-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
//                     <ShieldAlert size={18} /> Breach Analysis (XposedOrNot)
//                   </h3>
                  
//                   {results.breach_data?.status === "error" ? (
//                     <div className="p-4 border border-yellow-700 bg-yellow-950 bg-opacity-20 rounded flex items-center gap-3">
//                       <AlertTriangle className="text-yellow-500" size={20} />
//                       <p className="text-yellow-200 text-xs">
//                         Breach lookup service temporarily unavailable. Please try again later.
//                       </p>
//                     </div>
//                   ) : results.breach_data?.count > 0 ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       {results.breach_data.breaches.map((b, idx) => (
//                         <div key={idx} className="p-3 border border-red-900 bg-red-950 bg-opacity-10 rounded flex items-center justify-between">
//                           <span className="text-red-400 text-xs font-bold uppercase">{b.name}</span>
//                           <span className="text-[10px] text-red-700 font-bold">EXPOSED</span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="p-4 border border-lime-900 bg-lime-950 bg-opacity-10 rounded flex items-center gap-3">
//                       <ShieldCheck className="text-lime-500" size={20} />
//                       <p className="text-lime-400 text-xs uppercase font-bold tracking-widest">
//                         No known data breaches found for this email.
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* 3. Maigret Results */}
//                 {Object.keys(results.maigret_results).length > 0 && (
//                   <div>
//                     <h3 className="text-cyan-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
//                       <Globe size={18} /> Digital Presence (Maigret)
//                     </h3>
//                     <div className="space-y-2">
//                       {Object.entries(results.maigret_results).map(([site, data]) => (
//                         <div key={site} className="p-3 bg-zinc-900 border border-cyan-900 rounded flex justify-between items-center group">
//                           <div>
//                             <span className="text-cyan-500 text-xs font-bold uppercase mr-2">{site}</span>
//                             {data.url && (
//                               <a href={data.url} target="_blank" rel="noreferrer" className="text-cyan-700 text-[10px] hover:text-cyan-300 transition-colors">
//                                 {data.url}
//                               </a>
//                             )}
//                           </div>
//                           <span className="text-cyan-950 font-black text-[10px] group-hover:text-cyan-500 transition-colors">VERIFIED</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* 4. Holehe Results */}
//                 {Object.keys(results.holehe_results).length > 0 && (
//                   <div>
//                     <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-[0.2em] mb-4">{'>'} Registration Check (Holehe)</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {Object.entries(results.holehe_results).map(([platform, found]) => (
//                         found && (
//                           <div key={platform} className="px-3 py-1 border border-yellow-900 bg-yellow-950 bg-opacity-20 rounded">
//                             <span className="text-yellow-500 text-[10px] font-bold uppercase">{platform}</span>
//                           </div>
//                         )
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-8 text-center">
//               <button
//                 onClick={() => {
//                   setResults(null);
//                   setEmail('');
//                   setUsername('');
//                   setError('');
//                 }}
//                 className="px-8 py-2 border border-lime-500 text-lime-500 text-xs font-bold uppercase tracking-[0.3em] hover:bg-lime-500 hover:text-black transition-all duration-300"
//               >
//                 Reset & New Scan
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="mt-12 text-center text-lime-900 text-[10px] uppercase tracking-[0.4em] max-w-2xl opacity-50">
//           <p>OSINT RECONNAISSANCE SYSTEM // V.2026.01</p>
//           <p className="mt-1">Authorized educational research access only</p>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useRef, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Lock, ShieldAlert, ShieldCheck, Globe, MapPin, Upload } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const scanStatuses = [
    '> INITIALIZING OSINT PROTOCOL...',
    '> CONNECTING TO DATA REPOSITORIES...',
    '> SCANNING BREACH DATABASE...',
    '> CHECKING USERNAME ACROSS PLATFORMS...',
    '> ANALYZING BREACH PATTERNS...',
    '> CROSS-REFERENCING SOCIAL PROFILES...',
    '> PROCESSING IMAGE GEOLOCATION...',
    '> COMPILING THREAT ASSESSMENT...'
  ];

  useEffect(() => {
    if (loading) {
      setScanProgress(0);
      setScanStatus(scanStatuses[0]);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + Math.random() * 8;
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
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const processAudioFile = (file) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file');
      return;
    }
    setAudioFile(file);
    setError('');
  };

  const handleAudioDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processAudioFile(files[0]);
    }
  };

  const checkOSINT = async (emailToCheck, usernameToCheck, imageToUpload, audioToUpload) => {
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
      let url = 'http://localhost:8000/osint/scan';
      const body = new FormData();

      // Use combined endpoint if image or audio is provided
      if (imageToUpload || audioToUpload) {
        url = 'http://localhost:8000/osint/scan-with-media';
        body.append('email', emailToCheck || '');
        body.append('username', usernameToCheck || '');
        if (imageToUpload) body.append('image', imageToUpload);
        if (audioToUpload) body.append('audio', audioToUpload);
      } else {
        // Standard JSON endpoint
        const response = await fetch(url, {
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
            breach_data: data.breach_data || { status: 'error' },
            maigret_results: data.maigret_results || {},
            holehe_results: data.holehe_results || {},
            summary: data.summary || {},
            geolocation: data.geolocation || null,
            audio_analysis: data.audio_analysis || null
          });
          setLoading(false);
        }, 500);
        return;
      }

      // Media upload path
      const response = await fetch(url, {
        method: 'POST',
        body: body
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
          breach_data: data.breach_data || { status: 'error' },
          maigret_results: data.maigret_results || {},
          holehe_results: data.holehe_results || {},
          summary: data.summary || {},
          geolocation: data.geolocation || null,
          audio_analysis: data.audio_analysis || null
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
    checkOSINT(email, username, imageFile, audioFile);
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
            {'>'} Advanced OSINT Intelligence System with Geolocation
          </p>
          <p className="text-lime-600 text-sm mt-2">Powered by Maigret, Holehe, XposedOrNot & GeoCLIP</p>
        </div>

        {/* Search form */}
        {!results && !loading && (
          <div className="w-full max-w-2xl mb-8">
            <form onSubmit={handleSubmit} className="bg-black border border-lime-500 border-opacity-60 rounded-lg p-8 shadow-[0_0_15px_rgba(101,163,13,0.2)]">
              {/* Email Input */}
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

              {/* Username Input */}
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

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-lime-600 text-sm font-bold mb-3 uppercase tracking-widest">
                  {'>'} OR UPLOAD SCREENSHOT (FOR GEOLOCATION)
                </label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={handleImageDragOver}
                  onDrop={handleImageDrop}
                  className="border-2 border-dashed border-lime-600 border-opacity-40 rounded p-6 cursor-pointer transition-all duration-300 hover:border-opacity-100 bg-black"
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-lime-700" size={24} />
                    <p className="text-lime-600 text-sm">drag & drop or click to upload image</p>
                    {imageFile && (
                      <div className="mt-3">
                        <p className="text-lime-400 text-xs font-bold animate-pulse">✓ FILE ATTACHED</p>
                        <p className="text-lime-700 text-xs mt-1">{imageFile.name}</p>
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mt-3 max-h-24 mx-auto rounded border border-lime-600 border-opacity-30"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audio Upload */}
              <div className="mb-6">
                <label className="block text-lime-600 text-sm font-bold mb-3 uppercase tracking-widest">
                  {'>'} OR UPLOAD audio (FOR PII DETECTION)
                </label>
                <div
                  onClick={() => audioInputRef.current?.click()}
                  onDragOver={handleAudioDragOver}
                  onDrop={handleAudioDrop}
                  className="border-2 border-dashed border-lime-600 border-opacity-40 rounded p-6 cursor-pointer transition-all duration-300 hover:border-opacity-100 bg-black"
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-lime-700" size={24} />
                    <p className="text-lime-600 text-sm">drag & drop or click to upload audio</p>
                    {audioFile && (
                      <div className="mt-3">
                        <p className="text-lime-400 text-xs font-bold animate-pulse">✓ FILE ATTACHED</p>
                        <p className="text-lime-700 text-xs mt-1">{audioFile.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-950 bg-opacity-50 border border-red-600 border-opacity-70 rounded">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    ERROR: {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
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
                <div className="h-full bg-lime-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
              </div>
              <p className="text-center text-lime-600 text-xs tracking-widest uppercase">analysis in Progress...</p>
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
                {/* Summary Grid */}
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

                {/* Geolocation Results */}
                {results.geolocation && (
                  <div>
                    <h3 className="text-purple-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <MapPin size={18} /> Geolocation Data (GeoCLIP)
                    </h3>
                    {results.geolocation.status === "success" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-purple-900 bg-purple-950 bg-opacity-20 rounded">
                          <p className="text-purple-700 text-[10px] uppercase font-bold mb-2">Coordinates</p>
                          <p className="text-purple-400 text-sm font-bold">
                            Lat: {results.geolocation.latitude?.toFixed(4) || 'N/A'}
                          </p>
                          <p className="text-purple-400 text-sm font-bold">
                            Lon: {results.geolocation.longitude?.toFixed(4) || 'N/A'}
                          </p>
                        </div>
                        <div className="p-4 border border-purple-900 bg-purple-950 bg-opacity-20 rounded">
                          <p className="text-purple-700 text-[10px] uppercase font-bold mb-2">Location Details</p>
                          <p className="text-purple-400 text-sm font-bold">{results.geolocation.place}</p>
                          <p className="text-purple-600 text-xs mt-2">
                            Confidence: {(results.geolocation.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-yellow-700 bg-yellow-950 bg-opacity-20 rounded flex items-center gap-3">
                        <AlertTriangle className="text-yellow-500" size={20} />
                        <p className="text-yellow-200 text-xs">
                          {results.geolocation.message || 'Could not extract geolocation from image'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Audio Analysis Results */}
                {results.audio_analysis && (
                  <div>
                    <h3 className="text-orange-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      🎙 Audio Transcription & PII Detection
                    </h3>
                    {results.audio_analysis.status === "success" ? (
                      <div className="space-y-4">
                        <div className="p-4 border border-orange-900 bg-orange-950 bg-opacity-20 rounded">
                          <p className="text-orange-700 text-[10px] uppercase font-bold mb-2">Transcription</p>
                          <p className="text-orange-400 text-sm">{results.audio_analysis.transcription}</p>
                        </div>
                        <div className="p-4 border border-orange-900 bg-orange-950 bg-opacity-20 rounded">
                          <p className="text-orange-700 text-[10px] uppercase font-bold mb-2">PII Score</p>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className={`text-2xl font-black ${results.audio_analysis.pii_score > 0.5 ? 'text-red-500' : 'text-orange-400'}`}>
                                {(results.audio_analysis.pii_score * 100).toFixed(1)}%
                              </p>
                              <p className="text-orange-600 text-xs mt-1">
                                {results.audio_analysis.pii_score > 0.7 ? 'HIGH RISK' : results.audio_analysis.pii_score > 0.4 ? 'MEDIUM RISK' : 'LOW RISK'}
                              </p>
                            </div>
                            {results.audio_analysis.detected_entities && results.audio_analysis.detected_entities.length > 0 && (
                              <div className="flex-1">
                                <p className="text-orange-700 text-[10px] uppercase font-bold mb-2">Detected Entities</p>
                                <div className="flex flex-wrap gap-2">
                                  {results.audio_analysis.detected_entities.map((entity, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-orange-950 border border-orange-700 rounded text-orange-400 text-[10px] font-bold">
                                      {entity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-yellow-700 bg-yellow-950 bg-opacity-20 rounded flex items-center gap-3">
                        <AlertTriangle className="text-yellow-500" size={20} />
                        <p className="text-yellow-200 text-xs">
                          {results.audio_analysis.message || 'Could not process audio file'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Breach Data */}
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

                {/* Maigret Results */}
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
                              <a
                                href={data.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-700 text-[10px] hover:text-cyan-300 transition-colors"
                              >
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

                {/* Holehe Results */}
                {Object.keys(results.holehe_results).length > 0 && (
                  <div>
                    <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-[0.2em] mb-4">
                      {'>'} Registration Check (Holehe)
                    </h3>
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

            {/* Reset Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setResults(null);
                  setEmail('');
                  setUsername('');
                  setImageFile(null);
                  setImagePreview(null);
                  setAudioFile(null);
                  setError('');
                }}
                className="px-8 py-2 border border-lime-500 text-lime-500 text-xs font-bold uppercase tracking-[0.3em] hover:bg-lime-500 hover:text-black transition-all duration-300"
              >
                Reset & New Scan
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-lime-900 text-[10px] uppercase tracking-[0.4em] max-w-2xl opacity-50">
          <p>OSINT RECONNAISSANCE SYSTEM // V.2026.01 WITH GEOLOCATION</p>
          <p className="mt-1">Authorized educational research access only</p>
        </div>
      </div>
    </div>
  );
}
