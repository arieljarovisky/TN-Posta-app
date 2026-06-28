import { Box, Button, Text, Title } from "@nimbus-ds/components";

import { TIENDANUBE_ADMIN_URL } from "./installUi";

const StandaloneNoticeScreen = () => (
  <Box
    height="100vh"
    display="flex"
    justifyContent="center"
    alignItems="center"
    padding="4"
  >
    <Box
      display="flex"
      flexDirection="column"
      gap="4"
      maxWidth="480px"
      textAlign="center"
    >
      <Title as="h3">TN Posta</Title>
      <Text>
        Esta app funciona dentro del administrador de Tiendanube. Abri la app
        desde tu tienda para gestionar envios.
      </Text>
      <Button as="a" appearance="primary" href={TIENDANUBE_ADMIN_URL}>
        Ir al administrador
      </Button>
    </Box>
  </Box>
);

export default StandaloneNoticeScreen;
