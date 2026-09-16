import type {
  Enterprise,
  Member,
  ProgramWithEnterprise,
} from "~~/shared/types/entities";
import type { SearchPage } from "~~/shared/types/search";
import type { SearchCategory } from "~~/shared/utils/categories";

export type EntitySearchResult = Member | Enterprise | ProgramWithEnterprise;

/** What a search runs against: one wizard category, or members of every category. */
export type EntitySearchTarget = SearchCategory | "members";

/**
 * Resolves a search target to the entity it stands for: `enterprise` and
 * `programs` have collections of their own, `members` is the member search
 * without a category, and every other value is a member category that narrows
 * the member search instead.
 */
export const useEntitySearch = () => {
  const { searchMember } = useMembers();
  const { searchEnterprise } = useEnterprise();
  const { searchProgram } = useProgram();

  const searchByCategory = async (
    target: EntitySearchTarget,
    filters: EntitySearchFilters,
  ): Promise<SearchPage<EntitySearchResult>> => {
    if (target === "enterprise") return await searchEnterprise(filters);
    if (target === "programs") {
      return (await searchProgram(filters)) as SearchPage<ProgramWithEnterprise>;
    }
    if (target === "members") return await searchMember(filters);
    return await searchMember({ ...filters, category: target });
  };

  return { searchByCategory };
};
