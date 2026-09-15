import type {
  Enterprise,
  Member,
  ProgramWithEnterprise,
} from "~~/shared/types/entities";
import type { SearchCategory } from "~~/shared/utils/categories";

export type EntitySearchResult = Member | Enterprise | ProgramWithEnterprise;

/**
 * Resolves a search category to the entity it stands for: `enterprise` and
 * `programs` have collections of their own, while every other category is a
 * member category and narrows the member search instead.
 */
export const useEntitySearch = () => {
  const { searchMember } = useMembers();
  const { searchEnterprise } = useEnterprise();
  const { searchProgram } = useProgram();

  const searchByCategory = async (
    category: SearchCategory,
    filters: EntitySearchFilters,
  ): Promise<EntitySearchResult[]> => {
    if (category === "enterprise") return await searchEnterprise(filters);
    if (category === "programs") {
      return (await searchProgram(filters)) as ProgramWithEnterprise[];
    }
    return await searchMember({ ...filters, category });
  };

  return { searchByCategory };
};
