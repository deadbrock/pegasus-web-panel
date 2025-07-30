'use client'

import React, { useEffect, useRef, useState } from 'react'
import { VeiculoRastreamento } from '@/types/rastreamento'

interface MapaRastreamentoProps {
  veiculos: VeiculoRastreamento[]
  veiculoSelecionado?: VeiculoRastreamento | null
  onVeiculoSelect?: (veiculo: VeiculoRastreamento) => void
}

export function MapaRastreamento({ veiculos, veiculoSelecionado, onVeiculoSelect }: MapaRastreamentoProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [L, setL] = useState<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  // Carregar Leaflet dinamicamente no lado do cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Importar CSS do Leaflet
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // Importar Leaflet JS
      import('leaflet').then((leaflet) => {
        setL(leaflet.default)
      })
    }
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (L && mapRef.current && !map) {
      // Fix para ícones do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const mapInstance = L.map(mapRef.current).setView([-14.235, -51.9253], 6)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance)

      setMap(mapInstance)
    }
  }, [L, map])

  // Função para criar ícone personalizado baseado no status
  const createCustomIcon = (veiculo: VeiculoRastreamento) => {
    if (!L) return null

    const colors = {
      'Ativo': '#10b981', // Verde
      'Em Rota': '#3b82f6', // Azul
      'Parado': '#f59e0b', // Amarelo
      'Offline': '#ef4444', // Vermelho
    }

    const color = colors[veiculo.status] || '#6b7280'
    const isSelected = veiculoSelecionado?.id === veiculo.id

    const svgIcon = `
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="${isSelected ? '#000' : '#fff'}" stroke-width="${isSelected ? '3' : '2'}"/>
        <text x="15" y="19" text-anchor="middle" fill="white" font-size="10" font-weight="bold">🚗</text>
      </svg>
    `

    return L.divIcon({
      html: svgIcon,
      className: 'custom-vehicle-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  // Atualizar marcadores quando veículos mudarem
  useEffect(() => {
    if (!map || !L) return

    // Limpar marcadores existentes
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker)
    })
    markersRef.current.clear()

    // Adicionar novos marcadores
    veiculos.forEach((veiculo) => {
      if (veiculo.latitude && veiculo.longitude) {
        const icon = createCustomIcon(veiculo)
        if (!icon) return

        const marker = L.marker([veiculo.latitude, veiculo.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-lg mb-2">${veiculo.placa}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                <p><strong>Motorista:</strong> ${veiculo.motorista?.nome || 'N/A'}</p>
                <p><strong>Status:</strong> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style="background-color: ${getStatusBgColor(veiculo.status)}; color: white;">${veiculo.status}</span></p>
                <p><strong>Velocidade:</strong> ${veiculo.velocidade || 0} km/h</p>
                <p><strong>Última atualização:</strong> ${veiculo.ultima_atualizacao ? new Date(veiculo.ultima_atualizacao).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          `)

        // Adicionar evento de clique
        marker.on('click', () => {
          onVeiculoSelect?.(veiculo)
        })

        markersRef.current.set(veiculo.id, marker)
      }
    })

    // Ajustar zoom para mostrar todos os veículos
    if (veiculos.length > 0) {
      const validPositions = veiculos
        .filter(v => v.latitude && v.longitude)
        .map(v => [v.latitude!, v.longitude!] as [number, number])
      
      if (validPositions.length > 0) {
        const group = L.featureGroup(Array.from(markersRef.current.values()))
        if (validPositions.length === 1) {
          map.setView(validPositions[0], 13)
        } else {
          map.fitBounds(group.getBounds().pad(0.1))
        }
      }
    }
  }, [map, L, veiculos, veiculoSelecionado, onVeiculoSelect])

  // Centralizar no veículo selecionado
  useEffect(() => {
    if (map && veiculoSelecionado && veiculoSelecionado.latitude && veiculoSelecionado.longitude) {
      map.setView([veiculoSelecionado.latitude, veiculoSelecionado.longitude], 15)
    }
  }, [map, veiculoSelecionado])

  const getStatusBgColor = (status: VeiculoRastreamento['status']) => {
    switch (status) {
      case 'Ativo': return '#10b981'
      case 'Em Rota': return '#3b82f6'
      case 'Parado': return '#f59e0b'
      case 'Offline': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Legenda */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Status dos Veículos</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Ativo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Em Rota</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Parado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* Informações do veículo selecionado */}
      {veiculoSelecionado && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-sm">
          <h4 className="font-semibold text-lg mb-2">{veiculoSelecionado.placa}</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Modelo:</strong> {veiculoSelecionado.modelo}</p>
            <p><strong>Motorista:</strong> {veiculoSelecionado.motorista?.nome || 'N/A'}</p>
            <p><strong>Velocidade:</strong> {veiculoSelecionado.velocidade || 0} km/h</p>
            <p><strong>Status:</strong> 
              <span 
                className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getStatusBgColor(veiculoSelecionado.status) }}
              >
                {veiculoSelecionado.status}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 