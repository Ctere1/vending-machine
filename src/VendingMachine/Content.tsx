import { Text, useGLTF } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three"
import { GLTFResult, GLTF_FILE } from "../models/gltf"
import { useFrame } from "@react-three/fiber"
import { DOUBLE_SLOTS, SINGLE_SLOTS, StoreItem, useItem, useStore } from "./StoreContext"
import { insideMat, spiralMat } from "../models/materials"
import { ItemComponent, ItemRef } from "../Items"

const GAP_X = 0.52 / 7
const GAP_Y = 0.20
const SCREW_SIZE = 0.1
const FALL_HEIGHT = 1.35
const SPEED = 2

const SINGLE_POS = new Vector3(0, 0, SCREW_SIZE / 2)
const DOUBLE_POS = new Vector3(-GAP_X / 2, 0, SCREW_SIZE / 2)
const TAG_POS = new Vector3(0, -0.050, -0.05)
const RELEASED_GAP = new Vector3(0, 0, -SCREW_SIZE)

const newPosition = (x: number, y: number) => new Vector3(-x * GAP_X, -y * GAP_Y, 0)

type ContentProps = {
  onServe: (mesh: ItemComponent) => void
}

export default function Content({ onServe }: ContentProps) {
  const { nodes: { spiral, inside, shelves } } = useGLTF(GLTF_FILE) as GLTFResult
  const { release } = useStore()
  const [falling, setFalling] = useState<StoreItem[]>([])
  const fallingRefs = useRef<{ [k: number]: ItemRef }>({})

  const onRelease = (item: StoreItem) => {
    release(item.id)
    setFalling(v => [...v, item])
  }

  useFrame((_, delta) => {
    falling.forEach(item => {
      const mesh = fallingRefs.current[item.id]
      if (!mesh) return

      mesh.userData.acceleration = (mesh.userData.acceleration ?? 0) + 9.81 * delta
      mesh.position.y -= delta * mesh.userData.acceleration
      if (mesh.position.y <= -FALL_HEIGHT) {
        onServe(item.type)
        setFalling(v => v.filter(i => i !== item))
        delete fallingRefs.current[item.id]
      }
    })
  })

  return (
    <>
      <mesh geometry={inside.geometry} material={insideMat} position={inside.position} />
      <mesh geometry={shelves.geometry} material={spiralMat} position={shelves.position} />

      <group position={spiral.position}>
        {DOUBLE_SLOTS.map(({ x, y }, i) => (
          <Slot x={x} y={y} key={i} onRelease={onRelease} double />
        ))}
        {SINGLE_SLOTS.map(({ x, y }, i) => (
          <Slot x={x} y={y} key={i} onRelease={onRelease} />
        ))}
        {falling.map(item => (
          <item.type
            key={item.id}
            ref={o => (fallingRefs.current[item.id] = o!)}
            position={newPosition(item.x, item.y)
              .add(item.double ? DOUBLE_POS : SINGLE_POS)
              .add(RELEASED_GAP)}
          />
        ))}
      </group>
    </>
  )
}

type SlotProps = JSX.IntrinsicElements['group'] & {
  x: number
  y: number
  onRelease: (item: StoreItem) => void
  double?: boolean
}

const Slot = ({ x, y, onRelease, double = false, ...props }: SlotProps) => {
  const { nodes: { spiral } } = useGLTF(GLTF_FILE) as GLTFResult
  const item = useItem(x, y)
  const tag = `${y + 1}${x + 1}`

  const itemRef = useRef<ItemRef>(null)
  const spiral0Ref = useRef<Mesh>(null)
  const spiral1Ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (item?.state !== 'ordering') return

    itemRef.current!.position.z -= SPEED * delta * 0.1 / (2 * Math.PI)
    spiral0Ref.current!.rotation.z += SPEED * delta
    if (double) spiral1Ref.current!.rotation.z -= SPEED * delta

    if (itemRef.current!.position.z <= -(SCREW_SIZE / 2)) {
      onRelease(item)
    }
  })

  return (
    <group position={newPosition(x, y)} {...props}>
      <Tag text={tag} position={TAG_POS} />
      <mesh geometry={spiral.geometry} material={spiralMat} ref={spiral0Ref} scale-y={double ? -1 : 1} />
      {double && (
        <mesh geometry={spiral.geometry} material={spiralMat} ref={spiral1Ref} position={[-GAP_X, 0, 0]} rotation-z={Math.PI} />
      )}
      {item && (
        <item.type ref={itemRef} position={double ? DOUBLE_POS : SINGLE_POS} />
      )}
    </group>
  )
}

type TagProps = JSX.IntrinsicElements['group'] & {
  text: string
}

const tagGeometry = new PlaneGeometry(0.05, 0.03)
const tagMaterial = new MeshBasicMaterial({ color: 'black' })

const Tag = ({ text, ...props }: TagProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useRef<any>(null)
  useEffect(() => {
    t.current!.material.transparent = false
    t.current!.material.needsUpdate = true
  }, [])

  return (
    <group {...props}>
      <mesh geometry={tagGeometry} material={tagMaterial} rotation-y={Math.PI} />
      <Text
        ref={t}
        position-z={-0.0005}
        rotation-y={Math.PI}
        font="./seven-segment.ttf"
        fontSize={0.03}
        color="black"
        characters="0123456789"
      >
        {text}
      </Text>
    </group>
  )
}
