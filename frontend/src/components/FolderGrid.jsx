import FolderCard from './FolderCard.jsx';

export default function FolderGrid({ folders, onNavigate, onDelete, onRename }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Folders</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {folders.map((folder) => (
          <FolderCard
            key={folder._id}
            folder={folder}
            onNavigate={onNavigate}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
      </div>
    </section>
  );
}
