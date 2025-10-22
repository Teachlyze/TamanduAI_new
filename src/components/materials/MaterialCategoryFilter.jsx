import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FiFilter, FiX } from "react-icons/fi";

const MaterialCategoryFilter = ({ classId, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    if (classId) {
      loadCategoriesAndTags();
    }
  }, [classId]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(
        {
          category: selectedCategory !== "all" ? selectedCategory : null,
          tags: selectedTags,
          search: searchQuery,
        },
        []
      ); // TODO: Add dependencies
    }
  }, [selectedCategory, selectedTags, searchQuery]);

  const loadCategoriesAndTags = async () => {
    try {
      const { data: materials } = await supabase
        .from("class_materials")
        .select("category, tags")
        .eq("class_id", classId);

      if (materials) {
        // Extract unique categories
        const uniqueCategories = [
          ...new Set(materials.map((m) => m.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);

        // Extract unique tags
        const tagSet = new Set();
        materials.forEach((m) => {
          if (m.tags && Array.isArray(m.tags)) {
            m.tags.forEach((tag) => tagSet.add(tag));
          }
        });
        setAllTags([...tagSet]);
      }
    } catch (error) {
      console.error("Error loading categories and tags:", error);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTags([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedTags.length > 0 ||
    searchQuery.length > 0;

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiFilter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FiX className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Categoria
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Buscar
          </label>
          <Input
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialCategoryFilter;
