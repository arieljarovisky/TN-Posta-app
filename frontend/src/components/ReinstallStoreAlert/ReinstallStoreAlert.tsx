import { Alert, Box, Button, Text } from "@nimbus-ds/components";

import { OAUTH_INSTALL_URL } from "@/app/oauth/installUi";

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
      <Button as="a" appearance="primary" href={OAUTH_INSTALL_URL}>
        Reconectar tienda
      </Button>
    </Box>
  </Alert>
);

export default ReinstallStoreAlert;
