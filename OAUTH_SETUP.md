# Configuración OAuth para Cifra

## Problema Identificado

Google OAuth está redirigiendo a `localhost:3000` en lugar de tu dominio de producción `cifrafinance.vercel.app`.

## Solución Paso a Paso

### 1. Configurar Supabase Auth URLs

Ve a tu dashboard de Supabase:

1. Ve a **Authentication** > **URL Configuration**
2. Agrega las siguientes URLs:

**Site URL:**

```
https://cifrafinance.vercel.app
```

**Redirect URLs:**

```
https://cifrafinance.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 2. Configurar Google OAuth Console

Ve a [Google Cloud Console](https://console.cloud.google.com/):

1. Ve a **APIs & Services** > **Credentials**
2. Encuentra tu OAuth 2.0 Client ID
3. Agrega las siguientes URLs autorizadas:

**JavaScript origins:**

```
https://cifrafinance.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**

```
https://giukhgjovkkbxaegjyai.supabase.co/auth/v1/callback
```

### 3. Variables de Entorno

Agrega a tu `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://cifrafinance.vercel.app
```

### 4. Desplegar en Vercel

Asegúrate de que las variables de entorno estén configuradas en Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Agrega:
   - `NEXT_PUBLIC_SITE_URL` = `https://cifrafinance.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave anónima de Supabase

### 5. Debugging

He agregado logs de debugging. Abre la consola del navegador para ver:

- Qué URL se está usando para el redirect
- Si el código OAuth está llegando correctamente
- El flujo de redirección

## Verificación

Después de hacer estos cambios:

1. Despliega la aplicación
2. Prueba el login desde `cifrafinance.vercel.app`
3. Verifica en la consola del navegador que las URLs sean correctas
