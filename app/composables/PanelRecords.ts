import type { TableColumn } from "@nuxt/ui";
import type { Enterprise, Member, Program } from "~~/shared/types/entities";

export type PanelRecordKind = "members" | "enterprises" | "programs";
type PanelRecord = Member | Enterprise | Program;

export const usePanelRecords = (kind: PanelRecordKind) => {
  const toast = useToast();
  const config = {
    members: { label: "Member", route: "member" },
    enterprises: { label: "Enterprise", route: "enterprise" },
    programs: { label: "Program", route: "program" },
  }[kind];

  const { data, status, error, refresh } = (
    kind === "members"
      ? useMembers().getMembers()
      : kind === "enterprises"
        ? useEnterprise().getEnterprises()
        : useProgram().getPrograms()
  );
  const records = computed<PanelRecord[]>(() => data.value ?? []);
  const columns: TableColumn<PanelRecord>[] = [
    { accessorKey: "status", header: "Status" },
    { id: "name", header: kind === "programs" ? "Title" : "Name" },
    ...(kind === "members"
      ? [{ accessorKey: "email", header: "Email" }]
      : kind === "enterprises"
        ? [{ accessorKey: "phone", header: "Phone" }]
        : [{ accessorKey: "length", header: "Length (days)" }]),
    { id: "actions", header: "Actions" },
  ];

  const displayName = (record: PanelRecord) => {
    if ("title" in record) return record.title;
    return `${record.name} ${"last_name" in record ? record.last_name : ""}`.trim();
  };
  const profilePath = (record: PanelRecord) =>
    `/${config.route}/${record._id}/${displayName(record).replace(/ /g, "_")}`;

  const modalOpen = ref(false);
  const currentRecord = ref<PanelRecord>();
  const saving = ref(new Set<string>());
  const deleting = ref(new Set<string>());

  const openForm = (record?: PanelRecord) => {
    currentRecord.value = record;
    modalOpen.value = true;
  };

  const handleSubmit = async () => {
    modalOpen.value = false;
    currentRecord.value = undefined;
    await refresh();
  };

  const handleStatusChange = async (record: PanelRecord, active: boolean) => {
    if (saving.value.has(record._id) || deleting.value.has(record._id)) return;
    const previousStatus = record.status;
    record.status = active ? "active" : "inactive";
    saving.value.add(record._id);
    try {
      await $fetch(`/api/${kind}/${record._id}`, {
        method: "PATCH",
        body: { status: record.status },
      });
    } catch {
      record.status = previousStatus;
      toast.add({
        title: "Status update failed",
        description: "The previous status has been restored. Please try again.",
        color: "error",
      });
    } finally {
      saving.value.delete(record._id);
    }
  };

  const handleDelete = async (record: PanelRecord) => {
    if (deleting.value.has(record._id) || saving.value.has(record._id)) return;
    deleting.value.add(record._id);
    try {
      await $fetch(`/api/${kind}/${record._id}`, { method: "DELETE" });
      await refresh();
      toast.add({ title: `${config.label} Deleted`, color: "success" });
    } catch {
      toast.add({
        title: `Could not delete ${config.label.toLowerCase()}`,
        description: "Please try again.",
        color: "error",
      });
    } finally {
      deleting.value.delete(record._id);
    }
  };

  return {
    config,
    records,
    columns,
    status,
    error,
    refresh,
    displayName,
    profilePath,
    modalOpen,
    currentRecord,
    saving,
    deleting,
    openForm,
    handleSubmit,
    handleStatusChange,
    handleDelete,
  };
};
