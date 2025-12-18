# Instrucciones para Personalizar el Sitio

## Agregar Imágenes desde Google Maps

### Paso 1: Obtener imágenes de Google Maps

1. Ve a [Google Maps - La Delfina Cabañas](https://www.google.com/maps/place/La+Delfina+Caba%C3%B1as/@-32.5868319,-60.843308,17z)
2. Haz clic en las fotos disponibles en el perfil del lugar
3. Descarga las imágenes que quieras usar
4. Optimiza las imágenes para web (recomendado: usar herramientas como TinyPNG o ImageOptim)

### Paso 2: Reemplazar imágenes en el HTML

#### Imagen del Hero (Sección principal)
Busca en `index.html` la línea con la clase `hero` y reemplaza la URL de la imagen:

```html
background: linear-gradient(...), url('TU_IMAGEN_AQUI.jpg') center/cover;
```

#### Imágenes de las Cabañas
Para cada cabaña, reemplaza el placeholder con una imagen real:

```html
<div class="cabana-image">
    <img src="ruta/a/tu/imagen.jpg" alt="Cabaña de Un Dormitorio" loading="lazy">
</div>
```

Luego actualiza el CSS para que la imagen se muestre correctamente:

```css
.cabana-image {
    background: none;
}

.cabana-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

### Paso 3: Crear carpeta de imágenes

1. Crea una carpeta `images` en la raíz del proyecto
2. Organiza las imágenes:
   - `images/hero.jpg` - Imagen principal
   - `images/cabana-un-dormitorio.jpg`
   - `images/cabana-dos-dormitorios.jpg`
   - `images/loft.jpg`
   - `images/servicios/` - Para imágenes de servicios

## Personalizar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #2c5530;      /* Color principal (verde oscuro) */
    --secondary-color: #4a7c59;   /* Color secundario */
    --accent-color: #6b9f7a;       /* Color de acento */
}
```

## Actualizar Información de Contacto

### Teléfono y WhatsApp
- En `index.html`: Busca `341 6061185` y reemplázalo si es necesario
- En `script.js`: Busca `543416061185` y actualiza el código de país si corresponde

### Email
- En `index.html`: Busca `reservas@ladelfinacabanas.com` y actualiza

## Agregar Testimonios Reales

Reemplaza los testimonios de ejemplo en `index.html` con testimonios reales de Google Maps o reseñas de huéspedes.

## Optimización SEO

### Meta Tags
Ya están configurados en el `<head>` del HTML. Puedes ajustar:
- `meta description`
- `meta keywords`
- `title`

### Imágenes
Asegúrate de agregar atributos `alt` descriptivos a todas las imágenes:

```html
<img src="imagen.jpg" alt="Cabaña de Un Dormitorio en La Delfina Cabañas, Oliveros">
```

## Google Maps Embed

El mapa ya está integrado con las coordenadas de La Delfina Cabañas. Si necesitas ajustar la vista, modifica los parámetros en el iframe:

```html
<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>
```

## Próximas Mejoras Sugeridas

1. **Sistema de Reservas Online**: Integrar un calendario de disponibilidad
2. **Galería de Fotos**: Crear una sección con más imágenes
3. **Blog**: Agregar sección de blog sobre turismo en la zona
4. **Google Analytics**: Para tracking de visitas
5. **Facebook Pixel**: Para remarketing
6. **Optimización de Performance**: 
   - Lazy loading de imágenes
   - Minificación de CSS/JS
   - CDN para recursos estáticos

## Notas Importantes

- Todas las imágenes deben estar optimizadas para web (máximo 200KB por imagen)
- El sitio es totalmente responsive, prueba en diferentes dispositivos
- Los formularios están conectados a WhatsApp para facilitar las consultas
- El sitio está optimizado para SEO con meta tags y estructura semántica

