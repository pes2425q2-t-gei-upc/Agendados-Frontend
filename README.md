# Agendados-Frontend

Frontend de la aplicación **Agendados**, desarrollada con React Native y Expo, orientada a la gestión de agendas, eventos y contactos. Este proyecto está diseñado para ofrecer una experiencia móvil moderna y eficiente, integrando mapas, localización y funcionalidades sociales.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Scripts Útiles](#scripts-útiles)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Descripción

Este repositorio contiene el frontend de Agendados, una aplicación móvil multiplataforma para la gestión de eventos y contactos, con integración de mapas y funcionalidades colaborativas. El proyecto está construido con React Native y Expo, permitiendo un desarrollo ágil y despliegue sencillo en dispositivos iOS y Android.

## Tecnologías

- **React Native** (Expo)
- **TypeScript**
- **Babel**
- **Metro Bundler**
- **React Navigation**
- **react-native-reanimated**
- **react-native-svg** (soporte SVG personalizado)
- **EAS (Expo Application Services)**
- **ESLint, Prettier** (formateo y calidad de código)

## Estructura del Proyecto

```
Agendados-Frontend/
├── app/                  # Pantallas y lógica principal de la app
├── components/           # Componentes reutilizables de UI
├── assets/               # Imágenes, iconos y otros recursos estáticos
├── styles/               # Archivos de estilos globales y temáticos
├── localization/         # Archivos de internacionalización (i18n)
├── types/                # Definiciones TypeScript personalizadas
├── android/              # Configuración específica para Android
├── ios/                  # Configuración específica para iOS
├── .github/              # Workflows y configuración de GitHub Actions
├── package.json          # Dependencias y scripts
├── app.json              # Configuración de Expo
├── tsconfig.json         # Configuración de TypeScript
├── babel.config.js       # Configuración de Babel
├── metro.config.js       # Configuración de Metro Bundler
└── README.md             # Este archivo
```

## Instalación

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/tu-usuario/Agendados-Frontend.git
   cd Agendados-Frontend
   ```

2. **Instala las dependencias:**
   ```sh
   yarn install
   # o
   npm install
   ```

3. **Instala Expo CLI globalmente (si no lo tienes):**
   ```sh
   npm install -g expo-cli
   ```

## Ejecución

Para iniciar la app en modo desarrollo:

```sh
expo start
```

Esto abrirá Metro Bundler y podrás lanzar la app en un emulador Android/iOS o en tu dispositivo físico usando la app de Expo Go.

## Scripts Útiles

- `yarn start` / `npm start`: Inicia el servidor de desarrollo de Expo.
- `yarn android`: Ejecuta la app en un emulador o dispositivo Android.
- `yarn ios`: Ejecuta la app en un simulador iOS (solo Mac).
- `yarn lint`: Ejecuta ESLint para analizar la calidad del código.
- `yarn build`: Construye el proyecto para producción (usando EAS).

## Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request siguiendo las buenas prácticas. Asegúrate de seguir las reglas de formato y pasar los linters antes de enviar código.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
