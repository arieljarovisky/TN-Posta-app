import { tiendanubeAuthClient } from "@config";
import { BadRequestException } from "@utils";
import { userRepository } from "@repository";
import { TiendanubeAuthRequest, TiendanubeAuthInterface } from "@features/auth";
import { logError, logInfo, maskCode } from "@utils/logger";

class InstallAppService {
  public async install(code: string): Promise<TiendanubeAuthInterface> {
    logInfo("auth/install-service", "Iniciando intercambio de codigo OAuth", {
      code: maskCode(code),
      clientId: process.env.CLIENT_ID,
      authUrl: process.env.TIENDANUBE_AUTENTICATION_URL,
    });

    if (!code) {
      throw new BadRequestException("The authorization code not found");
    }

    const body: TiendanubeAuthRequest = {
      client_id: process.env.CLIENT_ID as string,
      client_secret: process.env.CLIENT_SECRET as string,
      grant_type: "authorization_code",
      code: code,
    };

    const authenticateResponse = await this.authenticateApp(body);

    if (authenticateResponse.error && authenticateResponse.error_description) {
      logError(
        "auth/install-service",
        "Tiendanube rechazo el codigo OAuth",
        undefined,
        {
          error: authenticateResponse.error,
          description: authenticateResponse.error_description,
        }
      );

      throw new BadRequestException(
        authenticateResponse.error as string,
        authenticateResponse.error_description
      );
    }

    if (!authenticateResponse.access_token || !authenticateResponse.user_id) {
      logError(
        "auth/install-service",
        "Respuesta OAuth incompleta",
        undefined,
        {
          hasAccessToken: Boolean(authenticateResponse.access_token),
          userId: authenticateResponse.user_id ?? null,
          scope: authenticateResponse.scope ?? null,
        }
      );

      throw new BadRequestException(
        "Invalid OAuth response",
        "La respuesta de Tiendanube no incluyo access_token o user_id"
      );
    }

    userRepository.save(authenticateResponse);

    logInfo("auth/install-service", "Credenciales guardadas en db.json", {
      storeId: authenticateResponse.user_id,
      scope: authenticateResponse.scope,
      tokenType: authenticateResponse.token_type,
    });

    return authenticateResponse;
  }

  private async authenticateApp(
    body: TiendanubeAuthRequest
  ): Promise<TiendanubeAuthInterface> {
    try {
      const response = await tiendanubeAuthClient.post("/", body);
      return response as TiendanubeAuthInterface;
    } catch (error) {
      logError("auth/install-service", "Fallo la llamada al token endpoint", error, {
        authUrl: process.env.TIENDANUBE_AUTENTICATION_URL,
        clientId: body.client_id,
      });
      throw error;
    }
  }
}

export default new InstallAppService();
