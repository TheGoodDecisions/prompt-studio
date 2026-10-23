# Jacob’s Apps — inicio minimalista (V4)

Catálogo PWA instalable mediante Safari «Compartir → Añadir a pantalla de inicio».

- Interfaz negra, iconos cuadrados de vidrio cromado, nombre debajo y ficha explicativa al pulsar.
- «Gestionar» incluye añadir, importar, exportar y cambiar PIN.
- Selector local de símbolos y emojis personalizables; no requiere servicios externos.
- Icono oficial de carpeta cromada aportado por el usuario, en `brand-logo.png` y manifest.
- Los enlaces se guardan en `localStorage` de **cada navegador**. Esta versión conserva la clave previa `jacobs-apps:chrome:v2`.
- Protección por PIN de 6 cifras *local*, con PBKDF2 y bloqueo por inactividad o cuando se abandona la web. **No sustituye autenticación del servidor ni cifra los enlaces.** El sitio está publicado en GitHub Pages y su código es público.
- La primera visita pide crear el PIN y confirmarlo. Si se olvida no hay recuperación sin borrar los datos del sitio; exporta antes la biblioteca para tener copia.
