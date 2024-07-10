import { useMatcapTexture } from "@react-three/drei";
import { useEffect } from "react";
import { BackSide, DoubleSide, MeshBasicMaterial, MeshMatcapMaterial, SRGBColorSpace, Texture } from "three";

export const outsideMat = new MeshMatcapMaterial()
export const glassMat = new MeshMatcapMaterial({
  opacity: 0.35,
  transparent: true,
})

export const insideMat = new MeshMatcapMaterial({side: BackSide });
export const spiralMat = new MeshMatcapMaterial()
export const panelMat = new MeshBasicMaterial({ color: 'gray', side: DoubleSide });
export const digitMat = new MeshBasicMaterial({ color: 'black', side: DoubleSide });
export const buttonMat  = new MeshMatcapMaterial()
export const eggMat = new MeshMatcapMaterial({ side: DoubleSide })

export function useMaterialInit() {
  const [outsideTex] = useMatcapTexture('464445_D2D0CB_919196_A8ADB0', 256)
  const [glassTex] = useMatcapTexture('050505_747474_4C4C4C_333333', 256)
  const [insideTex] = useMatcapTexture('2A4BA7_1B2D44_1F3768_233C81', 256)
  const [spiralTex] = useMatcapTexture('1C1810_352F23_2B2C1C_2B2C24', 256)
  const [panelTex] = useMatcapTexture('346088_6ABED7_56A0C5_4E91B8', 256)
  const [digitTex] = useMatcapTexture('385264_A1D3E2_86ADC1_6E94A8', 256)
  const [buttonTex] = useMatcapTexture('5C2E0C_C36924_9F4F14_834114', 256)
  const [eggTex] = useMatcapTexture('855D08_DAC31B_BF9B0C_AF860C', 256)

  useEffect(() => {
    ([
      [outsideMat, outsideTex],
      [glassMat, glassTex],
      [insideMat, insideTex],
      [spiralMat, spiralTex],
      [panelMat, panelTex],
      [digitMat, digitTex],
      [buttonMat, buttonTex],
      [eggMat, eggTex],
    ] as [MeshMatcapMaterial, Texture][]).forEach(([mat, tex]) => {
      tex.colorSpace = SRGBColorSpace
      tex.needsUpdate = true
      mat.matcap = tex
      mat.needsUpdate = true
    })
  }, [buttonTex, digitTex, eggTex, glassTex, insideTex, outsideTex, panelTex, spiralTex])
}
