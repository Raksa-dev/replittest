
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./button";

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FloatingActionButtonProps {
  actions: Action[];
  icon: React.ReactNode;
}

export function FloatingActionButton({ actions, icon }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full flex items-center gap-2 shadow-lg"
                  onClick={() => {
                    setIsOpen(false);
                    action.onClick();
                  }}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </Button>
    </div>
  );
}
