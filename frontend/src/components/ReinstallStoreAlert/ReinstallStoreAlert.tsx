import { Alert, Box, Button, Text } from "@nimbus-ds/components";

import { openOAuthInstallUrl } from "@/app/oauth/installUi";

type ReinstallStoreAlertProps = {
  title: string;
  description: string;
};

const ReinstallStoreAlert = ({
  title,
  description,
}: ReinstallStoreAlertProps) => (
  <Alert appearance="warning" title={title}>
    <Box display="flex" flexDirection="column" gap="3">
      <Text>{description}</Text>
      <Text fontSize="caption" color="neutral-textLow">
        Se abrirá la autorización de Tiendanube. Al terminar, volvé al admin y
        recargá esta página.
      </Text>
      <Button appearance="primary" onClick={openOAuthInstallUrl}>
        Reconectar tienda
      </Button>
    </Box>
  </Alert>
);

export default ReinstallStoreAlert;
