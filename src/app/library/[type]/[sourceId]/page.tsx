"use client";

import { useParams } from "next/navigation";
import * as Organism from "@organism";
import * as Template from "@template";

export default function MediaPage() {
  const { type, sourceId } = useParams<{ type: string; sourceId: string }>();

  return (
    <Template.AppTemplate>
      <Organism.MediaProfile key={`${type}/${sourceId}`} type={type} sourceId={sourceId} />
    </Template.AppTemplate>
  );
}
