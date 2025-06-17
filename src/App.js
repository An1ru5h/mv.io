import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import pb from  './pbClient.js'; // Import the PocketBase client library
function App() {
  // State variables for the waitlist form
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // State variable for the music player's play/pause status (now mute/unmute)
  // Set to false initially, meaning the audio is muted and not "actively playing" to the user.
  const [isPlaying, setIsPlaying] = useState(false);

  // Ref to the Audio HTML element for controlling playback
  // Using a single default track for background audio
  const audioRef = useRef(new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'));

  useEffect(() => {
    // Set audio to loop for continuous background music
    audioRef.current.loop = true;
    audioRef.current.muted = true; // Ensure it starts muted to avoid autoplay issues

    const handleAudioEnded = () => {
      // This listener is mostly for playlist scenarios.
      // Since we have a single looping background track, it will just loop.
    };

    audioRef.current.addEventListener('ended', handleAudioEnded);

    // Load the audio but do not attempt to play it unmuted here.
    // Playback (unmuting) will be triggered by user interaction.
    audioRef.current.load();


    return () => {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleAudioEnded);
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // This effect handles changes to the `isPlaying` state (user clicking mute/unmute button)
    if (isPlaying) {
      audioRef.current.muted = false; // Unmute
      // Attempt to play. This will only succeed if triggered by user gesture (like the button click).
      audioRef.current.play().catch(e => {
        console.error("Error attempting to play audio:", e);
        // If play fails (e.g., due to no user gesture on first interaction),
        // revert isPlaying state to reflect actual muted state.
        setIsPlaying(false);
      });
    } else {
      audioRef.current.muted = true; // Mute
    }
  }, [isPlaying]); // React to changes in isPlaying state


  // Handles the submission of the waitlist form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
x
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to create a new record
      await pb.collection('waitlist').create({ email });

      setMessage("Thanks for your interest! We'll keep you updated.");
      setEmail('');
      setIsSubscribed(true);
    } catch (error) {
      console.error(error);
      if (error?.data?.email?.message?.includes('unique')) {
        setMessage('This email is already registered.');
      } else {
        setMessage('Oops! Something went wrong.');
      }
    }

    setIsLoading(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (message) setMessage('');
  };

  // Toggles mute/unmute
  const toggleMuteUnmute = (e) => {
    e.preventDefault();
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        .font-urbanist { font-family: 'Urbanist', sans-serif; }
        .font-figma-hand { font-family: 'Caveat', cursive; }
        .image-background {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2;
        }
        .video-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); z-index: -1;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes boxGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-header {
          background: linear-gradient(to top, #2196F3, #BBDEFB, #FFFFFF);
          background-size: 600% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          line-height: 1.2;
          animation: gradientShift 2s linear infinite;
          font-weight: 400 !important; /* Reduce boldness */
          margin-bottom: 10px !important; /* Lower the header */
        }
        .gradient-text-subheading {
          background: linear-gradient(to top, #333333, #cccccc, #ffffff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; color: transparent;
          margin-top: -10px;
        }
        .glass-box-gradient-bg {
          position: relative;
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.15), rgba(220, 220, 220, 0.1));
          backdrop-filter: blur(3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          border-radius: 10px;
          /* Removed border: 1px solid rgba(255, 255, 255, 0.25); */
          transition: none;
          margin-top: 5px;
          /* max-w and min-w now handled by Tailwind classes in JSX */
          /* padding is handled by Tailwind classes in JSX */
        }
        .gradient-box-top {
          width: 120px; /* Increased width */
          height: 25px; /* Increased height */
          background: linear-gradient(to top right, #66A1F3, #22C9A6);
          background-size: 200% auto;
          border-radius: 20px;
          margin-bottom: 0px;
          box-shadow:0 0 0 2px rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: normal;
          font-size: 0.7rem; /* Increased font size */
          text-align: center;
          padding: 2px; /* Reduced padding */
          transform-style: preserve-3d;
          transform: perspective(500px) rotateX(7deg) rotateY(0deg);
          animation: boxGradientShift 4s linear infinite;
        }
        .gradient-box-top:hover {}
        .font-figma-hand-normal { font-weight: normal; }
        .join-waitlist-button {
          background-color: white;
          color: black;
          transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
          font-size: 0.7rem; /* Re-added font-size */
          padding: 4px 8px; /* Re-added padding */
          height: 28px; /* Re-added height */
        }
        .join-waitlist-button:hover {
          background-color:rgb(0, 21, 156);
          color: white;
        }
        /* Reduce X (close) button size if present */
        .close-btn, .close-button, .x-btn {
          font-size: 0.7rem !important;
          width: 16px !important;
          height: 16px !important;
          top: 2px !important;
          right: 2px !important;
        }
        .liquid-glass-icon-bg { /* Adjusted width and height of the background box */
          width: 45px;
          height: 45px;
          background: linear-gradient(to bottom right, rgba(220, 220, 220, 0.2), rgba(192, 192, 192, 0.15)); /* Silver gradient */
          backdrop-filter: blur(5px); /* Increased blur */
        }
        .liquid-glass-icon-bg svg {
          width: 20px; /* Changed SVG icon size to 20px */
          height: 20px; /* Changed SVG icon size to 20px */
        }
        .music-component-outer {
          position: fixed;
          bottom: 20px;
          left: 20px;
          transform: translateX(0);
          z-index: 20;
          padding: 5px;
          display: flex;
          align-items: center;
          border-radius: 0.5rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          background: transparent; /* Removed background color */
          transition: width 0.3s ease-in-out;
          width: 40px; /* Compacted width */
          height: 40px; /* Retained height */
          justify-content: center; /* Center the single button */
        }
        .music-component-outer:hover {
          width: 40px; /* Stays compact on hover */
          justify-content: center;
        }
        .playback-controls-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem; /* Only gap will apply to the single button */
          width: auto;
          opacity: 1;
          overflow: visible;
          transition: none;
          flex-shrink: 0;
          margin-left: 0;
          background: transparent;
        }
        /* New CSS for fixed top-left logo */
        .top-left-logo {
          position: fixed;
          top: 20px;
          left: 20px;
          width: 40px; /* Adjust as needed */
          height: auto;
          z-index: 30; /* Ensures it stays on top of other content */
        }
        /* Music placeholder is removed */
      `}</style>

      {/* Main Container */}
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden font-urbanist text-white">
        <img className="image-background" src="https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg" alt="Background Image" />
        <div className="video-overlay"></div>

        {/* Logo at the top-left corner */}
        <img
          src="/Logo.png" // Placeholder for logo, updated to 60x60
          alt="Company Logo"
          className="top-left-logo"
          loading="lazy"
        />

        <main className="z-10 flex flex-col items-center w-full">
          <h1 className="text-5xl md:text-6xl font-normal mb-10 leading-tight gradient-text-header text-center">
            Build <span className="font-figma-hand">Smarter</span>. Launch <span className="font-figma-hand">Faster</span>.
          </h1>

          <div className="gradient-box-top">
            Build What’s Next
          </div>

          <div className="glass-box-gradient-bg rounded-2xl pt-6 pb-10 px-6 sm:px-12 md:px-20 max-w-lg w-full text-center">
            <p className="text-3xl md:text-4xl font-medium mb-1 gradient-text-subheading">
              Join Our Waitlist!
            </p>
            <p className="text-sm text-white mb-6">
              Supercharge your startup journey with real-time tools, smart prompts, and seamless integrations.
            </p>

            {isSubscribed ? (
              <div className="bg-green-500 bg-opacity-70 text-white p-4 rounded-xl shadow-md success-animation">
                <p className="text-xl font-semibold mb-2">Thank You 🎉</p>
                <p className="text-base">We'll notify you as soon as we're ready. </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:gap-2">
                <label htmlFor="waitlist-email" className="sr-only">Email address for waitlist</label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full sm:w-48 px-4 py-2 h-10 rounded-md bg-black text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300"
                  required
                  aria-label="Email address for waitlist"
                  // Re-added inline style for original size after previous reduction
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    height: '28px',
                  }}
                />
                <button
                  type="submit"
                  className="w-full sm:w-24 font-bold py-1 px-3 h-8 rounded-md shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed join-waitlist-button"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
            )}

            {message && !isSubscribed && (
              <p role="status" aria-live="polite" className={`mt-4 text-sm font-medium ${message.includes('valid') ? 'text-yellow-300' : 'text-red-300'}`}>
                {message}
              </p>
            )}
          </div>

          {/* Social Icons Container */}
          <div className="mt-1 flex items-center justify-center gap-2">
            {/* X (formerly Twitter) Icon */}
            <div className="flex items-center justify-center rounded-md liquid-glass-icon-bg z-10">
              <a href="https://x.com/anirudhbabu_" target="_blank" rel="noopener noreferrer" aria-label="Visit us on X (formerly Twitter)">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </main>

        {/* Music Mute/Unmute Component */}
        <div className="music-component-outer group">
          <div className="playback-controls-container">
            {/* Mute/Unmute Button */}
            <button onClick={toggleMuteUnmute} aria-label={isPlaying ? "Mute music" : "Unmute music"}>
              {isPlaying ? (
                // Speaker high volume (unmuted)
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.03C15.54 15.29 16.5 13.77 16.5 12ZM14 3.23V5.27C17.26 6.58 19.5 9.17 19.5 12C19.5 14.83 17.26 17.42 14 18.73V20.77C18.39 19.4 21.5 16.02 21.5 12C21.5 7.98 18.39 4.6 14 3.23Z"/>
                </svg>
              ) : (
                // Speaker muted
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M16.5 12C16.5 10.23 15.54 8.71 14 7.97V10.18L16.29 12.47C16.43 12.32 16.5 12.16 16.5 12ZM14 3.23V5.27C17.26 6.58 19.5 9.17 19.5 12C19.5 12.56 19.39 13.09 19.18 13.58L20.82 15.22C21.43 14.28 21.8 13.19 21.8 12C21.8 7.98 18.69 4.6 14.3 3.23L14 3.23ZM2.84 1.84L1.43 3.25L5.7 7.52L5.7 4L1.7 4V10H3.3L1.43 11.87L0 13.29L3.71 17H7L12 22V12.28L16.29 16.57L18.43 18.71L19.84 20.12L21.25 18.71L16.5 13.96L14.77 12.23L12.7 10.16L10.5 7.96L8.29 5.75L2.84 1.84Z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
