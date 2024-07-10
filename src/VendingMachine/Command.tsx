import { PerspectiveCamera, Text, useGLTF } from "@react-three/drei"
import { GLTFResult, GLTF_FILE } from "../models/gltf"
import { useEffect, useState } from "react"
import { Mesh } from "three"
import { ThreeEvent, useFrame } from "@react-three/fiber"
import { useCameraContext } from "../camera/CameraContext"
import { useStore } from "./StoreContext"
import { buttonMat, digitMat, panelMat } from "../models/materials"

type CommandProps = JSX.IntrinsicElements['group'] & {
  onEnterValidCode: (val: string) => void
}

type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

const buttonNames: (KeysOfType<GLTFResult['nodes'], Mesh>)[] = [
  'bt0', 'bt1', 'bt2', 'bt3', 'bt4', 'bt5', 'bt6', 'bt7', 'bt8', 'bt9',
  // 'btp', 'bts',
] 

export default function Command({ onEnterValidCode, ...props }: CommandProps) {
  const { nodes } = useGLTF(GLTF_FILE) as GLTFResult

  const { setFocus } = useCameraContext()
  const handleClick = (ev: ThreeEvent<MouseEvent>) => {
    setFocus(ev.eventObject)
    ev.stopPropagation()
  }

  const [screen, setScreen] = useState('')
  const [blinking, setBlinking] = useState(false)
  const { available, order } = useStore()

  const handleButtonDown = (ev: ThreeEvent<MouseEvent>) => {
    ev.eventObject.position.z += 0.005
    ev.stopPropagation()
  }

  const handleButtonUp = (ev: ThreeEvent<MouseEvent>) => {
    ev.eventObject.position.z -= 0.005

    let updatedScreen = screen.length >= 2 ? '' : screen
    updatedScreen += ev.eventObject.name
    setScreen(updatedScreen)

    if (available(updatedScreen)) {
      order(updatedScreen)
      onEnterValidCode(updatedScreen)
    } else {
      setBlinking(updatedScreen.length >= 2)
    }

    ev.stopPropagation()
  }

  useEffect(() => {
    if (screen.length < 2) return

    const cancelID = setTimeout(() => setScreen(''), 2000)
    return () => clearTimeout(cancelID)
  }, [screen])

  return (
    <group onClick={handleClick} {...props}>
      <PerspectiveCamera position={nodes.cameraPanel.position} rotation={nodes.cameraPanel.rotation} />
      <Screen text={screen} blinking={blinking} />

      <mesh geometry={nodes.panel.geometry} material={panelMat} position={nodes.panel.position} />
      <mesh geometry={nodes.digits.geometry} material={digitMat} position={nodes.digits.position} />

      {buttonNames.map((key, index) => (
        <mesh
          key={key}
          name={`${index}`}
          geometry={nodes[key].geometry}
          material={buttonMat}
          position={nodes[key].position}
          onPointerDown={handleButtonDown}
          onPointerUp={handleButtonUp}
          onClick={(ev) => ev.stopPropagation()}
        />
      ))}
    </group>
  )
}

type ScreenProps = { text: string, blinking?: boolean }

function Screen({ text, blinking }: ScreenProps) {
  const { nodes: { screen } } = useGLTF(GLTF_FILE) as GLTFResult
  const [isShown, setIsShown] = useState(true)

  useFrame(({ clock }) => {
    if (blinking) {
      setIsShown(clock.getElapsedTime() % 0.5 >= 0.25)
    }
  })

  const show = isShown || !blinking
  return (
    <group position={screen.position}>
      <mesh geometry={screen.geometry} material={screen.material} />
      <TextDisplay show={show} text={text} />
    </group>
  )
}

type TextDisplayProps = { show: boolean, text: string }

function TextDisplay({ show, text }: TextDisplayProps) {
  return (
    <>
      <Text
        position={[0.005, 0, -0.0005]}
        rotation-y={Math.PI}
        font="./seven-segment.ttf"
        fontSize={0.05}
        color="black"
        anchorX="right"
        characters="0123456789"
      >
        {show && text[0]}
      </Text>
      <Text
        position={[-0.02, 0, -0.0005]}
        rotation-y={Math.PI}
        font="./seven-segment.ttf"
        fontSize={0.05}
        color="black"
        anchorX="right"
        characters="0123456789"
      >
        {show && text[1]}
      </Text>
    </>
  )
}
