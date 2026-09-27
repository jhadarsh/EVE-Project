import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
export default function Modal({ open, onClose, title, children }) {
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={onClose}>
    <motion.div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" initial={{y:40}} animate={{y:0}} exit={{y:40}} onMouseDown={e=>e.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button className="rounded-full p-2 hover:bg-gray-100" aria-label="Close" onClick={onClose}><X size={18}/></button></div>
      {children}
    </motion.div>
  </motion.div>}</AnimatePresence>
}