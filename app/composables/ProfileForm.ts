import type { Enterprise, Member } from "~~/shared/types/entities";
import { buildProfilePayload, createProfileFormState } from "~~/utils/forms";

interface ProfileFormOptions<TFields extends object> {
  endpoint: "/api/members" | "/api/enterprises";
  initial: Member | Enterprise | undefined;
  /** Entity-specific fields merged into the shared profile state. */
  fields: TFields;
  onSubmitted: () => void;
}

/**
 * Wires the state, picture upload and submission shared by every profile-like
 * entity (members and enterprises) so each form only declares its own fields.
 */
export const useProfileForm = <TFields extends object>(
  options: ProfileFormOptions<TFields>,
) => {
  const { countries } = useCountries();
  const form = reactive({
    ...createProfileFormState(options.initial),
    ...options.fields,
  });

  const {
    submitting,
    onSubmit,
    onPickImage: onPickPicture,
  } = useEntityForm({
    endpoint: options.endpoint,
    initialId: options.initial?._id,
    imageFile: toRef(form, "pictureFile"),
    imageUrl: toRef(form, "picture"),
    buildPayload: () => buildProfilePayload(form, countries.value),
    onSubmitted: options.onSubmitted,
  });

  return { form, submitting, onSubmit, onPickPicture };
};
