import { Pedal } from "@/types/pedal";

type PedalLibraryProps = {
  pedals: Pedal[];
  query: string;
  setQuery: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  pedalTypes: string[];
  pedalBrands: string[];
  onAddPedal: (pedal: Pedal) => void;
};

export default function PedalLibrary({
  pedals,
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  brandFilter,
  setBrandFilter,
  pedalTypes,
  pedalBrands,
  onAddPedal,
}: PedalLibraryProps) {
  return (
    <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-2xl font-semibold">Pedal Library</h2>

      <div className="mb-4 space-y-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, brand, or type..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-neutral-500"
        />

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-neutral-500"
        >
          {pedalTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All types" : type}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(event) => setBrandFilter(event.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-neutral-500"
        >
          {pedalBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand === "all" ? "All brands" : brand}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
        {pedals.map((pedal) => (
          <button
            key={pedal.id}
            onClick={() => onAddPedal(pedal)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left transition hover:border-neutral-500 hover:bg-neutral-800"
          >
            <div className="font-semibold">{pedal.name}</div>

            <div className="mt-1 text-sm text-neutral-400">
              {pedal.brand || "Unknown brand"}
            </div>

            <div className="mt-2 inline-flex rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
              {pedal.type || "Other"}
            </div>

            <div className="mt-2 text-xs text-neutral-500">
              {pedal.currentDraw || 0} mA
            </div>
          </button>
        ))}

        {pedals.length === 0 && (
          <p className="text-sm text-neutral-500">No pedals found.</p>
        )}
      </div>
    </aside>
  );
}