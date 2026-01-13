import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, X } from "lucide-react";
import { useState } from "react";

const StickyWidget = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.5, delay: 2 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="glass-card rounded-xl p-4 pr-10 glow-gold max-w-xs">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close widget"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg shrink-0">
              <MapPin className="w-5 h-5 text-primary animate-pulse-gold" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-1">
                Josh is currently on the island.
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  Current Audit Response Time: 
                  <span className="text-primary font-medium ml-1">4 hours</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StickyWidget;
