import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { GLTFResult, GLTF_FILE } from "../models/gltf";
import { ItemProps, ItemRef } from ".";
import { forwardRef, useRef, useState } from "react";
import { useCameraContext } from "../camera/CameraContext";
import { ThreeEvent } from "@react-three/fiber";
import VendingMachine from "../VendingMachine";
import { eggMat } from "../models/materials";
import { Mesh } from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const enum Status {
  Closed,
  Opening,
  Opened,
}

export default forwardRef<ItemRef, ItemProps>(function Egg({ openable, ...props }, ref) {
  const { nodes } = useGLTF(GLTF_FILE) as GLTFResult

  const [ status, setStatus ] = useState(Status.Closed)

  const { setFocus, focus } = useCameraContext()
  function onClick(ev: ThreeEvent<MouseEvent>) {
    if (!openable) {
      return
    }
    if (focus === ev.eventObject) {
      setStatus(Status.Opening)
    } else {
      setFocus(ev.eventObject)
    }
    ev.stopPropagation()
  }

  const top = useRef<Mesh>(null)
  const bottom = useRef<Mesh>(null)

  useGSAP(() => {
    if (status !== Status.Opening ||
        top.current === null ||
        bottom.current === null) {
      return
    }

    gsap.to(top.current.position, { y: 1, duration: 3, ease: "power1.in" })
    gsap.to(bottom.current.position, { y: -1, duration: 3, delay: 0.1, ease: "power1.in" })
      .then(() => setStatus(Status.Opened))
  }, [ status ])

  return (
    <group
      {...props}
      ref={ref}
      onClick={onClick}
    >
      <PerspectiveCamera position={nodes.cameraEgg.position} rotation={nodes.cameraEgg.rotation} />
      { status !== Status.Closed && <VendingMachine scale={nodes.eggTop.scale} /> }
      { status !== Status.Opened && <>
          <mesh ref={top} geometry={nodes.eggTop.geometry} material={eggMat} position={nodes.eggTop.position} scale={nodes.eggTop.scale} />
          <mesh ref={bottom} geometry={nodes.eggBottom.geometry} material={eggMat} position={nodes.eggBottom.position} scale={nodes.eggBottom.scale} />
        </>
      }
    </group>
  )
})
