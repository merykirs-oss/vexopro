# CONTEXTO VEXOPRO — Estado del proyecto

## Estructura de archivos en GitHub (merykirs-oss/vexopro)
- `index.html` → Landing comercial (puerta de entrada pública)
- `app.html` → CRM completo (login + sistema)
- `vexpro_suscripcion.html` → Página de plan/precio
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` → PWA assets

## Copia de trabajo local
- CRM: `/home/claude/crm_celulares.html`
- Landing: `/home/claude/landing/inicio.html`
- Plan: `/home/claude/landing/vexpro_suscripcion.html`

---

## El producto: VexoPRO
CRM single-file para revendedores de tecnología argentinos (celulares, Mac, iPad, etc.)
- **Stack**: Firebase Realtime DB + Firebase Auth + vanilla HTML/CSS/JS, PWA instalable
- **Precio**: USD 50/mes — pago solo por USDT o transferencia bancaria
- **Trial**: 5 días gratis, sin tarjeta
- **URL pública**: merykirs-oss.github.io/vexopro

## Base de datos Firebase — estructura
```
negocios/{ownerUid}/
  compras/     ventas/     clientes/    garantias/
  tecnicos/    reparaciones/  pagos/   pagosProveedores/
  proveedores/ locales/    caja/       costos/    roles/

