export type Pedal = {
  id: string;
  name: string;
  brand?: string;
  type?: string;
  description?: string;
  image?: string;
  currentDraw?: number;
};

export type ChainPedal = Pedal & {
  chainId: string;
};