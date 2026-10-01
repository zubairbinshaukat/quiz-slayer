/** Minimal typings for the parts of `qrcode` the app uses (its @types pull in Node). */
declare module 'qrcode' {
  export interface QRCodeBitMatrix {
    size: number
    get(row: number, col: number): number | boolean
  }
  export interface QRCodeSymbol {
    modules: QRCodeBitMatrix
    version: number
  }
  export function create(text: string, options?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }): QRCodeSymbol
  const qrcode: { create: typeof create }
  export default qrcode
}
