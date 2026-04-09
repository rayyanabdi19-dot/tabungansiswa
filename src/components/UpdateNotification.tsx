import { useEffect, useState } from "react";
import { APP_VERSION, CHANGELOG, MAINTENANCE } from "@/lib/appConfig";
import { X, Sparkles, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "tabunganku_seen_version";

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem(STORAGE_KEY);
    if (seenVersion !== APP_VERSION) {
      setShowUpdate(true);
    }
    if (MAINTENANCE.active) {
      setShowMaintenance(true);
    }
  }, []);

  const dismissUpdate = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setShowUpdate(false);
  };

  const latestEntry = CHANGELOG[0];

  return (
    <AnimatePresence>
      {showMaintenance && (
        <motion.div
          key="maintenance"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          {MAINTENANCE.message || "Aplikasi sedang dalam pemeliharaan."}
          <button onClick={() => setShowMaintenance(false)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {showUpdate && !showMaintenance && (
        <motion.div
          key="update"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] gradient-bg text-white px-4 py-2.5 text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            <strong>TabunganKu v{APP_VERSION}</strong> tersedia!{" "}
            {latestEntry && latestEntry.changes[0]}
          </span>
          <button onClick={dismissUpdate} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
