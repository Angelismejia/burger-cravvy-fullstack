import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import type { Order } from '../../domain/order'
import type { Product } from '../../domain/product'
import { API_BASE_URL } from '../http/apiClient'

const HUB_URL = `${API_BASE_URL}/hubs/pedidos`
const RETRY_MS = 10_000

/** Eventos que emite OrdersHub y el tipo de dato de cada uno. */
export interface HubEvents {
  OrderCreated: Order
  OrderUpdated: Order
  ProductUpdated: Product
}

export type LiveStatus = 'connecting' | 'live' | 'offline'

interface ChannelOptions {
  /** JWT del empleado (solo para el grupo de cocina). */
  token?: string
  /** Se ejecuta tras conectar y tras cada reconexión: aquí se (re)unen los grupos. */
  onConnected?: (channel: RealtimeChannel) => Promise<void> | void
}

/**
 * Envoltorio de una conexión SignalR: reconexión automática, reintentos si el servidor
 * no está disponible al arrancar y estado observable para mostrar «En vivo».
 */
export class RealtimeChannel {
  private readonly conn: HubConnection
  private status: LiveStatus = 'connecting'
  private readonly statusListeners = new Set<(s: LiveStatus) => void>()
  private retryTimer?: ReturnType<typeof setTimeout>
  private started = false
  private stopped = false

  constructor(private readonly options: ChannelOptions = {}) {
    this.conn = new HubConnectionBuilder()
      .withUrl(HUB_URL, options.token ? { accessTokenFactory: () => options.token! } : {})
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build()
    this.conn.onreconnecting(() => this.setStatus('connecting'))
    this.conn.onreconnected(() => void this.connected())
    this.conn.onclose(() => {
      if (this.stopped) return
      this.setStatus('offline')
      this.scheduleRetry()
    })
  }

  /** Arranca la conexión (idempotente). */
  start() {
    if (this.started) return
    this.started = true
    void this.tryStart()
  }

  on<K extends keyof HubEvents>(event: K, handler: (payload: HubEvents[K]) => void): () => void {
    this.conn.on(event, handler)
    return () => this.conn.off(event, handler)
  }

  async invoke(method: string, ...args: unknown[]) {
    if (this.conn.state === HubConnectionState.Connected) await this.conn.invoke(method, ...args)
  }

  onStatus(listener: (s: LiveStatus) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.status)
    return () => this.statusListeners.delete(listener)
  }

  async stop() {
    this.stopped = true
    clearTimeout(this.retryTimer)
    await this.conn.stop().catch(() => undefined)
  }

  private async tryStart() {
    if (this.stopped) return
    this.setStatus('connecting')
    try {
      await this.conn.start()
      await this.connected()
    } catch {
      if (this.stopped) return
      this.setStatus('offline')
      this.scheduleRetry()
    }
  }

  private scheduleRetry() {
    clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(() => void this.tryStart(), RETRY_MS)
  }

  private async connected() {
    this.setStatus('live')
    try {
      await this.options.onConnected?.(this)
    } catch {
      /* si falla unirse a un grupo, el refresco de respaldo mantiene los datos al día */
    }
  }

  private setStatus(s: LiveStatus) {
    this.status = s
    this.statusListeners.forEach((l) => l(s))
  }
}
