import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-[#1A2F23] tracking-[8px] mb-4">404</h1>
        <p className="text-xs text-[#aaaaaa] uppercase tracking-[4px] mb-8">Página não encontrada</p>
        <Link
          to="/"
          className="border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[4px] font-medium px-10 py-3 hover:border-[#7BAF8E] hover:text-[#7BAF8E] transition-all duration-300"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
