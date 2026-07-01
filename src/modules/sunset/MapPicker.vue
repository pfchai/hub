<template>
  <div ref="mapContainer" class="map-picker" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
})

const emit = defineEmits(['update:coord'])

const mapContainer = ref(null)
let map = null
let marker = null

onMounted(() => {
  map = L.map(mapContainer.value, {
    center: [props.lat, props.lng],
    zoom: 9,
    zoomControl: true,
    attributionControl: false,
  })

  // 高德瓦片 — 无需额外 API Key
  L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    { subdomains: '1234', maxZoom: 18 },
  ).addTo(map)

  marker = L.circleMarker([props.lat, props.lng], {
    radius: 8,
    fillColor: '#e07b5a',
    color: '#fff',
    weight: 2,
    fillOpacity: 1,
  }).addTo(map)

  // 点击地图 → 移动标记 + 更新坐标
  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    marker.setLatLng([lat, lng])
    emit('update:coord', { latitude: lat, longitude: lng })
  })
})

// 外部坐标变化 → 同步地图视图
watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (map && marker) {
      map.setView([lat, lng], map.getZoom(), { animate: false })
      marker.setLatLng([lat, lng])
    }
  },
)

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-picker {
  width: 100%;
  height: 200px;
  border-radius: var(--radius, 8px);
  border: 1px solid var(--border, #e7e5e4);
  overflow: hidden;
  margin-bottom: 16px;
}
</style>
