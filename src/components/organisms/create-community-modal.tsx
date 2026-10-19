"use client";

import { Modal } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { useCommunityStore } from "@/stores/community-store";

type CreateCommunityModalProps = {
  open: boolean;
  onClose: () => void;
};

const formId = "create-community";

export function CreateCommunityModal({ open, onClose }: CreateCommunityModalProps) {
  const router = useRouter();
  const createCommunity = useCommunityStore((state) => state.createCommunity);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name")).trim();
    setError(null);
    setPending(true);

    try {
      const community = await createCommunity(name);
      handleClose();
      router.push(`/communities/${community.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Create a community"
      okText="Create"
      onCancel={handleClose}
      okButtonProps={{ htmlType: "submit", form: formId, loading: pending }}
      destroyOnHidden
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
        <Molecule.FormField
          label="Community name"
          name="name"
          required
          maxLength={100}
          pattern=".*\S.*"
          title="Enter a name"
          autoComplete="off"
          autoFocus
        />
        {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      </form>
    </Modal>
  );
}
