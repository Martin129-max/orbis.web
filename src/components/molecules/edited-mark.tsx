export function EditedMark({ editedAt }: { editedAt?: string | null }) {
  if (!editedAt) return null;

  return <span title={`Edited ${new Date(editedAt).toLocaleString()}`}>· edited</span>;
}
