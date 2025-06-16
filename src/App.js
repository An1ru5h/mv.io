import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import pb from './pbClient'; // PocketBase client for interacting with the database
function App() {
  // State variables for the waitlist form
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // State variable for the music player's play/pause status
  const [isPlaying, setIsPlaying] = useState(true); // Music starts playing by default

  // State for the current track index in the playlist
  const [currentTrackIndex, setCurrentTrack] = useState(0);

  // Array of sample music tracks with their audio source URLs
  const tracks = useRef([
    { audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  ]);

  // URL for the YouTube Music logo used as the playlist cover
  const playlistCoverImage = 'https://upload.wikimedia.org/wikipedia/commons/d/d8/YouTubeMusic_Logo.png';

  // Ref to the Audio HTML element for controlling playback
  const audioRef = useRef(new Audio(tracks.current.length > 0 ? tracks.current[currentTrackIndex].audioSrc : ''));

  useEffect(() => {
    if (tracks.current.length > 0) {
      audioRef.current.src = tracks.current[currentTrackIndex].audioSrc;
      audioRef.current.muted = false;

      const handleAudioEnded = () => {
        handleNextTrack();
      };

      audioRef.current.addEventListener('ended', handleAudioEnded);

      return () => {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleAudioEnded);
      };
    } else {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (tracks.current.length > 0) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Error playing audio (user interaction might be required):", e);
        });
      } else {
        audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handles the submission of the waitlist form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      await pb.collection('waitlist').create({ email });

      setMessage("Thanks for your interest! We'll keep you updated.");
      setEmail('');
      setIsSubscribed(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
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

  const togglePlayPause = (e) => {
    e.preventDefault();
    if (tracks.current.length > 0) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTrack = (e) => {
    if (e) e.preventDefault();
    if (tracks.current.length > 0) {
      setCurrentTrack(prevIndex => (prevIndex + 1) % tracks.current.length);
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = (e) => {
    if (e) e.preventDefault();
    if (tracks.current.length > 0) {
      setCurrentTrack(prevIndex => (prevIndex - 1 + tracks.current.length) % tracks.current.length);
      setIsPlaying(true);
    }
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
          border: 1px solid rgba(255, 255, 255, 0.25);
          transition: none;
          margin-top: 5px;
          max-width: 220px; /* Reduced width */
          min-width: 140px; /* Reduced min width */
          padding: 8px 6px; /* Reduced padding */
        }
        .gradient-box-top {
          width: 90px; /* Reduced width */
          height: 18px; /* Reduced height */
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
          font-size: 0.5rem; /* Reduced font size */
          text-align: center;
          padding: 2px; /* Reduced padding */
          transform-style: preserve-3d;
          transform: perspective(500px) rotateX(7deg) rotateY(0deg);
          animation: boxGradientShift 4s linear infinite;
        }
        .top-left-logo {
          width: 24px; /* Further reduced logo size */
          height: 24px;
        }
        .liquid-glass-icon-bg {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(220, 220, 200, 0.15));
          backdrop-filter: blur(3px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          width: 50px;
          height: 50px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .liquid-glass-icon-bg svg {
          width: 32px;
          height: 32px;
        }
        .success-animation {
          animation: popFadeIn 0.8s ease-in-out forwards;
        }
        @keyframes popFadeIn {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .music-component-outer {
          position: fixed;
          bottom: 20px;
          left: 20px;
          transform: translateX(0);
          z-index: 20;
          padding: 7px;
          display: flex;
          align-items: center;
          border-radius: 0.5rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          background: transparent;
          transition: width 0.3s ease-in-out;
          width: calc(54px + 70px + 0.5rem);
          height: 54px;
          justify-content: flex-start;
        }
        .music-component-outer:hover {
          width: calc(54px + 0.5rem + 96px);
          justify-content: flex-start;
        }
        .playlist-image-wrapper {
          width:0;
          height: 40px;
          flex-shrink: 0;
          border-radius: 0.5rem;
          overflow: hidden;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background 0.3s ease-in-out;
        }
        .music-component-outer:hover .playlist-image-wrapper {
          background: transparent;
        }
        .playlist-image-wrapper a {
            cursor: default;
        }
        .playlist-image-wrapper img {
            width: 85%;
            height: 85%;
            object-fit: contain;
            border-radius: 0.5rem;
        }
        .playback-controls-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 0;
          opacity: 0;
          overflow: hidden;
          transition: width 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-left 0.3s ease-in-out;
          flex-shrink: 0;
          margin-left: 0rem;
          background: transparent;
        }
        .playback-controls-container button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .playback-controls-container svg {
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease-in-out;
        }
        .playback-controls-container button:hover svg {
          transform: scale(1.1);
        }
        .playback-controls-container button:nth-child(2) svg {
          width: 32px;
          height: 32px;
        }
        .top-left-logo {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
          width: 50px; /* Restore previous logo size */
          height: 50px;
          object-fit: contain;
        }
        .gradient-box-top {
          width: 90px; /* Reduced width */
          height: 18px; /* Reduced height */
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
          font-size: 0.5rem; /* Reduced font size */
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
          font-size: 0.7rem;
          padding: 4px 8px; /* Reduced padding */
          height: 28px; /* Reduced height */
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
      `}</style>

      {/* Main Container */}
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden font-urbanist text-white">
        <img className="image-background" src="https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg" alt="Background Image" />
        <div className="video-overlay"></div>

        {/* Logo at the top-left corner */}
        <img
          src="/Logo.png"
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

          <div className="glass-box-gradient-bg rounded-2xl pt-6 pb-10 px-6 sm:px-12 md:px-20 max-w-2xl w-full text-center">
            <p className="text-3xl md:text-4xl font-medium mb-1 gradient-text-subheading">
              Join Our Waitlist!
            </p>
            <p className="text-sm text-white mb-6">
              Supercharge your startup journey with real-time tools, smart prompts, and seamless integrations.
            </p>

            {isSubscribed ? (
              <div className="bg-green-500 bg-opacity-70 text-white p-4 rounded-xl shadow-md success-animation">
                <p className="text-xl font-semibold mb-2">You're on the list! 🎉</p>
                <p className="text-base">We'll notify you as soon as we're ready. Stay tuned!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <label htmlFor="waitlist-email" className="sr-only">Email address for waitlist</label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full sm:w-56 px-4 py-2 h-10 rounded-lg bg-black bg-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300"
                  required
                  aria-label="Email address for waitlist"
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    height: '28px',
                  }}
                />
                <button
                  type="submit"
                  className="w-full sm:w-32 font-bold py-2 px-4 h-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed join-waitlist-button"
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

        {/* Music Playlist Component with slide-in controls */}
        <div className="music-component-outer group">
          {/* Playlist Image */}
          <div className="playlist-image-wrapper">
            <a
              aria-label="YouTube Music Playlist Cover"
              className="block w-full h-full cursor-default"
            >
              <img
                src={playlistCoverImage}
                alt="YouTube Music Playlist Cover"
                className="w-full h-full object-fit-cover rounded-lg"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/FF0000/FFFFFF?text=YTM'; }}
                loading="lazy"
              />
            </a>
          </div>

          {/* Playback Controls Container - slides in from the right */}
          <div className="playback-controls-container">
            {/* Backward Button */}
            <button onClick={handlePrevTrack} aria-label="Previous track">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z"/>
              </svg>
            </button>
            {/* Play/Pause Button */}
            <button onClick={togglePlayPause} aria-label={isPlaying ? "Pause music" : "Play music"}>
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 24 24">
                  <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5V19L19 12L8 5Z"/>
                </svg>
              )}
            </button>
            {/* Forward Button */}
            <button onClick={handleNextTrack} aria-label="Next track">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;