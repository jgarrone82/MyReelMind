import { Dictionary } from "../types";

export const dictionary: Dictionary = {
  app: {
    title: "MyReelMind",
    description: "Seguí tus películas y anime",
  },
  nav: {
    home: "Inicio",
    search: "Buscar",
    library: "Mi biblioteca",
    dashboard: "Panel",
  },
  search: {
    placeholder: "Buscar películas o anime...",
    noResults: "No se encontraron resultados",
    loading: "Buscando...",
  },
  media: {
    movie: "Película",
    tv: "Serie",
    anime: "Anime",
    status: {
      want_to_watch: "Quiero ver",
      watching: "Viendo",
      completed: "Completado",
      paused: "Pausado",
      dropped: "Abandonado",
    },
  },
  dashboard: {
    title: "Tu actividad",
    totalWatched: "Completados",
    totalHours: "Horas vistas",
    recentActivity: "Actividad reciente",
    noActivity: "No tenés actividad aún",
    ctaSearch: "Buscá algo para ver",
  },
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    loading: "Cargando...",
    error: "Error",
  },
  auth: {
    login: {
      title: "Iniciar sesión",
      email: "Email",
      password: "Contraseña",
      submit: "Iniciar sesión",
      loading: "Iniciando...",
      error: "Error al iniciar sesión",
      oauth: "O continuá con",
    },
    signup: {
      title: "Crear cuenta",
      email: "Email",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      submit: "Crear cuenta",
      loading: "Creando cuenta...",
      success: "¡Cuenta creada!",
    },
    logout: "Cerrar sesión",
    errors: {
      invalidCredentials: "Email o contraseña inválidos",
      weakPassword: "La contraseña debe tener al menos 8 caracteres",
      passwordsMismatch: "Las contraseñas no coinciden",
      emailInUse: "Este email ya está registrado",
    },
  },
};
