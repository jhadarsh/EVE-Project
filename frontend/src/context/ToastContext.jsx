import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type="info") => {
    const id = crypto.randomUUID();
    setItems(x => [...x, { id, message, type }]);
    setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ toast: push }), [push]);
  return <ToastContext.Provider value={value}>
    {children}
    <div className="fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      <AnimatePresence>
        {items.map(item => <motion.div key={item.id} initial={{ opacity:0, y:-12, x:12 }} animate={{opacity:1,y:0,x:0}} exit={{opacity:0,x:20}} className="panel flex items-start gap-3 p-4">
          {item.type === "success" ? <CheckCircle2 className="mt-0.5 text-green-600" size={19}/> : item.type === "error" ? <XCircle className="mt-0.5 text-red-600" size={19}/> : <Info className="mt-0.5 text-brand-600" size={19}/>}
          <p className="flex-1 text-sm text-gray-700">{item.message}</p>
          <button aria-label="Dismiss" onClick={() => setItems(x => x.filter(i => i.id !== item.id))}><X size={16}/></button>
        </motion.div>)}
      </AnimatePresence>
    </div>
  </ToastContext.Provider>
}
export const useToast = () => useContext(ToastContext);