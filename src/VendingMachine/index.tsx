import { PerspectiveCamera, useGLTF } from "@react-three/drei"
import Command from "./Command"
import { GLTFResult, GLTF_FILE } from "../models/gltf"
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Group } from "three"
import { useCameraContext } from "../camera/CameraContext"
import { ThreeEvent } from "@react-three/fiber"
import Content from "./Content"
import { StoreProvider } from "./StoreContext"
import { ItemComponent } from "../Items"
import { glassMat, outsideMat, panelMat } from "../models/materials"

type VendingMachineProps = JSX.IntrinsicElements['group']

export default function VendingMachine(props: VendingMachineProps) {
  const { nodes } = useGLTF(GLTF_FILE) as GLTFResult
  const glassRef = useRef<GlassRef>(null)
  const rootRef = useRef<Group>(null)
  const { setFocus } = useCameraContext()

  const focus = (ev?: ThreeEvent<MouseEvent>) => {
    setFocus(ev?.eventObject || rootRef.current!)
    ev?.stopPropagation()
  }

  const enterValidCode = () => glassRef.current?.focus()

  const [served, setServed] = useState<ItemComponent[]>([])

  const serve = (mesh: ItemComponent) => {
    focus()
    setServed(prev => [...prev, mesh])
  }

  const gap = useMemo(() => Math.PI * 0.85 + Math.random() * Math.PI * 0.04, [])

  return (
    <group ref={rootRef} onClick={focus} {...props}>
      <PerspectiveCamera position={nodes.cameraVendingMachine.position} rotation={nodes.cameraVendingMachine.rotation} />
      <mesh geometry={nodes.box.geometry} material={outsideMat} position={nodes.box.position} />
      <Glass ref={glassRef} />
      <mesh geometry={nodes.door.geometry} material={panelMat} position={nodes.door.position} />

      <StoreProvider>
        <Content onServe={serve} />
        <Command onEnterValidCode={enterValidCode} />
      </StoreProvider>

      <group>
        {served.map((Item, i) => (
          <Item
            key={i}
            openable
            position={[
              Math.sin(gap + i * Math.PI * 2 / 40) * 2,
              0,
              Math.cos(gap + i * Math.PI * 2 / 40) * 2,
            ]}
            rotation={[0, Math.PI + gap + i * Math.PI * 2 / 40, 0]}
          />
        ))}
      </group>
    </group>
  )
}

type GlassRef = { focus: () => void }
const Glass = forwardRef<GlassRef>((_, ref) => {
  const { nodes } = useGLTF(GLTF_FILE) as GLTFResult
  const rootRef = useRef<Group>(null)
  const { setFocus } = useCameraContext()

  const focus = (ev?: ThreeEvent<MouseEvent>) => {
    setFocus(ev?.eventObject || rootRef.current!)
    ev?.stopPropagation()
  }

  useImperativeHandle(ref, () => ({ focus }))

  return (
    <group ref={rootRef} onClick={focus}>
      <PerspectiveCamera position={nodes.cameraGlass.position} rotation={nodes.cameraGlass.rotation} />
      <mesh geometry={nodes.glass.geometry} material={glassMat} position={nodes.glass.position} />
    </group>
  )
})

useGLTF.preload(GLTF_FILE)
