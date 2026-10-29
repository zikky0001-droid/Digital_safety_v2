Digital Safety Android artifacts

DigitalSafety-debug.apk
- Debug-signed APK compiled from the native project.
- Package: com.digitalsafety.app
- Suitable for development/testing, not a production store release.

DigitalSafety-release-test-signed.apk
DigitalSafety-release-test-signed.aab
- Release outputs compiled and signed with a temporary local test key.
- The test key is not included.
- Replace the signing identity with the publisher's own key before distribution.

Runtime status: compile, package metadata, APK signature, and AAB signature checks passed. No emulator or physical Android device was available for install/runtime testing in this environment.
