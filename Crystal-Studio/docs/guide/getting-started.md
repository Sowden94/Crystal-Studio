# Getting started

## Use online

After GitHub Pages is enabled, open the repository's published Pages URL. No account or installation is required to use the static app. Structure parsing and rendering take place locally in the browser; GitHub serves the application files.

Click **Upload structure** for a CIF, XYZ, V2000 MOL, or SDF file (first record). Use **Import PDF report** for a text-based coordinate report. Drag the model to rotate, scroll to zoom, and press **Pause** when you have the view you want.

## Desktop

Use the release matching your processor and operating system. Mac downloads are separate for Apple silicon (`arm64`) and Intel (`x64`). Windows builds target x64.

For a Mac DMG, open the disk image and copy Crystal Studio into Applications. For a ZIP distribution, extract the complete app or folder first. A Windows installer guides you through installation; the ZIP distribution can be extracted into a folder and launched from there.

Initial beta packages are unsigned, and Mac packages are not notarized. Your operating system may block an unverified package. The maintainer must test builds and complete signing before presenting them as broadly trusted downloads. Do not disable operating-system security protections to run an unexpected file.

## Save before closing

**Save project** stores a `.crystalstudio` file. The desktop version uses a native Save dialog. The online version uses a browser Save dialog when available, otherwise a normal download. Use **Open project** to restore it later.

## Update

The app is under active development and updates are expected frequently. Desktop updates are **manual**: use Help → Check for updates or open the repository's latest GitHub Release and download the new version. Save and close your current project before replacing the app. There is no automatic updater yet.

The online version updates when the maintainer publishes a new GitHub Pages build. Reload the page after saving your current project to load the latest version.
