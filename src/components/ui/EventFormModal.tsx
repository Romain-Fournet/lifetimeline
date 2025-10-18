// src/components/ui/EventFormModal.tsx
import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Image, Trash2 } from "lucide-react";
import type { TimelineEvent } from "../../pages/Timeline";
import { useCategories } from "../../hooks/useCategories";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  editEvent?: TimelineEvent | null; // Nouvel param pour l'édition
  mode?: "create" | "edit";
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category_id: string; // UUID de la catégorie
  location: string;
  photos: File[];
  existingPhotos?: string[]; // Pour garder les photos existantes en mode edit
}

const EventFormModal: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editEvent = null,
  mode = "create",
}) => {
  const { categories } = useCategories();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category_id: categories[0]?.id || "",
    location: "",
    photos: [],
    existingPhotos: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});

  // Initialiser category_id avec la première catégorie quand elles sont chargées
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories, formData.category_id]);

  // Charger les données de l'événement en mode édition
  useEffect(() => {
    if (editEvent && mode === "edit") {
      setFormData({
        title: editEvent.title,
        description: editEvent.description || "",
        startDate: editEvent.startDate.toISOString().split("T")[0],
        endDate: editEvent.endDate
          ? editEvent.endDate.toISOString().split("T")[0]
          : "",
        category_id: editEvent.category_id,
        location: editEvent.location || "",
        photos: [],
        existingPhotos: editEvent.photos || [],
      });
    }
  }, [editEvent, mode]);

  const handleChange = (field: keyof EventFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const removeExistingPhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingPhotos: prev.existingPhotos?.filter((_, i) => i !== index) || [],
    }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    }
    if (!formData.startDate) {
      newErrors.startDate = "La date de début est requise";
    }
    if (
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "La date de fin doit être après la date de début";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form après un petit délai pour éviter le flash visuel
    setTimeout(() => {
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        category_id: categories[0]?.id || "",
        location: "",
        photos: [],
        existingPhotos: [],
      });
      setErrors({});
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "edit" ? "Modifier l'événement" : "Nouvel événement"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Voyage au Japon, Nouveau poste..."
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleChange("category_id", cat.id)}
                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.category_id === cat.id
                      ? cat.color
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin{" "}
                <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lieu
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Ex: Paris, Tokyo, Lyon..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Décrivez cet événement..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos
            </label>

            {/* Existing Photos (en mode edit) */}
            {mode === "edit" &&
              formData.existingPhotos &&
              formData.existingPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {formData.existingPhotos.map((_, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          Photo {index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            {/* New Photos Grid */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.photos.map((photo, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex items-center space-x-2 text-gray-600">
                <Image className="w-5 h-5" />
                <span className="text-sm font-medium">Ajouter des photos</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Formats acceptés: JPG, PNG, GIF. Max 10 MB par photo.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {mode === "edit" ? "Enregistrer" : "Créer l'événement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
