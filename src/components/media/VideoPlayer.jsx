import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

/**
 * Advanced video player component with custom controls and accessibility features
 * @param {Object} props
 * @param {string} props.src - Video source URL
 * @param {string} props.poster - Poster image URL
 * @param {boolean} props.autoPlay - Auto play video
 * @param {boolean} props.muted - Start muted
 * @param {boolean} props.loop - Loop video
 * @param {boolean} props.controls - Show custom controls
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onPlay - Play event handler
 * @param {Function} props.onPause - Pause event handler
 * @param {Function} props.onEnded - Video ended handler
 * @param {Function} props.onError - Error handler
 * @param {Function} props.onTimeUpdate - Time update handler
 * @param {Function} props.onLoadedData - Loaded data handler
 */
export const [loading, setLoading] = useState(true);
const VideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  className = "",
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onLoadedData,
  ...props
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);

  // Format time in MM:SS format
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        await video.pause();
        onPause?.();
      } else {
        await video.play();
        onPlay?.();
      }
    } catch (err) {
      console.error("Error toggling play:", err);
      setError("Erro ao reproduzir vídeo");
      onError?.(err);
    }
  }, [isPlaying, onPlay, onPause, onError]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume[0];
    setVolume(newVolume[0]);
    setIsMuted(newVolume[0] === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // Seek video
  const handleSeek = useCallback((newTime) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newTime[0];
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  }, [isFullscreen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    /* if (loading) return <LoadingScreen />; */

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      onLoadedData?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setError("Erro ao carregar vídeo");
      onError?.(new Error("Video load error"));
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    /* if (loading) return <LoadingScreen />; */

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onLoadedData, onTimeUpdate, onEnded, onError]);

  // Auto-hide controls
  useEffect(() => {
    let timeout;

    const resetTimeout = () => {
      if (controls && isPlaying) {
        setShowControls(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("mousemove", resetTimeout);
      containerRef.current.addEventListener("mouseenter", () =>
        setShowControls(true)
      );
      containerRef.current.addEventListener("mouseleave", () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
    }

    resetTimeout();

    /* if (loading) return <LoadingScreen />; */

    return () => {
      clearTimeout(timeout);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", resetTimeout);
      }
    };
  }, [controls, isPlaying]);

  if (!src) {
    /* if (loading) return <LoadingScreen />; */

    return (
      <Card className={`video-player ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum vídeo fornecido</p>
        </CardContent>
      </Card>
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <Card className={`video-player ${className}`} ref={containerRef} {...props}>
      <CardContent className="p-0 relative overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          className="w-full h-auto"
          onClick={togglePlay}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Carregando vídeo...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="mb-2">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Recarregar
              </Button>
            </div>
          </div>
        )}

        {/* Custom controls */}
        {controls && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-4 text-white">
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isPlaying ? "⏸️" : "▶️"}
              </Button>

              {/* Time display */}
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Progress bar */}
              <div className="flex-1 mx-4">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isMuted ? "🔇" : "🔊"}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isFullscreen ? "🪟" : "⛶"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
