import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion } from 'framer-motion';

/**
 * Lazy Loading Image Component
 * Optimized image loading with blur placeholder
 */
export const [loading, setLoading] = useState(true);
  const LazyImage = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  width,
  height,
  objectFit = 'cover',
  onLoad,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setImageLoaded(true);
              onLoad?.();
            };
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    if (loading) return <LoadingScreen />;

  return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, onLoad]);

  if (loading) return <LoadingScreen />;

  return (
    <motion.div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full transition-all duration-500 ${
          imageLoaded ? 'blur-0' : 'blur-md scale-110'
        }`}
        style={{ objectFit }}
        {...props}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </motion.div>
  );
};

export default LazyImage;
