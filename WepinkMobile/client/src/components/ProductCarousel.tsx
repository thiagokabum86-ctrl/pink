import { useState, useEffect, useRef } from "react";

interface ProductCarouselProps {
  images: string[];
  productName?: string;
}

export default function ProductCarousel({ images, productName = "4Dreams" }: ProductCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const startScrollLeft = useRef(0);

  const handleThumbnailClick = (index: number) => {
    if (isTransitioning) return;
    setActiveIndex(index);
    scrollToIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const carousel = carouselRef.current;
    if (carousel) {
      setIsTransitioning(true);
      const imageWidth = carousel.children[0]?.clientWidth || 0;
      carousel.scrollTo({
        left: imageWidth * index,
        behavior: 'smooth'
      });
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning) return;
    setActiveIndex(index);
    scrollToIndex(index);
  };

  // Touch/Mouse event handlers
  const handleStart = (clientX: number) => {
    if (isTransitioning) return;
    startX.current = clientX;
    currentX.current = clientX;
    isDragging.current = true;
    startScrollLeft.current = carouselRef.current?.scrollLeft || 0;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !startX.current || isTransitioning) return;
    
    currentX.current = clientX;
    const deltaX = startX.current - clientX;
    const carousel = carouselRef.current;
    
    if (carousel) {
      carousel.scrollLeft = startScrollLeft.current + deltaX;
    }
  };

  const handleEnd = () => {
    if (!isDragging.current || !startX.current || !currentX.current || isTransitioning) return;
    
    const deltaX = startX.current - currentX.current;
    const threshold = 50; // minimum swipe distance
    const carousel = carouselRef.current;
    
    if (carousel && Math.abs(deltaX) > threshold) {
      const imageWidth = carousel.children[0]?.clientWidth || 0;
      let newIndex = activeIndex;
      
      if (deltaX > 0 && activeIndex < images.length - 1) {
        // Swipe left - next image
        newIndex = activeIndex + 1;
      } else if (deltaX < 0 && activeIndex > 0) {
        // Swipe right - previous image
        newIndex = activeIndex - 1;
      }
      
      setActiveIndex(newIndex);
      scrollToIndex(newIndex);
    } else if (carousel) {
      // Snap back to current image
      scrollToIndex(activeIndex);
    }
    
    isDragging.current = false;
    startX.current = null;
    currentX.current = null;
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      if (isDragging.current || isTransitioning) return;
      const imageWidth = carousel.children[0]?.clientWidth || 0;
      const currentIndex = Math.round(carousel.scrollLeft / imageWidth);
      setActiveIndex(currentIndex);
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="px-4 mb-6">
      <div className="relative mb-4">
        {/* Main Carousel with Swipe Support */}
        <div 
          ref={carouselRef}
          className="carousel-container flex overflow-x-auto space-x-2 mb-3 cursor-grab active:cursor-grabbing" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="swipe-carousel"
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${productName} - Vista ${index + 1}`}
              className="w-full h-96 object-contain rounded-lg flex-shrink-0 select-none"
              data-testid={`img-carousel-${index}`}
              draggable={false}
            />
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center space-x-2 mb-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                activeIndex === index 
                  ? 'bg-gray-800 dark:bg-white' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              data-testid={`dot-indicator-${index}`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Thumbnail Navigation */}
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            className={`border-2 ${activeIndex === index ? 'border-primary' : 'border-transparent'} rounded-lg overflow-hidden flex-shrink-0`}
            onClick={() => handleThumbnailClick(index)}
            data-testid={`button-thumbnail-${index}`}
          >
            <img
              src={image.replace('800-auto', '150-auto')}
              alt={`Thumbnail ${index + 1}`}
              className="w-16 h-16 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
