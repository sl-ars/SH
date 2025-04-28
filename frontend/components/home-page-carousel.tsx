"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

const carouselItems = [
  {
    title: "Connect Students with Dream Opportunities",
    subtitle: "Find your perfect career match with StudentHunter",
    description:
      "StudentHunter bridges the gap between talented students and innovative companies, helping you launch your career with confidence.",
    cta: {
      primary: {
        text: "Find Jobs",
        link: "/jobs",
      },
      secondary: {
        text: "For Employers",
        link: "/employers",
      },
    },
    image: "/carousel-1.jpg",
  },
  {
    title: "Discover Top Talent for Your Company",
    subtitle: "Connect with qualified students and recent graduates",
    description:
      "Recruit the brightest minds directly from top universities. Our platform makes it easy to find the perfect candidates for your team.",
    cta: {
      primary: {
        text: "Post a Job",
        link: "/manager/jobs/new",
      },
      secondary: {
        text: "Learn More",
        link: "/employers",
      },
    },
    image: "/carousel-2.jpg",
  },
  {
    title: "Boost Your Career with Resources",
    subtitle: "Access guides, workshops, and personalized advice",
    description:
      "Take advantage of our comprehensive career resources designed to help you stand out in the job market and land your dream role.",
    cta: {
      primary: {
        text: "Explore Resources",
        link: "/resources",
      },
      secondary: {
        text: "Join Career Quest",
        link: "/career-quest",
      },
    },
    image: "/carousel-3.jpg",
  },
]

export function HomePageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrentIndex(index)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [isAnimating],
  )

  const goToPrevSlide = useCallback(() => {
    const newIndex = currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1
    goToSlide(newIndex)
  }, [currentIndex, goToSlide])

  const goToNextSlide = useCallback(() => {
    const newIndex = currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1
    goToSlide(newIndex)
  }, [currentIndex, goToSlide])

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide()
    }, 6000)
    return () => clearInterval(interval)
  }, [goToNextSlide])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm">
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 flex flex-col md:flex-row items-center transition-all duration-500 ease-in-out",
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index < currentIndex
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full",
            )}
          >
            <div className="w-full md:w-1/2 p-8 md:p-12 text-center md:text-left">
              <span className="inline-block text-yellow-300 dark:text-yellow-200 font-medium mb-2 animate-fade-in-up">
                {item.subtitle}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white animate-fade-in-up">{item.title}</h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 animate-fade-in-up animation-delay-300 leading-relaxed">
                {item.description}
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up animation-delay-600">
                <Link href={item.cta.primary.link}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 dark:bg-white dark:text-blue-700 dark:hover:bg-gray-100 rounded-full shadow-lg transform transition-all hover:scale-105"
                  >
                    {item.cta.primary.text}
                  </Button>
                </Link>
                <Link href={item.cta.secondary.link}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white/10 rounded-full shadow-lg transform transition-all hover:scale-105"
                  >
                    {item.cta.secondary.text}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-md h-64 md:h-96 animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
                <div className="relative h-full w-full rounded-2xl overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    className="object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
