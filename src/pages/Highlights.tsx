import { motion } from 'framer-motion';

const Highlights = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[5px] mb-4">Destaques</h1>
        <div className="w-9 h-[1.5px] bg-[#7BAF8E] mx-auto mb-6" />
        <p className="text-xs text-[#aaaaaa] uppercase tracking-[3px]">Em breve</p>
      </motion.div>
    </div>
  );
};

export default Highlights;
