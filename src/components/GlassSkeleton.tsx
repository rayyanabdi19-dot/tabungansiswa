import { motion } from "framer-motion";

interface GlassSkeletonProps {
  className?: string;
  count?: number;
  type?: "card" | "text" | "chart" | "list";
}

const SkeletonLine = ({ width = "100%", height = "16px", delay = 0 }: { width?: string; height?: string; delay?: number }) => (
  <motion.div
    className="glass-skeleton"
    style={{ width, height }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
  />
);

const CardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="glass-card rounded-2xl p-5 space-y-3"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <SkeletonLine width="60%" height="12px" />
    <SkeletonLine width="80%" height="28px" delay={0.1} />
    <SkeletonLine width="40%" height="12px" delay={0.2} />
  </motion.div>
);

const ChartSkeleton = () => (
  <motion.div
    className="glass-card rounded-2xl p-6 space-y-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <SkeletonLine width="40%" height="20px" />
    <div className="flex items-end gap-3 h-48">
      {[40, 65, 45, 80, 55, 70].map((h, i) => (
        <motion.div
          key={i}
          className="glass-skeleton flex-1 rounded-t-lg"
          style={{ height: `${h}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  </motion.div>
);

const ListSkeleton = ({ count = 4 }: { count?: number }) => (
  <motion.div
    className="glass-card rounded-2xl p-5 space-y-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <SkeletonLine width="35%" height="20px" />
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonLine width="36px" height="36px" delay={i * 0.05} />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" height="14px" delay={i * 0.05 + 0.05} />
          <SkeletonLine width="40%" height="10px" delay={i * 0.05 + 0.1} />
        </div>
        <SkeletonLine width="80px" height="14px" delay={i * 0.05 + 0.15} />
      </div>
    ))}
  </motion.div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonLine width="200px" height="28px" />
      <SkeletonLine width="160px" height="14px" delay={0.1} />
    </div>
    <div className="glass-card rounded-2xl p-6">
      <SkeletonLine width="70%" height="24px" />
      <SkeletonLine width="90%" height="14px" delay={0.1} />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map(i => <CardSkeleton key={i} delay={i * 0.1} />)}
    </div>
    <ChartSkeleton />
    <ListSkeleton />
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonLine width="200px" height="28px" />
      <SkeletonLine width="160px" height="14px" delay={0.1} />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map(i => <CardSkeleton key={i} delay={i * 0.1} />)}
    </div>
    <ListSkeleton count={6} />
  </div>
);

export default PageSkeleton;
