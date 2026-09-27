import { motion } from "framer-motion";
export default function TestCard({ item, selected, onToggle }) {
  const test = item.tests || item;
  const price = item.price;
  return <motion.button type="button" whileTap={{scale:.98}} onClick={onToggle} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? "border-brand-500 bg-brand-50/60 ring-4 ring-brand-50" : "border-black/10 bg-white hover:border-brand-200"}`}>
    <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{test.name}</h3><p className="mt-1 text-sm text-gray-500">{test.description || "Diagnostic test available at this centre."}</p></div><span className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full border text-xs ${selected?"border-brand-600 bg-brand-600 text-white":"border-gray-300"}`}>{selected?"✓":""}</span></div>
    {price !== undefined && <p className="mt-4 text-sm font-bold text-gray-800">₹{Number(price).toLocaleString("en-IN")}</p>}
  </motion.button>;
}