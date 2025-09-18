import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Eye, Clock, Users, AlertCircle } from 'lucide-react'
import SignupModal from './SignupModal'

const VideoShowcaseSection = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0)
  const videoRef = useRef(null)

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    // Global function for YouTube API
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API loaded')
    }
  }, [])

  // YouTube video ID - using a reliable public video for demo
  const videoId = 'fJ0B-BgewWg' // TradeGPT Platform Demo Video
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=1&mute=1&loop=0&playlist=${videoId}`

  // Multiple thumbnail resolution options with fallbacks
  const thumbnailOptions = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // 480x360
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // 320x180
    `https://img.youtube.com/vi/${videoId}/default.jpg`,       // 120x90
    // Fallback to a professional trading/finance image
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=720&q=80'
  ]

  const handlePlayClick = () => {
    setIsPlaying(true)
    setShowControls(false)
  }

  const handleVideoEnd = () => {
    // Quay về trạng thái ban đầu khi video kết thúc
    setIsPlaying(false)
    setShowControls(true)
  }

  const handleThumbnailError = () => {
    console.warn(`Thumbnail failed to load: ${thumbnailOptions[currentThumbnailIndex]}`)

    if (currentThumbnailIndex < thumbnailOptions.length - 1) {
      setCurrentThumbnailIndex(prev => prev + 1)
    } else {
      setThumbnailError(true)
      console.error('All thumbnail options failed to load')
    }
  }

  const handleThumbnailLoad = () => {
    setIsLoaded(true)
    setThumbnailError(false)
    console.log(`Thumbnail loaded successfully: ${thumbnailOptions[currentThumbnailIndex]}`)
  }

  const videoStats = [
    { icon: Eye, label: 'Views', value: '2.5M+' },
    { icon: Clock, label: 'Duration', value: '8:42' },
    { icon: Users, label: 'Engagement', value: '98%' }
  ]

  return (
    <section id="video-showcase" className="py-12 sm:py-16 md:py-18 lg:py-20 bg-gradient-to-b from-dark-900 to-dark-800 relative overflow-hidden">

      {/* Floating Elements */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 lg:top-20 lg:left-10 floating-animation hidden sm:block">
        <div className="glass-effect p-2 sm:p-3 rounded-xl">
          <Play className="h-4 w-4 sm:h-6 sm:w-6 text-primary-400" />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 lg:bottom-20 lg:right-10 floating-animation hidden sm:block" style={{ animationDelay: '1.5s' }}>
        <div className="glass-effect p-2 sm:p-3 rounded-xl">
          <Volume2 className="h-4 w-4 sm:h-6 sm:w-6 text-accent-400" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-4 sm:mb-6">
            <Play className="h-4 w-4 mr-2 text-red-400" />
            How TradeGPT work?
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Not just what's happening
            <span className="gradient-text block">TradeGPT reveals WHAT TO DO</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
            By analyzing the full landscape - trading strategy, real-time data, catalysts, context, news and more.
          </p>
        </div>

        {/* Video Container */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative group">
            {/* Video Frame */}
            <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-2xl">
              <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                {!isPlaying && showControls ? (
                  // Custom Thumbnail with Play Button
                  <div className="relative w-full h-full bg-gradient-to-br from-primary-900/50 to-accent-900/50 flex items-center justify-center">
                    {/* YouTube Thumbnail with Fallback */}
                    {!thumbnailError ? (
                      <img
                        key={currentThumbnailIndex} // Force re-render when index changes
                        src={thumbnailOptions[currentThumbnailIndex]}
                        alt="TradeGPT Demo Video Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity duration-300"
                        onLoad={handleThumbnailLoad}
                        onError={handleThumbnailError}
                      />
                    ) : (
                      // Professional fallback when all thumbnails fail
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-800/80 to-accent-800/80 flex items-center justify-center">
                        <div className="text-center text-white p-8">
                          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 rounded-full mb-6 mx-auto w-24 h-24 flex items-center justify-center shadow-2xl">
                            <Play className="h-12 w-12 text-white ml-1" />
                          </div>
                          <h3 className="text-3xl font-bold mb-4 gradient-text">
                            TradeGPT Platform Demo
                          </h3>
                          <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto">
                            Experience the power of AI-driven investment analysis in action
                          </p>
                          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span>Live Demo</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span>8 min overview</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                              <span>HD Quality</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {!isLoaded && !thumbnailError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 to-accent-900/70 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-300">Loading video preview...</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

                    {/* Play Button */}
                    <button
                      onClick={handlePlayClick}
                      className="relative z-20 group/play bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-4 sm:p-6 lg:p-8 transition-all duration-500 hover:bg-white/30 hover:scale-110 hover:border-white/50 shadow-2xl"
                      aria-label="Play TradeGPT Demo Video"
                    >
                      <Play className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white ml-1 transition-transform group-hover/play:scale-110" />
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
                    </button>

                    {/* Mobile Play Hint */}
                    <div className="absolute top-4 left-4 right-4 sm:hidden z-10">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                        <p className="text-white text-sm font-medium">Tap to play video</p>
                      </div>
                    </div>

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-0 hidden sm:block">
                      <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                            TradeGPT Platform Overview
                          </h3>
                          {thumbnailError && (
                            <div className="flex items-center text-yellow-400 text-xs sm:text-sm">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span>Preview loading...</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                          Learn how AI transforms your investment strategy with real-time analysis and intelligent recommendations.
                        </p>

                        {/* Video Stats */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                          {videoStats.map((stat, index) => {
                            const IconComponent = stat.icon
                            return (
                              <div key={index} className="flex items-center space-x-2">
                                <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                <span className="text-xs sm:text-sm text-gray-300">
                                  <span className="font-semibold text-white">{stat.value}</span> {stat.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Video Status Indicator */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400 font-medium">Ready to Play</span>
                          </div>
                          {isLoaded && !thumbnailError && (
                            <div className="flex items-center space-x-1 text-blue-400">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="text-xs">HD Preview Loaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // YouTube Embed with Error Handling
                  <div className="relative w-full h-full">
                    <iframe
                      ref={videoRef}
                      src={embedUrl}
                      title="TradeGPT Platform Demo"
                      className="w-full h-full rounded-2xl"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => {
                        console.log('YouTube iframe loaded successfully')
                        // Thêm event listener cho video kết thúc
                        if (window.YT && window.YT.Player) {
                          const player = new window.YT.Player(videoRef.current, {
                            events: {
                              'onStateChange': (event) => {
                                // State 0 = video ended
                                if (event.data === 0) {
                                  handleVideoEnd()
                                }
                              }
                            }
                          })
                        }
                      }}
                      onError={() => console.error('YouTube iframe failed to load')}
                    ></iframe>

                    {/* Fallback for iframe loading issues */}
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none">
                      <div className="text-center text-white">
                        <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Video Player Active</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full opacity-50 group-hover:opacity-90 transition-opacity duration-300"></div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                Ready to Experience TradeGPT?
              </h3>
              <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
                Start your free trial today and see how AI can transform your investment strategy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  className="btn-primary flex items-center group w-full sm:w-auto"
                  onClick={() => setShowSignupModal(true)}
                >
                  Start Free Trial
                  <Play className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  className="btn-secondary w-full sm:w-auto"
                  onClick={() => {
                    alert('Demo scheduling functionality would be implemented here')
                  }}
                >
                  Schedule Personal Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        title="Start Your Free Trial"
        subtitle="Experience TradeGPT's powerful AI analysis. Create your account and get started today!"
      />
    </section>
  )
}

export default VideoShowcaseSection