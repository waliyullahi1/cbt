import {
  activateSoftware,
  getSystemId,
  getInstallationId,
  getLicenseInfo,
  softwareFetch,
} from "~/utils/softwareSecurity";

let softwareActivated = false;
let initializationPromise: Promise<void> | null = null;

export function isSoftwareActivated(): boolean {
  return softwareActivated;
}

export const useSoftwareSecurity =
  () => {
    const systemId =
      useState<string | null>(
        "software-system-id",
        () => null,
      );

    const installationId =
      useState<string | null>(
        "software-installation-id",
        () => null,
      );

    const license =
      useState<any>(
        "software-license",
        () => null,
      );

    const activated =
      computed(
        () =>
          Boolean(
            installationId.value,
          ),
      );

    async function initialize() {
      if (!initializationPromise) {
        initializationPromise = (async () => {
          installationId.value =
            await getInstallationId();

          license.value =
            await getLicenseInfo();

          softwareActivated = Boolean(installationId.value);

          if (softwareActivated) {
            systemId.value =
              await getSystemId();
          }
        })().catch((error) => {
          initializationPromise = null;
          throw error;
        });
      }

      await initializationPromise;

      return {
        systemId: systemId.value,
        installationId: installationId.value,
        license: license.value,
      };
    }

    async function activate(
      token: string,
    ) {
      console.log('fasasasasasaasssssssssssa');

      const data =
        await activateSoftware(
          token,
        );
      console.log('fasasasasasaasssssssssssa2');

      installationId.value =
        data?.installationId ||
        null;
      softwareActivated = Boolean(installationId.value);

      license.value =
        data?.license ||
        null;

      systemId.value =
        await getSystemId();
      console.log('systemId.valuesystemId.value');

      return data;
    }

    async function api<T = any>(
      path: string,
      options: any = {},
    ) {
      return await softwareFetch<T>(
        path,
        options,
      );
    }

    return {
      systemId,
      installationId,
      license,
      activated,

      initialize,
      activate,
      api,
    };
  };