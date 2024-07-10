
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

export const GLTF_FILE = './vending-machine.glb'

export type GLTFResult = GLTF & {
  nodes: {
    cameraDoor: THREE.PerspectiveCamera
    cameraPanel: THREE.PerspectiveCamera
    cameraVendingMachine: THREE.PerspectiveCamera
    cameraGlass: THREE.PerspectiveCamera
    cameraEgg: THREE.PerspectiveCamera

    box: THREE.Mesh
    glass: THREE.Mesh
    inside: THREE.Mesh
    shelves: THREE.Mesh
    spiral: THREE.Mesh

    panel: THREE.Mesh
    screen: THREE.Mesh
    digits: THREE.Mesh
    bt0: THREE.Mesh
    bt1: THREE.Mesh
    bt2: THREE.Mesh
    bt3: THREE.Mesh
    bt4: THREE.Mesh
    bt5: THREE.Mesh
    bt6: THREE.Mesh
    bt7: THREE.Mesh
    bt8: THREE.Mesh
    bt9: THREE.Mesh
    btp: THREE.Mesh
    bts: THREE.Mesh

    door: THREE.Mesh

    eggTop: THREE.Mesh
    eggBottom: THREE.Mesh
    chips: THREE.Mesh
  }
  materials: {
    chips: THREE.MeshStandardMaterial
  }
}
