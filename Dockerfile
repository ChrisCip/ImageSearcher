FROM node:18

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar archivos del backend y configuración
COPY BackEnd/ ./BackEnd/
COPY .env ./

# Exponer el puerto que usa tu aplicación (definido en server.js línea 372)
EXPOSE 3000

# Comando para iniciar el servidor en modo producción
CMD ["npm", "run", "prod"] 