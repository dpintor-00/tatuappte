# Usa una imagen oficial de Node.js ligera (versión 20 recomendada)
FROM node:22-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para aprovechar el caché de Docker
COPY package*.json ./

# Instala todas las dependencias (incluyendo devDependencies como vite y tsx)
RUN npm install --legacy-peer-deps

# Copia todo el código fuente al contenedor
COPY . .

# Construye la aplicación frontend (ejecuta "vite build")
RUN npm run build

# Expone el puerto en el que correrá tu servidor Express (usualmente 3000 o 8080)
EXPOSE 3000

# Inicia la aplicación ejecutando el script "start" (tsx server.ts)
CMD ["npm", "start"]