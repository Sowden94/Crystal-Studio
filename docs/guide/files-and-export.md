# Files, project saving, and export

## Projects

A `.crystalstudio` project is a versioned JSON document containing:

- the loaded atom positions, displacement tensors where available, and connectivity;
- the complete loaded model and the selected molecule groups;
- orientation, zoom, current rotation angle, axis, speed, and play/pause state;
- render style, ellipsoid probability, bond thickness, atom labels, hydrogens, and outlines;
- depth fading, background, transparency setting, and export resolution;
- distances, angles, annotation styles, label positions, and rotation visibility settings.

It does **not** embed the original PDF, CIF text, reflection data, or refinement history. Retain original files separately. Projects are local files; there is no account storage or automatic backup.

Desktop shortcuts: Ctrl/Cmd+O opens, Ctrl/Cmd+S saves, and Ctrl/Cmd+Shift+S opens Save As. Native dialogs choose the folder. Browser save behaviour depends on support for the File System Access API: otherwise, Save project downloads a new file each time.

## Figures

Export PNG at 1200, 2400, or 3600 pixels wide. The aspect ratio is 4:3. Enable **Transparent PNG** under display options for a transparent background. Depth fading still blends toward the selected background colour, so choose a colour appropriate for the intended page or slide.

## Animation

Rotation can take 4, 6, 10, 15, 20, 30, 45, or 60 seconds per turn. Longer times rotate more slowly.

**GIF** exports a complete turn with infinite repeat. Long rotations use up to 360 frames with longer frame intervals to keep encoding and file size manageable. **WebM** records at 30 fps where supported by the browser; set repeat in the video player. Native save dialogs are used for desktop exports.

The structure rotates as a static model. The animation does not simulate atomic motion or chemical dynamics. Atom labels and enabled measurement annotations are included in PNG, GIF, and WebM output. **Include in exports** controls measurement annotations; **During rotation** controls their appearance in movies.
