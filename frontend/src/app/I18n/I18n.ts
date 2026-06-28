import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translations: {
      app: {
        title: "TN Posta",
        connecting: "Conectando...",
        backHome: "Volver al inicio",
      },
      home: {
        title: "Envios personalizados",
        description:
          "Activa o desactiva envios propios para pedidos en Capital Federal y Gran Buenos Aires.",
        serviceStatus: "Estado del servicio",
        toggleLabel: "Envios Posta CABA/GBA",
        toggleHelp:
          "Al activar, podes crear envios personalizados y generar etiquetas PDF.",
        statusLabel: "Estado:",
        statusActive: "Activo",
        statusInactive: "Inactivo",
        activeDescription:
          "El servicio esta activo. Los pedidos elegibles en CABA y GBA pueden convertirse en envios.",
        inactiveDescription:
          "El servicio esta desactivado. No se procesaran envios hasta que lo actives.",
        inactiveAlertTitle: "Servicio desactivado",
        inactiveAlertBody:
          "Activa el interruptor de arriba para empezar a gestionar envios en tu tienda.",
        activatedToast: "Servicio activado correctamente.",
        deactivatedToast: "Servicio desactivado.",
        manageTitle: "Gestionar envios",
        ordersCard: "Ver pedidos elegibles",
        ordersCardHelp:
          "Solo pedidos donde el cliente eligio TN Posta (carrier de la app) o una tarifa configurada aca, en CABA o GBA.",
        shippingRatesTitle: "Tarifas de envio",
        shippingRatesSaved: "Tarifas guardadas correctamente.",
        shippingRatesRequired: "Agrega al menos una tarifa con nombre y precio.",
        shipmentsCard: "Ver envios creados",
        shipmentsCardHelp:
          "Consulta envios ya creados y descarga las etiquetas en PDF.",
        coverageTitle: "Cobertura por barrio",
        coverageBody:
          "Consulta los barrios y partidos incluidos en cada zona de envio.",
        reconnectTitle: "Tienda desconectada",
        reconnectBody:
          "Las credenciales OAuth se perdieron (suele pasar tras un redeploy). Reconecta la tienda para ver pedidos y crear envios.",
      },
      orders: {
        title: "Pedidos",
        empty: "No hay pedidos con envio TN Posta en CABA o GBA.",
        shippingMethod: "Envio elegido",
        serviceDisabled: "Activa TN Posta desde la pantalla principal para ver pedidos.",
        reconnectRequired:
          "La tienda no esta conectada. Reconectala para consultar pedidos de Tiendanube.",
        createShipment: "Crear envio",
        hasShipment: "Envio creado",
        zone: "Zona",
        notEligible: "Fuera de zona",
        notes: "Observaciones (opcional)",
        confirm: "Confirmar envio",
        cancel: "Cancelar",
      },
      shipments: {
        title: "Envios",
        empty: "Todavia no creaste envios.",
        serviceDisabled: "Activa TN Posta desde la pantalla principal para ver envios.",
        reconnectRequired:
          "La tienda no esta conectada. Reconectala para consultar envios.",
        downloadLabel: "Descargar etiqueta",
        order: "Pedido",
        zone: "Zona",
        status: "Estado",
        created: "Creado",
        labelGenerated: "Etiqueta generada",
      },
      errors: {
        generic: "Ocurrio un error. Intenta nuevamente.",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
