import Image from "next/image";
import { ChainPedal } from "@/types/pedal";
import PedalCard from "./PedalCard";

type PedalChainProps = {
  pedals: ChainPedal[];
  onRemovePedal: (chainId: string) => void;
};

export default function PedalChain({
  pedals,
  onRemovePedal,
}: PedalChainProps) {
  if (pedals.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-6 text-neutral-500">
        Add pedals from the library to start building your chain.
      </div>
    );
  }

  return (
    <div className="flex min-h-48 items-center gap-3 overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <Image
          src="/images/tele_transparent.png"
          alt="Guitar"
          width={100}
          height={100}
          className="object-contain"
        />
        <span className="text-sm text-neutral-400">Guitar</span>
      </div>

      <div className="text-2xl text-neutral-600">→</div>

      {pedals.map((pedal, index) => (
        <div key={pedal.chainId} className="flex items-center gap-3">
          <PedalCard
            pedal={pedal}
            position={index + 1}
            onRemove={() => onRemovePedal(pedal.chainId)}
          />

          {index < pedals.length - 1 && (
            <div className="text-2xl text-neutral-600">→</div>
          )}
        </div>
      ))}

      <div className="text-2xl text-neutral-600">→</div>

      <div className="flex shrink-0 flex-col items-center gap-2">
        <Image
          src="/images/amp.png"
          alt="Amplifier"
          width={100}
          height={100}
          className="object-contain"
        />
        <span className="text-sm text-neutral-400">Amp</span>
      </div>
    </div>
  );
}