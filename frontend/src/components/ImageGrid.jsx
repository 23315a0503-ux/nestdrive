import ImageCard from './ImageCard.jsx';

export default function ImageGrid({ images, onDelete, onView }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Images</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((image) => (
          <ImageCard
            key={image._id}
            image={image}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </section>
  );
}
