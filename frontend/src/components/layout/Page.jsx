import { motion } from "framer-motion";

export default function Page({ children, className = "" }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`container-page py-8 sm:py-10 ${className}`}
    >
      {children}
    </motion.main>
  );
}