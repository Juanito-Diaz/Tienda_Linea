# 🛍️ Tienda en Línea · E-Commerce Multirrubro con Rastreo en Tiempo Real

Plataforma moderna de comercio electrónico desarrollada con **React**, **Vite** y **Tailwind CSS**. Integra una experiencia de compra fluida en tres verticales especializadas (Belleza, Ropa Deportiva y Café de Especialidad) junto con un simulador interactivo de logística y **rastreo GPS de envíos en tiempo real** mediante mapas interactivos.

---

## 🚀 Características Principales

### 🛒 Experiencia de Compra & Catálogo
- **3 Categorías Especializadas:**
  - 💄 **Maquillaje y Belleza:** Cosmética de gama media y alta, sueros, paletas de sombras y fijadores con trazabilidad.
  - 👟 **Ropa Deportiva:** Calzado de running, prendas técnicas de compresión y rompevientos ultraligeros.
  - ☕ **Café de Especialidad:** Granos de origen selecto (Chiapas, Veracruz, Oaxaca, Guerrero) y métodos artesanales (V60, Chemex, molinos cónicos y básculas digitales).
- **Filtros Avanzados y Búsqueda en Vivo:** Filtrado multifactorial por rango de precio, tueste, tipo de molienda, talla, gama, género y ofertas.
- **Vista Rápida (*Quick View*):** Modal para previsualizar detalles del producto, variantes de color/talla y añadir al carrito sin salir del catálogo.
- **Carrito de Compras Reactivo:** Gestión de unidades, cálculo automático de envío, desglose de impuestos y descuentos por promociones.

### 📍 Checkout & Logística Interactiva
- **Proceso de Compra en Pasos:**
  1. **Revisión de Carrito:** Validación de inventario y variantes.
  2. **Datos de Envío:** Integración de **MapPicker** con geolocalización y selector de mapa interactivo para fijar el punto exacto de entrega.
  3. **Métodos de Pago:** Simulación de pagos con tarjeta de crédito/débito, transferencia bancaria (SPEI) y pasarela propia.
  4. **Comprobante y Confirmación:** Generación de número de orden, resumen detallado y formato imprimible.
- **Rastreo GPS en Tiempo Real:** 
  - Simulación interactiva con **Leaflet** que muestra la ruta de la camioneta de reparto desde el centro de distribución (*Hub*) hasta el domicilio del cliente.
  - Estado del pedido por fases (Preparación, En tránsito, En ruta final, Entregado).
  - Módulo de reporte y gestión de incidencias en entrega.

### 🎨 Diseño y UX
- Diseño 100% responsivo adaptado para dispositivos móviles, tablets y pantallas de escritorio.
- Modo visual premium con paleta de colores institucional en tonos azul marino (`navy`) y dorado (`gold`).
- Componente `SmartImage` con carga diferida (*lazy loading*) y fallback visual elegante en caso de problemas de conexión.
- Notificaciones Toast personalizadas para confirmaciones de acción.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend Core** | React 19, JavaScript (ESNext), HTML5, CSS3 |
| **Tooling & Build** | Vite 8, Rolldown / LightningCSS |
| **Estilos & UI** | Tailwind CSS v4, Lucide React (iconografía) |
| **Enrutamiento** | React Router DOM v7 |
| **Mapas & Geolocalización** | Leaflet, React Leaflet |
| **Estado Global** | React Context API (`StoreContext`, `AuthContext`, `ToastContext`, `QuickViewContext`) |

---

## 📂 Estructura del Proyecto

```text
lily_proyecto/
├── public/                 # Archivos estáticos públicos
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── checkout/       # Pasos del checkout (Cart, Shipping, Payment, Confirmation)
│   │   ├── Navbar.jsx      # Barra de navegación principal y búsqueda
│   │   ├── Footer.jsx      # Pie de página con enlaces y políticas
│   │   ├── ProductCard.jsx # Tarjeta individual de producto con animaciones
│   │   ├── QuickViewModal.jsx # Modal de vista rápida
│   │   ├── MapPicker.jsx   # Selector interactivo de coordenadas de entrega
│   │   ├── IncidentDialog.jsx # Reporte de incidencias en reparto
│   │   └── ui.jsx          # Componentes atómicos (Logo, SmartImage, Stars, Badges)
│   ├── context/            # Proveedores de estado global (Store, Auth, Toast, QuickView)
│   ├── data/
│   │   └── products.js     # Catálogo de productos, categorías, imágenes y slides
│   ├── lib/                # Utilidades de geolocalización, mapa y rastreo
│   ├── pages/              # Vistas principales (Home, Catalog, ProductDetail, Tracking, Orders, Checkout, About, Help)
│   ├── App.jsx             # Configuración de rutas principales
│   ├── main.jsx            # Punto de entrada de la aplicación
│   └── index.css           # Estilos base y configuración de Tailwind
├── index.html              # Plantilla HTML raíz
├── package.json            # Dependencias y scripts de ejecución
└── vite.config.js          # Configuración de Vite y plugins
```

---

## ⚙️ Instalación y Puesta en Marcha

Sigue estos pasos para clonar y ejecutar el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`.

### 4. Compilar para producción
```bash
npm run build
```

Los archivos optimizados y minificados se generarán en la carpeta `dist/`.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Puedes utilizarlo libremente con fines educativos o comerciales.
