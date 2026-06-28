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
          "Consulta envios ya creados e imprime etiquetas TN Posta (100x150 mm o 4 por A4).",
        senderTitle: "Datos del remitente",
        senderHelp:
          "Aparecen en la etiqueta impresa. Configuralos antes de imprimir.",
        senderBusinessName: "Empresa / nombre comercial",
        senderAddress: "Direccion",
        senderCity: "Ciudad",
        senderPhone: "Telefono",
        senderSaved: "Datos del remitente guardados.",
        coverageTitle: "Cobertura por barrio",
        coverageBody:
          "Agrega o quita barrios y partidos incluidos en cada zona de envio.",
        coverageSaved: "Cobertura por barrio guardada correctamente.",
        coverageEmptyZone:
          "Cada zona debe tener al menos un barrio o partido.",
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
        printLabel: "Imprimir etiqueta",
        printSelected: "Imprimir {{count}} etiquetas (A4)",
        trackingCode: "Seguimiento",
        labelHelpTitle: "Etiquetas TN Posta",
        labelHelpBody:
          "Se abre una ventana imprimible (100x150 mm). Guarda como PDF desde el navegador. El codigo TPA incluye barcode y QR para el repartidor.",
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
