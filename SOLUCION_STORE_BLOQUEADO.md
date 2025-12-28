# Solución: "Your store is blocked"

## Problema
El mensaje "Your store is blocked" aparece cuando intentas acceder a los videos. Esto generalmente ocurre porque:

1. **Excediste el límite de almacenamiento gratuito** (1 GB)
2. **Problema de facturación** (si estás en plan de pago)
3. **El store está temporalmente bloqueado**

## Soluciones

### Opción 1: Actualizar el Plan de Vercel (Recomendado)

1. **Ve a Vercel Dashboard**
   - Accede a [vercel.com](https://vercel.com)
   - Ve a tu cuenta → Billing

2. **Actualiza tu plan**
   - El plan gratuito tiene límite de 1 GB
   - Puedes actualizar a Pro ($20/mes) que incluye más almacenamiento
   - O pagar solo por el almacenamiento adicional

3. **Desbloquea el store**
   - Después de actualizar, el store debería desbloquearse automáticamente
   - Si no, contacta a soporte de Vercel

### Opción 2: Liberar Espacio (Temporal)

Si no quieres actualizar el plan, puedes:

1. **Eliminar videos antiguos o duplicados**
   - Ve a Storage → Browser → videos/
   - Elimina archivos que no necesites

2. **Comprimir los videos**
   - Los videos grandes (80-300MB) ocupan mucho espacio
   - Considera comprimirlos antes de subirlos

### Opción 3: Usar Almacenamiento Alternativo

Si el problema persiste, podemos migrar los videos a:
- **AWS S3** (más económico para almacenamiento)
- **Cloudflare R2** (gratis hasta cierto límite)
- **Backblaze B2** (muy económico)

## Verificar el Estado del Store

1. Ve a Storage → tu store
2. Revisa la sección "Storage" en el overview
3. Verifica si muestra "1.25 GB / 1 GB" (excedido)
4. Revisa si hay avisos o mensajes de bloqueo

## Contactar Soporte

Si ninguna de las opciones funciona:
- Ve a [vercel.com/support](https://vercel.com/support)
- Explica que tu Blob Store está bloqueado
- Menciona que excediste el límite de almacenamiento

## Nota Importante

El plan gratuito de Vercel Blob Storage tiene:
- **1 GB de almacenamiento gratuito**
- **10 GB de transferencia de datos**
- Después de eso, se cobra por uso

Para un sitio con videos grandes, probablemente necesites actualizar el plan.

