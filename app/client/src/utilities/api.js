import Http from "./http";

// eslint-disable-next-line import/prefer-default-export
export async function getStatus() {
  return Http.get("status");
}
