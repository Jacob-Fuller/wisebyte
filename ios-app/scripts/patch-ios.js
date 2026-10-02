/* Applies Wisebyte's settings to the generated Capacitor iOS project.
   Safe to run more than once. Run after `npx cap add ios` / `npx cap sync ios`. */
const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

const here = path.resolve(__dirname, "..");
const appDir = path.join(here, "ios", "App", "App");
const pbxPath = path.join(here, "ios", "App", "App.xcodeproj", "project.pbxproj");
const native = path.join(here, "native");
const res = path.join(here, "resources");

function must(p) { if (!fs.existsSync(p)) { console.error("patch-ios: missing " + p); process.exit(1); } }
must(appDir); must(pbxPath);

/* 1. Native source files and entitlements */
for (const f of ["SharedEntitlementPlugin.swift", "MainViewController.swift", "App.entitlements"]) {
  fs.copyFileSync(path.join(native, f), path.join(appDir, f));
}

/* 1b. Privacy manifest: declare the app's own UserDefaults use (shared App Group, reason 1C8F.1).
   If the Capacitor template already made one, add our entry to it instead of replacing it. */
const pmSrc = path.join(native, "PrivacyInfo.xcprivacy"), pmDst = path.join(appDir, "PrivacyInfo.xcprivacy");
if (!fs.existsSync(pmDst)) fs.copyFileSync(pmSrc, pmDst);
else {
  let pm = fs.readFileSync(pmDst, "utf8");
  if (!pm.includes("NSPrivacyAccessedAPICategoryUserDefaults")) {
    const entry = "\t\t<dict>\n\t\t\t<key>NSPrivacyAccessedAPIType</key>\n\t\t\t<string>NSPrivacyAccessedAPICategoryUserDefaults</string>\n\t\t\t<key>NSPrivacyAccessedAPITypeReasons</key>\n\t\t\t<array>\n\t\t\t\t<string>1C8F.1</string>\n\t\t\t</array>\n\t\t</dict>\n";
    if (/<key>NSPrivacyAccessedAPITypes<\/key>\s*<array\/>/.test(pm)) pm = pm.replace(/<key>NSPrivacyAccessedAPITypes<\/key>\s*<array\/>/, "<key>NSPrivacyAccessedAPITypes</key>\n\t<array>\n" + entry + "\t</array>");
    else if (pm.includes("<key>NSPrivacyAccessedAPITypes</key>")) pm = pm.replace(/(<key>NSPrivacyAccessedAPITypes<\/key>\s*<array>\n?)/, "$1" + entry);
    else pm = pm.replace(/<\/dict>\s*<\/plist>\s*$/, "\t<key>NSPrivacyAccessedAPITypes</key>\n\t<array>\n" + entry + "\t</array>\n</dict>\n</plist>\n");
    fs.writeFileSync(pmDst, pm);
  }
}

/* 2. Xcode project: add the Swift files, privacy manifest, entitlements, iPhone only */
const proj = xcode.project(pbxPath);
proj.parseSync();
const groupKey = proj.findPBXGroupKey({ path: "App" }) || proj.findPBXGroupKey({ name: "App" });
for (const f of ["SharedEntitlementPlugin.swift", "MainViewController.swift"]) {
  if (!proj.hasFile(f)) proj.addSourceFile(f, {}, groupKey);
}
if (!proj.hasFile("PrivacyInfo.xcprivacy")) proj.addResourceFile("PrivacyInfo.xcprivacy", {}, groupKey);
proj.updateBuildProperty("CODE_SIGN_ENTITLEMENTS", '"App/App.entitlements"');
proj.updateBuildProperty("TARGETED_DEVICE_FAMILY", '"1"');
fs.writeFileSync(pbxPath, proj.writeSync());

/* 3. Storyboard: use MainViewController so the plugin gets registered */
const sb = path.join(appDir, "Base.lproj", "Main.storyboard");
must(sb);
let s = fs.readFileSync(sb, "utf8");
s = s.replace(/customClass="CAPBridgeViewController" customModule="Capacitor"/,
              'customClass="MainViewController" customModule="App" customModuleProvider="target"');
fs.writeFileSync(sb, s);

/* 4. Info.plist */
const plistPath = path.join(appDir, "Info.plist");
must(plistPath);
let p = fs.readFileSync(plistPath, "utf8");
function setKey(key, valueXml) {
  const re = new RegExp(`<key>${key}</key>\\s*(<string>[^<]*</string>|<true/>|<false/>|<array>[\\s\\S]*?</array>)`);
  if (re.test(p)) p = p.replace(re, `<key>${key}</key>\n\t${valueXml}`);
  else p = p.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${key}</key>\n\t${valueXml}\n</dict>\n</plist>\n`);
}
setKey("CFBundleDisplayName", "<string>Wisebyte</string>");
setKey("ITSAppUsesNonExemptEncryption", "<false/>");
setKey("UISupportedInterfaceOrientations", "<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t</array>");
setKey("UIStatusBarStyle", "<string>UIStatusBarStyleLightContent</string>");
setKey("UIViewControllerBasedStatusBarAppearance", "<false/>");
fs.writeFileSync(plistPath, p);

/* 5. App icon and launch screen */
const assets = path.join(appDir, "Assets.xcassets");
const iconSet = path.join(assets, "AppIcon.appiconset");
must(iconSet);
const iconFiles = fs.readdirSync(iconSet).filter(f => f.endsWith(".png"));
if (!iconFiles.length) { console.error("patch-ios: no icon png in AppIcon.appiconset"); process.exit(1); }
for (const f of iconFiles) fs.copyFileSync(path.join(res, "icon-1024.png"), path.join(iconSet, f));
const splashSet = path.join(assets, "Splash.imageset");
if (fs.existsSync(splashSet)) {
  for (const f of fs.readdirSync(splashSet).filter(f => f.endsWith(".png"))) {
    fs.copyFileSync(path.join(res, "splash-2732.png"), path.join(splashSet, f));
  }
}

console.log("patch-ios: done");
