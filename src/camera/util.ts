import { Camera, Object3D } from "three";

export function isCamera(o: Object3D): o is Camera {
  return !!((o as Camera).isCamera)
}
