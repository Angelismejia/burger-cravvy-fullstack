import { describe, expect, it } from 'vitest'
import { canCancel, isFinal, NEXT_ACTION, ORDER_FLOW } from '../order'

describe('pedido', () => {
  it('cada estado activo tiene un siguiente paso en orden', () => {
    expect(NEXT_ACTION.Pending?.action).toBe('preparar')
    expect(NEXT_ACTION.Preparing?.action).toBe('listo')
    expect(NEXT_ACTION.Ready?.action).toBe('entregar')
    expect(NEXT_ACTION.Delivered).toBeUndefined()
  })

  it('solo se cancela lo que aún no está listo (igual que en el backend)', () => {
    expect(canCancel('Pending')).toBe(true)
    expect(canCancel('Preparing')).toBe(true)
    expect(canCancel('Ready')).toBe(false)
    expect(canCancel('Delivered')).toBe(false)
  })

  it('entregado y cancelado son estados finales', () => {
    expect(isFinal('Delivered')).toBe(true)
    expect(isFinal('Cancelled')).toBe(true)
    expect(isFinal('Ready')).toBe(false)
  })

  it('la línea de tiempo del cliente sigue el orden del flujo', () => {
    expect(ORDER_FLOW.map((s) => s.status)).toEqual(['Pending', 'Preparing', 'Ready', 'Delivered'])
  })
})
