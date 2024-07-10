import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { GLTFResult, GLTF_FILE } from "../models/gltf";
import { ItemProps, ItemRef } from ".";
import { RefObject, forwardRef, useEffect, useMemo, useRef } from "react";
import { useCameraContext } from "../camera/CameraContext";
import { ThreeEvent } from "@react-three/fiber";
import { Material, Mesh, SRGBColorSpace, Texture, Vector3 } from "three";
import { BASE_SCALE } from "../VendingMachineExperience";

export const enum Taste {
  Salt,
  Paprika,
}

const packaging: [label: string, color: string][] = [
  ["Salt", "#E41B13"],
  ["Paprika", "#184594"],
];

export const SaltChips = forwardRef<ItemRef, ItemProps>((props, ref) => (
  <Chips taste={Taste.Salt} {...props} ref={ref} />
));

export const PaprikaChips = forwardRef<ItemRef, ItemProps>((props, ref) => (
  <Chips taste={Taste.Paprika} {...props} ref={ref} />
));

const Chips = forwardRef<ItemRef, ItemProps & { taste: Taste }>(function Chips(
  { openable, taste, ...props },
  ref
) {
  const { nodes } = useGLTF(GLTF_FILE) as GLTFResult;
  const { setFocus } = useCameraContext();

  const onClick = (ev: ThreeEvent<MouseEvent>) => {
    if (!openable) return;
    setFocus(ev.eventObject);
    ev.stopPropagation();
  };

  const [bag, mat] = useChipsTexture(taste);

  return (
    <group {...props} ref={ref} onClick={onClick}>
      <PerspectiveCamera position={nodes.cameraEgg.position} rotation={nodes.cameraEgg.rotation} />
      <mesh ref={bag} geometry={nodes.chips.geometry} material={mat} />
    </group>
  );
});

import chipsPng from "../assets/chips.png";
const baseImg = new Image();
baseImg.src = chipsPng;

const textureCache: { [k: string]: Texture } = {};

function newTexture(color: string, ...labels: string[]): Texture | null {
  const cacheKey = `${color}-${labels.join("-")}`;
  if (textureCache[cacheKey]) {
    return textureCache[cacheKey];
  }

  const canvas = new OffscreenCanvas(baseImg.width, baseImg.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, baseImg.width, baseImg.height);

  ctx.drawImage(baseImg, 0, 0);

  ctx.fillStyle = "white";
  ctx.font = "50px sans-serif";
  ctx.fillText(labels[0], 380, 772);

  let y = 800;
  for (let i = 1; i < labels.length; i++) {
    ctx.font = "25px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(labels[i], 700, y);
    y += 25;
  }

  const tex = new Texture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = SRGBColorSpace;
  tex.flipY = false;

  textureCache[cacheKey] = tex;

  return tex;
}

export function useChipsTexture(taste: Taste): [RefObject<Mesh>, Material] {
  const { materials } = useGLTF(GLTF_FILE) as GLTFResult;
  const bag = useRef<Mesh>(null);
  const mat = useMemo(() => materials.chips.clone(), [materials]);

  useEffect(() => {
    if (!bag.current || !mat) return;

    const scale = bag.current.getWorldScale(new Vector3()).x / BASE_SCALE;
    const grams = 35 * scale;
    const air = 0.000415 * scale ** 3;

    const texture = newTexture(
      packaging[taste][1],
      packaging[taste][0],
      `Net Weight ${formatUnit(grams, "g")}`,
      `Air ${formatUnit(air, "m³", 3)}`
    );

    if (texture) {
      mat.map = texture;
      mat.needsUpdate = true;
    }
  }, [taste, mat]);

  return [bag, mat];
}

const weights: [number, string][] = [
  [1e0, ""],
  [1e1, "d"],
  [1e2, "c"],
  [1e3, "m"],
  [1e6, "μ"],
  [1e9, "n"],
  [1e12, "p"],
  [1e15, "f"],
  [1e18, "a"],
  [1e21, "z"],
  [1e24, "y"],
  [1e27, "r"],
  [1e30, "q"],
];

function formatUnit(grams: number, unit: string, power = 1): string {
  let mul = 0;
  let prefix = "";
  for ([mul, prefix] of weights) {
    const product = grams * Math.pow(mul, power);
    if (product > 1) break;
  }

  return `${(grams * Math.pow(mul, power)).toFixed(2)} ${prefix}${unit}`;
}
