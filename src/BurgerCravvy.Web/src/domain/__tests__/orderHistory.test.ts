import { describe, expect, it } from 'vitest'
import type { Order, OrderStatus } from '../order'
import { countActive, HISTORY_LIMIT, rememberCode, sortHistory, summarizeItems } from '../orderHistory'

const order = (code: string, status: OrderStatus, createdAtUtc: string): Order => ({
  code,
  customerName: 'Ana',
  status,
  statusLabel: status,
  createdAtUtc,
  updatedAtUtc: null,
  total: 0,
  items: [],
})

describe('historial de pedidos', () => {
  it('pone el último pedido arriba, sin repetidos y en mayúsculas', () => {
    expect(rememberCode(['BC-1', 'BC-2'], ' bc-2 ')).toEqual(['BC-2', 'BC-1'])
    expect(rememberCode([], 'BC-9')).toEqual(['BC-9'])
    expect(rememberCode(['BC-1'], '  ')).toEqual(['BC-1'])
  })

  it(`recuerda como máximo ${HISTORY_LIMIT} pedidos`, () => {
    const many = Array.from({ length: HISTORY_LIMIT }, (_, i) => `BC-${i}`)
    const next = rememberCode(many, 'BC-NUEVO')
    expect(next).toHaveLength(HISTORY_LIMIT)
    expect(next[0]).toBe('BC-NUEVO')
    expect(next).not.toContain(`BC-${HISTORY_LIMIT - 1}`)
  })

  it('muestra primero los pedidos en curso y después los terminados, del más nuevo al más viejo', () => {
    const sorted = sortHistory([
      order('entregado-nuevo', 'Delivered', '2026-11-20T12:00:00Z'),
      order('pendiente-viejo', 'Pending', '2026-11-18T12:00:00Z'),
      order('cancelado-viejo', 'Cancelled', '2026-11-17T12:00:00Z'),
      order('listo-nuevo', 'Ready', '2026-11-19T12:00:00Z'),
    ])
    expect(sorted.map((o) => o.code)).toEqual(['listo-nuevo', 'pendiente-viejo', 'entregado-nuevo', 'cancelado-viejo'])
  })

  it('cuenta solo los pedidos que no se han entregado ni cancelado', () => {
    const orders = [order('a', 'Pending', ''), order('b', 'Preparing', ''), order('c', 'Delivered', ''), order('d', 'Cancelled', '')]
    expect(countActive(orders)).toBe(2)
  })

  it('resume los productos del pedido', () => {
    const o = order('a', 'Pending', '')
    o.items = [
      { productName: 'Classic Cravvy', unitPrice: 450, quantity: 2, subtotal: 900 },
      { productName: 'Papas', unitPrice: 150, quantity: 1, subtotal: 150 },
    ]
    expect(summarizeItems(o)).toBe('2× Classic Cravvy, 1× Papas')
  })
})
