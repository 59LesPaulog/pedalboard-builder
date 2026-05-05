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

export function sortChainConventionally<T extends { type?: string }>(chain: T[]) {
  return [...chain].sort((a, b) => {
    const aPriority = orderPriority[a.type || "Other"] ?? 999;
    const bPriority = orderPriority[b.type || "Other"] ?? 999;

    return aPriority - bPriority;
  });
}