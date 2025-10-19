import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Palette } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { SubscriptionBanner } from "../components/ui/SubscriptionBanner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { Category, CreateCategoryInput } from "../types/category";

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
  { name: "Teal", value: "bg-teal-500" },
  { name: "Emerald", value: "bg-emerald-500" },
];

export const Categories = () => {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    error: categoryError,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState<CreateCategoryInput>({
    name: "",
    slug: "",
    color: "bg-teal-500",
    icon: "",
    description: "",
  });

  const [editForm, setEditForm] = useState<Partial<Category>>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug =
      newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, "_");

    const { error } = await createCategory({
      ...newCategory,
      slug,
    });

    if (!error) {
      setIsCreating(false);
      setNewCategory({
        name: "",
        slug: "",
        color: "bg-teal-500",
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
    await deleteCategory(categoryId);
    setDeletingId(null);
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
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-blue-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Catégories
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Organisez vos moments de vie
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreating(true)}
            >
              <span className="hidden sm:inline">Nouvelle catégorie</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner d'abonnement */}
        <div className="mb-6">
          <SubscriptionBanner
            currentCount={categories.length}
            limitType="categories"
          />
        </div>

        {/* Message d'erreur */}
        {categoryError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {categoryError}
          </div>
        )}

        {/* Formulaire de création */}
        {isCreating && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Nouvelle catégorie
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="Ex: Voyages, Travail, Famille..."
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
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="Auto-généré si vide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Couleur *</span>
                </label>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setNewCategory({ ...newCategory, color: color.value })
                      }
                      className={`aspect-square rounded-lg ${color.value} ${
                        newCategory.color === color.value
                          ? "ring-4 ring-offset-2 ring-blue-900 scale-110"
                          : "hover:scale-110"
                      } transition-all`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  rows={2}
                  placeholder="Décrivez cette catégorie..."
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary" size="md">
                  Créer la catégorie
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsCreating(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Liste des catégories */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        ) : categories.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-blue-900" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune catégorie
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre première catégorie pour organiser vos moments
            </p>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsCreating(true)}
            >
              Créer une catégorie
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                hover={editingId !== category.id}
                className={editingId === category.id ? "ring-2 ring-blue-900" : ""}
              >
                {editingId === category.id ? (
                  // Mode édition
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      placeholder="Nom"
                    />
                    <div className="grid grid-cols-6 gap-2">
                      {AVAILABLE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() =>
                            setEditForm({ ...editForm, color: color.value })
                          }
                          className={`aspect-square rounded-lg ${color.value} ${
                            editForm.color === color.value
                              ? "ring-2 ring-offset-2 ring-blue-900"
                              : "opacity-70 hover:opacity-100"
                          } transition-all`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Save}
                        onClick={() => handleEditSubmit(category.id)}
                      >
                        Sauvegarder
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-12 h-12 ${category.color} rounded-xl flex-shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {category.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
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
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer cette catégorie ?
            </h3>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. Les événements de cette catégorie
              ne seront pas supprimés.
            </p>
            <div className="flex items-center space-x-3">
              <Button
                variant="danger"
                size="md"
                onClick={() => handleDelete(deletingId)}
                fullWidth
              >
                Supprimer
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeletingId(null)}
                fullWidth
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
