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
          "Crea envios propios para pedidos en Capital Federal y Gran Buenos Aires, y genera etiquetas para imprimir.",
        ordersCard: "Ver pedidos elegibles",
        shipmentsCard: "Ver envios creados",
      },
      orders: {
        title: "Pedidos",
        empty: "No hay pedidos elegibles en CABA o GBA.",
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
