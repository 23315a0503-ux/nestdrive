import { ChevronRight, Home } from 'lucide-react';
import { useFolders } from '../context/FolderContext.jsx';

export default function Breadcrumb() {
  const { breadcrumb, navigate } = useFolders();

  return (
    <nav className="flex items-center gap-1 mb-6 text-sm flex-wrap">
      <button
        onClick={() => navigate(null)}
        className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {breadcrumb.map((item, index) => {
        const isLast = index === breadcrumb.length - 1;
        return (
          <span key={item._id} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="text-slate-800 font-semibold">{item.name}</span>
            ) : (
              <button
                onClick={() => navigate(item._id)}
                className="text-slate-500 hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
