import { Box, Button, Text, Title } from "@nimbus-ds/components";

import { TIENDANUBE_ADMIN_URL } from "./installUi";

type InstallSuccessScreenProps = {
  onContinue?: () => void;
};

const InstallSuccessScreen = ({ onContinue }: InstallSuccessScreenProps) => (
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
      <Title as="h3">Instalacion completada</Title>
      <Text>
        La app quedo autorizada en tu tienda. Para usarla, abrila desde el
        administrador de Tiendanube (Apps → TN Posta).
      </Text>
      <Box display="flex" flexDirection="column" gap="2">
        <Button
          as="a"
          appearance="primary"
          href={TIENDANUBE_ADMIN_URL}
        >
          Abrir en Tiendanube
        </Button>
        {onContinue ? (
          <Button appearance="neutral" onClick={onContinue}>
            Continuar aqui
          </Button>
        ) : null}
      </Box>
    </Box>
  </Box>
);

export default InstallSuccessScreen;
