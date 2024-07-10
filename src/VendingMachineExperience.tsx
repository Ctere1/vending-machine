import { Canvas } from "@react-three/fiber";
import VendingMachine from "./VendingMachine";
import { CameraProvider } from "./camera/CameraContext";
import { useMaterialInit } from "./models/materials";

export const NEAR = 1e-6;
export const FAR = 1e27;
export const BASE_SCALE = 1e8;

export default function VendingMachineExperienceRoot() {
  return (
    <>
      <Canvas
        gl={{
          logarithmicDepthBuffer: true,
        }}
        camera={{
          fov: 45,
          position: [1.681 * BASE_SCALE, 1.022 * BASE_SCALE, -5.27 * BASE_SCALE],
          rotation: [-Math.PI, 0.39, -Math.PI],
          near: NEAR,
          far: FAR,
        }}
      >
        <VendingMachineExperience />
      </Canvas>
    </>
  );
}

function VendingMachineExperience() {
  useMaterialInit();

  return (
    <>
      <CameraProvider>
        <VendingMachine scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]} />

        <ambientLight intensity={1.5} />
      </CameraProvider>
    </>
  );
}
