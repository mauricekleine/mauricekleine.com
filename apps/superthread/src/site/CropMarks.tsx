// Corner crop marks: 10 px ticks set 16 px outside a screened field, as a printer marks a plate. The parent is
// positioned; the marks never take a click.
export function CropMarks() {
  return (
    <span className="st-crop" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
