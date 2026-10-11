import { requireOptionalNativeModule } from "expo-modules-core";
/* null when running somewhere without the native module (e.g. Expo Go) */
export default requireOptionalNativeModule("WbStore");
