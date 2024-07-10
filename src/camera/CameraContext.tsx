import { CameraControls } from "@react-three/drei";
import { ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Box3, Object3D, Vector3 } from "three";
import { isCamera } from "./util";

interface CameraProviderProps {
  children?: ReactNode;
}

interface CameraContextType {
  focus: Object3D | undefined;
  setFocus: (target: Object3D) => void;
}

const initialCameraContext: CameraContextType = {
  focus: undefined,
  setFocus: () => {},
};

const cameraContext = createContext<CameraContextType>(initialCameraContext);

export function useCameraContext() {
  return useContext(cameraContext);
}

export function CameraProvider({ children }: CameraProviderProps) {
  const ctrl = useRef<CameraControls>(null);
  const [focus, setFocus] = useState<Object3D | undefined>();

  useEffect(() => {
    if (!focus) {
      return;
    }

    const box = new Box3();
    box.setFromObject(focus);

    const target = box.getCenter(new Vector3());

    const camera = focus.children.find(isCamera);
    if (camera) {
      const position = camera.localToWorld(new Vector3());

      ctrl.current!.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true);
    } else {
      ctrl.current!.setTarget(target.x, target.y, target.z, true);
    }
  }, [focus]);

  const contextValue = useMemo(() => ({ focus, setFocus }), [focus]);

  return (
    <cameraContext.Provider value={contextValue}>
      <CameraControls makeDefault ref={ctrl} />
      {children}
    </cameraContext.Provider>
  );
}
