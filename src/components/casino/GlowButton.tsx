
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowButtonProps extends ButtonProps {
  glowColor?: "green" | "gold" | "blue" | "purple" | "white";
  glowIntensity?: "low" | "medium" | "high";
  withShine?: boolean;
}

const GlowButton = ({ 
  children, 
  className, 
  glowColor = "green", 
  glowIntensity = "medium",
  withShine = false,
  ...props 
}: GlowButtonProps) => {
  const getGlowStyle = () => {
    const colors = {
      green: "rgba(0, 255, 102, 0.7)",
      gold: "rgba(255, 215, 0, 0.7)",
      blue: "rgba(65, 105, 225, 0.7)",
      purple: "rgba(93, 63, 211, 0.7)",
      white: "rgba(255, 255, 255, 0.7)"
    };
    
    const intensities = {
      low: { blur: "10px", spread: "1px" },
      medium: { blur: "15px", spread: "2px" },
      high: { blur: "20px", spread: "3px" }
    };
    
    const color = colors[glowColor];
    const { blur, spread } = intensities[glowIntensity];
    
    return `0 0 ${blur} ${spread} ${color}`;
  };
  
  const buttonClasses = cn(
    "relative overflow-hidden",
    glowColor === "green" && "bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black",
    glowColor === "gold" && "bg-casino-gold hover:bg-casino-gold/90 text-black",
    glowColor === "blue" && "bg-casino-royal-blue hover:bg-casino-royal-blue/90 text-white",
    glowColor === "purple" && "bg-casino-royal-purple hover:bg-casino-royal-purple/90 text-white",
    glowColor === "white" && "bg-white hover:bg-gray-100 text-black",
    className
  );
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
      style={{ boxShadow: getGlowStyle() }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      <Button className={buttonClasses} {...props}>
        {withShine && (
          <span className="absolute inset-0 overflow-hidden">
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent shine-animation"></span>
          </span>
        )}
        {children as React.ReactNode}
      </Button>
    </motion.div>
  );
};

export default GlowButton;
