import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChainPedal } from "@/types/pedal";

type PedalCardProps = {
  pedal: ChainPedal;
  position: number;
  onRemove: () => void;
};

export default function PedalCard({
  pedal,
  position,
  onRemove,
}: PedalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: pedal.chainId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`w-36 shrink-0 rounded-2xl border p-4 shadow-lg ${
        isDragging
          ? "z-10 border-white bg-neutral-700"
          : "border-neutral-700 bg-neutral-900"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mb-3 w-full cursor-grab rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-left active:cursor-grabbing"
      >
        <div className="text-xs text-neutral-500">Position {position}</div>
        <div className="font-semibold leading-tight">{pedal.name}</div>
      </button>

      <div className="text-sm text-neutral-400">
        {pedal.brand || "Unknown brand"}
      </div>

      <div className="mt-3 inline-flex rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
        {pedal.type || "Other"}
      </div>
      <div className="mt-3 text-sm text-neutral-400">
      Current draw: {pedal.currentDraw || 0} mA
    </div>

      <button
        onClick={onRemove}
        className="mt-4 w-full rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
      >
        Remove
      </button>
    </article>
  );
}