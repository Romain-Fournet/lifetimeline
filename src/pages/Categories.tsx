import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { SubscriptionBanner } from "../components/ui/SubscriptionBanner";
import type { Category, CreateCategoryInput } from "../types/category";

// Couleurs disponibles pour les catégories
const AVAILABLE_COLORS = [
  { name: "Bleu", value: "bg-blue-500" },
  { name: "Vert", value: "bg-green-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Violet", value: "bg-purple-500" },
  { name: "Rose", value: "bg-pink-500" },
  { name: "Jaune", value: "bg-yellow-500" },
  { name: "Rouge", value: "bg-red-500" },
  { name: "Cyan", value: "bg-cyan-500" },
  { name: "Indigo", value: "bg-indigo-500" },
  { name: "Gris", value: "bg-gray-500" },
];

export const Categories = () => {
  const navigate = useNavigate();
  const { categories, loading, error: categoryError, createCategory, updateCategory, deleteCategory } = useCategories();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Formulaire de création
  const [newCategory, setNewCategory] = useState<CreateCategoryInput>({
    name: "",
    slug: "",
    color: "bg-blue-500",
    icon: "",
    description: "",
  });

  // Formulaire d'édition
  const [editForm, setEditForm] = useState<Partial<Category>>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Générer le slug depuis le nom si pas fourni
    const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '_');

    const { error } = await createCategory({
      ...newCategory,
      slug,
    });

    if (!error) {
      setIsCreating(false);
      setNewCategory({
        name: "",
        slug: "",
        color: "bg-blue-500",
        icon: "",
        description: "",
      });
    }
  };

  const handleEditSubmit = async (categoryId: string) => {
    const { error } = await updateCategory(categoryId, editForm);

    if (!error) {
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDelete = async (categoryId: string) => {
    const { error } = await deleteCategory(categoryId);

    if (!error) {
      setDeletingId(null);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm(category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Gérer les catégories
                </h1>
                <p className="text-gray-600 mt-1">
                  Créez et personnalisez vos catégories d'événements
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle catégorie</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner d'abonnement */}
        <div className="mb-6">
          <SubscriptionBanner currentCount={categories.length} limitType="categories" />
        </div>

        {/* Message d'erreur */}
        {categoryError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {categoryError}
          </div>
        )}

        {/* Formulaire de création */}
        {isCreating && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nouvelle catégorie
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Loisirs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (identifiant)
                  </label>
                  <input
                    type="text"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: loisirs (auto-généré si vide)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                      className={`w-12 h-12 rounded-lg ${color.value} ${
                        newCategory.color === color.value
                          ? "ring-2 ring-offset-2 ring-gray-900"
                          : "opacity-70 hover:opacity-100"
                      } transition-all`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône (nom Lucide)
                </label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Music"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des catégories */}
        <div className="bg-white rounded-xl border border-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Chargement des catégories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Aucune catégorie. Créez-en une pour commencer!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {editingId === category.id ? (
                    // Mode édition
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Nom"
                        />
                        <input
                          type="text"
                          value={editForm.slug || ""}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Slug"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, color: color.value })}
                            className={`w-10 h-10 rounded-lg ${color.value} ${
                              editForm.color === color.value
                                ? "ring-2 ring-offset-2 ring-gray-900"
                                : "opacity-70"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditSubmit(category.id)}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Sauvegarder</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${category.color} rounded-lg`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer cette catégorie ?
            </h3>
            <p className="text-gray-600 mb-6">
              Les événements associés ne seront pas supprimés, mais n'auront plus de catégorie.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleDelete(deletingId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
