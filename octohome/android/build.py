"""Dependency-free SDK build. Windows and Linux; development APK only."""
import os, pathlib, shutil, subprocess, zipfile

ROOT = pathlib.Path(__file__).resolve().parent
SDK = pathlib.Path(os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT', ''))
TOOLS = SDK / 'build-tools' / '35.0.0'
PLATFORM = SDK / 'platforms' / 'android-35' / 'android.jar'
BUILD = ROOT / 'build'
WIN = os.name == 'nt'

def tool(name, batch=False):
    return str(TOOLS / (name + ('.bat' if batch else '.exe') if WIN else name))

def run(*args):
    subprocess.run([str(a) for a in args], check=True)

def main():
    if not PLATFORM.is_file():
        raise SystemExit('Install Android platform 35 and build-tools 35.0.0 first.')
    for directory in ['classes','dex','assets']:
        (BUILD / directory).mkdir(parents=True, exist_ok=True)
    for asset in ['index.html','style.css','model.js','app.js','design.js','design.css']:
        shutil.copyfile(ROOT.parent / asset, BUILD / 'assets' / asset)
    sources = sorted((ROOT / 'src').rglob('*.java'))
    run('javac', '-source', '8', '-target', '8', '-classpath', PLATFORM, '-d', BUILD/'classes', *sources)
    run('jar', 'cf', BUILD/'classes.jar', '-C', BUILD/'classes', '.')
    run(tool('d8',True), '--lib', PLATFORM, '--min-api', '26', '--output', BUILD/'dex', BUILD/'classes.jar')
    run(tool('aapt'), 'package', '-f', '-M', ROOT/'AndroidManifest.xml', '-S', ROOT/'res', '-A', BUILD/'assets', '-I', PLATFORM, '-F', BUILD/'unsigned.apk')
    with zipfile.ZipFile(BUILD/'unsigned.apk','a',zipfile.ZIP_DEFLATED) as archive:
        archive.write(BUILD/'dex'/'classes.dex','classes.dex')
    run(tool('zipalign'), '-f', '4', BUILD/'unsigned.apk', BUILD/'aligned.apk')
    key = BUILD/'development.keystore'
    if not key.exists():
        run('keytool','-genkeypair','-keystore',key,'-storepass','android','-keypass','android','-alias','androiddebugkey','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=OctoHome Development,O=Octolabs,C=MU')
    out = BUILD/'octohome-0.2.1.apk'
    run(tool('apksigner',True),'sign','--ks',key,'--ks-pass','pass:android','--key-pass','pass:android','--out',out,BUILD/'aligned.apk')
    run(tool('apksigner',True),'verify','--verbose',out)
    run(tool('zipalign'),'-c','4',out)
    print('APK built and signature verified:', out)

if __name__ == '__main__':
    main()
