import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";

const MotionLink = motion(Link);

export default function CentreCard({ centre }) {
  return (
    <MotionLink
      to={`/centres/${centre.id}`}
      className="panel group block overflow-hidden p-4"
      whileHover={{ y: -5 }}
      whileTap={{ y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <div className="mb-5 flex h-24 items-end rounded-xl bg-gradient-to-br from-brand-50 via-white to-gray-100 p-3.5">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
          Diagnostic centre
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-gray-900 transition group-hover:text-brand-700">
            {centre.name}
          </h3>

          <p className="mt-1 flex items-center gap-1 text-[13px] text-gray-500">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{centre.location}</span>
          </p>
        </div>

        <ArrowUpRight
          size={17}
          className="mt-0.5 shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600"
        />
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-gray-500">
        {centre.description || centre.address}
      </p>
    </MotionLink>
  );
}