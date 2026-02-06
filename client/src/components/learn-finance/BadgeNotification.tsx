import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Badge {
  id: number;
  name: string;
  icon: string;
}

interface BadgeNotificationProps {
  badges: Badge[];
  onClose: () => void;
}

export function BadgeNotification({ badges, onClose }: BadgeNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (badges.length > 0) {
      setVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [badges, onClose]);

  if (badges.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-lg shadow-2xl p-6 relative overflow-hidden">
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="text-6xl mb-2"
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {badges.length === 1 ? 'Badge Earned!' : 'Badges Earned!'}
                </h3>
                <p className="text-white/90 text-sm">
                  Congratulations on your achievement!
                </p>
              </div>

              <div className="space-y-3">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        delay: 0.5 + index * 0.1,
                      }}
                      className="text-4xl"
                    >
                      {badge.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">
                        {badge.name}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
