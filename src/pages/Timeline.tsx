// src/pages/Timeline.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Briefcase,
  Home,
  Car,
  Heart,
  Plane,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  GripVertical,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import EventFormModal from "../components/ui/EventFormModal";
import type { EventFormData } from "../components/ui/EventFormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { SubscriptionBanner } from "../components/ui/SubscriptionBanner";
import { useEvents } from "../hooks/useEvents";
import { useCategories } from "../hooks/useCategories";
import { useSubscription } from "../hooks/useSubscription";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  category_id: string; // UUID de la catégorie
  location?: string;
  photos?: string[];
  metadata?: Record<string, unknown>;
}

interface EventModalData {
  event: TimelineEvent | null;
  isOpen: boolean;
}

interface SortableLaneProps {
  id: string;
  label: string;
  icon: typeof Briefcase;
  color: string;
}

function SortableLane({ id, label, icon: Icon, color }: SortableLaneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-20 md:h-24 border-b border-gray-200 flex items-center justify-center md:justify-start px-2 md:px-4 bg-white"
    >
      <div className="flex items-center space-x-2 w-full">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
          title="Glisser pour réorganiser"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div
          className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {label}
        </span>
      </div>
    </div>
  );
}

const Timeline = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const { categories, updateCategoriesOrder } = useCategories();
  const { canCreateEvent } = useSubscription();

  const [selectedModal, setSelectedModal] = useState<EventModalData>({
    event: null,
    isOpen: false,
  });
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // État du zoom (1 = normal, 0.5 = dézoomé, 2 = zoomé)
  const [zoomLevel, setZoomLevel] = useState(1);
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 4;

  // Configuration des sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Gérer la fin du drag & drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Réorganiser localement pour un feedback immédiat
        const newOrder = arrayMove(categories, oldIndex, newIndex);
        const orderedIds = newOrder.map((cat) => cat.id);

        // Sauvegarder l'ordre en base de données
        await updateCategoriesOrder(orderedIds);
      }
    }
  };

  // Fonctions de zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, MIN_ZOOM));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Calculer la durée d'un événement en mois
  const getEventDurationInMonths = (event: TimelineEvent): number => {
    if (!event.endDate) return 3; // Durée par défaut pour les événements en cours
    const months =
      (event.endDate.getFullYear() - event.startDate.getFullYear()) * 12 +
      (event.endDate.getMonth() - event.startDate.getMonth());
    return Math.max(months, 1); // Au moins 1 mois
  };

  // Filtrer les événements selon le niveau de zoom
  const shouldShowEvent = (event: TimelineEvent): boolean => {
    const durationInMonths = getEventDurationInMonths(event);
    const minWidthInPixels = 80; // Largeur minimale pour afficher un événement

    // Calculer la largeur que l'événement aurait à l'écran
    const eventWidthInPixels = durationInMonths * pixelsPerMonth;

    // Définir des seuils de durée minimum selon le niveau de zoom
    if (zoomLevel >= 2) {
      // Très zoomé : afficher tous les événements
      return true;
    } else if (zoomLevel >= 1) {
      // Zoom normal : afficher les événements >= 1 mois
      return durationInMonths >= 1;
    } else if (zoomLevel >= 0.5) {
      // Dézoomé : afficher les événements >= 2 mois ou qui ont une largeur suffisante
      return durationInMonths >= 2 || eventWidthInPixels >= minWidthInPixels;
    } else {
      // Très dézoomé : afficher seulement les événements >= 6 mois
      return durationInMonths >= 6 || eventWidthInPixels >= minWidthInPixels;
    }
  };

  const handleAddEvent = async (formData: EventFormData) => {
    const newEvent: Omit<TimelineEvent, "id"> = {
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      category_id: formData.category_id,
      location: formData.location || undefined,
      photos:
        formData.photos.length > 0
          ? formData.photos.map((photo: File) => URL.createObjectURL(photo))
          : formData.existingPhotos || undefined,
    };

    const { error } = await createEvent(newEvent);
    if (!error) {
      setIsFormOpen(false);
    }
  };

  const handleEditEvent = async (formData: EventFormData) => {
    if (!editingEvent) return;

    const updatedData: Partial<Omit<TimelineEvent, "id">> = {
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      category_id: formData.category_id,
      location: formData.location || undefined,
      photos: [
        ...(formData.existingPhotos || []),
        ...formData.photos.map((photo: File) => URL.createObjectURL(photo)),
      ],
    };

    const { error } = await updateEvent(editingEvent.id, updatedData);
    if (!error) {
      setEditingEvent(null);
      setSelectedModal({ event: null, isOpen: false });
      setIsFormOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingEventId) {
      const { error } = await deleteEvent(deletingEventId);
      if (!error) {
        setDeletingEventId(null);
        setSelectedModal({ event: null, isOpen: false });
      }
    }
  };

  const openEditModal = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
    setSelectedModal({ event: null, isOpen: false });
  };

  const openDeleteConfirm = (eventId: string) => {
    setDeletingEventId(eventId);
  };

  // Mapper les icônes par défaut selon le slug de la catégorie
  const getIconForSlug = (slug: string | null) => {
    if (!slug) return Calendar;
    const iconMap: Record<string, typeof Briefcase> = {
      work: Briefcase,
      housing: Home,
      vehicle: Car,
      travel: Plane,
      relationship: Heart,
    };
    return iconMap[slug] || Calendar;
  };

  // Convertir les couleurs Tailwind en formats utilisables
  const getColorVariants = (color: string) => {
    // Si la couleur est déjà au format Tailwind complet, l'utiliser
    if (color.startsWith("bg-")) {
      return {
        color: color,
        lightColor: color.replace("-500", "-50"),
        borderColor: color.replace("bg-", "border-").replace("-500", "-200"),
      };
    }
    // Sinon, retourner des couleurs par défaut
    return {
      color: "bg-gray-500",
      lightColor: "bg-gray-50",
      borderColor: "border-gray-200",
    };
  };

  const lanes = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    icon: getIconForSlug(cat.slug),
    ...getColorVariants(cat.color),
  }));

  const allDates = events.flatMap(
    (e: TimelineEvent) => [e.startDate, e.endDate].filter(Boolean) as Date[]
  );
  const minDate = new Date(Math.min(...allDates.map((d: Date) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d: Date) => d.getTime())));
  minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setMonth(maxDate.getMonth() + 1);

  const totalMonths =
    (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
    (maxDate.getMonth() - minDate.getMonth());
  const basePixelsPerMonth = 120;
  const pixelsPerMonth = basePixelsPerMonth * zoomLevel;
  const timelineWidth = totalMonths * pixelsPerMonth;

  const getPositionFromDate = (date: Date) => {
    const monthsDiff =
      (date.getFullYear() - minDate.getFullYear()) * 12 +
      (date.getMonth() - minDate.getMonth());
    return monthsDiff * pixelsPerMonth;
  };

  const getEventWidth = (event: TimelineEvent) => {
    if (!event.endDate) return pixelsPerMonth * 3;
    const months =
      (event.endDate.getFullYear() - event.startDate.getFullYear()) * 12 +
      (event.endDate.getMonth() - event.startDate.getMonth());
    return Math.max(months * pixelsPerMonth, 100);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 800;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatDateRange = (start: Date, end?: Date) => {
    const startStr = start.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
    if (!end) return `Depuis ${startStr}`;
    const endStr = end.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-blue-900 transition-colors"
            title="Retour au dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            Ma Timeline
          </h1>
          <div className="text-xs md:text-sm text-gray-500">
            {minDate.getFullYear()} - {maxDate.getFullYear()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Contrôles de zoom */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= MIN_ZOOM}
              className="p-1.5 rounded hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Dézoomer"
            >
              <ZoomOut className="w-4 h-4 text-blue-900" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs font-medium text-blue-900 hover:bg-white rounded transition-colors"
              title="Réinitialiser le zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= MAX_ZOOM}
              className="p-1.5 rounded hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoomer"
            >
              <ZoomIn className="w-4 h-4 text-blue-900" />
            </button>
          </div>
          <button
            className="bg-blue-900 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (canCreateEvent(events.length)) {
                setEditingEvent(null);
                setIsFormOpen(true);
              } else {
                navigate("/upgrade");
              }
            }}
            disabled={!canCreateEvent(events.length)}
            title={!canCreateEvent(events.length) ? "Limite atteinte - Passez à Premium" : "Ajouter un moment"}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </header>

      {/* Banner d'abonnement */}
      <div className="px-4 md:px-6 py-3 bg-gray-50">
        <SubscriptionBanner
          currentCount={events.length}
          limitType="events"
        />
      </div>

      {/* Timeline Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          {/* Lane Labels */}
          <div className="w-16 md:w-40 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="h-12 md:h-16 border-b border-gray-200" />
            <SortableContext
              items={lanes.map((lane) => lane.id)}
              strategy={verticalListSortingStrategy}
            >
              {lanes.map((lane) => (
                <SortableLane
                  key={lane.id}
                  id={lane.id}
                  label={lane.label}
                  icon={lane.icon}
                  color={lane.color}
                />
              ))}
            </SortableContext>
          </div>

          {/* Timeline Scroll Area */}
          <div className="flex-1 relative overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          >
            <div
              className="relative"
              style={{
                width: `${timelineWidth}px`,
                height: "100%",
                minHeight: "100%",
              }}
            >
              {/* Time Markers */}
              <div className="h-12 md:h-16 border-b border-gray-200 relative bg-white">
                {Array.from({ length: totalMonths }, (_, i) => {
                  const date = new Date(minDate);
                  date.setMonth(date.getMonth() + i);
                  const isYearStart = date.getMonth() === 0;
                  const isQuarterStart = date.getMonth() % 3 === 0;

                  // Adapter l'affichage selon le niveau de zoom
                  let shouldShowMonth = true;

                  if (zoomLevel < 0.5) {
                    // Très dézoomé : afficher seulement les années et trimestres
                    shouldShowMonth = isQuarterStart;
                  } else if (zoomLevel < 1) {
                    // Dézoomé : afficher les années et tous les 2 mois
                    shouldShowMonth = date.getMonth() % 2 === 0;
                  }

                  if (!shouldShowMonth) return null;

                  const shouldShowYear = isYearStart;

                  return (
                    <div
                      key={i}
                      className="absolute top-0 h-full flex flex-col justify-center"
                      style={{
                        left: `${i * pixelsPerMonth}px`,
                        width: `${pixelsPerMonth}px`,
                      }}
                    >
                      {shouldShowYear && (
                        <div className="text-xs md:text-sm font-semibold text-gray-900 px-2">
                          {date.getFullYear()}
                        </div>
                      )}
                      <div className="text-[10px] md:text-xs text-gray-500 px-2">
                        {zoomLevel >= 2
                          ? date.toLocaleDateString("fr-FR", { month: "long" })
                          : date.toLocaleDateString("fr-FR", { month: "short" })
                        }
                      </div>
                      <div className="absolute bottom-0 left-0 w-px h-2 bg-gray-300" />
                    </div>
                  );
                })}
              </div>

              {/* Lanes with Events */}
              {lanes.map((lane) => {
                const laneEvents = events.filter(
                  (e: TimelineEvent) => e.category_id === lane.id
                );

                return (
                  <div
                    key={lane.id}
                    className="h-20 md:h-24 border-b border-gray-200 relative bg-white"
                  >
                    {/* Grid lines */}
                    {Array.from({ length: totalMonths }, (_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-gray-100"
                        style={{ left: `${i * pixelsPerMonth}px` }}
                      />
                    ))}

                    {/* Events */}
                    {laneEvents.filter(shouldShowEvent).map((event: TimelineEvent) => {
                      const left = getPositionFromDate(event.startDate);
                      const width = getEventWidth(event);
                      const isHovered = hoveredEvent === event.id;

                      return (
                        <div
                          key={event.id}
                          className={`absolute top-2 md:top-3 bottom-2 md:bottom-3 rounded-lg transition-all cursor-pointer ${lane.lightColor} ${lane.borderColor} border-2 hover:shadow-lg`}
                          style={{
                            left: `${left}px`,
                            width: `${width}px`,
                            zIndex: isHovered ? 20 : 10,
                          }}
                          onClick={() =>
                            setSelectedModal({ event, isOpen: true })
                          }
                          onMouseEnter={() => setHoveredEvent(event.id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                        >
                          <div className="h-full px-2 md:px-3 py-1 md:py-2 flex flex-col justify-center">
                            <div className="text-[10px] md:text-xs font-semibold text-gray-900 truncate">
                              {event.title}
                            </div>
                            <div className="hidden md:block text-xs text-gray-600 truncate">
                              {formatDateRange(event.startDate, event.endDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
      </DndContext>

      {/* Event Detail Modal */}
      {selectedModal.isOpen && selectedModal.event && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {selectedModal.event.title}
              </h2>
              <button
                onClick={() => setSelectedModal({ event: null, isOpen: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Période
                </div>
                <div className="text-base text-gray-900">
                  {formatDateRange(
                    selectedModal.event.startDate,
                    selectedModal.event.endDate
                  )}
                </div>
              </div>

              {selectedModal.event.description && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </div>
                  <div className="text-base text-gray-900">
                    {selectedModal.event.description}
                  </div>
                </div>
              )}

              {selectedModal.event.location && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Lieu
                  </div>
                  <div className="text-base text-gray-900">
                    {selectedModal.event.location}
                  </div>
                </div>
              )}

              {selectedModal.event.metadata &&
                Object.keys(selectedModal.event.metadata).length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Détails
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedModal.event.metadata).map(
                        ([key, value]) => (
                          <div key={key} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              {key}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {String(value)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedModal.event.photos &&
                selectedModal.event.photos.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Photos
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedModal.event.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center"
                        >
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => openEditModal(selectedModal.event!)}
                className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => openDeleteConfirm(selectedModal.event!.id)}
                className="px-3 md:px-4 py-2 text-sm md:text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
        editEvent={editingEvent}
        mode={editingEvent ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingEventId !== null}
        title="Supprimer l'événement"
        message="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEventId(null)}
      />
    </div>
  );
};

export default Timeline;
