'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VeiculoMapa {
  id: string | number
  placa?: string
  modelo?: string
  marca?: string
  status?: string
  latitude?: number
  longitude?: number
  motorista?: string
}

interface TrackingMapProps {
  selectedVehicle?: VeiculoMapa | null
  isRealTime: boolean
  data?: VeiculoMapa[]
  /** Altura do mapa em px (padrão 480) */
  height?: number
}

// ─── Cores por status ─────────────────────────────────────────────────────────

function statusColor(status?: string): string {
  switch (status) {
    case 'Em Rota':    return '#3b82f6'  // blue
    case 'Ativo':      return '#22c55e'  // green
    case 'Manutenção': return '#f97316'  // orange
    case 'Inativo':    return '#94a3b8'  // slate
    default:           return '#6366f1'  // indigo
  }
}

// Centro padrão: Brasil (São Paulo)
const DEFAULT_LAT  = -23.5505
const DEFAULT_LNG  = -46.6333
const DEFAULT_ZOOM = 11

// ─── Componente principal ─────────────────────────────────────────────────────

export function TrackingMap({ selectedVehicle, isRealTime, data = [], height = 480 }: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef       = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef   = useRef<Map<string | number, any>>(new Map())

  // ── Inicializa o mapa Leaflet uma única vez ──────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    // Import dinâmico para evitar SSR crash
    import('leaflet').then((L) => {
      // Corrigir ícones padrão (problema comum com bundlers)
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center:          [DEFAULT_LAT, DEFAULT_LNG],
        zoom:            DEFAULT_ZOOM,
        zoomControl:     true,
        attributionControl: true,
      })

      // Tile layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      return map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current.clear()
      }
    }
  }, [])

  // ── Atualiza marcadores quando `data` muda ───────────────────────────
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      const map = mapRef.current
      const existingIds = new Set(markersRef.current.keys())

      // Veículos com coordenadas válidas
      const comCoordenadas = data.filter(
        (v) => typeof v.latitude === 'number' && typeof v.longitude === 'number'
      )

      comCoordenadas.forEach((v) => {
        const lat = v.latitude!
        const lng = v.longitude!
        const cor = statusColor(v.status)

        // SVG circular como ícone
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="${cor}" stroke="white" stroke-width="3"/>
            <text x="18" y="23" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="sans-serif">
              ${v.placa ? v.placa.slice(-3) : '?'}
            </text>
          </svg>`

        const icon = L.divIcon({
          html:        svg,
          className:   '',
          iconSize:    [36, 36],
          iconAnchor:  [18, 18],
          popupAnchor: [0, -20],
        })

        const popup = `
          <div style="min-width:160px;font-family:sans-serif;font-size:13px">
            <p style="font-weight:700;margin:0 0 4px">${v.placa ?? 'Veículo'}</p>
            ${v.marca || v.modelo ? `<p style="color:#64748b;margin:0 0 2px">${[v.marca, v.modelo].filter(Boolean).join(' ')}</p>` : ''}
            ${v.motorista ? `<p style="color:#64748b;margin:0 0 2px">Motorista: ${v.motorista}</p>` : ''}
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${cor};color:#fff;font-size:11px;font-weight:600;margin-top:4px">${v.status ?? 'Desconhecido'}</span>
            <p style="color:#94a3b8;font-size:11px;margin:4px 0 0">
              ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </p>
          </div>`

        if (markersRef.current.has(v.id)) {
          const marker = markersRef.current.get(v.id)
          marker.setLatLng([lat, lng])
          marker.setIcon(icon)
          marker.setPopupContent(popup)
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(popup)
          markersRef.current.set(v.id, marker)
        }
        existingIds.delete(v.id)
      })

      // Remover marcadores de veículos que saíram
      existingIds.forEach((id) => {
        markersRef.current.get(id)?.remove()
        markersRef.current.delete(id)
      })

      // Centralizar no veículo selecionado ou no conjunto
      if (selectedVehicle?.latitude && selectedVehicle?.longitude) {
        map.flyTo([selectedVehicle.latitude, selectedVehicle.longitude], 14, { duration: 1 })
        markersRef.current.get(selectedVehicle.id)?.openPopup()
      } else if (comCoordenadas.length > 0) {
        const bounds = L.latLngBounds(comCoordenadas.map((v) => [v.latitude!, v.longitude!]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    })
  }, [data, selectedVehicle])

  // ── CSS do Leaflet via link no head (evita import direto) ────────────
  useEffect(() => {
    const id = 'leaflet-css'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id   = id
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
  }, [])

  const semCoordenadas = data.filter((v) => !v.latitude || !v.longitude)

  return (
    <div className="space-y-2">
      {/* Mapa */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Indicador realtime */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-slate-200 text-xs font-medium">
          <span className={cn(
            'w-2 h-2 rounded-full',
            isRealTime ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
          )} />
          {isRealTime ? 'Tempo Real' : 'Pausado'}
        </div>

        {/* Legenda */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-slate-200 text-xs space-y-1">
          <p className="font-semibold text-slate-700 mb-1">Legenda</p>
          {[
            { label: 'Em Rota',    color: '#3b82f6' },
            { label: 'Ativo',      color: '#22c55e' },
            { label: 'Manutenção', color: '#f97316' },
            { label: 'Inativo',    color: '#94a3b8' },
          ].map(({ label, color }) => {
            const count = data.filter((v) => v.status === label).length
            return (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-slate-600">{label}</span>
                <span className="ml-auto font-semibold text-slate-800">{count}</span>
              </div>
            )
          })}
          <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between">
            <span className="text-slate-500">Total</span>
            <span className="font-semibold">{data.length}</span>
          </div>
        </div>

        {/* Container do mapa */}
        <div ref={containerRef} style={{ height, width: '100%' }} />

        {/* Estado vazio — sem veículos */}
        {data.length === 0 && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="font-semibold text-slate-600">Nenhum veículo no mapa</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Cadastre veículos com coordenadas GPS para visualizá-los aqui.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Aviso: veículos sem coordenadas */}
      {semCoordenadas.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>
            <strong>{semCoordenadas.length}</strong> veículo{semCoordenadas.length > 1 ? 's' : ''} sem coordenadas GPS:{' '}
            {semCoordenadas.map((v) => v.placa).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
