import React from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

const ProcessingLoader = ({
  title = "Processing OCR",
  description = "AI extracting data",
  color = "purple",
}) => {
  const colorClasses = {
    purple: {
      bg: "from-purple-100 to-blue-100",
      text: "text-purple-700",
      icon: "text-purple-600",
    },
    blue: {
      bg: "from-blue-100 to-cyan-100",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    green: {
      bg: "from-green-100 to-emerald-100",
      text: "text-green-700",
      icon: "text-green-600",
    },
    default: {
      bg: "from-slate-100 to-slate-200",
      text: "text-slate-600",
      icon: "text-slate-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-10 px-10 rounded-2xl bg-gradient-to-br ${colors.bg} border border-slate-200 shadow-md`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className='mb-4'
      >
        <Loader className={`h-8 w-8 sm:h-10 sm:w-10 ${colors.icon}`} />
      </motion.div>

      <h3 className={`font-bold text-lg sm:text-xl ${colors.text} mb-1`}>{title}</h3>
      <p className='text-sm text-slate-500 text-center max-w-sm'>{description}</p>
    </motion.div>
  );
};

export default ProcessingLoader;
