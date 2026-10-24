# Distances and angles

Measurements use the imported 3D coordinates. Distances are shown in angstroms (Å), and angles in degrees. The screen projection does not change their values. The app does not calculate crystallographic uncertainties or apply a refinement model to the results.

## Add a measurement

1. Pause the structure at a useful viewing angle.
2. Under **Measurements**, choose **Length** and drag between two atoms, or click each atom.
3. For an angle, choose **Angle** and click three atoms. The **second atom is the vertex**.
4. If atoms overlap on screen, expand **Choose atoms by name**, select the atoms, and click **Add measurement**.
5. Choose **Rotate** to return to manual rotation. Remove individual entries from the measurement list, or use **Clear measurements**.

Only measurements whose atoms are visible in the selected molecule groups are drawn.

## Position and style the labels

Drag the text to pin a label at a position in the workspace. Labels have no painted boxes. **Keep labels clear of structure** is enabled by default; turn it off for unrestricted placement. **Auto-place labels** clears the pinned positions and returns to automatic placement.

Automatic placement keeps labels clear of the projected structure, other labels, and the workspace edges. If there is no room, a label may be hidden; zoom out or move it to make space. Its value remains in the measurement list.

Open **Measurement appearance** to choose:

- font colour and line colour, using a colour picker or hex value;
- measurement line and label connector styles independently: solid, dashed, dotted, or none;
- Arial text size and line thickness.

These appearance settings apply to all measurements. Pinned positions are relative to the workspace, so they remain on the same part of the image when exporting.

## Choose when measurements appear

**During rotation** offers three options:

| Option | Behaviour |
|---|---|
| Hide while rotating | The default. Measurements appear when paused and disappear during automatic rotation and exported movies. |
| Near a chosen view | Pause at your preferred orientation, choose **Use current view**, and select a 30°, 60°, 90°, or 120° window. Measurements fade in around the bookmarked orientation and fade out as the model turns away. |
| Always show | Measurements stay visible throughout automatic rotation. |

The visibility setting applies to the workspace and exported movies. Static PNG exports treat the model as paused. In **Near a chosen view** mode, the chosen orientation still controls their visibility; use **Always show** to include them at any orientation. **Show measurements** and **Include in exports** must also be enabled. Choosing measurement tools or dragging labels temporarily reveals the annotations for editing.

## Export and save

Enable **Include in exports** to include annotations in PNG figures, looping GIFs, and WebM movies. Turn it off to export the structure alone without removing your measurements.

**Save project** stores the measurements, label positions, shared appearance, and bookmarked-view settings in the `.crystalstudio` file. Reopen it in an updated version of Crystal Studio to restore those settings. Older projects without measurements remain supported. Loading a new structure clears the previous measurements.

![Synthetic cubane with styled distance and angle annotations](../images/measurements-styled.png)

![Measurements fading in near a bookmarked orientation during rotation](../images/measurements-rotation.gif)

Both examples use constructed demonstration coordinates, not experimental research data.
