"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Pedal, ChainPedal } from "@/types/pedal";
import PedalLibrary from "@/components/PedalLibrary";
import PedalChain from "@/components/PedalChain";

function sortChainConventionally<T extends { type?: string }>(chain: T[]) {
  const orderPriority: Record<string, number> = {
    Tuner: 10,
    Wah: 20,
    Filter: 25,
    Compressor: 30,
    Boost: 40,
    Overdrive: 50,
    Distortion: 55,
    Fuzz: 60,
    EQ: 70,
    Pitch: 75,
    Phaser: 80,
    Flanger: 85,
    Chorus: 90,
    Tremolo: 95,
    Vibrato: 100,
    Delay: 110,
    Reverb: 120,
    Looper: 130,
    Other: 999,
  };

  return [...chain].sort((a, b) => {
    const aPriority = orderPriority[a.type || "Other"] ?? 999;
    const bPriority = orderPriority[b.type || "Other"] ?? 999;

    return aPriority - bPriority;
  });
}


export default function Home() {
  const [pedals, setPedals] = useState<Pedal[]>([]);
  const [chain, setChain] = useState<ChainPedal[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [error, setError] = useState("");
  const [availablePower, setAvailablePower] = useState(500);

  useEffect(() => {
    async function loadPedals() {
      try {
        const response = await fetch("/api/pedals");

        if (!response.ok) {
          throw new Error("Failed to load pedals");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setPedals(data);
        } else if (Array.isArray(data.pedals)) {
          setPedals(data.pedals);
        } else {
          console.error("Unexpected API response:", data);
          setError("The API returned data in an unexpected format.");
        }
      } catch (err) {
        console.error(err);
        setError("Could not load pedals from the API.");
      }
    }

    loadPedals();
  }, []);

  useEffect(() => {
    const savedChain = localStorage.getItem("pedalboard-chain");

    if (savedChain) {
      setChain(JSON.parse(savedChain));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pedalboard-chain", JSON.stringify(chain));
  }, [chain]);

  const pedalTypes = useMemo(() => {
    const types = pedals
      .map((pedal) => pedal.type)
      .filter((type): type is string => Boolean(type));

    return ["all", ...Array.from(new Set(types)).sort()];
  }, [pedals]);

  const pedalBrands = useMemo(() => {
    const brands = pedals
      .map((pedal) => pedal.brand)
      .filter((brand): brand is string => Boolean(brand));

    return ["all", ...Array.from(new Set(brands)).sort()];
  }, [pedals]);

  const filteredPedals = useMemo(() => {
    return pedals.filter((pedal) => {
      const searchText = `${pedal.name || ""} ${pedal.brand || ""} ${
        pedal.type || ""
      }`.toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());

      const matchesType = typeFilter === "all" || pedal.type === typeFilter;

      const matchesBrand =
        brandFilter === "all" || pedal.brand === brandFilter;

      return matchesQuery && matchesType && matchesBrand;
      });
  }, [pedals, query, typeFilter, brandFilter]);

  function addPedalToChain(pedal: Pedal) {
    setChain((current) => [
      ...current,
      {
        ...pedal,
        chainId: `${pedal.id}-${crypto.randomUUID()}`,
      },
    ]);
  }

  function removePedalFromChain(chainId: string) {
    setChain((current) => current.filter((pedal) => pedal.chainId !== chainId));
  }

  function clearChain() {
    setChain([]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setChain((items) => {
      const oldIndex = items.findIndex((item) => item.chainId === active.id);
      const newIndex = items.findIndex((item) => item.chainId === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  }

  const totalCurrentDraw = chain.reduce((total, pedal) => {
    return total + (pedal.currentDraw || 0);
  }, 0);

  const isOverPowerLimit = totalCurrentDraw > availablePower;

  const powerUsagePercentage =
    availablePower > 0
      ? Math.min((totalCurrentDraw / availablePower) * 100, 100)
      : 0;

  const exportedChain = {
    chainName: "My Pedalboard",
    availablePower,
    totalCurrentDraw,
    isOverPowerLimit,
    pedals: chain.map((pedal, index) => ({
      position: index + 1,
      id: pedal.id,
      name: pedal.name,
      brand: pedal.brand,
      type: pedal.type,
      currentDraw: pedal.currentDraw || 0,
    })),
  };

  async function copyExportJson() {
    await navigator.clipboard.writeText(JSON.stringify(exportedChain, null, 2));
  }

  async function copyGptReviewPrompt() {
    const prompt = `Review this guitar pedal chain.

Please:
1. Explain whether the order makes sense.
2. Suggest a better conventional order if needed.
3. Suggest one experimental alternative.
4. Explain the tonal tradeoffs.
5. Check whether the selected power supply has enough available current.

Chain JSON:
${JSON.stringify(exportedChain, null, 2)}
`;

    await navigator.clipboard.writeText(prompt);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1600px] p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Pedalboard Builder
          </h1>

          <p className="mt-2 text-neutral-400">
            Search guitar effects, add them to your board, and drag to reorder
            your signal chain.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <PedalLibrary
            pedals={filteredPedals}
            query={query}
            setQuery={setQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            pedalTypes={pedalTypes}
            pedalBrands={pedalBrands}
            onAddPedal={addPedalToChain}
          />

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Signal Chain</h2>
                <p className="text-sm text-neutral-400">
                  Drag pedals left or right to change the order.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setChain(sortChainConventionally(chain))}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                >
                  Auto-order
                </button>

                <button
                  onClick={clearChain}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                >
                  Clear
                </button>

                <button
                  onClick={copyExportJson}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                >
                  Copy JSON
                </button>

                <button
                  onClick={copyGptReviewPrompt}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                >
                  Copy GPT Review Prompt
                </button>
              </div>
            </div>

            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext
                items={chain.map((pedal) => pedal.chainId)}
                strategy={horizontalListSortingStrategy}
              >
                <PedalChain
                  pedals={chain}
                  onRemovePedal={removePedalFromChain}
                />
              </SortableContext>
            </DndContext>

            <div
              className={`mt-6 rounded-2xl border p-5 ${
                isOverPowerLimit
                  ? "border-red-800 bg-red-950/40"
                  : "border-neutral-800 bg-neutral-950"
              }`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Power Usage</h3>
                  <p className="text-sm text-neutral-400">
                    Total current draw for pedals currently in the chain.
                  </p>
                </div>

                <div
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isOverPowerLimit
                      ? "bg-red-900 text-red-100"
                      : "bg-green-900 text-green-100"
                  }`}
                >
                  {isOverPowerLimit ? "Over limit" : "Within limit"}
                </div>
              </div>

              <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="text-sm text-neutral-400">Total draw</div>
                  <div className="mt-1 text-2xl font-bold">
                    {totalCurrentDraw} mA
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="text-sm text-neutral-400">
                    Available power
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {availablePower} mA
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="text-sm text-neutral-400">Remaining</div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      isOverPowerLimit ? "text-red-300" : "text-green-300"
                    }`}
                  >
                    {availablePower - totalCurrentDraw} mA
                  </div>
                </div>
              </div>

              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Available power: {availablePower} mA
              </label>

              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={availablePower}
                onChange={(event) =>
                  setAvailablePower(Number(event.target.value))
                }
                className="w-full"
              />

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={`h-full ${
                    isOverPowerLimit ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${powerUsagePercentage}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs text-neutral-500">
                <span>0 mA</span>
                <span>{availablePower} mA</span>
              </div>

              {isOverPowerLimit && (
                <p className="mt-4 rounded-xl border border-red-800 bg-red-950 p-3 text-sm text-red-100">
                  This chain needs {totalCurrentDraw} mA, but your selected
                  power supply only provides {availablePower} mA. Increase
                  available power or remove pedals from the chain.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-semibold">Export JSON</h3>

              <pre className="max-h-72 overflow-auto rounded-xl bg-neutral-950 p-4 text-xs text-neutral-300">
                {JSON.stringify(exportedChain, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}