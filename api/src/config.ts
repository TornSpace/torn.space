import { getConfig } from "../../config";

const isProd = process.env.NODE_ENV === "production";

export const config = getConfig(isProd, isProd ? "../../" : "");
