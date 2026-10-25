"""SDK-only build for an online Octolabs development APK (not a store release)."""
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent
SDK = pathlib.Path(os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT", ""))
TOOLS = SDK / "build-tools" / "35.0.0"
PLATFORM = SDK / "platforms" / "android-35" / "android.jar"
BUILD = ROOT / "build"
APK_NAME = "octolabs-0.1.0-dev.apk"
WIN = os.name == "nt"


def tool(name, batch=False):
    return str(TOOLS / (name + (".bat" if batch else ".exe") if WIN else name))


def run(*args):
    subprocess.run([str(arg) for arg in args], check=True)


def main():
    if not PLATFORM.is_file() or not shutil.which("javac"):
        raise SystemExit("Build requires a JDK (javac), Android platform 35 and build-tools 35.0.0. Use the Octolabs Android GitHub Actions workflow.")
    # Clean classes and APKs to avoid packaging removed code from a previous build.
    for name in ["classes", "dex"]:
        shutil.rmtree(BUILD / name, ignore_errors=True)
        (BUILD / name).mkdir(parents=True, exist_ok=True)
    sources = sorted((ROOT / "src").rglob("*.java"))
    run("javac", "-source", "8", "-target", "8", "-classpath", PLATFORM, "-d", BUILD / "classes", *sources)
    run("jar", "cf", BUILD / "classes.jar", "-C", BUILD / "classes", ".")
    run(tool("d8", True), "--lib", PLATFORM, "--min-api", "26", "--output", BUILD / "dex", BUILD / "classes.jar")
    run(tool("aapt"), "package", "-f", "-M", ROOT / "AndroidManifest.xml", "-S", ROOT / "res", "-I", PLATFORM, "-F", BUILD / "unsigned.apk")
    with zipfile.ZipFile(BUILD / "unsigned.apk", "a", zipfile.ZIP_DEFLATED) as archive:
        archive.write(BUILD / "dex" / "classes.dex", "classes.dex")
    run(tool("zipalign"), "-f", "4", BUILD / "unsigned.apk", BUILD / "aligned.apk")
    key = BUILD / "development.keystore"
    if not key.exists():
        run("keytool", "-genkeypair", "-keystore", key, "-storepass", "android", "-keypass", "android", "-alias", "androiddebugkey", "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000", "-dname", "CN=Octolabs Development,O=Octolabs,C=MU")
    output = BUILD / APK_NAME
    run(tool("apksigner", True), "sign", "--ks", key, "--ks-pass", "pass:android", "--key-pass", "pass:android", "--out", output, BUILD / "aligned.apk")
    run(tool("apksigner", True), "verify", "--verbose", "--print-certs", output)
    run(tool("zipalign"), "-c", "4", output)
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    (BUILD / (APK_NAME + ".sha256")).write_text(f"{digest}  {APK_NAME}\n")
    metadata = {"package": "app.octolabs.games", "version": "0.1.0-dev", "signing": "development only; per-build key", "online_only": True, "source_commit": os.environ.get("GITHUB_SHA", "local"), "sha256": digest, "device_tested": False}
    (BUILD / "build-metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print("Development APK built; signature and ZIP alignment verified:", output)


if __name__ == "__main__":
    main()