usuarios/{uid}          → dueños (sin campo role) o empleados (role:'employee')
empleados/{uid}         → {nombre, email, rolId, ownerUid, negocioNombre, activo, creadoEn}
```

## Variables globales clave
```js
currentUser         // Firebase Auth user
currentUserRole     // 'owner' | 'employee'
ownerUid            // uid del dueño (igual para dueño y empleados)
currentUserPermisos // {modulos:{}, escritura:{}, locales:[]}
function dbRef(p)   // ref(db, 'negocios/'+ownerUid+'/'+p)
function tienePermiso(modulo)
function puedeEscribir(modulo)
function localPermitido(localId)
```

---

## Módulos del CRM implementados

### Sidebar (en orden)
**Principal**: Inicio, Compras, Ventas, Stock
**Clientes**: Clientes, Cta. Corriente
**Servicio**: Garantías, Técnicos
**Finanzas**: Caja, Costos
**Puntos de Venta**: (dinámicos por local)
**Análisis**: Informes
**Negocio**: 👤 Equipo (solo dueños, `nav-sep-equipo` + `nav-equipo`)

### Módulo Equipo (multi-usuario)
- Solo visible para `currentUserRole === 'owner'`
- Layout: 2 columnas lado a lado (Roles izquierda / Usuarios derecha)
- **Roles**: nombre + checkboxes de 13 módulos (ver/editar) + selector de locales
- **Usuarios**: crear con email+pass+rol → Firebase crea cuenta + guarda en `empleados/{uid}`
- Empleados al login: sistema detecta `role:'employee'` → carga permisos del rol → filtra sidebar y locales
- **Bug conocido**: al crear empleado Firebase autentica con esa cuenta temporalmente (limitación del SDK cliente)

### Compras — WIZARD 4 pasos
Modal `modal-wizard-compra`, abre con botón `btn-abrir-wizard-compra`
- Paso 1: Proveedor (fecha, proveedor, ref, local, fecha entrega, estado)
- Paso 2: Equipos (categoría + items, IDs: `c-items-container`, `c-cat-selector`)
- Paso 3: Pago al proveedor (total + métodos, IDs: `c-metodos-container`)
- Paso 4: Confirmar + guardar → cierra wizard 1.2s después
- IDs preservados: `c-fecha`, `c-proveedor`, `c-ref`, `c-local`, `c-fecha-entrega`, `c-estado-entrega`, `c-total`, `c-alert`
- JS: `abrirWizardCompra`, `cerrarWizardCompra`, `wizCompraGoTo`, `wizCompraMove`, `renderCwizResumen`

### Ventas — WIZARD 4 pasos (ya existía antes)
Modal `modal-wizard-venta`

### Garantías
- Código: G0001, G0002...
- Certificado PDF via jsPDF
- Verificador de vigencia
- `CATEGORIAS_CON_GARANTIA = ['iphone','ipad','mac','watch']`
- Días configurables globalmente

### Puntos de Venta (multi-local)
- Creados en `negocios/{ownerUid}/locales/`
- Sidebar dinámico filtrado por `localPermitido(k)` para empleados
- `nav-gestion-locales` solo visible para dueños

---

## Landing (index.html) — secciones en orden
1. Nav: logo (→index.html), "Iniciar sesión" (→app.html), "VER PLAN" (→vexpro_suscripcion.html)
2. Hero: "Todo tu negocio. Un solo sistema. Control total." + "Empezar prueba gratis →" (→app.html)
3. Banda verde: 4 checkmarks de confianza
4. 3 pills: Caja multimoneda / Métodos de pago combinados / Caja automática
5. Números: <1 min / 0 planillas / 100% tiempo real / 5 días
6. Sección "Tu negocio en el bolsillo" (acceso desde cualquier dispositivo + app en celu)
7. Feature 1: Ventas — "Registrá una venta en menos de un minuto"
8. Feature 2: Garantías — certificados PDF con código
9. Feature 3: Informes y métricas
10. Grid 9 módulos
11. Seguridad: banner verde (Firebase) + 6 cards
12. Quote/frase
13. CTA final verde: "EMPEZAR SUSCRIPCIÓN GRATIS" (→app.html)
14. Footer

## Página de Plan (vexpro_suscripcion.html) — secciones en orden
1. Nav: logo (→index.html), "Iniciar sesión" (→app.html), "Empezar gratis" (→app.html)
2. Botón "✕ Volver al sistema" (aparece solo si ?from=app en URL)
3. Hero: "Un solo plan. Todo incluido."
4. Tarjeta precio: USD 50/mes con lista de 12 features
5. CTA: "EMPEZAR SUSCRIPCIÓN GRATIS" (→app.html)
6. Formas de pago del PLAN: ₮ USDT + 🏦 Transferencia bancaria (NO MercadoPago, NO efectivo)
7. Highlights: Caja multimoneda / Métodos combinados / App en celu
8. Grid 9 módulos
9. Seguridad: banner verde + 6 cards
10. FAQ: 9 preguntas con acordeón JS
11. CTA final verde

## app.html (CRM) — pantallas de login/registro
- Logo VexoPRO clickeable → `index.html`
- Botón "← Volver al inicio" fijo arriba izquierda → `index.html`
- En login Y en registro

---

## CSS del CRM — variables principales
```css
:root{
  --bg:#ffffff; --surface:#ffffff; --surface2:#f2faf6; --surface3:#e8f5ee;
  --border:#c3e6d3; --accent:#2d7a4f; --accent-dim:rgba(45,122,79,0.10);
  --red:#e03131; --yellow:#e67700; --blue:#2d7a4f; --purple:#1a5c38;
  --text:#1a2e24; --text2:#4a6358; --text3:#7a9e8e;
  --mono:'JetBrains Mono',monospace; --sans:'Inter',sans-serif;
  --sidebar:230px; --radius:10px;
}
```

## Clases CSS del CRM
- `.page` → `display:none` | `.page.active` → `display:block`
- `.form-card` → tarjeta con padding 24px, borde verde claro
- `.table-card` → tarjeta de tabla con overflow-x:auto
- `.form-group label` → tiene `min-height:28px` (OJO: causa espacios en blanco si se usa en módulo Equipo)
- `.btn.btn-primary` → verde #2d7a4f
- `.modal-overlay` → fondo oscuro semitransparente
- `.modal` → tarjeta modal centrada
- **IMPORTANTE**: El módulo Equipo usa estilos INLINE en vez de clases para evitar conflictos con `.form-group`

## Funciones JS clave del CRM
```js
$(id)                    // document.getElementById
dbRef(path)              // ref(db, 'negocios/'+ownerUid+'/'+path)
showPage(name)           // navega a página (incluye 'equipo' → renderiza módulo)
showPageEquipo()         // alternativa directa para módulo equipo
openModal(id) / closeModal(id)
showAlert(containerId, msg, isSuccess)
today()                  // fecha de hoy YYYY-MM-DD
fmtD(fecha)              // formatea fecha para mostrar
push/set/update/remove   // Firebase RTDB functions (importadas)
```

---

## Pendientes / NO implementados todavía
- Buscador transversal (clientes, ventas, garantías por DNI/nombre/equipo)
- Escáner IMEI por cámara
- Export CSV (función `exportCSV` existe, sin UI)
- Firebase Admin SDK para crear empleados sin perder sesión del dueño

## Nota importante — showPage('equipo')
El botón `nav-equipo` tiene `data-page="equipo"`. El listener genérico de navegación llama `showPage('equipo')`. Esta función tiene un handler específico para 'equipo' que llama: `renderErModulos(); renderErLocales(); renderRoles(); renderEquipo();`
